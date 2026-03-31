import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Split screen: left shows green original, right shows modified version with red changes
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const BeforeAfter: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const nodes: { x: number; y: number; r: number }[] = [];
    for (let i = 0; i < 120; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * height * 0.38;
      nodes.push({ x: Math.cos(a) * r * 1.2, y: height / 2 + Math.sin(a) * r * 0.9, r: (1 + rand() * 2) * scale });
    }
    const edges: { a: number; b: number; modified: boolean }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 50 * scale && rand() < 0.15) {
          edges.push({ a: i, b: j, modified: rand() < 0.1 });
        }
      }
    }
    return { nodes, edges };
  }, [height, scale]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const splitReveal = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const leftCX = width * 0.25;
    const rightCX = width * 0.75;

    // Draw both sides
    for (const side of ["left", "right"] as const) {
      const ox = side === "left" ? leftCX : rightCX;
      const isAfter = side === "right";
      const sideAlpha = isAfter ? splitReveal : 1;

      ctx.globalAlpha = fadeOut * sideAlpha;

      for (const e of data.edges) {
        const na = data.nodes[e.a], nb = data.nodes[e.b];
        const color = isAfter && e.modified ? "rgba(255, 60, 60, 0.5)" : "rgba(80, 200, 120, 0.3)";
        const w = isAfter && e.modified ? 0.3 : 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = w * 1.2 * scale;
        ctx.beginPath();
        ctx.moveTo(ox + na.x, na.y);
        ctx.lineTo(ox + nb.x, nb.y);
        ctx.stroke();
      }

      for (const n of data.nodes) {
        ctx.fillStyle = "rgba(100, 230, 140, 0.7)";
        ctx.beginPath();
        ctx.arc(ox + n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Divider
    ctx.globalAlpha = fadeOut;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.05);
    ctx.lineTo(width / 2, height * 0.95);
    ctx.stroke();

    // Labels
    const fontSize = Math.max(9, 12 * scale);
    ctx.font = `${fontSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText("BEFORE", width * 0.25, height * 0.06);
    if (splitReveal > 0.5) ctx.fillText("AFTER", width * 0.75, height * 0.06);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
