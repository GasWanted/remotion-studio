import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 04 — Dots morph into institution clusters connected by lines (4s = 120 frames)
export const Scene004: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(404);
    const particles = makeParticles(40, width, height, scale);
    const institutions = [
      { name: "Princeton", x: width * 0.3, y: height * 0.35 },
      { name: "Cambridge", x: width * 0.7, y: height * 0.3 },
      { name: "Janelia", x: width * 0.5, y: height * 0.55 },
      { name: "", x: width * 0.25, y: height * 0.65 },
      { name: "", x: width * 0.75, y: height * 0.6 },
      { name: "", x: width * 0.4, y: height * 0.75 },
      { name: "", x: width * 0.6, y: height * 0.75 },
    ];
    // Cluster dots around each institution
    const dots: { x: number; y: number; inst: number; hue: number }[] = [];
    for (let i = 0; i < institutions.length; i++) {
      const count = i < 3 ? 30 : 15;
      for (let j = 0; j < count; j++) {
        const a = rand() * Math.PI * 2;
        const r = rand() * 30 * scale;
        dots.push({
          x: institutions[i].x + Math.cos(a) * r,
          y: institutions[i].y + Math.sin(a) * r,
          inst: i, hue: PALETTE.cellColors[i % PALETTE.cellColors.length][0],
        });
      }
    }
    const edges: [number, number][] = [[0, 1], [0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6]];
    return { particles, institutions, dots, edges };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const progress = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Edges
    for (const [a, b] of data.edges) {
      const edgeP = interpolate(progress, [0.3, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (edgeP <= 0) continue;
      const ia = data.institutions[a], ib = data.institutions[b];
      ctx.strokeStyle = `hsla(220, 40%, 60%, ${edgeP * 0.3})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(ia.x, ia.y);
      ctx.lineTo(ia.x + (ib.x - ia.x) * edgeP, ia.y + (ib.y - ia.y) * edgeP);
      ctx.stroke();
    }

    // Dots
    const visibleDots = Math.floor(data.dots.length * progress);
    for (let i = 0; i < visibleDots; i++) {
      const d = data.dots[i];
      ctx.fillStyle = `hsla(${d.hue}, 55%, 65%, 0.8)`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    if (progress > 0.4) {
      const labelAlpha = interpolate(progress, [0.4, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${18 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      for (const inst of data.institutions) {
        if (!inst.name) continue;
        ctx.fillStyle = `rgba(255,255,255,${labelAlpha * 0.8})`;
        ctx.fillText(inst.name, inst.x, inst.y - 20 * scale);
      }
      ctx.fillStyle = `rgba(255,255,255,${labelAlpha * 0.5})`;
      ctx.font = `${14 * scale}px monospace`;
      ctx.fillText("127 institutions", width / 2, height * 0.9);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
