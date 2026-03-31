import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// FEED neuron center, incoming connections dim as weights tick down to zero
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Synapse {
  angle: number;
  dist: number;
  startWeight: number;
  endWeight: number;
}

export const FeedDim: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const synapses = useMemo(() => {
    const rand = seeded(91);
    const count = 9;
    const arr: Synapse[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.3;
      arr.push({
        angle,
        dist: 85 * S + rand() * 40 * S,
        startWeight: 1.5 + rand() * 3.5,
        endWeight: rand() * 0.15,
      });
    }
    return arr;
  }, [S]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;
    const neuronR = 28 * S;

    // Dimming progress
    const dimProgress = interpolate(frame, [25, 110], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Draw incoming synapses
    for (let i = 0; i < synapses.length; i++) {
      const syn = synapses[i];
      // Stagger each synapse slightly
      const stagger = i * 0.08;
      const localP = Math.max(0, Math.min(1, (dimProgress - stagger) / (1 - stagger * 0.8)));
      const w = syn.startWeight + (syn.endWeight - syn.startWeight) * localP;
      const normW = w / 5;

      const fromX = cx + Math.cos(syn.angle) * syn.dist;
      const fromY = cy + Math.sin(syn.angle) * syn.dist;
      const toX = cx + Math.cos(syn.angle) * neuronR;
      const toY = cy + Math.sin(syn.angle) * neuronR;

      // Line thickness and brightness based on weight
      const thick = Math.max(0.5, normW * 4) * S;
      const alpha = Math.max(0.05, normW * 0.8);

      // Connection line
      ctx.save();
      ctx.shadowColor = `rgba(80,180,255,${alpha * 0.5})`;
      ctx.shadowBlur = thick * 2;
      ctx.strokeStyle = `rgba(80,180,255,${alpha})`;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();

      // Source node
      const nodeAlpha = Math.max(0.1, normW * 0.7);
      ctx.fillStyle = `rgba(100,180,255,${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(fromX, fromY, 4 * S, 0, Math.PI * 2);
      ctx.fill();

      // Weight number along the line
      const labelX = (fromX + toX) / 2 + Math.cos(syn.angle + Math.PI / 2) * 12 * S;
      const labelY = (fromY + toY) / 2 + Math.sin(syn.angle + Math.PI / 2) * 12 * S;
      ctx.fillStyle = `rgba(160,200,255,${Math.max(0.2, alpha)})`;
      ctx.font = `${9 * S}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(w.toFixed(1), labelX, labelY);
    }

    // Central FEED neuron
    const feedGlow = 1 - dimProgress * 0.7;

    // Outer glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, neuronR * 2.5);
    grad.addColorStop(0, `rgba(80,200,255,${0.15 * feedGlow})`);
    grad.addColorStop(1, "rgba(80,200,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, neuronR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Neuron body
    ctx.save();
    ctx.shadowColor = `rgba(80,200,255,${feedGlow * 0.6})`;
    ctx.shadowBlur = 12 * S * feedGlow;
    ctx.strokeStyle = `rgba(80,200,255,${0.3 + feedGlow * 0.5})`;
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.arc(cx, cy, neuronR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(15,30,60,${0.5 + feedGlow * 0.3})`;
    ctx.fill();
    ctx.restore();

    // "FEED" label
    ctx.fillStyle = `rgba(80,200,255,${0.4 + feedGlow * 0.5})`;
    ctx.font = `bold ${14 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FEED", cx, cy);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
