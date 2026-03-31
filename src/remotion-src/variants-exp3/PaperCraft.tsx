import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const PaperCraft: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const craftColors = [
      "#B5651D", // kraft brown
      "#2AABAB", // teal
      "#E07050", // coral
      "#D4A030", // mustard
      "#6B8E6B", // sage
      "#C47070", // dusty rose
      "#5080A0", // denim blue
      "#A07050", // clay
    ];
    const nodes: { x: number; y: number; r: number; color: string; rotation: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2.5 + rand() * 2.5) * scale,
        color: craftColors[Math.floor(rand() * craftColors.length)],
        rotation: rand() * Math.PI * 2,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Paper layers for background depth
    const layerRand = seeded(44);
    const paperLayers: { points: { x: number; y: number }[]; color: string; shadow: number }[] = [];
    const layerColors = ["#f5ede0", "#e8ddd0", "#dcd0c0", "#d0c4b0", "#c4b8a0"];
    for (let l = 0; l < 5; l++) {
      const pts: { x: number; y: number }[] = [];
      const segments = 8;
      for (let s = 0; s <= segments; s++) {
        pts.push({
          x: (s / segments) * width,
          y: height * (0.15 + l * 0.17) + (layerRand() - 0.5) * 30 * scale,
        });
      }
      paperLayers.push({
        points: pts,
        color: layerColors[l],
        shadow: 2 + l * 1.5,
      });
    }
    // Texture noise seeds
    const texRand = seeded(33);
    const textureSpots: { x: number; y: number; r: number; a: number }[] = [];
    for (let i = 0; i < 200; i++) {
      textureSpots.push({
        x: texRand() * width,
        y: texRand() * height,
        r: (0.5 + texRand() * 2) * scale,
        a: texRand() * 0.03,
      });
    }
    return { nodes, edges, paperLayers, textureSpots };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, paperLayers, textureSpots } = data;

    // Base kraft paper background
    ctx.fillStyle = "#f0e6d4";
    ctx.fillRect(0, 0, width, height);

    // Subtle paper texture spots
    for (const spot of textureSpots) {
      ctx.fillStyle = `rgba(160, 140, 110, ${spot.a})`;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layered paper shapes with shadows between layers
    for (const layer of paperLayers) {
      // Shadow
      ctx.fillStyle = `rgba(0, 0, 0, 0.06)`;
      ctx.beginPath();
      const shadowOff = layer.shadow * scale;
      ctx.moveTo(0, height);
      for (const pt of layer.points) {
        ctx.lineTo(pt.x, pt.y + shadowOff);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Paper layer fill
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let i = 0; i < layer.points.length; i++) {
        const pt = layer.points[i];
        if (i === 0) {
          ctx.lineTo(pt.x, pt.y);
        } else {
          const prev = layer.points[i - 1];
          const cpx = (prev.x + pt.x) / 2;
          ctx.quadraticCurveTo(cpx, prev.y, pt.x, pt.y);
        }
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Subtle paper texture on each layer
      ctx.fillStyle = `rgba(0, 0, 0, 0.01)`;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as paper strips
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      // Strip shadow
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x + 0.8 * scale, na.y + 0.8 * scale);
      ctx.lineTo(nb.x + 0.8 * scale, nb.y + 0.8 * scale);
      ctx.stroke();

      // Paper strip
      ctx.strokeStyle = "rgba(230, 220, 200, 0.7)";
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Fold line (center highlight)
      ctx.strokeStyle = "rgba(255, 250, 240, 0.3)";
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Draw nodes as paper cutout circles
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const gentle = Math.sin(frame * 0.025 + i * 0.9) * 0.5 * scale;

      const nx = n.x;
      const ny = n.y + gentle;

      // Paper shadow (one edge - bottom right)
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(nx + 1.5 * scale, ny + 1.5 * scale, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Flat color circle (paper cutout)
      ctx.fillStyle = n.color;
      ctx.globalAlpha = fadeOut * alpha;
      ctx.beginPath();
      ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
      ctx.fill();

      // Subtle lighter edge on top-left (paper depth)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.25})`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.arc(nx, ny, n.r, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();

      // Darker edge on bottom-right
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.1})`;
      ctx.lineWidth = 0.6 * scale;
      ctx.beginPath();
      ctx.arc(nx, ny, n.r, Math.PI * 1.8, Math.PI * 0.8);
      ctx.stroke();

      ctx.restore();
      ctx.globalAlpha = fadeOut;
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
