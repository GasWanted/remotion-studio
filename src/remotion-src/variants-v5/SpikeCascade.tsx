import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Dense grid of dim dots (neurons). A wave of activation sweeps left to right —
// dots light up gold as the wave passes, then dim again.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function buildGrid(width: number, height: number, scale: number) {
  const rand = seeded(101);
  const cols = Math.floor(width / (8 * scale));
  const rows = Math.floor(height / (8 * scale));
  const spacingX = width / (cols + 1);
  const spacingY = height / (rows + 1);
  const neurons: { x: number; y: number; jitterX: number; jitterY: number; delay: number }[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = spacingX * (c + 1);
      const y = spacingY * (r + 1);
      const jx = (rand() - 0.5) * spacingX * 0.4;
      const jy = (rand() - 0.5) * spacingY * 0.4;
      // Wave delay: primarily based on x position, with some vertical randomness
      const normalizedX = c / cols;
      const randomDelay = (rand() - 0.5) * 0.12;
      const verticalWobble = Math.sin(r * 0.3) * 0.05;
      neurons.push({
        x, y, jitterX: jx, jitterY: jy,
        delay: normalizedX + randomDelay + verticalWobble,
      });
    }
  }
  return { neurons };
}

export const SpikeCascade: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildGrid(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Wave sweeps from frame 10 to frame 120
    // Each neuron activates based on its delay
    const waveProgress = interpolate(frame, [10, 110], [0, 1.3], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const dotR = 1.8 * scale;

    for (const n of data.neurons) {
      const px = n.x + n.jitterX;
      const py = n.y + n.jitterY;

      // How far into activation is this neuron
      const activationTime = waveProgress - n.delay;
      // Activation ramps up quickly and fades slowly
      const riseEnd = 0.05;
      const fallEnd = 0.25;

      let brightness: number;
      if (activationTime < 0) {
        brightness = 0;
      } else if (activationTime < riseEnd) {
        brightness = activationTime / riseEnd;
      } else if (activationTime < fallEnd) {
        brightness = 1 - (activationTime - riseEnd) / (fallEnd - riseEnd);
      } else {
        brightness = 0;
      }

      const baseDim = 0.08;
      const alpha = baseDim + brightness * 0.92;

      if (brightness > 0.5) {
        // Gold/yellow for active
        const r = Math.round(255 * alpha);
        const g = Math.round(200 * alpha);
        const b = Math.round(50 * alpha);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        // Glow
        ctx.shadowColor = "#ffcc33";
        ctx.shadowBlur = brightness * 6 * scale;
      } else if (brightness > 0) {
        // Transitioning
        const mix = brightness / 0.5;
        const r = Math.round(60 + 195 * mix);
        const g = Math.round(80 + 120 * mix);
        const b = Math.round(140 - 90 * mix);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur = 0;
      } else {
        // Dim base state
        ctx.fillStyle = `rgba(60, 80, 140, ${baseDim})`;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(px, py, dotR + brightness * 1.2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
