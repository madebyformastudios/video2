import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { Hero } from "../components/Hero";
import { Villain } from "../components/Villain";
import { Hud } from "../components/Hud";
import { Caption } from "../components/Caption";
import { handFont, theme } from "../theme";
import { Defs, Head, HeroKneel, HeroLying, HeroSeated } from "./poses";
import { AlarmClock, FlipLine, Notebook, PaintedText, PhoneTimer, Signpost, Sticky, WallCalendar, Weather, CellState } from "./props";
import { At, Center, NoCaptions, Stage, TimeProvider, lerp, useT, walkAt } from "./engine";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACE = { lid: 0.4 };
const TIRED = { lid: 0.62 };
const BRICK = theme.colors.brick;

export const BASE = { T1: 0, T2: 240, T3: 750, T4: 870, T5: 960, T6: 1050, T7: 1140, T8: 1230, T9: 1320, T10: 1440, T11: 1560, T12: 2730, T13: 3030, T14: 3930, T15: 4380 };
export const TOTAL = 4830;

// ---------- HUD day schedule (absolute frames) ----------
const dayAt = (f: number): [string, number] => {
  if (f < 240) return ["", 0];
  if (f < 680) return ["DAY 1", 240];
  if (f < 870) return ["DAY 2", 680];
  if (f < 960) return ["DAY 3", 870];
  if (f < 1050) return ["DAY 5", 960];
  if (f < 1140) return ["DAY 9", 1050];
  if (f < 1230) return ["DAY 11", 1140];
  if (f < 1320) return ["DAY 14", 1230];
  if (f < 1440) return ["DAY 23", 1320];
  if (f < 1560) return ["DAY 40", 1440];
  if (f < 1740) return ["DAY 60", 1560];
  if (f < 1800) return ["DAY 100", 1740];
  if (f < 1860) return ["DAY 150", 1800];
  if (f < 1920) return ["DAY 200", 1860];
  if (f < 2160) return [`DAY ${Math.round(lerp(f, 201, 364, 1920, 2160))}`, -999];
  if (f < 3030) return ["DAY 365", 2160];
  if (f < 3450) return ["DAY 1", 3030];
  if (f < 3630) return [`DAY ${Math.round(lerp(f, 2, 29, 3450, 3630))}`, -999];
  if (f < 3750) return ["DAY 30", 3630];
  if (f < 3930) return ["", 0];
  if (f < 4290) return ["DAY 90", 3930];
  return ["", 0];
};
const DayHud: React.FC<{ base: number; t: number }> = ({ base, t }) => {
  const [label, dc] = dayAt(base + t);
  if (!label) return null;
  return <Hud day={label} dayChangedAt={dc - base} t={t} motivation={0} showBar={false} />;
};

const popIn = (t: number, at: number, fps = 30) => spring({ frame: t - at, fps, config: { damping: 14, stiffness: 160, mass: 0.6 } });

// =============== T1: bedroom dawn (0 - 8s) ===============
export const T1: React.FC = () => {
  const t = useT();
  const sit = lerp(t, 0, 1, 112, 128);
  return (
    <>
      <Stage
        plate="plates/bedroom-dawn.jpeg"
        cam={[
          { f: 0, z: 1.0, ox: 68, oy: 60 },
          { f: 110, z: 1.1, ox: 70, oy: 60 },
          { f: 240, z: 1.42, ox: 72, oy: 56 },
        ]}
      >
        <Center x={1267} y={540} z={2}>
          <AlarmClock w={62} time="7:00" />
        </Center>
        <At x={1584} y={656} rot={27} opacity={1 - sit} z={3}>
          <HeroLying frame={t} face={{ lid: 0.3, asleep: true }} blanket scale={1.7} />
        </At>
        <At x={1440} y={650} flip opacity={sit} z={3}>
          <div style={{ transform: `translateY(${(1 - sit) * 10}px)` }}>
            <HeroSeated frame={t} face={{ lid: 0.5 }} hands="lap" seat={22} couch scale={1.5} lean={-2} />
          </div>
        </At>
      </Stage>
      <Caption text="Today, I start." start={150} end={232} t={t} />
    </>
  );
};

