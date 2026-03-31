import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Rotating double helix with connecting base pairs
export const DNAHelix: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeIn * fadeOut;

    const cx = width / 2;
    const steps = 60;
    const helixH = height * 0.85;
    const startY = height * 0.075;
    const radius = width * 0.12;
    const twist = frame * 0.04;
    const colors = ["#4488ff", "#ff4466"];

    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const y = startY + t * helixH;
      const angle = t * Math.PI * 4 + twist;

      const x1 = cx + Math.cos(angle) * radius;
      const x2 = cx + Math.cos(angle + Math.PI) * radius;
      const z1 = Math.sin(angle);
      const z2 = Math.sin(angle + Math.PI);

      // Base pair connection
      if (s % 3 === 0) {
        const alpha = 0.15 + Math.abs(z1) * 0.15;
        ctx.strokeStyle = `rgba(150, 150, 200, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }

      // Draw back strand first, front strand second
      const strands = z1 > z2
        ? [{ x: x2, z: z2, c: colors[1] }, { x: x1, z: z1, c: colors[0] }]
        : [{ x: x1, z: z1, c: colors[0] }, { x: x2, z: z2, c: colors[1] }];

      for (const st of strands) {
        const size = 2 + (st.z + 1) * 2;
        const alpha = 0.3 + (st.z + 1) * 0.35;
        ctx.fillStyle = st.c;
        ctx.globalAlpha = fadeIn * fadeOut * alpha;
        ctx.beginPath();
        ctx.arc(st.x, y, size, 0, Math.PI * 2);
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
