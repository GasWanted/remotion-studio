import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 22 — Segmentation scan colorizing blobs left to right (5s = 150 frames)
export const Scene022: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2222);
    const particles = makeParticles(25, width, height, scale);
    const cx = width / 2, cy = height * 0.48;
    const blobs: { x: number; y: number; r: number; gray: number; hue: number }[] = [];
    for (let i = 0; i < 60; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.pow(rand(), 0.5) * 150 * scale;
      blobs.push({
        x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d,
        r: (5 + rand() * 10) * scale,
        gray: 40 + rand() * 45,
        hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
      });
    }
    return { particles, blobs, cx, cy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Scan line sweeps left to right
    const scanX = interpolate(frame, [15, 110], [width * 0.15, width * 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw blobs — colored if scan line has passed, gray if not
    for (const b of data.blobs) {
      const colored = b.x < scanX;
      if (colored) {
        ctx.fillStyle = `hsla(${b.hue}, 55%, 60%, 0.8)`;
      } else {
        const g = Math.round(b.gray);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g + 10}, 0.7)`;
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      if (colored) {
        ctx.strokeStyle = `hsla(${b.hue}, 45%, 50%, 0.5)`;
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
      }
    }

    // Scan line
    ctx.strokeStyle = `hsla(180, 60%, 70%, 0.6)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(scanX, height * 0.15);
    ctx.lineTo(scanX, height * 0.82);
    ctx.stroke();
    // Glow
    const lineGlow = ctx.createLinearGradient(scanX - 8 * scale, 0, scanX + 8 * scale, 0);
    lineGlow.addColorStop(0, `hsla(180, 60%, 70%, 0)`);
    lineGlow.addColorStop(0.5, `hsla(180, 60%, 70%, 0.1)`);
    lineGlow.addColorStop(1, `hsla(180, 60%, 70%, 0)`);
    ctx.fillStyle = lineGlow;
    ctx.fillRect(scanX - 8 * scale, height * 0.15, 16 * scale, height * 0.67);

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("colored", scanX - 50 * scale, height * 0.88);
    ctx.fillText("raw", scanX + 50 * scale, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
