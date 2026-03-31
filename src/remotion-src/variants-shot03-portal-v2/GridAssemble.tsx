import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, accent } from "./portal-v2-utils";

/**
 * Grid Assemble: Scientists fly in from random off-screen positions
 * and land in a precise grid formation. Satisfying snap-into-place.
 */
export const GridAssemble: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const dots = useMemo(() => {
    const rand = seeded(5105);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.3;
    const list: { tx: number; ty: number; sx: number; sy: number; delay: number; idx: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= 208) break;
        // Random start position (off-screen or scattered)
        const edge = Math.floor(rand() * 4);
        let sx: number, sy: number;
        if (edge === 0) { sx = -30 - rand() * 60; sy = rand() * height; }
        else if (edge === 1) { sx = width + 30 + rand() * 60; sy = rand() * height; }
        else if (edge === 2) { sx = rand() * width; sy = -30 - rand() * 60; }
        else { sx = rand() * width; sy = height + 30 + rand() * 60; }

        list.push({
          tx: startX + c * cellW + cellW / 2,
          ty: startY + r * cellH + cellH / 2,
          sx, sy,
          delay: rand() * 50 + Math.sqrt((c - 8) * (c - 8) + (r - 6) * (r - 6)) * 2,
          idx: list.length,
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
    ctx.fillText("team assembly", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    const r = Math.min(dots.cellW, dots.cellH) * 0.17;
    let visibleCount = 0;

    for (const dot of dots.list) {
      const rawT = (frame - dot.delay) / 18;
      if (rawT <= 0) continue;
      visibleCount++;
      const t = Math.min(1, rawT);

      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const x = dot.sx + (dot.tx - dot.sx) * eased;
      const y = dot.sy + (dot.ty - dot.sy) * eased;

      ctx.globalAlpha = Math.min(1, rawT * 3) * fadeOut;

      // Motion trail (while in flight)
      if (t < 0.9) {
        const prevT = Math.max(0, t - 0.08);
        const prevEased = 1 - Math.pow(1 - prevT, 3);
        const px = dot.sx + (dot.tx - dot.sx) * prevEased;
        const py = dot.sy + (dot.ty - dot.sy) * prevEased;
        ctx.strokeStyle = accent(dot.idx, 0.12);
        ctx.lineWidth = r * 0.8;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(x, y); ctx.stroke();
      }

      // Glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, accent(dot.idx, 0.12));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r * 3, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath(); ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(dot.idx, 0.85);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.3, 0, Math.PI * 2); ctx.fill();
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
