import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Stopwatch counting 00:00 → 00:32. Sparse network with edges turning red as clock ticks.
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const ThirtyTwoSeconds: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const network = useMemo(() => {
    const rand = seeded(444);
    const nodes: { x: number; y: number }[] = [];
    const cx = width / 2;
    const cy = height / 2;

    // Place nodes in a ring around center, leaving space for stopwatch
    for (let i = 0; i < 50; i++) {
      const angle = rand() * Math.PI * 2;
      const minR = 65 * S;
      const maxR = Math.min(width, height) * 0.45;
      const r = minR + rand() * (maxR - minR);
      nodes.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70 * S && rand() > 0.45) {
          edges.push([i, j]);
        }
      }
    }

    // Select edges to turn red over time (12 edges, staggered)
    const redEdges: { idx: number; triggerSec: number }[] = [];
    const shuffled = [...Array(edges.length).keys()];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < Math.min(12, shuffled.length); i++) {
      redEdges.push({
        idx: shuffled[i],
        triggerSec: 3 + (i / 12) * 27, // spread across 3s to 30s
      });
    }

    return { nodes, edges, redEdges };
  }, [width, height, S]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;
    const { nodes, edges, redEdges } = network;

    // Stopwatch time: 0 to 32 seconds over ~120 frames
    const seconds = interpolate(frame, [10, 125], [0, 32], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const displaySec = Math.floor(seconds);
    const displayStr = `00:${displaySec.toString().padStart(2, "0")}`;

    // Build set of currently red edges
    const redSet = new Set<number>();
    for (const re of redEdges) {
      if (seconds >= re.triggerSec) {
        redSet.add(re.idx);
      }
    }

    // Draw edges
    for (let i = 0; i < edges.length; i++) {
      const [a, b] = edges[i];
      const isRed = redSet.has(i);

      if (isRed) {
        const re = redEdges.find(r => r.idx === i)!;
        const t = Math.min(1, (seconds - re.triggerSec) / 2);
        const pulse = 0.7 + 0.3 * Math.sin(frame * 0.12 + i);

        ctx.save();
        ctx.shadowColor = "#ff2244";
        ctx.shadowBlur = 6 * S * t;
        ctx.strokeStyle = `rgba(255,40,68,${t * pulse * 0.8})`;
        ctx.lineWidth = (1 + t * 1.5) * S;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle = "rgba(45,50,65,0.25)";
        ctx.lineWidth = 0.5 * S;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      }
    }

    // Draw nodes
    for (const node of nodes) {
      ctx.fillStyle = "rgba(70,75,100,0.3)";
      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.5 * S, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stopwatch display
    const watchR = 40 * S;

    // Circle outline
    ctx.save();
    ctx.strokeStyle = "rgba(160,170,200,0.25)";
    ctx.lineWidth = 1.5 * S;
    ctx.beginPath();
    ctx.arc(cx, cy, watchR, 0, Math.PI * 2);
    ctx.stroke();

    // Progress arc
    const arcProgress = seconds / 32;
    ctx.strokeStyle = `rgba(255,100,60,${0.5 + arcProgress * 0.4})`;
    ctx.lineWidth = 2.5 * S;
    ctx.beginPath();
    ctx.arc(cx, cy, watchR, -Math.PI / 2, -Math.PI / 2 + arcProgress * Math.PI * 2);
    ctx.stroke();

    // Tick mark at current position
    const tickAngle = -Math.PI / 2 + arcProgress * Math.PI * 2;
    const tickX = cx + Math.cos(tickAngle) * watchR;
    const tickY = cy + Math.sin(tickAngle) * watchR;
    ctx.fillStyle = "rgba(255,200,120,0.8)";
    ctx.beginPath();
    ctx.arc(tickX, tickY, 3 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Time text
    ctx.save();
    ctx.shadowColor = "rgba(255,160,80,0.3)";
    ctx.shadowBlur = 8 * S;
    ctx.fillStyle = "rgba(255,220,180,0.9)";
    ctx.font = `bold ${18 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayStr, cx, cy);
    ctx.restore();

    // Subtle "seconds" label
    ctx.fillStyle = "rgba(140,140,160,0.3)";
    ctx.font = `${8 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("seconds", cx, cy + 14 * S);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
