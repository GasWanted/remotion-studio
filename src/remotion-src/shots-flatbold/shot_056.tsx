import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 56 — "Yellow spheres trigger sugar-sensing neurons. Red ones trigger neurons associated with bad smells." — 120 frames */

// ---------- V1: Yellow sphere glows, arrow to gold neurons; red sphere to dark neurons ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Yellow sphere + neurons (top half)
    const yP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    // Sphere with glow
    ctx.globalAlpha = a * yP * 0.15; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.18, H * 0.22, 20, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * yP * 0.6; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W * 0.18, H * 0.22, 14, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "sugar", W * 0.18, H * 0.36, 8, a * yP, "center", FB.gold);
    // Arrow to neurons
    const arrP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP * 0.25; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.32, H * 0.22); ctx.lineTo(W * 0.52, H * 0.22); ctx.stroke();
    ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(W * 0.52, H * 0.22); ctx.lineTo(W * 0.49, H * 0.19); ctx.lineTo(W * 0.49, H * 0.25); ctx.fill();
    // Gold neurons cluster
    const nP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) {
      drawFBNode(ctx, W * 0.6 + i * W * 0.08, H * 0.18 + (i % 2) * H * 0.08, 6, 2, a * nP, frame);
    }
    drawFBText(ctx, "sugar-sensing neurons", W * 0.75, H * 0.36, 7, a * nP, "center", FB.gold);
    // Red sphere + neurons (bottom half)
    const rP = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.15; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.18, H * 0.62, 20, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = a * rP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W * 0.18, H * 0.62, 14, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "bad smell", W * 0.18, H * 0.76, 8, a * rP, "center", FB.red);
    // Arrow
    const arrR = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrR * 0.25; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.32, H * 0.62); ctx.lineTo(W * 0.52, H * 0.62); ctx.stroke();
    ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.moveTo(W * 0.52, H * 0.62); ctx.lineTo(W * 0.49, H * 0.59); ctx.lineTo(W * 0.49, H * 0.65); ctx.fill();
    // Dark neurons
    const nR = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 4; i++) {
      drawFBNode(ctx, W * 0.6 + i * W * 0.08, H * 0.58 + (i % 2) * H * 0.08, 6, 0, a * nR, frame);
    }
    drawFBText(ctx, "smell-aversion neurons", W * 0.75, H * 0.76, 7, a * nR, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Two columns — gold column fires, red column fires ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Gold column (sugar)
    const gP = interpolate(frame, [5, 35], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * gP * 0.08; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.05, H * 0.05, W * 0.4, H * 0.85);
    drawFBText(ctx, "YELLOW", W * 0.25, H * 0.1, 12, a * gP, "center", FB.gold);
    // Gold sphere
    ctx.globalAlpha = a * gP * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W * 0.15, H * 0.3, 12, 0, Math.PI * 2); ctx.stroke();
    // Gold neurons light up
    const gnP = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const ny = H * 0.45 + i * H * 0.08;
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1 + i);
      drawFBNode(ctx, W * 0.25, ny, 5, 2, a * gnP * pulse, frame);
    }
    drawFBText(ctx, "sugar neurons", W * 0.25, H * 0.88, 7, a * gnP, "center", FB.gold);
    // Red column (smell)
    const rP = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.08; ctx.fillStyle = FB.red;
    ctx.fillRect(W * 0.55, H * 0.05, W * 0.4, H * 0.85);
    drawFBText(ctx, "RED", W * 0.75, H * 0.1, 12, a * rP, "center", FB.red);
    ctx.globalAlpha = a * rP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W * 0.65, H * 0.3, 12, 0, Math.PI * 2); ctx.stroke();
    const rnP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const ny = H * 0.45 + i * H * 0.08;
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1 + i + 2);
      drawFBNode(ctx, W * 0.75, ny, 5, 0, a * rnP * pulse, frame);
    }
    drawFBText(ctx, "smell neurons", W * 0.75, H * 0.88, 7, a * rnP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Sphere pulses, ripple reaches matching neurons ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Yellow sphere emits ripple
    const sx = W * 0.2, sy = H * 0.3;
    drawFBNode(ctx, sx, sy, 14, 2, a, frame);
    for (let i = 0; i < 3; i++) {
      const rStart = 15 + i * 14;
      const rp = interpolate(frame, [rStart, rStart + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rp <= 0) continue;
      ctx.globalAlpha = a * (1 - rp) * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(sx, sy, 16 + rp * 40, -0.5, 0.5); ctx.stroke();
    }
    // Gold neurons activate
    const gnP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      drawFBNode(ctx, W * 0.55 + i * W * 0.12, sy, 7, 2, a * gnP * (0.6 + 0.4 * Math.sin(frame * 0.12 + i)), frame);
    }
    drawFBText(ctx, "sugar neurons fire", W * 0.68, sy + 16, 7, a * gnP, "center", FB.gold);
    // Red sphere emits ripple
    const rx = W * 0.2, ry = H * 0.7;
    drawFBNode(ctx, rx, ry, 14, 0, a, frame);
    for (let i = 0; i < 3; i++) {
      const rStart = 50 + i * 14;
      const rp = interpolate(frame, [rStart, rStart + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rp <= 0) continue;
      ctx.globalAlpha = a * (1 - rp) * 0.2; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(rx, ry, 16 + rp * 40, -0.5, 0.5); ctx.stroke();
    }
    const rnP = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      drawFBNode(ctx, W * 0.55 + i * W * 0.12, ry, 7, 0, a * rnP * (0.6 + 0.4 * Math.sin(frame * 0.12 + i + 2)), frame);
    }
    drawFBText(ctx, "smell neurons fire", W * 0.68, ry + 16, 7, a * rnP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Color coding diagram — yellow=sugar, red=smell ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Yellow entry
    const yP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * yP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.2, H * 0.25, 10, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "=", W * 0.32, H * 0.25, 14, a * yP, "center", FB.text.dim);
    drawFBText(ctx, "sugar", W * 0.45, H * 0.25, 12, a * yP, "center", FB.gold);
    // Arrow to neuron type
    const yNP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * yNP * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.55, H * 0.25); ctx.lineTo(W * 0.68, H * 0.25); ctx.stroke();
    drawFBNode(ctx, W * 0.75, H * 0.25, 8, 2, a * yNP, frame);
    drawFBText(ctx, "Gr5a", W * 0.85, H * 0.25, 8, a * yNP, "left", FB.gold);
    // Red entry
    const rP = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.5; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.2, H * 0.55, 10, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "=", W * 0.32, H * 0.55, 14, a * rP, "center", FB.text.dim);
    drawFBText(ctx, "bad smell", W * 0.48, H * 0.55, 12, a * rP, "center", FB.red);
    const rNP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rNP * 0.2; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.58, H * 0.55); ctx.lineTo(W * 0.68, H * 0.55); ctx.stroke();
    drawFBNode(ctx, W * 0.75, H * 0.55, 8, 0, a * rNP, frame);
    drawFBText(ctx, "Or56a", W * 0.85, H * 0.55, 8, a * rNP, "left", FB.red);
    // Summary
    const sumP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "color triggers specific neurons", W / 2, H * 0.82, 9, a * sumP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Two spheres side by side, neural spikes below each ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Yellow sphere left
    const yP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * yP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.25, H * 0.18, 14, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "sugar", W * 0.25, H * 0.3, 9, a * yP, "center", FB.gold);
    // Spike raster below yellow
    const ySP = interpolate(frame, [25, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * ySP * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    const rng1 = seeded(5604);
    for (let i = 0; i < 20; i++) {
      const sx = W * 0.1 + rng1() * W * 0.3;
      const sy = H * 0.38 + rng1() * H * 0.18;
      if (rng1() > ySP) continue;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 8); ctx.stroke();
    }
    // Red sphere right
    const rP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.5; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.18, 14, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "bad smell", W * 0.75, H * 0.3, 9, a * rP, "center", FB.red);
    // Spike raster below red
    const rSP = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rSP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    const rng2 = seeded(5605);
    for (let i = 0; i < 20; i++) {
      const sx = W * 0.6 + rng2() * W * 0.3;
      const sy = H * 0.38 + rng2() * H * 0.18;
      if (rng2() > rSP) continue;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 8); ctx.stroke();
    }
    // "different neurons for different stimuli"
    const lP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "different neurons for different stimuli", W / 2, H * 0.72, 8, a * lP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Wiring: sphere->sensory->interneuron chain, gold vs red ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Gold chain (top)
    const gStages = [
      { x: W * 0.1, label: "yellow", r: 10 },
      { x: W * 0.35, label: "Gr5a", r: 7 },
      { x: W * 0.6, label: "sugar", r: 7 },
      { x: W * 0.85, label: "FEED", r: 8 },
    ];
    const cy1 = H * 0.25;
    for (let i = 0; i < gStages.length; i++) {
      const s = gStages[i];
      const sp = interpolate(frame, [5 + i * 12, 18 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, cy1, s.r, 2, a * sp, frame);
      drawFBText(ctx, s.label, s.x, cy1 + 16, 7, a * sp * 0.7, "center", FB.gold);
      if (i < gStages.length - 1) {
        ctx.globalAlpha = a * sp * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x + s.r + 2, cy1); ctx.lineTo(gStages[i + 1].x - gStages[i + 1].r - 2, cy1); ctx.stroke();
      }
    }
    // Red chain (bottom)
    const rStages = [
      { x: W * 0.1, label: "red", r: 10 },
      { x: W * 0.35, label: "Or56a", r: 7 },
      { x: W * 0.6, label: "aversion", r: 7 },
      { x: W * 0.85, label: "AVOID", r: 8 },
    ];
    const cy2 = H * 0.65;
    for (let i = 0; i < rStages.length; i++) {
      const s = rStages[i];
      const sp = interpolate(frame, [35 + i * 12, 48 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, cy2, s.r, 0, a * sp, frame);
      drawFBText(ctx, s.label, s.x, cy2 + 16, 7, a * sp * 0.7, "center", FB.red);
      if (i < rStages.length - 1) {
        ctx.globalAlpha = a * sp * 0.15; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x + s.r + 2, cy2); ctx.lineTo(rStages[i + 1].x - rStages[i + 1].r - 2, cy2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Flash card style — "YELLOW = sugar neurons" then "RED = smell neurons" ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Card 1 — yellow
    const c1P = interpolate(frame, [5, 25, 55, 60], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (c1P > 0) {
      ctx.globalAlpha = a * c1P * 0.08; ctx.fillStyle = FB.gold;
      ctx.fillRect(W * 0.1, H * 0.15, W * 0.8, H * 0.6);
      ctx.globalAlpha = a * c1P * 0.5; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(W * 0.3, H * 0.42, 16, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "=", W * 0.42, H * 0.42, 16, a * c1P, "center", FB.text.dim);
      drawFBText(ctx, "sugar-sensing", W * 0.62, H * 0.38, 11, a * c1P, "center", FB.gold);
      drawFBText(ctx, "neurons", W * 0.62, H * 0.48, 11, a * c1P, "center", FB.gold);
    }
    // Card 2 — red
    const c2P = interpolate(frame, [60, 80, 110, 115], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (c2P > 0) {
      ctx.globalAlpha = a * c2P * 0.08; ctx.fillStyle = FB.red;
      ctx.fillRect(W * 0.1, H * 0.15, W * 0.8, H * 0.6);
      ctx.globalAlpha = a * c2P * 0.5; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(W * 0.3, H * 0.42, 16, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "=", W * 0.42, H * 0.42, 16, a * c2P, "center", FB.text.dim);
      drawFBText(ctx, "smell-aversion", W * 0.62, H * 0.38, 11, a * c2P, "center", FB.red);
      drawFBText(ctx, "neurons", W * 0.62, H * 0.48, 11, a * c2P, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Neuron network — gold cluster lights up, then red cluster ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const rng = seeded(5607);
    // Background dim neurons
    for (let i = 0; i < 20; i++) {
      drawFBNode(ctx, W * 0.1 + rng() * W * 0.8, H * 0.08 + rng() * H * 0.7, 3, 7, a * 0.15, frame);
    }
    // Gold cluster activation
    const gP = interpolate(frame, [15, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const goldNodes = [
      { x: W * 0.2, y: H * 0.3 }, { x: W * 0.28, y: H * 0.22 },
      { x: W * 0.35, y: H * 0.35 }, { x: W * 0.25, y: H * 0.42 },
    ];
    for (const gn of goldNodes) {
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + gn.x);
      drawFBNode(ctx, gn.x, gn.y, 6, 2, a * gP * pulse, frame);
    }
    if (gP > 0.3) {
      drawFBText(ctx, "sugar", W * 0.1, H * 0.2, 9, a * gP, "center", FB.gold);
    }
    // Red cluster activation
    const rP = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const redNodes = [
      { x: W * 0.65, y: H * 0.55 }, { x: W * 0.73, y: H * 0.48 },
      { x: W * 0.8, y: H * 0.6 }, { x: W * 0.7, y: H * 0.65 },
    ];
    for (const rn of redNodes) {
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.1 + rn.x + 2);
      drawFBNode(ctx, rn.x, rn.y, 6, 0, a * rP * pulse, frame);
    }
    if (rP > 0.3) {
      drawFBText(ctx, "bad smell", W * 0.88, H * 0.5, 9, a * rP, "center", FB.red);
    }
    drawFBText(ctx, "different spheres, different neurons", W / 2, H * 0.88, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Spectrum bar — yellow end to red end, neurons mapped along it ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Gradient bar
    const barP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barX = W * 0.1, barY = H * 0.3, barW = W * 0.8, barH = H * 0.06;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, FB.gold);
    grad.addColorStop(1, FB.red);
    ctx.globalAlpha = a * barP * 0.3; ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, barW * barP, barH);
    ctx.globalAlpha = a * barP * 0.4; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
    // Labels at ends
    drawFBText(ctx, "yellow", barX, barY - 8, 8, a * barP, "center", FB.gold);
    drawFBText(ctx, "sugar", barX, barY + barH + 14, 7, a * barP, "center", FB.gold);
    drawFBText(ctx, "red", barX + barW, barY - 8, 8, a * barP, "center", FB.red);
    drawFBText(ctx, "bad smell", barX + barW, barY + barH + 14, 7, a * barP, "center", FB.red);
    // Neurons below spectrum at their positions
    const neuronP = interpolate(frame, [45, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Gold neurons near left
    for (let i = 0; i < 4; i++) {
      const nx = barX + i * W * 0.06 + W * 0.02;
      const np = interpolate(frame, [45 + i * 5, 55 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, H * 0.55, 5, 2, a * np, frame);
    }
    // Red neurons near right
    for (let i = 0; i < 4; i++) {
      const nx = barX + barW - i * W * 0.06 - W * 0.02;
      const np = interpolate(frame, [60 + i * 5, 70 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, H * 0.55, 5, 0, a * np, frame);
    }
    drawFBText(ctx, "each color triggers its own neural population", W / 2, H * 0.78, 7, a * neuronP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_056: VariantDef[] = [
  { id: "fb-056-v1", label: "Yellow sphere to gold neurons, red to dark", component: V1 },
  { id: "fb-056-v2", label: "Two columns: gold sugar, red smell", component: V2 },
  { id: "fb-056-v3", label: "Sphere ripples reach matching neurons", component: V3 },
  { id: "fb-056-v4", label: "Color coding diagram with neuron names", component: V4 },
  { id: "fb-056-v5", label: "Side-by-side spheres with spike rasters", component: V5 },
  { id: "fb-056-v6", label: "Wiring chains: sphere to sensory to output", component: V6 },
  { id: "fb-056-v7", label: "Flash cards: yellow=sugar, red=smell", component: V7 },
  { id: "fb-056-v8", label: "Network with gold and red clusters lighting", component: V8 },
  { id: "fb-056-v9", label: "Spectrum bar with neurons mapped along it", component: V9 },
];
