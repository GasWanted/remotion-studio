import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMicroscope, drawWave, drawEye, drawNeuron, drawCamera, drawX, drawCheck } from "../icons";

// Shot 09 — "The brain is too small to see with a normal microscope."
// 120 frames (4s). Microscope tries to look at brain and fails — can't resolve.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Microscope Fail: drawMicroscope on left, circular viewfinder on right with blurry mess, "can't resolve" + drawX
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 9001), [width, height, scale]);
  const blobs = useMemo(() => {
    const rand = seeded(9011);
    return Array.from({ length: 18 }, () => ({
      x: rand() * 2 - 1, y: rand() * 2 - 1,
      r: 0.15 + rand() * 0.35,
      hue: 200 + rand() * 80,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Microscope slides in from left
    const microscopeSlide = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const microX = width * 0.22 * microscopeSlide;
    const microY = height * 0.45;
    ctx.globalAlpha = fadeAlpha * microscopeSlide;
    drawMicroscope(ctx, microX + width * 0.05, microY, 80 * scale, PALETTE.text.dim);
    // Arrow from microscope to viewfinder
    const arrowProgress = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowProgress > 0) {
      ctx.globalAlpha = fadeAlpha * arrowProgress;
      const arrowStartX = microX + width * 0.05 + 45 * scale;
      const arrowEndX = width * 0.55 - 55 * scale;
      const arrowX = arrowStartX + (arrowEndX - arrowStartX) * arrowProgress;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(arrowStartX, microY);
      ctx.lineTo(arrowX, microY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      if (arrowProgress > 0.8) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.beginPath();
        ctx.moveTo(arrowX, microY);
        ctx.lineTo(arrowX - 6 * scale, microY - 4 * scale);
        ctx.lineTo(arrowX - 6 * scale, microY + 4 * scale);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Circular viewfinder on right
    const viewfinderAppear = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vfX = width * 0.68;
    const vfY = height * 0.42;
    const vfR = 50 * scale;
    if (viewfinderAppear > 0) {
      ctx.globalAlpha = fadeAlpha * viewfinderAppear;
      // Clip to circle for blurry interior
      ctx.save();
      ctx.beginPath();
      ctx.arc(vfX, vfY, vfR, 0, Math.PI * 2);
      ctx.clip();
      // Dark background
      ctx.fillStyle = "rgba(15, 10, 25, 0.9)";
      ctx.fillRect(vfX - vfR, vfY - vfR, vfR * 2, vfR * 2);
      // Blurry blobs — soft overlapping gradients
      for (const blob of blobs) {
        const bx = vfX + blob.x * vfR * 0.7;
        const by = vfY + blob.y * vfR * 0.7;
        const br = blob.r * vfR;
        const wobble = Math.sin(frame * 0.04 + blob.hue) * 3 * scale;
        const grad = ctx.createRadialGradient(bx + wobble, by + wobble, 0, bx + wobble, by + wobble, br);
        grad.addColorStop(0, `hsla(${blob.hue}, 30%, 45%, 0.4)`);
        grad.addColorStop(1, `hsla(${blob.hue}, 20%, 35%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx + wobble, by + wobble, br, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Viewfinder ring
      ctx.strokeStyle = `hsla(220, 40%, 55%, ${viewfinderAppear * 0.7})`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(vfX, vfY, vfR, 0, Math.PI * 2);
      ctx.stroke();
      // Crosshairs
      ctx.strokeStyle = `hsla(220, 30%, 50%, ${viewfinderAppear * 0.3})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(vfX - vfR, vfY);
      ctx.lineTo(vfX + vfR, vfY);
      ctx.moveTo(vfX, vfY - vfR);
      ctx.lineTo(vfX, vfY + vfR);
      ctx.stroke();
    }
    // Red X stamp
    const xStamp = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xStamp > 0) {
      ctx.globalAlpha = fadeAlpha * xStamp;
      const xScale = 1 + (1 - xStamp) * 1.5; // Scale down from big to normal
      ctx.save();
      ctx.translate(vfX, vfY);
      ctx.scale(xScale, xScale);
      drawX(ctx, 0, 0, 35 * scale, PALETTE.accent.red);
      ctx.restore();
    }
    // Label
    const labelAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("can't resolve", vfX, vfY + vfR + 18 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom Attempt: camera zooms into brain dot, stays blurry no matter how close
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 9002), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.42;
    // Zoom factor increases over time
    const zoomFactor = interpolate(frame, [10, 90], [1, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Zoom ring indicator
    const ringRadius = 55 * scale;
    ctx.strokeStyle = `hsla(220, 35%, 50%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    // Save and clip to viewfinder
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius - 2 * scale, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(10, 8, 18, 0.95)";
    ctx.fillRect(centerX - ringRadius, centerY - ringRadius, ringRadius * 2, ringRadius * 2);
    // Brain blob — stays blurry regardless of zoom
    const blobRadius = 8 * scale * zoomFactor;
    const blurSpread = Math.max(12, blobRadius * 0.7);
    // Multiple overlapping gradient layers for blur effect
    for (let layer = 0; layer < 5; layer++) {
      const offsetX = Math.sin(layer * 1.7 + frame * 0.02) * blurSpread * 0.3;
      const offsetY = Math.cos(layer * 2.1 + frame * 0.015) * blurSpread * 0.3;
      const grad = ctx.createRadialGradient(
        centerX + offsetX, centerY + offsetY, 0,
        centerX + offsetX, centerY + offsetY, blurSpread
      );
      grad.addColorStop(0, `hsla(${200 + layer * 20}, 35%, 50%, 0.3)`);
      grad.addColorStop(0.5, `hsla(${210 + layer * 15}, 25%, 40%, 0.15)`);
      grad.addColorStop(1, `hsla(${220 + layer * 10}, 20%, 30%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX + offsetX, centerY + offsetY, blurSpread, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Zoom label
    const zoomLabel = `${zoomFactor.toFixed(0)}x`;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(zoomLabel, centerX, centerY + ringRadius + 20 * scale);
    // "Resolution limit reached" text appears after zoom maxes out
    const limitAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (limitAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * limitAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.fillText("resolution limit reached", centerX, centerY + ringRadius + 38 * scale);
      drawX(ctx, centerX + 85 * scale, centerY + ringRadius + 34 * scale, 12 * scale, PALETTE.accent.red);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Lens with X: large lens circle, tiny brain inside completely indistinct, big red X
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 9003), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.4;
    // Lens grows in
    const lensGrow = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lensRadius = 65 * scale * lensGrow;
    if (lensGrow > 0) {
      // Lens glass (slightly tinted)
      const glassGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, lensRadius);
      glassGrad.addColorStop(0, `hsla(200, 40%, 25%, 0.6)`);
      glassGrad.addColorStop(0.7, `hsla(210, 30%, 20%, 0.4)`);
      glassGrad.addColorStop(1, `hsla(220, 25%, 15%, 0.3)`);
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius, 0, Math.PI * 2);
      ctx.fill();
      // Lens rim
      ctx.strokeStyle = `hsla(220, 40%, 55%, ${lensGrow * 0.7})`;
      ctx.lineWidth = 3.5 * scale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, lensRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Lens handle
      const handleAngle = Math.PI * 0.25;
      ctx.strokeStyle = `hsla(220, 30%, 45%, ${lensGrow * 0.6})`;
      ctx.lineWidth = 5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(handleAngle) * lensRadius,
        centerY + Math.sin(handleAngle) * lensRadius
      );
      ctx.lineTo(
        centerX + Math.cos(handleAngle) * (lensRadius + 30 * scale),
        centerY + Math.sin(handleAngle) * (lensRadius + 30 * scale)
      );
      ctx.stroke();
    }
    // Tiny indistinct brain blob inside lens
    const brainAppear = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAppear > 0) {
      ctx.globalAlpha = fadeAlpha * brainAppear * 0.6;
      // Just a vague smudge
      const smudge = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15 * scale);
      smudge.addColorStop(0, `hsla(280, 30%, 50%, 0.5)`);
      smudge.addColorStop(0.6, `hsla(250, 20%, 40%, 0.2)`);
      smudge.addColorStop(1, `hsla(220, 15%, 30%, 0)`);
      ctx.fillStyle = smudge;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15 * scale, 0, Math.PI * 2);
      ctx.fill();
      // A second smaller offset blob
      const smudge2 = ctx.createRadialGradient(centerX + 6 * scale, centerY - 4 * scale, 0, centerX + 6 * scale, centerY - 4 * scale, 10 * scale);
      smudge2.addColorStop(0, `hsla(310, 25%, 45%, 0.4)`);
      smudge2.addColorStop(1, `hsla(260, 15%, 35%, 0)`);
      ctx.fillStyle = smudge2;
      ctx.beginPath();
      ctx.arc(centerX + 6 * scale, centerY - 4 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fadeAlpha;
    }
    // Big red X stamps down
    const xAppear = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xAppear > 0) {
      ctx.globalAlpha = fadeAlpha * xAppear;
      const stampScale = 1 + (1 - xAppear) * 2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(stampScale, stampScale);
      drawX(ctx, 0, 0, 50 * scale, PALETTE.accent.red);
      ctx.restore();
    }
    // Label
    const labelAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light microscope: FAIL", centerX, centerY + lensRadius + 25 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Sharp vs Blurry Split: left half clear neuron, right half blurry smear, divider line
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 9004), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const dividerX = width * 0.5;
    const contentY = height * 0.42;
    // Left side: clear neuron drawing appears
    const leftAppear = interpolate(frame, [8, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      // "What we want to see" label
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("what we want to see", width * 0.25, height * 0.15);
      // Clear neuron
      drawNeuron(ctx, width * 0.25, contentY, 55 * scale, `hsla(180, 55%, 60%, ${leftAppear})`, frame);
      // Detail labels
      const detailAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (detailAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * detailAlpha;
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${8 * scale}px system-ui`;
        ctx.fillText("dendrites", width * 0.13, contentY - 18 * scale);
        ctx.fillText("axon", width * 0.37, contentY + 12 * scale);
        ctx.fillText("soma", width * 0.25, contentY + 25 * scale);
      }
    }
    // Right side: blurry smear
    const rightAppear = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      // "What the microscope shows" label
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("what the microscope shows", width * 0.75, height * 0.15);
      // Blurry mess — multiple overlapping soft gradients
      for (let i = 0; i < 8; i++) {
        const bx = width * 0.75 + (Math.sin(i * 1.5) * 15 - 7) * scale;
        const by = contentY + (Math.cos(i * 2.1) * 12 - 5) * scale;
        const blobR = (18 + i * 3) * scale;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, blobR);
        grad.addColorStop(0, `hsla(${180 + i * 15}, 25%, 40%, 0.25)`);
        grad.addColorStop(1, `hsla(${190 + i * 10}, 15%, 30%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx, by, blobR, 0, Math.PI * 2);
        ctx.fill();
      }
      // Red X on the blurry side
      const xAlpha = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (xAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * xAlpha;
        drawX(ctx, width * 0.75, contentY, 30 * scale, PALETTE.accent.red);
      }
    }
    // Divider line
    const dividerAlpha = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dividerAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * dividerAlpha;
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.5)`;
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(dividerX, height * 0.1);
      ctx.lineTo(dividerX, height * 0.8);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("too small to resolve", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Magnification Ladder: 3 circular views stacked: 10x, 100x, 1000x — all blobs, red X on each
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 9005), [width, height, scale]);
  const blobSets = useMemo(() => {
    const rand = seeded(9051);
    return [0, 1, 2].map(() =>
      Array.from({ length: 6 }, () => ({
        offsetX: (rand() - 0.5) * 0.6,
        offsetY: (rand() - 0.5) * 0.6,
        r: 0.2 + rand() * 0.3,
        hue: 200 + rand() * 60,
      }))
    );
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    const magnifications = ["10x", "100x", "1000x"];
    const circleRadius = 32 * scale;
    const startY = height * 0.2;
    const gapY = height * 0.24;
    for (let i = 0; i < 3; i++) {
      const delay = i * 20;
      const circleAppear = interpolate(frame, [10 + delay, 25 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (circleAppear <= 0) continue;
      const cx = width * 0.45;
      const cy = startY + i * gapY;
      ctx.globalAlpha = fadeAlpha * circleAppear;
      // Circle background
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(10, 8, 18, 0.9)";
      ctx.fillRect(cx - circleRadius, cy - circleRadius, circleRadius * 2, circleRadius * 2);
      // Blurry blobs inside
      for (const blob of blobSets[i]) {
        const bx = cx + blob.offsetX * circleRadius;
        const by = cy + blob.offsetY * circleRadius;
        const br = blob.r * circleRadius;
        const wobble = Math.sin(frame * 0.03 + blob.hue + i) * 2 * scale;
        const grad = ctx.createRadialGradient(bx + wobble, by, 0, bx + wobble, by, br);
        grad.addColorStop(0, `hsla(${blob.hue}, 30%, 45%, 0.45)`);
        grad.addColorStop(1, `hsla(${blob.hue}, 20%, 35%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(bx + wobble, by, br, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      // Circle rim
      ctx.strokeStyle = `hsla(220, 40%, 50%, 0.6)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Magnification label on left
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(magnifications[i], cx - circleRadius - 10 * scale, cy + 4 * scale);
      // Red X on right, appears with stagger
      const xDelay = 15;
      const xAppear = interpolate(frame, [55 + i * xDelay, 65 + i * xDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (xAppear > 0) {
        ctx.globalAlpha = fadeAlpha * xAppear;
        drawX(ctx, cx + circleRadius + 18 * scale, cy, 18 * scale, PALETTE.accent.red);
      }
    }
    // "None resolve" label
    const noneAlpha = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (noneAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * noneAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("none resolve", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Scale Bar Problem: ruler with 500nm wavelength vs neuron features at 40nm — ruler too coarse
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 9006), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const rulerY = height * 0.3;
    const rulerX = width * 0.15;
    const rulerW = width * 0.7;
    // Draw main ruler
    const rulerAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rulerAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rulerAppear;
      // Ruler line
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(rulerX, rulerY);
      ctx.lineTo(rulerX + rulerW * rulerAppear, rulerY);
      ctx.stroke();
      // Tick marks every "100nm"
      const tickCount = 5; // 0, 100, 200, 300, 400, 500
      for (let i = 0; i <= tickCount; i++) {
        const tx = rulerX + (i / tickCount) * rulerW;
        if (tx > rulerX + rulerW * rulerAppear) break;
        ctx.beginPath();
        ctx.moveTo(tx, rulerY - 8 * scale);
        ctx.lineTo(tx, rulerY + 8 * scale);
        ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${8 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${i * 100}`, tx, rulerY + 20 * scale);
      }
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("nm", rulerX + rulerW + 15 * scale, rulerY + 4 * scale);
    }
    // Light wavelength bar (500nm) — full width, gold
    const lightBarAppear = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightBarAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lightBarAppear;
      const barY = height * 0.48;
      const barHeight = 18 * scale;
      // Gold bar spanning full ruler
      ctx.fillStyle = `hsla(50, 65%, 55%, 0.4)`;
      ctx.fillRect(rulerX, barY, rulerW * lightBarAppear, barHeight);
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(rulerX, barY, rulerW * lightBarAppear, barHeight);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("light wavelength: 500 nm", rulerX, barY - 8 * scale);
    }
    // Neuron feature bar (40nm) — tiny, violet
    const neuronBarAppear = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronBarAppear > 0) {
      ctx.globalAlpha = fadeAlpha * neuronBarAppear;
      const neuronBarY = height * 0.62;
      const neuronBarH = 18 * scale;
      const neuronBarW = rulerW * (40 / 500); // Proportional to 40nm
      ctx.fillStyle = `hsla(280, 55%, 55%, 0.5)`;
      ctx.fillRect(rulerX, neuronBarY, neuronBarW * neuronBarAppear, neuronBarH);
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.8)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(rulerX, neuronBarY, neuronBarW * neuronBarAppear, neuronBarH);
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("neuron feature: 40 nm", rulerX, neuronBarY - 8 * scale);
      // Arrow pointing to tiny bar
      if (neuronBarAppear > 0.5) {
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.moveTo(rulerX + neuronBarW + 15 * scale, neuronBarY + neuronBarH / 2);
        ctx.lineTo(rulerX + 80 * scale, neuronBarY + neuronBarH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText("barely visible at this scale", rulerX + 85 * scale, neuronBarY + neuronBarH / 2 + 3 * scale);
      }
    }
    // Mismatch label
    const mismatchAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mismatchAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * mismatchAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("12.5x too coarse to resolve", width * 0.5, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Light Rays Bounce: light waves approach brain from above, bounce off — features smaller than waves
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale, 9007), [width, height, scale]);
  const brainDots = useMemo(() => {
    const rand = seeded(9071);
    return Array.from({ length: 12 }, () => ({
      x: (rand() - 0.5) * 0.5,
      y: (rand() - 0.5) * 0.2,
      r: 1.5 + rand() * 2,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const brainY = height * 0.55;
    // Tiny brain structures at bottom center
    const brainAppear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAppear > 0) {
      ctx.globalAlpha = fadeAlpha * brainAppear;
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron structures (40 nm)", centerX, brainY + 25 * scale);
      // Tiny dots
      for (const dot of brainDots) {
        ctx.fillStyle = `hsla(280, 45%, 55%, 0.7)`;
        ctx.beginPath();
        ctx.arc(centerX + dot.x * 80 * scale, brainY + dot.y * 30 * scale, dot.r * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Light rays coming down (3 wavy beams)
    const rayCount = 5;
    for (let i = 0; i < rayCount; i++) {
      const rayX = centerX + (i - 2) * 30 * scale;
      const rayDelay = i * 8;
      const rayDown = interpolate(frame, [15 + rayDelay, 45 + rayDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rayBounce = interpolate(frame, [45 + rayDelay, 70 + rayDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rayDown <= 0) continue;
      ctx.globalAlpha = fadeAlpha * Math.min(rayDown, 1);
      // Downward ray
      const rayStartY = height * 0.12;
      const rayEndY = brainY - 10 * scale;
      const currentEndY = rayStartY + (rayEndY - rayStartY) * rayDown;
      // Draw as sine wave (wide)
      ctx.strokeStyle = `hsla(50, 65%, 60%, 0.6)`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      for (let py = rayStartY; py <= currentEndY; py += 2) {
        const waveX = rayX + Math.sin((py / (25 * scale)) * Math.PI * 2) * 8 * scale;
        py === rayStartY ? ctx.moveTo(waveX, py) : ctx.lineTo(waveX, py);
      }
      ctx.stroke();
      // Bounced ray going up and outward
      if (rayBounce > 0) {
        ctx.globalAlpha = fadeAlpha * rayBounce * 0.8;
        const bounceAngle = (i - 2) * 0.3 + (i % 2 === 0 ? 0.15 : -0.15);
        ctx.strokeStyle = `hsla(50, 55%, 55%, ${0.5 * (1 - rayBounce * 0.5)})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        const bounceLen = 60 * scale * rayBounce;
        for (let d = 0; d <= bounceLen; d += 2) {
          const bx = rayX + Math.sin(bounceAngle) * d + Math.sin((d / (25 * scale)) * Math.PI * 2) * 6 * scale;
          const by = rayEndY - Math.cos(bounceAngle) * d;
          d === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }
    }
    // Impact flash
    const flashAlpha = interpolate(frame, [45, 50, 55], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flashAlpha;
      const flashGrad = ctx.createRadialGradient(centerX, brainY - 5 * scale, 0, centerX, brainY - 5 * scale, 40 * scale);
      flashGrad.addColorStop(0, `hsla(50, 70%, 70%, 0.6)`);
      flashGrad.addColorStop(1, `hsla(50, 50%, 50%, 0)`);
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(centerX, brainY - 5 * scale, 40 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // "Features smaller than waves" label
    const labelAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light bounces off — can't penetrate", centerX, height * 0.82);
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.fillText("features < wavelength", centerX, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Airy Disc: viewfinder shows overlapping Airy disc patterns instead of sharp points
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 9008), [width, height, scale]);
  const discPositions = useMemo(() => {
    const rand = seeded(9081);
    return Array.from({ length: 7 }, () => ({
      x: (rand() - 0.5) * 0.65,
      y: (rand() - 0.5) * 0.65,
      hue: 200 + rand() * 80,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.4;
    const viewRadius = 60 * scale;
    // Viewfinder circle appears
    const viewAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (viewAppear > 0) {
      ctx.globalAlpha = fadeAlpha * viewAppear;
      // Dark interior
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, viewRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
      ctx.fillRect(centerX - viewRadius, centerY - viewRadius, viewRadius * 2, viewRadius * 2);
      // Airy disc patterns — concentric rings that overlap
      const discAppear = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (discAppear > 0) {
        const visibleDiscs = Math.floor(discAppear * discPositions.length);
        for (let d = 0; d < visibleDiscs; d++) {
          const disc = discPositions[d];
          const dx = centerX + disc.x * viewRadius;
          const dy = centerY + disc.y * viewRadius;
          // Draw concentric rings
          for (let ring = 3; ring >= 0; ring--) {
            const ringR = (12 + ring * 6) * scale * (1 + Math.sin(frame * 0.02 + d) * 0.05);
            const ringAlpha = 0.3 / (ring + 1);
            const grad = ctx.createRadialGradient(dx, dy, ringR * 0.6, dx, dy, ringR);
            grad.addColorStop(0, `hsla(${disc.hue}, 40%, 55%, ${ringAlpha})`);
            grad.addColorStop(0.5, `hsla(${disc.hue}, 30%, 45%, ${ringAlpha * 0.3})`);
            grad.addColorStop(0.8, `hsla(${disc.hue}, 35%, 50%, ${ringAlpha * 0.15})`);
            grad.addColorStop(1, `hsla(${disc.hue}, 25%, 40%, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(dx, dy, ringR, 0, Math.PI * 2);
            ctx.fill();
          }
          // Central bright spot
          ctx.fillStyle = `hsla(${disc.hue}, 50%, 70%, 0.6)`;
          ctx.beginPath();
          ctx.arc(dx, dy, 3 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      // Viewfinder rim
      ctx.strokeStyle = `hsla(220, 40%, 55%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, viewRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Crosshairs
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.25)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX - viewRadius, centerY);
      ctx.lineTo(centerX + viewRadius, centerY);
      ctx.moveTo(centerX, centerY - viewRadius);
      ctx.lineTo(centerX, centerY + viewRadius);
      ctx.stroke();
    }
    // "Diffraction limit" label
    const labelAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("diffraction limit", centerX, centerY + viewRadius + 20 * scale);
      // Physics note
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px monospace`;
      ctx.fillText("points blur into overlapping discs", centerX, centerY + viewRadius + 36 * scale);
    }
    // Microscope icon top-left
    const microAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (microAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * microAlpha;
      drawMicroscope(ctx, width * 0.12, height * 0.2, 50 * scale, PALETTE.text.dim);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Question Mark View: microscope viewfinder circle, inside just a big "?" — nothing visible
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 9009), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.38;
    const viewRadius = 60 * scale;
    // Microscope icon on left
    const microAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (microAppear > 0) {
      ctx.globalAlpha = fadeAlpha * microAppear;
      drawMicroscope(ctx, width * 0.15, height * 0.4, 65 * scale, PALETTE.text.dim);
    }
    // Viewfinder circle grows in
    const viewGrow = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (viewGrow > 0) {
      const currentR = viewRadius * viewGrow;
      ctx.globalAlpha = fadeAlpha * viewGrow;
      // Dark interior
      ctx.fillStyle = "rgba(10, 7, 18, 0.95)";
      ctx.beginPath();
      ctx.arc(centerX + width * 0.1, centerY, currentR, 0, Math.PI * 2);
      ctx.fill();
      // Subtle noise/static texture inside
      const rand = seeded(9091 + Math.floor(frame / 3));
      for (let i = 0; i < 20; i++) {
        const sx = (centerX + width * 0.1) + (rand() - 0.5) * currentR * 1.5;
        const sy = centerY + (rand() - 0.5) * currentR * 1.5;
        const dist = Math.sqrt(Math.pow(sx - (centerX + width * 0.1), 2) + Math.pow(sy - centerY, 2));
        if (dist > currentR) continue;
        ctx.fillStyle = `hsla(220, 15%, 35%, ${rand() * 0.15})`;
        ctx.fillRect(sx, sy, 2 * scale, 2 * scale);
      }
      // Big "?" in center
      const questionAppear = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (questionAppear > 0) {
        ctx.globalAlpha = fadeAlpha * questionAppear;
        const pulse = 1 + Math.sin(frame * 0.06) * 0.05;
        ctx.save();
        ctx.translate(centerX + width * 0.1, centerY);
        ctx.scale(pulse, pulse);
        ctx.fillStyle = `hsla(220, 35%, 55%, ${questionAppear * 0.8})`;
        ctx.font = `bold ${45 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", 0, 0);
        ctx.restore();
      }
      // Viewfinder rim
      ctx.globalAlpha = fadeAlpha * viewGrow;
      ctx.strokeStyle = `hsla(220, 40%, 50%, 0.7)`;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.arc(centerX + width * 0.1, centerY, currentR, 0, Math.PI * 2);
      ctx.stroke();
    }
    // "Too small for light" label below
    const labelAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("too small for light", centerX + width * 0.1, centerY + viewRadius + 22 * scale);
    }
    // Red X stamps at the end
    const xStamp = interpolate(frame, [75, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xStamp > 0) {
      ctx.globalAlpha = fadeAlpha * xStamp;
      const stampBounce = 1 + (1 - xStamp) * 1.2;
      ctx.save();
      ctx.translate(centerX + width * 0.1, centerY);
      ctx.scale(stampBounce, stampBounce);
      drawX(ctx, 0, 0, 40 * scale, PALETTE.accent.red);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_009: VariantDef[] = [
  { id: "microscope-fail", label: "Microscope Fail", component: V1 },
  { id: "zoom-attempt", label: "Zoom Attempt", component: V2 },
  { id: "lens-x", label: "Lens with X", component: V3 },
  { id: "sharp-vs-blurry", label: "Sharp vs Blurry", component: V4 },
  { id: "mag-ladder", label: "Magnification Ladder", component: V5 },
  { id: "scale-bar", label: "Scale Bar Problem", component: V6 },
  { id: "light-bounce", label: "Light Rays Bounce", component: V7 },
  { id: "airy-disc", label: "Airy Disc", component: V8 },
  { id: "question-view", label: "Question Mark View", component: V9 },
];
