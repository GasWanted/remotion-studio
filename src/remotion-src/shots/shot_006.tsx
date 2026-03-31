import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawFlySide } from "../icons";

// Shot 06 — "Not a human brain. A fruit fly brain."
// 90 frames (3s). Scale comparison: human brain large, fly brain tiny.

// Helper: draw a simple human brain outline
function drawHumanBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, lineWidth: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  // Left hemisphere
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.12, cy, size * 0.38, size * 0.44, -0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Right hemisphere
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.12, cy, size * 0.38, size * 0.44, 0.05, 0, Math.PI * 2);
  ctx.stroke();
  // Sulci lines
  ctx.lineWidth = lineWidth * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, cy - size * 0.3);
  ctx.quadraticCurveTo(cx - size * 0.3, cy, cx - size * 0.15, cy + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.2, cy - size * 0.25);
  ctx.quadraticCurveTo(cx + size * 0.3, cy + size * 0.05, cx + size * 0.1, cy + size * 0.3);
  ctx.stroke();
  // Cerebellum
  ctx.beginPath();
  ctx.ellipse(cx, cy + size * 0.38, size * 0.18, size * 0.1, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// Helper: draw a tiny fly brain shape
function drawFlyBrain(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx - size * 0.18, cy, size * 0.32, size * 0.4, -0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + size * 0.18, cy, size * 0.32, size * 0.4, 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Glow
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.6);
  glow.addColorStop(0, `hsla(280, 60%, 65%, 0.3)`);
  glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
}

