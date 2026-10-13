"""Score for PROCRASTINATION (161s). Quiet, sparse felt-piano with soft reverb, drone, room tone,
very soft footsteps synced to the walk passes, reversed-piano rewind swells, ascending check ticks.
Pure stdlib. Writes public/audio/procrastination.wav (44.1k stereo 16-bit). Frame times assume 30 fps.
Set FOOTSTEPS=0 to drop footsteps."""
import math, os, random, struct, wave

SR, FPS, TOTAL = 44100, 30, 4830
DUR = TOTAL / FPS
N = int(DUR * SR)
random.seed(21)
FOOTSTEPS = os.environ.get("FOOTSTEPS", "1") != "0"
here = os.path.dirname(os.path.abspath(__file__))

music = [0.0] * N
dry = [0.0] * N

NOTE = {
    "A1": 55.0, "A2": 110.0, "C3": 130.81, "E3": 164.81, "F3": 174.61, "G3": 196.0, "A3": 220.0, "B3": 246.94,
    "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0, "B4": 493.88,
    "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99,
}


def add(buf, t0, samples, gain=1.0):
    i0 = int(t0 * SR)
    for i, s in enumerate(samples):
        j = i0 + i
        if 0 <= j < N:
            buf[j] += s * gain


_cache = {}


def piano(name, dur):
    key = (name, dur)
    if key in _cache:
        return _cache[key]
    freq = NOTE[name]
    n = int(dur * SR)
    out = [0.0] * n
    for k, a, tau in [(1, 1.0, 2.4), (2, 0.35, 1.4), (3, 0.12, 0.8)]:
        w = 2 * math.pi * freq * k
        for i in range(n):
            t = i / SR
            out[i] += a * math.sin(w * t) * math.exp(-t / tau)
    for i in range(n):
        t = i / SR
        out[i] *= min(1.0, t / 0.012) * min(1.0, (dur - t) / 0.4)
    _cache[key] = out
    return out


def note(t, name, vel=1.0, dur=3.4, reverse=False):
    w = piano(name, dur)
    if reverse:
        w = w[::-1]
    add(music, t + random.uniform(-0.012, 0.012), w, vel * random.uniform(0.9, 1.0))


def lowpass(buf, coef, passes=1):
    for _ in range(passes):
        a = 0.0
        for i in range(len(buf)):
            a += (buf[i] - a) * coef
            buf[i] = a


# ---------------- T1 bedroom (0-8s) ----------------
def bell(t, f=880.0, g=0.05):
    n = int(2.0 * SR)
    out = [(math.sin(2 * math.pi * f * i / SR) + 0.4 * math.sin(2 * math.pi * f * 2.01 * i / SR)) * math.exp(-i / SR / 0.55) * min(1.0, i / SR / 0.01) for i in range(n)]
    add(dry, t, out, g)


bell(0.9, 698.46, 0.045)
bell(2.1, 698.46, 0.045)
note(4.3, "A3", 0.8)
note(6.6, "E4", 0.6)
# ---------------- T2 desk day 1 (8-25s) ----------------
for t, n, v in [(8.6, "C4", 0.6), (11.0, "A3", 0.55), (13.0, "A2", 0.85), (15.6, "E4", 0.5), (18.4, "D4", 0.5), (21.8, "E3", 0.55)]:
    note(t, n, v, 4.5 if v > 0.8 else 3.4)
# ---------------- T3-T10 slide (25-52s): sparse, slightly heavier ----------------
for t, n, v in [(25.6, "A3", 0.55), (28.8, "C4", 0.5), (32.0, "E3", 0.5), (35.2, "D4", 0.5), (38.4, "A3", 0.5), (41.6, "F3", 0.5), (44.8, "E3", 0.55), (48.0, "A2", 0.7), (50.5, "C4", 0.4)]:
    note(t, n, v, 4.0)
# ---------------- T11 road (52-91s) ----------------
for t, n, v in [(54.0, "A3", 0.5), (59.0, "E4", 0.4), (64.0, "C4", 0.4), (68.5, "A3", 0.45)]:
    note(t, n, v, 4.0)
note(78.0, "A1", 0.9, 5.0)  # villain hand on shoulder
note(82.6, "E4", 0.7, 5.0)  # TODAY, after 1.5s of silence
note(85.0, "C3", 0.5, 4.5)
# ---------------- T12 rewind (91-101s): reversed swells, rising ----------------
for i, (n, t) in enumerate([("A3", 91.4), ("C4", 93.3), ("E4", 95.2), ("G4", 97.1), ("C5", 99.0)]):
    note(t, n, 0.7, 2.6, reverse=True)
# ---------------- T13 desk dawn (101-131s): warm lift ----------------
chords = [["C4", "E4", "G4", "C5"], ["G3", "B3", "D4", "G4"], ["A3", "C4", "E4", "A4"], ["F3", "A3", "C4", "F4"]]
t = 102.0
ci = 0
while t < 125.0:
    for j, n in enumerate(chords[ci % 4]):
        note(t + j * 0.42, n, 0.42 + 0.05 * j, 3.2)
    t += 4.0
    ci += 1
note(111.2, "E5", 0.55, 3.0)  # timer bell
for k, n in enumerate(["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5"] * 3):
    if k >= 21:
        break
    note(125.67 + k * 0.133, n, 0.22, 1.6)  # check ticks, ascending
