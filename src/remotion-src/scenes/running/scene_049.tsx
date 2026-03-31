import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 49 — Fly silhouette feeding (proboscis down) (3s = 90 frames)
export const Scene049: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, cy = height * 0.4;

    // Fly silhouette (simple shapes)
    // Body
    ctx.fillStyle = `hsla(280, 25%, 40%, 0.7)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 40 * scale, 25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(cx + 45 * scale, cy - 5 * scale, 18 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillStyle = `hsla(220, 30%, 50%, 0.3)`;
    ctx.beginPath();
    ctx.ellipse(cx - 5 * scale, cy - 15 * scale, 35 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Legs (three on each side)
    ctx.strokeStyle = `hsla(280, 20%, 45%, 0.6)`;
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 3; i++) {
      const lx = cx - 15 * scale + i * 20 * scale;
      ctx.beginPath();
      ctx.moveTo(lx, cy + 20 * scale);
      ctx.lineTo(lx - 10 * scale, cy + 55 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx, cy + 20 * scale);
      ctx.lineTo(lx + 10 * scale, cy + 55 * scale);
      ctx.stroke();
    }

    // Proboscis (extending down to food)
    const probLen = 35 * scale;
    ctx.strokeStyle = `hsla(30, 35%, 55%, 0.7)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 55 * scale, cy + 8 * scale);
    ctx.lineTo(cx + 55 * scale, cy + 8 * scale + probLen);
    ctx.stroke();

    // Food
    const foodY = cy + 8 * scale + probLen + 8 * scale;
    ctx.fillStyle = `hsla(50, 65%, 60%, 0.7)`;
    ctx.beginPath();
    ctx.arc(cx + 55 * scale, foodY, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${16 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("The brain wants to eat.", cx, height * 0.82);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
