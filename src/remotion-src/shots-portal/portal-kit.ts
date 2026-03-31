/**
 * Portal Kit — high-quality shared rendering module for Portal 2 style shots.
 *
 * Every shot file imports from here. NO shot should define its own C, seeded,
 * accent, drawDotGrid, or node rendering. This module guarantees consistent
 * 4-layer node rendering, proper easing, and clean color handling.
 */

export type C2D = CanvasRenderingContext2D;

// ─── Color Palette ───────────────────────────────────────────────────────────

export const C = {
  blue:       "#4090ff",
  blueMid:    "#3070d0",
  blueDark:   "#2050a0",
  orange:     "#ff8c00",
  orangeMid:  "#e07800",
  orangeDark: "#c06000",
  white:      "#f2f2f4",
  panel:      "#e8e8ec",
  gray:       "#c8c8d0",
  grayDark:   "#888898",
  text:       "#3a3a4a",
  textDim:    "#8888a0",
  bg:         "#f6f6f8",
  green:      "#40c080",
  red:        "#e05050",
};

/** Raw RGB values for gradient construction — no string hacks */
const BLUE_RGB  = [64, 144, 255] as const;
const ORANGE_RGB = [255, 140, 0] as const;

/** Blue for even indices, orange for odd. Returns proper rgba() string. */
export function accent(i: number, alpha = 1): string {
  const [r, g, b] = i % 2 === 0 ? BLUE_RGB : ORANGE_RGB;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Get raw [r,g,b] for index (for use in gradients) */
export function accentRGB(i: number): readonly [number, number, number] {
  return i % 2 === 0 ? BLUE_RGB : ORANGE_RGB;
}

// ─── Math Utilities ──────────────────────────────────────────────────────────

/** Deterministic seeded PRNG (LCG) */
export function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

/** Ease-out-back: overshoot bounce (the "pop" effect) */
export function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/** Ease-out-cubic: smooth deceleration */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Background ──────────────────────────────────────────────────────────────

/** White background fill + subtle dot grid + faint panel lines */
export function drawBg(ctx: C2D, w: number, h: number, scale: number) {
  // Solid white fill
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, w, h);

  // Panel lines — subtle horizontal/vertical grid for Portal 2 test chamber feel
  ctx.strokeStyle = "rgba(200,200,215,0.12)";
  ctx.lineWidth = 0.5;
  const panelSp = 60 * scale;
  for (let x = panelSp; x < w; x += panelSp) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = panelSp; y < h; y += panelSp) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Dot grid overlay — signature Portal clinical dots
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

// ─── Fade / Timing ───────────────────────────────────────────────────────────

/** Global alpha multiplier with fade-in (15 frames) and fade-out (18 frames) */
export function fadeInOut(frame: number, total: number, fadeIn = 15, fadeOut = 18): number {
  const fi = Math.min(1, frame / fadeIn);
  const fo = Math.min(1, (total - frame) / fadeOut);
  return fi * fo;
}

/**
 * Staggered reveal: returns 0→1 progress for item at given index.
 * Applies easeOutBack automatically for bouncy entrance.
 * Returns 0 if not yet started, 1 if fully visible.
 */
export function stagger(frame: number, index: number, delay = 0.3, duration = 8): number {
  const start = index * delay;
  const raw = (frame - start) / duration;
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return easeOutBack(Math.min(1, raw));
}

/** Raw stagger progress without easing (for custom easing) */
export function staggerRaw(frame: number, index: number, delay = 0.3, duration = 8): number {
  const raw = (frame - index * delay) / duration;
  return Math.max(0, Math.min(1, raw));
}

// ─── 4-Layer Node Rendering ──────────────────────────────────────────────────
// This is the quality-critical function. Every node in every shot uses this.
// Layers: glow → shadow → core → specular highlight