# ---------------- T14 dawn street (131-146s) ----------------
for t, n, v in [(131.4, "C4", 0.5), (133.2, "E4", 0.5), (135.0, "G4", 0.5), (137.0, "A4", 0.5), (139.0, "G4", 0.45), (141.2, "E4", 0.5), (143.0, "C4", 0.5)]:
    note(t, n, v, 3.6)
# ---------------- T15 end card (146-161s) ----------------
for j, n in enumerate(["C3", "G3", "C4", "E4", "G4"]):
    note(146.6 + j * 0.45, n, 0.55, 8.0)
note(153.0, "C5", 0.4, 6.0)

# ---------------- drone (A2 + E3) under the slide and the road, gone at dawn ----------------
for i in range(int(95 * SR)):
    t = i / SR
    if t < 8:
        env = 0.0
    elif t < 12:
        env = (t - 8) / 4
    elif t < 70:
        env = 1.0
    elif t < 80:
        env = 1 - (t - 70) / 10
    else:
        env = 0.0
    if env > 0:
        dry[i] += (math.sin(2 * math.pi * 110.0 * t) + 0.6 * math.sin(2 * math.pi * 164.81 * t)) * 0.011 * env * (0.6 + 0.4 * math.sin(2 * math.pi * 0.07 * t) ** 2)

# ---------------- room tone ----------------
lp = 0.0
for i in range(N):
    lp += (random.uniform(-1, 1) - lp) * 0.012
    dry[i] += lp * 0.05

# ---------------- wind/rain bed for the seasons (58-64s) and the rewind whir (91-101s) ----------------
def noise_bed(t0, t1, level, coef):
    i0, i1 = int(t0 * SR), int(t1 * SR)
    f = 0.0
    for i in range(i0, i1):
        f += (random.uniform(-1, 1) - f) * coef
        x = (i - i0) / (i1 - i0)
        env = math.sin(math.pi * x) ** 2
        dry[i] += f * level * env


noise_bed(57.5, 64.5, 0.06, 0.05)
noise_bed(91.0, 101.0, 0.035, 0.03)

# ---------------- footsteps (very soft), synced to the walk passes ----------------
STRIDE = 90.0


def footstep(level):
    n = int(0.11 * SR)
    out, f1, f2 = [], 0.0, 0.0
    for i in range(n):
        t = i / SR
        f1 += (random.uniform(-1, 1) - f1) * 0.09
        f2 += (f1 - f2) * 0.09
        out.append(f2 * 3.0 * math.exp(-t / 0.028) * min(1.0, t / 0.004) * level)
    return out


def pos(f, f0, f1, x0, x1, kind):
    u = max(0.0, min(1.0, (f - f0) / (f1 - f0)))
    e = (1 - (1 - u) ** 2) if kind == "out" else (u * u * (3 - 2 * u) if kind == "inout" else u)
    return x0 + (x1 - x0) * e


passes = [  # (base, from, to, x0, x1, kind) in local frames of the take
    (1560, 10, 170, 520, 910, "lin"), (1560, 180, 240, 560, 704, "lin"), (1560, 240, 300, 620, 764, "lin"),
    (1560, 300, 360, 680, 824, "lin"), (1560, 360, 600, 500, 1130, "lin"), (1560, 600, 690, 760, 900, "out"),
    (3930, 0, 180, 420, 880, "inout"), (3930, 300, 450, 880, 1160, "lin"),
]
if FOOTSTEPS:
    for base, f0, f1, x0, x1, kind in passes:
        last = 0
        for f in range(f0, f1):
            dist = pos(f, f0, f1, x0, x1, kind) - x0
            speed = abs(pos(f + 0.5, f0, f1, x0, x1, kind) - pos(f - 0.5, f0, f1, x0, x1, kind))
            strikes = int(2 * dist / STRIDE)
            if strikes > last:
                last = strikes
                m = min(1.0, speed / 1.4) ** 0.6
                if m > 0.25:
                    add(dry, (base + f) / FPS, footstep(0.05 * m))

# ---------------- reverb on music, then mix, soften, loudness ----------------
taps = [(0.037, 0.42), (0.083, 0.36), (0.131, 0.30), (0.197, 0.25), (0.271, 0.20), (0.353, 0.16), (0.449, 0.12), (0.571, 0.09)]
wet = [0.0] * N
for d, g in taps:
    di = int(d * SR)
    for i in range(di, N):
        wet[i] += music[i - di] * g
lowpass(wet, 0.25)
mix = [music[i] * 0.8 + wet[i] * 0.9 + dry[i] for i in range(N)]
lowpass(mix, 0.45, 2)

rms = math.sqrt(sum(x * x for x in mix) / N) or 1.0
gain = (10 ** (-26 / 20)) / rms
os.makedirs(os.path.join(here, "..", "public", "audio"), exist_ok=True)
with wave.open(os.path.join(here, "..", "public", "audio", "procrastination.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i, x in enumerate(mix):
        t = i / SR
        fade = min(1.0, t / 1.5) * min(1.0, (DUR - t) / 3.0)
        v = int(math.tanh(x * gain * fade * 1.2) * 0.85 * 32767)
        frames += struct.pack("<hh", v, v)
    w.writeframes(bytes(frames))
print(f"wrote procrastination.wav {DUR:.1f}s")
