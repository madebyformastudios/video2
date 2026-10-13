import React, { useContext } from "react";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { Hud } from "../components/Hud";
import { handFont, theme } from "../theme";
import { FlipLine, Weather } from "../proc/props";
import { Character, Head, Face } from "./Character";
import { HERO, SHADOW, P, kneelPose, rot, shoulderOf, sitPose, standPose, walkPose } from "./rig";
import { BEDROOM, BedBlanket, Bedroom, DAWN, DAY, FLOOR, LIVING, Light, LivingBack, LivingLamp, NIGHT, STREET_GROUND, STUDY, Season, SoftPool, Sofa, Street, Study } from "./sets";
import { Cam, NoText, Scene, TimeProvider, lerp, useT, walkAt } from "./scene";
import { CalendarSvg, Cell, LaptopSvg, NotebookSvg, PenSvg, PhoneSvg, StickySvg } from "./svgprops";

const S = 1.6; // interior character scale
const SS = 1.15; // street character scale
const BRICK = theme.colors.brick;
const SEAT = 86 / S;

export const BASE = { A: 0, B: 240, C: 750, D1: 870, D2: 960, D3: 1050, D4: 1140, E: 1230, F: 1320, G: 1440, H: 1560, I: 2475, J: 2550, K: 2640, L: 2730, M: 3030, N: 3750, O: 3930, P: 4380 };
export const TOTAL = 4830;

