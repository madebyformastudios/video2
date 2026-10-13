"""Synthesise a quiet, sparse score: felt-piano notes with soft reverb, a faint low drone,
room tone, and very soft footsteps synced to the walk cycle (src/motion.json).
Pure stdlib. Writes public/audio/score.wav (44.1k stereo 16-bit). Frame times assume 30 fps.
Set FOOTSTEPS=0 to drop footsteps entirely."""
import json, math, os, random, struct, wave

SR, FPS, TOTAL = 44100, 30, 1080
N = int(TOTAL / FPS * SR)
random.seed(11)
FOOTSTEPS = os.environ.get("FOOTSTEPS", "1") != "0"
here = os.path.dirname(os.path.abspath(__file__))
motion = json.load(open(os.path.join(here, "..", "src", "motion.json")))

music = [0.0] * N  # goes through reverb
dry = [0.0] * N  # room tone, footsteps, drone (no reverb)

NOTE = {
    "A1": 55.0, "A2": 110.0, "C3": 130.81, "E3": 164.81, "F3": 174.61, "G3": 196.0, "A3": 220.0, "B3": 246.94,
    "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.0, "A4": 440.0, "C5": 523.25, "E5": 659.25,
}


def add(buf, t0, samples, gain=1.0):
    i0 = int(t0 * SR)
    for i, s in enumerate(samples):
        j = i0 + i
        if 0 <= j < N:
            buf[j] += s * gain


def piano(freq, dur=3.6, vel=1.0):
    """Soft felt-piano-ish tone: few partials, quick soft attack, slow decay, high partials fade fast."""
    n = int(dur * SR)
    out = [0.0] * n
    parts = [(1, 1.0, 2.4), (2, 0.35, 1.4), (3, 0.12, 0.8), (4, 0.05, 0.5)]
    for k, a, tau in parts:
        w = 2 * math.pi * freq * k
        for i in range(n):
            t = i / SR
            out[i] += a * math.sin(w * t) * math.exp(-t / tau)
    for i in range(n):
        t = i / SR
        out[i] *= min(1.0, t / 0.012) * min(1.0, (dur - t) / 0.4) * vel
    return out


def note(t, name, vel=1.0, dur=3.6):
    add(music, t + random.uniform(-0.012, 0.012), piano(NOTE[name], dur, vel * random.uniform(0.9, 1.0)))


# ---- music (seconds). Sparse and sad at first, then a warm lift for the dawn scene. ----
# Night shot (0 - 22s): single, slow notes. Low point (14.7 - 21s): almost nothing.
for t, n, v in [(1.0, "A3", 0.8), (4.2, "E4", 0.6), (7.4, "C4", 0.6), (10.2, "D4", 0.55), (12.4, "A3", 0.6), (14.67, "A1", 0.9)]:
    note(t, n, v, 5.0 if n == "A1" else 3.6)
note(17.5, "E3", 0.35, 5.0)
note(19.8, "A3", 0.3, 4.0)
# Dawn (22 - 29.3s): Am -> F -> C -> G arpeggios, gently rising
prog = [
    (22.0, ["A3", "C4", "E4", "A4"]),
    (24.0, ["F3", "A3", "C4", "F4"]),
    (26.0, ["C4", "E4", "G4", "C5"]),
    (28.0, ["G3", "B3", "D4", "G4"]),
]
for t0, chord in prog:
    for i, n in enumerate(chord):
        note(t0 + i * 0.42, n, 0.5 + 0.08 * i, 3.4)
# Title card (29.3 - 36s): open C chord, then fade
for i, n in enumerate(["C4", "G4", "C5", "E5"]):
    note(30.0 + i * 0.5, n, 0.55, 5.5)
note(33.4, "C3", 0.5, 5.0)

