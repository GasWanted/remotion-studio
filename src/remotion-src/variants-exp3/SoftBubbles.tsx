import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const SoftBubbles: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; hue: number; sat: number; lit: number }[] = [];
    const palette = [
      [340, 70, 65], // warm pink
      [25, 80, 65],  // peach orange
      [45, 75, 65],  // golden yellow
      [160, 55, 60], // soft teal
      [210, 60, 65], // sky blue
      [270, 50, 68], // soft purple
      [130, 50, 60], // sage green
    ];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      const col = palette[Math.floor(rand() * palette.length)];
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2.5 + rand() * 3) * scale,
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
    // Bokeh background bubbles
    const bokehRand = seeded(77);
    const bokeh: { x: number; y: number; r: number; hue: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 25; i++) {
      bokeh.push({
        x: bokehRand() * width,
        y: bokehRand() * height,
        r: (20 + bokehRand() * 50) * scale,
        hue: [200, 220, 240, 260, 30, 340][Math.floor(bokehRand() * 6)],
        speed: 0.2 + bokehRand() * 0.4,
        phase: bokehRand() * Math.PI * 2,
      });
    }
    return { nodes, edges, bokeh };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, bokeh } = data;

    // Warm navy gradient background
    const bg = ctx.createLinearGradient(0, 0, width * 0.3, height);
    bg.addColorStop(0, "#1a1a3e");
    bg.addColorStop(0.5, "#1e2250");
    bg.addColorStop(1, "#1a1a3e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Warm center glow
    const centerGlow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.5);
    centerGlow.addColorStop(0, "rgba(60, 50, 90, 0.4)");
    centerGlow.addColorStop(1, "rgba(20, 20, 50, 0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);

    // Drifting bokeh circles
    for (const b of bokeh) {
      const drift = Math.sin(frame * 0.015 * b.speed + b.phase) * 15 * scale;
      const driftY = Math.cos(frame * 0.01 * b.speed + b.phase * 1.3) * 10 * scale;
      const bx = b.x + drift;
      const by = b.y + driftY;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
      grad.addColorStop(0, `hsla(${b.hue}, 40%, 50%, 0.06)`);
      grad.addColorStop(0.6, `hsla(${b.hue}, 30%, 40%, 0.03)`);
      grad.addColorStop(1, `hsla(${b.hue}, 20%, 30%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as thick rounded tubes with gradient
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;

      // Tube gradient along the line
      const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
      grad.addColorStop(0, `hsla(${na.hue}, ${na.sat}%, ${na.lit}%, 0.25)`);
      grad.addColorStop(0.5, `hsla(${(na.hue + nb.hue) / 2}, 40%, 70%, 0.15)`);
      grad.addColorStop(1, `hsla(${nb.hue}, ${nb.sat}%, ${nb.lit}%, 0.25)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Highlight on the tube (lighter thinner line offset up)
      ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y - 0.5 * scale);
      ctx.lineTo(nb.x, nb.y - 0.5 * scale);
      ctx.stroke();
    }

    // Draw nodes as soft 3D bubbles
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const breathe = 1 + Math.sin(frame * 0.04 + i * 1.2) * 0.06;
      const r = n.r * breathe;

      // Drop shadow below bubble
      const shadowGrad = ctx.createRadialGradient(
        n.x + 1.5 * scale, n.y + 2.5 * scale, 0,
        n.x + 1.5 * scale, n.y + 2.5 * scale, r * 1.8
      );
      shadowGrad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.25})`);
      shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.arc(n.x + 1.5 * scale, n.y + 2.5 * scale, r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Main bubble body
      const bodyGrad = ctx.createRadialGradient(
        n.x - r * 0.25, n.y - r * 0.25, r * 0.1,
        n.x, n.y, r
      );
      bodyGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${Math.min(85, n.lit + 15)}%, ${alpha * 0.95})`);
      bodyGrad.addColorStop(0.7, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * 0.9})`);
      bodyGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat - 10}%, ${n.lit - 15}%, ${alpha * 0.85})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight arc (upper-left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.clip();

      const hlX = n.x - r * 0.3;
      const hlY = n.y - r * 0.3;
      const hlGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, r * 0.7);
      hlGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.7})`);
      hlGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.15})`);
      hlGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = hlGrad;
      ctx.beginPath();
      ctx.arc(hlX, hlY, r * 0.7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Tiny sharp highlight dot
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(n.x - r * 0.25, n.y - r * 0.3, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