/** Draw a high-quality node with glow, shadow, core, and specular highlight */
export function drawNode(ctx: C2D, x: number, y: number, r: number, colorIdx: number, alpha = 1) {
  if (r < 0.3 || alpha < 0.01) return;

  const [cr, cg, cb] = accentRGB(colorIdx);

  // 1) Glow — soft radial halo at 3.5x radius
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 3.5);
  glow.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.14})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 3.5, 0, Math.PI * 2); ctx.fill();

  // 2) Shadow — offset dark circle
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.06})`;
  ctx.beginPath(); ctx.arc(x + 1, y + 1, r, 0, Math.PI * 2); ctx.fill();

  // 3) Core — solid accent color
  ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha * 0.85})`;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

  // 4) Specular highlight — white dot upper-left
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
  ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2); ctx.fill();
}

/** Draw a premium node with radial gradient core (for focal elements like neuron soma) */
export function drawNodeGradient(ctx: C2D, x: number, y: number, r: number, colorIdx: number, alpha = 1) {
  if (r < 0.3 || alpha < 0.01) return;

  const [cr, cg, cb] = accentRGB(colorIdx);

  // 1) Glow
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  glow.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.18})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, r * 4, 0, Math.PI * 2); ctx.fill();

  // 2) Shadow
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.08})`;
  ctx.beginPath(); ctx.arc(x + 1.5, y + 1.5, r, 0, Math.PI * 2); ctx.fill();

  // 3) Gradient core — lighter upper-left, darker lower-right
  const core = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 0, x, y, r);
  core.addColorStop(0, `rgba(${Math.min(255,cr+40)},${Math.min(255,cg+40)},${Math.min(255,cb+40)},${alpha * 0.9})`);
  core.addColorStop(0.6, `rgba(${cr},${cg},${cb},${alpha * 0.85})`);
  core.addColorStop(1, `rgba(${Math.max(0,cr-30)},${Math.max(0,cg-30)},${Math.max(0,cb-30)},${alpha * 0.75})`);
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

  // 4) Specular
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.2, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw a dormant/inactive node (gray, no glow, smaller) */
export function drawNodeDormant(ctx: C2D, x: number, y: number, r: number, alpha = 1) {
  ctx.fillStyle = `rgba(200,200,210,${alpha * 0.3})`;
  ctx.beginPath(); ctx.arc(x, y, r * 0.6, 0, Math.PI * 2); ctx.fill();
}

// ─── Edge / Connection Rendering ─────────────────────────────────────────────

/** Draw a connection line between two nodes */
export function drawEdge(ctx: C2D, x1: number, y1: number, x2: number, y2: number, colorIdx: number, alpha = 0.3, scale = 1) {
  const [cr, cg, cb] = accentRGB(colorIdx);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
  ctx.lineWidth = 1.5 * scale;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

/** Draw a glowing connection (for signal propagation) */
export function drawEdgeGlow(ctx: C2D, x1: number, y1: number, x2: number, y2: number, colorIdx: number, alpha = 0.3, scale = 1) {
  const [cr, cg, cb] = accentRGB(colorIdx);
  // Wide glow
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha * 0.3})`;
  ctx.lineWidth = 5 * scale;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  // Core line
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

/** Draw a faint structural edge (for background networks) */
export function drawEdgeFaint(ctx: C2D, x1: number, y1: number, x2: number, y2: number, scale = 1) {
  ctx.strokeStyle = "rgba(180,180,200,0.12)";
  ctx.lineWidth = 1 * scale;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
}

// ─── Header & Counter ────────────────────────────────────────────────────────