/* ── V1: Side-by-Side Scale ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Human brain (left, large) appears first
    const humanAlpha = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanSize = width * 0.2;
    const humanCx = width * 0.32, humanCy = height * 0.45;
    if (humanAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * humanAlpha;
      drawHumanBrain(ctx, humanCx, humanCy, humanSize, `hsla(220, 40%, 55%, 0.7)`, 1.5 * scale);
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Human", humanCx, humanCy + humanSize * 0.55 + 14 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("86,000,000,000 neurons", humanCx, humanCy + humanSize * 0.55 + 26 * scale);
    }
    // Fly brain (right, tiny) appears with delay
    const flyAlpha = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flySize = width * 0.015;
    const flyCx = width * 0.68, flyCy = height * 0.45;
    if (flyAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flyAlpha;
      drawFlyBrain(ctx, flyCx, flyCy, flySize, `hsla(280, 55%, 60%, 0.8)`);
      // Arrow pointing to the dot
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 1.2 * scale;
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.beginPath();
      ctx.moveTo(flyCx + 20 * scale, flyCy - 15 * scale);
      ctx.lineTo(flyCx + 3 * scale, flyCy - 2 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      ctx.fillStyle = PALETTE.text.accent;
      ctx.beginPath();
      ctx.moveTo(flyCx + 3 * scale, flyCy - 2 * scale);
      ctx.lineTo(flyCx + 7 * scale, flyCy - 6 * scale);
      ctx.lineTo(flyCx + 6 * scale, flyCy + 1 * scale);
      ctx.closePath();
      ctx.fill();
      // Label
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Fruit fly", flyCx + 25 * scale, flyCy - 18 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("138,639 neurons", flyCx + 25 * scale, flyCy - 6 * scale);
    }
    // Dividing line
    const lineAlpha = interpolate(frame, [15, 30], [0, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * lineAlpha;
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 0.8 * scale;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(width / 2, height * 0.2);
    ctx.lineTo(width / 2, height * 0.8);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Zoom Out Reveal ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Phase 1 (0-30): Zoomed into fly brain filling the screen
    // Phase 2 (30-60): Camera pulls back, fly brain shrinks, human brain appears enormous
    const zoomLevel = interpolate(frame, [5, 55], [15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyBaseSize = width * 0.015;
    const flyCx = width * 0.7, flyCy = height * 0.65;
    const humanCx = width * 0.4, humanCy = height * 0.4;
    ctx.save();
    // Draw human brain (appears as zoom pulls back)
    const humanVis = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (humanVis > 0) {
      ctx.globalAlpha = fadeAlpha * humanVis;
      const humanSize = width * 0.25;
      drawHumanBrain(ctx, humanCx, humanCy, humanSize, `hsla(220, 35%, 50%, 0.5)`, 1.5 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Human brain", humanCx, humanCy - width * 0.25 * 0.5 - 8 * scale);
    }
    // Fly brain with zoom
    ctx.globalAlpha = fadeAlpha;
    const flyDrawSize = flyBaseSize * zoomLevel;
    drawFlyBrain(ctx, flyCx, flyCy, flyDrawSize, `hsla(280, 60%, 60%, 0.85)`);
    // Label for fly brain
    const flyLabelAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyLabelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flyLabelAlpha;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Fruit fly brain", flyCx, flyCy + flyDrawSize + 12 * scale);
      // Arrow
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.moveTo(flyCx, flyCy + flyDrawSize + 3 * scale);
      ctx.lineTo(flyCx, flyCy + 2 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    // "Not a human brain" text
    const textAlpha = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (textAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * textAlpha;
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `bold ${12 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Not a human brain.", width / 2, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Ruler Comparison ── */
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
    const rulerX = width * 0.12;
    const rulerTop = height * 0.08;
    const rulerBottom = height * 0.88;
    const rulerH = rulerBottom - rulerTop;
    // Draw ruler
    const rulerAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * rulerAlpha;
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(rulerX, rulerTop);
    ctx.lineTo(rulerX, rulerBottom);
    ctx.stroke();
    // Tick marks (every "1 cm" — 15cm total)
    for (let i = 0; i <= 15; i++) {
      const y = rulerTop + (i / 15) * rulerH;
      const tickLen = i % 5 === 0 ? 8 * scale : 4 * scale;
      ctx.beginPath();
      ctx.moveTo(rulerX - tickLen / 2, y);
      ctx.lineTo(rulerX + tickLen / 2, y);
      ctx.stroke();
      if (i % 5 === 0) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${6 * scale}px monospace`;
        ctx.textAlign = "right";
        ctx.fillText(`${i} cm`, rulerX - 6 * scale, y + 2 * scale);
      }
    }
    // Human brain silhouette (fills ~14cm of ruler, ~93% of height)
    const humanAlpha = interpolate(frame, [12, 28], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (humanAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * humanAlpha;
      const brainTop = rulerTop + rulerH * 0.02;
      const brainH = rulerH * 0.93;
      const brainW = width * 0.22;
      const brainCx = width * 0.38;
      drawHumanBrain(ctx, brainCx, brainTop + brainH / 2, brainH * 0.48, `hsla(220, 40%, 55%, 0.6)`, 1.5 * scale);
      // Dimension line
      ctx.strokeStyle = `hsla(220, 40%, 60%, 0.4)`;
      ctx.setLineDash([3 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.moveTo(brainCx + brainW * 0.6, brainTop);
      ctx.lineTo(brainCx + brainW * 0.6, brainTop + brainH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = `hsla(220, 40%, 65%, 0.8)`;
      ctx.font = `${8 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("~14 cm", brainCx + brainW * 0.65, brainTop + brainH / 2);
      ctx.fillText("Human", brainCx - brainW * 0.1, brainTop - 8 * scale);
    }
    // Fly brain — a speck near bottom
    const flyAlpha = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flyAlpha;
      const flyY = rulerBottom - rulerH * 0.005;
      const flyCx = width * 0.7;
      const flySize = 2.5 * scale;
      drawFlyBrain(ctx, flyCx, flyY, flySize, `hsla(280, 60%, 65%, 0.9)`);
      // Arrow + label
      ctx.strokeStyle = PALETTE.text.accent;
      ctx.lineWidth = 1 * scale;
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath();
      ctx.moveTo(flyCx + 15 * scale, flyY - 15 * scale);
      ctx.lineTo(flyCx + 3 * scale, flyY - 1 * scale);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${9 * scale}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("Fruit fly", flyCx + 17 * scale, flyY - 18 * scale);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${7 * scale}px monospace`;
      ctx.fillText("~0.5 mm", flyCx + 17 * scale, flyY - 7 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Nested Circles ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.45;
    // Outer circle = human brain volume (grows in)
    const outerGrow = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const outerR = Math.min(width, height) * 0.35 * outerGrow;
    if (outerGrow > 0) {
      ctx.strokeStyle = `hsla(220, 40%, 55%, 0.4)`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();
      // Fill with subtle blue
      ctx.fillStyle = `hsla(220, 35%, 40%, 0.08)`;
      ctx.fill();
      if (outerGrow > 0.8) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${8 * scale}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("Human brain volume", cx, cy - outerR - 8 * scale);
        ctx.fillText("~1,200 cm\u00B3", cx, cy - outerR + 5 * scale);
      }
    }
    // Inner tiny circle = fly brain volume (delayed)
    const innerGrow = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const innerR = 1.8 * scale * innerGrow; // Incredibly tiny relative to outer
    if (innerGrow > 0) {
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, innerR), 0, Math.PI * 2);
      ctx.fill();
      // Glow to make visible
      const glowR = 8 * scale * innerGrow;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `hsla(280, 60%, 65%, 0.5)`);
      glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      // Arrow + label
      const labelAlpha = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (labelAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * labelAlpha;
        ctx.strokeStyle = PALETTE.text.accent;
        ctx.lineWidth = 1 * scale;
        ctx.setLineDash([2 * scale, 2 * scale]);
        ctx.beginPath();
        ctx.moveTo(cx + 20 * scale, cy + 20 * scale);
        ctx.lineTo(cx + 2, cy + 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PALETTE.text.accent;
        ctx.font = `bold ${9 * scale}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText("Fruit fly", cx + 22 * scale, cy + 18 * scale);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${7 * scale}px monospace`;
        ctx.fillText("0.002 cm\u00B3", cx + 22 * scale, cy + 30 * scale);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Silhouette Morph ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.45;
    // Phase 1 (0-30): Human brain at full size
    // Phase 2 (30-55): Dramatic shrink
    // Phase 3 (55-90): Fly appears next to tiny brain
    const shrinkProgress = interpolate(frame, [28, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const smoothShrink = shrinkProgress * shrinkProgress * (3 - 2 * shrinkProgress);
    const brainSize = interpolate(smoothShrink, [0, 1], [width * 0.25, width * 0.01], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const appearAlpha = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * appearAlpha;
    // Brain color morphs from blue (human) to violet (fly)
    const hue = interpolate(smoothShrink, [0, 1], [220, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainSize > 5) {
      drawHumanBrain(ctx, cx, cy, brainSize, `hsla(${hue}, 45%, 55%, 0.7)`, Math.max(0.5, 1.5 * scale * (brainSize / (width * 0.25))));
    } else {
      // Tiny dot
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1.5, brainSize), 0, Math.PI * 2);
      ctx.fill();
    }
    // Labels
    if (shrinkProgress < 0.1) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Human brain", cx, cy + brainSize * 0.55 + 15 * scale);
    }
    // Fly appears beside the dot
    const flyAppear = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyAppear > 0) {
      ctx.globalAlpha = fadeAlpha * flyAppear;
      drawFlySide(ctx, cx + 30 * scale, cy, 30 * scale, `hsla(280, 45%, 55%, 0.7)`);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("A fruit fly brain.", cx, cy + 35 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Weight Comparison ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Balance scale
    const pivotX = width / 2, pivotY = height * 0.35;
    const armLen = width * 0.3;
    const tiltProgress = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tiltAngle = tiltProgress * 0.3; // Tilts left (human side heavy)
    const scaleAppear = interpolate(frame, [3, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * scaleAppear;
    // Pivot
    ctx.fillStyle = PALETTE.text.dim;
    ctx.beginPath();
    ctx.moveTo(pivotX - 6 * scale, pivotY + 5 * scale);
    ctx.lineTo(pivotX + 6 * scale, pivotY + 5 * scale);
    ctx.lineTo(pivotX, pivotY - 3 * scale);
    ctx.closePath();
    ctx.fill();
    // Stand
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY + 5 * scale);
    ctx.lineTo(pivotX, pivotY + 30 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pivotX - 15 * scale, pivotY + 30 * scale);
    ctx.lineTo(pivotX + 15 * scale, pivotY + 30 * scale);
    ctx.stroke();
    // Arm (tilted)
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(-tiltAngle);
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-armLen, 0);
    ctx.lineTo(armLen, 0);
    ctx.stroke();
    // Left pan (human — heavy)
    const leftPanY = 25 * scale;
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(-armLen, 0);
    ctx.lineTo(-armLen - 10 * scale, leftPanY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-armLen, 0);
    ctx.lineTo(-armLen + 10 * scale, leftPanY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-armLen - 15 * scale, leftPanY);
    ctx.lineTo(-armLen + 15 * scale, leftPanY);
    ctx.quadraticCurveTo(-armLen, leftPanY + 8 * scale, -armLen - 15 * scale, leftPanY);
    ctx.stroke();
    // Human brain on left pan
    const humanShowAlpha = interpolate(frame, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (humanShowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * humanShowAlpha;
      drawHumanBrain(ctx, -armLen, leftPanY - 20 * scale, 22 * scale, `hsla(220, 40%, 55%, 0.7)`, 1 * scale);
    }
    // Right pan (fly — light)
    const rightPanY = leftPanY;
    ctx.globalAlpha = fadeAlpha * scaleAppear;
    ctx.strokeStyle = PALETTE.text.dim;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(armLen, 0);
    ctx.lineTo(armLen - 10 * scale, rightPanY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armLen, 0);
    ctx.lineTo(armLen + 10 * scale, rightPanY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armLen - 15 * scale, rightPanY);
    ctx.lineTo(armLen + 15 * scale, rightPanY);
    ctx.quadraticCurveTo(armLen, rightPanY + 8 * scale, armLen - 15 * scale, rightPanY);
    ctx.stroke();
    // Fly brain dot on right pan
    const flyShowAlpha = interpolate(frame, [30, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyShowAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flyShowAlpha;
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(armLen, rightPanY - 5 * scale, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Weight labels below
    const labelAlpha = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * labelAlpha;
    ctx.fillStyle = `hsla(220, 40%, 65%, 0.8)`;
    ctx.font = `bold ${16 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("1,400 g", width * 0.25, height * 0.72);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.fillText("0.001 g", width * 0.75, height * 0.72);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.fillText("human", width * 0.25, height * 0.72 + 14 * scale);
    ctx.fillText("fruit fly", width * 0.75, height * 0.72 + 14 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Population Count ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
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
    const cx = width / 2, cy = height / 2;
    // Phase 1 (0-35): Big human neuron count fills screen
    const humanFade = interpolate(frame, [3, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanExit = interpolate(frame, [35, 45], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const humanAlpha = humanFade * humanExit;
    if (humanAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * humanAlpha;
      ctx.fillStyle = `hsla(220, 40%, 60%, 0.9)`;
      ctx.font = `bold ${28 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("86,000,000,000", cx, cy);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("neurons in a human brain", cx, cy + 22 * scale);
    }
    // Phase 2 (40-90): Fly count appears, small and understated
    const flyFade = interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyFade > 0) {
      ctx.globalAlpha = fadeAlpha * flyFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${18 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("138,639", cx, cy);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.fillText("neurons in a fruit fly brain", cx, cy + 18 * scale);
      // Subtitle
      const subAlpha = interpolate(frame, [58, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (subAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * flyFade * subAlpha;
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `italic ${9 * scale}px system-ui`;
        ctx.fillText("That's the entire brain.", cx, cy + 36 * scale);
      }
    }
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Pinch Zoom ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    const cx = width / 2, cy = height * 0.45;
    // Brain shrinks from large to speck
    const shrinkProgress = interpolate(frame, [10, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = shrinkProgress * shrinkProgress;
    const brainSize = interpolate(eased, [0, 1], [width * 0.25, 3 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Draw pinch fingers
    const fingerSpread = interpolate(eased, [0, 1], [60 * scale, 8 * scale], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fingerAlpha = interpolate(frame, [5, 15], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fingerAlpha > 0 && shrinkProgress < 0.95) {
      ctx.globalAlpha = fadeAlpha * fingerAlpha;
      ctx.strokeStyle = PALETTE.text.dim;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      // Finger 1 (top-left)
      ctx.beginPath();
      ctx.moveTo(cx - fingerSpread - 10 * scale, cy - fingerSpread - 10 * scale);
      ctx.lineTo(cx - fingerSpread * 0.3, cy - fingerSpread * 0.3);
      ctx.stroke();
      // Finger 2 (bottom-right)
      ctx.beginPath();
      ctx.moveTo(cx + fingerSpread + 10 * scale, cy + fingerSpread + 10 * scale);
      ctx.lineTo(cx + fingerSpread * 0.3, cy + fingerSpread * 0.3);
      ctx.stroke();
      // Fingertip circles
      ctx.fillStyle = `rgba(255,255,255,0.15)`;
      ctx.beginPath();
      ctx.arc(cx - fingerSpread * 0.3, cy - fingerSpread * 0.3, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + fingerSpread * 0.3, cy + fingerSpread * 0.3, 4 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Brain
    ctx.globalAlpha = fadeAlpha;
    if (brainSize > 8 * scale) {
      drawHumanBrain(ctx, cx, cy, brainSize, `hsla(260, 45%, 55%, 0.7)`, Math.max(0.5, 1.5 * scale * (brainSize / (width * 0.25))));
    } else {
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1.5, brainSize), 0, Math.PI * 2);
      ctx.fill();
      // Glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10 * scale);
      glow.addColorStop(0, `hsla(280, 60%, 65%, 0.4)`);
      glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Fly silhouette appears after shrink
    const flyAlpha = interpolate(frame, [58, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * flyAlpha;
      drawFlySide(ctx, cx + 25 * scale, cy + 3 * scale, 28 * scale, `hsla(280, 40%, 50%, 0.6)`);
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `${9 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fruit fly brain", cx, cy + 30 * scale);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Split Wipe ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(20, width, height, scale), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 90);
    ctx.globalAlpha = fadeAlpha;
    // Wipe divider position moves from left to center
    const wipeX = interpolate(frame, [5, 40], [0, width / 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left half: Human brain (blue tones)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, wipeX, height);
    ctx.clip();
    // Blue tinted overlay
    ctx.fillStyle = `hsla(220, 30%, 18%, 0.3)`;
    ctx.fillRect(0, 0, width, height);
    const humanCx = width * 0.25, humanCy = height * 0.45;
    drawHumanBrain(ctx, humanCx, humanCy, width * 0.15, `hsla(220, 45%, 55%, 0.7)`, 1.5 * scale);
    ctx.fillStyle = `hsla(220, 40%, 70%, 0.8)`;
    ctx.font = `bold ${11 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("Human", humanCx, height * 0.78);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px monospace`;
    ctx.fillText("86B neurons", humanCx, height * 0.78 + 13 * scale);
    ctx.restore();
    // Right half: Fly brain (warm tones)
    const rightReveal = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rightReveal > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(width / 2, 0, width / 2, height);
      ctx.clip();
      // Warm tinted overlay
      ctx.fillStyle = `hsla(280, 20%, 18%, 0.3)`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = fadeAlpha * rightReveal;
      const flyCx = width * 0.75, flyCy = height * 0.45;
      // Tiny centered dot
      ctx.fillStyle = `hsla(280, 60%, 65%, 0.9)`;
      ctx.beginPath();
      ctx.arc(flyCx, flyCy, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      const glow = ctx.createRadialGradient(flyCx, flyCy, 0, flyCx, flyCy, 12 * scale);
      glow.addColorStop(0, `hsla(280, 60%, 65%, 0.4)`);
      glow.addColorStop(1, `hsla(280, 40%, 50%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(flyCx, flyCy, 12 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("Fruit fly", flyCx, height * 0.78);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * scale}px monospace`;
      ctx.fillText("138,639 neurons", flyCx, height * 0.78 + 13 * scale);
      ctx.restore();
    }
    // Divider line
    ctx.globalAlpha = fadeAlpha;
    ctx.strokeStyle = `rgba(255,255,255,0.15)`;
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_006: VariantDef[] = [
  { id: "side-by-side", label: "Side-by-Side Scale", component: V1 },
  { id: "zoom-out-reveal", label: "Zoom Out Reveal", component: V2 },
  { id: "ruler-comparison", label: "Ruler Comparison", component: V3 },
  { id: "nested-circles", label: "Nested Circles", component: V4 },
  { id: "silhouette-morph", label: "Silhouette Morph", component: V5 },
  { id: "weight-compare", label: "Weight Comparison", component: V6 },
  { id: "population-count", label: "Population Count", component: V7 },
  { id: "pinch-zoom", label: "Pinch Zoom", component: V8 },
  { id: "split-wipe", label: "Split Wipe", component: V9 },
];
