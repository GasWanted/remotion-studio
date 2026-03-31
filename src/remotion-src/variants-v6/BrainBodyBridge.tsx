import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * Left: brain network cluster. Right: fly wireframe body.
 * A cable/bridge draws between them. Signal dots flow across.
 */
export const BrainBodyBridge: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const nodes = useMemo(() => {
    const rng = seeded(42);
    const n: { x: number; y: number }[] = [];
    const cx = width * 0.22;
    const cy = height * 0.45;
    for (let i = 0; i < 30; i++) {
      n.push({
        x: cx + (rng() - 0.5) * 80 * s,
        y: cy + (rng() - 0.5) * 100 * s,
      });
    }
    return n;
  }, [width, height, s]);

  const edges = useMemo(() => {
    const rng = seeded(99);
    const e: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      const count = 1 + Math.floor(rng() * 3);
      for (let c = 0; c < count; c++) {
        const j = Math.floor(rng() * nodes.length);
        if (j !== i) e.push([i, j]);
      }
    }
    return e;
  }, [nodes]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const brainAppear = interpolate(frame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bodyAppear = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bridgeP = interpolate(frame, [35, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const signalP = interpolate(frame, [60, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // --- Brain network (left) ---
    if (brainAppear > 0) {
      const visibleEdges = Math.floor(edges.length * brainAppear);
      ctx.strokeStyle = `rgba(100, 130, 255, ${brainAppear * 0.3})`;
      ctx.lineWidth = 0.8 * s;
      for (let i = 0; i < visibleEdges; i++) {
        const [a, b] = edges[i];
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      }

      const visibleNodes = Math.floor(nodes.length * brainAppear);
      for (let i = 0; i < visibleNodes; i++) {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15 + i);
        ctx.fillStyle = `rgba(100, 160, 255, ${brainAppear * (0.4 + pulse * 0.4)})`;
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, (2.5 + pulse) * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      ctx.fillStyle = `rgba(100, 160, 255, ${brainAppear * 0.7})`;
      ctx.font = `bold ${11 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("BRAIN", width * 0.22, height * 0.12);
    }

    // --- Fly body wireframe (right) ---
    if (bodyAppear > 0) {
      const bx = width * 0.78;
      const by = height * 0.45;

      ctx.strokeStyle = `rgba(218, 175, 65, ${bodyAppear * 0.7})`;
      ctx.lineWidth = 1.5 * s;

      // Head
      ctx.beginPath();
      ctx.ellipse(bx, by - 30 * s, 10 * s, 9 * s, 0, 0, Math.PI * 2 * bodyAppear);
      ctx.stroke();

      // Thorax
      ctx.beginPath();
      ctx.ellipse(bx, by - 5 * s, 14 * s, 16 * s, 0, 0, Math.PI * 2 * bodyAppear);
      ctx.stroke();

      // Abdomen
      ctx.beginPath();
      ctx.ellipse(bx, by + 25 * s, 11 * s, 20 * s, 0, 0, Math.PI * 2 * bodyAppear);
      ctx.stroke();

      // Legs
      if (bodyAppear > 0.4) {
        const legA = interpolate(bodyAppear, [0.4, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.strokeStyle = `rgba(218, 175, 65, ${legA * 0.5})`;
        ctx.lineWidth = 1 * s;
        for (const side of [-1, 1]) {
          for (let i = 0; i < 3; i++) {
            const ly = by - 15 * s + i * 15 * s;
            ctx.beginPath();
            ctx.moveTo(bx + side * 14 * s, ly);
            ctx.lineTo(bx + side * 40 * s * legA, ly + 20 * s * legA);
            ctx.stroke();
          }
        }
      }

      // Label
      ctx.fillStyle = `rgba(218, 175, 65, ${bodyAppear * 0.7})`;
      ctx.font = `bold ${11 * s}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("BODY", bx, height * 0.12);
    }

    // --- Bridge cable ---
    if (bridgeP > 0) {
      const startX = width * 0.35;
      const endX = width * 0.65;
      const midY = height * 0.45;
      const drawnEnd = startX + (endX - startX) * bridgeP;

      // Cable glow
      ctx.strokeStyle = `rgba(180, 120, 255, ${bridgeP * 0.15})`;
      ctx.lineWidth = 8 * s;
      ctx.beginPath();
      ctx.moveTo(startX, midY);
      ctx.lineTo(drawnEnd, midY);
      ctx.stroke();

      // Cable core
      ctx.strokeStyle = `rgba(180, 120, 255, ${bridgeP * 0.6})`;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(startX, midY);
      ctx.lineTo(drawnEnd, midY);
      ctx.stroke();

      // Cable strands
      ctx.strokeStyle = `rgba(200, 150, 255, ${bridgeP * 0.25})`;
      ctx.lineWidth = 0.8 * s;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = startX; x < drawnEnd; x += 2) {
          const yOff = Math.sin((x - startX) * 0.05 + i * 2) * 4 * s;
          if (x === startX) ctx.moveTo(x, midY + yOff);
          else ctx.lineTo(x, midY + yOff);
        }
        ctx.stroke();
      }

      // Label
      if (bridgeP > 0.8) {
        const la = interpolate(bridgeP, [0.8, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `rgba(180, 120, 255, ${la * 0.6})`;
        ctx.font = `${9 * s}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("descending neurons", (startX + endX) / 2, midY - 12 * s);
      }
    }

    // --- Signal dots ---
    if (signalP > 0) {
      const startX = width * 0.35;
      const endX = width * 0.65;
      const midY = height * 0.45;
      const span = endX - startX;

      for (let i = 0; i < 5; i++) {
        const t = ((frame * 0.04 + i * 0.2) % 1);
        const dx = startX + t * span;
        const dotAlpha = Math.sin(t * Math.PI) * signalP;

        // Signal glow
        const grad = ctx.createRadialGradient(dx, midY, 0, dx, midY, 8 * s);
        grad.addColorStop(0, `rgba(120, 255, 200, ${dotAlpha * 0.8})`);
        grad.addColorStop(1, `rgba(120, 255, 200, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(dx, midY, 8 * s, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(180, 255, 230, ${dotAlpha})`;
        ctx.beginPath();
        ctx.arc(dx, midY, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.textAlign = "start";
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
