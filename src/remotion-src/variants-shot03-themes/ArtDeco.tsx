import { makeThemed, defaultPerson, seeded } from "./factory";

// Art Deco: gold on black, geometric fan patterns, Gatsby elegance
export const ArtDeco = makeThemed({
  bgColor: "#0a0a0a",
  drawBg: (ctx, w, h, _f, scale) => {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
    // Geometric fan/sunburst patterns
    ctx.strokeStyle = "rgba(200,170,80,0.1)";
    ctx.lineWidth = 1;
    // Top center fan
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI / 2) + (i - 6) * 0.12;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2 + Math.cos(a) * w * 0.6, Math.sin(a) * w * 0.6);
      ctx.stroke();
    }
    // Concentric arcs from top
    for (let r = 50; r < w * 0.5; r += 30 * scale) {
      ctx.beginPath();
      ctx.arc(w / 2, 0, r, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
    // Chevron border at bottom
    ctx.strokeStyle = "rgba(200,170,80,0.15)";
    ctx.lineWidth = 1.5;
    const chevW = 20 * scale;
    for (let x = 0; x < w; x += chevW) {
      ctx.beginPath();
      ctx.moveTo(x, h - 10 * scale);
      ctx.lineTo(x + chevW / 2, h - 18 * scale);
      ctx.lineTo(x + chevW, h - 10 * scale);
      ctx.stroke();
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    defaultPerson(ctx, x, y, size, color);
    // Gold outline
    ctx.strokeStyle = "rgba(200,170,80,0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(x, y - size * 0.55, size * 0.32, 0, Math.PI * 2); ctx.stroke();
  },
  figureColor: (hue, alpha) => {
    // Gold tones
    const g = hue > 180 ? 170 : 140;
    return `rgba(200,${g},80,${alpha * 0.85})`;
  },
  titleColor: "rgba(220,190,100,0.9)",
  counterColor: "rgba(200,170,80,0.45)",
  fontFamily: "Georgia, serif",
});
