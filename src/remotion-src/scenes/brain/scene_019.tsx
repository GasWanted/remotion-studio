import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 19 — Grid of EM images tiling the screen (4s = 120 frames)
export const Scene019: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(1919);
    const particles = makeParticles(25, width, height, scale);
    const cols = 12, rows = 7;
    const cellW = width / cols, cellH = height / rows;
    const tiles: { x: number; y: number; w: number; h: number; gray: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          x: c * cellW, y: r * cellH, w: cellW, h: cellH,
          gray: 15 + rand() * 25,
          delay: (r * cols + c) * 0.5,
        });
      }
    }
    return { particles, tiles };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    ctx.globalAlpha = alpha;

    // Tiles appear rapidly
    for (const t of data.tiles) {
      const tileAlpha = interpolate(frame - t.delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (tileAlpha <= 0) continue;
      ctx.fillStyle = `rgba(${t.gray * 3},${t.gray * 3},${t.gray * 3.5}, ${tileAlpha * 0.6})`;
      ctx.fillRect(t.x + 1, t.y + 1, t.w - 2, t.h - 2);
      // Subtle internal detail
      ctx.fillStyle = `rgba(${t.gray * 4},${t.gray * 4},${t.gray * 4.5}, ${tileAlpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(t.x + t.w * 0.3, t.y + t.h * 0.4, t.w * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x + t.w * 0.7, t.y + t.h * 0.6, t.w * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid lines
    ctx.strokeStyle = `rgba(255,255,255,0.08)`;
    ctx.lineWidth = 1;
    for (const t of data.tiles) {
      ctx.strokeRect(t.x, t.y, t.w, t.h);
    }

    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
