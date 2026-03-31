import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Two neurons connected by an edge. Weight number cycles: 4.2 (thick bright) → 0.3 (thin dim) → -1.7 (red suppression)
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const STATES: { weight: number; color: string; glow: string; thickness: number; signalAlpha: number }[] = [
  { weight: 4.2, color: "#4af0ff", glow: "#4af0ff", thickness: 5, signalAlpha: 1.0 },
  { weight: 0.3, color: "#445566", glow: "#445566", thickness: 1.2, signalAlpha: 0.25 },
  { weight: -1.7, color: "#ff3344", glow: "#ff3344", thickness: 3, signalAlpha: 0.8 },
];

export const WeightDemo: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;
    const neuronR = 22 * S;
    const gap = 100 * S;
    const leftX = cx - gap;
    const rightX = cx + gap;

    // Determine current state via cycling (each state ~43 frames)
    const cycleLen = 43;
    const totalCycle = cycleLen * 3;
    const t = frame % totalCycle;
    const stateIdx = Math.floor(t / cycleLen);
    const stateProgress = (t % cycleLen) / cycleLen;

    const prevIdx = stateIdx === 0 ? 2 : stateIdx - 1;
    const cur = STATES[stateIdx];
    const prev = STATES[prevIdx];

    // Interpolate weight number
    const transitionFrames = 12;
    const tFrac = (t % cycleLen);
    let displayWeight: number;
    let displayThickness: number;
    let displayAlpha: number;
    if (tFrac < transitionFrames) {
      const p = tFrac / transitionFrames;
      displayWeight = prev.weight + (cur.weight - prev.weight) * p;
      displayThickness = prev.thickness + (cur.thickness - prev.thickness) * p;
      displayAlpha = prev.signalAlpha + (cur.signalAlpha - prev.signalAlpha) * p;
    } else {
      displayWeight = cur.weight;
      displayThickness = cur.thickness;
      displayAlpha = cur.signalAlpha;
    }

    // Parse color
    const parseHex = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const lerpColor = (a: string, b: string, p: number) => {
      const [ar, ag, ab] = parseHex(a);
      const [br, bg, bb] = parseHex(b);
      const r = Math.round(ar + (br - ar) * p);
      const g = Math.round(ag + (bg - ag) * p);
      const bl = Math.round(ab + (bb - ab) * p);
      return `rgb(${r},${g},${bl})`;
    };

    let edgeColor: string;
    if (tFrac < transitionFrames) {
      edgeColor = lerpColor(prev.color, cur.color, tFrac / transitionFrames);
    } else {
      edgeColor = cur.color;
    }

    // Edge line
    ctx.save();
    ctx.shadowColor = edgeColor;
    ctx.shadowBlur = displayThickness * 3 * S;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = displayThickness * S;
    ctx.globalAlpha = fadeOut * displayAlpha;
    ctx.beginPath();
    ctx.moveTo(leftX + neuronR, cy);
    ctx.lineTo(rightX - neuronR, cy);
    ctx.stroke();
    ctx.restore();

    // Traveling signal pulse
    ctx.globalAlpha = fadeOut;
    const pulseT = (frame % 30) / 30;
    const pulseX = leftX + neuronR + (rightX - neuronR - leftX - neuronR) * pulseT;
    ctx.save();
    ctx.shadowColor = edgeColor;
    ctx.shadowBlur = 12 * S;
    ctx.fillStyle = edgeColor;
    ctx.globalAlpha = fadeOut * displayAlpha * 0.8;
    ctx.beginPath();
    ctx.arc(pulseX, cy, 3 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = fadeOut;

    // Draw neurons
    for (const nx of [leftX, rightX]) {
      // Glow
      const grad = ctx.createRadialGradient(nx, cy, 0, nx, cy, neuronR * 1.8);
      grad.addColorStop(0, "rgba(100,180,255,0.15)");
      grad.addColorStop(1, "rgba(100,180,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(nx, cy, neuronR * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.strokeStyle = "rgba(100,180,255,0.6)";
      ctx.lineWidth = 1.5 * S;
      ctx.beginPath();
      ctx.arc(nx, cy, neuronR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,40,80,0.5)";
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = "rgba(160,200,255,0.5)";
    ctx.font = `${11 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("A", leftX, cy + neuronR + 16 * S);
    ctx.fillText("B", rightX, cy + neuronR + 16 * S);

    // Weight number
    ctx.save();
    ctx.shadowColor = edgeColor;
    ctx.shadowBlur = 8 * S;
    ctx.fillStyle = edgeColor;
    ctx.font = `bold ${18 * S}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(displayWeight.toFixed(1), cx, cy - 14 * S);

    // Label
    ctx.font = `${10 * S}px monospace`;
    ctx.fillStyle = "rgba(200,200,200,0.4)";
    ctx.fillText("weight", cx, cy - 34 * S);
    ctx.restore();
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
