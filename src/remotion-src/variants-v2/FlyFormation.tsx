import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Hundreds of tiny particles scattered, then self-organize into the shape of a fly
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const FlyFormation: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = width / 2;
  const cy = height / 2;

  const particles = useMemo(() => {
    const rand = seeded(33);
    const sc = Math.min(width, height) * 0.005;

    // Target positions forming a fly silhouette
    const targets: [number, number][] = [];

    // Head
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 8 * sc;
      targets.push([cx + Math.cos(a) * r, cy - 25 * sc + Math.sin(a) * r * 0.8]);
    }
    // Eyes
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 5 * sc;
      targets.push([cx - 10 * sc + Math.cos(a) * r, cy - 28 * sc + Math.sin(a) * r]);
      targets.push([cx + 10 * sc + Math.cos(a) * r, cy - 28 * sc + Math.sin(a) * r]);
    }
    // Thorax
    for (let i = 0; i < 50; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 10 * sc;
      targets.push([cx + Math.cos(a) * r * 0.7, cy - 5 * sc + Math.sin(a) * r]);
    }
    // Abdomen
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const r = rand() * 8 * sc;
      targets.push([cx + Math.cos(a) * r * 0.6, cy + 20 * sc + Math.sin(a) * r * 1.5]);
    }
    // Wings
    for (let i = 0; i < 40; i++) {
      const side = i < 20 ? -1 : 1;
      const a = rand() * Math.PI * 2;
      const r = rand() * 10 * sc;
      targets.push([cx + side * 22 * sc + Math.cos(a) * r, cy - 8 * sc + Math.sin(a) * r * 0.4]);
    }
    // Legs
    for (let i = 0; i < 30; i++) {
      const leg = Math.floor(i / 5);
      const side = leg < 3 ? -1 : 1;
      const legIdx = leg % 3;
      const along = (i % 5) / 5;
      const baseY = cy + (-5 + legIdx * 8) * sc;
      targets.push([
        cx + side * (8 + along * 20) * sc,
        baseY + along * 8 * sc,
      ]);
    }

    return targets.map(([tx, ty]) => ({
      startX: rand() * width,
      startY: rand() * height,
      targetX: tx,
      targetY: ty,
    }));
  }, [width, height, cx, cy]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const t = interpolate(frame, [15, 160], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Ease in-out
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    for (const p of particles) {
      const x = p.startX + (p.targetX - p.startX) * ease;
      const y = p.startY + (p.targetY - p.startY) * ease;

      ctx.fillStyle = `rgba(255, 170, 34, ${0.3 + ease * 0.6})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
