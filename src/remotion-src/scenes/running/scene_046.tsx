import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 46 — Fly tongue touches sugar, brief real-world reference (4s = 120 frames)
export const Scene046: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2, cy = height * 0.45;

    // Stylized fly head (simple shapes)
    const headR = 35 * scale;
    ctx.fillStyle = `hsla(280, 30%, 35%, 0.7)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, headR, headR * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Compound eyes
    ctx.fillStyle = `hsla(350, 40%, 45%, 0.7)`;
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.55, cy - headR * 0.1, headR * 0.35, headR * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.55, cy - headR * 0.1, headR * 0.35, headR * 0.4, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Proboscis extending down toward sugar
    const extendT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const probLen = 50 * scale * extendT;
    ctx.strokeStyle = `hsla(30, 30%, 50%, 0.7)`;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy + headR * 0.7);
    ctx.lineTo(cx, cy + headR * 0.7 + probLen);
    ctx.stroke();

    // Sugar droplet
    const sugarY = cy + headR * 0.7 + 55 * scale;
    const pulse = 0.8 + Math.sin(frame * 0.1) * 0.2;
    ctx.fillStyle = `hsla(50, 70%, 65%, ${pulse * 0.7})`;
    ctx.beginPath();
    ctx.arc(cx, sugarY, 12 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsla(50, 70%, 65%, 0.15)`;
    ctx.beginPath();
    ctx.arc(cx, sugarY, 20 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Contact flash
    if (extendT >= 1) {
      const contactT = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (contactT > 0 && contactT < 1) {
        ctx.fillStyle = `hsla(50, 70%, 80%, ${(1 - contactT) * 0.3})`;
        ctx.beginPath();
        ctx.arc(cx, sugarY - 10 * scale, 25 * scale * contactT, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("sugar", cx, sugarY + 25 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
