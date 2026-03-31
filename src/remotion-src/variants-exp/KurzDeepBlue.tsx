import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Kurzgesagt deep blue: rich gradient background, white/cyan nodes, soft glow
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const KurzDeepBlue: React.FC<VariantProps> = ({ width, height }) => {
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

    // Background gradient
    const grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
    grad.addColorStop(0, "#0a1628");
    grad.addColorStop(0.5, "#061224");
    grad.addColorStop(1, "#020a18");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle star dust
    ctx.globalAlpha = 0.15;
    const rand2 = seeded(99);
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(rand2() * width, rand2() * height, rand2() * 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, data.nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Edges — soft cyan
    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      ctx.strokeStyle = "rgba(80, 200, 255, 0.18)";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Nodes — white core + cyan glow
    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.8 + Math.sin(frame * 0.06 + i * 2) * 0.2;

      // Glow
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      g.addColorStop(0, `rgba(80, 210, 255, ${alpha * pulse * 0.2})`);
      g.addColorStop(1, "rgba(80, 210, 255, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = `rgba(220, 245, 255, ${alpha * pulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
