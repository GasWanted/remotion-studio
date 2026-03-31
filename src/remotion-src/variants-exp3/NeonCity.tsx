import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const NeonCity: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const neonColors = [
      [340, 90, 60], // hot pink
      [15, 90, 60],  // warm orange
      [45, 85, 60],  // warm yellow
      [180, 80, 55], // cyan
      [280, 70, 60], // purple
      [200, 80, 58], // sky neon
    ];
    const nodes: { x: number; y: number; r: number; hue: number; sat: number; lit: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      const col = neonColors[Math.floor(rand() * neonColors.length)];
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2 + rand() * 2.5) * scale,
        hue: col[0], sat: col[1], lit: col[2],
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // City skyline buildings
    const cityRand = seeded(66);
    const buildings: { x: number; w: number; h: number; windows: { wx: number; wy: number }[] }[] = [];
    const skylineY = height * 0.88;
    let bx = 0;
    while (bx < width) {
      const bw = (8 + cityRand() * 18) * scale;
      const bh = (15 + cityRand() * 60) * scale;
      const wins: { wx: number; wy: number }[] = [];
      const cols = Math.floor(bw / (4 * scale));
      const rows = Math.floor(bh / (5 * scale));
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (cityRand() < 0.4) {
            wins.push({
              wx: bx + 2 * scale + c * 4 * scale,
              wy: skylineY - bh + 3 * scale + r * 5 * scale,
            });
          }
        }
      }
      buildings.push({ x: bx, w: bw, h: bh, windows: wins });
      bx += bw + (1 + cityRand() * 3) * scale;
    }
    return { nodes, edges, buildings, skylineY };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, buildings, skylineY } = data;

    // Dark night sky
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(0.6, "#121225");
    bg.addColorStop(0.85, "#1a1a30");
    bg.addColorStop(1, "#0f0f20");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Ambient city glow on horizon
    const cityGlow = ctx.createRadialGradient(width / 2, skylineY, 0, width / 2, skylineY, width * 0.6);
    cityGlow.addColorStop(0, "rgba(60, 40, 80, 0.3)");
    cityGlow.addColorStop(0.5, "rgba(40, 25, 60, 0.15)");
    cityGlow.addColorStop(1, "rgba(20, 15, 30, 0)");
    ctx.fillStyle = cityGlow;
    ctx.fillRect(0, 0, width, height);

    // City skyline silhouette
    for (const b of buildings) {
      // Building body
      ctx.fillStyle = "#0d0d18";
      ctx.fillRect(b.x, skylineY - b.h, b.w, b.h + height - skylineY);

      // Soft edge highlight
      ctx.fillStyle = "rgba(40, 35, 60, 0.3)";
      ctx.fillRect(b.x, skylineY - b.h, 1 * scale, b.h);

      // Twinkling windows
      for (const win of b.windows) {
        const twinkle = Math.sin(frame * 0.05 + win.wx * 0.3 + win.wy * 0.2) > 0.2 ? 1 : 0.3;
        const warmth = Math.sin(win.wx * 0.1 + win.wy * 0.05);
        const wh = warmth > 0 ? "255, 220, 140" : "180, 200, 255";
        ctx.fillStyle = `rgba(${wh}, ${twinkle * 0.6})`;
        ctx.fillRect(win.wx, win.wy, 2 * scale, 2.5 * scale);

        // Window glow
        if (twinkle > 0.5) {
          const winGlow = ctx.createRadialGradient(
            win.wx + 1 * scale, win.wy + 1.25 * scale, 0,
            win.wx + 1 * scale, win.wy + 1.25 * scale, 4 * scale
          );
          winGlow.addColorStop(0, `rgba(${wh}, 0.08)`);
          winGlow.addColorStop(1, `rgba(${wh}, 0)`);
          ctx.fillStyle = winGlow;
          ctx.beginPath();
          ctx.arc(win.wx + 1 * scale, win.wy + 1.25 * scale, 4 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Neon tube edges
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const avgHue = (na.hue + nb.hue) / 2;

      // Outer glow
      ctx.strokeStyle = `hsla(${avgHue}, 70%, 50%, 0.1)`;
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Inner bright
      ctx.strokeStyle = `hsla(${avgHue}, 80%, 65%, 0.35)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Neon sign nodes with double-stroke glow
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const flicker = 0.85 + Math.sin(frame * 0.1 + i * 2.1) * 0.15;

      // Outer soft glow (large)
      const outerGlow = ctx.createRadialGradient(n.x, n.y, n.r, n.x, n.y, n.r * 5);
      outerGlow.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * flicker * 0.2})`);
      outerGlow.addColorStop(0.5, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * flicker * 0.05})`);
      outerGlow.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring (soft glow)
      ctx.strokeStyle = `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * flicker * 0.3})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 1.6, 0, Math.PI * 2);
      ctx.stroke();

      // Inner ring (bright)
      ctx.strokeStyle = `hsla(${n.hue}, ${n.sat}%, ${Math.min(90, n.lit + 20)}%, ${alpha * flicker * 0.8})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.stroke();

      // Center bright fill
      const centerGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 0.8);
      centerGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat - 10}%, ${Math.min(95, n.lit + 30)}%, ${alpha * flicker * 0.6})`);
      centerGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * flicker * 0.15})`);
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
