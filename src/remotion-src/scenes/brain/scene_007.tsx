import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 07 — Poppy seed vs fly brain side by side (3s = 90 frames)
export const Scene007: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const fadeIn = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Poppy seed (left)
    const poppyX = width * 0.35, poppyY = height * 0.45;
    const poppyR = 28 * scale;
    ctx.globalAlpha = alpha * fadeIn;

    const poppyGrad = ctx.createRadialGradient(poppyX - poppyR * 0.2, poppyY - poppyR * 0.2, 0, poppyX, poppyY, poppyR);
    poppyGrad.addColorStop(0, `hsla(25, 30%, 35%, 1)`);
    poppyGrad.addColorStop(1, `hsla(25, 25%, 18%, 1)`);
    ctx.fillStyle = poppyGrad;
    ctx.beginPath();
    ctx.arc(poppyX, poppyY, poppyR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${18 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("poppy seed", poppyX, poppyY + poppyR + 30 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.fillText("~1.0 mm", poppyX, poppyY + poppyR + 50 * scale);

    // Fly brain (right, smaller)
    const flyX = width * 0.65, flyY = height * 0.45;
    const flyR = 14 * scale;

    const flyGrad = ctx.createRadialGradient(flyX - flyR * 0.2, flyY - flyR * 0.2, 0, flyX, flyY, flyR);
    flyGrad.addColorStop(0, `hsla(280, 45%, 62%, 1)`);
    flyGrad.addColorStop(1, `hsla(280, 35%, 40%, 1)`);
    ctx.fillStyle = flyGrad;
    ctx.beginPath();
    ctx.arc(flyX, flyY, flyR, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = `hsla(280, 45%, 62%, 0.12)`;
    ctx.beginPath();
    ctx.arc(flyX, flyY, flyR * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `${18 * scale}px system-ui, sans-serif`;
    ctx.fillText("fly brain", flyX, flyY + flyR + 30 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.fillText("~0.5 mm", flyX, flyY + flyR + 50 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
