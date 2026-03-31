import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPerson } from "./icons";

// Variant 8: Circular/spiral arrangement of people filling like stadium seating
export const StadiumFill: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3008);
    const particles = makeParticles(25, width, height, scale);
    const cx = width / 2, cy = height * 0.52;
    const people: { x: number; y: number; hue: number; ring: number }[] = [];
    // Concentric rings
    for (let ring = 0; ring < 7; ring++) {
      const radius = (25 + ring * 18) * scale;
      const count = 6 + ring * 6;
      for (let i = 0; i < count && people.length < 210; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        people.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius * 0.7,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
          ring,
        });
      }
    }
    return { particles, people };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.1);

    // Fill from center outward
    const fillT = interpolate(frame, [8, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    let count = 0;

    for (const p of data.people) {
      const ringDelay = p.ring * 0.12;
      const personT = interpolate(fillT, [ringDelay, ringDelay + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (personT <= 0) continue;
      count++;

      ctx.globalAlpha = personT;
      drawPerson(ctx, p.x, p.y, 7 * scale * personT, `hsla(${p.hue}, 50%, 60%, 0.85)`);
    }

    // Center focal point
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = `hsla(280, 40%, 50%, 1)`;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.52, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.min(count, 200)}+`, width / 2, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
