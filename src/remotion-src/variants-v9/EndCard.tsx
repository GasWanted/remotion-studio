import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Credits end card. Slow fade in, holds for 3 seconds.
// "Built on:" and "Code:" lines. Clean, minimal.

export const EndCard: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  // EndCard holds longer — fade out at very end
  const fadeOut = interpolate(frame, [140, 149], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;

    // Fade in starts at frame 20, hold from frame 50 onward
    const fadeIn = interpolate(frame, [20, 50], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Stagger the two blocks slightly
    const block1A = interpolate(frame, [20, 45], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const block2A = interpolate(frame, [35, 60], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Thin divider line
    if (fadeIn > 0) {
      const lineW = width * 0.3 * fadeIn;
      ctx.strokeStyle = `rgba(100, 100, 120, ${fadeIn * 0.3})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - lineW / 2, height * 0.46);
      ctx.lineTo(cx + lineW / 2, height * 0.46);
      ctx.stroke();
    }

    // Block 1: "Built on"
    if (block1A > 0) {
      const y1 = height * 0.30;

      ctx.fillStyle = `rgba(140, 140, 160, ${block1A * 0.5})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("Built on", cx, y1);

      ctx.fillStyle = `rgba(200, 200, 210, ${block1A * 0.75})`;
      ctx.font = `${8.5 * scale}px monospace`;
      ctx.fillText("FlyWire Consortium", cx, y1 + 16 * scale);

      ctx.fillStyle = `rgba(180, 180, 195, ${block1A * 0.6})`;
      ctx.font = `${7.5 * scale}px monospace`;
      ctx.fillText("Eon Systems  \u00B7  NeuroMechFly v2", cx, y1 + 30 * scale);
    }

    // Block 2: "Code"
    if (block2A > 0) {
      const y2 = height * 0.58;

      ctx.fillStyle = `rgba(140, 140, 160, ${block2A * 0.5})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("Code", cx, y2);

      ctx.fillStyle = `rgba(200, 200, 210, ${block2A * 0.75})`;
      ctx.font = `${8.5 * scale}px monospace`;
      ctx.fillText("PyTorch  \u00B7  MuJoCo  \u00B7  flygym", cx, y2 + 16 * scale);
    }

    // Subtle bottom accent
    if (fadeIn > 0.5) {
      const accentA = interpolate(frame, [50, 70], [0, 0.25], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      ctx.fillStyle = `rgba(100, 140, 200, ${accentA})`;
      ctx.font = `${5.5 * scale}px monospace`;
      ctx.fillText("fly-brain", cx, height * 0.82);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
