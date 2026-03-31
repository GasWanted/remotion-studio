import { makeThemed, seeded } from "./factory";

// Watercolor Ink: soft paper, wet bleed blobs, organic pigments
export const WatercolorInk = makeThemed({
  bgColor: "#f8f4ec",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#f8f4ec";
    ctx.fillRect(0, 0, w, h);
    // Paper grain
    ctx.fillStyle = "rgba(200,190,170,0.06)";
    for (let i = 0; i < 400; i++) {
      const px = ((i * 131 + 7) % 400) / 400 * w;
      const py = ((i * 83 + 29) % 400) / 400 * h;
      ctx.fillRect(px, py, 1, 1);
    }
    // Watercolor washes
    const rand = seeded(444);
    const washes = [
      { x: 0.2, y: 0.3, r: 0.25, hue: 210 },
      { x: 0.7, y: 0.6, r: 0.2, hue: 340 },
      { x: 0.5, y: 0.8, r: 0.3, hue: 45 },
      { x: 0.8, y: 0.2, r: 0.15, hue: 160 },
    ];
    for (const wash of washes) {
      const g = ctx.createRadialGradient(
        wash.x * w, wash.y * h, 0,
        wash.x * w, wash.y * h, wash.r * Math.max(w, h)
      );
      g.addColorStop(0, `hsla(${wash.hue},40%,70%,0.08)`);
      g.addColorStop(0.7, `hsla(${wash.hue},40%,70%,0.03)`);
      g.addColorStop(1, `hsla(${wash.hue},40%,70%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Soft watercolor blob person
    const g = ctx.createRadialGradient(x, y - size * 0.1, 0, x, y - size * 0.1, size * 0.7);
    g.addColorStop(0, color);
    g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y - size * 0.1, size * 0.55, 0, Math.PI * 2); ctx.fill();
    // Head dot (ink)
    ctx.fillStyle = color.replace(/[\d.]+\)$/, "0.7)");
    ctx.beginPath(); ctx.arc(x, y - size * 0.55, size * 0.18, 0, Math.PI * 2); ctx.fill();
  },
  figureColor: (hue, alpha) => `hsla(${hue},40%,45%,${alpha * 0.5})`,
  titleColor: "rgba(60,50,40,0.75)",
  counterColor: "rgba(80,70,60,0.4)",
  fadeRgb: "248,244,236",
});
