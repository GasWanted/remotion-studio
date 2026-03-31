// Cellular Cute shared rendering kit — matching hook-001 theme
// Dark violet gradient bg, blob cells with glow + gradient + eyes, wavy edges, twinkling particles

// HSL cell colors matching the hook-001 / theme.ts palette
const CELL_HSL: [number, number, number][] = [
  [350, 65, 65], // rosy
  [25, 75, 62],  // orange
  [55, 70, 58],  // amber
  [140, 50, 55], // green
  [180, 55, 55], // teal
  [220, 55, 62], // blue
  [280, 45, 62], // violet
  [310, 55, 62], // pink
];

const PARTICLE_HUES = [50, 120, 200, 340];

export const FB = {
  bg: "#2a1f35",
  colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F", "#BB8FCE", "#82E0AA", "#F1948A", "#85C1E9"] as const,
  text: { primary: "rgba(255,255,255,0.92)", dim: "rgba(255,255,255,0.5)", accent: "#e8c170" },
  edge: "rgba(255,255,255,0.12)",
  red: "#e85050",
  green: "#6edd8a",
  gold: "#e8c170",
  blue: "#60a0e8",
  teal: "#4ECDC4",
  purple: "#BB8FCE",
};

export function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export function accent(i: number): string {
  return FB.colors[i % FB.colors.length];
}

/** Dark violet radial gradient background with twinkling particles */
export function drawFBBg(ctx: CanvasRenderingContext2D, w: number, h: number, frame = 0) {
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
  bg.addColorStop(0, "#2a1f35");
  bg.addColorStop(0.6, "#1e1528");
  bg.addColorStop(1, "#15101d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Twinkling background particles
  const pRand = seeded(88);
  const scale = Math.min(w, h) / 360;
  for (let i = 0; i < 30; i++) {
    const px = pRand() * w + Math.sin(frame * 0.02 * (0.1 + pRand() * 0.3) + pRand() * 6.28) * 8 * scale;
    const py = pRand() * h + Math.cos(frame * 0.015 * (0.1 + pRand() * 0.3) + pRand() * 6.28) * 6 * scale;
    const pr = (0.5 + pRand() * 1.5) * scale;
    const hue = PARTICLE_HUES[Math.floor(pRand() * PARTICLE_HUES.length)];
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.04 + pRand() * 6.28));
    ctx.fillStyle = `hsla(${hue}, 50%, 70%, ${twinkle * 0.3})`;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Blob cell with soft glow, radial gradient body, and dot eyes */
export function drawFBNode(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  colorIdx: number, alpha = 1, frame = 0,
) {
  const [hue, sat, lit] = CELL_HSL[colorIdx % CELL_HSL.length];
  // Deterministic wobble from position
  const blobPhase = (x * 0.01 + y * 0.013) % (Math.PI * 2);
  const squish = 0.88 + ((x * 7 + y * 13) % 100) / 333;
  const wobble = Math.sin(frame * 0.04 + blobPhase) * 0.08;
  const rx = Math.max(0.5, r * (1 + wobble));
  const ry = Math.max(0.5, rx * squish);

  ctx.globalAlpha = alpha;

  // Soft outer glow
  const glowGrad = ctx.createRadialGradient(x, y, rx, x, y, rx * 2.5);
  glowGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lit}%, ${alpha * 0.15})`);
  glowGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit}%, 0)`);
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 2.5, ry * 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cell body with radial gradient
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(wobble * 0.5);
  const bodyGrad = ctx.createRadialGradient(-rx * 0.2, -ry * 0.2, 0, 0, 0, rx);
  bodyGrad.addColorStop(0, `hsla(${hue}, ${sat + 5}%, ${Math.min(85, lit + 18)}%, ${alpha})`);
  bodyGrad.addColorStop(0.7, `hsla(${hue}, ${sat}%, ${lit}%, ${alpha})`);
  bodyGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit - 10}%, ${alpha * 0.9})`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dot eyes (only on larger nodes)
  const scale = r / 4; // approximate scale reference
  if (r > 2.5 * Math.max(1, scale)) {
    const es = rx * 0.3, ey = -ry * 0.1;
    const er = Math.max(0.5, rx * 0.1);
    // White sclera
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
    ctx.beginPath(); ctx.arc(-es, ey, er * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es, ey, er * 1.3, 0, Math.PI * 2); ctx.fill();
    // Dark pupil
    ctx.fillStyle = `rgba(30,20,40,${alpha * 0.85})`;
    ctx.beginPath(); ctx.arc(-es, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es, ey, er, 0, Math.PI * 2); ctx.fill();
    // Specular highlight
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.7})`;
    ctx.beginPath(); ctx.arc(-es - er * 0.2, ey - er * 0.3, er * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(es - er * 0.2, ey - er * 0.3, er * 0.3, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

/** Wavy colored edge between two nodes (quadratic bezier with sine wobble) */
export function drawFBEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  scale: number, alpha = 1, frame = 0, hue1 = 220, hue2 = 220,
) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const perpX = -(y2 - y1) * 0.15, perpY = (x2 - x1) * 0.15;
  const wave = Math.sin(frame * 0.03 + x1 * 0.01 + y1 * 0.01) * 5 * scale;
  const cpx = mx + perpX + wave, cpy = my + perpY + wave * 0.5;
  const avgHue = (hue1 + hue2) / 2;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = `hsla(${avgHue}, 40%, 55%, 0.25)`;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();

  // Faint highlight edge
  ctx.strokeStyle = `hsla(${avgHue}, 50%, 75%, 0.1)`;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx - 0.5 * scale, cpy - 0.5 * scale, x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Colored edge between two nodes — curved, with explicit color */
export function drawFBColorEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, scale: number, alpha = 1,
) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const perpX = -(y2 - y1) * 0.12, perpY = (x2 - x1) * 0.12;
  const cpx = mx + perpX, cpy = my + perpY;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Fade in/out alpha envelope */
