import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-utils";

/**
 * Hex Mosaic: Honeycomb grid filling in tile by tile.
 * Each hex represents a researcher. Blue/orange alternating.
 * Clean geometric, satisfying fill pattern.
 */
export const PortalFlow: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const hexes = useMemo(() => {
    const r = 12 * scale;
    const h = r * Math.sqrt(3);
    const cols = Math.ceil(width / (r * 1.5)) + 1;
    const rows = Math.ceil(height / h) + 1;
    const cx = width / 2, cy = height / 2;
    const list: { x: number; y: number; dist: number }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * r * 1.5;
        const y = row * h + (col % 2 === 1 ? h / 2 : 0);
        const dx = x - cx, dy = y - cy;
        list.push({ x, y, dist: Math.sqrt(dx * dx + dy * dy) });
      }
    }

    // Sort by distance from center (fill outward)
    list.sort((a, b) => a.dist - b.dist);
    return { list, r };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.08);
    ctx.globalAlpha = fadeOut;

    // Fill hexes from center outward
    const fillT = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(fillT * hexes.list.length);
    const r = hexes.r;

    for (let i = 0; i < visibleCount; i++) {
      const hex = hexes.list[i];
      const age = (visibleCount - i) / 10;
      const t = Math.min(1, age);
      const st = easeOutBack(Math.min(1, age * 1.5));
      const sr = r * 0.9 * st;

      if (sr < 0.5) continue;

      ctx.globalAlpha = t * fadeOut;

      // Hex path
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2 - Math.PI / 6;
        const px = hex.x + Math.cos(a) * sr;
        const py = hex.y + Math.sin(a) * sr;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();

      // Shadow
      ctx.save();
      ctx.translate(1, 1);
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fill();
      ctx.restore();

      // Fill gradient
      const isBlue = i % 3 !== 0;
      const baseColor = isBlue ? C.blue : C.orange;
      const grad = ctx.createRadialGradient(hex.x - sr * 0.2, hex.y - sr * 0.2, 0, hex.x, hex.y, sr);
      grad.addColorStop(0, "rgba(255,255,255,0.3)");
      grad.addColorStop(0.5, baseColor + "cc");
      grad.addColorStop(1, (isBlue ? C.blueDark : C.orangeDark) + "aa");
      ctx.fillStyle = grad;
      ctx.fill();

      // Outline
      ctx.strokeStyle = isBlue ? "rgba(32,80,160,0.3)" : "rgba(192,96,0,0.3)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Specular dot
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(hex.x - sr * 0.2, hex.y - sr * 0.2, sr * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const count = Math.min(200, Math.floor(fillT * 200));
    ctx.fillText(`${count}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
