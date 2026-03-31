import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPerson } from "./icons";

// Variant 7: Person icons connected by collaboration lines, forming a network
export const CollabNetwork: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3007);
    const particles = makeParticles(25, width, height, scale);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.35;
      nodes.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d * 0.7,
        hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 70 * scale && rand() < 0.25) edges.push([i, j]);
      }
    }
    return { particles, nodes, edges };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    const growT = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleNodes = Math.floor(growT * data.nodes.length);
    const visibleEdges = Math.floor(growT * data.edges.length);

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.08);

    // Edges
    ctx.globalAlpha = 1;
    for (let i = 0; i < visibleEdges; i++) {
      const [a, b] = data.edges[i];
      if (a >= visibleNodes || b >= visibleNodes) continue;
      const na = data.nodes[a], nb = data.nodes[b];
      ctx.strokeStyle = `hsla(${(na.hue + nb.hue) / 2}, 30%, 50%, 0.2)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Person icons at nodes
    for (let i = 0; i < visibleNodes; i++) {
      const n = data.nodes[i];
      const age = visibleNodes - i;
      const nodeAlpha = Math.min(1, age / 5);
      ctx.globalAlpha = nodeAlpha;
      drawPerson(ctx, n.x, n.y, 9 * scale, `hsla(${n.hue}, 50%, 62%, 0.9)`);
    }

    // Multiplier text
    ctx.globalAlpha = 1;
    const displayCount = Math.min(200, visibleNodes * 5);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${displayCount}+ scientists`, width / 2, height * 0.94);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
