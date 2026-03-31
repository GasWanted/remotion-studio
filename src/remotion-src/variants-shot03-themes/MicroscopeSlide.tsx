import { makeThemed } from "./factory";

// Microscope Slide: biological staining, circular lens vignette, off-white
export const MicroscopeSlide = makeThemed({
  bgColor: "#f0ece0",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#f0ece0";
    ctx.fillRect(0, 0, w, h);
    // Fine grid (microscope graticule)
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 0.5;
    const gs = 15 * scale;
    for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Circular lens vignette
    const r = Math.min(w, h) * 0.48;
    const vig = ctx.createRadialGradient(w / 2, h / 2, r * 0.7, w / 2, h / 2, r);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    // Lens border
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
    // Center crosshair
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(w / 2 - 15 * scale, h / 2); ctx.lineTo(w / 2 + 15 * scale, h / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w / 2, h / 2 - 15 * scale); ctx.lineTo(w / 2, h / 2 + 15 * scale); ctx.stroke();
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Cell-like: filled circle with darker nucleus
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, size * 0.45, 0, Math.PI * 2); ctx.fill();
    // Nucleus
    ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.5)");
    ctx.beginPath(); ctx.arc(x - size * 0.08, y - size * 0.05, size * 0.18, 0, Math.PI * 2); ctx.fill();
    // Cell membrane
    ctx.strokeStyle = color.replace(/[\d.]+\)$/, "0.3)");
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(x, y, size * 0.48, 0, Math.PI * 2); ctx.stroke();
  },
  figureColor: (hue, alpha) => {
    // Biological stain colors: purple/pink/blue
    const h = hue < 100 ? 320 : hue < 200 ? 260 : 220;
    return `hsla(${h},45%,50%,${alpha * 0.6})`;
  },
  titleColor: "rgba(60,40,60,0.8)",
  counterColor: "rgba(80,60,80,0.45)",
  fadeRgb: "240,236,224",
});
