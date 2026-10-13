import React from "react";
import { Dims, Leg, Arm, P, Pose, rot, shoulderOf } from "./rig";

export type Kind = "hero" | "shadow";
export type Face = { lid?: number; blink?: boolean; asleep?: boolean; smile?: number; wide?: boolean };

const INK = "#0b0c10";

type Mat = {
  skin: string;
  hoodA: string;
  hoodB: string;
  sleeve: string;
  sleeveFar: string;
  pants: string;
  pantsFar: string;
  shoe: string;
  shoeFar: string;
  outline: string;
  outlineOp: number;
  hand: string;
  handFar: string;
};
const MAT: Record<Kind, Mat> = {
  hero: {
    skin: "#ead9c4",
    hoodA: "#64798f",
    hoodB: "#475b70",
    sleeve: "#587086",
    sleeveFar: "#435669",
    pants: "#2d3039",
    pantsFar: "#20232a",
    shoe: "#ebe6dc",
    shoeFar: "#c3beb3",
    outline: INK,
    outlineOp: 0.6,
    hand: "#ead9c4",
    handFar: "#cdbca8",
  },
  shadow: {
    skin: "#15161b",
    hoodA: "#1b1d23",
    hoodB: "#101116",
    sleeve: "#17181d",
    sleeveFar: "#0e0f13",
    pants: "#141519",
    pantsFar: "#0d0e11",
    shoe: "#1a1b20",
    shoeFar: "#111216",
    outline: "#7a3530",
    outlineOp: 0.45,
    hand: "#17181d",
    handFar: "#0f1014",
  },
};

