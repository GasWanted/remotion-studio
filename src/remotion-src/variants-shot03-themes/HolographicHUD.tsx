import { makeThemed, defaultPerson } from "./factory";

// Holographic HUD: sci-fi scan lines, HUD frame, targeting aesthetic
export const HolographicHUD = makeThemed({
  bgColor: "#050a12",
  drawBg: (ctx, w, h, frame, scale) => {
    ctx.fillStyle = "#050a12";
    ctx.fillRect(0, 0, w, h);
    // Scan lines
    ctx.fillStyle = "rgba(0,180,255,0.03)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    // HUD corners
    ctx.strokeStyle = "rgba(0,180,255,0.25)";
    ctx.lineWidth = 1.5;
    const m = 8 * scale, c = 20 * scale;
    ctx.beginPath(); ctx.moveTo(m, m + c); ctx.lineTo(m, m); ctx.lineTo(m + c, m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - m - c, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + c); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(m, h - m - c); ctx.lineTo(m, h - m); ctx.lineTo(m + c, h - m); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - m - c, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - c); ctx.stroke();
    // Moving scan bar
    const sy = (frame * 2.5 * scale) % (h + 20 * scale) - 10 * scale;
    const sg = ctx.createLinearGradient(0, sy - 5 * scale, 0, sy + 5 * scale);
    sg.addColorStop(0, "rgba(0,200,255,0)");
    sg.addColorStop(0.5, "rgba(0,200,255,0.08)");
    sg.addColorStop(1, "rgba(0,200,255,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sy - 5 * scale, w, 10 * scale);
  },
  drawFigure: (ctx, x, y, size, color) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    defaultPerson(ctx, x, y, size, color);
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },
  figureColor: (_hue, alpha) => `rgba(0,220,255,${alpha * 0.8})`,
  titleColor: "rgba(0,220,255,0.8)",
  counterColor: "rgba(0,180,255,0.5)",
  fontFamily: "monospace",
});
