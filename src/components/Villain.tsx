import React from "react";
import { theme } from "../theme";

// Black silhouette, subtle brick edge tint, two dim ember eyes. No glow.
export const Villain: React.FC<{ frame: number; scale?: number; kind?: "blob" | "hoodie" }> = ({ frame, scale = 1, kind = "blob" }) => {
  const sway = Math.sin(frame * 0.04) * 3;
  const edge = { stroke: theme.colors.brickDeep, strokeOpacity: 0.32, strokeWidth: 3 };
  const eye = { fill: theme.colors.brickDeep, opacity: 0.9 };
  if (kind === "hoodie") {
    // tall coat, high collar, brimmed hat
    return (
      <svg width={240 * scale} height={500 * scale} viewBox="-120 -500 240 500" style={{ overflow: "visible" }}>
        <g transform={`rotate(${sway * 0.3} 0 0)`}>
          <path d="M-62 -330 Q-70 -120 -74 0 L74 0 Q70 -120 62 -330 Q40 -372 0 -372 Q-40 -372 -62 -330Z" fill="#06070a" {...edge} />
          <ellipse cx={0} cy={-418} rx={42} ry={50} fill="#06070a" {...edge} />
          <ellipse cx={0} cy={-452} rx={86} ry={11} fill="#06070a" {...edge} />
          <path d="M-48 -452 Q0 -512 48 -452Z" fill="#06070a" {...edge} />
          <ellipse cx={-15} cy={-416} rx={9} ry={3.8} {...eye} />
          <ellipse cx={15} cy={-416} rx={9} ry={3.8} {...eye} />
          <line x1={-56} y1={-310} x2={-86} y2={-150 + sway} stroke="#06070a" strokeWidth={15} strokeLinecap="round" />
          <line x1={56} y1={-310} x2={86} y2={-150 - sway} stroke="#06070a" strokeWidth={15} strokeLinecap="round" />
        </g>
      </svg>
    );
  }
  return (
    <svg width={220 * scale} height={470 * scale} viewBox="-110 -470 220 470" style={{ overflow: "visible" }}>
      <g transform={`rotate(${sway * 0.4} 0 0)`}>
        <rect x={-56} y={-470} width={112} height={380} rx={56} fill="#06070a" {...edge} />
        <line x1={-52} y1={-340} x2={-82} y2={-170 + sway} stroke="#06070a" strokeWidth={16} strokeLinecap="round" />
        <line x1={52} y1={-340} x2={82} y2={-170 - sway} stroke="#06070a" strokeWidth={16} strokeLinecap="round" />
        <rect x={-62} y={-130} width={44} height={130} rx={20} fill="#06070a" />
        <rect x={18} y={-130} width={44} height={130} rx={20} fill="#06070a" />
        <ellipse cx={-20} cy={-402} rx={11} ry={4.5} {...eye} />
        <ellipse cx={20} cy={-402} rx={11} ry={4.5} {...eye} />
      </g>
    </svg>
  );
};
