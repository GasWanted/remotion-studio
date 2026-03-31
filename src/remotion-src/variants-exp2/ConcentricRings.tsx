import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const ConcentricRings: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; dist: number; angle: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      const nx = cx + Math.cos(a) * r * 1.3;
      const ny = cy + Math.sin(a) * r * 0.9;
      const dist = Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2);
      const angle = Math.atan2(ny - cy, nx - cx);
      nodes.push({ x: nx, y: ny, r: (1.5 + rand() * 2.5) * scale, dist, angle });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Ring radii
    const ringSpacing = 16 * scale;
    const maxRings = Math.ceil(Math.hypot(width, height) / 2 / ringSpacing);
    return { nodes, edges, ringSpacing, maxRings, cx, cy };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, ringSpacing, maxRings, cx, cy } = data;

    // Deep warm dark background
    ctx.fillStyle = "#0c0806";
    ctx.fillRect(0, 0, width, height);

    // Slow rotation for rings
    const rotation = frame * 0.003;

    // Draw concentric rings (like tree rings)
    for (let i = 1; i <= maxRings; i++) {
      const r = i * ringSpacing;
      const wobble = Math.sin(i * 0.7 + frame * 0.015) * 2 * scale;
      const ringAlpha = 0.06 + 0.03 * Math.sin(i * 0.4 + frame * 0.02);

      ctx.strokeStyle = `rgba(160, 120, 70, ${ringAlpha})`;
      ctx.lineWidth = (0.8 + Math.sin(i * 1.3) * 0.4) * scale;
      ctx.beginPath();
      // Draw slightly wobbly ring
      for (let a = 0; a <= Math.PI * 2; a += 0.02) {
        const rr = r + wobble * Math.sin(a * 3 + i * 0.5);
        const px = cx + Math.cos(a + rotation) * rr;
        const py = cy + Math.sin(a + rotation) * rr;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Every 4th ring is thicker (growth ring pattern)
      if (i % 4 === 0) {
        ctx.strokeStyle = `rgba(140, 100, 50, ${ringAlpha * 1.8})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();
      }
    }

    // Center glow (heartwood)
    const heartGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40 * scale);
    heartGrad.addColorStop(0, "rgba(120, 80, 30, 0.15)");
    heartGrad.addColorStop(1, "rgba(80, 50, 20, 0)");
    ctx.fillStyle = heartGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as arcs along ring curves
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      // Blend between the two nodes' distances for the arc radius
      const avgDist = (na.dist + nb.dist) / 2;
      const angleDiff = Math.atan2(
        Math.sin(na.angle - nb.angle),
        Math.cos(na.angle - nb.angle)
      );

      ctx.strokeStyle = "rgba(200, 160, 80, 0.2)";
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();

      if (Math.abs(angleDiff) > 0.3) {
        // Arc along the ring
        const startAngle = nb.angle + rotation;
        const endAngle = na.angle + rotation;
        ctx.arc(cx, cy, avgDist, startAngle, endAngle, angleDiff > 0);
      } else {
        // Radial connection (between rings)
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
      }
      ctx.stroke();
    }

    // Draw nodes pulsing on rings
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.7 + Math.sin(frame * 0.05 + n.dist * 0.02) * 0.3;

      // Ring pulse - ripple outward from node
      if (age < 20) {
        const rippleR = (20 - age) * 2 * scale;
        const rippleAlpha = (age / 20) * 0.15;
        ctx.strokeStyle = `rgba(220, 180, 100, ${rippleAlpha * alpha})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(n.x, n.y, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Warm glow
      const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      glow.addColorStop(0, `rgba(240, 200, 120, ${alpha * pulse * 0.35})`);
      glow.addColorStop(1, "rgba(200, 150, 60, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = `rgba(255, 240, 200, ${alpha * pulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 1.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle radial lines (like wood grain medullary rays)
    ctx.globalAlpha = fadeOut * 0.04;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 24) {
      ctx.strokeStyle = "rgba(160, 120, 60, 1)";
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(a + rotation * 0.5) * Math.max(width, height),
        cy + Math.sin(a + rotation * 0.5) * Math.max(width, height)
      );
      ctx.stroke();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
