#!/usr/bin/env python3
r"""
units_to_tape.py — build a Bead Compare Recording folder (audio.wav, tape.json,
meta.json) from one take of the acoustemization pipeline: the acousteme file
(one unit id per 20 ms frame) plus the take's WAV. Standard library only.

    python3 tools/units_to_tape.py TAKE.npy --audio TAKE.wav -o recordings/take1 \
        --codebook satere_codebook_v1.pkl --label "tomada 1" \
        --passage "Rute 1:1-5" --language "Sateré-Mawé" --narrator "..."

Run it once per take. Two takes compare in the app only when they carry the
same codebook_hash, so name the codebook the same way for both takes
(--codebook FILE, --codebook-hash TEXT or --codebook-name NAME).

The acousteme file (the positional argument)
  * .npy   a 1-D integer array of unit ids (int8..int64, uint8..uint64; integral
           floats are accepted). A 2-D (T, k) array with k <= 8 uses column 0 as
           the units; --pitch-column picks the column that holds f0 in Hz (or
           pitch classes, with --pitch-classes).
  * .npz   the array named units, u, acoustemes, acousteme_sequence, codes,
           tokens or unit_ids; otherwise the first array in the file.
  * .json  a list of ints, or an object with one of those keys; optional keys
           f0 / f / pitch / pitch_hz (one value per frame), frame_rate or
           frame_duration_ms, and codebook_hash.
  * .txt / .csv / .tsv / .km / .units
           whitespace- or comma-separated ints, any line layout.
  Unit ids must be 0..99: tape.json allows nothing else.

The F stream (a pitch class per frame: 0 = unvoiced, 1..31 on a log scale
between --f-min and --f-max Hz) comes, in this order, from --pitch FILE (same
formats, one f0 in Hz per frame; 0, negative or NaN = unvoiced; a stream at
another frame rate is resampled by nearest frame), from --pitch-column, from
the JSON object, or from a file beside the acoustemes named <stem>_f0.*,
<stem>.f0.* or <stem>_pitch.*. When none exists it is measured on the audio
with the same autocorrelation tracker as mock_tape.py.

The audio
  --audio WAV (default: <stem>.wav beside the acoustemes, or the only .wav in
  that folder). Any PCM WAV is accepted and written as 16 kHz mono 16-bit; a
  file already in that form is copied byte for byte, so `sha256sum` of the
  source still matches the audio hash the app shows. Anything else is converted
  with ffmpeg when it is on PATH.

Frames
  --frame-rate defaults to 50 (20 ms, the pipeline's frame). Give the real rate
  when the units were made at another hop, or `auto` to read it off the audio
  length; the stream is then resampled to 50 frames per second unless
  --keep-frame-rate is set (the app accepts other rates with a warning).

Pauses
  --pause-unit auto (default) picks the unit that coincides with silence in the
  audio (frames below --silence-db dBFS) and says which; N sets it; none omits
  it. F is 0 on pause frames.

Exit status 0 when the folder was written, 2 on a usage or input problem.
"""
import argparse
import array
import ast
import hashlib
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import wave
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from mock_tape import pitch_hz  # noqa: E402  (the same tracker as the mock tapes)
from tape_hash import tape_hash  # noqa: E402

FRAME_RATE = 50
TARGET_SR = 16000
HOP = TARGET_SR // FRAME_RATE  # 320 samples = 20 ms
U_MAX = 99
F_MAX = 31
UNIT_KEYS = ("units", "u", "acoustemes", "acousteme_sequence", "codes", "tokens", "unit_ids")
PITCH_KEYS = ("f0", "f", "pitch", "pitch_hz", "f0_hz")
PITCH_SUFFIXES = ("_f0", ".f0", "_pitch", ".pitch")
STREAM_EXTS = (".npy", ".npz", ".json", ".txt", ".csv", ".tsv", ".km", ".units")
STANDARD_RATES = (12.5, 25.0, 50.0, 100.0, 200.0)


