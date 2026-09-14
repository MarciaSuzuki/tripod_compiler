#!/usr/bin/env python3
"""
make_fixtures.py — synthesise two demo Recordings of one short passage so the
Compare screen can be demoed without any real audio. Standard library only.

    python3 tools/make_fixtures.py [fixtures/]

Produces:
  <out>/ruth-1-1-5/v1/{audio.wav,tape.json,meta.json}   the "first take"
  <out>/ruth-1-1-5/v2/{audio.wav,tape.json,meta.json}   the same passage with
                                                        three deliberate edits

The audio is a toy "voice": each syllable is a short harmonic tone with a
vowel-like spectrum, separated by small gaps; phrases end with a longer pause.
v2 keeps the same syllables with small timing jitter (like a re-recording), and
applies exactly three edits:
  1. substitution  — phrase 2, syllable 3 is a different syllable
  2. insertion     — phrase 3 gains one extra syllable
  3. melody change — phrase 4 keeps its syllables but is spoken about four
                     semitones higher
"""
import json
import math
import os
import random
import struct
import sys
import wave

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mock_tape import make_tape  # noqa: E402

SR = 16000

# A syllable = (F1 Hz, F2 Hz, duration s, kind); kind "v" = voiced vowel-like,
# "s" = noisy fricative-like. F1 is the loudest formant, F2 the second.
SYLLABLES = {
    "ba": (800, 1300, 0.22, "v"),
    "de": (400, 2000, 0.20, "v"),
    "lo": (400, 800, 0.24, "v"),
    "mi": (2900, 400, 0.18, "v"),
    "nu": (350, 1200, 0.22, "v"),
    "ra": (1300, 700, 0.20, "v"),
    "to": (700, 2900, 0.22, "v"),
    "ve": (2000, 800, 0.20, "v"),
    "si": (5000, 0, 0.16, "s"),
    "sha": (3000, 0, 0.18, "s"),
}
F0 = 120.0

PASSAGE_V1 = [
    ["ba", "de", "lo", "mi"],
    ["nu", "ra", "to", "ve"],
    ["lo", "ba", "si"],
    ["mi", "de", "nu", "ra", "to"],
]

# three deliberate edits, see module docstring
PASSAGE_V2 = [
    ["ba", "de", "lo", "mi"],
    ["nu", "ra", "sha", "ve"],           # 1. substitution (to -> sha)
    ["lo", "ba", "ve", "si"],            # 2. insertion (ve)
    ["mi", "de", "nu", "ra", "to"],      # 3. melody: rendered higher (see pitch_scale)
]


def resonator(x, freq, r=0.97):
    """Two-pole resonant filter: gives noise a clear spectral peak."""
    c = 2 * r * math.cos(2 * math.pi * freq / SR)
    r2 = r * r
    y1 = y2 = 0.0
    out = []
    for s in x:
        y = s + c * y1 - r2 * y2
        out.append(y)
        y2, y1 = y1, y
    peak = max(1e-9, max(abs(v) for v in out))
    return [v / peak * 0.5 for v in out]


def syllable(name, pitch_scale=1.0, rng=None):
    f1, f2, dur, kind = SYLLABLES[name]
    n = int(SR * dur)
    if kind == "s":
        noise = [rng.random() * 2 - 1 for _ in range(n)]
        core = resonator(noise, f1)
    else:
        f0 = F0 * pitch_scale
        harmonics = []
        h = 1
        while f0 * h < 7000:
            fh = f0 * h
            w = math.exp(-((fh - f1) / 220.0) ** 2) + 0.55 * math.exp(-((fh - f2) / 220.0) ** 2)
            if h == 1:
                w += 0.12  # a little fundamental, as in a real voice
            harmonics.append((fh, w))
            h += 1
        core = []
        for i in range(n):
            t = i / SR
            core.append(0.5 * sum(w * math.sin(2 * math.pi * fh * t) for fh, w in harmonics))
        peak = max(abs(v) for v in core)
        core = [v / peak * 0.6 for v in core]
    out = []
    for i in range(n):
        env = math.sin(math.pi * i / n) ** 0.5
        out.append(env * core[i])
    return out


def silence(seconds):
    return [0.0] * int(SR * seconds)


def render(passage, jitter=0.0, pitch_scale_by_phrase=None, seed=1):
    rng = random.Random(seed)
    x = silence(0.3)
    for pi, phrase in enumerate(passage):
        scale = (pitch_scale_by_phrase or {}).get(pi, 1.0)
        for name in phrase:
            x += syllable(name, scale, rng)
            x += silence(0.06 + rng.uniform(-jitter, jitter))
        x += silence(0.35 + rng.uniform(-jitter, jitter))
    x += silence(0.2)
    return x


def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(struct.pack("<%dh" % len(x), *[int(max(-1.0, min(1.0, s)) * 32767) for s in x]))


def write_version(folder, x, meta):
    os.makedirs(folder, exist_ok=True)
    write_wav(os.path.join(folder, "audio.wav"), x)
    tape = make_tape(x)
    with open(os.path.join(folder, "tape.json"), "w") as fh:
        json.dump(tape, fh)
    with open(os.path.join(folder, "meta.json"), "w") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
    print("wrote %s (%.1f s, %d frames)" % (folder, len(x) / SR, len(tape["u"])))


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fixtures")
    base = os.path.join(out, "ruth-1-1-5")
    v1 = render(PASSAGE_V1, jitter=0.0, seed=1)
    v2 = render(PASSAGE_V2, jitter=0.01, pitch_scale_by_phrase={3: 1.25}, seed=2)
    common = {"passage": "Ruth 1:1-5", "language": "por", "narrator": "Voz sintética (demo)"}
    write_version(os.path.join(base, "v1"), v1, {**common, "recorded_at": "2026-09-01T10:00:00Z", "label": "v1 rascunho"})
    write_version(os.path.join(base, "v2"), v2, {**common, "recorded_at": "2026-09-08T10:00:00Z", "label": "v2 revisão (3 mudanças)"})
    with open(os.path.join(base, "README.md"), "w") as fh:
        fh.write(
            "# Fixture: Ruth 1:1-5 (synthetic demo)\n\n"
            "Two mock Recordings of one toy passage, generated by `tools/make_fixtures.py`.\n"
            "The audio is a synthetic voice, not a person. Both tapes are mock tapes.\n\n"
            "`v2` differs from `v1` in exactly three places:\n\n"
            "1. phrase 2, syllable 3 is substituted (\"to\" → \"sha\")\n"
            "2. phrase 3 has one syllable inserted (\"ve\" before \"si\")\n"
            "3. phrase 4 is spoken about four semitones higher (same sounds, different melody)\n\n"
            "Import each folder as a version of one passage, then open Compare.\n"
        )


if __name__ == "__main__":
    main()
