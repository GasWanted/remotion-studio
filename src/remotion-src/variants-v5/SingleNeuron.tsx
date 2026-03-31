import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// One neuron center screen. Input signals arrive from left along dendrites,
// sum bar fills inside cell body, crosses threshold → fires signal out right along axon.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Dendrite {
  x1: number; y1: number; // start (left edge area)
  cx: number; cy: number; // control point
  x2: number; y2: number; // end (cell body)
}

interface Signal {
  dendrite: number;
  startFrame: number;
  value: number; // +1 to +4
}

function buildData(width: number, height: number, scale: number) {
  const rand = seeded(77);
  const cx = width / 2;
  const cy = height / 2;
  const bodyR = 28 * scale;

  // Dendrites: branch in from left
  const dendrites: Dendrite[] = [];
  const numDendrites = 5;
  for (let i = 0; i < numDendrites; i++) {
    const frac = (i + 1) / (numDendrites + 1);
    const y1 = height * (0.15 + frac * 0.7);
    const x1 = width * 0.05;
    const cpx = cx - bodyR - (40 + rand() * 60) * scale;
    const cpy = cy + (rand() - 0.5) * 40 * scale;
    dendrites.push({
      x1, y1,
      cx: cpx, cy: cpy,
      x2: cx - bodyR * 0.8, y2: cy + (i - 2) * 8 * scale,
    });
  }

  // Signals arriving along dendrites at various times
  const signals: Signal[] = [];
  const arrivals = [10, 20, 30, 42, 55]; // frames when signals START moving
  for (let i = 0; i < numDendrites; i++) {
    signals.push({
      dendrite: i,
      startFrame: arrivals[i],
      value: i === 2 ? 2 : (i === 4 ? 3 : 1 + Math.floor(rand() * 3)),
    });
  }

  // Axon path going right
  const axonStart = { x: cx + bodyR * 0.9, y: cy };
  const axonEnd = { x: width * 0.95, y: cy + 10 * scale };
  const axonCp = { x: cx + bodyR + 80 * scale, y: cy - 20 * scale };

  return { cx, cy, bodyR, dendrites, signals, axonStart, axonEnd, axonCp };
}

function quadBezier(t: number, p0: number, cp: number, p1: number) {
  return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * cp + t * t * p1;
}

export const SingleNeuron: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildData(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { cx, cy, bodyR, dendrites, signals, axonStart, axonEnd, axonCp } = data;

    // Threshold and fill logic
    const thresholdVal = 8;
    let currentSum = 0;
    const travelDuration = 25; // frames for signal to traverse dendrite

    for (const sig of signals) {
      const arriveFrame = sig.startFrame + travelDuration;
      if (frame >= arriveFrame) {
        currentSum += sig.value;
      }
    }
    const fillFrac = Math.min(currentSum / thresholdVal, 1);
    const thresholdCrossed = fillFrac >= 1;
    const crossFrame = 80 + travelDuration; // roughly when last signal arrives and pushes over
    const fireFrame = thresholdCrossed ? 106 : 999;

    // Draw dendrites
    for (let i = 0; i < dendrites.length; i++) {
      const d = dendrites[i];
      ctx.strokeStyle = "rgba(80, 180, 220, 0.35)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(d.x1, d.y1);
      ctx.quadraticCurveTo(d.cx, d.cy, d.x2, d.y2);
      ctx.stroke();
    }

    // Draw axon
    ctx.strokeStyle = "rgba(80, 180, 220, 0.35)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(axonStart.x, axonStart.y);
    ctx.quadraticCurveTo(axonCp.x, axonCp.y, axonEnd.x, axonEnd.y);
    ctx.stroke();

    // Draw signal dots traveling along dendrites
    for (const sig of signals) {
      const progress = interpolate(frame, [sig.startFrame, sig.startFrame + travelDuration], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (progress > 0 && progress < 1) {
        const d = dendrites[sig.dendrite];
        const sx = quadBezier(progress, d.x1, d.cx, d.x2);
        const sy = quadBezier(progress, d.y1, d.cy, d.y2);
        ctx.fillStyle = "#ffdd44";
        ctx.shadowColor = "#ffdd44";
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Value label
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${10 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`+${sig.value}`, sx, sy - 6 * scale);
      }
      ctx.shadowBlur = 0;
    }

    // Cell body
    const bodyGlow = thresholdCrossed
      ? interpolate(frame, [fireFrame - 2, fireFrame, fireFrame + 8, fireFrame + 20], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : 0;
    ctx.fillStyle = `rgba(20, 25, 40, 0.9)`;
    ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + bodyGlow * 0.5})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fill bar inside cell body (vertical fill from bottom)
    if (fillFrac > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR - 2 * scale, 0, Math.PI * 2);
      ctx.clip();
      const fillHeight = fillFrac * bodyR * 2;
      const topY = cy + bodyR - fillHeight;
      const grad = ctx.createLinearGradient(cx, cy + bodyR, cx, cy - bodyR);
      grad.addColorStop(0, thresholdCrossed ? "rgba(255, 200, 60, 0.8)" : "rgba(60, 180, 255, 0.6)");
      grad.addColorStop(1, thresholdCrossed ? "rgba(255, 100, 30, 0.9)" : "rgba(60, 120, 255, 0.8)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - bodyR, topY, bodyR * 2, fillHeight);
      ctx.restore();

      // Threshold line
      const threshY = cy + bodyR - bodyR * 2 * 0.7;
      ctx.strokeStyle = "rgba(255, 80, 80, 0.6)";
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(cx - bodyR + 4 * scale, threshY);
      ctx.lineTo(cx + bodyR - 4 * scale, threshY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Fire flash
    if (thresholdCrossed && frame >= fireFrame) {
      const flashA = interpolate(frame, [fireFrame, fireFrame + 4, fireFrame + 15], [0, 0.7, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      ctx.fillStyle = `rgba(255, 255, 200, ${flashA})`;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Output signal along axon
    if (thresholdCrossed && frame >= fireFrame + 3) {
      const axProg = interpolate(frame, [fireFrame + 3, fireFrame + 30], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (axProg > 0 && axProg < 1) {
        const sx = quadBezier(axProg, axonStart.x, axonCp.x, axonEnd.x);
        const sy = quadBezier(axProg, axonStart.y, axonCp.y, axonEnd.y);
        ctx.fillStyle = "#ff8844";
        ctx.shadowColor = "#ff8844";
        ctx.shadowBlur = 12 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Labels
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = `${9 * scale}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("dendrites", width * 0.12, height * 0.08);
    ctx.fillText("axon", width * 0.85, cy - 15 * scale);
    ctx.fillText("soma", cx, cy - bodyR - 6 * scale);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