// =============== T2: desk day 1 (8 - 25s) ===============
export const T2: React.FC = () => {
  const t = useT();
  const open = t >= 30 && t < 330;
  const notePop = popIn(t, 345);
  const vIn = lerp(t, 0, 1, 150, 200, theme.ease.out);
  const dip = t < 428 ? lerp(t, 0, 1, 395, 420) : lerp(t, 1, 0, 428, 448);
  const cells: CellState[] = Array.from({ length: 35 }, (_, i) => (i === 0 && t >= 470 ? "sticky" : "empty"));
  const calPress = t >= 470 ? popIn(t, 470) : 0;
  return (
    <>
      <Stage
        plate="plates/desk-day.jpeg"
        cam={[
          { f: 0, z: 1.05, ox: 55, oy: 60 },
          { f: 100, z: 1.25, ox: 50, oy: 58 },
          { f: 180, z: 1.12, ox: 44, oy: 60 },
          { f: 300, z: 1.14, ox: 46, oy: 58 },
          { f: 400, z: 1.1, ox: 50, oy: 45 },
          { f: 440, z: 1.5, ox: 44, oy: 28 },
          { f: 510, z: 1.6, ox: 44, oy: 26 },
        ]}
      >
        <Center x={800} y={275}>
          <WallCalendar w={330} cells={cells} label="" />
        </Center>
        {t >= 470 && (
          <Center x={800 - 120 + 0} y={275 - 100} z={4} scale={0.4 + 0.6 * calPress} rot={-4}>
            <div style={{ opacity: 0 }} />
          </Center>
        )}
        <At x={470 + (1 - vIn) * -80} y={775} opacity={vIn} z={2}>
          <Villain frame={t} scale={1.12} kind="hoodie" />
        </At>
        <Center x={905} y={528} z={3}>
          <Notebook w={150} open={open} text={t > 40 && t < 140 ? 0 : 0} />
        </Center>
        {t >= 345 && (
          <Center x={905} y={520} z={4} scale={notePop} rot={-6}>
            <Sticky text="TOMORROW" w={92} />
          </Center>
        )}
        <At x={1075} y={768} flip z={3}>
          <HeroSeated frame={t} face={t < 330 ? { lid: 0.2 } : { lid: 0.45 }} hands="write" seat={55} scale={2} reach={t > 330 ? 8 : 0} />
        </At>
      </Stage>
      <DayHud base={BASE.T2} t={t} />
      <Caption text="Rest first. Start tomorrow." start={170} end={290} t={t} color={BRICK} />
      <AbsoluteFill style={{ background: "#0b0c10", opacity: dip, pointerEvents: "none" }} />
    </>
  );
};

// =============== T3: living room DAY 2 (25 - 29s) ===============
const LIVING = "plates/living-night.jpeg";
export const T3: React.FC = () => {
  const t = useT();
  return (
    <>
      <Stage plate={LIVING} cam={[{ f: 0, z: 1.0, ox: 60, oy: 70 }, { f: 120, z: 1.14, ox: 62, oy: 70 }]}>
        <At x={870} y={905} z={2}>
          <Villain frame={t} scale={1.5} kind="hoodie" reach={{ x: 210, y: -295, side: "right" }} />
        </At>
        <At x={1186} y={910} flip z={3}>
          <HeroSeated frame={t} face={TIRED} hands="phone" seat={96} couch scale={2.3} lean={4} slouch={0.4} />
        </At>
      </Stage>
      <DayHud base={BASE.T3} t={t} />
      <Caption text="Just five more minutes." start={25} end={112} t={t} color={BRICK} />
    </>
  );
};

