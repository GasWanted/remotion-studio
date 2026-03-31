import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawMicroscope, drawWave, drawEye, drawNeuron, drawCamera, drawX, drawCheck } from "../icons";

// Shot 10 — "Neurons are smaller than the wavelength of light — the light waves are
// physically wider than the things you're trying to look at."
// 150 frames (5s). Light wave is wider than neuron structures.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Wave Over Structures: wide sine wave above, row of tiny neuron dots below, wave peaks wider than gaps
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale, 10001), [width, height, scale]);
  const neuronDots = useMemo(() => {
    const rand = seeded(10011);
    return Array.from({ length: 14 }, (_, i) => ({
      x: i,
      y: (rand() - 0.5) * 0.3,
      r: 1.5 + rand() * 1,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const waveY = height * 0.32;
    const dotsY = height * 0.58;
    const leftMargin = width * 0.1;
    const contentWidth = width * 0.8;
    // Sine wave appears — wide wavelength, golden
    const waveAppear = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveAppear > 0) {
      ctx.globalAlpha = fadeAlpha * waveAppear;
      const wavePhase = frame * 0.04;
      const wavelength = 80 * scale; // Visually wide
      const amplitude = 18 * scale;
      // Glow behind wave
      ctx.strokeStyle = `hsla(50, 60%, 55%, 0.15)`;
      ctx.lineWidth = 12 * scale;
      ctx.beginPath();
      for (let px = 0; px <= contentWidth * waveAppear; px += 2) {
        const yy = waveY + Math.sin((px / wavelength) * Math.PI * 2 + wavePhase) * amplitude;
        px === 0 ? ctx.moveTo(leftMargin + px, yy) : ctx.lineTo(leftMargin + px, yy);
      }
      ctx.stroke();
      // Main wave line
      drawWave(ctx, leftMargin, waveY, contentWidth * waveAppear, wavelength, amplitude, `hsla(50, 65%, 60%, 0.8)`, 2.5 * scale, wavePhase);
      // Wavelength bracket
      const bracketAlpha = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (bracketAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * bracketAlpha;
        const bracketX = leftMargin + contentWidth * 0.3;
        const bracketTop = waveY - amplitude - 12 * scale;
        ctx.strokeStyle = PALETTE.accent.gold;
        ctx.lineWidth = 1.5 * scale;
        // Left tick
        ctx.beginPath();
        ctx.moveTo(bracketX, bracketTop);
        ctx.lineTo(bracketX, bracketTop - 8 * scale);
        ctx.stroke();
        // Right tick
        ctx.beginPath();
        ctx.moveTo(bracketX + wavelength, bracketTop);
        ctx.lineTo(bracketX + wavelength, bracketTop - 8 * scale);
        ctx.stroke();
        // Connecting line
        ctx.beginPath();
        ctx.moveTo(bracketX, bracketTop - 4 * scale);
        ctx.lineTo(bracketX + wavelength, bracketTop - 4 * scale);
        ctx.stroke();
        // Label
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.font = `bold ${10 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("500 nm", bracketX + wavelength / 2, bracketTop - 12 * scale);
      }
    }
    // Neuron dot row appears below
    const dotsAppear = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dotsAppear > 0) {
      ctx.globalAlpha = fadeAlpha * dotsAppear;
      const dotSpacing = contentWidth / (neuronDots.length + 1);
      const visibleDots = Math.floor(dotsAppear * neuronDots.length);
      for (let i = 0; i < visibleDots; i++) {
        const dot = neuronDots[i];
        const dx = leftMargin + (i + 1) * dotSpacing;
        const dy = dotsY + dot.y * 10 * scale;
        ctx.fillStyle = `hsla(280, 50%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(dx, dy, dot.r * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Spacing bracket
      const spaceBracketAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (spaceBracketAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * spaceBracketAlpha;
        const sbX = leftMargin + dotSpacing;
        const sbY = dotsY + 15 * scale;
        ctx.strokeStyle = `hsla(280, 50%, 60%, 0.7)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(sbX, sbY);
        ctx.lineTo(sbX, sbY + 6 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sbX + dotSpacing, sbY);
        ctx.lineTo(sbX + dotSpacing, sbY + 6 * scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sbX, sbY + 3 * scale);
        ctx.lineTo(sbX + dotSpacing, sbY + 3 * scale);
        ctx.stroke();
        ctx.fillStyle = `hsla(280, 50%, 65%, 0.9)`;
        ctx.font = `bold ${9 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("40 nm", sbX + dotSpacing / 2, sbY + 16 * scale);
      }
    }
    // Red X overlay
    const xAppear = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xAppear > 0) {
      ctx.globalAlpha = fadeAlpha * xAppear;
      const stampScale = 1 + (1 - xAppear) * 1.5;
      ctx.save();
      ctx.translate(width * 0.5, height * 0.46);
      ctx.scale(stampScale, stampScale);
      drawX(ctx, 0, 0, 40 * scale, PALETTE.accent.red);
      ctx.restore();
    }
    // Label
    const labelAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("wave peaks wider than the gaps between neurons", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Scale Diagram: ruler-style, top: light wavelength bar "500 nm", bottom: neuron gap bar "40 nm"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10002), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const leftX = width * 0.1;
    const fullBarW = width * 0.75;
    // Top bar: light wavelength (500nm = full width)
    const topBarY = height * 0.3;
    const topBarH = 24 * scale;
    const topAppear = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (topAppear > 0) {
      ctx.globalAlpha = fadeAlpha * topAppear;
      // Bar fill
      ctx.fillStyle = `hsla(50, 55%, 50%, 0.35)`;
      ctx.fillRect(leftX, topBarY, fullBarW * topAppear, topBarH);
      // Bar border
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(leftX, topBarY, fullBarW * topAppear, topBarH);
      // Small sine wave inside bar to indicate "light"
      if (topAppear > 0.5) {
        ctx.globalAlpha = fadeAlpha * (topAppear - 0.5) * 2;
        drawWave(ctx, leftX + 10 * scale, topBarY + topBarH / 2, fullBarW * topAppear - 20 * scale, 30 * scale, 6 * scale, `hsla(50, 60%, 60%, 0.4)`, 1.5 * scale, frame * 0.03);
      }
      ctx.globalAlpha = fadeAlpha * topAppear;
      // Label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("light wavelength", leftX, topBarY - 10 * scale);
      // Size label on right
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("500 nm", leftX + fullBarW, topBarY - 10 * scale);
    }
    // Bottom bar: neuron feature (40nm = proportional slice)
    const bottomBarY = height * 0.55;
    const bottomBarH = 24 * scale;
    const neuronBarW = fullBarW * (40 / 500);
    const bottomAppear = interpolate(frame, [45, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAppear > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAppear;
      // Bar fill
      ctx.fillStyle = `hsla(280, 50%, 50%, 0.4)`;
      ctx.fillRect(leftX, bottomBarY, neuronBarW * bottomAppear, bottomBarH);
      // Bar border
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.8)`;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(leftX, bottomBarY, neuronBarW * bottomAppear, bottomBarH);
      // Label
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("neuron feature", leftX, bottomBarY - 10 * scale);
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("40 nm", leftX + neuronBarW + 60 * scale, bottomBarY - 10 * scale);
      // Dotted extension to show how much bigger the light bar is
      if (bottomAppear > 0.8) {
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.strokeStyle = `hsla(280, 30%, 45%, 0.4)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(leftX + neuronBarW, bottomBarY + bottomBarH / 2);
        ctx.lineTo(leftX + fullBarW, bottomBarY + bottomBarH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    // Ratio callout
    const ratioAppear = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ratioAppear > 0) {
      ctx.globalAlpha = fadeAlpha * ratioAppear;
      // Connecting bracket between bars
      const bracketX = leftX + fullBarW + 20 * scale;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(bracketX, topBarY + topBarH / 2);
      ctx.lineTo(bracketX + 10 * scale, topBarY + topBarH / 2);
      ctx.lineTo(bracketX + 10 * scale, bottomBarY + bottomBarH / 2);
      ctx.lineTo(bracketX, bottomBarY + bottomBarH / 2);
      ctx.stroke();
      // Ratio text
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${16 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("12.5x", bracketX + 18 * scale, (topBarY + bottomBarY + topBarH) / 2 + 5 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("too wide", bracketX + 18 * scale, (topBarY + bottomBarY + topBarH) / 2 + 20 * scale);
    }
    // Bottom label
    const bottomLabelAlpha = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomLabelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the light is physically wider than what you're looking at", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Wave Compression: wide sine wave tries to compress, can't get tight enough — stops at 500nm
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10003), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const centerY = height * 0.4;
    const leftX = width * 0.08;
    const waveWidth = width * 0.84;
    // Wavelength tries to shrink — starts wide, attempts to compress, but stalls
    const compressionAttempt = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Wavelength: starts at 200px scale, tries to shrink to ~10px (neuron scale), stalls at ~60px (light limit)
    const targetWavelength = 10 * scale;
    const lightLimit = 60 * scale;
    const startWavelength = 180 * scale;
    // Smooth compression that stalls at light limit
    const progressToLimit = Math.min(compressionAttempt * 1.5, 1);
    const beyondLimit = Math.max(0, compressionAttempt * 1.5 - 1);
    const wavelength = startWavelength + (lightLimit - startWavelength) * progressToLimit
      + (targetWavelength - lightLimit) * beyondLimit * 0.1; // Barely moves past limit
    // Wobble/struggle when hitting the limit
    const wobble = beyondLimit > 0 ? Math.sin(frame * 0.3) * 4 * scale * beyondLimit : 0;
    const amplitude = 20 * scale;
    const phase = frame * 0.05;
    // Glow
    ctx.strokeStyle = `hsla(50, 55%, 55%, 0.12)`;
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    for (let px = 0; px <= waveWidth; px += 2) {
      const yy = centerY + Math.sin((px / (wavelength + wobble)) * Math.PI * 2 + phase) * amplitude;
      px === 0 ? ctx.moveTo(leftX + px, yy) : ctx.lineTo(leftX + px, yy);
    }
    ctx.stroke();
    // Main wave
    drawWave(ctx, leftX, centerY, waveWidth, wavelength + wobble, amplitude, `hsla(50, 65%, 60%, 0.8)`, 2.5 * scale, phase);
    // Wavelength label updates
    const currentNm = Math.round(500 * (wavelength / lightLimit));
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`λ = ${currentNm} nm`, width * 0.5, height * 0.15);
    // Target line (neuron scale) shown below
    const targetAppear = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (targetAppear > 0) {
      ctx.globalAlpha = fadeAlpha * targetAppear;
      const targetY = height * 0.65;
      // Tiny target wavelength bracket
      ctx.strokeStyle = `hsla(280, 50%, 60%, 0.7)`;
      ctx.lineWidth = 1.5 * scale;
      const targetVisW = targetWavelength * 0.06; // 40nm at same visual scale
      ctx.beginPath();
      ctx.moveTo(width * 0.5 - targetVisW / 2, targetY);
      ctx.lineTo(width * 0.5 - targetVisW / 2, targetY + 12 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width * 0.5 + targetVisW / 2, targetY);
      ctx.lineTo(width * 0.5 + targetVisW / 2, targetY + 12 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width * 0.5 - targetVisW / 2, targetY + 6 * scale);
      ctx.lineTo(width * 0.5 + targetVisW / 2, targetY + 6 * scale);
      ctx.stroke();
      ctx.fillStyle = `hsla(280, 50%, 65%, 0.9)`;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("need: 40 nm", width * 0.5, targetY + 25 * scale);
    }
    // Warning text when stalled
    const warnAppear = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (warnAppear > 0) {
      ctx.globalAlpha = fadeAlpha * warnAppear;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("can't compress further — light has a minimum wavelength", width * 0.5, height * 0.82);
      // Red border pulse
      ctx.strokeStyle = `hsla(0, 60%, 55%, ${0.3 * Math.abs(Math.sin(frame * 0.08))})`;
      ctx.lineWidth = 3 * scale;
      ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Sine vs Dots Side-by-Side: left panel single period sine "500nm", right panel neuron cross-sections "40nm"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10004), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const panelW = width * 0.38;
    const panelH = height * 0.5;
    const gapX = width * 0.06;
    const leftPanelX = width * 0.5 - panelW - gapX / 2;
    const rightPanelX = width * 0.5 + gapX / 2;
    const panelY = height * 0.2;
    // Left panel: single sine wave period
    const leftAppear = interpolate(frame, [5, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (leftAppear > 0) {
      ctx.globalAlpha = fadeAlpha * leftAppear;
      // Panel background
      ctx.fillStyle = `hsla(50, 20%, 18%, 0.3)`;
      ctx.fillRect(leftPanelX, panelY, panelW, panelH);
      ctx.strokeStyle = `hsla(50, 40%, 45%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(leftPanelX, panelY, panelW, panelH);
      // Sine wave — one full period
      const waveCenterY = panelY + panelH * 0.5;
      const waveAmp = panelH * 0.3;
      const padding = panelW * 0.08;
      const waveW = panelW - padding * 2;
      ctx.strokeStyle = `hsla(50, 65%, 60%, 0.8)`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      for (let px = 0; px <= waveW * leftAppear; px += 2) {
        const yy = waveCenterY + Math.sin((px / waveW) * Math.PI * 2) * waveAmp;
        px === 0 ? ctx.moveTo(leftPanelX + padding + px, yy) : ctx.lineTo(leftPanelX + padding + px, yy);
      }
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("500 nm", leftPanelX + panelW / 2, panelY - 10 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("one wavelength of light", leftPanelX + panelW / 2, panelY + panelH + 18 * scale);
    }
    // Right panel: neuron cross-sections at same scale
    const rightAppear = interpolate(frame, [35, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rightAppear;
      // Panel background
      ctx.fillStyle = `hsla(280, 20%, 18%, 0.3)`;
      ctx.fillRect(rightPanelX, panelY, panelW, panelH);
      ctx.strokeStyle = `hsla(280, 40%, 45%, 0.4)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(rightPanelX, panelY, panelW, panelH);
      // Neuron cross-sections — very tiny circles in a cluster
      const neuronCenterX = rightPanelX + panelW * 0.5;
      const neuronCenterY = panelY + panelH * 0.5;
      const neuronSize = panelW * (40 / 500); // Same scale — 40/500 of the left panel
      const numDots = Math.floor(rightAppear * 12);
      const rand = seeded(10041);
      for (let i = 0; i < numDots; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = rand() * neuronSize * 3;
        ctx.fillStyle = `hsla(280, 50%, 60%, 0.7)`;
        ctx.beginPath();
        ctx.arc(
          neuronCenterX + Math.cos(angle) * dist,
          neuronCenterY + Math.sin(angle) * dist,
          neuronSize * 0.4,
          0, Math.PI * 2
        );
        ctx.fill();
      }
      // Bracket showing 40nm
      if (rightAppear > 0.6) {
        ctx.strokeStyle = `hsla(280, 50%, 60%, 0.7)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(neuronCenterX - neuronSize, neuronCenterY + neuronSize * 5);
        ctx.lineTo(neuronCenterX + neuronSize, neuronCenterY + neuronSize * 5);
        ctx.stroke();
        ctx.fillStyle = `hsla(280, 55%, 65%, 0.9)`;
        ctx.font = `${9 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("40 nm", neuronCenterX, neuronCenterY + neuronSize * 5 + 14 * scale);
      }
      // Label
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("40 nm", rightPanelX + panelW / 2, panelY - 10 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("neuron features (same scale)", rightPanelX + panelW / 2, panelY + panelH + 18 * scale);
    }
    // "vs" in the gap
    const vsAppear = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (vsAppear > 0) {
      ctx.globalAlpha = fadeAlpha * vsAppear;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("vs", width * 0.5, panelY + panelH * 0.5 + 5 * scale);
    }
    // Bottom verdict
    const verdictAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (verdictAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * verdictAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light is 12.5x wider than what you need to see", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Wavelength Ruler: horizontal ruler, gold bar at 500nm, violet bar at 40nm (barely visible)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10005), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const rulerLeft = width * 0.08;
    const rulerRight = width * 0.92;
    const rulerWidth = rulerRight - rulerLeft;
    const rulerY = height * 0.35;
    // Ruler baseline
    const rulerAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rulerAppear > 0) {
      ctx.globalAlpha = fadeAlpha * rulerAppear;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(rulerLeft, rulerY);
      ctx.lineTo(rulerLeft + rulerWidth * rulerAppear, rulerY);
      ctx.stroke();
      // Ticks
      for (let nm = 0; nm <= 600; nm += 100) {
        const tx = rulerLeft + (nm / 600) * rulerWidth;
        if (tx > rulerLeft + rulerWidth * rulerAppear) break;
        ctx.beginPath();
        ctx.moveTo(tx, rulerY - 6 * scale);
        ctx.lineTo(tx, rulerY + 6 * scale);
        ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${nm}`, tx, rulerY + 16 * scale);
      }
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "right";
      ctx.fillText("nanometers", rulerRight, rulerY + 28 * scale);
    }
    // Gold bar: 500nm
    const goldAppear = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const goldBarY = height * 0.48;
    const goldBarH = 28 * scale;
    const goldBarW = rulerWidth * (500 / 600);
    if (goldAppear > 0) {
      ctx.globalAlpha = fadeAlpha * goldAppear;
      ctx.fillStyle = `hsla(50, 55%, 50%, 0.35)`;
      ctx.fillRect(rulerLeft, goldBarY, goldBarW * goldAppear, goldBarH);
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(rulerLeft, goldBarY, goldBarW * goldAppear, goldBarH);
      // Wave icon inside
      if (goldAppear > 0.6) {
        drawWave(ctx, rulerLeft + 8 * scale, goldBarY + goldBarH / 2, goldBarW * goldAppear - 16 * scale, 25 * scale, 5 * scale, `hsla(50, 60%, 60%, 0.35)`, 1.5 * scale, frame * 0.03);
      }
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("light wavelength: 500 nm", rulerLeft, goldBarY - 8 * scale);
    }
    // Violet bar: 40nm (tiny!)
    const violetAppear = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const violetBarY = height * 0.65;
    const violetBarH = 28 * scale;
    const violetBarW = rulerWidth * (40 / 600);
    if (violetAppear > 0) {
      ctx.globalAlpha = fadeAlpha * violetAppear;
      ctx.fillStyle = `hsla(280, 50%, 50%, 0.45)`;
      ctx.fillRect(rulerLeft, violetBarY, violetBarW * violetAppear, violetBarH);
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.8)`;
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(rulerLeft, violetBarY, violetBarW * violetAppear, violetBarH);
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("neuron feature: 40 nm", rulerLeft, violetBarY - 8 * scale);
      // Arrow pointing to the tiny bar
      if (violetAppear > 0.7) {
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([4 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.moveTo(rulerLeft + violetBarW + 12 * scale, violetBarY + violetBarH / 2);
        ctx.lineTo(rulerLeft + 100 * scale, violetBarY + violetBarH / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Arrow head
        ctx.fillStyle = PALETTE.text.dim;
        ctx.beginPath();
        ctx.moveTo(rulerLeft + violetBarW + 12 * scale, violetBarY + violetBarH / 2);
        ctx.lineTo(rulerLeft + violetBarW + 18 * scale, violetBarY + violetBarH / 2 - 3 * scale);
        ctx.lineTo(rulerLeft + violetBarW + 18 * scale, violetBarY + violetBarH / 2 + 3 * scale);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText("barely a sliver", rulerLeft + 105 * scale, violetBarY + violetBarH / 2 + 3 * scale);
      }
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the ratio speaks for itself", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Split Top/Bottom: top animated sine wave, bottom tiny neuron structures, wave washes over them
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10006), [width, height, scale]);
  const neuronPositions = useMemo(() => {
    const rand = seeded(10061);
    return Array.from({ length: 20 }, () => ({
      x: rand() * 0.8 + 0.1,
      y: rand() * 0.3,
      r: 1 + rand() * 1.5,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const dividerY = height * 0.48;
    // Divider line
    const divAppear = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (divAppear > 0) {
      ctx.globalAlpha = fadeAlpha * divAppear;
      ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([8 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(width * 0.05, dividerY);
      ctx.lineTo(width * 0.05 + width * 0.9 * divAppear, dividerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Top half: animated sine wave sweeping right to left (golden glow)
    const waveAppear = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveAppear > 0) {
      ctx.globalAlpha = fadeAlpha * waveAppear;
      const waveY = height * 0.25;
      const phase = -frame * 0.06;
      const wavelength = 70 * scale;
      const amplitude = 22 * scale;
      // Glow
      ctx.strokeStyle = `hsla(50, 55%, 55%, 0.1)`;
      ctx.lineWidth = 16 * scale;
      ctx.beginPath();
      for (let px = 0; px <= width * 0.9; px += 2) {
        const yy = waveY + Math.sin((px / wavelength) * Math.PI * 2 + phase) * amplitude;
        px === 0 ? ctx.moveTo(width * 0.05 + px, yy) : ctx.lineTo(width * 0.05 + px, yy);
      }
      ctx.stroke();
      drawWave(ctx, width * 0.05, waveY, width * 0.9, wavelength, amplitude, `hsla(50, 65%, 60%, 0.75)`, 2.5 * scale, phase);
      // Label
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("light wave (500 nm)", width * 0.06, height * 0.08);
    }
    // Bottom half: tiny neuron structures
    const neuronsAppear = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronsAppear > 0) {
      ctx.globalAlpha = fadeAlpha * neuronsAppear;
      const baseY = height * 0.62;
      const numVisible = Math.floor(neuronsAppear * neuronPositions.length);
      for (let i = 0; i < numVisible; i++) {
        const np = neuronPositions[i];
        ctx.fillStyle = `hsla(280, 50%, 60%, 0.7)`;
        ctx.beginPath();
        ctx.arc(np.x * width, baseY + np.y * height * 0.2, np.r * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `hsla(280, 50%, 65%, 0.9)`;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("neuron structures (40 nm)", width * 0.06, dividerY + 12 * scale);
    }
    // Wave washes over bottom half — golden wash descends
    const washProgress = interpolate(frame, [65, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (washProgress > 0) {
      ctx.globalAlpha = fadeAlpha * washProgress * 0.5;
      const washGrad = ctx.createLinearGradient(0, dividerY, 0, height * 0.85);
      washGrad.addColorStop(0, `hsla(50, 55%, 55%, 0.4)`);
      washGrad.addColorStop(washProgress, `hsla(50, 55%, 55%, 0.15)`);
      washGrad.addColorStop(1, `hsla(50, 40%, 40%, 0)`);
      ctx.fillStyle = washGrad;
      ctx.fillRect(width * 0.05, dividerY, width * 0.9, height * 0.4);
    }
    // "Can't distinguish" text
    const textAlpha = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light washes over — can't distinguish structures", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Animated Sweep: golden light wave sweeps across, tiny neurons in path disappear/blur under it
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10007), [width, height, scale]);
  const neurons = useMemo(() => {
    const rand = seeded(10071);
    return Array.from({ length: 16 }, (_, i) => ({
      x: width * (0.1 + (i / 15) * 0.8),
      y: height * (0.42 + (rand() - 0.5) * 0.12),
      r: (1.5 + rand() * 1.5) * scale,
      hue: 260 + rand() * 40,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    // Neurons appear first
    const neuronAppear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Wave sweep position
    const sweepX = interpolate(frame, [40, 110], [-50 * scale, width + 50 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const waveHalfWidth = 60 * scale; // The wave "width" visually
    // Draw neurons — fade out where wave passes
    if (neuronAppear > 0) {
      const visibleNeurons = Math.floor(neuronAppear * neurons.length);
      for (let i = 0; i < visibleNeurons; i++) {
        const n = neurons[i];
        // Neuron visibility: full before wave, hidden during/after wave passes
        const distToWave = n.x - sweepX;
        const neuronAlpha = distToWave > waveHalfWidth ? 1 :
          distToWave < -waveHalfWidth ? 0.1 :
          interpolate(distToWave, [-waveHalfWidth, waveHalfWidth], [0.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = fadeAlpha * neuronAlpha * neuronAppear;
        ctx.fillStyle = `hsla(${n.hue}, 50%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        // Small glow
        ctx.fillStyle = `hsla(${n.hue}, 40%, 50%, 0.15)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Sweeping wave band
    const sweepStarted = frame >= 40;
    if (sweepStarted) {
      ctx.globalAlpha = fadeAlpha * 0.7;
      // Wave band — a vertical golden band with sine distortion
      const bandGrad = ctx.createLinearGradient(sweepX - waveHalfWidth, 0, sweepX + waveHalfWidth, 0);
      bandGrad.addColorStop(0, `hsla(50, 55%, 55%, 0)`);
      bandGrad.addColorStop(0.3, `hsla(50, 65%, 60%, 0.4)`);
      bandGrad.addColorStop(0.5, `hsla(50, 70%, 65%, 0.6)`);
      bandGrad.addColorStop(0.7, `hsla(50, 65%, 60%, 0.4)`);
      bandGrad.addColorStop(1, `hsla(50, 55%, 55%, 0)`);
      ctx.fillStyle = bandGrad;
      ctx.fillRect(sweepX - waveHalfWidth, height * 0.15, waveHalfWidth * 2, height * 0.65);
      // Wave lines inside band
      for (let wl = 0; wl < 3; wl++) {
        const wlX = sweepX - waveHalfWidth * 0.5 + wl * waveHalfWidth * 0.5;
        ctx.strokeStyle = `hsla(50, 60%, 60%, 0.3)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        for (let py = height * 0.15; py <= height * 0.8; py += 2) {
          const px = wlX + Math.sin((py / (20 * scale)) * Math.PI * 2 + frame * 0.08) * 5 * scale;
          py === height * 0.15 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    // Label after neurons appear
    const neuronLabel = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronLabel > 0) {
      ctx.globalAlpha = fadeAlpha * neuronLabel;
      ctx.fillStyle = `hsla(280, 50%, 65%, 0.8)`;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron structures", width * 0.5, height * 0.58);
    }
    // Final text
    const finalAlpha = interpolate(frame, [115, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (finalAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * finalAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("the wave is too fat to see them", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Physics Equation: λ_light = 500nm, d_neuron = 40nm, "λ >> d" with visual comparison
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10008), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    // First equation: λ_light = 500 nm
    const eq1Appear = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (eq1Appear > 0) {
      ctx.globalAlpha = fadeAlpha * eq1Appear;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${18 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("λ", width * 0.37, height * 0.22);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px serif`;
      ctx.fillText("light", width * 0.37 + 12 * scale, height * 0.25);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${16 * scale}px serif`;
      ctx.fillText("= 500 nm", width * 0.55, height * 0.22);
    }
    // Second equation: d_neuron = 40 nm
    const eq2Appear = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (eq2Appear > 0) {
      ctx.globalAlpha = fadeAlpha * eq2Appear;
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `${18 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("d", width * 0.37, height * 0.36);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px serif`;
      ctx.fillText("neuron", width * 0.37 + 10 * scale, height * 0.39);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${16 * scale}px serif`;
      ctx.fillText("= 40 nm", width * 0.55, height * 0.36);
    }
    // Dividing line
    const lineAppear = interpolate(frame, [48, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lineAppear > 0) {
      ctx.globalAlpha = fadeAlpha * lineAppear;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1 * scale;
      const lineW = width * 0.5 * lineAppear;
      ctx.beginPath();
      ctx.moveTo(width * 0.25, height * 0.44);
      ctx.lineTo(width * 0.25 + lineW, height * 0.44);
      ctx.stroke();
    }
    // Big comparison: λ >> d
    const comparisonAppear = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (comparisonAppear > 0) {
      ctx.globalAlpha = fadeAlpha * comparisonAppear;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${22 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("λ", width * 0.35, height * 0.56);
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${24 * scale}px serif`;
      ctx.fillText(">>", width * 0.48, height * 0.56);
      ctx.fillStyle = `hsla(280, 55%, 65%, 1)`;
      ctx.font = `bold ${22 * scale}px serif`;
      ctx.fillText("d", width * 0.61, height * 0.56);
    }
    // Visual bar comparison below
    const barAppear = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (barAppear > 0) {
      ctx.globalAlpha = fadeAlpha * barAppear;
      const barLeft = width * 0.15;
      const fullBarW = width * 0.7;
      const barH = 12 * scale;
      // Gold bar (500nm scale)
      ctx.fillStyle = `hsla(50, 55%, 50%, 0.4)`;
      ctx.fillRect(barLeft, height * 0.66, fullBarW * barAppear, barH);
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(barLeft, height * 0.66, fullBarW * barAppear, barH);
      // Violet bar (40nm scale)
      const smallBarW = fullBarW * (40 / 500);
      ctx.fillStyle = `hsla(280, 50%, 50%, 0.5)`;
      ctx.fillRect(barLeft, height * 0.72, smallBarW * barAppear, barH);
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.8)`;
      ctx.strokeRect(barLeft, height * 0.72, smallBarW * barAppear, barH);
    }
    // Final insight
    const insightAlpha = interpolate(frame, [105, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (insightAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * insightAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light physically cannot resolve neuron-scale detail", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Red X Verdict: wave drawn over neurons, dramatic red X slams down, "Cannot resolve" verdict
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 10009), [width, height, scale]);
  const neurons = useMemo(() => {
    const rand = seeded(10091);
    return Array.from({ length: 10 }, (_, i) => ({
      x: width * (0.15 + (i / 9) * 0.7),
      y: height * 0.48 + (rand() - 0.5) * 8 * scale,
      r: (1.5 + rand()) * scale,
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;
    const centerY = height * 0.42;
    // Neurons appear
    const neuronAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (neuronAppear > 0) {
      ctx.globalAlpha = fadeAlpha * neuronAppear;
      for (const n of neurons) {
        ctx.fillStyle = `hsla(280, 50%, 60%, 0.8)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        // Glow
        ctx.fillStyle = `hsla(280, 40%, 50%, 0.15)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `hsla(280, 50%, 65%, 0.7)`;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neurons (40 nm apart)", width * 0.5, centerY + 30 * scale);
    }
    // Wave overlays the neurons
    const waveAppear = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveAppear > 0) {
      ctx.globalAlpha = fadeAlpha * waveAppear;
      const phase = frame * 0.04;
      const wavelength = 75 * scale;
      const amplitude = 20 * scale;
      // Glow band
      ctx.strokeStyle = `hsla(50, 55%, 55%, 0.12)`;
      ctx.lineWidth = 18 * scale;
      ctx.beginPath();
      for (let px = 0; px <= width * 0.8 * waveAppear; px += 2) {
        const yy = centerY + Math.sin((px / wavelength) * Math.PI * 2 + phase) * amplitude;
        px === 0 ? ctx.moveTo(width * 0.1 + px, yy) : ctx.lineTo(width * 0.1 + px, yy);
      }
      ctx.stroke();
      // Main wave
      drawWave(ctx, width * 0.1, centerY, width * 0.8 * waveAppear, wavelength, amplitude, `hsla(50, 65%, 60%, 0.7)`, 2.5 * scale, phase);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("light wave (500 nm)", width * 0.5, centerY - amplitude - 15 * scale);
    }
    // Dramatic red X slams down
    const xSlam = interpolate(frame, [70, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xSlam > 0) {
      ctx.globalAlpha = fadeAlpha * xSlam;
      // Scale from large to normal with easing
      const slamScale = 1 + Math.pow(1 - xSlam, 2) * 3;
      ctx.save();
      ctx.translate(width * 0.5, centerY);
      ctx.scale(slamScale, slamScale);
      drawX(ctx, 0, 0, 55 * scale, PALETTE.accent.red);
      ctx.restore();
      // Impact flash
      if (xSlam < 0.3) {
        const flashIntensity = (0.3 - xSlam) / 0.3;
        ctx.fillStyle = `hsla(0, 60%, 70%, ${flashIntensity * 0.15})`;
        ctx.fillRect(0, 0, width, height);
      }
    }
    // "CANNOT RESOLVE" verdict text
    const verdictAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (verdictAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * verdictAlpha;
      // Red background bar
      ctx.fillStyle = `hsla(0, 50%, 30%, ${verdictAlpha * 0.5})`;
      ctx.fillRect(width * 0.15, height * 0.7, width * 0.7, 32 * scale);
      // Text
      ctx.fillStyle = PALETTE.accent.red;
      ctx.font = `bold ${15 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("CANNOT RESOLVE", width * 0.5, height * 0.72 + 18 * scale);
    }
    // Subtitle
    const subAlpha = interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (subAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * subAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("waves are wider than the structures", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_010: VariantDef[] = [
  { id: "wave-over-structures", label: "Wave Over Structures", component: V1 },
  { id: "scale-diagram", label: "Scale Diagram", component: V2 },
  { id: "wave-compression", label: "Wave Compression", component: V3 },
  { id: "sine-vs-dots", label: "Sine vs Dots", component: V4 },
  { id: "wavelength-ruler", label: "Wavelength Ruler", component: V5 },
  { id: "split-top-bottom", label: "Split Top/Bottom", component: V6 },
  { id: "animated-sweep", label: "Animated Sweep", component: V7 },
  { id: "physics-equation", label: "Physics Equation", component: V8 },
  { id: "red-x-verdict", label: "Red X Verdict", component: V9 },
];