// ---------- text helpers (hidden inside the rewind) ----------
const Cap: React.FC<{ text: string; start: number; end: number; t: number; red?: boolean; bottom?: number }> = ({ text, start, end, t, red, bottom }) => {
  const hide = useContext(NoText);
  if (hide) return null;
  return <Caption text={text} start={start} end={end} t={t} color={red ? BRICK : undefined} bottom={bottom} />;
};
const dayAt = (f: number): [string, number] => {
  const tbl: [number, string][] = [
    [240, ""], [685, "DAY 1"], [870, "DAY 2"], [960, "DAY 3"], [1050, "DAY 5"], [1140, "DAY 9"], [1230, "DAY 11"], [1320, "DAY 14"], [1440, "DAY 23"], [1560, "DAY 40"],
    [1740, "DAY 60"], [1800, "DAY 100"], [1860, "DAY 150"], [1920, "DAY 200"],
  ];
  let prev = 0;
  for (const [end, label] of tbl) {
    if (f < end) return [label, prev];
    prev = end;
  }
  if (f < 2160) return [`DAY ${Math.round(lerp(f, 201, 364, 1920, 2160))}`, -999];
  if (f < 2475) return ["DAY 365", 2160];
  if (f < 3030) return ["", 0];
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
const pop = (t: number, at: number) => spring({ frame: t - at, fps: 30, config: { damping: 14, stiffness: 150, mass: 0.6 } });
// world -> character-local (for IK targets). flip = character faces left.
const toLocal = (w: P, origin: P, s: number, flip: boolean): P => ({ x: ((w.x - origin.x) / s) * (flip ? -1 : 1), y: (w.y - origin.y) / s });
const toWorld = (l: P, origin: P, s: number, flip: boolean): P => ({ x: origin.x + l.x * s * (flip ? -1 : 1), y: origin.y + l.y * s });

// ---------- desk hero (study) ----------
const DESK_Y = -(FLOOR - STUDY.deskTop) / S; // desk top in hero-local units
const deskLocal = (wx: number, dy = 0): P => ({ x: (STUDY.heroHip.x - wx) / S, y: DESK_Y - 3 + dy });
const DeskHero: React.FC<{ t: number; torso?: number; head?: number; look?: number; face?: Face; near?: P | "lap"; far?: P | "lap"; hold?: React.ReactNode }> = ({ t, torso = 12, head = 0, look = 0, face, near, far, hold }) => (
  <Character pose={sitPose(HERO, { seatH: SEAT, torso, head, look, frame: t, near, far })} d={HERO} kind="hero" frame={t} x={STUDY.heroHip.x} y={FLOOR} s={S} flip face={face} hold={hold} />
);
const StudyCalendar: React.FC<{ cells: Cell[]; checkP?: number[]; stickyOut?: number[] }> = ({ cells, checkP, stickyOut }) => (
  <CalendarSvg x={STUDY.calendar.x} y={STUDY.calendar.y} w={STUDY.calendar.w} cells={cells} checkP={checkP} stickyOut={stickyOut} />
);
const calCell = (i: number): P => {
  const w = STUDY.calendar.w;
  const h = w * 1.15;
  const cw = (w - 24) / 7;
  const ch = (h - 40 - 24) / 5;
  return { x: STUDY.calendar.x + 12 + (i % 7) * cw + cw / 2, y: STUDY.calendar.y + 40 + 12 + Math.floor(i / 7) * ch + ch / 2 };
};
const cells = (n: number, kind: Cell = "sticky"): Cell[] => Array.from({ length: 35 }, (_, i) => (i < n ? kind : "empty"));

// ====================== A: bedroom, dawn (0-8s) ======================
export const TA: React.FC = () => {
  const t = useT();
  const torso = lerp(t, -84, -6, 112, 150);
  const awake = t > 104;
  const face: Face = awake ? { lid: lerp(t, 0.55, 0.22, 150, 175) } : { asleep: true };
  return (
    <>
      <Scene cam={[{ f: 0, x: 960, y: 540, z: 1 }, { f: 100, x: 1040, y: 560, z: 1.06 }, { f: 240, x: 1360, y: 610, z: 1.5 }]} l={DAWN}>
        <Bedroom l={DAWN} />
        <Character pose={sitPose(HERO, { seatH: 6, footX: 98, footY: -2, torso, head: awake ? -4 : 0, frame: t })} d={HERO} kind="hero" frame={t} x={BEDROOM.hip.x} y={BEDROOM.mattress} s={S} flip face={face} groundShadow={false} />
        <BedBlanket />
      </Scene>
      <Cap text="Today, I start." start={160} end={232} t={t} />
    </>
  );
};

// ====================== B: study, day 1 -> night -> day 2 (8-25s) ======================
export const TB: React.FC = () => {
  const t = useT();
  const night = t < 400 ? 0 : t < 435 ? lerp(t, 0, 1, 400, 425) : lerp(t, 1, 0, 435, 470);
  const l: Light = { night, warm: 0 };
  const open = t >= 30 && t < 330 ? 1 : 0;
  const sIn = walkAt(t, 150, 210, 200, 330, "out");
  const sOut = walkAt(t, 360, 420, 330, 170, "in");
  const leaving = t >= 360;
  const sx = leaving ? sOut.x : sIn.x;
  const sOp = t < 150 ? 0 : t < 165 ? lerp(t, 0, 1, 150, 165) : leaving ? lerp(t, 1, 0, 395, 420) : 1;
  const sPose = (t >= 150 && t < 210) || (t >= 360 && t < 420) ? walkPose(SHADOW, { dist: leaving ? sOut.dist : sIn.dist, speed: leaving ? sOut.speed : sIn.speed, frame: t }) : standPose(SHADOW, { frame: t, torso: 6, head: 8 });
  const stickyOnBook = t >= 345 && t < 440;
  const fly = lerp(t, 0, 1, 440, 478, theme.ease.inOut);
  const nb: P = { x: STUDY.notebook.x, y: STUDY.deskTop - 22 };
  const c0 = calCell(0);
  const flyPos = { x: nb.x + (c0.x - nb.x) * fly, y: nb.y + (c0.y - nb.y) * fly - Math.sin(Math.PI * fly) * 140 };
  const writing = t >= 30 && t < 300;
  const near = writing ? deskLocal(950 + Math.sin(t * 0.18) * 6, -8 + Math.sin(t * 0.3) * 2) : t >= 330 && t < 360 ? deskLocal(955, -18) : deskLocal(965, 0);
  return (
    <>
      <Scene
        cam={[
          { f: 0, x: 920, y: 560, z: 1.15 },
          { f: 120, x: 960, y: 600, z: 1.32 },
          { f: 175, x: 760, y: 560, z: 1.12 },
          { f: 320, x: 800, y: 570, z: 1.14 },
          { f: 400, x: 880, y: 580, z: 1.18 },
          { f: 455, x: 780, y: 430, z: 1.55 },
          { f: 510, x: 780, y: 420, z: 1.65 },
        ]}
        l={l}
      >
        <Study l={l} lamp={night} />
        <StudyCalendar cells={t >= 478 ? cells(1) : cells(0)} />
        <NotebookSvg x={STUDY.notebook.x} y={STUDY.deskTop} open={open} lines={0} />
        {stickyOnBook && <StickySvg x={nb.x} y={nb.y} w={52} rot={-6} s={pop(t, 345)} />}
        {t >= 440 && t < 478 && <StickySvg x={flyPos.x} y={flyPos.y} w={52 - 18 * fly} rot={-6 + 30 * Math.sin(Math.PI * fly)} />}
        {sOp > 0 && <Character pose={sPose} d={SHADOW} kind="shadow" frame={t} x={sx} y={FLOOR} s={S} flip={leaving} opacity={sOp} />}
        <DeskHero t={t} torso={writing ? 14 : 10} head={t > 290 && t < 360 ? -10 : t > 430 ? 10 : 2} look={t > 290 && t < 360 ? 4 : 0} face={{ lid: t < 330 ? 0.2 : t < 420 ? 0.42 : 0.6 }} near={near} far={deskLocal(925, 0)} hold={writing ? <PenSvg x={0} y={-6} color="#3a4152" rot={-60} /> : undefined} />
      </Scene>
      <DayHud base={BASE.B} t={t} />
      <Cap text="Rest first. Start tomorrow." start={178} end={295} t={t} red />
    </>
  );
};

// ====================== C: living room, DAY 2 (25-29s) ======================
const SHOULDER_ON_SOFA = (torso: number): P => {
  const pose = sitPose(HERO, { seatH: (FLOOR - LIVING.seat) / S, torso, frame: 0 });
  const sh = shoulderOf(HERO, pose);
  return toWorld(sh, { x: LIVING.hip.x, y: FLOOR }, S, true);
};
const SofaScene: React.FC<{ t: number; heroTorso: number; heroHead: number; face: Face; phone?: boolean; blanket?: number; shadowTarget: P; shadowTorso: number; cam: Cam[] }> = ({ t, heroTorso, heroHead, face, phone, blanket = 0, shadowTarget, shadowTorso, cam }) => {
  const so = LIVING.shadowAt;
  const sPose = standPose(SHADOW, { frame: t, torso: shadowTorso, head: 14, near: toLocal(shadowTarget, so, S, true) });
  const hand = toWorld(sPose.arms[1].hand, so, S, true);
  return (
    <Scene cam={cam} l={NIGHT} lights={<LivingLamp />}>
      <LivingBack l={NIGHT} />
      <Character pose={sPose} d={SHADOW} kind="shadow" frame={t} x={so.x} y={so.y} s={S} flip groundShadow={false} />
      <Sofa />
      <Character
        pose={sitPose(HERO, { seatH: (FLOOR - LIVING.seat) / S, torso: heroTorso, head: heroHead, frame: t, near: phone ? { x: 50, y: -150 } : "lap", far: phone ? { x: 44, y: -146 } : "lap" })}
        d={HERO}
        kind="hero"
        frame={t}
        x={LIVING.hip.x}
        y={FLOOR}
        s={S}
        flip
        face={face}
        hold={phone ? <PhoneSvg x={4} y={-12} rot={-15} /> : undefined}
      />
      {blanket > 0 && (
        <g transform={`translate(${LIVING.hip.x} ${LIVING.seat}) scale(${blanket})`}>
          <path d="M40 -6 Q-10 -40 -90 -20 Q-150 -6 -170 60 Q-120 90 -40 80 Q20 70 40 -6 Z" fill="#55657a" stroke="#0b0c10" strokeOpacity={0.5} strokeWidth={3} />
        </g>
      )}
      <circle cx={hand.x} cy={hand.y} r={SHADOW.handR * S} fill="#17181d" stroke="#7a3530" strokeOpacity={0.45} strokeWidth={3} />
    </Scene>
  );
};
export const TC: React.FC = () => {
  const t = useT();
  return (
    <>
      <SofaScene t={t} heroTorso={6} heroHead={14} face={{ lid: 0.6 }} phone shadowTarget={SHOULDER_ON_SOFA(6)} shadowTorso={26} cam={[{ f: 0, x: 1180, y: 600, z: 1.3 }, { f: 120, x: 1200, y: 600, z: 1.42 }]} />
      <DayHud base={BASE.C} t={t} />
      <Cap text="Just five more minutes." start={22} end={112} t={t} red />
    </>
  );
};

// ====================== D1-D4: study montage, different framings (29-41s) ======================
const OldPile: React.FC<{ n: number; t?: number; stagger?: boolean }> = ({ n, t = 999, stagger }) => (
  <g>
    <NotebookSvg x={STUDY.notebook.x} y={STUDY.deskTop} />
    {Array.from({ length: n }).map((_, i) => {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 4 + (i % 7) * 5;
      const p = stagger ? pop(t, i * 2) : 1;
      return <StickySvg key={i} x={STUDY.notebook.x + Math.cos(a) * r * 1.6} y={STUDY.deskTop - 24 - (i % 9) * 3 + Math.sin(a) * r * 0.4} w={46} rot={((i * 41) % 40) - 20} s={p} text="" />;
    })}
  </g>
);
export const TD1: React.FC = () => {
  const t = useT();
  const a = pop(t, 16);
  const b = pop(t, 36);
  const reach = t < 30 ? deskLocal(780, -10) : t < 50 ? deskLocal(850, -10) : deskLocal(820 + Math.sin(t * 0.2) * 20, -6);
  return (
    <>
      <Scene cam={{ f: 0, x: 860, y: 640, z: 2.0 }} l={DAY}>
        <Study l={DAY} />
        <OldPile n={5} />
        <g transform={`translate(780 ${STUDY.deskTop}) scale(${a})`}>
          <NotebookSvg x={0} y={0} color="#9a5a48" />
        </g>
        <g transform={`translate(855 ${STUDY.deskTop}) scale(${b})`}>
          <rect x={-30} y={-18} width={60} height={18} rx={3} fill="#c9b48a" stroke="#0b0c10" strokeOpacity={0.5} strokeWidth={2.5} />
        </g>
        <DeskHero t={t} torso={18} face={{ lid: 0.2, smile: 0.6 }} near={reach} far={deskLocal(900, -4)} />
      </Scene>
      <DayHud base={BASE.D1} t={t} />
      <Cap text="Start fresh on Monday." start={20} end={84} t={t} red />
    </>
  );
};
export const TD2: React.FC = () => {
  const t = useT();
  const k = Math.floor(lerp(t, 0, 5, 6, 70, theme.ease.out));
  return (
    <>
      <Scene cam={[{ f: 0, x: 1000, y: 560, z: 1.32 }, { f: 90, x: 990, y: 560, z: 1.38 }]} l={DAY}>
        <Study l={DAY} />
        <StudyCalendar cells={cells(4)} />
        <OldPile n={5} />
        <NotebookSvg x={780} y={STUDY.deskTop} color="#9a5a48" />
        {["#a5594e", "#46566b", "#6b8a74", "#c9a15a", "#7a6a8a"].slice(0, k + 1).map((c, i) => (
          <PenSvg key={i} x={640 + i * 12} y={STUDY.deskTop - 4 - i * 0} color={c} rot={90} />
        ))}
        <DeskHero t={t} torso={20} face={{ lid: 0.32 }} near={deskLocal(650 + k * 12 + Math.sin(t * 0.3) * 8, -6)} far={deskLocal(760, -4)} />
      </Scene>
      <DayHud base={BASE.D2} t={t} />
    </>
  );
};
export const TD3: React.FC = () => {
  const t = useT();
  return (
    <>
      <Scene cam={[{ f: 0, x: 1010, y: 560, z: 2.05 }, { f: 90, x: 1020, y: 556, z: 2.25 }]} l={{ night: 0.25, warm: 0 }}>
        <Study l={{ night: 0.25, warm: 0 }} lamp={0.6} />
        <OldPile n={6} />
        <LaptopSvg x={860} y={STUDY.deskTop} />
        <DeskHero t={t} torso={14} head={6} face={{ lid: 0.62 }} far={{ x: 36, y: -170 }} near={deskLocal(880, -4)} />
      </Scene>
      <DayHud base={BASE.D3} t={t} />
      <Cap text="You're not ready." start={26} end={84} t={t} red />
    </>
  );
};
export const TD4: React.FC = () => {
  const t = useT();
  const out = Array.from({ length: 35 }, (_, i) => (i < 11 ? lerp(t, 0, 1, 6 + i * 3, 16 + i * 3) : 0));
  const letters = Math.floor(lerp(t, 0, 6, 48, 70, theme.ease.out));
  return (
    <>
      <Scene cam={{ f: 0, x: 860, y: 440, z: 1.9 }} l={DAY}>
        <Study l={DAY} />
        <StudyCalendar cells={cells(11)} stickyOut={out} />
        <StickySvg x={850} y={360} w={110} rot={-4} text={"MONDAY".slice(0, letters)} s={pop(t, 44)} />
        <DeskHero t={t} torso={4} head={-16} look={3} face={{ lid: 0.3 }} near="lap" far="lap" />
      </Scene>
      <DayHud base={BASE.D4} t={t} />
    </>
  );
};

// ====================== E: bedroom night, DAY 14 (41-44s) ======================
export const TE: React.FC = () => {
  const t = useT();
  return (
    <>
      <Scene cam={[{ f: 0, x: 1250, y: 640, z: 1.3 }, { f: 90, x: 1120, y: 470, z: 1.42 }]} l={NIGHT}>
        <Bedroom l={NIGHT} time="3:12" />
        {Array.from({ length: 14 }).map((_, i) => (
          <StickySvg key={i} x={880 + (i % 7) * 52} y={360 + Math.floor(i / 7) * 58} w={44} rot={((i * 53) % 9) - 4} s={pop(t, 4 + i * 4)} text="" />
        ))}
        <Character pose={sitPose(HERO, { seatH: 6, footX: 98, footY: -2, torso: -84, head: -6, frame: t })} d={HERO} kind="hero" frame={t} x={BEDROOM.hip.x} y={BEDROOM.mattress} s={S} flip face={{ lid: 0, wide: true }} groundShadow={false} />
        <BedBlanket />
      </Scene>
      <DayHud base={BASE.E} t={t} />
    </>
  );
};

// ====================== F: study dusk, DAY 23 (44-48s) ======================
export const TF: React.FC = () => {
  const t = useT();
  const l: Light = { night: 0.35, warm: 0 };
  const sc = lerp(t, S, S * 1.1, 0, 120);
  const so = { x: 1250, y: FLOOR };
  const heroPose = sitPose(HERO, { seatH: SEAT, torso: 8, head: 20, frame: t, near: "lap", far: "lap" });
  const heroSh = toWorld(shoulderOf(HERO, heroPose), STUDY.heroHip.x ? { x: STUDY.heroHip.x, y: FLOOR } : { x: 0, y: 0 }, S, true);
  const sPose = standPose(SHADOW, { frame: t, torso: 34, head: 16, near: toLocal({ x: heroSh.x + 8, y: heroSh.y + 6 }, so, sc, true) });
  const hand = toWorld(sPose.arms[1].hand, so, sc, true);
  return (
    <>
      <Scene cam={[{ f: 0, x: 1010, y: 560, z: 1.18 }, { f: 120, x: 1040, y: 540, z: 1.32 }]} l={l}>
        <Study l={l} lamp={0.5} />
        <StudyCalendar cells={cells(9)} />
        <OldPile n={30} t={t} stagger />
        <Character pose={sPose} d={SHADOW} kind="shadow" frame={t} x={so.x} y={so.y} s={sc} flip />
        <Character pose={heroPose} d={HERO} kind="hero" frame={t} x={STUDY.heroHip.x} y={FLOOR} s={S} flip face={{ lid: 0.66 }} />
        <circle cx={hand.x} cy={hand.y} r={SHADOW.handR * sc} fill="#17181d" stroke="#7a3530" strokeOpacity={0.45} strokeWidth={3} />
      </Scene>
      <DayHud base={BASE.F} t={t} />
      <Cap text="Tomorrow." start={36} end={110} t={t} red />
    </>
  );
};

// ====================== G: living room, DAY 40 (48-52s) ======================
export const TG: React.FC = () => {
  const t = useT();
  const headTop = toWorld({ x: 6, y: -(FLOOR - LIVING.seat) / S - 96 - 46 - 30 }, { x: LIVING.hip.x, y: FLOOR }, S, true);
  return (
    <>
      <SofaScene t={t} heroTorso={10} heroHead={26} face={{ asleep: true }} blanket={pop(t, 30)} shadowTarget={{ x: headTop.x + 10, y: headTop.y + 40 }} shadowTorso={24} cam={[{ f: 0, x: 1190, y: 600, z: 1.45 }, { f: 120, x: 1050, y: 560, z: 1.06 }]} />
      <DayHud base={BASE.G} t={t} />
    </>
  );
};

// ====================== H: the road, night (52-82.5s) ======================
const heroRoadX = (t: number) => (t < 690 ? 2.4 * t : walkAt(t, 690, 750, 1656, 1716, "out").x);
const shadowRoadX = (t: number) => {
  if (t < 450) return walkAt(t, 360, 450, heroRoadX(360) - 760, heroRoadX(450) - 170, "lin").x;
  return heroRoadX(t) - 170;
};
const seasonAt = (t: number): { season: Season; weather: "none" | "rain" | "leaves" | "snow"; snow: number } => {
  if (t < 180) return { season: "plain", weather: "none", snow: 0 };
  if (t < 240) return { season: "plain", weather: "rain", snow: 0 };
  if (t < 300) return { season: "autumn", weather: "leaves", snow: 0 };
  return { season: "winter", weather: "snow", snow: lerp(t, 0, 1, 300, 340) };
};
export const TH: React.FC = () => {
  const t = useT();
  const hx = heroRoadX(t);
  const hSpeed = Math.abs(heroRoadX(t + 0.5) - heroRoadX(t - 0.5));
  const slouch = t < 360 ? 0 : t < 700 ? lerp(t, 0, 0.3, 360, 600) : lerp(t, 0.3, 1, 700, 760);
  const camFollow = Math.min(hx, 1716) + 220;
  const push = lerp(t, 0, 1, 760, 870);
  const camX = camFollow - push * 260;
  const cam: Cam = { f: t, x: camX, y: 610 + push * 70, z: 1.14 + push * 0.42 };
  const se = seasonAt(t);
  const sx = shadowRoadX(t);
  const sSpeed = Math.abs(shadowRoadX(t + 0.5) - shadowRoadX(t - 0.5));
  const sDist = sx - shadowRoadX(360);
  const heroPose = walkPose(HERO, { dist: hx, speed: hSpeed, frame: t, slouch });
  const look = t >= 870 ? lerp(t, 0, 1, 875, 905) : 0;
  if (look > 0) {
    heroPose.head = 14 + look * 26;
  }
  const heroSh = toWorld(shoulderOf(HERO, heroPose), { x: hx, y: STREET_GROUND }, SS, false);
  const handOn = lerp(t, 0, 1, 790, 830);
  const sPose =
    t < 750
      ? walkPose(SHADOW, { dist: sDist, speed: sSpeed, frame: t, slouch: 0.2 })
      : standPose(SHADOW, { frame: t, torso: 10 + handOn * 18, head: 14, near: handOn > 0 ? (() => {
          const tgt = toLocal({ x: heroSh.x - 6, y: heroSh.y + 4 }, { x: sx, y: STREET_GROUND }, SS, false);
          const rest = { x: 30, y: -150 };
          return { x: rest.x + (tgt.x - rest.x) * handOn, y: rest.y + (tgt.y - rest.y) * handOn };
        })() : undefined });
  return (
    <>
      <Scene cam={cam} l={NIGHT}>
        <Street camX={Math.min(camFollow, 1716 + 220)} l={NIGHT} season={se.season} snow={se.snow} signScreenX={1650} />
        {t >= 360 && <Character pose={sPose} d={SHADOW} kind="shadow" frame={t} x={sx} y={STREET_GROUND} s={SS} />}
        <Character pose={heroPose} d={HERO} kind="hero" frame={t} x={hx} y={STREET_GROUND} s={SS} face={{ lid: lerp(t, 0.35, 0.62, 360, 760) }} />
      </Scene>
      <Weather kind={se.weather} frame={t} opacity={t > 600 ? 0.55 : 0.85} />
      <DayHud base={BASE.H} t={t} />
      <Cap text="A year of tomorrows." start={630} end={745} t={t} />
      <Cap text="Come back when you're ready." start={762} end={866} t={t} red />
    </>
  );
};

// ====================== I: top-down, feet on TODAY (82.5-85s) ======================
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const TI: React.FC = () => {
  const t = useT();
  const z = lerp(t, 1.28, 1.0, 0, 75);
  return (
    <Scene cam={{ f: 0, x: 960, y: 560, z }} l={{ night: 0.6, warm: 0 }}>
      <rect x={-200} y={-200} width={2400} height={1500} fill="#3a3d44" />
      {Array.from({ length: 260 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 1) * 1920} cy={rnd(i, 2) * 1080} r={1 + rnd(i, 3) * 2.5} fill={rnd(i, 4) > 0.5 ? "#4a4e56" : "#2c2f35"} />
      ))}
      <SoftPool cx={1300} cy={420} rx={900} ry={600} op={0.12} />
      <text x={960} y={560} textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize={330} letterSpacing={30} fill="#e7e2d6" opacity={0.86}>
        TODAY
      </text>
      {Array.from({ length: 120 }).map((_, i) => (
        <rect key={i} x={360 + rnd(i, 5) * 1200} y={330 + rnd(i, 6) * 260} width={6 + rnd(i, 7) * 26} height={3 + rnd(i, 8) * 6} fill="#3a3d44" opacity={0.75} transform={`rotate(${rnd(i, 9) * 40 - 20} ${360 + rnd(i, 5) * 1200} ${330 + rnd(i, 6) * 260})`} />
      ))}
      {Array.from({ length: 60 }).map((_, i) => (
        <circle key={i} cx={rnd(i, 11) * 1920} cy={rnd(i, 12) * 1080} r={1.5 + rnd(i, 13) * 2} fill="#eef1f4" opacity={0.6} />
      ))}
      {[880, 1040].map((x, k) => (
        <g key={x} transform={`translate(${x} 790) rotate(${k ? 6 : -6})`}>
          <ellipse cx={4} cy={8} rx={50} ry={92} fill="#000" opacity={0.25} />
          <path d="M0 -86 Q40 -86 44 -30 Q48 40 34 80 Q0 98 -34 80 Q-48 40 -44 -30 Q-40 -86 0 -86 Z" fill="#ebe6dc" stroke="#0b0c10" strokeOpacity={0.55} strokeWidth={4} />
          {[-40, -24, -8].map((y) => (
            <line key={y} x1={-18} y1={y} x2={18} y2={y} stroke="#8d8a82" strokeWidth={4} strokeLinecap="round" />
          ))}
          <path d="M-30 70 Q0 86 30 70" stroke="#c3beb3" strokeWidth={8} fill="none" />
          <rect x={-30} y={96} width={60} height={60} fill="#2d3039" />
        </g>
      ))}
    </Scene>
  );
};

