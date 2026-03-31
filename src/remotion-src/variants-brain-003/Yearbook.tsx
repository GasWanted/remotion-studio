import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawBust } from "./icons";

// Variant 9: Grid of circular bust portraits like a yearbook page
export const Yearbook: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3009);
    const particles = makeParticles(20, width, height, scale);
    const cols = 12, rows = 7;
    const cellW = (width * 0.85) / cols, cellH = (height * 0.6) / rows;
    const entries: { x: number; y: number; hue: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        entries.push({
          x: width * 0.075 + c * cellW + cellW / 2,
          y: height * 0.25 + r * cellH + cellH / 2,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
          delay: rand() * 55,
        });
      }
    }
    return { particles, entries, cellW, cellH };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${20 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024 — The Team", width / 2, height * 0.13);

    // Bust portraits
    const bustR = Math.min(data.cellW, data.cellH) * 0.35;
    let count = 0;
    for (const entry of data.entries) {
      const t = interpolate(frame - entry.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      count++;
      ctx.globalAlpha = t;

      // Pop-in scale
      const popScale = interpolate(t, [0, 0.7, 1], [0, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawBust(ctx, entry.x, entry.y, bustR * popScale, entry.hue, t);
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.min(count, 200)}+ scientists`, width / 2, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
