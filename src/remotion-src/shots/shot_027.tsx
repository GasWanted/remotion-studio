import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawCheck, drawCursor, drawPerson } from "../icons";

// Shot 27 — "and hundreds of volunteers spent four years checking the work —"
// 120 frames (4s). Timeline 2019-2023, errors being corrected over time.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Timeline Bar: horizontal bar 2019-2023. Fills left to right. Error blobs turn red->green above bar.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 27001), [width, height, scale]);
  const corrections = useMemo(() => {
    const rand = seeded(27011);
    return Array.from({ length: 24 }, () => ({
      relX: rand(),
      relY: 0.15 + rand() * 0.35,
      fixTime: rand(), // 0-1 maps to 2019-2023
      size: (2.5 + rand() * 3) * scale,
    }));
  }, [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const barY = height * 0.62;
    const barX = width * 0.1;
    const barW = width * 0.8;
    const barH = 8 * scale;
    // Timeline progress
    const timeProgress = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Year labels
    const years = [2019, 2020, 2021, 2022, 2023];
    for (let i = 0; i < years.length; i++) {
      const yearX = barX + (i / 4) * barW;
      const yearAppear = interpolate(timeProgress, [i / 4 - 0.05, i / 4 + 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (yearAppear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * yearAppear;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${years[i]}`, yearX, barY + barH + 16 * scale);
      // Tick mark
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(yearX, barY - 3 * scale);
      ctx.lineTo(yearX, barY + barH + 3 * scale);
      ctx.stroke();
    }
    // Bar track
    ctx.globalAlpha = fadeAlpha * 0.3;
    ctx.fillStyle = `hsla(220, 20%, 25%, 0.5)`;
    ctx.fillRect(barX, barY, barW, barH);
    // Bar fill
    ctx.globalAlpha = fadeAlpha;
    const fillW = barW * timeProgress;
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, PALETTE.accent.blue);
    barGrad.addColorStop(1, PALETTE.accent.green);
    ctx.fillStyle = barGrad;
    ctx.fillRect(barX, barY, fillW, barH);
    // Border
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(barX, barY, barW, barH);
    // Correction blobs above bar: red until their fixTime, then green
    for (const corr of corrections) {
      const blobX = barX + corr.relX * barW;
      const blobY = corr.relY * height;
      const isFixed = timeProgress >= corr.fixTime;
      ctx.globalAlpha = fadeAlpha * 0.8;
      if (isFixed) {
        // Transition flash
        const fixFrame = 10 + corr.fixTime * 90;
        const flashDist = Math.abs(frame - fixFrame);
        if (flashDist < 4) {
          const flashAlpha = 1 - flashDist / 4;
          ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(blobX, blobY, corr.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `hsla(140, 50%, 55%, 0.7)`;
      } else {
        ctx.fillStyle = `hsla(0, 50%, 50%, 0.6)`;
      }
      ctx.beginPath();
      ctx.arc(blobX, blobY, corr.size, 0, Math.PI * 2);
      ctx.fill();
      // Small checkmark on fixed ones
      if (isFixed) {
        drawCheck(ctx, blobX, blobY, corr.size * 1.5, PALETTE.accent.green);
      }
    }
    // "4 YEARS" label
    const labelAlpha = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${14 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("4 YEARS", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Calendar Pages: pages flip from 2019 to 2023, each with fix count increasing.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 27002), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const years = [2019, 2020, 2021, 2022, 2023];
    const fixes = [0, 124891, 567234, 1203445, 1847321];
    const pageW = 80 * scale;
    const pageH = 100 * scale;
    const centerX = width / 2;
    const centerY = height * 0.42;
    // Current year based on frame
    const yearProgress = interpolate(frame, [10, 100], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const currentYearIdx = Math.min(4, Math.floor(yearProgress));
    const flipProgress = yearProgress - currentYearIdx; // 0-1 within current year
    // Previous pages (stacked slightly visible)
    for (let i = 0; i < currentYearIdx; i++) {
      const offset = (currentYearIdx - i) * 2 * scale;
      ctx.globalAlpha = fadeAlpha * 0.15;
      ctx.fillStyle = `hsla(220, 20%, 25%, 0.5)`;
      ctx.fillRect(centerX - pageW / 2 - offset, centerY - pageH / 2 - offset, pageW, pageH);
    }
    // Current page
    ctx.globalAlpha = fadeAlpha;
    // Page background
    ctx.fillStyle = `hsla(220, 20%, 15%, 0.85)`;
    ctx.fillRect(centerX - pageW / 2, centerY - pageH / 2, pageW, pageH);
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.5)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(centerX - pageW / 2, centerY - pageH / 2, pageW, pageH);
    // Top ribbon
    ctx.fillStyle = `hsla(${PALETTE.cellColors[currentYearIdx % 8][0]}, 45%, 45%, 0.7)`;
    ctx.fillRect(centerX - pageW / 2, centerY - pageH / 2, pageW, 18 * scale);
    // Year number
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${28 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(`${years[currentYearIdx]}`, centerX, centerY + 5 * scale);
    // Fix count
    const displayFixes = Math.floor(interpolate(flipProgress, [0, 0.8], [fixes[currentYearIdx], fixes[Math.min(4, currentYearIdx + 1)]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.fillText(`${displayFixes.toLocaleString()} fixes`, centerX, centerY + 28 * scale);
    // Flip animation: next page curling over
    if (flipProgress > 0.6 && currentYearIdx < 4) {
      const curl = interpolate(flipProgress, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * curl * 0.6;
      ctx.save();
      ctx.translate(centerX, centerY - pageH / 2);
      ctx.scale(1, curl);
      ctx.fillStyle = `hsla(${PALETTE.cellColors[(currentYearIdx + 1) % 8][0]}, 30%, 20%, 0.8)`;
      ctx.fillRect(-pageW / 2, 0, pageW, pageH);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${22 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(`${years[Math.min(4, currentYearIdx + 1)]}`, 0, pageH * 0.5);
      ctx.restore();
    }
    // Running total at bottom
    const totalAlpha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (totalAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * totalAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("total corrections", centerX, centerY + pageH / 2 + 22 * scale);
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${13 * scale}px monospace`;
      ctx.fillText(displayFixes.toLocaleString(), centerX, centerY + pageH / 2 + 38 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Progress Bar: large progress bar filling 0-100% over 4 years with running fix count.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 27003), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const progress = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barX = width * 0.1;
    const barY = height * 0.45;
    const barW = width * 0.8;
    const barH = 20 * scale;
    const cornerR = barH / 2;
    // "Verification progress" title
    const titleAlpha = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (titleAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * titleAlpha;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${13 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("verification progress", width / 2, barY - 30 * scale);
    }
    // Bar track (rounded)
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = `hsla(220, 20%, 15%, 0.6)`;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, cornerR);
    ctx.fill();
    // Bar fill
    const fillW = Math.max(cornerR * 2, barW * progress);
    const barGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    barGrad.addColorStop(0, `hsla(180, 55%, 50%, 0.8)`);
    barGrad.addColorStop(0.5, `hsla(140, 55%, 50%, 0.8)`);
    barGrad.addColorStop(1, `hsla(50, 65%, 55%, 0.9)`);
    ctx.fillStyle = barGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillW, barH, cornerR);
    ctx.fill();
    // Shimmer effect on fill edge
    if (progress > 0 && progress < 1) {
      const shimmerX = barX + fillW - 10 * scale;
      const shimmerGrad = ctx.createLinearGradient(shimmerX, 0, shimmerX + 10 * scale, 0);
      shimmerGrad.addColorStop(0, `hsla(50, 70%, 70%, 0)`);
      shimmerGrad.addColorStop(0.5, `hsla(50, 70%, 70%, 0.3)`);
      shimmerGrad.addColorStop(1, `hsla(50, 70%, 70%, 0)`);
      ctx.fillStyle = shimmerGrad;
      ctx.fillRect(shimmerX, barY, 10 * scale, barH);
    }
    // Bar border
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, cornerR);
    ctx.stroke();
    // Percentage
    const pct = `${Math.floor(progress * 100)}%`;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${11 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(pct, barX + fillW / 2, barY + barH / 2 + 4 * scale);
    // Year markers below bar
    const years = [2019, 2020, 2021, 2022, 2023];
    for (let i = 0; i < years.length; i++) {
      const yearX = barX + (i / 4) * barW;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${years[i]}`, yearX, barY + barH + 16 * scale);
    }
    // Running fix count above bar
    const fixCount = Math.floor(progress * 1847321);
    ctx.fillStyle = PALETTE.accent.gold;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${fixCount.toLocaleString()} errors fixed`, width / 2, barY - 55 * scale);
    // "The work continues" at bottom
    const bottomAlpha = interpolate(frame, [95, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.fillText("four years of human effort", width / 2, height * 0.85);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Error to Fixed Animation: field of red blobs turning green one by one over time. Spark effects.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 27004), [width, height, scale]);
  const errorDots = useMemo(() => {
    const rand = seeded(27041);
    return Array.from({ length: 60 }, () => ({
      x: width * (0.05 + rand() * 0.9),
      y: height * (0.08 + rand() * 0.7),
      size: (2 + rand() * 3) * scale,
      fixTime: rand(), // 0-1, when it gets fixed
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const timeProgress = interpolate(frame, [5, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Year label
    const yearIdx = Math.min(4, Math.floor(timeProgress * 5));
    const years = ["2019", "2020", "2021", "2022", "2023"];
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(years[yearIdx], width * 0.95, height * 0.06 + 14 * scale);
    // Error dots
    let fixedCount = 0;
    for (const dot of errorDots) {
      const isFixed = timeProgress >= dot.fixTime;
      if (isFixed) fixedCount++;
      ctx.globalAlpha = fadeAlpha;
      if (isFixed) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.7)`;
      } else {
        const pulse = 0.5 + Math.sin(frame * 0.05 + dot.fixTime * 20) * 0.2;
        ctx.fillStyle = `hsla(0, 55%, 50%, ${pulse})`;
      }
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fill();
      // Spark effect at the moment of fixing
      const fixFrame = 5 + dot.fixTime * 100;
      const sparkDist = frame - fixFrame;
      if (sparkDist >= 0 && sparkDist < 6) {
        const sparkAlpha = 1 - sparkDist / 6;
        const sparkRadius = dot.size + sparkDist * 2 * scale;
        ctx.strokeStyle = `hsla(50, 70%, 65%, ${sparkAlpha * 0.7})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, sparkRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Fix counter
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText(`${fixedCount} / ${errorDots.length} fixed`, width * 0.05, height * 0.06 + 14 * scale);
    // Bottom label
    const bottomAlpha = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bottomAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * bottomAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("red to green, four years", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Click and Correct: cursor clicks on a red blob, flash, turns green. Repeating, accelerating.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 27005), [width, height, scale]);
  const targets = useMemo(() => {
    const rand = seeded(27051);
    return Array.from({ length: 12 }, (_, i) => ({
      x: width * (0.12 + rand() * 0.76),
      y: height * (0.12 + rand() * 0.6),
      size: (3 + rand() * 4) * scale,
      fixFrame: 10 + i * 8, // Gets faster toward the end
    }));
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    // Year counter
    const yearProgress = interpolate(frame, [10, 105], [2019, 2023], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(yearProgress)}`, width / 2, height * 0.08 + 10 * scale);
    // Draw targets
    let fixedCount = 0;
    for (const target of targets) {
      const isFixed = frame >= target.fixFrame + 4;
      if (isFixed) fixedCount++;
      ctx.globalAlpha = fadeAlpha * 0.8;
      if (isFixed) {
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.75)`;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fill();
        drawCheck(ctx, target.x, target.y, target.size * 1.8, PALETTE.accent.green);
      } else {
        const pulse = 0.6 + Math.sin(frame * 0.06 + target.fixFrame) * 0.2;
        ctx.fillStyle = `hsla(0, 55%, 50%, ${pulse})`;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Flash at fix moment
      const flashDist = frame - target.fixFrame;
      if (flashDist >= 0 && flashDist < 5) {
        const flashAlpha = 1 - flashDist / 5;
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cursor hopping between targets
    let cursorTarget = targets[0];
    for (const target of targets) {
      if (frame >= target.fixFrame - 4 && frame <= target.fixFrame + 4) {
        cursorTarget = target;
        break;
      }
      if (frame < target.fixFrame) {
        cursorTarget = target;
        break;
      }
    }
    ctx.globalAlpha = fadeAlpha;
    drawCursor(ctx, cursorTarget.x - 5 * scale, cursorTarget.y - 8 * scale, 12 * scale, PALETTE.accent.gold);
    // Fix counter bottom
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${fixedCount} corrected`, width / 2, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Year Counter with Fixes: large year in center, fix count grows dramatically.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 27006), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const yearProgress = interpolate(frame, [8, 100], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const yearIdx = Math.min(4, Math.floor(yearProgress));
    const years = [2019, 2020, 2021, 2022, 2023];
    const fixCounts = [0, 124891, 567234, 1203445, 1847321];
    const withinYear = yearProgress - yearIdx;
    const currentFixes = Math.floor(
      fixCounts[yearIdx] + (fixCounts[Math.min(4, yearIdx + 1)] - fixCounts[yearIdx]) * Math.min(1, withinYear)
    );
    // Large year number
    const yearAppear = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (yearAppear > 0) {
      ctx.globalAlpha = fadeAlpha * yearAppear;
      // Year with transition effect
      const yearScale = 1 + (withinYear > 0.85 ? (withinYear - 0.85) * 3 : 0) * 0.1;
      ctx.save();
      ctx.translate(width / 2, height * 0.35);
      ctx.scale(yearScale, yearScale);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${48 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${years[yearIdx]}`, 0, 0);
      ctx.restore();
    }
    // Fix count below year
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${18 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(currentFixes.toLocaleString(), width / 2, height * 0.55);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.fillText("corrections made", width / 2, height * 0.62);
    // Progress dots at bottom (5 dots for 5 years)
    for (let i = 0; i < 5; i++) {
      const dotX = width / 2 + (i - 2) * 18 * scale;
      const dotY = height * 0.75;
      const isActive = i <= yearIdx;
      ctx.fillStyle = isActive
        ? `hsla(${PALETTE.cellColors[i % 8][0]}, 55%, 60%, 0.8)`
        : `hsla(220, 20%, 30%, 0.4)`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, (isActive ? 5 : 3) * scale, 0, Math.PI * 2);
      ctx.fill();
      if (isActive) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${years[i]}`, dotX, dotY + 12 * scale);
      }
    }
    // Final message
    const finalAlpha = interpolate(frame, [100, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (finalAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * finalAlpha;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("four years of dedication", width / 2, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Horizontal Timeline with Milestones: 5 milestone markers with event labels and icons.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 27007), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const lineY = height * 0.5;
    const lineX = width * 0.08;
    const lineW = width * 0.84;
    const milestones = [
      { year: "2019", label: "project begins", hue: 220 },
      { year: "2020", label: "500K verified", hue: 180 },
      { year: "2021", label: "1M verified", hue: 140 },
      { year: "2022", label: "first complete\nneuron map", hue: 55 },
      { year: "2023", label: "complete", hue: 25 },
    ];
    // Main timeline line
    const lineProgress = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(220, 30%, 40%, 0.5)`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX + lineW * lineProgress, lineY);
    ctx.stroke();
    // Milestones
    for (let i = 0; i < milestones.length; i++) {
      const ms = milestones[i];
      const msX = lineX + (i / 4) * lineW;
      const msProgress = interpolate(lineProgress, [i / 4 - 0.02, i / 4 + 0.05], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (msProgress <= 0) continue;
      ctx.globalAlpha = fadeAlpha * msProgress;
      // Milestone dot
      const dotRadius = 6 * scale;
      ctx.fillStyle = `hsla(${ms.hue}, 55%, 60%, 0.9)`;
      ctx.beginPath();
      ctx.arc(msX, lineY, dotRadius * msProgress, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.fillStyle = `hsla(${ms.hue}, 50%, 55%, 0.15)`;
      ctx.beginPath();
      ctx.arc(msX, lineY, dotRadius * 3, 0, Math.PI * 2);
      ctx.fill();
      // Year below
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(ms.year, msX, lineY + 22 * scale);
      // Event label above (alternating top/bottom for readability)
      const above = i % 2 === 0;
      const labelY = above ? lineY - 25 * scale : lineY + 38 * scale;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px system-ui`;
      const lines = ms.label.split("\n");
      for (let l = 0; l < lines.length; l++) {
        ctx.fillText(lines[l], msX, labelY + l * 10 * scale);
      }
      // Checkmark at each milestone
      if (msProgress > 0.5) {
        const checkY = above ? lineY - 42 * scale : lineY + 38 * scale + lines.length * 10 * scale + 5 * scale;
        drawCheck(ctx, msX, checkY, 10 * scale, `hsla(${ms.hue}, 50%, 60%, 0.7)`);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Clock Hands: clock face, hands spin 4 rotations (4 years). Counter below grows each revolution.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 27008), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width / 2;
    const centerY = height * 0.38;
    const clockRadius = 48 * scale;
    // Clock face appears
    const clockAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (clockAppear > 0) {
      ctx.globalAlpha = fadeAlpha * clockAppear;
      // Clock face
      ctx.fillStyle = `hsla(220, 20%, 12%, 0.7)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `hsla(220, 35%, 50%, 0.6)`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.arc(centerX, centerY, clockRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Hour markers
      for (let h = 0; h < 12; h++) {
        const angle = (h / 12) * Math.PI * 2 - Math.PI / 2;
        const innerR = clockRadius * 0.82;
        const outerR = clockRadius * 0.92;
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * innerR, centerY + Math.sin(angle) * innerR);
        ctx.lineTo(centerX + Math.cos(angle) * outerR, centerY + Math.sin(angle) * outerR);
        ctx.stroke();
      }
    }
    // Hand rotation: 4 full rotations over animation
    const rotations = interpolate(frame, [15, 105], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Accelerating slightly each year
    const handAngle = rotations * Math.PI * 2 - Math.PI / 2;
    if (clockAppear > 0) {
      ctx.globalAlpha = fadeAlpha;
      // Minute hand (long)
      ctx.strokeStyle = PALETTE.accent.gold;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(handAngle) * clockRadius * 0.7, centerY + Math.sin(handAngle) * clockRadius * 0.7);
      ctx.stroke();
      // Hour hand (short, slower)
      const hourAngle = rotations * Math.PI * 2 / 12 - Math.PI / 2;
      ctx.strokeStyle = PALETTE.text.primary;
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(hourAngle) * clockRadius * 0.45, centerY + Math.sin(hourAngle) * clockRadius * 0.45);
      ctx.stroke();
      // Center dot
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Year and corrections counter below
    const yearIdx = Math.min(3, Math.floor(rotations));
    const years = ["2019", "2020", "2021", "2022", "2023"];
    const fixCounts = [0, 124891, 567234, 1203445, 1847321];
    const withinYear = rotations - yearIdx;
    const currentFixes = Math.floor(fixCounts[yearIdx] + (fixCounts[Math.min(4, yearIdx + 1)] - fixCounts[yearIdx]) * Math.min(1, withinYear));
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(years[Math.min(4, yearIdx + (withinYear > 0.9 ? 1 : 0))], centerX, centerY + clockRadius + 25 * scale);
    ctx.fillStyle = PALETTE.accent.green;
    ctx.font = `bold ${12 * scale}px monospace`;
    ctx.fillText(`${currentFixes.toLocaleString()} corrections`, centerX, centerY + clockRadius + 42 * scale);
    // Revolution counter dots
    for (let r = 0; r < 4; r++) {
      const dotX = centerX + (r - 1.5) * 14 * scale;
      const dotY = height * 0.82;
      const filled = rotations > r + 1;
      ctx.fillStyle = filled ? PALETTE.accent.gold : `hsla(220, 20%, 30%, 0.4)`;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("years elapsed", centerX, height * 0.87);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Proofreading Montage: rapid sequence of cursor-click, check-appear, red->green. "4 years of this."
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(16, width, height, scale, 27009), [width, height, scale]);
  const actions = useMemo(() => {
    const rand = seeded(27091);
    // Sequence of fix actions at different positions
    return Array.from({ length: 16 }, (_, i) => ({
      x: width * (0.1 + rand() * 0.8),
      y: height * (0.1 + rand() * 0.6),
      startFrame: 5 + i * 6,
      size: (3 + rand() * 4) * scale,
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
    // Background: scattered unfixed red dots
    const rand = seeded(27092);
    for (let i = 0; i < 30; i++) {
      const dx = width * (0.05 + rand() * 0.9);
      const dy = height * (0.05 + rand() * 0.75);
      const dr = (1.5 + rand() * 2) * scale;
      ctx.globalAlpha = fadeAlpha * 0.3;
      ctx.fillStyle = `hsla(0, 40%, 40%, 0.4)`;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
    }
    // Action sequence
    let currentActionIdx = 0;
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      if (frame >= action.startFrame) currentActionIdx = i;
      const localFrame = frame - action.startFrame;
      if (localFrame < 0) continue;
      // Phase 1: cursor arrives (0-2)
      // Phase 2: click flash (2-3)
      // Phase 3: turns green + check (3-6)
      // Phase 4: settled green dot (6+)
      ctx.globalAlpha = fadeAlpha;
      if (localFrame >= 3) {
        // Green fixed dot
        ctx.fillStyle = `hsla(140, 55%, 55%, 0.75)`;
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.size, 0, Math.PI * 2);
        ctx.fill();
        // Checkmark fades in
        const checkAlpha = Math.min(1, (localFrame - 3) / 3);
        ctx.globalAlpha = fadeAlpha * checkAlpha;
        drawCheck(ctx, action.x, action.y, action.size * 1.5, PALETTE.accent.green);
      } else {
        // Red dot
        ctx.fillStyle = `hsla(0, 55%, 50%, 0.7)`;
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.size, 0, Math.PI * 2);
        ctx.fill();
      }
      // Click flash
      if (localFrame >= 1 && localFrame < 4) {
        const flashAlpha = 1 - (localFrame - 1) / 3;
        ctx.globalAlpha = fadeAlpha * flashAlpha;
        ctx.fillStyle = `hsla(50, 70%, 70%, ${flashAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(action.x, action.y, action.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cursor at current action
    if (currentActionIdx < actions.length) {
      const current = actions[currentActionIdx];
      ctx.globalAlpha = fadeAlpha;
      drawCursor(ctx, current.x - 6 * scale, current.y - 8 * scale, 12 * scale, PALETTE.accent.gold);
    }
    // "4 years of this" text appears at end
    const endTextAlpha = interpolate(frame, [95, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (endTextAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * endTextAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${13 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("4 years of this", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_027: VariantDef[] = [
  { id: "timeline-bar", label: "Timeline Bar", component: V1 },
  { id: "calendar-pages", label: "Calendar Pages", component: V2 },
  { id: "progress-bar", label: "Progress Bar", component: V3 },
  { id: "error-to-fixed", label: "Error to Fixed", component: V4 },
  { id: "click-correct", label: "Click and Correct", component: V5 },
  { id: "year-counter", label: "Year Counter", component: V6 },
  { id: "milestone-timeline", label: "Milestone Timeline", component: V7 },
  { id: "clock-hands", label: "Clock Hands", component: V8 },
  { id: "proofread-montage", label: "Proofreading Montage", component: V9 },
];
