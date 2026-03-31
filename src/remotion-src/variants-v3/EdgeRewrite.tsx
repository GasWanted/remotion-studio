import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Green network built, then specific edges dissolve (red) and new ones form (gold)
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const EdgeRewrite: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      nodes.push({ x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.9, r: (1 + rand() * 2) * scale });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) edges.push([i, j]);
      }
    }
    // Pick ~15 edges to dissolve, ~15 new ones to form
    const dissolve = new Set<number>();
    const newEdges: [number, number][] = [];
    for (let i = 0; i < edges.length && dissolve.size < 15; i++) {
      if (rand() < 0.08) dissolve.add(i);
    }
    for (let k = 0; k < 15; k++) {
      const a = Math.floor(rand() * nodes.length);
      const b = Math.floor(rand() * nodes.length);
      if (a !== b) newEdges.push([a, b]);
    }
    return { nodes, edges, dissolve, newEdges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rewriteT = interpolate(frame, [70, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Original edges
    for (let i = 0; i < data.edges.length; i++) {
      const [a, b] = data.edges[i];
      const dissolving = data.dissolve.has(i);
      const alpha = dissolving ? 0.35 * (1 - rewriteT) : 0.35;
      const color = dissolving ? `rgba(255, 80, 80, ${alpha})` : `rgba(80, 200, 120, ${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // New edges growing in
    for (const [a, b] of data.newEdges) {
      if (rewriteT <= 0) continue;
      const na = data.nodes[a], nb = data.nodes[b];
      const ex = na.x + (nb.x - na.x) * rewriteT;
      const ey = na.y + (nb.y - na.y) * rewriteT;
      ctx.strokeStyle = `rgba(255, 200, 50, ${rewriteT * 0.6})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Nodes
    for (const n of data.nodes) {
      const pulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
      ctx.fillStyle = `rgba(100, 230, 140, ${pulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
