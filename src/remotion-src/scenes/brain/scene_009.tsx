import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 09 — Light microscope can't resolve neurons (4s = 120 frames)
export const Scene009: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    // Microscope icon (left)
    const mx = width * 0.25, my = height * 0.45;
    ctx.strokeStyle = `hsla(220, 40%, 65%, 0.7)`;
    ctx.lineWidth = 3 * scale;
    // Eyepiece
    ctx.beginPath();
    ctx.moveTo(mx, my - 50 * scale);
    ctx.lineTo(mx, my + 30 * scale);
    ctx.stroke();
    // Lens
    ctx.beginPath();
    ctx.arc(mx, my + 40 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.stroke();
    // Base
    ctx.beginPath();
    ctx.moveTo(mx - 20 * scale, my + 55 * scale);
    ctx.lineTo(mx + 20 * scale, my + 55 * scale);
    ctx.stroke();
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("light microscope", mx, my + 80 * scale);

    // Arrow
    const arrowProgress = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(220, 40%, 65%, ${arrowProgress * 0.4})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(mx + 30 * scale, my);
    ctx.lineTo(mx + 30 * scale + arrowProgress * width * 0.2, my);
    ctx.stroke();

    // Blurry result (right) — a circular magnified view that's all blurry
    const bx = width * 0.65, by = height * 0.45, br = 80 * scale;
    const blurAlpha = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.globalAlpha = alpha * blurAlpha;
    // Circle border
    ctx.strokeStyle = `hsla(280, 40%, 55%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.stroke();

    // Blurry blobs inside
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, br - 2, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const r = 25 * scale + Math.sin(i * 3.7) * 15 * scale;
      const x = bx + Math.cos(angle) * r;
      const y = by + Math.sin(angle) * r;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 25 * scale);
      grad.addColorStop(0, `hsla(${180 + i * 20}, 30%, 50%, 0.3)`);
      grad.addColorStop(1, `hsla(${180 + i * 20}, 30%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - 25 * scale, y - 25 * scale, 50 * scale, 50 * scale);
    }
    ctx.restore();

    // "can't resolve" label
    ctx.fillStyle = `hsla(0, 60%, 60%, ${blurAlpha * 0.8})`;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("can't resolve", bx, by + br + 25 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
