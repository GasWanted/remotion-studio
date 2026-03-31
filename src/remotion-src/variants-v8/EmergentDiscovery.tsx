import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Network zooms into a small cluster; unexpected connections light up between retreat neurons
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const EmergentDiscovery: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const network = useMemo(() => {
    const rand = seeded(91);
    // Outer network nodes
    const outer: { x: number; y: number }[] = [];
    for (let i = 0; i < 80; i++) {
      outer.push({
        x: (rand() - 0.5) * 280 * scale,
        y: (rand() - 0.5) * 220 * scale,
      });
    }
    // Inner cluster (retreat neurons) - small tight group
    const cluster: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + rand() * 0.3;
      const r = 15 + rand() * 12;
      cluster.push({
        x: Math.cos(a) * r * scale,
        y: Math.sin(a) * r * scale,
      });
    }
    // Edges among outer
    const outerEdges: [number, number][] = [];
    for (let i = 0; i < outer.length; i++) {
      for (let j = i + 1; j < outer.length; j++) {
        const dx = outer[i].x - outer[j].x, dy = outer[i].y - outer[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 40 * scale && rand() < 0.2) {
          outerEdges.push([i, j]);
        }
      }
    }
    // Surprise edges among cluster
    const clusterEdges: [number, number][] = [];
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        if (rand() < 0.6) clusterEdges.push([i, j]);
      }
    }
    return { outer, cluster, outerEdges, clusterEdges };
  }, [scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [20, 70], [1, 2.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clusterReveal = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const signalFlow = interpolate(frame, [75, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textReveal = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);

    // Outer network (fades as we zoom in)
    const outerAlpha = interpolate(zoom, [1, 2.5], [0.5, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const [a, b] of network.outerEdges) {
      const na = network.outer[a], nb = network.outer[b];
      ctx.strokeStyle = `rgba(60, 100, 160, ${outerAlpha * 0.4})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    for (const n of network.outer) {
      ctx.fillStyle = `rgba(70, 120, 180, ${outerAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cluster connections (light up)
    for (let i = 0; i < network.clusterEdges.length; i++) {
      const [a, b] = network.clusterEdges[i];
      const na = network.cluster[a], nb = network.cluster[b];
      const edgeDelay = i / network.clusterEdges.length;
      const edgeAlpha = interpolate(clusterReveal, [edgeDelay, edgeDelay + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Signal pulse along edge
      const pulse = signalFlow > 0 ? 0.3 + 0.4 * Math.sin(frame * 0.5 - i * 1.2) : 0;

      ctx.strokeStyle = `rgba(255, 70, 40, ${edgeAlpha * (0.4 + pulse)})`;
      ctx.lineWidth = (1 + pulse) * (scale / zoom);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Cluster nodes
    for (let i = 0; i < network.cluster.length; i++) {
      const n = network.cluster[i];
      const nodeDelay = i / network.cluster.length * 0.5;
      const nodeAlpha = interpolate(clusterReveal, [nodeDelay, nodeDelay + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const pulse = signalFlow > 0 ? 0.5 + 0.5 * Math.sin(frame * 0.4 + i * 1.8) : 0.5;

      if (nodeAlpha > 0) {
        ctx.shadowColor = `rgba(255, 60, 30, ${nodeAlpha * 0.5})`;
        ctx.shadowBlur = (4 + pulse * 6) / zoom;
        ctx.fillStyle = `rgba(255, ${Math.floor(70 + pulse * 40)}, ${Math.floor(40 + pulse * 20)}, ${nodeAlpha * (0.6 + pulse * 0.4)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, (3 + pulse * 1.5) / zoom * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.restore();

    // Text overlay
    if (textReveal > 0) {
      const fontSize = Math.max(8, 10 * scale);
      ctx.font = `${fontSize}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(255, 200, 180, ${0.6 * textReveal * fadeOut})`;
      ctx.fillText("we didn't design this", cx, height * 0.9);
    }

    // Title
    const titleSize = Math.max(7, 8 * scale);
    ctx.font = `${titleSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = `rgba(255, 200, 180, ${0.4 * fadeOut})`;
    ctx.fillText("emergent connections", cx, height * 0.06);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
