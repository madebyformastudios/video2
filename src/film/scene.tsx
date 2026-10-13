import React, { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";
import { Defs } from "./Character";
import { Light, LightOverlay } from "./sets";

// Time can be overridden (the rewind renders earlier takes with reversed time).
const TimeCtx = createContext<number | null>(null);
export const TimeProvider = TimeCtx.Provider;
export const NoText = createContext<boolean>(false);
export const useT = () => {
  const c = useContext(TimeCtx);
  const f = useCurrentFrame();
  return c ?? f;
};

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (t: number, a: number, b: number, from: number, to: number, ease = theme.ease.inOut) => interpolate(t, [from, to], [a, b], { ...C, easing: ease });

export type Cam = { f: number; x: number; y: number; z: number };
export const camAt = (keys: Cam[], t: number) => {
  if (keys.length === 1) return keys[0];
  const fs = keys.map((k) => k.f);
  const g = (sel: (k: Cam) => number) => interpolate(t, fs, keys.map(sel), { ...C, easing: theme.ease.inOut });
  return { f: t, x: g((k) => k.x), y: g((k) => k.y), z: g((k) => k.z) };
};

export const Scene: React.FC<{ cam: Cam[] | Cam; l: Light; children: React.ReactNode; lights?: React.ReactNode }> = ({ cam, l, children, lights }) => {
  const t = useT();
  const c = Array.isArray(cam) ? camAt(cam, t) : cam;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <Defs />
      <g transform={`translate(960 540) scale(${c.z}) translate(${-c.x} ${-c.y})`}>
        {children}
        <LightOverlay l={l} />
        {lights}
      </g>
    </svg>
  );
};

// distance-based walk along x (no foot sliding: gait phase = distance)
export const walkAt = (t: number, from: number, to: number, x0: number, x1: number, kind: "lin" | "out" | "in" | "inout" = "lin") => {
  const e = (q: number) => (kind === "out" ? 1 - (1 - q) * (1 - q) : kind === "in" ? q * q : kind === "inout" ? q * q * (3 - 2 * q) : q);
  const at = (tt: number) => x0 + (x1 - x0) * e(Math.max(0, Math.min(1, (tt - from) / (to - from))));
  const x = at(t);
  const walking = t >= from && t < to;
  return { x, dist: Math.abs(x - x0), speed: walking ? Math.abs(at(t + 0.5) - at(t - 0.5)) : 0 };
};
