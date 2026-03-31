import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Screen fills with white dots (representing 15M synapses abstractly).
// 157 of them turn red. You can barely see them. That's the point — 0.001%.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Dot {
  x: number;
  y: number;
  isRed: boolean;
}

function buildDots(width: number, height: number): Dot[] {
  const rand = seeded(157);
  const total = 3000; // Represents ~15M abstractly
  const redCount = 157;

  // Pick which indices turn red
  const redSet = new Set<number>();
  // Spread the red dots — don't cluster them
  while (redSet.size < redCount) {
    redSet.add(Math.floor(rand() * total));
  }

  return Array.from({ length: total }, (_, i) => ({
    x: rand() * width,
    y: rand() * height,
    isRed: redSet.has(i),
  }));
}

export const DotField: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const dots = useMemo(() => buildDots(width, height), [width, height]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Phase 1 (0-40): dots fill in progressively
    const fillProgress = interpolate(frame, [0, 40], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Phase 2 (50-70): red dots start glowing
    const redReveal = interpolate(frame, [50, 70], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Phase 3 (80-100): label fades in
    const labelA = interpolate(frame, [80, 100], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const visibleCount = Math.floor(fillProgress * dots.length);
    const dotR = Math.max(0.6, 0.8 * scale);

    // Draw white dots first
    for (let i = 0; i < visibleCount; i++) {
      const d = dots[i];
      if (d.isRed && redReveal > 0) continue; // Draw red ones in second pass
      ctx.fillStyle = "rgba(200, 200, 210, 0.35)";
      ctx.fillRect(d.x - dotR / 2, d.y - dotR / 2, dotR, dotR);
    }

    // Draw red dots (the 157 modified synapses)
    if (redReveal > 0) {
      for (let i = 0; i < visibleCount; i++) {
        const d = dots[i];
        if (!d.isRed) continue;

        // Transition from white to red
        const r = 200 + Math.floor(55 * redReveal);
        const g = Math.floor(200 * (1 - redReveal) + 40 * redReveal);
        const b = Math.floor(210 * (1 - redReveal) + 40 * redReveal);
        const a = 0.35 + redReveal * 0.55;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        const rr = dotR + redReveal * dotR * 0.5;
        ctx.fillRect(d.x - rr / 2, d.y - rr / 2, rr, rr);

        // Glow for red dots
        if (redReveal > 0.5) {
          ctx.shadowColor = "rgba(220, 50, 50, 0.4)";
          ctx.shadowBlur = 3 * scale * redReveal;
          ctx.fillRect(d.x - rr / 2, d.y - rr / 2, rr, rr);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Label
    if (labelA > 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = `rgba(220, 50, 50, ${labelA * 0.9})`;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.fillText("157", width / 2, height * 0.48);

      ctx.fillStyle = `rgba(180, 180, 180, ${labelA * 0.5})`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("out of 15,000,000", width / 2, height * 0.48 + 16 * scale);

      ctx.fillStyle = `rgba(140, 140, 140, ${labelA * 0.35})`;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("0.001%", width / 2, height * 0.48 + 26 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
