import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Watercolor: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; colorIdx: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (1.5 + rand() * 2.5) * scale,
        colorIdx: Math.floor(rand() * 5),
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Background wash blobs
    const washRand = seeded(616);
    const washes: { x: number; y: number; r: number; hue: string; drift: number; driftAngle: number }[] = [];
    const washColors = [
      "rgba(70, 50, 120, 0.04)",   // indigo
      "rgba(160, 60, 90, 0.035)",   // rose
      "rgba(80, 130, 80, 0.03)",    // sage
      "rgba(60, 80, 140, 0.025)",   // periwinkle
      "rgba(140, 100, 60, 0.02)",   // ochre
    ];
    for (let i = 0; i < 12; i++) {
      washes.push({
        x: washRand() * width,
        y: washRand() * height,
        r: (80 + washRand() * 150) * scale,
        hue: washColors[i % washColors.length],
        drift: 0.3 + washRand() * 0.7,
        driftAngle: washRand() * Math.PI * 2,
      });
    }
    // Splatter data for nodes
    const splatRand = seeded(727);
    const splatters = nodes.map(() => {
      const count = 3 + Math.floor(splatRand() * 5);
      const drops: { dx: number; dy: number; r: number }[] = [];
      for (let k = 0; k < count; k++) {
        drops.push({
          dx: (splatRand() - 0.5) * 8 * scale,
          dy: (splatRand() - 0.5) * 8 * scale,
          r: (0.5 + splatRand() * 2) * scale,
        });
      }
      return drops;
    });
    return { nodes, edges, washes, splatters };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, washes, splatters } = data;

    // Warm paper background
    ctx.fillStyle = "#f5f0e8";
    ctx.fillRect(0, 0, width, height);

    // Paper texture (subtle grain)
    const grainRand = seeded(333);
    for (let i = 0; i < 5000; i++) {
      const gx = grainRand() * width;
      const gy = grainRand() * height;
      const ga = 0.02 + grainRand() * 0.03;
      ctx.fillStyle = `rgba(180, 170, 150, ${ga})`;
      ctx.fillRect(gx, gy, 1, 1);
    }

    // Drifting watercolor washes
    for (const w of washes) {
      const dx = Math.sin(frame * 0.008 * w.drift + w.driftAngle) * 15 * scale;
      const dy = Math.cos(frame * 0.006 * w.drift + w.driftAngle * 1.3) * 10 * scale;
      const wx = w.x + dx;
      const wy = w.y + dy;

      // Multiple overlapping soft circles for bleeding effect
      for (let layer = 0; layer < 4; layer++) {
        const lr = w.r * (0.6 + layer * 0.15);
        const lx = wx + Math.sin(layer * 2.3) * w.r * 0.1;
        const ly = wy + Math.cos(layer * 1.7) * w.r * 0.1;
        const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        grad.addColorStop(0, w.hue);
        grad.addColorStop(0.4, w.hue);
        grad.addColorStop(0.7, w.hue.replace(/[\d.]+\)$/, "0.01)"));
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(lx, ly, lr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Water stain edges on some washes
    for (const w of washes) {
      const dx = Math.sin(frame * 0.008 * w.drift + w.driftAngle) * 15 * scale;
      const dy = Math.cos(frame * 0.006 * w.drift + w.driftAngle * 1.3) * 10 * scale;
      ctx.strokeStyle = w.hue.replace(/[\d.]+\)$/, "0.06)");
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      const stainR = w.r * 0.85;
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const wobble = Math.sin(a * 5 + w.drift * 10) * 5 * scale;
        const px = w.x + dx + Math.cos(a) * (stainR + wobble);
        const py = w.y + dy + Math.sin(a) * (stainR + wobble);
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Watercolor palette
    const palette = [
      [70, 50, 130],   // indigo
      [170, 70, 100],  // rose
      [90, 140, 90],   // sage
      [70, 90, 150],   // periwinkle
      [150, 110, 70],  // ochre
    ];

    // Draw edges as watery brush strokes
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const [cr, cg, cb] = palette[na.colorIdx];

      // Multiple overlapping strokes for watercolor effect
      for (let stroke = 0; stroke < 3; stroke++) {
        const strokeRand = seeded(a * 200 + b + stroke * 1000);
        const offX = (strokeRand() - 0.5) * 2 * scale;
        const offY = (strokeRand() - 0.5) * 2 * scale;
        const thickness = (0.8 + strokeRand() * 1.5) * scale;

        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.08 + strokeRand() * 0.06})`;
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";

        // Slightly curved stroke
        const mx = (na.x + nb.x) / 2 + offX * 4;
        const my = (na.y + nb.y) / 2 + offY * 4;
        ctx.beginPath();
        ctx.moveTo(na.x + offX, na.y + offY);
        ctx.quadraticCurveTo(mx, my, nb.x + offX, nb.y + offY);
        ctx.stroke();
      }
    }

    // Draw nodes as paint splatters
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 10);
      const [cr, cg, cb] = palette[n.colorIdx];
      const drops = splatters[i];

      // Main splatter blob (soft edged)
      const blobR = n.r * 3;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, blobR);
      grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.5})`);
      grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.25})`);
      grad.addColorStop(0.8, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.05})`);
      grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, blobR, 0, Math.PI * 2);
      ctx.fill();

      // Splatter drops
      for (const drop of drops) {
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(n.x + drop.dx, n.y + drop.dy, drop.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Darker center
      ctx.fillStyle = `rgba(${Math.floor(cr * 0.6)}, ${Math.floor(cg * 0.6)}, ${Math.floor(cb * 0.6)}, ${alpha * 0.6})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Water bloom ring on recent nodes
      if (age < 12) {
        const bloomR = n.r * (3 + (12 - age) * 0.5);
        const bloomAlpha = alpha * (1 - age / 12) * 0.1;
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${bloomAlpha})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(n.x, n.y, bloomR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
