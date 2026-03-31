import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPerson } from "./icons";

// Variant 5: Rows of people icons doing a wave animation
export const CrowdWave: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3005);
    const particles = makeParticles(25, width, height, scale);
    const cols = 20, rows = 10;
    const cellW = (width * 0.85) / cols, cellH = (height * 0.55) / rows;
    const people: { x: number; y: number; col: number; row: number; hue: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (people.length >= 200) break;
        people.push({
          x: width * 0.075 + c * cellW + cellW / 2,
          y: height * 0.3 + r * cellH + cellH / 2,
          col: c, row: r,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
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

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.15);

    // People with wave
    const personSize = Math.min(data.cellW, data.cellH) * 0.35;
    const fillT = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalPeople = Math.floor(fillT * data.people.length);

    for (let i = 0; i < totalPeople; i++) {
      const p = data.people[i];
      // Wave: people bob up based on column + time
      const wavePhase = (p.col / 20) * Math.PI * 2 + frame * 0.08;
      const waveOffset = Math.sin(wavePhase) * 4 * scale;
      const brightness = 0.5 + Math.sin(wavePhase) * 0.2;

      ctx.globalAlpha = 1;
      drawPerson(ctx, p.x, p.y + waveOffset, personSize, `hsla(${p.hue}, ${45 + brightness * 20}%, ${55 + brightness * 15}%, 0.85)`);
    }

    // Counter
    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${totalPeople}+ scientists`, width / 2, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
