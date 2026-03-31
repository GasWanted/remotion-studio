import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * A small fly shape drops from top, bounces on a ground line, settles.
 * Force arrows: red down (gravity), green up at feet (reaction).
 */
export const GravityDrop: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pre-compute bounce physics
  const physics = useMemo(() => {
    const groundY = height * 0.72;
    const startY = height * 0.08;
    const gravity = 0.35;
    const bounceDamp = 0.45;
    const positions: number[] = [];

    let y = startY;
    let vy = 0;
    let settled = false;

    for (let f = 0; f < 150; f++) {
      if (f < 10) {
        // Hang at top briefly
        positions.push(startY);
        continue;
      }
      vy += gravity;
      y += vy;
      if (y >= groundY) {
        y = groundY;
        vy = -vy * bounceDamp;
        if (Math.abs(vy) < 1) {
          settled = true;
          vy = 0;
        }
      }
      positions.push(y);
    }
    return { positions, groundY, settled };
  }, [height]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const flyY = physics.positions[Math.min(frame, 149)];
    const groundY = physics.groundY;
    const onGround = flyY >= groundY - 1;

    // Ground line
    ctx.strokeStyle = "rgba(60, 60, 80, 0.6)";
    ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([6 * s, 4 * s]);
    ctx.beginPath();
    ctx.moveTo(width * 0.15, groundY + 15 * s);
    ctx.lineTo(width * 0.85, groundY + 15 * s);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ground label
    ctx.fillStyle = "rgba(60, 60, 80, 0.5)";
    ctx.font = `${9 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("ground", cx, groundY + 28 * s);

    // Simple fly shape
    const flySize = 12 * s;

    // Body
    ctx.fillStyle = "rgba(150, 130, 100, 0.8)";
    ctx.beginPath();
    ctx.ellipse(cx, flyY, flySize * 0.6, flySize, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(200, 180, 140, 0.7)";
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(cx, flyY - flySize * 1.1, flySize * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wings
    ctx.strokeStyle = "rgba(180, 180, 200, 0.4)";
    ctx.lineWidth = 1 * s;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * flySize * 0.7, flyY - flySize * 0.3, flySize * 0.9, flySize * 0.3, side * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Legs (tiny)
    ctx.strokeStyle = "rgba(160, 140, 110, 0.6)";
    ctx.lineWidth = 1 * s;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const ly = flyY + flySize * (0.2 + i * 0.25);
        ctx.beginPath();
        ctx.moveTo(cx + side * flySize * 0.4, ly);
        ctx.lineTo(cx + side * flySize * 1.2, ly + flySize * 0.5);
        ctx.stroke();
      }
    }

    // Force arrows
    function drawArrow(x: number, y: number, dx: number, dy: number, color: string, label: string) {
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) return;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(dy, dx);
      const headSize = 6 * s;
      ctx.beginPath();
      ctx.moveTo(x + dx, y + dy);
      ctx.lineTo(x + dx - Math.cos(angle - 0.4) * headSize, y + dy - Math.sin(angle - 0.4) * headSize);
      ctx.lineTo(x + dx - Math.cos(angle + 0.4) * headSize, y + dy - Math.sin(angle + 0.4) * headSize);
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.font = `bold ${10 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(label, x + dx + (dx > 0 ? 1 : -1) * 8 * s, y + dy + (dy > 0 ? 14 : -6) * s);
    }

    // Gravity arrow (always visible after frame 10)
    if (frame > 10) {
      const gAlpha = interpolate(frame, [10, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const arrowLen = 40 * s;
      drawArrow(cx + 25 * s, flyY, 0, arrowLen * gAlpha, `rgba(255, 80, 80, ${gAlpha})`, "g");
    }

    // Reaction force (when touching ground)
    if (onGround) {
      const rAlpha = interpolate(frame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const settle = frame > 70 ? interpolate(frame, [70, 100], [1, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
      const arrowLen = 40 * s * settle;
      drawArrow(cx - 25 * s, groundY + 14 * s, 0, -arrowLen * rAlpha, `rgba(80, 220, 100, ${rAlpha})`, "N");
    }

    // "SETTLED" text when stable
    if (frame > 85) {
      const ta = interpolate(frame, [85, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(80, 220, 100, ${ta * 0.8})`;
      ctx.font = `bold ${14 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("PHYSICS ENGINE", cx, height * 0.2);
      ctx.font = `${10 * s}px monospace`;
      ctx.fillStyle = `rgba(80, 220, 100, ${ta * 0.5})`;
      ctx.fillText("real gravity, real collisions", cx, height * 0.2 + 16 * s);
    }

    ctx.textAlign = "start";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
