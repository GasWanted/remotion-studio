import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 33 — Schematic slides into monitor frame, power button glows (5s = 150 frames)
export const Scene033: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width / 2, cy = height / 2;
    const monW = 200 * scale, monH = 130 * scale;

    // Monitor frame
    ctx.strokeStyle = `hsla(220, 25%, 50%, 0.6)`;
    ctx.lineWidth = 3 * scale;
    ctx.strokeRect(cx - monW / 2, cy - monH / 2, monW, monH);
    // Stand
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 20 * scale, cy + monH / 2);
    ctx.lineTo(cx - 25 * scale, cy + monH / 2 + 20 * scale);
    ctx.lineTo(cx + 25 * scale, cy + monH / 2 + 20 * scale);
    ctx.lineTo(cx + 20 * scale, cy + monH / 2);
    ctx.stroke();

    // Connectome schematic slides in
    const slideT = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const schematicX = interpolate(slideT, [0, 1], [cx - monW, cx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - monW / 2 + 3, cy - monH / 2 + 3, monW - 6, monH - 6);
    ctx.clip();

    // Desaturated mini-network inside monitor
    ctx.fillStyle = `rgba(15, 12, 22, 0.9)`;
    ctx.fillRect(cx - monW / 2, cy - monH / 2, monW, monH);

    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const d = (15 + (i % 5) * 12) * scale;
      const nx = schematicX + Math.cos(a) * d;
      const ny = cy + Math.sin(a) * d;
      ctx.fillStyle = `hsla(220, 20%, 50%, 0.4)`;
      ctx.beginPath();
      ctx.arc(nx, ny, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Power button (bottom right of monitor)
    const btnX = cx + monW / 2 - 25 * scale, btnY = cy + monH / 2 - 15 * scale;
    const pulse = 0.5 + Math.sin(frame * 0.08) * 0.5;
    const btnAlpha = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * btnAlpha;

    // Button glow
    const btnGlow = ctx.createRadialGradient(btnX, btnY, 0, btnX, btnY, 15 * scale);
    btnGlow.addColorStop(0, `hsla(140, 55%, 60%, ${pulse * 0.3})`);
    btnGlow.addColorStop(1, `hsla(140, 55%, 60%, 0)`);
    ctx.fillStyle = btnGlow;
    ctx.beginPath();
    ctx.arc(btnX, btnY, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Power symbol
    ctx.strokeStyle = `hsla(140, 55%, 65%, ${0.5 + pulse * 0.5})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(btnX, btnY, 7 * scale, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(btnX, btnY - 9 * scale);
    ctx.lineTo(btnX, btnY - 3 * scale);
    ctx.stroke();

    // "?" next to button
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${22 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("?", btnX + 15 * scale, btnY + 8 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
