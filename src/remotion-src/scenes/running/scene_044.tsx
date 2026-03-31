import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 44 — Checklist: ✗ Training, ✗ ML, ✗ Optimization, ✓ Raw wiring (3s = 90 frames)
export const Scene044: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const items = [
      { text: "Training data", pass: false },
      { text: "Machine learning", pass: false },
      { text: "Optimization", pass: false },
      { text: "Raw connectome wiring", pass: true },
    ];

    const startY = height * 0.28;
    const lineH = 50 * scale;

    for (let i = 0; i < items.length; i++) {
      const showT = interpolate(frame, [10 + i * 12, 18 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (showT <= 0) continue;
      ctx.globalAlpha = alpha * showT;

      const y = startY + i * lineH;
      const item = items[i];

      // Symbol
      if (item.pass) {
        ctx.fillStyle = PALETTE.accent.green;
        ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
      } else {
        ctx.fillStyle = `hsla(350, 60%, 55%, 0.85)`;
        ctx.font = `bold ${24 * scale}px system-ui, sans-serif`;
      }
      ctx.textAlign = "left";
      ctx.fillText(item.pass ? "✓" : "✗", width * 0.3, y);

      // Text
      ctx.fillStyle = item.pass ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.font = `${20 * scale}px system-ui, sans-serif`;
      ctx.fillText(item.text, width * 0.3 + 35 * scale, y);

      // Strikethrough for ✗ items
      if (!item.pass && showT > 0.5) {
        const strikeW = ctx.measureText(item.text).width;
        ctx.strokeStyle = `hsla(350, 50%, 50%, 0.5)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(width * 0.3 + 35 * scale, y - 3 * scale);
        ctx.lineTo(width * 0.3 + 35 * scale + strikeW, y - 3 * scale);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
