import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Network with "157 / 15,091,983" counter and percentage bar — the tiny fraction visualized
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const CounterOverlay: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      nodes.push({ x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.9, r: (1 + rand() * 1.5) * scale });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.12) edges.push([i, j]);
      }
    }
    // Pick ~8 edges to flash
    const modified = new Set<number>();
    for (let i = 0; i < edges.length && modified.size < 8; i++) {
      if (rand() < 0.05) modified.add(i);
    }
    return { nodes, edges, modified };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const countT = interpolate(frame, [60, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const modified = Math.floor(countT * 157);
  const total = 15_091_983;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Network
    for (let i = 0; i < data.edges.length; i++) {
      const [a, b] = data.edges[i];
      const isMod = data.modified.has(i);
      const flash = isMod && countT > 0;
      ctx.strokeStyle = flash ? `rgba(255, 60, 60, ${0.3 + countT * 0.4})` : "rgba(80, 200, 120, 0.2)";
      ctx.lineWidth = flash ? 2 * scale : 1 * scale;
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

    // Counter overlay
    const fontSize = Math.max(12, 18 * scale);
    const smallFont = Math.max(9, 12 * scale);
    ctx.textAlign = "center";

    ctx.font = `bold ${fontSize}px Courier New`;
    ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
    ctx.fillText(modified.toLocaleString("en-US"), width / 2, height * 0.82);

    ctx.font = `${smallFont}px Courier New`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(`/ ${total.toLocaleString("en-US")} connections`, width / 2, height * 0.88);

    // Percentage bar
    const barW = width * 0.5;
    const barH = 4 * scale;
    const barX = (width - barW) / 2;
    const barY = height * 0.92;
    const pct = modified / total;

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(barX, barY, barW, barH);

    // The fill is so tiny it's basically invisible — that's the point
    ctx.fillStyle = "rgba(255, 80, 80, 0.9)";
    ctx.fillRect(barX, barY, Math.max(1, barW * pct), barH);

    ctx.font = `${smallFont * 0.8}px Courier New`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`${(pct * 100).toFixed(3)}%`, width / 2, barY + barH + 14 * scale);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
