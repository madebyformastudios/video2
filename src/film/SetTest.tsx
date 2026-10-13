import React from "react";
import { AbsoluteFill } from "remotion";
import { Character } from "./Character";
import { HERO, SHADOW, sitPose, walkPose } from "./rig";
import { BEDROOM, BedBlanket, Bedroom, DAWN, DAY, FLOOR, LIVING, LivingBack, LivingLamp, NIGHT, STREET_GROUND, STUDY, Sofa, Street, Study } from "./sets";
import { Scene } from "./scene";
import { CalendarSvg, NotebookSvg } from "./svgprops";

const S = 1.6;
export const SetTest: React.FC<{ which: number }> = ({ which }) => {
  const f = 30;
  const cal = Array.from({ length: 35 }, (_, i) => (i < 5 ? "sticky" : "empty")) as any;
  if (which === 0)
    return (
      <AbsoluteFill>
        <Scene cam={{ f: 0, x: 960, y: 540, z: 1 }} l={DAY}>
          <Study l={DAY} />
          <CalendarSvg x={STUDY.calendar.x} y={STUDY.calendar.y} w={STUDY.calendar.w} cells={cal} />
          <NotebookSvg x={STUDY.notebook.x} y={STUDY.deskTop} open={1} lines={0.5} />
          <Character pose={walkPose(SHADOW, { dist: 0, speed: 0, frame: f })} d={SHADOW} kind="shadow" frame={f} x={300} y={FLOOR} s={S} />
          <Character pose={sitPose(HERO, { seatH: 86 / S, torso: 14, frame: f, near: { x: (1090 - 950) / S, y: -(FLOOR - STUDY.deskTop) / S - 4 }, far: { x: (1090 - 925) / S, y: -(FLOOR - STUDY.deskTop) / S - 3 } })} d={HERO} kind="hero" frame={f} x={STUDY.heroHip.x} y={FLOOR} s={S} flip />
        </Scene>
      </AbsoluteFill>
    );
  if (which === 1)
    return (
      <AbsoluteFill>
        <Scene cam={{ f: 0, x: 960, y: 540, z: 1 }} l={DAWN}>
          <Bedroom l={DAWN} />
          <Character pose={sitPose(HERO, { seatH: 6, footX: 98, footY: -2, torso: -84, frame: f })} d={HERO} kind="hero" frame={f} x={BEDROOM.hip.x} y={BEDROOM.mattress} s={S} flip face={{ asleep: true }} groundShadow={false} />
          <BedBlanket />
        </Scene>
      </AbsoluteFill>
    );
  if (which === 2)
    return (
      <AbsoluteFill>
        <Scene cam={{ f: 0, x: 960, y: 540, z: 1 }} l={NIGHT} lights={<LivingLamp />}>
          <LivingBack l={NIGHT} />
          <Character pose={walkPose(SHADOW, { dist: 0, speed: 0, frame: f, arms: { near: { x: 100, y: -250 } } })} d={SHADOW} kind="shadow" frame={f} x={1350} y={FLOOR} s={S} flip />
          <Sofa />
          <Character pose={sitPose(HERO, { seatH: (FLOOR - LIVING.seat) / S, frame: f, torso: 6, near: { x: 52, y: -150 } })} d={HERO} kind="hero" frame={f} x={LIVING.hip.x} y={FLOOR} s={S} flip face={{ lid: 0.6 }} />
        </Scene>
      </AbsoluteFill>
    );
  const camX = 2000;
  return (
    <AbsoluteFill>
      <Scene cam={{ f: 0, x: camX, y: 540, z: 1 }} l={NIGHT}>
        <Street camX={camX} l={NIGHT} signScreenX={1600} />
        <Character pose={walkPose(SHADOW, { dist: 40, speed: 3.4, frame: f })} d={SHADOW} kind="shadow" frame={f} x={camX - 330} y={STREET_GROUND} s={1.15} />
        <Character pose={walkPose(HERO, { dist: 40, speed: 2.4, frame: f })} d={HERO} kind="hero" frame={f} x={camX - 150} y={STREET_GROUND} s={1.15} />
      </Scene>
    </AbsoluteFill>
  );
};
