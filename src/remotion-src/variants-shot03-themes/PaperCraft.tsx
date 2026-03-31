import { makeThemed, defaultPerson } from "./factory";

// Paper Craft: layered cut paper, warm cream, drop shadows
export const PaperCraft = makeThemed({
  bgColor: "#f5f0e0",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#f5f0e0";
    ctx.fillRect(0, 0, w, h);
    // Paper texture dots
    ctx.fillStyle = "rgba(180,170,150,0.08)";
    for (let i = 0; i < 200; i++) {
      const px = ((i * 73 + 17) % 200) / 200 * w;
      const py = ((i * 41 + 89) % 200) / 200 * h;
      ctx.fillRect(px, py, 1, 1);
    }
    // Layered paper strips
    const layers = [
      { y: 0.75, c: "rgba(220,200,170,0.5)" },
      { y: 0.6, c: "rgba(200,180,150,0.3)" },
      { y: 0.85, c: "rgba(230,215,185,0.4)" },
    ];
    for (const l of layers) {
      ctx.fillStyle = l.c;
      ctx.beginPath();
      ctx.moveTo(0, l.y * h);
      for (let x = 0; x <= w; x += 40 * scale) {
        ctx.lineTo(x, l.y * h + Math.sin(x * 0.01) * 8 * scale);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h);
      ctx.fill();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Shadow under person
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    defaultPerson(ctx, x + 1.5, y + 1.5, size, "rgba(0,0,0,0.08)");
    // Person
    defaultPerson(ctx, x, y, size, color);
  },
  figureColor: (hue, alpha) => `hsla(${hue},45%,50%,${alpha * 0.85})`,
  titleColor: "rgba(80,60,40,0.85)",
  counterColor: "rgba(100,80,60,0.5)",
  fadeRgb: "245,240,224",
});
