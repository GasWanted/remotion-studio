import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 31 — "FlyWire" label with subtle glow (3s = 90 frames)
export const Scene031: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, cy = height / 2;

    // Subtle pulse glow behind text
    const pulse = 0.5 + Math.sin(frame * 0.06) * 0.2;
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * scale);
    glowGrad.addColorStop(0, `hsla(180, 50%, 60%, ${pulse * 0.1})`);
    glowGrad.addColorStop(1, `hsla(180, 50%, 60%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 120 * scale, 0, Math.PI * 2);
    ctx.fill();

    // FlyWire text
    const textAlpha = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * textAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${56 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FlyWire", cx, cy);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
