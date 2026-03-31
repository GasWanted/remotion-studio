import { makeThemed } from "./factory";

// Infrared Thermal: heat-map colors, thermal camera look
export const InfraredThermal = makeThemed({
  bgColor: "#0a0018",
  drawBg: (ctx, w, h) => {
    // Dark purple base
    ctx.fillStyle = "#0a0018";
    ctx.fillRect(0, 0, w, h);
    // Ambient heat glow in center
    const hg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.5);
    hg.addColorStop(0, "rgba(80,0,120,0.15)");
    hg.addColorStop(0.5, "rgba(40,0,80,0.08)");
    hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, w, h);
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Heat glow around person
    const g = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    g.addColorStop(0, color.replace(/[\d.]+\)$/, "0.2)"));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, size * 2, 0, Math.PI * 2); ctx.fill();
    // Person blob
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - size * 0.45, y + size * 0.45);
    ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.05, x, y - size * 0.15);
    ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.05, x + size * 0.45, y + size * 0.45);
    ctx.fill();
  },
  figureColor: (hue, alpha) => {
    // Map hue to thermal: cold=blue, warm=red, hot=yellow
    if (hue < 100) return `rgba(255,200,50,${alpha * 0.9})`;
    if (hue < 200) return `rgba(255,80,30,${alpha * 0.9})`;
    return `rgba(200,40,180,${alpha * 0.85})`;
  },
  titleColor: "rgba(255,200,50,0.85)",
  counterColor: "rgba(255,150,50,0.5)",
});
