import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Three numbers that tell the whole story:
// "50,000,000 years" in gold (evolution)
// "32 seconds" in green (computation)
// "157" in red appears between them (the lever)

export const FinalContrast: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;

    // "50,000,000 years" fades in first (frames 10-30)
    const yearsA = interpolate(frame, [10, 30], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // "32 seconds" fades in next (frames 35-55)
    const secsA = interpolate(frame, [35, 55], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // "157" appears last, between them (frames 70-90)
    const numA = interpolate(frame, [70, 90], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Top: evolution time — gold
    if (yearsA > 0) {
      const y1 = height * 0.28;
      ctx.fillStyle = `rgba(220, 180, 60, ${yearsA * 0.9})`;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillText("50,000,000 years", cx, y1);

      ctx.fillStyle = `rgba(200, 170, 80, ${yearsA * 0.4})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("evolution", cx, y1 + 16 * scale);

      // Subtle glow
      ctx.shadowColor = "rgba(220, 180, 60, 0.3)";
      ctx.shadowBlur = 12 * scale * yearsA;
      ctx.fillStyle = `rgba(220, 180, 60, ${yearsA * 0.15})`;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillText("50,000,000 years", cx, y1);
      ctx.shadowBlur = 0;
    }

    // Bottom: computation time — green
    if (secsA > 0) {
      const y2 = height * 0.72;
      ctx.fillStyle = `rgba(60, 220, 120, ${secsA * 0.9})`;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillText("32 seconds", cx, y2);

      ctx.fillStyle = `rgba(80, 200, 130, ${secsA * 0.4})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("computation", cx, y2 + 16 * scale);

      ctx.shadowColor = "rgba(60, 220, 120, 0.3)";
      ctx.shadowBlur = 12 * scale * secsA;
      ctx.fillStyle = `rgba(60, 220, 120, ${secsA * 0.15})`;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.fillText("32 seconds", cx, y2);
      ctx.shadowBlur = 0;
    }

    // Center: 157 — red, the fulcrum
    if (numA > 0) {
      const yc = height * 0.50;
      ctx.fillStyle = `rgba(220, 50, 50, ${numA})`;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.fillText("157", cx, yc);

      ctx.shadowColor = "rgba(220, 50, 50, 0.5)";
      ctx.shadowBlur = 25 * scale * numA;
      ctx.fillText("157", cx, yc);
      ctx.shadowBlur = 0;

      // Thin horizontal lines reaching toward the other numbers
      const lineA = interpolate(frame, [85, 100], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (lineA > 0) {
        ctx.strokeStyle = `rgba(220, 50, 50, ${lineA * 0.2})`;
        ctx.lineWidth = 0.5 * scale;
        // Line up
        ctx.beginPath();
        ctx.moveTo(cx, yc - 18 * scale);
        ctx.lineTo(cx, yc - 18 * scale - (height * 0.14) * lineA);
        ctx.stroke();
        // Line down
        ctx.beginPath();
        ctx.moveTo(cx, yc + 18 * scale);
        ctx.lineTo(cx, yc + 18 * scale + (height * 0.14) * lineA);
        ctx.stroke();
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
