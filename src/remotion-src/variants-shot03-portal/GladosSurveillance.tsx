import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, accent } from "./portal-utils";

/**
 * Bar Rise: Vertical bars rising from bottom, each representing a research group.
 * Different heights, staggered timing. Clean data-viz aesthetic.
 * Blue/orange bars on white grid. Numbers along the bars.
 */
export const GladosSurveillance: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const bars = useMemo(() => {
    const rand = seeded(5008);
    const count = 24;
    const barW = (width * 0.78) / count;
    const startX = width * 0.11;
    const baseY = height * 0.85;
    return Array.from({ length: count }, (_, i) => ({
      x: startX + i * barW + barW * 0.15,
      w: barW * 0.7,
      maxH: (0.15 + rand() * 0.5) * height * 0.55,
      delay: i * 2 + rand() * 4,
      count: 2 + Math.floor(rand() * 12),
      isBlue: rand() > 0.35,
      baseY,
    }));
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
    ctx.fillText("research groups", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Baseline
    ctx.strokeStyle = "rgba(160,160,180,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, bars[0].baseY);
    ctx.lineTo(width * 0.92, bars[0].baseY);
    ctx.stroke();

    // Horizontal guide lines
    ctx.strokeStyle = "rgba(160,160,180,0.08)";
    for (let i = 1; i <= 4; i++) {
      const gy = bars[0].baseY - i * height * 0.13;
      ctx.beginPath(); ctx.moveTo(width * 0.08, gy); ctx.lineTo(width * 0.92, gy); ctx.stroke();
    }

    // Bars
    let totalScientists = 0;
    for (const bar of bars) {
      const riseT = interpolate(frame - bar.delay, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (riseT <= 0) continue;

      // Ease-out bounce
      const eased = riseT < 0.7 ? (riseT / 0.7) * 1.06
        : riseT < 0.85 ? 1.06 - ((riseT - 0.7) / 0.15) * 0.06
        : 1.0;
      const h = bar.maxH * eased;
      totalScientists += Math.floor(bar.count * Math.min(riseT, 1));

      ctx.globalAlpha = Math.min(1, riseT * 2) * fadeOut;

      // Bar shadow
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(bar.x + 2, bar.baseY - h + 2, bar.w, h);

      // Bar gradient
      const grad = ctx.createLinearGradient(bar.x, bar.baseY, bar.x, bar.baseY - h);
      if (bar.isBlue) {
        grad.addColorStop(0, C.blueDark);
        grad.addColorStop(0.5, C.blue);
        grad.addColorStop(1, C.blue + "cc");
      } else {
        grad.addColorStop(0, C.orangeDark);
        grad.addColorStop(0.5, C.orange);
        grad.addColorStop(1, C.orange + "cc");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(bar.x, bar.baseY - h, bar.w, h);

      // Highlight strip on left edge
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(bar.x, bar.baseY - h, bar.w * 0.25, h);

      // Top cap (slightly brighter)
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(bar.x, bar.baseY - h, bar.w, 2 * scale);

      // Count label on top (if bar tall enough)
      if (h > 15 * scale && riseT > 0.5) {
        ctx.fillStyle = bar.isBlue ? C.blue : C.orange;
        ctx.font = `600 ${Math.max(5, 6 * scale)}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(String(bar.count), bar.x + bar.w / 2, bar.baseY - h - 4 * scale);
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(totalScientists, 200)}+`, width * 0.92, height * 0.94);
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
