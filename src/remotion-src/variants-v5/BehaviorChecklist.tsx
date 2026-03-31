import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Six rows appear one by one with green checkmarks slamming in. Final: 6/6.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const BEHAVIORS = [
  { input: "Sugar", output: "FEED" },
  { input: "Looming", output: "ESCAPE" },
  { input: "Touch", output: "GROOM" },
  { input: "Smell", output: "TURN" },
  { input: "Sugar+Bitter", output: "IDLE" },
  { input: "Movement", output: "WALK" },
];

export const BehaviorChecklist: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const rowH = height * 0.11;
    const startY = height * 0.12;
    const leftX = width * 0.1;
    const arrowX = width * 0.48;
    const rightX = width * 0.55;
    const checkX = width * 0.85;
    const framePerRow = 15;
    const startFrame = 8;

    let completedCount = 0;

    for (let i = 0; i < BEHAVIORS.length; i++) {
      const b = BEHAVIORS[i];
      const rowStart = startFrame + i * framePerRow;
      const y = startY + i * rowH;

      // Row text fade in
      const textIn = interpolate(frame, [rowStart, rowStart + 6], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

      if (textIn <= 0) continue;

      // Input label
      ctx.globalAlpha = fadeOut * textIn;
      ctx.fillStyle = "#ddeeff";
      ctx.font = `${11 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(b.input, leftX, y + rowH * 0.6);

      // Arrow
      ctx.fillStyle = "rgba(120, 160, 200, 0.6)";
      ctx.font = `${11 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("\u2192", arrowX, y + rowH * 0.6);

      // Output label
      ctx.fillStyle = "#88ccff";
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(b.output, rightX, y + rowH * 0.6);

      // Checkmark slam
      const checkFrame = rowStart + 8;
      const checkIn = interpolate(frame, [checkFrame, checkFrame + 3], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

      if (checkIn > 0) {
        completedCount++;
        // Slam scale effect: starts big and snaps to 1
        const slamScale = interpolate(frame, [checkFrame, checkFrame + 2, checkFrame + 4], [2.5, 1, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        // Flash
        const flashA = interpolate(frame, [checkFrame, checkFrame + 2, checkFrame + 8], [0.5, 0.3, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });

        ctx.save();
        ctx.translate(checkX, y + rowH * 0.55);
        ctx.scale(slamScale, slamScale);

        // Green checkmark
        ctx.fillStyle = `rgba(60, 255, 100, ${checkIn})`;
        ctx.shadowColor = "#33ff66";
        ctx.shadowBlur = 8 * scale * checkIn;
        ctx.font = `bold ${16 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u2713", 0, 0);
        ctx.shadowBlur = 0;
        ctx.textBaseline = "alphabetic";

        ctx.restore();

        // Row flash
        if (flashA > 0) {
          ctx.fillStyle = `rgba(60, 255, 100, ${flashA * 0.15})`;
          ctx.fillRect(leftX - 5 * scale, y, width * 0.8, rowH);
        }
      }

      // Subtle separator line
      ctx.strokeStyle = "rgba(80, 120, 180, 0.1)";
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(leftX, y + rowH);
      ctx.lineTo(width * 0.9, y + rowH);
      ctx.stroke();

      ctx.globalAlpha = fadeOut;
    }

    // 6/6 counter at bottom
    const counterFrame = startFrame + BEHAVIORS.length * framePerRow + 8;
    const counterIn = interpolate(frame, [counterFrame, counterFrame + 8], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    if (counterIn > 0) {
      ctx.globalAlpha = fadeOut * counterIn;

      const counterY = startY + BEHAVIORS.length * rowH + rowH * 0.8;

      // Glow behind text
      const pulseA = 0.3 + 0.2 * Math.sin(frame * 0.1);
      ctx.fillStyle = `rgba(60, 255, 100, ${pulseA * counterIn})`;
      ctx.shadowColor = "#33ff66";
      ctx.shadowBlur = 20 * scale;
      ctx.font = `bold ${20 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("6 / 6", width / 2, counterY);
      ctx.shadowBlur = 0;
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
