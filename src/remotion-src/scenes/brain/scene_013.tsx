import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 13 — Electron beam can only photograph thin section (4s = 120 frames)
export const Scene013: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width * 0.4, cy = height / 2;

    // Electron beam column
    const beamAlpha = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * beamAlpha;
    ctx.strokeStyle = `hsla(180, 60%, 60%, 0.6)`;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 120 * scale);
    ctx.lineTo(cx, cy + 120 * scale);
    ctx.stroke();

    // Beam glow
    const beamGrad = ctx.createLinearGradient(cx - 10 * scale, cy, cx + 10 * scale, cy);
    beamGrad.addColorStop(0, `hsla(180, 60%, 60%, 0)`);
    beamGrad.addColorStop(0.5, `hsla(180, 60%, 70%, 0.15)`);
    beamGrad.addColorStop(1, `hsla(180, 60%, 60%, 0)`);
    ctx.fillStyle = beamGrad;
    ctx.fillRect(cx - 10 * scale, cy - 120 * scale, 20 * scale, 240 * scale);

    // Thin section (horizontal line crossing beam)
    const sliceAlpha = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * sliceAlpha;
    ctx.fillStyle = `hsla(50, 60%, 65%, 0.7)`;
    ctx.fillRect(cx - 60 * scale, cy - 1.5 * scale, 120 * scale, 3 * scale);
    // Glow on slice where beam hits
    const hitGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * scale);
    hitGlow.addColorStop(0, `hsla(50, 70%, 75%, ${0.3 + Math.sin(frame * 0.1) * 0.1})`);
    hitGlow.addColorStop(1, `hsla(50, 70%, 75%, 0)`);
    ctx.fillStyle = hitGlow;
    ctx.fillRect(cx - 30 * scale, cy - 30 * scale, 60 * scale, 60 * scale);

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("thin section", cx, cy + 15 * scale);

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.fillText("electron beam", cx, cy - 130 * scale);
    ctx.fillText("▼ detector", cx, cy + 140 * scale);

    // Whole brain (right side, opaque)
    ctx.globalAlpha = alpha;
    const brainX = width * 0.72, brainY = cy;
    const brainAlpha = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * brainAlpha;
    ctx.fillStyle = `hsla(280, 25%, 30%, 0.6)`;
    ctx.beginPath();
    ctx.ellipse(brainX, brainY, 50 * scale, 40 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(280, 30%, 45%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.fillText("whole brain", brainX, brainY + 55 * scale);
    ctx.fillText("(opaque)", brainX, brainY + 70 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
