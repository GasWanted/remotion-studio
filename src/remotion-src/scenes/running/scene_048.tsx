import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 48 — Feeding neuron starts firing on output side of raster (4s = 120 frames)
export const Scene048: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(4848);
    const particles = makeParticles(20, width, height, scale);
    const spikes: { row: number; time: number }[] = [];
    for (let r = 0; r < 50; r++) {
      const n = 2 + Math.floor(rand() * 5);
      for (let s = 0; s < n; s++) spikes.push({ row: r, time: rand() * 100 });
    }
    return { particles, spikes };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const rL = width * 0.12, rR = width * 0.85;
    const rT = height * 0.12, rB = height * 0.75;
    const rW = rR - rL, rH = rB - rT;

    // Background activity (dimmed)
    ctx.globalAlpha = alpha * 0.3;
    for (const spike of data.spikes) {
      const x = rL + (spike.time / 100) * rW;
      const y = rT + (spike.row / 50) * rH * 0.85;
      ctx.fillStyle = `hsla(220, 35%, 50%, 0.5)`;
      ctx.fillRect(x, y, 2 * scale, 2 * scale);
    }

    // Feeding neuron (highlighted row at bottom)
    ctx.globalAlpha = alpha;
    const feedY = rB - rH * 0.06;
    const feedAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Rhythmic spikes for feeding neuron
    if (feedAlpha > 0) {
      ctx.globalAlpha = alpha * feedAlpha;
      for (let t = 35; t < frame; t += 5) { // ~6Hz at 30fps
        const x = rL + ((t / 120) * rW);
        if (x > rR) continue;
        ctx.fillStyle = `hsla(140, 60%, 65%, 0.9)`;
        ctx.fillRect(x, feedY - 3 * scale, 3 * scale, 6 * scale);
      }

      // Highlight bar
      ctx.fillStyle = `hsla(140, 50%, 55%, 0.15)`;
      ctx.fillRect(rL, feedY - 6 * scale, rW, 12 * scale);

      // Label
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("← FEEDING", rR + 8 * scale, feedY + 5 * scale);
    }

    // Behavior label
    const lblT = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * lblT;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("FEED ✓", width / 2, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
