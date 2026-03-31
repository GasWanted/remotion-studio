import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Two bar charts side by side: Normal (FEED 61Hz green) vs Brainwashed (FEED 0, RETREAT 143Hz red)
export const BarCompare: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barGrow = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightReveal = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const retreatGrow = interpolate(frame, [55, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const chartBottom = height * 0.82;
    const chartTop = height * 0.18;
    const maxH = chartBottom - chartTop;
    const barW = 30 * scale;
    const maxHz = 150;

    const leftCX = width * 0.25;
    const rightCX = width * 0.72;

    // Labels
    const titleSize = Math.max(9, 11 * scale);
    ctx.font = `bold ${titleSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(100, 220, 140, 0.7)";
    ctx.fillText("NORMAL", leftCX, height * 0.08);
    ctx.fillStyle = `rgba(255, 70, 70, ${0.7 * rightReveal})`;
    ctx.fillText("BRAINWASHED", rightCX, height * 0.08);

    // Axis lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    for (const cx of [leftCX, rightCX]) {
      ctx.beginPath();
      ctx.moveTo(cx - 50 * scale, chartBottom);
      ctx.lineTo(cx + 50 * scale, chartBottom);
      ctx.stroke();
    }

    // Hz scale ticks
    const tickSize = Math.max(6, 7 * scale);
    ctx.font = `${tickSize}px Courier New`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.textAlign = "right";
    for (const hz of [0, 50, 100, 150]) {
      const y = chartBottom - (hz / maxHz) * maxH;
      ctx.fillText(`${hz}`, leftCX - 40 * scale, y + 3);
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.moveTo(leftCX - 35 * scale, y);
      ctx.lineTo(leftCX + 35 * scale, y);
      ctx.stroke();
    }

    // Left: FEED bar (green, 61Hz)
    const feedH = (61 / maxHz) * maxH * barGrow;
    const feedGrad = ctx.createLinearGradient(0, chartBottom, 0, chartBottom - feedH);
    feedGrad.addColorStop(0, "rgba(60, 180, 100, 0.9)");
    feedGrad.addColorStop(1, "rgba(100, 255, 140, 0.9)");
    ctx.fillStyle = feedGrad;
    ctx.fillRect(leftCX - barW / 2, chartBottom - feedH, barW, feedH);

    ctx.textAlign = "center";
    ctx.font = `bold ${tickSize}px Courier New`;
    ctx.fillStyle = "rgba(100, 255, 140, 0.8)";
    if (barGrow > 0.5) ctx.fillText("61 Hz", leftCX, chartBottom - feedH - 6 * scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("FEED", leftCX, chartBottom + 12 * scale);

    // Right: FEED bar (gray, 0Hz) and RETREAT bar (red, 143Hz)
    ctx.globalAlpha = fadeOut * rightReveal;

    // FEED (zero)
    const rightFeedX = rightCX - 22 * scale;
    const rightRetX = rightCX + 22 * scale;

    ctx.fillStyle = "rgba(80, 80, 90, 0.5)";
    ctx.fillRect(rightFeedX - barW / 2, chartBottom - 2, barW, 2);
    ctx.textAlign = "center";
    ctx.font = `${tickSize}px Courier New`;
    ctx.fillStyle = "rgba(120, 120, 130, 0.6)";
    ctx.fillText("0", rightFeedX, chartBottom - 8 * scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillText("FEED", rightFeedX, chartBottom + 12 * scale);

    // RETREAT (143Hz, dramatic)
    const retH = (143 / maxHz) * maxH * retreatGrow;
    const retGrad = ctx.createLinearGradient(0, chartBottom, 0, chartBottom - retH);
    retGrad.addColorStop(0, "rgba(200, 40, 30, 0.9)");
    retGrad.addColorStop(1, "rgba(255, 80, 50, 0.95)");
    ctx.fillStyle = retGrad;
    ctx.fillRect(rightRetX - barW / 2, chartBottom - retH, barW, retH);

    // Glow on retreat bar
    if (retreatGrow > 0.8) {
      const pulse = 0.3 + 0.3 * Math.sin(frame * 0.3);
      ctx.shadowColor = "rgba(255, 60, 30, 0.6)";
      ctx.shadowBlur = pulse * 12 * scale;
      ctx.fillStyle = `rgba(255, 80, 50, ${pulse})`;
      ctx.fillRect(rightRetX - barW / 2, chartBottom - retH, barW, retH);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = "rgba(255, 80, 50, 0.9)";
    ctx.font = `bold ${tickSize}px Courier New`;
    if (retreatGrow > 0.5) ctx.fillText("143 Hz", rightRetX, chartBottom - retH - 6 * scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("RETREAT", rightRetX, chartBottom + 12 * scale);

    // Hz ticks for right side
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = `${tickSize}px Courier New`;
    for (const hz of [0, 50, 100, 150]) {
      const y = chartBottom - (hz / maxHz) * maxH;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.moveTo(rightCX - 40 * scale, y);
      ctx.lineTo(rightCX + 40 * scale, y);
      ctx.stroke();
    }

    // Divider
    ctx.globalAlpha = fadeOut;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.48, height * 0.05);
    ctx.lineTo(width * 0.48, height * 0.95);
    ctx.stroke();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
