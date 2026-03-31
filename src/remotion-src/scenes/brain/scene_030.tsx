import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 30 — Numbers: 138,639 neurons / 15,091,983 connections (4s = 120 frames)
export const Scene030: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2;

    // Neurons counter
    const neurons = Math.floor(interpolate(frame, [5, 50], [0, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${20 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("NEURONS:", cx - 20 * scale, height * 0.4);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${40 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(neurons.toLocaleString(), cx + 10 * scale, height * 0.4);

    // Connections counter
    const connections = Math.floor(interpolate(frame, [5, 70], [0, 15091983], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${20 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("CONNECTIONS:", cx - 20 * scale, height * 0.58);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${40 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(connections.toLocaleString(), cx + 10 * scale, height * 0.58);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
