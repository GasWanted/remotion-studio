import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// Dot cloud zoom-out: fly brain (138K) -> mouse (70M) -> human (86B)
// Camera progressively pulls back, each brain becomes a speck inside the next

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface DotCluster {
  dots: { x: number; y: number; r: number; bright: number }[];
  label: string;
  count: string;
}

function buildClusters() {
  const rand = seeded(138);
  const makeDots = (n: number, cx: number, cy: number, spread: number) =>
    Array.from({ length: n }, () => {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.5) * spread;
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 0.5 + rand() * 1.5,
        bright: 0.3 + rand() * 0.7,
      };
    });

  return [
    { dots: makeDots(200, 0, 0, 40), label: "Fruit fly", count: "138,000" },
    { dots: makeDots(500, 0, 0, 200), label: "Mouse", count: "70,000,000" },
    { dots: makeDots(800, 0, 0, 900), label: "Human", count: "86,000,000,000" },
  ] as DotCluster[];
}

export const ScaleZoomOut: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const clusters = useMemo(() => buildClusters(), []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const cx = width / 2;
    const cy = height / 2;

    // Phase 1 (0-45): show fly brain close up
    // Phase 2 (45-85): zoom out to reveal mouse
    // Phase 3 (85-125): zoom out to reveal human
    const zoom = interpolate(frame, [0, 10, 45, 85, 125], [1, 1, 1, 0.12, 0.012], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // Which labels are visible
    const flyLabelA = interpolate(frame, [5, 15, 50, 60], [0, 1, 1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const mouseLabelA = interpolate(frame, [55, 65, 90, 100], [0, 1, 1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const humanLabelA = interpolate(frame, [100, 110], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const labelAlphas = [flyLabelA, mouseLabelA, humanLabelA];

    // Draw all clusters (each at its own scale relative to camera zoom)
    const colors = ["rgba(100, 180, 255,", "rgba(120, 255, 160,", "rgba(255, 200, 100,"];

    for (let ci = 0; ci < clusters.length; ci++) {
      const cluster = clusters[ci];
      for (const dot of cluster.dots) {
        const sx = cx + dot.x * zoom * scale;
        const sy = cy + dot.y * zoom * scale;
        // Cull off-screen
        if (sx < -10 || sx > width + 10 || sy < -10 || sy > height + 10) continue;
        const r = Math.max(0.3, dot.r * zoom * scale);
        if (r < 0.15) continue;
        ctx.fillStyle = `${colors[ci]} ${dot.bright * 0.9})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      if (labelAlphas[ci] > 0.01) {
        const labelY = cy + (ci === 0 ? 55 : ci === 1 ? 230 : 950) * zoom * scale;
        const labelFS = Math.max(8, (ci === 0 ? 10 : ci === 1 ? 50 : 250) * zoom * scale);
        if (labelFS > 4) {
          ctx.textAlign = "center";
          ctx.fillStyle = `rgba(255, 255, 255, ${labelAlphas[ci] * 0.9})`;
          ctx.font = `bold ${Math.min(labelFS, 18 * scale)}px monospace`;
          ctx.fillText(cluster.label, cx, Math.min(Math.max(labelY, 20), height - 30));

          ctx.fillStyle = `rgba(200, 200, 200, ${labelAlphas[ci] * 0.6})`;
          ctx.font = `${Math.min(labelFS * 0.7, 12 * scale)}px monospace`;
          ctx.fillText(cluster.count + " neurons", cx, Math.min(Math.max(labelY + 16 * scale, 36), height - 14));
        }
      }
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
