import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 05 — Brain silhouette fills with glowing connections (4s = 120 frames)
export const Scene005: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(505);
    const particles = makeParticles(40, width, height, scale);
    const cx = width / 2, cy = height / 2;
    // Brain ellipse boundary
    const brainRx = width * 0.22, brainRy = height * 0.28;
    // Connections inside brain
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 300; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5);
      const x = cx + Math.cos(a) * brainRx * r;
      const y = cy + Math.sin(a) * brainRy * r;
      nodes.push({ x, y, hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 45 * scale && rand() < 0.08) edges.push([i, j]);
      }
    }
    return { particles, nodes, edges, cx, cy, brainRx, brainRy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const { cx, cy, brainRx, brainRy } = data;

    // Brain outline
    ctx.strokeStyle = `hsla(280, 40%, 60%, 0.4)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(cx, cy, brainRx, brainRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Fill connections progressively
    const progress = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleEdges = Math.floor(data.edges.length * progress);
    const visibleNodes = Math.floor(data.nodes.length * progress);

    for (let i = 0; i < visibleEdges; i++) {
      const [a, b] = data.edges[i];
      ctx.strokeStyle = `hsla(${(data.nodes[a].hue + data.nodes[b].hue) / 2}, 40%, 55%, 0.2)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    for (let i = 0; i < visibleNodes; i++) {
      const n = data.nodes[i];
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.05 + i * 0.3);
      ctx.fillStyle = `hsla(${n.hue}, 55%, 65%, ${pulse * 0.7})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
