import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 38 — Neuron FIRES, signal splits to three outputs (4s = 120 frames)
export const Scene038: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const sourceX = width * 0.25, sourceY = height / 2;
    const splitX = width * 0.6;
    const outputs = [
      { x: width * 0.82, y: height * 0.28 },
      { x: width * 0.82, y: height * 0.50 },
      { x: width * 0.82, y: height * 0.72 },
    ];

    // Source neuron
    const fireT = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fireFlash = fireT > 0.5 && fireT < 1 ? (1 - fireT) * 2 : 0;
    const bodyR = 18 * scale * (1 + fireFlash * 0.3);

    const bodyGrad = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, bodyR);
    bodyGrad.addColorStop(0, `hsla(280, ${55 + fireFlash * 20}%, ${72 + fireFlash * 15}%, 0.95)`);
    bodyGrad.addColorStop(1, `hsla(280, 45%, 52%, 0.7)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, bodyR, 0, Math.PI * 2);
    ctx.fill();
    if (fireFlash > 0) {
      ctx.fillStyle = `hsla(50, 70%, 80%, ${fireFlash * 0.2})`;
      ctx.beginPath();
      ctx.arc(sourceX, sourceY, bodyR * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // FIRE! label
    if (fireT > 0.5) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${18 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("FIRE!", sourceX, sourceY - 30 * scale);
    }

    // Axon to split point
    ctx.strokeStyle = `hsla(180, 50%, 58%, 0.5)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(sourceX + bodyR, sourceY);
    ctx.lineTo(splitX, sourceY);
    ctx.stroke();

    // Branches to outputs
    for (const out of outputs) {
      ctx.strokeStyle = `hsla(180, 50%, 58%, 0.4)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(splitX, sourceY);
      ctx.lineTo(out.x - 14 * scale, out.y);
      ctx.stroke();
    }

    // Spike pulse traveling down axon
    const pulseT = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pulseT > 0 && pulseT < 1) {
      // Main axon pulse
      if (pulseT < 0.5) {
        const px = sourceX + bodyR + (splitX - sourceX - bodyR) * (pulseT / 0.5);
        ctx.fillStyle = `hsla(50, 70%, 75%, 0.9)`;
        ctx.beginPath();
        ctx.arc(px, sourceY, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(50, 70%, 75%, 0.2)`;
        ctx.beginPath();
        ctx.arc(px, sourceY, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Split into three
        const branchT = (pulseT - 0.5) / 0.5;
        for (const out of outputs) {
          const px = splitX + (out.x - 14 * scale - splitX) * branchT;
          const py = sourceY + (out.y - sourceY) * branchT;
          ctx.fillStyle = `hsla(50, 70%, 75%, ${0.9 * (1 - branchT * 0.3)})`;
          ctx.beginPath();
          ctx.arc(px, py, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Output neurons
    for (const out of outputs) {
      const receiveT = interpolate(frame, [50, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const outGrad = ctx.createRadialGradient(out.x, out.y, 0, out.x, out.y, 14 * scale);
      outGrad.addColorStop(0, `hsla(180, 50%, ${55 + receiveT * 15}%, 0.8)`);
      outGrad.addColorStop(1, `hsla(180, 40%, 45%, 0.6)`);
      ctx.fillStyle = outGrad;
      ctx.beginPath();
      ctx.arc(out.x, out.y, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("outputs", width * 0.82, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
