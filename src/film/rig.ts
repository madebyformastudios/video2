// One skeleton for every character. Side view, facing +x, origin = ground point under the hip.
// Every pose returns ALL parts (both legs, both arms), so nothing can go missing.

export type P = { x: number; y: number };
export type Dims = {
  L1: number; // thigh
  L2: number; // shin
  AH: number; // ankle height above sole
  torsoH: number; // hip -> shoulder
  torsoW: number;
  headR: number;
  hoodR: number;
  neck: number; // shoulder -> head center
  A1: number; // upper arm
  A2: number; // forearm
  legW: number;
  armW: number;
  handR: number;
  stride: number;
};

export const HERO: Dims = { L1: 48, L2: 46, AH: 8, torsoH: 96, torsoW: 84, headR: 40, hoodR: 48, neck: 46, A1: 42, A2: 40, legW: 17, armW: 14, handR: 8, stride: 90 };
// The shadow self: same construction, taller and slimmer.
export const SHADOW: Dims = { L1: 70, L2: 68, AH: 8, torsoH: 146, torsoW: 74, headR: 37, hoodR: 44, neck: 43, A1: 62, A2: 60, legW: 16, armW: 13, handR: 8, stride: 128 };

export type Leg = { knee: P; ankle: P; foot: number; gap: number };
export type Arm = { elbow: P; hand: P };
export type Pose = {
  hip: P;
  torso: number; // lean, degrees, + = forward
  head: number; // head tilt, + = down/forward
  look: number; // eye shift
  legs: [Leg, Leg]; // [far, near]
  arms: [Arm, Arm]; // [far, near]
  rot: number; // whole-body rotation about the hip (degrees)
  grounded: boolean;
};

const smooth = (u: number) => u * u * (3 - 2 * u);
export const clamp01 = (u: number) => Math.max(0, Math.min(1, u));
export const rot = (v: P, deg: number): P => {
  const r = (deg * Math.PI) / 180;
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) };
};
const add = (a: P, b: P): P => ({ x: a.x + b.x, y: a.y + b.y });

// Two-bone IK. Returns the joint and the (clamped) end point.
export const ik = (a: P, b: P, l1: number, l2: number, prefer: "forward" | "down" | "up"): { j: P; end: P } => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy) || 1e-6;
  const max = l1 + l2 - 0.01;
  const d = Math.min(dist, max);
  const ux = dx / dist;
  const uy = dy / dist;
  const end = { x: a.x + ux * d, y: a.y + uy * d };
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const bx = a.x + ux * x;
  const by = a.y + uy * x;
  const c1 = { x: bx - uy * h, y: by + ux * h };
  const c2 = { x: bx + uy * h, y: by - ux * h };
  const j = prefer === "forward" ? (c1.x > c2.x ? c1 : c2) : prefer === "down" ? (c1.y > c2.y ? c1 : c2) : c1.y < c2.y ? c1 : c2;
  return { j, end };
};

export const shoulderOf = (d: Dims, p: Pose): P => add(p.hip, rot({ x: 0, y: -d.torsoH }, p.torso));

// Arm from forward kinematics: angle from straight down (+ = forward), elbow bend (+ = forward).
const fkArm = (sh: P, d: Dims, a: number, bend: number): Arm => {
  const e = add(sh, rot({ x: 0, y: d.A1 }, -a));
  const h = add(e, rot({ x: 0, y: d.A2 }, -(a + bend)));
  return { elbow: e, hand: h };
};
const ikArm = (sh: P, d: Dims, target: P): Arm => {
  const r = ik(sh, target, d.A1, d.A2, "down");
  return { elbow: r.j, hand: r.end };
};

// ---------------- WALK / STAND ----------------
export type WalkOpts = { dist: number; speed: number; slouch?: number; frame: number; arms?: { far?: P; near?: P } };
export const walkPose = (d: Dims, o: WalkOpts): Pose => {
  const slouch = o.slouch ?? 0;
  const legLen = d.L1 + d.L2;
  const m = Math.min(1, o.speed / (1.4 * (d.stride / 90))) ** 0.6;
  const u = (((o.dist / d.stride) % 1) + 1) % 1;
  const step = 0.36 * legLen * m;
  const liftMax = 0.18 * legLen * m;
  const bob = -0.045 * legLen * Math.abs(Math.sin(2 * Math.PI * u)) * m;
  const breathe = Math.sin(o.frame * 0.06) * 1.2 * (1 - m);
  const hip: P = { x: 0, y: -(0.93 * legLen + d.AH) + bob + slouch * 5 + breathe * 0.4 };
  const HEEL = 14;
  const TOE = 22;
  const stance = (p: number, fx: number): { a: P; th: number } => {
    if (p < 0.08) {
      const th = -12 * (1 - smooth(p / 0.08)) * m;
      const v = rot({ x: HEEL, y: -d.AH }, th);
      return { a: { x: fx - HEEL + v.x, y: v.y }, th };
    }
    if (p > 0.45) {
      const th = 35 * smooth((p - 0.45) / 0.15) * m;
      const v = rot({ x: -TOE, y: -d.AH }, th);
      return { a: { x: fx + TOE + v.x, y: v.y }, th };
    }
    return { a: { x: fx, y: -d.AH }, th: 0 };
  };
  const sep = [-9, 7];
  const legs = [0.5, 0].map((off, i) => {
    const p = (u + off) % 1;
    const lo = sep[i] * (1 - m);
    let a: P;
    let th: number;
    if (p < 0.6) {
      const st = stance(p, step - (2 * step * p) / 0.6 + lo);
      a = st.a;
      th = st.th;
    } else {
      const k = (p - 0.6) / 0.4;
      const s0 = stance(0.6, -step + lo);
      const e0 = stance(0, step + lo);
      const q = smooth(k);
      a = { x: s0.a.x + (e0.a.x - s0.a.x) * q, y: s0.a.y + (e0.a.y - s0.a.y) * q - liftMax * Math.sin(Math.PI * k) };
      th = s0.th + (e0.th - s0.th) * q;
    }
    const gap = Math.max(0, -Math.max(a.y + rot({ x: -HEEL, y: d.AH }, th).y, a.y + rot({ x: TOE, y: d.AH }, th).y));
    const r = ik(hip, a, d.L1, d.L2, "forward");
    return { knee: r.j, ankle: r.end, foot: th, gap } as Leg;
  }) as [Leg, Leg];
  const torso = 3 * m + slouch * 11;
  const pose: Pose = { hip, torso, head: slouch * 14, look: 0, legs, arms: [] as unknown as [Arm, Arm], rot: 0, grounded: true };
  const sh = shoulderOf(d, pose);
  const swing = (ph: number) => Math.sin(2 * Math.PI * (u + ph)) * 30 * m * (1 - slouch * 0.6);
  const armFar = o.arms?.far ? ikArm(sh, d, o.arms.far) : fkArm(sh, d, swing(0) - torso, 10 + 8 * m);
  const armNear = o.arms?.near ? ikArm(sh, d, o.arms.near) : fkArm(sh, d, swing(0.5) - torso, 10 + 8 * m);
  pose.arms = [armFar, armNear];
  return pose;
};

