import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Two neurons stacked: FEED (flatline, 0Hz) on top, RETREAT (rapid spikes, 143Hz) on bottom
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SilentVsLoud: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  // Pre-generate spike times for retreat neuron
  const retreatSpikes = useMemo(() => {
    const rand = seeded(55);
    const spikes: number[] = [];
    // 143Hz over 5 seconds = ~715 spikes; in our trace width = ~130 frames
    for (let i = 0; i < 200; i++) {
      spikes.push(rand() * 140);
    }
    return spikes.sort((a, b) => a - b);
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const traceGrow = interpolate(frame, [8, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const marginL = 80 * scale;
    const marginR = 20 * scale;
    const traceW = width - marginL - marginR;
    const traceH = 35 * scale;

    // --- TOP: FEED neuron (flatline) ---
    const topY = height * 0.3;

    // Neuron circle (dark/dead)
    ctx.fillStyle = "rgba(60, 65, 70, 0.6)";
    ctx.strokeStyle = "rgba(90, 95, 100, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(marginL * 0.45, topY, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label
    const labelSize = Math.max(8, 10 * scale);
    ctx.font = `bold ${labelSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(120, 125, 130, 0.6)";
    ctx.fillText("FEED", marginL * 0.45, topY - 16 * scale);

    // Hz
    const hzSize = Math.max(7, 8 * scale);
    ctx.font = `${hzSize}px Courier New`;
    ctx.fillStyle = "rgba(100, 105, 110, 0.5)";
    ctx.fillText("0 Hz", marginL * 0.45, topY + 18 * scale);

    // Flatline trace
    const drawLen = traceW * traceGrow;
    ctx.strokeStyle = "rgba(80, 90, 100, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(marginL, topY);
    ctx.lineTo(marginL + drawLen, topY);
    ctx.stroke();

    // Slight noise on flatline for realism
    ctx.strokeStyle = "rgba(80, 90, 100, 0.15)";
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.moveTo(marginL, topY);
    for (let x = 0; x < drawLen; x += 2) {
      const noise = Math.sin(x * 0.3 + frame * 0.1) * 1.5 * scale;
      ctx.lineTo(marginL + x, topY + noise);
    }
    ctx.stroke();

    // "silence" text
    if (traceGrow > 0.5) {
      const silAlpha = interpolate(frame, [50, 70], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.font = `${Math.max(7, 8 * scale)}px Courier New`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(120, 130, 140, ${silAlpha})`;
      ctx.fillText("silence", marginL + traceW / 2, topY - 22 * scale);
    }

    // Divider
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginL, height * 0.5);
    ctx.lineTo(width - marginR, height * 0.5);
    ctx.stroke();

    // --- BOTTOM: RETREAT neuron (blazing) ---
    const botY = height * 0.7;
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.5);

    // Neuron circle (blazing red)
    ctx.shadowColor = "rgba(255, 50, 30, 0.6)";
    ctx.shadowBlur = (6 + pulse * 10) * scale;
    ctx.fillStyle = `rgba(255, ${Math.floor(60 + pulse * 40)}, ${Math.floor(30 + pulse * 20)}, ${0.7 + pulse * 0.3})`;
    ctx.strokeStyle = "rgba(255, 100, 60, 0.6)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(marginL * 0.45, botY, (10 + pulse * 3) * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    // Label
    ctx.font = `bold ${labelSize}px Courier New`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 100, 70, 0.8)";
    ctx.fillText("RETREAT", marginL * 0.45, botY - 16 * scale);

    // Hz
    ctx.font = `${hzSize}px Courier New`;
    ctx.fillStyle = "rgba(255, 120, 80, 0.7)";
    ctx.fillText("143 Hz", marginL * 0.45, botY + 18 * scale);

    // Spike trace
    const currentFrame = frame * traceGrow;
    ctx.strokeStyle = "rgba(255, 70, 40, 0.7)";
    ctx.lineWidth = 1 * scale;
    for (const st of retreatSpikes) {
      if (st > currentFrame * (140 / 120)) continue;
      const x = marginL + (st / 140) * traceW;
      if (x > marginL + drawLen) continue;

      // Spike: vertical line up
      ctx.beginPath();
      ctx.moveTo(x, botY + traceH * 0.3);
      ctx.lineTo(x, botY - traceH * 0.5);
      ctx.stroke();
    }

    // Baseline
    ctx.strokeStyle = "rgba(255, 70, 40, 0.2)";
    ctx.lineWidth = 0.5 * scale;
    ctx.beginPath();
    ctx.moveTo(marginL, botY + traceH * 0.3);
    ctx.lineTo(marginL + drawLen, botY + traceH * 0.3);
    ctx.stroke();

    // Glow effect on active region
    if (traceGrow > 0.3) {
      const activeX = marginL + drawLen;
      const grad = ctx.createRadialGradient(activeX, botY, 0, activeX, botY, 20 * scale);
      grad.addColorStop(0, "rgba(255, 60, 30, 0.15)");
      grad.addColorStop(1, "rgba(255, 60, 30, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(activeX - 20 * scale, botY - traceH, 40 * scale, traceH * 2);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
