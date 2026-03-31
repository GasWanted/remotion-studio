import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { C, drawDotGrid, accent } from "./portal-utils";

/**
 * Pulse Rings: Central point emits expanding concentric rings.
 * Scientists appear where the pulse wave passes. Sonar/radar feel.
 * Blue rings on white, orange dots for scientists.
 */
export const ConveyorLine: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    drawDotGrid(ctx, width, height, scale);

    ctx.globalAlpha = fadeOut;

    const cx = width / 2, cy = height * 0.52;
    const maxR = Math.max(width, height) * 0.6;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);
    ctx.globalAlpha = fadeOut;

    // Expanding pulse rings (multiple waves)
    const waveCount = 5;
    const waveSpacing = 35;
    let totalRevealed = 0;

    for (let w = 0; w < waveCount; w++) {
      const waveT = interpolate(frame - w * waveSpacing, [0, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (waveT <= 0) continue;

      const radius = waveT * maxR;
      const ringAlpha = (1 - waveT) * 0.4;

      // Ring glow
      if (ringAlpha > 0.01) {
        ctx.strokeStyle = `rgba(64,144,255,${ringAlpha})`;
        ctx.lineWidth = 3 * scale * (1 - waveT);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Wider faint glow
        ctx.strokeStyle = `rgba(64,144,255,${ringAlpha * 0.3})`;
        ctx.lineWidth = 8 * scale * (1 - waveT);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scientists revealed on this ring
      const ringCount = Math.floor(6 + w * 8);
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2 + w * 0.3;
        const r = radius * (0.6 + (i / ringCount) * 0.4);
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r * 0.7;

        if (px < 5 || px > width - 5 || py < 5 || py > height - 5) continue;

        const revealT = interpolate(waveT, [(i / ringCount) * 0.5, (i / ringCount) * 0.5 + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (revealT <= 0) continue;

        totalRevealed++;
        ctx.globalAlpha = revealT * fadeOut;
        const dotR = (2 + (1 - waveT) * 1.5) * scale * Math.min(1, revealT * 2);

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3);
        g.addColorStop(0, accent(w + i, 0.15));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, dotR * 3, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = accent(w + i, 0.85);
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI * 2); ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath(); ctx.arc(px - dotR * 0.2, py - dotR * 0.25, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Central emitter
    ctx.globalAlpha = fadeOut;
    const emitPulse = 0.7 + Math.sin(frame * 0.15) * 0.3;
    const emitR = 6 * scale * emitPulse;

    const eg = ctx.createRadialGradient(cx, cy, 0, cx, cy, emitR * 3);
    eg.addColorStop(0, "rgba(64,144,255,0.25)");
    eg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.arc(cx, cy, emitR * 3, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(cx, cy, emitR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.arc(cx - emitR * 0.2, cy - emitR * 0.2, emitR * 0.35, 0, Math.PI * 2); ctx.fill();

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const count = Math.min(200, totalRevealed);
    ctx.fillText(`${count}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
