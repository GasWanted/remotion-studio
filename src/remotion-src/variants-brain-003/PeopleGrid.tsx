import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPerson } from "./icons";

// Variant 1: Orderly grid of person icons filling in, counter ticks to 200+
export const PeopleGrid: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3001);
    const particles = makeParticles(30, width, height, scale);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.32;
    const people: { x: number; y: number; hue: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (people.length >= 208) break;
        people.push({
          x: startX + c * cellW + cellW / 2,
          y: startY + r * cellH + cellH / 2,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
          delay: (r * cols + c) * 0.3,
        });
      }
    }
    return { particles, people, cellW, cellH };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // "2024" title
    const titleAlpha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = titleAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${28 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.2);

    // People icons appear
    let visibleCount = 0;
    for (const p of data.people) {
      const t = interpolate(frame - p.delay, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      visibleCount++;
      ctx.globalAlpha = t;
      const personSize = Math.min(data.cellW, data.cellH) * 0.4 * t;
      drawPerson(ctx, p.x, p.y, personSize, `hsla(${p.hue}, 50%, 62%, 0.85)`);
    }

    // Counter
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${16 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(visibleCount, 200)}+`, width * 0.88, height * 0.92);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
