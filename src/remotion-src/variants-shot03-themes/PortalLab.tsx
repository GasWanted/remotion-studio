import { makeThemed, defaultPerson } from "./factory";

// Portal 2 Aperture Science: white test chamber panels, blue/orange accents
export const PortalLab = makeThemed({
  bgColor: "#f0f0f0",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, w, h);
    // Panel grid
    ctx.strokeStyle = "rgba(180,180,180,0.5)";
    ctx.lineWidth = 1;
    const ps = 40 * scale;
    for (let x = 0; x < w; x += ps) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += ps) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Panel inset shadows
    ctx.strokeStyle = "rgba(200,200,200,0.3)";
    ctx.lineWidth = 2;
    for (let x = ps; x < w; x += ps * 3) {
      for (let y = ps; y < h; y += ps * 3) {
        ctx.strokeRect(x + 2, y + 2, ps * 2 - 4, ps * 2 - 4);
      }
    }
  },
  drawFigure: defaultPerson,
  figureColor: (hue, alpha) => hue > 180 ? `rgba(0,130,255,${alpha * 0.85})` : `rgba(255,140,0,${alpha * 0.85})`,
  titleColor: "rgba(60,60,60,0.9)",
  counterColor: "rgba(80,80,80,0.6)",
  fontFamily: "monospace",
  fadeRgb: "240,240,240",
});