// ---------------- SIT ----------------
export type SitOpts = {
  seatH: number; // seat height above the feet's floor (units)
  footX?: number; // ankle x (forward)
  footY?: number; // floor level relative to origin (0 = same as origin)
  torso?: number;
  head?: number;
  look?: number;
  frame: number;
  far?: P | "lap";
  near?: P | "lap";
};
export const sitPose = (d: Dims, o: SitOpts): Pose => {
  const br = Math.sin(o.frame * 0.06) * 1.0;
  const hip: P = { x: 0, y: -o.seatH };
  const fx = o.footX ?? 0.95 * d.L1 + 6;
  const fy = (o.footY ?? 0) - d.AH;
  const near = ik(hip, { x: fx, y: fy }, d.L1, d.L2, "forward");
  const far = ik(hip, { x: fx - 10, y: fy }, d.L1, d.L2, "forward");
  const legs: [Leg, Leg] = [
    { knee: far.j, ankle: far.end, foot: 0, gap: 0 },
    { knee: near.j, ankle: near.end, foot: 0, gap: 0 },
  ];
  const pose: Pose = { hip, torso: o.torso ?? 0, head: o.head ?? 0, look: o.look ?? 0, legs, arms: [] as unknown as [Arm, Arm], rot: 0, grounded: true };
  const sh = add(shoulderOf(d, pose), { x: 0, y: br * 0.5 });
  const lap = (dx: number): P => ({ x: d.L1 * 0.75 + dx, y: hip.y - 6 });
  const tgt = (t: P | "lap" | undefined, dx: number) => (t === undefined || t === "lap" ? lap(dx) : t);
  pose.arms = [ikArm(sh, d, tgt(o.far, -8)), ikArm(sh, d, tgt(o.near, 0))];
  return pose;
};

// ---------------- KNEEL (one knee down, near hand reaching to the ground) ----------------
export const kneelPose = (d: Dims, reach: number, frame: number): Pose => {
  const br = Math.sin(frame * 0.06) * 1.0;
  const hip: P = { x: -4, y: -(d.L2 + d.AH) * 0.86 };
  const backKnee = ik(hip, { x: -d.L1 * 0.2, y: -4 }, d.L1, d.L2, "forward");
  const backLeg: Leg = { knee: { x: -d.L1 * 0.15, y: -6 }, ankle: { x: -d.L1 * 0.15 - d.L2 * 0.98, y: -d.AH - 4 }, foot: 88, gap: 0 };
  void backKnee;
  const front = ik(hip, { x: d.L1 * 0.9, y: -d.AH }, d.L1, d.L2, "forward");
  const legs: [Leg, Leg] = [backLeg, { knee: front.j, ankle: front.end, foot: 0, gap: 0 }];
  const torso = 14 + reach * 22;
  const pose: Pose = { hip, torso, head: 10 + reach * 18, look: 2, legs, arms: [] as unknown as [Arm, Arm], rot: 0, grounded: true };
  const sh = add(shoulderOf(d, pose), { x: 0, y: br * 0.4 });
  const ground: P = { x: d.L1 * 1.45 + reach * 10, y: -4 - (1 - reach) * 26 };
  pose.arms = [ikArm(sh, d, { x: front.j.x + 4, y: front.j.y - 4 }), ikArm(sh, d, ground)];
  return pose;
};

// ---------------- STAND (with optional lean and arm targets) ----------------
export const standPose = (d: Dims, o: { frame: number; torso?: number; head?: number; look?: number; slouch?: number; far?: P; near?: P }): Pose => {
  const p = walkPose(d, { dist: 0, speed: 0, frame: o.frame, slouch: o.slouch });
  if (o.torso !== undefined) p.torso = o.torso;
  if (o.head !== undefined) p.head = o.head;
  p.look = o.look ?? 0;
  const sh = shoulderOf(d, p);
  p.arms = [o.far ? ikArm(sh, d, o.far) : fkArm(sh, d, -p.torso + 4, 10), o.near ? ikArm(sh, d, o.near) : fkArm(sh, d, -p.torso - 3, 12)];
  return p;
};
