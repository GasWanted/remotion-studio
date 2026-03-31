import { makeThemed } from "./factory";

// Neon Sign: glowing tube outlines on dark brick, buzzing bar aesthetic
export const NeonSign = makeThemed({
  bgColor: "#1a1210",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#1a1210";
    ctx.fillRect(0, 0, w, h);
    // Brick texture hint
    ctx.strokeStyle = "rgba(80,50,30,0.12)";
    ctx.lineWidth = 0.5;
    const bw = 20 * scale, bh = 10 * scale;
    for (let row = 0; row < h / bh; row++) {
      const offset = row % 2 === 0 ? 0 : bw / 2;
      for (let x = -bw; x < w + bw; x += bw) {
        ctx.strokeRect(x + offset, row * bh, bw, bh);
      }
    }
    // Ambient neon glow wash
    const ng = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.5);
    ng.addColorStop(0, "rgba(255,0,100,0.04)");
    ng.addColorStop(0.5, "rgba(0,100,255,0.02)");
    ng.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, w, h);
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Neon tube outline person (glowing)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    // Head
    ctx.beginPath(); ctx.arc(x, y - size * 0.5, size * 0.22, 0, Math.PI * 2); ctx.stroke();
    // Body + shoulders
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y + size * 0.4);
    ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.05, x, y - size * 0.2);
    ctx.quadraticCurveTo(x + size * 0.35, y - size * 0.05, x + size * 0.35, y + size * 0.4);
    ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  },
  figureColor: (hue, alpha) => {
    const colors = ["rgba(255,50,100,A)", "rgba(50,150,255,A)", "rgba(0,255,200,A)", "rgba(255,200,50,A)", "rgba(200,50,255,A)"];
    const c = colors[Math.abs(hue) % colors.length];
    return c.replace("A", String(alpha * 0.9));
  },
  titleColor: "rgba(255,50,100,0.9)",
  counterColor: "rgba(255,100,150,0.45)",
  fontFamily: "monospace",
});
