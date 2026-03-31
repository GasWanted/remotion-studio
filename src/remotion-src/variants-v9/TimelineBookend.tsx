import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Horizontal timeline line.
// Left end: "50M years" with amber glow (impossibly long).
// Right end: "32s" with green glow (impossibly short).
// "157" sits at the right end, punctuating the brevity.

export const TimelineBookend: React.FC<VariantProps> = ({ width, height }) => {
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

    const cy = height * 0.50;
    const lineLeft = width * 0.08;
    const lineRight = width * 0.92;
    const lineLen = lineRight - lineLeft;

    // Line draws in from left to right (frames 5-50)
    const lineProgress = interpolate(frame, [5, 50], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Left label (frames 15-30)
    const leftA = interpolate(frame, [15, 30], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Right label (frames 55-70)
    const rightA = interpolate(frame, [55, 70], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // 157 (frames 80-100)
    const numA = interpolate(frame, [80, 100], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const currentRight = lineLeft + lineLen * lineProgress;

    // Main timeline line
    if (lineProgress > 0) {
      // Gradient line: amber on left, transitions to green on right
      const grad = ctx.createLinearGradient(lineLeft, cy, currentRight, cy);
      grad.addColorStop(0, "rgba(220, 170, 50, 0.6)");
      grad.addColorStop(0.85, "rgba(100, 180, 120, 0.3)");
      grad.addColorStop(1, "rgba(60, 220, 120, 0.6)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(lineLeft, cy);
      ctx.lineTo(currentRight, cy);
      ctx.stroke();

      // Left endpoint dot
      ctx.fillStyle = "rgba(220, 170, 50, 0.9)";
      ctx.beginPath();
      ctx.arc(lineLeft, cy, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Right endpoint dot (once line reaches it)
      if (lineProgress > 0.95) {
        ctx.fillStyle = "rgba(60, 220, 120, 0.9)";
        ctx.beginPath();
        ctx.arc(lineRight, cy, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Left label: "50M years" — amber glow
    if (leftA > 0) {
      ctx.textAlign = "center";

      // Amber glow halo
      ctx.shadowColor = "rgba(220, 170, 50, 0.5)";
      ctx.shadowBlur = 15 * scale * leftA;

      ctx.fillStyle = `rgba(220, 170, 50, ${leftA * 0.9})`;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.fillText("50M years", lineLeft + 2 * scale, cy - 18 * scale);
      ctx.shadowBlur = 0;

      // Subtle subtitle
      ctx.fillStyle = `rgba(200, 170, 80, ${leftA * 0.35})`;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("of evolution", lineLeft + 2 * scale, cy - 8 * scale);

      // Amber pulse particles
      const pulseA = Math.sin(frame * 0.08) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(220, 170, 50, ${leftA * pulseA * 0.15})`;
      ctx.beginPath();
      ctx.arc(lineLeft, cy, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right label: "32s" — green glow
    if (rightA > 0) {
      ctx.textAlign = "center";

      ctx.shadowColor = "rgba(60, 220, 120, 0.5)";
      ctx.shadowBlur = 15 * scale * rightA;

      ctx.fillStyle = `rgba(60, 220, 120, ${rightA * 0.9})`;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.fillText("32 seconds", lineRight - 2 * scale, cy - 18 * scale);
      ctx.shadowBlur = 0;

      ctx.fillStyle = `rgba(80, 200, 130, ${rightA * 0.35})`;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("of computation", lineRight - 2 * scale, cy - 8 * scale);

      // Green pulse
      const pulseG = Math.sin(frame * 0.1 + 1) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(60, 220, 120, ${rightA * pulseG * 0.15})`;
      ctx.beginPath();
      ctx.arc(lineRight, cy, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // "157" below the right end
    if (numA > 0) {
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(220, 50, 50, ${numA})`;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.fillText("157", lineRight - 2 * scale, cy + 24 * scale);

      ctx.shadowColor = "rgba(220, 50, 50, 0.5)";
      ctx.shadowBlur = 18 * scale * numA;
      ctx.fillText("157", lineRight - 2 * scale, cy + 24 * scale);
      ctx.shadowBlur = 0;

      // "connections" subtitle
      ctx.fillStyle = `rgba(180, 100, 100, ${numA * 0.4})`;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("connections", lineRight - 2 * scale, cy + 35 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
