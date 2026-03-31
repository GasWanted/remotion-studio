import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const ConnectomeReveal: React.FC<VariantProps> = ({
  width,
  height,
}) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const neurons = useMemo(() => {
    const rand = seeded(808);
    const cx = 0.5;
    const cy = 0.48;
    const count = 300;
    const items: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      hue: number;
      size: number;
      delay: number;
      edge: number; // 0=top, 1=right, 2=bottom, 3=left
    }[] = [];

    for (let i = 0; i < count; i++) {
      // Target position: brain-shaped cloud (elliptical)
      const angle = rand() * Math.PI * 2;
      const rNorm = Math.pow(rand(), 0.5);
      const rx = 0.3;
      const ry = 0.25;
      const endX = cx + Math.cos(angle) * rNorm * rx;
      const endY = cy + Math.sin(angle) * rNorm * ry;

      // Start from edges
      const edge = Math.floor(rand() * 4);
      let startX: number, startY: number;
      switch (edge) {
        case 0: startX = rand(); startY = -0.05; break;
        case 1: startX = 1.05; startY = rand(); break;
        case 2: startX = rand(); startY = 1.05; break;
        default: startX = -0.05; startY = rand(); break;
      }

      items.push({
        startX,
        startY,
        endX,
        endY,
        hue: Math.floor(rand() * 360),
        size: 1.5 + rand() * 3,
        delay: rand() * 60,
        edge,
      });
    }
    return items;
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width * 0.5;
    const cy = height * 0.48;

    // Brain outline (subtle)
    const outlineAlpha = interpolate(frame, [60, 110], [0, 0.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (outlineAlpha > 0) {
      ctx.strokeStyle = `rgba(100, 150, 255, ${outlineAlpha})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.ellipse(cx, cy, width * 0.3, height * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw neurons
    for (const n of neurons) {
      const t = interpolate(frame, [n.delay, n.delay + 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });

      if (t <= 0) continue;

      const x = (n.startX + (n.endX - n.startX) * t) * width;
      const y = (n.startY + (n.endY - n.startY) * t) * height;
      const r = n.size * scale * Math.min(t * 2, 1);

      // Trail
      if (t < 0.8) {
        const trailLen = 0.15;
        const tx = (n.startX + (n.endX - n.startX) * Math.max(t - trailLen, 0)) * width;
        const ty = (n.startY + (n.endY - n.startY) * Math.max(t - trailLen, 0)) * height;
        ctx.strokeStyle = `hsla(${n.hue}, 60%, 60%, ${0.2 * (1 - t)})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Neuron dot
      ctx.fillStyle = `hsla(${n.hue}, 65%, 60%, ${0.5 + t * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Glow when settled
      if (t > 0.9) {
        ctx.fillStyle = `hsla(${n.hue}, 65%, 60%, 0.08)`;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Central glow building up
    const glowAlpha = interpolate(frame, [40, 120], [0, 0.12], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    if (glowAlpha > 0) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * 0.3);
      grad.addColorStop(0, `rgba(100, 160, 255, ${glowAlpha})`);
      grad.addColorStop(1, "rgba(100, 160, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
