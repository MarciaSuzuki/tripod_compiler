#!/usr/bin/env python3
"""
mock_tape.py — generate a plausible tape.json from any wav, without the real
O Escriba service. Standard library only.

    python3 tools/mock_tape.py audio.wav [-o tape.json]

Heuristics per 20 ms frame (frame_rate 50):
  * RMS energy below a threshold  -> pause (U = pause_unit, F = 0)
  * otherwise U = a coarse code from the spectral shape (which formant-sized
    band is loudest and which is second), so that similar-sounding frames get
    the same code regardless of pitch
  * F = autocorrelation pitch, quantised to 1..31 on a log scale between
    70 Hz and 400 Hz; 0 when unvoiced

The output is marked "mock": true and uses a constant codebook_hash so that
two mock tapes can be compared with each other. A mock tape must never be
compared with a real O Escriba tape; the hashes differ, and the app refuses.
"""
import argparse
import hashlib
import json
import math
import os
import struct
import sys
import wave

FRAME_RATE = 50
TARGET_SR = 16000
PAUSE_UNIT = 49
MOCK_CODEBOOK_HASH = "sha256:" + hashlib.sha256(b"bead-compare-mock-codebook-v5").hexdigest()


def read_wav(path):
    with wave.open(path, "rb") as w:
        ch = w.getnchannels()
        sw = w.getsampwidth()
        sr = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
    if sw == 2:
        samples = struct.unpack("<%dh" % (len(raw) // 2), raw)
        scale = 32768.0
    elif sw == 1:
        samples = [b - 128 for b in raw]
        scale = 128.0
    elif sw == 4:
        samples = struct.unpack("<%di" % (len(raw) // 4), raw)
        scale = 2147483648.0
    else:
        sys.exit("unsupported sample width: %d bytes" % sw)
    if ch > 1:
        samples = [sum(samples[i : i + ch]) / ch for i in range(0, len(samples), ch)]
    x = [s / scale for s in samples]
    if sr != TARGET_SR:
        x = resample(x, sr, TARGET_SR)
    return x


def resample(x, sr_in, sr_out):
    if not x:
        return x
    ratio = sr_in / sr_out
    n_out = int(len(x) / ratio)
    out = []
    for i in range(n_out):
        pos = i * ratio
        j = int(pos)
        frac = pos - j
        a = x[j]
        b = x[j + 1] if j + 1 < len(x) else a
        out.append(a + (b - a) * frac)
    return out


# Band-energy spectrum on a 320-sample (20 ms) window, sampled every 100 Hz.
# Bands are formant-sized so that the dominant band tracks the vowel shape,
# not the pitch. Tables are precomputed once.
_DFT_N = 320
_DFT_STEP = 2  # every other bin of the 320-point DFT -> 100 Hz spacing
_DFT_BINS = 80  # 0..7900 Hz
_BAND_EDGES_HZ = [250, 600, 1000, 1600, 2500, 4000, 8000]
_COS = [[math.cos(2 * math.pi * (k * _DFT_STEP) * n / _DFT_N) for n in range(_DFT_N)] for k in range(_DFT_BINS)]
_SIN = [[math.sin(2 * math.pi * (k * _DFT_STEP) * n / _DFT_N) for n in range(_DFT_N)] for k in range(_DFT_BINS)]
_HANN = [0.5 - 0.5 * math.cos(2 * math.pi * n / _DFT_N) for n in range(_DFT_N)]


def band_energies(frame, sr):
    """Energy per band (list of len(_BAND_EDGES_HZ)), from a 160-sample window."""
    x = [(frame[n] if n < len(frame) else 0.0) * _HANN[n] for n in range(_DFT_N)]
    bins = []
    for k in range(_DFT_BINS):
        re = 0.0
        im = 0.0
        ck = _COS[k]
        sk = _SIN[k]
        for n in range(_DFT_N):
            re += x[n] * ck[n]
            im -= x[n] * sk[n]
        bins.append(re * re + im * im)
    hz_per_bin = sr * _DFT_STEP / _DFT_N
    bands = [0.0] * len(_BAND_EDGES_HZ)
    b = 0
    for k in range(1, _DFT_BINS):
        hz = k * hz_per_bin
        while b < len(_BAND_EDGES_HZ) - 1 and hz >= _BAND_EDGES_HZ[b]:
            b += 1
        bands[b] += bins[k]
    return bands


def frame_features(frame, sr=TARGET_SR):
    n = len(frame)
    if n == 0:
        return 0.0, [0.0] * len(_BAND_EDGES_HZ)
    rms = math.sqrt(sum(s * s for s in frame) / n)
    mid = max(0, n // 2 - _DFT_N // 2)
    return rms, band_energies(frame[mid : mid + _DFT_N], sr)


def pitch_hz(frame, sr, fmin=70.0, fmax=400.0):
    n = len(frame)
    if n < sr // fmin:
        return 0.0
    mean = sum(frame) / n
    x = [s - mean for s in frame]
    e0 = sum(s * s for s in x) + 1e-12
    best_lag, best = 0, 0.0
    lag_min = int(sr / fmax)
    lag_max = min(int(sr / fmin), n - 1)
    for lag in range(lag_min, lag_max + 1):
        acc = 0.0
        for i in range(n - lag):
            acc += x[i] * x[i + lag]
        r = acc / e0
        if r > best:
            best, best_lag = r, lag
    if best < 0.45 or best_lag == 0:
        return 0.0
    return sr / best_lag


def quantise_f(hz):
    if hz <= 0:
        return 0
    lo, hi = math.log(70.0), math.log(400.0)
    v = (math.log(max(70.0, min(400.0, hz))) - lo) / (hi - lo)
    return 1 + int(round(v * 30))


def band(value, edges):
    for i, e in enumerate(edges):
        if value < e:
            return i
    return len(edges)


def code_u(bands):
    """Pitch-insensitive code from the spectral shape: which formant-sized band
    is loudest (7) and which is second (7) -> 49 speech codes in 1..50, skipping 49."""
    order = sorted(range(len(bands)), key=lambda i: -bands[i])
    first, second = order[0], order[1]
    code = 1 + first * 7 + second  # 1..49
    if code >= PAUSE_UNIT:
        code += 1  # skip the pause unit (49)
    return code


def median_smooth(values, width=5, skip=None):
    """Median filter over speech frames only; pauses are left untouched."""
    half = width // 2
    out = list(values)
    for i, v in enumerate(values):
        if v == skip:
            continue
        window = [x for x in values[max(0, i - half) : i + half + 1] if x != skip]
        window.sort()
        out[i] = window[len(window) // 2]
    return out


def make_tape(x, sr=TARGET_SR, silence_db=-45.0, window_ms=40):
    hop = sr // FRAME_RATE
    win = int(sr * window_ms / 1000)
    n_frames = len(x) // hop
    u, f = [], []
    thr = 10 ** (silence_db / 20)
    for i in range(n_frames):
        start = i * hop
        # features are measured on a centred 40 ms window so neighbouring frames agree
        wstart = max(0, start + hop // 2 - win // 2)
        wframe = x[wstart : wstart + win]
        rms, bands = frame_features(wframe, sr)
        if rms < thr:
            u.append(PAUSE_UNIT)
            f.append(0)
            continue
        u.append(code_u(bands))
        f.append(quantise_f(pitch_hz(wframe, sr)))
    u = median_smooth(u, 5, skip=PAUSE_UNIT)
    f = median_smooth(f, 5, skip=None)
    for i, v in enumerate(u):
        if v == PAUSE_UNIT:
            f[i] = 0
    return {
        "codebook_hash": MOCK_CODEBOOK_HASH,
        "frame_rate": FRAME_RATE,
        "u": u,
        "f": f,
        "pause_unit": PAUSE_UNIT,
        "mock": True,
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("wav")
    ap.add_argument("-o", "--out", default=None, help="output tape.json (default: next to the wav)")
    ap.add_argument("--silence-db", type=float, default=-45.0, help="pause threshold in dBFS (default -45)")
    args = ap.parse_args()
    x = read_wav(args.wav)
    tape = make_tape(x, silence_db=args.silence_db)
    if args.out:
        out = args.out
    else:
        folder, name = os.path.split(args.wav)
        # audio.wav -> tape.json beside it; anything else -> <stem>.tape.json
        out = os.path.join(folder, "tape.json" if name.lower() == "audio.wav" else os.path.splitext(name)[0] + ".tape.json")
    with open(out, "w") as fh:
        json.dump(tape, fh)
    pauses = sum(1 for v in tape["u"] if v == PAUSE_UNIT)
    print("wrote %s: %d frames, %d pause frames, %d distinct U codes" % (out, len(tape["u"]), pauses, len(set(tape["u"]))))


if __name__ == "__main__":
    main()
