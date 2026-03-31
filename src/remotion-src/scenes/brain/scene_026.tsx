import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 26 — Many screens/cursors working in parallel (4s = 120 frames)
export const Scene026: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2626);
    const particles = makeParticles(25, width, height, scale);
    const screens: { x: number; y: number; delay: number; hue: number }[] = [];
    const cols = 5, rows = 3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        screens.push({
          x: width * 0.15 + c * (width * 0.7 / (cols - 1)),
          y: height * 0.22 + r * (height * 0.5 / (rows - 1)),
          delay: (r * cols + c) * 3,
          hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
        });
      }
    }
    return { particles, screens };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    // Multiply effect: starts with 1 screen, expands to grid
    const gridProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const sw = 55 * scale, sh = 35 * scale;
    for (let i = 0; i < data.screens.length; i++) {
      const s = data.screens[i];
      const sAlpha = interpolate(frame - s.delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sAlpha <= 0 || gridProgress * data.screens.length < i) continue;

      ctx.globalAlpha = alpha * sAlpha;
      // Screen
      ctx.fillStyle = `rgba(15, 12, 22, 0.8)`;
      ctx.fillRect(s.x - sw / 2, s.y - sh / 2, sw, sh);
      ctx.strokeStyle = `hsla(${s.hue}, 40%, 50%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(s.x - sw / 2, s.y - sh / 2, sw, sh);

      // Fake content — colored blobs inside
      ctx.fillStyle = `hsla(${s.hue}, 50%, 55%, 0.5)`;
      ctx.beginPath();
      ctx.arc(s.x - 10 * scale, s.y, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x + 8 * scale, s.y - 5 * scale, 4 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Cursor (animated click)
      const cursorPhase = (frame * 0.05 + i * 1.3) % (Math.PI * 2);
      const cursorX = s.x + Math.sin(cursorPhase) * 12 * scale;
      const cursorY = s.y + Math.cos(cursorPhase * 0.7) * 8 * scale;
      ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX + 5 * scale, cursorY + 7 * scale);
      ctx.lineTo(cursorX + 2 * scale, cursorY + 7 * scale);
      ctx.lineTo(cursorX, cursorY + 10 * scale);
      ctx.closePath();
      ctx.fill();
    }

    // Counter
    ctx.globalAlpha = alpha;
    const countAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * countAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("127 labs", width / 2, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
