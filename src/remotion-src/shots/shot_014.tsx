import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawBeaker } from "../icons";

// Shot 14 — "You can't shoot it through a whole brain. So first they preserved the brain in chemicals"
// 120 frames (4s). Brain drops into fixative beaker, color changes from pink to grey.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Beaker Drop: brain falls into beaker, splash, color shifts pink→grey
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const beakerY = height * 0.55;
    const beakerSize = 80 * scale;
    const liquidSurface = beakerY - beakerSize * 0.7 * 0.6 + beakerSize * 0.7 * 0.5 * 0.4;

    const dropProgress = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const splashPhase = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const colorShift = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Beaker with liquid
    const liquidFillLevel = 0.6 + splashPhase * 0.05;
    drawBeaker(ctx, cx, beakerY, beakerSize, `hsla(220, 40%, 60%, 0.7)`, `hsla(160, 40%, 40%, 0.35)`, liquidFillLevel);

    // Label on beaker
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("fixative", cx, beakerY + beakerSize * 0.7 * 0.5 + 14 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Brain ellipse
    const brainRadius = 14 * scale;
    const startY = height * 0.08;
    const endY = beakerY - 5 * scale;
    const brainY = dropProgress < 1 ? startY + (endY - startY) * Math.pow(dropProgress, 2) : endY;
    const submerged = dropProgress >= 1;

    // Brain hue shifts: pink (340) → grey (250, low sat)
    const brainHue = 340 + colorShift * (-90);
    const brainSat = 55 - colorShift * 45;
    const brainLit = 55 - colorShift * 10;

    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, brainRadius * 1.2, brainRadius, 0, 0, Math.PI * 2);
    ctx.fill();
    // Brain fissure
    ctx.strokeStyle = `hsla(${brainHue}, ${brainSat - 10}%, ${brainLit - 15}%, 0.5)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, brainY - brainRadius * 0.8);
    ctx.quadraticCurveTo(cx - 3 * scale, brainY, cx, brainY + brainRadius * 0.8);
    ctx.stroke();

    // Splash ripples
    if (splashPhase > 0 && splashPhase < 1) {
      const rippleRadius = 10 * scale + splashPhase * 20 * scale;
      const rippleAlpha = (1 - splashPhase) * 0.5;
      ctx.strokeStyle = `hsla(160, 50%, 60%, ${rippleAlpha})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.ellipse(cx, liquidSurface, rippleRadius, rippleRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Second ripple
      if (splashPhase > 0.3) {
        const r2 = 5 * scale + (splashPhase - 0.3) * 15 * scale;
        ctx.strokeStyle = `hsla(160, 50%, 60%, ${(1 - splashPhase) * 0.3})`;
        ctx.beginPath();
        ctx.ellipse(cx, liquidSurface, r2, r2 * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Splash droplets
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI * 0.8 + (i / 4) * Math.PI * 0.6;
        const dist = splashPhase * 15 * scale;
        const dy = splashPhase * splashPhase * 8 * scale;
        ctx.fillStyle = `hsla(160, 40%, 55%, ${(1 - splashPhase) * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * dist, liquidSurface + Math.sin(angle) * dist + dy, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Step label
    const stepFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stepFade > 0) {
      ctx.globalAlpha = fadeAlpha * stepFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Step 1: Chemical Fixation", cx, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Chemistry Setup: lab bench, dropper adds fixative drops onto brain
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const benchAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dropCycle = (frame - 20) % 25;
    const dropActive = frame >= 20 && frame < 100;
    const colorShift = interpolate(frame, [30, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stepFade = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const benchY = height * 0.72;

    // Lab bench surface
    if (benchAppear > 0) {
      ctx.globalAlpha = fadeAlpha * benchAppear;
      ctx.fillStyle = "hsla(30, 15%, 22%, 0.6)";
      ctx.fillRect(width * 0.08, benchY, width * 0.84, 4 * scale);

      // Beaker on the left
      drawBeaker(ctx, width * 0.22, benchY - 20 * scale, 45 * scale, `hsla(220, 40%, 55%, 0.6)`, `hsla(40, 60%, 50%, 0.3)`, 0.5);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("formaldehyde", width * 0.22, benchY + 12 * scale);

      // Beaker on the right
      drawBeaker(ctx, width * 0.78, benchY - 20 * scale, 45 * scale, `hsla(220, 40%, 55%, 0.6)`, `hsla(200, 50%, 45%, 0.3)`, 0.4);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.fillText("glutaraldehyde", width * 0.78, benchY + 12 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Brain on platform in center
    const brainX = cx;
    const brainY = benchY - 25 * scale;
    const brainHue = 340 - colorShift * 90;
    const brainSat = 50 - colorShift * 40;
    const brainLit = 55 - colorShift * 10;

    // Platform / dish
    ctx.strokeStyle = "hsla(220, 30%, 50%, 0.4)";
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.ellipse(brainX, benchY - 2 * scale, 28 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Brain
    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(brainX, brainY, 16 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fissure
    ctx.strokeStyle = `hsla(${brainHue}, ${brainSat - 10}%, ${brainLit - 15}%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(brainX, brainY - 10 * scale);
    ctx.quadraticCurveTo(brainX - 3 * scale, brainY, brainX, brainY + 10 * scale);
    ctx.stroke();

    // Dropper above brain
    const dropperX = brainX + 2 * scale;
    const dropperY = brainY - 38 * scale;
    ctx.strokeStyle = "hsla(220, 30%, 55%, 0.6)";
    ctx.lineWidth = 2 * scale;
    // Pipette body
    ctx.beginPath();
    ctx.moveTo(dropperX, dropperY);
    ctx.lineTo(dropperX, dropperY + 22 * scale);
    ctx.stroke();
    // Pipette tip
    ctx.beginPath();
    ctx.moveTo(dropperX - 3 * scale, dropperY + 22 * scale);
    ctx.lineTo(dropperX, dropperY + 28 * scale);
    ctx.lineTo(dropperX + 3 * scale, dropperY + 22 * scale);
    ctx.stroke();
    // Bulb
    ctx.fillStyle = "hsla(0, 40%, 50%, 0.4)";
    ctx.beginPath();
    ctx.ellipse(dropperX, dropperY - 5 * scale, 5 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Falling drops
    if (dropActive && dropCycle < 15) {
      const dropFallProgress = interpolate(dropCycle, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const dropStartY = dropperY + 28 * scale;
      const dropEndY = brainY - 10 * scale;
      const dy = dropStartY + (dropEndY - dropStartY) * Math.pow(dropFallProgress, 1.8);
      if (dropFallProgress < 0.95) {
        ctx.fillStyle = `hsla(160, 50%, 55%, 0.7)`;
        ctx.beginPath();
        ctx.ellipse(dropperX, dy, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Step counter
    if (stepFade > 0) {
      ctx.globalAlpha = fadeAlpha * stepFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Step 1: Fixation", cx, height * 0.12);
      const dropCount = Math.min(Math.floor((frame - 20) / 25), 4);
      if (dropCount > 0) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${8 * scale}px monospace`;
        ctx.fillText(`${dropCount} applications`, cx, height * 0.17);
      }
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Liquid Immersion: liquid rises from bottom, engulfing brain, color changes on contact
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const liquidRise = interpolate(frame, [15, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainAppear = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const labelFade = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.45;
    const brainW = 45 * scale;
    const brainH = 35 * scale;

    // Container outline
    const containerW = 80 * scale;
    const containerH = 90 * scale;
    const containerTop = cy - containerH * 0.4;
    const containerBottom = cy + containerH * 0.6;
    ctx.strokeStyle = "hsla(220, 35%, 50%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - containerW / 2, containerTop);
    ctx.lineTo(cx - containerW / 2, containerBottom);
    ctx.lineTo(cx + containerW / 2, containerBottom);
    ctx.lineTo(cx + containerW / 2, containerTop);
    ctx.stroke();

    // Liquid level
    const liquidBottom = containerBottom;
    const liquidTopMax = containerTop + 5 * scale;
    const liquidTop = liquidBottom - (liquidBottom - liquidTopMax) * liquidRise;
    // Liquid fill
    ctx.fillStyle = `hsla(160, 40%, 40%, 0.25)`;
    ctx.fillRect(cx - containerW / 2 + 1, liquidTop, containerW - 2, liquidBottom - liquidTop);
    // Liquid surface with slight wave
    ctx.strokeStyle = `hsla(160, 55%, 55%, 0.5)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    for (let i = 0; i <= containerW; i += 2) {
      const xx = cx - containerW / 2 + i;
      const wave = Math.sin(i * 0.15 + frame * 0.08) * 2 * scale * (1 - liquidRise * 0.5);
      i === 0 ? ctx.moveTo(xx, liquidTop + wave) : ctx.lineTo(xx, liquidTop + wave);
    }
    ctx.stroke();

    // Brain — two-tone: submerged part is grey, above part is pink
    if (brainAppear > 0) {
      ctx.save();
      const brainTop = cy - brainH;
      const brainBottom = cy + brainH;
      const submergedFraction = Math.max(0, Math.min(1, (brainBottom - liquidTop) / (brainH * 2)));

      // Pink upper portion (unsubmerged)
      if (submergedFraction < 1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - brainW - 5, Math.min(liquidTop, brainTop - 5), containerW + 10, liquidTop - brainTop + 5);
        ctx.clip();
        ctx.fillStyle = `hsla(340, 55%, 55%, ${0.85 * brainAppear})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, brainW, brainH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Grey lower portion (submerged)
      if (submergedFraction > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - brainW - 5, liquidTop, containerW + 10, brainBottom - liquidTop + 10);
        ctx.clip();
        ctx.fillStyle = `hsla(250, 12%, 45%, ${0.85 * brainAppear})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, brainW, brainH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Brain fissure
      ctx.strokeStyle = `hsla(280, 15%, 35%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy - brainH * 0.7);
      ctx.quadraticCurveTo(cx - 4 * scale, cy, cx, cy + brainH * 0.7);
      ctx.stroke();

      ctx.restore();
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fixative solution", cx, containerBottom + 15 * scale);
      // Percentage submerged
      const pct = Math.round(liquidRise * 100);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px monospace`;
      ctx.fillText(`${pct}% immersed`, cx, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Color Shift Timeline: 5 stages left to right showing progressive fixation
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const stages = [
      { label: "fresh", hue: 340, sat: 55, lit: 58 },
      { label: "30 min", hue: 320, sat: 42, lit: 52 },
      { label: "2 hrs", hue: 290, sat: 28, lit: 48 },
      { label: "12 hrs", hue: 265, sat: 15, lit: 45 },
      { label: "fixed", hue: 250, sat: 10, lit: 43 },
    ];

    const brainR = 18 * scale;
    const totalW = width * 0.8;
    const startX = width * 0.1;
    const gap = totalW / (stages.length - 1);
    const cy = height * 0.42;

    // Timeline bar
    const timelineProgress = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barY = cy + brainR + 20 * scale;
    ctx.strokeStyle = "hsla(220, 30%, 40%, 0.4)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(startX, barY);
    ctx.lineTo(startX + totalW * timelineProgress, barY);
    ctx.stroke();

    // Stages
    for (let i = 0; i < stages.length; i++) {
      const stageX = startX + i * gap;
      const stageAppear = interpolate(frame, [10 + i * 15, 22 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stageAppear <= 0) continue;

      const st = stages[i];
      ctx.globalAlpha = fadeAlpha * stageAppear;

      // Brain ellipse at this stage
      ctx.fillStyle = `hsla(${st.hue}, ${st.sat}%, ${st.lit}%, 0.85)`;
      ctx.beginPath();
      ctx.ellipse(stageX, cy, brainR * 1.1 * stageAppear, brainR * stageAppear, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fissure
      ctx.strokeStyle = `hsla(${st.hue}, ${st.sat - 5}%, ${st.lit - 12}%, 0.4)`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(stageX, cy - brainR * 0.6 * stageAppear);
      ctx.quadraticCurveTo(stageX - 2 * scale, cy, stageX, cy + brainR * 0.6 * stageAppear);
      ctx.stroke();

      // Dot on timeline
      ctx.fillStyle = `hsla(${st.hue}, ${st.sat}%, ${st.lit}%, 0.7)`;
      ctx.beginPath();
      ctx.arc(stageX, barY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Label below
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(st.label, stageX, barY + 16 * scale);

      // Arrow between stages
      if (i < stages.length - 1 && stageAppear > 0.5) {
        const nextX = startX + (i + 1) * gap;
        const arrowX = (stageX + nextX) / 2;
        ctx.fillStyle = PALETTE.text.dim;
        ctx.beginPath();
        ctx.moveTo(arrowX + 5 * scale, cy);
        ctx.lineTo(arrowX - 3 * scale, cy - 4 * scale);
        ctx.lineTo(arrowX - 3 * scale, cy + 4 * scale);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.globalAlpha = fadeAlpha;
    // Title
    const titleFade = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (titleFade > 0) {
      ctx.globalAlpha = fadeAlpha * titleFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fixation timeline", width / 2, height * 0.12);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Lab Bench Scene: brain lowered by tweezers into beaker
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const sceneAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lowerProgress = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const colorShift = interpolate(frame, [55, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const benchY = height * 0.78;
    const beakerCx = cx;
    const beakerY = benchY - 30 * scale;
    const beakerSize = 90 * scale;

    // Bench
    ctx.globalAlpha = fadeAlpha * sceneAppear;
    ctx.fillStyle = "hsla(25, 15%, 20%, 0.5)";
    ctx.fillRect(width * 0.05, benchY, width * 0.9, 5 * scale);

    // Beaker
    drawBeaker(ctx, beakerCx, beakerY, beakerSize, `hsla(220, 40%, 58%, 0.65)`, `hsla(160, 40%, 40%, 0.3)`, 0.55);

    // Small side beakers
    drawBeaker(ctx, width * 0.18, benchY - 15 * scale, 40 * scale, `hsla(220, 35%, 50%, 0.5)`, `hsla(50, 50%, 45%, 0.25)`, 0.4);
    drawBeaker(ctx, width * 0.82, benchY - 15 * scale, 40 * scale, `hsla(220, 35%, 50%, 0.5)`, `hsla(200, 45%, 40%, 0.25)`, 0.35);
    ctx.globalAlpha = fadeAlpha;

    // Tweezers holding brain
    const brainStartY = height * 0.12;
    const brainEndY = beakerY - beakerSize * 0.1;
    const brainY = brainStartY + (brainEndY - brainStartY) * Math.pow(lowerProgress, 0.7);
    const brainR = 12 * scale;

    // Tweezers (two angled lines converging at brain)
    const tweezersTopY = brainY - 35 * scale;
    ctx.strokeStyle = `hsla(220, 20%, 55%, ${0.6 * sceneAppear})`;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, tweezersTopY);
    ctx.lineTo(cx - 2 * scale, brainY - brainR);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 12 * scale, tweezersTopY);
    ctx.lineTo(cx + 2 * scale, brainY - brainR);
    ctx.stroke();

    // Brain
    const brainHue = 340 - colorShift * 90;
    const brainSat = 52 - colorShift * 42;
    const brainLit = 55 - colorShift * 10;
    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(cx, brainY, brainR * 1.15, brainR, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `hsla(${brainHue}, ${brainSat - 8}%, ${brainLit - 12}%, 0.4)`;
    ctx.lineWidth = 0.8 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, brainY - brainR * 0.7);
    ctx.quadraticCurveTo(cx - 2 * scale, brainY, cx, brainY + brainR * 0.7);
    ctx.stroke();

    // Labels
    const labelFade = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fixative bath", beakerCx, benchY + 16 * scale);
      ctx.fillText("buffer", width * 0.18, benchY + 10 * scale);
      ctx.fillText("rinse", width * 0.82, benchY + 10 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Preservation Process: pipeline diagram, fresh → fixative bath → preserved
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const stages = [
      { x: width * 0.18, label: "fresh tissue", hue: 340, sat: 55, lit: 58 },
      { x: width * 0.50, label: "fixative bath", hue: 160, sat: 40, lit: 45 },
      { x: width * 0.82, label: "preserved", hue: 250, sat: 12, lit: 45 },
    ];
    const cy = height * 0.45;
    const brainR = 20 * scale;

    for (let i = 0; i < stages.length; i++) {
      const stageAppear = interpolate(frame, [5 + i * 25, 22 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stageAppear <= 0) continue;
      const st = stages[i];
      ctx.globalAlpha = fadeAlpha * stageAppear;

      if (i === 1) {
        // Beaker for fixative stage
        drawBeaker(ctx, st.x, cy + 5 * scale, 55 * scale, `hsla(220, 40%, 55%, 0.6)`, `hsla(160, 40%, 42%, 0.3)`, 0.6);
        // Small brain inside beaker
        ctx.fillStyle = `hsla(300, 25%, 48%, 0.7)`;
        ctx.beginPath();
        ctx.ellipse(st.x, cy + 2 * scale, brainR * 0.7, brainR * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Brain at stage color
        ctx.fillStyle = `hsla(${st.hue}, ${st.sat}%, ${st.lit}%, 0.85)`;
        ctx.beginPath();
        ctx.ellipse(st.x, cy, brainR * 1.1, brainR * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fissure
        ctx.strokeStyle = `hsla(${st.hue}, ${st.sat - 5}%, ${st.lit - 10}%, 0.4)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(st.x, cy - brainR * 0.6);
        ctx.quadraticCurveTo(st.x - 2 * scale, cy, st.x, cy + brainR * 0.6);
        ctx.stroke();
      }

      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(st.label, st.x, cy + brainR + 22 * scale);

      // Arrow to next
      if (i < stages.length - 1) {
        const arrowAppear = interpolate(frame, [18 + i * 25, 28 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (arrowAppear > 0) {
          ctx.globalAlpha = fadeAlpha * arrowAppear;
          const nextX = stages[i + 1].x;
          const arrowStartX = st.x + brainR + 12 * scale;
          const arrowEndX = arrowStartX + (nextX - brainR - 12 * scale - arrowStartX) * arrowAppear;
          ctx.strokeStyle = PALETTE.text.dim;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, cy);
          ctx.lineTo(arrowEndX, cy);
          ctx.stroke();
          // Arrowhead
          if (arrowAppear > 0.8) {
            ctx.fillStyle = PALETTE.text.dim;
            ctx.beginPath();
            ctx.moveTo(arrowEndX, cy);
            ctx.lineTo(arrowEndX - 6 * scale, cy - 4 * scale);
            ctx.lineTo(arrowEndX - 6 * scale, cy + 4 * scale);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("chemical preservation", width / 2, height * 0.12);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Chemical Bonds: cross-links appear one by one inside brain, locking structure
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const crossLinks = useMemo(() => {
    const rand = seeded(14007);
    const links: { x: number; y: number; angle: number; delay: number }[] = [];
    const cx = 0, cy = 0, rx = 35, ry = 28;
    for (let i = 0; i < 30; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * 0.85;
      links.push({
        x: Math.cos(a) * rx * r,
        y: Math.sin(a) * ry * r,
        angle: rand() * Math.PI,
        delay: 15 + rand() * 70,
      });
    }
    return links;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const brainAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const colorShift = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const cy = height * 0.45;
    const brainW = 45 * scale;
    const brainH = 35 * scale;

    // Brain outline with shifting color
    const brainHue = 340 - colorShift * 90;
    const brainSat = 50 - colorShift * 38;
    const brainLit = 55 - colorShift * 10;

    if (brainAppear > 0) {
      ctx.globalAlpha = fadeAlpha * brainAppear;
      ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.5)`;
      ctx.beginPath();
      ctx.ellipse(cx, cy, brainW, brainH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit - 10}%, 0.5)`;
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();
      ctx.globalAlpha = fadeAlpha;
    }

    // Internal tissue lines (wavy, representing proteins)
    ctx.strokeStyle = `hsla(${brainHue}, ${brainSat - 10}%, ${brainLit + 5}%, 0.2)`;
    ctx.lineWidth = 0.8 * scale;
    for (let i = 0; i < 8; i++) {
      const yOff = -brainH * 0.7 + i * brainH * 0.2;
      ctx.beginPath();
      for (let x = -brainW * 0.8; x <= brainW * 0.8; x += 3) {
        const inEllipse = (x * x) / (brainW * brainW) + (yOff * yOff) / (brainH * brainH);
        if (inEllipse > 0.85) continue;
        const yy = cy + yOff + Math.sin(x * 0.3 + i * 1.5) * 3 * scale;
        x === -brainW * 0.8 ? ctx.moveTo(cx + x * scale, yy) : ctx.lineTo(cx + x * scale, yy);
      }
      ctx.stroke();
    }

    // Cross-links appearing
    let linkCount = 0;
    for (const link of crossLinks) {
      if (frame < link.delay) continue;
      linkCount++;
      const linkAppear = interpolate(frame, [link.delay, link.delay + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lx = cx + link.x * scale;
      const ly = cy + link.y * scale;
      const linkSize = 4 * scale * linkAppear;
      // X-shaped cross-link
      ctx.strokeStyle = `hsla(45, 70%, 65%, ${linkAppear * 0.8})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(lx - linkSize, ly - linkSize);
      ctx.lineTo(lx + linkSize, ly + linkSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lx + linkSize, ly - linkSize);
      ctx.lineTo(lx - linkSize, ly + linkSize);
      ctx.stroke();
    }

    // Counter and label
    const labelFade = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("cross-linking proteins", cx, height * 0.12);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px monospace`;
      ctx.fillText(`${linkCount} bonds formed`, cx, height * 0.88);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Flask Array: brain moves through multiple baths left to right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const baths = [
      { label: "primary fix", liquidHue: 160, liquidSat: 40, liquidLit: 40 },
      { label: "wash", liquidHue: 200, liquidSat: 35, liquidLit: 45 },
      { label: "secondary fix", liquidHue: 140, liquidSat: 45, liquidLit: 38 },
      { label: "dehydration", liquidHue: 30, liquidSat: 50, liquidLit: 45 },
    ];

    const bathW = width * 0.8;
    const startX = width * 0.1;
    const gap = bathW / baths.length;
    const bathY = height * 0.55;
    const beakerSize = 55 * scale;

    // Brain position along pipeline
    const brainProgress = interpolate(frame, [10, 100], [0, baths.length - 0.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const currentBath = Math.floor(brainProgress);
    const brainFrac = brainProgress - currentBath;

    // Draw beakers
    for (let i = 0; i < baths.length; i++) {
      const bathAppear = interpolate(frame, [3 + i * 5, 10 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (bathAppear <= 0) continue;
      const bx = startX + i * gap + gap / 2;
      ctx.globalAlpha = fadeAlpha * bathAppear;
      const bath = baths[i];
      drawBeaker(ctx, bx, bathY, beakerSize, `hsla(220, 35%, 55%, 0.55)`, `hsla(${bath.liquidHue}, ${bath.liquidSat}%, ${bath.liquidLit}%, 0.3)`, 0.55);
      // Label
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(bath.label, bx, bathY + beakerSize * 0.7 * 0.5 + 14 * scale);
      // Number
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.fillText(`${i + 1}`, bx, bathY - beakerSize * 0.7 * 0.5 - 8 * scale);
    }

    // Brain moving between beakers
    ctx.globalAlpha = fadeAlpha;
    const brainBathIdx = Math.min(currentBath, baths.length - 1);
    const nextBathIdx = Math.min(brainBathIdx + 1, baths.length - 1);
    const brainFromX = startX + brainBathIdx * gap + gap / 2;
    const brainToX = startX + nextBathIdx * gap + gap / 2;
    const brainX = brainFromX + (brainToX - brainFromX) * Math.min(brainFrac * 2, 1);
    // Above beakers during transit, in beaker during soak
    const inTransit = brainFrac < 0.5;
    const brainY = inTransit ? bathY - beakerSize * 0.5 - 15 * scale * Math.sin(brainFrac * Math.PI * 2) : bathY - 3 * scale;

    // Brain color shifts through pipeline
    const colorProgress = brainProgress / (baths.length - 1);
    const brainHue = 340 - colorProgress * 90;
    const brainSat = 50 - colorProgress * 40;
    const brainLit = 55 - colorProgress * 10;

    ctx.fillStyle = `hsla(${brainHue}, ${brainSat}%, ${brainLit}%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(brainX, brainY, 10 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("fixation pipeline", width / 2, height * 0.12);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Dropper Addition: close-up brain in dish, dropper releases drops with spreading color change
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  const dropHits = useMemo(() => {
    const rand = seeded(14009);
    const hits: { x: number; y: number; frame: number }[] = [];
    for (let i = 0; i < 6; i++) {
      hits.push({
        x: (rand() - 0.5) * 50,
        y: (rand() - 0.5) * 35,
        frame: 25 + i * 14,
      });
    }
    return hits;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height * 0.5;
    const brainW = 50 * scale;
    const brainH = 38 * scale;

    // Dish
    ctx.strokeStyle = "hsla(220, 30%, 50%, 0.4)";
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.ellipse(cx, cy + brainH + 5 * scale, brainW * 1.4, 10 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Brain base color (pink, fading as drops land)
    const totalDropsLanded = dropHits.filter(d => frame >= d.frame + 10).length;
    const globalColorShift = totalDropsLanded / dropHits.length;
    const baseHue = 340 - globalColorShift * 90;
    const baseSat = 50 - globalColorShift * 40;
    const baseLit = 55 - globalColorShift * 10;

    ctx.fillStyle = `hsla(${baseHue}, ${baseSat}%, ${baseLit}%, 0.75)`;
    ctx.beginPath();
    ctx.ellipse(cx, cy, brainW, brainH, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fissure
    ctx.strokeStyle = `hsla(${baseHue}, ${baseSat - 5}%, ${baseLit - 12}%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - brainH * 0.7);
    ctx.quadraticCurveTo(cx - 4 * scale, cy, cx, cy + brainH * 0.7);
    ctx.stroke();

    // Landed drops: expanding grey circles on brain surface
    for (const drop of dropHits) {
      if (frame < drop.frame) continue;
      const landedFor = frame - drop.frame;
      const dropLand = interpolate(landedFor, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dropLand <= 0) continue;
      const spreadRadius = interpolate(landedFor, [8, 50], [5, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scale;
      const spreadAlpha = interpolate(landedFor, [8, 50], [0.5, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `hsla(250, 12%, 45%, ${spreadAlpha})`;
      ctx.beginPath();
      ctx.arc(cx + drop.x * scale, cy + drop.y * scale, spreadRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pipette above brain
    const pipetteX = cx + 5 * scale;
    const pipetteY = cy - brainH - 30 * scale;
    ctx.strokeStyle = "hsla(220, 25%, 55%, 0.6)";
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(pipetteX, pipetteY);
    ctx.lineTo(pipetteX, pipetteY + 25 * scale);
    ctx.stroke();
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(pipetteX - 3 * scale, pipetteY + 25 * scale);
    ctx.lineTo(pipetteX, pipetteY + 32 * scale);
    ctx.lineTo(pipetteX + 3 * scale, pipetteY + 25 * scale);
    ctx.stroke();
    // Bulb
    ctx.fillStyle = "hsla(0, 35%, 45%, 0.4)";
    ctx.beginPath();
    ctx.ellipse(pipetteX, pipetteY - 6 * scale, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Active falling drop
    for (const drop of dropHits) {
      const dropFall = frame - drop.frame + 10;
      if (dropFall < 0 || dropFall > 10) continue;
      const fallProgress = dropFall / 10;
      const tipY = pipetteY + 32 * scale;
      const targetY = cy + drop.y * scale;
      const dy = tipY + (targetY - tipY) * Math.pow(fallProgress, 1.5);
      ctx.fillStyle = `hsla(160, 50%, 55%, ${0.8 * (1 - fallProgress)})`;
      ctx.beginPath();
      ctx.ellipse(pipetteX + (drop.x * scale - 5 * scale) * fallProgress, dy, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    const labelFade = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fixative drops", pipetteX, pipetteY - 18 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${9 * scale}px monospace`;
      ctx.fillText(`${totalDropsLanded} / ${dropHits.length} drops applied`, cx, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_014: VariantDef[] = [
  { id: "beaker-drop", label: "Beaker Drop", component: V1 },
  { id: "chemistry-setup", label: "Chemistry Setup", component: V2 },
  { id: "liquid-immersion", label: "Liquid Immersion", component: V3 },
  { id: "color-timeline", label: "Color Shift Timeline", component: V4 },
  { id: "lab-bench", label: "Lab Bench Scene", component: V5 },
  { id: "preservation-pipeline", label: "Preservation Process", component: V6 },
  { id: "chemical-bonds", label: "Chemical Bonds", component: V7 },
  { id: "flask-array", label: "Flask Array", component: V8 },
  { id: "dropper-addition", label: "Dropper Addition", component: V9 },
];
