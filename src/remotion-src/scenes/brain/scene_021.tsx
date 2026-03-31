import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../theme";

// Shot 21 — Two adjacent slices: which blob is the same neuron? (5s = 150 frames)
export const Scene021: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(2121);
    const particles = makeParticles(30, width, height, scale);
    const makeBlobs = (cx: number, cy: number) => {
      const blobs: { x: number; y: number; r: number; gray: number }[] = [];
      for (let i = 0; i < 20; i++) {
        const a = rand() * Math.PI * 2;
        const d = Math.pow(rand(), 0.5) * 70 * scale;
        blobs.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: (5 + rand() * 8) * scale, gray: 40 + rand() * 45 });
      }
      return blobs;
    };
    return { particles, blobsA: makeBlobs(width * 0.3, height * 0.48), blobsB: makeBlobs(width * 0.7, height * 0.48) };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const alpha = fadeInOut(frame, 150);
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);
    ctx.globalAlpha = alpha;

    const drawSlice = (blobs: typeof data.blobsA, cx: number, cy: number, label: string) => {
      ctx.fillStyle = `rgba(20, 18, 25, 0.8)`;
      ctx.fillRect(cx - 85 * scale, cy - 75 * scale, 170 * scale, 150 * scale);
      ctx.strokeStyle = `hsla(280, 30%, 45%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(cx - 85 * scale, cy - 75 * scale, 170 * scale, 150 * scale);
      for (const b of blobs) {
        const g = Math.round(b.gray);
        ctx.fillStyle = `rgba(${g}, ${g}, ${g + 10}, 0.8)`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(label, cx, cy - 85 * scale);
    };

    drawSlice(data.blobsA, width * 0.3, height * 0.48, "SLICE 3,847");
    drawSlice(data.blobsB, width * 0.7, height * 0.48, "SLICE 3,848");

    // Highlight one blob in A (yellow)
    const hlAlpha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (hlAlpha > 0) {
      ctx.globalAlpha = alpha * hlAlpha;
      const target = data.blobsA[3];
      ctx.strokeStyle = `hsla(50, 80%, 60%, 0.8)`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.r + 3 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${12 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("(this one)", target.x, target.y + target.r + 18 * scale);
    }

    // Question marks on candidates in B
    const qAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qAlpha > 0) {
      ctx.globalAlpha = alpha * qAlpha;
      for (const idx of [2, 5, 8]) {
        if (idx >= data.blobsB.length) continue;
        const b = data.blobsB[idx];
        ctx.strokeStyle = `hsla(50, 70%, 60%, 0.6)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r + 3 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${16 * scale}px system-ui, sans-serif`;
        ctx.fillText("?", b.x, b.y - b.r - 8 * scale);
      }
    }

    // Arrow between slices
    ctx.globalAlpha = alpha;
    const arrowAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * arrowAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${20 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("→  ?", width / 2, height * 0.48);

    // Bottom label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${13 * scale}px system-ui, sans-serif`;
    ctx.fillText("(which one?)", width * 0.7, height * 0.82);

    ctx.globalAlpha = 1;
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
