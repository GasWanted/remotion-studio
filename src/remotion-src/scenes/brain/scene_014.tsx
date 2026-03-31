import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 14 — Brain drops into fixative beaker (4s = 120 frames)
export const Scene014: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, beakerY = height * 0.55;
    const beakerW = 80 * scale, beakerH = 100 * scale;

    // Beaker
    ctx.strokeStyle = `hsla(200, 30%, 65%, 0.6)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - beakerW, beakerY - beakerH / 2);
    ctx.lineTo(cx - beakerW * 0.8, beakerY + beakerH / 2);
    ctx.lineTo(cx + beakerW * 0.8, beakerY + beakerH / 2);
    ctx.lineTo(cx + beakerW, beakerY - beakerH / 2);
    ctx.stroke();

    // Liquid inside
    const liquidTop = beakerY - beakerH * 0.1;
    ctx.fillStyle = `hsla(180, 40%, 45%, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(cx - beakerW * 0.9, liquidTop);
    ctx.lineTo(cx - beakerW * 0.8, beakerY + beakerH / 2);
    ctx.lineTo(cx + beakerW * 0.8, beakerY + beakerH / 2);
    ctx.lineTo(cx + beakerW * 0.9, liquidTop);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("fixative", cx, beakerY + beakerH / 2 + 25 * scale);

    // Brain dropping in
    const dropProgress = interpolate(frame, [15, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainY = interpolate(dropProgress, [0, 1], [height * 0.15, beakerY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Color shifts from pink to grey as it enters liquid
    const fixedT = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainHue = interpolate(fixedT, [0, 1], [340, 250], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainSat = interpolate(fixedT, [0, 1], [50, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainLit = interpolate(fixedT, [0, 1], [55, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, 20 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.1)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, 35 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
