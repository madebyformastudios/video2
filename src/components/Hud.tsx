import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { handFont, theme } from "../theme";

export const Hud: React.FC<{ day: string; dayChangedAt: number; t: number; motivation: number; showBar: boolean }> = ({
  day,
  dayChangedAt,
  t,
  motivation,
  showBar,
}) => {
  const k = interpolate(t - dayChangedAt, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.out });
  const fill = interpolateColors(motivation, [0, 40, 100], [theme.colors.brickDeep, theme.colors.gold, theme.colors.gold]);
  return (
    <div style={{ position: "absolute", left: 90, top: 64, padding: "16px 24px 20px", borderRadius: 20, background: "rgba(8,9,12,0.38)", fontFamily: handFont, color: theme.colors.text, textShadow: "none" }}>
      <div style={{ fontSize: 52, letterSpacing: 4, color: theme.colors.gold, opacity: k, transform: `translateY(${(1 - k) * 18}px)` }}>{day}</div>
      {showBar && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 30, letterSpacing: 3, opacity: 0.85 }}>MOTIVATION {Math.round(motivation)}%</div>
          <div style={{ marginTop: 8, width: 380, height: 16, borderRadius: 8, background: theme.colors.track }}>
            <div style={{ width: `${Math.max(0, motivation)}%`, height: "100%", borderRadius: 8, background: fill }} />
          </div>
        </div>
      )}
    </div>
  );
};
