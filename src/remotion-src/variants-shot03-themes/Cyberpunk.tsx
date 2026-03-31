import { makeThemed, defaultPerson, seeded } from "./factory";

// Cyberpunk: neon-soaked dark city, magenta/cyan, rain streaks, glitch
export const Cyberpunk = makeThemed({
  bgColor: "#0a0012",
  drawBg: (ctx, w, h, frame, scale) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#0a0012");
    bg.addColorStop(0.5, "#120024");
    bg.addColorStop(1, "#08001a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // City silhouette
    ctx.fillStyle = "rgba(20,0,40,0.8)";
    const rand = seeded(33);
    for (let x = 0; x < w; x += 15 * scale) {
      const bh = (20 + rand() * 60) * scale;
      ctx.fillRect(x, h - bh, 12 * scale, bh);
    }
    // Neon rain
    const rand2 = seeded(77);
    for (let i = 0; i < 60; i++) {
      const rx = rand2() * w;
      const speed = 2 + rand2() * 4;
      const len = 8 + rand2() * 15;
      const ry = ((frame * speed * scale + rx * 3) % (h * 1.3)) - h * 0.15;
      ctx.strokeStyle = `rgba(0,255,255,${0.08 + rand2() * 0.15})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry + len * scale); ctx.stroke();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    defaultPerson(ctx, x, y, size, color);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },
  figureColor: (hue, alpha) => hue > 180
    ? `rgba(0,255,255,${alpha * 0.85})`
    : `rgba(255,0,180,${alpha * 0.85})`,
  titleColor: "rgba(0,255,220,0.85)",
  counterColor: "rgba(0,255,255,0.5)",
  fontFamily: "monospace",
});
