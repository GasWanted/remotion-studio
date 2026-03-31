import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, accent } from "./portal-v2-utils";

/**
 * Pendulum Wave: Scientists swing in from above on invisible pendulums.
 * Different column = different pendulum length = different period.
 * Creates a mesmerizing wave pattern as they settle into position.
 */
export const PendulumWave: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(5108);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.3;
    const list: { tx: number; ty: number; col: number; row: number; period: number; delay: number; idx: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= 208) break;
        // Period varies by column (creates wave)
        const period = 12 + c * 1.5;
        list.push({
          tx: startX + c * cellW + cellW / 2,
          ty: startY + r * cellH + cellH / 2,
          col: c, row: r,
          period,
          delay: r * 4 + rand() * 3,
          idx: list.length,
        });
      }
    }
    return { list, cellW, cellH, startY };
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
    ctx.fillText("synchronized effort", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    const r = Math.min(data.cellW, data.cellH) * 0.17;
    let visibleCount = 0;

    for (const dot of data.list) {
      const elapsed = frame - dot.delay;
      if (elapsed <= 0) continue;
      visibleCount++;

      // Damped pendulum: angle = A * e^(-bt) * sin(wt)
      const damping = 0.04;
      const amplitude = 50 * scale;
      const omega = (2 * Math.PI) / dot.period;
      const swingX = amplitude * Math.exp(-damping * elapsed) * Math.sin(omega * elapsed);

      // Vertical: starts above, drops to position
      const dropT = Math.min(1, elapsed / 15);
      const eased = 1 - Math.pow(1 - dropT, 2);
      const y = -20 * scale + (dot.ty + 20 * scale) * eased;
      const x = dot.tx + swingX;

      ctx.globalAlpha = Math.min(1, elapsed / 5) * fadeOut;

      // Thread line (faint string from above)
      if (elapsed < 60) {
        ctx.strokeStyle = "rgba(180,180,200,0.1)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(dot.tx, data.startY - 15 * scale);
        ctx.lineTo(x, y);
        ctx.stroke();
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
