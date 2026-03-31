import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 11 — Electron beam shorter wavelength, resolves structures (4s = 120 frames)
export const Scene011: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, waveY = height * 0.35;
    const waveW = width * 0.6;
    const startX = cx - waveW / 2;

    // Wavelength morphs from wide (light) to tight (electron)
    const morph = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wavelength = interpolate(morph, [0, 1], [80 * scale, 8 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hue = interpolate(morph, [0, 1], [50, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.strokeStyle = `hsla(${hue}, 65%, 65%, 0.7)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    for (let x = 0; x <= waveW; x += 1) {
      const y = waveY + Math.sin((x / wavelength) * Math.PI * 2 + frame * 0.08) * 15 * scale;
      x === 0 ? ctx.moveTo(startX + x, y) : ctx.lineTo(startX + x, y);
    }
    ctx.stroke();

    // Label morphs
    ctx.fillStyle = `hsla(${hue}, 65%, 70%, 0.8)`;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    const label = morph < 0.5 ? "visible light  λ = 500 nm" : "electron beam  λ = 0.005 nm";
    ctx.fillText(label, cx, waveY - 30 * scale);

    // Neuron structures — now resolvable
    const structY = height * 0.6;
    for (let i = 0; i < 12; i++) {
      const x = startX + (i / 11) * waveW;
      ctx.fillStyle = `hsla(280, 45%, 62%, 0.7)`;
      ctx.beginPath();
      ctx.arc(x, structY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green check when morphed
    if (morph > 0.8) {
      const checkAlpha = interpolate(morph, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = alpha * checkAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
      ctx.fillText("✓ fully resolved", cx, structY + 30 * scale);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
