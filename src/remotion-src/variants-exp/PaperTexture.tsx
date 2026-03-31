import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Dark paper texture with hand-drawn/sketch feel — wobbly lines, cross-hatch shadows
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const PaperTexture: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 150; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({ x: cx + Math.cos(a) * r * 1.3, y: cy + Math.sin(a) * r * 0.9, r: (2 + rand() * 2.5) * scale });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Dark paper
    ctx.fillStyle = "#1c1a17";
    ctx.fillRect(0, 0, width, height);

    // Noise texture
    const rand2 = seeded(777);
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 2000; i++) {
      const gray = 100 + rand2() * 100;
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(rand2() * width, rand2() * height, 1 + rand2() * 2, 1 + rand2() * 2);
    }

    ctx.globalAlpha = fadeOut;
    const visible = Math.floor(interpolate(frame, [5, 120], [1, data.nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Sketchy edges — slightly wobbly
    const rand3 = seeded(333);
    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      const na = data.nodes[a], nb = data.nodes[b];
      ctx.strokeStyle = "rgba(200, 190, 170, 0.25)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x + rand3() * 2 * scale, na.y + rand3() * 2 * scale);
      ctx.lineTo(nb.x + rand3() * 2 * scale, nb.y + rand3() * 2 * scale);
      ctx.stroke();
    }

    // Nodes — circles with slight stroke
    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);

      ctx.fillStyle = `rgba(230, 215, 185, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(180, 165, 135, ${alpha * 0.5})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.stroke();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
