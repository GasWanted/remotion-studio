import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 32 — Connectome graph goes flat like a blueprint (4s = 120 frames)
export const Scene032: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3232);
    const particles = makeParticles(30, width, height, scale);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 100; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * 140 * scale;
      nodes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0] });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.1) edges.push([i, j]);
      }
    }
    return { particles, nodes, edges };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Flatten/desaturate progress
    const flatT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sat = interpolate(flatT, [0, 1], [55, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lit = interpolate(flatT, [0, 1], [60, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges
    for (const [a, b] of data.edges) {
      ctx.strokeStyle = `hsla(220, ${sat * 0.5}%, ${lit}%, 0.25)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (const n of data.nodes) {
      const hue = interpolate(flatT, [0, 1], [n.hue, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.6)`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blueprint grid lines when flat
    if (flatT > 0.5) {
      const gridAlpha = (flatT - 0.5) * 0.15;
      ctx.strokeStyle = `hsla(220, 20%, 40%, ${gridAlpha})`;
      ctx.lineWidth = 0.5 * scale;
      for (let x = width * 0.15; x < width * 0.85; x += 40 * scale) {
        ctx.beginPath();
        ctx.moveTo(x, height * 0.15);
        ctx.lineTo(x, height * 0.85);
        ctx.stroke();
      }
      for (let y = height * 0.15; y < height * 0.85; y += 40 * scale) {
        ctx.beginPath();
        ctx.moveTo(width * 0.15, y);
        ctx.lineTo(width * 0.85, y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
