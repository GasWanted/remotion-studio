import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Connectome already built. A cluster flashes red, rest dims. 32s counter.
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

function buildNetwork(width: number, height: number, scale: number) {
  const rand = seeded(42);
  const cx = width / 2, cy = height / 2;
  const nodes: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 250; i++) {
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
  // Cluster: 20 nodes nearest center
  const dists = nodes.map((n, i) => ({ i, d: (n.x - cx) ** 2 + (n.y - cy) ** 2 }));
  dists.sort((a, b) => a.d - b.d);
  const cluster = new Set(dists.slice(0, 20).map((d) => d.i));
  const clusterEdges = new Set<number>();
  edges.forEach(([a, b], idx) => { if (cluster.has(a) && cluster.has(b)) clusterEdges.add(idx); });
  return { nodes, edges, cluster, clusterEdges };
}

export const RedFlash: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildNetwork(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dim = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    for (let i = 0; i < data.edges.length; i++) {
      const [a, b] = data.edges[i];
      const isCl = data.clusterEdges.has(i);
      const alpha = isCl ? 0.35 + flash * 0.5 : 0.35 * (1 - dim * 0.85);
      const color = isCl && flash > 0 ? `rgba(255, 40, 40, ${alpha})` : `rgba(80, 200, 120, ${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i];
      const isCl = data.cluster.has(i);
      const pulse = 0.7 + Math.sin(frame * 0.08 + i * 3) * 0.3;
      const alpha = isCl ? 0.8 + flash * 0.2 : 0.8 * (1 - dim * 0.8) * pulse;
      const s = isCl ? n.r * (1 + flash * 0.8) : n.r;
      const color = isCl && flash > 0 ? `rgba(255, 60, 60, ${alpha})` : `rgba(100, 230, 140, ${alpha})`;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, s, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
