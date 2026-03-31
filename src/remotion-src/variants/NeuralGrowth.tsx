import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Branching neural network grows outward from center
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const NeuralGrowth: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tree = useMemo(() => {
    const rand = seeded(42);
    const nodes: { x: number; y: number; parent: number; depth: number }[] = [
      { x: width / 2, y: height / 2, parent: -1, depth: 0 },
    ];
    for (let i = 0; i < 200; i++) {
      const parentIdx = Math.floor(rand() * nodes.length);
      const parent = nodes[parentIdx];
      if (parent.depth > 6) continue;
      const angle = rand() * Math.PI * 2;
      const dist = 20 + rand() * 40;
      nodes.push({
        x: parent.x + Math.cos(angle) * dist,
        y: parent.y + Math.sin(angle) * dist,
        parent: parentIdx,
        depth: parent.depth + 1,
      });
    }
    return nodes;
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const visible = Math.floor(interpolate(frame, [5, 180], [1, tree.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    ctx.globalAlpha = fadeOut;

    // Edges
    for (let i = 1; i < visible; i++) {
      const node = tree[i];
      const parent = tree[node.parent];
      const age = visible - i;
      const alpha = Math.min(1, age / 10) * 0.4;
      ctx.strokeStyle = `rgba(255, 170, 34, ${alpha})`;
      ctx.lineWidth = Math.max(0.5, 3 - node.depth * 0.4);
      ctx.beginPath();
      ctx.moveTo(parent.x, parent.y);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < visible; i++) {
      const node = tree[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const r = Math.max(1, 4 - node.depth * 0.5);
      ctx.fillStyle = `rgba(255, 200, 80, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
