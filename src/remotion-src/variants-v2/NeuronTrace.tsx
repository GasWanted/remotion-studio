import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A single neuron being traced in 3D-ish perspective, branching dendrites
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const NeuronTrace: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const branches = useMemo(() => {
    const rand = seeded(19);
    const b: { x1: number; y1: number; x2: number; y2: number; w: number; order: number }[] = [];
    let order = 0;

    function branch(x: number, y: number, angle: number, len: number, w: number, depth: number) {
      if (depth > 10 || w < 0.3) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      b.push({ x1: x, y1: y, x2, y2, w, order: order++ });

      // Main continuation
      branch(x2, y2, angle + (rand() - 0.5) * 0.6, len * (0.7 + rand() * 0.15), w * 0.8, depth + 1);
      // Secondary branch
      if (rand() < 0.6) {
        const side = rand() > 0.5 ? 1 : -1;
        branch(x2, y2, angle + side * (0.5 + rand() * 0.5), len * 0.6, w * 0.6, depth + 1);
      }
    }

    // Cell body at center, dendrites going left, axon going right
    const cx = width * 0.4;
    const cy = height * 0.5;

    // Dendrites (left)
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI + (rand() - 0.5) * 1.2;
      branch(cx, cy, angle, 30 + rand() * 20, 3, 0);
    }
    // Axon (right)
    branch(cx, cy, 0, 40, 4, 0);

    return { branches: b, cx, cy };
  }, [width, height]);

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [10, 170], [0, branches.branches.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Branches
    for (let i = 0; i < visible; i++) {
      const br = branches.branches[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 6);

      ctx.strokeStyle = `rgba(80, 200, 120, ${alpha * 0.7})`;
      ctx.lineWidth = br.w;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.lineTo(br.x2, br.y2);
      ctx.stroke();
    }

    // Cell body
    const bodyAlpha = interpolate(frame, [5, 20], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    ctx.fillStyle = `rgba(120, 255, 160, ${bodyAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(branches.cx, branches.cy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(120, 255, 160, ${bodyAlpha * 0.15})`;
    ctx.beginPath();
    ctx.arc(branches.cx, branches.cy, 25, 0, Math.PI * 2);
    ctx.fill();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
