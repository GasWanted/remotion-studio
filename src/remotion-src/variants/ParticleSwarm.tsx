import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Particles flow chaotically then self-organize into a sphere
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const ParticleSwarm: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const particles = useMemo(() => {
    const rand = seeded(77);
    return Array.from({ length: 300 }, () => ({
      startX: rand() * width,
      startY: rand() * height,
      targetAngle: rand() * Math.PI * 2,
      targetR: 30 + rand() * (Math.min(width, height) * 0.3),
      speed: 0.5 + rand() * 1.5,
      hue: 20 + rand() * 30,
    }));
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;

    // t=0: scattered. t=1: organized
    const organize = interpolate(frame, [20, 170], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    for (const p of particles) {
      const targetX = cx + Math.cos(p.targetAngle) * p.targetR;
      const targetY = cy + Math.sin(p.targetAngle) * p.targetR * 0.6;

      const drift = Math.sin(frame * 0.02 * p.speed + p.targetAngle) * 20 * (1 - organize);
      const x = p.startX + (targetX - p.startX) * organize + drift;
      const y = p.startY + (targetY - p.startY) * organize + drift * 0.5;

      const alpha = 0.3 + organize * 0.5;
      ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.5 + organize, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
