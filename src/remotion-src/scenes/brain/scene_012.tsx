import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 12 — Blur-to-sharp EM image snap into focus (4s = 120 frames)
export const Scene012: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(1212);
    const particles = makeParticles(30, width, height, scale);
    // Fake EM cross-section blobs
    const blobs: { x: number; y: number; r: number; gray: number }[] = [];
    const cx = width / 2, cy = height / 2, radius = 120 * scale;
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * radius;
      blobs.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        r: (5 + rand() * 12) * scale,
        gray: 40 + rand() * 60,
      });
    }
    return { particles, blobs, cx, cy, radius };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const { cx, cy, radius, blobs } = data;
    // Sharpness: 0 = blurry, 1 = sharp. Snap at frame 50
    const sharpness = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Circular view
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5 * scale, 0, Math.PI * 2);
    ctx.clip();

    // Background
    ctx.fillStyle = `hsl(0, 0%, 15%)`;
    ctx.fillRect(cx - radius - 10, cy - radius - 10, radius * 2 + 20, radius * 2 + 20);

    // EM blobs — blur spreads them, sharp makes them crisp
    for (const b of blobs) {
      const spread = (1 - sharpness) * 20 * scale;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r + spread);
      const g = Math.round(b.gray + sharpness * 30);
      grad.addColorStop(0, `rgba(${g},${g},${g}, ${0.5 + sharpness * 0.4})`);
      grad.addColorStop(0.6, `rgba(${g},${g},${g}, ${(1 - sharpness) * 0.3})`);
      grad.addColorStop(1, `rgba(${g},${g},${g}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + spread, 0, Math.PI * 2);
      ctx.fill();

      // Sharp border
      if (sharpness > 0.5) {
        ctx.strokeStyle = `rgba(${g + 30},${g + 30},${g + 30}, ${(sharpness - 0.5) * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // Border ring
    ctx.strokeStyle = `hsla(280, 40%, 55%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Label
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("ELECTRON MICROSCOPE", cx, cy + radius + 30 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