export function fadeInOut(frame: number, total: number, fadeIn = 8, fadeOut = 15): number {
  const fi = Math.min(1, frame / fadeIn);
  const fo = Math.min(1, Math.max(0, (total - frame) / fadeOut));
  return fi * fo;
}

/** Staggered reveal — returns 0→1 for item at `index` */
export function stagger(frame: number, index: number, delay: number, duration: number): number {
  const start = index * delay;
  if (frame < start) return 0;
  if (frame > start + duration) return 1;
  return (frame - start) / duration;
}

/** Text with warm accent style */
export function drawFBText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  fontSize: number, alpha = 1,
  align: CanvasTextAlign = "center",
  color = FB.text.primary,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

/** Number counter with glow */
export function drawFBCounter(
  ctx: CanvasRenderingContext2D,
  value: number | string, x: number, y: number,
  fontSize: number, color: string, alpha = 1,
) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(typeof value === "number" ? value.toLocaleString("en-US") : value, x, y);
  ctx.globalAlpha = 1;
}

/** Bar with soft fill */
export function drawFBBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: number, color: string, alpha = 1,
) {
  ctx.globalAlpha = alpha * 0.2;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * fill, h);
  ctx.globalAlpha = 1;
}

/** Animated dashed circle */
export function drawFBDashedCircle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  color: string, frame: number, scale: number, alpha = 1,
) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 * scale;
  ctx.setLineDash([4 * scale, 4 * scale]);
  ctx.lineDashOffset = -frame * 0.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

