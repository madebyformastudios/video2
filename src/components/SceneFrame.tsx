import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

export type TransitionType = "black" | "blur" | "push" | "iris" | "none";
export type Edge = { type: TransitionType; frames: number };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SceneFrame: React.FC<{ duration: number; enter: Edge; exit: Edge; children: React.ReactNode }> = ({
  duration,
  enter,
  exit,
  children,
}) => {
  const f = useCurrentFrame();
  useVideoConfig();
  const pin = enter.frames ? interpolate(f, [0, enter.frames], [0, 1], { ...clamp, easing: theme.ease.inOut }) : 1;
  const pout = exit.frames ? interpolate(f, [duration - exit.frames, duration], [0, 1], { ...clamp, easing: theme.ease.inOut }) : 0;

  const style: React.CSSProperties = { opacity: 1 };
  const tf: string[] = [];
  const filters: string[] = [];

  if (enter.type === "black" || enter.type === "blur") style.opacity = (style.opacity as number) * pin;
  if (enter.type === "blur") filters.push(`blur(${(1 - pin) * 26}px)`);
  if (enter.type === "push") tf.push(`translateX(${(1 - pin) * 100}%)`);
  if (enter.type === "iris") style.clipPath = `circle(${pin * 78}% at 50% 55%)`;

  if (exit.type === "black" || exit.type === "blur") style.opacity = (style.opacity as number) * (1 - pout);
  if (exit.type === "blur") filters.push(`blur(${pout * 26}px)`);
  if (exit.type === "push") {
    tf.push(`translateX(${-pout * 22}%)`);
    style.opacity = (style.opacity as number) * (1 - pout * 0.5);
  }

  if (tf.length) style.transform = tf.join(" ");
  if (filters.length) style.filter = filters.join(" ");
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
