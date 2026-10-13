import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { handFont, theme } from "../theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const INK = theme.colors.ink;

// Pastel sticky note (muted yellow), hand-lettered. Anchor = center.
export const Sticky: React.FC<{ text: string; w?: number; rot?: number; color?: string }> = ({ text, w = 120, rot = 0, color = "#d9c98a" }) => (
  <div
    style={{
      width: w,
      height: w,
      background: color,
      transform: `rotate(${rot}deg)`,
      boxShadow: "0 6px 10px rgba(0,0,0,0.25)",
      border: "2px solid rgba(11,12,16,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: handFont,
      fontSize: w * (text.length > 6 ? 0.19 : 0.26),
      color: "#3b3322",
      letterSpacing: 1,
      textAlign: "center",
    }}
  >
    {text}
  </div>
);

// Wall calendar: 5x7 grid, cells can hold a sticky (TOMORROW), a check, or nothing.
export type CellState = "empty" | "sticky" | "check";
export const WallCalendar: React.FC<{ w?: number; cells: CellState[]; checkProgress?: number[]; label?: string }> = ({ w = 300, cells, checkProgress, label = "" }) => {
  const h = w * 1.18;
  const cw = (w - 28) / 7;
  const ch = (h - 74) / 5;
  return (
    <div style={{ width: w, height: h, background: "#e6dfd0", border: "3px solid rgba(11,12,16,0.55)", borderRadius: 8, position: "relative", boxShadow: "0 8px 14px rgba(0,0,0,0.28)", fontFamily: handFont }}>
      <div style={{ height: 40, background: "#a8564c", borderRadius: "5px 5px 0 0", color: "#f4efe6", fontSize: 22, textAlign: "center", lineHeight: "40px", letterSpacing: 3 }}>{label}</div>
      <svg width={w} height={h - 40} style={{ position: "absolute", left: 0, top: 40 }}>
        {cells.map((c, i) => {
          const x = 14 + (i % 7) * cw;
          const y = 16 + Math.floor(i / 7) * ch;
          const p = checkProgress ? checkProgress[i] ?? 0 : c === "check" ? 1 : 0;
          return (
            <g key={i}>
              <rect x={x} y={y} width={cw - 4} height={ch - 4} fill="none" stroke="rgba(11,12,16,0.25)" strokeWidth={1.5} />
              {c === "sticky" && <rect x={x + 3} y={y + 3} width={cw - 10} height={ch - 10} fill="#d9c98a" stroke="rgba(11,12,16,0.35)" strokeWidth={1.5} transform={`rotate(${((i * 37) % 7) - 3} ${x + cw / 2} ${y + ch / 2})`} />}
              {c === "check" && p > 0 && (
                <path d={`M${x + 8} ${y + ch * 0.5} L${x + cw * 0.38} ${y + ch * 0.72} L${x + cw - 12} ${y + ch * 0.2}`} stroke="#3f7a5e" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - p)} />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const Notebook: React.FC<{ w?: number; open?: boolean; text?: number; color?: string; pages?: number }> = ({ w = 150, open = false, text = 0, color = "#46566b", pages = 0 }) => {
  const h = w * 0.7;
  if (!open)
    return (
      <div style={{ width: w * 0.8, height: h * 0.9, background: color, border: "3px solid rgba(11,12,16,0.55)", borderRadius: 5, boxShadow: `0 ${3 + pages}px 0 #2b3646` }} />
    );
  return (
    <div style={{ width: w, height: h, display: "flex", border: "3px solid rgba(11,12,16,0.55)", borderRadius: 5, background: "#e8e1d0", boxShadow: "0 5px 8px rgba(0,0,0,0.25)" }}>
      {[0, 1].map((side) => (
        <div key={side} style={{ flex: 1, padding: 10, borderRight: side === 0 ? "2px solid rgba(11,12,16,0.3)" : "none" }}>
          {side === 1 &&
            [0, 1, 2, 3, 4].map((l) => (
              <div key={l} style={{ height: 3, margin: "9px 0", background: "rgba(40,45,60,0.55)", width: `${Math.max(0, Math.min(1, text * 5 - l)) * 90}%` }} />
            ))}
        </div>
      ))}
    </div>
  );
};

export const AlarmClock: React.FC<{ w?: number; time: string }> = ({ w = 90, time }) => (
  <div style={{ width: w, height: w * 0.6, background: "#23262e", border: "3px solid rgba(11,12,16,0.7)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontSize: w * 0.3, color: "#c9695f", letterSpacing: 2 }}>{time}</div>
);

export const PhoneTimer: React.FC<{ w?: number; label: string; sub?: string }> = ({ w = 230, label, sub }) => (
  <div style={{ width: w, height: w * 1.9, background: "#16181e", border: "4px solid #0b0c10", borderRadius: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: handFont, color: theme.colors.text }}>
    <div style={{ fontSize: w * 0.34, letterSpacing: 2 }}>{label}</div>
    {sub && <div style={{ fontSize: w * 0.12, opacity: 0.8, marginTop: 8 }}>{sub}</div>}
  </div>
);

// Weathered paint lettering lying on the road (perspective via rotateX).
export const PaintedText: React.FC<{ text: string; size: number; opacity?: number }> = ({ text, size, opacity = 0.85 }) => (
  <div style={{ fontFamily: "Impact, 'Arial Black', sans-serif", fontSize: size, letterSpacing: size * 0.08, color: "#e9e4da", opacity, WebkitMaskImage: "repeating-linear-gradient(95deg,#000 0 22px,rgba(0,0,0,0.55) 22px 27px,#000 27px 60px)", maskImage: "repeating-linear-gradient(95deg,#000 0 22px,rgba(0,0,0,0.55) 22px 27px,#000 27px 60px)", transform: "perspective(600px) rotateX(62deg)", transformOrigin: "50% 100%", whiteSpace: "nowrap" }}>{text}</div>
);

export const Signpost: React.FC<{ h?: number }> = ({ h = 90 }) => (
  <svg width={h * 1.1} height={h} viewBox="0 0 110 90" style={{ overflow: "visible" }}>
    <rect x={52} y={22} width={6} height={68} fill="#5b4a3a" stroke={INK} strokeOpacity={0.6} strokeWidth={2} />
    <path d="M6 8 H92 L104 21 L92 34 H6 Z" fill="#cfc5ae" stroke={INK} strokeOpacity={0.65} strokeWidth={2.5} />
    <text x={52} y={26} textAnchor="middle" fontFamily={handFont} fontSize={15} fill="#3b3322" letterSpacing={0.5}>TOMORROW</text>
  </svg>
);

// Weather overlays: rain, falling leaves, snow. Deterministic from frame.
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const Weather: React.FC<{ kind: "rain" | "leaves" | "snow" | "none"; frame: number; opacity?: number }> = ({ kind, frame, opacity = 1 }) => {
  if (kind === "none") return null;
  const n = kind === "rain" ? 90 : kind === "leaves" ? 26 : 70;
  const items = Array.from({ length: n }, (_, i) => {
    const sp = kind === "rain" ? 26 + rnd(i, 1) * 10 : kind === "leaves" ? 3 + rnd(i, 1) * 2.5 : 2.2 + rnd(i, 1) * 1.6;
    const x0 = rnd(i, 2) * 2100 - 100;
    const y = ((frame * sp + rnd(i, 3) * 1300) % 1300) - 110;
    const sway = kind === "rain" ? 0 : Math.sin(frame * 0.04 + i) * (kind === "leaves" ? 60 : 24);
    const x = x0 + sway - (kind === "rain" ? y * 0.12 : 0);
    return { i, x, y, sp };
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      {items.map(({ i, x, y }) =>
        kind === "rain" ? (
          <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 34} stroke="#b9c6d8" strokeOpacity={0.35} strokeWidth={1.8} />
        ) : kind === "leaves" ? (
          <ellipse key={i} cx={x} cy={y} rx={9} ry={5} fill={["#a8643c", "#b98a3e", "#8a4b32"][i % 3]} opacity={0.8} transform={`rotate(${frame * 3 + i * 40} ${x} ${y})`} />
        ) : (
          <circle key={i} cx={x} cy={y} r={2.5 + rnd(i, 4) * 2.5} fill="#f1f4f8" opacity={0.75} />
        ),
      )}
    </svg>
  );
};

// A struck-through villain line replaced by a white truth.
export const FlipLine: React.FC<{ red: string; truth: string; t: number; start: number; dur: number }> = ({ red, truth, t, start, dur }) => {
  const { fps } = useVideoConfig();
  const k = t - start;
  if (k < 0 || k > dur) return null;
  const strike = interpolate(k, [6, 20], [0, 1], { ...C, easing: theme.ease.inOut });
  const redOut = interpolate(k, [18, 28], [1, 0.0], C);
  const truthIn = spring({ frame: k - 22, fps, config: theme.spring.word });
  const out = interpolate(k, [dur - 8, dur], [1, 0], C);
  const inn = interpolate(k, [0, 8], [0, 1], C);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: handFont, opacity: out * inn }}>
      <div style={{ position: "relative", fontSize: 92, color: theme.colors.brick, opacity: redOut }}>
        {red}
        <div style={{ position: "absolute", left: -8, right: -8, top: "54%", height: 6, background: theme.colors.brick, transformOrigin: "left", transform: `scaleX(${strike})`, borderRadius: 3 }} />
      </div>
      <div style={{ fontSize: 100, color: theme.colors.text, marginTop: 14, opacity: truthIn, transform: `translateY(${(1 - truthIn) * 20}px)` }}>{truth}</div>
    </div>
  );
};
