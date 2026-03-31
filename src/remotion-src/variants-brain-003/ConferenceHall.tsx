import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawSeatedPerson } from "./icons";

// Variant 2: Bird's-eye auditorium filling with seated person silhouettes
export const ConferenceHall: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3002);
    const particles = makeParticles(25, width, height, scale);
    const cx = width / 2, cy = height * 0.55;
    // Curved rows of seats (like an auditorium)
    const seats: { x: number; y: number; hue: number; delay: number }[] = [];
    for (let row = 0; row < 8; row++) {
      const rowRadius = (50 + row * 22) * scale;
      const seatsInRow = 8 + row * 4;
      const arcSpan = Math.PI * 0.65;
      const startAngle = Math.PI + (Math.PI - arcSpan) / 2;
      for (let s = 0; s < seatsInRow && seats.length < 210; s++) {
        const angle = startAngle + (s / (seatsInRow - 1)) * arcSpan;
        seats.push({
          x: cx + Math.cos(angle) * rowRadius,
          y: cy + Math.sin(angle) * rowRadius * 0.6,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
          delay: rand() * 50 + row * 5,
        });
      }
    }
    return { particles, seats };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // Stage/podium
    ctx.fillStyle = `hsla(280, 25%, 30%, 0.5)`;
    ctx.fillRect(width * 0.35, height * 0.2, width * 0.3, height * 0.08);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("STAGE", width / 2, height * 0.25);

    // "2024" above
    const titleAlpha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = titleAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
    ctx.fillText("2024", width / 2, height * 0.13);

    // Seated people fill in
    let count = 0;
    for (const seat of data.seats) {
      const t = interpolate(frame - seat.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      count++;
      ctx.globalAlpha = t;
      drawSeatedPerson(ctx, seat.x, seat.y, 8 * scale * t, `hsla(${seat.hue}, 45%, 58%, 0.8)`);
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(count, 200)}+`, width * 0.9, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
