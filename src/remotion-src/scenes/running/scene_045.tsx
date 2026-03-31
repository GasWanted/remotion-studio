import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 45 — Spike raster activates, sugar input neurons light up (4s = 120 frames)
export const Scene045: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(4545);
    const particles = makeParticles(20, width, height, scale);
    // Raster: 60 neuron rows, spikes are random
    const spikes: { row: number; time: number }[] = [];
    for (let r = 0; r < 60; r++) {
      const numSpikes = 3 + Math.floor(rand() * 8);
      for (let s = 0; s < numSpikes; s++) {
        spikes.push({ row: r, time: rand() * 100 });
      }
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

    const rasterLeft = width * 0.18, rasterRight = width * 0.88;
    const rasterTop = height * 0.15, rasterBottom = height * 0.78;
    const rasterW = rasterRight - rasterLeft;
    const rasterH = rasterBottom - rasterTop;

    // Raster border
    ctx.strokeStyle = `hsla(280, 25%, 40%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(rasterLeft, rasterTop, rasterW, rasterH);

    // Axis labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("time →", (rasterLeft + rasterRight) / 2, rasterBottom + 20 * scale);
    ctx.save();
    ctx.translate(rasterLeft - 15 * scale, (rasterTop + rasterBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("neurons", 0, 0);
    ctx.restore();

    // Time window that scrolls
    const timeOffset = frame * 0.8;

    // General spikes
    const rasterAlpha = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * rasterAlpha * 0.5;
    for (const spike of data.spikes) {
      const x = rasterLeft + ((spike.time + timeOffset) % 100) / 100 * rasterW;
      const y = rasterTop + (spike.row / 60) * rasterH;
      if (x < rasterLeft || x > rasterRight) continue;
      ctx.fillStyle = `hsla(220, 40%, 55%, 0.6)`;
      ctx.fillRect(x, y, 2 * scale, 2 * scale);
    }

    // Sugar input neurons (bottom cluster, solid block)
    const sugarAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * sugarAlpha;
    const sugarTop = rasterBottom - rasterH * 0.12;
    ctx.fillStyle = `hsla(50, 70%, 60%, 0.8)`;
    ctx.fillRect(rasterLeft, sugarTop, rasterW, rasterBottom - sugarTop);

    // Sugar label
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("SUGAR →", rasterLeft - 8 * scale, sugarTop + (rasterBottom - sugarTop) / 2 + 5 * scale);

    // "input ON" label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("← input ON", rasterRight + 5 * scale, sugarTop + (rasterBottom - sugarTop) / 2 + 5 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
