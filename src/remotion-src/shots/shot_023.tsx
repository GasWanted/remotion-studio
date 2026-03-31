import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 23 — "and figures out which pieces belong to the same neuron across all
// seven thousand slices."
// 150 frames (5s). Same neuron tracked across stacked slices.

/** Helper: draw a slice bar (thin horizontal strip representing one EM slice) */
function drawSliceBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  scale: number, alpha: number, label?: string,
) {
  ctx.fillStyle = `rgba(30, 22, 42, ${alpha * 0.8})`;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = `hsla(220, 30%, 45%, ${alpha * 0.4})`;
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, y, w, h);
  if (label) {
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.4})`;
    ctx.font = `${7 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(label, x - 4 * scale, y + h / 2 + 3 * scale);
  }
}

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // 3D Slice Stack: three slices in perspective (stacked with depth offset).
  // One neuron highlighted blue in all three. Golden connecting lines.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23001), [width, height, scale]);
  const sliceBlobs = useMemo(() => {
    const rand = seeded(23011);
    return [0, 1, 2].map(() =>
      Array.from({ length: 10 }, () => ({
        x: (rand() - 0.5) * 0.8,
        y: (rand() - 0.5) * 0.6,
        r: 4 + rand() * 6,
        hue: 200 + rand() * 60,
      }))
    );
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.45;
    const sliceW = width * 0.45;
    const sliceH = height * 0.25;
    // Fan-out animation
    const fanProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const depthOffset = 30 * scale * fanProgress;
    const lateralOffset = 15 * scale * fanProgress;
    // Draw 3 slices from back to front
    for (let sliceIdx = 0; sliceIdx < 3; sliceIdx++) {
      const sliceAlpha = interpolate(frame, [5 + sliceIdx * 10, 20 + sliceIdx * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sliceAlpha <= 0) continue;
      ctx.globalAlpha = fadeAlpha * sliceAlpha;
      const offsetFactor = sliceIdx - 1; // -1, 0, 1
      const sx = centerX - sliceW / 2 + offsetFactor * lateralOffset;
      const sy = centerY - sliceH / 2 + offsetFactor * depthOffset;
      // Slight perspective scaling
      const perspScale = 1 - offsetFactor * 0.03 * fanProgress;
      const actualW = sliceW * perspScale;
      const actualH = sliceH * perspScale;
      const offsetX = sx + (sliceW - actualW) / 2;
      // Slice background
      ctx.fillStyle = `rgba(15, 10, 25, 0.85)`;
      ctx.fillRect(offsetX, sy, actualW, actualH);
      ctx.strokeStyle = `hsla(220, 30%, 50%, ${sliceAlpha * 0.5})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(offsetX, sy, actualW, actualH);
      // Grey blobs
      const blobs = sliceBlobs[sliceIdx];
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const bx = offsetX + actualW / 2 + b.x * actualW * 0.45;
        const by = sy + actualH / 2 + b.y * actualH * 0.45;
        const br = b.r * scale * perspScale;
        ctx.fillStyle = `hsla(${b.hue}, 12%, 45%, 0.5)`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      // Tracked neuron blob (always at similar position in each slice)
      const trackedAppear = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (trackedAppear > 0) {
        ctx.globalAlpha = fadeAlpha * sliceAlpha * trackedAppear;
        const trackedX = offsetX + actualW * 0.42;
        const trackedY = sy + actualH * 0.48;
        const trackedR = 8 * scale * perspScale;
        ctx.fillStyle = `hsla(220, 65%, 60%, 0.9)`;
        ctx.beginPath();
        ctx.arc(trackedX, trackedY, trackedR, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        const glow = ctx.createRadialGradient(trackedX, trackedY, trackedR, trackedX, trackedY, trackedR * 2.5);
        glow.addColorStop(0, `hsla(220, 60%, 60%, 0.3)`);
        glow.addColorStop(1, `hsla(220, 60%, 60%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(trackedX, trackedY, trackedR * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Slice label
      ctx.globalAlpha = fadeAlpha * sliceAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`slice ${3847 + sliceIdx}`, offsetX + actualW / 2, sy - 5 * scale);
    }
    // Golden connecting lines between tracked blobs
    const lineAppear = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lineAppear;
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      for (let i = 0; i < 2; i++) {
        const off1 = (i - 1);
        const off2 = i;
        const x1 = centerX - sliceW / 2 + off1 * lateralOffset + sliceW * 0.42;
        const y1 = centerY - sliceH / 2 + off1 * depthOffset + sliceH * 0.48;
        const x2 = centerX - sliceW / 2 + off2 * lateralOffset + sliceW * 0.42;
        const y2 = centerY - sliceH / 2 + off2 * depthOffset + sliceH * 0.48;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // "same neuron" label
    const labelAlpha = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("same neuron across slices", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Thread Through Layers: 6 horizontal layer bars stacked vertically.
  // A golden thread weaves through them, connecting the same blob position.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23002), [width, height, scale]);
  const sliceCount = 6;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const barX = width * 0.18;
    const barW = width * 0.64;
    const barH = 14 * scale;
    const startY = height * 0.12;
    const totalHeight = height * 0.65;
    const gapY = totalHeight / (sliceCount - 1);
    // Draw slice bars with stagger
    for (let i = 0; i < sliceCount; i++) {
      const barAppear = interpolate(frame, [5 + i * 6, 18 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (barAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * barAppear;
      const by = startY + i * gapY;
      drawSliceBar(ctx, barX, by, barW, barH, scale, barAppear, `#${i + 1}`);
      // Small grey blobs within each bar
      const rand = seeded(23021 + i * 100);
      for (let j = 0; j < 8; j++) {
        const blobX = barX + (0.05 + rand() * 0.9) * barW;
        const blobR = (2 + rand() * 3) * scale;
        ctx.fillStyle = `hsla(220, 12%, 45%, ${barAppear * 0.5})`;
        ctx.beginPath();
        ctx.arc(blobX, by + barH / 2, blobR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Golden thread weaving through — connecting tracked neuron position
    const threadProgress = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (threadProgress > 0) {
      ctx.globalAlpha = fadeAlpha;
      const neuronXFraction = 0.38; // Consistent horizontal position
      const threadX = barX + neuronXFraction * barW;
      const threadEndSlice = threadProgress * (sliceCount - 1);
      // Draw thread
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= Math.min(Math.floor(threadEndSlice) + 1, sliceCount - 1); i++) {
        const by = startY + i * gapY + barH / 2;
        const wobble = Math.sin(i * 1.5) * 6 * scale;
        if (i > threadEndSlice) break;
        const drawFraction = i === Math.floor(threadEndSlice) ? (threadEndSlice % 1) : 1;
        if (i === 0) {
          ctx.moveTo(threadX + wobble, by);
        } else {
          const prevBy = startY + (i - 1) * gapY + barH / 2;
          const prevWobble = Math.sin((i - 1) * 1.5) * 6 * scale;
          const midY = (prevBy + by) / 2;
          const targetX = threadX + wobble;
          const targetY = prevBy + (by - prevBy) * drawFraction;
          ctx.quadraticCurveTo(threadX + prevWobble * 0.5, midY, targetX, targetY);
        }
      }
      ctx.stroke();
      // Dot at each connected slice
      for (let i = 0; i <= Math.min(Math.floor(threadEndSlice), sliceCount - 1); i++) {
        const by = startY + i * gapY + barH / 2;
        const wobble = Math.sin(i * 1.5) * 6 * scale;
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.beginPath();
        ctx.arc(threadX + wobble, by, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        const glow = ctx.createRadialGradient(threadX + wobble, by, 2 * scale, threadX + wobble, by, 10 * scale);
        glow.addColorStop(0, `hsla(50, 60%, 60%, 0.3)`);
        glow.addColorStop(1, `hsla(50, 60%, 60%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(threadX + wobble, by, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // "7,000 slices" label
    const labelAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("tracked across 7,000 slices", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Color-Coded Tracking: 5 slices shown side by side. One neuron colored blue
  // consistently across all 5. Other blobs are grey.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23003), [width, height, scale]);
  const sliceCount = 5;
  const sliceBlobs = useMemo(() => {
    return Array.from({ length: sliceCount }, (_, s) => {
      const rand = seeded(23031 + s * 100);
      return Array.from({ length: 8 }, () => ({
        x: rand() * 0.8 + 0.1,
        y: rand() * 0.7 + 0.15,
        r: 3 + rand() * 4,
      }));
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const totalW = width * 0.85;
    const sliceW = totalW / sliceCount - 4 * scale;
    const sliceH = height * 0.55;
    const startX = (width - totalW) / 2;
    const startY = height * 0.18;
    const trackedBlobIdx = 3; // The blob tracked across all slices
    for (let s = 0; s < sliceCount; s++) {
      const sliceAppear = interpolate(frame, [5 + s * 8, 20 + s * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sliceAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * sliceAppear;
      const sx = startX + s * (sliceW + 4 * scale);
      // Dark background
      ctx.fillStyle = `rgba(15, 10, 25, 0.85)`;
      ctx.fillRect(sx, startY, sliceW, sliceH);
      ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(sx, startY, sliceW, sliceH);
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`#${s + 1}`, sx + sliceW / 2, startY - 4 * scale);
      // Blobs
      const blobs = sliceBlobs[s];
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const bx = sx + b.x * sliceW;
        const by = startY + b.y * sliceH;
        const br = b.r * scale;
        if (i === trackedBlobIdx) {
          // Tracked neuron: blue, with highlight appearing later
          const trackAppear = interpolate(frame, [45 + s * 5, 60 + s * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const hue = 220;
          const sat = 15 + trackAppear * 50;
          const lit = 40 + trackAppear * 20;
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.85)`;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
          if (trackAppear > 0.5) {
            ctx.strokeStyle = PALETTE.accent.gold;
            ctx.lineWidth = 1.5 * scale;
            ctx.beginPath();
            ctx.arc(bx, by, br + 2 * scale, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = `hsla(220, 10%, 42%, 0.5)`;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Connecting line across tracked blobs
    const lineAppear = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lineAppear;
      ctx.strokeStyle = `hsla(50, 55%, 60%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      for (let s = 0; s < sliceCount; s++) {
        const sx = startX + s * (sliceW + 4 * scale);
        const b = sliceBlobs[s][trackedBlobIdx];
        const bx = sx + b.x * sliceW;
        const by = startY + b.y * sliceH;
        if (s === 0) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Label
    const labelAlpha = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("one neuron, consistent across all slices", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Depth Visualization: stacked translucent layers with depth.
  // Same neuron forms a column/pillar going through all layers. Slow rotation.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23004), [width, height, scale]);
  const layerCount = 8;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.45;
    const layerW = width * 0.4;
    const layerH = 8 * scale;
    const totalDepth = height * 0.55;
    // Slow "rotation" via lateral offset that oscillates
    const rotatePhase = interpolate(frame, [30, 140], [0, Math.PI * 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lateralShift = Math.sin(rotatePhase) * 25 * scale;
    // Draw layers from back to front
    for (let i = layerCount - 1; i >= 0; i--) {
      const layerAppear = interpolate(frame, [5 + i * 5, 15 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (layerAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * layerAppear * (0.4 + 0.6 * (1 - i / layerCount));
      const depthFraction = i / (layerCount - 1);
      const ly = centerY - totalDepth / 2 + depthFraction * totalDepth;
      const lx = centerX - layerW / 2 + lateralShift * (depthFraction - 0.5);
      // Perspective narrowing
      const perspW = layerW * (0.75 + 0.25 * (1 - depthFraction));
      const offsetX = lx + (layerW - perspW) / 2;
      // Layer rectangle
      ctx.fillStyle = `rgba(25, 18, 38, 0.7)`;
      ctx.fillRect(offsetX, ly, perspW, layerH);
      ctx.strokeStyle = `hsla(220, 25%, 50%, 0.3)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.strokeRect(offsetX, ly, perspW, layerH);
      // Tracked neuron blob at consistent position
      const pillarAppear = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (pillarAppear > 0) {
        const blobFraction = 0.4;
        const blobX = offsetX + perspW * blobFraction;
        const blobR = 5 * scale * (0.85 + 0.15 * (1 - depthFraction));
        ctx.fillStyle = `hsla(220, 60%, 60%, ${pillarAppear * 0.9})`;
        ctx.beginPath();
        ctx.arc(blobX, ly + layerH / 2, blobR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Pillar connecting line (vertical through all tracked blobs)
    const pillarLineAppear = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pillarLineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * pillarLineAppear;
      ctx.strokeStyle = `hsla(220, 55%, 60%, 0.4)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      for (let i = 0; i < layerCount; i++) {
        const depthFraction = i / (layerCount - 1);
        const ly = centerY - totalDepth / 2 + depthFraction * totalDepth + layerH / 2;
        const lx = centerX - layerW / 2 + lateralShift * (depthFraction - 0.5);
        const perspW = layerW * (0.75 + 0.25 * (1 - depthFraction));
        const offsetX = lx + (layerW - perspW) / 2;
        const blobX = offsetX + perspW * 0.4;
        if (i === 0) ctx.moveTo(blobX, ly);
        else ctx.lineTo(blobX, ly);
      }
      ctx.stroke();
    }
    // Label
    const labelAlpha = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("same neuron forms a column through the stack", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Flipbook: slices shown one at a time, sliding in from right. The tracked neuron
  // blinks/pulses in each frame so you can follow it.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23005), [width, height, scale]);
  const totalSlices = 7;
  const sliceBlobs = useMemo(() => {
    return Array.from({ length: totalSlices }, (_, s) => {
      const rand = seeded(23051 + s * 77);
      return Array.from({ length: 12 }, () => ({
        x: rand() * 0.8 + 0.1,
        y: rand() * 0.7 + 0.15,
        r: 3 + rand() * 5,
        hue: 200 + rand() * 50,
      }));
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const sliceW = width * 0.5;
    const sliceH = height * 0.6;
    const sliceCx = width * 0.5;
    const sliceTopY = height * 0.15;
    // Which slice is currently showing
    const framesPerSlice = 16;
    const startFrame = 10;
    const currentSliceFloat = (frame - startFrame) / framesPerSlice;
    const currentSliceIdx = Math.max(0, Math.min(totalSlices - 1, Math.floor(currentSliceFloat)));
    const transitionProgress = Math.max(0, Math.min(1, (currentSliceFloat % 1)));
    const isTransitioning = transitionProgress > 0 && transitionProgress < 0.4 && currentSliceIdx < totalSlices - 1;
    // Draw current slice
    const drawSliceView = (idx: number, offsetX: number, alpha: number) => {
      if (idx < 0 || idx >= totalSlices) return;
      ctx.globalAlpha = fadeAlpha * alpha;
      const sx = sliceCx - sliceW / 2 + offsetX;
      ctx.fillStyle = `rgba(15, 10, 25, 0.88)`;
      ctx.fillRect(sx, sliceTopY, sliceW, sliceH);
      ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(sx, sliceTopY, sliceW, sliceH);
      // Blobs
      const blobs = sliceBlobs[idx];
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const bx = sx + b.x * sliceW;
        const by = sliceTopY + b.y * sliceH;
        const br = b.r * scale;
        if (i === 4) {
          // Tracked neuron — pulses
          const pulse = 1 + Math.sin(frame * 0.15) * 0.2;
          ctx.fillStyle = `hsla(220, 65%, 60%, 0.9)`;
          ctx.beginPath();
          ctx.arc(bx, by, br * pulse, 0, Math.PI * 2);
          ctx.fill();
          // Glow ring
          ctx.strokeStyle = `hsla(50, 60%, 60%, ${0.5 + Math.sin(frame * 0.15) * 0.3})`;
          ctx.lineWidth = 2 * scale;
          ctx.beginPath();
          ctx.arc(bx, by, br * pulse + 3 * scale, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${b.hue}, 12%, 44%, 0.5)`;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Slice number
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`slice ${idx + 1} / ${totalSlices}`, sx + sliceW / 2, sliceTopY - 8 * scale);
    };
    if (isTransitioning && currentSliceIdx + 1 < totalSlices) {
      // Outgoing slice slides left
      const slideOut = interpolate(transitionProgress, [0, 0.4], [0, -sliceW * 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fadeOut = interpolate(transitionProgress, [0, 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawSliceView(currentSliceIdx, slideOut, fadeOut);
      // Incoming slice enters from right
      const slideIn = interpolate(transitionProgress, [0, 0.4], [sliceW * 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fadeIn = interpolate(transitionProgress, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawSliceView(currentSliceIdx + 1, slideIn, fadeIn);
    } else {
      drawSliceView(currentSliceIdx, 0, 1);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("follow the blue blob through each slice", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Z-Stack Projection: all slices overlaid semi-transparently. The tracked neuron,
  // being consistent, appears as a bright pillar. Others average out dim.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23006), [width, height, scale]);
  const layerCount = 12;
  const allBlobs = useMemo(() => {
    return Array.from({ length: layerCount }, (_, l) => {
      const rand = seeded(23061 + l * 50);
      return Array.from({ length: 10 }, (_, i) => ({
        // Tracked blob (idx 2) stays at consistent position; others drift
        x: i === 2 ? 0.42 + (rand() - 0.5) * 0.02 : 0.1 + rand() * 0.8,
        y: i === 2 ? 0.45 + (rand() - 0.5) * 0.02 : 0.1 + rand() * 0.8,
        r: i === 2 ? 6 : 3 + rand() * 5,
      }));
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const projX = width * 0.15;
    const projY = height * 0.12;
    const projW = width * 0.7;
    const projH = height * 0.6;
    // Dark background
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(projX, projY, projW, projH);
    // Layer accumulation
    const layerProgress = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleLayers = Math.floor(layerProgress * layerCount);
    for (let l = 0; l < visibleLayers; l++) {
      const blobs = allBlobs[l];
      const layerAlpha = 0.12; // Each layer is semi-transparent
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const bx = projX + b.x * projW;
        const by = projY + b.y * projH;
        const br = b.r * scale;
        if (i === 2) {
          // Tracked blob: additive, so it gets brighter with each layer
          ctx.fillStyle = `hsla(220, 60%, 60%, ${layerAlpha * 2.5})`;
        } else {
          ctx.fillStyle = `hsla(220, 10%, 40%, ${layerAlpha * 0.6})`;
        }
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Extra highlight on tracked neuron position (it accumulates)
    if (visibleLayers > 3) {
      const brightFactor = visibleLayers / layerCount;
      const bx = projX + 0.42 * projW;
      const by = projY + 0.45 * projH;
      const glow = ctx.createRadialGradient(bx, by, 3 * scale, bx, by, 18 * scale);
      glow.addColorStop(0, `hsla(220, 65%, 65%, ${brightFactor * 0.6})`);
      glow.addColorStop(0.5, `hsla(220, 55%, 55%, ${brightFactor * 0.2})`);
      glow.addColorStop(1, `hsla(220, 45%, 45%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(bx, by, 18 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Border
    ctx.strokeStyle = "hsla(220, 30%, 45%, 0.5)";
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(projX, projY, projW, projH);
    // Counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${visibleLayers} / ${layerCount} layers overlaid`, width * 0.5, projY + projH + 18 * scale);
    // Label
    const labelAlpha = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.fillText("consistent neurons shine through", width * 0.5, projY + projH + 38 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Weaving Thread: horizontal bars with a thread weaving over-under through each.
  // drawNeuron at each connection point.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23007), [width, height, scale]);
  const sliceCount = 7;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const barX = width * 0.15;
    const barW = width * 0.7;
    const barH = 10 * scale;
    const startY = height * 0.1;
    const totalH = height * 0.68;
    const gapY = totalH / (sliceCount - 1);
    // Draw bars
    for (let i = 0; i < sliceCount; i++) {
      const barAppear = interpolate(frame, [3 + i * 5, 15 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (barAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * barAppear;
      const by = startY + i * gapY;
      drawSliceBar(ctx, barX, by, barW, barH, scale, barAppear, `${i + 1}`);
    }
    // Weaving thread
    const threadProgress = interpolate(frame, [30, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (threadProgress > 0) {
      const neuronX = barX + barW * 0.45;
      const visibleSegments = threadProgress * sliceCount;
      // Draw thread segments
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      for (let i = 0; i < Math.min(Math.floor(visibleSegments), sliceCount - 1); i++) {
        ctx.globalAlpha = fadeAlpha;
        const y1 = startY + i * gapY + barH / 2;
        const y2 = startY + (i + 1) * gapY + barH / 2;
        const isOver = i % 2 === 0;
        const wobble = (isOver ? 1 : -1) * 12 * scale;
        const midY = (y1 + y2) / 2;
        ctx.beginPath();
        ctx.moveTo(neuronX, y1);
        ctx.quadraticCurveTo(neuronX + wobble, midY, neuronX, y2);
        ctx.stroke();
      }
      // Dots at each slice intersection
      for (let i = 0; i <= Math.min(Math.floor(visibleSegments), sliceCount - 1); i++) {
        const by = startY + i * gapY + barH / 2;
        // Small neuron icon
        ctx.globalAlpha = fadeAlpha * 0.8;
        drawNeuron(ctx, neuronX, by, 12 * scale, `hsla(220, 60%, 60%, 0.8)`, frame);
      }
    }
    // "Same neuron" label with arrow
    const labelAlpha = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("same neuron woven through 7,000 slices", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Layer Alignment: slices start misaligned (shifted/rotated). They slide into
  // alignment. Once aligned, matching blobs line up and connecting lines appear.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23008), [width, height, scale]);
  const sliceCount = 5;
  const offsets = useMemo(() => {
    const rand = seeded(23081);
    return Array.from({ length: sliceCount }, () => ({
      dx: (rand() - 0.5) * 40 * scale,
      dy: (rand() - 0.5) * 15 * scale,
      angle: (rand() - 0.5) * 0.1,
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const barX = width * 0.2;
    const barW = width * 0.6;
    const barH = 16 * scale;
    const startY = height * 0.15;
    const totalH = height * 0.55;
    const gapY = totalH / (sliceCount - 1);
    // Alignment progress
    const alignProgress = interpolate(frame, [30, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const trackedFraction = 0.42; // Blob position within each bar
    for (let i = 0; i < sliceCount; i++) {
      const sliceAppear = interpolate(frame, [5 + i * 5, 15 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sliceAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * sliceAppear;
      const off = offsets[i];
      const currentDx = off.dx * (1 - alignProgress);
      const currentDy = off.dy * (1 - alignProgress);
      const currentAngle = off.angle * (1 - alignProgress);
      const by = startY + i * gapY;
      ctx.save();
      ctx.translate(barX + barW / 2 + currentDx, by + barH / 2 + currentDy);
      ctx.rotate(currentAngle);
      ctx.translate(-(barX + barW / 2), -(by + barH / 2));
      drawSliceBar(ctx, barX, by, barW, barH, scale, sliceAppear);
      // Grey blobs
      const rand = seeded(23082 + i * 50);
      for (let j = 0; j < 8; j++) {
        const bx = barX + (0.05 + rand() * 0.9) * barW;
        const br = (2 + rand() * 3) * scale;
        ctx.fillStyle = `hsla(220, 12%, 45%, 0.5)`;
        ctx.beginPath();
        ctx.arc(bx, by + barH / 2, br, 0, Math.PI * 2);
        ctx.fill();
      }
      // Tracked blob
      const trackedX = barX + trackedFraction * barW;
      ctx.fillStyle = `hsla(220, 55%, 55%, 0.7)`;
      ctx.beginPath();
      ctx.arc(trackedX, by + barH / 2, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Connecting lines appear after alignment
    const lineAppear = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lineAppear;
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      const trackedX = barX + trackedFraction * barW;
      ctx.beginPath();
      for (let i = 0; i < sliceCount; i++) {
        const by = startY + i * gapY + barH / 2;
        if (i === 0) ctx.moveTo(trackedX, by);
        else ctx.lineTo(trackedX, by);
      }
      ctx.stroke();
      // Dots
      for (let i = 0; i < sliceCount; i++) {
        const by = startY + i * gapY + barH / 2;
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.beginPath();
        ctx.arc(trackedX, by, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Label
    const labelAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("aligned — now blobs line up", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Assembly Animation: scattered colored pieces converge from edges.
  // Each piece is a blob from a different slice. They stack up vertically.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 23009), [width, height, scale]);
  const pieceCount = 10;
  const pieces = useMemo(() => {
    const rand = seeded(23091);
    return Array.from({ length: pieceCount }, (_, i) => {
      const angle = rand() * Math.PI * 2;
      const dist = 180 * scale + rand() * 60 * scale;
      return {
        startX: width / 2 + Math.cos(angle) * dist,
        startY: height / 2 + Math.sin(angle) * dist,
        targetY: height * 0.18 + (i / (pieceCount - 1)) * height * 0.6,
        r: 5 + rand() * 4,
        hue: PALETTE.cellColors[i % 8][0],
        delay: i * 6,
      };
    });
  }, [width, height, scale, pieceCount]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const targetX = width * 0.5;
    // Draw each piece converging
    let assembledCount = 0;
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      const moveProgress = interpolate(frame, [15 + p.delay, 50 + p.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const currentX = p.startX + (targetX - p.startX) * moveProgress;
      const currentY = p.startY + (p.targetY - p.startY) * moveProgress;
      const currentR = p.r * scale;
      if (moveProgress >= 1) assembledCount++;
      // Draw blob cross-section
      ctx.fillStyle = `hsla(${p.hue}, 55%, 55%, 0.8)`;
      ctx.beginPath();
      ctx.ellipse(currentX, currentY, currentR * 1.3, currentR * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Label once settled
      if (moveProgress >= 1) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`slice ${i + 1}`, currentX - currentR * 1.5 - 4 * scale, currentY + 3 * scale);
      }
    }
    // Once all assembled, draw connecting line
    const connectAppear = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (connectAppear > 0 && assembledCount === pieces.length) {
      ctx.globalAlpha = fadeAlpha * connectAppear;
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      for (let i = 0; i < pieces.length; i++) {
        const py = pieces[i].targetY;
        if (i === 0) ctx.moveTo(targetX, py);
        else ctx.lineTo(targetX, py);
      }
      ctx.stroke();
    }
    // Neuron icon appears at the assembled column
    const neuronAppear = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronAppear > 0) {
      ctx.globalAlpha = fadeAlpha * neuronAppear;
      drawNeuron(ctx, targetX + 55 * scale, height * 0.5, 35 * scale, `hsla(220, 55%, 60%, ${neuronAppear})`, frame);
      // Arrow from column to neuron
      ctx.strokeStyle = `hsla(50, 50%, 55%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(targetX + 12 * scale, height * 0.5);
      ctx.lineTo(targetX + 35 * scale, height * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Label
    const labelAlpha = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("cross-sections assemble into a neuron", width * 0.5, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_023: VariantDef[] = [
  { id: "3d-stack", label: "3D Slice Stack", component: V1 },
  { id: "thread-layers", label: "Thread Through Layers", component: V2 },
  { id: "color-tracking", label: "Color-Coded Tracking", component: V3 },
  { id: "depth-view", label: "Depth Visualization", component: V4 },
  { id: "flipbook", label: "Flipbook", component: V5 },
  { id: "z-projection", label: "Z-Stack Projection", component: V6 },
  { id: "weaving-thread", label: "Weaving Thread", component: V7 },
  { id: "alignment", label: "Layer Alignment", component: V8 },
  { id: "assembly", label: "Assembly Animation", component: V9 },
];
