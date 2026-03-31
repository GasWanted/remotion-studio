import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A brain-shaped node network slowly fades away.
// As it disappears, "157" emerges from the center, as if it was always hidden inside.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Node {
  x: number;
  y: number;
  connections: number[]; // indices of connected nodes
}

function buildNetwork(width: number, height: number): Node[] {
  const rand = seeded(42);
  const cx = width / 2;
  const cy = height / 2;
  const nodes: Node[] = [];
  const count = 120;

  // Brain-ish shape: two overlapping ellipses
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.6);
    // Brain shape: wider than tall, slight dumbbell
    const side = rand() > 0.5 ? 1 : -1;
    const baseX = cx + side * width * 0.08;
    const spreadX = width * 0.22;
    const spreadY = height * 0.2;

    nodes.push({
      x: baseX + Math.cos(angle) * r * spreadX,
      y: cy + Math.sin(angle) * r * spreadY,
      connections: [],
    });
  }

  // Connect nearby nodes
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < width * 0.1 && rand() > 0.55) {
        nodes[i].connections.push(j);
      }
    }
  }

  return nodes;
}

export const FadeToBlack: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const nodes = useMemo(() => buildNetwork(width, height), [width, height]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;

    // Network fades out from frames 10-80
    const netA = interpolate(frame, [10, 20, 50, 85], [0, 0.7, 0.7, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // "157" emerges from frames 70-100
    const numA = interpolate(frame, [70, 100], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Draw connections
    if (netA > 0) {
      ctx.strokeStyle = `rgba(80, 140, 200, ${netA * 0.25})`;
      ctx.lineWidth = 0.5 * scale;
      for (const node of nodes) {
        for (const ci of node.connections) {
          const target = nodes[ci];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const node of nodes) {
        // Nodes near center fade out first (to reveal text)
        const distFromCenter = Math.sqrt(
          Math.pow(node.x - cx, 2) + Math.pow(node.y - cy, 2)
        );
        const centerFade = interpolate(
          distFromCenter,
          [0, width * 0.15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const nodeOpacity = netA * (0.3 + centerFade * 0.7);

        ctx.fillStyle = `rgba(100, 170, 240, ${nodeOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // "157" emerging from center
    if (numA > 0) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Main text
      ctx.fillStyle = `rgba(220, 50, 50, ${numA})`;
      ctx.font = `bold ${22 * scale}px monospace`;
      ctx.fillText("157", cx, cy);

      // Glow
      ctx.shadowColor = `rgba(220, 50, 50, ${numA * 0.5})`;
      ctx.shadowBlur = 20 * scale * numA;
      ctx.fillText("157", cx, cy);
      ctx.shadowBlur = 0;
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
