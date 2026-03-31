import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Horizontal spike raster: time left-to-right, neurons top-to-bottom.
// Activity cascades diagonally. Scan line moves right.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function buildRaster(width: number, height: number, scale: number) {
  const rand = seeded(202);
  const numNeurons = 80;
  const numTimeSteps = 200;
  const margin = { left: 40 * scale, right: 10 * scale, top: 15 * scale, bottom: 25 * scale };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  // Generate spikes: diagonal cascade pattern + noise
  const spikes: { neuron: number; time: number }[] = [];
  for (let n = 0; n < numNeurons; n++) {
    for (let t = 0; t < numTimeSteps; t++) {
      // Diagonal cascade: neurons fire roughly along a diagonal band
      const cascadeCenter = t * (numNeurons / numTimeSteps);
      const dist = Math.abs(n - cascadeCenter);
      const cascadeProb = Math.exp(-dist * dist / 80) * 0.35;
      // Second cascade wave offset
      const cascade2Center = (t - 80) * (numNeurons / numTimeSteps) * 1.2;
      const dist2 = Math.abs(n - cascade2Center);
      const cascade2Prob = t > 60 ? Math.exp(-dist2 * dist2 / 60) * 0.25 : 0;
      // Background noise
      const noiseProb = 0.008;
      const totalProb = Math.min(cascadeProb + cascade2Prob + noiseProb, 0.5);

      if (rand() < totalProb) {
        spikes.push({ neuron: n, time: t });
      }
    }
  }

  return { numNeurons, numTimeSteps, spikes, margin, plotW, plotH };
}

export const SpikeRaster: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildRaster(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { numNeurons, numTimeSteps, spikes, margin, plotW, plotH } = data;

    // Scan line progress
    const scanProgress = interpolate(frame, [5, 140], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const scanTimeStep = scanProgress * numTimeSteps;
    const scanX = margin.left + scanProgress * plotW;

    // Draw axes
    ctx.strokeStyle = "rgba(80, 120, 180, 0.3)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = "rgba(150, 180, 220, 0.5)";
    ctx.font = `${7 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("time", margin.left + plotW / 2, height - 4 * scale);
    ctx.save();
    ctx.translate(10 * scale, margin.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("neurons", 0, 0);
    ctx.restore();

    // Draw spikes (only those before scan line)
    for (const spike of spikes) {
      if (spike.time > scanTimeStep) continue;

      const x = margin.left + (spike.time / numTimeSteps) * plotW;
      const y = margin.top + (spike.neuron / numNeurons) * plotH;

      // Recent spikes are brighter
      const age = scanTimeStep - spike.time;
      const brightness = age < 5 ? 1 : age < 15 ? 0.7 : age < 40 ? 0.4 : 0.2;

      // Color: gold for recent, blue-white for old
      if (age < 8) {
        ctx.fillStyle = `rgba(255, 200, 60, ${brightness * 0.9})`;
      } else {
        ctx.fillStyle = `rgba(100, 180, 255, ${brightness * 0.7})`;
      }

      const spikeW = Math.max(1, (plotW / numTimeSteps) * 0.8);
      const spikeH = Math.max(1, (plotH / numNeurons) * 0.6);
      ctx.fillRect(x, y, spikeW, spikeH);
    }

    // Scan line
    ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.setLineDash([3 * scale, 3 * scale]);
    ctx.beginPath();
    ctx.moveTo(scanX, margin.top);
    ctx.lineTo(scanX, margin.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scan line glow
    const glowGrad = ctx.createLinearGradient(scanX - 10 * scale, 0, scanX + 2 * scale, 0);
    glowGrad.addColorStop(0, "rgba(100, 200, 255, 0)");
    glowGrad.addColorStop(0.7, "rgba(100, 200, 255, 0.05)");
    glowGrad.addColorStop(1, "rgba(100, 200, 255, 0.15)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(scanX - 10 * scale, margin.top, 12 * scale, plotH);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
