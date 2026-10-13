import motion from "./motion.json";

type Seg = { from: number; to: number; x0: number; x1: number; ease: string };
const segs = motion.segments as Seg[];
export const STRIDE = motion.stride;

const ease = (k: string, u: number) => (k === "out" ? 1 - (1 - u) * (1 - u) : u * u * (3 - 2 * u));

// Hero ground x at absolute frame t. Phase of the walk cycle derives from this, so feet never slide.
export const heroX = (t: number): number => {
  let x = segs[0].x0;
  for (const s of segs) {
    if (t < s.from) return x;
    if (t >= s.to) {
      x = s.x1;
      continue;
    }
    return s.x0 + (s.x1 - s.x0) * ease(s.ease, (t - s.from) / (s.to - s.from));
  }
  return x;
};

// Distance walked inside the current segment (px) and current speed (px / frame).
export const heroWalk = (t: number) => {
  const seg = segs.find((s) => t >= s.from && t < s.to);
  const x = heroX(t);
  const dist = seg ? x - seg.x0 : 0;
  const speed = seg ? Math.abs(heroX(t + 0.5) - heroX(t - 0.5)) : 0;
  return { x, dist, speed, walking: !!seg };
};