const Limb: React.FC<{ pts: P[]; color: string; w: number; m: Mat }> = ({ pts, color, w, m }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  return (
    <g>
      <path d={d} stroke={m.outline} strokeOpacity={m.outlineOp} strokeWidth={w + 4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Shoe: React.FC<{ a: P; th: number; far: boolean; m: Mat; s?: number }> = ({ a, th, far, m, s = 1 }) => (
  <g transform={`translate(${a.x} ${a.y}) rotate(${th}) scale(${s})`}>
    <path d="M-14 8 L-15 -1 Q-14 -9 -4 -9 L5 -9 Q13 -6 19 0 Q25 4 22 8 Z" fill={far ? m.shoeFar : m.shoe} stroke={m.outline} strokeOpacity={m.outlineOp} strokeWidth={2.4} strokeLinejoin="round" />
    <line x1={-14} y1={6} x2={22} y2={6} stroke={INK} strokeOpacity={0.3} strokeWidth={2.4} />
  </g>
);

export const Head: React.FC<{ c: P; d: Dims; kind: Kind; face: Face; frame: number; look: number; band?: boolean }> = ({ c, d, kind, face, frame, look, band }) => {
  const m = MAT[kind];
  const blink = face.blink ?? frame % 157 > 151;
  const lid = face.lid ?? 0.35;
  const ex = c.x + d.headR * 0.32 + look;
  const ey = c.y + 2;
  const spread = d.headR * 0.37;
  return (
    <g>
      <circle cx={c.x - d.hoodR * 0.2} cy={c.y + 1} r={d.hoodR} fill={kind === "hero" ? "url(#hood)" : "url(#hoodS)"} stroke={m.outline} strokeOpacity={m.outlineOp} strokeWidth={3} />
      <circle cx={c.x + 2} cy={c.y} r={d.headR} fill={m.skin} stroke={m.outline} strokeOpacity={m.outlineOp} strokeWidth={3} />
      {kind === "hero" ? (
        [-spread, spread].map((dx) => (
          <g key={dx}>
            {face.asleep ? (
              <path d={`M${ex + dx - 6} ${ey} Q${ex + dx} ${ey + 5} ${ex + dx + 6} ${ey}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
            ) : (
              <>
                <ellipse cx={ex + dx} cy={ey} rx={face.wide ? 6.5 : 5.6} ry={blink ? 1 : face.wide ? 6.5 : 5.6} fill={INK} />
                {!blink && lid > 0 && <rect x={ex + dx - 8.5} y={ey - 8.5} width={17} height={17 * lid} fill={m.skin} />}
              </>
            )}
          </g>
        ))
      ) : (
        [-spread * 0.9, spread * 0.9].map((dx) => <ellipse key={dx} cx={ex + dx} cy={ey - 2} rx={8.5} ry={blink ? 0.8 : 3.4} fill="#9b3a33" opacity={0.92} />)
      )}
      {kind === "hero" && (face.smile ?? 0) > 0.02 && (
        <path d={`M${ex - 9} ${ey + 17} Q${ex} ${ey + 17 + 7 * (face.smile ?? 0)} ${ex + 10} ${ey + 15}`} stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      )}
      {band && <path d={`M${c.x - d.headR * 0.95} ${c.y - d.headR * 0.45} Q${c.x} ${c.y - d.headR * 0.78} ${c.x + d.headR * 0.98} ${c.y - d.headR * 0.42}`} stroke="#8f3a33" strokeWidth={10} fill="none" strokeLinecap="round" />}
    </g>
  );
};

export type CharProps = {
  pose: Pose;
  d: Dims;
  kind: Kind;
  face?: Face;
  frame: number;
  x: number;
  y: number;
  s: number;
  flip?: boolean;
  band?: boolean;
  opacity?: number;
  groundShadow?: boolean;
  hold?: React.ReactNode; // drawn in the near hand (local coords at the hand)
};

export const Defs: React.FC = () => (
  <defs>
    <linearGradient id="hood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#64798f" />
      <stop offset="1" stopColor="#475b70" />
    </linearGradient>
    <linearGradient id="hoodS" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#1d1f25" />
      <stop offset="1" stopColor="#0f1015" />
    </linearGradient>
  </defs>
);

export const Character: React.FC<CharProps> = ({ pose, d, kind, face = {}, frame, x, y, s, flip, band, opacity = 1, groundShadow = true, hold }) => {
  const m = MAT[kind];
  const sh = shoulderOf(d, pose);
  const neckBase = sh;
  const headC = { x: neckBase.x + rot({ x: 6, y: -d.neck }, pose.torso).x, y: neckBase.y + rot({ x: 6, y: -d.neck }, pose.torso).y };
  const [farLeg, nearLeg] = pose.legs;
  const [farArm, nearArm] = pose.arms;
  // far limbs sit slightly behind (3/4 feel) so they are never fully hidden
  const off = (p: P, dx: number): P => ({ x: p.x + dx, y: p.y });
  const shFar = off(sh, -7);
  const shNear = off(sh, 5);
  const hipFar = off(pose.hip, -6);
  const leg = (l: Leg, far: boolean, hip: P) => (
    <g>
      {groundShadow && pose.grounded && <ellipse cx={l.ankle.x + 4} cy={2} rx={20} ry={4} fill="#000" opacity={0.28 * Math.max(0, 1 - l.gap / 26)} />}
      <Limb pts={[hip, l.knee, l.ankle]} color={far ? m.pantsFar : m.pants} w={d.legW} m={m} />
      <Shoe a={l.ankle} th={l.foot} far={far} m={m} />
    </g>
  );
  const arm = (a: Arm, far: boolean, shp: P) => (
    <g>
      <Limb pts={[shp, a.elbow, a.hand]} color={far ? m.sleeveFar : m.sleeve} w={d.armW} m={m} />
      <circle cx={a.hand.x} cy={a.hand.y} r={d.handR} fill={far ? m.handFar : m.hand} stroke={m.outline} strokeOpacity={m.outlineOp * 0.8} strokeWidth={2} />
    </g>
  );
  const W = d.torsoW;
  const hoodFill = kind === "hero" ? "url(#hood)" : "url(#hoodS)";
  return (
    <g opacity={opacity} transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(${pose.hip.x} ${pose.hip.y}) rotate(${pose.rot}) translate(${-pose.hip.x} ${-pose.hip.y})`}>
      {groundShadow && pose.grounded && <ellipse cx={pose.hip.x + 6} cy={3} rx={W * 0.62} ry={6} fill="#000" opacity={0.14} />}
      {leg(farLeg, true, hipFar)}
      {arm(farArm, true, shFar)}
      <g transform={`rotate(${pose.torso} ${pose.hip.x} ${pose.hip.y})`}>
        <rect x={pose.hip.x - W / 2} y={pose.hip.y - d.torsoH - 10} width={W} height={d.torsoH + 20} rx={W * 0.42} fill={hoodFill} stroke={m.outline} strokeOpacity={m.outlineOp} strokeWidth={3} />
        {kind === "hero" && (
          <>
            <path d={`M${pose.hip.x + W * 0.05} ${pose.hip.y - d.torsoH * 0.32} Q${pose.hip.x + W * 0.32} ${pose.hip.y - d.torsoH * 0.36} ${pose.hip.x + W * 0.42} ${pose.hip.y - d.torsoH * 0.22}`} stroke={INK} strokeOpacity={0.3} strokeWidth={2.4} fill="none" />
            <line x1={pose.hip.x + W * 0.22} y1={pose.hip.y - d.torsoH + 4} x2={pose.hip.x + W * 0.24} y2={pose.hip.y - d.torsoH + 26} stroke="#d9d3c6" strokeWidth={2.4} strokeLinecap="round" />
          </>
        )}
      </g>
      <g transform={`rotate(${pose.head} ${neckBase.x} ${neckBase.y})`}>
        <Head c={headC} d={d} kind={kind} face={face} frame={frame} look={pose.look} band={band} />
      </g>
      {leg(nearLeg, false, pose.hip)}
      {arm(nearArm, false, shNear)}
      {hold && <g transform={`translate(${nearArm.hand.x} ${nearArm.hand.y})`}>{hold}</g>}
    </g>
  );
};
