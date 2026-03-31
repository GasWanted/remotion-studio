import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 20 — Zoom into one EM image: dense neuron cross-sections (4s = 120 frames)
export const Scene020: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2020);
    const particles = makeParticles(30, width, height, scale);
    const cx = width / 2, cy = height * 0.45;
    const blobs: { x: number; y: number; r: number; gray: number }[] = [];
    for (let i = 0; i < 80; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * 140 * scale;
      blobs.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        r: (4 + rand() * 10) * scale,
        gray: 35 + rand() * 50,
      });
    }
    return { particles, blobs, cx, cy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Zoom effect — start from grid overview, zoom into single
    const zoom = interpolate(frame, [5, 40], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // EM image background
    ctx.fillStyle = `rgba(20, 18, 25, 0.9)`;
    ctx.beginPath();
    ctx.arc(data.cx, data.cy, 150 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Neuron blobs
    for (const b of data.blobs) {
      const g = Math.round(b.gray);
      ctx.fillStyle = `rgba(${g}, ${g}, ${g + 10}, 0.8)`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      // Membrane border
      ctx.strokeStyle = `rgba(${g + 20}, ${g + 20}, ${g + 25}, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
    }

    ctx.restore();

    // Slice label
    const labelAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * labelAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("Slice #3,847 of 7,050", width / 2, height * 0.82);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
