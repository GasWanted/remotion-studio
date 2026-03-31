import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { drawBg, makeParticles, drawParticles, fadeInOut } from "../theme";

// Shot 40 — Single neuron, alone, simple. Calm beat (4s = 120 frames)
export const Scene040: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, cy = height / 2;
    const pulse = 0.9 + Math.sin(frame * 0.05) * 0.1;
    const r = 16 * scale * pulse;

    // Just one calm neuron
    const bodyGrad = ctx.createRadialGradient(cx - 2 * scale, cy - 2 * scale, 0, cx, cy, r);
    bodyGrad.addColorStop(0, `hsla(280, 55%, 72%, 0.85)`);
    bodyGrad.addColorStop(1, `hsla(280, 45%, 50%, 0.6)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Soft glow
    ctx.fillStyle = `hsla(280, 50%, 60%, ${pulse * 0.08})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
