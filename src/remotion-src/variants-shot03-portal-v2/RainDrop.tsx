import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Rain Drop: Scientists fall from the top like raindrops, landing
 * in a grid formation with a subtle bounce. Staggered by column.
 */
export const RainDrop: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const dots = useMemo(() => {
    const rand = seeded(5102);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.3;
    const list: { tx: number; ty: number; delay: number; col: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= 208) break;
        list.push({
          tx: startX + c * cellW + cellW / 2,
          ty: startY + r * cellH + cellH / 2,
          delay: c * 1.8 + r * 0.6 + rand() * 3,
          col: c,
        });
      }
    }
    return { list, cellW, cellH };
  }, [width, height]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    drawDotGrid(ctx, width, height, scale);
    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("assembling the team", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    let visibleCount = 0;
    const r = Math.min(dots.cellW, dots.cellH) * 0.18;

    for (const dot of dots.list) {
      const rawT = (frame - dot.delay) / 14;
      if (rawT <= 0) continue;
      visibleCount++;
      const t = Math.min(1, rawT);

      // Bounce easing
      const eased = easeOutBack(t);
      const fallDist = dot.ty + 30 * scale; // from above screen
      const currentY = -20 * scale + fallDist * eased;

      // Clamp to target after settling
      const finalY = t >= 1 ? dot.ty : currentY;

      ctx.globalAlpha = Math.min(1, rawT * 2) * fadeOut;

      // Drop shadow (grows as dot approaches landing)
      const shadowAlpha = Math.min(0.08, t * 0.08);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.beginPath(); ctx.arc(dot.tx + 1, dot.ty + 1, r, 0, Math.PI * 2); ctx.fill();

      // Glow
      const g = ctx.createRadialGradient(dot.tx, finalY, 0, dot.tx, finalY, r * 3.5);
      g.addColorStop(0, accent(dot.col, 0.12));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(dot.tx, finalY, r * 3.5, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(dot.col, 0.85);
      ctx.beginPath(); ctx.arc(dot.tx, finalY, r, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(dot.tx - r * 0.2, finalY - r * 0.25, r * 0.3, 0, Math.PI * 2); ctx.fill();

      // Splash ring on landing
      if (rawT > 0.9 && rawT < 1.8) {
        const splashT = (rawT - 0.9) / 0.9;
        ctx.globalAlpha = (1 - splashT) * 0.2 * fadeOut;
        ctx.strokeStyle = accent(dot.col, 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(dot.tx, dot.ty, r + splashT * r * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(200, visibleCount)}+`, width * 0.92, height * 0.94);
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("scientists", width * 0.92, height * 0.97);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
