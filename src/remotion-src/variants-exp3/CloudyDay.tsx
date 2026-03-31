import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const CloudyDay: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; bright: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (1.5 + rand() * 2.5) * scale,
        bright: 0.6 + rand() * 0.4,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Cloud shapes
    const cloudRand = seeded(55);
    const clouds: { x: number; y: number; w: number; h: number; speed: number; blobs: { dx: number; dy: number; r: number }[] }[] = [];
    for (let i = 0; i < 12; i++) {
      const blobCount = 4 + Math.floor(cloudRand() * 4);
      const blobs: { dx: number; dy: number; r: number }[] = [];
      const cloudW = (40 + cloudRand() * 80) * scale;
      const cloudH = (15 + cloudRand() * 25) * scale;
      for (let b = 0; b < blobCount; b++) {
        blobs.push({
          dx: (cloudRand() - 0.5) * cloudW,
          dy: (cloudRand() - 0.5) * cloudH * 0.5,
          r: (8 + cloudRand() * 15) * scale,
        });
      }
      clouds.push({
        x: cloudRand() * width * 1.5 - width * 0.25,
        y: cloudRand() * height * 0.7,
        w: cloudW, h: cloudH,
        speed: 0.15 + cloudRand() * 0.35,
        blobs,
      });
    }
    return { nodes, edges, clouds };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, clouds } = data;

    // Sky gradient: deep blue top to warm horizon
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#1a3a6b");
    sky.addColorStop(0.4, "#3a6ea5");
    sky.addColorStop(0.7, "#7fb5d5");
    sky.addColorStop(0.9, "#f5d5a0");
    sky.addColorStop(1, "#f0c080");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Sun glow in upper-right corner
    const sunX = width * 0.82;
    const sunY = height * 0.15;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, height) * 0.4);
    sunGlow.addColorStop(0, "rgba(255, 240, 180, 0.5)");
    sunGlow.addColorStop(0.2, "rgba(255, 220, 140, 0.2)");
    sunGlow.addColorStop(0.5, "rgba(255, 200, 100, 0.05)");
    sunGlow.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, width, height);

    // Sun disc
    const sunDisc = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 12 * scale);
    sunDisc.addColorStop(0, "rgba(255, 255, 240, 0.9)");
    sunDisc.addColorStop(0.7, "rgba(255, 240, 200, 0.5)");
    sunDisc.addColorStop(1, "rgba(255, 230, 160, 0)");
    ctx.fillStyle = sunDisc;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    // Clouds drifting
    for (const cloud of clouds) {
      const drift = frame * cloud.speed * scale;
      const cloudX = ((cloud.x + drift) % (width * 1.5)) - width * 0.25;

      for (const blob of cloud.blobs) {
        const bx = cloudX + blob.dx;
        const by = cloud.y + blob.dy;

        // Cloud shadow (below)
        ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
        ctx.beginPath();
        ctx.arc(bx + 2 * scale, by + 3 * scale, blob.r, 0, Math.PI * 2);
        ctx.fill();

        // Cloud body
        const cloudGrad = ctx.createRadialGradient(bx - blob.r * 0.2, by - blob.r * 0.2, 0, bx, by, blob.r);
        cloudGrad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        cloudGrad.addColorStop(0.6, "rgba(240, 245, 255, 0.4)");
        cloudGrad.addColorStop(1, "rgba(220, 230, 245, 0)");
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Contrail edges (thin white)
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Golden dot nodes
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const twinkle = 0.85 + Math.sin(frame * 0.06 + i * 1.7) * 0.15;

      // Warm golden glow
      const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
      glowGrad.addColorStop(0, `rgba(255, 220, 120, ${alpha * n.bright * twinkle * 0.4})`);
      glowGrad.addColorStop(1, "rgba(255, 200, 100, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core golden dot
      const coreGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      coreGrad.addColorStop(0, `rgba(255, 250, 220, ${alpha * twinkle})`);
      coreGrad.addColorStop(0.6, `rgba(255, 210, 120, ${alpha * twinkle * 0.8})`);
      coreGrad.addColorStop(1, `rgba(220, 170, 80, ${alpha * twinkle * 0.3})`);
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