def fail(msg):
    print("units_to_tape: " + msg, file=sys.stderr)
    sys.exit(2)


def note(msg):
    print("  " + msg)


# ----------------------------------------------------------------------------
# reading number streams
# ----------------------------------------------------------------------------

def read_npy_bytes(data, what):
    """A .npy body as (flat list of numbers, shape, fortran_order); stdlib only."""
    if data[:6] != b"\x93NUMPY":
        raise ValueError("%s is not a .npy file" % what)
    major = data[6]
    if major == 1:
        (hlen,) = struct.unpack("<H", data[8:10])
        start = 10
    else:
        (hlen,) = struct.unpack("<I", data[8:12])
        start = 12
    header = ast.literal_eval(data[start : start + hlen].decode("latin1"))
    descr = header["descr"]
    shape = tuple(int(d) for d in header["shape"])
    fortran = bool(header.get("fortran_order", False))
    if not isinstance(descr, str):
        raise ValueError("%s holds a structured array; save the unit ids as a plain integer array" % what)
    endian, kind, size = descr[0], descr[1], int(descr[2:] or 1)
    if kind == "O":
        raise ValueError("%s holds a pickled object array; save the unit ids as a plain integer array" % what)
    codes = {("i", 1): "b", ("u", 1): "B", ("b", 1): "B", ("i", 2): "h", ("u", 2): "H",
             ("i", 4): "i", ("u", 4): "I", ("i", 8): "q", ("u", 8): "Q", ("f", 4): "f", ("f", 8): "d"}
    code = codes.get((kind, size))
    if code is None:
        raise ValueError("%s has dtype %s, which this script cannot read" % (what, descr))
    arr = array.array(code)
    if arr.itemsize != size:  # 'i' is 4 bytes on every mainstream platform; be safe anyway
        code = {4: "l", 8: "q"}[size] if kind == "i" else {4: "L", 8: "Q"}[size]
        arr = array.array(code)
    n = 1
    for d in shape:
        n *= d
    body = data[start + hlen : start + hlen + n * size]
    if len(body) != n * size:
        raise ValueError("%s is truncated (expected %d values)" % (what, n))
    arr.frombytes(body)
    if size > 1 and endian in ("<", ">") and (endian == ">") != (sys.byteorder == "big"):
        arr.byteswap()
    return list(arr), shape, fortran


def column(values, shape, fortran, k):
    """Column k of a 2-D array stored flat (C or Fortran order)."""
    rows, cols = shape
    if fortran:
        return values[k * rows : (k + 1) * rows]
    return values[k::cols]


def numbers_in_text(text):
    return [float(t) for t in re.findall(r"-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?", text)]


