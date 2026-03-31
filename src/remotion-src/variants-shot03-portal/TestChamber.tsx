import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-utils";

/**
 * Network Grow: Collaboration network grows organically from center.
 * Nodes bloom outward, edges draw between nearby nodes.
 * Blue/orange nodes, white bg, clean lines.
 */
export const TestChamber: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(5001);
    const cx = width / 2, cy = height * 0.52;
    const nodes: { x: number; y: number; r: number; gen: number; parentIdx: number }[] = [];

    // Generation 0: seed node
    nodes.push({ x: cx, y: cy, r: 4 * scale, gen: 0, parentIdx: -1 });

    // Grow outward in generations
    for (let gen = 1; gen <= 6; gen++) {
      const parentStart = nodes.length - (gen === 1 ? 1 : Math.floor(nodes.length * 0.3));
      const parentEnd = nodes.length;
      const childCount = gen === 1 ? 4 : gen < 4 ? 6 : 8;
      for (let i = 0; i < childCount; i++) {
        const pi = Math.max(0, parentStart + Math.floor(rand() * (parentEnd - parentStart)));
        const parent = nodes[pi];
        const angle = rand() * Math.PI * 2;
        const dist = (25 + rand() * 20) * scale;
        nodes.push({
          x: Math.max(30, Math.min(width - 30, parent.x + Math.cos(angle) * dist)),
          y: Math.max(30, Math.min(height - 30, parent.y + Math.sin(angle) * dist)),
          r: Math.max(1.5, (4 - gen * 0.4) * scale),
          gen,
          parentIdx: pi,
        });
      }
    }

    // Extra edges between nearby nodes
    const extraEdges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 2; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 40 * scale && rand() < 0.15) {
          extraEdges.push([i, j]);
        }
      }
    }

    return { nodes, extraEdges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    drawDotGrid(ctx, width, height, scale);

    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.1);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("collaboration network", width / 2, height * 0.16);
    ctx.globalAlpha = fadeOut;

    // Growth timing: exponential reveal
    const growT = interpolate(frame, [8, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.max(1, Math.floor(Math.pow(growT, 2) * data.nodes.length));

    // Parent edges
    for (let i = 1; i < visibleCount; i++) {
      const n = data.nodes[i];
      const p = data.nodes[n.parentIdx];
      const age = visibleCount - i;
      const edgeAlpha = Math.min(1, age / 6) * 0.3;
      ctx.strokeStyle = accent(i, edgeAlpha);
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke();
    }

    // Extra edges
    for (const [a, b] of data.extraEdges) {
      if (a >= visibleCount || b >= visibleCount) continue;
      ctx.strokeStyle = "rgba(180,180,200,0.12)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(data.nodes[a].x, data.nodes[a].y);
      ctx.lineTo(data.nodes[b].x, data.nodes[b].y);
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < visibleCount; i++) {
      const n = data.nodes[i];
      const age = visibleCount - i;
      const rawT = Math.min(1, age / 8);
      const t = easeOutBack(rawT);
      const pulse = 0.9 + Math.sin(frame * 0.06 + i * 2.3) * 0.1;
      const r = n.r * t * pulse;

      // Glow
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
      g.addColorStop(0, accent(i, 0.12));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath(); ctx.arc(n.x + 1, n.y + 1, r, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(i, 0.85);
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(n.x - r * 0.25, n.y - r * 0.25, r * 0.35, 0, Math.PI * 2); ctx.fill();
    }

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const displayCount = Math.min(200, Math.floor(growT * 200));
    ctx.fillText(`${displayCount}+`, width * 0.92, height * 0.94);
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("scientists", width * 0.92, height * 0.97);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
