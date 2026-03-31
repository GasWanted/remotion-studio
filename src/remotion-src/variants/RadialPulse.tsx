import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Concentric rings expand outward from center, layering up
export const RadialPulse: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.max(width, height) * 0.6;

    // Emit a ring every 15 frames
    const ringInterval = 15;
    const nRings = Math.floor(frame / ringInterval);

    for (let i = 0; i <= nRings; i++) {
      const birthFrame = i * ringInterval;
      const age = frame - birthFrame;
      const r = age * 2.5;
      if (r > maxR) continue;

      const alpha = Math.max(0, 1 - r / maxR) * 0.6;
      const hue = (i * 25) % 360;

      ctx.strokeStyle = `hsla(${hue}, 70%, 55%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner glow
      if (age < 10) {
        const glowAlpha = (1 - age / 10) * 0.3;
        ctx.fillStyle = `hsla(${hue}, 70%, 55%, ${glowAlpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Center dot
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
