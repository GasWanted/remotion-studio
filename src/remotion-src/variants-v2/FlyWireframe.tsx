import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

// A fly silhouette drawn as wireframe lines, assembling piece by piece
export const FlyWireframe: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = width / 2;
  const cy = height / 2;
  const s = Math.min(width, height) * 0.006;

  const fadeOut = interpolate(frame, [200, 235], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;
    ctx.strokeStyle = "#ffaa22";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    // Fly parts as line segments, each with a reveal frame
    const parts: { path: [number, number][]; delay: number }[] = [
      // Head (circle-ish, top)
      { path: [[-8,-30],[-14,-38],[-12,-46],[-4,-50],[4,-50],[12,-46],[14,-38],[8,-30]], delay: 10 },
      // Left eye
      { path: [[-14,-38],[-22,-44],[-20,-50],[-12,-46]], delay: 20 },
      // Right eye
      { path: [[14,-38],[22,-44],[20,-50],[12,-46]], delay: 20 },
      // Thorax
      { path: [[-8,-30],[-14,-18],[-14,-4],[-8,4],[8,4],[14,-4],[14,-18],[8,-30]], delay: 35 },
      // Abdomen
      { path: [[-8,4],[-12,16],[-10,30],[-6,42],[0,48],[6,42],[10,30],[12,16],[8,4]], delay: 50 },
      // Left wing
      { path: [[-14,-18],[-40,-34],[-50,-20],[-44,-8],[-14,-4]], delay: 65 },
      // Right wing
      { path: [[14,-18],[40,-34],[50,-20],[44,-8],[14,-4]], delay: 65 },
      // Left legs
      { path: [[-14,-14],[-30,-8],[-38,2]], delay: 80 },
      { path: [[-14,-10],[-32,0],[-40,12]], delay: 85 },
      { path: [[-12,0],[-28,10],[-36,22]], delay: 90 },
      // Right legs
      { path: [[14,-14],[30,-8],[38,2]], delay: 80 },
      { path: [[14,-10],[32,0],[40,12]], delay: 85 },
      { path: [[12,0],[28,10],[36,22]], delay: 90 },
      // Antennae
      { path: [[-6,-50],[-10,-60],[-14,-66]], delay: 100 },
      { path: [[6,-50],[10,-60],[14,-66]], delay: 100 },
    ];

    for (const part of parts) {
      const progress = interpolate(frame, [part.delay, part.delay + 25], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
        easing: Easing.bezier(0, 0, 0.2, 1),
      });
      if (progress <= 0) continue;

      const points = part.path.map(([x, y]) => [cx + x * s, cy + y * s] as [number, number]);
      const totalPts = points.length;
      const visiblePts = Math.ceil(totalPts * progress);

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < visiblePts; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.globalAlpha = fadeOut * progress;
      ctx.stroke();

      // Dot at drawing tip
      if (progress < 1 && visiblePts > 0) {
        const tip = points[visiblePts - 1];
        ctx.fillStyle = "#ffcc44";
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 2, 0, Math.PI * 2);
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
