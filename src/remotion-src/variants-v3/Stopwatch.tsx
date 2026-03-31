import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Network with a big 00:32 stopwatch counting in the center, edges flickering as it counts
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Stopwatch: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.42;
      nodes.push({ x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.9, r: (1 + rand() * 1.5) * scale });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.12) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seconds = interpolate(frame, [30, 180], [0, 32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Edges — flicker based on timer
    for (const [a, b] of data.edges) {
      const flicker = Math.sin(frame * 0.3 + a + b) > 0 ? 0.3 : 0.15;
      ctx.strokeStyle = `rgba(80, 200, 120, ${flicker})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    for (const n of data.nodes) {
      ctx.fillStyle = "rgba(100, 230, 140, 0.5)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stopwatch
    const fontSize = Math.max(20, 48 * scale);
    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
    ctx.fillText(`00:${seconds.toFixed(1).padStart(4, "0")}`, width / 2, height / 2);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
