import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Microscope: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; channel: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (1.5 + rand() * 2.5) * scale,
        channel: Math.floor(rand() * 3), // 0=green, 1=red, 2=blue (fluorescence channels)
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Background noise particles (autofluorescence)
    const noiseRand = seeded(505);
    const noise: { x: number; y: number; r: number; ch: number; alpha: number }[] = [];
    for (let i = 0; i < 300; i++) {
      noise.push({
        x: noiseRand() * width,
        y: noiseRand() * height,
        r: (0.3 + noiseRand() * 1.0) * scale,
        ch: Math.floor(noiseRand() * 3),
        alpha: 0.02 + noiseRand() * 0.06,
      });
    }
    return { nodes, edges, noise };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, noise } = data;
    const cx = width / 2, cy = height / 2;
    const viewportR = Math.min(width, height) * 0.44;

    // Pure black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    // Fluorescent channel colors
    const channels = [
      [0, 255, 80],    // GFP green
      [255, 60, 60],   // mCherry red
      [80, 120, 255],  // DAPI blue
    ];

    // Very subtle background noise (autofluorescence)
    for (const n of noise) {
      const [cr, cg, cb] = channels[n.ch];
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${n.alpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shot noise / hot pixels (flicker)
    const hotRand = seeded(frame * 17 + 1);
    for (let i = 0; i < 20; i++) {
      const hx = hotRand() * width;
      const hy = hotRand() * height;
      const hch = Math.floor(hotRand() * 3);
      const [cr, cg, cb] = channels[hch];
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.1 + hotRand() * 0.15})`;
      ctx.fillRect(hx, hy, 1 * scale, 1 * scale);
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as axon fibers (thin, slightly wavy fluorescent lines)
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const ch = na.channel;
      const [cr, cg, cb] = channels[ch];

      // Axon fiber: main line
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.2)`;
      ctx.lineWidth = 1 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();

      // Slightly wavy path
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / dist, ny = dx / dist;
      const segments = 8;
      const fiberRand = seeded(a * 100 + b);
      ctx.moveTo(na.x, na.y);
      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        const px = na.x + dx * t;
        const py = na.y + dy * t;
        const wobble = (fiberRand() - 0.5) * 3 * scale;
        if (s < segments) {
          ctx.lineTo(px + nx * wobble, py + ny * wobble);
        } else {
          ctx.lineTo(nb.x, nb.y);
        }
      }
      ctx.stroke();

      // Faint glow around fiber
      ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.05)`;
      ctx.lineWidth = 3 * scale;
      ctx.stroke();
    }

    // Draw nodes as fluorescent-tagged cells
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const ch = n.channel;
      const [cr, cg, cb] = channels[ch];
      const pulse = 0.7 + Math.sin(frame * 0.05 + i * 1.5) * 0.3;
      const bright = alpha * pulse;

      // Outer fluorescent halo (point spread function)
      const psfR = n.r * 6;
      const psf = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, psfR);
      psf.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${bright * 0.4})`);
      psf.addColorStop(0.2, `rgba(${cr}, ${cg}, ${cb}, ${bright * 0.15})`);
      psf.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${bright * 0.04})`);
      psf.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = psf;
      ctx.beginPath();
      ctx.arc(n.x, n.y, psfR, 0, Math.PI * 2);
      ctx.fill();

      // Cell body (brighter, smaller)
      ctx.fillStyle = `rgba(${Math.min(255, cr + 80)}, ${Math.min(255, cg + 80)}, ${Math.min(255, cb + 80)}, ${bright * 0.85})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Saturated core
      ctx.fillStyle = `rgba(255, 255, 255, ${bright * 0.5})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Microscope frame and effects (drawn OVER everything) ---
    ctx.globalAlpha = 1;

    // Circular viewport mask - darken everything outside
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(cx, cy, viewportR, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
    ctx.fill();
    ctx.restore();

    // Viewport border ring
    ctx.strokeStyle = "rgba(40, 40, 50, 0.8)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, viewportR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner subtle ring
    ctx.strokeStyle = "rgba(60, 60, 70, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, viewportR - 2 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Vignette inside viewport
    const vignette = ctx.createRadialGradient(cx, cy, viewportR * 0.5, cx, cy, viewportR);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.7, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    ctx.fillStyle = vignette;
    ctx.beginPath();
    ctx.arc(cx, cy, viewportR, 0, Math.PI * 2);
    ctx.fill();

    // Chromatic aberration ring (color fringing at edge)
    ctx.globalAlpha = 0.06;
    // Red channel shifted outward
    ctx.strokeStyle = "rgba(255, 0, 0, 1)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx + 1 * scale, cy, viewportR - 4 * scale, 0, Math.PI * 2);
    ctx.stroke();
    // Blue channel shifted inward
    ctx.strokeStyle = "rgba(0, 0, 255, 1)";
    ctx.beginPath();
    ctx.arc(cx - 1 * scale, cy, viewportR - 6 * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = fadeOut;

    // Scale bar
    const barLen = 50 * scale;
    const barX = cx + viewportR * 0.4;
    const barY = cy + viewportR * 0.8;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * fadeOut})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barLen, barY);
    ctx.stroke();
    // End caps
    ctx.beginPath();
    ctx.moveTo(barX, barY - 3 * scale);
    ctx.lineTo(barX, barY + 3 * scale);
    ctx.moveTo(barX + barLen, barY - 3 * scale);
    ctx.lineTo(barX + barLen, barY + 3 * scale);
    ctx.stroke();
    ctx.font = `${5 * scale}px sans-serif`;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * fadeOut})`;
    ctx.fillText("50 \u00B5m", barX + barLen * 0.25, barY - 5 * scale);

    // Objective info
    ctx.font = `${4 * scale}px monospace`;
    ctx.fillStyle = `rgba(200, 200, 200, ${0.3 * fadeOut})`;
    ctx.fillText("63x/1.4 Oil", cx - viewportR * 0.85, cy - viewportR * 0.85);
    ctx.fillText("Confocal", cx - viewportR * 0.85, cy - viewportR * 0.85 + 7 * scale);
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
