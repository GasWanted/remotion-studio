import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Two spike rasters stacked. NORMAL: feed row active. BRAINWASHED: feed silent, retreat on fire.
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SpikeContrast: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const raster = useMemo(() => {
    const rand = seeded(63);
    const rows = 20;
    const feedRow = 3; // index of feed neuron row
    const retreatRow = 14; // index of retreat neuron row

    // Normal brain spike times per row
    const normalSpikes: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const spikes: number[] = [];
      const rate = r === feedRow ? 0.15 : 0.02 + rand() * 0.04; // feed row fires often
      for (let t = 0; t < 300; t++) {
        if (rand() < rate) spikes.push(t);
      }
      normalSpikes.push(spikes);
    }

    // Brainwashed brain spike times per row
    const brainwashedSpikes: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const spikes: number[] = [];
      let rate: number;
      if (r === feedRow) {
        rate = 0; // silent
      } else if (r === retreatRow || r === retreatRow + 1 || r === retreatRow - 1) {
        rate = 0.25 + rand() * 0.1; // retreat cluster on fire
      } else {
        rate = 0.02 + rand() * 0.04;
      }
      for (let t = 0; t < 300; t++) {
        if (rand() < rate) spikes.push(t);
      }
      brainwashedSpikes.push(spikes);
    }

    return { rows, feedRow, retreatRow, normalSpikes, brainwashedSpikes };
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sweep = interpolate(frame, [5, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const marginL = 65 * scale;
    const marginR = 15 * scale;
    const rasterW = width - marginL - marginR;
    const rasterH = height * 0.35;
    const topY = height * 0.1;
    const botY = height * 0.55;
    const rowH = rasterH / raster.rows;
    const maxT = 300;
    const visibleT = Math.floor(sweep * maxT);

    const labelSize = Math.max(8, 10 * scale);
    const smallSize = Math.max(6, 7 * scale);

    // Draw raster function
    const drawRaster = (
      spikes: number[][],
      y0: number,
      feedRow: number,
      retreatRow: number,
      label: string,
      isBrainwashed: boolean,
    ) => {
      // Label
      ctx.font = `bold ${labelSize}px Courier New`;
      ctx.textAlign = "left";
      ctx.fillStyle = isBrainwashed ? "rgba(255, 80, 60, 0.7)" : "rgba(100, 220, 140, 0.7)";
      ctx.fillText(label, marginL, y0 - 5 * scale);

      // Row labels
      ctx.font = `${smallSize}px Courier New`;
      ctx.textAlign = "right";

      for (let r = 0; r < raster.rows; r++) {
        const ry = y0 + r * rowH + rowH / 2;

        // Row label for special rows
        if (r === feedRow) {
          ctx.fillStyle = isBrainwashed ? "rgba(80, 80, 90, 0.5)" : "rgba(100, 255, 140, 0.7)";
          ctx.fillText("FEED", marginL - 4 * scale, ry + smallSize * 0.3);
        } else if (r === retreatRow) {
          ctx.fillStyle = isBrainwashed ? "rgba(255, 80, 50, 0.7)" : "rgba(180, 180, 190, 0.3)";
          ctx.fillText("MDN", marginL - 4 * scale, ry + smallSize * 0.3);
        }

        // Spike ticks
        const rowSpikes = spikes[r];
        for (const t of rowSpikes) {
          if (t > visibleT) continue;
          const x = marginL + (t / maxT) * rasterW;

          let color: string;
          if (r === feedRow && !isBrainwashed) {
            color = "rgba(80, 255, 120, 0.7)";
          } else if ((r >= retreatRow - 1 && r <= retreatRow + 1) && isBrainwashed) {
            color = "rgba(255, 60, 40, 0.7)";
          } else {
            color = "rgba(100, 140, 200, 0.25)";
          }

          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, ry - rowH * 0.35);
          ctx.lineTo(x, ry + rowH * 0.35);
          ctx.stroke();
        }
      }

      // Sweep line
      const sweepX = marginL + (visibleT / maxT) * rasterW;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sweepX, y0);
      ctx.lineTo(sweepX, y0 + rasterH);
      ctx.stroke();

      // Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(marginL, y0, rasterW, rasterH);
    };

    // Normal raster
    drawRaster(raster.normalSpikes, topY, raster.feedRow, raster.retreatRow, "NORMAL", false);

    // Brainwashed raster
    drawRaster(raster.brainwashedSpikes, botY, raster.feedRow, raster.retreatRow, "BRAINWASHED", true);

    // Arrow between noting the difference
    if (sweep > 0.4) {
      const arrowAlpha = interpolate(frame, [55, 75], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(255, 255, 255, ${arrowAlpha})`;
      ctx.font = `${smallSize}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillText("same stimulus, different response", width / 2, height * 0.52);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
