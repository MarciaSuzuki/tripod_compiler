#!/usr/bin/env python3
"""
units_to_tape.py — turn a Sateré acousteme pair (<stem>.wav + <stem>.units.txt)
into a Bead Compare Recording folder (audio.wav, tape.json, meta.json).
Standard library only.

    python3 tools/units_to_tape.py converted_audio/MAVWYIN1DA_B01_MAT_003.wav \
        satere_units/MAVWYIN1DA_B01_MAT_003.units.txt \
        --codebook satere_units/satere_kmeans.pkl \
        --out recordings/MAT_003_take1 \
        --passage "Mateus 3" --narrator "..." --label "take 1"

Input format (as produced by the Sateré acoustemization notebooks):
  * <stem>.units.txt  — whitespace-separated integers, one per 20 ms frame
                        (k-means unit ids 0..99); this becomes the U stream.
  * <stem>.wav        — the recording (any rate/channels; mixed to mono and
                        resampled to 16 kHz for audio.wav).
The F stream is not stored with the units, so it is measured here from the
audio the same way the notebooks do: pitch between 65 and 400 Hz, quantised
to 1..31 on a log scale, 0 when unvoiced.

codebook_hash: "sha256:" + sha256 of the k-means pickle given with --codebook
(so two recordings made with the same codebook get the same hash and can be
compared), or of the --codebook-label text when the pickle is not at hand.
Never compare a tape made here with a mock tape from mock_tape.py.

pause_unit: the unit that covers most low-energy frames, when it covers at
least 60% of them; otherwise omitted (pass --pause-unit to force one).
"""
import argparse
import hashlib
import json
import math
import os
import struct
import sys
import wave

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mock_tape import FRAME_RATE, TARGET_SR, pitch_hz, read_wav  # noqa: E402

F_MIN, F_MAX, F_BINS = 65.0, 400.0, 31


def quantise_f(hz):
    """Same rule as the notebooks: log-spaced bins between 65 and 400 Hz -> 1..31."""
    if hz <= 0:
        return 0
    lo, hi = math.log10(F_MIN), math.log10(F_MAX)
    edges = [10 ** (lo + (hi - lo) * i / F_BINS) for i in range(F_BINS + 1)]
    hz = max(F_MIN, min(F_MAX, hz))
    idx = 0
    for e in edges[1:-1]:
        if hz >= e:
            idx += 1
    return 1 + min(idx, F_BINS - 1)


def read_units(path):
    text = open(path).read().split()
    units = [int(t) for t in text]
    bad = [u for u in units if u < 0 or u > 99]
    if bad:
        sys.exit("units out of range 0..99 in %s (first bad value %d)" % (path, bad[0]))
    return units


def frame_rms(x, i, hop):
    frame = x[i * hop : (i + 1) * hop]
    if not frame:
        return 0.0
    return math.sqrt(sum(s * s for s in frame) / len(frame))


def extract_f(x, n_frames, sr=TARGET_SR, window_ms=40):
    hop = sr // FRAME_RATE
    win = int(sr * window_ms / 1000)
    f = []
    rms_all = [frame_rms(x, i, hop) for i in range(n_frames)]
    peak = max(rms_all) if rms_all else 0.0
    for i in range(n_frames):
        if peak == 0.0 or rms_all[i] < 0.05 * peak:
            f.append(0)
            continue
        start = i * hop
        wstart = max(0, start + hop // 2 - win // 2)
        f.append(quantise_f(pitch_hz(x[wstart : wstart + win], sr, F_MIN, F_MAX)))
    return f, rms_all


def guess_pause_unit(units, rms_all, threshold_ratio=0.05):
    peak = max(rms_all) if rms_all else 0.0
    quiet = [u for u, r in zip(units, rms_all) if peak > 0 and r < threshold_ratio * peak]
    if len(quiet) < 10:
        return None
    counts = {}
    for u in quiet:
        counts[u] = counts.get(u, 0) + 1
    best = max(counts, key=counts.get)
    return best if counts[best] >= 0.6 * len(quiet) else None


def write_wav(path, x, sr=TARGET_SR):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(struct.pack("<%dh" % len(x), *[int(max(-1.0, min(1.0, s)) * 32767) for s in x]))


def codebook_hash(pickle_path, label):
    if pickle_path:
        h = hashlib.sha256()
        with open(pickle_path, "rb") as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b""):
                h.update(chunk)
        return "sha256:" + h.hexdigest()
    return "sha256:" + hashlib.sha256(label.encode("utf-8")).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("wav")
    ap.add_argument("units", help="<stem>.units.txt")
    ap.add_argument("--out", required=True, help="output Recording folder (created)")
    ap.add_argument("--codebook", default=None, help="satere_kmeans.pkl (hashed into codebook_hash)")
    ap.add_argument("--codebook-label", default="satere_units_v1", help="used when --codebook is absent")
    ap.add_argument("--pause-unit", type=int, default=None)
    ap.add_argument("--passage", default="")
    ap.add_argument("--language", default="mav", help="ISO 639-3; Sateré-Mawé is mav")
    ap.add_argument("--narrator", default="")
    ap.add_argument("--recorded-at", default="")
    ap.add_argument("--label", default="")
    args = ap.parse_args()

    x = read_wav(args.wav)
    units = read_units(args.units)
    audio_frames = len(x) // (TARGET_SR // FRAME_RATE)
    if abs(audio_frames - len(units)) > 25:
        print(
            "warning: audio has %d frames but units file has %d (difference %.1f s); "
            "check that the two files belong together" % (audio_frames, len(units), abs(audio_frames - len(units)) / FRAME_RATE),
            file=sys.stderr,
        )
    n = min(len(units), audio_frames) if audio_frames else len(units)
    units = units[:n]
    f, rms_all = extract_f(x, n)

    pause = args.pause_unit if args.pause_unit is not None else guess_pause_unit(units, rms_all)
    tape = {
        "codebook_hash": codebook_hash(args.codebook, args.codebook_label),
        "frame_rate": FRAME_RATE,
        "u": units,
        "f": f,
    }
    if pause is not None:
        tape["pause_unit"] = pause
    meta = {
        "passage": args.passage,
        "language": args.language,
        "narrator": args.narrator,
        "recorded_at": args.recorded_at,
        "label": args.label or os.path.splitext(os.path.basename(args.wav))[0],
    }
    os.makedirs(args.out, exist_ok=True)
    write_wav(os.path.join(args.out, "audio.wav"), x)
    with open(os.path.join(args.out, "tape.json"), "w") as fh:
        json.dump(tape, fh)
    with open(os.path.join(args.out, "meta.json"), "w") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
    voiced = sum(1 for v in f if v > 0)
    print(
        "wrote %s: %d frames (%.1f s), %d distinct units, pause_unit=%s, voiced %.0f%%"
        % (args.out, n, n / FRAME_RATE, len(set(units)), pause, 100.0 * voiced / max(1, n))
    )


if __name__ == "__main__":
    main()
