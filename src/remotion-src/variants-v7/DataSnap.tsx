import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Organic glowing network snaps into code/matrix view. "W[3847][2910] = 4.2" lines appear
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const DataSnap: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const data = useMemo(() => {
    const rand = seeded(123);
    const nodes: { x: number; y: number; gridX: number; gridY: number }[] = [];
    const cols = 8;
    const rows = 6;
    const cellW = width / (cols + 1);
    const cellH = (height - 40 * S) / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        nodes.push({
          x: cellW * 0.7 + rand() * (width - cellW * 1.4),
          y: cellH * 0.7 + rand() * (height - cellH * 1.4 - 30 * S),
          gridX: cellW * (c + 1),
          gridY: cellH * (r + 1),
        });
      }
    }
    const edges: [number, number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 90 * S && rand() > 0.6) {
          edges.push([i, j, Math.round((rand() * 8 - 2) * 10) / 10]);
        }
      }
    }
    // Code lines
    const lines: string[] = [];
    for (let i = 0; i < 14; i++) {
      const r1 = Math.floor(rand() * 9999);
      const r2 = Math.floor(rand() * 9999);
      const val = (rand() * 10 - 3).toFixed(1);
      lines.push(`W[${r1}][${r2}] = ${val}`);
    }
    return { nodes, edges, lines };
  }, [width, height, S]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const snapFrame = 60;
    const transition = interpolate(frame, [snapFrame, snapFrame + 15], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    const { nodes, edges, lines } = data;

    if (transition < 1) {
      // Organic network phase
      const organicAlpha = 1 - transition;
      ctx.globalAlpha = fadeOut * organicAlpha;

      // Edges
      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        const ax = na.x + (na.gridX - na.x) * transition;
        const ay = na.y + (na.gridY - na.y) * transition;
        const bx = nb.x + (nb.gridX - nb.x) * transition;
        const by = nb.y + (nb.gridY - nb.y) * transition;

        ctx.strokeStyle = `rgba(80,180,255,${0.3 * organicAlpha})`;
        ctx.lineWidth = 1 * S;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Nodes
      for (const node of nodes) {
        const nx = node.x + (node.gridX - node.x) * transition;
        const ny = node.y + (node.gridY - node.y) * transition;
        const pulse = 1 + 0.15 * Math.sin(frame * 0.08 + nx * 0.01);

        ctx.save();
        ctx.shadowColor = "#44aaff";
        ctx.shadowBlur = 6 * S;
        ctx.fillStyle = `rgba(100,200,255,${0.6 * organicAlpha})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 3 * S * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Code/matrix phase
    if (transition > 0) {
      const codeAlpha = transition;
      ctx.globalAlpha = fadeOut * codeAlpha;

      // Background scanline effect
      ctx.fillStyle = "rgba(0,20,10,0.3)";
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      // Code lines
      const fontSize = 11 * S;
      ctx.font = `${fontSize}px monospace`;
      const lineHeight = fontSize * 1.7;
      const startY = 30 * S;
      const startX = 30 * S;

      const visibleLines = Math.floor(interpolate(frame, [snapFrame + 5, snapFrame + 50], [0, lines.length], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      }));

      for (let i = 0; i < visibleLines; i++) {
        const lineAlpha = Math.min(1, (frame - (snapFrame + 5 + i * 3)) / 6);
        if (lineAlpha <= 0) continue;

        const y = startY + i * lineHeight;
        if (y > height - 20 * S) break;

        // Green matrix text
        ctx.save();
        ctx.shadowColor = "#00ff44";
        ctx.shadowBlur = 4 * S;
        ctx.fillStyle = `rgba(0,255,68,${0.8 * lineAlpha * codeAlpha})`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(lines[i], startX, y);
        ctx.restore();
      }

      // Blinking cursor
      if (frame % 20 < 10 && visibleLines < lines.length) {
        const cursorY = startY + visibleLines * lineHeight;
        ctx.fillStyle = `rgba(0,255,68,${0.8 * codeAlpha})`;
        ctx.fillRect(startX, cursorY, 7 * S, fontSize);
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
