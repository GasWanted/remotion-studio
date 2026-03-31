import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Topographic: React.FC<VariantProps> = ({ width, height }) => {
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
    // Generate elevation peaks for topo map
    const peakRand = seeded(303);
    const peaks: { x: number; y: number; h: number; spread: number }[] = [];
    for (let i = 0; i < 8; i++) {
      peaks.push({
        x: peakRand() * width,
        y: peakRand() * height,
        h: 0.5 + peakRand() * 0.5,
        spread: (60 + peakRand() * 120) * scale,
      });
    }
    return { nodes, edges, peaks };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, peaks } = data;

    // Parchment/map background
    ctx.fillStyle = "#1a1c14";
    ctx.fillRect(0, 0, width, height);

    // Subtle paper texture noise
    const texRand = seeded(888);
    for (let i = 0; i < 2000; i++) {
      const tx = texRand() * width;
      const ty = texRand() * height;
      ctx.fillStyle = `rgba(${60 + texRand() * 30}, ${70 + texRand() * 20}, ${40 + texRand() * 20}, 0.05)`;
      ctx.fillRect(tx, ty, 2 * scale, 2 * scale);
    }

    // Elevation function
    const timeShift = frame * 0.008;
    function elevation(px: number, py: number): number {
      let h = 0;
      for (const peak of peaks) {
        const dx = px - peak.x - Math.sin(timeShift + peak.h * 5) * 8 * scale;
        const dy = py - peak.y - Math.cos(timeShift + peak.h * 3) * 6 * scale;
        const d = Math.sqrt(dx * dx + dy * dy);
        h += peak.h * Math.exp(-(d * d) / (2 * peak.spread * peak.spread));
      }
      return h;
    }

    // Draw contour lines
    const contourLevels = 12;
    const gridRes = 4 * scale;
    const cols = Math.ceil(width / gridRes);
    const rows = Math.ceil(height / gridRes);

    // Sample elevation grid
    const grid: number[][] = [];
    for (let r = 0; r <= rows; r++) {
      grid[r] = [];
      for (let c = 0; c <= cols; c++) {
        grid[r][c] = elevation(c * gridRes, r * gridRes);
      }
    }

    // March contours using simple threshold crossing (horizontal scan)
    for (let level = 1; level <= contourLevels; level++) {
      const threshold = level / contourLevels;
      const isMajor = level % 3 === 0;

      // Color from muted green (low) to brown (high)
      const t = level / contourLevels;
      const cr = Math.floor(80 + t * 80);
      const cg = Math.floor(100 + (1 - t) * 40);
      const cb = Math.floor(50 + t * 20);
      const alpha = isMajor ? 0.25 : 0.12;
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`;
      ctx.lineWidth = (isMajor ? 1.2 : 0.6) * scale;

      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v00 = grid[r][c];
          const v10 = grid[r][c + 1];
          const v01 = grid[r + 1][c];

          // Horizontal edge crossing
          if ((v00 < threshold) !== (v10 < threshold)) {
            const frac = (threshold - v00) / (v10 - v00);
            const px = (c + frac) * gridRes;
            const py = r * gridRes;
            ctx.moveTo(px, py);
            ctx.lineTo(px + gridRes * 0.3, py + gridRes * 0.3);
          }
          // Vertical edge crossing
          if ((v00 < threshold) !== (v01 < threshold)) {
            const frac = (threshold - v00) / (v01 - v00);
            const px = c * gridRes;
            const py = (r + frac) * gridRes;
            ctx.moveTo(px, py);
            ctx.lineTo(px + gridRes * 0.3, py + gridRes * 0.3);
          }
        }
      }
      ctx.stroke();
    }

    // Hatch marks on slopes (indicating steep terrain)
    const hatchRand = seeded(444);
    ctx.strokeStyle = "rgba(100, 80, 50, 0.06)";
    ctx.lineWidth = 0.5 * scale;
    for (let i = 0; i < 200; i++) {
      const hx = hatchRand() * width;
      const hy = hatchRand() * height;
      const e = elevation(hx, hy);
      if (e > 0.3) {
        const len = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(hx - len, hy - len);
        ctx.lineTo(hx + len, hy + len);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges following contour-ish paths (slight curve toward equal elevation)
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const mx = (na.x + nb.x) / 2;
      const my = (na.y + nb.y) / 2;
      // Offset midpoint perpendicular to edge based on elevation
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len, ny = dx / len;
      const elevMid = elevation(mx, my);
      const offset = elevMid * 12 * scale;

      ctx.strokeStyle = "rgba(140, 120, 70, 0.3)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(mx + nx * offset, my + ny * offset, nb.x, nb.y);
      ctx.stroke();
    }

    // Draw nodes as elevation peaks
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const elev = elevation(n.x, n.y);

      // Peak marker: triangle
      const triSize = n.r * 1.8;
      ctx.fillStyle = `rgba(180, 140, 70, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(n.x, n.y - triSize);
      ctx.lineTo(n.x - triSize * 0.7, n.y + triSize * 0.5);
      ctx.lineTo(n.x + triSize * 0.7, n.y + triSize * 0.5);
      ctx.closePath();
      ctx.fill();

      // Center dot
      ctx.fillStyle = `rgba(220, 200, 150, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Elevation label for some nodes
      if (i % 15 === 0) {
        ctx.font = `${5 * scale}px monospace`;
        ctx.fillStyle = `rgba(160, 140, 90, ${alpha * 0.5})`;
        const elevLabel = Math.floor(elev * 1000);
        ctx.fillText(`${elevLabel}m`, n.x + n.r * 3, n.y + n.r);
      }
    }

    // Map legend border
    ctx.globalAlpha = fadeOut * 0.15;
    ctx.strokeStyle = "rgba(120, 100, 60, 1)";
    ctx.lineWidth = 1.5 * scale;
    const margin = 8 * scale;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Cross marks at corners
    const crossLen = 6 * scale;
    const corners = [[margin, margin], [width - margin, margin], [margin, height - margin], [width - margin, height - margin]];
    for (const [ccx, ccy] of corners) {
      ctx.beginPath();
      ctx.moveTo(ccx - crossLen, ccy);
      ctx.lineTo(ccx + crossLen, ccy);
      ctx.moveTo(ccx, ccy - crossLen);
      ctx.lineTo(ccx, ccy + crossLen);
      ctx.stroke();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
