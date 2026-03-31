import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawEye, drawNeuron } from "../icons";

// Shot 22 — "A segmentation network — a type of AI — goes through every image,
// pixel by pixel,"
// 150 frames (5s). AI scan line colorizes blobs.

/** Helper: draw EM-like blob field (grey blobs on dark background) */
function drawEMField(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  blobs: { rx: number; ry: number; r: number; hue: number }[],
  scale: number, colorize: (idx: number) => string | null,
) {
  // Dark background
  ctx.fillStyle = "rgba(12, 9, 20, 0.9)";
  ctx.fillRect(x, y, w, h);
  // Blobs
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    const bx = x + b.rx * w;
    const by = y + b.ry * h;
    const br = b.r * scale;
    const color = colorize(i);
    const grad = ctx.createRadialGradient(bx - br * 0.15, by - br * 0.15, 0, bx, by, br);
    if (color) {
      grad.addColorStop(0, color);
      grad.addColorStop(1, color.replace(/[\d.]+\)$/, "0.3)"));
    } else {
      grad.addColorStop(0, `hsla(${b.hue}, 12%, 48%, 0.65)`);
      grad.addColorStop(1, `hsla(${b.hue}, 8%, 38%, 0.25)`);
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }
  // Border
  ctx.strokeStyle = "hsla(220, 30%, 45%, 0.4)";
  ctx.lineWidth = 1.5 * scale;
  ctx.strokeRect(x, y, w, h);
}

