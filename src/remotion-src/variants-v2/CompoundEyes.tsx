import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Two compound eyes made of hexagonal facets, filling in one by one
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const CompoundEyes: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const facets = useMemo(() => {
    const rand = seeded(99);
    const all: { x: number; y: number; size: number; eye: string }[] = [];
    const hexSize = Math.min(width, height) * 0.025;

    for (const eye of ["left", "right"] as const) {
      const ecx = eye === "left" ? width * 0.33 : width * 0.67;
      const ecy = height * 0.45;
      const eyeR = Math.min(width, height) * 0.25;

      for (let row = -12; row <= 12; row++) {
        for (let col = -8; col <= 8; col++) {
          const x = ecx + col * hexSize * 1.75 + (row % 2) * hexSize * 0.875;
          const y = ecy + row * hexSize * 1.5;
          const dx = x - ecx;
          const dy = y - ecy;
          if (Math.sqrt(dx * dx + (dy * 1.3) ** 2) < eyeR) {
            all.push({ x, y, size: hexSize, eye });
          }
        }
      }
    }
    // Shuffle for random reveal order
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [10, 160], [0, facets.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    for (let i = 0; i < visible; i++) {
      const f = facets[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 6);

      // Hexagon
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a - Math.PI / 6;
        const hx = f.x + Math.cos(angle) * f.size;
        const hy = f.y + Math.sin(angle) * f.size;
        a === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      const hue = f.eye === "left" ? 0 : 10;
      ctx.fillStyle = `hsla(${hue}, 75%, 35%, ${alpha * 0.5})`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${hue}, 75%, 50%, ${alpha * 0.4})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
