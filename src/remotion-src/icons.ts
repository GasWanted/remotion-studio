// Shared icon drawing functions for all shot variants
// All icons are drawn centered at (x, y) with a given size

/** Person icon — head + shoulder silhouette */
export function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.45);
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.45, y + size * 0.45);
  ctx.fill();
}

/** Seated person (for conferences) */
export function drawSeatedPerson(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.6, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - size * 0.15, y - size * 0.35, size * 0.3, size * 0.5);
  ctx.fillRect(x - size * 0.25, y + size * 0.1, size * 0.5, size * 0.15);
}

/** Circular bust portrait */
export function drawBust(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, alpha: number) {
  ctx.fillStyle = `hsla(${hue}, 35%, 30%, ${alpha * 0.6})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `hsla(${hue}, 50%, 65%, ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y + size * 0.55, size * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.fill();
}

/** Map pin */
export function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.2);
  ctx.lineTo(x, y + size * 0.5);
  ctx.lineTo(x + size * 0.25, y - size * 0.2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

/** Neuron — cell body with dendrites and axon */
export function drawNeuron(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, frame = 0) {
  // Dendrites (left)
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 0.7 + (i / 3) * Math.PI * 0.6;
    const len = size * (0.5 + Math.sin(i * 2.3) * 0.15);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  // Axon (right)
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * 0.9, y + size * 0.05);
  ctx.stroke();
  // Cell body
  const r = size * 0.2;
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, color.replace(/[\d.]+\)$/, "0.5)"));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Microscope icon */
export function drawMicroscope(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = "round";
  // Eyepiece
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.5);
  ctx.lineTo(x + size * 0.08, y - size * 0.5);
  ctx.stroke();
  // Tube
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x, y - size * 0.1);
  ctx.stroke();
  // Objective
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.1);
  ctx.lineTo(x, y + size * 0.05);
  ctx.stroke();
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.arc(x, y + size * 0.1, size * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  // Stage
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y + size * 0.15);
  ctx.lineTo(x + size * 0.25, y + size * 0.15);
  ctx.stroke();
  // Arm
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.35);
  ctx.lineTo(x + size * 0.15, y + size * 0.15);
  ctx.stroke();
  // Base
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.4);
  ctx.lineTo(x + size * 0.2, y + size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.15);
  ctx.lineTo(x, y + size * 0.4);
  ctx.stroke();
}

/** Fly silhouette (top view) */
export function drawFlyTop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  // Abdomen
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.18, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  // Thorax
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.12, size * 0.15, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.32, size * 0.1, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wings
  const wColor = color.replace(/[\d.]+\)$/, "0.3)");
  ctx.fillStyle = wColor;
  ctx.beginPath();
  ctx.ellipse(x - size * 0.25, y - size * 0.05, size * 0.2, size * 0.08, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + size * 0.25, y - size * 0.05, size * 0.2, size * 0.08, 0.4, 0, Math.PI * 2);
  ctx.fill();
  // Legs (6, simplified)
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.03;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const ly = y - size * 0.15 + i * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.12, ly);
      ctx.lineTo(x + side * size * 0.35, ly + size * 0.08);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/** Fly silhouette (side view) */
