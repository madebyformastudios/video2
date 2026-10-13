import React from "react";
import { interpolateColors } from "remotion";
import { handFont } from "../theme";

// Side-view stage sets drawn in code. World = 1920 x 1080, floor line at y = 860.
export const FLOOR = 860;
const INK = "#0b0c10";
const O = { stroke: INK, strokeOpacity: 0.5, strokeWidth: 3, strokeLinejoin: "round" as const };

export type Light = { night: number; warm: number }; // 0..1 each
export const DAY: Light = { night: 0, warm: 0 };
export const DAWN: Light = { night: 0, warm: 1 };
export const NIGHT: Light = { night: 1, warm: 0 };

const mix = (a: string, b: string, k: number) => interpolateColors(Math.max(0, Math.min(1, k)), [0, 1], [a, b]);
export const skyOf = (l: Light): [string, string] => {
  const top = mix(mix("#9fbad1", "#8a9fbd", l.warm), "#0e1524", l.night);
  const bot = mix(mix("#e4e1d8", "#f0c7a2", l.warm), "#1e283b", l.night);
  return [top, bot];
};

// Overlay that turns a day-painted set into dawn / night. Drawn above set + characters.
export const LightOverlay: React.FC<{ l: Light }> = ({ l }) => (
  <g pointerEvents="none">
    {l.night > 0 && <rect x={-4000} y={-4000} width={12000} height={12000} fill="#0b1020" opacity={0.48 * l.night} />}
    {l.warm > 0 && <rect x={-4000} y={-4000} width={12000} height={12000} fill="#ffb98c" opacity={0.1 * l.warm * (1 - l.night)} />}
  </g>
);

// Soft light falloff (radial gradient, no hard edge, no glow on objects).
export const SoftPool: React.FC<{ cx: number; cy: number; rx: number; ry: number; color?: string; op: number }> = ({ cx, cy, rx, ry, color = "#ffcf96", op }) => {
  const id = `pool${Math.round(cx)}_${Math.round(cy)}_${Math.round(rx)}`;
  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={op} />
          <stop offset="0.55" stopColor={color} stopOpacity={op * 0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </g>
  );
};

// ---------- shared pieces ----------
const Room: React.FC<{ wall: string; wallTop: string; floor: string; id: string }> = ({ wall, wallTop, floor, id }) => (
  <g>
    <defs>
      <linearGradient id={`w${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={wallTop} />
        <stop offset="1" stopColor={wall} />
      </linearGradient>
      <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={floor} />
        <stop offset="1" stopColor={mix(floor, "#000000", 0.25)} />
      </linearGradient>
      <radialGradient id={`v${id}`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.22} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-200} width={2720} height={FLOOR + 200} fill={`url(#w${id})`} />
    <rect x={-400} y={FLOOR} width={2720} height={500} fill={`url(#f${id})`} />
    {[900, 955, 1025].map((y) => (
      <line key={y} x1={-400} y1={y} x2={2320} y2={y} stroke={INK} strokeOpacity={0.16} strokeWidth={2} />
    ))}
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1={i * 190 - 300 + (i % 2) * 60} y1={FLOOR} x2={i * 190 - 300 + (i % 2) * 60} y2={900} stroke={INK} strokeOpacity={0.1} strokeWidth={2} />
    ))}
    <rect x={-400} y={FLOOR - 24} width={2720} height={24} fill="#d6d0c4" {...O} strokeWidth={2} />
  </g>
);

