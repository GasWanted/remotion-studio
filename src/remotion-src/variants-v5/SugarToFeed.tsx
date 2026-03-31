import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Left: "SUGAR" cluster lights up yellow. Particles travel through middle network.
// Right: "FEED" neuron starts pulsing green.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Node { x: number; y: number; }
interface Edge { a: number; b: number; }
interface Particle { path: number[]; startFrame: number; speed: number; }

function buildData(width: number, height: number, scale: number) {
  const rand = seeded(333);
  const cx = width / 2;
  const cy = height / 2;

  // Sugar cluster (left)
  const sugarNodes: Node[] = [];
  const sugarCx = width * 0.12;
  const sugarCy = cy;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rand() * 0.3;
    const r = (12 + rand() * 15) * scale;
    sugarNodes.push({ x: sugarCx + Math.cos(a) * r, y: sugarCy + Math.sin(a) * r });
  }

  // Feed neuron (right)
  const feedNode: Node = { x: width * 0.88, y: cy };

  // Middle network
  const midNodes: Node[] = [];
  for (let i = 0; i < 60; i++) {
    midNodes.push({
      x: width * (0.22 + rand() * 0.56),
      y: height * (0.12 + rand() * 0.76),
    });
  }

  // All nodes: sugar(0..7), mid(8..67), feed(68)
  const allNodes: Node[] = [...sugarNodes, ...midNodes, feedNode];
  const feedIdx = allNodes.length - 1;
  const sugarIdxs = sugarNodes.map((_, i) => i);

  // Edges: connect nearby mid nodes
  const edges: Edge[] = [];
  for (let i = 8; i < feedIdx; i++) {
    for (let j = i + 1; j < feedIdx; j++) {
      const dx = allNodes[i].x - allNodes[j].x;
      const dy = allNodes[i].y - allNodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.2) {
        edges.push({ a: i, b: j });
      }
    }
  }

  // Connect sugar to nearby mid nodes
  for (const si of sugarIdxs) {
    let closest = 8;
    let closestD = Infinity;
    for (let j = 8; j < feedIdx; j++) {
      const dx = allNodes[si].x - allNodes[j].x;
      const dy = allNodes[si].y - allNodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < closestD) { closestD = d; closest = j; }
    }
    edges.push({ a: si, b: closest });
  }

  // Connect rightmost mid nodes to feed
  const midByX = midNodes.map((n, i) => ({ i: i + 8, x: n.x })).sort((a, b) => b.x - a.x);
  for (let i = 0; i < 4; i++) {
    edges.push({ a: midByX[i].i, b: feedIdx });
  }

  // Build adjacency for pathfinding
  const adj: number[][] = Array.from({ length: allNodes.length }, () => []);
  for (const e of edges) {
    adj[e.a].push(e.b);
    adj[e.b].push(e.a);
  }

  // BFS paths from sugar nodes toward feed
  const particles: Particle[] = [];
  for (let p = 0; p < 12; p++) {
    const startNode = sugarIdxs[Math.floor(rand() * sugarIdxs.length)];
    // Random walk biased toward feed
    const path = [startNode];
    let cur = startNode;
    for (let step = 0; step < 20; step++) {
      const neighbors = adj[cur];
      if (neighbors.length === 0) break;
      // Bias toward right (closer to feed)
      let best = neighbors[0];
      let bestScore = -Infinity;
      for (const n of neighbors) {
        const score = allNodes[n].x + rand() * 40 * scale;
        if (score > bestScore && !path.includes(n)) {
          bestScore = score;
          best = n;
        }
      }
      path.push(best);
      cur = best;
      if (cur === feedIdx) break;
    }
    particles.push({ path, startFrame: 25 + p * 5, speed: 0.06 + rand() * 0.03 });
  }

  return { allNodes, edges, sugarIdxs, feedIdx, particles };
}

export const SugarToFeed: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildData(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { allNodes, edges, sugarIdxs, feedIdx, particles } = data;
    const sugarSet = new Set(sugarIdxs);

    // Sugar activation
    const sugarOn = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Feed activation (starts when particles arrive)
    const feedOn = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const feedPulse = feedOn > 0 ? 0.5 + 0.5 * Math.sin(frame * 0.15) : 0;

    // Draw edges
    for (const e of edges) {
      ctx.strokeStyle = "rgba(60, 100, 160, 0.15)";
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(allNodes[e.a].x, allNodes[e.a].y);
      ctx.lineTo(allNodes[e.b].x, allNodes[e.b].y);
      ctx.stroke();
    }

    // Draw nodes
    for (let i = 0; i < allNodes.length; i++) {
      const n = allNodes[i];
      if (sugarSet.has(i)) {
        const a = 0.3 + sugarOn * 0.7;
        ctx.fillStyle = `rgba(255, 220, 60, ${a})`;
        ctx.shadowColor = "#ffdd44";
        ctx.shadowBlur = sugarOn * 6 * scale;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (i === feedIdx) {
        const a = 0.2 + feedOn * (0.4 + feedPulse * 0.4);
        const r = (4 + feedOn * 3) * scale;
        ctx.fillStyle = `rgba(60, 255, 120, ${a})`;
        ctx.shadowColor = "#33ff77";
        ctx.shadowBlur = feedOn * 12 * scale;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = "rgba(80, 120, 180, 0.15)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw particles
    for (const p of particles) {
      const elapsed = frame - p.startFrame;
      if (elapsed < 0) continue;
      const pathProgress = elapsed * p.speed;
      const segIdx = Math.floor(pathProgress);
      const segFrac = pathProgress - segIdx;
      if (segIdx >= p.path.length - 1) continue;

      const fromNode = allNodes[p.path[segIdx]];
      const toNode = allNodes[p.path[segIdx + 1]];
      const px = fromNode.x + (toNode.x - fromNode.x) * segFrac;
      const py = fromNode.y + (toNode.y - fromNode.y) * segFrac;

      ctx.fillStyle = "#ffcc33";
      ctx.shadowColor = "#ffcc33";
      ctx.shadowBlur = 5 * scale;
      ctx.beginPath();
      ctx.arc(px, py, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Labels
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.textAlign = "center";

    // SUGAR label
    ctx.fillStyle = `rgba(255, 220, 60, ${0.4 + sugarOn * 0.6})`;
    ctx.fillText("SUGAR", width * 0.12, height * 0.12);

    // FEED label
    ctx.fillStyle = `rgba(60, 255, 120, ${0.3 + feedOn * 0.7})`;
    ctx.fillText("FEED", width * 0.88, height * 0.12);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
