import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Green network, then a shockwave ripple expands from center — nodes it hits turn red
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const RippleShock: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const cx = width / 2, cy = height / 2;

  const data = useMemo(() => {
    const rand = seeded(42);
    const nodes: { x: number; y: number; r: number; dist: number }[] = [];
    for (let i = 0; i < 250; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      const x = cx + Math.cos(a) * r * 1.4;
      const y = cy + Math.sin(a) * r * 0.9;
      nodes.push({ x, y, r: (1 + rand() * 2) * scale, dist: Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale, cx, cy]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const maxDist = Math.max(...data.nodes.map((n) => n.dist));
  const rippleR = interpolate(frame, [70, 150], [0, maxDist * 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Edges
    for (const [a, b] of data.edges) {
      const hit = data.nodes[a].dist < rippleR && data.nodes[b].dist < rippleR;
      ctx.strokeStyle = hit ? "rgba(255, 50, 50, 0.3)" : "rgba(80, 200, 120, 0.35)";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (const n of data.nodes) {
      const hit = n.dist < rippleR;
      const pulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
      ctx.fillStyle = hit ? `rgba(255, 80, 60, ${pulse * 0.9})` : `rgba(100, 230, 140, ${pulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (hit ? 1.3 : 1), 0, Math.PI * 2);
      ctx.fill();
    }

    // Ripple ring
    if (rippleR > 0 && rippleR < maxDist * 1.2) {
      ctx.strokeStyle = `rgba(255, 100, 80, ${0.5 * (1 - rippleR / (maxDist * 1.2))})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
