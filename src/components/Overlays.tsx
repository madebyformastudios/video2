import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

// Pre-rendered noise image (no per-frame SVG filter, no blend modes): cheap in software rendering.
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2) % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.05, overflow: "hidden" }}>
      <Img src={staticFile("grain.png")} style={{ position: "absolute", left: -(k * 37), top: -(k * 23), width: 1920 + 400, height: 1080 + 300 }} />
    </AbsoluteFill>
  );
};

// Grade + vignette in one plain gradient layer.
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(14,18,28,0) 62%, rgba(0,0,0,0.3) 100%)",
      pointerEvents: "none",
    }}
  />
);

export const Grade: React.FC = () => null;