export const Window: React.FC<{ x: number; y: number; w: number; h: number; l: Light; curtains?: string }> = ({ x, y, w, h, l, curtains = "#c7bfb1" }) => {
  const [top, bot] = skyOf(l);
  const id = `sky${x}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="#d8d2c6" {...O} />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} {...O} strokeWidth={2} />
      {l.night > 0.5 && <circle cx={x + w * 0.7} cy={y + h * 0.28} r={18} fill="#e9e6dc" opacity={0.85 * l.night} />}
      {l.night > 0.3 &&
        [0.15, 0.35, 0.55, 0.25, 0.8].map((fx, i) => <circle key={i} cx={x + w * fx} cy={y + h * (0.12 + ((i * 37) % 30) / 100)} r={2} fill="#dfe6f0" opacity={0.7 * l.night} />)}
      <path d={`M${x} ${y + h * 0.78} Q${x + w * 0.3} ${y + h * 0.7} ${x + w * 0.55} ${y + h * 0.76} T${x + w} ${y + h * 0.72} V${y + h} H${x} Z`} fill={mix("#7d8c9c", "#1a2232", l.night)} opacity={0.8} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#d8d2c6" strokeWidth={10} />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#d8d2c6" strokeWidth={10} />
      <rect x={x - 26} y={y + h + 8} width={w + 52} height={16} rx={3} fill="#d8d2c6" {...O} strokeWidth={2} />
      {curtains && (
        <>
          <path d={`M${x - 56} ${y - 30} H${x - 4} V${y + h + 70} Q${x - 30} ${y + h + 80} ${x - 56} ${y + h + 70} Z`} fill={curtains} {...O} strokeWidth={2} />
          <path d={`M${x + w + 4} ${y - 30} H${x + w + 56} V${y + h + 70} Q${x + w + 30} ${y + h + 80} ${x + w + 4} ${y + h + 70} Z`} fill={curtains} {...O} strokeWidth={2} />
          <rect x={x - 70} y={y - 40} width={w + 140} height={10} rx={5} fill="#6f5c4c" />
        </>
      )}
    </g>
  );
};

const Door: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 16} y={300 - 16} width={272} height={FLOOR - 300 + 16} fill="#d8d2c6" {...O} />
    <rect x={x} y={300} width={240} height={FLOOR - 300} fill="#1f232b" />
    <rect x={x} y={300} width={240} height={FLOOR - 300} fill="url(#hall)" />
    <path d={`M${x + 240} ${300} L${x + 292} ${318} L${x + 292} ${FLOOR - 8} L${x + 240} ${FLOOR}`} fill="#8b7866" {...O} />
    <circle cx={x + 280} cy={600} r={5} fill="#c9b48a" />
  </g>
);

const Lamp: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g>
    {on > 0 && <SoftPool cx={x - 40} cy={y + 2} rx={190} ry={30} op={0.35 * on} />}
    <ellipse cx={x} cy={y} rx={26} ry={6} fill="#3f444d" {...O} strokeWidth={2} />
    <path d={`M${x} ${y} L${x - 8} ${y - 70} L${x - 46} ${y - 96}`} stroke="#3f444d" strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d={`M${x - 30} ${y - 120} L${x - 76} ${y - 98} L${x - 58} ${y - 70} Z`} fill="#4b515b" {...O} strokeWidth={2} />
  </g>
);

const Desk: React.FC<{ x0: number; x1: number; top: number }> = ({ x0, x1, top }) => (
  <g>
    <rect x={x0 + 12} y={top + 20} width={20} height={FLOOR - top - 20} fill="#6e5544" {...O} strokeWidth={2} />
    <rect x={x1 - 32} y={top + 20} width={20} height={FLOOR - top - 20} fill="#6e5544" {...O} strokeWidth={2} />
    <rect x={x0 + (x1 - x0) * 0.55} y={top + 20} width={(x1 - x0) * 0.42} height={50} fill="#7d6250" {...O} strokeWidth={2} />
    <rect x={x0 + (x1 - x0) * 0.72} y={top + 42} width={44} height={6} rx={3} fill="#c9b48a" />
    <rect x={x0} y={top} width={x1 - x0} height={22} rx={4} fill="#8c705a" {...O} />
  </g>
);

export const Chair: React.FC<{ x: number; facing: -1 | 1 }> = ({ x, facing }) => {
  // seat front edge at x (towards facing), seat top at FLOOR-86
  const back = x - facing * 116;
  const sx = Math.min(x, back);
  return (
    <g>
      <rect x={back - 6} y={FLOOR - 300} width={13} height={300} rx={5} fill="#7d6250" {...O} strokeWidth={2} />
      <rect x={back - 10} y={FLOOR - 300} width={21} height={18} rx={6} fill="#8c705a" {...O} strokeWidth={2} />
      <rect x={x - 6} y={FLOOR - 76} width={12} height={76} fill="#6e5544" {...O} strokeWidth={2} />
      <rect x={sx} y={FLOOR - 92} width={116} height={16} rx={5} fill="#8c705a" {...O} />
    </g>
  );
};

const Bookshelf: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x} y={540} width={220} height={FLOOR - 540} fill="#7c6250" {...O} />
    {[540 + 100, 540 + 205].map((y) => (
      <rect key={y} x={x + 8} y={y} width={204} height={10} fill="#6a5242" />
    ))}
    {[0, 1, 2].map((row) =>
      Array.from({ length: 7 }).map((_, i) => {
        const h = 62 + ((i * 17 + row * 11) % 24);
        const base = 540 + 100 + row * 105 - 2;
        const cols = ["#a5594e", "#46566b", "#6b8a74", "#c9a15a", "#7a6a8a", "#5b7f95", "#8a7a68"];
        if (row === 2 && i > 4) return null;
        return <rect key={`${row}${i}`} x={x + 14 + i * 27} y={base - h} width={22} height={h} fill={cols[(i + row * 3) % 7]} {...O} strokeWidth={1.5} />;
      }),
    )}
  </g>
);

// ---------- STUDY ----------
export const STUDY = { deskTop: 700, deskX0: 520, deskX1: 1010, chairX: 1030, heroHip: { x: 1090, y: FLOOR - 86 }, calendar: { x: 620, y: 220, w: 300 }, notebook: { x: 940, y: 700 } };
export const Study: React.FC<{ l: Light; lamp?: number }> = ({ l, lamp = 0 }) => (
  <g>
    <defs>
      <linearGradient id="hall" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#161920" />
        <stop offset="1" stopColor="#2c313b" />
      </linearGradient>
    </defs>
    <Room id="st" wall="#b4aea5" wallTop="#c3bdb3" floor="#7c6656" />
    <Door x={140} />
    <Window x={1590} y={210} w={230} h={340} l={l} />
    {l.night < 0.6 && <SoftPool cx={1560} cy={935} rx={420} ry={50} color="#fff4dc" op={0.22 * (1 - l.night)} />}
    <Bookshelf x={1290} />
    <Desk x0={STUDY.deskX0} x1={STUDY.deskX1} top={STUDY.deskTop} />
    <Lamp x={560} y={STUDY.deskTop} on={lamp} />
    <g>
      <rect x={612} y={662} width={30} height={38} rx={4} fill="#5b6b7d" {...O} strokeWidth={2} />
      <line x1={620} y1={662} x2={614} y2={640} stroke="#a5594e" strokeWidth={4} strokeLinecap="round" />
      <line x1={630} y1={662} x2={636} y2={642} stroke="#3a4152" strokeWidth={4} strokeLinecap="round" />
    </g>
    <Chair x={STUDY.chairX} facing={-1} />
  </g>
);

// ---------- BEDROOM ----------
export const BEDROOM = { mattress: 724, bedX0: 1060, bedX1: 1720, hip: { x: 1340, y: 724 }, alarm: { x: 1805, y: 752 } };
export const Bedroom: React.FC<{ l: Light; time?: string }> = ({ l, time = "7:00" }) => (
  <g>
    <Room id="bd" wall="#a7a9ae" wallTop="#b5b7bb" floor="#77634f" />
    <Window x={560} y={220} w={240} h={330} l={l} curtains="#b9b3c0" />
    <Desk x0={110} x1={430} top={700} />
    <rect x={180} y={686} width={90} height={14} rx={3} fill="#46566b" {...O} strokeWidth={2} />
    <rect x={1250} y={360} width={150} height={110} rx={4} fill="#d8d2c6" {...O} />
    <rect x={1264} y={374} width={122} height={82} fill="#8a9bb0" />
    <path d="M1264 456 L1310 410 L1340 436 L1360 418 L1386 456 Z" fill="#5f7187" />
    {/* bed */}
    <rect x={1700} y={560} width={36} height={FLOOR - 560} rx={8} fill="#6f5a4a" {...O} />
    <rect x={1050} y={680} width={30} height={FLOOR - 680} rx={8} fill="#6f5a4a" {...O} />
    <rect x={1064} y={760} width={650} height={40} rx={6} fill="#7d6655" {...O} />
    <rect x={1074} y={722} width={630} height={42} rx={14} fill="#d9d4ca" {...O} />
    <path d="M1588 724 Q1586 692 1630 692 L1680 694 Q1700 700 1696 724 Z" fill="#ece8df" {...O} />
    {/* nightstand + alarm */}
    <rect x={1752} y={752} width={110} height={FLOOR - 752} rx={4} fill="#7c6250" {...O} />
    <rect x={1766} y={782} width={82} height={28} rx={3} fill="#6a5242" />
    <g transform={`translate(${BEDROOM.alarm.x} ${BEDROOM.alarm.y})`}>
      <rect x={-34} y={-38} width={68} height={38} rx={8} fill="#262930" {...O} strokeWidth={2} />
      <text x={0} y={-12} textAnchor="middle" fontFamily="monospace" fontSize={20} fill="#c9695f">
        {time}
      </text>
    </g>
  </g>
);
// Blanket drawn OVER the hero's legs in bed.
export const BedBlanket: React.FC<{ x0?: number; x1?: number }> = ({ x0 = 1084, x1 = 1330 }) => (
  <path d={`M${x0} 764 Q${x0 - 6} 716 ${x0 + 40} 708 Q${(x0 + x1) / 2} 690 ${x1} 706 Q${x1 + 24} 712 ${x1 + 18} 764 Z`} fill="#55657a" {...O} />
);

// ---------- LIVING ROOM ----------
export const LIVING = { seat: 736, hip: { x: 1170, y: 736 }, shadowAt: { x: 1345, y: FLOOR } };
export const LivingBack: React.FC<{ l: Light }> = ({ l }) => (
  <g>
    <Room id="lv" wall="#9c9a98" wallTop="#a8a6a3" floor="#6f5b4a" />
    <Window x={1590} y={220} w={230} h={330} l={l} curtains="#8f8a93" />
    <rect x={190} y={738} width={380} height={122} rx={4} fill="#5d4b3e" {...O} />
    <rect x={232} y={500} width={300} height={196} rx={8} fill="#16181d" {...O} />
    <rect x={364} y={696} width={36} height={42} fill="#2a2d33" />
    <ellipse cx={900} cy={940} rx={520} ry={44} fill="#7f6f62" opacity={0.6} />
    {/* side table + lamp */}
    <rect x={1428} y={742} width={116} height={14} rx={4} fill="#7c6250" {...O} />
    <rect x={1440} y={756} width={12} height={104} fill="#6a5242" />
    <rect x={1520} y={756} width={12} height={104} fill="#6a5242" />
    <path d="M1470 742 Q1462 708 1486 690 Q1510 708 1502 742 Z" fill="#a89a88" {...O} strokeWidth={2} />
    <path d="M1456 690 L1516 690 L1500 626 L1472 626 Z" fill="#e8d8b8" {...O} strokeWidth={2} />
  </g>
);
export const LivingLamp: React.FC = () => (
  <g pointerEvents="none">
    <SoftPool cx={1486} cy={650} rx={300} ry={260} op={0.16} />
    <SoftPool cx={1460} cy={872} rx={340} ry={36} op={0.3} />
  </g>
);
// Sofa facing left. Drawn after the shadow (who stands behind it), before the hero.
export const Sofa: React.FC = () => (
  <g>
    <rect x={1244} y={566} width={110} height={244} rx={40} fill="#5e6a78" {...O} />
    <rect x={880} y={762} width={474} height={60} rx={14} fill="#55606d" {...O} />
    <rect x={896} y={734} width={360} height={40} rx={16} fill="#6b7886" {...O} />
    <rect x={856} y={690} width={78} height={124} rx={34} fill="#626e7c" {...O} />
    <rect x={900} y={820} width={16} height={40} fill="#3e352d" />
    <rect x={1318} y={820} width={16} height={40} fill="#3e352d" />
  </g>
);

// ---------- STREET (parallax) ----------
const h1 = (i: number, s = 1) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export type Season = "plain" | "autumn" | "winter";
export const STREET_GROUND = 878;
export const Street: React.FC<{ camX: number; l: Light; season?: Season; snow?: number; signScreenX?: number | null; signWorldX?: number | null }> = ({ camX, l, season = "plain", snow = 0, signScreenX = null, signWorldX = null }) => {
  const [top, bot] = skyOf(l);
  const layer = (f: number) => camX * (1 - f);
  // far skyline
  const far = [];
  const fw = 260;
  const f0 = Math.floor((camX * 0.15 - 1400) / fw);
  for (let i = f0; i < f0 + 16; i++) {
    const hh = 60 + h1(i, 2) * 90;
    far.push(<rect key={i} x={i * fw} y={620 - hh} width={fw - 30 + h1(i, 3) * 30} height={hh + 120} fill={mix(mix("#8b97a8", "#9b8fa0", l.warm), "#151c2b", l.night)} />);
  }
  // houses
  const houses = [];
  const bw = 560;
  const b0 = Math.floor((camX * 0.5 - 1600) / bw);
  for (let i = b0; i < b0 + 9; i++) {
    const x = i * bw;
    const hw = 330 + h1(i, 4) * 60;
    const hy = 520 + h1(i, 5) * 40;
    const col = ["#9a8e84", "#8b9298", "#a49b8d", "#8f8a93"][Math.floor(h1(i, 6) * 4)];
    const lit = h1(i, 7) > 0.45;
    const treeX = x + hw + 110;
    const leaf = season === "autumn" ? "#a8673e" : season === "winter" ? null : "#5f7a5c";
    houses.push(
      <g key={i}>
        <rect x={x + 40} y={hy} width={hw} height={STREET_GROUND - 18 - hy} fill={col} {...O} />
        <path d={`M${x + 20} ${hy + 4} L${x + 40 + hw / 2} ${hy - 110} L${x + 60 + hw} ${hy + 4} Z`} fill="#5c5650" {...O} />
        {snow > 0 && <path d={`M${x + 22} ${hy + 2} L${x + 40 + hw / 2} ${hy - 108} L${x + 58 + hw} ${hy + 2} L${x + 40 + hw / 2} ${hy - 92} Z`} fill="#eef1f4" opacity={snow} />}
        {[0.2, 0.62].map((fx) => (
          <g key={fx}>
            <rect x={x + 40 + hw * fx} y={hy + 50} width={70} height={70} fill={lit && l.night > 0.5 ? "#e8c58e" : mix("#c9d3dc", "#2a3344", l.night)} {...O} strokeWidth={2} opacity={lit && l.night > 0.5 ? 0.85 : 1} />
            <line x1={x + 75 + hw * fx} y1={hy + 50} x2={x + 75 + hw * fx} y2={hy + 120} stroke="#d8d2c6" strokeWidth={4} />
          </g>
        ))}
        <rect x={x + 40 + hw * 0.42} y={STREET_GROUND - 120} width={56} height={102} fill="#5b4a3a" {...O} strokeWidth={2} />
        <rect x={treeX - 9} y={STREET_GROUND - 170} width={18} height={152} fill="#4e3f33" {...O} strokeWidth={2} />
        {leaf ? (
          <>
            <circle cx={treeX} cy={STREET_GROUND - 210} r={70} fill={leaf} {...O} />
            <circle cx={treeX - 46} cy={STREET_GROUND - 176} r={44} fill={leaf} {...O} />
            <circle cx={treeX + 44} cy={STREET_GROUND - 180} r={48} fill={leaf} {...O} />
          </>
        ) : (
          <path d={`M${treeX} ${STREET_GROUND - 168} L${treeX - 40} ${STREET_GROUND - 250} M${treeX} ${STREET_GROUND - 190} L${treeX + 46} ${STREET_GROUND - 262} M${treeX} ${STREET_GROUND - 200} L${treeX + 4} ${STREET_GROUND - 280}`} stroke="#4e3f33" strokeWidth={8} strokeLinecap="round" />
        )}
        <rect x={x} y={STREET_GROUND - 58} width={bw} height={8} fill="#7a6a5c" opacity={0.9} />
        {Array.from({ length: 11 }).map((_, k) => (
          <rect key={k} x={x + k * 52} y={STREET_GROUND - 70} width={10} height={52} fill="#7a6a5c" />
        ))}
      </g>,
    );
  }
  // lamps
  const lamps = [];
  const lw = 900;
  const l0 = Math.floor((camX - 1400) / lw);
  for (let i = l0; i < l0 + 5; i++) {
    const x = i * lw + 300;
    lamps.push(
      <g key={i}>
        {l.night > 0.3 && <SoftPool cx={x + 70} cy={STREET_GROUND + 6} rx={230} ry={30} op={0.3 * l.night} />}
        <rect x={x - 6} y={STREET_GROUND - 420} width={12} height={420} fill="#3c4048" {...O} strokeWidth={2} />
        <path d={`M${x} ${STREET_GROUND - 414} Q${x + 10} ${STREET_GROUND - 440} ${x + 60} ${STREET_GROUND - 436}`} stroke="#3c4048" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d={`M${x + 42} ${STREET_GROUND - 440} H${x + 96} L${x + 86} ${STREET_GROUND - 424} H${x + 52} Z`} fill={l.night > 0.3 ? "#f2d3a2" : "#5a5f68"} {...O} strokeWidth={2} />
      </g>,
    );
  }
  const seam = 120;
  const s0 = Math.floor((camX - 1200) / seam);
  const dash = 220;
  const d0 = Math.floor((camX - 1200) / dash);
  return (
    <g>
      <defs>
        <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bot} />
        </linearGradient>
      </defs>
      <rect x={camX - 2400} y={-400} width={4800} height={1600} fill="url(#skyS)" />
      {l.night > 0.5 && <circle cx={camX - 960 + 1500 * 1} cy={170} r={34} fill="#e9e6dc" opacity={0.9 * l.night} />}
      {l.night > 0.3 &&
        Array.from({ length: 40 }).map((_, i) => <circle key={i} cx={camX - 1000 + h1(i, 8) * 2000} cy={40 + h1(i, 9) * 380} r={1.6 + h1(i, 10) * 1.4} fill="#dfe6f0" opacity={0.6 * l.night} />)}
      <g transform={`translate(${layer(0.15)} 0)`}>{far}</g>
      <g transform={`translate(${layer(0.5)} 0)`}>{houses}</g>
      <g>{lamps}</g>
      <rect x={camX - 2400} y={STREET_GROUND - 18} width={4800} height={58} fill="#8d8c88" {...O} strokeWidth={2} />
      {snow > 0 && <rect x={camX - 2400} y={STREET_GROUND - 20} width={4800} height={14} fill="#eef1f4" opacity={snow} />}
      {Array.from({ length: 22 }).map((_, k) => (
        <line key={k} x1={(s0 + k) * seam} y1={STREET_GROUND - 18} x2={(s0 + k) * seam - 18} y2={STREET_GROUND + 40} stroke={INK} strokeOpacity={0.18} strokeWidth={2} />
      ))}
      <rect x={camX - 2400} y={STREET_GROUND + 40} width={4800} height={14} fill="#6f6e6b" />
      <rect x={camX - 2400} y={STREET_GROUND + 54} width={4800} height={400} fill="#3a3d44" />
      {Array.from({ length: 12 }).map((_, k) => (
        <rect key={k} x={(d0 + k) * dash} y={STREET_GROUND + 140} width={110} height={10} rx={4} fill="#c9c4b4" opacity={0.7} />
      ))}
      {signScreenX !== null && <g transform={`translate(${camX - 960 + signScreenX} 0)`}><SignpostMini near /></g>}
      {signWorldX !== null && <g transform={`translate(${signWorldX} 0)`}><SignpostMini near /></g>}
    </g>
  );
};
const SignpostMini: React.FC<{ near?: boolean }> = ({ near }) => {
  const y = near ? STREET_GROUND - 18 : 640;
  const s = near ? 1.1 : 0.7;
  return (
    <g transform={`translate(0 ${y}) scale(${s})`}>
      <rect x={-6} y={-170} width={12} height={170} rx={3} fill="#5b4a3a" {...O} />
      <path d="M-84 -170 H66 L84 -150 L66 -130 H-84 Z" fill="#cfc5ae" {...O} />
      <text x={-6} y={-142} textAnchor="middle" fontFamily={handFont} fontSize={26} fill="#3b3322" letterSpacing={1}>
        TOMORROW
      </text>
    </g>
  );
};
