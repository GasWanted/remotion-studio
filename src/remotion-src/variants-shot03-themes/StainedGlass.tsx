import { makeThemed, defaultPerson, seeded } from "./factory";

// Stained Glass: cathedral window, jewel-toned polygons, lead lines
export const StainedGlass = makeThemed({
  bgColor: "#0a0a14",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, w, h);
    // Colored glass panels
    const rand = seeded(222);
    const hues = [0, 30, 50, 120, 200, 260, 300, 340];
    for (let i = 0; i < 20; i++) {
      const cx = rand() * w, cy = rand() * h;
      const r = (30 + rand() * 60) * scale;
      const hue = hues[Math.floor(rand() * hues.length)];
      // Glass panel (polygon approximated as circle)
      ctx.fillStyle = `hsla(${hue},60%,35%,0.12)`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // Lead outline
      ctx.strokeStyle = "rgba(40,40,50,0.4)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
    // Warm light glow from above
    const lg = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.8);
    lg.addColorStop(0, "rgba(255,220,150,0.06)");
    lg.addColorStop(1, "rgba(255,220,150,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Person with lead-line outline
    defaultPerson(ctx, x, y, size, color);
    ctx.strokeStyle = "rgba(30,30,40,0.4)";
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2); ctx.stroke();
  },
  figureColor: (hue, alpha) => `hsla(${hue},65%,55%,${alpha * 0.85})`,
  titleColor: "rgba(255,220,150,0.85)",
  counterColor: "rgba(255,220,150,0.4)",
});
