import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// 1 dot center → splits to 2 → 4 → 8 → exponentially fills the screen.
// Counter: 138,639

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Dot {
  x: number;
  y: number;
  generation: number;
  birthFrame: number;
  angle: number; // direction it moves from parent
}

function buildData(width: number, height: number, scale: number) {
  const rand = seeded(678);
  const cx = width / 2;
  const cy = height / 2;

  // Generate dots exponentially
  // Each generation spawns after a delay; position spreads outward
  const dots: Dot[] = [];
  const maxGens = 14; // 2^14 = 16384 — we'll display up to ~500 actual dots for perf
  const maxDots = 500;
  const framesPerGen = 8;

  dots.push({ x: cx, y: cy, generation: 0, birthFrame: 5, angle: 0 });

  for (let gen = 1; gen <= maxGens && dots.length < maxDots; gen++) {
    const parentStart = dots.findIndex(d => d.generation === gen - 1);
    const parentEnd = dots.length;
    const birthFrame = 5 + gen * framesPerGen;

    for (let p = parentStart; p < parentEnd && dots.length < maxDots; p++) {
      const parent = dots[p];
      // Two children, splitting in opposite-ish directions
      const baseAngle = parent.angle + (rand() - 0.5) * 0.5;
      const spread = (15 + rand() * 15) * scale * Math.pow(0.85, gen);

      for (let c = 0; c < 2; c++) {
        if (dots.length >= maxDots) break;
        const childAngle = baseAngle + (c === 0 ? -0.5 : 0.5) + (rand() - 0.5) * 0.6;
        dots.push({
          x: parent.x + Math.cos(childAngle) * spread,
          y: parent.y + Math.sin(childAngle) * spread,
          generation: gen,
          birthFrame,
          angle: childAngle,
        });
      }
    }
  }

  // Connections: each dot connects to its parent (approximate: connect to nearest dot in prev generation)
  const connections: [number, number][] = [];
  for (let i = 1; i < dots.length; i++) {
    const d = dots[i];
    let bestParent = 0;
    let bestDist = Infinity;
    for (let j = 0; j < i; j++) {
      if (dots[j].generation !== d.generation - 1) continue;
      const dx = dots[j].x - d.x;
      const dy = dots[j].y - d.y;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) { bestDist = dist; bestParent = j; }
    }
    connections.push([bestParent, i]);
  }

  return { dots, connections };
}

function formatCount(n: number): string {
  return n.toLocaleString();
}

export const ExponentialMultiply: React.FC<VariantProps> = ({ width, height }) => {
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

    const { dots, connections } = data;

    // Count visible dots
    let visibleCount = 0;
    for (const d of dots) {
      if (frame >= d.birthFrame) visibleCount++;
    }

    // The displayed counter accelerates to 138,639
    const counterProgress = interpolate(frame, [5, 120], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Exponential curve for counter
    const displayCount = Math.min(
      Math.floor(Math.pow(counterProgress, 3) * 138639),
      138639
    );

    // Draw connections
    for (const [a, b] of connections) {
      const da = dots[a];
      const db = dots[b];
      if (frame < db.birthFrame) continue;

      const age = frame - db.birthFrame;
      const lineIn = Math.min(age / 4, 1);
      const alpha = 0.08 + lineIn * 0.07;

      ctx.strokeStyle = `rgba(80, 160, 255, ${alpha})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.beginPath();
      ctx.moveTo(da.x, da.y);
      const mx = da.x + (db.x - da.x) * lineIn;
      const my = da.y + (db.y - da.y) * lineIn;
      ctx.lineTo(mx, my);
      ctx.stroke();
    }

    // Draw dots
    for (const d of dots) {
      if (frame < d.birthFrame) continue;

      const age = frame - d.birthFrame;
      const popIn = interpolate(age, [0, 3], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      const r = (1 + popIn * 1.5) * scale * Math.pow(0.92, d.generation);

      // Newer generations are warmer colored
      const genFrac = d.generation / 14;
      const red = Math.round(80 + genFrac * 175);
      const green = Math.round(180 - genFrac * 60);
      const blue = Math.round(255 - genFrac * 155);
      const alpha = 0.3 + popIn * 0.5;

      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      if (age < 5) {
        ctx.shadowColor = `rgba(${red}, ${green}, ${blue}, 0.5)`;
        ctx.shadowBlur = 6 * scale;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Counter display
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";

    const counterY = height * 0.9;
    const countStr = displayCount >= 138639 ? "138,639" : formatCount(displayCount);
    ctx.fillText(countStr, width / 2, counterY);

    // "neurons" label
    ctx.fillStyle = "rgba(160, 180, 220, 0.5)";
    ctx.font = `${8 * scale}px monospace`;
    ctx.fillText("neurons", width / 2, counterY + 12 * scale);

    // Final state flash when counter hits target
    if (displayCount >= 138639) {
      const flashA = interpolate(frame, [118, 120, 125], [0, 0.15, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      if (flashA > 0) {
        ctx.fillStyle = `rgba(100, 200, 255, ${flashA})`;
        ctx.fillRect(0, 0, width, height);
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
