// Shared icon drawing functions for brain-003 variants

/** Draw a person icon (head + shoulders silhouette) */
export function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2);
  ctx.fill();
  // Body/shoulders
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.45);
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.45, y + size * 0.45);
  ctx.fill();
}

/** Draw a seated person (side view, for conference) */
export function drawSeatedPerson(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  // Head
  ctx.beginPath();
  ctx.arc(x, y - size * 0.6, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Torso
  ctx.fillRect(x - size * 0.15, y - size * 0.35, size * 0.3, size * 0.5);
  // Lap (seated)
  ctx.fillRect(x - size * 0.25, y + size * 0.1, size * 0.5, size * 0.15);
}

/** Draw a small bust portrait (for yearbook/photo wall) */
export function drawBust(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, alpha: number) {
  // Background circle
  ctx.fillStyle = `hsla(${hue}, 35%, 30%, ${alpha * 0.6})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.fillStyle = `hsla(${hue}, 50%, 65%, ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // Shoulders
  ctx.beginPath();
  ctx.arc(x, y + size * 0.55, size * 0.55, Math.PI * 1.15, Math.PI * 1.85);
  ctx.fill();
}

/** Draw a map pin icon */
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
  // Dot in center
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
}
