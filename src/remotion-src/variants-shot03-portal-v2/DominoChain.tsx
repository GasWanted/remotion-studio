import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawDotGrid, easeOutBack, accent } from "./portal-v2-utils";

/**
 * Domino Chain: Scientists sit in a grid, dormant gray. One activates
 * at center, triggering neighbors in a cascading chain reaction.
 * Blue/orange activation wave front spreads organically.
 */
export const DominoChain: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(5106);
    const cols = 16, rows = 13;
    const cellW = (width * 0.7) / cols, cellH = (height * 0.5) / rows;
    const startX = width * 0.15, startY = height * 0.3;
    const cx = cols / 2, cy = rows / 2;
    const list: { x: number; y: number; dist: number; idx: number }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (list.length >= 208) break;
        // Distance from grid center (with slight randomness for organic spread)
        const dx = c - cx, dy = r - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) + rand() * 1.5;
        list.push({
          x: startX + c * cellW + cellW / 2,
          y: startY + r * cellH + cellH / 2,
          dist,
          idx: list.length,
        });
      }
    }

    // Sort by distance so we can animate the wave front
    const maxDist = Math.max(...list.map(d => d.dist));
    return { list, cellW, cellH, maxDist };
  }, [width, height]);

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
    ctx.fillText("chain reaction", width / 2, height * 0.13);
    ctx.globalAlpha = fadeOut;

    // Activation wave front
    const waveT = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const waveFront = waveT * data.maxDist;
    const r = Math.min(data.cellW, data.cellH) * 0.17;

    let activatedCount = 0;

    for (const dot of data.list) {
      const isActivated = dot.dist < waveFront;
      const activationT = isActivated
        ? Math.min(1, (waveFront - dot.dist) / 3)
        : 0;
      const isWaveFront = dot.dist > waveFront - 2.5 && dot.dist < waveFront + 0.5;

      ctx.globalAlpha = fadeOut;

      if (isActivated) {
        activatedCount++;
        const t = easeOutBack(Math.min(1, activationT));
        const dotR = r * (0.6 + t * 0.5);

        // Activated glow
        const g = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, dotR * 3.5);
        g.addColorStop(0, accent(dot.idx, 0.15));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 3.5, 0, Math.PI * 2); ctx.fill();

        // Wave front flash
        if (isWaveFront) {
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR * 5, 0, Math.PI * 2); ctx.fill();
        }

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.beginPath(); ctx.arc(dot.x + 1, dot.y + 1, dotR, 0, Math.PI * 2); ctx.fill();

        // Core (blue/orange)
        ctx.fillStyle = accent(dot.idx, 0.85);
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dotR, 0, Math.PI * 2); ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(dot.x - dotR * 0.2, dot.y - dotR * 0.2, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
      } else {
        // Dormant dot (gray)
        ctx.fillStyle = C.gray;
        ctx.globalAlpha = 0.25 * fadeOut;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, r * 0.5, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(200, activatedCount)}+`, width * 0.92, height * 0.94);
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
