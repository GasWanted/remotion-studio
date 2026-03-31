import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Network with visible weight numbers on edges — some tick down to 0, others tick up
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const WeightShift: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.35;
      nodes.push({ x: cx + Math.cos(a) * r * 1.3, y: cy + Math.sin(a) * r * 0.9 });
    }
    const edges: { a: number; b: number; startW: number; endW: number; modified: boolean }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 90 * scale && rand() < 0.18) {
          const w = +(1 + rand() * 4).toFixed(1);
          const modify = rand() < 0.2;
          edges.push({
            a: i, b: j, startW: w,
            endW: modify ? +(rand() < 0.5 ? 0 : w + 2 + rand() * 3).toFixed(1) : w,
            modified: modify,
          });
        }
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shiftT = interpolate(frame, [80, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const fontSize = Math.max(8, 10 * scale);

    for (const e of data.edges) {
      const na = data.nodes[e.a], nb = data.nodes[e.b];
      const w = e.startW + (e.endW - e.startW) * shiftT;
      const thickness = Math.max(0.3, w * 0.4) * scale;

      const color = e.modified
        ? (e.endW === 0 ? `rgba(255, 80, 80, ${0.2 + (1 - shiftT) * 0.3})` : `rgba(255, 200, 50, ${0.2 + shiftT * 0.5})`)
        : "rgba(80, 200, 120, 0.3)";

      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Weight label
      if (e.modified) {
        const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
        ctx.font = `${fontSize}px Courier New`;
        ctx.fillStyle = e.endW === 0 ? "rgba(255, 100, 100, 0.8)" : "rgba(255, 220, 80, 0.8)";
        ctx.textAlign = "center";
        ctx.fillText(w.toFixed(1), mx, my - 4 * scale);
      }
    }

    for (const n of data.nodes) {
      ctx.fillStyle = "rgba(100, 230, 140, 0.8)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
