import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const HexGrid: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({ x: cx + Math.cos(a) * r * 1.3, y: cy + Math.sin(a) * r * 0.9, r: (1.5 + rand() * 2.5) * scale });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Precompute hex grid
    const hexSize = 14 * scale;
    const hexW = hexSize * Math.sqrt(3);
    const hexH = hexSize * 2;
    const cols = Math.ceil(width / hexW) + 2;
    const rows = Math.ceil(height / (hexH * 0.75)) + 2;
    const hexCenters: { hx: number; hy: number }[] = [];
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const hx = col * hexW + (row % 2 === 0 ? 0 : hexW / 2);
        const hy = row * hexH * 0.75;
        hexCenters.push({ hx, hy });
      }
    }
    // Snap nodes to nearest hex center
    const snapped = nodes.map(n => {
      let best = { hx: n.x, hy: n.y };
      let bestD = Infinity;
      for (const h of hexCenters) {
        const d = Math.hypot(h.hx - n.x, h.hy - n.y);
        if (d < bestD) { bestD = d; best = h; }
      }
      return { ...n, snapX: best.hx, snapY: best.hy };
    });
    return { nodes: snapped, edges, hexCenters, hexSize, hexW, hexH };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, hexCenters, hexSize } = data;

    // Dark amber-brown background
    ctx.fillStyle = "#0d0a06";
    ctx.fillRect(0, 0, width, height);

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Determine which hex cells are "active" (near a visible node)
    const activeHexes = new Set<number>();
    for (let i = 0; i < visible; i++) {
      for (let h = 0; h < hexCenters.length; h++) {
        const dx = hexCenters[h].hx - nodes[i].x;
        const dy = hexCenters[h].hy - nodes[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < hexSize * 2.5) {
          activeHexes.add(h);
        }
      }
    }

    // Draw hex function
    function drawHex(cx: number, cy: number, size: number) {
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const angle = Math.PI / 6 + (Math.PI / 3) * k;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    // Draw all hex outlines (dim)
    ctx.strokeStyle = "rgba(120, 90, 40, 0.12)";
    ctx.lineWidth = 0.5 * scale;
    for (const h of hexCenters) {
      drawHex(h.hx, h.hy, hexSize);
      ctx.stroke();
    }

    ctx.globalAlpha = fadeOut;

    // Fill active hexes with amber glow
    for (const h of activeHexes) {
      const hc = hexCenters[h];
      // Find proximity to nearest visible node for intensity
      let minD = Infinity;
      for (let i = 0; i < visible; i++) {
        const d = Math.hypot(hc.hx - nodes[i].x, hc.hy - nodes[i].y);
        if (d < minD) minD = d;
      }
      const intensity = Math.max(0, 1 - minD / (hexSize * 2.5));
      const pulse = 0.7 + 0.3 * Math.sin(frame * 0.04 + hc.hx * 0.01 + hc.hy * 0.01);
      const alpha = intensity * pulse * 0.35;

      const grad = ctx.createRadialGradient(hc.hx, hc.hy, 0, hc.hx, hc.hy, hexSize);
      grad.addColorStop(0, `rgba(255, 190, 60, ${alpha})`);
      grad.addColorStop(0.6, `rgba(200, 130, 20, ${alpha * 0.4})`);
      grad.addColorStop(1, `rgba(120, 70, 10, 0)`);
      ctx.fillStyle = grad;
      drawHex(hc.hx, hc.hy, hexSize);
      ctx.fill();

      // Brighter hex border for active cells
      ctx.strokeStyle = `rgba(255, 200, 80, ${alpha * 0.6})`;
      ctx.lineWidth = 1 * scale;
      drawHex(hc.hx, hc.hy, hexSize);
      ctx.stroke();
    }

    // Draw edges along hex grid lines (step axis-aligned on hex grid)
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      ctx.strokeStyle = "rgba(255, 180, 50, 0.25)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      // Route through intermediate hex-snapped point
      const mx = (na.snapX + nb.snapX) / 2;
      const my = (na.snapY + nb.snapY) / 2;
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(mx, na.y, mx, my);
      ctx.quadraticCurveTo(mx, nb.y, nb.x, nb.y);
      ctx.stroke();
    }

    // Draw nodes as bright spots at hex intersections
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.85 + Math.sin(frame * 0.06 + i * 1.7) * 0.15;

      // Outer glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
      glow.addColorStop(0, `rgba(255, 220, 100, ${alpha * pulse * 0.3})`);
      glow.addColorStop(1, "rgba(255, 180, 40, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // Core - hexagonal shape
      ctx.fillStyle = `rgba(255, 240, 180, ${alpha * pulse * 0.9})`;
      drawHex(n.x, n.y, n.r * 1.2);
      ctx.fill();
    }

    // Compound eye lens shimmer overlay (subtle)
    const shimmerAlpha = 0.03 + 0.01 * Math.sin(frame * 0.02);
    for (const h of hexCenters) {
      const dist = Math.hypot(h.hx - width / 2, h.hy - height / 2);
      const maxDist = Math.hypot(width, height) / 2;
      const falloff = 1 - dist / maxDist;
      ctx.fillStyle = `rgba(255, 200, 100, ${shimmerAlpha * falloff * fadeOut})`;
      drawHex(h.hx, h.hy, hexSize * 0.3);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
