import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 23 — Same neuron tracked across three stacked slices in perspective (5s = 150 frames)
export const Scene023: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2323);
    const particles = makeParticles(30, width, height, scale);
    // 3 slices with blob positions
    const slices: { ox: number; oy: number; blobs: { x: number; y: number; r: number; gray: number; isTarget: boolean }[] }[] = [];
    for (let s = 0; s < 3; s++) {
      const ox = width * 0.3 + s * 60 * scale;
      const oy = height * 0.25 + s * 80 * scale;
      const blobs: typeof slices[0]["blobs"] = [];
      for (let i = 0; i < 15; i++) {
        const a = rand() * Math.PI * 2;
        const d = rand() * 60 * scale;
        blobs.push({
          x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d,
          r: (4 + rand() * 7) * scale,
          gray: 40 + rand() * 40,
          isTarget: i === 3,
        });
      }
      slices.push({ ox, oy, blobs });
    }
    return { particles, slices };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const fanOut = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw slices back to front
    for (let s = 2; s >= 0; s--) {
      const slice = data.slices[s];
      const offsetX = s * 60 * scale * fanOut;
      const offsetY = s * 80 * scale * fanOut;
      const baseX = width * 0.3 + offsetX;
      const baseY = height * 0.25 + offsetY;

      // Slice background
      ctx.fillStyle = `rgba(20, 18, 25, ${0.6 + s * 0.1})`;
      ctx.fillRect(baseX - 80 * scale, baseY - 55 * scale, 160 * scale, 110 * scale);
      ctx.strokeStyle = `hsla(280, 30%, 45%, 0.3)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(baseX - 80 * scale, baseY - 55 * scale, 160 * scale, 110 * scale);

      // Blobs
      const dx = baseX - slice.ox, dy = baseY - slice.oy;
      for (const b of slice.blobs) {
        const bx = b.x + dx, by = b.y + dy;
        if (b.isTarget) {
          ctx.fillStyle = `hsla(220, 60%, 60%, 0.85)`;
        } else {
          const g = Math.round(b.gray);
          ctx.fillStyle = `rgba(${g}, ${g}, ${g + 10}, 0.6)`;
        }
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(`Slice ${s + 1}`, baseX - 75 * scale, baseY - 60 * scale);
    }

    // Connecting lines between target blobs
    const lineAlpha = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAlpha > 0) {
      ctx.globalAlpha = alpha * lineAlpha;
      ctx.strokeStyle = `hsla(220, 60%, 65%, 0.6)`;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      for (let s = 0; s < 2; s++) {
        const a = data.slices[s], b = data.slices[s + 1];
        const ta = a.blobs.find(bl => bl.isTarget)!;
        const tb = b.blobs.find(bl => bl.isTarget)!;
        const daX = (width * 0.3 + s * 60 * scale * fanOut) - a.ox;
        const daY = (height * 0.25 + s * 80 * scale * fanOut) - a.oy;
        const dbX = (width * 0.3 + (s + 1) * 60 * scale * fanOut) - b.ox;
        const dbY = (height * 0.25 + (s + 1) * 80 * scale * fanOut) - b.oy;
        ctx.beginPath();
        ctx.moveTo(ta.x + daX, ta.y + daY);
        ctx.lineTo(tb.x + dbX, tb.y + dbY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Label
    ctx.globalAlpha = alpha;
    const lbl = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * lbl;
    ctx.fillStyle = `hsla(220, 55%, 70%, 0.8)`;
    ctx.font = `${14 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("same neuron (blue)", width * 0.55, height * 0.88);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
