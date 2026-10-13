import React from "react";
import { theme } from "../theme";

// Hoodie hero in non-walking poses. Origin (0,0) = ground contact point; +x = facing direction.
const INK = theme.colors.ink;
const SKIN = "#ead9c4";
const PANTS = "#2b2e36";
const PANTS_FAR = "#1f2229";
const SHOE = "#e9e4da";
const SHOE_FAR = "#c9c4ba";
const HOOD_A = "#62778f";
const HOOD_B = "#465a70";
const SLEEVE = "#566a80";
const SLEEVE_FAR = "#44566a";

type P = { x: number; y: number };

const ikArm = (a: P, b: P, l1: number, l2: number, bendDown: boolean): P => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1;
  const d = Math.min(dist, l1 + l2 - 0.5);
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const ux = dx / dist;
  const uy = dy / dist;
  const s = bendDown ? 1 : -1;
  return { x: a.x + ux * x + s * -uy * h * -1, y: a.y + uy * x + s * ux * h * -1 };
};

const Limb: React.FC<{ pts: P[]; color: string; w: number }> = ({ pts, color, w }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  return (
    <g>
      <path d={d} stroke={INK} strokeOpacity={0.55} strokeWidth={w + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Sneaker: React.FC<{ x: number; y: number; angle?: number; far?: boolean }> = ({ x, y, angle = 0, far }) => (
  <g transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M-14 8 L-15 -1 Q-14 -9 -4 -9 L5 -9 Q13 -6 19 0 Q25 4 22 8 Z" fill={far ? SHOE_FAR : SHOE} stroke={INK} strokeOpacity={0.55} strokeWidth={2.2} strokeLinejoin="round" />
    <line x1={-14} y1={6} x2={22} y2={6} stroke={INK} strokeOpacity={0.35} strokeWidth={2.4} />
  </g>
);

export type Face = { lid: number; blink?: boolean; asleep?: boolean; smile?: number };

export const Head: React.FC<{ cx: number; cy: number; face: Face; band?: boolean; frame: number; look?: number }> = ({ cx, cy, face, band, frame, look = 0 }) => {
  const blink = face.blink ?? frame % 150 > 144;
  const eyes = [-15, 15].map((dx) => {
    const x = cx + 14 + dx + look;
    return (
      <g key={dx}>
        {face.asleep ? (
          <path d={`M${x - 6} ${cy + 2} Q${x} ${cy + 7} ${x + 6} ${cy + 2}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        ) : (
          <>
            <ellipse cx={x} cy={cy + 2} rx={5.5} ry={blink ? 1 : 5.5} fill={INK} />
            <rect x={x - 8} y={cy - 6} width={16} height={blink ? 9 : 16 * face.lid} fill={SKIN} />
          </>
        )}
      </g>
    );
  });
  return (
    <g>
      <circle cx={cx - 10} cy={cy} r={50} fill="url(#hh2)" stroke={INK} strokeOpacity={0.6} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={40} fill={SKIN} stroke={INK} strokeOpacity={0.55} strokeWidth={3} />
      {eyes}
      {(face.smile ?? 0) > 0 && (
        <path d={`M${cx + 14} ${cy + 20} Q${cx + 24} ${cy + 20 + 8 * (face.smile ?? 0)} ${cx + 34} ${cy + 18}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      )}
      {band && <path d={`M${cx - 38} ${cy - 18} Q${cx} ${cy - 30} ${cx + 38} ${cy - 18}`} stroke={theme.colors.brickDeep} strokeWidth={10} fill="none" strokeLinecap="round" />}
    </g>
  );
};

export const Defs = () => (
  <defs>
    <linearGradient id="hh2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={HOOD_A} />
      <stop offset="1" stopColor={HOOD_B} />
    </linearGradient>
  </defs>
);

const Svg: React.FC<{ scale: number; children: React.ReactNode; w?: number; h?: number }> = ({ scale, children, w = 480, h = 360 }) => (
  <svg width={w * scale} height={h * scale} viewBox={`${-w / 2} ${-h} ${w} ${h}`} style={{ overflow: "visible" }}>
    <Defs />
    {children}
  </svg>
);

// ---------- Seated ----------
export type Hands = "lap" | "phone" | "write" | "chin" | "tidy" | "type";
type SeatedProps = {
  frame: number;
  face: Face;
  hands: Hands;
  seat?: number; // hip height above ground
  couch?: boolean; // relaxed sofa legs (knee via bend, feet pulled in)
  lean?: number;
  slouch?: number;
  band?: boolean;
  scale?: number;
  reach?: number; // hand target nudge (e.g. writing motion)
  look?: number;
  blanket?: boolean;
};
export const HeroSeated: React.FC<SeatedProps> = ({ frame, face, hands, seat = 50, couch = false, lean = 0, slouch = 0, band, scale = 1, reach = 0, look = 0, blanket }) => {
  const br = Math.sin(frame * 0.06) * 1.2;
  const hip: P = { x: 0, y: -seat };
  const bend = (a: P, b: P): P => {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const L = 0.6 * d;
    const hh = Math.sqrt(Math.max(0, L * L - (d / 2) ** 2));
    return { x: (a.x + b.x) / 2 + (hh * (b.y - a.y)) / d, y: (a.y + b.y) / 2 - (hh * (b.x - a.x)) / d };
  };
  const ankle: P = couch ? { x: 70, y: -8 } : { x: 52, y: -8 };
  const ankleF: P = couch ? { x: 52, y: -8 } : { x: 38, y: -8 };
  const knee: P = couch ? bend(hip, ankle) : { x: 48, y: -seat };
  const kneeF: P = couch ? bend(hip, ankleF) : { x: 40, y: -seat + 2 };
  const sh: P = { x: 0, y: -seat - 100 + slouch * 12 + br * 0.4 };
  const handT: Record<Hands, P> = {
    lap: { x: 40, y: -seat - 12 },
    phone: { x: 56, y: sh.y + 52 },
    write: { x: 96 + reach, y: -seat - 52 },
    chin: { x: 30, y: sh.y - 6 },
    tidy: { x: 100 + reach * 2, y: -seat - 54 + Math.sin(frame * 0.4) * 3 },
    type: { x: 92, y: -seat - 54 + Math.sin(frame * 0.9) * 2.5 },
  };
  const H = handT[hands];
  const el = ikArm(sh, H, 40, 38, true);
  const farH: P = hands === "write" || hands === "tidy" || hands === "type" ? { x: H.x - 14, y: H.y + 2 } : { x: 36, y: -seat - 8 };
  const elF = ikArm(sh, farH, 40, 38, true);
  return (
    <Svg scale={scale}>
      <ellipse cx={30} cy={3} rx={50} ry={7} fill="#000" opacity={0.16} />
      <Limb pts={[hip, kneeF, ankleF]} color={PANTS_FAR} w={16} />
      <Sneaker x={ankleF.x} y={ankleF.y} far />
      <g transform={`rotate(${lean} 0 ${hip.y})`}>
        <Limb pts={[sh, elF, farH]} color={SLEEVE_FAR} w={13} />
        <circle cx={farH.x} cy={farH.y} r={7} fill={SKIN} />
        <rect x={-42} y={sh.y - 6 + br} width={84} height={seat + 100 - 94 + 6} rx={26} fill="url(#hh2)" stroke={INK} strokeOpacity={0.6} strokeWidth={3} />
        <Head cx={8} cy={sh.y - 44 + br} face={face} band={band} frame={frame} look={look} />
        <Limb pts={[sh, el, H]} color={SLEEVE} w={13} />
        <circle cx={H.x} cy={H.y} r={7} fill={SKIN} />
        {hands === "phone" && <rect x={H.x - 4} y={H.y - 24} width={12} height={28} rx={3} fill="#1b1d23" stroke={INK} strokeWidth={2} />}
      </g>
      <Limb pts={[hip, knee, ankle]} color={PANTS} w={16} />
      <Sneaker x={ankle.x} y={ankle.y} />
      {blanket && (
        <path d={`M-18 ${-seat - 8} Q40 ${-seat - 26} 100 ${-seat * 0.55} L112 -4 Q60 10 30 ${-seat * 0.35} Q6 ${-seat * 0.6} -18 ${-seat * 0.7} Z`} fill="#3a475a" stroke={INK} strokeOpacity={0.6} strokeWidth={3} strokeLinejoin="round" />
      )}
    </Svg>
  );
};

// ---------- Lying (bed / couch). Origin: surface under the hips; head at -x. ----------
export const HeroLying: React.FC<{ frame: number; face: Face; blanket?: boolean; phone?: boolean; scale?: number; band?: boolean }> = ({ frame, face, blanket, phone, scale = 1 }) => {
  const br = Math.sin(frame * 0.05) * 1.5;
  return (
    <Svg scale={scale} w={520} h={200}>
      <ellipse cx={0} cy={2} rx={170} ry={6} fill="#000" opacity={0.18} />
      {/* legs */}
      <rect x={0} y={-30 - br * 0.3} width={116} height={28} rx={14} fill={PANTS} stroke={INK} strokeOpacity={0.55} strokeWidth={3} />
      <Sneaker x={116} y={-14} angle={-70} />
      {/* torso */}
      <rect x={-98} y={-44 - br} width={100} height={44 + br} rx={22} fill="url(#hh2)" stroke={INK} strokeOpacity={0.6} strokeWidth={3} />
      {/* head */}
      <g transform="translate(-120 -32) rotate(-90)">
        <Head cx={0} cy={0} face={{ ...face, lid: face.lid }} frame={frame} />
      </g>
      {phone && (
        <g>
          <path d="M-70 -34 L-50 -78 L-40 -80" stroke={SLEEVE} strokeWidth={13} fill="none" strokeLinecap="round" />
          <rect x={-60} y={-98} width={34} height={22} rx={3} fill="#1b1d23" stroke={INK} strokeWidth={2} />
        </g>
      )}
      {blanket && (
        <path d="M-96 -2 Q-98 -50 -60 -56 Q0 -66 60 -52 Q112 -46 126 -2 Z" fill="#3a475a" stroke={INK} strokeOpacity={0.6} strokeWidth={3} />
      )}
    </Svg>
  );
};

// ---------- Kneeling, reaching a hand to the ground ----------
export const HeroKneel: React.FC<{ frame: number; face: Face; reach: number; scale?: number }> = ({ frame, face, reach, scale = 1 }) => {
  const br = Math.sin(frame * 0.06) * 1.2;
  const lean = 12 + reach * 10;
  const hip: P = { x: -6, y: -60 };
  const kneeBack: P = { x: -34, y: -4 }; // knee on the ground
  const kneeFront: P = { x: 40, y: -58 };
  const ankleFront: P = { x: 46, y: -8 };
  const sh: P = { x: -2 + lean * 0.5, y: -150 + reach * 24 + br * 0.4 };
  const hand: P = { x: 74 + reach * 14, y: -6 - (1 - reach) * 22 };
  const el = ikArm(sh, hand, 40, 38, true);
  return (
    <Svg scale={scale}>
      <ellipse cx={10} cy={3} rx={56} ry={7} fill="#000" opacity={0.18} />
      <Limb pts={[hip, kneeBack, { x: -78, y: -10 }]} color={PANTS_FAR} w={16} />
      <Sneaker x={-80} y={-8} angle={-80} far />
      <g transform={`rotate(${lean} ${hip.x} ${hip.y})`}>
        <rect x={-46} y={sh.y - 4 + br} width={84} height={98} rx={26} fill="url(#hh2)" stroke={INK} strokeOpacity={0.6} strokeWidth={3} />
        <Head cx={10 + reach * 4} cy={sh.y - 44 + br} face={face} frame={frame} look={2} />
      </g>
      <Limb pts={[sh, el, hand]} color={SLEEVE} w={13} />
      <circle cx={hand.x} cy={hand.y} r={7} fill={SKIN} />
      <Limb pts={[hip, kneeFront, ankleFront]} color={PANTS} w={16} />
      <Sneaker x={ankleFront.x} y={ankleFront.y} />
    </Svg>
  );
};
