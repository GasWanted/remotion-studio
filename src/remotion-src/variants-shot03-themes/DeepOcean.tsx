import { makeThemed, defaultPerson, seeded } from "./factory";

// Deep Ocean: bioluminescent abyss, glowing particles, dark water
export const DeepOcean = makeThemed({
  bgColor: "#020810",
  drawBg: (ctx, w, h, frame, scale) => {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#020810");
    bg.addColorStop(0.4, "#041020");
    bg.addColorStop(1, "#010408");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Floating bioluminescent particles
    const rand = seeded(55);
    for (let i = 0; i < 35; i++) {
      const px = ((rand() * w + (rand() - 0.5) * 0.3 * frame * scale) % (w * 1.2)) - w * 0.1;
      const py = ((rand() * h + (-0.2 - rand() * 0.5) * frame * scale) % (h * 1.3)) - h * 0.15;
      const hue = 160 + rand() * 40;
      const pulse = 0.6 + Math.sin(frame * 0.05 + rand() * 20) * 0.4;
      const a = (0.1 + rand() * 0.2) * pulse;
      const r = (0.5 + rand() * 1.5) * scale;
      const g = ctx.createRadialGradient(px, py, 0, px, py, r * 6);
      g.addColorStop(0, `hsla(${hue},100%,70%,${a})`);
      g.addColorStop(1, `hsla(${hue},100%,70%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, r * 6, 0, Math.PI * 2); ctx.fill();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Glow behind person
    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    g.addColorStop(0, color.replace(/[\d.]+\)$/, "0.15)"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, size * 1.5, 0, Math.PI * 2); ctx.fill();
    defaultPerson(ctx, x, y, size, color);
  },
  figureColor: (hue, alpha) => {
    const h = hue > 180 ? 180 : 160;
    return `hsla(${h},100%,65%,${alpha * 0.85})`;
  },
  titleColor: "rgba(0,230,200,0.7)",
  counterColor: "rgba(0,200,180,0.4)",
});
