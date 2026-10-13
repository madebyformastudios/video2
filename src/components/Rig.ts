// Side-view walk rig shared by every character. Feet are at y=0, facing +x.
// Phase is driven by distance walked, so feet plant instead of sliding.

export type Pt = { x: number; y: number };
export type Pose = {
  hip: Pt;
  legs: { knee: Pt; foot: Pt; ankle: Pt; angle: number; gap: number; near: boolean }[];
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

  // Foot geometry (local to the ankle, y down): heel (-14,8), toe (22,8), sole at y=8.
  const HEEL = 14;
  const TOE = 22;
  const AH = 8; // ankle height above the sole
  const rot = (v: Pt, deg: number): Pt => {
    const r = (deg * Math.PI) / 180;
    return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
  };
  // Stance: sole stays planted in the world (it slides back relative to the hip at body speed).
  // heel strike (toe up, rotate about heel) -> flat -> heel lift (toe down, rotate about toe).
  const stance = (p: number, fx: number): { a: Pt; th: number } => {
    let th = 0;
    let pivot: Pt | null = null;
    let local: Pt = { x: 0, y: -AH };
    if (p < 0.08) {
      th = -12 * (1 - smooth(p / 0.08)) * m;
      pivot = { x: fx - HEEL, y: 0 };
      local = { x: HEEL, y: -AH };
    } else if (p > 0.45) {
      th = 35 * smooth((p - 0.45) / 0.15) * m;
      pivot = { x: fx + TOE, y: 0 };
      local = { x: -TOE, y: -AH };
    }
    if (!pivot) return { a: { x: fx, y: -AH }, th: 0 };
    const v = rot(local, th);
    return { a: { x: pivot.x + v.x, y: pivot.y + v.y }, th };
  };
  const sep = [-9, 6]; // slight stance separation when standing still

  const legs = [0, 0.5].map((off, i) => {
    const p = (u + off) % 1;
    const lo = sep[i] * (1 - m);
    let ankle: Pt;
    let th: number;
    if (p < 0.6) {
      const fx = step - (2 * step * p) / 0.6 + lo;
      const st = stance(p, fx);
      ankle = st.a;
      th = st.th;
    } else {
      const k = (p - 0.6) / 0.4;
      const s0 = stance(0.6, -step + lo); // toe-off pose
      const e0 = stance(0, step + lo); // heel-strike pose
      const q = smooth(k);
      ankle = {
        x: s0.a.x + (e0.a.x - s0.a.x) * q,
        y: s0.a.y + (e0.a.y - s0.a.y) * q - liftMax * Math.sin(Math.PI * k),
      };
      th = s0.th + (e0.th - s0.th) * q;
    }
    // lowest point of the sole (for contact shadow): gap above the ground
    const gap = Math.max(0, -Math.max(ankle.y + rot({ x: -HEEL, y: AH }, th).y, ankle.y + rot({ x: TOE, y: AH }, th).y));
    return { knee: ik(hip, ankle), foot: ankle, ankle, angle: th, gap, near: i === 0 };
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
