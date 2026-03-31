/**
 * Kurzgesagt-quality illustration engine for canvas2D.
 *
 * Key differences from our basic drawing:
 * - Thick dark outlines on everything
 * - Multi-stop gradient fills with light spot + shadow
 * - Drop shadows under objects
 * - Internal ambient occlusion shading
 * - Organic blob shapes (not perfect circles)
 * - Proper character eyes with large whites, catchlights
 * - Depth-aware layering
 */

// --- Organic blob path ---

/**
 * Generate an organic blob path (wobbly circle).
 * Returns array of {x, y} points that can be drawn with smooth curves.
 */
export function blobPoints(
  cx: number, cy: number, rx: number, ry: number,
  irregularity: number, seed: number, pointCount = 12
): { x: number; y: number }[] {
  let s = seed;
  const srand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = (i / pointCount) * Math.PI * 2;
    const wobble = 1 + (srand() - 0.5) * irregularity;
    points.push({
      x: cx + Math.cos(angle) * rx * wobble,
      y: cy + Math.sin(angle) * ry * wobble,
    });
  }
  return points;
}

/** Draw a smooth closed curve through blob points */
export function drawBlobPath(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) {
  const n = points.length;
  ctx.beginPath();
  // Start at midpoint between last and first
  const startX = (points[n - 1].x + points[0].x) / 2;
  const startY = (points[n - 1].y + points[0].y) / 2;
  ctx.moveTo(startX, startY);
  for (let i = 0; i < n; i++) {
    const next = points[(i + 1) % n];
    const midX = (points[i].x + next.x) / 2;
    const midY = (points[i].y + next.y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }
  ctx.closePath();
}

// --- Drop shadow ---

/** Draw a soft elliptical drop shadow */
export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, rx: number, ry: number,
  alpha = 0.2
) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
  grad.addColorStop(0, `rgba(10, 5, 20, ${alpha})`);
  grad.addColorStop(0.6, `rgba(10, 5, 20, ${alpha * 0.4})`);
  grad.addColorStop(1, `rgba(10, 5, 20, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

// --- Kurzgesagt cell/blob ---

export interface KurzBlobStyle {
  hue: number;
  sat: number;
  lit: number;
  outlineWidth: number; // in pixels, typically 2-4
  outlineColor: string; // dark color for outline
}

/**
 * Draw a full Kurzgesagt-quality blob character.
 * Includes: drop shadow, body with gradient, thick outline, internal shading.
 */
export function drawKurzBlob(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  style: KurzBlobStyle,
  alpha = 1,
  blobSeed = 42,
  irregularity = 0.12
) {
  const points = blobPoints(cx, cy, rx, ry, irregularity, blobSeed);

  // 1. Drop shadow (offset down-right slightly)
  ctx.save();
  ctx.globalAlpha = alpha * 0.25;
  ctx.translate(rx * 0.05, ry * 0.12);
  drawBlobPath(ctx, points);
  ctx.fillStyle = `hsla(${style.hue}, 20%, 8%, 1)`;
  ctx.fill();
  ctx.restore();

  // 2. Body fill with multi-stop gradient
  ctx.save();
  ctx.globalAlpha = alpha;

  // Main gradient: light spot top-left, base color center, darker bottom-right
  const grad = ctx.createRadialGradient(
    cx - rx * 0.25, cy - ry * 0.3, 0,
    cx + rx * 0.1, cy + ry * 0.1, Math.max(rx, ry) * 1.1
  );
  grad.addColorStop(0, `hsla(${style.hue}, ${style.sat + 5}%, ${Math.min(90, style.lit + 20)}%, 1)`);
  grad.addColorStop(0.4, `hsla(${style.hue}, ${style.sat}%, ${style.lit}%, 1)`);
  grad.addColorStop(0.85, `hsla(${style.hue}, ${style.sat + 3}%, ${style.lit - 8}%, 1)`);
  grad.addColorStop(1, `hsla(${style.hue}, ${style.sat + 5}%, ${style.lit - 15}%, 1)`);

  drawBlobPath(ctx, points);
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. Internal ambient occlusion — darker crescent on bottom
  const aoGrad = ctx.createRadialGradient(
    cx, cy - ry * 0.3, ry * 0.2,
    cx, cy + ry * 0.2, Math.max(rx, ry) * 1.2
  );
  aoGrad.addColorStop(0, `hsla(${style.hue}, ${style.sat}%, ${style.lit}%, 0)`);
  aoGrad.addColorStop(0.7, `hsla(${style.hue}, ${style.sat}%, ${style.lit}%, 0)`);
  aoGrad.addColorStop(1, `hsla(${style.hue}, ${style.sat + 10}%, ${Math.max(15, style.lit - 25)}%, 0.3)`);
  drawBlobPath(ctx, points);
  ctx.fillStyle = aoGrad;
  ctx.fill();

  // 4. Specular highlight — bright spot top-left
  const specRx = rx * 0.35, specRy = ry * 0.25;
  const specX = cx - rx * 0.2, specY = cy - ry * 0.3;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, Math.max(specRx, specRy));
  specGrad.addColorStop(0, `hsla(${style.hue}, ${Math.min(100, style.sat + 15)}%, ${Math.min(95, style.lit + 30)}%, 0.35)`);
  specGrad.addColorStop(1, `hsla(${style.hue}, ${style.sat}%, ${style.lit}%, 0)`);
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(specX, specY, specRx, specRy, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // 5. Thick dark outline
  drawBlobPath(ctx, points);
  ctx.strokeStyle = style.outlineColor;
  ctx.lineWidth = style.outlineWidth;
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.restore();
}

// --- Kurzgesagt eyes ---

/**
 * Draw Kurzgesagt-style eyes on a blob.
 * Large whites, round pupils, two catchlight reflections per eye.
 */
export function drawKurzEyes(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, blobRx: number, blobRy: number,
  alpha = 1,
  outlineWidth = 2,
  outlineColor = "rgba(20, 12, 30, 0.8)"
) {
  ctx.save();
  ctx.globalAlpha = alpha;

  const eyeSpacing = blobRx * 0.32;
  const eyeY = cy - blobRy * 0.05;
  const eyeRx = blobRx * 0.18;
  const eyeRy = eyeRx * 1.15; // Slightly taller than wide

  for (const side of [-1, 1]) {
    const ex = cx + side * eyeSpacing;

    // Eye white with outline
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(ex, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth * 0.7;
    ctx.stroke();

    // Pupil (large, fills most of eye)
    const pupilR = eyeRx * 0.62;
    ctx.fillStyle = "#1a0e28";
    ctx.beginPath();
    ctx.arc(ex, eyeY + eyeRy * 0.05, pupilR, 0, Math.PI * 2);
    ctx.fill();

    // Main catchlight (top-left, large)
    const hlR = pupilR * 0.38;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(ex - pupilR * 0.25, eyeY - pupilR * 0.25, hlR, 0, Math.PI * 2);
    ctx.fill();

    // Secondary catchlight (bottom-right, small)
    const hl2R = pupilR * 0.18;
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.beginPath();
    ctx.arc(ex + pupilR * 0.3, eyeY + pupilR * 0.3, hl2R, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// --- Kurzgesagt connection line ---

/**
 * Draw a thick curved connection between two points, with outline.
 * Looks like a pseudopod/tendril.
 */
export function drawKurzConnection(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  thickness: number,
  hue: number, sat: number, lit: number,
  alpha = 1,
  waveOffset = 0
) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const perpX = -(y2 - y1) * 0.18;
  const perpY = (x2 - x1) * 0.18;
  const wave = Math.sin(waveOffset) * thickness * 2;
  const cpx = mx + perpX + wave;
  const cpy = my + perpY + wave * 0.5;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Outer stroke (dark outline)
  ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${Math.max(10, lit - 30)}%, 0.5)`;
  ctx.lineWidth = thickness + 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();

  // Inner stroke (colored fill)
  ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.6)`;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx, cpy, x2, y2);
  ctx.stroke();

  // Highlight stroke (lighter center line)
  ctx.strokeStyle = `hsla(${hue}, ${sat + 10}%, ${Math.min(85, lit + 15)}%, 0.2)`;
  ctx.lineWidth = thickness * 0.4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cpx - 1, cpy - 1, x2, y2);
  ctx.stroke();

  ctx.restore();
}

// --- Kurzgesagt background ---

/**
 * Draw a rich layered background.
 * Deep violet center, darker edges, subtle concentric depth layers.
 */
export function drawKurzBackground(
  ctx: CanvasRenderingContext2D,
  width: number, height: number,
  frame: number
) {
  const cx = width / 2, cy = height / 2;

  // Base gradient
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.65);
  bg.addColorStop(0, "#2e2045");
  bg.addColorStop(0.4, "#221838");
  bg.addColorStop(0.7, "#1a1230");
  bg.addColorStop(1, "#110c20");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle depth rings (Kurzgesagt often has soft concentric shapes behind)
  for (let i = 0; i < 4; i++) {
    const ringR = (150 + i * 120) + Math.sin(frame * 0.005 + i * 1.5) * 10;
    const ringAlpha = 0.03 - i * 0.005;
    if (ringAlpha <= 0) continue;
    ctx.strokeStyle = `hsla(${260 + i * 15}, 30%, 50%, ${ringAlpha})`;
    ctx.lineWidth = 20 + i * 10;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Soft bokeh circles in background
  const bSeed = 777;
  let bs = bSeed;
  const brand = () => { bs = (bs * 16807) % 2147483647; return bs / 2147483647; };
  for (let i = 0; i < 8; i++) {
    const bx = brand() * width;
    const by = brand() * height;
    const br = 30 + brand() * 80;
    const bAlpha = 0.015 + brand() * 0.02;
    const bHue = [260, 300, 220, 340, 180, 280, 310, 200][i];
    ctx.fillStyle = `hsla(${bHue}, 25%, 45%, ${bAlpha})`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Floating particles (Kurzgesagt ambient dust) ---

export interface KurzMote {
  x: number; y: number;
  r: number; speed: number; phase: number; hue: number;
}

export function makeKurzMotes(count: number, width: number, height: number, scale: number, seed = 88): KurzMote[] {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  return Array.from({ length: count }, () => ({
    x: rand() * width, y: rand() * height,
    r: (0.8 + rand() * 2) * scale,
    speed: 0.1 + rand() * 0.3,
    phase: rand() * Math.PI * 2,
    hue: [45, 180, 280, 350, 55, 220][Math.floor(rand() * 6)],
  }));
}

export function drawKurzMotes(ctx: CanvasRenderingContext2D, motes: KurzMote[], frame: number, scale: number) {
  for (const m of motes) {
    const px = m.x + Math.sin(frame * 0.015 * m.speed + m.phase) * 10 * scale;
    const py = m.y + Math.cos(frame * 0.012 * m.speed + m.phase * 1.3) * 8 * scale;
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.03 + m.phase));

    // Glow
    const glowR = m.r * 3;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
    glow.addColorStop(0, `hsla(${m.hue}, 50%, 70%, ${twinkle * 0.12})`);
    glow.addColorStop(1, `hsla(${m.hue}, 50%, 70%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Core dot
    ctx.fillStyle = `hsla(${m.hue}, 55%, 75%, ${twinkle * 0.5})`;
    ctx.beginPath();
    ctx.arc(px, py, m.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Outer glow behind a blob ---

export function drawKurzGlow(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rx: number, ry: number,
  hue: number, sat: number, lit: number,
  alpha = 0.15
) {
  const glowRx = rx * 2.2, glowRy = ry * 2.2;
  const grad = ctx.createRadialGradient(cx, cy, Math.min(rx, ry) * 0.5, cx, cy, Math.max(glowRx, glowRy));
  grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lit}%, ${alpha})`);
  grad.addColorStop(0.5, `hsla(${hue}, ${sat}%, ${lit}%, ${alpha * 0.3})`);
  grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit}%, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, glowRx, glowRy, 0, 0, Math.PI * 2);
  ctx.fill();
}
