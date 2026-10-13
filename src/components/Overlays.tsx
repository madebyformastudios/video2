import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.06, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
);

export const Grade: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(40,55,80,0.10), rgba(10,12,18,0.12))", mixBlendMode: "multiply", pointerEvents: "none" }} />
);
