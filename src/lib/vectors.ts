export type Vec2 = { x: number; y: number };

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function norm(a: Vec2): number {
  return Math.hypot(a.x, a.y);
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function nearestNeighbors<T extends Vec2>(
  target: Vec2,
  points: T[],
  k: number,
  exclude?: (p: T) => boolean
): T[] {
  return points
    .filter((p) => !(exclude && exclude(p)))
    .map((p) => ({ p, d: distance(target, p) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((x) => x.p);
}
