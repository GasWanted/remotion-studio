import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut, makeCells, drawCell } from "../theme";

// Shot 29 — Neurons assemble into brain shape (4s = 120 frames)
export const Scene029: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2929);
    const particles = makeParticles(30, width, height, scale);
    const cx = width / 2, cy = height / 2;
    // Scattered positions (start) → brain ellipse positions (end)
    const brainRx = 120 * scale, brainRy = 90 * scale;
    const cells: { sx: number; sy: number; tx: number; ty: number; hue: number; sat: number; lit: number; r: number; blobPhase: number; squish: number }[] = [];
    for (let i = 0; i < 150; i++) {
      // Target: inside brain ellipse
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5);
      const tx = cx + Math.cos(a) * brainRx * d;
      const ty = cy + Math.sin(a) * brainRy * d;
      // Start: scattered across screen
      const sx = rand() * width;
      const sy = rand() * height;
      const col = PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)];
      cells.push({
        sx, sy, tx, ty,
        hue: col[0], sat: col[1], lit: col[2],
        r: (2 + rand() * 3) * scale,
        blobPhase: rand() * Math.PI * 2,
        squish: 0.85 + rand() * 0.3,
      });
    }
    return { particles, cells, cx, cy, brainRx, brainRy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const assembleT = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Brain outline (appears as cells converge)
    if (assembleT > 0.5) {
      const outlineAlpha = (assembleT - 0.5) * 0.6;
      ctx.strokeStyle = `hsla(280, 35%, 55%, ${outlineAlpha})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.ellipse(data.cx, data.cy, data.brainRx + 5 * scale, data.brainRy + 5 * scale, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cells moving from scattered to brain shape
    for (const c of data.cells) {
      const x = c.sx + (c.tx - c.sx) * assembleT;
      const y = c.sy + (c.ty - c.sy) * assembleT;
      drawCell(ctx, { ...c, x, y }, frame, alpha, false, scale);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
