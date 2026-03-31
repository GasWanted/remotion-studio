import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A counter spins up rapidly to 86,000,000,000 (human neurons).
// Hard cut to black. Beat. "157" appears tiny. Billions vs. hundreds.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function formatWithCommas(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

export const CounterCrash: React.FC<VariantProps> = ({ width, height }) => {
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
    const cy = height / 2;

    // Phase 1 (0-65): counter spins up from 0 to 86B
    // Phase 2 (65-80): hard black (nothing)
    // Phase 3 (80-130): "157" fades in small
    const cutFrame = 65;
    const revealFrame = 85;

    if (frame < cutFrame) {
      // Counter spinning up — exponential acceleration
      // Start slow, accelerate hard
      const t = frame / cutFrame;
      // Exponential ramp: slow at first, then explosive
      const exp = Math.pow(t, 3.5);
      const value = exp * 86000000000;

      const displayStr = formatWithCommas(value);

      // Slight screen shake as numbers get huge
      const shakeAmt = t > 0.7 ? (t - 0.7) * 15 * scale : 0;
      const rand = seeded(frame * 7);
      const shakeX = (rand() - 0.5) * shakeAmt;
      const shakeY = (rand() - 0.5) * shakeAmt;

      // Number display
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Size grows as number grows
      const fontSize = (12 + t * 8) * scale;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + t * 0.3})`;
      ctx.font = `bold ${fontSize}px monospace`;
      ctx.fillText(displayStr, cx + shakeX, cy + shakeY);

      // Label
      ctx.fillStyle = `rgba(150, 150, 150, ${0.4 + t * 0.2})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("neurons", cx + shakeX, cy + fontSize * 0.6 + shakeY + 8 * scale);

      // Glow intensifies
      if (t > 0.5) {
        ctx.shadowColor = `rgba(255, 255, 255, ${(t - 0.5) * 0.5})`;
        ctx.shadowBlur = (t - 0.5) * 30 * scale;
        ctx.fillStyle = `rgba(255, 255, 255, ${(t - 0.5) * 0.3})`;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.fillText(displayStr, cx + shakeX, cy + shakeY);
        ctx.shadowBlur = 0;
      }

      // Flash on final frame before cut
      if (frame >= cutFrame - 3) {
        const flashA = interpolate(frame, [cutFrame - 3, cutFrame - 1], [0, 0.6], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        ctx.fillStyle = `rgba(255, 255, 255, ${flashA})`;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (frame >= revealFrame) {
      // "157" appears tiny in the center
      const revealA = interpolate(frame, [revealFrame, revealFrame + 20], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Small, red, deliberate
      ctx.fillStyle = `rgba(220, 50, 50, ${revealA})`;
      ctx.font = `300 ${14 * scale}px monospace`;
      ctx.fillText("157", cx, cy);

      if (revealA > 0.3) {
        ctx.shadowColor = "rgba(220, 50, 50, 0.35)";
        ctx.shadowBlur = 15 * scale * revealA;
        ctx.fillText("157", cx, cy);
        ctx.shadowBlur = 0;
      }
    }
    // Frames cutFrame to revealFrame: pure black — that silence is intentional
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
