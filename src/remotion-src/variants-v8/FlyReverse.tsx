import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Left: dot approaches food and eats it. Right: dot approaches food, stops, reverses away.
export const FlyReverse: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const leftCX = width * 0.25;
    const rightCX = width * 0.75;
    const cy = height * 0.5;
    const foodR = 8 * scale;
    const flyR = 4 * scale;

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.05);
    ctx.lineTo(width / 2, height * 0.95);
    ctx.stroke();

    // Labels
    const fontSize = Math.max(8, 10 * scale);
    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(100, 220, 140, 0.6)";
    ctx.fillText("NORMAL", leftCX, height * 0.1);
    ctx.fillStyle = "rgba(255, 70, 70, 0.6)";
    ctx.fillText("BRAINWASHED", rightCX, height * 0.1);

    // Food positions (center of each half)
    const foodX = 60 * scale;

    // --- LEFT SIDE: approach and eat ---
    const leftApproach = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const leftEat = interpolate(frame, [70, 85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Food (yellow circle)
    if (leftEat > 0.01) {
      ctx.fillStyle = `rgba(255, 220, 60, ${0.8 * leftEat})`;
      ctx.shadowColor = "rgba(255, 220, 60, 0.4)";
      ctx.shadowBlur = 6 * scale;
      ctx.beginPath();
      ctx.arc(leftCX + foodX, cy, foodR * leftEat, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // Fly dot (white->green)
    const leftFlyX = leftCX - 80 * scale + leftApproach * (80 * scale + foodX);
    ctx.fillStyle = leftApproach < 1 ? "rgba(200, 230, 220, 0.9)" : "rgba(100, 255, 140, 0.9)";
    ctx.beginPath();
    ctx.arc(leftFlyX, cy, flyR, 0, Math.PI * 2);
    ctx.fill();

    // Trail for left
    if (leftApproach > 0.05) {
      ctx.strokeStyle = "rgba(100, 200, 140, 0.2)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(leftCX - 80 * scale, cy);
      ctx.lineTo(leftFlyX, cy);
      ctx.stroke();
    }

    // "ate it" label
    if (frame > 80) {
      const labelA = interpolate(frame, [80, 95], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${Math.max(7, 8 * scale)}px Courier New`;
      ctx.fillStyle = `rgba(100, 255, 140, ${labelA})`;
      ctx.textAlign = "center";
      ctx.fillText("feeding", leftCX + foodX, cy + 20 * scale);
    }

    // --- RIGHT SIDE: approach, stop, reverse ---
    const rightApproach = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rightPause = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rightRetreat = interpolate(frame, [75, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Food stays
    ctx.fillStyle = "rgba(255, 220, 60, 0.8)";
    ctx.shadowColor = "rgba(255, 220, 60, 0.4)";
    ctx.shadowBlur = 6 * scale;
    ctx.beginPath();
    ctx.arc(rightCX + foodX, cy, foodR, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Fly dot: approach to near food, then reverse
    const approachDist = 80 * scale + foodX - 18 * scale; // stops 18px before food
    let rightFlyX: number;
    if (rightRetreat > 0) {
      // Retreating
      const nearFoodX = rightCX - 80 * scale + approachDist;
      rightFlyX = nearFoodX - rightRetreat * (approachDist + 40 * scale);
    } else {
      rightFlyX = rightCX - 80 * scale + rightApproach * approachDist;
    }

    // Shake during pause
    const shakeX = rightPause > 0 && rightRetreat === 0 ? Math.sin(frame * 2.5) * 2 * scale * rightPause : 0;

    const isRetreating = rightRetreat > 0;
    ctx.fillStyle = isRetreating ? "rgba(255, 80, 60, 0.9)" : "rgba(200, 230, 220, 0.9)";
    ctx.beginPath();
    ctx.arc(rightFlyX + shakeX, cy, flyR, 0, Math.PI * 2);
    ctx.fill();

    // Trail
    if (rightApproach > 0.05) {
      const startX = rightCX - 80 * scale;
      const peakX = startX + approachDist;

      // Approach trail (white)
      ctx.strokeStyle = "rgba(200, 200, 220, 0.15)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(startX, cy);
      ctx.lineTo(Math.min(rightFlyX + shakeX, peakX), cy);
      ctx.stroke();

      // Retreat trail (red)
      if (isRetreating) {
        ctx.strokeStyle = "rgba(255, 70, 50, 0.3)";
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(peakX, cy);
        ctx.lineTo(rightFlyX + shakeX, cy);
        ctx.stroke();
      }
    }

    // "runs from food" label
    if (rightRetreat > 0.3) {
      const labelA = interpolate(frame, [85, 100], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${Math.max(7, 8 * scale)}px Courier New`;
      ctx.fillStyle = `rgba(255, 80, 60, ${labelA})`;
      ctx.textAlign = "center";
      ctx.fillText("retreating", rightCX, cy + 20 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
