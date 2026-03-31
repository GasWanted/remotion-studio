import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

/**
 * Boxes build left to right as a pipeline:
 * "Descending Neurons" -> "Behavior Decoder" -> "Motor Generator" -> "Joint Angles"
 * Arrows connect them. Data flows through.
 */
export const PipelineStack: React.FC<VariantProps> = ({ width, height }) => {
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

    const cy = height / 2;

    const stages = [
      { label: "Descending\nNeurons", color: "rgba(100, 160, 255, " },
      { label: "Behavior\nDecoder", color: "rgba(180, 120, 255, " },
      { label: "Motor\nGenerator", color: "rgba(218, 175, 65, " },
      { label: "Joint\nAngles", color: "rgba(80, 220, 100, " },
    ];

    const numStages = stages.length;
    const totalWidth = width * 0.85;
    const boxW = totalWidth / numStages * 0.65;
    const gapW = totalWidth / numStages * 0.35;
    const boxH = 50 * s;
    const startX = (width - totalWidth) / 2;

    const boxPositions: { x: number; y: number; w: number; h: number }[] = [];

    for (let i = 0; i < numStages; i++) {
      const bx = startX + i * (boxW + gapW);
      boxPositions.push({ x: bx, y: cy - boxH / 2, w: boxW, h: boxH });
    }

    // Draw boxes with staggered appearance
    for (let i = 0; i < numStages; i++) {
      const appear = interpolate(frame, [i * 15 + 5, i * 15 + 25], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (appear <= 0) continue;

      const { x, y, w, h } = boxPositions[i];
      const col = stages[i].color;

      // Box scale-in from left
      const drawW = w * appear;

      // Background
      ctx.fillStyle = `${col}${appear * 0.1})`;
      ctx.strokeStyle = `${col}${appear * 0.7})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.roundRect(x, y, drawW, h, 5 * s);
      ctx.fill();
      ctx.stroke();

      // Label (only when mostly visible)
      if (appear > 0.7) {
        const tAlpha = interpolate(appear, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `${col}${tAlpha * 0.9})`;
        ctx.font = `bold ${8.5 * s}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lines = stages[i].label.split("\n");
        const lineH = 11 * s;
        const textY = cy - ((lines.length - 1) * lineH) / 2;
        for (let l = 0; l < lines.length; l++) {
          ctx.fillText(lines[l], x + w / 2, textY + l * lineH);
        }
      }
    }

    // Arrows between boxes
    for (let i = 0; i < numStages - 1; i++) {
      const arrowAppear = interpolate(frame, [i * 15 + 20, i * 15 + 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      if (arrowAppear <= 0) continue;

      const from = boxPositions[i];
      const to = boxPositions[i + 1];
      const ax1 = from.x + from.w + 3 * s;
      const ax2 = to.x - 3 * s;
      const ay = cy;

      // Arrow line
      const drawnEnd = ax1 + (ax2 - ax1) * arrowAppear;
      ctx.strokeStyle = `rgba(150, 150, 170, ${arrowAppear * 0.5})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(ax1, ay);
      ctx.lineTo(drawnEnd, ay);
      ctx.stroke();

      // Arrowhead
      if (arrowAppear > 0.8) {
        const headAlpha = interpolate(arrowAppear, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `rgba(150, 150, 170, ${headAlpha * 0.6})`;
        const headSize = 5 * s;
        ctx.beginPath();
        ctx.moveTo(ax2, ay);
        ctx.lineTo(ax2 - headSize, ay - headSize * 0.6);
        ctx.lineTo(ax2 - headSize, ay + headSize * 0.6);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Data flow dots (after pipeline is built)
    if (frame > 65) {
      const flowAlpha = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      for (let d = 0; d < 4; d++) {
        const t = ((frame - 65) * 0.02 + d * 0.25) % 1;
        const totalPathLen = boxPositions[numStages - 1].x + boxPositions[numStages - 1].w - boxPositions[0].x;
        const dotX = boxPositions[0].x + t * totalPathLen;

        // Check if dot is in an arrow gap (between boxes)
        let inGap = false;
        for (let i = 0; i < numStages - 1; i++) {
          const gapStart = boxPositions[i].x + boxPositions[i].w;
          const gapEnd = boxPositions[i + 1].x;
          if (dotX >= gapStart && dotX <= gapEnd) {
            inGap = true;
            break;
          }
        }

        const dotAlpha = Math.sin(t * Math.PI) * flowAlpha * (inGap ? 1 : 0.4);
        if (dotAlpha <= 0) continue;

        const grad = ctx.createRadialGradient(dotX, cy, 0, dotX, cy, 6 * s);
        grad.addColorStop(0, `rgba(120, 255, 200, ${dotAlpha * 0.8})`);
        grad.addColorStop(1, `rgba(120, 255, 200, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dotX, cy, 6 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(200, 255, 230, ${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(dotX, cy, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Input/output labels
    if (frame > 75) {
      const la = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      ctx.font = `${9 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      // Input label
      ctx.fillStyle = `rgba(100, 160, 255, ${la * 0.6})`;
      ctx.fillText("brain spikes", boxPositions[0].x + boxPositions[0].w / 2, boxPositions[0].y - 10 * s);

      // Output label
      ctx.fillStyle = `rgba(80, 220, 100, ${la * 0.6})`;
      ctx.fillText("muscle torques", boxPositions[numStages - 1].x + boxPositions[numStages - 1].w / 2, boxPositions[numStages - 1].y + boxPositions[numStages - 1].h + 18 * s);
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
