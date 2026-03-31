import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const ProofreadFix: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const segments = useMemo(() => {
    const rand = seeded(707);
    const items: {
      x: number;
      y: number;
      w: number;
      h: number;
      hue: number;
      fixFrame: number;
      branches: { dx: number; dy: number; len: number }[];
    }[] = [];
    const totalErrors = 8;
    const cols = 4;
    const rows = 2;
    for (let i = 0; i < totalErrors; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellW = width / cols;
      const cellH = (height - 30 * scale) / rows;
      // Stagger fix times across the animation
      const fixFrame = 20 + i * 13;
      const branches: { dx: number; dy: number; len: number }[] = [];
      for (let b = 0; b < 3 + Math.floor(rand() * 4); b++) {
        branches.push({
          dx: (rand() - 0.5) * 2,
          dy: (rand() - 0.5) * 2,
          len: 15 + rand() * 25,
        });
      }
      items.push({
        x: cellW * (col + 0.5),
        y: cellH * (row + 0.5) + 10 * scale,
        w: cellW * 0.7,
        h: cellH * 0.6,
        hue: Math.floor(rand() * 360),
        fixFrame,
        branches,
      });
    }
    return items;
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    let fixedCount = 0;

    for (const seg of segments) {
      const isFixed = frame >= seg.fixFrame + 10;
      const isFixing = frame >= seg.fixFrame && frame < seg.fixFrame + 10;
      const fixProgress = isFixing
        ? interpolate(frame, [seg.fixFrame, seg.fixFrame + 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          })
        : isFixed
        ? 1
        : 0;

      if (isFixed) fixedCount++;

      // Segment body (neuron fragment)
      const hue = seg.hue;
      const sat = isFixed ? 70 : 40;
      const lum = isFixed ? 55 : 35;
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lum}%, 0.7)`;
      ctx.beginPath();
      ctx.ellipse(seg.x, seg.y, seg.w * 0.25, seg.h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Branches
      for (const br of seg.branches) {
        const bx = seg.x + br.dx * br.len * scale * 0.4;
        const by = seg.y + br.dy * br.len * scale * 0.4;
        ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${lum}%, 0.5)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Error marker (red X) or fixed marker (green check)
      const markerX = seg.x + seg.w * 0.25 + 5 * scale;
      const markerY = seg.y - seg.h * 0.15;
      const markerSize = 7 * scale;

      if (fixProgress < 1) {
        // Red X — fading out during fix
        const xAlpha = 1 - fixProgress;
        ctx.strokeStyle = `rgba(255, 60, 60, ${0.9 * xAlpha})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(markerX - markerSize, markerY - markerSize);
        ctx.lineTo(markerX + markerSize, markerY + markerSize);
        ctx.moveTo(markerX + markerSize, markerY - markerSize);
        ctx.lineTo(markerX - markerSize, markerY + markerSize);
        ctx.stroke();
      }

      if (fixProgress > 0) {
        // Green checkmark — fading in
        ctx.strokeStyle = `rgba(60, 220, 100, ${0.9 * fixProgress})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.moveTo(markerX - markerSize * 0.6, markerY);
        ctx.lineTo(markerX - markerSize * 0.1, markerY + markerSize * 0.6);
        ctx.lineTo(markerX + markerSize * 0.8, markerY - markerSize * 0.5);
        ctx.stroke();

        // Flash on fix
        if (isFixing) {
          const flashAlpha = interpolate(fixProgress, [0, 0.3, 1], [0, 0.3, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          ctx.fillStyle = `rgba(60, 220, 100, ${flashAlpha})`;
          ctx.beginPath();
          ctx.arc(seg.x, seg.y, 30 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Progress counter
    ctx.globalAlpha = fadeOut * 0.6;
    ctx.fillStyle = "#aaa";
    ctx.font = `${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(
      `${fixedCount} / ${segments.length} proofread`,
      width / 2,
      height - 12 * scale
    );
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