// =============== Desk helpers ===============
const DeskScene: React.FC<{ plate?: string; t: number; children?: React.ReactNode; hero?: React.ReactNode; cam: any; cal?: CellState[] }> = ({ plate = "plates/desk-day.jpeg", t, children, hero, cam, cal }) => (
  <Stage plate={plate} cam={cam}>
    <Center x={800} y={275}>
      <WallCalendar w={330} cells={cal ?? Array.from({ length: 35 }, (_, i) => (i < 4 ? "sticky" : "empty"))} label="" />
    </Center>
    {children}
    {hero}
  </Stage>
);

// T4 DAY 3: fresh start
export const T4: React.FC = () => {
  const t = useT();
  const a = popIn(t, 18);
  const b = popIn(t, 38);
  return (
    <>
      <DeskScene
        t={t}
        cam={[{ f: 0, z: 1.25, ox: 52, oy: 60 }, { f: 90, z: 1.32, ox: 52, oy: 60 }]}
        hero={
          <At x={1075} y={768} flip z={3}>
            <HeroSeated frame={t} face={FACE} hands="tidy" seat={55} scale={2} reach={Math.sin(t * 0.2) * 3} />
          </At>
        }
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Center key={i} x={905 + (i % 3) * 5} y={525 - i * 2} z={3} rot={-8 + i * 5}>
            <Sticky text="TOMORROW" w={70} />
          </Center>
        ))}
        <Center x={985} y={522} z={4} scale={a}>
          <Notebook w={140} color="#8a5a4a" />
        </Center>
        <Center x={1065} y={528} z={4} scale={b} rot={4}>
          <div style={{ width: 80, height: 108, background: "#c9b48a", border: "3px solid rgba(11,12,16,0.55)", borderRadius: 4 }} />
        </Center>
      </DeskScene>
      <DayHud base={BASE.T4} t={t} />
      <Caption text="Start fresh on Monday." start={20} end={84} t={t} color={BRICK} />
    </>
  );
};

// T5 DAY 5: tidying
export const T5: React.FC = () => {
  const t = useT();
  return (
    <>
      <DeskScene
        t={t}
        cam={[{ f: 0, z: 1.25, ox: 50, oy: 60 }, { f: 90, z: 1.3, ox: 50, oy: 60 }]}
        hero={
          <At x={1075} y={768} flip z={3}>
            <HeroSeated frame={t} face={FACE} hands="tidy" seat={55} scale={2} reach={Math.sin(t * 0.3) * 6} />
          </At>
        }
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const p = popIn(t, 8 + i * 8);
          return (
            <Center key={i} x={800 + i * 34} y={540} z={4} scale={p}>
              <div style={{ width: 8, height: 64, background: ["#a5594e", "#46566b", "#6b8a74", "#c9a15a", "#7a6a8a"][i], border: "2px solid rgba(11,12,16,0.55)", borderRadius: 3, transform: "rotate(90deg)" }} />
            </Center>
          );
        })}
        <Center x={905} y={528} z={3} rot={-6}>
          <Notebook w={150} />
        </Center>
      </DeskScene>
      <DayHud base={BASE.T5} t={t} />
    </>
  );
};

// T6 DAY 9: laptop rabbit hole
export const T6: React.FC = () => {
  const t = useT();
  return (
    <>
      <DeskScene
        t={t}
        cam={[{ f: 0, z: 1.2, ox: 56, oy: 50 }, { f: 90, z: 1.5, ox: 56, oy: 40 }]}
        hero={
          <At x={1075} y={768} flip z={3}>
            <HeroSeated frame={t} face={TIRED} hands="type" seat={55} scale={2} slouch={0.3} />
          </At>
        }
      >
        <Center x={905} y={500} z={2}>
          <div style={{ width: 170, height: 108, background: "#1b1d23", border: "4px solid #0b0c10", borderRadius: 6, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: 8 }}>
            {["#a5594e", "#46566b", "#6b8a74", "#c9a15a", "#7a6a8a", "#5b7f95"].map((c, i) => (
              <div key={i} style={{ background: c, borderRadius: 3, opacity: 0.9 }} />
            ))}
          </div>
        </Center>
      </DeskScene>
      <DayHud base={BASE.T6} t={t} />
      <Caption text="You're not ready." start={28} end={84} t={t} color={BRICK} />
    </>
  );
};

