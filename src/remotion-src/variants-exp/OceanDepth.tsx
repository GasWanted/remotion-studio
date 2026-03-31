import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Ocean depth — deep blue-green, bioluminescent nodes, underwater atmosphere
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const OceanDepth: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({ x: cx + Math.cos(a) * r * 1.3, y: cy + Math.sin(a) * r * 0.9, r: (1.5 + rand() * 2.5) * scale });
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

    // Deep ocean gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "#020e14");
    grad.addColorStop(0.5, "#041820");
    grad.addColorStop(1, "#021018");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Floating particles (plankton)
    ctx.globalAlpha = 0.06;
    const rand2 = seeded(555);
    for (let i = 0; i < 40; i++) {
      const px = rand2() * width;
      const py = (rand2() * height + frame * 0.3 * (0.5 + rand2())) % height;
      ctx.fillStyle = "#40ffaa";
      ctx.beginPath();
      ctx.arc(px, py, rand2() * 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;
    const visible = Math.floor(interpolate(frame, [5, 120], [1, data.nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      ctx.strokeStyle = "rgba(60, 220, 180, 0.12)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Bioluminescent nodes
    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.6 + Math.sin(frame * 0.05 + i * 3) * 0.4;

      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 7);
      g.addColorStop(0, `rgba(80, 255, 200, ${alpha * pulse * 0.2})`);
      g.addColorStop(0.5, `rgba(40, 200, 160, ${alpha * pulse * 0.05})`);
      g.addColorStop(1, "rgba(20, 150, 120, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(180, 255, 230, ${alpha * pulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
