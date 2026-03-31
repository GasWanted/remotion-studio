import { makeThemed } from "./factory";

// Retro Arcade: pixel art, CRT scanlines, classic 8-bit colors
export const RetroArcade = makeThemed({
  bgColor: "#0c0c2c",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#0c0c2c";
    ctx.fillRect(0, 0, w, h);
    // Pixel stars
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 29) % 100) / 100 * w;
      const sy = ((i * 89 + 53) % 100) / 100 * h;
      ctx.fillRect(Math.round(sx), Math.round(sy), 2 * scale, 2 * scale);
    }
    // CRT scanlines
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let y = 0; y < h; y += 4 * scale) ctx.fillRect(0, y, w, 2 * scale);
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Pixel square person
    ctx.fillStyle = color;
    const px = Math.round(x - size * 0.3);
    const py = Math.round(y - size * 0.3);
    const ps = Math.round(size * 0.6);
    ctx.fillRect(px, py, ps, ps);
    // Head pixel
    ctx.fillRect(px + ps * 0.2, py - ps * 0.5, ps * 0.6, ps * 0.4);
  },
  figureColor: (hue, alpha) => {
    const colors = ["#5cff5c", "#5c5cff", "#ff5c5c", "#ffff5c", "#ff5cff", "#5cffff"];
    return colors[Math.abs(hue) % colors.length].replace(")", `,${alpha})`);
  },
  titleColor: "#5cff5c",
  counterColor: "rgba(92,255,92,0.5)",
  fontFamily: "monospace",
});
