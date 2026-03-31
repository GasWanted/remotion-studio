import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const StainedGlass: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; hue: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (1.5 + rand() * 2.5) * scale,
        hue: rand() * 360,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }

    // Voronoi: for each pixel region, find nearest node (we'll draw cell by cell)
    // But that's too slow per-frame. Instead, precompute Voronoi edges via neighbor pairs.
    // We'll approximate: draw filled polygons around each node using angular sweep.
    // Actually, let's compute Voronoi borders between all node pairs.
    const voronoiEdges: { x1: number; y1: number; x2: number; y2: number; a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80 * scale) {
          // Midpoint and perpendicular
          const mx = (nodes[i].x + nodes[j].x) / 2;
          const my = (nodes[i].y + nodes[j].y) / 2;
          const nx = -dy / dist;
          const ny = dx / dist;
          const halfLen = 30 * scale;
          voronoiEdges.push({
            x1: mx + nx * halfLen, y1: my + ny * halfLen,
            x2: mx - nx * halfLen, y2: my - ny * halfLen,
            a: i, b: j,
          });
        }
      }
    }

    // Color palette for stained glass (rich jewel tones)
    const palette = [
      [180, 40, 40], [40, 80, 160], [200, 160, 30], [30, 140, 80],
      [160, 50, 120], [50, 120, 160], [200, 80, 30], [100, 40, 140],
      [40, 160, 120], [180, 120, 40], [80, 30, 100], [30, 100, 60],
    ];
    const nodeColors = nodes.map((_, idx) => palette[idx % palette.length]);

    return { nodes, edges, voronoiEdges, nodeColors };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, voronoiEdges, nodeColors } = data;

    // Very dark background (unilluminated glass)
    ctx.fillStyle = "#060408";
    ctx.fillRect(0, 0, width, height);

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    ctx.globalAlpha = fadeOut;

    // Draw illuminated Voronoi cells for visible nodes
    // Use radial gradient fills centered on each node
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 12);
      const [cr, cg, cb] = nodeColors[i];
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.03 + i * 0.8);
      const cellAlpha = alpha * pulse * 0.15;

      // Cell glow (approximate Voronoi cell with radial gradient)
      const cellR = 28 * scale;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, cellR);
      grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${cellAlpha * 1.5})`);
      grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${cellAlpha * 0.7})`);
      grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, cellR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw ALL Voronoi borders as dark "lead" lines (the came/leading)
    ctx.lineWidth = 2.2 * scale;
    for (const ve of voronoiEdges) {
      // Only draw borders near visible nodes
      const aVis = ve.a < visible;
      const bVis = ve.b < visible;
      if (!aVis && !bVis) continue;

      const borderAlpha = (aVis && bVis) ? 0.6 : 0.2;
      ctx.strokeStyle = `rgba(20, 18, 25, ${borderAlpha})`;
      ctx.beginPath();
      ctx.moveTo(ve.x1, ve.y1);
      ctx.lineTo(ve.x2, ve.y2);
      ctx.stroke();

      // Subtle lead highlight on one side
      ctx.strokeStyle = `rgba(60, 55, 70, ${borderAlpha * 0.3})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(ve.x1 + 1 * scale, ve.y1 + 1 * scale);
      ctx.lineTo(ve.x2 + 1 * scale, ve.y2 + 1 * scale);
      ctx.stroke();
      ctx.lineWidth = 2.2 * scale;
    }

    // Draw shared Voronoi borders between connected visible nodes as bright edges
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      // Find matching voronoi edge
      const ve = voronoiEdges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
      if (ve) {
        const [cr, cg, cb] = nodeColors[a];
        ctx.strokeStyle = `rgba(${cr + 40}, ${cg + 40}, ${cb + 40}, 0.35)`;
        ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.3)`;
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(ve.x1, ve.y1);
        ctx.lineTo(ve.x2, ve.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw node centers as bright jewel points
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const [cr, cg, cb] = nodeColors[i];
      const pulse = 0.8 + Math.sin(frame * 0.06 + i * 1.3) * 0.2;

      // Inner glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
      glow.addColorStop(0, `rgba(${Math.min(255, cr + 100)}, ${Math.min(255, cg + 100)}, ${Math.min(255, cb + 100)}, ${alpha * pulse * 0.5})`);
      glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(${Math.min(255, cr + 150)}, ${Math.min(255, cg + 150)}, ${Math.min(255, cb + 150)}, ${alpha * pulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle light rays from top (like sunlight through cathedral window)
    ctx.globalAlpha = fadeOut * 0.04;
    const rayCount = 5;
    for (let r = 0; r < rayCount; r++) {
      const rx = width * (0.2 + r * 0.15);
      const grad = ctx.createLinearGradient(rx, 0, rx + width * 0.05, height);
      grad.addColorStop(0, "rgba(255, 240, 200, 1)");
      grad.addColorStop(0.5, "rgba(255, 220, 160, 0.3)");
      grad.addColorStop(1, "rgba(255, 200, 120, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(rx - 10 * scale, 0);
      ctx.lineTo(rx + 10 * scale, 0);
      ctx.lineTo(rx + 30 * scale + Math.sin(frame * 0.02 + r) * 10, height);
      ctx.lineTo(rx - 30 * scale + Math.sin(frame * 0.02 + r) * 10, height);
      ctx.closePath();
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
