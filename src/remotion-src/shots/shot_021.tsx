import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawEye, drawNeuron } from "../icons";

// Shot 21 — "You can see where neurons were cut, but you don't know which blob
// in one image is the same neuron as the next."
// 150 frames (5s). Two adjacent EM slices — which blob matches which?

/** Helper: draw a simplified EM slice (dark circle with grey blobs inside) */
function drawSlice(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, radius: number, scale: number,
  blobs: { x: number; y: number; r: number; hue: number }[],
  colorMap: Map<number, string> | null, highlightIdx: number[], dashIdx: number[],
  frame: number,
) {
  // Dark circular background
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(12, 9, 20, 0.92)";
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  // Subtle membrane texture
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const wobble = Math.sin(a * 3 + frame * 0.015) * 2 * scale;
    ctx.strokeStyle = "rgba(80, 60, 100, 0.08)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4 + i * 1.5 * scale + wobble, a, a + 0.3);
    ctx.stroke();
  }
  // Blobs
  for (let i = 0; i < blobs.length; i++) {
    const b = blobs[i];
    const bx = cx + b.x * radius * 0.75;
    const by = cy + b.y * radius * 0.75;
    const br = b.r * scale;
    const isHighlighted = highlightIdx.includes(i);
    const isDashed = dashIdx.includes(i);
    const color = colorMap?.get(i);
    // Blob body
    const grad = ctx.createRadialGradient(bx - br * 0.2, by - br * 0.2, 0, bx, by, br);
    if (color) {
      grad.addColorStop(0, color);
      grad.addColorStop(1, color.replace(/[\d.]+\)$/, "0.4)"));
    } else {
      grad.addColorStop(0, `hsla(${b.hue}, 15%, 52%, 0.7)`);
      grad.addColorStop(1, `hsla(${b.hue}, 10%, 40%, 0.35)`);
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    if (isHighlighted) {
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, br + 2 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (isDashed) {
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.arc(bx, by, br + 2 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  ctx.restore();
  // Outer ring
  ctx.strokeStyle = "hsla(220, 30%, 45%, 0.5)";
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

/** Helper: generate random blobs for a slice */
function makeBlobs(count: number, seed: number) {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: (rand() - 0.5) * 1.4,
    y: (rand() - 0.5) * 1.4,
    r: 5 + rand() * 8,
    hue: 200 + rand() * 60,
  }));
}

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Split View with ?: Two EM slices side by side. One blob in left highlighted yellow.
  // Three candidates in right with dashed outlines + "?" marks.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 21001), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(16, 21011), []);
  const rightBlobs = useMemo(() => makeBlobs(16, 21012), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.2, height * 0.32);
    const leftCx = width * 0.28;
    const rightCx = width * 0.72;
    const sliceY = height * 0.42;
    // Slice labels
    const labelAppear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAppear;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE n", leftCx, sliceY - sliceRadius - 10 * scale);
    ctx.fillText("SLICE n+1", rightCx, sliceY - sliceRadius - 10 * scale);
    // Draw left slice
    const leftAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * leftAppear;
    const highlightStart = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, null, highlightStart > 0.5 ? [3] : [], [], frame);
    // Draw right slice
    const rightAppear = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * rightAppear;
    const candidateAppear = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], candidateAppear > 0.5 ? [2, 5, 9] : [], frame);
    // "?" marks over candidates
    if (candidateAppear > 0.5) {
      ctx.globalAlpha = fadeAlpha * candidateAppear;
      const candidates = [2, 5, 9];
      for (const idx of candidates) {
        const b = rightBlobs[idx];
        const bx = rightCx + b.x * sliceRadius * 0.75;
        const by = sliceY + b.y * sliceRadius * 0.75;
        const pulse = 1 + Math.sin(frame * 0.08 + idx) * 0.1;
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.font = `bold ${14 * scale * pulse}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", bx, by - b.r * scale - 8 * scale);
      }
    }
    // Arrow with "?" between slices
    const arrowAppear = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAppear > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAppear;
      const arrowStartX = leftCx + sliceRadius + 8 * scale;
      const arrowEndX = rightCx - sliceRadius - 8 * scale;
      const arrowMidX = (arrowStartX + arrowEndX) / 2;
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(arrowStartX, sliceY);
      ctx.lineTo(arrowEndX, sliceY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.moveTo(arrowEndX, sliceY);
      ctx.lineTo(arrowEndX - 8 * scale, sliceY - 5 * scale);
      ctx.lineTo(arrowEndX - 8 * scale, sliceY + 5 * scale);
      ctx.closePath();
      ctx.fill();
      // Big "?" in the middle of arrow
      const bigPulse = 1 + Math.sin(frame * 0.07) * 0.08;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${22 * scale * bigPulse}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", arrowMidX, sliceY - 18 * scale);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("which blob is the same neuron?", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Matching Game: left slice has colored blobs, right is all grey.
  // Dashed lines try to connect — some wrong (red), showing uncertainty.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 21002), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(10, 21021), []);
  const rightBlobs = useMemo(() => makeBlobs(10, 21022), []);
  const connections = useMemo(() => {
    const rand = seeded(21023);
    return Array.from({ length: 6 }, (_, i) => ({
      from: i,
      to: Math.floor(rand() * 10),
      correct: rand() > 0.5,
      delay: i * 12,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.19, height * 0.3);
    const leftCx = width * 0.27;
    const rightCx = width * 0.73;
    const sliceY = height * 0.42;
    // Color map for left blobs
    const leftColors = new Map<number, string>();
    const palette = PALETTE.cellColors;
    for (let i = 0; i < leftBlobs.length; i++) {
      const c = palette[i % palette.length];
      leftColors.set(i, `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.8)`);
    }
    // Draw slices
    const sliceAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, leftColors, [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], [], frame);
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("colored", leftCx, sliceY - sliceRadius - 8 * scale);
    ctx.fillText("all grey", rightCx, sliceY - sliceRadius - 8 * scale);
    // Connection lines with stagger
    for (const conn of connections) {
      const lineAppear = interpolate(frame, [40 + conn.delay, 55 + conn.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lineAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * lineAppear;
      const fromBlob = leftBlobs[conn.from];
      const toBlob = rightBlobs[conn.to];
      const fx = leftCx + fromBlob.x * sliceRadius * 0.75;
      const fy = sliceY + fromBlob.y * sliceRadius * 0.75;
      const tx = rightCx + toBlob.x * sliceRadius * 0.75;
      const ty = sliceY + toBlob.y * sliceRadius * 0.75;
      const midX = fx + (tx - fx) * lineAppear;
      const midY = fy + (ty - fy) * lineAppear;
      ctx.strokeStyle = conn.correct ? PALETTE.accent.green : PALETTE.accent.red;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([5 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(midX, midY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Wrong mark at end
      if (lineAppear > 0.8 && !conn.correct) {
        ctx.fillStyle = PALETTE.accent.red;
        ctx.font = `bold ${10 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("X", midX, midY - 6 * scale);
      }
    }
    // "Which matches which?" text
    const textAlpha = interpolate(frame, [100, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("which matches which?", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Color Mismatch: two slices where AI colored blobs differently — same neuron
  // gets different colors in each. Red circles highlight mismatches.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 21003), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(12, 21031), []);
  const rightBlobs = useMemo(() => makeBlobs(12, 21032), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.19, height * 0.3);
    const leftCx = width * 0.27;
    const rightCx = width * 0.73;
    const sliceY = height * 0.42;
    const palette = PALETTE.cellColors;
    // Left colors
    const leftColors = new Map<number, string>();
    for (let i = 0; i < leftBlobs.length; i++) {
      const c = palette[i % palette.length];
      leftColors.set(i, `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.8)`);
    }
    // Right colors — deliberately mismatched for some
    const mismatchIndices = [1, 4, 7, 10];
    const rightColors = new Map<number, string>();
    for (let i = 0; i < rightBlobs.length; i++) {
      const cIdx = mismatchIndices.includes(i) ? (i + 3) % palette.length : i % palette.length;
      const c = palette[cIdx];
      rightColors.set(i, `hsla(${c[0]}, ${c[1]}%, ${c[2]}%, 0.8)`);
    }
    // Slices appear
    const sliceAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    // Color blobs appear with delay
    const colorAppear = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const activeLeftColors = colorAppear > 0.5 ? leftColors : null;
    const activeRightColors = colorAppear > 0.5 ? rightColors : null;
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, activeLeftColors, [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, activeRightColors, [], [], frame);
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE A", leftCx, sliceY - sliceRadius - 8 * scale);
    ctx.fillText("SLICE B", rightCx, sliceY - sliceRadius - 8 * scale);
    // Red mismatch circles appear
    const mismatchAppear = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mismatchAppear > 0.3) {
      ctx.globalAlpha = fadeAlpha * mismatchAppear;
      for (const idx of mismatchIndices) {
        if (idx >= rightBlobs.length) continue;
        const b = rightBlobs[idx];
        const bx = rightCx + b.x * sliceRadius * 0.75;
        const by = sliceY + b.y * sliceRadius * 0.75;
        ctx.strokeStyle = PALETTE.accent.red;
        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.arc(bx, by, b.r * scale + 5 * scale, 0, Math.PI * 2);
        ctx.stroke();
        // Small "!" above each
        ctx.fillStyle = PALETTE.accent.red;
        ctx.font = `bold ${11 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("!", bx, by - b.r * scale - 8 * scale);
      }
    }
    // "Colors don't match" label
    const labelAlpha = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("same neuron, different labels", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Arrow Candidates: one blob highlighted in slice A. Multiple arrows extend to
  // different candidates in slice B. Each arrow has "?" — one solid, rest dashed.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 21004), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(14, 21041), []);
  const rightBlobs = useMemo(() => makeBlobs(14, 21042), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.19, height * 0.3);
    const leftCx = width * 0.27;
    const rightCx = width * 0.73;
    const sliceY = height * 0.42;
    // Draw both slices
    const sliceAppear = interpolate(frame, [5, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    const highlightPhase = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, null, highlightPhase > 0.5 ? [5] : [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], [], frame);
    // Source blob coordinates
    const srcBlob = leftBlobs[5];
    const sx = leftCx + srcBlob.x * sliceRadius * 0.75;
    const sy = sliceY + srcBlob.y * sliceRadius * 0.75;
    // Target candidates in right slice
    const targets = [3, 7, 11, 1];
    for (let t = 0; t < targets.length; t++) {
      const arrowAppear = interpolate(frame, [50 + t * 10, 65 + t * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (arrowAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * arrowAppear;
      const tBlob = rightBlobs[targets[t]];
      const tx = rightCx + tBlob.x * sliceRadius * 0.75;
      const ty = sliceY + tBlob.y * sliceRadius * 0.75;
      const isSolid = t === 0; // First one is the "confident" guess
      ctx.strokeStyle = isSolid ? PALETTE.accent.gold : `hsla(220, 35%, 55%, 0.5)`;
      ctx.lineWidth = (isSolid ? 2.5 : 1.5) * scale;
      if (!isSolid) ctx.setLineDash([5 * scale, 4 * scale]);
      // Draw curved arrow
      const midX = (sx + tx) / 2;
      const midY = sliceY - sliceRadius * 0.4 + t * 12 * scale;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(midX, midY, tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
      // "?" at midpoint
      const qx = (sx + 2 * midX + tx) / 4;
      const qy = (sy + 2 * midY + ty) / 4;
      ctx.fillStyle = isSolid ? PALETTE.accent.gold : "rgba(255,255,255,0.4)";
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("?", qx, qy - 4 * scale);
    }
    // Labels
    const labelAlpha = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("one blob, four candidates", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Detective Magnifying Glass: glass icon moves between two slices.
  // Inside the glass, the matching problem is zoomed in. Glass moves uncertainly.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 21005), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(14, 21051), []);
  const rightBlobs = useMemo(() => makeBlobs(14, 21052), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.18, height * 0.28);
    const leftCx = width * 0.25;
    const rightCx = width * 0.75;
    const sliceY = height * 0.42;
    // Draw both slices
    const sliceAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, null, [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], [], frame);
    // Labels above slices
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE A", leftCx, sliceY - sliceRadius - 8 * scale);
    ctx.fillText("SLICE B", rightCx, sliceY - sliceRadius - 8 * scale);
    // Magnifying glass movement — bounces between slices uncertainly
    const glassPhase = interpolate(frame, [30, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glassAppear = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glassAppear > 0) {
      ctx.globalAlpha = fadeAlpha * glassAppear;
      // Oscillate between slices with easing
      const oscillation = Math.sin(glassPhase * Math.PI * 3.5);
      const glassX = width * 0.5 + oscillation * width * 0.22;
      const glassY = sliceY + Math.sin(glassPhase * Math.PI * 7) * 8 * scale;
      const glassRadius = 28 * scale;
      // Glass interior (zoomed view)
      ctx.save();
      ctx.beginPath();
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(15, 10, 25, 0.9)";
      ctx.fillRect(glassX - glassRadius, glassY - glassRadius, glassRadius * 2, glassRadius * 2);
      // Zoomed blobs inside glass
      const nearBlobs = oscillation > 0 ? rightBlobs : leftBlobs;
      for (let i = 0; i < 5; i++) {
        const b = nearBlobs[i];
        ctx.fillStyle = `hsla(${b.hue}, 20%, 50%, 0.5)`;
        ctx.beginPath();
        ctx.arc(glassX + b.x * glassRadius * 0.5, glassY + b.y * glassRadius * 0.5, 5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Glass rim + handle
      ctx.strokeStyle = `hsla(50, 50%, 65%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(glassX, glassY, glassRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Handle
      ctx.strokeStyle = `hsla(50, 40%, 55%, 0.6)`;
      ctx.lineWidth = 4 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(glassX + glassRadius * 0.7, glassY + glassRadius * 0.7);
      ctx.lineTo(glassX + glassRadius * 1.3, glassY + glassRadius * 1.3);
      ctx.stroke();
      // "?" above glass
      const pulse = 1 + Math.sin(frame * 0.1) * 0.1;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${16 * scale * pulse}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("?", glassX, glassY - glassRadius - 8 * scale);
    }
    // Bottom text
    const textAlpha = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("searching for a match...", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Before/After Uncertainty: Slice A shows clear blue blob. Slice B shows same area
  // but blob has shifted/split. Flickering "?" overlays.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 21006), [width, height, scale]);
  const bgBlobs = useMemo(() => makeBlobs(10, 21061), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.19, height * 0.3);
    const leftCx = width * 0.28;
    const rightCx = width * 0.72;
    const sliceY = height * 0.42;
    // Slice A: clear single blue blob highlighted
    const sliceAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    // Draw base slices
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, bgBlobs, null, [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, bgBlobs, null, [], [], frame);
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE n", leftCx, sliceY - sliceRadius - 8 * scale);
    ctx.fillText("SLICE n+1", rightCx, sliceY - sliceRadius - 8 * scale);
    // Highlighted blue blob in left
    const blobAppear = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (blobAppear > 0) {
      ctx.globalAlpha = fadeAlpha * blobAppear;
      const bx = leftCx - 5 * scale;
      const by = sliceY + 3 * scale;
      const br = 12 * scale;
      ctx.fillStyle = `hsla(220, 60%, 60%, 0.8)`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(bx, by, br + 3 * scale, 0, Math.PI * 2);
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("neuron #4,271", bx, by + br + 12 * scale);
    }
    // Right side: blob has split into 2 and shifted
    const splitAppear = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (splitAppear > 0) {
      ctx.globalAlpha = fadeAlpha * splitAppear;
      // Two candidate blobs
      const split1X = rightCx - 10 * scale;
      const split1Y = sliceY - 5 * scale;
      const split2X = rightCx + 8 * scale;
      const split2Y = sliceY + 10 * scale;
      ctx.fillStyle = `hsla(220, 50%, 55%, 0.6)`;
      ctx.beginPath();
      ctx.arc(split1X, split1Y, 9 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(split2X, split2Y, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Flickering "?" marks
      const flicker1 = Math.sin(frame * 0.12) > -0.3 ? 1 : 0.2;
      const flicker2 = Math.cos(frame * 0.09) > -0.3 ? 1 : 0.2;
      ctx.fillStyle = `hsla(50, 65%, 60%, ${flicker1})`;
      ctx.font = `bold ${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("?", split1X, split1Y - 12 * scale);
      ctx.fillStyle = `hsla(50, 65%, 60%, ${flicker2})`;
      ctx.fillText("?", split2X, split2Y - 11 * scale);
      // Dashed outlines
      ctx.strokeStyle = `rgba(255,255,255,0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.arc(split1X, split1Y, 12 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(split2X, split2Y, 11 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // "Split or merged?" annotation
    const annoteAlpha = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (annoteAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * annoteAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("split? merged? shifted?", width * 0.5, height * 0.78);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("identity is ambiguous across slices", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Puzzle Pieces: left slice as completed puzzle. Right slice with missing pieces
  // and question marks where pieces should go.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 21007), [width, height, scale]);
  const puzzleData = useMemo(() => {
    const rand = seeded(21071);
    const gridSize = 4;
    const pieces: { row: number; col: number; hue: number; missing: boolean }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        pieces.push({
          row: r, col: c,
          hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
          missing: rand() > 0.6,
        });
      }
    }
    return { pieces, gridSize };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const gridPixels = Math.min(width * 0.3, height * 0.55);
    const cellSize = gridPixels / puzzleData.gridSize;
    const leftStartX = width * 0.1;
    const rightStartX = width * 0.55;
    const startY = height * 0.2;
    // Left puzzle: complete
    const leftAppear = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("SLICE n (complete)", leftStartX + gridPixels / 2, startY - 10 * scale);
      for (const piece of puzzleData.pieces) {
        const pieceDelay = (piece.row * puzzleData.gridSize + piece.col) / (puzzleData.gridSize * puzzleData.gridSize);
        const pieceAlpha = interpolate(leftAppear, [pieceDelay, Math.min(1, pieceDelay + 0.15)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (pieceAlpha <= 0) continue;
        const px = leftStartX + piece.col * cellSize;
        const py = startY + piece.row * cellSize;
        ctx.fillStyle = `hsla(${piece.hue}, 40%, 50%, ${pieceAlpha * 0.7})`;
        ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        ctx.strokeStyle = `hsla(${piece.hue}, 50%, 60%, ${pieceAlpha * 0.4})`;
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
      }
    }
    // Right puzzle: incomplete with "?" marks
    const rightAppear = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("SLICE n+1 (???)", rightStartX + gridPixels / 2, startY - 10 * scale);
      for (const piece of puzzleData.pieces) {
        const px = rightStartX + piece.col * cellSize;
        const py = startY + piece.row * cellSize;
        if (piece.missing) {
          // Empty slot with "?"
          ctx.strokeStyle = `rgba(255,255,255,0.2)`;
          ctx.lineWidth = 1 * scale;
          ctx.setLineDash([3 * scale, 2 * scale]);
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          ctx.setLineDash([]);
          const pulse = 0.5 + Math.sin(frame * 0.08 + piece.row + piece.col) * 0.3;
          ctx.fillStyle = `hsla(50, 60%, 60%, ${pulse})`;
          ctx.font = `bold ${12 * scale}px system-ui`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("?", px + cellSize / 2, py + cellSize / 2);
        } else {
          ctx.fillStyle = `hsla(${piece.hue}, 35%, 45%, 0.6)`;
          ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          ctx.strokeStyle = `hsla(${piece.hue}, 45%, 55%, 0.3)`;
          ctx.lineWidth = 1 * scale;
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
        }
      }
    }
    // Arrow between
    const arrowAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * arrowAlpha;
      const arrowY = startY + gridPixels / 2;
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([5 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(leftStartX + gridPixels + 8 * scale, arrowY);
      ctx.lineTo(rightStartX - 8 * scale, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${18 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("?", (leftStartX + gridPixels + rightStartX) / 2, arrowY - 12 * scale);
    }
    // Bottom label
    const bottomAlpha = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("which pieces go where?", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Color Coding Attempt: a blob gets colored blue in slice A.
  // The system tries to color the match in slice B but highlights 3 candidates
  // with decreasing opacity. Uncertainty visualization.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 21008), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(12, 21081), []);
  const rightBlobs = useMemo(() => makeBlobs(12, 21082), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.19, height * 0.3);
    const leftCx = width * 0.27;
    const rightCx = width * 0.73;
    const sliceY = height * 0.42;
    // Draw both slices
    const sliceAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, null, [], [], frame);
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], [], frame);
    // Labels
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE A", leftCx, sliceY - sliceRadius - 8 * scale);
    ctx.fillText("SLICE B", rightCx, sliceY - sliceRadius - 8 * scale);
    // Step 1: Color one blob blue in left slice
    const colorPhase = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (colorPhase > 0) {
      ctx.globalAlpha = fadeAlpha * colorPhase;
      const srcBlob = leftBlobs[4];
      const bx = leftCx + srcBlob.x * sliceRadius * 0.75;
      const by = sliceY + srcBlob.y * sliceRadius * 0.75;
      const br = srcBlob.r * scale;
      ctx.fillStyle = `hsla(220, 65%, 60%, ${colorPhase * 0.9})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      const glow = ctx.createRadialGradient(bx, by, br, bx, by, br * 2);
      glow.addColorStop(0, `hsla(220, 60%, 60%, 0.3)`);
      glow.addColorStop(1, `hsla(220, 60%, 60%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, br * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Step 2: Attempt to color matches in right slice — 3 candidates with decreasing confidence
    const candidates = [
      { idx: 6, confidence: 0.9, delay: 50 },
      { idx: 2, confidence: 0.55, delay: 65 },
      { idx: 9, confidence: 0.25, delay: 80 },
    ];
    for (const cand of candidates) {
      const candAppear = interpolate(frame, [cand.delay, cand.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (candAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * candAppear;
      const b = rightBlobs[cand.idx];
      const bx = rightCx + b.x * sliceRadius * 0.75;
      const by = sliceY + b.y * sliceRadius * 0.75;
      const br = b.r * scale;
      ctx.fillStyle = `hsla(220, 60%, 60%, ${cand.confidence * candAppear})`;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      // Confidence label
      ctx.fillStyle = `rgba(255,255,255,${cand.confidence * 0.8})`;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(cand.confidence * 100)}%`, bx, by + br + 10 * scale);
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("confidence fades with ambiguity", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Side-by-side with big "?": two large EM circles. Slice numbers labeled.
  // Big "?" in the gap. Highlighted blob in left, candidates in right.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 21009), [width, height, scale]);
  const leftBlobs = useMemo(() => makeBlobs(18, 21091), []);
  const rightBlobs = useMemo(() => makeBlobs(18, 21092), []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceRadius = Math.min(width * 0.2, height * 0.33);
    const leftCx = width * 0.26;
    const rightCx = width * 0.74;
    const sliceY = height * 0.45;
    // Big labels above
    const labelAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAppear;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("SLICE 3,847", leftCx, sliceY - sliceRadius - 12 * scale);
    ctx.fillText("SLICE 3,848", rightCx, sliceY - sliceRadius - 12 * scale);
    // Slices appear
    const sliceAppear = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * sliceAppear;
    // Highlight blob 7 in left
    const hlAppear = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, leftCx, sliceY, sliceRadius, scale, leftBlobs, null, hlAppear > 0.5 ? [7] : [], [], frame);
    // Candidate blobs in right
    const candAppear = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawSlice(ctx, rightCx, sliceY, sliceRadius, scale, rightBlobs, null, [], candAppear > 0.5 ? [4, 8, 12] : [], frame);
    // "?" marks on candidates
    if (candAppear > 0.5) {
      ctx.globalAlpha = fadeAlpha * candAppear;
      for (const idx of [4, 8, 12]) {
        if (idx >= rightBlobs.length) continue;
        const b = rightBlobs[idx];
        const bx = rightCx + b.x * sliceRadius * 0.75;
        const by = sliceY + b.y * sliceRadius * 0.75;
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.font = `bold ${13 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("?", bx, by - b.r * scale - 6 * scale);
      }
    }
    // Big "?" in the gap between slices
    const bigQAppear = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bigQAppear > 0) {
      ctx.globalAlpha = fadeAlpha * bigQAppear;
      const pulse = 1 + Math.sin(frame * 0.06) * 0.08;
      const gapX = width * 0.5;
      // Glow behind "?"
      const qGlow = ctx.createRadialGradient(gapX, sliceY, 0, gapX, sliceY, 30 * scale);
      qGlow.addColorStop(0, `hsla(50, 60%, 50%, 0.15)`);
      qGlow.addColorStop(1, `hsla(50, 60%, 50%, 0)`);
      ctx.fillStyle = qGlow;
      ctx.beginPath();
      ctx.arc(gapX, sliceY, 30 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${40 * scale * pulse}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", gapX, sliceY);
      ctx.textBaseline = "alphabetic";
    }
    // Bottom annotation
    const bottomAlpha = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("same neuron — or a different one?", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_021: VariantDef[] = [
  { id: "split-view", label: "Split View with ?", component: V1 },
  { id: "matching-game", label: "Matching Game", component: V2 },
  { id: "color-mismatch", label: "Color Mismatch", component: V3 },
  { id: "arrow-candidates", label: "Arrow Candidates", component: V4 },
  { id: "magnifying-glass", label: "Detective Glass", component: V5 },
  { id: "before-after", label: "Before/After", component: V6 },
  { id: "puzzle-pieces", label: "Puzzle Pieces", component: V7 },
  { id: "color-coding", label: "Color Coding", component: V8 },
  { id: "side-by-side", label: "Side-by-Side", component: V9 },
];