// T7 DAY 11: MONDAY sticky
export const T7: React.FC = () => {
  const t = useT();
  const cells: CellState[] = Array.from({ length: 35 }, (_, i) => (i < 11 && t < 8 + i * 3 ? "sticky" : "empty"));
  const letters = Math.floor(lerp(t, 0, 6, 46, 66, theme.ease.out));
  const pop = popIn(t, 44);
  return (
    <>
      <Stage plate="plates/desk-day.jpeg" cam={[{ f: 0, z: 1.6, ox: 42, oy: 26 }, { f: 90, z: 1.7, ox: 42, oy: 26 }]}>
        <Center x={800} y={275}>
          <WallCalendar w={330} cells={cells} label="" />
        </Center>
        <Center x={880} y={250} z={4} scale={pop} rot={-3}>
          <Sticky text={"MONDAY".slice(0, letters)} w={120} color="#d9c98a" />
        </Center>
        <At x={1075} y={768} flip z={3}>
          <HeroSeated frame={t} face={{ lid: 0.5 }} hands="write" seat={55} scale={2} />
        </At>
      </Stage>
      <DayHud base={BASE.T7} t={t} />
    </>
  );
};

// T8 bedroom night DAY 14: stickies on the wall
export const T8: React.FC = () => {
  const t = useT();
  return (
    <>
      <Stage plate="plates/bedroom-night.jpeg" cam={[{ f: 0, z: 1.0, ox: 62, oy: 62 }, { f: 90, z: 1.28, ox: 58, oy: 36 }]}>
        {Array.from({ length: 14 }, (_, i) => {
          const p = popIn(t, 6 + i * 5);
          return (
            <Center key={i} x={820 + (i % 7) * 78} y={250 + Math.floor(i / 7) * 82} z={2} scale={p} rot={((i * 53) % 9) - 4}>
              <Sticky text="TOMORROW" w={66} />
            </Center>
          );
        })}
        <At x={1584} y={656} rot={27} z={3}>
          <HeroLying frame={t} face={{ lid: 0.18 }} blanket scale={1.7} />
        </At>
      </Stage>
      <DayHud base={BASE.T8} t={t} />
    </>
  );
};

// T9 DAY 23
export const T9: React.FC = () => {
  const t = useT();
  const vs = lerp(t, 1.2, 1.45, 0, 120);
  return (
    <>
      <DeskScene
        t={t}
        cam={[{ f: 0, z: 1.15, ox: 55, oy: 52 }, { f: 120, z: 1.28, ox: 55, oy: 50 }]}
        hero={
          <At x={1075} y={768} flip z={3}>
            <HeroSeated frame={t} face={{ lid: 0.66 }} hands="lap" seat={55} scale={2} slouch={0.8} lean={5} />
          </At>
        }
      >
        {Array.from({ length: 30 }, (_, i) => {
          const p = popIn(t, i * 2);
          const a = (i * 137.5 * Math.PI) / 180;
          const r = 8 + (i % 6) * 8;
          return (
            <Center key={i} x={905 + Math.cos(a) * r * 1.6} y={520 + Math.sin(a) * r * 0.5} z={3 + (i % 5)} scale={p} rot={((i * 41) % 40) - 20}>
              <Sticky text="TOMORROW" w={78} />
            </Center>
          );
        })}
        <At x={1260} y={790} z={2}>
          <Villain frame={t} scale={vs} kind="hoodie" reach={{ x: (1075 - 1260) / vs, y: (474 - 790) / vs, side: "left" }} />
        </At>
      </DeskScene>
      <DayHud base={BASE.T9} t={t} />
      <Caption text="Tomorrow." start={36} end={110} t={t} color={BRICK} />
    </>
  );
};

