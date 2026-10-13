import React from "react";
import { AbsoluteFill } from "remotion";
import { Character, Defs } from "./Character";
import { HERO, SHADOW, kneelPose, sitPose, walkPose } from "./rig";

export const RigTest: React.FC = () => {
  const f = 40;
  const items: React.ReactNode[] = [];
  [0, 22, 45, 67].forEach((dist, i) => items.push(<Character key={`w${i}`} pose={walkPose(HERO, { dist, speed: 2.4, frame: f })} d={HERO} kind="hero" frame={f} x={120 + i * 170} y={420} s={1} />));
  [0, 32, 64, 96].forEach((dist, i) => items.push(<Character key={`s${i}`} pose={walkPose(SHADOW, { dist, speed: 3.4, frame: f })} d={SHADOW} kind="shadow" frame={f} x={820 + i * 190} y={420} s={1} />));
  items.push(<Character key="st" pose={walkPose(HERO, { dist: 0, speed: 0, frame: f, slouch: 1 })} d={HERO} kind="hero" frame={f} x={1700} y={420} s={1} face={{ lid: 0.6 }} />);
  items.push(<Character key="sit" pose={sitPose(HERO, { seatH: 54, torso: 14, frame: f, near: { x: 64, y: -103 }, far: { x: 54, y: -101 } })} d={HERO} kind="hero" frame={f} x={160} y={900} s={1.1} />);
  items.push(<Character key="sitL" pose={sitPose(HERO, { seatH: 54, frame: f })} d={HERO} kind="hero" frame={f} x={420} y={900} s={1.1} flip />);
  items.push(<Character key="lie" pose={sitPose(HERO, { seatH: 8, footX: 96, footY: -4, torso: -85, frame: f })} d={HERO} kind="hero" frame={f} x={700} y={900} s={1.1} face={{ asleep: true }} groundShadow={false} />);
  items.push(<Character key="situp" pose={sitPose(HERO, { seatH: 8, footX: 96, footY: -4, torso: -10, frame: f })} d={HERO} kind="hero" frame={f} x={1000} y={900} s={1.1} groundShadow={false} />);
  items.push(<Character key="kn" pose={kneelPose(HERO, 1, f)} d={HERO} kind="hero" frame={f} x={1280} y={900} s={1.1} />);
  items.push(<Character key="vs" pose={sitPose(SHADOW, { seatH: 80, frame: f, torso: 25, near: { x: 70, y: -220 } })} d={SHADOW} kind="shadow" frame={f} x={1600} y={900} s={0.9} />);
  return (
    <AbsoluteFill style={{ background: "#9aa0a8" }}>
      <svg width={1920} height={1080}>
        <Defs />
        <line x1={0} y1={420} x2={1920} y2={420} stroke="#555" />
        <line x1={0} y1={900} x2={1920} y2={900} stroke="#555" />
        {items}
      </svg>
    </AbsoluteFill>
  );
};