// ====================== J: kneel, touching the road (85-88s) ======================
export const TJ: React.FC = () => {
  const t = useT();
  const reach = lerp(t, 0, 1, 6, 56);
  const hx = 1716;
  return (
    <>
      <Scene cam={{ f: 0, x: hx + 70, y: 760, z: 1.9 }} l={NIGHT}>
        <Street camX={1716 + 220} l={NIGHT} season="winter" snow={1} signScreenX={null} />
        <Character pose={kneelPose(HERO, reach, t)} d={HERO} kind="hero" frame={t} x={hx} y={STREET_GROUND} s={SS} face={{ lid: 0.3 }} />
      </Scene>
      <Weather kind="snow" frame={t + 900} opacity={0.4} />
    </>
  );
};

// ====================== K: eyes close-up (88-91s) ======================
export const TK: React.FC = () => {
  const t = useT();
  const lid = lerp(t, 0.62, 0, 10, 50);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, #1c2029, #0b0c10 72%)" }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="hood" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#64798f" />
            <stop offset="1" stopColor="#475b70" />
          </linearGradient>
        </defs>
        <g transform="translate(960 560) scale(5)">
          <Head c={{ x: -10, y: 0 }} d={HERO} kind="hero" face={{ lid, blink: false, wide: lid < 0.05 }} frame={t} look={-2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ====================== L: the rewind (91-101s) ======================
const FLIPS: [string, string][] = [
  ["Tomorrow.", "Today."],
  ["Just five more minutes.", "That is how years vanish."],
  ["You're not ready.", "Nobody is."],
  ["Rest first.", "Start small."],
  ["Come back when you're ready.", "Ready is a decision."],
];
export const TL: React.FC<{ reg: Record<string, React.FC> }> = ({ reg }) => {
  const t = useT();
  const seg: [string, number, number][] = [
    ["TG", 119, 2],
    ["TF", 119, 2],
    ["TC", 119, 2],
    ["TB", 509, 8],
    ["TA", 239, 4],
  ];
  const i = Math.min(4, Math.floor(t / 60));
  const [key, start, speed] = seg[i];
  const Comp = reg[key];
  const src = Math.max(0, start - (t - i * 60) * speed);
  return (
    <AbsoluteFill style={{ background: "#0b0c10" }}>
      <AbsoluteFill style={{ filter: "grayscale(0.8) brightness(0.75)", transform: `translateX(${Math.sin(t * 1.7) * 4}px)` }}>
        <NoText.Provider value>
          <TimeProvider value={src}>
            <Comp />
          </TimeProvider>
        </NoText.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(8,9,12,0.55)" }} />
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)" }} />
      {FLIPS.map(([r, tr], k) => (
        <FlipLine key={k} red={r} truth={tr} t={t} start={8 + k * 58} dur={k === 4 ? 60 : 56} />
      ))}
    </AbsoluteFill>
  );
};

// ====================== M: study at dawn, the two minutes (101-125s) ======================
export const TM: React.FC = () => {
  const t = useT();
  // in-shot time-lapse 420-600: three quick nights
  const cyc = t >= 420 && t < 600 ? Math.sin(((t - 420) / 60) * Math.PI) ** 2 : 0;
  const l: Light = { night: cyc * 0.85, warm: 1 - cyc };
  const writing = t >= 120 && t < 600;
  const timer = Math.max(0, 120 - Math.round(lerp(t, 0, 120, 120, 300)));
  const stack = t < 440 ? 0 : Math.min(8, Math.floor((t - 440) / 20));
  const sScale = t < 120 ? S : lerp(t, S, S * 0.32, 120, 290);
  const leaving = t >= 640;
  const sw = walkAt(t, 640, 720, 1560, 2100, "in");
  const lean = t >= 600 ? lerp(t, 12, -8, 600, 640) : 12;
  const near = t < 120 ? ({ x: 52, y: -150 } as P) : writing ? deskLocal(950 + Math.sin(t * 0.22) * 8, -8 + Math.sin(t * 0.35) * 2) : ("lap" as const);
  return (
    <>
      <Scene cam={[{ f: 0, x: 960, y: 570, z: 1.18 }, { f: 120, x: 980, y: 600, z: 1.32 }, { f: 300, x: 1080, y: 580, z: 1.22 }, { f: 420, x: 1000, y: 560, z: 1.1 }, { f: 600, x: 1040, y: 560, z: 1.12 }, { f: 720, x: 1060, y: 560, z: 1.2 }]} l={l}>
        <Study l={l} lamp={cyc} />
        <StudyCalendar cells={cells(0)} />
        <NotebookSvg x={STUDY.notebook.x} y={STUDY.deskTop} open={t >= 110 ? 1 : 0} lines={writing ? lerp(t, 0, 1, 130, 420) : t >= 600 ? 1 : 0} />
        {Array.from({ length: stack }).map((_, i) => (
          <rect key={i} x={700} y={STUDY.deskTop - 12 - i * 11} width={110} height={11} rx={2} fill={["#46566b", "#9a5a48", "#6b8a74", "#c9b48a"][i % 4]} stroke="#0b0c10" strokeOpacity={0.5} strokeWidth={2} />
        ))}
        {t >= 110 && <PhoneSvg x={820} y={STUDY.deskTop - 4} rot={90} />}
        <Character pose={leaving ? walkPose(SHADOW, { dist: sw.dist, speed: sw.speed, frame: t }) : standPose(SHADOW, { frame: t, head: 10 })} d={SHADOW} kind="shadow" frame={t} x={leaving ? sw.x : 1560} y={FLOOR} s={sScale} flip={!leaving} opacity={leaving ? lerp(t, 1, 0, 680, 720) : 1} />
        <DeskHero t={t} torso={lean} head={t >= 600 ? -6 : 4} face={{ lid: t >= 600 ? 0.22 : 0.3, smile: t >= 610 ? Math.min(1, (t - 610) / 30) : 0 }} near={near} far={writing ? deskLocal(915, 0) : t < 120 ? { x: 46, y: -146 } : "lap"} hold={t < 120 ? <PhoneSvg x={2} y={-14} rot={-15} /> : writing ? <PenSvg x={0} y={-6} color="#3a4152" rot={-60} /> : undefined} />
      </Scene>
      <DayHud base={BASE.M} t={t} />
      {t >= 20 && t < 330 && (
        <div style={{ position: "absolute", right: 90, top: 64, padding: "14px 26px 18px", borderRadius: 20, background: "rgba(8,9,12,0.42)", fontFamily: handFont, color: theme.colors.text, opacity: t < 34 ? lerp(t, 0, 1, 20, 34) : lerp(t, 1, 0, 316, 330) }}>
          <div style={{ fontSize: 30, letterSpacing: 3, opacity: 0.85 }}>TIMER</div>
          <div style={{ fontSize: 60, letterSpacing: 2 }}>{`${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`}</div>
        </div>
      )}
      <Cap text="Just two minutes." start={20} end={110} t={t} />
      <Cap text="It started small." start={330} end={415} t={t} />
    </>
  );
};

// ====================== N: calendar close-up, the proof (125-131s) ======================
export const TN: React.FC = () => {
  const t = useT();
  const n = 21;
  const out = Array.from({ length: 35 }, (_, i) => (i < n ? lerp(t, 0, 1, 14 + i * 4, 22 + i * 4) : 0));
  const chk = Array.from({ length: 35 }, (_, i) => (i < n ? lerp(t, 0, 1, 20 + i * 4, 32 + i * 4, theme.ease.out) : 0));
  const cl: Cell[] = Array.from({ length: 35 }, (_, i) => (i < n ? (out[i] < 1 ? "sticky" : "check") : "empty"));
  return (
    <Scene cam={{ f: 0, x: 790, y: 410, z: 2.05 }} l={DAWN}>
      <Study l={DAWN} />
      <CalendarSvg x={STUDY.calendar.x} y={STUDY.calendar.y} w={STUDY.calendar.w} cells={cl} stickyOut={out} checkP={chk} />
      {chk.map((p, i) => (p > 0 && out[i] >= 1 ? null : null))}
    </Scene>
  );
};

// ====================== O: street at dawn (131-146s) ======================
const heroDawnX = (t: number) => (t < 170 ? 2.4 * t : t < 300 ? walkAt(t, 170, 190, 408, 428, "out").x : walkAt(t, 300, 450, 428, 788, "lin").x);
export const TO: React.FC = () => {
  const t = useT();
  const hx = heroDawnX(t);
  const sp = Math.abs(heroDawnX(t + 0.5) - heroDawnX(t - 0.5));
  const camX = Math.min(hx, 428) + 240;
  const smile = lerp(t, 0, 1, 200, 230);
  const pose = walkPose(HERO, { dist: hx, speed: sp, frame: t, arms: { near: { x: 16, y: -128 } } });
  const sx = hx - 640;
  return (
    <>
      <Scene cam={{ f: t, x: camX, y: 610, z: 1.14 }} l={DAWN}>
        <Street camX={camX} l={DAWN} season="plain" signScreenX={null} signWorldX={300} />
        <Character pose={walkPose(SHADOW, { dist: sx, speed: sp, frame: t })} d={SHADOW} kind="shadow" frame={t} x={sx} y={STREET_GROUND} s={SS * 0.42} opacity={lerp(t, 0.85, 0, 120, 300)} />
        <Character pose={pose} d={HERO} kind="hero" frame={t} x={hx} y={STREET_GROUND} s={SS} face={{ lid: 0.2, smile: t >= 190 && t < 300 ? smile : 0.4 }} hold={<g transform="rotate(-80)"><rect x={-40} y={-10} width={80} height={16} rx={3} fill="#46566b" stroke="#0b0c10" strokeOpacity={0.5} strokeWidth={2.5} /></g>} />
      </Scene>
      <DayHud base={BASE.O} t={t} />
      <Cap text="Start for two minutes." start={190} end={290} t={t} />
    </>
  );
};

// ====================== P: end card (146-161s) ======================
export const TP: React.FC = () => {
  const t = useT();
  const { fps } = useVideoConfig();
  const title = spring({ frame: t - 20, fps, config: theme.spring.soft });
  const draw = lerp(t, 0, 1, 60, 110, theme.ease.out);
  const l1 = spring({ frame: t - 110, fps, config: theme.spring.word });
  const l2 = spring({ frame: t - 170, fps, config: theme.spring.word });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${theme.colors.inkSoft}, ${theme.colors.ink})`, alignItems: "center", justifyContent: "center", fontFamily: handFont }}>
      <div style={{ textAlign: "center", marginTop: -30 }}>
        <div style={{ fontSize: 150, letterSpacing: 8, color: theme.colors.text, opacity: title, transform: `translateY(${(1 - title) * 26}px) scale(${0.96 + title * 0.04})` }}>PROCRASTINATION</div>
        <svg width={1100} height={30} viewBox="0 0 1100 30" style={{ marginTop: -4 }}>
          <path d="M6 18 Q 140 4 270 16 T 550 14 T 830 16 T 1094 12" stroke={BRICK} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={1200} strokeDashoffset={1200 * (1 - draw)} />
        </svg>
        <div style={{ marginTop: 48, fontSize: 64, color: theme.colors.text, opacity: l1, transform: `translateY(${(1 - l1) * 14}px)` }}>Tomorrow never comes.</div>
        <div style={{ marginTop: 10, fontSize: 64, color: BRICK, opacity: l2, transform: `translateY(${(1 - l2) * 14}px)` }}>You're standing on today.</div>
      </div>
    </AbsoluteFill>
  );
};

export const REG: Record<string, React.FC> = { TA, TB, TC, TF, TG };
void rot;
