import { makeThemed, defaultPerson } from "./factory";

// Kurzgesagt: warm navy background, soft pastel circles, friendly
export const KurzgesagtWarm = makeThemed({
  bgColor: "#1a2744",
  drawBg: (ctx, w, h) => {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#1a2744");
    bg.addColorStop(0.5, "#1e3a5f");
    bg.addColorStop(1, "#162040");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    // Soft background circles
    const circles = [
      { x: 0.15, y: 0.7, r: 0.2, c: "rgba(255,180,60,0.06)" },
      { x: 0.85, y: 0.3, r: 0.25, c: "rgba(100,200,255,0.05)" },
      { x: 0.5, y: 0.9, r: 0.3, c: "rgba(255,120,80,0.04)" },
      { x: 0.3, y: 0.2, r: 0.15, c: "rgba(180,255,160,0.05)" },
    ];
    for (const c of circles) {
      ctx.fillStyle = c.c;
      ctx.beginPath();
      ctx.arc(c.x * w, c.y * h, c.r * Math.max(w, h), 0, Math.PI * 2);
      ctx.fill();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    defaultPerson(ctx, x, y, size, color);
    // Tiny eye highlight for friendliness
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(x + size * 0.08, y - size * 0.6, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  figureColor: (hue, alpha) => `hsla(${hue},55%,65%,${alpha * 0.9})`,
  titleColor: "#e8c170",
  counterColor: "rgba(255,255,255,0.45)",
});
