// Side-view walk rig shared by every character. Feet are at y=0, facing +x.
// Phase is driven by distance walked, so feet plant instead of sliding.

export type Pt = { x: number; y: number };
export type Pose = {
  hip: Pt;
  legs: { knee: Pt; foot: Pt; ankle: Pt; near: boolean }[];
  arms: { elbow: Pt; hand: Pt; near: boolean }[];
  shoulder: Pt;
  lean: number; // degrees, positive = forward
  bob: number;
  u: number;
};

const L1 = 48;
const L2 = 48;
const smooth = (u: number) => u * u * (3 - 2 * u);

const ik = (hip: Pt, foot: Pt): Pt => {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5);
  const a = d / 2;
  const h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  // knee bends forward (+x)
  return { x: hip.x + ux * a + uy * h, y: hip.y + uy * a - ux * h };
};

export const makePose = (dist: number, stride: number, speed: number, slouch: number, frame: number): Pose => {
  const m = Math.min(1, speed / 1.4) ** 0.6; // how "walking" we are (0 = standing)
  const cycle = dist / stride;
  const u = ((cycle % 1) + 1) % 1;
  const step = 34 * m;
  const liftMax = 17 * m;
  const bob = -4.2 * Math.abs(Math.sin(2 * Math.PI * u)) * m;
  const breathe = Math.sin(frame * 0.06) * 1.2 * (1 - m);
  const hip: Pt = { x: 0, y: -92 + bob + slouch * 5 + breathe * 0.4 };

  const legs = [0, 0.5].map((off, i) => {
    const p = (u + off) % 1;
    let fx: number;
    let fy = 0;
    if (p < 0.6) {
      fx = step - (2 * step * p) / 0.6; // stance: foot slides back under the body
    } else {
      const k = (p - 0.6) / 0.4;
      fx = -step + 2 * step * smooth(k);
      fy = -liftMax * Math.sin(Math.PI * k);
    }
    const foot = { x: hip.x + fx, y: fy };
    return { knee: ik(hip, foot), foot, ankle: foot, near: i === 0 };
  });

  const sh: Pt = { x: 0, y: -185 + bob * 0.6 + slouch * 12 };
  const swing = (ph: number) => Math.sin(2 * Math.PI * (u + ph)) * 30 * m * (1 - slouch * 0.6);
  const arms = [0.5, 0].map((ph, i) => {
    const ang = (swing(ph) * Math.PI) / 180;
    const upper = 40;
    const lower = 38;
    const bend = (14 * m + 4) * (Math.PI / 180) * (1 - slouch * 0.5);
    const e = { x: sh.x + Math.sin(ang) * upper, y: sh.y + Math.cos(ang) * upper };
    const h = { x: e.x + Math.sin(ang + bend + 0.08) * lower, y: e.y + Math.cos(ang + bend + 0.08) * lower };
    return { elbow: e, hand: h, near: i === 0 };
  });

  return { hip, legs, arms, shoulder: sh, lean: 3 * m + slouch * 11, bob, u };
};
