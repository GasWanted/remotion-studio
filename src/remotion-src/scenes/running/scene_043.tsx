import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 43 — Bio network morphs to digital, terminal loads (5s = 150 frames)
export const Scene043: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(4343);
    const particles = makeParticles(25, width, height, scale);
    const cx = width / 2, cy = height * 0.42;
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * 100 * scale;
      nodes.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0] });
    }
    return { particles, nodes };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Morph: organic (curved, colored) → digital (grid-snapped, monochrome)
    const morphT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sat = interpolate(morphT, [0, 1], [50, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const n of data.nodes) {
      // Snap to grid as morphT increases
      const gridSize = 20 * scale;
      const gx = Math.round(n.x / gridSize) * gridSize;
      const gy = Math.round(n.y / gridSize) * gridSize;
      const x = n.x + (gx - n.x) * morphT;
      const y = n.y + (gy - n.y) * morphT;
      const hue = interpolate(morphT, [0, 1], [n.hue, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      ctx.fillStyle = `hsla(${hue}, ${sat}%, 55%, 0.6)`;
      ctx.beginPath();
      const r = interpolate(morphT, [0, 1], [3.5, 2.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scale;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Terminal text (bottom)
    const termY = height * 0.72;
    const termAlpha = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * termAlpha;

    ctx.fillStyle = `rgba(15, 12, 22, 0.8)`;
    ctx.fillRect(width * 0.2, termY, width * 0.6, 70 * scale);
    ctx.strokeStyle = `hsla(180, 30%, 40%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(width * 0.2, termY, width * 0.6, 70 * scale);

    const lines = [
      "Loading connectome...",
      "138,639 neurons...",
      "15,091,983 synapses...",
    ];
    ctx.fillStyle = `hsla(140, 50%, 65%, 0.8)`;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "left";
    for (let i = 0; i < lines.length; i++) {
      const lineFrame = 60 + i * 15;
      const chars = Math.floor(interpolate(frame, [lineFrame, lineFrame + 12], [0, lines[i].length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      if (chars > 0) {
        ctx.fillText(lines[i].slice(0, chars), width * 0.22 + 5 * scale, termY + 18 * scale + i * 18 * scale);
      }
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