// T10 living room DAY 40: villain tucks a blanket
export const T10: React.FC = () => {
  const t = useT();
  const blanket = popIn(t, 44);
  return (
    <>
      <Stage plate={LIVING} cam={[{ f: 0, z: 1.3, ox: 58, oy: 66 }, { f: 120, z: 1.0, ox: 55, oy: 60 }]}>
        <At x={1186} y={910} flip z={3}>
          <HeroSeated frame={t} face={{ lid: 0.2, asleep: true }} hands="lap" seat={96} couch scale={2.3} lean={9} slouch={1} blanket={blanket > 0.4} />
        </At>
        <At x={870} y={905} z={2}>
          <Villain frame={t} scale={1.45} kind="hoodie" reach={{ x: 190, y: -85, side: "right" }} />
        </At>
      </Stage>
      <DayHud base={BASE.T10} t={t} />
    </>
  );
};

// =============== T11: the road (52 - 91s) ===============
const NIGHT = "plates/street-night-1080.jpeg";
const SIGN = { x: 1585, y: 478 };
export const T11: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  // pass definitions: [from, to, x0, x1, weather]
  const passes: [number, number, number, number, "none" | "rain" | "leaves" | "snow"][] = [
    [10, 170, 520, 910, "none"],
    [180, 240, 560, 704, "rain"],
    [240, 300, 620, 764, "leaves"],
    [300, 360, 680, 824, "snow"],
    [360, 600, 500, 1130, "snow"],
  ];
  const pass = passes.find((p) => t >= p[0] && t < p[1]);
  let hero: React.ReactNode = null;
  let weather: "none" | "rain" | "leaves" | "snow" = "none";
  let cam = [{ f: 0, z: 1.0, ox: 50, oy: 62 }, { f: 1170, z: 1.1, ox: 50, oy: 62 }];
  const slouch = lerp(t, 0, 1, 690, 745);
  const heroY = 830;
  if (pass) {
    const w = walkAt(t, pass[0], pass[1], pass[2], pass[3], "lin");
    weather = pass[4];
    hero = (
      <At x={w.x} y={heroY} z={3}>
        <Hero frame={t} dist={w.dist} speed={w.speed} slouch={t >= 360 ? lerp(t, 0.1, 0.35, 360, 600) : 0} scale={0.95} character="hoodie" />
      </At>
    );
    if (t >= 360 && t < 600) {
      const vx = w.x + 190;
      hero = (
        <>
          {hero}
          <At x={vx} y={heroY - 4 + Math.sin(t * 0.18) * 3} z={2}>
            <Villain frame={t} scale={0.9} kind="hoodie" />
          </At>
        </>
      );
    }
  } else if (t >= 600 && t < 750) {
    const w = walkAt(t, 600, 690, 760, 900, "out");
    hero = (
      <At x={w.x} y={heroY} z={3}>
        <Hero frame={t} dist={w.dist} speed={w.speed} slouch={slouch} scale={0.95} character="hoodie" />
      </At>
    );
    weather = "snow";
  } else if (t >= 750 && t < 870) {
    // close on face, villain looming
    const z = lerp(t, 1.0, 1.4, 750, 860);
    cam = [{ f: 0, z, ox: 50, oy: 70 }, { f: 1170, z, ox: 50, oy: 70 }];
    hero = (
      <>
        <At x={1010} y={heroY - 4} z={2}>
          <Villain frame={t} scale={1.1} kind="hoodie" reach={{ x: -100, y: -150, side: "left" }} />
        </At>
        <At x={900} y={heroY} z={3}>
          <Hero frame={t} dist={0} speed={0} slouch={1} scale={0.95} character="hoodie" />
        </At>
      </>
    );
    weather = "snow";
  } else if (t >= 870 && t < 990) {
    // look down, tilt to the painted TODAY
    const k = lerp(t, 0, 1, 915, 975);
    cam = [{ f: 0, z: 1 + 0.55 * k, ox: 47, oy: 62 + 33 * k }, { f: 1170, z: 1.55, ox: 47, oy: 95 }];
    cam = [{ f: 0, z: 1 + 0.55 * k, ox: 47, oy: 62 + 33 * k }];
    hero = (
      <At x={900} y={heroY} z={3}>
        <Hero frame={t} dist={0} speed={0} slouch={0.85 + 0.1 * k} scale={0.95} character="hoodie" />
      </At>
    );
  } else if (t >= 990 && t < 1080) {
    const k = lerp(t, 0, 1, 995, 1050);
    cam = [{ f: 0, z: 1.65, ox: 46, oy: 76 }];
    hero = (
      <At x={640} y={880} z={3}>
        <HeroKneel frame={t} face={{ lid: 0.3 }} reach={k} scale={1.25} />
      </At>
    );
  }
  const showToday = t >= 925;
  const todayOp = lerp(t, 0, 0.88, 925, 960);
  const eyes = t >= 1080;
  const open = lerp(t, 0.72, 0.1, 1085, 1135);
  const signScale = 1 / (camScale(t, cam) || 1);
  return (
    <>
      <Stage plate={NIGHT} cam={cam}>
        {t < 1080 && (
          <Center x={SIGN.x} y={SIGN.y} z={1} scale={signScale}>
            <Signpost h={100} />
          </Center>
        )}
        {showToday && (
          <Center x={960} y={905} z={1} opacity={todayOp}>
            <PaintedText text="TODAY" size={150} />
          </Center>
        )}
        {hero}
      </Stage>
      <Weather kind={weather} frame={t} opacity={0.9} />
      {eyes && (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, #1a1d24, #0b0c10 70%)" }}>
          <svg width={1920} height={1080} viewBox="0 0 1920 1080">
            <Defs />
            <g transform="translate(960 560) scale(5.2)">
              <Head cx={0} cy={0} face={{ lid: open, blink: false }} frame={t} look={-4} />
            </g>
          </svg>
        </AbsoluteFill>
      )}
      <DayHud base={BASE.T11} t={t} />
      <Caption text="A year of tomorrows." start={640} end={745} t={t} />
      <Caption text="Come back when you're ready." start={762} end={864} t={t} color={BRICK} />
    </>
  );
};
const camScale = (t: number, cam: { f: number; z: number }[]) => {
  if (cam.length === 1) return cam[0].z;
  return interpolate(t, cam.map((k) => k.f), cam.map((k) => k.z), C);
};

