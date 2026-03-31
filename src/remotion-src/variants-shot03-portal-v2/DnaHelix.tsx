import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { C, drawDotGrid, accent } from "./portal-v2-utils";

/**
 * DNA Helix: Two helical strands (blue + orange) rotate around a
 * vertical axis. Scientists appear along each strand with 3D depth.
 */
export const DnaHelix: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const helixData = useMemo(() => {
    const cx = width / 2;
    const topY = height * 0.12, botY = height * 0.88;
    const dotsPerStrand = 105;
    const helixRadius = 45 * scale;
    const vertSpacing = (botY - topY) / dotsPerStrand;

    const dots: { strand: number; idx: number; baseAngle: number; y: number }[] = [];
    for (let strand = 0; strand < 2; strand++) {
      for (let i = 0; i < dotsPerStrand; i++) {
        dots.push({
          strand,
          idx: i,
          baseAngle: (i / dotsPerStrand) * Math.PI * 6 + strand * Math.PI,
          y: topY + i * vertSpacing,
        });
      }
    }
    return { dots, cx, helixRadius, dotsPerStrand };
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
    ctx.fillText("2024", width / 2, height * 0.04);
    ctx.fillStyle = C.textDim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("intertwined research", width / 2, height * 0.09);
    ctx.globalAlpha = fadeOut;

    const rotSpeed = 0.025;
    const growT = interpolate(frame, [5, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(growT * helixData.dotsPerStrand);

    // Sort by depth for proper overlap
    const renderList: { x: number; y: number; depth: number; strand: number; r: number; alpha: number }[] = [];

    for (const dot of helixData.dots) {
      if (dot.idx >= visibleCount) continue;
      const angle = dot.baseAngle + frame * rotSpeed;
      const depth = Math.sin(angle); // -1 (back) to 1 (front)
      const x = helixData.cx + Math.cos(angle) * helixData.helixRadius;

      renderList.push({
        x, y: dot.y, depth, strand: dot.strand,
        r: (1.5 + depth * 0.8) * scale,
        alpha: 0.35 + depth * 0.55,
      });
    }

    // Draw back-to-front
    renderList.sort((a, b) => a.depth - b.depth);

    // Connecting rungs (between strands at same height)
    for (let i = 0; i < visibleCount; i++) {
      const s0 = helixData.dots[i]; // strand 0
      const s1 = helixData.dots[helixData.dotsPerStrand + i]; // strand 1
      const a0 = s0.baseAngle + frame * rotSpeed;
      const a1 = s1.baseAngle + frame * rotSpeed;
      const x0 = helixData.cx + Math.cos(a0) * helixData.helixRadius;
      const x1 = helixData.cx + Math.cos(a1) * helixData.helixRadius;

      if (i % 4 === 0) {
        const midDepth = (Math.sin(a0) + Math.sin(a1)) / 2;
        ctx.globalAlpha = (0.2 + midDepth * 0.15) * fadeOut;
        ctx.strokeStyle = C.gray;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(x0, s0.y);
        ctx.lineTo(x1, s1.y);
        ctx.stroke();
      }
    }

    // Dots
    for (const d of renderList) {
      ctx.globalAlpha = d.alpha * fadeOut;

      // Glow
      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3);
      g.addColorStop(0, accent(d.strand, 0.12));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      ctx.beginPath(); ctx.arc(d.x + 0.5, d.y + 0.5, d.r, 0, Math.PI * 2); ctx.fill();

      // Core
      ctx.fillStyle = accent(d.strand, 0.85);
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();

      // Highlight
      if (d.depth > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(d.x - d.r * 0.2, d.y - d.r * 0.2, d.r * 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Counter
    ctx.globalAlpha = fadeOut;
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
