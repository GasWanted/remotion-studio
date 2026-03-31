import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 34 — Single neuron schematic: dendrites, body, axon (4s = 120 frames)
export const Scene034: React.FC<{ width: number; height: number }> = ({ width, height }) => {
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

    const cx = width / 2, cy = height / 2;
    const drawT = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Dendrites (left, draw first)
    const dendT = interpolate(drawT, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(280, 50%, 62%, ${dendT * 0.7})`;
    ctx.lineWidth = 2 * scale;
    ctx.lineCap = "round";
    const dendrites = [
      { angle: Math.PI * 0.75, len: 70 },
      { angle: Math.PI * 0.9, len: 55 },
      { angle: Math.PI * 1.1, len: 60 },
      { angle: Math.PI * 1.25, len: 50 },
    ];
    for (const d of dendrites) {
      const endX = cx + Math.cos(d.angle) * d.len * scale * dendT;
      const endY = cy + Math.sin(d.angle) * d.len * scale * dendT;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      // Branch tip
      if (dendT > 0.5) {
        const tipLen = 15 * scale * (dendT - 0.5) * 2;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + Math.cos(d.angle - 0.4) * tipLen, endY + Math.sin(d.angle - 0.4) * tipLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX + Math.cos(d.angle + 0.4) * tipLen, endY + Math.sin(d.angle + 0.4) * tipLen);
        ctx.stroke();
      }
    }

    // Cell body
    const bodyT = interpolate(drawT, [0.2, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyT > 0) {
      const bodyR = 18 * scale * bodyT;
      const bodyGrad = ctx.createRadialGradient(cx - 3 * scale, cy - 3 * scale, 0, cx, cy, bodyR);
      bodyGrad.addColorStop(0, `hsla(280, 55%, 72%, ${bodyT})`);
      bodyGrad.addColorStop(1, `hsla(280, 45%, 52%, ${bodyT * 0.8})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axon (right)
    const axonT = interpolate(drawT, [0.4, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (axonT > 0) {
      const axonLen = 160 * scale * axonT;
      ctx.strokeStyle = `hsla(180, 50%, 58%, ${axonT * 0.7})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + axonLen, cy + 5 * scale);
      ctx.stroke();
      // Arrow tip
      if (axonT > 0.8) {
        const tipX = cx + axonLen, tipY = cy + 5 * scale;
        ctx.fillStyle = `hsla(180, 50%, 58%, ${axonT * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 8 * scale, tipY - 5 * scale);
        ctx.lineTo(tipX - 8 * scale, tipY + 5 * scale);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Labels
    const lblT = interpolate(drawT, [0.7, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * lblT;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("dendrites", cx - 80 * scale, cy + 50 * scale);
    ctx.fillText("inputs", cx - 80 * scale, cy + 65 * scale);
    ctx.fillText("axon", cx + 100 * scale, cy + 30 * scale);
    ctx.fillText("output", cx + 100 * scale, cy + 45 * scale);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