// =============== T12: rewind flashback (91 - 101s) ===============
const FLIPS: [string, string][] = [
  ["Tomorrow.", "Today."],
  ["Just five more minutes.", "That is how years vanish."],
  ["You're not ready.", "Nobody is."],
  ["Rest first.", "Start small."],
  ["Come back when you're ready.", "Ready is a decision."],
];
export const T12: React.FC<{ takes: Record<string, React.FC>; lengths: Record<string, number> }> = ({ takes }) => {
  const t = useT();
  const seg: [keyof typeof takes, number, number][] = [
    ["T10", 119, 2],
    ["T9", 119, 2],
    ["T7", 89, 1.5],
    ["T2", 509, 8],
    ["T1", 239, 4],
  ];
  const i = Math.min(4, Math.floor(t / 60));
  const [key, start, speed] = seg[i];
  const Comp = takes[key as string];
  const src = Math.max(0, start - (t - i * 60) * speed);
  const jit = Math.sin(t * 1.7) * 5;
  return (
    <AbsoluteFill style={{ background: "#0b0c10" }}>
      <AbsoluteFill style={{ filter: "grayscale(0.75) contrast(1.05) brightness(0.8) blur(1.5px)", transform: `translateX(${jit}px)` }}>
        <NoCaptions.Provider value>
          <TimeProvider value={src}>
            <Comp />
          </TimeProvider>
        </NoCaptions.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(8,9,12,0.55)" }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 6px)" }} />
      {FLIPS.map(([r, tr], k) => (
        <FlipLine key={k} red={r} truth={tr} t={t} start={8 + k * 58} dur={k === 4 ? 60 : 56} />
      ))}
    </AbsoluteFill>
  );
};

