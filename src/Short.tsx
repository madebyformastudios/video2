import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Hero, CharacterKind } from "./components/Hero";
import { heroWalk } from "./motion";
import { Villain } from "./components/Villain";
import { Hud } from "./components/Hud";
import { Caption } from "./components/Caption";
import { Grain, Vignette } from "./components/Overlays";
import { SceneFrame, Edge } from "./components/SceneFrame";
import { handFont, theme } from "./theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const e = theme.ease;
const lerp = (t: number, a: number, b: number, from: number, to: number, ease = e.inOut) =>
  interpolate(t, [from, to], [a, b], { ...C, easing: ease });

type SceneDef = { from: number; dur: number; enter: Edge; exit: Edge };
// Transitions only where something actually changes: a time jump (fade through black)
// and the move from story to title card (dissolve). The night shot is one continuous take.
export const SCENES: Record<"N" | "D" | "E", SceneDef> = {
  N: { from: 0, dur: 660, enter: { type: "black", frames: 24 }, exit: { type: "black", frames: 18 } },
  D: { from: 660, dur: 240, enter: { type: "black", frames: 18 }, exit: { type: "blur", frames: 20 } },
  E: { from: 880, dur: 200, enter: { type: "blur", frames: 20 }, exit: { type: "black", frames: 20 } },
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

type Cam = { z0: number; z1: number; ox0: number; ox1: number; oy0: number; oy1: number };

// Plate + characters share one camera so they stay anchored together.
const Stage: React.FC<{ plate: string; cam: Cam; dur: number; children: React.ReactNode }> = ({ plate, cam, dur, children }) => {
  const f = useCurrentFrame();
  const z = lerp(f, cam.z0, cam.z1, 0, dur);
  const ox = lerp(f, cam.ox0, cam.ox1, 0, dur);
  const oy = lerp(f, cam.oy0, cam.oy1, 0, dur);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, transformOrigin: `${ox}% ${oy}%` }}>
      <Img src={staticFile(plate)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {children}
    </AbsoluteFill>
  );
};

const At: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -100%)" }}>{children}</div>
);

const SceneNight: React.FC<{ ch: CharacterKind }> = ({ ch }) => {
  const t = useCurrentFrame();
  const [day, dc] = dayAt(t);
  const w = heroWalk(t);
  const slouch = lerp(t, 0, 1, 280, 380);
  const motivation = lerp(t, 100, 0, 185, 340);
  const rise = spring({ frame: t - 440, fps: theme.size.fps, config: theme.spring.soft });
  return (
    <>
      <Stage plate="plates/street-night-1080.jpeg" cam={{ z0: 1.0, z1: 1.3, ox0: 45, ox1: 52, oy0: 70, oy1: 80 }} dur={660}>
        {rise > 0.001 && (
          <div style={{ position: "absolute", inset: 0, opacity: rise, transform: `translateY(${(1 - rise) * 40}px)` }}>
            <At x={800} y={835}>
              <Villain frame={t} scale={0.98} kind={ch} />
            </At>
          </div>
        )}
        <At x={w.x} y={815}>
          <Hero frame={t} dist={w.dist} speed={w.speed} slouch={slouch} scale={1.1} character={ch} />
        </At>
      </Stage>
      <Hud day={day} dayChangedAt={dc} t={t} motivation={motivation} showBar />
      <Caption text="This time, I mean it." start={50} end={160} t={t} />
      <Caption text="Come back when you feel it." start={500} end={638} t={t} color={theme.colors.brick} />
    </>
  );
};

const SceneDawn: React.FC<{ ch: CharacterKind }> = ({ ch }) => {
  const f = useCurrentFrame();
  const t = f + SCENES.D.from;
  const [day, dc] = dayAt(t);
  const w = heroWalk(t);
  return (
    <>
      <Stage plate="plates/street-dawn-1080.jpeg" cam={{ z0: 1.0, z1: 1.09, ox0: 40, ox1: 48, oy0: 72, oy1: 72 }} dur={240}>
        <At x={w.x} y={805}>
          <Hero frame={t} dist={w.dist} speed={w.speed} slouch={0} band scale={1.1} character={ch} />
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

export const makeShort = (ch: CharacterKind): React.FC => () => {
  const list: [keyof typeof SCENES, React.ReactNode][] = [
    ["N", <SceneNight ch={ch} />],
    ["D", <SceneDawn ch={ch} />],
    ["E", <SceneE />],
  ];
  return (
    <AbsoluteFill style={{ background: theme.colors.ink }}>
      {list.map(([k, node]) => {
        const sc = SCENES[k];
        return (
          <Sequence key={k} from={sc.from} durationInFrames={sc.dur}>
            <SceneFrame duration={sc.dur} enter={sc.enter} exit={sc.exit}>
              {node}
            </SceneFrame>
          </Sequence>
        );
      })}
      <Vignette />
      <Grain />
      <Audio src={staticFile("audio/score.wav")} />
    </AbsoluteFill>
  );
};

export const Short = makeShort("blob");
export const ShortB = makeShort("hoodie");
