import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 03 — "2024" text, researcher dots clustering (4s = 120 frames)
export const Scene003: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(303);
    const particles = makeParticles(40, width, height, scale);
    // 200+ researcher dots in a crowd cluster
    const dots: { tx: number; ty: number; delay: number; hue: number }[] = [];
    const cols = 20, rows = 10;
    const startX = width * 0.3, startY = height * 0.5;
    const spacingX = (width * 0.4) / cols, spacingY = (height * 0.25) / rows;
    for (let i = 0; i < 200; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      dots.push({
        tx: startX + col * spacingX + (rand() - 0.5) * spacingX * 0.5,
        ty: startY + row * spacingY + (rand() - 0.5) * spacingY * 0.5,
        delay: rand() * 60,
        hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
      });
    }
    return { particles, dots };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // "2024" text
    const textAlpha = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
    ctx.globalAlpha = alpha * textAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${72 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.3);

    // Researcher dots appear one by one
    ctx.globalAlpha = alpha;
    for (const dot of data.dots) {
      const dotFrame = frame - dot.delay;
      if (dotFrame < 0) continue;
      const dotAlpha = Math.min(1, dotFrame / 5);
      const dotScale = interpolate(dotFrame, [0, 8], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
      ctx.fillStyle = `hsla(${dot.hue}, 55%, 65%, ${dotAlpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(dot.tx, dot.ty, 3 * scale * dotScale, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.fillStyle = `hsla(${dot.hue}, 55%, 65%, ${dotAlpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(dot.tx, dot.ty, 8 * scale * dotScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter
    const count = Math.min(200, Math.floor(interpolate(frame, [5, 70], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${24 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${count}+`, width * 0.72, height * 0.82);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
