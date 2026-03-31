import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 36 — Three input neurons send signals to central neuron (5s = 150 frames)
export const Scene036: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(25, width, height, scale), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    ctx.globalAlpha = alpha;

    const cx = width * 0.55, cy = height / 2;
    const inputs = [
      { x: width * 0.2, y: height * 0.28, value: "+3", hue: 140 },
      { x: width * 0.2, y: height * 0.50, value: "+2", hue: 220 },
      { x: width * 0.2, y: height * 0.72, value: "-1", hue: 350 },
    ];

    // Input neurons
    for (const inp of inputs) {
      const nodeGrad = ctx.createRadialGradient(inp.x, inp.y, 0, inp.x, inp.y, 14 * scale);
      nodeGrad.addColorStop(0, `hsla(${inp.hue}, 55%, 70%, 0.9)`);
      nodeGrad.addColorStop(1, `hsla(${inp.hue}, 45%, 50%, 0.7)`);
      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(inp.x, inp.y, 14 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wires from inputs to center
    for (const inp of inputs) {
      ctx.strokeStyle = `hsla(${inp.hue}, 35%, 55%, 0.3)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(inp.x + 14 * scale, inp.y);
      ctx.lineTo(cx - 18 * scale, cy);
      ctx.stroke();
    }

    // Traveling signal dots
    for (let i = 0; i < inputs.length; i++) {
      const inp = inputs[i];
      const signalStart = 20 + i * 15;
      const signalT = interpolate(frame, [signalStart, signalStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (signalT > 0 && signalT < 1) {
        const sx = inp.x + 14 * scale + (cx - 18 * scale - inp.x - 14 * scale) * signalT;
        const sy = inp.y + (cy - inp.y) * signalT;
        ctx.fillStyle = `hsla(${inp.hue}, 60%, 70%, 0.9)`;
        ctx.beginPath();
        ctx.arc(sx, sy, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${inp.hue}, 60%, 70%, 0.2)`;
        ctx.beginPath();
        ctx.arc(sx, sy, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Value label appears when signal arrives
      const arriveT = interpolate(frame, [signalStart + 25, signalStart + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (arriveT > 0) {
        ctx.globalAlpha = alpha * arriveT;
        ctx.fillStyle = `hsla(${inp.hue}, 55%, 70%, 0.9)`;
        ctx.font = `bold ${16 * scale}px monospace`;
        ctx.textAlign = "center";
        const midX = (inp.x + cx) / 2;
        const midY = (inp.y + cy) / 2 - 12 * scale;
        ctx.fillText(inp.value, midX, midY);
        ctx.globalAlpha = alpha;
      }
    }

    // Central neuron
    const bodyGrad = ctx.createRadialGradient(cx - 3 * scale, cy - 3 * scale, 0, cx, cy, 18 * scale);
    bodyGrad.addColorStop(0, `hsla(280, 55%, 72%, 0.9)`);
    bodyGrad.addColorStop(1, `hsla(280, 45%, 52%, 0.7)`);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("inputs", width * 0.2, height * 0.9);
    ctx.fillText("cell body", cx, cy + 32 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
