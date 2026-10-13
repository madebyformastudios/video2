import React from "react";
import { theme } from "../theme";

// Black silhouette, subtle brick edge tint, two dim ember eyes. No glow.
export const Villain: React.FC<{ frame: number; scale?: number }> = ({ frame, scale = 1 }) => {
  const sway = Math.sin(frame * 0.04) * 3;
  return (
    <svg width={220 * scale} height={470 * scale} viewBox="-110 -470 220 470" style={{ overflow: "visible" }}>
      <g transform={`rotate(${sway * 0.4} 0 0)`}>
        <rect x={-56} y={-470} width={112} height={380} rx={56} fill="#06070a" stroke={theme.colors.brickDeep} strokeOpacity={0.32} strokeWidth={3} />
        <line x1={-52} y1={-340} x2={-82} y2={-170 + sway} stroke="#06070a" strokeWidth={16} strokeLinecap="round" />
        <line x1={52} y1={-340} x2={82} y2={-170 - sway} stroke="#06070a" strokeWidth={16} strokeLinecap="round" />
        <rect x={-62} y={-130} width={44} height={130} rx={20} fill="#06070a" />
        <rect x={18} y={-130} width={44} height={130} rx={20} fill="#06070a" />
        <ellipse cx={-20} cy={-402} rx={11} ry={4.5} fill={theme.colors.brickDeep} opacity={0.9} />
        <ellipse cx={20} cy={-402} rx={11} ry={4.5} fill={theme.colors.brickDeep} opacity={0.9} />
      </g>
    </svg>
  );
};
