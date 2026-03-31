import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";

// Shot 20 — "Each one is a cross-section of densely packed brain tissue."
// 120 frames (4s). Zoom into one EM image showing dense neuron cross-sections.

/** Draws packed circular cross-sections resembling EM brain tissue */
function drawEMBlobs(
  ctx: CanvasRenderingContext2D,
  blobs: { x: number; y: number; r: number; gray: number; membraneGray: number }[],
  alpha: number,
  scale: number,
) {
  for (const blob of blobs) {
    // Membrane ring (dark)
    ctx.strokeStyle = `hsla(0, 0%, ${blob.membraneGray}%, ${alpha})`;
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
    ctx.stroke();
    // Interior (lighter)
    ctx.fillStyle = `hsla(0, 0%, ${blob.gray}%, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    // Nucleus hint (small dark spot)
    if (blob.r > 4 * scale) {
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray - 10}%, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(blob.x + blob.r * 0.15, blob.y - blob.r * 0.1, blob.r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function generateBlobs(rand: () => number, cx: number, cy: number, areaW: number, areaH: number, count: number, minR: number, maxR: number) {
  const blobs: { x: number; y: number; r: number; gray: number; membraneGray: number }[] = [];
  for (let i = 0; i < count; i++) {
    blobs.push({
      x: cx + (rand() - 0.5) * areaW,
      y: cy + (rand() - 0.5) * areaH,
      r: minR + rand() * (maxR - minR),
      gray: 30 + rand() * 30,
      membraneGray: 12 + rand() * 15,
    });
  }
  return blobs;
}

/* ── V1: Zoom Into Grid ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20001);
    const blobs = generateBlobs(rand, width / 2, height / 2, width * 0.7, height * 0.7, 70, 3 * scale, 14 * scale);
    // Mini grid tiles for initial view
    const gridCols = 8;
    const gridRows = 5;
    const tiles: number[] = [];
    for (let i = 0; i < gridCols * gridRows; i++) tiles.push(18 + rand() * 28);
    return { blobs, tiles, gridCols, gridRows };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Phase 1: show grid (0-35)
    // Phase 2: zoom into one tile (35-70)
    // Phase 3: reveal detailed blobs (70-110)
    const zoomProgress = interpolate(frame, [35, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoomEased = zoomProgress * zoomProgress * (3 - 2 * zoomProgress);

    const tileW = width / data.gridCols;
    const tileH = height / data.gridRows;
    // Target tile: row 2, col 4
    const targetCol = 4;
    const targetRow = 2;
    const targetCx = (targetCol + 0.5) * tileW;
    const targetCy = (targetRow + 0.5) * tileH;

    if (zoomProgress < 1) {
      // Grid view with zoom
      const zoomScale = 1 + zoomEased * 7;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoomScale, zoomScale);
      ctx.translate(-targetCx * zoomEased - width / 2 * (1 - zoomEased), -targetCy * zoomEased - height / 2 * (1 - zoomEased));

      // Draw grid
      const gridAppear = interpolate(frame, [3, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < data.tiles.length; i++) {
        const col = i % data.gridCols;
        const row = Math.floor(i / data.gridCols);
        const tileAlpha = interpolate(i, [0, Math.max(1, data.tiles.length * gridAppear)], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (tileAlpha <= 0) continue;
        ctx.fillStyle = `hsla(0, 0%, ${data.tiles[i]}%, ${Math.min(1, tileAlpha + 0.5)})`;
        ctx.fillRect(col * tileW + 1, row * tileH + 1, tileW - 2, tileH - 2);
      }
      ctx.restore();
    }

    // Detailed view: fades in as zoom completes
    const detailAlpha = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (detailAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * detailAlpha;
      // Dark background
      ctx.fillStyle = `hsla(0, 0%, 15%, ${detailAlpha})`;
      ctx.fillRect(0, 0, width, height);
      drawEMBlobs(ctx, data.blobs, detailAlpha, scale);
    }

    // Label
    ctx.globalAlpha = fadeAlpha;
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
      ctx.fillRect(width * 0.1, height * 0.88, width * 0.8, 16 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("Slice #3,847 of 7,050", width / 2, height * 0.88 + 12 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Microscope Viewfinder ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20002);
    const cx = width / 2;
    const cy = height * 0.47;
    const viewR = Math.min(width, height) * 0.35;
    const blobs = generateBlobs(rand, cx, cy, viewR * 1.6, viewR * 1.6, 80, 2 * scale, 12 * scale);
    return { blobs, cx, cy, viewR };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const { cx, cy, viewR } = data;

    // Viewfinder appears
    const viewAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const currentR = viewR * viewAppear;

    // Circular mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
    ctx.clip();

    // Dark EM background
    ctx.fillStyle = "hsl(0, 0%, 15%)";
    ctx.fillRect(cx - viewR, cy - viewR, viewR * 2, viewR * 2);

    // Blobs appear gradually
    const blobProgress = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleBlobs = Math.floor(blobProgress * data.blobs.length);
    drawEMBlobs(ctx, data.blobs.slice(0, visibleBlobs), 1, scale);
    ctx.restore();

    // Viewfinder ring
    ctx.strokeStyle = `hsla(0, 0%, 50%, ${viewAppear * 0.6})`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    if (viewAppear > 0.5) {
      const crossAlpha = interpolate(viewAppear, [0.5, 1], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(0, 0%, 70%, ${crossAlpha})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - currentR, cy);
      ctx.lineTo(cx + currentR, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - currentR);
      ctx.lineTo(cx, cy + currentR);
      ctx.stroke();
      // Tick marks
      for (let t = -4; t <= 4; t++) {
        if (t === 0) continue;
        const tickLen = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + t * currentR * 0.2, cy - tickLen);
        ctx.lineTo(cx + t * currentR * 0.2, cy + tickLen);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - tickLen, cy + t * currentR * 0.2);
        ctx.lineTo(cx + tickLen, cy + t * currentR * 0.2);
        ctx.stroke();
      }
    }

    // Scale bar
    const scaleBarAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scaleBarAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * scaleBarAlpha;
      const barX = cx + viewR * 0.4;
      const barY = cy + viewR + 12 * scale;
      const barLen = 30 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barLen, barY);
      ctx.stroke();
      // End caps
      ctx.beginPath();
      ctx.moveTo(barX, barY - 3 * scale);
      ctx.lineTo(barX, barY + 3 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(barX + barLen, barY - 3 * scale);
      ctx.lineTo(barX + barLen, barY + 3 * scale);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("5 \u03BCm", barX + barLen / 2, barY + 12 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Labeled Cross-Section ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20003);
    const cx = width / 2;
    const cy = height * 0.45;
    const blobs = generateBlobs(rand, cx, cy, width * 0.65, height * 0.55, 60, 3 * scale, 15 * scale);
    // Pick specific blobs to label
    const labels = [
      { idx: 5, text: "axon", offsetX: 35, offsetY: -25 },
      { idx: 15, text: "dendrite", offsetX: -40, offsetY: -20 },
      { idx: 28, text: "glial cell", offsetX: 30, offsetY: 25 },
      { idx: 42, text: "synapse", offsetX: -35, offsetY: 20 },
    ];
    return { blobs, labels };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Phase 1: blobs appear (5-50)
    const blobProgress = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleBlobs = Math.floor(blobProgress * data.blobs.length);

    // EM background
    ctx.fillStyle = "hsla(0, 0%, 14%, 0.8)";
    ctx.fillRect(width * 0.08, height * 0.08, width * 0.84, height * 0.75);

    drawEMBlobs(ctx, data.blobs.slice(0, visibleBlobs), blobProgress, scale);

    // Phase 2: labels appear (55-100)
    for (let li = 0; li < data.labels.length; li++) {
      const label = data.labels[li];
      const labelAppear = interpolate(frame, [55 + li * 10, 65 + li * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (labelAppear <= 0 || label.idx >= data.blobs.length) continue;
      ctx.globalAlpha = fadeAlpha * labelAppear;

      const blob = data.blobs[label.idx];
      const labelX = blob.x + label.offsetX * scale;
      const labelY = blob.y + label.offsetY * scale;

      // Arrow line
      ctx.strokeStyle = `hsla(45, 60%, 65%, ${labelAppear * 0.7})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(blob.x, blob.y);
      ctx.lineTo(labelX, labelY);
      ctx.stroke();

      // Arrowhead dot
      ctx.fillStyle = `hsla(45, 70%, 70%, ${labelAppear})`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Label text with background
      ctx.font = `${8 * scale}px system-ui`;
      ctx.fillStyle = `hsla(0, 0%, 0%, ${labelAppear * 0.6})`;
      const measuredW = ctx.measureText(label.text).width;
      ctx.fillRect(labelX - measuredW / 2 - 3 * scale, labelY - 8 * scale, measuredW + 6 * scale, 12 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.textAlign = "center";
      ctx.fillText(label.text, labelX, labelY + 1 * scale);

      // Highlight circle around labeled blob
      ctx.strokeStyle = `hsla(45, 60%, 65%, ${labelAppear * 0.5})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([3 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r + 4 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Dense Blob Field ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20004);
    const blobs = generateBlobs(rand, width / 2, height / 2, width * 0.85, height * 0.8, 90, 2.5 * scale, 16 * scale);
    // Sort by distance from center for staggered appearance
    const cx = width / 2;
    const cy = height / 2;
    blobs.sort((a, b) => {
      const da = Math.sqrt((a.x - cx) ** 2 + (a.y - cy) ** 2);
      const db = Math.sqrt((b.x - cx) ** 2 + (b.y - cy) ** 2);
      return da - db;
    });
    return { blobs };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Dark EM background
    ctx.fillStyle = "hsla(0, 0%, 12%, 0.9)";
    ctx.fillRect(0, 0, width, height);

    // Blobs appear one by one, from center outward
    const fillProgress = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(fillProgress * data.blobs.length);

    for (let i = 0; i < visibleCount; i++) {
      const blob = data.blobs[i];
      // Pop-in animation
      const popDelay = (i / data.blobs.length) * 85 + 5;
      const popProgress = interpolate(frame, [popDelay, popDelay + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const popScale = popProgress < 0.7
        ? interpolate(popProgress, [0, 0.7], [0, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : interpolate(popProgress, [0.7, 1], [1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scaledR = blob.r * popScale;

      // Membrane ring
      ctx.strokeStyle = `hsla(0, 0%, ${blob.membraneGray}%, ${popProgress})`;
      ctx.lineWidth = 1.3 * scale;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, scaledR, 0, Math.PI * 2);
      ctx.stroke();
      // Interior
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray}%, ${popProgress * 0.8})`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, scaledR * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // "Densely packed" label
    const labelAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAlpha;
    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.fillRect(width * 0.2, height * 0.88, width * 0.6, 16 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("densely packed brain tissue", width / 2, height * 0.88 + 12 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Annotated EM View ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20005);
    const imgX = width * 0.08;
    const imgY = height * 0.08;
    const imgW = width * 0.84;
    const imgH = height * 0.72;
    const blobs = generateBlobs(rand, imgX + imgW / 2, imgY + imgH / 2, imgW * 0.9, imgH * 0.9, 65, 3 * scale, 14 * scale);
    return { blobs, imgX, imgY, imgW, imgH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const { imgX, imgY, imgW, imgH } = data;
    const imageAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Image background
    ctx.fillStyle = `hsla(0, 0%, 14%, ${imageAppear})`;
    ctx.fillRect(imgX, imgY, imgW, imgH);

    // Blobs
    if (imageAppear > 0.3) {
      const blobAlpha = interpolate(imageAppear, [0.3, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawEMBlobs(ctx, data.blobs, blobAlpha, scale);
    }

    // Border
    ctx.strokeStyle = `hsla(0, 0%, 40%, ${imageAppear * 0.5})`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // Annotations appear
    const annoAlpha = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (annoAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * annoAlpha;

      // Scale bar (bottom-right of image)
      const barX = imgX + imgW - 50 * scale;
      const barY = imgY + imgH - 12 * scale;
      const barLen = 35 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + barLen, barY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(barX, barY - 3 * scale);
      ctx.lineTo(barX, barY + 3 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(barX + barLen, barY - 3 * scale);
      ctx.lineTo(barX + barLen, barY + 3 * scale);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("10 \u03BCm", barX + barLen / 2, barY - 5 * scale);

      // Slice number (top-left)
      ctx.fillStyle = `hsla(0, 0%, 0%, 0.5)`;
      ctx.fillRect(imgX + 4 * scale, imgY + 4 * scale, 85 * scale, 12 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("Slice 3847 / 7050", imgX + 8 * scale, imgY + 13 * scale);

      // Resolution (top-right)
      ctx.fillStyle = `hsla(0, 0%, 0%, 0.5)`;
      ctx.fillRect(imgX + imgW - 72 * scale, imgY + 4 * scale, 68 * scale, 12 * scale);
      ctx.textAlign = "right";
      ctx.fillText("4nm/px", imgX + imgW - 8 * scale, imgY + 13 * scale);
    }

    // Date stamp
    const dateAlpha = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dateAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * dateAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("FIB-SEM \u2014 Drosophila melanogaster \u2014 2023", width / 2, imgY + imgH + 16 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Cell Membrane Detail ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height * 0.45;
    const zoomProgress = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Two adjacent large blobs (neurons)
    const blob1X = cx - 45 * scale;
    const blob2X = cx + 45 * scale;
    const blobR = 55 * scale * zoomProgress;

    // Blob 1 (left neuron)
    ctx.fillStyle = "hsla(0, 0%, 38%, 0.9)";
    ctx.beginPath();
    ctx.arc(blob1X, cy, blobR, 0, Math.PI * 2);
    ctx.fill();
    // Membrane
    ctx.strokeStyle = "hsla(0, 0%, 15%, 0.9)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(blob1X, cy, blobR, 0, Math.PI * 2);
    ctx.stroke();
    // Internal organelles
    if (zoomProgress > 0.5) {
      const orgAlpha = interpolate(zoomProgress, [0.5, 1], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(0, 0%, 28%, ${orgAlpha})`;
      ctx.beginPath();
      ctx.ellipse(blob1X - 10 * scale, cy + 8 * scale, 12 * scale, 8 * scale, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(blob1X + 15 * scale, cy - 12 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blob 2 (right neuron)
    ctx.fillStyle = "hsla(0, 0%, 42%, 0.9)";
    ctx.beginPath();
    ctx.arc(blob2X, cy, blobR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "hsla(0, 0%, 15%, 0.9)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(blob2X, cy, blobR, 0, Math.PI * 2);
    ctx.stroke();
    if (zoomProgress > 0.5) {
      const orgAlpha = interpolate(zoomProgress, [0.5, 1], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(0, 0%, 32%, ${orgAlpha})`;
      ctx.beginPath();
      ctx.ellipse(blob2X + 8 * scale, cy - 5 * scale, 10 * scale, 7 * scale, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Gap between membranes (the synapse/boundary)
    const gapAlpha = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gapAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * gapAlpha;
      // Highlight the gap area
      const gapX = cx;
      const gapW = (blob2X - blobR) - (blob1X + blobR) + 6 * scale;
      ctx.strokeStyle = `hsla(45, 70%, 65%, ${gapAlpha * 0.8})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.strokeRect(gapX - 8 * scale, cy - 30 * scale, 16 * scale, 60 * scale);
      ctx.setLineDash([]);

      // Arrow pointing to gap
      const arrowY = cy + 50 * scale;
      ctx.strokeStyle = `hsla(45, 60%, 60%, ${gapAlpha * 0.7})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(gapX, arrowY);
      ctx.lineTo(gapX, cy + 32 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gapX - 3 * scale, cy + 36 * scale);
      ctx.lineTo(gapX, cy + 32 * scale);
      ctx.lineTo(gapX + 3 * scale, cy + 36 * scale);
      ctx.stroke();

      // Label
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("membrane boundary", gapX, arrowY + 12 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.fillText("~20 nm gap", gapX, arrowY + 24 * scale);
    }

    // Neuron labels
    ctx.globalAlpha = fadeAlpha;
    const neuronLabelAlpha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * neuronLabelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron A", blob1X, cy - blobR - 8 * scale);
      ctx.fillText("neuron B", blob2X, cy - blobR - 8 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Contrast Enhanced ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20007);
    const imgX = width * 0.1;
    const imgY = height * 0.1;
    const imgW = width * 0.8;
    const imgH = height * 0.65;
    const blobs = generateBlobs(rand, imgX + imgW / 2, imgY + imgH / 2, imgW * 0.9, imgH * 0.9, 70, 3 * scale, 13 * scale);
    // Organelles inside some blobs (visible only at high contrast)
    const organelles: { x: number; y: number; r: number; gray: number }[] = [];
    for (let i = 0; i < 25; i++) {
      const parentBlob = blobs[Math.floor(rand() * blobs.length)];
      const angle = rand() * Math.PI * 2;
      const dist = rand() * parentBlob.r * 0.5;
      organelles.push({
        x: parentBlob.x + Math.cos(angle) * dist,
        y: parentBlob.y + Math.sin(angle) * dist,
        r: (1 + rand() * 2.5) * scale,
        gray: parentBlob.gray - 5 - rand() * 10,
      });
    }
    return { blobs, organelles, imgX, imgY, imgW, imgH };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const { imgX, imgY, imgW, imgH } = data;
    const contrastSlider = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const contrastMultiplier = 1 + contrastSlider * 2;

    // Image area
    ctx.fillStyle = "hsla(0, 0%, 14%, 0.9)";
    ctx.fillRect(imgX, imgY, imgW, imgH);

    // Blobs with contrast enhancement
    for (const blob of data.blobs) {
      const adjustedGray = Math.min(80, Math.max(5, (blob.gray - 30) * contrastMultiplier + 30));
      const adjustedMembrane = Math.max(3, blob.membraneGray / contrastMultiplier);
      ctx.strokeStyle = `hsla(0, 0%, ${adjustedMembrane}%, 0.9)`;
      ctx.lineWidth = (1 + contrastSlider * 0.5) * scale;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `hsla(0, 0%, ${adjustedGray}%, 0.8)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Organelles appear with contrast
    if (contrastSlider > 0.3) {
      const orgAlpha = interpolate(contrastSlider, [0.3, 0.7], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (const org of data.organelles) {
        const adjustedGray = Math.max(5, (org.gray - 30) * contrastMultiplier + 30);
        ctx.fillStyle = `hsla(0, 0%, ${adjustedGray}%, ${orgAlpha})`;
        ctx.beginPath();
        ctx.arc(org.x, org.y, org.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Border
    ctx.strokeStyle = "hsla(0, 0%, 40%, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(imgX, imgY, imgW, imgH);

    // Contrast slider UI
    const sliderX = imgX + 10 * scale;
    const sliderY = imgY + imgH + 12 * scale;
    const sliderW = imgW - 20 * scale;
    const sliderH = 6 * scale;
    // Track
    ctx.fillStyle = "hsla(0, 0%, 25%, 0.6)";
    ctx.fillRect(sliderX, sliderY, sliderW, sliderH);
    // Fill
    ctx.fillStyle = `hsla(180, 50%, 55%, 0.7)`;
    ctx.fillRect(sliderX, sliderY, sliderW * contrastSlider, sliderH);
    // Handle
    const handleX = sliderX + sliderW * contrastSlider;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.beginPath();
    ctx.arc(handleX, sliderY + sliderH / 2, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("low contrast", sliderX, sliderY + sliderH + 12 * scale);
    ctx.textAlign = "right";
    ctx.fillText("high contrast", sliderX + sliderW, sliderY + sliderH + 12 * scale);
    ctx.textAlign = "center";
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${8 * scale}px monospace`;
    ctx.fillText(`contrast: ${(contrastMultiplier).toFixed(1)}\u00D7`, width / 2, sliderY + sliderH + 24 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: 3D Cross-Section ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20008);
    const blobs = generateBlobs(rand, width / 2, height * 0.45, width * 0.6, height * 0.35, 55, 3 * scale, 12 * scale);
    return { blobs };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height * 0.45;
    const sliceW = width * 0.6;
    const sliceH = height * 0.4;

    // Tilt animation
    const tiltProgress = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tiltAngle = tiltProgress * 0.3; // perspective tilt in radians
    const perspectiveScaleY = 1 - tiltAngle * 0.8;
    const thickness = 4 * scale;

    // Shadow slices above and below (hint of adjacent sections)
    if (tiltProgress > 0.3) {
      const ghostAlpha = interpolate(tiltProgress, [0.3, 0.8], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let offset of [-1, 1]) {
        const ghostY = cy + offset * (thickness * 3 + sliceH * 0.05 * tiltProgress);
        ctx.save();
        ctx.translate(cx, ghostY);
        ctx.scale(1, perspectiveScaleY);
        ctx.fillStyle = `hsla(0, 0%, 18%, ${ghostAlpha})`;
        ctx.fillRect(-sliceW / 2, -sliceH / 2, sliceW, sliceH);
        ctx.strokeStyle = `hsla(0, 0%, 30%, ${ghostAlpha})`;
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(-sliceW / 2, -sliceH / 2, sliceW, sliceH);
        ctx.restore();
      }
    }

    // Main slice
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, perspectiveScaleY);

    // Slice face
    ctx.fillStyle = "hsla(0, 0%, 15%, 0.9)";
    ctx.fillRect(-sliceW / 2, -sliceH / 2, sliceW, sliceH);

    // EM blobs on the slice
    const blobAppear = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visBlobs = Math.floor(blobAppear * data.blobs.length);
    for (let i = 0; i < visBlobs; i++) {
      const blob = data.blobs[i];
      // Adjust blob position relative to slice center
      const bx = blob.x - cx;
      const by = blob.y - cy;
      ctx.strokeStyle = `hsla(0, 0%, ${blob.membraneGray}%, 0.8)`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, blob.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray}%, 0.7)`;
      ctx.beginPath();
      ctx.arc(bx, by, blob.r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slice border
    ctx.strokeStyle = "hsla(0, 0%, 45%, 0.5)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(-sliceW / 2, -sliceH / 2, sliceW, sliceH);

    // 3D edge (thickness visible when tilted)
    if (tiltProgress > 0.1) {
      const edgeAlpha = interpolate(tiltProgress, [0.1, 0.5], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(0, 0%, 22%, ${edgeAlpha})`;
      ctx.beginPath();
      ctx.moveTo(-sliceW / 2, sliceH / 2);
      ctx.lineTo(sliceW / 2, sliceH / 2);
      ctx.lineTo(sliceW / 2, sliceH / 2 + thickness / perspectiveScaleY);
      ctx.lineTo(-sliceW / 2, sliceH / 2 + thickness / perspectiveScaleY);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // Labels
    const labelAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("40 nm thin cross-section", cx, cy + sliceH * 0.45 + 25 * scale);

      // Arrow pointing to thickness
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1 * scale;
      const arrowX = cx + sliceW * 0.35;
      ctx.beginPath();
      ctx.moveTo(arrowX + 15 * scale, cy + sliceH * 0.25);
      ctx.lineTo(arrowX + 5 * scale, cy + sliceH * 0.45 * perspectiveScaleY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("40 nm", arrowX + 18 * scale, cy + sliceH * 0.25);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Circular Magnification ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(20009);
    const blobs = generateBlobs(rand, width / 2, height / 2, width * 0.85, height * 0.8, 80, 3 * scale, 14 * scale);
    return { blobs };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const magR = 50 * scale;
    // Magnifier path: sweeps across the image
    const sweepProgress = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const magX = width * 0.15 + sweepProgress * width * 0.7;
    const magY = height * 0.3 + Math.sin(sweepProgress * Math.PI * 2) * height * 0.15;

    // Background: all blobs slightly blurred (lower alpha, less contrast)
    ctx.fillStyle = "hsla(0, 0%, 14%, 0.9)";
    ctx.fillRect(0, 0, width, height);
    for (const blob of data.blobs) {
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray}%, 0.35)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Magnifier circle: sharp, high-contrast blobs inside
    ctx.save();
    ctx.beginPath();
    ctx.arc(magX, magY, magR, 0, Math.PI * 2);
    ctx.clip();

    // Clear area inside magnifier for re-draw
    ctx.fillStyle = "hsla(0, 0%, 10%, 1)";
    ctx.fillRect(magX - magR, magY - magR, magR * 2, magR * 2);

    // Draw blobs with full detail inside magnifier
    for (const blob of data.blobs) {
      const dx = blob.x - magX;
      const dy = blob.y - magY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > magR + blob.r + 5 * scale) continue;

      // Membrane ring (sharp)
      ctx.strokeStyle = `hsla(0, 0%, ${blob.membraneGray}%, 0.9)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
      ctx.stroke();
      // Interior
      ctx.fillStyle = `hsla(0, 0%, ${blob.gray}%, 0.85)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      // Nucleus
      if (blob.r > 5 * scale) {
        ctx.fillStyle = `hsla(0, 0%, ${blob.gray - 12}%, 0.6)`;
        ctx.beginPath();
        ctx.arc(blob.x + blob.r * 0.12, blob.y - blob.r * 0.1, blob.r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Magnifier ring
    ctx.strokeStyle = `hsla(180, 50%, 60%, 0.7)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(magX, magY, magR, 0, Math.PI * 2);
    ctx.stroke();
    // Inner glow
    const innerGlow = ctx.createRadialGradient(magX, magY, magR * 0.85, magX, magY, magR);
    innerGlow.addColorStop(0, "hsla(180, 50%, 60%, 0)");
    innerGlow.addColorStop(1, "hsla(180, 50%, 60%, 0.12)");
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(magX, magY, magR, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("enhanced detail", magX, magY + magR + 14 * scale);

    // Title
    const titleAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * titleAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("densely packed brain tissue", width / 2, height * 0.93);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_020: VariantDef[] = [
  { id: "zoom-into-grid", label: "Zoom Into Grid", component: V1 },
  { id: "microscope-viewfinder", label: "Microscope Viewfinder", component: V2 },
  { id: "labeled-cross-section", label: "Labeled Cross-Section", component: V3 },
  { id: "dense-blob-field", label: "Dense Blob Field", component: V4 },
  { id: "annotated-em-view", label: "Annotated EM View", component: V5 },
  { id: "cell-membrane-detail", label: "Cell Membrane Detail", component: V6 },
  { id: "contrast-enhanced", label: "Contrast Enhanced", component: V7 },
  { id: "3d-cross-section", label: "3D Cross-Section", component: V8 },
  { id: "circular-magnification", label: "Circular Magnification", component: V9 },
];
