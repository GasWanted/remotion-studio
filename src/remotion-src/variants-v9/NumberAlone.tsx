import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Pure black for 2 seconds, then "157" fades in center in red. Then "connections" below.
// The emptiness around the number IS the message.

export const NumberAlone: React.FC<VariantProps> = ({ width, height }) => {
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

    // 2 seconds of black = 60 frames at 30fps
    // "157" fades in from frame 60 to 80
    const numberA = interpolate(frame, [60, 80], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // "connections" fades in from frame 90 to 110
    const wordA = interpolate(frame, [90, 110], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const cx = width / 2;
    const cy = height / 2;

    if (numberA > 0) {
      // "157" — small, red, center
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(220, 50, 50, ${numberA})`;
      ctx.font = `300 ${24 * scale}px monospace`;
      ctx.fillText("157", cx, cy - 6 * scale);

      // Subtle glow
      if (numberA > 0.5) {
        ctx.shadowColor = "rgba(220, 50, 50, 0.4)";
        ctx.shadowBlur = 20 * scale * numberA;
        ctx.fillText("157", cx, cy - 6 * scale);
        ctx.shadowBlur = 0;
      }
    }

    if (wordA > 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(180, 180, 180, ${wordA * 0.6})`;
      ctx.font = `300 ${9 * scale}px monospace`;
      ctx.fillText("connections", cx, cy + 18 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
