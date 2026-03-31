import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Target Lock: Concentric rings expand from center — each ring fills
 * with evenly-spaced scientists. Bullseye/radar targeting aesthetic.
 * Blue/orange alternating rings.
 */
export const TargetLock: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const cx = width / 2, cy = height * 0.52;
    const ringCount = 10;
    const rings: { ringIdx: number; dots: { x: number; y: number }[] }[] = [];

    let total = 0;
    for (let ring = 0; ring < ringCount && total < 210; ring++) {
      const r = (12 + ring * 14) * scale;
      const circumference = 2 * Math.PI * r;
      const count = ring === 0 ? 1 : Math.min(Math.floor(circumference / (8 * scale)), 210 - total);
      const dots: { x: number; y: number }[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
        dots.push({
          x: cx + Math.cos(angle) * r,
          y: cy + Math.sin(angle) * r * 0.7,
        });
      }
      rings.push({ ringIdx: ring, dots });
      total += count;
    }

    return { rings, cx, cy, ringCount, total };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    drawDotGrid(ctx, width, height, scale);
    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("convergence point", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Crosshair lines (faint)
    ctx.strokeStyle = "rgba(160,160,180,0.08)";
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(data.cx, height * 0.2); ctx.lineTo(data.cx, height * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width * 0.1, data.cy); ctx.lineTo(width * 0.9, data.cy); ctx.stroke();

    const growT = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    let cumulativeCount = 0;
    const r = 2.2 * scale;

    for (const ring of data.rings) {
      const ringRevealT = interpolate(
        growT * data.ringCount,
        [ring.ringIdx, ring.ringIdx + 1.5],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      if (ringRevealT <= 0) continue;

      // Ring circle guide (faint)
      const ringR = (12 + ring.ringIdx * 14) * scale;
      ctx.globalAlpha = 0.06 * fadeOut;
      ctx.strokeStyle = accent(ring.ringIdx, 0.5);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(data.cx, data.cy, ringR, ringR * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Dots on this ring
      const visibleOnRing = Math.floor(ringRevealT * ring.dots.length);
      for (let i = 0; i < visibleOnRing; i++) {
        const dot = ring.dots[i];
        cumulativeCount++;
        const age = (visibleOnRing - i) / 5;
        const t = easeOutBack(Math.min(1, age));
        if (t < 0.01) continue;

        ctx.globalAlpha = Math.min(1, age) * fadeOut;
        const dotR = r * t;

        // Glow
        const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR * 3.5);
        g.addColorStop(0, accent(ring.ringIdx, 0.14));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 3.5, 0, Math.PI * 2); ctx.fill();

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath(); ctx.arc(dot.x + 0.5, dot.y + 0.5, dotR, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = accent(ring.ringIdx, 0.85);
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2); ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(dot.x - dotR * 0.2, dot.y - dotR * 0.2, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Center dot (pulsing)
    ctx.globalAlpha = fadeOut;
    const pulse = 0.8 + Math.sin(frame * 0.1) * 0.2;
    ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(data.cx, data.cy, 4 * scale * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.arc(data.cx - 1, data.cy - 1, 1.5 * scale, 0, Math.PI * 2); ctx.fill();

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(200, Math.floor(growT * 200))}+`, width * 0.92, height * 0.94);
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("scientists", width * 0.92, height * 0.97);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
