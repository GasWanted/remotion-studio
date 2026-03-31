import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Vertical bar filling up as "+3", "+2", "-1" numbers fly in.
// Threshold line at 70%. Bar crosses it → flash.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface IncomingValue {
  value: number;
  startFrame: number;
  fromX: number;
  fromY: number;
}

function buildData(width: number, height: number, scale: number) {
  const rand = seeded(55);
  const values: IncomingValue[] = [
    { value: 3, startFrame: 8, fromX: -0.15, fromY: 0.2 },
    { value: 2, startFrame: 22, fromX: -0.1, fromY: 0.55 },
    { value: -1, startFrame: 36, fromX: -0.12, fromY: 0.75 },
    { value: 4, startFrame: 50, fromX: -0.15, fromY: 0.35 },
    { value: 2, startFrame: 64, fromX: -0.1, fromY: 0.6 },
    { value: 1, startFrame: 76, fromX: -0.13, fromY: 0.15 },
    { value: -1, startFrame: 85, fromX: -0.12, fromY: 0.8 },
  ];
  // Total: 3+2-1+4+2+1-1 = 10. Threshold at 7 (70% of max ~10).
  // Crosses at value 4 arrival (frame 50+travel).
  return { values };
}

export const ThresholdBar: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildData(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const barX = width * 0.55;
    const barW = 40 * scale;
    const barTop = height * 0.1;
    const barBottom = height * 0.88;
    const barH = barBottom - barTop;
    const thresholdFrac = 0.7;
    const thresholdY = barBottom - barH * thresholdFrac;
    const maxVal = 10;
    const travelDur = 18;

    // Calculate current sum
    let currentSum = 0;
    for (const v of data.values) {
      const arriveFrame = v.startFrame + travelDur;
      if (frame >= arriveFrame) {
        currentSum += v.value;
      }
    }
    const fillFrac = Math.max(0, Math.min(currentSum / maxVal, 1));
    const crossed = fillFrac >= thresholdFrac;

    // Find cross frame
    let crossFrame = 999;
    let runningSum = 0;
    for (const v of data.values) {
      runningSum += v.value;
      if (runningSum / maxVal >= thresholdFrac) {
        crossFrame = v.startFrame + travelDur;
        break;
      }
    }

    // Bar outline
    ctx.strokeStyle = "rgba(100, 200, 255, 0.4)";
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(barX - barW / 2, barTop, barW, barH);

    // Fill
    const fillH = fillFrac * barH;
    const fillTop = barBottom - fillH;
    const grad = ctx.createLinearGradient(barX, barBottom, barX, barTop);
    if (crossed) {
      grad.addColorStop(0, "rgba(255, 180, 40, 0.8)");
      grad.addColorStop(0.7, "rgba(255, 100, 30, 0.9)");
      grad.addColorStop(1, "rgba(255, 60, 20, 1)");
    } else {
      grad.addColorStop(0, "rgba(40, 120, 255, 0.5)");
      grad.addColorStop(1, "rgba(60, 180, 255, 0.8)");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(barX - barW / 2 + 2 * scale, fillTop, barW - 4 * scale, fillH);

    // Threshold line
    ctx.strokeStyle = "rgba(255, 70, 70, 0.7)";
    ctx.lineWidth = 1.5 * scale;
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(barX - barW / 2 - 15 * scale, thresholdY);
    ctx.lineTo(barX + barW / 2 + 15 * scale, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    // "THRESHOLD" label
    ctx.fillStyle = "rgba(255, 100, 100, 0.6)";
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("THRESHOLD", barX + barW / 2 + 18 * scale, thresholdY + 3 * scale);

    // Current sum display
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${currentSum}`, barX, barBottom + 18 * scale);

    // Flying values
    for (const v of data.values) {
      const progress = interpolate(frame, [v.startFrame, v.startFrame + travelDur], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (progress > 0 && progress < 1) {
        const startX = width * (0.5 + v.fromX);
        const startY = height * v.fromY;
        const targetY = barBottom - (Math.max(0, currentSum) / maxVal) * barH;
        const px = startX + (barX - startX) * progress;
        const py = startY + (targetY - startY) * progress;

        const isNeg = v.value < 0;
        ctx.fillStyle = isNeg ? "#ff5555" : "#55ff88";
        ctx.shadowColor = isNeg ? "#ff5555" : "#55ff88";
        ctx.shadowBlur = 8 * scale;
        ctx.font = `bold ${14 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${v.value > 0 ? "+" : ""}${v.value}`, px, py);
        ctx.shadowBlur = 0;
      }

      // Landed values briefly visible on bar
      const arriveFrame = v.startFrame + travelDur;
      const landAlpha = interpolate(frame, [arriveFrame, arriveFrame + 10], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (landAlpha > 0 && frame >= arriveFrame) {
        const isNeg = v.value < 0;
        ctx.fillStyle = isNeg ? `rgba(255, 80, 80, ${landAlpha * 0.8})` : `rgba(80, 255, 130, ${landAlpha * 0.8})`;
        ctx.font = `bold ${11 * scale}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`${v.value > 0 ? "+" : ""}${v.value}`, barX - barW / 2 - 8 * scale, barBottom - (barH * Math.max(0, fillFrac) * 0.5) + (v.fromY - 0.5) * 20 * scale);
      }
    }

    // Flash on crossing
    if (crossed && frame >= crossFrame) {
      const flashA = interpolate(frame, [crossFrame, crossFrame + 3, crossFrame + 15], [0, 0.6, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (flashA > 0) {
        ctx.fillStyle = `rgba(255, 220, 100, ${flashA})`;
        ctx.fillRect(0, 0, width, height);
      }

      // "FIRE!" text
      const fireA = interpolate(frame, [crossFrame + 2, crossFrame + 10, crossFrame + 40, crossFrame + 55], [0, 1, 1, 0.6], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (fireA > 0) {
        ctx.fillStyle = `rgba(255, 200, 50, ${fireA})`;
        ctx.shadowColor = "#ffcc33";
        ctx.shadowBlur = 15 * scale;
        ctx.font = `bold ${22 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("SPIKE!", barX, barTop - 10 * scale);
        ctx.shadowBlur = 0;
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
