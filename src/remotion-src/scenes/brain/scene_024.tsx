import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 24 — 2D blobs extrude into 3D neuron shape (4s = 120 frames)
export const Scene024: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2424);
    const particles = makeParticles(30, width, height, scale);
    // Neuron tree: cell body + branching dendrites + axon
    const branches: { x1: number; y1: number; x2: number; y2: number; width: number }[] = [];
    const cx = width / 2, cy = height * 0.45;
    // Cell body at center
    // Dendrites (left)
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 0.6 + (i / 5) * Math.PI * 0.8;
      const len = (40 + rand() * 50) * scale;
      branches.push({
        x1: cx, y1: cy,
        x2: cx + Math.cos(a) * len, y2: cy + Math.sin(a) * len,
        width: (1 + rand() * 2) * scale,
      });
    }
    // Axon (right)
    const axonLen = 120 * scale;
    branches.push({ x1: cx, y1: cy, x2: cx + axonLen, y2: cy + 10 * scale, width: 2.5 * scale });
    // Axon branches
    for (let i = 0; i < 3; i++) {
      const bx = cx + axonLen;
      const by = cy + 10 * scale;
      const a = -Math.PI * 0.3 + (i / 2) * Math.PI * 0.6;
      const len = (25 + rand() * 30) * scale;
      branches.push({ x1: bx, y1: by, x2: bx + Math.cos(a) * len, y2: by + Math.sin(a) * len, width: 1.5 * scale });
    }
    return { particles, branches, cx, cy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const { cx, cy, branches } = data;
    // Morph from 2D flat circles to 3D neuron
    const morphT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Before morph: show stacked flat blobs
    if (morphT < 1) {
      const flatAlpha = 1 - morphT;
      ctx.globalAlpha = alpha * flatAlpha;
      for (let s = 0; s < 3; s++) {
        const sy = cy - 30 * scale + s * 30 * scale;
        ctx.fillStyle = `hsla(220, 55%, 60%, 0.4)`;
        ctx.beginPath();
        ctx.ellipse(cx, sy, 20 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // After morph: 3D neuron
    ctx.globalAlpha = alpha * morphT;

    // Branches
    for (const b of branches) {
      ctx.strokeStyle = `hsla(220, 55%, 60%, 0.7)`;
      ctx.lineWidth = b.width;
      ctx.lineCap = "round";
      // Grow along branch
      const bProgress = interpolate(morphT, [0.2, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x1 + (b.x2 - b.x1) * bProgress, b.y1 + (b.y2 - b.y1) * bProgress);
      ctx.stroke();
    }

    // Cell body
    const bodyGrad = ctx.createRadialGradient(cx - 3 * scale, cy - 3 * scale, 0, cx, cy, 18 * scale);
    bodyGrad.addColorStop(0, `hsla(220, 60%, 72%, ${morphT})`);
    bodyGrad.addColorStop(1, `hsla(220, 55%, 55%, ${morphT * 0.8})`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Rotation hint (subtle wobble)
    const rot = Math.sin(frame * 0.02) * 0.03;
    ctx.globalAlpha = alpha * morphT * 0.2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.strokeStyle = `hsla(220, 55%, 65%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
