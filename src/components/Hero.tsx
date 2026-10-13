import React from "react";
import { theme } from "../theme";

type Props = {
  frame: number;
  walk: number; // 0 = standing, 1 = full walk
  slouch: number; // 0..1
  band?: boolean;
  scale?: number;
};

const { cream, creamShade, ink, brickDeep } = theme.colors;

// Feet sit at (0,0). Facing right, abstract blob character.
export const Hero: React.FC<Props> = ({ frame, walk, slouch, band, scale = 1 }) => {
  const phase = frame * 0.2 * (0.35 + walk * 0.65);
  const swing = Math.sin(phase) * walk;
  const lift = (p: number) => Math.max(0, Math.cos(p)) * 16 * walk;
  const breathe = Math.sin(frame * 0.06) * 1.6;
  const bob = Math.abs(Math.sin(phase)) * -5 * walk;
  const lean = slouch * 9;
  const blink = frame % 150 > 144;
  const lid = 0.38 + slouch * 0.3;

  return (
    <svg
      width={170 * scale}
      height={300 * scale}
      viewBox="-85 -290 170 300"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="hb" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cream} />
          <stop offset="1" stopColor={creamShade} />
        </linearGradient>
      </defs>
      <ellipse cx={0} cy={4} rx={54} ry={9} fill="#000" opacity={0.35} />
      {/* legs */}
      <g stroke={creamShade} strokeWidth={15} strokeLinecap="round" fill="none">
        <line x1={-14} y1={-92} x2={-14 + swing * 30} y2={-lift(phase + Math.PI)} />
        <line x1={14} y1={-92} x2={14 - swing * 30} y2={-lift(phase)} />
      </g>
      <g transform={`translate(0 ${bob + breathe * 0.3}) rotate(${lean} 0 -90)`}>
        {/* back arm */}
        <line x1={-38} y1={-185} x2={-44 - swing * 14} y2={-110 + slouch * 14} stroke={creamShade} strokeWidth={12} strokeLinecap="round" />
        {/* body */}
        <rect x={-44} y={-262 + breathe} width={88} height={176 - breathe} rx={44} fill="url(#hb)" stroke={ink} strokeOpacity={0.65} strokeWidth={3} />
        {/* face */}
        <g transform="translate(7 0)">
          {[-17, 17].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={-196 + breathe} rx={6} ry={blink ? 1 : 6} fill={ink} />
              <rect x={x - 8} y={-204 + breathe} width={16} height={blink ? 9 : 16 * lid} fill="url(#hb)" />
            </g>
          ))}
        </g>
        {band && (
          <g>
            <path d={`M-44 ${-228 + breathe} Q0 ${-238 + breathe} 44 ${-228 + breathe}`} stroke={brickDeep} strokeWidth={12} fill="none" strokeLinecap="round" />
            <path
              d={`M-42 ${-228 + breathe} q-22 ${6 + Math.sin(frame * 0.22) * 6} -34 ${18 + Math.sin(frame * 0.2 + 1) * 8}`}
              stroke={brickDeep}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
        {/* front arm */}
        <line x1={38} y1={-185} x2={44 + swing * 14} y2={-110 + slouch * 14} stroke={creamShade} strokeWidth={12} strokeLinecap="round" />
      </g>
    </svg>
  );
};
