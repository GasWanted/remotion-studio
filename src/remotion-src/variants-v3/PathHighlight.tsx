import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Green network, then a signal path lights up gold, gets severed, reroutes through red path
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const PathHighlight: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 150; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({ x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.9 });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) edges.push([i, j]);
      }
    }
    // Original path (left→right through nodes)
    const sorted = nodes.map((n, i) => ({ i, x: n.x })).sort((a, b) => a.x - b.x);
    const origPath = sorted.filter((_, i) => i % 15 === 0).map((s) => s.i).slice(0, 8);
    // New path (detour through bottom)
    const bottomNodes = nodes.map((n, i) => ({ i, y: n.y })).sort((a, b) => b.y - a.y);
    const newPath = [origPath[0], ...bottomNodes.slice(0, 4).map((n) => n.i), origPath[origPath.length - 1]];
    return { nodes, edges, origPath, newPath };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pathDraw = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sever = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reroute = interpolate(frame, [100, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Background edges
    for (const [a, b] of data.edges) {
      ctx.strokeStyle = "rgba(80, 200, 120, 0.12)";
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Original path (gold, then severed)
    const origVisible = Math.ceil(data.origPath.length * pathDraw);
    ctx.lineCap = "round";
    for (let i = 0; i < origVisible - 1; i++) {
      const na = data.nodes[data.origPath[i]], nb = data.nodes[data.origPath[i + 1]];
      const alpha = sever > 0 ? 0.7 * (1 - sever) : 0.7;
      ctx.strokeStyle = sever > 0 ? `rgba(255, 80, 80, ${alpha})` : `rgba(255, 200, 50, ${alpha})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Rerouted path (red/orange)
    if (reroute > 0) {
      const newVisible = Math.ceil(data.newPath.length * reroute);
      for (let i = 0; i < newVisible - 1; i++) {
        const na = data.nodes[data.newPath[i]], nb = data.nodes[data.newPath[i + 1]];
        ctx.strokeStyle = `rgba(255, 120, 40, 0.8)`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }
    }

    // Nodes
    for (const n of data.nodes) {
      ctx.fillStyle = "rgba(100, 230, 140, 0.6)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
