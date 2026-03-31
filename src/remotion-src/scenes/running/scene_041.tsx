import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 41 — Exponential neuron multiplication: 1→2→4→...→138K (5s = 150 frames)
export const Scene041: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(4141);
    const particles = makeParticles(25, width, height, scale);
    // Pre-generate positions for up to 300 visible nodes
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 300; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.38;
      nodes.push({
        x: width / 2 + Math.cos(a) * d,
        y: height / 2 + Math.sin(a) * d,
        hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 45 * scale && rand() < 0.08) edges.push([i, j]);
      }
    }
    return { particles, nodes, edges };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Exponential growth: show more nodes over time
    const expT = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visible = Math.max(1, Math.floor(Math.pow(expT, 3) * data.nodes.length));

    // Edges
    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      ctx.strokeStyle = `hsla(${(data.nodes[a].hue + data.nodes[b].hue) / 2}, 35%, 50%, 0.15)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const nodeR = Math.max(1.5, (4 - visible * 0.01)) * scale;
      ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, 0.7)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter
    const count = Math.floor(interpolate(frame, [5, 120], [1, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${count.toLocaleString()} neurons`, width / 2, height * 0.9);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
