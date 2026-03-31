import { makeThemed } from "./factory";

// Blueprint: white-on-blue technical drawing, grid lines, precise
export const BlueprintTech = makeThemed({
  bgColor: "#1a3a6a",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#1a3a6a";
    ctx.fillRect(0, 0, w, h);
    // Fine grid
    ctx.strokeStyle = "rgba(120,170,220,0.12)";
    ctx.lineWidth = 0.5;
    const gs = 20 * scale;
    for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // Major grid
    ctx.strokeStyle = "rgba(120,170,220,0.2)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += gs * 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += gs * 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Technical outline: circle head + body lines
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(x, y - size * 0.5, size * 0.25, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - size * 0.25); ctx.lineTo(x, y + size * 0.2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - size * 0.3, y - size * 0.05); ctx.lineTo(x + size * 0.3, y - size * 0.05); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + size * 0.2); ctx.lineTo(x - size * 0.2, y + size * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + size * 0.2); ctx.lineTo(x + size * 0.2, y + size * 0.45); ctx.stroke();
  },
  figureColor: (_hue, alpha) => `rgba(200,225,255,${alpha * 0.75})`,
  titleColor: "rgba(200,220,255,0.8)",
  counterColor: "rgba(200,220,255,0.45)",
  fontFamily: "monospace",
});
