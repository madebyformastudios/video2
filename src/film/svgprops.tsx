import React from "react";
import { handFont } from "../theme";

const INK = "#0b0c10";
const O = { stroke: INK, strokeOpacity: 0.55, strokeWidth: 2.5, strokeLinejoin: "round" as const };

export const StickySvg: React.FC<{ x: number; y: number; w?: number; rot?: number; text?: string; s?: number }> = ({ x, y, w = 60, rot = 0, text = "TOMORROW", s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-w / 2 + 3} y={-w / 2 + 4} width={w} height={w} fill="#000" opacity={0.18} />
    <rect x={-w / 2} y={-w / 2} width={w} height={w} fill="#d8c88c" {...O} strokeWidth={1.8} />
    <rect x={-w / 2} y={-w / 2} width={w} height={w * 0.16} fill="#cbb978" />
    {text && (
      <text x={0} y={w * 0.08} textAnchor="middle" dominantBaseline="middle" fontFamily={handFont} fontSize={w * (text.length > 6 ? 0.19 : 0.27)} fill="#3b3322">
        {text}
      </text>
    )}
  </g>
);

export type Cell = "empty" | "sticky" | "check";
export const CalendarSvg: React.FC<{ x: number; y: number; w: number; cells: Cell[]; checkP?: number[]; stickyOut?: number[] }> = ({ x, y, w, cells, checkP, stickyOut }) => {
  const h = w * 1.15;
  const top = 40;
  const pad = 12;
  const cw = (w - pad * 2) / 7;
  const ch = (h - top - pad * 2) / 5;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={4} y={6} width={w} height={h} fill="#000" opacity={0.2} rx={6} />
      <rect x={0} y={0} width={w} height={h} fill="#e8e1d1" {...O} rx={6} />
      <path d={`M0 6 Q0 0 6 0 H${w - 6} Q${w} 0 ${w} 6 V${top} H0 Z`} fill="#a65249" {...O} />
      <circle cx={w / 2} cy={-8} r={5} fill="#5b5148" />
      {cells.map((c, i) => {
        const cx = pad + (i % 7) * cw;
        const cy = top + pad + Math.floor(i / 7) * ch;
        const out = stickyOut ? stickyOut[i] ?? 0 : 0;
        const p = checkP ? checkP[i] ?? 0 : c === "check" ? 1 : 0;
        return (
          <g key={i}>
            <rect x={cx + 1} y={cy + 1} width={cw - 2} height={ch - 2} fill="none" stroke={INK} strokeOpacity={0.18} strokeWidth={1.4} />
            {c === "sticky" && out < 1 && (
              <g opacity={1 - out} transform={`translate(${cx + cw / 2 + out * 40} ${cy + ch / 2 - out * 30}) rotate(${((i * 37) % 9) - 4 + out * 40})`}>
                <rect x={-(cw - 8) / 2} y={-(ch - 8) / 2} width={cw - 8} height={ch - 8} fill="#d8c88c" stroke={INK} strokeOpacity={0.35} strokeWidth={1.2} />
              </g>
            )}
            {p > 0 && (
              <path d={`M${cx + cw * 0.2} ${cy + ch * 0.52} L${cx + cw * 0.42} ${cy + ch * 0.74} L${cx + cw * 0.82} ${cy + ch * 0.24}`} stroke="#3f7a5e" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} />
            )}
          </g>
        );
      })}
    </g>
  );
};

// Notebook lying on a desk (side-ish 3/4 view from the front). Anchor = bottom center on the desk top.
export const NotebookSvg: React.FC<{ x: number; y: number; open?: number; lines?: number; color?: string; w?: number }> = ({ x, y, open = 0, lines = 0, color = "#46566b", w = 110 }) => {
  if (open < 0.5)
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-w / 2} y={-14} width={w} height={14} rx={3} fill={color} {...O} />
        <rect x={-w / 2 + 4} y={-8} width={w - 8} height={4} fill="#e8e1d1" opacity={0.85} />
      </g>
    );
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${-w * 0.75} -6 Q${-w * 0.4} -16 0 -10 Q${w * 0.4} -16 ${w * 0.75} -6 L${w * 0.75} 0 L${-w * 0.75} 0 Z`} fill="#ece6d7" {...O} />
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={i} x1={6} y1={-9 + i * 2} x2={6 + (w * 0.6 - 6) * Math.max(0, Math.min(1, lines * 4 - i))} y2={-9 + i * 2} stroke="#3a4152" strokeWidth={1.4} opacity={0.75} />
      ))}
    </g>
  );
};

export const LaptopSvg: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-8} width={140} height={8} rx={2} fill="#3b3f48" {...O} />
    <g transform="translate(-58 -8) rotate(-12)">
      <rect x={0} y={-92} width={112} height={92} rx={4} fill="#22252c" {...O} />
      {["#a5594e", "#46566b", "#6b8a74", "#c9a15a", "#7a6a8a", "#5b7f95"].map((c, i) => (
        <rect key={i} x={8 + (i % 3) * 34} y={-84 + Math.floor(i / 3) * 40} width={28} height={32} rx={3} fill={c} opacity={0.85} />
      ))}
    </g>
  </g>
);

export const PenSvg: React.FC<{ x: number; y: number; color: string; rot?: number }> = ({ x, y, color, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-24} y={-3.5} width={48} height={7} rx={3.5} fill={color} {...O} strokeWidth={1.6} />
    <path d="M24 -3 L31 0 L24 3 Z" fill="#d9d3c6" />
  </g>
);

export const PhoneSvg: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-9} y={-16} width={18} height={32} rx={4} fill="#17191f" {...O} strokeWidth={1.8} />
    <rect x={-6.5} y={-12} width={13} height={22} rx={2} fill="#4c5f78" opacity={0.85} />
  </g>
);

export const AlarmSvg: React.FC<{ x: number; y: number; time: string }> = ({ x, y, time }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-34} y={-38} width={68} height={38} rx={8} fill="#262930" {...O} />
    <text x={0} y={-12} textAnchor="middle" fontFamily="monospace" fontSize={20} fill="#c9695f" letterSpacing={1}>
      {time}
    </text>
  </g>
);

export const SignpostSvg: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-5} y={-150} width={10} height={150} rx={3} fill="#5b4a3a" {...O} />
    <path d="M-70 -150 H58 L74 -132 L58 -114 H-70 Z" fill="#cfc5ae" {...O} />
    <text x={-4} y={-127} textAnchor="middle" fontFamily={handFont} fontSize={22} fill="#3b3322" letterSpacing={1}>
      TOMORROW
    </text>
  </g>
);
