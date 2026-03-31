import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Sparse nodes with synaptic signals traveling between them, bursting on arrival
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SynapseFireworks: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { nodes, signals } = useMemo(() => {
    const rand = seeded(55);
    const nodes = Array.from({ length: 30 }, () => ({
      x: width * 0.1 + rand() * width * 0.8,
      y: height * 0.1 + rand() * height * 0.8,
    }));
    // Pre-generate signal events
    const signals = Array.from({ length: 80 }, () => {
      const from = Math.floor(rand() * nodes.length);
      let to = Math.floor(rand() * nodes.length);
      while (to === from) to = Math.floor(rand() * nodes.length);
      return { from, to, startFrame: Math.floor(rand() * 180) + 10, duration: 20 + Math.floor(rand() * 20) };
    });
    return { nodes, signals };
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Background connections (faint)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 150) {
          ctx.strokeStyle = "rgba(60, 80, 120, 0.1)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Traveling signals
    for (const sig of signals) {
      if (frame < sig.startFrame || frame > sig.startFrame + sig.duration + 10) continue;
      const t = (frame - sig.startFrame) / sig.duration;
      const from = nodes[sig.from];
      const to = nodes[sig.to];

      if (t <= 1) {
        // Traveling dot
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        ctx.fillStyle = "rgba(255, 200, 50, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.strokeStyle = "rgba(255, 200, 50, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        // Burst at arrival
        const burstT = t - 1;
        const r = burstT * 30;
        const alpha = Math.max(0, 1 - burstT * 3);
        ctx.strokeStyle = `rgba(255, 200, 50, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Nodes
    for (const n of nodes) {
      ctx.fillStyle = "rgba(150, 170, 220, 0.6)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(200, 220, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
