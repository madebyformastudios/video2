import React from "react";
import { theme } from "../theme";
import { makePose, Pt } from "./Rig";
import { STRIDE } from "../motion";

export type CharacterKind = "blob" | "hoodie";

type Props = {
  frame: number;
  dist: number;
  speed: number;
  slouch: number;
  band?: boolean;
  scale?: number;
  character?: CharacterKind;
};

const { cream, creamShade, ink, brickDeep } = theme.colors;
const C = {
  blob: { skin: cream, limb: creamShade, limbFar: "#b8af99", shoe: "#8a8372", hand: creamShade },
  hoodie: { skin: "#ead9c4", limb: "#566a80", limbFar: "#44566a", shoe: "#e9e4da", hand: "#ead9c4" },
};

const line = (a: Pt, b: Pt, c: Pt, color: string, w: number) => {
  const d = `M${a.x} ${a.y} L${b.x} ${b.y} L${c.x} ${c.y}`;
  return (
    <g>
      <path d={d} stroke={ink} strokeOpacity={0.55} strokeWidth={w + 4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Hero: React.FC<Props> = ({ frame, dist, speed, slouch, band, scale = 1, character = "blob" }) => {
  const pose = makePose(dist, STRIDE, speed, slouch, frame);
  const pal = C[character];
  const blink = frame % 150 > 144;
  const lid = 0.38 + slouch * 0.3;
  const breathe = Math.sin(frame * 0.06) * 1.4;
  const legColor = character === "hoodie" ? "#2b2e36" : undefined;

  const shoeFill = (far: boolean) => (character === "hoodie" ? (far ? "#c9c4ba" : pal.shoe) : far ? "#a69f8b" : pal.shoe);
  const leg = (l: (typeof pose.legs)[number], far: boolean) => (
    <g key={`l${far}`}>
      {/* per-foot contact shadow, fades as the foot lifts */}
      <ellipse cx={l.ankle.x + 4} cy={3} rx={20} ry={4} fill="#000" opacity={0.3 * Math.max(0, 1 - l.gap / 26)} />
      {line(pose.hip, l.knee, l.ankle, legColor ? (far ? "#1f2229" : legColor) : far ? pal.limbFar : pal.limb, 15)}
      {/* side-view sneaker, rotated about the ankle: toe forward, flat sole */}
      <g transform={`translate(${l.ankle.x} ${l.ankle.y}) rotate(${l.angle})`}>
        <path
          d="M-14 8 L-15 -1 Q-14 -9 -4 -9 L5 -9 Q13 -6 19 0 Q25 4 22 8 Z"
          fill={shoeFill(far)}
          stroke={ink}
          strokeOpacity={0.55}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <line x1={-14} y1={6} x2={22} y2={6} stroke={ink} strokeOpacity={0.35} strokeWidth={2.4} />
      </g>
    </g>
  );
  const arm = (a: (typeof pose.arms)[number], far: boolean) => (
    <g key={`a${far}`}>
      {line(pose.shoulder, a.elbow, a.hand, far ? pal.limbFar : pal.limb, 12)}
      <circle cx={a.hand.x} cy={a.hand.y} r={7} fill={pal.hand} />
    </g>
  );

  const farLeg = pose.legs.find((l) => !l.near)!;
  const nearLeg = pose.legs.find((l) => l.near)!;
  const farArm = pose.arms.find((a) => !a.near)!;
  const nearArm = pose.arms.find((a) => a.near)!;

  const eyes = (cx: number, cy: number, spread: number) =>
    [-spread, spread].map((dx) => (
      <g key={dx}>
        <ellipse cx={cx + dx} cy={cy} rx={5.5} ry={blink ? 1 : 5.5} fill={ink} />
        <rect x={cx + dx - 8} y={cy - 8} width={16} height={blink ? 9 : 16 * lid} fill={character === "hoodie" ? pal.skin : "url(#hb)"} />
      </g>
    ));

  return (
    <svg width={190 * scale} height={310 * scale} viewBox="-95 -295 190 305" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="hb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cream} />
          <stop offset="1" stopColor={creamShade} />
        </linearGradient>
        <linearGradient id="hh" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#62778f" />
          <stop offset="1" stopColor="#465a70" />
        </linearGradient>
      </defs>
      <ellipse cx={4} cy={4} rx={46} ry={7} fill="#000" opacity={0.14} />
      {leg(farLeg, true)}
      <g transform={`rotate(${pose.lean} 0 ${pose.hip.y})`}>
        {arm(farArm, true)}
        {character === "blob" ? (
          <g>
            <rect x={-44} y={-262 + pose.bob + breathe} width={88} height={176 - breathe} rx={44} fill="url(#hb)" stroke={ink} strokeOpacity={0.65} strokeWidth={3} />
            <g transform={`translate(0 ${pose.bob})`}>{eyes(14, -196 + breathe, 16)}</g>
            {band && (
              <g transform={`translate(0 ${pose.bob})`}>
                <path d={`M-44 ${-228 + breathe} Q0 ${-238 + breathe} 44 ${-228 + breathe}`} stroke={brickDeep} strokeWidth={12} fill="none" strokeLinecap="round" />
                <path d={`M-42 ${-228 + breathe} q-22 ${6 + Math.sin(frame * 0.22) * 6} -34 ${18 + Math.sin(frame * 0.2 + 1) * 8}`} stroke={brickDeep} strokeWidth={8} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        ) : (
          <g transform={`translate(0 ${pose.bob})`}>
            <circle cx={-2} cy={-236 + breathe} r={50} fill="url(#hh)" stroke={ink} strokeOpacity={0.6} strokeWidth={3} />
            <rect x={-42} y={-196} width={84} height={108} rx={26} fill="url(#hh)" stroke={ink} strokeOpacity={0.6} strokeWidth={3} />
            <circle cx={8} cy={-232 + breathe} r={40} fill={pal.skin} stroke={ink} strokeOpacity={0.55} strokeWidth={3} />
            {eyes(20, -230 + breathe, 15)}
            {band && <path d={`M-30 ${-250 + breathe} Q8 ${-262 + breathe} 46 ${-250 + breathe}`} stroke={brickDeep} strokeWidth={10} fill="none" strokeLinecap="round" />}
          </g>
        )}
        {arm(nearArm, false)}
      </g>
      {leg(nearLeg, false)}
    </svg>
  );
};
