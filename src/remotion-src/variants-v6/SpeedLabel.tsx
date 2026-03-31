import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * Overhead view: a dot moves in a straight line leaving a trail.
 * Speed: "0.51 cm/s". Clean and stable. Then text: "STABLE".
 */
export const SpeedLabel: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cy = height * 0.48;
    const startX = width * 0.12;
    const endX = width * 0.88;
    const totalDist = endX - startX;

    // Dot moves steadily across
    const moveP = interpolate(frame, [10, 110], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const dotX = startX + moveP * totalDist;

    // Ruler / ground line
    ctx.strokeStyle = "rgba(60, 60, 80, 0.4)";
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.beginPath();
    ctx.moveTo(startX, cy + 20 * s);
    ctx.lineTo(endX, cy + 20 * s);
    ctx.stroke();
    ctx.setLineDash([]);

    // Scale ticks
    const numTicks = 8;
    for (let i = 0; i <= numTicks; i++) {
      const tx = startX + (totalDist / numTicks) * i;
      ctx.strokeStyle = "rgba(60, 60, 80, 0.3)";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(tx, cy + 16 * s);
      ctx.lineTo(tx, cy + 24 * s);
      ctx.stroke();
    }

    // Trail
    if (moveP > 0) {
      // Trail gradient: fades toward start
      const trailStartX = startX;
      const grad = ctx.createLinearGradient(trailStartX, cy, dotX, cy);
      grad.addColorStop(0, "rgba(120, 220, 180, 0)");
      grad.addColorStop(0.5, "rgba(120, 220, 180, 0.15)");
      grad.addColorStop(1, "rgba(120, 220, 180, 0.5)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(trailStartX, cy);
      ctx.lineTo(dotX, cy);
      ctx.stroke();

      // Dot
      const dotGrad = ctx.createRadialGradient(dotX, cy, 0, dotX, cy, 12 * s);
      dotGrad.addColorStop(0, "rgba(120, 255, 200, 0.8)");
      dotGrad.addColorStop(1, "rgba(120, 255, 200, 0)");
      ctx.fillStyle = dotGrad;
      ctx.beginPath();
      ctx.arc(dotX, cy, 12 * s, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(200, 255, 230, 0.95)";
      ctx.beginPath();
      ctx.arc(dotX, cy, 4 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Speed readout
    const speedAppear = interpolate(frame, [25, 40], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (speedAppear > 0) {
      ctx.fillStyle = `rgba(200, 200, 220, ${speedAppear * 0.9})`;
      ctx.font = `bold ${16 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("0.51 cm/s", width / 2, height * 0.2);

      // Speed unit annotation
      ctx.fillStyle = `rgba(150, 150, 170, ${speedAppear * 0.5})`;
      ctx.font = `${9 * s}px monospace`;
      ctx.fillText("walking speed", width / 2, height * 0.2 + 16 * s);
    }

    // "STABLE" label appears after dot settles
    if (frame > 85) {
      const stableA = interpolate(frame, [85, 100], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const pulse = 0.7 + 0.3 * Math.sin((frame - 85) * 0.12);

      ctx.fillStyle = `rgba(80, 220, 100, ${stableA * pulse})`;
      ctx.font = `bold ${18 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("STABLE", width / 2, height * 0.78);

      // Subtle checkmark
      if (stableA > 0.5) {
        ctx.strokeStyle = `rgba(80, 220, 100, ${(stableA - 0.5) * 2 * 0.6})`;
        ctx.lineWidth = 2.5 * s;
        ctx.lineCap = "round";
        const checkX = width / 2 + 50 * s;
        const checkY = height * 0.78 - 5 * s;
        ctx.beginPath();
        ctx.moveTo(checkX - 8 * s, checkY);
        ctx.lineTo(checkX - 3 * s, checkY + 6 * s);
        ctx.lineTo(checkX + 8 * s, checkY - 6 * s);
        ctx.stroke();
      }
    }

    // Orientation heading indicator
    if (frame > 50) {
      const hA = interpolate(frame, [50, 65], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      ctx.fillStyle = `rgba(150, 150, 170, ${hA * 0.4})`;
      ctx.font = `${8 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("heading: straight", width / 2, cy + 38 * s);
    }

    ctx.textAlign = "start";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