def load_stream(path, what, prefer_keys=UNIT_KEYS, want_column=None):
    """
    Read one number stream (units or pitch) from any accepted file.
    Returns dict(values=[...], extra={...}) where extra may carry a second
    column, frame_rate, pitch and codebook_hash found in the same file.
    """
    ext = os.path.splitext(path)[1].lower()
    extra = {}
    if ext == ".npy":
        with open(path, "rb") as fh:
            values, shape, fortran = read_npy_bytes(fh.read(), what)
        if len(shape) == 0:
            raise ValueError("%s is a scalar, not a sequence" % what)
        if len(shape) == 2 and 1 in shape:
            values = list(values)
        elif len(shape) == 2:
            rows, cols = shape
            if cols > 8:
                raise ValueError("%s is a %dx%d matrix, which looks like a feature matrix, not unit ids;"
                                 " point at the acoustemes file" % (what, rows, cols))
            if want_column is not None:
                if not 0 <= want_column < cols:
                    raise ValueError("%s has only %d columns; --pitch-column %d does not exist" % (what, cols, want_column))
                extra["column"] = column(values, shape, fortran, want_column)
            values = column(values, shape, fortran, 0)
        elif len(shape) > 2:
            raise ValueError("%s has %d dimensions; a sequence of unit ids has one" % (what, len(shape)))
        return {"values": values, "extra": extra}
    if ext == ".npz":
        with zipfile.ZipFile(path) as z:
            members = [n for n in z.namelist() if n.endswith(".npy")]
            if not members:
                raise ValueError("%s holds no arrays" % what)
            chosen = next((n for k in prefer_keys for n in members if n[:-4] == k), members[0])
            values, shape, fortran = read_npy_bytes(z.read(chosen), "%s:%s" % (what, chosen))
            for k in PITCH_KEYS:
                if k + ".npy" in members and chosen != k + ".npy":
                    p, pshape, pf = read_npy_bytes(z.read(k + ".npy"), "%s:%s" % (what, k))
                    extra["pitch"] = p
                    break
        note("%s: using array %s of %s" % (what, chosen[:-4], os.path.basename(path)))
        return {"values": values, "extra": extra}
    if ext == ".json":
        with open(path, "r", encoding="utf-8") as fh:
            raw = json.load(fh)
        if isinstance(raw, dict):
            key = next((k for k in prefer_keys if k in raw), None)
            if key is None:
                raise ValueError("%s has none of the keys %s" % (what, ", ".join(prefer_keys)))
            values = raw[key]
            for k in PITCH_KEYS:
                if k in raw and k != key and isinstance(raw[k], list):
                    extra["pitch"] = raw[k]
                    break
            if isinstance(raw.get("frame_rate"), (int, float)):
                extra["frame_rate"] = float(raw["frame_rate"])
            elif isinstance(raw.get("frame_duration_ms"), (int, float)) and raw["frame_duration_ms"] > 0:
                extra["frame_rate"] = 1000.0 / float(raw["frame_duration_ms"])
            elif isinstance(raw.get("hop_ms"), (int, float)) and raw["hop_ms"] > 0:
                extra["frame_rate"] = 1000.0 / float(raw["hop_ms"])
            if isinstance(raw.get("codebook_hash"), str) and raw["codebook_hash"]:
                extra["codebook_hash"] = raw["codebook_hash"]
        else:
            values = raw
        if not isinstance(values, list):
            raise ValueError("%s: the sequence is not a list" % what)
        return {"values": [float(v) if v is not None else float("nan") for v in values], "extra": extra}
    # plain text
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        text = fh.read()
    return {"values": numbers_in_text(text), "extra": extra}


def as_unit_ids(values, what):
    out = []
    for i, v in enumerate(values):
        if isinstance(v, float):
            if not math.isfinite(v) or v != int(v):
                raise ValueError("%s[%d] = %r is not an integer unit id" % (what, i, v))
            v = int(v)
        out.append(int(v))
    if not out:
        raise ValueError("%s holds no unit ids" % what)
    bad = next((i for i, v in enumerate(out) if v < 0 or v > U_MAX), None)
    if bad is not None:
        raise ValueError("%s[%d] = %d is outside 0..%d; tape.json takes a 100-unit codebook only"
                         % (what, bad, out[bad], U_MAX))
    return out


# ----------------------------------------------------------------------------
# audio
# ----------------------------------------------------------------------------

def find_beside(units_path, suffixes, exts):
    folder = os.path.dirname(os.path.abspath(units_path))
    stem = os.path.splitext(os.path.basename(units_path))[0]
    for suf in suffixes:
        for ext in exts:
            cand = os.path.join(folder, stem + suf + ext)
            if os.path.isfile(cand):
                return cand
    return None


def find_audio(units_path):
    found = find_beside(units_path, ("",), (".wav", ".WAV", ".wave"))
    if found:
        return found
    folder = os.path.dirname(os.path.abspath(units_path))
    wavs = [n for n in os.listdir(folder) if n.lower().endswith(".wav")]
    if len(wavs) == 1:
        return os.path.join(folder, wavs[0])
    return None


def wav_params(path):
    """(channels, sampwidth, rate, nframes) of a PCM WAV; None when wave cannot read it."""
    try:
        with wave.open(path, "rb") as w:
            return w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
    except (wave.Error, EOFError):
        return None


