import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 39 — Fast replay: RECEIVE → SUM → FIRE? loop (3s = 90 frames)
export const Scene039: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(25, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const steps = ["RECEIVE", "SUM", "FIRE?"];
    const stepW = width * 0.2;
    const startX = width * 0.18;
    const cy = height / 2;

    // Cycle: which step is active
    const cycleFrame = frame % 45; // loop every 1.5s
    const activeStep = cycleFrame < 15 ? 0 : cycleFrame < 30 ? 1 : 2;

    for (let i = 0; i < steps.length; i++) {
      const x = startX + i * (stepW + 40 * scale);
      const isActive = i === activeStep;
      const boxH = 40 * scale;

      // Box
      ctx.fillStyle = isActive ? `hsla(${[140, 220, 50][i]}, 50%, 50%, 0.3)` : `hsla(280, 20%, 25%, 0.3)`;
      ctx.fillRect(x - stepW / 2, cy - boxH / 2, stepW, boxH);
      ctx.strokeStyle = isActive ? `hsla(${[140, 220, 50][i]}, 55%, 60%, 0.7)` : `hsla(280, 25%, 40%, 0.4)`;
      ctx.lineWidth = isActive ? 2.5 * scale : 1.5 * scale;
      ctx.strokeRect(x - stepW / 2, cy - boxH / 2, stepW, boxH);

      // Text
      ctx.fillStyle = isActive ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.font = `bold ${18 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(steps[i], x, cy);

      // Arrow to next
      if (i < steps.length - 1) {
        const arrowX = x + stepW / 2 + 10 * scale;
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${20 * scale}px system-ui, sans-serif`;
        ctx.fillText("→", arrowX + 10 * scale, cy);
      }
    }

    // Active glow pulse
    const glowX = startX + activeStep * (stepW + 40 * scale);
    const pulse = 0.5 + Math.sin(cycleFrame * 0.3) * 0.3;
    ctx.fillStyle = `hsla(${[140, 220, 50][activeStep]}, 50%, 60%, ${pulse * 0.08})`;
    ctx.beginPath();
    ctx.arc(glowX, cy, 50 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