function makeFieldBlobs(count: number, seed: number) {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    rx: 0.08 + rand() * 0.84,
    ry: 0.08 + rand() * 0.84,
    r: 6 + rand() * 10,
    hue: 200 + rand() * 60,
  }));
}

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Horizontal Scan Line: vertical cyan scan line sweeps left to right.
  // Behind it: blobs colorized. Ahead: grey. Labels "colored" and "raw".
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 22001), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(24, 22011), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.1;
    const fieldY = height * 0.15;
    const fieldW = width * 0.8;
    const fieldH = height * 0.6;
    // Scan line progress
    const scanProgress = interpolate(frame, [15, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scanLineX = fieldX + fieldW * scanProgress;
    // Draw the EM field with conditional coloring
    const palette = PALETTE.cellColors;
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      const bx = fieldX + blobs[idx].rx * fieldW;
      if (bx < scanLineX) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      return null;
    });
    // Scan line glow
    if (scanProgress > 0 && scanProgress < 1) {
      const lineGlow = ctx.createLinearGradient(scanLineX - 8 * scale, 0, scanLineX + 8 * scale, 0);
      lineGlow.addColorStop(0, `hsla(180, 70%, 60%, 0)`);
      lineGlow.addColorStop(0.4, `hsla(180, 70%, 60%, 0.3)`);
      lineGlow.addColorStop(0.5, `hsla(180, 80%, 70%, 0.8)`);
      lineGlow.addColorStop(0.6, `hsla(180, 70%, 60%, 0.3)`);
      lineGlow.addColorStop(1, `hsla(180, 70%, 60%, 0)`);
      ctx.fillStyle = lineGlow;
      ctx.fillRect(scanLineX - 8 * scale, fieldY, 16 * scale, fieldH);
      // Bright line
      ctx.strokeStyle = `hsla(180, 80%, 70%, 0.9)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(scanLineX, fieldY);
      ctx.lineTo(scanLineX, fieldY + fieldH);
      ctx.stroke();
    }
    // Labels: "segmented" left, "raw" right
    const labelAlpha = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0 && scanProgress > 0.1 && scanProgress < 0.9) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillText("segmented", fieldX + fieldW * 0.15, fieldY - 8 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.fillText("raw", fieldX + fieldW * 0.85, fieldY - 8 * scale);
    }
    // Progress counter
    const pct = Math.floor(scanProgress * 100);
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${pct}%`, width * 0.5, fieldY + fieldH + 25 * scale);
    // AI label
    const aiAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (aiAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * aiAlpha;
      drawEye(ctx, width * 0.5, fieldY + fieldH + 50 * scale, 22 * scale, PALETTE.accent.blue);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("segmentation AI", width * 0.5, fieldY + fieldH + 70 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Radial Scan: color expands from center outward.
  // Blobs inside the circle are colored, outside are grey.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 22002), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(26, 22021), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.1;
    const fieldY = height * 0.12;
    const fieldW = width * 0.8;
    const fieldH = height * 0.65;
    const centerFieldX = fieldX + fieldW / 2;
    const centerFieldY = fieldY + fieldH / 2;
    const maxRadius = Math.sqrt(fieldW * fieldW + fieldH * fieldH) / 2;
    // Expand radius
    const expandProgress = interpolate(frame, [15, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const colorRadius = maxRadius * expandProgress;
    // Draw field
    const palette = PALETTE.cellColors;
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      const bx = fieldX + blobs[idx].rx * fieldW;
      const by = fieldY + blobs[idx].ry * fieldH;
      const dist = Math.sqrt(Math.pow(bx - centerFieldX, 2) + Math.pow(by - centerFieldY, 2));
      if (dist < colorRadius) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      return null;
    });
    // Expanding ring
    if (expandProgress > 0 && expandProgress < 1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(fieldX, fieldY, fieldW, fieldH);
      ctx.clip();
      ctx.strokeStyle = `hsla(180, 65%, 65%, ${0.7 * (1 - expandProgress)})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(centerFieldX, centerFieldY, colorRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Glow ring
      const ringGlow = ctx.createRadialGradient(
        centerFieldX, centerFieldY, Math.max(0, colorRadius - 6 * scale),
        centerFieldX, centerFieldY, colorRadius + 6 * scale,
      );
      ringGlow.addColorStop(0, `hsla(180, 60%, 60%, 0)`);
      ringGlow.addColorStop(0.4, `hsla(180, 65%, 65%, 0.15)`);
      ringGlow.addColorStop(0.6, `hsla(180, 65%, 65%, 0.15)`);
      ringGlow.addColorStop(1, `hsla(180, 60%, 60%, 0)`);
      ctx.fillStyle = ringGlow;
      ctx.beginPath();
      ctx.arc(centerFieldX, centerFieldY, colorRadius + 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Center dot (origin of scan)
    const dotAlpha = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dotAlpha > 0 && expandProgress < 0.8) {
      ctx.globalAlpha = fadeAlpha * dotAlpha;
      ctx.fillStyle = `hsla(180, 70%, 70%, 0.8)`;
      ctx.beginPath();
      ctx.arc(centerFieldX, centerFieldY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Counter
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(expandProgress * 100)}% scanned`, width * 0.5, fieldY + fieldH + 22 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Pixel-by-Pixel Fill: grid of tiny squares turns from grey to colored
  // in a raster scan pattern. Progress bar at bottom.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22003), [width, height, scale]);
  const gridData = useMemo(() => {
    const rand = seeded(22031);
    const cols = 28;
    const rows = 20;
    const cells: { hue: number; sat: number; lit: number }[] = [];
    for (let i = 0; i < rows * cols; i++) {
      const c = PALETTE.cellColors[Math.floor(rand() * 8)];
      cells.push({ hue: c[0], sat: c[1], lit: c[2] });
    }
    return { cols, rows, cells };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const gridX = width * 0.1;
    const gridY = height * 0.12;
    const gridW = width * 0.8;
    const gridH = height * 0.6;
    const cellW = gridW / gridData.cols;
    const cellH = gridH / gridData.rows;
    const totalCells = gridData.rows * gridData.cols;
    // Number of colored cells
    const scanProgress = interpolate(frame, [10, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const coloredCount = Math.floor(scanProgress * totalCells);
    // Dark background
    ctx.fillStyle = "rgba(12, 9, 20, 0.9)";
    ctx.fillRect(gridX, gridY, gridW, gridH);
    // Draw cells
    for (let row = 0; row < gridData.rows; row++) {
      for (let col = 0; col < gridData.cols; col++) {
        const idx = row * gridData.cols + col;
        const cx = gridX + col * cellW;
        const cy = gridY + row * cellH;
        const cell = gridData.cells[idx];
        if (idx < coloredCount) {
          ctx.fillStyle = `hsla(${cell.hue}, ${cell.sat}%, ${cell.lit}%, 0.8)`;
        } else {
          ctx.fillStyle = `hsla(${cell.hue}, 8%, 38%, 0.4)`;
        }
        ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
      }
    }
    // Border
    ctx.strokeStyle = "hsla(220, 30%, 45%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(gridX, gridY, gridW, gridH);
    // Scan cursor highlight (current cell)
    if (coloredCount < totalCells && coloredCount > 0) {
      const curRow = Math.floor(coloredCount / gridData.cols);
      const curCol = coloredCount % gridData.cols;
      const curX = gridX + curCol * cellW;
      const curY = gridY + curRow * cellH;
      ctx.strokeStyle = `hsla(180, 80%, 70%, 0.9)`;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(curX - 1, curY - 1, cellW + 2, cellH + 2);
    }
    // Progress bar
    const barY = gridY + gridH + 15 * scale;
    const barW = gridW * 0.6;
    const barH = 8 * scale;
    const barX = (width - barW) / 2;
    ctx.fillStyle = "rgba(40, 30, 55, 0.6)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = PALETTE.accent.blue;
    ctx.fillRect(barX, barY, barW * scanProgress, barH);
    ctx.strokeStyle = "hsla(220, 30%, 50%, 0.5)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(barX, barY, barW, barH);
    // Percentage
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(scanProgress * 100)}%`, width * 0.5, barY + barH + 16 * scale);
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("pixel-by-pixel segmentation", width * 0.5, barY + barH + 32 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Paint Bucket Flood: cursor appears, clicks a blob, color floods to fill it.
  // Then moves to next blob. 6 blobs colored sequentially.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22004), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(18, 22041), []);
  const fillOrder = useMemo(() => [0, 3, 7, 11, 14, 17], []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.12;
    const fieldY = height * 0.12;
    const fieldW = width * 0.76;
    const fieldH = height * 0.6;
    const palette = PALETTE.cellColors;
    // Track which blobs are colored based on frame
    const framesPerBlob = 18;
    const startFrame = 15;
    const filledSet = new Set<number>();
    let currentFillIdx = -1;
    let fillProgress = 0;
    for (let i = 0; i < fillOrder.length; i++) {
      const blobStart = startFrame + i * framesPerBlob;
      const blobEnd = blobStart + framesPerBlob - 3;
      if (frame >= blobEnd) {
        filledSet.add(fillOrder[i]);
      } else if (frame >= blobStart) {
        currentFillIdx = fillOrder[i];
        fillProgress = interpolate(frame, [blobStart, blobEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      }
    }
    // Draw EM field
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      if (filledSet.has(idx)) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      if (idx === currentFillIdx && fillProgress > 0) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, ${fillProgress * 0.85})`;
      }
      return null;
    });
    // Draw filling ring for current blob
    if (currentFillIdx >= 0 && fillProgress > 0 && fillProgress < 1) {
      const b = blobs[currentFillIdx];
      const bx = fieldX + b.rx * fieldW;
      const by = fieldY + b.ry * fieldH;
      const br = b.r * scale;
      ctx.strokeStyle = `hsla(180, 70%, 65%, ${1 - fillProgress})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, br * (1 + fillProgress * 0.3), 0, Math.PI * 2 * fillProgress);
      ctx.stroke();
    }
    // Cursor icon pointing at current or next target
    const targetIdx = currentFillIdx >= 0 ? currentFillIdx : (filledSet.size < fillOrder.length ? fillOrder[filledSet.size] : -1);
    if (targetIdx >= 0 && targetIdx < blobs.length) {
      const tb = blobs[targetIdx];
      const tx = fieldX + tb.rx * fieldW + 4 * scale;
      const ty = fieldY + tb.ry * fieldH - 2 * scale;
      // Simple cursor triangle
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 5 * scale, ty + 10 * scale);
      ctx.lineTo(tx + 1 * scale, ty + 7 * scale);
      ctx.closePath();
      ctx.fill();
    }
    // Counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${filledSet.size} / ${fillOrder.length} labeled`, width * 0.5, fieldY + fieldH + 22 * scale);
    // AI eye
    const eyeAlpha = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * eyeAlpha;
    drawEye(ctx, width * 0.88, height * 0.15, 20 * scale, PALETTE.accent.blue);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px monospace`;
    ctx.fillText("AI", width * 0.88, height * 0.15 + 16 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // AI Brain Scanning: drawEye icon in corner. Beams sweep across the image.
  // Where beams touch blobs, they colorize.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22005), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(22, 22051), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.15;
    const fieldY = height * 0.15;
    const fieldW = width * 0.7;
    const fieldH = height * 0.6;
    const eyeX = width * 0.08;
    const eyeY = height * 0.12;
    // Beam sweep angle
    const sweepAngle = interpolate(frame, [15, 125], [0.1, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const palette = PALETTE.cellColors;
    // Draw EM field with beam-based coloring
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      const bx = fieldX + blobs[idx].rx * fieldW;
      const by = fieldY + blobs[idx].ry * fieldH;
      const angleToBLob = Math.atan2(by - eyeY, bx - eyeX);
      if (angleToBLob < sweepAngle && angleToBLob > 0) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      return null;
    });
    // Draw beam cone from eye
    if (sweepAngle > 0.1) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(fieldX, fieldY, fieldW, fieldH);
      ctx.clip();
      ctx.globalAlpha = fadeAlpha * 0.1;
      ctx.fillStyle = `hsla(200, 60%, 60%, 0.15)`;
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      const beamLen = Math.sqrt(fieldW * fieldW + fieldH * fieldH) * 1.2;
      ctx.lineTo(eyeX + Math.cos(0.05) * beamLen, eyeY + Math.sin(0.05) * beamLen);
      ctx.lineTo(eyeX + Math.cos(sweepAngle) * beamLen, eyeY + Math.sin(sweepAngle) * beamLen);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Leading edge beam line
      ctx.globalAlpha = fadeAlpha * 0.6;
      ctx.strokeStyle = `hsla(200, 70%, 65%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      const edgeLen = Math.sqrt(fieldW * fieldW + fieldH * fieldH);
      ctx.lineTo(eyeX + Math.cos(sweepAngle) * edgeLen, eyeY + Math.sin(sweepAngle) * edgeLen);
      ctx.stroke();
    }
    // Eye icon
    ctx.globalAlpha = fadeAlpha;
    const eyePulse = 1 + Math.sin(frame * 0.08) * 0.05;
    ctx.save();
    ctx.translate(eyeX, eyeY);
    ctx.scale(eyePulse, eyePulse);
    drawEye(ctx, 0, 0, 28 * scale, PALETTE.accent.blue);
    ctx.restore();
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("AI", eyeX, eyeY + 22 * scale);
    // Progress
    const pct = Math.floor(interpolate(sweepAngle, [0.1, 1.2], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.fillText(`${pct}%`, width * 0.5, fieldY + fieldH + 22 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Neural Net Overlay: small neural network diagram overlaid.
  // As the network "activates" (nodes light up left to right), blobs colorize.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22006), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(20, 22061), []);
  const netLayers = useMemo(() => {
    const layers = [4, 6, 6, 4, 3]; // nodes per layer
    return layers;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.08;
    const fieldY = height * 0.1;
    const fieldW = width * 0.55;
    const fieldH = height * 0.65;
    // Network activation progress
    const activationProgress = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const activeLayer = activationProgress * netLayers.length;
    const coloredFraction = activationProgress;
    // Draw EM field
    const palette = PALETTE.cellColors;
    const sortedByX = blobs.map((b, i) => ({ ...b, idx: i })).sort((a, b) => a.rx - b.rx);
    const coloredCount = Math.floor(coloredFraction * blobs.length);
    const coloredSet = new Set(sortedByX.slice(0, coloredCount).map(b => b.idx));
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      if (coloredSet.has(idx)) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      return null;
    });
    // Draw neural network on the right
    const netX = width * 0.72;
    const netW = width * 0.2;
    const netTop = height * 0.15;
    const netBottom = height * 0.7;
    const layerGap = netW / (netLayers.length - 1);
    // Draw edges first (behind nodes)
    for (let l = 0; l < netLayers.length - 1; l++) {
      const layerActivation = interpolate(activeLayer, [l, l + 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let n1 = 0; n1 < netLayers[l]; n1++) {
        const x1 = netX + l * layerGap;
        const nodeGap1 = (netBottom - netTop) / (netLayers[l] + 1);
        const y1 = netTop + (n1 + 1) * nodeGap1;
        for (let n2 = 0; n2 < netLayers[l + 1]; n2++) {
          const x2 = netX + (l + 1) * layerGap;
          const nodeGap2 = (netBottom - netTop) / (netLayers[l + 1] + 1);
          const y2 = netTop + (n2 + 1) * nodeGap2;
          ctx.strokeStyle = `hsla(220, 30%, 50%, ${layerActivation > 0 ? 0.25 : 0.08})`;
          ctx.lineWidth = 0.8 * scale;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    // Draw nodes
    for (let l = 0; l < netLayers.length; l++) {
      const layerActivation = interpolate(activeLayer, [l, l + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const nodeGap = (netBottom - netTop) / (netLayers[l] + 1);
      for (let n = 0; n < netLayers[l]; n++) {
        const nx = netX + l * layerGap;
        const ny = netTop + (n + 1) * nodeGap;
        const nodeR = 4 * scale;
        const brightness = layerActivation > 0 ? 60 + layerActivation * 20 : 35;
        const alpha = layerActivation > 0 ? 0.5 + layerActivation * 0.4 : 0.3;
        ctx.fillStyle = `hsla(220, 50%, ${brightness}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(nx, ny, nodeR, 0, Math.PI * 2);
        ctx.fill();
        // Active glow
        if (layerActivation > 0.5) {
          const glow = ctx.createRadialGradient(nx, ny, nodeR, nx, ny, nodeR * 3);
          glow.addColorStop(0, `hsla(200, 60%, 65%, ${layerActivation * 0.2})`);
          glow.addColorStop(1, `hsla(200, 60%, 65%, 0)`);
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(nx, ny, nodeR * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("segmentation network", netX + netW / 2, netBottom + 15 * scale);
    // Arrow from net output to field
    const arrowAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAlpha;
      ctx.strokeStyle = `hsla(180, 50%, 55%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([5 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(netX - 5 * scale, (netTop + netBottom) / 2);
      ctx.lineTo(fieldX + fieldW + 5 * scale, (netTop + netBottom) / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Progressive Saturation: all blobs start at 0% saturation (grey). A slider moves
  // from 0% to 100%. Each blob gradually reveals its assigned color.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22007), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(24, 22071), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.1;
    const fieldY = height * 0.12;
    const fieldW = width * 0.8;
    const fieldH = height * 0.55;
    // Saturation slider progress
    const satProgress = interpolate(frame, [15, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const palette = PALETTE.cellColors;
    // Draw field with partially saturated blobs
    ctx.fillStyle = "rgba(12, 9, 20, 0.9)";
    ctx.fillRect(fieldX, fieldY, fieldW, fieldH);
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const bx = fieldX + b.rx * fieldW;
      const by = fieldY + b.ry * fieldH;
      const br = b.r * scale;
      const c = palette[i % palette.length];
      // Stagger each blob's saturation slightly
      const blobDelay = (b.rx + b.ry) * 0.15;
      const blobSat = interpolate(satProgress, [blobDelay, Math.min(1, blobDelay + 0.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const currentSat = c[1] * blobSat;
      const currentLit = 38 + (c[2] - 38) * blobSat;
      const grad = ctx.createRadialGradient(bx - br * 0.15, by - br * 0.15, 0, bx, by, br);
      grad.addColorStop(0, `hsla(${c[0]}, ${currentSat}%, ${currentLit + 8}%, 0.8)`);
      grad.addColorStop(1, `hsla(${c[0]}, ${currentSat * 0.7}%, ${currentLit - 5}%, 0.3)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "hsla(220, 30%, 45%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(fieldX, fieldY, fieldW, fieldH);
    // Saturation slider below field
    const sliderY = fieldY + fieldH + 20 * scale;
    const sliderW = fieldW * 0.7;
    const sliderX = (width - sliderW) / 2;
    const sliderH = 6 * scale;
    // Track background (grey to colorful gradient)
    const trackGrad = ctx.createLinearGradient(sliderX, 0, sliderX + sliderW, 0);
    trackGrad.addColorStop(0, "rgba(120, 120, 120, 0.5)");
    trackGrad.addColorStop(1, `hsla(220, 65%, 60%, 0.7)`);
    ctx.fillStyle = trackGrad;
    ctx.fillRect(sliderX, sliderY, sliderW, sliderH);
    ctx.strokeStyle = "hsla(220, 30%, 50%, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(sliderX, sliderY, sliderW, sliderH);
    // Slider thumb
    const thumbX = sliderX + sliderW * satProgress;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(thumbX, sliderY + sliderH / 2, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "hsla(220, 40%, 55%, 0.7)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(thumbX, sliderY + sliderH / 2, 5 * scale, 0, Math.PI * 2);
    ctx.stroke();
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("grey", sliderX, sliderY - 6 * scale);
    ctx.textAlign = "right";
    ctx.fillText("colored", sliderX + sliderW, sliderY - 6 * scale);
    // Percentage
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${13 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(satProgress * 100)}%`, width * 0.5, sliderY + sliderH + 22 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Grid Cell Activation: EM image divided into grid cells. Each lights up
  // in a sweep. When a cell activates, its blob gets colored.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22008), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(22, 22081), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.1;
    const fieldY = height * 0.12;
    const fieldW = width * 0.8;
    const fieldH = height * 0.62;
    const gridCols = 8;
    const gridRows = 6;
    const cellW = fieldW / gridCols;
    const cellH = fieldH / gridRows;
    const totalCells = gridCols * gridRows;
    // Sweep progress
    const sweepProgress = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const activatedCells = Math.floor(sweepProgress * totalCells);
    const palette = PALETTE.cellColors;
    // Dark background
    ctx.fillStyle = "rgba(12, 9, 20, 0.9)";
    ctx.fillRect(fieldX, fieldY, fieldW, fieldH);
    // Draw blobs (colored if their cell is activated)
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const bx = fieldX + b.rx * fieldW;
      const by = fieldY + b.ry * fieldH;
      const br = b.r * scale;
      // Which cell does this blob fall in?
      const cellCol = Math.floor(b.rx * gridCols);
      const cellRow = Math.floor(b.ry * gridRows);
      const cellIdx = cellRow * gridCols + cellCol;
      const isActivated = cellIdx < activatedCells;
      const grad = ctx.createRadialGradient(bx - br * 0.15, by - br * 0.15, 0, bx, by, br);
      if (isActivated) {
        const c = palette[i % palette.length];
        grad.addColorStop(0, `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`);
        grad.addColorStop(1, `hsla(${c[0]}, ${c[1]}%, ${c[2] - 10}%, 0.35)`);
      } else {
        grad.addColorStop(0, `hsla(${b.hue}, 12%, 48%, 0.65)`);
        grad.addColorStop(1, `hsla(${b.hue}, 8%, 38%, 0.25)`);
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }
    // Draw grid overlay
    ctx.strokeStyle = "hsla(220, 25%, 45%, 0.15)";
    ctx.lineWidth = 0.8 * scale;
    for (let col = 0; col <= gridCols; col++) {
      ctx.beginPath();
      ctx.moveTo(fieldX + col * cellW, fieldY);
      ctx.lineTo(fieldX + col * cellW, fieldY + fieldH);
      ctx.stroke();
    }
    for (let row = 0; row <= gridRows; row++) {
      ctx.beginPath();
      ctx.moveTo(fieldX, fieldY + row * cellH);
      ctx.lineTo(fieldX + fieldW, fieldY + row * cellH);
      ctx.stroke();
    }
    // Highlight currently activating cell
    if (activatedCells < totalCells) {
      const curRow = Math.floor(activatedCells / gridCols);
      const curCol = activatedCells % gridCols;
      const hlX = fieldX + curCol * cellW;
      const hlY = fieldY + curRow * cellH;
      ctx.strokeStyle = `hsla(180, 70%, 65%, 0.8)`;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(hlX, hlY, cellW, cellH);
      // Glow
      ctx.fillStyle = `hsla(180, 60%, 60%, 0.08)`;
      ctx.fillRect(hlX, hlY, cellW, cellH);
    }
    // Border
    ctx.strokeStyle = "hsla(220, 30%, 45%, 0.5)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(fieldX, fieldY, fieldW, fieldH);
    // Counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`cell ${activatedCells} / ${totalCells}`, width * 0.5, fieldY + fieldH + 20 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Brush Strokes: invisible paintbrush strokes sweep across the image.
  // Each stroke reveals color underneath. Multiple overlapping strokes.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 22009), [width, height, scale]);
  const blobs = useMemo(() => makeFieldBlobs(24, 22091), []);
  const strokes = useMemo(() => {
    const rand = seeded(22092);
    return Array.from({ length: 8 }, (_, i) => ({
      y: 0.08 + (i / 7) * 0.84,
      startFrame: 10 + i * 12,
      width: 0.06 + rand() * 0.06,
      angle: (rand() - 0.5) * 0.15,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const fieldX = width * 0.1;
    const fieldY = height * 0.1;
    const fieldW = width * 0.8;
    const fieldH = height * 0.65;
    // Compute which blobs have been "painted" by strokes
    const paintedSet = new Set<number>();
    for (const stroke of strokes) {
      const strokeProgress = interpolate(frame, [stroke.startFrame, stroke.startFrame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (strokeProgress <= 0) continue;
      const strokeEndX = strokeProgress;
      const strokeBandTop = stroke.y - stroke.width;
      const strokeBandBottom = stroke.y + stroke.width;
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const rotatedY = b.ry + (b.rx - 0.5) * stroke.angle;
        if (b.rx <= strokeEndX && rotatedY >= strokeBandTop && rotatedY <= strokeBandBottom) {
          paintedSet.add(i);
        }
      }
    }
    // Draw EM field
    const palette = PALETTE.cellColors;
    drawEMField(ctx, fieldX, fieldY, fieldW, fieldH, blobs, scale, (idx) => {
      if (paintedSet.has(idx)) {
        const c = palette[idx % palette.length];
        return `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.85)`;
      }
      return null;
    });
    // Draw brush stroke trails
    for (const stroke of strokes) {
      const strokeProgress = interpolate(frame, [stroke.startFrame, stroke.startFrame + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (strokeProgress <= 0) continue;
      const brushX = fieldX + fieldW * strokeProgress;
      const brushY = fieldY + stroke.y * fieldH;
      // Brush trail (subtle)
      const trailStartX = fieldX;
      ctx.globalAlpha = fadeAlpha * 0.1;
      ctx.fillStyle = `hsla(50, 40%, 55%, 0.08)`;
      ctx.beginPath();
      ctx.moveTo(trailStartX, brushY - stroke.width * fieldH);
      ctx.lineTo(brushX, brushY - stroke.width * fieldH + stroke.angle * fieldW * strokeProgress);
      ctx.lineTo(brushX, brushY + stroke.width * fieldH + stroke.angle * fieldW * strokeProgress);
      ctx.lineTo(trailStartX, brushY + stroke.width * fieldH);
      ctx.closePath();
      ctx.fill();
      // Brush head
      if (strokeProgress < 1) {
        ctx.globalAlpha = fadeAlpha * (1 - strokeProgress * 0.5);
        ctx.fillStyle = `hsla(50, 55%, 65%, 0.5)`;
        ctx.beginPath();
        ctx.ellipse(brushX, brushY + stroke.angle * fieldW * strokeProgress, 4 * scale, stroke.width * fieldH * 0.5, stroke.angle, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = fadeAlpha;
    // Counter
    const pct = Math.floor((paintedSet.size / blobs.length) * 100);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${pct}% revealed`, width * 0.5, fieldY + fieldH + 22 * scale);
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.fillText("AI brush strokes reveal structure", width * 0.5, fieldY + fieldH + 40 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_022: VariantDef[] = [
  { id: "scan-line", label: "Horizontal Scan", component: V1 },
  { id: "radial-scan", label: "Radial Scan", component: V2 },
  { id: "pixel-fill", label: "Pixel-by-Pixel", component: V3 },
  { id: "paint-bucket", label: "Paint Bucket", component: V4 },
  { id: "ai-beam", label: "AI Brain Scanning", component: V5 },
  { id: "neural-net", label: "Neural Net Overlay", component: V6 },
  { id: "saturation", label: "Progressive Saturation", component: V7 },
  { id: "grid-cell", label: "Grid Cell Activation", component: V8 },
  { id: "brush-strokes", label: "Brush Strokes", component: V9 },
];
