import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const IsometricBlocks: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const cheerful = [
      [350, 70, 62], // coral
      [25, 80, 62],  // tangerine
      [50, 75, 58],  // golden
      [140, 55, 55], // green
      [190, 60, 58], // teal
      [220, 60, 62], // blue
      [270, 55, 62], // purple
      [330, 60, 62], // magenta
    ];
    const nodes: { x: number; y: number; r: number; hue: number; sat: number; lit: number; h: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      const col = cheerful[Math.floor(rand() * cheerful.length)];
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2.5 + rand() * 2.5) * scale,
        hue: col[0], sat: col[1], lit: col[2],
        h: (3 + rand() * 4) * scale, // cube height
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges } = data;

    // Warm light background
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#f5f0e8");
    bg.addColorStop(1, "#e8e0d4");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Isometric grid lines (subtle)
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = "#9090a0";
    ctx.lineWidth = 0.5 * scale;
    const gridStep = 20 * scale;
    // Lines going to lower-right
    for (let i = -30; i < 60; i++) {
      const startX = i * gridStep;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + height * 0.577, height); // tan(30deg) ~ 0.577
      ctx.stroke();
    }
    // Lines going to lower-left
    for (let i = -30; i < 60; i++) {
      const startX = i * gridStep;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX - height * 0.577, height);
      ctx.stroke();
    }
    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as thick rounded lines
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      ctx.strokeStyle = "rgba(120, 110, 100, 0.15)";
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Sort nodes by y for proper overlap (back to front)
    const sortedIndices = Array.from({ length: visible }, (_, i) => i);
    sortedIndices.sort((a, b) => nodes[a].y - nodes[b].y);

    // Draw nodes as isometric rounded cubes
    for (const i of sortedIndices) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const bounce = Math.sin(frame * 0.04 + i * 1.1) * 1 * scale;

      const s = n.r; // half-size of cube face
      const h = n.h + bounce; // height of cube
      const x = n.x;
      const y = n.y;

      // Isometric offsets: 30-degree projection
      const isoX = s * 0.866; // cos(30)
      const isoY = s * 0.5;   // sin(30)

      const topColor = `hsla(${n.hue}, ${n.sat}%, ${Math.min(90, n.lit + 20)}%, ${alpha})`;
      const rightColor = `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha})`;
      const leftColor = `hsla(${n.hue}, ${n.sat}%, ${Math.max(30, n.lit - 15)}%, ${alpha})`;

      // Drop shadow
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(x, y + isoY + 2 * scale);
      ctx.lineTo(x + isoX, y + 2 * scale);
      ctx.lineTo(x + isoX, y + h + 2 * scale);
      ctx.lineTo(x, y + isoY + h + 2 * scale);
      ctx.lineTo(x - isoX, y + h + 2 * scale);
      ctx.lineTo(x - isoX, y + 2 * scale);
      ctx.closePath();
      ctx.fill();

      // Left face (darker)
      ctx.fillStyle = leftColor;
      ctx.beginPath();
      ctx.moveTo(x - isoX, y);
      ctx.lineTo(x, y + isoY);
      ctx.lineTo(x, y + isoY + h);
      ctx.lineTo(x - isoX, y + h);
      ctx.closePath();
      ctx.fill();

      // Right face (medium)
      ctx.fillStyle = rightColor;
      ctx.beginPath();
      ctx.moveTo(x + isoX, y);
      ctx.lineTo(x, y + isoY);
      ctx.lineTo(x, y + isoY + h);
      ctx.lineTo(x + isoX, y + h);
      ctx.closePath();
      ctx.fill();

      // Top face (lighter)
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(x, y - isoY);
      ctx.lineTo(x + isoX, y);
      ctx.lineTo(x, y + isoY);
      ctx.lineTo(x - isoX, y);
      ctx.closePath();
      ctx.fill();

      // Highlight on top face edge
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(x, y - isoY);
      ctx.lineTo(x + isoX, y);
      ctx.stroke();

      // Soft edge outline
      ctx.strokeStyle = `hsla(${n.hue}, ${n.sat}%, ${n.lit - 20}%, ${alpha * 0.2})`;
      ctx.lineWidth = 0.4 * scale;
      ctx.lineJoin = "round";

      // Outline the whole cube
      ctx.beginPath();
      ctx.moveTo(x, y - isoY);
      ctx.lineTo(x + isoX, y);
      ctx.lineTo(x + isoX, y + h);
      ctx.lineTo(x, y + isoY + h);
      ctx.lineTo(x - isoX, y + h);
      ctx.lineTo(x - isoX, y);
      ctx.closePath();
      ctx.stroke();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
