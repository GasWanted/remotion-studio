import { makeThemed, defaultPerson, seeded } from "./factory";

// Cosmic Nebula: deep space, nebula clouds, starfield
export const CosmicNebula = makeThemed({
  bgColor: "#050008",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#050008";
    ctx.fillRect(0, 0, w, h);
    // Nebula clouds
    const nebulae = [
      { x: 0.3, y: 0.4, r: 0.35, hue: 280, a: 0.06 },
      { x: 0.7, y: 0.6, r: 0.3, hue: 220, a: 0.05 },
      { x: 0.5, y: 0.3, r: 0.25, hue: 340, a: 0.04 },
      { x: 0.2, y: 0.7, r: 0.2, hue: 200, a: 0.04 },
    ];
    for (const n of nebulae) {
      const g = ctx.createRadialGradient(
        n.x * w, n.y * h, 0,
        n.x * w, n.y * h, n.r * Math.max(w, h)
      );
      g.addColorStop(0, `hsla(${n.hue},60%,40%,${n.a})`);
      g.addColorStop(0.6, `hsla(${n.hue},60%,30%,${n.a * 0.4})`);
      g.addColorStop(1, `hsla(${n.hue},60%,30%,0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    // Starfield
    const rand = seeded(999);
    for (let i = 0; i < 80; i++) {
      const sx = rand() * w, sy = rand() * h;
      const sr = (0.3 + rand() * 1.2) * scale;
      const sa = 0.2 + rand() * 0.6;
      ctx.fillStyle = `rgba(255,255,255,${sa})`;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Star glow behind person
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    defaultPerson(ctx, x, y, size, color);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },
  figureColor: (hue, alpha) => {
    const h = hue < 100 ? 340 : hue < 200 ? 220 : 280;
    return `hsla(${h},60%,65%,${alpha * 0.85})`;
  },
  titleColor: "rgba(200,180,255,0.85)",
  counterColor: "rgba(180,160,255,0.45)",
});
