import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 37 — Bar fills: +3, +2, -1 = 4, crosses threshold at 3 (4s = 120 frames)
export const Scene037: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(25, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const barX = width * 0.45, barBottom = height * 0.78, barTop = height * 0.18;
    const barW = 50 * scale;
    const barH = barBottom - barTop;
    const thresholdY = barBottom - barH * (3 / 6); // threshold at 3 out of max 6

    // Bar outline
    ctx.strokeStyle = `hsla(280, 30%, 45%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(barX, barTop, barW, barH);

    // Fill incrementally: +3 (frame 15-30), then +5 (30-45), then +4 (45-60)
    const val1 = interpolate(frame, [15, 30], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const val2 = interpolate(frame, [30, 45], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const val3 = interpolate(frame, [45, 60], [0, -1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const total = val1 + val2 + val3;
    const fillH = (Math.max(0, total) / 6) * barH;

    // Fill
    const fillGrad = ctx.createLinearGradient(barX, barBottom, barX, barBottom - fillH);
    fillGrad.addColorStop(0, `hsla(280, 50%, 55%, 0.8)`);
    fillGrad.addColorStop(1, `hsla(180, 50%, 60%, 0.8)`);
    ctx.fillStyle = fillGrad;
    ctx.fillRect(barX, barBottom - fillH, barW, fillH);

    // Threshold line
    ctx.strokeStyle = `hsla(50, 70%, 65%, 0.7)`;
    ctx.lineWidth = 2 * scale;
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(barX - 15 * scale, thresholdY);
    ctx.lineTo(barX + barW + 15 * scale, thresholdY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("threshold (3)", barX + barW + 20 * scale, thresholdY + 5 * scale);

    // Total label
    const totalDisplay = Math.round(total * 10) / 10;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${24 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`total: ${totalDisplay >= 0 ? totalDisplay.toFixed(0) : totalDisplay.toFixed(0)}`, barX + barW / 2, barBottom + 30 * scale);

    // Flash when crossing threshold
    if (total >= 3) {
      const flashT = interpolate(frame, [58, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (flashT > 0 && flashT < 1) {
        ctx.fillStyle = `hsla(50, 70%, 75%, ${(1 - flashT) * 0.3})`;
        ctx.fillRect(barX - 20 * scale, thresholdY - 20 * scale, barW + 40 * scale, 40 * scale);
      }
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.fillText("✓", barX + barW + 60 * scale, thresholdY + 5 * scale);
    }

    // Step labels on right
    const steps = [
      { frame: 25, text: "+3", hue: 140 },
      { frame: 40, text: "+2", hue: 220 },
      { frame: 55, text: "-1", hue: 350 },
    ];
    for (const step of steps) {
      const sAlpha = interpolate(frame, [step.frame - 5, step.frame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = alpha * sAlpha;
      ctx.fillStyle = `hsla(${step.hue}, 55%, 65%, 0.8)`;
      ctx.font = `${14 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(step.text, barX - 45 * scale, barBottom - 15 * scale - steps.indexOf(step) * 20 * scale);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
