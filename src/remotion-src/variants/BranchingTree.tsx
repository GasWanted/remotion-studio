import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Evolutionary tree of life growing upward with branching
export const BranchingTree: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const branches = useMemo(() => {
    const b: { x1: number; y1: number; x2: number; y2: number; depth: number; order: number }[] = [];
    let order = 0;

    function grow(x: number, y: number, angle: number, len: number, depth: number) {
      if (depth > 8 || len < 3) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      b.push({ x1: x, y1: y, x2, y2, depth, order: order++ });
      const spread = 0.4 + depth * 0.05;
      grow(x2, y2, angle - spread, len * 0.72, depth + 1);
      grow(x2, y2, angle + spread, len * 0.72, depth + 1);
    }

    grow(width / 2, height * 0.9, -Math.PI / 2, height * 0.22, 0);
    return b;
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [10, 180], [0, branches.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    for (let i = 0; i < visible; i++) {
      const br = branches[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 12);
      const w = Math.max(0.5, 4 - br.depth * 0.45);

      // Color shifts from brown trunk to green tips
      const hue = 30 + br.depth * 15;
      const sat = 40 + br.depth * 8;
      ctx.strokeStyle = `hsla(${hue}, ${sat}%, 45%, ${alpha * 0.8})`;
      ctx.lineWidth = w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.lineTo(br.x2, br.y2);
      ctx.stroke();

      // Leaf dots at tips
      if (br.depth >= 6 && alpha > 0.5) {
        ctx.fillStyle = `hsla(${100 + br.depth * 10}, 60%, 50%, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(br.x2, br.y2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
