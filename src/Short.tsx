import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Hero } from "./components/Hero";
import { Villain } from "./components/Villain";
import { Hud } from "./components/Hud";
import { Caption } from "./components/Caption";
import { Grade, Grain, Vignette } from "./components/Overlays";
import { SceneFrame, Edge } from "./components/SceneFrame";
import { handFont, theme } from "./theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const e = theme.ease;
const lerp = (t: number, a: number, b: number, from: number, to: number, ease = e.inOut) =>
  interpolate(t, [from, to], [a, b], { ...C, easing: ease });

type SceneDef = { from: number; dur: number; enter: Edge; exit: Edge };
export const SCENES: Record<"A" | "B" | "C" | "D" | "E", SceneDef> = {
  A: { from: 0, dur: 190, enter: { type: "black", frames: 24 }, exit: { type: "blur", frames: 20 } },
  B: { from: 170, dur: 250, enter: { type: "blur", frames: 20 }, exit: { type: "none", frames: 0 } },
  C: { from: 400, dur: 260, enter: { type: "push", frames: 22 }, exit: { type: "black", frames: 18 } },
  D: { from: 660, dur: 240, enter: { type: "black", frames: 18 }, exit: { type: "none", frames: 0 } },
  E: { from: 880, dur: 200, enter: { type: "iris", frames: 26 }, exit: { type: "black", frames: 20 } },
};
export const TOTAL = 1080;

const dayAt = (t: number): [string, number] => {
  if (t < 170) return ["DAY 1", 0];
  if (t < 230) return ["DAY 2", 170];
  if (t < 290) return ["DAY 9", 230];
  if (t < 400) return ["DAY 10", 290];
  if (t < 660) return ["DAY 61", 400];
  if (t < 790) return ["DAY 100", 660];
  return ["DAY 101", 790];
};

type Cam = { z0: number; z1: number; ox: number; oy: number; px?: number };

// Street plate + hero + villain share one camera so they stay anchored together.
const Stage: React.FC<{ cam: Cam; dur: number; children: React.ReactNode }> = ({ cam, dur, children }) => {
  const f = useCurrentFrame();
  const z = lerp(f, cam.z0, cam.z1, 0, dur);
  const px = lerp(f, 0, cam.px ?? 0, 0, dur);
  return (
    <AbsoluteFill style={{ transform: `translateX(${px}px) scale(${z})`, transformOrigin: `${cam.ox}% ${cam.oy}%` }}>
      <Img src={staticFile("plates/street-night.jpeg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {children}
    </AbsoluteFill>
  );
};

const At: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -100%)" }}>{children}</div>
);

const SceneA: React.FC = () => {
  const f = useCurrentFrame();
  const t = f;
  const [day, dc] = dayAt(t);
  const x = lerp(f, 780, 1010, 0, 190);
  return (
    <>
      <Stage cam={{ z0: 1, z1: 1.07, ox: 50, oy: 70 }} dur={190}>
        <At x={x} y={800}>
          <Hero frame={f} walk={1} slouch={0} scale={1.05} />
        </At>
      </Stage>
      <Hud day={day} dayChangedAt={dc} t={t} motivation={100} showBar />
      <Caption text="This time, I mean it." start={50} end={160} t={t} />
    </>
  );
};

const SceneB: React.FC = () => {
  const f = useCurrentFrame();
  const t = f + SCENES.B.from;
  const [day, dc] = dayAt(t);
  const walk = lerp(t, 1, 0, 200, 330);
  const slouch = lerp(t, 0, 1, 280, 380);
  const motivation = lerp(t, 100, 0, 185, 340);
  return (
    <>
      <Stage cam={{ z0: 1.12, z1: 1.24, ox: 62, oy: 62, px: -30 }} dur={250}>
        <At x={1010} y={815}>
          <Hero frame={t} walk={walk} slouch={slouch} scale={1.1} />
        </At>
      </Stage>
      <Hud day={day} dayChangedAt={dc} t={t} motivation={motivation} showBar />
    </>
  );
};

