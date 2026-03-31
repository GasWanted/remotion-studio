import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 17 — Tape conveyor feeding sections through electron beam (4s = 120 frames)
export const Scene017: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(30, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 120);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const tapeY = height * 0.5;
    const tapeLeft = width * 0.1, tapeRight = width * 0.9;

    // Tape
    ctx.strokeStyle = `hsla(30, 30%, 50%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(tapeLeft, tapeY);
    ctx.lineTo(tapeRight, tapeY);
    ctx.stroke();

    // Sections on tape (moving left to right)
    const speed = 0.8;
    const spacing = 80 * scale;
    for (let i = 0; i < 10; i++) {
      const baseX = tapeLeft + i * spacing + (frame * speed * scale) % spacing;
      if (baseX > tapeRight) continue;
      ctx.fillStyle = `hsla(50, 50%, 70%, 0.5)`;
      ctx.fillRect(baseX - 10 * scale, tapeY - 8 * scale, 20 * scale, 16 * scale);
    }

    // Electron beam column (center)
    const beamX = width / 2;
    ctx.strokeStyle = `hsla(180, 60%, 60%, 0.5)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(beamX, tapeY - 100 * scale);
    ctx.lineTo(beamX, tapeY - 10 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(beamX, tapeY + 10 * scale);
    ctx.lineTo(beamX, tapeY + 80 * scale);
    ctx.stroke();

    // Beam glow at intersection
    const hitGlow = ctx.createRadialGradient(beamX, tapeY, 0, beamX, tapeY, 20 * scale);
    hitGlow.addColorStop(0, `hsla(180, 60%, 70%, ${0.3 + Math.sin(frame * 0.1) * 0.1})`);
    hitGlow.addColorStop(1, `hsla(180, 60%, 70%, 0)`);
    ctx.fillStyle = hitGlow;
    ctx.beginPath();
    ctx.arc(beamX, tapeY, 20 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("electron beam", beamX, tapeY - 110 * scale);
    ctx.fillText("detector", beamX, tapeY + 95 * scale);
    ctx.fillText("→ tape", tapeRight - 30 * scale, tapeY - 15 * scale);

    // Image output (bottom right)
    const imgAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * imgAlpha;
    ctx.fillStyle = `hsla(0, 0%, 25%, 0.6)`;
    ctx.fillRect(width * 0.7, height * 0.7, 60 * scale, 50 * scale);
    ctx.strokeStyle = `hsla(180, 40%, 55%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(width * 0.7, height * 0.7, 60 * scale, 50 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${11 * scale}px monospace`;
    ctx.fillText("→ image", width * 0.7 + 30 * scale, height * 0.7 + 65 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
