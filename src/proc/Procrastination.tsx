import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SceneFrame, Edge } from "../components/SceneFrame";
import { Grain, Vignette } from "../components/Overlays";
import { theme } from "../theme";
import { BASE, TOTAL as TOTAL_FRAMES, T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15 } from "./takes";

export const PROC_TOTAL = TOTAL_FRAMES;
const none: Edge = { type: "none", frames: 0 };
const black = (n: number): Edge => ({ type: "black", frames: n });

type Take = { key: string; from: number; dur: number; enter: Edge; exit: Edge; C: React.FC };
const registry: Record<string, React.FC> = { T1, T2, T3, T4, T5, T6, T7, T8, T9, T10 };

const takes: Take[] = [
  { key: "T1", from: BASE.T1, dur: 240, enter: black(30), exit: none, C: T1 },
  { key: "T2", from: BASE.T2, dur: 510, enter: none, exit: none, C: T2 },
  { key: "T3", from: BASE.T3, dur: 120, enter: none, exit: none, C: T3 },
  { key: "T4", from: BASE.T4, dur: 90, enter: none, exit: none, C: T4 },
  { key: "T5", from: BASE.T5, dur: 90, enter: none, exit: none, C: T5 },
  { key: "T6", from: BASE.T6, dur: 90, enter: none, exit: none, C: T6 },
  { key: "T7", from: BASE.T7, dur: 90, enter: none, exit: none, C: T7 },
  { key: "T8", from: BASE.T8, dur: 90, enter: { type: "push", frames: 16 }, exit: none, C: T8 },
  { key: "T9", from: BASE.T9, dur: 120, enter: none, exit: black(18), C: T9 },
  { key: "T10", from: BASE.T10, dur: 120, enter: black(18), exit: none, C: T10 },
  { key: "T11", from: BASE.T11, dur: 1170, enter: none, exit: none, C: T11 },
  { key: "T12", from: BASE.T12, dur: 300, enter: { type: "blur", frames: 14 }, exit: none, C: () => <T12 takes={registry} lengths={{}} /> },
  { key: "T13", from: BASE.T13, dur: 900, enter: black(24), exit: black(18), C: T13 },
  { key: "T14", from: BASE.T14, dur: 470, enter: black(18), exit: { type: "blur", frames: 20 }, C: T14 },
  { key: "T15", from: BASE.T15, dur: 450, enter: { type: "blur", frames: 20 }, exit: none, C: T15 },
];

export const Procrastination: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.ink }}>
    {takes.map(({ key, from, dur, enter, exit, C }) => (
      <Sequence key={key} from={from} durationInFrames={dur}>
        <SceneFrame duration={dur} enter={enter} exit={exit}>
          <C />
        </SceneFrame>
      </Sequence>
    ))}
    <Vignette />
    <Grain />
    <Audio src={staticFile("audio/procrastination.wav")} />
  </AbsoluteFill>
);
