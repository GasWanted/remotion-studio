import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// 5 preserved behaviors with green checks, then 1 rewritten in red. "5/5 preserved. 1 rewritten."
export const PreservedChecks: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const behaviors = [
    { name: "ESCAPE", status: "ok" },
    { name: "GROOM", status: "ok" },
    { name: "WALK", status: "ok" },
    { name: "TURN", status: "ok" },
    { name: "IDLE", status: "ok" },
    { name: "FEED", status: "rewritten" },
  ] as const;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const rowH = 28 * scale;
    const startY = height * 0.14;
    const cx = width / 2;
    const labelX = cx - 30 * scale;
    const checkX = cx + 60 * scale;

    const fontSize = Math.max(9, 12 * scale);
    const smallFont = Math.max(7, 9 * scale);

    for (let i = 0; i < behaviors.length; i++) {
      const b = behaviors[i];
      const y = startY + i * rowH;

      // Staggered reveal
      const revealFrame = 10 + i * 12;
      const reveal = interpolate(frame, [revealFrame, revealFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (reveal <= 0) continue;

      ctx.globalAlpha = fadeOut * reveal;

      if (b.status === "ok") {
        // Green row
        // Background bar
        ctx.fillStyle = "rgba(50, 180, 100, 0.06)";
        ctx.fillRect(cx - 90 * scale, y - rowH * 0.38, 180 * scale, rowH * 0.76);

        // Name
        ctx.font = `${fontSize}px Courier New`;
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(100, 230, 140, 0.8)";
        ctx.fillText(b.name, labelX, y + fontSize * 0.35);

        // Check mark
        ctx.strokeStyle = "rgba(80, 255, 120, 0.8)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(checkX - 6 * scale, y);
        ctx.lineTo(checkX - 1 * scale, y + 5 * scale);
        ctx.lineTo(checkX + 7 * scale, y - 5 * scale);
        ctx.stroke();
      } else {
        // Red row (FEED -> RETREAT)
        // Extra delay for dramatic effect
        const redReveal = interpolate(frame, [revealFrame + 5, revealFrame + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = fadeOut * redReveal;

        // Background bar (red)
        ctx.fillStyle = "rgba(200, 50, 40, 0.08)";
        ctx.fillRect(cx - 90 * scale, y - rowH * 0.38, 180 * scale, rowH * 0.76);

        // Strikethrough FEED
        ctx.font = `${fontSize}px Courier New`;
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(255, 80, 60, 0.6)";
        ctx.fillText(b.name, labelX, y + fontSize * 0.35);

        // Strikethrough line
        const strikeW = ctx.measureText(b.name).width;
        ctx.strokeStyle = "rgba(255, 80, 60, 0.5)";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(labelX - strikeW, y);
        ctx.lineTo(labelX + 2, y);
        ctx.stroke();

        // Arrow -> RETREAT
        ctx.font = `${fontSize}px Courier New`;
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255, 80, 60, 0.8)";
        ctx.fillText("→ RETREAT", labelX + 8 * scale, y + fontSize * 0.35);

        // X mark
        ctx.strokeStyle = "rgba(255, 60, 40, 0.8)";
        ctx.lineWidth = 2 * scale;
        const xc = checkX;
        ctx.beginPath();
        ctx.moveTo(xc - 5 * scale, y - 5 * scale);
        ctx.lineTo(xc + 5 * scale, y + 5 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xc + 5 * scale, y - 5 * scale);
        ctx.lineTo(xc - 5 * scale, y + 5 * scale);
        ctx.stroke();

        // Glow pulse on red row
        const pulse = 0.3 + 0.3 * Math.sin(frame * 0.3);
        ctx.fillStyle = `rgba(255, 50, 30, ${pulse * 0.05 * redReveal})`;
        ctx.fillRect(cx - 90 * scale, y - rowH * 0.38, 180 * scale, rowH * 0.76);
      }
    }

    // Summary text at bottom
    const summaryReveal = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (summaryReveal > 0) {
      ctx.globalAlpha = fadeOut * summaryReveal;
      ctx.font = `${smallFont}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(100, 230, 140, 0.5)";
      ctx.fillText("5/5 preserved.", cx - 35 * scale, height * 0.9);
      ctx.fillStyle = "rgba(255, 80, 60, 0.6)";
      ctx.fillText("1 rewritten.", cx + 40 * scale, height * 0.9);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
