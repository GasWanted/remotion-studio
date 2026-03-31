import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const PastelLayers: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const pastels = [
      "#C8B6E2", // lavender
      "#F8C8A4", // peach
      "#A8E6CF", // mint
      "#A8D8EA", // baby blue
      "#F9E79F", // soft yellow
      "#F2B5D4", // pink
      "#B5EAD7", // seafoam
    ];
    const nodes: { x: number; y: number; r: number; color: string }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2 + rand() * 2.5) * scale,
        color: pastels[Math.floor(rand() * pastels.length)],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Rolling hill layers
    const hillRand = seeded(99);
    const hills: { points: number[]; color: string; speed: number; yBase: number }[] = [];
    const hillColors = [
      "rgba(232, 218, 239, 0.4)", // very light lavender
      "rgba(220, 237, 200, 0.4)", // light green
      "rgba(253, 222, 200, 0.4)", // light peach
      "rgba(200, 225, 240, 0.4)", // light blue
      "rgba(245, 235, 200, 0.4)", // light cream
    ];
    for (let layer = 0; layer < 5; layer++) {
      const pts: number[] = [];
      const segments = 12;
      for (let s = 0; s <= segments; s++) {
        pts.push(hillRand() * 40 * scale + 20 * scale);
      }
      hills.push({
        points: pts,
        color: hillColors[layer],
        speed: 0.08 + layer * 0.04,
        yBase: height * (0.35 + layer * 0.13),
      });
    }
    return { nodes, edges, hills };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, hills } = data;

    // Soft warm background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#F0E6F6");
    bg.addColorStop(0.5, "#FFF5EC");
    bg.addColorStop(1, "#E8F4E8");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Rolling hill layers with parallax
    for (const hill of hills) {
      const offset = frame * hill.speed * scale;
      ctx.fillStyle = hill.color;
      ctx.beginPath();
      ctx.moveTo(0, height);

      const pts = hill.points;
      const segW = width / (pts.length - 1);
      for (let s = 0; s < pts.length; s++) {
        const x = s * segW;
        const waveOff = Math.sin((x + offset) * 0.003 + hill.yBase * 0.01) * pts[s];
        const y = hill.yBase + waveOff;
        if (s === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (s - 1) * segW;
          const prevWave = Math.sin((prevX + offset) * 0.003 + hill.yBase * 0.01) * pts[s - 1];
          const prevY = hill.yBase + prevWave;
          const cpx = (prevX + x) / 2;
          ctx.quadraticCurveTo(cpx, prevY, x, y);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Thick white rounded edges
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      // Shadow for depth
      ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x + 0.5 * scale, na.y + 0.5 * scale);
      ctx.lineTo(nb.x + 0.5 * scale, nb.y + 0.5 * scale);
      ctx.stroke();

      // White line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Pastel circle nodes with white outlines
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const bob = Math.sin(frame * 0.03 + i * 0.8) * 1.5 * scale;

      const ny = n.y + bob;

      // Soft shadow
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.08})`;
      ctx.beginPath();
      ctx.arc(n.x + 1 * scale, ny + 2 * scale, n.r * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Main circle fill
      ctx.fillStyle = n.color;
      ctx.globalAlpha = fadeOut * alpha;
      ctx.beginPath();
      ctx.arc(n.x, ny, n.r, 0, Math.PI * 2);
      ctx.fill();

      // White outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(n.x, ny, n.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = fadeOut;
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
