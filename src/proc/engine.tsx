import React, { createContext, useContext } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// Time can be overridden (rewind flashback renders earlier takes with reversed time).
const TimeCtx = createContext<number | null>(null);
export const TimeProvider = TimeCtx.Provider;
export const NoCaptions = createContext<boolean>(false);
export const useT = () => {
  const c = useContext(TimeCtx);
  const f = useCurrentFrame();
  return c ?? f;
};

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (t: number, a: number, b: number, from: number, to: number, ease = theme.ease.inOut) =>
  interpolate(t, [from, to], [a, b], { ...C, easing: ease });

export type CamKey = { f: number; z: number; ox: number; oy: number };
export const camAt = (keys: CamKey[], t: number) => {
  if (keys.length === 1) return { z: keys[0].z, ox: keys[0].ox, oy: keys[0].oy };
  const f = keys.map((k) => k.f);
  const ease = theme.ease.inOut;
  const g = (sel: (k: CamKey) => number) => interpolate(t, f, keys.map(sel), { ...C, easing: ease });
  return { z: g((k) => k.z), ox: g((k) => k.ox), oy: g((k) => k.oy) };
};

export const Stage: React.FC<{ plate: string; cam: CamKey[]; children?: React.ReactNode; fx?: React.CSSProperties }> = ({ plate, cam, children, fx }) => {
  const t = useT();
  const c = camAt(cam, t);
  return (
    <AbsoluteFill style={{ transform: `scale(${c.z})`, transformOrigin: `${c.ox}% ${c.oy}%`, ...fx }}>
      <Img src={staticFile(plate)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {children}
    </AbsoluteFill>
  );
};

// Anchor by ground point. flip mirrors the content horizontally around the anchor.
export const At: React.FC<{ x: number; y: number; flip?: boolean; rot?: number; z?: number; children: React.ReactNode; opacity?: number; origin?: string }> = ({ x, y, flip, rot = 0, z, children, opacity = 1, origin = "50% 100%" }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      zIndex: z,
      opacity,
      transform: `translate(-50%, -100%) ${flip ? "scaleX(-1)" : ""} rotate(${rot}deg)`,
      transformOrigin: origin,
    }}
  >
    {children}
  </div>
);

// Centered (not bottom-anchored) placement for props.
export const Center: React.FC<{ x: number; y: number; z?: number; scale?: number; rot?: number; opacity?: number; children: React.ReactNode }> = ({ x, y, z, scale = 1, rot = 0, opacity = 1, children }) => (
  <div style={{ position: "absolute", left: x, top: y, zIndex: z, opacity, transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)` }}>{children}</div>
);

export const walkAt = (t: number, from: number, to: number, x0: number, x1: number, kind: "lin" | "out" | "inout" = "lin") => {
  const u = Math.max(0, Math.min(1, (t - from) / (to - from)));
  const e = kind === "out" ? 1 - (1 - u) * (1 - u) : kind === "inout" ? u * u * (3 - 2 * u) : u;
  const x = x0 + (x1 - x0) * e;
  const e2 = (() => {
    const v = Math.max(0, Math.min(1, (t + 0.5 - from) / (to - from)));
    const w = Math.max(0, Math.min(1, (t - 0.5 - from) / (to - from)));
    const f = (q: number) => (kind === "out" ? 1 - (1 - q) * (1 - q) : kind === "inout" ? q * q * (3 - 2 * q) : q);
    return Math.abs(f(v) - f(w)) * (x1 - x0);
  })();
  const walking = t >= from && t < to;
  return { x, dist: x - x0, speed: walking ? e2 : 0, walking };
};

// Seconds -> frames at 30 fps
export const S = (s: number) => Math.round(s * 30);
