import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * Boxes in a circle: BRAIN -> DECODE -> MOTOR -> PHYSICS -> SENSORS -> BRAIN.
 * Data dots circulate. "100ms" pulses.
 */
export const FeedbackLoop: React.FC<VariantProps> = ({ width, height }) => {
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

    const cx = width / 2;
    const cy = height / 2 - 5 * s;
    const radius = 85 * s;

    const labels = ["BRAIN", "DECODE", "MOTOR", "PHYSICS", "SENSORS"];
    const colors = [
      "rgba(100, 160, 255, ",  // blue
      "rgba(180, 120, 255, ",  // purple
      "rgba(218, 175, 65, ",   // gold
      "rgba(80, 220, 100, ",   // green
      "rgba(255, 140, 80, ",   // orange
    ];

    const boxW = 52 * s;
    const boxH = 18 * s;

    // Compute box positions (arranged in circle, top = BRAIN)
    const positions = labels.map((_, i) => {
      const angle = -Math.PI / 2 + (i / labels.length) * Math.PI * 2;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        angle,
      };
    });

    // Box appearance stagger
    for (let i = 0; i < labels.length; i++) {
      const boxAppear = interpolate(frame, [i * 8, i * 8 + 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (boxAppear <= 0) continue;

      const { x, y } = positions[i];
      const col = colors[i];

      // Box background
      ctx.fillStyle = `${col}${boxAppear * 0.15})`;
      ctx.strokeStyle = `${col}${boxAppear * 0.7})`;
      ctx.lineWidth = 1.5 * s;

      const bx = x - boxW / 2;
      const by = y - boxH / 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 4 * s);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = `${col}${boxAppear * 0.9})`;
      ctx.font = `bold ${8 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], x, y);
    }

    // Arrows between boxes
    const arrowAppear = interpolate(frame, [40, 60], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (arrowAppear > 0) {
      ctx.strokeStyle = `rgba(150, 150, 170, ${arrowAppear * 0.4})`;
      ctx.fillStyle = `rgba(150, 150, 170, ${arrowAppear * 0.5})`;
      ctx.lineWidth = 1.2 * s;

      for (let i = 0; i < labels.length; i++) {
        const next = (i + 1) % labels.length;
        const from = positions[i];
        const to = positions[next];

        // Shorten arrow to not overlap boxes
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / dist;
        const uy = dy / dist;
        const startX = from.x + ux * (boxW / 2 + 4 * s);
        const startY = from.y + uy * (boxH / 2 + 4 * s);
        const endX = to.x - ux * (boxW / 2 + 4 * s);
        const endY = to.y - uy * (boxH / 2 + 4 * s);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const headSize = 5 * s;
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - Math.cos(angle - 0.4) * headSize, endY - Math.sin(angle - 0.4) * headSize);
        ctx.lineTo(endX - Math.cos(angle + 0.4) * headSize, endY - Math.sin(angle + 0.4) * headSize);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Circulating data dots
    if (frame > 55) {
      const dotPhase = (frame - 55) * 0.025;

      for (let d = 0; d < 3; d++) {
        const t = (dotPhase + d * (1 / 3)) % 1;
        const segFloat = t * labels.length;
        const segIdx = Math.floor(segFloat);
        const segFrac = segFloat - segIdx;
        const from = positions[segIdx % labels.length];
        const to = positions[(segIdx + 1) % labels.length];

        const dotX = from.x + (to.x - from.x) * segFrac;
        const dotY = from.y + (to.y - from.y) * segFrac;

        // Glow
        const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 10 * s);
        grad.addColorStop(0, "rgba(120, 255, 200, 0.7)");
        grad.addColorStop(1, "rgba(120, 255, 200, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 10 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(200, 255, 230, 0.9)";
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // "100ms" pulse label
    if (frame > 70) {
      const pulse = 0.5 + 0.5 * Math.sin((frame - 70) * 0.15);
      const tAlpha = interpolate(frame, [70, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(120, 255, 200, ${tAlpha * (0.5 + pulse * 0.5)})`;
      ctx.font = `bold ${13 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("100ms loop", cx, cy);

      ctx.font = `${9 * s}px monospace`;
      ctx.fillStyle = `rgba(120, 255, 200, ${tAlpha * 0.4})`;
      ctx.fillText("10 Hz", cx, cy + 14 * s);
    }

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
