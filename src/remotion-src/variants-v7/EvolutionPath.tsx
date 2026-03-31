import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A path through a network traced in gold/amber. Time bar fills "50,000,000 years"
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const EvolutionPath: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const network = useMemo(() => {
    const rand = seeded(77);
    const nodes: { x: number; y: number }[] = [];
    const margin = 50 * S;
    for (let i = 0; i < 60; i++) {
      nodes.push({
        x: margin + rand() * (width - 2 * margin),
        y: margin + rand() * (height - 2 * margin - 40 * S),
      });
    }
    // Build edges: connect to nearby nodes
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 * S && rand() > 0.3) {
          edges.push([i, j]);
        }
      }
    }
    // Build a highlighted path through the network
    const path: number[] = [0];
    const visited = new Set([0]);
    for (let step = 0; step < 10; step++) {
      const cur = path[path.length - 1];
      const neighbors: number[] = [];
      for (const [a, b] of edges) {
        if (a === cur && !visited.has(b)) neighbors.push(b);
        if (b === cur && !visited.has(a)) neighbors.push(a);
      }
      if (neighbors.length === 0) break;
      const next = neighbors[Math.floor(rand() * neighbors.length)];
      path.push(next);
      visited.add(next);
    }
    return { nodes, edges, path };
  }, [width, height, S]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { nodes, edges, path } = network;
    const progress = interpolate(frame, [5, 100], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Draw background edges
    ctx.strokeStyle = "rgba(60,60,80,0.25)";
    ctx.lineWidth = 0.8 * S;
    for (const [a, b] of edges) {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    }

    // Draw background nodes
    for (const node of nodes) {
      ctx.fillStyle = "rgba(80,80,100,0.3)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 2.5 * S, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw highlighted path
    const pathLen = path.length - 1;
    const revealedSegments = progress * pathLen;

    for (let i = 0; i < Math.min(Math.ceil(revealedSegments), pathLen); i++) {
      const segProg = Math.min(1, revealedSegments - i);
      const from = nodes[path[i]];
      const to = nodes[path[i + 1]];
      const endX = from.x + (to.x - from.x) * segProg;
      const endY = from.y + (to.y - from.y) * segProg;

      // Glow
      ctx.save();
      ctx.shadowColor = "#ffaa22";
      ctx.shadowBlur = 12 * S;
      ctx.strokeStyle = `rgba(255,180,40,${0.7 + 0.3 * Math.sin(frame * 0.08 + i)})`;
      ctx.lineWidth = 2.5 * S;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    }

    // Highlight path nodes
    const revealedNodes = Math.min(path.length, Math.ceil(revealedSegments) + 1);
    for (let i = 0; i < revealedNodes; i++) {
      const node = nodes[path[i]];
      const pulse = 1 + 0.2 * Math.sin(frame * 0.1 + i * 0.5);

      ctx.save();
      ctx.shadowColor = "#ffcc44";
      ctx.shadowBlur = 10 * S;
      ctx.fillStyle = `rgba(255,200,60,${0.8 + 0.2 * Math.sin(frame * 0.08 + i)})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4 * S * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Time bar at bottom
    const barY = height - 28 * S;
    const barH = 8 * S;
    const barX = 40 * S;
    const barW = width - 80 * S;
    const barProgress = interpolate(frame, [5, 120], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Background bar
    ctx.fillStyle = "rgba(60,50,30,0.4)";
    ctx.fillRect(barX, barY, barW, barH);

    // Fill bar
    const barGrad = ctx.createLinearGradient(barX, barY, barX + barW * barProgress, barY);
    barGrad.addColorStop(0, "rgba(180,120,20,0.8)");
    barGrad.addColorStop(1, "rgba(255,200,60,0.9)");
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, barW * barProgress, barH);

    // Time label
    const years = Math.floor(barProgress * 50000000);
    const formatted = years.toLocaleString("en-US");
    ctx.fillStyle = "rgba(255,210,100,0.8)";
    ctx.font = `${11 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`${formatted} years`, width / 2, barY - 4 * S);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
