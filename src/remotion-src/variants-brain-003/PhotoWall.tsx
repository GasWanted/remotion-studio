import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawBust } from "./icons";

// Variant 4: Polaroid-style frames with bust portraits tiling in
export const PhotoWall: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3004);
    const particles = makeParticles(20, width, height, scale);
    const cols = 10, rows = 6;
    const cellW = (width * 0.8) / cols, cellH = (height * 0.6) / rows;
    const photos: { x: number; y: number; hue: number; delay: number; rot: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        photos.push({
          x: width * 0.1 + c * cellW + cellW / 2,
          y: height * 0.22 + r * cellH + cellH / 2,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
          delay: rand() * 60,
          rot: (rand() - 0.5) * 0.15,
        });
      }
    }
    return { particles, photos, cellW, cellH };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.12);

    // Photo frames
    const frameSize = Math.min(data.cellW, data.cellH) * 0.85;
    let count = 0;
    for (const photo of data.photos) {
      const t = interpolate(frame - photo.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      count++;

      ctx.globalAlpha = t;
      ctx.save();
      ctx.translate(photo.x, photo.y);
      ctx.rotate(photo.rot);

      // Polaroid frame
      const fw = frameSize * 0.9, fh = frameSize;
      ctx.fillStyle = `hsla(40, 10%, 92%, ${t * 0.12})`;
      ctx.fillRect(-fw / 2, -fh / 2, fw, fh);

      // Bust inside
      drawBust(ctx, 0, -fh * 0.08, fw * 0.32, photo.hue, t * 0.9);

      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(count, 200)}+`, width * 0.92, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