# faint drone (A2 + E3) breathing under the night shot, gone by the dawn scene
for i in range(int(24 * SR)):
    t = i / SR
    env = min(1.0, t / 2.5) * (1.0 if t < 13 else max(0.0, 1 - (t - 13) / 9)) * (0.55 + 0.45 * math.sin(2 * math.pi * 0.07 * t) ** 2)
    dry[i] += (math.sin(2 * math.pi * 110.0 * t) + 0.6 * math.sin(2 * math.pi * 164.81 * t)) * 0.012 * env

# room tone: lowpassed noise
lp = 0.0
for i in range(N):
    lp += (random.uniform(-1, 1) - lp) * 0.012
    dry[i] += lp * 0.05

# ---- footsteps: very soft, lowpassed, one per foot strike, scaled by walking speed ----
ease = lambda k, u: (1 - (1 - u) ** 2) if k == "out" else u * u * (3 - 2 * u)


def hero_x(f):
    x = motion["segments"][0]["x0"]
    for s in motion["segments"]:
        if f < s["from"]:
            return x
        if f >= s["to"]:
            x = s["x1"]
            continue
        return s["x0"] + (s["x1"] - s["x0"]) * ease(s["ease"], (f - s["from"]) / (s["to"] - s["from"]))
    return x


def footstep(level):
    n = int(0.11 * SR)
    out, f1, f2 = [], 0.0, 0.0
    for i in range(n):
        t = i / SR
        f1 += (random.uniform(-1, 1) - f1) * 0.09  # ~600 Hz lowpass, twice = soft thud
        f2 += (f1 - f2) * 0.09
        out.append(f2 * 3.0 * math.exp(-t / 0.028) * min(1.0, t / 0.004) * level)
    return out


if FOOTSTEPS:
    stride = motion["stride"]
    for seg in motion["segments"]:
        last = 0
        for f in range(seg["from"], seg["to"]):
            dist = hero_x(f) - seg["x0"]
            speed = abs(hero_x(f + 0.5) - hero_x(f - 0.5))
            strikes = int(2 * dist / stride)
            if strikes > last:
                last = strikes
                m = min(1.0, speed / 1.4) ** 0.6
                if m > 0.25:
                    add(dry, f / FPS, footstep(0.05 * m))

# ---- reverb on the music: soft multi-tap tail + gentle lowpass ----
taps = [(0.037, 0.42), (0.083, 0.36), (0.131, 0.30), (0.197, 0.25), (0.271, 0.20), (0.353, 0.16), (0.449, 0.12), (0.571, 0.09)]
wet = [0.0] * N
for d, g in taps:
    di = int(d * SR)
    for i in range(di, N):
        wet[i] += music[i - di] * g
lw = 0.0
for i in range(N):
    lw += (wet[i] - lw) * 0.25
    wet[i] = lw
mix = [music[i] * 0.8 + wet[i] * 0.9 + dry[i] for i in range(N)]

# overall gentle lowpass (~4 kHz) so nothing is bright or harsh
a, b = 0.0, 0.0
for i in range(N):
    a += (mix[i] - a) * 0.45
    b += (a - b) * 0.45
    mix[i] = b

# loudness: target RMS about -26 dBFS, soft limiter, fades
rms = math.sqrt(sum(x * x for x in mix) / N) or 1.0
gain = (10 ** (-26 / 20)) / rms
os.makedirs(os.path.join(here, "..", "public", "audio"), exist_ok=True)
with wave.open(os.path.join(here, "..", "public", "audio", "score.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i, x in enumerate(mix):
        t = i / SR
        fade = min(1.0, t / 1.5) * min(1.0, (TOTAL / FPS - t) / 2.5)
        s = math.tanh(x * gain * fade * 1.2) * 0.85
        v = int(s * 32767)
        frames += struct.pack("<hh", v, v)
    w.writeframes(bytes(frames))
peak = max(abs(x) for x in mix) * gain
print(f"wrote score.wav  rms target -26 dBFS  pre-limit peak {20 * math.log10(peak):.1f} dBFS")
