import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Cells divide exponentially from one to many
export const CellDivision: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = width / 2;
  const cy = height / 2;

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Number of cells doubles every ~30 frames
    const t = interpolate(frame, [10, 190], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const count = Math.floor(Math.pow(2, t * 7)); // 1 → 128
    const baseR = Math.max(5, 40 - count * 0.3);

    // Arrange in expanding spiral
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963; // golden angle
      const dist = Math.sqrt(i) * baseR * 0.8;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      // Cell membrane
      const wobble = Math.sin(frame * 0.1 + i * 1.7) * 2;
      const r = baseR + wobble;

      // Dividing animation for newest cells
      const isNew = i >= count / 2;
      const squeeze = isNew ? Math.sin(frame * 0.15 + i) * 0.15 : 0;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1 + squeeze, 1 - squeeze);

      // Outer glow
      const grad = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
      grad.addColorStop(0, "rgba(100, 200, 150, 0.6)");
      grad.addColorStop(0.7, "rgba(50, 150, 100, 0.3)");
      grad.addColorStop(1, "rgba(30, 100, 80, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Nucleus
      ctx.fillStyle = "rgba(200, 255, 200, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
