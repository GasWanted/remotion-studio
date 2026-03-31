import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawResinBlock, drawBlade } from "../icons";

// Shot 16 — "Then a machine called an ultramicrotome shaved off sections —
//   forty nanometers thick, about a thousand times thinner than a human hair."
// 150 frames (5s). Blade slices resin block into impossibly thin sections.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Blade Advancing: blade advances from right, thin sections peel off, scale comparison below
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const blockAppear = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceCycle = 15; // frames per slice
    const sliceStart = 20;
    const numSlices = 8;
    const comparisonFade = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const blockX = width * 0.28;
    const blockY = height * 0.38;
    const blockW = 45 * scale;
    const blockH = 60 * scale;

    // Resin block (shrinks slightly as sections are taken)
    const slicesDone = Math.min(numSlices, Math.floor((frame - sliceStart) / sliceCycle));
    const adjustedBlockW = blockW - slicesDone * 1.5 * scale;

    if (blockAppear > 0) {
      ctx.globalAlpha = fadeAlpha * blockAppear;
      drawResinBlock(ctx, blockX, blockY, Math.max(10 * scale, adjustedBlockW), blockH, `hsla(40, 55%, 45%, 0.3)`, 8 * scale);
      // Brain hint inside
      ctx.fillStyle = `hsla(250, 15%, 42%, 0.4)`;
      ctx.beginPath();
      ctx.ellipse(blockX, blockY, 10 * scale, 12 * scale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fadeAlpha;
    }

    // Blade
    const bladeX = blockX + adjustedBlockW / 2 + 8 * scale;
    const bladeLen = 35 * scale;
    const bladeOscillation = Math.sin(frame * 0.3) * 2 * scale;
    drawBlade(ctx, bladeX + bladeOscillation, blockY, bladeLen, `hsla(200, 60%, 75%, 0.8)`);
    // Blade label
    const bladeLabelFade = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bladeLabelFade > 0) {
      ctx.globalAlpha = fadeAlpha * bladeLabelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("diamond knife", bladeX + bladeOscillation, blockY + bladeLen / 2 + 12 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Sections peeling off and accumulating to the right
    const sectionStartX = blockX + adjustedBlockW / 2 + 25 * scale;
    const sectionAccumX = width * 0.65;
    for (let i = 0; i < numSlices; i++) {
      const sectionFrame = frame - (sliceStart + i * sliceCycle);
      if (sectionFrame < 0) continue;
      const peelProgress = interpolate(sectionFrame, [0, sliceCycle * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const targetX = sectionAccumX + i * 4 * scale;
      const sectionX = sectionStartX + (targetX - sectionStartX) * peelProgress;
      const sectionY = blockY;
      // Thin golden rectangle
      ctx.fillStyle = `hsla(45, 70%, 60%, ${0.4 + peelProgress * 0.3})`;
      ctx.fillRect(sectionX - 1 * scale, sectionY - blockH * 0.4, 2 * scale, blockH * 0.8);
      ctx.strokeStyle = `hsla(45, 80%, 70%, ${0.3 * peelProgress})`;
      ctx.lineWidth = 0.5 * scale;
      ctx.strokeRect(sectionX - 1 * scale, sectionY - blockH * 0.4, 2 * scale, blockH * 0.8);
    }

    // Section count
    if (slicesDone > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${slicesDone} sections`, sectionAccumX + (numSlices * 2) * scale, blockY - blockH * 0.4 - 10 * scale);
    }

    // Scale comparison at bottom
    if (comparisonFade > 0) {
      ctx.globalAlpha = fadeAlpha * comparisonFade;
      const barY = height * 0.75;
      // Hair thickness bar
      const hairBarW = 80 * scale;
      ctx.fillStyle = `hsla(40, 50%, 55%, 0.5)`;
      ctx.fillRect(width * 0.15, barY, hairBarW, 8 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("human hair: 75,000 nm", width * 0.15, barY - 6 * scale);

      // Section thickness bar (barely visible)
      const sectionBarW = hairBarW / 1000;
      const sectionBarX = width * 0.15;
      ctx.fillStyle = `hsla(45, 80%, 65%, 0.9)`;
      ctx.fillRect(sectionBarX, barY + 22 * scale, Math.max(1.5 * scale, sectionBarW), 8 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText("section: 40 nm", sectionBarX, barY + 22 * scale - 6 * scale);

      // 1000x label
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${12 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("1,000x thinner", width * 0.65, barY + 15 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Sections Peeling: close-up of block face, thin sections curl away and stack
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const slicePeriod = 16;
    const sliceStartFrame = 12;
    const maxSlices = 8;

    const blockFaceX = width * 0.3;
    const blockFaceY = height * 0.2;
    const blockFaceW = 55 * scale;
    const blockFaceH = 65 * scale;
    const stackX = width * 0.72;
    const stackY = height * 0.5;

    // Block face (cross-section view, amber rectangle)
    ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
    ctx.fillRect(blockFaceX, blockFaceY, blockFaceW, blockFaceH);
    ctx.strokeStyle = `hsla(40, 60%, 55%, 0.5)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(blockFaceX, blockFaceY, blockFaceW, blockFaceH);
    // Brain cross-section visible on face
    ctx.fillStyle = `hsla(250, 15%, 42%, 0.4)`;
    ctx.beginPath();
    ctx.ellipse(blockFaceX + blockFaceW / 2, blockFaceY + blockFaceH / 2, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sections curling off and floating to stack
    for (let i = 0; i < maxSlices; i++) {
      const secFrame = frame - (sliceStartFrame + i * slicePeriod);
      if (secFrame < 0) continue;

      const curlProgress = interpolate(secFrame, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const floatProgress = interpolate(secFrame, [5, slicePeriod - 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Section starting at face, curling right, then floating to stack
      const startX = blockFaceX + blockFaceW;
      const endX = stackX;
      const startY = blockFaceY + blockFaceH / 2;
      const endY = stackY + i * 3 * scale;

      const curlX = startX + curlProgress * 15 * scale;
      const secX = curlProgress < 1 ? curlX : curlX + (endX - curlX) * floatProgress;
      const secY = curlProgress < 1 ? startY : startY + (endY - startY) * floatProgress;

      // Thin golden section
      const secW = 2 * scale;
      const secH = blockFaceH * 0.8;
      const curl = curlProgress < 1 ? curlProgress * 0.3 : 0;
      ctx.save();
      ctx.translate(secX, secY);
      ctx.rotate(curl);
      ctx.fillStyle = `hsla(45, 70%, 60%, 0.5)`;
      ctx.fillRect(-secW / 2, -secH / 2, secW, secH);
      ctx.restore();
    }

    // Stack label
    const stackedCount = Math.min(maxSlices, Math.max(0, Math.floor((frame - sliceStartFrame) / slicePeriod)));
    if (stackedCount > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`Section ${stackedCount}`, stackX, stackY - blockFaceH * 0.5 - 10 * scale);
    }

    // Bottom annotation
    const noteFade = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (noteFade > 0) {
      ctx.globalAlpha = fadeAlpha * noteFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("each section: 40 nm thick", width / 2, height * 0.9);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Side View Slicing: cross-section diagram with blade in center
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const setupAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceCycle = (frame - 25) % 20;
    const sliceActive = frame >= 25 && frame < 130;
    const sectionCount = Math.min(6, Math.max(0, Math.floor((frame - 25) / 20)));
    const labelFade = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width * 0.42;
    const cy = height * 0.45;

    // Block on left (side view: tall thin rectangle)
    if (setupAppear > 0) {
      ctx.globalAlpha = fadeAlpha * setupAppear;
      const blockW = 35 * scale - sectionCount * 2 * scale;
      const blockH = 55 * scale;
      ctx.fillStyle = `hsla(40, 55%, 45%, 0.3)`;
      ctx.fillRect(cx - blockW - 15 * scale, cy - blockH / 2, blockW, blockH);
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(cx - blockW - 15 * scale, cy - blockH / 2, blockW, blockH);
      ctx.globalAlpha = fadeAlpha;
    }

    // Blade edge (horizontal line, center)
    ctx.strokeStyle = `hsla(200, 70%, 75%, 0.8)`;
    ctx.lineWidth = 2 * scale;
    const bladeVibration = sliceActive ? Math.sin(frame * 0.5) * 1 * scale : 0;
    ctx.beginPath();
    ctx.moveTo(cx - 5 * scale, cy - 25 * scale + bladeVibration);
    ctx.lineTo(cx + 3 * scale, cy + 25 * scale + bladeVibration);
    ctx.stroke();
    // Blade gleam
    ctx.strokeStyle = `hsla(200, 80%, 90%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * scale, cy - 24 * scale + bladeVibration);
    ctx.lineTo(cx + 5 * scale, cy + 24 * scale + bladeVibration);
    ctx.stroke();

    // Sections emerging to the right
    for (let i = 0; i < sectionCount; i++) {
      const secX = cx + 20 * scale + i * 8 * scale;
      const secH = 50 * scale;
      ctx.fillStyle = `hsla(45, 70%, 60%, 0.45)`;
      ctx.fillRect(secX, cy - secH / 2, 2 * scale, secH);
    }
    // Active section being cut
    if (sliceActive && sliceCycle < 15) {
      const cutProgress = sliceCycle / 15;
      const secX = cx + 5 * scale;
      const secH = 50 * scale * cutProgress;
      ctx.fillStyle = `hsla(45, 80%, 65%, 0.6)`;
      ctx.fillRect(secX, cy - secH / 2, 2 * scale, secH);
    }

    // Labels
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("resin block", cx - 30 * scale, cy + 38 * scale);
      ctx.fillText("diamond knife", cx, cy + 38 * scale);
      ctx.fillText("sections", cx + 30 * scale + sectionCount * 4 * scale, cy + 38 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Counter
    if (sectionCount > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${sectionCount} slices @ 40nm`, width / 2, height * 0.88);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Scale Comparison: two parallel bars showing hair vs section thickness
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const hairAppear = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sectionAppear = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ratioAppear = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const emphasisPulse = interpolate(frame, [80, 140], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2;
    const barMaxW = width * 0.6;
    const barStartX = width * 0.2;

    // Hair bar (top)
    const hairBarY = height * 0.32;
    if (hairAppear > 0) {
      ctx.globalAlpha = fadeAlpha * hairAppear;
      const hairW = barMaxW * hairAppear;
      const hairH = 18 * scale; // Visually thick
      ctx.fillStyle = `hsla(35, 60%, 50%, 0.5)`;
      ctx.fillRect(barStartX, hairBarY, hairW, hairH);
      ctx.strokeStyle = `hsla(35, 65%, 55%, 0.6)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(barStartX, hairBarY, hairW, hairH);
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("human hair", barStartX, hairBarY - 8 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("75,000 nm", barStartX + barMaxW, hairBarY - 8 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Section bar (bottom, barely visible)
    const sectionBarY = height * 0.55;
    if (sectionAppear > 0) {
      ctx.globalAlpha = fadeAlpha * sectionAppear;
      const sectionH = Math.max(1.5 * scale, 18 * scale * (40 / 75000));
      const sectionW = Math.max(2 * scale, barMaxW * (40 / 75000) * sectionAppear);
      ctx.fillStyle = `hsla(45, 85%, 65%, 0.9)`;
      ctx.fillRect(barStartX, sectionBarY, sectionW, sectionH);
      // Glow to make it visible
      ctx.shadowColor = `hsla(45, 90%, 70%, 0.8)`;
      ctx.shadowBlur = 8 * scale;
      ctx.fillRect(barStartX, sectionBarY, sectionW, sectionH);
      ctx.shadowBlur = 0;
      // Arrow pointing to it
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(barStartX + 20 * scale, sectionBarY - 12 * scale);
      ctx.lineTo(barStartX + sectionW + 3, sectionBarY + sectionH / 2);
      ctx.stroke();
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("brain section", barStartX, sectionBarY - 18 * scale);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText("40 nm", barStartX + barMaxW, sectionBarY - 18 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Ratio emphasis
    if (ratioAppear > 0) {
      const pulse = 0.85 + Math.sin(emphasisPulse) * 0.15;
      ctx.globalAlpha = fadeAlpha * ratioAppear;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${22 * scale * pulse}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("1,000x thinner", cx, height * 0.78);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("than a human hair", cx, height * 0.85);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Conveyor of Slices: slicing station on left, conveyor belt carries numbered sections right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const beltSpeed = 0.8;
    const slicePeriod = 18;
    const maxSlices = 7;

    const beltY = height * 0.55;
    const beltStartX = width * 0.12;
    const beltEndX = width * 0.92;
    const beltWidth = beltEndX - beltStartX;

    // Belt
    ctx.strokeStyle = "hsla(220, 25%, 40%, 0.4)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(beltStartX, beltY);
    ctx.lineTo(beltEndX, beltY);
    ctx.stroke();
    // Belt rollers
    for (const rx of [beltStartX, beltEndX]) {
      ctx.strokeStyle = "hsla(220, 25%, 45%, 0.5)";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.arc(rx, beltY, 5 * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Belt texture (moving dots)
    for (let i = 0; i < 20; i++) {
      const dotX = ((beltStartX + i * (beltWidth / 20) + frame * beltSpeed * scale) % beltWidth) + beltStartX;
      ctx.fillStyle = "hsla(220, 20%, 35%, 0.2)";
      ctx.beginPath();
      ctx.arc(dotX, beltY, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Block at slicing station
    const blockX = beltStartX + 25 * scale;
    const blockY = beltY - 35 * scale;
    drawResinBlock(ctx, blockX, blockY, 25 * scale, 35 * scale, `hsla(40, 55%, 45%, 0.3)`, 5 * scale);

    // Blade
    drawBlade(ctx, blockX + 20 * scale, blockY, 25 * scale, `hsla(200, 65%, 75%, 0.8)`);

    // Sections on belt
    for (let i = 0; i < maxSlices; i++) {
      const spawnFrame = 15 + i * slicePeriod;
      if (frame < spawnFrame) continue;
      const age = frame - spawnFrame;
      const sectionX = blockX + 35 * scale + age * beltSpeed * scale;
      if (sectionX > beltEndX + 10) continue;

      const secH = 28 * scale;
      ctx.fillStyle = `hsla(45, 70%, 60%, 0.45)`;
      ctx.fillRect(sectionX - 1 * scale, beltY - secH - 3 * scale, 2.5 * scale, secH);
      ctx.strokeStyle = `hsla(45, 80%, 70%, 0.3)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.strokeRect(sectionX - 1 * scale, beltY - secH - 3 * scale, 2.5 * scale, secH);
      // Section number
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${i + 1}`, sectionX, beltY - secH - 7 * scale);
    }

    // Labels
    const labelFade = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelFade > 0) {
      ctx.globalAlpha = fadeAlpha * labelFade;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("ultramicrotome", blockX, beltY + 18 * scale);
      ctx.globalAlpha = fadeAlpha;
    }

    // Counter
    const slicesDone = Math.min(maxSlices, Math.max(0, Math.floor((frame - 15) / slicePeriod) + 1));
    if (slicesDone > 0) {
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${slicesDone} sections, 40nm each`, width / 2, height * 0.88);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Blade Close-up: diamond blade edge fills screen, block approaches, section separates
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height * 0.45;

    // Big blade edge (diagonal across screen)
    const bladeAngle = -0.15;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(bladeAngle);

    // Blade body (large triangular shape)
    const bladeW = width * 0.6;
    const bladeH = 4 * scale;
    ctx.fillStyle = `hsla(200, 50%, 60%, 0.15)`;
    ctx.beginPath();
    ctx.moveTo(-bladeW / 2, -bladeH * 8);
    ctx.lineTo(bladeW / 2, -bladeH * 8);
    ctx.lineTo(bladeW / 2, 0);
    ctx.lineTo(-bladeW / 2, 0);
    ctx.closePath();
    ctx.fill();

    // Blade edge (sharp bright line)
    ctx.strokeStyle = `hsla(200, 80%, 80%, 0.9)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(-bladeW / 2, 0);
    ctx.lineTo(bladeW / 2, 0);
    ctx.stroke();
    // Gleam animation
    const gleamX = interpolate(frame % 60, [0, 59], [-bladeW / 2, bladeW / 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = `hsla(200, 90%, 95%, 0.5)`;
    ctx.beginPath();
    ctx.arc(gleamX, 0, 4 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Three cutting cycles
    for (let cycle = 0; cycle < 3; cycle++) {
      const cycleStart = 15 + cycle * 40;
      const cycleEnd = cycleStart + 35;
      const approach = interpolate(frame, [cycleStart, cycleStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const separate = interpolate(frame, [cycleStart + 15, cycleEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      if (approach <= 0) continue;

      // Block approaching from left
      const blockStartX = cx - 80 * scale;
      const blockContactX = cx - 10 * scale;
      const blockX = blockStartX + (blockContactX - blockStartX) * approach;
      const blockW = 30 * scale;
      const blockH = 50 * scale;
      const blockY = cy + 15 * scale;

      ctx.fillStyle = `hsla(40, 55%, 45%, ${0.3 * (1 - separate * 0.3)})`;
      ctx.fillRect(blockX - blockW, blockY, blockW, blockH);
      ctx.strokeStyle = `hsla(40, 60%, 55%, 0.4)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(blockX - blockW, blockY, blockW, blockH);

      // Section separating
      if (separate > 0) {
        const secX = blockX + separate * 30 * scale;
        const secDrift = separate * 8 * scale;
        ctx.fillStyle = `hsla(45, 70%, 60%, ${0.5 * (1 - separate * 0.3)})`;
        ctx.fillRect(secX, blockY + secDrift, 2 * scale, blockH);
      }
    }

    // Label
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("diamond knife edge", cx, height * 0.88);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Thickness Counter: "40" large center, comparisons fade in
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const numberAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const unitAppear = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const comparisons = [
      { text: "1,000x thinner than a human hair", icon: "hair" },
      { text: "500x thinner than a red blood cell", icon: "cell" },
      { text: "thinner than a wavelength of light", icon: "wave" },
    ];

    const cx = width / 2;

    // Big "40" number
    if (numberAppear > 0) {
      ctx.globalAlpha = fadeAlpha * numberAppear;
      const numScale = 0.5 + numberAppear * 0.5;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${55 * scale * numScale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("40", cx, height * 0.25);
      ctx.textBaseline = "alphabetic";
      ctx.globalAlpha = fadeAlpha;
    }

    // "nanometers" below
    if (unitAppear > 0) {
      ctx.globalAlpha = fadeAlpha * unitAppear;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("nanometers", cx, height * 0.36);
      ctx.globalAlpha = fadeAlpha;
    }

    // Comparisons fade in one by one
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px monospace`;
    ctx.textAlign = "center";
    const introFade = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (introFade > 0) {
      ctx.globalAlpha = fadeAlpha * introFade;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("that's...", cx, height * 0.48);
      ctx.globalAlpha = fadeAlpha;
    }

    for (let i = 0; i < comparisons.length; i++) {
      const compAppear = interpolate(frame, [55 + i * 22, 68 + i * 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (compAppear <= 0) continue;

      const comp = comparisons[i];
      const compY = height * 0.56 + i * 22 * scale;
      ctx.globalAlpha = fadeAlpha * compAppear;

      // Icon hint
      const iconX = cx - 80 * scale;
      if (comp.icon === "hair") {
        ctx.strokeStyle = `hsla(35, 60%, 55%, ${compAppear * 0.6})`;
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(iconX - 8 * scale, compY);
        ctx.lineTo(iconX + 8 * scale, compY);
        ctx.stroke();
      } else if (comp.icon === "cell") {
        ctx.strokeStyle = `hsla(0, 55%, 55%, ${compAppear * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.arc(iconX, compY, 6 * scale, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Wave
        ctx.strokeStyle = `hsla(280, 50%, 60%, ${compAppear * 0.6})`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        for (let x = -10; x <= 10; x += 1) {
          const wx = iconX + x * scale;
          const wy = compY + Math.sin(x * 0.8) * 4 * scale;
          x === -10 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.stroke();
      }

      // Text
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(comp.text, iconX + 15 * scale, compY + 4 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Alternating Slice/Compare: slicing action alternates with scale context
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height * 0.45;

    // Alternate between slicing (0-30, 60-90, 120-150) and comparison (30-60, 90-120)
    const cyclePos = frame % 40;
    const isSlicePhase = frame < 35 || (frame >= 65 && frame < 100);

    if (isSlicePhase) {
      // SLICE ACTION
      const localProgress = cyclePos / 30;

      // Block
      const blockW = 40 * scale;
      const blockH = 55 * scale;
      drawResinBlock(ctx, cx - 25 * scale, cy, blockW, blockH, `hsla(40, 55%, 45%, 0.3)`, 6 * scale);

      // Blade
      const bladeX = cx + blockW / 2 - 15 * scale;
      drawBlade(ctx, bladeX, cy, 30 * scale, `hsla(200, 65%, 75%, 0.8)`);

      // Section being cut
      const sectionX = bladeX + 8 * scale + localProgress * 25 * scale;
      ctx.fillStyle = `hsla(45, 70%, 60%, 0.5)`;
      ctx.fillRect(sectionX, cy - blockH * 0.35, 2 * scale, blockH * 0.7);

      // Label
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("slicing", cx, height * 0.82);
    } else {
      // COMPARISON PHASE
      const compProgress = interpolate(cyclePos, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

      // Hair bar
      const barW = width * 0.5;
      const barStartX = cx - barW / 2;
      ctx.fillStyle = `hsla(35, 55%, 50%, ${0.4 * compProgress})`;
      ctx.fillRect(barStartX, cy - 15 * scale, barW * compProgress, 12 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("hair: 75 \u03BCm", barStartX, cy - 20 * scale);

      // Section bar (tiny)
      ctx.fillStyle = `hsla(45, 80%, 65%, ${0.8 * compProgress})`;
      ctx.fillRect(barStartX, cy + 15 * scale, Math.max(2, barW * 0.0005 * compProgress), 12 * scale);
      ctx.shadowColor = `hsla(45, 90%, 70%, 0.6)`;
      ctx.shadowBlur = 6 * scale;
      ctx.fillRect(barStartX, cy + 15 * scale, Math.max(2, barW * 0.0005), 12 * scale);
      ctx.shadowBlur = 0;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText("section: 40 nm", barStartX, cy + 10 * scale);

      // Ratio
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("1,000x difference", cx, cy + 50 * scale);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Machine Diagram: ultramicrotome with labeled components
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, scale);
    const fadeAlpha = fadeInOut(frame, 150);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;

    // Machine components, each appearing with delay
    const components = [
      { label: "sample arm", y: height * 0.18, desc: "holds the resin block" },
      { label: "resin block", y: height * 0.32, desc: "brain embedded inside" },
      { label: "diamond knife", y: height * 0.46, desc: "cuts 40nm sections" },
      { label: "water trough", y: height * 0.6, desc: "sections float on water" },
      { label: "collection grid", y: height * 0.74, desc: "picks up sections" },
    ];

    for (let i = 0; i < components.length; i++) {
      const compAppear = interpolate(frame, [8 + i * 15, 22 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (compAppear <= 0) continue;

      const comp = components[i];
      ctx.globalAlpha = fadeAlpha * compAppear;

      const compX = cx - 10 * scale;

      if (i === 0) {
        // Sample arm: vertical line with pivot
        ctx.strokeStyle = "hsla(220, 30%, 55%, 0.6)";
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        ctx.moveTo(compX, comp.y);
        ctx.lineTo(compX, comp.y + 25 * scale);
        ctx.stroke();
        ctx.fillStyle = "hsla(220, 30%, 50%, 0.5)";
        ctx.beginPath();
        ctx.arc(compX, comp.y, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      } else if (i === 1) {
        // Resin block
        drawResinBlock(ctx, compX, comp.y, 22 * scale, 28 * scale, `hsla(40, 55%, 45%, 0.3)`, 5 * scale);
        // Brain inside
        ctx.fillStyle = "hsla(250, 15%, 42%, 0.35)";
        ctx.beginPath();
        ctx.ellipse(compX, comp.y, 6 * scale, 7 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (i === 2) {
        // Diamond knife
        drawBlade(ctx, compX, comp.y, 22 * scale, `hsla(200, 65%, 75%, 0.8)`);
        // Motion arrows (sample moves toward blade)
        const movePhase = (frame * 0.08) % (Math.PI * 2);
        const arrowOffset = Math.sin(movePhase) * 3 * scale;
        ctx.strokeStyle = `hsla(45, 60%, 60%, 0.4)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(compX - 20 * scale, comp.y - 8 * scale + arrowOffset);
        ctx.lineTo(compX - 10 * scale, comp.y - 8 * scale + arrowOffset);
        ctx.lineTo(compX - 12 * scale, comp.y - 11 * scale + arrowOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(compX - 20 * scale, comp.y - 8 * scale + arrowOffset);
        ctx.lineTo(compX - 10 * scale, comp.y - 8 * scale + arrowOffset);
        ctx.lineTo(compX - 12 * scale, comp.y - 5 * scale + arrowOffset);
        ctx.stroke();
      } else if (i === 3) {
        // Water trough (arc shape)
        ctx.strokeStyle = "hsla(200, 45%, 55%, 0.5)";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.arc(compX, comp.y + 5 * scale, 18 * scale, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        // Water fill
        ctx.fillStyle = "hsla(200, 40%, 50%, 0.15)";
        ctx.beginPath();
        ctx.arc(compX, comp.y + 5 * scale, 17 * scale, Math.PI * 0.15, Math.PI * 0.85);
        ctx.fill();
        // Floating sections
        const secCount = Math.min(3, Math.floor(compAppear * 3));
        for (let s = 0; s < secCount; s++) {
          const angle = Math.PI * 0.3 + s * Math.PI * 0.2;
          const sx = compX + Math.cos(angle) * 12 * scale;
          const sy = comp.y + 5 * scale + Math.sin(angle) * 12 * scale;
          ctx.fillStyle = `hsla(45, 70%, 60%, 0.5)`;
          ctx.fillRect(sx - 3 * scale, sy - 1 * scale, 6 * scale, 2 * scale);
        }
      } else if (i === 4) {
        // Collection grid (small rectangle with grid lines)
        const gridW = 18 * scale;
        const gridH = 18 * scale;
        ctx.strokeStyle = "hsla(220, 35%, 55%, 0.5)";
        ctx.lineWidth = 1 * scale;
        ctx.strokeRect(compX - gridW / 2, comp.y - gridH / 2, gridW, gridH);
        for (let g = 1; g < 3; g++) {
          ctx.beginPath();
          ctx.moveTo(compX - gridW / 2 + g * gridW / 3, comp.y - gridH / 2);
          ctx.lineTo(compX - gridW / 2 + g * gridW / 3, comp.y + gridH / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(compX - gridW / 2, comp.y - gridH / 2 + g * gridH / 3);
          ctx.lineTo(compX + gridW / 2, comp.y - gridH / 2 + g * gridH / 3);
          ctx.stroke();
        }
      }

      // Connection line to next component
      if (i < components.length - 1) {
        const nextY = components[i + 1].y;
        ctx.strokeStyle = "hsla(220, 25%, 40%, 0.2)";
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([3 * scale, 3 * scale]);
        ctx.beginPath();
        ctx.moveTo(compX, comp.y + 15 * scale);
        ctx.lineTo(compX, nextY - 15 * scale);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label (to the right)
      ctx.fillStyle = i === 2 ? PALETTE.text.accent : PALETTE.text.primary;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(comp.label, compX + 30 * scale, comp.y - 2 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.fillText(comp.desc, compX + 30 * scale, comp.y + 10 * scale);
    }

    // Title
    const titleFade = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (titleFade > 0) {
      ctx.globalAlpha = fadeAlpha * titleFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("ultramicrotome", cx, height * 0.07);
      ctx.globalAlpha = fadeAlpha;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_016: VariantDef[] = [
  { id: "blade-advancing", label: "Blade Advancing", component: V1 },
  { id: "sections-peeling", label: "Sections Peeling", component: V2 },
  { id: "side-view", label: "Side View Slicing", component: V3 },
  { id: "scale-comparison", label: "Scale Comparison", component: V4 },
  { id: "conveyor", label: "Conveyor of Slices", component: V5 },
  { id: "blade-closeup", label: "Blade Close-up", component: V6 },
  { id: "thickness-counter", label: "Thickness Counter", component: V7 },
  { id: "alternating", label: "Slice / Compare", component: V8 },
  { id: "machine-diagram", label: "Machine Diagram", component: V9 },
];
