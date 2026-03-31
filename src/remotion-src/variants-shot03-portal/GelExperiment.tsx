import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, drawPerson, easeOutBack, accent } from "./portal-utils";

/**
 * Branching Tree: A tree structure grows upward from a single root.
 * Branches split recursively, scientists appear as leaves/fruit.
 * Blue trunk, orange leaves. Organic growth animation.
 */
export const GelExperiment: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const tree = useMemo(() => {
    const rand = seeded(5005);
    const segments: { x1: number; y1: number; x2: number; y2: number; gen: number; order: number; thickness: number }[] = [];
    const leaves: { x: number; y: number; order: number; size: number }[] = [];

    let order = 0;
    function branch(x: number, y: number, angle: number, len: number, gen: number, thick: number) {
      if (gen > 6 || len < 4 * scale) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      segments.push({ x1: x, y1: y, x2, y2, gen, order: order++, thickness: thick });

      if (gen >= 3 && rand() < 0.5) {
        leaves.push({ x: x2, y: y2, order: order++, size: (3 + rand() * 3) * scale });
      }

      const spread = 0.4 + rand() * 0.3;
      const shrink = 0.65 + rand() * 0.15;
      const children = gen < 2 ? 2 : (rand() < 0.6 ? 2 : 1);
      for (let i = 0; i < children; i++) {
        const childAngle = angle + (i === 0 ? -spread : spread) + (rand() - 0.5) * 0.2;
        branch(x2, y2, childAngle, len * shrink, gen + 1, thick * 0.7);
      }
    }

    const rootX = width / 2;
    const rootY = height * 0.88;
    branch(rootX, rootY, -Math.PI / 2, 55 * scale, 0, 4 * scale);

    return { segments, leaves, rootX, rootY };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.06);
    ctx.globalAlpha = fadeOut;

    // Growth timing
    const growT = interpolate(frame, [8, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxOrder = Math.floor(growT * (tree.segments.length + tree.leaves.length));

    // Draw segments (branches)
    for (const seg of tree.segments) {
      if (seg.order > maxOrder) continue;
      const age = (maxOrder - seg.order) / 8;
      const t = Math.min(1, age);

      // Partial draw (branch grows)
      const drawT = Math.min(1, age * 2);
      const ex = seg.x1 + (seg.x2 - seg.x1) * drawT;
      const ey = seg.y1 + (seg.y2 - seg.y1) * drawT;

      ctx.globalAlpha = t * fadeOut;

      // Shadow
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = seg.thickness + 2;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(seg.x1 + 1, seg.y1 + 1); ctx.lineTo(ex + 1, ey + 1); ctx.stroke();

      // Branch with gradient
      const grad = ctx.createLinearGradient(seg.x1, seg.y1, ex, ey);
      grad.addColorStop(0, seg.gen < 2 ? C.blue + "cc" : C.blue + "88");
      grad.addColorStop(1, seg.gen < 2 ? C.blueMid + "cc" : C.blue + "55");
      ctx.strokeStyle = grad;
      ctx.lineWidth = seg.thickness;
      ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(ex, ey); ctx.stroke();

      // Highlight line
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = Math.max(0.5, seg.thickness * 0.3);
      ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(ex, ey); ctx.stroke();
    }

    // Draw leaves (scientists)
    let leafCount = 0;
    for (const leaf of tree.leaves) {
      if (leaf.order > maxOrder) continue;
      const age = (maxOrder - leaf.order) / 6;
      const t = easeOutBack(Math.min(1, age));
      if (t < 0.01) continue;

      leafCount++;
      ctx.globalAlpha = Math.min(1, age) * fadeOut;
      const r = leaf.size * t;

      // Glow
      const g = ctx.createRadialGradient(leaf.x, leaf.y, 0, leaf.x, leaf.y, r * 3);
      g.addColorStop(0, "rgba(255,140,0,0.12)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(leaf.x, leaf.y, r * 3, 0, Math.PI * 2); ctx.fill();

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath(); ctx.arc(leaf.x + 1, leaf.y + 1, r, 0, Math.PI * 2); ctx.fill();

      // Leaf (gradient orange sphere)
      const lg = ctx.createRadialGradient(leaf.x - r * 0.25, leaf.y - r * 0.25, 0, leaf.x, leaf.y, r);
      lg.addColorStop(0, "rgba(255,200,100,0.9)");
      lg.addColorStop(0.5, C.orange + "dd");
      lg.addColorStop(1, C.orangeDark + "aa");
      ctx.fillStyle = lg;
      ctx.beginPath(); ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2); ctx.fill();

      // Specular
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(leaf.x - r * 0.25, leaf.y - r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Root marker
    ctx.globalAlpha = fadeOut;
    ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(tree.rootX, tree.rootY, 4 * scale, 0, Math.PI * 2); ctx.fill();

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const count = Math.min(200, Math.floor(growT * 200));
    ctx.fillText(`${count}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