/** Draw header title and optional subtitle with fade-in */
export function drawHeader(ctx: C2D, w: number, h: number, scale: number, frame: number, total: number, title: string, subtitle?: string) {
  const ha = Math.min(1, frame / 12);
  const fo = fadeInOut(frame, total);
  ctx.globalAlpha = ha * fo;
  ctx.fillStyle = C.text;
  ctx.font = `600 ${16 * scale}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(title, w / 2, h * 0.08);
  if (subtitle) {
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText(subtitle, w / 2, h * 0.14);
  }
  ctx.globalAlpha = fo;
}

/** Draw bottom-right counter with label */
export function drawCounter(ctx: C2D, w: number, h: number, scale: number, value: string, label?: string) {
  ctx.fillStyle = C.text;
  ctx.font = `600 ${12 * scale}px monospace`;
  ctx.textAlign = "right";
  ctx.fillText(value, w * 0.92, h * 0.94);
  if (label) {
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText(label, w * 0.92, h * 0.97);
  }
}

// ─── Domain-Specific Drawing ─────────────────────────────────────────────────

/** Person silhouette (head + torso) */
export function drawPerson(ctx: C2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.45);
  ctx.quadraticCurveTo(x - size * 0.42, y - size * 0.05, x, y - size * 0.18);
  ctx.quadraticCurveTo(x + size * 0.42, y - size * 0.05, x + size * 0.42, y + size * 0.45);
  ctx.fill();
}

/** Neuron shape: dendrites (blue, left) → soma (gradient node) → axon (orange, right) */
export function drawNeuronShape(ctx: C2D, x: number, y: number, size: number, alpha = 1, frame = 0) {
  const pulse = 0.95 + Math.sin(frame * 0.06) * 0.05;

  // Dendrites (left side, blue)
  ctx.strokeStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.6})`;
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const angle = Math.PI * 0.65 + (i / 4) * Math.PI * 0.7;
    const len = size * (0.6 + i * 0.08);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
    // Branch tips
    const tx = x + Math.cos(angle) * len, ty = y + Math.sin(angle) * len;
    for (let b = -1; b <= 1; b += 2) {
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(angle + b * 0.5) * len * 0.3, ty + Math.sin(angle + b * 0.5) * len * 0.3);
      ctx.stroke();
    }
  }

  // Axon (right side, orange)
  ctx.strokeStyle = `rgba(${ORANGE_RGB.join(",")},${alpha * 0.6})`;
  ctx.lineWidth = size * 0.1;
  const axLen = size * 0.8;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + axLen, y); ctx.stroke();
  // Axon terminals
  for (let i = -2; i <= 2; i++) {
    const ty = y + i * size * 0.15;
    ctx.lineWidth = size * 0.05;
    ctx.beginPath(); ctx.moveTo(x + axLen, y); ctx.lineTo(x + axLen + size * 0.2, ty); ctx.stroke();
    drawNode(ctx, x + axLen + size * 0.2, ty, size * 0.06, 1, alpha);
  }

  // Soma (center, gradient node)
  drawNodeGradient(ctx, x, y, size * 0.2 * pulse, 0, alpha);
}

/** Simple fly outline in portal blue */
export function drawFlyOutline(ctx: C2D, x: number, y: number, size: number, alpha = 1) {
  ctx.strokeStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.6})`;
  ctx.fillStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.15})`;
  ctx.lineWidth = size * 0.04;

  // Body (3 segments)
  // Abdomen
  ctx.beginPath(); ctx.ellipse(x, y + size * 0.15, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Thorax
  ctx.beginPath(); ctx.ellipse(x, y - size * 0.12, size * 0.14, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Head
  ctx.beginPath(); ctx.arc(x, y - size * 0.32, size * 0.1, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Wings
  ctx.fillStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.06})`;
  ctx.strokeStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.3})`;
  ctx.beginPath(); ctx.ellipse(x - size * 0.22, y - size * 0.08, size * 0.25, size * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x + size * 0.22, y - size * 0.08, size * 0.25, size * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Legs (3 pairs)
  ctx.strokeStyle = `rgba(${BLUE_RGB.join(",")},${alpha * 0.4})`;
  ctx.lineWidth = size * 0.02;
  for (let i = 0; i < 3; i++) {
    const ly = y - size * 0.05 + i * size * 0.12;
    for (const side of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x + side * size * 0.1, ly);
      ctx.lineTo(x + side * size * 0.3, ly + size * 0.08);
      ctx.lineTo(x + side * size * 0.35, ly + size * 0.15);
      ctx.stroke();
    }
  }
}

