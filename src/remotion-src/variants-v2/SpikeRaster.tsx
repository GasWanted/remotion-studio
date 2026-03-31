import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Spike raster plot — rows of neurons firing, activity cascading across
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SpikeRaster: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const spikes = useMemo(() => {
    const rand = seeded(88);
    const nNeurons = 60;
    const all: { neuron: number; time: number }[] = [];

    // Activity cascades from top to bottom
    for (let n = 0; n < nNeurons; n++) {
      const baseRate = 0.02 + rand() * 0.06;
      const cascadeDelay = n * 1.5;
      for (let t = 0; t < 240; t++) {
        const inCascade = t > cascadeDelay && t < cascadeDelay + 60;
        const rate = inCascade ? baseRate * 4 : baseRate;
        if (rand() < rate) {
          all.push({ neuron: n, time: t });
        }
      }
    }
    return { spikes: all, nNeurons };
  }, []);

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

    const margin = width * 0.06;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;
    const rowH = plotH / spikes.nNeurons;

    // Scan line
    const scanX = margin + (frame / 240) * plotW;

    for (const spike of spikes.spikes) {
      const x = margin + (spike.time / 240) * plotW;
      if (x > scanX) continue;
      const y = margin + (spike.neuron / spikes.nNeurons) * plotH + rowH / 2;

      const age = scanX - x;
      const alpha = Math.min(1, Math.max(0.1, 1 - age / (plotW * 0.3)));

      ctx.fillStyle = `rgba(255, 180, 50, ${alpha})`;
      ctx.fillRect(x, y - 1, 2, 2);
    }

    // Scan line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(scanX, margin);
    ctx.lineTo(scanX, height - margin);
    ctx.stroke();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
