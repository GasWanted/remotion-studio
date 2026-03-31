import { makeThemed, defaultPerson } from "./factory";

// Synthwave: 80s sunset, perspective grid, neon pink/cyan
export const Synthwave = makeThemed({
  bgColor: "#0a0020",
  drawBg: (ctx, w, h, _frame, scale) => {
    // Sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.6);
    sky.addColorStop(0, "#0a0020");
    sky.addColorStop(0.3, "#1a0040");
    sky.addColorStop(0.6, "#4a0060");
    sky.addColorStop(0.8, "#ff4080");
    sky.addColorStop(1, "#ff8040");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.6);
    // Sun
    const sunY = h * 0.35, sunR = 40 * scale;
    const sg = ctx.createRadialGradient(w / 2, sunY, sunR * 0.3, w / 2, sunY, sunR);
    sg.addColorStop(0, "rgba(255,200,60,0.9)");
    sg.addColorStop(0.6, "rgba(255,100,80,0.6)");
    sg.addColorStop(1, "rgba(255,60,120,0)");
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(w / 2, sunY, sunR, 0, Math.PI * 2); ctx.fill();
    // Sun stripes
    ctx.fillStyle = "#0a0020";
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(w / 2 - sunR, sunY + sunR * (0.1 + i * 0.18), sunR * 2, 2 * scale * (1 + i * 0.5));
    }
    // Ground
    ctx.fillStyle = "#0a0020";
    ctx.fillRect(0, h * 0.6, w, h * 0.4);
    // Perspective grid
    const horizon = h * 0.6;
    ctx.strokeStyle = "rgba(255,0,200,0.3)";
    ctx.lineWidth = 1;
    for (let i = 1; i <= 12; i++) {
      const t = i / 12;
      const y = horizon + t * t * (h - horizon);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(0,200,255,0.2)";
    for (let i = -15; i <= 15; i++) {
      const bx = w / 2 + i * 40 * scale;
      ctx.beginPath(); ctx.moveTo(w / 2 + (bx - w / 2) * 0.1, horizon); ctx.lineTo(w / 2 + (bx - w / 2) * 3, h); ctx.stroke();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    defaultPerson(ctx, x, y, size, color);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },
  figureColor: (hue, alpha) => hue > 180
    ? `rgba(0,255,255,${alpha * 0.9})`
    : `rgba(255,50,200,${alpha * 0.9})`,
  titleColor: "rgba(0,255,255,0.9)",
  counterColor: "rgba(0,255,255,0.5)",
  fontFamily: "monospace",
});
