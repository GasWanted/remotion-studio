import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Full network, then camera zooms into a tiny region where 3-4 connections change color
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SurgicalZoom: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 250; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      nodes.push({ x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.9, r: (1 + rand() * 2) });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 && rand() < 0.15) edges.push([i, j]);
      }
    }
    // Target: 5 nearest center
    const target = nodes.map((n, i) => ({ i, d: (n.x - cx) ** 2 + (n.y - cy) ** 2 }))
      .sort((a, b) => a.d - b.d).slice(0, 5).map((t) => t.i);
    const targetSet = new Set(target);
    const targetEdges = new Set<number>();
    edges.forEach(([a, b], idx) => { if (targetSet.has(a) && targetSet.has(b)) targetEdges.add(idx); });
    return { nodes, edges, targetSet, targetEdges, cx, cy };
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [50, 110], [1, 4], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });
  const modify = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-data.cx, -data.cy);

    for (let i = 0; i < data.edges.length; i++) {
      const [a, b] = data.edges[i];
      const isTarget = data.targetEdges.has(i);
      const color = isTarget && modify > 0
        ? `rgba(255, 60, 60, ${0.35 + modify * 0.4})`
        : "rgba(80, 200, 120, 0.25)";
      ctx.strokeStyle = color;
      ctx.lineWidth = isTarget && modify > 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i];
      const isTarget = data.targetSet.has(i);
      const color = isTarget && modify > 0
        ? `rgba(255, 80, 60, ${0.5 + modify * 0.4})`
        : "rgba(100, 230, 140, 0.7)";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (isTarget && modify > 0 ? 1.5 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
