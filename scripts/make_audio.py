"""Synthesise the score: soft pad, room tone, muted footsteps, gentle chimes, low sub-hit.
Pure stdlib. Writes public/audio/score.wav (44.1k stereo 16-bit). Frame times assume 30 fps."""
import math, random, struct, wave, os

SR, FPS, TOTAL = 44100, 30, 1080
N = int(TOTAL / FPS * SR)
random.seed(7)
buf = [0.0] * N
fr = lambda f: f / FPS


def add(t0, samples, gain=1.0):
    i0 = int(t0 * SR)
    for i, s in enumerate(samples):
        if 0 <= i0 + i < N:
            buf[i0 + i] += s * gain


def env_lin(t, pts):
    if t <= pts[0][0]:
        return pts[0][1]
    for (a, va), (b, vb) in zip(pts, pts[1:]):
        if a <= t <= b:
            return va + (vb - va) * ((t - a) / (b - a))
    return pts[-1][1]


# pad: Am chord, three detuned voices per note, level follows the story
notes = [110.0, 164.81, 220.0, 261.63]
high = [329.63, 392.0]
pad_env = [(0, 0), (1.5, 0.5), (13, 0.55), (15, 0.18), (21, 0.1), (22.5, 0.3), (30, 1.0), (34, 0.8), (36, 0)]
for i in range(N):
    t = i / SR
    lfo = 0.85 + 0.15 * math.sin(2 * math.pi * 0.11 * t)
    v = 0.0
    for n in notes:
        for d in (-0.6, 0.0, 0.7):
            v += math.sin(2 * math.pi * (n + d) * t) * 0.05
    if t > 21.5:
        up = min(1.0, (t - 21.5) / 6)
        for n in high:
            v += math.sin(2 * math.pi * n * t) * 0.045 * up
    buf[i] += v * lfo * env_lin(t, pad_env)

# room tone: noise through one-pole lowpass
lp = 0.0
for i in range(N):
    lp += (random.uniform(-1, 1) - lp) * 0.02
    buf[i] += lp * 0.05


def footstep(level=1.0):
    out = []
    n = int(0.16 * SR)
    f = 0.0
    for i in range(n):
        t = i / SR
        f += (random.uniform(-1, 1) - f) * 0.07
        out.append((math.sin(2 * math.pi * 68 * t) * math.exp(-t / 0.035) + f * 1.6 * math.exp(-t / 0.03)) * level)
    return out


step_frames = list(range(26, 180, 15)) + [180, 197, 216, 238, 264, 294, 330]
step_frames += list(range(680, 892, 14))
for sf in step_frames:
    add(fr(sf), footstep(0.22 + random.uniform(-0.03, 0.03)))


def chime(freq):
    out = []
    n = int(2.2 * SR)
    for i in range(n):
        t = i / SR
        a = min(1.0, t / 0.006) * math.exp(-t / 0.75)
        v = math.sin(2 * math.pi * freq * t) + 0.45 * math.sin(2 * math.pi * freq * 1.5 * t) + 0.2 * math.sin(2 * math.pi * freq * 2.01 * t)
        out.append(v * a)
    return out


for cf, fq in ((170, 440.0), (230, 392.0), (290, 349.23)):
    add(fr(cf), chime(fq), 0.07)


def subhit():
    out = []
    n = int(2.2 * SR)
    for i in range(n):
        t = i / SR
        out.append(math.sin(2 * math.pi * (52 - 6 * min(t, 1)) * t) * min(1.0, t / 0.03) * math.exp(-t / 0.7))
    return out


add(fr(440), subhit(), 0.32)

peak = max(abs(x) for x in buf) or 1.0
scale = 0.72 / peak
os.makedirs("public/audio", exist_ok=True)
with wave.open("public/audio/score.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i, x in enumerate(buf):
        t = i / SR
        fade = min(1.0, t / 0.8) * min(1.0, (TOTAL / FPS - t) / 1.5)
        s = int(max(-1, min(1, x * scale * fade)) * 32767)
        frames += struct.pack("<hh", s, s)
    w.writeframes(bytes(frames))
print("wrote public/audio/score.wav")
