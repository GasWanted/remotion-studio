// Shared Cellular Cute theme utilities — all scenes import from here

export const PALETTE = {
  bg: { center: "#2a1f35", mid: "#1e1528", edge: "#15101d" },
  cellColors: [
    [350, 65, 65], // rosy
    [25, 75, 62],  // orange
    [55, 70, 58],  // amber
    [140, 50, 55], // green
    [180, 55, 55], // teal
    [220, 55, 62], // blue
    [280, 45, 62], // violet
    [310, 55, 62], // pink
  ] as [number, number, number][],
  accent: { gold: "#e8c170", red: "#e85050", green: "#6edd8a", blue: "#60a0e8" },
  text: { primary: "rgba(255,255,255,0.92)", dim: "rgba(255,255,255,0.5)", accent: "#e8c170" },
  particleHues: [50, 120, 200, 340],
};

export function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
  bg.addColorStop(0, PALETTE.bg.center);
  bg.addColorStop(0.6, PALETTE.bg.mid);
  bg.addColorStop(1, PALETTE.bg.edge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

export interface Particle {
  x: number; y: number; r: number; speed: number; phase: number; hue: number;
}

export function makeParticles(count: number, w: number, h: number, scale: number, seed = 88): Particle[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * w, y: rand() * h,
    r: (0.5 + rand() * 1.5) * scale,
    speed: 0.1 + rand() * 0.3,
    phase: rand() * Math.PI * 2,
    hue: PALETTE.particleHues[Math.floor(rand() * PALETTE.particleHues.length)],
  }));
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], frame: number, scale: number) {
  for (const p of particles) {
    const px = p.x + Math.sin(frame * 0.02 * p.speed + p.phase) * 8 * scale;
    const py = p.y + Math.cos(frame * 0.015 * p.speed + p.phase * 1.3) * 6 * scale;
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.04 + p.phase));
    ctx.fillStyle = `hsla(${p.hue}, 50%, 70%, ${twinkle * 0.3})`;
    ctx.beginPath();
    ctx.arc(px, py, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

export interface CellNode {
  x: number; y: number; r: number;
  hue: number; sat: number; lit: number;
  blobPhase: number; squish: number;
}

export function makeCells(count: number, cx: number, cy: number, spread: number, scale: number, seed = 42): CellNode[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.5) * spread;
    const col = PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)];
    return {
      x: cx + Math.cos(a) * r * 1.3,
      y: cy + Math.sin(a) * r * 0.9,
      r: (2.5 + rand() * 3.5) * scale,
      hue: col[0], sat: col[1], lit: col[2],
      blobPhase: rand() * Math.PI * 2,
      squish: 0.85 + rand() * 0.3,
    };
  });
}

export function drawCell(ctx: CanvasRenderingContext2D, n: CellNode, frame: number, alpha = 1, eyes = true, scale = 1) {
  const wobble = Math.sin(frame * 0.04 + n.blobPhase) * 0.08;
  const r = Math.max(0.1, n.r * (1 + wobble));
  const ry = Math.max(0.1, r * n.squish);

  // Glow
  const glowGrad = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.5);
  glowGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * 0.15})`);
  glowGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, 0)`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(n.x, n.y, r * 2.5, ry * 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.save();
  ctx.translate(n.x, n.y);
  ctx.rotate(wobble * 0.5);
  const bodyGrad = ctx.createRadialGradient(-r * 0.2, -ry * 0.2, 0, 0, 0, r);
  bodyGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat + 5}%, ${Math.min(85, n.lit + 18)}%, ${alpha})`);
  bodyGrad.addColorStop(0.7, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha})`);
  bodyGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit - 10}%, ${alpha * 0.9})`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  if (eyes && r > 2.5 * scale) {
    const es = r * 0.3, ey = -ry * 0.1;
    const er = Math.max(0.4 * scale, r * 0.1);
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.beginPath(); ctx.arc(-es, ey, er * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es, ey, er * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(30,20,40,${alpha * 0.85})`;
    ctx.beginPath(); ctx.arc(-es, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
    ctx.beginPath(); ctx.arc(-es - er * 0.2, ey - er * 0.3, er * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es - er * 0.2, ey - er * 0.3, er * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawEdge(ctx: CanvasRenderingContext2D, a: CellNode, b: CellNode, frame: number, scale: number, idxA = 0, idxB = 0) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const perpX = -(b.y - a.y) * 0.15, perpY = (b.x - a.x) * 0.15;
  const wave = Math.sin(frame * 0.03 + idxA * 0.5 + idxB * 0.3) * 5 * scale;
  const cpx = mx + perpX + wave, cpy = my + perpY + wave * 0.5;
  ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 40%, 55%, 0.25)`;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
  ctx.stroke();
}

/** Fade in/out helper: returns alpha for a given frame within a scene of totalFrames length */
export function fadeInOut(frame: number, total: number, fadeIn = 10, fadeOut = 18): number {
  const fi = Math.min(1, frame / fadeIn);
  const fo = Math.min(1, Math.max(0, (total - frame) / fadeOut));
  return fi * fo;
}