def decode_pcm(raw, sampwidth, channels):
    """Interleaved PCM bytes -> array('h') of mono 16-bit samples (channels averaged)."""
    if sampwidth == 2:
        a = array.array("h")
        a.frombytes(raw)
    elif sampwidth == 1:
        a = array.array("h", ((b - 128) << 8 for b in raw))
    elif sampwidth == 3:
        n = len(raw) // 3
        a = array.array("h", (struct.unpack("<i", raw[3 * i : 3 * i + 3] + (b"\xff" if raw[3 * i + 2] & 0x80 else b"\x00"))[0] >> 8 for i in range(n)))
    elif sampwidth == 4:
        wide = array.array("i")
        wide.frombytes(raw)
        a = array.array("h", (v >> 16 for v in wide))
    else:
        raise ValueError("unsupported sample width %d" % sampwidth)
    if channels > 1:
        a = array.array("h", (sum(a[i : i + channels]) // channels for i in range(0, len(a) - channels + 1, channels)))
    return a


def resample_int16(a, sr_in, sr_out):
    if sr_in == sr_out or not a:
        return a
    ratio = sr_in / sr_out
    n_out = int(len(a) / ratio)
    out = array.array("h")
    last = len(a) - 1
    for i in range(n_out):
        pos = i * ratio
        j = int(pos)
        frac = pos - j
        s0 = a[j]
        s1 = a[j + 1] if j < last else s0
        out.append(int(round(s0 + (s1 - s0) * frac)))
    return out


def write_wav16(path, samples):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TARGET_SR)
        w.writeframes(samples.tobytes())


def prepare_audio(src, dst):
    """
    Put the take's voice at dst as 16 kHz mono 16-bit PCM.
    Returns (samples as array('h'), how) where how says what was done.
    """
    params = wav_params(src)
    if params is not None:
        channels, sampwidth, rate, nframes = params
        if channels == 1 and sampwidth == 2 and rate == TARGET_SR:
            shutil.copyfile(src, dst)
            with wave.open(dst, "rb") as w:
                a = array.array("h")
                a.frombytes(w.readframes(w.getnframes()))
            return a, "copied byte for byte (already 16 kHz mono 16-bit)"
        with wave.open(src, "rb") as w:
            raw = w.readframes(nframes)
        a = resample_int16(decode_pcm(raw, sampwidth, channels), rate, TARGET_SR)
        write_wav16(dst, a)
        return a, "converted from %d Hz, %d channel(s), %d-bit" % (rate, channels, sampwidth * 8)
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        fail("%s is not a PCM WAV this script can read, and ffmpeg is not on PATH to convert it" % src)
    cmd = [ffmpeg, "-y", "-loglevel", "error", "-i", src, "-ac", "1", "-ar", str(TARGET_SR), "-sample_fmt", "s16", "-f", "wav", dst]
    r = subprocess.run(cmd)
    if r.returncode != 0:
        fail("ffmpeg could not convert %s" % src)
    with wave.open(dst, "rb") as w:
        a = array.array("h")
        a.frombytes(w.readframes(w.getnframes()))
    return a, "converted with ffmpeg"


def frame_rms_db(samples, i):
    start = i * HOP
    chunk = samples[start : start + HOP]
    if not chunk:
        return -120.0
    acc = 0
    for s in chunk:
        acc += s * s
    rms = math.sqrt(acc / len(chunk)) / 32768.0
    return 20 * math.log10(rms) if rms > 0 else -120.0


def audio_pitch_class(samples, i, fmin, fmax):
    centre = i * HOP + HOP // 2
    start = max(0, centre - 320)
    window = [s / 32768.0 for s in samples[start : start + 640]]
    if len(window) < 640:
        return 0
    return quantise(pitch_hz(window, TARGET_SR, fmin, fmax), fmin, fmax)


# ----------------------------------------------------------------------------
# streams
# ----------------------------------------------------------------------------

def quantise(hz, fmin, fmax):
    """f0 in Hz -> 1..31 on a log scale between fmin and fmax; 0 when unvoiced.
    With 70 and 400 Hz this is mock_tape.quantise_f."""
    if hz is None or not math.isfinite(hz) or hz <= 0:
        return 0
    lo, hi = math.log(fmin), math.log(fmax)
    v = (math.log(max(fmin, min(fmax, hz))) - lo) / (hi - lo)
    return 1 + int(round(v * 30))


def to_pitch_classes(values, classes_given, fmin, fmax, what):
    out = []
    for i, v in enumerate(values):
        v = float(v)
        if classes_given:
            if not math.isfinite(v) or v != int(v) or not 0 <= v <= F_MAX:
                raise ValueError("%s[%d] = %r is not a pitch class 0..%d" % (what, i, v, F_MAX))
            out.append(int(v))
        else:
            out.append(quantise(v, fmin, fmax))
    return out


def resample_nearest(values, n):
    if len(values) == n:
        return list(values)
    m = len(values)
    return [values[min(m - 1, int(i * m / n))] for i in range(n)]


def resample_units(u, f, rate_in, rate_out):
    """Frame-wise mode of u (ties -> earliest) and median-ish pick of f over each output frame."""
    n_out = int(round(len(u) * rate_out / rate_in))
    out_u, out_f = [], []
    for j in range(n_out):
        a = int(j * rate_in / rate_out)
        b = max(a + 1, int((j + 1) * rate_in / rate_out))
        seg_u = u[a:b] or [u[-1]]
        seg_f = f[a:b] or [f[-1]]
        best = max(seg_u, key=lambda v: (seg_u.count(v), -seg_u.index(v)))
        out_u.append(best)
        voiced = sorted(v for v in seg_f if v > 0)
        out_f.append(voiced[len(voiced) // 2] if voiced else 0)
    return out_u, out_f


def median_smooth(values, width=5):
    half = width // 2
    out = list(values)
    for i in range(len(values)):
        window = sorted(values[max(0, i - half) : i + half + 1])
        out[i] = window[len(window) // 2]
    return out


def detect_pause_unit(u, silent):
    """The unit that coincides with silence, when one clearly does."""
    n_silent = sum(silent)
    if n_silent < 10:
        return None, "fewer than 10 silent frames in the audio"
    totals, quiet = {}, {}
    for v, s in zip(u, silent):
        totals[v] = totals.get(v, 0) + 1
        if s:
            quiet[v] = quiet.get(v, 0) + 1
    cand = max(quiet, key=lambda v: (quiet[v], -v))
    share_of_unit = quiet[cand] / totals[cand]
    share_of_silence = quiet[cand] / n_silent
    if totals[cand] < 10 or share_of_unit < 0.5 or share_of_silence < 0.3:
        return None, ("unit %d is the best candidate but only %d%% of its frames are silent and it covers %d%% of the silence"
                      % (cand, round(100 * share_of_unit), round(100 * share_of_silence)))
    return cand, ("unit %d: %d%% of its frames are silent, it covers %d%% of the silence"
                  % (cand, round(100 * share_of_unit), round(100 * share_of_silence)))


def check_tape(t):
    """Mirror of the app's checkTape (src/model/tape.ts); a list of problems."""
    errors = []
    if not isinstance(t.get("codebook_hash"), str) or not t["codebook_hash"]:
        errors.append("codebook_hash missing")
    if not isinstance(t.get("frame_rate"), (int, float)) or not t["frame_rate"] > 0:
        errors.append("frame_rate missing or not positive")
    u, f = t.get("u"), t.get("f")
    if len(u) != len(f):
        errors.append("u and f differ in length (%d vs %d)" % (len(u), len(f)))
    bad = next((i for i, v in enumerate(u) if not isinstance(v, int) or v < 0 or v > U_MAX), None)
    if bad is not None:
        errors.append("u[%d] is out of range 0-%d" % (bad, U_MAX))
    bad = next((i for i, v in enumerate(f) if not isinstance(v, int) or v < 0 or v > F_MAX), None)
    if bad is not None:
        errors.append("f[%d] is out of range 0-%d" % (bad, F_MAX))
    if "pause_unit" in t and (not isinstance(t["pause_unit"], int) or t["pause_unit"] < 0):
        errors.append("pause_unit is not a non-negative integer")
    return errors


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def fmt_seconds(s):
    return "%d:%04.1f" % (int(s // 60), s % 60)


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------

def parse_args(argv):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("units", help="the acousteme file of one take (.npy, .npz, .json, .txt, .csv, .km)")
    ap.add_argument("--audio", help="the take's WAV (default: <stem>.wav beside the units, or the only .wav there)")
    ap.add_argument("-o", "--out", help="output folder (default: recordings/<stem>)")
    ap.add_argument("--force", action="store_true", help="overwrite an existing Recording folder")
    g = ap.add_argument_group("codebook (the same for every take you want to compare)")
    g.add_argument("--codebook", metavar="FILE", help="the codebook file; its sha256 becomes codebook_hash")
    g.add_argument("--codebook-hash", metavar="TEXT", help="codebook_hash written verbatim")
    g.add_argument("--codebook-name", metavar="NAME", help="a name to hash when there is no file")
    g = ap.add_argument_group("pitch")
    g.add_argument("--pitch", metavar="FILE", help="f0 per frame in Hz (0 = unvoiced); same formats as the units")
    g.add_argument("--pitch-column", type=int, metavar="K", help="column of a 2-D units array that holds f0")
    g.add_argument("--pitch-classes", action="store_true", help="the pitch values are already classes 0..31")
    g.add_argument("--f-min", type=float, default=70.0, help="Hz mapped to class 1 (default 70)")
    g.add_argument("--f-max", type=float, default=400.0, help="Hz mapped to class 31 (default 400)")
    g = ap.add_argument_group("frames and pauses")
    g.add_argument("--frame-rate", help="frames per second of the units: a number, or auto (default 50, or what the units file says)")
    g.add_argument("--keep-frame-rate", action="store_true", help="write the units at their own rate instead of resampling to 50")
    g.add_argument("--pause-unit", default="auto", help="auto (default), a unit id, or none")
    g.add_argument("--silence-db", type=float, default=-45.0, help="frames quieter than this are silence (default -45 dBFS)")
    g = ap.add_argument_group("meta.json")
    g.add_argument("--label", help="version label shown in the app (default: the units file's stem)")
    g.add_argument("--passage")
    g.add_argument("--language")
    g.add_argument("--narrator")
    g.add_argument("--recorded-at", help="e.g. 2026-09-14T10:00:00Z")
    return ap.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    units_path = args.units
    if not os.path.isfile(units_path):
        fail("%s does not exist" % units_path)
    stem = os.path.splitext(os.path.basename(units_path))[0]
    print("units_to_tape: %s" % units_path)

    # --- units --------------------------------------------------------------
    try:
        stream = load_stream(units_path, "units", UNIT_KEYS, args.pitch_column)
        u = as_unit_ids(stream["values"], "units")
    except (ValueError, OSError, KeyError, SyntaxError) as e:
        fail(str(e))
    extra = stream["extra"]
    note("%d frames, %d distinct units, ids %d..%d" % (len(u), len(set(u)), min(u), max(u)))

    # --- audio --------------------------------------------------------------
    audio_src = args.audio or find_audio(units_path)
    if not audio_src:
        fail("no audio: pass --audio WAV (the app refuses a Recording without audio.wav)")
    if not os.path.isfile(audio_src):
        fail("%s does not exist" % audio_src)
    out_dir = args.out or os.path.join("recordings", stem)
    audio_dst = os.path.join(out_dir, "audio.wav")
    tape_dst = os.path.join(out_dir, "tape.json")
    meta_dst = os.path.join(out_dir, "meta.json")
    if os.path.exists(tape_dst) and not args.force:
        fail("%s already exists; pass --force to overwrite the Recording" % out_dir)
    os.makedirs(out_dir, exist_ok=True)
    samples, how = prepare_audio(audio_src, audio_dst)
    audio_seconds = len(samples) / TARGET_SR
    note("audio: %s -> audio.wav, %s (%s)" % (os.path.basename(audio_src), fmt_seconds(audio_seconds), how))

    # --- frame rate ---------------------------------------------------------
    if args.frame_rate == "auto":
        if audio_seconds <= 0:
            fail("--frame-rate auto needs audio with a length")
        est = len(u) / audio_seconds
        rate_in = next((r for r in STANDARD_RATES if abs(est - r) / r <= 0.05), round(est, 3))
        note("frame rate read off the audio: %.2f frames/s -> using %s" % (est, rate_in))
    elif args.frame_rate is not None:
        try:
            rate_in = float(args.frame_rate)
        except ValueError:
            fail("--frame-rate must be a number or auto")
        if rate_in <= 0:
            fail("--frame-rate must be positive")
    elif "frame_rate" in extra:
        rate_in = float(extra["frame_rate"])
        note("frame rate %g taken from the units file" % rate_in)
    else:
        rate_in = float(FRAME_RATE)
    if rate_in == int(rate_in):
        rate_in = int(rate_in)

    # --- pitch --------------------------------------------------------------
    f_source = None
    pitch_values = None
    if args.pitch:
        try:
            pitch_values = load_stream(args.pitch, "pitch", PITCH_KEYS)["values"]
        except (ValueError, OSError, KeyError, SyntaxError) as e:
            fail(str(e))
        f_source = args.pitch
    elif "column" in extra:
        pitch_values = extra["column"]
        f_source = "column %d of the units array" % args.pitch_column
    elif "pitch" in extra:
        pitch_values = extra["pitch"]
        f_source = "the pitch key of the units file"
    else:
        beside = find_beside(units_path, PITCH_SUFFIXES, STREAM_EXTS)
        if beside:
            try:
                pitch_values = load_stream(beside, "pitch", PITCH_KEYS)["values"]
            except (ValueError, OSError, KeyError, SyntaxError) as e:
                fail(str(e))
            f_source = beside
    if pitch_values is not None:
        try:
            f = to_pitch_classes(pitch_values, args.pitch_classes, args.f_min, args.f_max, "pitch")
        except ValueError as e:
            fail(str(e))
        if len(f) != len(u):
            note("pitch has %d frames for %d unit frames; resampled by nearest frame" % (len(f), len(u)))
            f = resample_nearest(f, len(u))
        note("F from %s" % f_source)
    else:
        f = None  # measured on the audio below, after the units are at 50 frames/s

    # --- resample to 50 frames/s ------------------------------------------
    frame_rate_out = rate_in
    if rate_in != FRAME_RATE and not args.keep_frame_rate:
        before = len(u)
        u, f_tmp = resample_units(u, f if f is not None else [0] * len(u), rate_in, FRAME_RATE)
        if f is not None:
            f = f_tmp
        frame_rate_out = FRAME_RATE
        note("resampled %d frames at %s/s to %d frames at 50/s" % (before, rate_in, len(u)))
    elif rate_in != FRAME_RATE:
        note("keeping frame rate %s (the app expects 50 and will warn)" % rate_in)
    n = len(u)
    hop_seconds = 1.0 / frame_rate_out
    tape_seconds = n * hop_seconds
    if abs(tape_seconds - audio_seconds) > 0.5:
        note("WARNING: tape is %s but audio is %s; the app will warn too. If the units were made at another hop,"
             " pass --frame-rate (or --frame-rate auto)" % (fmt_seconds(tape_seconds), fmt_seconds(audio_seconds)))

    # --- silence and pause unit --------------------------------------------
    silent = [False] * n
    if frame_rate_out == FRAME_RATE:
        silent = [frame_rms_db(samples, i) < args.silence_db for i in range(n)]
    if args.pause_unit == "none":
        pause_unit, why = None, "omitted (--pause-unit none)"
    elif args.pause_unit == "auto":
        if frame_rate_out == FRAME_RATE:
            pause_unit, why = detect_pause_unit(u, silent)
        else:
            pause_unit, why = None, "not detected at a frame rate other than 50"
    else:
        try:
            pause_unit = int(args.pause_unit)
        except ValueError:
            fail("--pause-unit must be auto, none or a unit id")
        if not 0 <= pause_unit <= U_MAX:
            fail("--pause-unit must be within 0..%d" % U_MAX)
        why = "given"
    note("pause unit: %s" % ("none (%s)" % why if pause_unit is None else "%s (%s)" % (pause_unit, why)))

    # --- F measured on the audio when nothing supplied it -------------------
    if f is None:
        if frame_rate_out != FRAME_RATE:
            fail("F can be measured on the audio only at 50 frames/s; drop --keep-frame-rate or pass --pitch")
        f = [0] * n
        measured = 0
        for i in range(n):
            if silent[i] or (pause_unit is not None and u[i] == pause_unit):
                continue
            f[i] = audio_pitch_class(samples, i, args.f_min, args.f_max)
            measured += 1
        f = median_smooth(f, 5)
        note("F measured on the audio for %d speech frames (autocorrelation, %g-%g Hz)" % (measured, args.f_min, args.f_max))
    if pause_unit is not None:
        f = [0 if v == pause_unit else c for v, c in zip(u, f)]
    voiced = sum(1 for c in f if c > 0)

    # --- codebook hash ------------------------------------------------------
    if args.codebook:
        if not os.path.isfile(args.codebook):
            fail("%s does not exist" % args.codebook)
        codebook_hash = "sha256:" + sha256_file(args.codebook)
        note("codebook_hash from %s" % os.path.basename(args.codebook))
    elif args.codebook_hash:
        codebook_hash = args.codebook_hash
    elif args.codebook_name:
        codebook_hash = "sha256:" + hashlib.sha256(("bead-compare-codebook:" + args.codebook_name).encode("utf-8")).hexdigest()
        note("codebook_hash from the name %r" % args.codebook_name)
    elif extra.get("codebook_hash"):
        codebook_hash = extra["codebook_hash"]
        note("codebook_hash taken from the units file")
    else:
        codebook_hash = "sha256:" + hashlib.sha256(b"bead-compare-codebook:unnamed").hexdigest()
        note("WARNING: no codebook named; using the shared placeholder hash. Every tape made this way compares"
             " with every other, whatever codebook made it. Pass --codebook, --codebook-hash or --codebook-name.")

    # --- write --------------------------------------------------------------
    tape = {"codebook_hash": codebook_hash, "frame_rate": frame_rate_out, "u": u, "f": f}
    if pause_unit is not None:
        tape["pause_unit"] = pause_unit
    problems = check_tape(tape)
    if problems:
        fail("refusing to write an invalid tape: " + "; ".join(problems))
    with open(tape_dst, "w", encoding="utf-8") as fh:
        json.dump(tape, fh, separators=(",", ":"))
    meta = {}
    for key, value in (("passage", args.passage), ("language", args.language), ("narrator", args.narrator),
                       ("recorded_at", args.recorded_at), ("label", args.label or stem)):
        if value:
            meta[key] = value
    with open(meta_dst, "w", encoding="utf-8") as fh:
        json.dump(meta, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    print("wrote %s/" % out_dir)
    note("audio.wav  %s  sha256 %s" % (fmt_seconds(audio_seconds), sha256_file(audio_dst)))
    note("tape.json  %d frames at %s/s, %d pause, %d voiced  hash %s" % (n, frame_rate_out, sum(1 for v in u if v == pause_unit) if pause_unit is not None else 0, voiced, tape_hash(tape)))
    note("meta.json  %s" % json.dumps(meta, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
