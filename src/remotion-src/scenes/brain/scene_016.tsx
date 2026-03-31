import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 16 — Ultramicrotome shaving thin sections off resin block (5s = 150 frames)
export const Scene016: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const blockX = width * 0.3, blockY = height * 0.45;
    const blockW = 70 * scale, blockH = 80 * scale;

    // Resin block
    ctx.fillStyle = `hsla(35, 45%, 40%, 0.7)`;
    ctx.fillRect(blockX - blockW / 2, blockY - blockH / 2, blockW, blockH);
    ctx.strokeStyle = `hsla(35, 40%, 55%, 0.5)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(blockX - blockW / 2, blockY - blockH / 2, blockW, blockH);

    // Blade edge (right of block)
    ctx.strokeStyle = `hsla(0, 0%, 80%, 0.7)`;
    ctx.lineWidth = 2 * scale;
    const bladeX = blockX + blockW / 2 + 5 * scale;
    ctx.beginPath();
    ctx.moveTo(bladeX, blockY - blockH * 0.7);
    ctx.lineTo(bladeX, blockY + blockH * 0.7);
    ctx.stroke();

    // Sections peeling off (rhythmic)
    const numSlices = Math.floor(interpolate(frame, [20, 120], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < numSlices; i++) {
      const sx = bladeX + 15 * scale + i * 18 * scale;
      const sy = blockY;
      ctx.fillStyle = `hsla(50, 50%, 70%, ${0.4 - i * 0.03})`;
      ctx.fillRect(sx, sy - blockH * 0.35, 2 * scale, blockH * 0.7);
    }

    // Scale comparison (bottom)
    const scaleAlpha = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * scaleAlpha;

    const barY = height * 0.78;
    // Hair
    ctx.fillStyle = `hsla(30, 30%, 50%, 0.7)`;
    ctx.fillRect(width * 0.4, barY, 120 * scale, 6 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("hair: 75,000 nm", width * 0.4 + 60 * scale, barY + 22 * scale);

    // Slice (tiny)
    ctx.fillStyle = `hsla(50, 50%, 70%, 0.8)`;
    ctx.fillRect(width * 0.4, barY + 35 * scale, 1 * scale, 6 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.fillText("slice: 40 nm", width * 0.4 + 40 * scale, barY + 55 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
