import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 27 — Timeline 2019-2023, error being fixed with cursor click (4s = 120 frames)
export const Scene027: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Error fix animation (top half)
    const fixProgress = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = width / 2, fy = height * 0.35;

    // Two blobs (before fix: different colors, after: same)
    const blob1X = cx - 25 * scale, blob2X = cx + 25 * scale;
    const hue1 = 220, hue2Fix = interpolate(fixProgress, [0, 1], [140, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.fillStyle = `hsla(${hue1}, 55%, 58%, 0.8)`;
    ctx.beginPath();
    ctx.arc(blob1X, fy, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue2Fix}, 55%, 58%, 0.8)`;
    ctx.beginPath();
    ctx.arc(blob2X, fy, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Cursor click at fix moment
    if (fixProgress > 0 && fixProgress < 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(0.5 - fixProgress) * 1.5})`;
      ctx.beginPath();
      ctx.moveTo(blob2X - 3 * scale, fy - 5 * scale);
      ctx.lineTo(blob2X + 5 * scale, fy + 3 * scale);
      ctx.lineTo(blob2X + 2 * scale, fy + 3 * scale);
      ctx.lineTo(blob2X, fy + 8 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // "fixed!" label
    if (fixProgress >= 1) {
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("fixed!", cx, fy + 25 * scale);
    }

    // Timeline bar (bottom half)
    const tlY = height * 0.68;
    const tlLeft = width * 0.2, tlRight = width * 0.8;
    const tlProgress = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Track
    ctx.strokeStyle = `hsla(280, 30%, 40%, 0.5)`;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(tlLeft, tlY);
    ctx.lineTo(tlRight, tlY);
    ctx.stroke();

    // Filled portion
    ctx.strokeStyle = PALETTE.text.accent;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(tlLeft, tlY);
    ctx.lineTo(tlLeft + (tlRight - tlLeft) * tlProgress, tlY);
    ctx.stroke();

    // Years
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("2019", tlLeft, tlY + 25 * scale);
    ctx.fillText("2023", tlRight, tlY + 25 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px system-ui, sans-serif`;
    ctx.fillText("4 years", (tlLeft + tlRight) / 2, tlY + 25 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
