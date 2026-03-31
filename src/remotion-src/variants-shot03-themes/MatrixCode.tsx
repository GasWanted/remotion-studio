import { makeThemed, seeded } from "./factory";

// Matrix: green code rain, characters instead of person icons
export const MatrixCode = makeThemed({
  bgColor: "#000000",
  drawBg: (ctx, w, h, frame, scale) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    // Falling code columns
    const rand = seeded(101);
    const colW = 12 * scale;
    const charH = 14 * scale;
    const count = Math.ceil(w / colW);
    ctx.font = `${Math.max(8, 10 * scale)}px monospace`;
    for (let i = 0; i < count; i++) {
      const speed = 1 + rand() * 3;
      const offset = rand() * 100;
      const baseY = (frame * speed + offset * charH) % (h + charH * 10);
      for (let j = 0; j < 20; j++) {
        const y = baseY - j * charH;
        if (y < -charH || y > h + charH) continue;
        const a = j === 0 ? 0.9 : Math.max(0, 0.35 - j * 0.018);
        ctx.fillStyle = j === 0 ? `rgba(180,255,180,${a})` : `rgba(0,180,0,${a})`;
        const ch = String.fromCharCode(0x30A0 + Math.floor(rand() * 96));
        ctx.fillText(ch, i * colW, y);
      }
    }
  },
  drawFigure: (ctx, x, y, size, color) => {
    // Matrix glyphs instead of people
    ctx.fillStyle = color;
    ctx.font = `${size * 1.6}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const ch = String.fromCharCode(0x30A0 + ((x * 7 + y * 3) % 96));
    ctx.fillText(ch, x, y);
    ctx.textBaseline = "alphabetic";
  },
  figureColor: (_hue, alpha) => `rgba(0,255,80,${alpha * 0.85})`,
  titleColor: "rgba(0,255,80,0.9)",
  counterColor: "rgba(0,200,0,0.5)",
  fontFamily: "monospace",
});
