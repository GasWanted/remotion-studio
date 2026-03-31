import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Phyllotaxis: Fibonacci sunflower pattern — dots appear one by one
 * at the golden angle, spiraling outward. Mathematically beautiful.
 */
export const Phyllotaxis: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const cx = width / 2, cy = height * 0.52;
    const goldenAngle = Math.PI * 2 * (1 - 1 / 1.618033988749895);
    const spacing = 3.8 * scale;
    const total = 210;
    const dots: { x: number; y: number; idx: number }[] = [];

    for (let i = 0; i < total; i++) {
      const angle = i * goldenAngle;
      const r = Math.sqrt(i) * spacing;
      dots.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r * 0.75,
        idx: i,
      });
    }
    return { dots, cx, cy, total };
  }, [width, height, scale]);

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
    ctx.fillText("growth pattern", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Progressive reveal — fast acceleration
    const growT = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(Math.pow(growT, 1.5) * data.total);

    for (let i = 0; i < visibleCount; i++) {
      const dot = data.dots[i];
      const age = (visibleCount - i) / 6;
      const t = easeOutBack(Math.min(1, age));
      if (t < 0.01) continue;

      ctx.globalAlpha = Math.min(1, age) * fadeOut;

      const r = (1.5 + (1 - i / data.total) * 1.5) * scale * t;
      const pulse = 0.92 + Math.sin(frame * 0.05 + i * 1.7) * 0.08;
      const dotR = r * pulse;

      // Glow
      const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR * 3.5);
      g.addColorStop(0, accent(i, 0.12));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 3.5, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath(); ctx.arc(dot.x + 0.5, dot.y + 0.5, dotR, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(i, 0.85);
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(dot.x - dotR * 0.2, dot.y - dotR * 0.2, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Center seed dot
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(data.cx, data.cy, 3 * scale, 0, Math.PI * 2); ctx.fill();

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(200, Math.floor(growT * 200))}+`, width * 0.92, height * 0.94);
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
