import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Cosmic pink/magenta nebula — Kurzgesagt "space" palette with soft cloud bg
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const CosmicPink: React.FC<VariantProps> = ({ width, height }) => {
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

    // Dark base
    ctx.fillStyle = "#08040e";
    ctx.fillRect(0, 0, width, height);

    // Nebula blobs
    const blobs = [
      { x: width * 0.3, y: height * 0.4, r: width * 0.3, c: "rgba(120, 20, 80, 0.08)" },
      { x: width * 0.7, y: height * 0.6, r: width * 0.25, c: "rgba(80, 10, 120, 0.06)" },
      { x: width * 0.5, y: height * 0.3, r: width * 0.2, c: "rgba(160, 40, 100, 0.05)" },
    ];
    for (const b of blobs) {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalAlpha = fadeOut;
    const visible = Math.floor(interpolate(frame, [5, 120], [1, data.nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      ctx.strokeStyle = "rgba(255, 120, 200, 0.18)";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.8 + Math.sin(frame * 0.06 + i * 2) * 0.2;

      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      g.addColorStop(0, `rgba(255, 150, 220, ${alpha * pulse * 0.25})`);
      g.addColorStop(1, "rgba(255, 100, 180, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 230, 245, ${alpha * pulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
