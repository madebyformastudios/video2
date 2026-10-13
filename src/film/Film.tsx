import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Grain, Vignette } from "../components/Overlays";
import { theme } from "../theme";
import { BASE, REG, TOTAL, TA, TB, TC, TD1, TD2, TD3, TD4, TE, TF, TG, TH, TI, TJ, TK, TL, TM, TN, TO, TP } from "./takes";

export const FILM_TOTAL = TOTAL;

// Hard cuts everywhere. The only fades: in at the very start, out at the very end.
const order: [keyof typeof BASE, React.FC][] = [
  ["A", TA], ["B", TB], ["C", TC], ["D1", TD1], ["D2", TD2], ["D3", TD3], ["D4", TD4], ["E", TE], ["F", TF], ["G", TG],
  ["H", TH], ["I", TI], ["J", TJ], ["K", TK], ["L", () => <TL reg={REG} />], ["M", TM], ["N", TN], ["O", TO], ["P", TP],
];

const Fade: React.FC = () => {
  const f = useCurrentFrame();
  const o = Math.max(interpolate(f, [0, 30], [1, 0], { extrapolateRight: "clamp" }), interpolate(f, [TOTAL - 45, TOTAL - 1], [0, 1], { extrapolateLeft: "clamp" }));
  return <AbsoluteFill style={{ background: theme.colors.ink, opacity: o, pointerEvents: "none" }} />;
};

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.ink }}>
    {order.map(([k, C], i) => {
      const from = BASE[k];
      const to = i + 1 < order.length ? BASE[order[i + 1][0]] : TOTAL;
      return (
        <Sequence key={k} from={from} durationInFrames={to - from}>
          <C />
        </Sequence>
      );
    })}
    <Vignette />
    <Grain />
    <Fade />
    <Audio src={staticFile("audio/procrastination.wav")} />
  </AbsoluteFill>
);
