import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Blueprint: React.FC<VariantProps> = ({ width, height }) => {
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
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges } = data;

    // Dark navy blue background
    ctx.fillStyle = "#0a1628";
    ctx.fillRect(0, 0, width, height);

    // Fine dot grid
    const dotSpacing = 12 * scale;
    ctx.fillStyle = "rgba(60, 120, 180, 0.15)";
    for (let x = dotSpacing; x < width; x += dotSpacing) {
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      }
    }

    // Major grid lines
    const majorSpacing = dotSpacing * 5;
    ctx.strokeStyle = "rgba(40, 100, 160, 0.08)";
    ctx.lineWidth = 0.5 * scale;
    for (let x = majorSpacing; x < width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = majorSpacing; y < height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Measurement tick marks along edges
    ctx.fillStyle = "rgba(80, 160, 220, 0.12)";
    ctx.font = `${4 * scale}px monospace`;
    const tickSpacing = majorSpacing;
    for (let x = tickSpacing; x < width; x += tickSpacing) {
      ctx.fillStyle = "rgba(80, 160, 220, 0.12)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 4 * scale);
      ctx.stroke();
      ctx.fillText(`${Math.round(x / scale)}`, x + 2, 10 * scale);
    }
    for (let y = tickSpacing; y < height; y += tickSpacing) {
      ctx.fillStyle = "rgba(80, 160, 220, 0.12)";
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(4 * scale, y);
      ctx.stroke();
      ctx.fillText(`${Math.round(y / scale)}`, 5 * scale, y - 2);
    }

    // Title block in bottom right
    ctx.strokeStyle = "rgba(60, 140, 200, 0.1)";
    ctx.lineWidth = 1 * scale;
    const tbW = 80 * scale, tbH = 30 * scale;
    ctx.strokeRect(width - tbW - 6 * scale, height - tbH - 6 * scale, tbW, tbH);
    ctx.font = `${4.5 * scale}px monospace`;
    ctx.fillStyle = "rgba(80, 170, 230, 0.15)";
    ctx.fillText("CONNECTOME SCHEMATIC", width - tbW - 2 * scale, height - tbH + 6 * scale);
    ctx.fillText("SCALE 1:1", width - tbW - 2 * scale, height - tbH + 14 * scale);
    ctx.fillText(`REV ${frame}`, width - tbW - 2 * scale, height - tbH + 22 * scale);

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as thin dashed lines
    ctx.setLineDash([4 * scale, 3 * scale]);
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      ctx.strokeStyle = "rgba(100, 190, 255, 0.25)";
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Dimension lines for some edges
    let dimCount = 0;
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      if (dimCount > 8) break;
      if (a % 7 !== 0) continue;
      dimCount++;
      const na = nodes[a], nb = nodes[b];
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
      const nx = -dy / dist, ny = dx / dist;
      const off = 6 * scale;

      // Dimension line offset from edge
      ctx.strokeStyle = "rgba(100, 190, 255, 0.15)";
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x + nx * off, na.y + ny * off);
      ctx.lineTo(nb.x + nx * off, nb.y + ny * off);
      ctx.stroke();

      // Tick marks at ends
      ctx.beginPath();
      ctx.moveTo(na.x + nx * (off - 2 * scale), na.y + ny * (off - 2 * scale));
      ctx.lineTo(na.x + nx * (off + 2 * scale), na.y + ny * (off + 2 * scale));
      ctx.moveTo(nb.x + nx * (off - 2 * scale), nb.y + ny * (off - 2 * scale));
      ctx.lineTo(nb.x + nx * (off + 2 * scale), nb.y + ny * (off + 2 * scale));
      ctx.stroke();

      // Distance label
      ctx.font = `${4 * scale}px monospace`;
      ctx.fillStyle = "rgba(100, 190, 255, 0.3)";
      ctx.fillText(`${(dist / scale).toFixed(1)}`, mx + nx * (off + 4 * scale), my + ny * (off + 4 * scale));
    }

    // Draw nodes as crosshair circles
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);

      // Outer circle
      ctx.strokeStyle = `rgba(120, 200, 255, ${alpha * 0.6})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair lines
      const chLen = n.r * 4;
      ctx.strokeStyle = `rgba(120, 200, 255, ${alpha * 0.35})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(n.x - chLen, n.y);
      ctx.lineTo(n.x + chLen, n.y);
      ctx.moveTo(n.x, n.y - chLen);
      ctx.lineTo(n.x, n.y + chLen);
      ctx.stroke();

      // Center dot
      ctx.fillStyle = `rgba(180, 230, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Coordinate labels for some nodes
      if (i % 10 === 0) {
        ctx.font = `${3.5 * scale}px monospace`;
        ctx.fillStyle = `rgba(100, 190, 255, ${alpha * 0.4})`;
        const lx = ((n.x - width / 2) / scale).toFixed(0);
        const ly = ((n.y - height / 2) / scale).toFixed(0);
        ctx.fillText(`(${lx},${ly})`, n.x + n.r * 3.5, n.y - n.r * 2);
      }
    }

    // Animated scanning line (moving downward slowly)
    const scanY = (frame * 2.5 * scale) % height;
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.08 * fadeOut})`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(width, scanY);
    ctx.stroke();

    // Scan line glow
    const scanGrad = ctx.createLinearGradient(0, scanY - 10 * scale, 0, scanY + 10 * scale);
    scanGrad.addColorStop(0, "rgba(100, 200, 255, 0)");
    scanGrad.addColorStop(0.5, `rgba(100, 200, 255, ${0.03 * fadeOut})`);
    scanGrad.addColorStop(1, "rgba(100, 200, 255, 0)");
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 10 * scale, width, 20 * scale);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
