import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 06 — Human brain vs fruit fly brain scale comparison (3s = 90 frames)
export const Scene006: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const particles = useMemo(() => makeParticles(40, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 90);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Human brain outline (left side, large)
    const shrinkProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanX = width * 0.35, humanY = height * 0.45;
    const humanRx = 120 * scale, humanRy = 100 * scale;

    ctx.strokeStyle = `hsla(220, 40%, 60%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(humanX, humanY, humanRx, humanRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${16 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Human brain", humanX, humanY + humanRy + 25 * scale);

    // Fly brain (tiny dot, right side)
    const flyX = width * 0.65, flyY = height * 0.45;
    const flyR = Math.max(2 * scale, interpolate(shrinkProgress, [0, 1], [humanRx * 0.8, 3 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

    ctx.fillStyle = `hsla(140, 55%, 65%, 0.9)`;
    ctx.beginPath();
    ctx.arc(flyX, flyY, flyR, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = `hsla(140, 55%, 65%, 0.15)`;
    ctx.beginPath();
    ctx.arc(flyX, flyY, flyR * 3, 0, Math.PI * 2);
    ctx.fill();

    // Arrow pointing to fly dot
    if (shrinkProgress > 0.8) {
      const arrowAlpha = interpolate(shrinkProgress, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `rgba(255,255,255,${arrowAlpha * 0.6})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(flyX + 25 * scale, flyY - 20 * scale);
      ctx.lineTo(flyX + 5 * scale, flyY - 3 * scale);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = `rgba(255,255,255,${arrowAlpha * 0.6})`;
      ctx.beginPath();
      ctx.moveTo(flyX + 5 * scale, flyY - 3 * scale);
      ctx.lineTo(flyX + 10 * scale, flyY - 10 * scale);
      ctx.lineTo(flyX + 12 * scale, flyY - 2 * scale);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${arrowAlpha * 0.7})`;
      ctx.font = `${14 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("← fruit fly", flyX + 28 * scale, flyY - 15 * scale);
    }

    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("(actual scale)", flyX, flyY + 30 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
