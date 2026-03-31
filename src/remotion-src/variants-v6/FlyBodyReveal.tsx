import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * Wireframe fly materializes from nothing: head first, then thorax, legs, wings.
 * Gold lines on dark background.
 */
export const FlyBodyReveal: React.FC<VariantProps> = ({ width, height }) => {
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
    const cy = height / 2;

    // Progress for each body part
    const headP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const thoraxP = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const abdomenP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const legsP = interpolate(frame, [45, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wingsP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const gold = (alpha: number) => `rgba(218, 175, 65, ${alpha})`;
    const goldBright = (alpha: number) => `rgba(255, 215, 80, ${alpha})`;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Helper: draw partial ellipse outline
    function drawEllipse(x: number, y: number, rx: number, ry: number, progress: number, lineW: number) {
      if (progress <= 0) return;
      ctx.strokeStyle = gold(progress);
      ctx.lineWidth = lineW * s;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2 * progress);
      ctx.stroke();
    }

    // Head
    drawEllipse(cx, cy - 55 * s, 18 * s, 16 * s, headP, 1.5);

    // Eyes
    if (headP > 0.5) {
      const eyeA = interpolate(headP, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = goldBright(eyeA);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.ellipse(cx - 14 * s, cy - 58 * s, 8 * s, 10 * s, -0.3, 0, Math.PI * 2 * eyeA);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 14 * s, cy - 58 * s, 8 * s, 10 * s, 0.3, 0, Math.PI * 2 * eyeA);
      ctx.stroke();
    }

    // Thorax
    drawEllipse(cx, cy - 20 * s, 22 * s, 25 * s, thoraxP, 1.8);

    // Abdomen
    drawEllipse(cx, cy + 30 * s, 18 * s, 35 * s, abdomenP, 1.5);

    // Legs (3 pairs)
    if (legsP > 0) {
      const legDefs = [
        // [startX offset, startY, angles, lengths for segments]
        { sy: -30, angles: [-0.8, -0.3], lens: [35, 30, 25] },
        { sy: -15, angles: [-0.2, 0.2], lens: [40, 35, 28] },
        { sy: 0, angles: [0.4, 0.6], lens: [38, 32, 26] },
      ];

      ctx.strokeStyle = gold(legsP);
      ctx.lineWidth = 1.2 * s;

      for (const leg of legDefs) {
        for (const side of [-1, 1]) {
          const segVisible = Math.floor(legsP * 3);
          const segPartial = (legsP * 3) % 1;
          let px = cx + side * 22 * s;
          let py = cy + leg.sy * s;
          ctx.beginPath();
          ctx.moveTo(px, py);

          for (let seg = 0; seg < 3; seg++) {
            if (seg > segVisible) break;
            const frac = seg === segVisible ? segPartial : 1;
            const angle = leg.angles[0] + (leg.angles[1] - leg.angles[0]) * (seg / 2);
            const dx = side * Math.cos(angle) * leg.lens[seg] * s * frac;
            const dy = Math.sin(Math.abs(angle) + 0.3) * leg.lens[seg] * s * frac;
            px += dx;
            py += dy;
            ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Joint dots
          if (legsP > 0.5) {
            let jx = cx + side * 22 * s;
            let jy = cy + leg.sy * s;
            for (let seg = 0; seg < 3; seg++) {
              const angle = leg.angles[0] + (leg.angles[1] - leg.angles[0]) * (seg / 2);
              jx += side * Math.cos(angle) * leg.lens[seg] * s;
              jy += Math.sin(Math.abs(angle) + 0.3) * leg.lens[seg] * s;
              ctx.fillStyle = goldBright(legsP * 0.7);
              ctx.beginPath();
              ctx.arc(jx, jy, 2 * s, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    }

    // Wings
    if (wingsP > 0) {
      for (const side of [-1, 1]) {
        ctx.strokeStyle = gold(wingsP * 0.8);
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        const wingX = cx + side * 24 * s;
        const wingY = cy - 25 * s;
        ctx.moveTo(wingX, wingY);
        ctx.bezierCurveTo(
          wingX + side * 50 * s * wingsP, wingY - 40 * s * wingsP,
          wingX + side * 70 * s * wingsP, wingY - 10 * s * wingsP,
          wingX + side * 55 * s * wingsP, wingY + 15 * s * wingsP,
        );
        ctx.bezierCurveTo(
          wingX + side * 40 * s * wingsP, wingY + 25 * s * wingsP,
          wingX + side * 15 * s * wingsP, wingY + 15 * s * wingsP,
          wingX, wingY,
        );
        ctx.stroke();
      }
    }

    // Glow pulse on completed body
    if (frame > 95) {
      const glowA = interpolate(frame, [95, 110, 120, 130], [0, 0.3, 0.15, 0.3], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      ctx.shadowColor = "rgba(218, 175, 65, 0.6)";
      ctx.shadowBlur = 20 * s * glowA;
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
