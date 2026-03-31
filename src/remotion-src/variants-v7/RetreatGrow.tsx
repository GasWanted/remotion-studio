import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// RETREAT neuron center, incoming connections brighten as weights tick up
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Synapse {
  angle: number;
  dist: number;
  startWeight: number;
  endWeight: number;
}

export const RetreatGrow: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const synapses = useMemo(() => {
    const rand = seeded(202);
    const count = 9;
    const arr: Synapse[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.3;
      arr.push({
        angle,
        dist: 85 * S + rand() * 40 * S,
        startWeight: rand() * 0.4,
        endWeight: 2.5 + rand() * 2.5,
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

    // Growing progress
    const growProgress = interpolate(frame, [25, 110], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Draw incoming synapses
    for (let i = 0; i < synapses.length; i++) {
      const syn = synapses[i];
      const stagger = i * 0.08;
      const localP = Math.max(0, Math.min(1, (growProgress - stagger) / (1 - stagger * 0.8)));
      const w = syn.startWeight + (syn.endWeight - syn.startWeight) * localP;
      const normW = w / 5;

      const fromX = cx + Math.cos(syn.angle) * syn.dist;
      const fromY = cy + Math.sin(syn.angle) * syn.dist;
      const toX = cx + Math.cos(syn.angle) * neuronR;
      const toY = cy + Math.sin(syn.angle) * neuronR;

      const thick = Math.max(0.5, normW * 4.5) * S;
      const alpha = Math.max(0.05, normW * 0.85);

      // Connection line — orange/amber to signal danger/retreat
      ctx.save();
      ctx.shadowColor = `rgba(255,140,40,${alpha * 0.6})`;
      ctx.shadowBlur = thick * 3;
      ctx.strokeStyle = `rgba(255,140,40,${alpha})`;
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();

      // Source node
      const nodeAlpha = Math.max(0.1, normW * 0.7);
      ctx.fillStyle = `rgba(255,160,60,${nodeAlpha})`;
      ctx.beginPath();
      ctx.arc(fromX, fromY, (3 + normW * 2) * S, 0, Math.PI * 2);
      ctx.fill();

      // Traveling pulse when weight is significant
      if (normW > 0.3) {
        const pulseT = ((frame + i * 7) % 24) / 24;
        const px = fromX + (toX - fromX) * pulseT;
        const py = fromY + (toY - fromY) * pulseT;
        ctx.save();
        ctx.shadowColor = `rgba(255,200,80,${normW * 0.5})`;
        ctx.shadowBlur = 6 * S;
        ctx.fillStyle = `rgba(255,200,80,${normW * 0.6})`;
        ctx.beginPath();
        ctx.arc(px, py, 2 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Weight number
      const labelX = (fromX + toX) / 2 + Math.cos(syn.angle + Math.PI / 2) * 12 * S;
      const labelY = (fromY + toY) / 2 + Math.sin(syn.angle + Math.PI / 2) * 12 * S;
      ctx.fillStyle = `rgba(255,200,120,${Math.max(0.2, alpha)})`;
      ctx.font = `${9 * S}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(w.toFixed(1), labelX, labelY);
    }

    // Central RETREAT neuron
    const retreatGlow = growProgress;

    // Outer glow — intensifying
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, neuronR * 2.5);
    grad.addColorStop(0, `rgba(255,120,30,${0.05 + 0.2 * retreatGlow})`);
    grad.addColorStop(1, "rgba(255,120,30,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, neuronR * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Neuron body
    ctx.save();
    ctx.shadowColor = `rgba(255,140,40,${retreatGlow * 0.8})`;
    ctx.shadowBlur = (8 + retreatGlow * 16) * S;
    ctx.strokeStyle = `rgba(255,140,40,${0.3 + retreatGlow * 0.6})`;
    ctx.lineWidth = (1.5 + retreatGlow * 1.5) * S;
    ctx.beginPath();
    ctx.arc(cx, cy, neuronR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(50,20,5,${0.4 + retreatGlow * 0.4})`;
    ctx.fill();
    ctx.restore();

    // "RETREAT" label
    ctx.fillStyle = `rgba(255,180,80,${0.3 + retreatGlow * 0.6})`;
    ctx.font = `bold ${12 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RETREAT", cx, cy);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
