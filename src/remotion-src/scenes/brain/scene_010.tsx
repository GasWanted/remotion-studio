import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 10 — Light wavelength vs neuron structures (5s = 150 frames)
export const Scene010: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, waveY = height * 0.35;
    const waveW = width * 0.6;
    const startX = cx - waveW / 2;

    // Light wave — wide wavelength
    const waveAlpha = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * waveAlpha;
    ctx.strokeStyle = `hsla(50, 70%, 65%, 0.7)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    const wavelength = 80 * scale; // wide
    for (let x = 0; x <= waveW; x += 2) {
      const y = waveY + Math.sin((x / wavelength) * Math.PI * 2 + frame * 0.05) * 20 * scale;
      x === 0 ? ctx.moveTo(startX + x, y) : ctx.lineTo(startX + x, y);
    }
    ctx.stroke();

    // Label
    ctx.fillStyle = `hsla(50, 70%, 70%, 0.8)`;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("visible light  λ = 500 nm", cx, waveY - 35 * scale);

    // Neuron structures below (tiny circles too close together)
    const structY = height * 0.6;
    ctx.globalAlpha = alpha;
    const structAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * structAlpha;

    for (let i = 0; i < 12; i++) {
      const x = startX + (i / 11) * waveW;
      const r = 4 * scale;
      ctx.fillStyle = `hsla(280, 45%, 62%, 0.7)`;
      ctx.beginPath();
      ctx.arc(x, structY, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${12 * scale}px monospace`;
    ctx.fillText("neuron structures: 40 nm spacing", cx, structY + 20 * scale);

    // Red X — can't distinguish
    const xAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xAlpha > 0) {
      ctx.globalAlpha = alpha * xAlpha;
      ctx.strokeStyle = `hsla(0, 65%, 55%, 0.8)`;
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 30 * scale, structY - 25 * scale);
      ctx.lineTo(cx + 30 * scale, structY + 25 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 30 * scale, structY - 25 * scale);
      ctx.lineTo(cx - 30 * scale, structY + 25 * scale);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
