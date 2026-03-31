import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 25 — AI segmentation error highlighted (4s = 120 frames)
export const Scene025: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2525);
    const particles = makeParticles(30, width, height, scale);
    const cx = width / 2, cy = height * 0.48;
    const blobs: { x: number; y: number; r: number; hue: number; isError: boolean }[] = [];
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * 120 * scale;
      const isError = i === 5 || i === 12; // Two blobs that should be same color
      blobs.push({
        x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d,
        r: (6 + rand() * 8) * scale,
        hue: isError ? (i === 5 ? 220 : 140) : PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
        isError,
      });
    }
    return { particles, blobs };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Segmented blobs
    for (const b of data.blobs) {
      ctx.fillStyle = `hsla(${b.hue}, 55%, 58%, 0.8)`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Error highlight — red circle around the mismatched pair
    const errorAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errorAlpha > 0) {
      ctx.globalAlpha = alpha * errorAlpha;
      const pulse = 0.6 + Math.sin(frame * 0.12) * 0.4;
      for (const b of data.blobs.filter(b => b.isError)) {
        ctx.strokeStyle = `hsla(0, 65%, 55%, ${pulse * 0.8})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 5 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dotted line between them (should be connected)
      const errBlobs = data.blobs.filter(b => b.isError);
      if (errBlobs.length >= 2) {
        ctx.strokeStyle = `hsla(0, 60%, 55%, ${pulse * 0.5})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.setLineDash([5 * scale, 4 * scale]);
        ctx.beginPath();
        ctx.moveTo(errBlobs[0].x, errBlobs[0].y);
        ctx.lineTo(errBlobs[1].x, errBlobs[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Error label
      ctx.fillStyle = `hsla(0, 60%, 60%, 0.8)`;
      ctx.font = `${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("⊘ AI error — split one neuron into two", width / 2, height * 0.85);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
