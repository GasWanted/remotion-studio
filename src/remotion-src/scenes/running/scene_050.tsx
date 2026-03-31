import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 50 — Code "if(sugar){eat()}" crossed out with X (4s = 120 frames)
export const Scene050: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2, cy = height * 0.4;

    // Code block
    const codeAlpha = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * codeAlpha;

    ctx.fillStyle = `rgba(15, 12, 22, 0.7)`;
    ctx.fillRect(cx - 140 * scale, cy - 40 * scale, 280 * scale, 80 * scale);
    ctx.strokeStyle = `hsla(180, 30%, 40%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(cx - 140 * scale, cy - 40 * scale, 280 * scale, 80 * scale);

    ctx.fillStyle = `hsla(180, 50%, 65%, 0.8)`;
    ctx.font = `${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("if (sugar) {", cx, cy - 10 * scale);
    ctx.fillText("  eat();", cx, cy + 15 * scale);
    ctx.fillText("}", cx, cy + 40 * scale);

    // Big X over it
    const xAlpha = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xAlpha > 0) {
      ctx.globalAlpha = alpha * xAlpha;
      ctx.strokeStyle = `hsla(350, 65%, 55%, 0.8)`;
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 120 * scale, cy - 35 * scale);
      ctx.lineTo(cx + 120 * scale, cy + 35 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 120 * scale, cy - 35 * scale);
      ctx.lineTo(cx - 120 * scale, cy + 35 * scale);
      ctx.stroke();
    }

    // "NO RULES" text
    const noRulesAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * noRulesAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${32 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("NO CODE. NO RULES.", cx, height * 0.72);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