// =============== T13: desk at dawn (101 - 131s) ===============
const DAWN = "plates/desk-dawn.jpeg";
export const T13: React.FC = () => {
  const t = useT();
  const writing = t >= 120;
  const pages = t < 420 ? 0 : Math.floor(lerp(t, 0, 7, 420, 600));
  const timer = Math.max(0, 120 - Math.round(lerp(t, 0, 120, 120, 300)));
  const vScale = t < 120 ? 1.1 : lerp(t, 1.1, 0.3, 120, 290);
  const vOp = t < 600 ? 1 : lerp(t, 1, 0, 600, 700);
  const text = lerp(t, 0, 1, 130, 420);
  const sunrise = lerp(t, 0, 0.1, 420, 600);
  const cellsProgress = (i: number) => lerp(t, 0, 1, 740 + i * 4, 756 + i * 4, theme.ease.out);
  const inCal = t >= 720;
  const stick = (i: number): CellState => (inCal && t < 740 + i * 4 - 4 ? "sticky" : inCal ? "check" : "empty");
  const cells: CellState[] = Array.from({ length: 35 }, (_, i) => (i < 21 ? stick(i) : "empty"));
  const progress = Array.from({ length: 35 }, (_, i) => (i < 21 ? cellsProgress(i) : 0));
  const cam =
    t < 720
      ? [
          { f: 0, z: 1.15, ox: 55, oy: 58 },
          { f: 120, z: 1.25, ox: 50, oy: 60 },
          { f: 300, z: 1.3, ox: 52, oy: 58 },
          { f: 560, z: 1.18, ox: 55, oy: 55 },
          { f: 719, z: 1.12, ox: 56, oy: 54 },
        ]
      : [{ f: 0, z: 1.55, ox: 44, oy: 26 }];
  const handsMode = t < 120 ? "phone" : t < 600 ? "write" : "lap";
  const lean = t >= 600 ? lerp(t, 0, -10, 600, 640) : 0;
  return (
    <>
      <Stage plate={DAWN} cam={cam}>
        <Center x={800} y={275}>
          <WallCalendar w={330} cells={cells} checkProgress={progress} label="" />
        </Center>
        {t < 720 && (
          <>
            <Center x={905} y={530} z={3}>
              {t < 120 ? <Notebook w={150} /> : <Notebook w={150} open text={text} pages={pages} />}
            </Center>
            {pages > 0 && Array.from({ length: pages }).map((_, i) => <div key={i} />)}
            <Center x={772} y={532} z={3} rot={-8}>
              <div style={{ width: 34, height: 60, background: "#16181e", border: "2px solid #0b0c10", borderRadius: 6 }} />
            </Center>
            <At x={1620} y={775} z={2} opacity={vOp} flip>
              <Villain frame={t} scale={vScale} kind="hoodie" />
            </At>
            <At x={1075} y={768} flip z={4}>
              <HeroSeated
                frame={t}
                face={{ lid: t >= 600 ? 0.25 : 0.32, smile: t >= 600 ? Math.min(1, (t - 600) / 40) : 0 }}
                hands={handsMode}
                seat={55}
                scale={2}
                reach={writing && t < 600 ? Math.sin(t * 0.25) * 10 : 0}
                lean={lean}
              />
            </At>
          </>
        )}
        <AbsoluteFill style={{ background: `linear-gradient(100deg, rgba(255,214,160,${sunrise}), rgba(255,214,160,0) 70%)`, pointerEvents: "none" }} />
      </Stage>
      <DayHud base={BASE.T13} t={t} />
      {t >= 20 && t < 330 && (
        <div style={{ position: "absolute", right: 90, top: 64, padding: "14px 26px 18px", borderRadius: 20, background: "rgba(8,9,12,0.4)", fontFamily: handFont, color: theme.colors.text, opacity: lerp(t, 0, 1, 20, 34) }}>
          <div style={{ fontSize: 30, letterSpacing: 3, opacity: 0.85 }}>TIMER</div>
          <div style={{ fontSize: 58, letterSpacing: 2 }}>{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`}</div>
        </div>
      )}
      <Caption text="Just two minutes." start={20} end={110} t={t} />
      <Caption text="It started small." start={320} end={410} t={t} />
    </>
  );
};

// =============== T14: street at dawn (131 - 146s) ===============
const DAWNST = "plates/street-dawn-1080.jpeg";
export const T14: React.FC = () => {
  const t = useT();
  const w1 = walkAt(t, 0, 180, 420, 880, "inout");
  const w3 = walkAt(t, 300, 450, 880, 1160, "lin");
  const phase3 = t >= 300;
  const w = phase3 ? w3 : w1;
  const z = lerp(t, 1.0, 1.12, 0, 450);
  const yy = phase3 ? lerp(t, 780, 730, 300, 450) : 780;
  const sc = phase3 ? lerp(t, 1.0, 0.62, 300, 450) : 1.0;
  const smile = lerp(t, 0, 1, 215, 250);
  return (
    <>
      <Stage plate={DAWNST} cam={[{ f: 0, z: 1.0, ox: 50, oy: 62 }, { f: 450, z: z + 0.02, ox: 54, oy: 66 }]}>
        <Center x={300} y={488} z={1} scale={0.9}>
          <Signpost h={64} />
        </Center>
        <Center x={880} y={850} z={1}>
          <PaintedText text="TODAY" size={150} opacity={0.8} />
        </Center>
        <At x={Math.max(120, w.x - 520)} y={yy - 2} z={2} opacity={0.9}>
          <Villain frame={t} scale={0.34 * sc} kind="hoodie" />
        </At>
        <At x={w.x} y={yy} z={3}>
          {t >= 180 && t < 300 ? (
            <Hero frame={t} dist={0} speed={0} slouch={0} band={false} scale={1.0} character="hoodie" />
          ) : (
            <Hero frame={t} dist={w.dist} speed={w.speed} slouch={0} scale={sc} character="hoodie" />
          )}
        </At>
        {smile > 0 && t >= 180 && t < 300 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0 }} />
        )}
      </Stage>
      <DayHud base={BASE.T14} t={t} />
      <Caption text="Start for two minutes." start={190} end={290} t={t} bottom={44} />
    </>
  );
};

// =============== T15: end card ===============
export const T15: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const title = spring({ frame: t - 20, fps, config: theme.spring.soft });
  const draw = lerp(t, 0, 1, 60, 110, theme.ease.out);
  const l1 = spring({ frame: t - 110, fps, config: theme.spring.word });
  const l2 = spring({ frame: t - 170, fps, config: theme.spring.word });
  const out = lerp(t, 1, 0, 410, 450);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${theme.colors.inkSoft}, ${theme.colors.ink})`, alignItems: "center", justifyContent: "center", fontFamily: handFont, opacity: out }}>
      <div style={{ textAlign: "center", marginTop: -30 }}>
        <div style={{ fontSize: 150, letterSpacing: 8, color: theme.colors.text, opacity: title, transform: `translateY(${(1 - title) * 26}px) scale(${0.96 + title * 0.04})` }}>PROCRASTINATION</div>
        <svg width={1100} height={30} viewBox="0 0 1100 30" style={{ marginTop: -4 }}>
          <path d="M6 18 Q 140 4 270 16 T 550 14 T 830 16 T 1094 12" stroke={BRICK} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - draw)} />
        </svg>
        <div style={{ marginTop: 48, fontSize: 60, color: theme.colors.text, opacity: l1, transform: `translateY(${(1 - l1) * 14}px)` }}>Tomorrow never comes.</div>
        <div style={{ marginTop: 10, fontSize: 60, color: BRICK, opacity: l2, transform: `translateY(${(1 - l2) * 14}px)` }}>You're standing on today.</div>
      </div>
    </AbsoluteFill>
  );
};