/** Arrow with curved shaft */
export function drawFBArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, scale: number, alpha = 1,
) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const headLen = 6 * scale;

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * headLen - uy * headLen * 0.5, y2 - uy * headLen + ux * headLen * 0.5);
  ctx.lineTo(x2 - ux * headLen + uy * headLen * 0.5, y2 - uy * headLen - ux * headLen * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** Get the HSL values for a color index (useful for custom drawing) */
export function cellHSL(idx: number): [number, number, number] {
  return CELL_HSL[idx % CELL_HSL.length];
}

// ── SVG Path Icons (draw at any position/size/color on canvas) ──

/** Draw an SVG-path icon centered at (x,y) with given size and color */
function drawIconPath(ctx: CanvasRenderingContext2D, pathData: string, x: number, y: number, size: number, color: string, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  // SVG paths are typically in a 24x24 viewbox — scale to desired size
  const scale = size / 24;
  ctx.translate(x - size / 2, y - size / 2);
  ctx.scale(scale, scale);
  const p = new Path2D(pathData);
  ctx.fill(p);
  ctx.restore();
}

// Material Design icon paths (24x24 viewbox)
const ICON_PATHS = {
  // Person standing
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  // Group of people
  group: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  // Science/lab flask
  science: "M13 2v2h-2V2h2zm0 4h-2v2.17c-2.86.54-5 3.05-5 6.08 0 1.75.71 3.32 1.86 4.47L12 20l4.14-3.28C17.29 15.57 18 13.99 18 12.25c0-3.03-2.14-5.54-5-6.08V6z",
  // Bug/debug (for AI errors)
  bug: "M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z",
  // Check circle
  checkCircle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  // Error/cancel circle
  errorCircle: "M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z",
  // Cursor/mouse pointer
  cursor: "M13.64 21.97C13.14 22.21 12.54 22 12.31 21.5L10.13 16.76L7.62 18.78C7.45 18.92 7.24 19 7.02 19C6.46 19 6 18.54 6 17.97V3.5C6 3.22 6.22 3 6.5 3C6.67 3 6.84 3.08 6.95 3.22L18.3 16.75C18.56 17.04 18.53 17.49 18.24 17.75L15.64 19.97L17.82 24.71z",
  // Building/institution
  building: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
  // Globe/earth
  globe: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
  // Wrench/tool
  wrench: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
};

/** Draw a person icon */
export function drawIconPerson(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.person, x, y, size, color, alpha);
}

/** Draw a person with a colored glow blob behind them — cellular cute style person */
export function drawPersonBlob(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, colorIdx: number, alpha = 1) {
  const [h, s, l] = CELL_HSL[colorIdx % CELL_HSL.length];
  // Soft glow behind
  ctx.globalAlpha = alpha * 0.15;
  const glowG = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.8);
  glowG.addColorStop(0, `hsla(${h},${s}%,${l}%,0.3)`);
  glowG.addColorStop(1, `hsla(${h},${s}%,${l}%,0)`);
  ctx.fillStyle = glowG;
  ctx.beginPath(); ctx.arc(x, y, size * 0.8, 0, Math.PI * 2); ctx.fill();
  // Person silhouette in white/bright
  ctx.globalAlpha = alpha;
  drawIconPath(ctx, ICON_PATHS.person, x, y, size, `hsla(${h},${s + 5}%,${Math.min(90, l + 25)}%,${alpha})`, alpha);
  ctx.globalAlpha = 1;
}

/** Draw a group of people icon */
export function drawIconGroup(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.group, x, y, size, color, alpha);
}

/** Draw a science flask icon */
export function drawIconScience(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.science, x, y, size, color, alpha);
}

/** Draw a bug/error icon */
export function drawIconBug(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.bug, x, y, size, color, alpha);
}

/** Draw a check circle icon */
export function drawIconCheckCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.checkCircle, x, y, size, color, alpha);
}

/** Draw an error/cancel circle icon */
export function drawIconErrorCircle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.errorCircle, x, y, size, color, alpha);
}

/** Draw a cursor icon */
export function drawIconCursor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.cursor, x, y, size, color, alpha);
}

/** Draw a building icon */
export function drawIconBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.building, x, y, size, color, alpha);
}

/** Draw a globe icon */
export function drawIconGlobe(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.globe, x, y, size, color, alpha);
}

/** Draw a wrench icon */
export function drawIconWrench(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  drawIconPath(ctx, ICON_PATHS.wrench, x, y, size, color, alpha);
}

// Re-export icon helpers from the main icons module
export {
  drawPerson, drawNeuron, drawFlyTop, drawFlySide, drawMicroscope,
  drawBeaker, drawMonitor, drawCheck, drawX, drawBlade, drawWave,
  drawResinBlock, drawCamera, drawCursor, drawBarChart, drawBust, drawPin,
  drawPowerButton, drawEye, drawSeatedPerson,
} from "../icons";
