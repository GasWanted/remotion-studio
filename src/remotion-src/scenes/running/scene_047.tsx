import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 47 — Activity cascades through the network like a wave (5s = 150 frames)
export const Scene047: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(4747);
    const particles = makeParticles(20, width, height, scale);
    const rasterRows = 80;
    const spikes: { row: number; time: number }[] = [];
    // Sugar input neurons (bottom)
    for (let r = rasterRows - 8; r < rasterRows; r++) {
      for (let t = 0; t < 120; t += 2) {
        spikes.push({ row: r, time: t });
      }
    }
    // Cascade: activity spreads from bottom/left to upper/right over time
    for (let r = 0; r < rasterRows - 8; r++) {
      const delay = (rasterRows - r) * 0.5 + rand() * 15;
      const numSpikes = 2 + Math.floor(rand() * 6);
      for (let s = 0; s < numSpikes; s++) {
        spikes.push({ row: r, time: delay + rand() * 40 });
      }
    }
    return { particles, spikes, rasterRows };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const rasterLeft = width * 0.12, rasterRight = width * 0.9;
    const rasterTop = height * 0.1, rasterBottom = height * 0.82;
    const rasterW = rasterRight - rasterLeft;
    const rasterH = rasterBottom - rasterTop;

    // Draw spikes that have activated by current frame
    for (const spike of data.spikes) {
      if (spike.time > frame) continue;
      const age = frame - spike.time;
      if (age > 80) continue; // fade old spikes
      const x = rasterLeft + (spike.time / 120) * rasterW;
      const y = rasterTop + (spike.row / data.rasterRows) * rasterH;
      if (x < rasterLeft || x > rasterRight) continue;
      const isSugar = spike.row >= data.rasterRows - 8;
      const spikeAlpha = Math.max(0, 1 - age / 80);
      ctx.fillStyle = isSugar
        ? `hsla(50, 70%, 60%, ${spikeAlpha * 0.9})`
        : `hsla(${180 + spike.row * 1.5}, 45%, 55%, ${spikeAlpha * 0.7})`;
      ctx.fillRect(x, y, 2 * scale, 2 * scale);
    }

    // Labels
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("SUGAR →", rasterLeft - 5 * scale, rasterBottom - 10 * scale);

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("cascade spreading →→→", (rasterLeft + rasterRight) / 2, rasterBottom + 20 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
