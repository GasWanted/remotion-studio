/**
 * Clean white/blue/orange design system.
 * Minimal, clinical, modern. No branded references.
 */

type C2D = CanvasRenderingContext2D;

export function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const C = {
  blue: "#4090ff",
  blueMid: "#3070d0",
  blueDark: "#2050a0",
  blueGlow: "rgba(64,144,255,0.35)",
  orange: "#ff8c00",
  orangeMid: "#e07800",
  orangeDark: "#c06000",
  orangeGlow: "rgba(255,140,0,0.35)",
  white: "#f2f2f4",
  panel: "#e8e8ec",
  gray: "#c8c8d0",
  grayDark: "#888898",
  text: "#3a3a4a",
  textDim: "#8888a0",
  bg: "#f6f6f8",
};

/** Clean person silhouette */
export function drawPerson(ctx: C2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.45);
  ctx.quadraticCurveTo(x - size * 0.42, y - size * 0.08, x, y - size * 0.18);
  ctx.quadraticCurveTo(x + size * 0.42, y - size * 0.08, x + size * 0.42, y + size * 0.45);
  ctx.fill();
}

/** Subtle dot grid background */
export function drawDotGrid(ctx: C2D, w: number, h: number, scale: number) {
  ctx.fillStyle = "rgba(180,180,200,0.18)";
  const sp = 20 * scale;
  for (let x = sp; x < w; x += sp) {
    for (let y = sp; y < h; y += sp) {
      ctx.beginPath();
      ctx.arc(x, y, 0.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Smooth ease-out-back (overshoot bounce) */
export function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Pick blue or orange based on index */
export function accent(i: number, alpha = 1): string {
  return i % 2 === 0
    ? `rgba(64,144,255,${alpha})`
    : `rgba(255,140,0,${alpha})`;
}
