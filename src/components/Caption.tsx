import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { handFont, theme } from "../theme";

// Words per line <= 6, 58px on 1080p (5.4% height), warm white on a soft scrim.
export const Caption: React.FC<{ text: string; start: number; end: number; t: number; color?: string }> = ({
  text,
  start,
  end,
  t,
  color = theme.colors.text,
}) => {
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const out = interpolate(t, [end - 10, end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: theme.ease.in });
  const inn = interpolate(t, [start, start + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t < start || t > end) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 118, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ display: "flex", gap: 16, padding: "10px 36px", borderRadius: 24, background: `rgba(8,9,12,${0.38 * inn})` }}>
        {words.map((w, i) => {
          const s = spring({ frame: t - start - i * 4, fps, config: theme.spring.word });
          return (
            <span
              key={i}
              style={{
                fontFamily: handFont,
                fontSize: 58,
                color,
                opacity: s,
                transform: `translateY(${(1 - s) * 16}px)`,
                textShadow: "0 2px 12px rgba(0,0,0,0.65)",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
