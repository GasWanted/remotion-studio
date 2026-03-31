import { makeThemed } from "./factory";

// Chalkboard: chalk on dark green board, hand-drawn feel
export const Chalkboard = makeThemed({
  bgColor: "#2d3d2a",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#2d3d2a";
    ctx.fillRect(0, 0, w, h);
    // Chalk dust texture
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    for (let i = 0; i < 300; i++) {
      const px = ((i * 97 + 13) % 300) / 300 * w;
      const py = ((i * 61 + 47) % 300) / 300 * h;
      const s = ((i * 23) % 3) + 1;
      ctx.fillRect(px, py, s, s);
    }
    // Board frame
    ctx.strokeStyle = "rgba(160,120,60,0.5)";
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(4 * scale, 4 * scale, w - 8 * scale, h - 8 * scale);
    // Chalk tray line
    ctx.strokeStyle = "rgba(160,120,60,0.3)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath(); ctx.moveTo(8 * scale, h - 16 * scale); ctx.lineTo(w - 8 * scale, h - 16 * scale); ctx.stroke();
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Chalk stick-figure style
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    // Head
    ctx.beginPath(); ctx.arc(x, y - size * 0.5, size * 0.22, 0, Math.PI * 2); ctx.stroke();
    // Body
    ctx.beginPath(); ctx.moveTo(x, y - size * 0.28); ctx.lineTo(x, y + size * 0.15); ctx.stroke();
    // Arms
    ctx.beginPath(); ctx.moveTo(x - size * 0.25, y - size * 0.08); ctx.lineTo(x + size * 0.25, y - size * 0.08); ctx.stroke();
    // Legs
    ctx.beginPath(); ctx.moveTo(x, y + size * 0.15); ctx.lineTo(x - size * 0.18, y + size * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + size * 0.15); ctx.lineTo(x + size * 0.18, y + size * 0.42); ctx.stroke();
  },
  figureColor: (_hue, alpha) => `rgba(240,240,230,${alpha * 0.75})`,
  titleColor: "rgba(240,240,230,0.85)",
  counterColor: "rgba(240,240,230,0.4)",
  fadeRgb: "45,61,42",
});
