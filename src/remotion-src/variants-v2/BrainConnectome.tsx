import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Brain-shaped node network growing from center — ellipsoidal cloud of neurons
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const BrainConnectome: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = width / 2;
  const cy = height / 2;

  const { nodes, edges } = useMemo(() => {
    const rand = seeded(42);
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 250; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.4,
        y: cy + Math.sin(a) * r * 0.9,
        r: 1 + rand() * 2,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 && rand() < 0.15) {
          edges.push([i, j]);
        }
      }
    }
    return { nodes, edges };
  }, [width, height, cx, cy]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 170], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Edges
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      ctx.strokeStyle = "rgba(100, 60, 200, 0.12)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.7 + Math.sin(frame * 0.08 + i * 3) * 0.3;

      ctx.fillStyle = `rgba(160, 120, 255, ${alpha * pulse * 0.8})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.fillStyle = `rgba(160, 120, 255, ${alpha * pulse * 0.1})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
