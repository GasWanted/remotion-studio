import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 85 — "157 connections in simulation → CRISPR/optogenetics → re-upload into living fly" — 420 frames */

// ---------- V1: Digital grid → scissors → living cell transition ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2;
    // Phase 1: Digital simulation (0-120)
    const digiP = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const digiFade = interpolate(frame, [120, 155], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (digiFade > 0) {
      // Grid of digital nodes
      const rng = seeded(8500);
      for (let i = 0; i < 8; i++) {
        const nx = W * 0.15 + rng() * W * 0.7;
        const ny = H * 0.15 + rng() * H * 0.4;
        drawFBNode(ctx, nx, ny, 3, 5, a * digiP * digiFade * 0.6, frame);
      }
      // "157" highlighted connections
      const highlightP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBCounter(ctx, "157", cx, H * 0.68, 16, FB.gold, a * highlightP * digiFade);
      drawFBText(ctx, "CONNECTIONS FOUND", cx, H * 0.78, 8, a * highlightP * digiFade, "center", FB.text.dim);
      drawFBText(ctx, "IN SIMULATION", cx, H * 0.86, 7, a * highlightP * digiFade * 0.6, "center", FB.blue);
    }
    // Phase 2: CRISPR scissors (130-260)
    const crisprP = interpolate(frame, [130, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crisprFade = interpolate(frame, [260, 290], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crisprP > 0 && crisprFade > 0) {
      // DNA double helix
      const helixX = cx;
      for (let i = 0; i < 20; i++) {
        const hy = H * 0.15 + (i / 20) * H * 0.5;
        const offset = Math.sin(i * 0.5 + frame * 0.03) * 15;
        ctx.globalAlpha = a * crisprP * crisprFade * 0.3;
        ctx.fillStyle = FB.teal;
        ctx.beginPath();
        ctx.arc(helixX + offset, hy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = FB.purple;
        ctx.beginPath();
        ctx.arc(helixX - offset, hy, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Rungs
        if (i % 3 === 0) {
          ctx.globalAlpha = a * crisprP * crisprFade * 0.15;
          ctx.strokeStyle = FB.text.dim;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(helixX + offset, hy);
          ctx.lineTo(helixX - offset, hy);
          ctx.stroke();
        }
      }
      // Scissors icon cutting at center
      const cutP = interpolate(frame, [180, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cutP > 0) {
        const scissorAngle = cutP * 0.3;
        ctx.save();
        ctx.translate(cx, H * 0.4);
        ctx.globalAlpha = a * cutP * crisprFade;
        ctx.strokeStyle = FB.gold;
        ctx.lineWidth = 2;
        // Blade 1
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -10 - scissorAngle * 15);
        ctx.stroke();
        // Blade 2
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, 10 + scissorAngle * 15);
        ctx.stroke();
        ctx.restore();
      }
      drawFBText(ctx, "CRISPR", cx, H * 0.76, 12, a * crisprP * crisprFade, "center", FB.teal);
      drawFBText(ctx, "OPTOGENETICS", cx, H * 0.86, 8, a * crisprP * crisprFade, "center", FB.purple);
    }
    // Phase 3: Living fly (280-420)
    const liveP = interpolate(frame, [280, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (liveP > 0) {
      // Living cell — pulsing organic node
      const pulse = Math.sin(frame * 0.08) * 0.1 + 0.9;
      drawFBNode(ctx, cx, H * 0.38, 18 * pulse * liveP, 3, a * liveP, frame);
      // Heartbeat-like glow
      ctx.globalAlpha = a * liveP * 0.06 * pulse;
      const glow = ctx.createRadialGradient(cx, H * 0.38, 5, cx, H * 0.38, 35);
      glow.addColorStop(0, FB.green);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(cx - 35, H * 0.38 - 35, 70, 70);
      drawFBText(ctx, "LIVING FLY", cx, H * 0.62, 12, a * liveP, "center", FB.green);
      const upP = interpolate(frame, [340, 380], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "CODE RE-UPLOADED", cx, H * 0.74, 8, a * upP, "center", FB.gold);
      drawFBText(ctx, "INTO A LIVE, BREATHING FLY", cx, H * 0.84, 7, a * upP, "center", FB.text.dim);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Three-panel left-to-right: DIGITAL → TOOLS → ALIVE ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cy = H * 0.4;
    // Panel 1: DIGITAL
    const p1 = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p1 * 0.12;
    ctx.strokeStyle = FB.blue;
    ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.02, H * 0.08, W * 0.28, H * 0.72);
    // Grid dots
    const rng = seeded(8501);
    for (let i = 0; i < 6; i++) {
      drawFBNode(ctx, W * 0.05 + rng() * W * 0.22, H * 0.15 + rng() * H * 0.5, 2.5, 5, a * p1 * 0.5, frame);
    }
    drawFBText(ctx, "DIGITAL", W * 0.16, H * 0.86, 8, a * p1, "center", FB.blue);
    drawFBCounter(ctx, "157", W * 0.16, cy + 20, 12, FB.gold, a * p1);
    // Arrow 1
    const arr1 = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arr1 * 0.4;
    ctx.strokeStyle = FB.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.32, cy);
    ctx.lineTo(W * 0.36, cy);
    ctx.stroke();
    // Arrow head
    ctx.beginPath();
    ctx.moveTo(W * 0.36, cy);
    ctx.lineTo(W * 0.35, cy - 3);
    ctx.lineTo(W * 0.35, cy + 3);
    ctx.closePath();
    ctx.fill();
    // Panel 2: CRISPR
    const p2 = interpolate(frame, [100, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p2 * 0.12;
    ctx.strokeStyle = FB.teal;
    ctx.strokeRect(W * 0.37, H * 0.08, W * 0.26, H * 0.72);
    // Scissors shape
    if (p2 > 0.3) {
      const sP = (p2 - 0.3) / 0.7;
      ctx.globalAlpha = a * sP * 0.6;
      ctx.strokeStyle = FB.teal;
      ctx.lineWidth = 2;
      const sx = W * 0.5, sy = cy - 5;
      ctx.beginPath();
      ctx.moveTo(sx - 8 * sP, sy - 10 * sP);
      ctx.lineTo(sx, sy);
      ctx.lineTo(sx - 8 * sP, sy + 10 * sP);
      ctx.stroke();
    }
    drawFBText(ctx, "CRISPR", W * 0.5, H * 0.62, 8, a * p2, "center", FB.teal);
    drawFBText(ctx, "OPTOGENETICS", W * 0.5, H * 0.72, 6, a * p2, "center", FB.purple);
    drawFBText(ctx, "TOOLS", W * 0.5, H * 0.86, 8, a * p2, "center", FB.teal);
    // Arrow 2
    const arr2 = interpolate(frame, [210, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arr2 * 0.4;
    ctx.strokeStyle = FB.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.64, cy);
    ctx.lineTo(W * 0.68, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.68, cy);
    ctx.lineTo(W * 0.67, cy - 3);
    ctx.lineTo(W * 0.67, cy + 3);
    ctx.closePath();
    ctx.fill();
    // Panel 3: ALIVE
    const p3 = interpolate(frame, [240, 330], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p3 * 0.12;
    ctx.strokeStyle = FB.green;
    ctx.strokeRect(W * 0.7, H * 0.08, W * 0.28, H * 0.72);
    // Living node with pulse
    const pulse = Math.sin(frame * 0.08) * 0.12 + 0.88;
    drawFBNode(ctx, W * 0.84, cy, 12 * pulse * p3, 3, a * p3, frame);
    drawFBText(ctx, "ALIVE", W * 0.84, H * 0.86, 8, a * p3, "center", FB.green);
    // Final text
    const endP = interpolate(frame, [360, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RE-UPLOADED", W / 2, H * 0.95, 8, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Code lines morphing into organic curves ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2;
    // Phase 1: Code lines (0-150)
    const codeP = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const codeFade = interpolate(frame, [150, 200], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(8502);
    for (let i = 0; i < 8; i++) {
      const t = Math.min(1, codeP * 8 - i);
      if (t <= 0) continue;
      const y = H * 0.1 + i * H * 0.07;
      const lineW = (12 + rng() * 30) * t;
      ctx.globalAlpha = a * t * codeFade * 0.4;
      ctx.fillStyle = FB.blue;
      ctx.fillRect(cx - 35, y, lineW, 2);
    }
    if (codeFade > 0) {
      drawFBText(ctx, "w[i,j] -= lr * spike[i]", cx, H * 0.75, 7, a * codeP * codeFade * 0.5, "center", FB.blue);
      drawFBText(ctx, "SIMULATION", cx, H * 0.86, 10, a * codeP * codeFade, "center", FB.blue);
    }
    // Phase 2: Morphing transition (180-260)
    const morphP = interpolate(frame, [180, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (morphP > 0 && morphP < 1) {
      // Transition particles
      for (let i = 0; i < 12; i++) {
        const px = cx + Math.cos(i * 0.52 + frame * 0.02) * 25 * morphP;
        const py = H * 0.4 + Math.sin(i * 0.73 + frame * 0.03) * 15;
        ctx.globalAlpha = a * morphP * (1 - morphP) * 0.4;
        ctx.fillStyle = i % 2 === 0 ? FB.teal : FB.gold;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      drawFBText(ctx, "CRISPR + OPTOGENETICS", cx, H * 0.7, 8, a * morphP * (1 - morphP) * 4, "center", FB.teal);
    }
    // Phase 3: Organic curves (260-420)
    const orgP = interpolate(frame, [260, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (orgP > 0) {
      // Organic wavy lines replacing code
      for (let i = 0; i < 6; i++) {
        const y = H * 0.15 + i * H * 0.08;
        ctx.globalAlpha = a * orgP * 0.3;
        ctx.strokeStyle = FB.green;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let px = 0; px < W * 0.5; px += 2) {
          const wave = Math.sin(px * 0.08 + i * 2 + frame * 0.04) * 4;
          px === 0 ? ctx.moveTo(cx - W * 0.25 + px, y + wave) : ctx.lineTo(cx - W * 0.25 + px, y + wave);
        }
        ctx.stroke();
      }
      drawFBText(ctx, "LIVING TISSUE", cx, H * 0.72, 10, a * orgP, "center", FB.green);
      const upP = interpolate(frame, [350, 390], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "CODE BECOMES BIOLOGY", cx, H * 0.85, 8, a * upP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: "157" number journeying from screen to cell ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2, cy = H * 0.4;
    // Monitor screen on left
    const monP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * monP * 0.3;
    ctx.strokeStyle = FB.blue;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W * 0.05, cy - 15, W * 0.2, 30);
    ctx.fillStyle = FB.blue;
    ctx.fillRect(W * 0.12, cy + 15, W * 0.06, 5);
    drawFBCounter(ctx, "157", W * 0.15, cy, 10, FB.gold, a * monP);
    // Number traveling across
    const travelP = interpolate(frame, [80, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const numX = W * 0.15 + travelP * W * 0.65;
    const numY = cy + Math.sin(travelP * Math.PI) * -H * 0.15;
    if (travelP > 0 && travelP < 1) {
      drawFBCounter(ctx, "157", numX, numY, 12, FB.gold, a);
      // Trail
      for (let i = 0; i < 5; i++) {
        const trailX = numX - i * 6;
        ctx.globalAlpha = a * (0.3 - i * 0.05);
        ctx.fillStyle = FB.gold;
        ctx.beginPath();
        ctx.arc(trailX, numY, 2 - i * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // CRISPR label midway
    if (travelP > 0.3 && travelP < 0.7) {
      const midA = 1 - Math.abs(travelP - 0.5) * 5;
      drawFBText(ctx, "CRISPR", cx, H * 0.75, 9, a * midA, "center", FB.teal);
    }
    // Living cell on right
    const cellP = interpolate(frame, [220, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (cellP > 0) {
      const pulse = Math.sin(frame * 0.07) * 0.1 + 0.9;
      drawFBNode(ctx, W * 0.82, cy, 14 * pulse * cellP, 3, a * cellP, frame);
      if (travelP >= 1) {
        drawFBCounter(ctx, "157", W * 0.82, cy, 8, FB.gold, a * cellP * 0.7);
      }
    }
    drawFBText(ctx, "LIVING FLY", W * 0.82, cy + 22, 7, a * cellP, "center", FB.green);
    // Final text
    const endP = interpolate(frame, [320, 380], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RE-UPLOADED INTO LIFE", cx, H * 0.9, 10, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: DNA helix being cut and spliced with golden strands ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2;
    // Full DNA double helix running vertically
    const helixP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cutP = interpolate(frame, [120, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spliceP = interpolate(frame, [220, 290], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 30; i++) {
      const y = H * 0.05 + (i / 30) * H * 0.7;
      const isCutZone = i >= 12 && i <= 17;
      const offset = Math.sin(i * 0.5 + frame * 0.025) * 12;
      const baseA = isCutZone ? Math.max(0, 1 - cutP * 2) : 1;
      const splicedA = isCutZone && spliceP > 0 ? spliceP : 0;
      // Original strands
      ctx.globalAlpha = a * helixP * baseA * 0.35;
      ctx.fillStyle = FB.teal;
      ctx.beginPath();
      ctx.arc(cx + offset, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = FB.purple;
      ctx.beginPath();
      ctx.arc(cx - offset, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Spliced golden strands
      if (splicedA > 0) {
        ctx.globalAlpha = a * splicedA * 0.5;
        ctx.fillStyle = FB.gold;
        ctx.beginPath();
        ctx.arc(cx + offset, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - offset, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cut flash
    if (cutP > 0 && cutP < 0.5) {
      ctx.globalAlpha = a * (0.5 - cutP) * 0.3;
      ctx.fillStyle = FB.gold;
      ctx.fillRect(cx - 20, H * 0.3, 40, H * 0.15);
    }
    // Labels
    const labelP1 = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FIND THE 157", cx, H * 0.82, 9, a * labelP1, "center", FB.gold);
    const labelP2 = interpolate(frame, [160, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CUT WITH CRISPR", cx, H * 0.82, 9, a * labelP2, "center", FB.teal);
    const labelP3 = interpolate(frame, [300, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SPLICE INTO LIFE", cx, H * 0.82, 9, a * labelP3, "center", FB.green);
    const endP = interpolate(frame, [370, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "LIVE. BREATHING. CHANGED.", cx, H * 0.92, 8, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Circuit board fading into organic tissue ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2, cy = H * 0.4;
    const digitalP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crossfade = interpolate(frame, [180, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Circuit traces (straight lines, right angles)
    const rng = seeded(8503);
    for (let i = 0; i < 10; i++) {
      const x1 = W * 0.1 + rng() * W * 0.8;
      const y1 = H * 0.1 + rng() * H * 0.6;
      const x2 = x1 + (rng() - 0.5) * W * 0.3;
      const y2 = y1;
      ctx.globalAlpha = a * digitalP * (1 - crossfade) * 0.2;
      ctx.strokeStyle = FB.blue;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x2, y2 + (rng() - 0.5) * H * 0.2);
      ctx.stroke();
    }
    // Organic curves replacing circuits
    const rng2 = seeded(8504);
    for (let i = 0; i < 10; i++) {
      const x1 = W * 0.1 + rng2() * W * 0.8;
      const y1 = H * 0.1 + rng2() * H * 0.6;
      const cpx = x1 + (rng2() - 0.5) * 30;
      const cpy = y1 + (rng2() - 0.5) * 30;
      const x2 = x1 + (rng2() - 0.5) * W * 0.3;
      const y2 = y1 + (rng2() - 0.5) * H * 0.2;
      ctx.globalAlpha = a * crossfade * 0.25;
      ctx.strokeStyle = FB.green;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
      ctx.stroke();
    }
    // Labels
    const lab1 = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DIGITAL", cx, H * 0.82, 9, a * lab1 * (1 - crossfade), "center", FB.blue);
    const lab2 = interpolate(frame, [300, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BIOLOGICAL", cx, H * 0.82, 9, a * lab2, "center", FB.green);
    const endP = interpolate(frame, [370, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME CODE. LIVING HOST.", cx, H * 0.92, 8, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Upload arrow from monitor into pulsing cell ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cy = H * 0.42;
    // Monitor
    const monP = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * monP * 0.25;
    ctx.strokeStyle = FB.blue;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W * 0.06, cy - 16, W * 0.22, 32);
    // Code inside monitor
    const rng = seeded(8505);
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = a * monP * 0.3;
      ctx.fillStyle = FB.blue;
      ctx.fillRect(W * 0.09, cy - 10 + i * 7, (8 + rng() * 12), 1.5);
    }
    drawFBText(ctx, "157", W * 0.17, cy + 22, 8, a * monP, "center", FB.gold);
    // Transfer arrow
    const arrP = interpolate(frame, [80, 250], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrP > 0 && arrP < 1) {
      const arrX = W * 0.3 + arrP * W * 0.35;
      // Data particles traveling
      for (let i = 0; i < 6; i++) {
        const px = arrX - i * 6;
        const py = cy + Math.sin(frame * 0.1 + i) * 3;
        ctx.globalAlpha = a * (0.4 - i * 0.06);
        ctx.fillStyle = FB.gold;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Middle label
    const midP = interpolate(frame, [130, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const midFade = interpolate(frame, [220, 260], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CRISPR", W * 0.5, H * 0.7, 8, a * midP * midFade, "center", FB.teal);
    // Living cell
    const cellP = interpolate(frame, [240, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = Math.sin(frame * 0.07) * 0.1 + 0.9;
    drawFBNode(ctx, W * 0.82, cy, 15 * pulse * cellP, 3, a * cellP, frame);
    drawFBText(ctx, "ALIVE", W * 0.82, cy + 24, 8, a * cellP, "center", FB.green);
    // Final
    const endP = interpolate(frame, [350, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHANGED CODE. LIVING FLY.", W / 2, H * 0.9, 9, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Text sequence with dramatic reveals ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2;
    const lines = [
      { text: "IF WE CAN FIND", t0: 10, color: FB.text.primary, size: 9 },
      { text: "157 CONNECTIONS", t0: 40, color: FB.gold, size: 12 },
      { text: "IN A SIMULATION", t0: 70, color: FB.blue, size: 9 },
      { text: "WE CAN FIND THEM", t0: 120, color: FB.text.primary, size: 9 },
      { text: "IN A LIVING ANIMAL", t0: 150, color: FB.green, size: 12 },
      { text: "CRISPR", t0: 210, color: FB.teal, size: 10 },
      { text: "OPTOGENETICS", t0: 240, color: FB.purple, size: 10 },
      { text: "RE-UPLOAD", t0: 300, color: FB.gold, size: 14 },
      { text: "INTO A LIVE FLY", t0: 340, color: FB.green, size: 10 },
    ];
    lines.forEach((l, i) => {
      const t = interpolate(frame, [l.t0, l.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fade = interpolate(frame, [l.t0 + 60, l.t0 + 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const visible = Math.min(t, fade);
      if (visible > 0) {
        drawFBText(ctx, l.text, cx, H * 0.35, l.size, a * visible, "center", l.color);
      }
    });
    // Final persistent text
    const endP = interpolate(frame, [380, 410], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "LIVE. BREATHING. CHANGED.", cx, H * 0.8, 10, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Pixel grid dissolving into organic blob ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 420, 8, 25);
    const cx = W / 2, cy = H * 0.4;
    const crossP = interpolate(frame, [60, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Grid of pixels / organic dots
    const gridSize = 8;
    const spacing = 6;
    const rng = seeded(8506);
    for (let gx = -gridSize; gx <= gridSize; gx++) {
      for (let gy = -gridSize; gy <= gridSize; gy++) {
        const dist = Math.sqrt(gx * gx + gy * gy);
        if (dist > gridSize) continue;
        const revealP = interpolate(frame, [5 + dist * 3, 15 + dist * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (revealP <= 0) continue;
        // Digital position (grid)
        const digX = cx + gx * spacing;
        const digY = cy + gy * spacing;
        // Organic position (scattered, wobbling)
        const wobble = rng() * Math.PI * 2;
        const orgX = cx + gx * spacing * (1 + rng() * 0.3) + Math.sin(frame * 0.03 + wobble) * 3;
        const orgY = cy + gy * spacing * (1 + rng() * 0.3) + Math.cos(frame * 0.04 + wobble) * 3;
        // Interpolate position
        const px = digX + (orgX - digX) * crossP;
        const py = digY + (orgY - digY) * crossP;
        const color = crossP < 0.5 ? FB.blue : FB.green;
        ctx.globalAlpha = a * revealP * 0.35;
        ctx.fillStyle = color;
        const dotR = 1.5 + crossP * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Labels
    const lab1 = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DIGITAL", cx, H * 0.78, 9, a * lab1 * (1 - crossP), "center", FB.blue);
    const lab2 = interpolate(frame, [300, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALIVE", cx, H * 0.78, 9, a * lab2, "center", FB.green);
    const endP = interpolate(frame, [370, 400], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BIOLOGY IS PROGRAMMABLE", cx, H * 0.9, 8, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_085: VariantDef[] = [
  { id: "fb-085-v1", label: "Digital grid scissors living cell", component: V1 },
  { id: "fb-085-v2", label: "Three-panel digital tools alive", component: V2 },
  { id: "fb-085-v3", label: "Code morphing into organic curves", component: V3 },
  { id: "fb-085-v4", label: "157 number journeying to cell", component: V4 },
  { id: "fb-085-v5", label: "DNA helix cut and spliced golden", component: V5 },
  { id: "fb-085-v6", label: "Circuit board to organic tissue", component: V6 },
  { id: "fb-085-v7", label: "Upload arrow monitor to cell", component: V7 },
  { id: "fb-085-v8", label: "Text sequence dramatic reveals", component: V8 },
  { id: "fb-085-v9", label: "Pixel grid dissolves to organic", component: V9 },
];
