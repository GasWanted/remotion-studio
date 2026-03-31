import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 28 — Rapid fix montage: click-fix-click-fix rhythm (4s = 120 frames)
export const Scene028: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2828);
    const particles = makeParticles(25, width, height, scale);
    // 4 fix operations, each takes ~25 frames
    const fixes = [
      { x: width * 0.25, y: height * 0.35, type: "merge", hueA: 220, hueB: 140 },
      { x: width * 0.75, y: height * 0.35, type: "split", hueA: 350, hueB: 350 },
      { x: width * 0.25, y: height * 0.65, type: "merge", hueA: 55, hueB: 180 },
      { x: width * 0.75, y: height * 0.65, type: "confirm", hueA: 280, hueB: 280 },
    ];
    return { particles, fixes };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    for (let i = 0; i < data.fixes.length; i++) {
      const fix = data.fixes[i];
      const startFrame = i * 25 + 5;
      const localFrame = frame - startFrame;
      if (localFrame < 0) continue;

      const fixT = interpolate(localFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Before: two separate colored blobs
      const blobSpacing = 20 * scale;
      if (fix.type === "merge") {
        const mergedHue = fix.hueA;
        const h2 = interpolate(fixT, [0, 1], [fix.hueB, mergedHue], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `hsla(${fix.hueA}, 55%, 58%, 0.8)`;
        ctx.beginPath();
        ctx.arc(fix.x - blobSpacing, fix.y, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${h2}, 55%, 58%, 0.8)`;
        ctx.beginPath();
        ctx.arc(fix.x + blobSpacing, fix.y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `hsla(${fix.hueA}, 55%, 58%, 0.8)`;
        ctx.beginPath();
        ctx.arc(fix.x, fix.y, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // Check mark when done
      if (fixT >= 1) {
        ctx.fillStyle = PALETTE.accent.green;
        ctx.font = `bold ${18 * scale}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("✓", fix.x, fix.y + 25 * scale);
      }

      // Click flash
      if (localFrame > 5 && localFrame < 12) {
        const flash = (12 - localFrame) / 7;
        ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.3})`;
        ctx.beginPath();
        ctx.arc(fix.x, fix.y, 20 * scale * flash, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
