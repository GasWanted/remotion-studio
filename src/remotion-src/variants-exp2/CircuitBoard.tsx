import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const CircuitBoard: React.FC<VariantProps> = ({ width, height }) => {
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
    // Generate background PCB traces
    const bgRand = seeded(999);
    const traces: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const x1 = bgRand() * width;
      const y1 = bgRand() * height;
      const horiz = bgRand() > 0.5;
      const len = 20 + bgRand() * 80;
      traces.push({
        x1, y1,
        x2: horiz ? x1 + len : x1,
        y2: horiz ? y1 : y1 + len
      });
    }
    // Via holes
    const vias: { x: number; y: number }[] = [];
    for (let i = 0; i < 40; i++) {
      vias.push({ x: bgRand() * width, y: bgRand() * height });
    }
    return { nodes, edges, traces, vias };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, traces, vias } = data;

    // PCB green base
    ctx.fillStyle = "#0a2e0a";
    ctx.fillRect(0, 0, width, height);

    // Subtle PCB texture - fine grid
    ctx.strokeStyle = "rgba(20, 80, 20, 0.3)";
    ctx.lineWidth = 0.5;
    const gridStep = 8 * scale;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Solder mask pattern (darker green patches)
    const maskRand = seeded(777);
    for (let i = 0; i < 15; i++) {
      const mx = maskRand() * width;
      const my = maskRand() * height;
      const mw = 30 + maskRand() * 60;
      const mh = 20 + maskRand() * 40;
      ctx.fillStyle = "rgba(5, 20, 5, 0.3)";
      ctx.fillRect(mx, my, mw * scale, mh * scale);
    }

    // Background copper traces (dim, pre-existing)
    ctx.lineCap = "round";
    for (const t of traces) {
      ctx.strokeStyle = "rgba(180, 130, 60, 0.08)";
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(t.x1, t.y1);
      ctx.lineTo(t.x2, t.y2);
      ctx.stroke();
    }

    // Background via holes
    for (const v of vias) {
      ctx.strokeStyle = "rgba(180, 130, 60, 0.1)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.arc(v.x, v.y, 3 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(10, 30, 10, 0.5)";
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as copper traces with 90-degree routing
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      // Copper gradient
      ctx.strokeStyle = "rgba(220, 170, 80, 0.5)";
      ctx.lineWidth = 2 * scale;
      ctx.lineCap = "square";
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      // Route at 90 degrees: go horizontal first, then vertical
      const midX = (na.x + nb.x) / 2;
      if (Math.abs(na.x - nb.x) > Math.abs(na.y - nb.y)) {
        // Horizontal first, then vertical
        ctx.lineTo(midX, na.y);
        ctx.lineTo(midX, nb.y);
        ctx.lineTo(nb.x, nb.y);
      } else {
        // Vertical first, then horizontal
        const midY = (na.y + nb.y) / 2;
        ctx.lineTo(na.x, midY);
        ctx.lineTo(nb.x, midY);
        ctx.lineTo(nb.x, nb.y);
      }
      ctx.stroke();

      // Thin highlight on copper
      ctx.strokeStyle = "rgba(255, 220, 140, 0.15)";
      ctx.lineWidth = 0.8 * scale;
      ctx.stroke();
    }

    // Draw nodes as solder pads
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.85 + Math.sin(frame * 0.05 + i * 2.1) * 0.15;

      // Copper pad ring
      ctx.strokeStyle = `rgba(220, 170, 80, ${alpha * 0.7})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Solder fill (metallic sheen)
      const grad = ctx.createRadialGradient(n.x - n.r * 0.3, n.y - n.r * 0.3, 0, n.x, n.y, n.r * 2.2);
      grad.addColorStop(0, `rgba(240, 240, 240, ${alpha * pulse * 0.9})`);
      grad.addColorStop(0.4, `rgba(200, 200, 210, ${alpha * pulse * 0.7})`);
      grad.addColorStop(0.8, `rgba(160, 160, 170, ${alpha * pulse * 0.5})`);
      grad.addColorStop(1, `rgba(100, 100, 110, ${alpha * pulse * 0.3})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Drill hole center
      ctx.fillStyle = `rgba(5, 15, 5, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Active indicator LED glow for recently appeared nodes
      if (age < 15) {
        const ledAlpha = (1 - age / 15) * pulse;
        const ledGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 8);
        ledGrad.addColorStop(0, `rgba(0, 255, 80, ${ledAlpha * 0.4})`);
        ledGrad.addColorStop(1, "rgba(0, 255, 80, 0)");
        ctx.fillStyle = ledGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Silkscreen text labels (component references)
    ctx.font = `${6 * scale}px monospace`;
    ctx.fillStyle = `rgba(220, 220, 200, ${0.3 * fadeOut})`;
    const labelRand = seeded(555);
    for (let i = 0; i < visible; i += 12) {
      const n = nodes[i];
      const label = `U${Math.floor(labelRand() * 99 + 1)}`;
      ctx.fillText(label, n.x + n.r * 3, n.y - n.r * 2);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
