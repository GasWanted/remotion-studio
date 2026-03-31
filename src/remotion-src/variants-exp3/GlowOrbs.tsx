import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const GlowOrbs: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; warmth: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2 + rand() * 3) * scale,
        warmth: rand(),
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges } = data;

    // Rich dark blue background
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#0a0e2a");
    bg.addColorStop(0.5, "#0d1435");
    bg.addColorStop(1, "#0a0e2a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient glow in center
    const ambient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.45);
    ambient.addColorStop(0, "rgba(30, 40, 80, 0.5)");
    ambient.addColorStop(1, "rgba(10, 14, 42, 0)");
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as soft light beams
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
      const warmA = na.warmth > 0.5 ? "255, 230, 180" : "200, 220, 255";
      const warmB = nb.warmth > 0.5 ? "255, 230, 180" : "200, 220, 255";
      grad.addColorStop(0, `rgba(${warmA}, 0.15)`);
      grad.addColorStop(0.5, `rgba(240, 240, 255, 0.08)`);
      grad.addColorStop(1, `rgba(${warmB}, 0.15)`);

      ctx.lineCap = "round";
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Softer wider glow on beam
      ctx.strokeStyle = `rgba(255, 245, 220, 0.03)`;
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Draw ground-plane reflection shadows first (behind orbs)
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);

      // Elliptical shadow below and slightly right
      ctx.save();
      ctx.translate(n.x + 2 * scale, n.y + n.r * 3);
      ctx.scale(1, 0.35);
      const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.r * 2.5);
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.2})`);
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, n.r * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Draw orbs
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.9 + Math.sin(frame * 0.05 + i * 1.5) * 0.1;
      const r = n.r * pulse;

      // Warm or cool tint
      const isWarm = n.warmth > 0.5;
      const coreR = isWarm ? 255 : 220;
      const coreG = isWarm ? 240 : 230;
      const coreB = isWarm ? 200 : 255;

      // Outer glow (large, soft)
      const outerGlow = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 6);
      outerGlow.addColorStop(0, `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha * 0.25})`);
      outerGlow.addColorStop(0.4, `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha * 0.06})`);
      outerGlow.addColorStop(1, `rgba(${coreR}, ${coreG}, ${coreB}, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 6, 0, Math.PI * 2);
      ctx.fill();

      // Main orb body
      const bodyGrad = ctx.createRadialGradient(
        n.x - r * 0.3, n.y - r * 0.3, 0,
        n.x, n.y, r
      );
      bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      bodyGrad.addColorStop(0.4, `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha * 0.85})`);
      bodyGrad.addColorStop(0.85, `rgba(${Math.floor(coreR * 0.6)}, ${Math.floor(coreG * 0.6)}, ${Math.floor(coreB * 0.6)}, ${alpha * 0.7})`);
      bodyGrad.addColorStop(1, `rgba(${Math.floor(coreR * 0.3)}, ${Math.floor(coreG * 0.3)}, ${Math.floor(coreB * 0.3)}, ${alpha * 0.5})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      const specX = n.x - r * 0.35;
      const specY = n.y - r * 0.35;
      const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, r * 0.5);
      specGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
      specGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(specX, specY, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