/** Portal 2 style panel/card with border and subtle fill */
export function drawPanel(ctx: C2D, x: number, y: number, w: number, h: number, colorIdx: number, alpha = 1) {
  const [cr, cg, cb] = accentRGB(colorIdx);
  // Fill
  ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha * 0.06})`;
  ctx.fillRect(x, y, w, h);
  // Border
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha * 0.25})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  // Top accent bar
  ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha * 0.5})`;
  ctx.fillRect(x, y, w, 2);
}

/** Checkmark in accent color */
export function drawCheck(ctx: C2D, x: number, y: number, size: number, colorIdx = 0, alpha = 1) {
  const [cr, cg, cb] = accentRGB(colorIdx);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
  ctx.lineWidth = size * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y);
  ctx.lineTo(x - size * 0.1, y + size * 0.3);
  ctx.lineTo(x + size * 0.4, y - size * 0.3);
  ctx.stroke();
}

/** X mark in accent color */
export function drawXMark(ctx: C2D, x: number, y: number, size: number, colorIdx = 1, alpha = 1) {
  const [cr, cg, cb] = accentRGB(colorIdx);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
  ctx.lineWidth = size * 0.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3); ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.moveTo(x + size * 0.3, y - size * 0.3); ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.stroke();
}

/** Draw a signal pulse traveling from (x1,y1) toward (x2,y2) at progress t (0-1) */
export function drawSignalPulse(ctx: C2D, x1: number, y1: number, x2: number, y2: number, t: number, colorIdx: number, scale: number) {
  const px = lerp(x1, x2, t);
  const py = lerp(y1, y2, t);
  const r = 3 * scale;
  const [cr, cg, cb] = accentRGB(colorIdx);
  // Trail
  const prevT = Math.max(0, t - 0.08);
  const prevX = lerp(x1, x2, prevT);
  const prevY = lerp(y1, y2, prevT);
  ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.2)`;
  ctx.lineWidth = r * 0.8;
  ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(px, py); ctx.stroke();
  // Pulse dot
  drawNode(ctx, px, py, r, colorIdx, 0.9);
}

/** Bar chart with Portal styling */
export function drawBarChart(ctx: C2D, x: number, y: number, w: number, h: number, values: number[], maxVal: number, scale: number) {
  const barW = w / values.length * 0.7;
  const gap = w / values.length * 0.3;
  for (let i = 0; i < values.length; i++) {
    const barH = (values[i] / maxVal) * h;
    const bx = x + i * (barW + gap);
    const by = y + h - barH;
    const [cr, cg, cb] = accentRGB(i);

    // Shadow
    ctx.fillStyle = `rgba(0,0,0,0.04)`;
    ctx.fillRect(bx + 1, by + 1, barW, barH);

    // Bar gradient
    const grad = ctx.createLinearGradient(bx, by, bx, by + barH);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.85)`);
    grad.addColorStop(1, `rgba(${Math.max(0,cr-30)},${Math.max(0,cg-30)},${Math.max(0,cb-30)},0.7)`);
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, barW, barH);

    // Highlight strip
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillRect(bx, by, barW * 0.25, barH);

    // Top cap
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(bx, by, barW, 2 * scale);
  }
}

/** Horizontal threshold line */
export function drawThresholdLine(ctx: C2D, x: number, y: number, w: number, label: string, scale: number) {
  ctx.strokeStyle = "rgba(60,60,80,0.25)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4 * scale, 3 * scale]);
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.textDim;
  ctx.font = `${8 * scale}px system-ui`;
  ctx.textAlign = "left";
  ctx.fillText(label, x + w + 4 * scale, y + 3 * scale);
}
