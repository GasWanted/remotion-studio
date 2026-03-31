import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMicroscope, drawWave, drawEye, drawNeuron, drawCamera, drawX, drawCheck } from "../icons";

// Shot 12 — "which lets you see detail down to a few nanometers."
// 120 frames (4s). Blur-to-sharp EM image snap into focus.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Blur Dissolve: circular EM view showing blurry blobs -> crisp edges, internal structure appears
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12001), [width, height, scale]);
  const structures = useMemo(() => {
    const rand = seeded(12011);
    return Array.from({ length: 9 }, () => ({
      x: (rand() - 0.5) * 0.7,
      y: (rand() - 0.5) * 0.7,
      r: 0.06 + rand() * 0.1,
      hue: 180 + rand() * 60,
      innerDots: Math.floor(2 + rand() * 3),
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
    const viewR = 65 * scale;
    // Focus progress: 0 = blurry, 1 = sharp
    const focusProgress = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Viewfinder circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.clip();
    // Dark background
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(centerX - viewR, centerY - viewR, viewR * 2, viewR * 2);
    // Draw structures — sharpness increases with focusProgress
    for (const s of structures) {
      const sx = centerX + s.x * viewR;
      const sy = centerY + s.y * viewR;
      const sr = s.r * viewR;
      // Blur radius decreases with focus
      const blurRadius = sr * (2.5 - focusProgress * 2.2);
      // Outer blob (always visible, gets tighter)
      const blobGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, blurRadius);
      blobGrad.addColorStop(0, `hsla(${s.hue}, 35%, 50%, ${0.3 + focusProgress * 0.4})`);
      blobGrad.addColorStop(focusProgress * 0.7, `hsla(${s.hue}, 30%, 45%, ${0.2 + focusProgress * 0.2})`);
      blobGrad.addColorStop(1, `hsla(${s.hue}, 25%, 40%, 0)`);
      ctx.fillStyle = blobGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, blurRadius, 0, Math.PI * 2);
      ctx.fill();
      // Sharp membrane boundary (appears with focus)
      if (focusProgress > 0.3) {
        const membraneAlpha = (focusProgress - 0.3) / 0.7;
        ctx.strokeStyle = `hsla(${s.hue}, 45%, 60%, ${membraneAlpha * 0.7})`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Internal structure (vesicles — appears later in focus)
      if (focusProgress > 0.5) {
        const innerAlpha = (focusProgress - 0.5) / 0.5;
        const rand = seeded(Math.floor(s.hue * 100));
        for (let d = 0; d < s.innerDots; d++) {
          const angle = rand() * Math.PI * 2;
          const dist = rand() * sr * 0.6;
          const dotR = sr * 0.15;
          ctx.fillStyle = `hsla(${s.hue + 30}, 40%, 55%, ${innerAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(sx + Math.cos(angle) * dist, sy + Math.sin(angle) * dist, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
    // Viewfinder ring
    ctx.strokeStyle = `hsla(190, 40%, 50%, 0.6)`;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.stroke();
    // "ELECTRON MICROSCOPE" label
    const labelAlpha = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAlpha;
    ctx.fillStyle = `hsla(190, 55%, 60%, 0.8)`;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("ELECTRON MICROSCOPE", centerX, height * 0.1);
    // Scale bar appears when sharp
    const scaleBarAlpha = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scaleBarAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * scaleBarAlpha;
      const barX = centerX + viewR * 0.3;
      const barY = centerY + viewR - 10 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(barX, barY);
      ctx.lineTo(barX + 20 * scale, barY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("50 nm", barX + 10 * scale, barY - 4 * scale);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("detail down to a few nanometers", centerX, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Focus Ring: camera-style focus ring circle tightens, image sharpens. Ring starts large, ends tight.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12002), [width, height, scale]);
  const features = useMemo(() => {
    const rand = seeded(12021);
    return Array.from({ length: 7 }, () => ({
      x: (rand() - 0.5) * 0.6,
      y: (rand() - 0.5) * 0.6,
      r: 0.05 + rand() * 0.08,
      hue: 190 + rand() * 50,
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
    const maxR = 70 * scale;
    // Focus ring shrinks as it tightens
    const focusProgress = interpolate(frame, [10, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ringR = maxR * (1.3 - focusProgress * 0.3);
    const innerR = maxR * 0.9;
    // Draw image area
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(centerX - innerR, centerY - innerR, innerR * 2, innerR * 2);
    // Features — sharpness based on focusProgress
    for (const f of features) {
      const fx = centerX + f.x * innerR;
      const fy = centerY + f.y * innerR;
      const fr = f.r * innerR;
      const blurSize = fr * (3 - focusProgress * 2.5);
      // Blob (always there, tightens)
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, blurSize);
      grad.addColorStop(0, `hsla(${f.hue}, 40%, 55%, ${0.2 + focusProgress * 0.5})`);
      grad.addColorStop(0.6, `hsla(${f.hue}, 30%, 45%, ${0.1 + focusProgress * 0.2})`);
      grad.addColorStop(1, `hsla(${f.hue}, 20%, 35%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, blurSize, 0, Math.PI * 2);
      ctx.fill();
      // Sharp outline
      if (focusProgress > 0.4) {
        const outlineAlpha = (focusProgress - 0.4) / 0.6;
        ctx.strokeStyle = `hsla(${f.hue}, 50%, 65%, ${outlineAlpha * 0.8})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.stroke();
        // Nucleus dot
        ctx.fillStyle = `hsla(${f.hue + 20}, 45%, 50%, ${outlineAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(fx, fy, fr * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Focus ring with tick marks
    ctx.strokeStyle = `hsla(${190 + focusProgress * 30}, 45%, 55%, 0.6)`;
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringR, 0, Math.PI * 2);
    ctx.stroke();
    // Tick marks on ring (rotate with focus)
    const tickRotation = focusProgress * Math.PI * 1.5;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + tickRotation;
      const inner = ringR - 3 * scale;
      const outer = ringR + 5 * scale;
      ctx.strokeStyle = `hsla(220, 30%, 50%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
      ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
      ctx.stroke();
    }
    // "In focus" indicator
    const focusIndicator = focusProgress > 0.9;
    const indicatorAlpha = interpolate(frame, [75, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (indicatorAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * indicatorAlpha;
      const indicatorColor = focusIndicator ? PALETTE.accent.green : PALETTE.accent.gold;
      ctx.fillStyle = indicatorColor;
      ctx.beginPath();
      ctx.arc(centerX + ringR + 15 * scale, centerY - ringR + 10 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(focusIndicator ? "IN FOCUS" : "focusing...", centerX + ringR + 23 * scale, centerY - ringR + 13 * scale);
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("nanometer-scale detail emerges", centerX, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Before/After Wipe: left half blurry (labeled "before"), vertical wipe reveals sharp right half
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12003), [width, height, scale]);
  const cellData = useMemo(() => {
    const rand = seeded(12031);
    return Array.from({ length: 8 }, () => ({
      x: rand() * 0.6 + 0.2,
      y: rand() * 0.5 + 0.2,
      r: (4 + rand() * 6) * scale,
      hue: 190 + rand() * 50,
      vesicles: Math.floor(2 + rand() * 4),
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const imgLeft = width * 0.1;
    const imgTop = height * 0.15;
    const imgW = width * 0.8;
    const imgH = height * 0.55;
    // Wipe position (left to right)
    const wipeProgress = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wipeX = imgLeft + imgW * wipeProgress;
    // Background frame
    ctx.fillStyle = "rgba(10, 7, 18, 0.7)";
    ctx.fillRect(imgLeft, imgTop, imgW, imgH);
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(imgLeft, imgTop, imgW, imgH);
    // Draw blurry version (full width, underneath)
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgLeft, imgTop, imgW, imgH);
    ctx.clip();
    for (const cell of cellData) {
      const cx = imgLeft + cell.x * imgW;
      const cy = imgTop + cell.y * imgH;
      // Blurry blob
      const blurR = cell.r * 3;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blurR);
      grad.addColorStop(0, `hsla(${cell.hue}, 25%, 45%, 0.35)`);
      grad.addColorStop(0.5, `hsla(${cell.hue}, 20%, 40%, 0.15)`);
      grad.addColorStop(1, `hsla(${cell.hue}, 15%, 35%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, blurR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Draw sharp version (only right of wipe line)
    if (wipeProgress > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(wipeX, imgTop, imgW - (wipeX - imgLeft), imgH);
      ctx.clip();
      // Slightly different background for "after"
      ctx.fillStyle = "rgba(12, 9, 22, 0.85)";
      ctx.fillRect(wipeX, imgTop, imgW - (wipeX - imgLeft), imgH);
      for (const cell of cellData) {
        const cx = imgLeft + cell.x * imgW;
        const cy = imgTop + cell.y * imgH;
        // Sharp membrane
        ctx.strokeStyle = `hsla(${cell.hue}, 50%, 60%, 0.7)`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, cell.r, 0, Math.PI * 2);
        ctx.stroke();
        // Cell fill
        ctx.fillStyle = `hsla(${cell.hue}, 35%, 45%, 0.3)`;
        ctx.beginPath();
        ctx.arc(cx, cy, cell.r, 0, Math.PI * 2);
        ctx.fill();
        // Internal vesicles
        const rand = seeded(Math.floor(cell.hue * 100));
        for (let v = 0; v < cell.vesicles; v++) {
          const va = rand() * Math.PI * 2;
          const vd = rand() * cell.r * 0.55;
          ctx.fillStyle = `hsla(${cell.hue + 20}, 45%, 55%, 0.5)`;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(va) * vd, cy + Math.sin(va) * vd, cell.r * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
    // Wipe line
    if (wipeProgress > 0 && wipeProgress < 1) {
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(wipeX, imgTop);
      ctx.lineTo(wipeX, imgTop + imgH);
      ctx.stroke();
      // Triangle handle
      ctx.fillStyle = PALETTE.text.primary;
      ctx.beginPath();
      ctx.moveTo(wipeX, imgTop + imgH / 2 - 8 * scale);
      ctx.lineTo(wipeX + 6 * scale, imgTop + imgH / 2);
      ctx.lineTo(wipeX, imgTop + imgH / 2 + 8 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(wipeX, imgTop + imgH / 2 - 8 * scale);
      ctx.lineTo(wipeX - 6 * scale, imgTop + imgH / 2);
      ctx.lineTo(wipeX, imgTop + imgH / 2 + 8 * scale);
      ctx.closePath();
      ctx.fill();
    }
    // Labels
    const beforeAlpha = interpolate(wipeProgress, [0, 0.3], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * beforeAlpha;
    ctx.fillStyle = PALETTE.accent.red;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("light microscope", imgLeft + imgW * 0.25, imgTop + imgH + 16 * scale);
    if (wipeProgress > 0.3) {
      ctx.globalAlpha = fadeAlpha * (wipeProgress - 0.3) / 0.7;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillText("electron microscope", imgLeft + imgW * 0.75, imgTop + imgH + 16 * scale);
    }
    // Scale bar
    const scaleBarAlpha = interpolate(frame, [80, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scaleBarAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * scaleBarAlpha;
      const sbX = imgLeft + imgW - 35 * scale;
      const sbY = imgTop + imgH - 10 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY);
      ctx.lineTo(sbX + 25 * scale, sbY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("50 nm", sbX + 12.5 * scale, sbY - 4 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom Into Detail: start blurry, zoom in, detail snaps into focus at critical zoom level
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12004), [width, height, scale]);
  const structures = useMemo(() => {
    const rand = seeded(12041);
    return Array.from({ length: 6 }, () => ({
      x: (rand() - 0.5) * 0.4,
      y: (rand() - 0.5) * 0.4,
      r: 0.04 + rand() * 0.06,
      hue: 190 + rand() * 50,
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
    const centerY = height * 0.42;
    const viewR = 60 * scale;
    // Zoom increases
    const zoomLevel = interpolate(frame, [10, 65], [1, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Focus snap happens at zoom level ~6
    const focusSnap = interpolate(frame, [55, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Viewfinder
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(centerX - viewR, centerY - viewR, viewR * 2, viewR * 2);
    // Structures — zoom in and focus
    for (const s of structures) {
      const sx = centerX + s.x * viewR * zoomLevel * 0.3;
      const sy = centerY + s.y * viewR * zoomLevel * 0.3;
      const sr = s.r * viewR * zoomLevel * 0.5;
      // Blur inversely proportional to focus
      const blurFactor = 1 - focusSnap * 0.85;
      const blurR = sr * (1 + blurFactor * 3);
      // Blurry version
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, blurR);
      grad.addColorStop(0, `hsla(${s.hue}, ${25 + focusSnap * 25}%, ${40 + focusSnap * 15}%, ${0.2 + focusSnap * 0.5})`);
      grad.addColorStop(0.5, `hsla(${s.hue}, 25%, 40%, ${0.1 * (1 - focusSnap * 0.5)})`);
      grad.addColorStop(1, `hsla(${s.hue}, 20%, 35%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, blurR, 0, Math.PI * 2);
      ctx.fill();
      // Sharp border after focus
      if (focusSnap > 0.5) {
        const sharpAlpha = (focusSnap - 0.5) * 2;
        ctx.strokeStyle = `hsla(${s.hue}, 50%, 60%, ${sharpAlpha * 0.8})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.stroke();
        // Membrane texture
        ctx.fillStyle = `hsla(${s.hue}, 40%, 50%, ${sharpAlpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Viewfinder rim
    ctx.strokeStyle = `hsla(190, 40%, 50%, 0.6)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.stroke();
    // Flash at focus snap moment
    const flashAlpha = interpolate(frame, [57, 60, 65], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flashAlpha;
      ctx.fillStyle = `hsla(190, 50%, 80%, ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Zoom label
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${zoomLevel.toFixed(0)}x`, centerX, centerY + viewR + 18 * scale);
    // Status text
    if (focusSnap < 0.5) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("zooming in...", centerX, centerY + viewR + 32 * scale);
    } else {
      const sharpAlpha = interpolate(frame, [62, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * sharpAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.fillText("detail resolved!", centerX, centerY + viewR + 32 * scale);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("a few nanometers of resolution", centerX, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Viewfinder Focus: microscope viewfinder with crosshairs converging as focus improves
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12005), [width, height, scale]);
  const features = useMemo(() => {
    const rand = seeded(12051);
    return Array.from({ length: 10 }, () => ({
      x: (rand() - 0.5) * 0.7,
      y: (rand() - 0.5) * 0.7,
      r: 0.04 + rand() * 0.07,
      hue: 185 + rand() * 55,
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
    const viewR = 62 * scale;
    // Focus progress
    const focusProgress = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Crosshair spread (converges to center as focus improves)
    const crosshairSpread = viewR * (1.2 - focusProgress * 0.8);
    // Viewfinder background
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(centerX - viewR, centerY - viewR, viewR * 2, viewR * 2);
    // EM features
    for (const f of features) {
      const fx = centerX + f.x * viewR;
      const fy = centerY + f.y * viewR;
      const fr = f.r * viewR;
      const blurAmount = 1 - focusProgress * 0.9;
      const blurR = fr * (1 + blurAmount * 4);
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, blurR);
      grad.addColorStop(0, `hsla(${f.hue}, ${25 + focusProgress * 30}%, ${42 + focusProgress * 12}%, ${0.25 + focusProgress * 0.45})`);
      grad.addColorStop(1, `hsla(${f.hue}, 20%, 35%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, blurR, 0, Math.PI * 2);
      ctx.fill();
      // Sharp edges
      if (focusProgress > 0.5) {
        const edgeAlpha = (focusProgress - 0.5) * 2;
        ctx.strokeStyle = `hsla(${f.hue}, 50%, 60%, ${edgeAlpha * 0.7})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(fx, fy, fr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    // Viewfinder ring
    ctx.strokeStyle = `hsla(190, 40%, 50%, 0.6)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, viewR, 0, Math.PI * 2);
    ctx.stroke();
    // Crosshairs that converge
    ctx.strokeStyle = `hsla(190, 40%, 55%, ${0.3 + focusProgress * 0.3})`;
    ctx.lineWidth = 1.5 * scale;
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(centerX - viewR, centerY);
    ctx.lineTo(centerX - crosshairSpread * 0.3, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + crosshairSpread * 0.3, centerY);
    ctx.lineTo(centerX + viewR, centerY);
    ctx.stroke();
    // Vertical
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - viewR);
    ctx.lineTo(centerX, centerY - crosshairSpread * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + crosshairSpread * 0.3);
    ctx.lineTo(centerX, centerY + viewR);
    ctx.stroke();
    // Corner brackets
    const bracketSize = 10 * scale;
    const bracketDist = crosshairSpread * 0.2;
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const bx = centerX + dx * bracketDist;
      const by = centerY + dy * bracketDist;
      ctx.beginPath();
      ctx.moveTo(bx, by + dy * -bracketSize);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + dx * -bracketSize, by);
      ctx.stroke();
    }
    // Focus indicator
    const indicatorAlpha = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (indicatorAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * indicatorAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.beginPath();
      ctx.arc(centerX + viewR + 12 * scale, centerY - viewR, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `bold ${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("FOCUSED", centerX + viewR + 20 * scale, centerY - viewR + 3 * scale);
    }
    // Resolution label
    const resAlpha = interpolate(frame, [78, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * resAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("resolution: 4 nm", centerX, height * 0.82);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Pixels Resolving: image starts as large blocky pixels, blocks subdivide into smooth detail
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12006), [width, height, scale]);
  const cellColors = useMemo(() => {
    const rand = seeded(12061);
    const grid = 16;
    const colors: number[][] = [];
    for (let r = 0; r < grid; r++) {
      colors[r] = [];
      for (let c = 0; c < grid; c++) {
        // Create organic-looking patterns
        const cx = c / grid - 0.5;
        const cy = r / grid - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const blob1 = Math.sin(cx * 8 + cy * 6) * 0.3;
        const blob2 = Math.cos(cx * 5 - cy * 9) * 0.2;
        const brightness = 20 + (blob1 + blob2 + (1 - dist)) * 30 + rand() * 10;
        colors[r][c] = brightness;
      }
    }
    return colors;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const imgLeft = width * 0.15;
    const imgTop = height * 0.12;
    const imgW = width * 0.7;
    const imgH = height * 0.6;
    // Resolution level: 0 = 2x2, 1 = full 16x16
    const resProgress = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Grid resolution: 2 -> 4 -> 8 -> 16
    const gridSize = resProgress < 0.25 ? 2 : resProgress < 0.5 ? 4 : resProgress < 0.75 ? 8 : 16;
    const cellW = imgW / gridSize;
    const cellH = imgH / gridSize;
    // Draw pixelated image
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Sample from the 16x16 grid by averaging
        const srcR = Math.floor(r * (16 / gridSize));
        const srcC = Math.floor(c * (16 / gridSize));
        const brightness = cellColors[srcR]?.[srcC] ?? 30;
        const hue = 200 + brightness * 0.3;
        const x = imgLeft + c * cellW;
        const y = imgTop + r * cellH;
        ctx.fillStyle = `hsla(${hue}, ${20 + brightness * 0.3}%, ${brightness}%, 0.8)`;
        ctx.fillRect(x, y, cellW + 0.5, cellH + 0.5);
        // Grid lines (subtle, fade as resolution increases)
        if (gridSize < 16) {
          ctx.strokeStyle = `hsla(220, 20%, 30%, ${0.3 * (1 - resProgress)})`;
          ctx.lineWidth = 0.5 * scale;
          ctx.strokeRect(x, y, cellW, cellH);
        }
      }
    }
    // Smooth detail overlay (fades in at high res)
    if (resProgress > 0.7) {
      const smoothAlpha = (resProgress - 0.7) / 0.3;
      ctx.globalAlpha = fadeAlpha * smoothAlpha * 0.5;
      // Draw smooth membrane curves
      const rand = seeded(12062);
      for (let i = 0; i < 5; i++) {
        const cx = imgLeft + (0.2 + rand() * 0.6) * imgW;
        const cy = imgTop + (0.2 + rand() * 0.6) * imgH;
        const cr = (8 + rand() * 12) * scale;
        ctx.strokeStyle = `hsla(${195 + rand() * 30}, 45%, 55%, ${smoothAlpha * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Frame border
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = `hsla(190, 35%, 45%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(imgLeft, imgTop, imgW, imgH);
    // Resolution label
    const resLabels: Record<number, string> = { 2: "2x2 px", 4: "4x4 px", 8: "8x8 px", 16: "16x16 px" };
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(resLabels[gridSize] || "", width * 0.5, imgTop + imgH + 20 * scale);
    // "Like loading an image" label
    const loadLabel = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (loadLabel > 0) {
      ctx.globalAlpha = fadeAlpha * loadLabel;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.fillText("detail emerges as resolution increases", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Clarity Meter: gauge on side goes BLURRY (red) to SHARP (green), EM image improves in sync
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12007), [width, height, scale]);
  const structures = useMemo(() => {
    const rand = seeded(12071);
    return Array.from({ length: 8 }, () => ({
      x: (rand() - 0.5) * 0.65,
      y: (rand() - 0.5) * 0.65,
      r: 0.05 + rand() * 0.08,
      hue: 190 + rand() * 45,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Clarity progress
    const clarity = interpolate(frame, [10, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Gauge on left side
    const gaugeX = width * 0.1;
    const gaugeTop = height * 0.15;
    const gaugeBottom = height * 0.75;
    const gaugeH = gaugeBottom - gaugeTop;
    const gaugeW = 14 * scale;
    const gaugeAppear = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gaugeAppear > 0) {
      ctx.globalAlpha = fadeAlpha * gaugeAppear;
      // Gauge background
      ctx.fillStyle = `hsla(220, 20%, 20%, 0.5)`;
      ctx.fillRect(gaugeX - gaugeW / 2, gaugeTop, gaugeW, gaugeH);
      ctx.strokeStyle = `hsla(220, 30%, 40%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(gaugeX - gaugeW / 2, gaugeTop, gaugeW, gaugeH);
      // Filled portion (bottom-up, red->yellow->green gradient)
      const fillH = gaugeH * clarity;
      const grad = ctx.createLinearGradient(0, gaugeBottom, 0, gaugeTop);
      grad.addColorStop(0, PALETTE.accent.red);
      grad.addColorStop(0.5, PALETTE.accent.gold);
      grad.addColorStop(1, PALETTE.accent.green);
      ctx.fillStyle = grad;
      ctx.fillRect(gaugeX - gaugeW / 2 + 1, gaugeBottom - fillH, gaugeW - 2, fillH);
      // Needle / current position marker
      const needleY = gaugeBottom - fillH;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.beginPath();
      ctx.moveTo(gaugeX + gaugeW / 2, needleY);
      ctx.lineTo(gaugeX + gaugeW / 2 + 8 * scale, needleY - 3 * scale);
      ctx.lineTo(gaugeX + gaugeW / 2 + 8 * scale, needleY + 3 * scale);
      ctx.closePath();
      ctx.fill();
      // Labels
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("BLURRY", gaugeX, gaugeBottom + 12 * scale);
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillText("SHARP", gaugeX, gaugeTop - 6 * scale);
    }
    // EM image on right — improves with clarity
    const imgCenterX = width * 0.58;
    const imgCenterY = height * 0.42;
    const imgR = 55 * scale;
    ctx.globalAlpha = fadeAlpha;
    ctx.save();
    ctx.beginPath();
    ctx.arc(imgCenterX, imgCenterY, imgR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(imgCenterX - imgR, imgCenterY - imgR, imgR * 2, imgR * 2);
    for (const s of structures) {
      const sx = imgCenterX + s.x * imgR;
      const sy = imgCenterY + s.y * imgR;
      const sr = s.r * imgR;
      const blurFactor = 1 - clarity * 0.9;
      const blurR = sr * (1 + blurFactor * 4);
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, blurR);
      grad.addColorStop(0, `hsla(${s.hue}, ${25 + clarity * 30}%, ${40 + clarity * 15}%, ${0.2 + clarity * 0.5})`);
      grad.addColorStop(1, `hsla(${s.hue}, 20%, 35%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, blurR, 0, Math.PI * 2);
      ctx.fill();
      if (clarity > 0.4) {
        const edgeAlpha = (clarity - 0.4) / 0.6;
        ctx.strokeStyle = `hsla(${s.hue}, 50%, 60%, ${edgeAlpha * 0.8})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
    // Image ring
    ctx.strokeStyle = `hsla(190, 40%, 50%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(imgCenterX, imgCenterY, imgR, 0, Math.PI * 2);
    ctx.stroke();
    // Resolution readout
    const resNm = Math.round(200 * (1 - clarity) + 4);
    const resColor = clarity > 0.7 ? PALETTE.accent.green : clarity > 0.3 ? PALETTE.accent.gold : PALETTE.accent.red;
    ctx.fillStyle = resColor;
    ctx.font = `bold ${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${resNm} nm`, imgCenterX, imgCenterY + imgR + 16 * scale);
    // Bottom label
    const bottomAlpha = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("detail down to a few nanometers", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // EM Image Materializing: dark screen, faint grayscale details fade in — largest first, then finer
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale, 12008), [width, height, scale]);
  const layers = useMemo(() => {
    const rand = seeded(12081);
    // 3 detail layers: coarse, medium, fine
    return [
      // Coarse: large background gradients
      Array.from({ length: 4 }, () => ({
        x: 0.2 + rand() * 0.6, y: 0.2 + rand() * 0.5,
        r: 0.15 + rand() * 0.15, brightness: 25 + rand() * 15,
      })),
      // Medium: cell-sized structures
      Array.from({ length: 8 }, () => ({
        x: 0.15 + rand() * 0.7, y: 0.15 + rand() * 0.55,
        r: 0.04 + rand() * 0.06, brightness: 35 + rand() * 20,
      })),
      // Fine: vesicles, membranes
      Array.from({ length: 16 }, () => ({
        x: 0.12 + rand() * 0.76, y: 0.12 + rand() * 0.6,
        r: 0.015 + rand() * 0.025, brightness: 40 + rand() * 25,
      })),
    ];
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const imgLeft = width * 0.12;
    const imgTop = height * 0.1;
    const imgW = width * 0.76;
    const imgH = height * 0.6;
    // Dark field
    ctx.fillStyle = "rgba(6, 4, 12, 0.9)";
    ctx.fillRect(imgLeft, imgTop, imgW, imgH);
    // Layer 0: coarse (appears first)
    const layer0Alpha = interpolate(frame, [8, 30], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (layer0Alpha > 0) {
      for (const item of layers[0]) {
        ctx.globalAlpha = fadeAlpha * layer0Alpha;
        const grad = ctx.createRadialGradient(
          imgLeft + item.x * imgW, imgTop + item.y * imgH, 0,
          imgLeft + item.x * imgW, imgTop + item.y * imgH, item.r * imgW
        );
        grad.addColorStop(0, `hsla(210, 15%, ${item.brightness}%, ${layer0Alpha})`);
        grad.addColorStop(1, `hsla(210, 10%, ${item.brightness - 10}%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(imgLeft + item.x * imgW, imgTop + item.y * imgH, item.r * imgW, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Layer 1: medium (appears next)
    const layer1Alpha = interpolate(frame, [25, 55], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (layer1Alpha > 0) {
      for (const item of layers[1]) {
        ctx.globalAlpha = fadeAlpha * layer1Alpha;
        const sr = item.r * imgW;
        // Cell boundary
        ctx.strokeStyle = `hsla(200, 30%, ${item.brightness + 5}%, ${layer1Alpha * 0.7})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(imgLeft + item.x * imgW, imgTop + item.y * imgH, sr, 0, Math.PI * 2);
        ctx.stroke();
        // Fill
        ctx.fillStyle = `hsla(205, 20%, ${item.brightness - 5}%, ${layer1Alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(imgLeft + item.x * imgW, imgTop + item.y * imgH, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Layer 2: fine (appears last)
    const layer2Alpha = interpolate(frame, [45, 75], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (layer2Alpha > 0) {
      for (const item of layers[2]) {
        ctx.globalAlpha = fadeAlpha * layer2Alpha;
        const sr = item.r * imgW;
        ctx.fillStyle = `hsla(195, 35%, ${item.brightness + 10}%, ${layer2Alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(imgLeft + item.x * imgW, imgTop + item.y * imgH, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Frame border
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = `hsla(190, 30%, 40%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(imgLeft, imgTop, imgW, imgH);
    // "Resolution: 4 nm" label bottom-right of image
    const resAlpha = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * resAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("resolution: 4 nm", imgLeft + imgW - 5 * scale, imgTop + imgH + 16 * scale);
      // Scale bar
      const sbX = imgLeft + imgW - 30 * scale;
      const sbY = imgTop + imgH - 8 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY);
      ctx.lineTo(sbX + 20 * scale, sbY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("10 nm", sbX + 10 * scale, sbY - 4 * scale);
    }
    // Bottom text
    const bottomAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("like developing a photograph — finest detail last", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Snap to Focus: blurry for 2s, tension builds, then SNAP — instant sharp with white flash
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 12009), [width, height, scale]);
  const structures = useMemo(() => {
    const rand = seeded(12091);
    return Array.from({ length: 10 }, () => ({
      x: (rand() - 0.5) * 0.7,
      y: (rand() - 0.5) * 0.7,
      r: 0.04 + rand() * 0.08,
      hue: 185 + rand() * 55,
      vesicles: Math.floor(1 + rand() * 3),
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
    const viewR = 65 * scale;
    // Snap happens at frame 60 (2 seconds in)
    const snapFrame = 60;
    const isSharp = frame >= snapFrame;
    const focusLevel = isSharp ? 1 : 0;
    // Slight tension wobble before snap
    const tensionWobble = !isSharp ? Math.sin(frame * 0.15) * 2 * scale * interpolate(frame, [30, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
    // Viewfinder
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX + tensionWobble, centerY, viewR, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(8, 5, 15, 0.95)";
    ctx.fillRect(centerX - viewR - 5 * scale, centerY - viewR, viewR * 2 + 10 * scale, viewR * 2);
    // Structures
    for (const s of structures) {
      const sx = centerX + s.x * viewR + tensionWobble;
      const sy = centerY + s.y * viewR;
      const sr = s.r * viewR;
      if (!isSharp) {
        // Blurry blob
        const blurR = sr * 4;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, blurR);
        grad.addColorStop(0, `hsla(${s.hue}, 25%, 42%, 0.3)`);
        grad.addColorStop(0.5, `hsla(${s.hue}, 20%, 38%, 0.12)`);
        grad.addColorStop(1, `hsla(${s.hue}, 15%, 35%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, blurR, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Sharp membrane
        ctx.strokeStyle = `hsla(${s.hue}, 50%, 60%, 0.8)`;
        ctx.lineWidth = 1.2 * scale;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.stroke();
        // Cell body
        ctx.fillStyle = `hsla(${s.hue}, 35%, 45%, 0.35)`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
        // Vesicles inside
        const rand = seeded(Math.floor(s.hue * 100));
        for (let v = 0; v < s.vesicles; v++) {
          const va = rand() * Math.PI * 2;
          const vd = rand() * sr * 0.55;
          ctx.fillStyle = `hsla(${s.hue + 25}, 45%, 55%, 0.5)`;
          ctx.beginPath();
          ctx.arc(sx + Math.cos(va) * vd, sy + Math.sin(va) * vd, sr * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        // Sharp glow
        const sharpGrad = ctx.createRadialGradient(sx, sy, sr * 0.8, sx, sy, sr * 1.5);
        sharpGrad.addColorStop(0, `hsla(${s.hue}, 40%, 55%, 0.08)`);
        sharpGrad.addColorStop(1, `hsla(${s.hue}, 30%, 45%, 0)`);
        ctx.fillStyle = sharpGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, sr * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    // Viewfinder ring
    ctx.strokeStyle = `hsla(190, 40%, 50%, 0.6)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(centerX + tensionWobble, centerY, viewR, 0, Math.PI * 2);
    ctx.stroke();
    // WHITE FLASH at snap moment
    const flashAlpha = interpolate(frame, [snapFrame, snapFrame + 2, snapFrame + 8], [0, 0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashAlpha > 0) {
      ctx.globalAlpha = flashAlpha;
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(centerX, centerY, viewR + 5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Status label
    ctx.globalAlpha = fadeAlpha;
    if (!isSharp) {
      // "focusing..." with pulsing dots
      const dots = ".".repeat(1 + Math.floor((frame / 15) % 3));
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(`focusing${dots}`, centerX, centerY + viewR + 18 * scale);
    }
    // "Detail down to a few nanometers" text after snap
    const textAlpha = interpolate(frame, [68, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("detail down to a few nanometers", centerX, centerY + viewR + 18 * scale);
      // Scale bar
      const sbX = centerX + viewR * 0.3;
      const sbY = centerY + viewR - 8 * scale;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(sbX, sbY);
      ctx.lineTo(sbX + 18 * scale, sbY);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("4 nm", sbX + 9 * scale, sbY - 4 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_012: VariantDef[] = [
  { id: "blur-dissolve", label: "Blur Dissolve", component: V1 },
  { id: "focus-ring", label: "Focus Ring", component: V2 },
  { id: "before-after-wipe", label: "Before/After Wipe", component: V3 },
  { id: "zoom-detail", label: "Zoom Into Detail", component: V4 },
  { id: "viewfinder-focus", label: "Viewfinder Focus", component: V5 },
  { id: "pixels-resolving", label: "Pixels Resolving", component: V6 },
  { id: "clarity-meter", label: "Clarity Meter", component: V7 },
  { id: "em-materializing", label: "EM Materializing", component: V8 },
  { id: "snap-focus", label: "Snap to Focus", component: V9 },
];
