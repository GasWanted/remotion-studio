import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 70 — "Instead of guessing, I used the brain's own activity. When I
   simulated sugar, I watched which neurons fired and targeted those specific
   synapses." — 210 frames (7s) */

// ---------- V1: sugar stimulus → neurons fire → targets marked ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Sugar stimulus
    const sugarP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarP * 0.4; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.08, H * 0.3, 8 * s, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "SUGAR", W * 0.08, H * 0.3 + 14 * s, 7 * s, a * sugarP, "center", FB.gold);
    // Arrow into network
    const inP = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * inP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.3); ctx.lineTo(W * 0.25, H * 0.3); ctx.stroke();
    // Network of neurons — some fire (glow), some stay dim
    const rng = seeded(7010);
    const nodes: { x: number; y: number; fires: boolean }[] = [];
    for (let i = 0; i < 14; i++) {
      const x = W * 0.25 + rng() * W * 0.5;
      const y = H * 0.1 + rng() * H * 0.5;
      const fires = rng() < 0.4; // ~40% fire
      nodes.push({ x, y, fires });
    }
    const fireP = interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n, i) => {
      const nodeA = n.fires ? fireP : 0.15;
      const pulse = n.fires ? (0.6 + 0.4 * Math.sin(frame * 0.12 + i)) : 1;
      drawFBNode(ctx, n.x, n.y, 5 * s, n.fires ? 2 : 7, a * nodeA * pulse, frame);
      // Firing glow
      if (n.fires && fireP > 0.3) {
        ctx.globalAlpha = a * fireP * 0.12; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(n.x, n.y, 10 * s, 0, Math.PI * 2); ctx.fill();
      }
    });
    // "WATCHING" label
    const watchP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WATCHING WHICH NEURONS FIRE", cx, H * 0.68, 8 * s, a * watchP, "center", FB.text.dim);
    // Target markers on firing neurons
    const targetP = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n) => {
      if (n.fires && targetP > 0) {
        ctx.globalAlpha = a * targetP; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(n.x, n.y, 8 * s, 0, Math.PI * 2); ctx.stroke();
        // Crosshair lines
        ctx.beginPath();
        ctx.moveTo(n.x - 10 * s, n.y); ctx.lineTo(n.x - 6 * s, n.y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(n.x + 6 * s, n.y); ctx.lineTo(n.x + 10 * s, n.y); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(n.x, n.y - 10 * s); ctx.lineTo(n.x, n.y - 6 * s); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(n.x, n.y + 6 * s); ctx.lineTo(n.x, n.y + 10 * s); ctx.stroke();
      }
    });
    const endP = interpolate(frame, [155, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TARGETED THOSE SYNAPSES", cx, H * 0.82, 11 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: simulation screen — sugar on, heatmap of activity, hot spots marked ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const rng = seeded(7020);
    // Header
    drawFBText(ctx, "SIMULATION: SUGAR INPUT", W / 2, H * 0.05, 8 * s, a, "center", FB.gold);
    // Activity heatmap grid
    const gridCols = 10, gridRows = 6;
    const cellW = W * 0.07, cellH = H * 0.06;
    const startX = W * 0.13, startY = H * 0.12;
    const actP = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const hotCells: [number, number][] = [];
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const x = startX + c * cellW, y = startY + r * cellH;
        const baseRate = rng();
        const isHot = baseRate > 0.7;
        if (isHot) hotCells.push([x + cellW / 2, y + cellH / 2]);
        const rate = isHot ? baseRate * actP : baseRate * 0.15 * actP;
        ctx.globalAlpha = a * (0.1 + rate * 0.6);
        ctx.fillStyle = isHot ? FB.gold : FB.teal;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
      }
    }
    // "Active neurons detected" label
    const detP = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ACTIVE NEURONS DETECTED", W / 2, H * 0.55, 8 * s, a * detP, "center", FB.gold);
    // Target rings on hot cells
    const tgtP = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    hotCells.forEach(([hx, hy]) => {
      ctx.globalAlpha = a * tgtP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(hx, hy, 5 * s, 0, Math.PI * 2); ctx.stroke();
    });
    if (tgtP > 0.5) {
      drawFBText(ctx, `${hotCells.length} TARGETS FOUND`, W / 2, H * 0.62, 9 * s, a * tgtP, "center", FB.red);
    }
    const endP = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "USE ACTIVITY TO FIND TARGETS", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: flowchart — "GUESS?" crossed out → "SIMULATE" checkmarked ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // "GUESS?" crossed out
    const guessP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "GUESS?", cx, H * 0.15, 16 * s, a * guessP, "center", FB.text.dim);
    const strikeP = interpolate(frame, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * strikeP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx - 45 * s, H * 0.15); ctx.lineTo(cx + 45 * s, H * 0.15); ctx.stroke();
    // "SIMULATE" with check
    const simP = interpolate(frame, [55, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SIMULATE", cx, H * 0.32, 16 * s, a * simP, "center", FB.green);
    // Check
    const chkP = interpolate(frame, [75, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * chkP; ctx.strokeStyle = FB.green; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx + 50 * s, H * 0.28); ctx.lineTo(cx + 55 * s, H * 0.33); ctx.lineTo(cx + 65 * s, H * 0.25); ctx.stroke();
    // Three steps below
    const steps = [
      { label: "1. Apply sugar stimulus", delay: 90 },
      { label: "2. Watch which neurons fire", delay: 110 },
      { label: "3. Target those synapses", delay: 130 },
    ];
    steps.forEach((st, i) => {
      const t = interpolate(frame, [st.delay, st.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.48 + i * H * 0.1;
      const col = i === 0 ? FB.gold : i === 1 ? FB.teal : FB.green;
      drawFBText(ctx, st.label, cx, y, 8 * s, a * t, "center", col);
    });
    const endP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE BRAIN TELLS YOU WHERE TO LOOK", cx, H * 0.88, 9 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: sugar input wave → network lights up selectively → red rings ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const rng = seeded(7040);
    // Sugar wave sweeping left to right
    const waveX = interpolate(frame, [10, 60], [W * 0.05, W * 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.08;
    const waveGrad = ctx.createLinearGradient(waveX - 30 * s, 0, waveX + 10 * s, 0);
    waveGrad.addColorStop(0, "transparent"); waveGrad.addColorStop(0.5, FB.gold); waveGrad.addColorStop(1, "transparent");
    ctx.fillStyle = waveGrad;
    ctx.fillRect(waveX - 30 * s, 0, 40 * s, H * 0.65);
    drawFBText(ctx, "SUGAR STIMULUS", W / 2, H * 0.03, 7 * s, a, "center", FB.gold);
    // Network
    const nodes: { x: number; y: number; fires: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      const x = W * 0.1 + rng() * W * 0.8;
      const y = H * 0.08 + rng() * H * 0.52;
      nodes.push({ x, y, fires: rng() < 0.35 });
    }
    nodes.forEach((n, i) => {
      const hitByWave = n.x < waveX;
      const lit = hitByWave && n.fires;
      drawFBNode(ctx, n.x, n.y, 5 * s, lit ? 2 : 7, a * (lit ? 0.8 : 0.12), frame);
    });
    // Mark targets phase
    const markP = interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n) => {
      if (n.fires && markP > 0) {
        ctx.globalAlpha = a * markP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(n.x, n.y, 8 * s, 0, Math.PI * 2); ctx.stroke();
      }
    });
    if (markP > 0.3) drawFBText(ctx, "TARGETS IDENTIFIED", W / 2, H * 0.68, 10 * s, a * markP, "center", FB.red);
    const endP = interpolate(frame, [150, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ACTIVITY-GUIDED TARGETING", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Hebbian logic — "neurons that fire together get targeted together" ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.3;
    // Two neurons firing together
    const fireP = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.15);
    drawFBNode(ctx, cx - 25 * s, cy, 12 * s, 2, a * fireP * pulse, frame);
    drawFBNode(ctx, cx + 25 * s, cy, 12 * s, 2, a * fireP * pulse, frame);
    drawFBColorEdge(ctx, cx - 13 * s, cy, cx + 13 * s, cy, FB.gold, s * 1.5, a * fireP);
    // Sync flash
    if (fireP > 0.5) {
      ctx.globalAlpha = a * pulse * 0.1; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 35 * s, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "FIRE TOGETHER", cx, cy + 20 * s, 9 * s, a * fireP, "center", FB.gold);
    // "Sugar" input
    drawFBText(ctx, "SUGAR", cx - 25 * s, cy - 18 * s, 6 * s, a * fireP, "center", FB.text.dim);
    // Arrow down to "targeted"
    const tgtP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * tgtP; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy + 28 * s); ctx.lineTo(cx, H * 0.52); ctx.stroke();
    // Red target rings
    drawFBNode(ctx, cx - 25 * s, H * 0.58, 10 * s, 2, a * tgtP, frame);
    drawFBNode(ctx, cx + 25 * s, H * 0.58, 10 * s, 2, a * tgtP, frame);
    ctx.globalAlpha = a * tgtP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx - 25 * s, H * 0.58, 14 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 25 * s, H * 0.58, 14 * s, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "TARGETED TOGETHER", cx, H * 0.72, 10 * s, a * tgtP, "center", FB.red);
    const endP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ACTIVITY REVEALS THE TARGETS", cx, H * 0.88, 9 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: counter — "157 synapses modified out of 15M" ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Sugar input phase
    const sugarP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "SIMULATED SUGAR", cx, H * 0.08, 9 * s, a * sugarP, "center", FB.gold);
    // Scanning animation
    const scanP = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SCANNING 15,000,000 SYNAPSES...", cx, H * 0.2, 8 * s, a * scanP, "center", FB.text.dim);
    // Progress
    const progBar = scanP;
    ctx.globalAlpha = a * scanP * 0.15; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(W * 0.15, H * 0.28, W * 0.7, 5 * s);
    ctx.globalAlpha = a * scanP; ctx.fillStyle = FB.teal;
    ctx.fillRect(W * 0.15, H * 0.28, W * 0.7 * progBar, 5 * s);
    // Result: 157
    const resP = interpolate(frame, [95, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const countVal = Math.floor(interpolate(resP, [0, 1], [0, 157]));
    drawFBCounter(ctx, countVal, cx, H * 0.48, 28 * s, FB.green, a * resP);
    drawFBText(ctx, "SYNAPSES TO MODIFY", cx, H * 0.58, 9 * s, a * resP, "center", FB.text.dim);
    // Context
    const ctxP = interpolate(frame, [130, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "OUT OF 15,000,000", cx, H * 0.66, 10 * s, a * ctxP, "center", FB.text.dim);
    drawFBText(ctx, "0.001%", cx, H * 0.75, 14 * s, a * ctxP, "center", FB.green);
    const endP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PRECISION TARGETING", cx, H * 0.9, 10 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: before/after — scattered random vs precise targeting ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.08, 2, H * 0.62);
    // Left: random guessing — scattered red X marks
    const leftP = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "GUESSING", W * 0.25, H * 0.08, 9 * s, a * leftP, "center", FB.red);
    const rng = seeded(7070);
    for (let i = 0; i < 12; i++) {
      const x = W * 0.05 + rng() * W * 0.4;
      const y = H * 0.16 + rng() * H * 0.5;
      ctx.globalAlpha = a * leftP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x - 3 * s, y - 3 * s); ctx.lineTo(x + 3 * s, y + 3 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 3 * s, y - 3 * s); ctx.lineTo(x - 3 * s, y + 3 * s); ctx.stroke();
    }
    drawFBText(ctx, "EXPLODED", W * 0.25, H * 0.7, 9 * s, a * leftP, "center", FB.red);
    // Right: activity-guided — precise green circles
    const rightP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SIMULATING", W * 0.75, H * 0.08, 9 * s, a * rightP, "center", FB.green);
    const rng2 = seeded(7071);
    // Dim background
    for (let i = 0; i < 20; i++) {
      const x = W * 0.55 + rng2() * W * 0.4;
      const y = H * 0.16 + rng2() * H * 0.5;
      drawFBNode(ctx, x, y, 3 * s, 7, a * rightP * 0.15, frame);
    }
    // Only a few targets
    for (let i = 0; i < 4; i++) {
      const x = W * 0.62 + rng2() * W * 0.25;
      const y = H * 0.25 + rng2() * H * 0.35;
      drawFBNode(ctx, x, y, 5 * s, 2, a * rightP, frame);
      ctx.globalAlpha = a * rightP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.arc(x, y, 8 * s, 0, Math.PI * 2); ctx.stroke();
    }
    drawFBText(ctx, "PRECISE", W * 0.75, H * 0.7, 9 * s, a * rightP, "center", FB.green);
    const endP = interpolate(frame, [140, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "LET THE BRAIN SHOW YOU", W / 2, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: timeline — sugar on → wait → record → mark targets ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const cy = H * 0.4;
    // Timeline bar
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.05, cy); ctx.lineTo(W * 0.95, cy); ctx.stroke();
    const milestones = [
      { frac: 0.15, label: "SUGAR\nON", color: FB.gold },
      { frac: 0.4, label: "NEURONS\nFIRE", color: FB.teal },
      { frac: 0.65, label: "RECORD\nACTIVITY", color: FB.purple },
      { frac: 0.88, label: "MARK\nTARGETS", color: FB.green },
    ];
    const progressP = interpolate(frame, [10, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Progress fill
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = FB.teal;
    ctx.fillRect(W * 0.05, cy - 1.5 * s, W * 0.9 * progressP, 3 * s);
    milestones.forEach((m, i) => {
      const reached = progressP >= m.frac;
      const t = reached ? interpolate(frame, [10 + m.frac * 140, 20 + m.frac * 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
      const mx = W * 0.05 + m.frac * W * 0.9;
      // Dot
      ctx.globalAlpha = a * (reached ? t : 0.2); ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(mx, cy, 5 * s, 0, Math.PI * 2); ctx.fill();
      // Label
      const lines = m.label.split("\n");
      lines.forEach((ln, li) => drawFBText(ctx, ln, mx, cy + 12 * s + li * 9 * s, 6 * s, a * (reached ? t : 0.2), "center", m.color));
    });
    const endP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SIMULATION-GUIDED TARGETING", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: magnifying glass over network, sugar stimulus reveals active paths ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const s = Math.min(W, H) / 360;
    const rng = seeded(7090);
    // Dense dim network
    const nodes: { x: number; y: number; active: boolean }[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({ x: W * 0.08 + rng() * W * 0.84, y: H * 0.08 + rng() * H * 0.5, active: rng() < 0.3 });
    }
    // Sugar label
    const sugarP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "SUGAR APPLIED", W / 2, H * 0.04, 8 * s, a * sugarP, "center", FB.gold);
    // Nodes light up
    const lightP = interpolate(frame, [20, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n) => {
      const na = n.active ? lightP * 0.7 : 0.1;
      drawFBNode(ctx, n.x, n.y, 4 * s, n.active ? 2 : 7, a * na, frame);
    });
    // Magnifying glass sweeping
    const magP = interpolate(frame, [60, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const magX = interpolate(magP, [0, 0.5, 1], [W * 0.15, W * 0.5, W * 0.85]);
    const magY = H * 0.35;
    const magR = 18 * s;
    ctx.globalAlpha = a * magP * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(magX, magY, magR, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(magX + magR * 0.7, magY + magR * 0.7);
    ctx.lineTo(magX + magR * 1.3, magY + magR * 1.3); ctx.stroke();
    // Target markers appear after sweep
    const tgtP = interpolate(frame, [130, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n) => {
      if (n.active && tgtP > 0) {
        ctx.globalAlpha = a * tgtP; ctx.strokeStyle = FB.red; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.arc(n.x, n.y, 7 * s, 0, Math.PI * 2); ctx.stroke();
      }
    });
    const endP = interpolate(frame, [175, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THOSE SPECIFIC SYNAPSES", W / 2, H * 0.72, 10 * s, a * endP, "center", FB.green);
    drawFBText(ctx, "TARGETED BY ACTIVITY", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_070: VariantDef[] = [
  { id: "fb-070-v1", label: "Sugar fires neurons targets marked", component: V1 },
  { id: "fb-070-v2", label: "Heatmap simulation hot spots ringed", component: V2 },
  { id: "fb-070-v3", label: "GUESS crossed out SIMULATE checked", component: V3 },
  { id: "fb-070-v4", label: "Sugar wave lights up selective nodes", component: V4 },
  { id: "fb-070-v5", label: "Fire together targeted together Hebbian", component: V5 },
  { id: "fb-070-v6", label: "Counter 157 out of 15M precision", component: V6 },
  { id: "fb-070-v7", label: "Random guessing vs precise simulation", component: V7 },
  { id: "fb-070-v8", label: "Timeline sugar to record to targets", component: V8 },
  { id: "fb-070-v9", label: "Magnifying glass reveals active paths", component: V9 },
];
