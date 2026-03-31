import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut, makeCells, drawCell } from "../scenes/theme";
import { drawEye, drawX, drawCheck, drawCursor } from "../icons";

// Shot 25 — "The AI did most of the heavy lifting, but it made mistakes."
// 120 frames (4s). AI segmentation error highlighted.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Red Circle Error: EM-style view with 30+ blobs. Two blobs that should be same color are different.
  // Red pulsing circle highlights error. Dotted line shows where they should connect.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25001), [width, height, scale]);
  const blobs = useMemo(() => {
    const rand = seeded(25011);
    const items: { x: number; y: number; radius: number; hue: number }[] = [];
    for (let i = 0; i < 35; i++) {
      items.push({
        x: width * (0.1 + rand() * 0.8),
        y: height * (0.12 + rand() * 0.6),
        radius: (3 + rand() * 5) * scale,
        hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      });
    }
    return items;
  }, [width, height, scale]);
  // Two error blobs: indices 5 and 12 should be same color but aren't
  const errorIdxA = 5;
  const errorIdxB = 12;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Blobs appear in stagger
    const blobProgress = interpolate(frame, [5, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(blobProgress * blobs.length);
    for (let i = 0; i < visibleCount; i++) {
      const blob = blobs[i];
      const blobAlpha = interpolate(frame, [5 + i * 1.1, 10 + i * 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * blobAlpha;
      const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
      grad.addColorStop(0, `hsla(${blob.hue}, 55%, 60%, 0.85)`);
      grad.addColorStop(1, `hsla(${blob.hue}, 45%, 45%, 0.4)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red pulsing circle around error blob A
    const errorAppear = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errorAppear > 0) {
      ctx.globalAlpha = fadeAlpha * errorAppear;
      const blobA = blobs[errorIdxA];
      const blobB = blobs[errorIdxB];
      const pulse = 1 + Math.sin(frame * 0.12) * 0.15;
      // Red ring around error A
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(blobA.x, blobA.y, (blobA.radius + 6 * scale) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      // Red ring around error B
      ctx.beginPath();
      ctx.arc(blobB.x, blobB.y, (blobB.radius + 6 * scale) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      // Dotted line between them
      const lineProgress = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lineProgress > 0) {
        ctx.globalAlpha = fadeAlpha * lineProgress;
        ctx.strokeStyle = `hsla(0, 70%, 60%, 0.6)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.moveTo(blobA.x, blobA.y);
        const endX = blobA.x + (blobB.x - blobA.x) * lineProgress;
        const endY = blobA.y + (blobB.y - blobA.y) * lineProgress;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    // "AI error" label
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = "center";
      const midX = (blobs[errorIdxA].x + blobs[errorIdxB].x) / 2;
      const midY = (blobs[errorIdxA].y + blobs[errorIdxB].y) / 2;
      ctx.fillText("\u2298 AI error", midX, midY - 12 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Before/After Wrong Color: split view. Left correct, right has one miscolored blob.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25002), [width, height, scale]);
  const blobs = useMemo(() => {
    const rand = seeded(25021);
    return Array.from({ length: 18 }, (_, i) => ({
      relX: 0.15 + rand() * 0.7,
      relY: 0.2 + rand() * 0.5,
      radius: (3 + rand() * 4) * scale,
      hue: PALETTE.cellColors[i % 8][0],
    }));
  }, [scale]);
  const errorIdx = 7;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    // Divider
    const dividerAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dividerAppear > 0) {
      ctx.globalAlpha = fadeAlpha * dividerAppear;
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.5)`;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([5 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(width / 2, height * 0.08);
      ctx.lineTo(width / 2, height * 0.85);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Labels
    const labelAppear = interpolate(frame, [8, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAppear > 0) {
      ctx.globalAlpha = fadeAlpha * labelAppear;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillText("ground truth", width * 0.25, height * 0.1);
      ctx.fillStyle = PALETTE.accent.red;
      ctx.fillText("AI result", width * 0.75, height * 0.1);
    }
    // Left side: correct blobs
    const leftAppear = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(leftAppear * blobs.length); i++) {
      const blob = blobs[i];
      ctx.globalAlpha = fadeAlpha * leftAppear;
      ctx.fillStyle = `hsla(${blob.hue}, 55%, 58%, 0.8)`;
      ctx.beginPath();
      ctx.arc(blob.relX * width * 0.45 + width * 0.03, blob.relY * height, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Right side: mostly correct, one miscolored
    const rightAppear = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(rightAppear * blobs.length); i++) {
      const blob = blobs[i];
      ctx.globalAlpha = fadeAlpha * rightAppear;
      const wrongHue = i === errorIdx ? PALETTE.cellColors[(i + 4) % 8][0] : blob.hue;
      ctx.fillStyle = `hsla(${wrongHue}, 55%, 58%, 0.8)`;
      const bx = blob.relX * width * 0.45 + width * 0.52;
      const by = blob.relY * height;
      ctx.beginPath();
      ctx.arc(bx, by, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red highlight on mismatch + X stamp
    const highlightAppear = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (highlightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * highlightAppear;
      const errBlob = blobs[errorIdx];
      const ex = errBlob.relX * width * 0.45 + width * 0.52;
      const ey = errBlob.relY * height;
      const pulse = 1 + Math.sin(frame * 0.1) * 0.12;
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(ex, ey, (errBlob.radius + 8 * scale) * pulse, 0, Math.PI * 2);
      ctx.stroke();
      const stampScale = 1 + (1 - highlightAppear) * 1.5;
      ctx.save();
      ctx.translate(ex + 14 * scale, ey - 14 * scale);
      ctx.scale(stampScale, stampScale);
      drawX(ctx, 0, 0, 12 * scale, PALETTE.accent.red);
      ctx.restore();
    }
    // Bottom label
    const bottomAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("one wrong color can derail downstream analysis", width / 2, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Broken Connection: two blobs that should be connected. The line is broken with red glow gap.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25003), [width, height, scale]);
  const cells = useMemo(() => makeCells(20, width / 2, height * 0.42, Math.min(width, height) * 0.32, scale, 25031), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Draw cells with stagger
    const cellProgress = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visCount = Math.floor(cellProgress * cells.length);
    for (let i = 0; i < visCount; i++) {
      const cellAlpha = interpolate(frame, [5 + i * 1.5, 12 + i * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawCell(ctx, cells[i], frame, fadeAlpha * cellAlpha, false, scale);
    }
    // Two neurons that should be connected: pick cells 3 and 8
    const neuronA = cells[3];
    const neuronB = cells[8];
    // Connection line that's broken
    const lineAppear = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lineAppear;
      const midX = (neuronA.x + neuronB.x) / 2;
      const midY = (neuronA.y + neuronB.y) / 2;
      const gapSize = 12 * scale;
      // Line from A to gap
      ctx.strokeStyle = `hsla(${neuronA.hue}, 50%, 60%, 0.7)`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(neuronA.x, neuronA.y);
      ctx.lineTo(midX - gapSize, midY);
      ctx.stroke();
      // Line from gap to B
      ctx.beginPath();
      ctx.moveTo(midX + gapSize, midY);
      ctx.lineTo(neuronB.x, neuronB.y);
      ctx.stroke();
      // Red glow in gap
      const breakGlow = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (breakGlow > 0) {
        const pulse = 0.6 + Math.sin(frame * 0.1) * 0.3;
        const glowGrad = ctx.createRadialGradient(midX, midY, 0, midX, midY, gapSize * 2);
        glowGrad.addColorStop(0, `hsla(0, 70%, 55%, ${breakGlow * pulse * 0.6})`);
        glowGrad.addColorStop(1, `hsla(0, 60%, 40%, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(midX, midY, gapSize * 2, 0, Math.PI * 2);
        ctx.fill();
        // Jagged break marks
        ctx.strokeStyle = `hsla(0, 70%, 55%, ${breakGlow * 0.8})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(midX - gapSize, midY - 4 * scale);
        ctx.lineTo(midX - gapSize + 3 * scale, midY + 2 * scale);
        ctx.lineTo(midX - gapSize, midY + 5 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(midX + gapSize, midY - 4 * scale);
        ctx.lineTo(midX + gapSize - 3 * scale, midY + 2 * scale);
        ctx.lineTo(midX + gapSize, midY + 5 * scale);
        ctx.stroke();
      }
    }
    // "Split error" label
    const labelAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      const midX = (neuronA.x + neuronB.x) / 2;
      const midY = (neuronA.y + neuronB.y) / 2;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("split error", midX, midY + 20 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("AI cut one neuron into two", midX, midY + 34 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Error Popup: clean EM view. A notification popup slides in from the right.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25004), [width, height, scale]);
  const cells = useMemo(() => makeCells(25, width * 0.4, height * 0.45, Math.min(width, height) * 0.28, scale, 25041), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Draw cells
    const cellProgress = interpolate(frame, [3, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(cellProgress * cells.length); i++) {
      drawCell(ctx, cells[i], frame, fadeAlpha * cellProgress, false, scale);
    }
    // One cell gets highlighted as problematic
    const highlightIdx = 11;
    const highlightAppear = interpolate(frame, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (highlightAppear > 0 && highlightIdx < cells.length) {
      ctx.globalAlpha = fadeAlpha * highlightAppear;
      const errCell = cells[highlightIdx];
      const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(errCell.x, errCell.y, (errCell.r + 8 * scale) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Notification popup slides in from right
    const popupSlide = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (popupSlide > 0) {
      ctx.globalAlpha = fadeAlpha * popupSlide;
      const popupW = 140 * scale;
      const popupH = 55 * scale;
      const popupTargetX = width * 0.72;
      const popupX = width + popupW - (width + popupW - popupTargetX + popupW / 2) * popupSlide;
      const popupY = height * 0.25;
      // Shadow
      ctx.fillStyle = `rgba(0, 0, 0, 0.3)`;
      ctx.fillRect(popupX - popupW / 2 + 3 * scale, popupY - popupH / 2 + 3 * scale, popupW, popupH);
      // Background
      ctx.fillStyle = `hsla(220, 25%, 18%, 0.95)`;
      ctx.fillRect(popupX - popupW / 2, popupY - popupH / 2, popupW, popupH);
      // Left accent stripe
      ctx.fillStyle = PALETTE.accent.red;
      ctx.fillRect(popupX - popupW / 2, popupY - popupH / 2, 3 * scale, popupH);
      // Border
      ctx.strokeStyle = `hsla(0, 50%, 50%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(popupX - popupW / 2, popupY - popupH / 2, popupW, popupH);
      // Warning icon
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${14 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("\u26A0", popupX - popupW / 2 + 8 * scale, popupY - popupH / 2 + 18 * scale);
      // Title
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${8 * scale}px system-ui`;
      ctx.fillText("Error detected", popupX - popupW / 2 + 24 * scale, popupY - popupH / 2 + 16 * scale);
      // Body text
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("neuron #847 incorrectly", popupX - popupW / 2 + 8 * scale, popupY - popupH / 2 + 32 * scale);
      ctx.fillText("split. Fix required.", popupX - popupW / 2 + 8 * scale, popupY - popupH / 2 + 44 * scale);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("mistakes happen at scale", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Magnifying Glass on Error: drawEye scanning across blobs, pauses, zoom circle reveals error.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25005), [width, height, scale]);
  const blobs = useMemo(() => {
    const rand = seeded(25051);
    return Array.from({ length: 28 }, () => ({
      x: width * (0.1 + rand() * 0.8),
      y: height * (0.12 + rand() * 0.6),
      radius: (3 + rand() * 4) * scale,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, [width, height, scale]);
  const errorBlob = blobs[15];
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Draw all blobs quickly
    const blobAppear = interpolate(frame, [3, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(blobAppear * blobs.length); i++) {
      const blob = blobs[i];
      ctx.fillStyle = `hsla(${blob.hue}, 50%, 55%, 0.75)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Eye icon scanning across — moves from left to error position
    const scanPhase = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eyeX = interpolate(scanPhase, [0, 0.7, 1], [width * 0.1, errorBlob.x, errorBlob.x], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eyeY = interpolate(scanPhase, [0, 0.7, 1], [height * 0.3, errorBlob.y - 25 * scale, errorBlob.y - 25 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scanPhase > 0) {
      ctx.globalAlpha = fadeAlpha;
      drawEye(ctx, eyeX, eyeY, 22 * scale, PALETTE.accent.gold);
      // Scan beam below eye
      if (scanPhase < 0.7) {
        ctx.strokeStyle = `hsla(50, 60%, 60%, 0.2)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(eyeX - 10 * scale, eyeY + 6 * scale);
        ctx.lineTo(eyeX - 20 * scale, eyeY + 40 * scale);
        ctx.moveTo(eyeX + 10 * scale, eyeY + 6 * scale);
        ctx.lineTo(eyeX + 20 * scale, eyeY + 40 * scale);
        ctx.stroke();
      }
    }
    // Magnifying zoom circle appears around error
    const zoomAppear = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (zoomAppear > 0) {
      ctx.globalAlpha = fadeAlpha * zoomAppear;
      const zoomRadius = 28 * scale * zoomAppear;
      // Magnifying ring
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(errorBlob.x, errorBlob.y, zoomRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Handle
      const handleAngle = Math.PI * 0.25;
      ctx.lineWidth = 3.5 * scale;
      ctx.beginPath();
      ctx.moveTo(errorBlob.x + Math.cos(handleAngle) * zoomRadius, errorBlob.y + Math.sin(handleAngle) * zoomRadius);
      ctx.lineTo(errorBlob.x + Math.cos(handleAngle) * (zoomRadius + 15 * scale), errorBlob.y + Math.sin(handleAngle) * (zoomRadius + 15 * scale));
      ctx.stroke();
      // Red highlight inside zoom
      const innerPulse = 0.5 + Math.sin(frame * 0.12) * 0.3;
      ctx.strokeStyle = `hsla(0, 70%, 55%, ${innerPulse})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(errorBlob.x, errorBlob.y, errorBlob.radius + 4 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Label
    const labelAlpha = interpolate(frame, [82, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("wrong boundary", errorBlob.x, errorBlob.y + 38 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Diff View: ground truth left, AI right, differences highlighted in red. Accuracy percentage.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 25006), [width, height, scale]);
  const gridCells = useMemo(() => {
    const rand = seeded(25061);
    const cols = 10;
    const rows = 6;
    const items: { col: number; row: number; hue: number; isError: boolean }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isError = rand() < 0.08;
        items.push({
          col: c, row: r,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
          isError,
        });
      }
    }
    return items;
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const cellSize = 9 * scale;
    const gap = 2 * scale;
    const gridW = 10 * (cellSize + gap);
    const gridH = 6 * (cellSize + gap);
    // Left grid: ground truth
    const leftAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const leftOriginX = width * 0.25 - gridW / 2;
    const leftOriginY = height * 0.42 - gridH / 2;
    // Labels
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("ground truth", width * 0.25, leftOriginY - 12 * scale);
    }
    for (const cell of gridCells) {
      const delay = (cell.row * 10 + cell.col) * 0.3;
      const cellAlpha = interpolate(frame, [8 + delay, 14 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cellAlpha <= 0) continue;
      ctx.globalAlpha = fadeAlpha * cellAlpha;
      const x = leftOriginX + cell.col * (cellSize + gap);
      const y = leftOriginY + cell.row * (cellSize + gap);
      ctx.fillStyle = `hsla(${cell.hue}, 50%, 55%, 0.8)`;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
    // Right grid: AI result (errors are different color)
    const rightAppear = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rightOriginX = width * 0.75 - gridW / 2;
    const rightOriginY = height * 0.42 - gridH / 2;
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("AI result", width * 0.75, rightOriginY - 12 * scale);
    }
    for (const cell of gridCells) {
      const delay = (cell.row * 10 + cell.col) * 0.3;
      const cellAlpha = interpolate(frame, [28 + delay, 34 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cellAlpha <= 0) continue;
      ctx.globalAlpha = fadeAlpha * cellAlpha;
      const x = rightOriginX + cell.col * (cellSize + gap);
      const y = rightOriginY + cell.row * (cellSize + gap);
      const hueToUse = cell.isError ? 0 : cell.hue;
      ctx.fillStyle = `hsla(${hueToUse}, 50%, 55%, 0.8)`;
      ctx.fillRect(x, y, cellSize, cellSize);
    }
    // Highlight errors with red outlines
    const errorHighlight = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errorHighlight > 0) {
      ctx.globalAlpha = fadeAlpha * errorHighlight;
      const pulse = 1 + Math.sin(frame * 0.12) * 0.15;
      for (const cell of gridCells) {
        if (!cell.isError) continue;
        const x = rightOriginX + cell.col * (cellSize + gap);
        const y = rightOriginY + cell.row * (cellSize + gap);
        ctx.strokeStyle = PALETTE.accent.red;
        ctx.lineWidth = 2 * scale * pulse;
        ctx.strokeRect(x - 2 * scale, y - 2 * scale, cellSize + 4 * scale, cellSize + 4 * scale);
      }
    }
    // Accuracy counter
    const errorCount = gridCells.filter(c => c.isError).length;
    const accuracy = ((1 - errorCount / gridCells.length) * 100).toFixed(1);
    const accAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (accAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * accAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${accuracy}% correct`, width / 2, height * 0.82);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("but errors matter", width / 2, height * 0.89);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Merge Error: two distinct neurons drawn, AI colored them same — merged what should be separate.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25007), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const leftX = width * 0.28;
    const rightX = width * 0.72;
    const topY = height * 0.2;
    const botY = height * 0.65;
    // Top label: "Reality"
    const topLabelAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (topLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * topLabelAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("reality: two neurons", width / 2, topY - 10 * scale);
    }
    // Top row: two distinct neurons, different colors
    const neuronAppear = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronAppear > 0) {
      ctx.globalAlpha = fadeAlpha * neuronAppear;
      // Neuron A (teal) — irregular blob shape
      ctx.fillStyle = `hsla(180, 55%, 55%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(leftX, topY + 22 * scale, 25 * scale, 18 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Branch
      ctx.strokeStyle = `hsla(180, 55%, 55%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(leftX + 20 * scale, topY + 20 * scale);
      ctx.quadraticCurveTo(leftX + 45 * scale, topY + 15 * scale, leftX + 55 * scale, topY + 30 * scale);
      ctx.stroke();
      // Neuron B (orange) — adjacent
      ctx.fillStyle = `hsla(25, 65%, 55%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(rightX, topY + 22 * scale, 22 * scale, 16 * scale, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(25, 65%, 55%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(rightX - 18 * scale, topY + 18 * scale);
      ctx.quadraticCurveTo(rightX - 40 * scale, topY + 25 * scale, rightX - 50 * scale, topY + 15 * scale);
      ctx.stroke();
      // Labels
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("neuron A", leftX, topY + 48 * scale);
      ctx.fillText("neuron B", rightX, topY + 48 * scale);
    }
    // Arrow down
    const arrowAlpha = interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAlpha;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(width / 2, topY + 55 * scale);
      ctx.lineTo(width / 2, botY - 30 * scale);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(width / 2, botY - 25 * scale);
      ctx.lineTo(width / 2 - 5 * scale, botY - 32 * scale);
      ctx.lineTo(width / 2 + 5 * scale, botY - 32 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("AI says:", width / 2 + 25 * scale, botY - 40 * scale);
    }
    // Bottom row: both colored same (AI merge error) — orange for both
    const mergeAppear = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mergeAppear > 0) {
      ctx.globalAlpha = fadeAlpha * mergeAppear;
      // Bottom label
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("AI result: merged as one", width / 2, botY - 12 * scale);
      // Both blobs same color (orange)
      ctx.fillStyle = `hsla(25, 65%, 55%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(leftX, botY + 18 * scale, 25 * scale, 18 * scale, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(rightX, botY + 18 * scale, 22 * scale, 16 * scale, -0.15, 0, Math.PI * 2);
      ctx.fill();
      // Bridge connecting them (wrong merge)
      ctx.fillStyle = `hsla(25, 65%, 55%, 0.5)`;
      ctx.fillRect(leftX + 15 * scale, botY + 12 * scale, rightX - leftX - 30 * scale, 12 * scale);
    }
    // Red X stamp
    const xStampAlpha = interpolate(frame, [75, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xStampAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * xStampAlpha;
      const stampBounce = 1 + (1 - xStampAlpha) * 1.5;
      ctx.save();
      ctx.translate(width / 2, botY + 18 * scale);
      ctx.scale(stampBounce, stampBounce);
      drawX(ctx, 0, 0, 30 * scale, PALETTE.accent.red);
      ctx.restore();
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("false merge", width / 2, botY + 52 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // AI Eye with Bug: drawEye with a small bug crawling on it. Below: EM view with error highlighted.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25008), [width, height, scale]);
  const blobs = useMemo(() => {
    const rand = seeded(25081);
    return Array.from({ length: 20 }, () => ({
      x: width * (0.1 + rand() * 0.8),
      y: height * (0.52 + rand() * 0.3),
      radius: (3 + rand() * 4) * scale,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Large eye appears
    const eyeAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eyeX = width * 0.5;
    const eyeY = height * 0.22;
    if (eyeAppear > 0) {
      ctx.globalAlpha = fadeAlpha * eyeAppear;
      drawEye(ctx, eyeX, eyeY, 55 * scale * eyeAppear, PALETTE.accent.blue);
      // "AI" label inside eye
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("AI", eyeX, eyeY + 22 * scale);
    }
    // Bug crawling on the eye
    const bugCrawl = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bugCrawl > 0) {
      ctx.globalAlpha = fadeAlpha * Math.min(bugCrawl * 3, 1);
      const bugAngle = bugCrawl * Math.PI * 1.2 - Math.PI * 0.3;
      const bugDist = 18 * scale;
      const bugX = eyeX + Math.cos(bugAngle) * bugDist;
      const bugY = eyeY + Math.sin(bugAngle) * bugDist * 0.5;
      // Bug body
      ctx.fillStyle = `hsla(0, 60%, 45%, 0.9)`;
      ctx.beginPath();
      ctx.ellipse(bugX, bugY, 4 * scale, 2.5 * scale, bugAngle, 0, Math.PI * 2);
      ctx.fill();
      // Bug legs
      ctx.strokeStyle = `hsla(0, 50%, 40%, 0.7)`;
      ctx.lineWidth = 0.8 * scale;
      for (let leg = -1; leg <= 1; leg += 1) {
        const legX = bugX + Math.cos(bugAngle + Math.PI / 2) * leg * 2 * scale;
        const legY = bugY + Math.sin(bugAngle + Math.PI / 2) * leg * 2 * scale;
        ctx.beginPath();
        ctx.moveTo(legX, legY);
        ctx.lineTo(legX + Math.cos(bugAngle + Math.PI / 2) * 3 * scale, legY + Math.sin(bugAngle + Math.PI / 2) * 3 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(legX, legY);
        ctx.lineTo(legX - Math.cos(bugAngle + Math.PI / 2) * 3 * scale, legY - Math.sin(bugAngle + Math.PI / 2) * 3 * scale);
        ctx.stroke();
      }
    }
    // EM blobs below
    const blobAppear = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(blobAppear * blobs.length); i++) {
      const blob = blobs[i];
      ctx.globalAlpha = fadeAlpha * blobAppear;
      ctx.fillStyle = `hsla(${blob.hue}, 50%, 55%, 0.75)`;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Error highlight on one blob
    const errBlob = blobs[8];
    const errAlpha = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (errAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * errAlpha;
      const pulse = 1 + Math.sin(frame * 0.12) * 0.15;
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(errBlob.x, errBlob.y, (errBlob.radius + 6 * scale) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    // "AI isn't perfect" text
    const textAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("AI isn't perfect", width / 2, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Split Error Visualization: one neuron correctly drawn as continuous. Below: AI version split into 2 pieces.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 25009), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const correctY = height * 0.25;
    const aiY = height * 0.6;
    const neuronLeft = width * 0.15;
    const neuronRight = width * 0.85;
    // Top label: "correct"
    const topLabelAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (topLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * topLabelAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("correct segmentation", neuronLeft, correctY - 20 * scale);
    }
    // Top: continuous neuron drawn as thick curved line
    const neuronDraw = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronDraw > 0) {
      ctx.globalAlpha = fadeAlpha * neuronDraw;
      ctx.strokeStyle = `hsla(180, 55%, 55%, 0.8)`;
      ctx.lineWidth = 5 * scale;
      ctx.lineCap = "round";
      const drawLen = neuronDraw * (neuronRight - neuronLeft);
      ctx.beginPath();
      ctx.moveTo(neuronLeft, correctY);
      for (let d = 0; d <= drawLen; d += 2) {
        const x = neuronLeft + d;
        const y = correctY + Math.sin(d / (30 * scale)) * 8 * scale;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Soma (cell body)
      if (neuronDraw > 0.3) {
        ctx.fillStyle = `hsla(180, 60%, 60%, 0.85)`;
        ctx.beginPath();
        ctx.arc(width * 0.35, correctY + Math.sin((width * 0.2) / (30 * scale)) * 8 * scale, 7 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Checkmark
      if (neuronDraw > 0.8) {
        drawCheck(ctx, neuronRight + 15 * scale, correctY, 14 * scale, PALETTE.accent.green);
      }
    }
    // Arrow down
    const arrowAlpha = interpolate(frame, [38, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAlpha;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(width / 2, correctY + 25 * scale);
      ctx.lineTo(width / 2, aiY - 30 * scale);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.beginPath();
      ctx.moveTo(width / 2, aiY - 25 * scale);
      ctx.lineTo(width / 2 - 4 * scale, aiY - 32 * scale);
      ctx.lineTo(width / 2 + 4 * scale, aiY - 32 * scale);
      ctx.closePath();
      ctx.fill();
    }
    // Bottom label: "AI result"
    const botLabelAlpha = interpolate(frame, [42, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (botLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * botLabelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("AI segmentation", neuronLeft, aiY - 20 * scale);
    }
    // Bottom: neuron split into two pieces with gap
    const splitDraw = interpolate(frame, [48, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (splitDraw > 0) {
      ctx.globalAlpha = fadeAlpha * splitDraw;
      const splitPoint = width * 0.5;
      const gapSize = 14 * scale;
      // Left piece (teal)
      ctx.strokeStyle = `hsla(180, 55%, 55%, 0.8)`;
      ctx.lineWidth = 5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(neuronLeft, aiY);
      for (let d = 0; d <= (splitPoint - gapSize - neuronLeft) * splitDraw; d += 2) {
        const x = neuronLeft + d;
        const y = aiY + Math.sin(d / (30 * scale)) * 8 * scale;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Right piece (different shade — AI thinks it's different)
      ctx.strokeStyle = `hsla(280, 50%, 55%, 0.8)`;
      ctx.beginPath();
      const rightStart = splitPoint + gapSize;
      const rightLen = (neuronRight - rightStart) * splitDraw;
      ctx.moveTo(rightStart, aiY + Math.sin(((rightStart - neuronLeft)) / (30 * scale)) * 8 * scale);
      for (let d = 0; d <= rightLen; d += 2) {
        const x = rightStart + d;
        const y = aiY + Math.sin((x - neuronLeft) / (30 * scale)) * 8 * scale;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Red jagged line in the gap
    const jaggedAlpha = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (jaggedAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * jaggedAlpha;
      const splitX = width * 0.5;
      const gapSize = 14 * scale;
      // Red glow
      const glowGrad = ctx.createRadialGradient(splitX, aiY, 0, splitX, aiY, gapSize * 2);
      glowGrad.addColorStop(0, `hsla(0, 70%, 50%, ${jaggedAlpha * 0.4})`);
      glowGrad.addColorStop(1, `hsla(0, 60%, 40%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(splitX, aiY, gapSize * 2, 0, Math.PI * 2);
      ctx.fill();
      // Jagged line
      ctx.strokeStyle = PALETTE.accent.red;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(splitX, aiY - 14 * scale);
      ctx.lineTo(splitX + 4 * scale, aiY - 7 * scale);
      ctx.lineTo(splitX - 3 * scale, aiY);
      ctx.lineTo(splitX + 3 * scale, aiY + 7 * scale);
      ctx.lineTo(splitX, aiY + 14 * scale);
      ctx.stroke();
      // "split error" label
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("split error", splitX, aiY + 28 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_025: VariantDef[] = [
  { id: "red-circle-error", label: "Red Circle Error", component: V1 },
  { id: "before-after-wrong", label: "Before/After Wrong Color", component: V2 },
  { id: "broken-connection", label: "Broken Connection", component: V3 },
  { id: "error-popup", label: "Error Popup", component: V4 },
  { id: "magnifying-error", label: "Magnifying Glass on Error", component: V5 },
  { id: "diff-view", label: "Diff View", component: V6 },
  { id: "merge-error", label: "Merge Error", component: V7 },
  { id: "ai-eye-bug", label: "AI Eye with Bug", component: V8 },
  { id: "split-error", label: "Split Error", component: V9 },
];
