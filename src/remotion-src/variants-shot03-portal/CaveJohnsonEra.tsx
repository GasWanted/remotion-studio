import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, accent } from "./portal-utils";

/**
 * Wave Field: Dense field of dots that ripple outward in waves.
 * Color propagates from center — blue wave front, orange behind.
 * Calm, mesmerizing, shows scale. Clean white bg.
 */
export const CaveJohnsonEra: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const dots = useMemo(() => {
    const spacing = 14 * scale;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);
    const cx = width / 2, cy = height / 2;
    const list: { x: number; y: number; dist: number; baseY: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing + spacing / 2;
        const y = r * spacing + spacing / 2;
        const dx = x - cx, dy = y - cy;
        list.push({ x, y, dist: Math.sqrt(dx * dx + dy * dy), baseY: y });
      }
    }
    return { list, spacing, cx, cy };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    const maxDist = Math.max(width, height) * 0.7;

    // Wave front position (expands outward)
    const waveT = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const waveFront = waveT * maxDist;
    const waveWidth = 60 * scale;

    let activatedCount = 0;

    for (const dot of dots.list) {
      // Wave displacement
      const distFromWave = dot.dist - waveFront;
      const inWave = distFromWave > -waveWidth * 3 && distFromWave < waveWidth;

      // Ripple displacement (sine wave traveling outward)
      let yOffset = 0;
      let dotAlpha = 0.08; // base dormant alpha
      let dotR = 1.2 * scale;
      let isActivated = false;

      if (dot.dist < waveFront) {
        isActivated = true;
        activatedCount++;

        // Post-wave: settled, slightly elevated
        const settleT = Math.min(1, (waveFront - dot.dist) / (waveWidth * 2));
        dotAlpha = 0.15 + settleT * 0.65;
        dotR = (1.2 + settleT * 1.3) * scale;

        // Residual ripple (dampened oscillation)
        const rippleAge = (waveFront - dot.dist) / maxDist;
        yOffset = Math.sin(dot.dist * 0.03 - frame * 0.06) * 3 * scale * Math.max(0, 1 - rippleAge * 3);
      }

      if (inWave && distFromWave > 0) {
        // Wave front: big displacement
        const wavePos = 1 - distFromWave / waveWidth;
        yOffset = Math.sin(wavePos * Math.PI) * 8 * scale;
        dotAlpha = 0.3 + wavePos * 0.5;
        dotR = (1.5 + wavePos * 1.5) * scale;
      }

      // Choose color: wave front = blue, settled = mixed
      let color: string;
      if (inWave && distFromWave > 0) {
        color = C.blue;
      } else if (isActivated) {
        // Alternate based on position
        const idx = Math.floor(dot.x / (14 * scale)) + Math.floor(dot.y / (14 * scale));
        color = idx % 3 === 0 ? C.orange : C.blue;
      } else {
        color = C.gray;
      }

      ctx.globalAlpha = dotAlpha * fadeOut;

      // Shadow for elevated dots
      if (yOffset < -1) {
        ctx.fillStyle = "rgba(0,0,0,0.04)";
        ctx.beginPath();
        ctx.arc(dot.x + 0.5, dot.baseY + 0.5, dotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Glow for wave-front dots
      if (inWave && distFromWave > 0) {
        const g = ctx.createRadialGradient(dot.x, dot.baseY + yOffset, 0, dot.x, dot.baseY + yOffset, dotR * 3);
        g.addColorStop(0, "rgba(64,144,255,0.15)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(dot.x, dot.baseY + yOffset, dotR * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core dot
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dot.x, dot.baseY + yOffset, dotR, 0, Math.PI * 2);
      ctx.fill();

      // Highlight on bigger dots
      if (dotR > 2 * scale) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.arc(dot.x - dotR * 0.2, dot.baseY + yOffset - dotR * 0.2, dotR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Header (on top of dots)
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const count = Math.min(200, Math.floor(waveT * 200));
    ctx.fillText(`${count}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
