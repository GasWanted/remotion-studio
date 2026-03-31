import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const Ultramicrotome: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const blockTexture = useMemo(() => {
    const rand = seeded(202);
    const dots: { x: number; y: number; r: number; g: number }[] = [];
    for (let i = 0; i < 80; i++) {
      dots.push({
        x: rand() * 100,
        y: rand() * 160,
        r: 2 + rand() * 6,
        g: 40 + rand() * 80,
      });
    }
    return dots;
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const blockW = 80 * scale;
    const blockH = 130 * scale;
    const blockX = width * 0.22 - blockW / 2;
    const blockY = height / 2 - blockH / 2;

    // Knife cycle: slices peel every 12 frames
    const slicePeriod = 12;
    const totalSlices = Math.floor(130 / slicePeriod);
    const currentSliceCycle = frame / slicePeriod;
    const slicesDone = Math.min(Math.floor(currentSliceCycle), totalSlices);
    const cycleFrac = currentSliceCycle - Math.floor(currentSliceCycle);

    // Draw the resin block (shrinks as slices are taken)
    const shrink = slicesDone * 1.5 * scale;
    ctx.fillStyle = "#2a2520";
    ctx.fillRect(blockX, blockY, Math.max(blockW - shrink, 20 * scale), blockH);

    // Block texture
    for (const d of blockTexture) {
      const dx = blockX + d.x * scale * 0.7;
      const dy = blockY + d.y * scale * 0.8;
      if (dx < blockX + Math.max(blockW - shrink, 20 * scale)) {
        ctx.fillStyle = `rgba(${d.g}, ${d.g - 10}, ${d.g - 20}, 0.5)`;
        ctx.beginPath();
        ctx.arc(dx, dy, d.r * scale * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Block outline
    ctx.strokeStyle = "rgba(120, 100, 80, 0.6)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(blockX, blockY, Math.max(blockW - shrink, 20 * scale), blockH);

    // Diamond knife
    const knifeX = blockX + Math.max(blockW - shrink, 20 * scale) + 2 * scale;
    const knifeProgress = frame < slicesDone * slicePeriod + slicePeriod
      ? interpolate(cycleFrac, [0, 0.4, 0.6, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;

    if (frame < 130) {
      const knifeY = blockY + knifeProgress * blockH;
      ctx.strokeStyle = "rgba(200, 220, 255, 0.8)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(knifeX - 5 * scale, knifeY);
      ctx.lineTo(knifeX + 5 * scale, knifeY);
      ctx.stroke();

      // Knife glint
      ctx.fillStyle = `rgba(200, 220, 255, ${0.3 * knifeProgress})`;
      ctx.fillRect(knifeX - 5 * scale, knifeY - 1 * scale, 10 * scale, 2 * scale);
    }

    // Slices peeling off to the right
    const sliceThickness = 3 * scale;
    const targetArea = width * 0.6;
    const stackStart = width * 0.45;

    for (let i = 0; i < slicesDone; i++) {
      const targetX = stackStart + (i % 20) * (sliceThickness + 2 * scale);
      const isCurrent = i === slicesDone - 1;
      const flyProgress = isCurrent
        ? interpolate(cycleFrac, [0.4, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })
        : 1;

      const sx = knifeX + (targetX - knifeX) * flyProgress;
      const sy = blockY + (1 - flyProgress) * 10 * scale;
      const sw = sliceThickness;
      const sh = blockH * (0.9 + flyProgress * 0.1);

      // Slice
      ctx.fillStyle = `rgba(60, 55, 50, ${0.6 + flyProgress * 0.3})`;
      ctx.fillRect(sx, sy, sw, sh);

      // Slice texture
      ctx.fillStyle = "rgba(100, 90, 80, 0.3)";
      for (let j = 0; j < 5; j++) {
        const ty = sy + (j + 1) * sh / 6;
        ctx.fillRect(sx, ty, sw, 1 * scale);
      }

      ctx.strokeStyle = "rgba(100, 90, 80, 0.4)";
      ctx.lineWidth = 0.5 * scale;
      ctx.strokeRect(sx, sy, sw, sh);
    }

    // Label
    ctx.globalAlpha = fadeOut * 0.5;
    ctx.fillStyle = "#777";
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${slicesDone} sections`, width * 0.6, height - 20 * scale);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
