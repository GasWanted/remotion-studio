import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, accent } from "./portal-utils";

/**
 * Stream Converge: Multiple particle streams from the edges flow inward,
 * converging at center. Scientists accumulate as the streams merge.
 * Blue streams from left/top, orange from right/bottom.
 */
export const ApertureTerminal: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const streams = useMemo(() => {
    const rand = seeded(5002);
    const cx = width / 2, cy = height / 2;
    const particles: { sx: number; sy: number; speed: number; size: number; stream: number; offset: number }[] = [];

    // 6 streams from different directions
    const origins = [
      { x: 0, y: cy * 0.6 },
      { x: 0, y: cy * 1.4 },
      { x: width, y: cy * 0.6 },
      { x: width, y: cy * 1.4 },
      { x: cx * 0.6, y: 0 },
      { x: cx * 1.4, y: height },
    ];

    for (let s = 0; s < origins.length; s++) {
      for (let i = 0; i < 25; i++) {
        particles.push({
          sx: origins[s].x + (rand() - 0.5) * 30 * scale,
          sy: origins[s].y + (rand() - 0.5) * 30 * scale,
          speed: 0.6 + rand() * 0.6,
          size: (1 + rand() * 2) * scale,
          stream: s,
          offset: i * 3 + rand() * 5,
        });
      }
    }
    return { particles, cx, cy };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle radial gradient toward center
    const cg = ctx.createRadialGradient(streams.cx, streams.cy, 0, streams.cx, streams.cy, width * 0.5);
    cg.addColorStop(0, "rgba(64,144,255,0.03)");
    cg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.08);
    ctx.globalAlpha = fadeOut;

    // Particles streaming toward center
    let arrivedCount = 0;
    const { cx, cy } = streams;

    for (const p of streams.particles) {
      const t = ((frame - p.offset) * p.speed * 0.012);
      if (t < 0 || t > 1.2) continue;
      const clampedT = Math.min(t, 1);

      // Cubic ease-in toward center
      const eased = 1 - Math.pow(1 - clampedT, 3);
      const px = p.sx + (cx - p.sx) * eased;
      const py = p.sy + (cy - p.sy) * eased;

      if (clampedT >= 0.95) arrivedCount++;

      // Trail
      if (clampedT > 0.05 && clampedT < 0.95) {
        const prevT = Math.max(0, clampedT - 0.06);
        const prevEased = 1 - Math.pow(1 - prevT, 3);
        const prevX = p.sx + (cx - p.sx) * prevEased;
        const prevY = p.sy + (cy - p.sy) * prevEased;

        const trailGrad = ctx.createLinearGradient(prevX, prevY, px, py);
        trailGrad.addColorStop(0, accent(p.stream, 0));
        trailGrad.addColorStop(1, accent(p.stream, 0.25));
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = p.size * 0.8;
        ctx.beginPath(); ctx.moveTo(prevX, prevY); ctx.lineTo(px, py); ctx.stroke();
      }

      // Particle glow
      const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3);
      glow.addColorStop(0, accent(p.stream, 0.15));
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(px, py, p.size * 3, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(p.stream, 0.9);
      ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();

      // Bright center
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath(); ctx.arc(px, py, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // Center accumulation glow (grows with arrivals)
    const accumT = interpolate(frame, [15, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const accumR = accumT * 25 * scale;
    if (accumR > 1) {
      // Outer glow
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, accumR * 3);
      ag.addColorStop(0, `rgba(64,144,255,${accumT * 0.15})`);
      ag.addColorStop(0.5, `rgba(255,140,0,${accumT * 0.08})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.beginPath(); ctx.arc(cx, cy, accumR * 3, 0, Math.PI * 2); ctx.fill();

      // Core sphere
      const coreGrad = ctx.createRadialGradient(cx - accumR * 0.2, cy - accumR * 0.2, 0, cx, cy, accumR);
      coreGrad.addColorStop(0, "rgba(255,255,255,0.6)");
      coreGrad.addColorStop(0.4, `rgba(64,144,255,${accumT * 0.5})`);
      coreGrad.addColorStop(1, `rgba(255,140,0,${accumT * 0.3})`);
      ctx.fillStyle = coreGrad;
      ctx.beginPath(); ctx.arc(cx, cy, accumR, 0, Math.PI * 2); ctx.fill();

      // Specular
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(cx - accumR * 0.3, cy - accumR * 0.3, accumR * 0.3, accumR * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    const count = Math.min(200, Math.floor(accumT * 200));
    ctx.fillText(`${count}+ scientists`, width / 2, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
