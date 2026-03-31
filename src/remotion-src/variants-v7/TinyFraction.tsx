import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Full network (200 nodes). 8 edges flash red. Counter: "157 / 15,091,983" then "0.001%"
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const TinyFraction: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const network = useMemo(() => {
    const rand = seeded(333);
    const nodes: { x: number; y: number }[] = [];
    const margin = 30 * S;
    const textZone = 50 * S; // reserve bottom for counter
    for (let i = 0; i < 200; i++) {
      nodes.push({
        x: margin + rand() * (width - 2 * margin),
        y: margin + rand() * (height - 2 * margin - textZone),
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40 * S && rand() > 0.4) {
          edges.push([i, j]);
        }
      }
    }
    // Pick 8 edges to highlight
    const highlighted: number[] = [];
    const candidates = [...Array(edges.length).keys()];
    for (let i = 0; i < 8 && candidates.length > 0; i++) {
      const idx = Math.floor(rand() * candidates.length);
      highlighted.push(candidates[idx]);
      candidates.splice(idx, 1);
    }
    return { nodes, edges, highlighted };
  }, [width, height, S]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { nodes, edges, highlighted } = network;
    const highlightSet = new Set(highlighted);

    // Highlight timing
    const highlightStart = 35;
    const highlightAlpha = interpolate(frame, [highlightStart, highlightStart + 15], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Draw all edges
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      const isHL = highlightSet.has(i);

      if (isHL && highlightAlpha > 0) {
        // Red highlighted edge
        const pulse = 0.6 + 0.4 * Math.sin(frame * 0.15 + i);
        ctx.save();
        ctx.shadowColor = "#ff2244";
        ctx.shadowBlur = 8 * S;
        ctx.strokeStyle = `rgba(255,34,68,${highlightAlpha * pulse})`;
        ctx.lineWidth = 2 * S;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle = "rgba(50,55,70,0.2)";
        ctx.lineWidth = 0.4 * S;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      // Check if node is part of a highlighted edge
      let isPartOfHL = false;
      for (const hi of highlighted) {
        const [a, b] = edges[hi];
        if (a === i || b === i) { isPartOfHL = true; break; }
      }

      if (isPartOfHL && highlightAlpha > 0) {
        ctx.fillStyle = `rgba(255,80,100,${highlightAlpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 2.5 * S, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(80,85,110,0.25)";
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.2 * S, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Counter text at bottom
    const counterStart = 50;
    const counterAlpha = interpolate(frame, [counterStart, counterStart + 10], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    if (counterAlpha > 0) {
      ctx.globalAlpha = fadeOut * counterAlpha;
      const counterY = height - 22 * S;

      // Counting animation for 157
      const countEnd = 75;
      const countVal = Math.floor(interpolate(frame, [counterStart, countEnd], [0, 157], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      }));

      ctx.font = `bold ${14 * S}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // "157 / 15,091,983"
      ctx.fillStyle = "rgba(255,80,100,0.9)";
      ctx.fillText(`${countVal}`, width / 2 - 50 * S, counterY);

      ctx.fillStyle = "rgba(120,120,140,0.5)";
      ctx.fillText("/", width / 2 - 20 * S, counterY);

      ctx.fillStyle = "rgba(100,110,140,0.6)";
      ctx.font = `${12 * S}px monospace`;
      ctx.fillText("15,091,983", width / 2 + 30 * S, counterY);

      // Percentage appears later
      const pctAlpha = interpolate(frame, [90, 105], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (pctAlpha > 0) {
        ctx.globalAlpha = fadeOut * pctAlpha;
        ctx.font = `bold ${16 * S}px monospace`;
        ctx.fillStyle = `rgba(255,80,100,${0.9 * pctAlpha})`;
        ctx.save();
        ctx.shadowColor = "#ff2244";
        ctx.shadowBlur = 8 * S;
        ctx.fillText("0.001%", width / 2, counterY - 22 * S);
        ctx.restore();
      }
    }

    ctx.globalAlpha = fadeOut;
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
