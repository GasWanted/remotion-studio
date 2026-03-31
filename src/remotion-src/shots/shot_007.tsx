import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";

// Shot 07 — "Smaller than a poppy seed."
// 90 frames (3s). Poppy seed vs fly brain size comparison.

// Helper: draw a textured poppy seed (dark sphere with speckles)
function drawPoppySeed(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rand: () => number) {
  // Dark base
  const grad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.25, 0, cx, cy, radius);
  grad.addColorStop(0, `hsla(30, 20%, 30%, 0.9)`);
  grad.addColorStop(0.6, `hsla(25, 15%, 20%, 0.9)`);
  grad.addColorStop(1, `hsla(20, 10%, 12%, 0.9)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  // Surface texture speckles
  for (let i = 0; i < 12; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = rand() * radius * 0.7;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist * 0.85;
    ctx.fillStyle = `hsla(30, 15%, ${15 + rand() * 15}%, 0.4)`;
    ctx.beginPath();
    ctx.arc(sx, sy, radius * 0.05 + rand() * radius * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  // Highlight
  ctx.fillStyle = `hsla(40, 20%, 50%, 0.15)`;
  ctx.beginPath();
  ctx.ellipse(cx - radius * 0.2, cy - radius * 0.2, radius * 0.3, radius * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Helper: draw fly brain as a tiny glowing violet sphere
function drawTinyFlyBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
  glow.addColorStop(0, `hsla(280, 65%, 70%, 0.5)`);
  glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
  ctx.fill();
  const bodyGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
  bodyGrad.addColorStop(0, `hsla(280, 60%, 75%, 0.95)`);
  bodyGrad.addColorStop(1, `hsla(280, 55%, 55%, 0.9)`);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

/* ── V1: Side-by-Side Objects ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const seedCx = width * 0.35, seedCy = height * 0.45;
    const brainCx = width * 0.65, brainCy = height * 0.45;
    const seedRadius = 18 * scale;
    const brainRadius = 9 * scale; // Half the seed — fly brain is ~0.5mm vs ~1mm
    // Poppy seed appears
    const seedAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const seedScale = interpolate(frame, [5, 20], [0.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (seedAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * seedAlpha;
      const rand = seeded(7001);
      drawPoppySeed(ctx, seedCx, seedCy, seedRadius * seedScale, rand);
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Poppy seed", seedCx, seedCy + seedRadius + 18 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("~1.0 mm", seedCx, seedCy + seedRadius + 30 * scale);
    }
    // Fly brain appears
    const brainAlpha = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainScale = interpolate(frame, [25, 40], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * brainAlpha;
      drawTinyFlyBrain(ctx, brainCx, brainCy, brainRadius * brainScale);
      // Label
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Fly brain", brainCx, brainCy + brainRadius * 3 + 18 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("~0.5 mm", brainCx, brainCy + brainRadius * 3 + 30 * scale);
    }
    // "Smaller" text
    const textAlpha = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `italic ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("smaller than a poppy seed", width / 2, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Magnifying Glass ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.45;
    // Magnifying glass sweeps from left to right
    const glassX = interpolate(frame, [5, 50], [width * 0.15, width * 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glassY = cy - 5 * scale;
    const glassR = 35 * scale;
    // Objects at center
    const seedX = cx - 20 * scale, seedY = cy;
    const brainX = cx + 20 * scale, brainY = cy;
    // Draw objects (faint, small)
    const rand = seeded(7002);
    drawPoppySeed(ctx, seedX, seedY, 5 * scale, rand);
    drawTinyFlyBrain(ctx, brainX, brainY, 2.5 * scale);
    // Magnifying glass lens — shows enlarged view inside
    ctx.save();
    ctx.beginPath();
    ctx.arc(glassX, glassY, glassR, 0, Math.PI * 2);
    ctx.clip();
    // Darken lens area
    ctx.fillStyle = `hsla(220, 20%, 15%, 0.7)`;
    ctx.fillRect(glassX - glassR, glassY - glassR, glassR * 2, glassR * 2);
    // Enlarged poppy seed if glass is over it
    const seedDist = Math.abs(glassX - seedX);
    if (seedDist < glassR * 0.8) {
      const nearness = 1 - seedDist / (glassR * 0.8);
      drawPoppySeed(ctx, glassX - (glassX - seedX) * 0.3, glassY, 14 * scale * nearness, seeded(7012));
      if (nearness > 0.5) {
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `${7 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("poppy seed", glassX, glassY + 20 * scale);
      }
    }
    // Enlarged fly brain if glass is over it
    const brainDist = Math.abs(glassX - brainX);
    if (brainDist < glassR * 0.8) {
      const nearness = 1 - brainDist / (glassR * 0.8);
      drawTinyFlyBrain(ctx, glassX - (glassX - brainX) * 0.3, glassY, 7 * scale * nearness);
      if (nearness > 0.5) {
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `${7 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("fly brain", glassX, glassY + 14 * scale);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${6 * scale}px monospace`;
        ctx.fillText("even smaller", glassX, glassY + 22 * scale);
      }
    }
    ctx.restore();
    // Glass rim
    ctx.strokeStyle = `hsla(40, 30%, 60%, 0.6)`;
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.arc(glassX, glassY, glassR, 0, Math.PI * 2);
    ctx.stroke();
    // Handle
    ctx.strokeStyle = `hsla(40, 25%, 50%, 0.5)`;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(glassX + glassR * 0.7, glassY + glassR * 0.7);
    ctx.lineTo(glassX + glassR * 1.3, glassY + glassR * 1.3);
    ctx.stroke();
    // Labels below
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("poppy seed", seedX, cy + 20 * scale);
    ctx.fillText("fly brain", brainX, cy + 20 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Fingertip Context ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, tipY = height * 0.3;
    // Draw fingertip (simplified curved shape)
    const fingerAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * fingerAlpha;
    const fingerW = 50 * scale, fingerH = 70 * scale;
    ctx.fillStyle = `hsla(20, 30%, 55%, 0.2)`;
    ctx.beginPath();
    ctx.ellipse(cx, tipY - fingerH * 0.3, fingerW, fingerH, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = `hsla(20, 25%, 45%, 0.4)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.ellipse(cx, tipY - fingerH * 0.3, fingerW, fingerH, 0, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    // Fingerprint lines
    ctx.strokeStyle = `hsla(20, 20%, 40%, 0.15)`;
    ctx.lineWidth = 0.5 * scale;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, tipY + 5 * scale, (15 + i * 5) * scale, (3 + i * 2) * scale, 0, 0, Math.PI);
      ctx.stroke();
    }
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px system-ui`;
    ctx.textAlign = "right";
    ctx.fillText("fingertip", cx - fingerW - 5 * scale, tipY);
    // Poppy seed sitting on fingertip
    const seedAlpha = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const seedY = tipY + 12 * scale;
    const seedR = 6 * scale;
    if (seedAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * seedAlpha;
      const rand = seeded(7003);
      drawPoppySeed(ctx, cx - 8 * scale, seedY, seedR, rand);
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("poppy seed", cx + 15 * scale, seedY - 2 * scale);
    }
    // Fly brain — even smaller, next to seed
    const brainAlpha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * brainAlpha;
      const brainR = 3 * scale;
      drawTinyFlyBrain(ctx, cx + 5 * scale, seedY, brainR);
      // Arrow + label
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 0.8 * scale;
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.moveTo(cx + 15 * scale, seedY + 12 * scale);
      ctx.lineTo(cx + 6 * scale, seedY + 3 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("fly brain", cx + 16 * scale, seedY + 16 * scale);
    }
    // Bottom text
    const textAlpha = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * textAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${10 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("both barely visible to the naked eye", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Actual Scale Dots ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.42;
    // Both are just tiny dots on screen
    const dotAppear = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dotAppear > 0) {
      ctx.globalAlpha = fadeAlpha * dotAppear;
      // Poppy seed dot
      const seedR = 3.5 * scale;
      const seedX = cx - 20 * scale;
      ctx.fillStyle = `hsla(25, 20%, 25%, 0.9)`;
      ctx.beginPath();
      ctx.arc(seedX, cy, seedR * dotAppear, 0, Math.PI * 2);
      ctx.fill();
      // Fly brain dot (even smaller)
      const brainR = 1.8 * scale;
      const brainX = cx + 20 * scale;
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(brainX, cy, brainR * dotAppear, 0, Math.PI * 2);
      ctx.fill();
      // Glow around fly brain to make it visible
      const glow = ctx.createRadialGradient(brainX, cy, 0, brainX, cy, 8 * scale);
      glow.addColorStop(0, `hsla(280, 60%, 65%, 0.3)`);
      glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(brainX, cy, 8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Labels with dimension lines
    const labelAlpha = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      // Seed label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("poppy seed", cx - 20 * scale, cy + 18 * scale);
      // Brain label
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText("fly brain", cx + 20 * scale, cy + 18 * scale);
      // Dashed lines down
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 0.5 * scale;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx - 20 * scale, cy + 5 * scale);
      ctx.lineTo(cx - 20 * scale, cy + 12 * scale);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 20 * scale, cy + 3 * scale);
      ctx.lineTo(cx + 20 * scale, cy + 12 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Period comparison text
    const periodAlpha = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (periodAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * periodAlpha;
      // Draw a period
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `bold ${40 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.fillText(".", cx, height * 0.7);
      ctx.font = `${9 * scale}px system-ui`;
      ctx.fillText("both would fit on this period", cx, height * 0.74);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Size Ruler ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Horizontal ruler
    const rulerY = height * 0.5;
    const rulerLeft = width * 0.15;
    const rulerRight = width * 0.85;
    const rulerW = rulerRight - rulerLeft;
    const mmPerUnit = rulerW / 2; // 2mm total ruler length
    const rulerAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * rulerAlpha;
    // Ruler line
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(rulerLeft, rulerY);
    ctx.lineTo(rulerRight, rulerY);
    ctx.stroke();
    // Tick marks: every 0.25mm
    for (let mm = 0; mm <= 2; mm += 0.25) {
      const x = rulerLeft + mm * mmPerUnit;
      const isWhole = Math.abs(mm - Math.round(mm)) < 0.01;
      const isHalf = Math.abs((mm * 2) - Math.round(mm * 2)) < 0.01;
      const tickH = isWhole ? 10 * scale : isHalf ? 6 * scale : 3 * scale;
      ctx.beginPath();
      ctx.moveTo(x, rulerY - tickH);
      ctx.lineTo(x, rulerY + tickH);
      ctx.stroke();
      if (isWhole) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${mm}`, x, rulerY + tickH + 10 * scale);
      }
    }
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${7 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("mm", rulerRight + 12 * scale, rulerY + 3 * scale);
    // Poppy seed bar (0 to 1mm)
    const seedAlpha = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (seedAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * seedAlpha;
      const seedLeft = rulerLeft;
      const seedRight = rulerLeft + 1 * mmPerUnit;
      const seedBarY = rulerY - 28 * scale;
      const seedBarH = 12 * scale;
      ctx.fillStyle = `hsla(25, 20%, 28%, 0.6)`;
      ctx.fillRect(seedLeft, seedBarY, seedRight - seedLeft, seedBarH);
      ctx.strokeStyle = `hsla(25, 25%, 40%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(seedLeft, seedBarY, seedRight - seedLeft, seedBarH);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("poppy seed", (seedLeft + seedRight) / 2, seedBarY - 5 * scale);
      // Dimension line
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(seedLeft, seedBarY + seedBarH + 3 * scale);
      ctx.lineTo(seedRight, seedBarY + seedBarH + 3 * scale);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("~1.0 mm", (seedLeft + seedRight) / 2, seedBarY + seedBarH + 12 * scale);
    }
    // Fly brain bar (0 to 0.5mm)
    const brainAlpha = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * brainAlpha;
      const brainLeft = rulerLeft;
      const brainRight = rulerLeft + 0.5 * mmPerUnit;
      const brainBarY = rulerY + 28 * scale;
      const brainBarH = 12 * scale;
      ctx.fillStyle = `hsla(280, 50%, 50%, 0.5)`;
      ctx.fillRect(brainLeft, brainBarY, brainRight - brainLeft, brainBarH);
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.5)`;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(brainLeft, brainBarY, brainRight - brainLeft, brainBarH);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fly brain", (brainLeft + brainRight) / 2, brainBarY + brainBarH + 14 * scale);
      // Dimension line
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(brainLeft, brainBarY - 3 * scale);
      ctx.lineTo(brainRight, brainBarY - 3 * scale);
      ctx.stroke();
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px monospace`;
      ctx.fillText("~0.5 mm", (brainLeft + brainRight) / 2, brainBarY - 6 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Zoom Enhance ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.45;
    // Phase 1 (0-30): Poppy seed fills half screen
    // Phase 2 (30-60): Zoom in, structure revealed
    // Phase 3 (60-90): Fly brain shown smaller than a cell
    const zoomLevel = interpolate(frame, [25, 55], [1, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const seedBaseR = 50 * scale;
    const seedDrawR = seedBaseR * zoomLevel;
    // Seed (fills and overflows as we zoom)
    const seedAlpha = interpolate(frame, [3, 12], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * seedAlpha;
    // Seed surface detail (cell-like structures at high zoom)
    if (zoomLevel > 2) {
      const detailAlpha = interpolate(zoomLevel, [2, 4], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rand = seeded(7006);
      for (let i = 0; i < 30; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = rand() * seedDrawR * 0.8;
        const cellX = cx + Math.cos(angle) * dist;
        const cellY = cy + Math.sin(angle) * dist;
        const cellR = (5 + rand() * 8) * scale * (zoomLevel / 3);
        ctx.strokeStyle = `hsla(25, 20%, 35%, ${detailAlpha})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath();
        ctx.arc(cellX, cellY, cellR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Seed outer edge (only visible at low zoom)
    if (seedDrawR < width) {
      const rand2 = seeded(7016);
      drawPoppySeed(ctx, cx, cy, Math.min(seedDrawR, width * 0.6), rand2);
    } else {
      // At high zoom, just show the surface texture
      ctx.fillStyle = `hsla(25, 15%, 20%, 0.3)`;
      ctx.fillRect(0, 0, width, height);
    }
    // "ZOOM" indicator
    if (zoomLevel > 1.5 && zoomLevel < 5) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(`${zoomLevel.toFixed(0)}x`, width * 0.92, height * 0.08);
    }
    // Fly brain revealed at max zoom
    const flyReveal = interpolate(frame, [55, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyReveal > 0) {
      ctx.globalAlpha = fadeAlpha * flyReveal;
      const flyR = 4 * scale;
      drawTinyFlyBrain(ctx, cx, cy, flyR);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fly brain", cx, cy + flyR * 4 + 5 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.fillText("smaller than a single seed cell", cx, cy + flyR * 4 + 16 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Comparison Stack ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const items = useMemo(() => [
    { label: "Golf ball", size: 30 * scale, color: `hsla(120, 20%, 65%, 0.6)` },
    { label: "Marble", size: 20 * scale, color: `hsla(200, 50%, 55%, 0.6)` },
    { label: "Pea", size: 12 * scale, color: `hsla(130, 45%, 50%, 0.6)` },
    { label: "Grain of rice", size: 6 * scale, color: `hsla(40, 30%, 65%, 0.6)` },
    { label: "Poppy seed", size: 3.5 * scale, color: `hsla(25, 20%, 30%, 0.8)` },
    { label: "FLY BRAIN", size: 1.8 * scale, color: `hsla(280, 60%, 65%, 0.9)` },
  ], [scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const startY = height * 0.1;
    const rowH = height * 0.13;
    const centerX = width * 0.4;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const delay = i * 8;
      const itemAlpha = interpolate(frame, [5 + delay, 15 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (itemAlpha <= 0) continue;
      const y = startY + i * rowH + rowH / 2;
      const isFlyBrain = i === items.length - 1;
      ctx.globalAlpha = fadeAlpha * itemAlpha;
      // Circle
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(centerX, y, item.size, 0, Math.PI * 2);
      ctx.fill();
      // Glow for fly brain
      if (isFlyBrain) {
        const glow = ctx.createRadialGradient(centerX, y, 0, centerX, y, 10 * scale);
        glow.addColorStop(0, `hsla(280, 60%, 65%, 0.4)`);
        glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX, y, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
        // Highlight box
        ctx.strokeStyle = PALETTE.text.accent;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([3 * scale, 2 * scale]);
        ctx.strokeRect(centerX - 15 * scale, y - 12 * scale, 30 * scale, 24 * scale);
        ctx.setLineDash([]);
      }
      // Label
      ctx.fillStyle = isFlyBrain ? PALETTE.text.accent : PALETTE.text.dim;
      ctx.font = isFlyBrain ? `bold ${9 * scale}px system-ui` : `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText(item.label, centerX + item.size + 12 * scale, y + 3 * scale);
      // Dashed line connecting circle to label
      ctx.strokeStyle = `rgba(255,255,255,0.1)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(centerX + item.size + 2, y);
      ctx.lineTo(centerX + item.size + 10 * scale, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Scale Circles ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(15, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.43;
    // Outer circle = poppy seed (grows in)
    const outerGrow = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const outerR = 50 * scale * outerGrow;
    if (outerGrow > 0) {
      ctx.strokeStyle = `hsla(25, 25%, 40%, 0.6)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `hsla(25, 20%, 25%, 0.12)`;
      ctx.fill();
      // Label
      if (outerGrow > 0.7) {
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `${9 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("Poppy seed", cx, cy - outerR - 8 * scale);
        // Dimension line
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + outerR + 5 * scale, cy - outerR);
        ctx.lineTo(cx + outerR + 5 * scale, cy + outerR);
        ctx.stroke();
        // End caps
        ctx.beginPath();
        ctx.moveTo(cx + outerR + 2 * scale, cy - outerR);
        ctx.lineTo(cx + outerR + 8 * scale, cy - outerR);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + outerR + 2 * scale, cy + outerR);
        ctx.lineTo(cx + outerR + 8 * scale, cy + outerR);
        ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "left";
        ctx.fillText("~1 mm", cx + outerR + 10 * scale, cy + 3 * scale);
      }
    }
    // Inner circle = fly brain (delayed, half the radius)
    const innerGrow = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const innerR = 25 * scale * innerGrow;
    if (innerGrow > 0) {
      ctx.strokeStyle = `hsla(280, 55%, 60%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `hsla(280, 50%, 50%, 0.1)`;
      ctx.fill();
      // Label
      if (innerGrow > 0.7) {
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${9 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("Fly brain", cx, cy + innerR + 14 * scale);
        // Dimension line (left)
        ctx.strokeStyle = PALETTE.text.accent;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - outerR - 5 * scale, cy - innerR);
        ctx.lineTo(cx - outerR - 5 * scale, cy + innerR);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - outerR - 8 * scale, cy - innerR);
        ctx.lineTo(cx - outerR - 2 * scale, cy - innerR);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - outerR - 8 * scale, cy + innerR);
        ctx.lineTo(cx - outerR - 2 * scale, cy + innerR);
        ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText("~0.5 mm", cx - outerR - 10 * scale, cy + 3 * scale);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Nature Photo Style ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(7009);
    const seeds: { x: number; y: number; r: number; rot: number }[] = [];
    for (let i = 0; i < 15; i++) {
      seeds.push({
        x: width * (0.15 + rand() * 0.7),
        y: height * (0.2 + rand() * 0.45),
        r: (4 + rand() * 4) * scale,
        rot: rand() * Math.PI,
      });
    }
    return { seeds };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    // Darker background for macro photo feel
    ctx.fillStyle = "#0d0a10";
    ctx.fillRect(0, 0, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Scattered poppy seeds appear
    const seedsVisible = interpolate(frame, [3, 30], [0, data.seeds.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(seedsVisible); i++) {
      const seed = data.seeds[i];
      const seedAlpha = interpolate(seedsVisible - i, [0, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * seedAlpha;
      ctx.save();
      ctx.translate(seed.x, seed.y);
      ctx.rotate(seed.rot);
      const rand = seeded(7009 + i * 100);
      drawPoppySeed(ctx, 0, 0, seed.r, rand);
      ctx.restore();
    }
    // Label one seed
    const labelAlpha = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0 && data.seeds.length > 3) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      const labeled = data.seeds[3];
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 0.5 * scale;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(labeled.x + labeled.r + 2, labeled.y);
      ctx.lineTo(labeled.x + 25 * scale, labeled.y - 10 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("poppy seed", labeled.x + 26 * scale, labeled.y - 12 * scale);
    }
    // Tiny glowing dot next to one seed = fly brain
    const brainAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainAlpha > 0 && data.seeds.length > 6) {
      ctx.globalAlpha = fadeAlpha * brainAlpha;
      const nearSeed = data.seeds[6];
      const brainX = nearSeed.x + nearSeed.r + 5 * scale;
      const brainY = nearSeed.y;
      drawTinyFlyBrain(ctx, brainX, brainY, 1.5 * scale);
      // Label with arrow
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 0.8 * scale;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(brainX + 12 * scale, brainY + 10 * scale);
      ctx.lineTo(brainX + 2 * scale, brainY + 1 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${7 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("fly brain", brainX + 13 * scale, brainY + 13 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${6 * scale}px system-ui`;
      ctx.fillText("almost invisible", brainX + 13 * scale, brainY + 22 * scale);
    }
    // Bottom caption (photo-style)
    const capAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * capAlpha;
    ctx.fillStyle = `rgba(255,255,255,0.08)`;
    ctx.fillRect(0, height * 0.88, width, height * 0.12);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `italic ${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("Macro view. The fly brain is the faint glow beside the seed.", width / 2, height * 0.94);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_007: VariantDef[] = [
  { id: "side-by-side", label: "Side-by-Side Objects", component: V1 },
  { id: "magnifying-glass", label: "Magnifying Glass", component: V2 },
  { id: "fingertip-context", label: "Fingertip Context", component: V3 },
  { id: "actual-scale", label: "Actual Scale Dots", component: V4 },
  { id: "size-ruler", label: "Size Ruler", component: V5 },
  { id: "zoom-enhance", label: "Zoom Enhance", component: V6 },
  { id: "comparison-stack", label: "Comparison Stack", component: V7 },
  { id: "scale-circles", label: "Scale Circles", component: V8 },
  { id: "nature-photo", label: "Nature Photo Style", component: V9 },
];
