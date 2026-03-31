import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 18 — Counter: 7,050 sections, 21,000,000 photographs (3s = 90 frames)
export const Scene018: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2;

    // Sections counter
    const sections = Math.floor(interpolate(frame, [5, 40], [0, 7050], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${18 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("SECTIONS:", cx - 20 * scale, height * 0.4);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${36 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(sections.toLocaleString(), cx + 10 * scale, height * 0.4);

    // Photographs counter
    const photos = Math.floor(interpolate(frame, [5, 65], [0, 21000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${18 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText("PHOTOGRAPHS:", cx - 20 * scale, height * 0.58);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${36 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(photos.toLocaleString(), cx + 10 * scale, height * 0.58);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