export function drawFlySide(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  // Body
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.35, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.ellipse(x + size * 0.3, y - size * 0.05, size * 0.1, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing
  ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.25)");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.05, y - size * 0.15, size * 0.25, size * 0.07, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.025;
  for (let i = 0; i < 3; i++) {
    const lx = x - size * 0.15 + i * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(lx, y + size * 0.1);
    ctx.lineTo(lx - size * 0.05, y + size * 0.3);
    ctx.lineTo(lx + size * 0.05, y + size * 0.35);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Beaker / flask */
export function drawBeaker(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, liquidColor: string, fillLevel = 0.6) {
  const w = size * 0.4, h = size * 0.7;
  // Liquid
  ctx.fillStyle = liquidColor;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.75, y + h / 2);
  ctx.lineTo(x - w * 0.9, y + h / 2 - h * fillLevel);
  ctx.lineTo(x + w * 0.9, y + h / 2 - h * fillLevel);
  ctx.lineTo(x + w * 0.75, y + h / 2);
  ctx.closePath();
  ctx.fill();
  // Glass
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.moveTo(x - w, y - h / 2);
  ctx.lineTo(x - w * 0.75, y + h / 2);
  ctx.lineTo(x + w * 0.75, y + h / 2);
  ctx.lineTo(x + w, y - h / 2);
  ctx.stroke();
}

/** Monitor / screen */
export function drawMonitor(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  // Screen
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  // Stand
  ctx.beginPath();
  ctx.moveTo(x - w * 0.1, y + h / 2);
  ctx.lineTo(x - w * 0.15, y + h / 2 + h * 0.15);
  ctx.lineTo(x + w * 0.15, y + h / 2 + h * 0.15);
  ctx.lineTo(x + w * 0.1, y + h / 2);
  ctx.stroke();
}

/** Checkmark */
export function drawCheck(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y);
  ctx.lineTo(x - size * 0.1, y + size * 0.3);
  ctx.lineTo(x + size * 0.4, y - size * 0.3);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** X mark */
export function drawX(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.15;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.3);
  ctx.lineTo(x - size * 0.3, y + size * 0.3);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Eye icon (for observation/vision) */
export function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y);
  ctx.quadraticCurveTo(x, y - size * 0.25, x + size * 0.4, y);
  ctx.quadraticCurveTo(x, y + size * 0.25, x - size * 0.4, y);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

/** Diamond/gem blade (for ultramicrotome) */
export function drawBlade(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x + size * 0.05, y + size * 0.5);
  ctx.lineTo(x - size * 0.05, y + size * 0.5);
  ctx.closePath();
  ctx.fill();
  // Edge gleam
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x + size * 0.03, y + size * 0.5);
  ctx.stroke();
}

/** Sine wave */
export function drawWave(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, wavelength: number, amplitude: number, color: string, lineWidth: number, phase = 0) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i <= w; i += 2) {
    const yy = y + Math.sin((i / wavelength) * Math.PI * 2 + phase) * amplitude;
    i === 0 ? ctx.moveTo(x + i, yy) : ctx.lineTo(x + i, yy);
  }
  ctx.stroke();
}

/** Power button symbol */
export function drawPowerButton(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, alpha = 1) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.35, -Math.PI * 0.7, Math.PI * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.45);
  ctx.lineTo(x, y - size * 0.15);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Resin block (3D-ish rectangle) */
export function drawResinBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, depth = 0) {
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.8)");
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);
  if (depth > 0) {
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.4)");
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y - h / 2);
    ctx.lineTo(x - w / 2 + depth, y - h / 2 - depth * 0.6);
    ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth * 0.6);
    ctx.lineTo(x + w / 2, y - h / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - h / 2);
    ctx.lineTo(x + w / 2 + depth, y - h / 2 - depth * 0.6);
    ctx.lineTo(x + w / 2 + depth, y + h / 2 - depth * 0.6);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.stroke();
  }
}

/** Camera / detector icon */
export function drawCamera(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  // Body
  ctx.strokeRect(x - size * 0.3, y - size * 0.2, size * 0.6, size * 0.4);
  // Lens
  ctx.beginPath();
  ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  // Flash bump
  ctx.fillStyle = color;
  ctx.fillRect(x - size * 0.1, y - size * 0.28, size * 0.2, size * 0.08);
}

/** Cursor arrow */
export function drawCursor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * 0.35, y + size * 0.55);
  ctx.lineTo(x + size * 0.15, y + size * 0.55);
  ctx.lineTo(x + size * 0.08, y + size * 0.75);
  ctx.lineTo(x - size * 0.05, y + size * 0.65);
  ctx.lineTo(x + size * 0.1, y + size * 0.45);
  ctx.lineTo(x - size * 0.05, y + size * 0.35);
  ctx.closePath();
  ctx.fill();
}

/** Bar chart (vertical bars) */
export function drawBarChart(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, values: number[], colors: string[]) {
  const barW = w / values.length * 0.7;
  const gap = w / values.length * 0.3;
  const maxVal = Math.max(...values);
  for (let i = 0; i < values.length; i++) {
    const barH = (values[i] / maxVal) * h;
    const bx = x + i * (barW + gap);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(bx, y + h - barH, barW, barH);
  }
}
