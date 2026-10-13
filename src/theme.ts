import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/PatrickHand";

export const { fontFamily: handFont } = loadFont();

export const theme = {
  colors: {
    ink: "#0b0c10",
    inkSoft: "#15171d",
    cream: "#efe8d8",
    creamShade: "#cfc6b0",
    text: "#f4efe6",
    brick: "#d2635a", // text-safe muted red (>=4.5:1 on ink)
    brickDeep: "#8f3a33", // non-text red (eyes, band, edge tint)
    gold: "#c9a15a",
    steel: "#6f86a0",
    track: "#2a2c33",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    soft: { damping: 22, stiffness: 90, mass: 1 },
    word: { damping: 18, stiffness: 120, mass: 0.7 },
  },
  size: { w: 1920, h: 1080, fps: 30 },
} as const;
