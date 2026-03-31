import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 35 — "1 simple rule" text, neuron pulses gently (3s = 90 frames)
export const Scene035: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2, cy = height * 0.45;

    // Single neuron (pulsing)
    const pulse = 0.85 + Math.sin(frame * 0.08) * 0.15;
    const r = 20 * scale * pulse;
    const bodyGrad = ctx.createRadialGradient(cx - 3 * scale, cy - 3 * scale, 0, cx, cy, r);
    bodyGrad.addColorStop(0, `hsla(280, 55%, 72%, 0.9)`);
    bodyGrad.addColorStop(1, `hsla(280, 45%, 52%, 0.7)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = `hsla(280, 50%, 60%, ${pulse * 0.12})`;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Text
    const textAlpha = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * textAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${32 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("1 simple rule", cx, cy + 60 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
