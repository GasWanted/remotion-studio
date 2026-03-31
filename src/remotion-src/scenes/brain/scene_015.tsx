import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 15 — Brain encased in resin block (4s = 120 frames)
export const Scene015: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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
    const blockW = 100 * scale, blockH = 70 * scale;

    // Resin fills up around brain
    const fillProgress = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const solidify = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Block outline
    const blockAlpha = 0.3 + solidify * 0.4;
    ctx.fillStyle = `hsla(35, 50%, 45%, ${blockAlpha * fillProgress})`;
    const fillH = blockH * fillProgress;
    // Filled portion from bottom up
    ctx.fillRect(cx - blockW, cy + blockH - fillH, blockW * 2, fillH);

    // Block border
    ctx.strokeStyle = `hsla(35, 40%, 55%, ${0.3 + solidify * 0.4})`;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(cx - blockW, cy - blockH, blockW * 2, blockH * 2);

    // Brain inside
    ctx.fillStyle = `hsla(250, 20%, 45%, 0.7)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22 * scale, 17 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(250, 25%, 55%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("← resin block", cx + blockW + 20 * scale, cy);

    // Slight 3D rotation hint
    if (solidify > 0.5) {
      const rotAlpha = (solidify - 0.5) * 0.3;
      ctx.strokeStyle = `hsla(35, 40%, 55%, ${rotAlpha})`;
      ctx.lineWidth = 1 * scale;
      // Top face hint
      ctx.beginPath();
      ctx.moveTo(cx - blockW, cy - blockH);
      ctx.lineTo(cx - blockW + 15 * scale, cy - blockH - 10 * scale);
      ctx.lineTo(cx + blockW + 15 * scale, cy - blockH - 10 * scale);
      ctx.lineTo(cx + blockW, cy - blockH);
      ctx.stroke();
      // Right face hint
      ctx.beginPath();
      ctx.moveTo(cx + blockW, cy - blockH);
      ctx.lineTo(cx + blockW + 15 * scale, cy - blockH - 10 * scale);
      ctx.lineTo(cx + blockW + 15 * scale, cy + blockH - 10 * scale);
      ctx.lineTo(cx + blockW, cy + blockH);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