const SceneC: React.FC = () => {
  const f = useCurrentFrame();
  const t = f + SCENES.C.from;
  const [day, dc] = dayAt(t);
  const rise = spring({ frame: f - 40, fps: theme.size.fps, config: theme.spring.soft });
  return (
    <>
      <Stage cam={{ z0: 1.28, z1: 1.4, ox: 52, oy: 80 }} dur={260}>
        <div style={{ position: "absolute", inset: 0, opacity: rise, transform: `translateY(${(1 - rise) * 40}px)` }}>
          <At x={800} y={835}>
            <Villain frame={t} scale={0.98} />
          </At>
        </div>
        <At x={1010} y={835}>
          <Hero frame={t} walk={0} slouch={1} scale={1.1} />
        </At>
      </Stage>
      <Hud day={day} dayChangedAt={dc} t={t} motivation={0} showBar />
      <Caption text="Come back when you feel it." start={100} end={238} t={f} color={theme.colors.brick} />
    </>
  );
};

const SceneD: React.FC = () => {
  const f = useCurrentFrame();
  const t = f + SCENES.D.from;
  const [day, dc] = dayAt(t);
  const x = lerp(f, 860, 1080, 0, 240);
  return (
    <>
      <Stage cam={{ z0: 1.0, z1: 1.09, ox: 40, oy: 72, px: 20 }} dur={240}>
        <At x={x} y={805}>
          <Hero frame={t} walk={1} slouch={0} band scale={1.05} />
        </At>
      </Stage>
      <Hud day={day} dayChangedAt={dc} t={t} motivation={0} showBar />
      <Caption text="Motivation disappears." start={30} end={115} t={f} />
      <Caption text="Discipline keeps you going." start={120} end={225} t={f} />
    </>
  );
};

const SceneE: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame: f - 14, fps, config: theme.spring.soft });
  const draw = lerp(f, 0, 1, 34, 70, e.out);
  const l1 = spring({ frame: f - 76, fps, config: theme.spring.word });
  const l2 = spring({ frame: f - 104, fps, config: theme.spring.word });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${theme.colors.inkSoft}, ${theme.colors.ink})`, alignItems: "center", justifyContent: "center", fontFamily: handFont }}>
      <div style={{ textAlign: "center", marginTop: -30 }}>
        <div style={{ fontSize: 170, letterSpacing: 10, color: theme.colors.text, opacity: title, transform: `translateY(${(1 - title) * 26}px) scale(${0.96 + title * 0.04})` }}>DISCIPLINE</div>
        <svg width={760} height={30} viewBox="0 0 760 30" style={{ marginTop: -6 }}>
          <path d="M6 18 Q 100 4 190 16 T 380 14 T 570 16 T 754 12" stroke={theme.colors.brick} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={800} strokeDashoffset={800 * (1 - draw)} />
        </svg>
        <div style={{ marginTop: 48, fontSize: 56, color: theme.colors.text, opacity: l1, transform: `translateY(${(1 - l1) * 14}px)` }}>Day one, or one day.</div>
        <div style={{ marginTop: 10, fontSize: 56, color: theme.colors.brick, opacity: l2, transform: `translateY(${(1 - l2) * 14}px)` }}>You decide.</div>
      </div>
    </AbsoluteFill>
  );
};

const scenes: [keyof typeof SCENES, React.FC][] = [
  ["A", SceneA],
  ["B", SceneB],
  ["C", SceneC],
  ["D", SceneD],
  ["E", SceneE],
];

export const Short: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.ink }}>
    {scenes.map(([k, Comp]) => {
      const s = SCENES[k];
      return (
        <Sequence key={k} from={s.from} durationInFrames={s.dur}>
          <SceneFrame duration={s.dur} enter={s.enter} exit={s.exit}>
            <Comp />
          </SceneFrame>
        </Sequence>
      );
    })}
    <Grade />
    <Vignette />
    <Grain />
    <Audio src={staticFile("audio/score.wav")} />
  </AbsoluteFill>
);
