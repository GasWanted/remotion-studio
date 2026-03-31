import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const EMSliceStack: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const sliceData = useMemo(() => {
    const rand = seeded(101);
    const totalSlices = 40;
    const slices: { textures: { x: number; y: number; w: number; h: number; gray: number }[] }[] = [];
    for (let i = 0; i < totalSlices; i++) {
      const textures: { x: number; y: number; w: number; h: number; gray: number }[] = [];
      const count = 15 + Math.floor(rand() * 20);
      for (let j = 0; j < count; j++) {
        textures.push({
          x: rand() * 200 - 100,
          y: rand() * 140 - 70,
          w: 5 + rand() * 40,
          h: 5 + rand() * 30,
          gray: 30 + rand() * 120,
        });
      }
      slices.push({ textures });
    }
    return slices;
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

    const cx = width / 2;
    const cy = height / 2;
    const sliceW = 160 * scale;
    const sliceH = 110 * scale;

    // Perspective parameters
    const depthSpacing = 3 * scale;
    const xShift = 1.5 * scale;
    const yShift = -1.5 * scale;

    // How many slices to show
    const totalSlices = sliceData.length;
    const slicesVisible = interpolate(frame, [5, 120], [0, totalSlices], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const numFull = Math.floor(slicesVisible);
    const partialAlpha = slicesVisible - numFull;

    for (let i = 0; i <= Math.min(numFull, totalSlices - 1); i++) {
      const isPartial = i === numFull;
      const alpha = isPartial ? partialAlpha : 1;
      if (alpha <= 0) continue;

      const offsetX = (i - totalSlices / 2) * xShift;
      const offsetY = (i - totalSlices / 2) * yShift;
      const sx = cx + offsetX - sliceW / 2;
      const sy = cy + offsetY - sliceH / 2 + (totalSlices - i) * depthSpacing * 0.3;

      ctx.save();
      ctx.globalAlpha = fadeOut * alpha;

      // Slice background — dark gray EM image base
      ctx.fillStyle = "#1a1a22";
      ctx.fillRect(sx, sy, sliceW, sliceH);

      // EM textures — random gray blobs simulating tissue cross-sections
      for (const t of sliceData[i].textures) {
        const tx = sx + sliceW / 2 + t.x * scale * 0.8;
        const ty = sy + sliceH / 2 + t.y * scale * 0.8;
        const tw = t.w * scale * 0.45;
        const th = t.h * scale * 0.45;
        const g = Math.round(t.gray);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.6)`;
        ctx.beginPath();
        ctx.ellipse(tx, ty, tw / 2, th / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Border
      ctx.strokeStyle = `rgba(100, 100, 120, ${0.4 * alpha})`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sx, sy, sliceW, sliceH);

      ctx.restore();
    }

    // Subtle depth label
    if (numFull > 0) {
      ctx.globalAlpha = fadeOut * 0.5;
      ctx.fillStyle = "#888";
      ctx.font = `${11 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(`${numFull} / ${totalSlices} slices`, cx + sliceW / 2, cy + sliceH / 2 + 20 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
