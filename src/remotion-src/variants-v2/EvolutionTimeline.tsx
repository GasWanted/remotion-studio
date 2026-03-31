import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// A horizontal timeline stretching across 50M years, with a fly silhouette emerging at the end
export const EvolutionTimeline: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const lineY = height * 0.55;
    const margin = width * 0.08;
    const lineW = width - margin * 2;

    // Timeline progress
    const progress = interpolate(frame, [10, 160], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    const endX = margin + lineW * progress;

    // Main line
    ctx.strokeStyle = "rgba(255, 170, 34, 0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin, lineY);
    ctx.lineTo(endX, lineY);
    ctx.stroke();

    // Tick marks with year labels
    const milestones = [
      { year: 0, label: "0" },
      { year: 10, label: "10M" },
      { year: 20, label: "20M" },
      { year: 30, label: "30M" },
      { year: 40, label: "40M" },
      { year: 50, label: "50M" },
    ];

    ctx.font = `${Math.max(10, width * 0.018)}px Courier New`;
    ctx.textAlign = "center";

    for (const m of milestones) {
      const x = margin + (m.year / 50) * lineW;
      if (x > endX) continue;

      const age = (endX - x) / lineW;
      const alpha = Math.min(1, age * 8);

      ctx.strokeStyle = `rgba(255, 170, 34, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(x, lineY - 8);
      ctx.lineTo(x, lineY + 8);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 170, 34, ${alpha * 0.6})`;
      ctx.fillText(m.label, x, lineY + 24);
    }

    // Glowing dot at progress tip
    ctx.fillStyle = "rgba(255, 200, 80, 0.9)";
    ctx.beginPath();
    ctx.arc(endX, lineY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 200, 80, 0.15)";
    ctx.beginPath();
    ctx.arc(endX, lineY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Fly silhouette emerging at the end of the timeline
    if (progress > 0.85) {
      const flyAlpha = interpolate(progress, [0.85, 1], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      const fx = width - margin - 10;
      const fy = lineY - 50;
      const fs = Math.min(width, height) * 0.004;

      ctx.globalAlpha = fadeOut * flyAlpha;
      ctx.strokeStyle = "#ffaa22";
      ctx.lineWidth = 1.2;

      // Simple fly shape
      // Body
      ctx.beginPath();
      ctx.ellipse(fx, fy, 6 * fs, 14 * fs, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Head
      ctx.beginPath();
      ctx.arc(fx, fy - 18 * fs, 6 * fs, 0, Math.PI * 2);
      ctx.stroke();
      // Wings
      ctx.beginPath();
      ctx.ellipse(fx - 14 * fs, fy - 4 * fs, 12 * fs, 5 * fs, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(fx + 14 * fs, fy - 4 * fs, 12 * fs, 5 * fs, 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
