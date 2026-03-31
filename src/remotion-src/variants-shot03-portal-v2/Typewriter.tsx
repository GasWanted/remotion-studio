import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Typewriter: Scientists appear left-to-right, row-by-row, like a
 * typewriter printing characters. Cursor blinks at active position.
 * Clean rhythmic reveal with mechanical precision.
 */
export const Typewriter: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(5107);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.3;
    const list: { x: number; y: number; order: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= 208) break;
        list.push({
          x: startX + c * cellW + cellW / 2,
          y: startY + r * cellH + cellH / 2,
          order: r * cols + c,
        });
      }
    }
    return { list, cols, rows, cellW, cellH, startX, startY };
  }, [width, height]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    drawDotGrid(ctx, width, height, scale);
    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("roster complete", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Row guide lines
    for (let r = 0; r < data.rows; r++) {
      const y = data.startY + r * data.cellH + data.cellH / 2;
      ctx.strokeStyle = "rgba(180,180,200,0.06)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(data.startX, y + data.cellH * 0.4);
      ctx.lineTo(data.startX + data.cols * data.cellW, y + data.cellH * 0.4);
      ctx.stroke();
    }

    // Typing progress
    const typeT = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cursorPos = Math.floor(typeT * data.list.length);
    const r = Math.min(data.cellW, data.cellH) * 0.17;

    for (let i = 0; i < Math.min(cursorPos, data.list.length); i++) {
      const dot = data.list[i];
      const age = (cursorPos - i) / 4;
      const t = easeOutBack(Math.min(1, age));
      if (t < 0.01) continue;

      ctx.globalAlpha = Math.min(1, age) * fadeOut;
      const dotR = r * t;

      // Glow
      const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR * 3);
      g.addColorStop(0, accent(i, 0.1));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 3, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath(); ctx.arc(dot.x + 0.5, dot.y + 0.5, dotR, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(i, 0.85);
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(dot.x - dotR * 0.2, dot.y - dotR * 0.2, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Blinking cursor at current position
    if (cursorPos < data.list.length && cursorPos > 0) {
      const cursorDot = data.list[cursorPos];
      const blink = Math.sin(frame * 0.25) > 0;
      if (blink) {
        ctx.globalAlpha = 0.7 * fadeOut;
        ctx.fillStyle = C.blue;
        ctx.fillRect(
          cursorDot.x - 1 * scale,
          cursorDot.y - data.cellH * 0.35,
          2 * scale,
          data.cellH * 0.7
        );
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(200, cursorPos)}+`, width * 0.92, height * 0.94);
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("scientists", width * 0.92, height * 0.97);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
