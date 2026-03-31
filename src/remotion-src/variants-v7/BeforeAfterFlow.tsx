import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Top: "BEFORE: Sugar → ··· → FEED ✓ RETREAT ✗". Bottom fades in with reversed results.
export const BeforeAfterFlow: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const topY = height * 0.3;
    const botY = height * 0.7;

    // Phase timing
    const beforeAlpha = interpolate(frame, [5, 25], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const afterAlpha = interpolate(frame, [55, 75], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const strikeProgress = interpolate(frame, [85, 100], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const fontSize = 13 * S;
    const smallFont = 10 * S;
    const labelFont = `bold ${fontSize}px monospace`;
    const textFont = `${smallFont}px monospace`;

    // Helper to draw a flow row
    const drawRow = (
      y: number,
      label: string,
      labelColor: string,
      feedActive: boolean,
      retreatActive: boolean,
      alpha: number,
    ) => {
      if (alpha <= 0) return;
      ctx.globalAlpha = fadeOut * alpha;

      // Label (BEFORE / AFTER)
      ctx.font = labelFont;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = labelColor;
      ctx.fillText(label, cx - 100 * S, y);

      // Flow: Sugar → ··· → FEED/RETREAT
      ctx.font = textFont;
      ctx.textAlign = "left";

      const startX = cx - 80 * S;
      let x = startX;
      const gap = 6 * S;

      // "Sugar"
      ctx.fillStyle = `rgba(200,200,220,${0.8 * alpha})`;
      ctx.fillText("Sugar", x, y);
      x += ctx.measureText("Sugar").width + gap;

      // Arrow
      ctx.fillStyle = `rgba(120,120,140,${0.5 * alpha})`;
      ctx.fillText("\u2192", x, y);
      x += ctx.measureText("\u2192").width + gap;

      // Dots
      ctx.fillStyle = `rgba(80,80,100,${0.4 * alpha})`;
      ctx.fillText("\u00B7\u00B7\u00B7", x, y);
      x += ctx.measureText("\u00B7\u00B7\u00B7").width + gap;

      // Arrow
      ctx.fillStyle = `rgba(120,120,140,${0.5 * alpha})`;
      ctx.fillText("\u2192", x, y);
      x += ctx.measureText("\u2192").width + gap * 2;

      // FEED
      const feedX = x;
      if (feedActive) {
        ctx.fillStyle = `rgba(80,220,120,${0.9 * alpha})`;
        ctx.fillText("FEED", x, y - 10 * S);
        ctx.fillStyle = `rgba(80,220,120,${0.7 * alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText("\u2713", x + ctx.measureText("FEED").width + 4 * S, y - 10 * S);
        ctx.font = textFont;
      } else {
        ctx.fillStyle = `rgba(255,60,60,${0.5 * alpha})`;
        ctx.fillText("FEED", x, y - 10 * S);
        ctx.fillStyle = `rgba(255,60,60,${0.6 * alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText("\u2717", x + ctx.measureText("FEED").width + 4 * S, y - 10 * S);
        ctx.font = textFont;
      }

      // RETREAT
      if (retreatActive) {
        ctx.fillStyle = `rgba(255,160,40,${0.9 * alpha})`;
        ctx.fillText("RETREAT", x, y + 12 * S);
        ctx.fillStyle = `rgba(80,220,120,${0.7 * alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText("\u2713", x + ctx.measureText("RETREAT").width + 4 * S, y + 12 * S);
        ctx.font = textFont;
      } else {
        ctx.fillStyle = `rgba(100,100,120,${0.4 * alpha})`;
        ctx.fillText("RETREAT", x, y + 12 * S);
        ctx.fillStyle = `rgba(255,60,60,${0.4 * alpha})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText("\u2717", x + ctx.measureText("RETREAT").width + 4 * S, y + 12 * S);
        ctx.font = textFont;
      }
    };

    // Draw BEFORE row
    drawRow(topY, "BEFORE:", "rgba(150,160,200,0.7)", true, false, beforeAlpha);

    // Draw AFTER row
    drawRow(botY, "AFTER:", "rgba(255,180,60,0.8)", false, true, afterAlpha);

    // Strike-through on BEFORE section
    if (strikeProgress > 0) {
      ctx.globalAlpha = fadeOut * strikeProgress * 0.6;
      ctx.strokeStyle = "rgba(255,60,60,0.7)";
      ctx.lineWidth = 2 * S;
      const strikeStartX = cx - 110 * S;
      const strikeEndX = cx + 130 * S;
      const strikeX = strikeStartX + (strikeEndX - strikeStartX) * strikeProgress;

      ctx.beginPath();
      ctx.moveTo(strikeStartX, topY);
      ctx.lineTo(strikeX, topY);
      ctx.stroke();
    }

    // Divider line between before/after
    if (afterAlpha > 0) {
      ctx.globalAlpha = fadeOut * afterAlpha * 0.2;
      ctx.strokeStyle = "rgba(100,100,140,1)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4 * S, 4 * S]);
      ctx.beginPath();
      ctx.moveTo(cx - 130 * S, height / 2);
      ctx.lineTo(cx + 130 * S, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = fadeOut;
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
