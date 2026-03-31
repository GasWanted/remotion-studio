import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Stars appear and edges connect nearby ones into constellations
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const ConstellationMap: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { stars, edges } = useMemo(() => {
    const rand = seeded(31);
    const stars = Array.from({ length: 120 }, () => ({
      x: rand() * width,
      y: rand() * height,
      size: 0.5 + rand() * 2,
      brightness: 0.4 + rand() * 0.6,
      appearAt: Math.floor(rand() * 150) + 5,
    }));
    const edges: { a: number; b: number }[] = [];
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 80 && rand() < 0.3) {
          edges.push({ a: i, b: j });
        }
      }
    }
    return { stars, edges };
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Edges
    for (const e of edges) {
      const sa = stars[e.a];
      const sb = stars[e.b];
      if (frame < sa.appearAt || frame < sb.appearAt) continue;
      const age = Math.min(frame - sa.appearAt, frame - sb.appearAt);
      const alpha = Math.min(1, age / 20) * 0.15;
      ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }

    // Stars
    for (const s of stars) {
      if (frame < s.appearAt) continue;
      const age = frame - s.appearAt;
      const alpha = Math.min(1, age / 10) * s.brightness;
      const twinkle = 0.7 + Math.sin(frame * 0.1 + s.x) * 0.3;

      // Glow
      ctx.fillStyle = `rgba(180, 200, 255, ${alpha * twinkle * 0.15})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(220, 230, 255, ${alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
