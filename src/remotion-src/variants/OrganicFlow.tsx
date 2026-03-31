import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Flowing organic tendrils that branch and pulse
export const OrganicFlow: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeIn * fadeOut;

    const nTendrils = 6;
    const t = frame * 0.015;

    for (let n = 0; n < nTendrils; n++) {
      const baseAngle = (n / nTendrils) * Math.PI * 2;
      const startX = width / 2 + Math.cos(baseAngle) * 20;
      const startY = height / 2 + Math.sin(baseAngle) * 20;

      const steps = Math.floor(interpolate(frame, [5, 180], [5, 80], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      }));

      ctx.beginPath();
      ctx.moveTo(startX, startY);

      let px = startX;
      let py = startY;
      let angle = baseAngle;

      for (let s = 0; s < steps; s++) {
        const st = s / 80;
        angle += Math.sin(t + s * 0.2 + n) * 0.15;
        const len = 4 + st * 2;
        px += Math.cos(angle) * len;
        py += Math.sin(angle) * len;
        ctx.lineTo(px, py);
      }

      const hue = (n * 60 + frame) % 360;
      ctx.strokeStyle = `hsla(${hue}, 60%, 50%, 0.4)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow at tips
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
