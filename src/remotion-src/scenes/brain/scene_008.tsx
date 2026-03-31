import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 08 — "HERE'S HOW" text card (3s = 90 frames)
export const Scene008: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(35, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90, 15, 15);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);

    // Text types on
    const fullText = "HERE'S HOW";
    const charsVisible = Math.floor(interpolate(frame, [10, 40], [0, fullText.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const text = fullText.slice(0, charsVisible);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${64 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, width / 2, height / 2);

    // Cursor blink
    if (charsVisible < fullText.length || (frame % 20 < 10 && frame < 70)) {
      const metrics = ctx.measureText(text);
      const cursorX = width / 2 + metrics.width / 2 + 4 * scale;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillRect(cursorX, height / 2 - 30 * scale, 3 * scale, 60 * scale);
    }

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
