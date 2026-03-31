import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 014 — "You can't shoot it through a whole brain. So first they preserved the brain in chemicals"
// 9 variants — brain being immersed in chemical solution, preservation process (DUR=120)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Chemical Fixation");
    const cx = width / 2, cy = height / 2;
    // Container (beaker)
    const grow = staggerRaw(frame, 0, 1, 20);
    const bw = 60 * s, bh = 70 * s;
    drawPanel(ctx, cx - bw / 2, cy - bh / 3, bw, bh * grow, 0, fo);
    // Liquid level rising
    const fill = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = accent(0, fo * 0.15);
    const liquidH = bh * grow * fill;
    ctx.fillRect(cx - bw / 2 + 1, cy - bh / 3 + bh * grow - liquidH, bw - 2, liquidH);
    // Brain outline (ellipse) inside container
    const ba = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNodeGradient(ctx, cx, cy + 5 * s, 16 * s * ba, 0, fo * 0.8);
    // Small bumps for brain folds
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      drawNodeDormant(ctx, cx + Math.cos(a) * 10 * s * ba, cy + 5 * s + Math.sin(a) * 8 * s * ba, 4 * s, fo * 0.4 * ba);
    }
    // Floating molecules
    const rng = seeded(1401);
    for (let i = 0; i < 8; i++) {
      const mx = cx + (rng() - 0.5) * 50 * s;
      const my = cy + rng() * 30 * s + Math.sin(frame * 0.05 + i) * 5 * s;
      const ma = stagger(frame, i + 3, 5, 10);
      drawNode(ctx, mx, my, 2.5 * s * ma, 1, fo * fill * 0.7);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Brain descending into liquid
    const drop = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const brainY = lerp(cy - 40 * s, cy + 10 * s, drop);
    // Liquid pool at bottom
    ctx.fillStyle = accent(0, fo * 0.12);
    ctx.beginPath();
    ctx.ellipse(cx, cy + 25 * s, 55 * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    // Brain
    drawNodeGradient(ctx, cx, brainY, 14 * s, 0, fo);
    // Ripple effect when immersed
    if (drop > 0.7) {
      const ripple = (drop - 0.7) / 0.3;
      ctx.strokeStyle = accent(0, fo * 0.3 * (1 - ripple));
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 25 * s, (20 + ripple * 35) * s, (6 + ripple * 10) * s, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // "preserve" label
    const la = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("fixation", cx, cy + 50 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const molecules = useMemo(() => {
    const rng = seeded(1403);
    return Array.from({ length: 20 }, () => ({
      x: (rng() - 0.5) * 120 * s, y: (rng() - 0.5) * 80 * s,
      r: 1.5 + rng() * 2, speed: 0.02 + rng() * 0.04, phase: rng() * Math.PI * 2,
    }));
  }, [s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Brain in center
    drawNodeGradient(ctx, cx, cy, 18 * s, 0, fo * 0.7);
    // Molecules converging toward brain
    const converge = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < molecules.length; i++) {
      const m = molecules[i];
      const orbit = Math.sin(frame * m.speed + m.phase) * 8 * s;
      const mx = cx + m.x * (1 - converge * 0.6) + orbit;
      const my = cy + m.y * (1 - converge * 0.6);
      drawNode(ctx, mx, my, m.r * s, i % 2, fo * 0.7);
    }
    // Arrows inward
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const sa = stagger(frame, i, 8, 12);
      const r1 = 50 * s, r2 = 25 * s;
      drawEdge(ctx, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1,
        cx + Math.cos(a) * r2, cy + Math.sin(a) * r2, 1, fo * sa * 0.4, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Step 1: Brain appears
    const step1 = stagger(frame, 0, 1, 15);
    drawNodeGradient(ctx, cx - 40 * s, cy, 12 * s * step1, 0, fo);
    // Arrow
    const step2 = stagger(frame, 8, 1, 12);
    drawEdgeGlow(ctx, cx - 20 * s, cy, cx + 15 * s, cy, 0, fo * step2 * 0.5, s);
    // Step 2: Jar with liquid
    const step3 = stagger(frame, 15, 1, 15);
    drawPanel(ctx, cx + 20 * s, cy - 20 * s * step3, 40 * s, 40 * s * step3, 0, fo * step3);
    // Brain inside jar
    if (step3 > 0.5) {
      drawNodeGradient(ctx, cx + 40 * s, cy, 8 * s, 0, fo * 0.6);
      // Liquid fill
      ctx.fillStyle = accent(0, fo * 0.1 * step3);
      ctx.fillRect(cx + 21 * s, cy - 5 * s, 38 * s, 20 * s * step3);
    }
    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.globalAlpha = fo * step1;
    ctx.fillText("brain", cx - 40 * s, cy + 22 * s);
    ctx.globalAlpha = fo * step3;
    ctx.fillText("fixative", cx + 40 * s, cy + 28 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Jar outline
    ctx.strokeStyle = accent(0, fo * 0.4);
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 30 * s, cy - 30 * s);
    ctx.lineTo(cx - 30 * s, cy + 30 * s);
    ctx.lineTo(cx + 30 * s, cy + 30 * s);
    ctx.lineTo(cx + 30 * s, cy - 30 * s);
    ctx.stroke();
    // Filling animation — liquid rises
    const fill = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const liquidH = 60 * s * fill;
    ctx.fillStyle = accent(0, fo * 0.08);
    ctx.fillRect(cx - 29 * s, cy + 30 * s - liquidH, 58 * s, liquidH);
    // Wave on top
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    for (let x = -28; x <= 28; x += 2) {
      const wx = cx + x * s;
      const wy = cy + 30 * s - liquidH + Math.sin(x * 0.15 + frame * 0.1) * 2 * s;
      if (x === -28) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
    // Brain (fly outline) in center
    const ba = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFlyOutline(ctx, cx, cy - 5 * s, 30 * s * ba, fo * 0.5);
    // Bubbles rising from brain
    const rng = seeded(1405);
    for (let i = 0; i < 5; i++) {
      const bx = cx + (rng() - 0.5) * 30 * s;
      const by = cy - (frame * 0.5 + i * 15) % (50 * s);
      if (fill > 0.3) drawNode(ctx, bx, by, 2 * s, 0, fo * 0.3);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Progress bar for fixation process
    const progress = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPanel(ctx, cx - 50 * s, cy + 25 * s, 100 * s, 8 * s, 0, fo * 0.5);
    ctx.fillStyle = accent(0, fo * 0.6);
    ctx.fillRect(cx - 49 * s, cy + 26 * s, 98 * s * progress, 6 * s);
    // Brain that transitions from soft (orange glow) to fixed (blue solid)
    const colorShift = progress;
    drawNodeGradient(ctx, cx, cy - 5 * s, 20 * s, colorShift > 0.5 ? 0 : 1, fo);
    // Molecule ring around brain
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + frame * 0.02;
      const mr = (35 - progress * 10) * s;
      const ma = stagger(frame, i, 3, 10);
      drawNode(ctx, cx + Math.cos(a) * mr, cy - 5 * s + Math.sin(a) * mr, 2.5 * s * ma, 1, fo * 0.6);
    }
    // Label
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(progress * 100)}%`, cx, cy + 42 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Three-step timeline: brain -> chemicals -> preserved
    const steps = ["brain", "chemicals", "preserved"];
    for (let i = 0; i < 3; i++) {
      const sx = cx + (i - 1) * 55 * s;
      const sa = stagger(frame, i, 12, 12);
      drawNode(ctx, sx, cy - 5 * s, 10 * s * sa, i === 1 ? 1 : 0, fo);
      ctx.fillStyle = C.textDim;
      ctx.font = `500 ${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.globalAlpha = fo * sa;
      ctx.fillText(steps[i], sx, cy + 15 * s);
      ctx.globalAlpha = fo;
      // Connecting arrows
      if (i < 2) {
        const ea = stagger(frame, i + 1, 12, 8);
        drawEdgeGlow(ctx, sx + 12 * s, cy - 5 * s, sx + 43 * s, cy - 5 * s, i === 0 ? 0 : 1, fo * ea * 0.5, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Dropper above brain
    const dropFrame = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Dropper shape
    ctx.strokeStyle = accent(0, fo * 0.6);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 45 * s);
    ctx.lineTo(cx - 3 * s, cy - 25 * s);
    ctx.lineTo(cx, cy - 20 * s);
    ctx.lineTo(cx + 3 * s, cy - 25 * s);
    ctx.lineTo(cx + 3 * s, cy - 45 * s);
    ctx.stroke();
    // Drop falling
    if (dropFrame > 0) {
      const dropY = lerp(cy - 20 * s, cy - 5 * s, dropFrame);
      drawNode(ctx, cx, dropY, 3 * s, 0, fo * (1 - dropFrame * 0.5));
    }
    // Brain at bottom
    const ba = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNodeGradient(ctx, cx, cy + 10 * s, 16 * s * ba, 0, fo);
    // Absorption rings spreading from impact
    if (dropFrame > 0.8) {
      for (let r = 0; r < 3; r++) {
        const rp = interpolate(frame, [45 + r * 8, 70 + r * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.strokeStyle = accent(0, fo * 0.3 * (1 - rp));
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 10 * s, (18 + rp * 25) * s, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Cross-section view of brain being fixed
    // Outer ring (before fixation — orange/warm)
    const grow = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(1, fo * 0.5 * grow);
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 35 * s * grow, 0, Math.PI * 2);
    ctx.stroke();
    // Fixation wave moving inward
    const fix = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fixR = 35 * s * (1 - fix);
    // Fixed area (blue) growing from outside in
    ctx.fillStyle = accent(0, fo * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, 35 * s, 0, Math.PI * 2);
    ctx.fill();
    // Unfixed core shrinking
    ctx.fillStyle = accent(1, fo * 0.1);
    ctx.beginPath();
    ctx.arc(cx, cy, fixR, 0, Math.PI * 2);
    ctx.fill();
    // Inner dots (neurons being fixed)
    const rng = seeded(1409);
    for (let i = 0; i < 12; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * 30 * s;
      const fixed = r > fixR;
      drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2.5 * s, fixed ? 0 : 1, fo * 0.6);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_014: VariantDef[] = [
  { id: "014-beaker-fill", label: "Beaker filling with fixative", component: V1 },
  { id: "014-brain-descend", label: "Brain descending into liquid", component: V2 },
  { id: "014-molecules-converge", label: "Molecules converging on brain", component: V3 },
  { id: "014-step-diagram", label: "Brain to jar step diagram", component: V4 },
  { id: "014-jar-fill-wave", label: "Jar with rising liquid wave", component: V5 },
  { id: "014-progress-fixation", label: "Fixation progress bar", component: V6 },
  { id: "014-three-step-timeline", label: "Three-step preservation", component: V7 },
  { id: "014-dropper-absorption", label: "Dropper and absorption rings", component: V8 },
  { id: "014-cross-section-wave", label: "Fixation wave cross-section", component: V9 },
];
