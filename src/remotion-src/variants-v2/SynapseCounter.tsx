import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// Network of nodes growing while a synapse counter ticks up to 15 million
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SynapseCounter: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { nodes, edges } = useMemo(() => {
    const rand = seeded(44);
    const cx = width / 2;
    const cy = height * 0.42;
    const nodes = Array.from({ length: 150 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.33;
      return { x: cx + Math.cos(a) * r * 1.3, y: cy + Math.sin(a) * r };
    });
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 && rand() < 0.2) {
          edges.push([i, j]);
        }
      }
    }
    return { nodes, edges };
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const t = interpolate(frame, [5, 180], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const visibleN = Math.floor(t * nodes.length);
    const visibleE = Math.floor(t * edges.length);

    // Edges
    for (let i = 0; i < visibleE; i++) {
      const [a, b] = edges[i];
      if (a >= visibleN || b >= visibleN) continue;
      ctx.strokeStyle = "rgba(255, 170, 34, 0.08)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < visibleN; i++) {
      const pulse = 0.6 + Math.sin(frame * 0.07 + i * 2) * 0.4;
      ctx.fillStyle = `rgba(255, 200, 80, ${pulse * 0.7})`;
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter
    const synapses = Math.floor(t * 15_091_983);
    const neurons = Math.floor(t * 138_639);
    const fontSize = Math.max(12, width * 0.028);

    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.fillStyle = "rgba(255, 170, 34, 0.7)";
    ctx.textAlign = "center";
    ctx.fillText(neurons.toLocaleString("en-US") + " neurons", width / 2, height * 0.82);

    ctx.font = `${fontSize * 0.8}px Courier New`;
    ctx.fillStyle = "rgba(255, 170, 34, 0.5)";
    ctx.fillText(synapses.toLocaleString("en-US") + " synapses", width / 2, height * 0.9);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
