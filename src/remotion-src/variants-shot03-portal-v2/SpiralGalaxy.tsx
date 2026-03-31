import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Spiral Galaxy: Two Archimedean spiral arms (blue + orange) grow
 * from center outward. Scientists bloom along each arm.
 */
export const SpiralGalaxy: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(5101);
    const cx = width / 2, cy = height * 0.52;
    const perArm = 105;
    const dots: { x: number; y: number; arm: number; idx: number }[] = [];

    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < perArm; i++) {
        const angle = i * 0.32 + arm * Math.PI;
        const r = (4 + i * 1.2) * scale;
        const wobble = (rand() - 0.5) * 6 * scale;
        dots.push({
          x: cx + Math.cos(angle) * r + wobble,
          y: cy + Math.sin(angle) * r * 0.65 + (rand() - 0.5) * 4 * scale,
          arm,
          idx: i,
        });
      }
    }
    return { dots, cx, cy, perArm };
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
    ctx.fillText("research collaboration", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Spiral growth
    const growT = interpolate(frame, [8, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visiblePerArm = Math.floor(growT * data.perArm);
    let totalVisible = 0;

    // Faint spiral path
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let i = 0; i < visiblePerArm; i++) {
        const dot = data.dots[arm * data.perArm + i];
        if (i === 0) ctx.moveTo(dot.x, dot.y);
        else ctx.lineTo(dot.x, dot.y);
      }
      ctx.strokeStyle = arm === 0 ? "rgba(64,144,255,0.08)" : "rgba(255,140,0,0.08)";
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
    }

    // Dots
    for (let arm = 0; arm < 2; arm++) {
      for (let i = 0; i < visiblePerArm; i++) {
        const dot = data.dots[arm * data.perArm + i];
        const age = (visiblePerArm - i) / 8;
        const t = easeOutBack(Math.min(1, age));
        if (t < 0.01) continue;
        totalVisible++;

        ctx.globalAlpha = Math.min(1, age) * fadeOut;
        const r = (1.5 + (1 - i / data.perArm) * 1.5) * scale * t;

        // Glow
        const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, r * 3.5);
        g.addColorStop(0, accent(arm, 0.14));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, r * 3.5, 0, Math.PI * 2); ctx.fill();

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath(); ctx.arc(dot.x + 1, dot.y + 1, r, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = accent(arm, 0.85);
        ctx.beginPath(); ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2); ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(dot.x - r * 0.25, dot.y - r * 0.25, r * 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Center hub
    ctx.globalAlpha = fadeOut;
    const hubR = 5 * scale;
    const hg = ctx.createRadialGradient(data.cx - hubR * 0.2, data.cy - hubR * 0.2, 0, data.cx, data.cy, hubR);
    hg.addColorStop(0, "rgba(255,255,255,0.6)");
    hg.addColorStop(0.5, C.blue);
    hg.addColorStop(1, C.blueDark);
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(data.cx, data.cy, hubR, 0, Math.PI * 2); ctx.fill();

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
