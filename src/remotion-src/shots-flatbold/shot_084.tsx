import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 84 — "worm(302)→maggot(3K)→fly(139K)→mouse(70M)→human(86B)" — 300 frames */

// ---------- V1: Ascending staircase — each step DRAMATICALLY bigger ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const steps = [
      { label: "WORM", year: "1986", count: "302", ci: 2, t0: 10 },
      { label: "MAGGOT", year: "2023", count: "3,016", ci: 3, t0: 55 },
      { label: "FLY", year: "2024", count: "139,255", ci: 4, t0: 100 },
      { label: "MOUSE", year: "NEXT", count: "70,000,000", ci: 5, t0: 155 },
      { label: "HUMAN", year: "?", count: "86,000,000,000", ci: 0, t0: 210 },
    ];
    steps.forEach((step, i) => {
      const t = interpolate(frame, [step.t0, step.t0 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.1 + i * W * 0.18;
      const stepH = (i + 1) * H * 0.1;
      const baseY = H * 0.82;
      // Step block rising
      const [h, s, l] = cellHSL(step.ci);
      ctx.globalAlpha = a * t * 0.3;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.5)`;
      ctx.fillRect(x - W * 0.07, baseY - stepH * t, W * 0.14, stepH * t);
      // Glow at top
      ctx.globalAlpha = a * t * 0.08;
      const glow = ctx.createRadialGradient(x, baseY - stepH * t, 0, x, baseY - stepH * t, 20);
      glow.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0.5)`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - 20, baseY - stepH * t - 20, 40, 40);
      // Node at top
      if (t > 0.5) {
        const nodeSize = 2 + i * 1.5;
        drawFBNode(ctx, x, baseY - stepH * t - 4, nodeSize, step.ci, a * (t - 0.5) * 2, frame);
      }
      // Labels
      if (t > 0.6) {
        const labelA = a * Math.min(1, (t - 0.6) / 0.4);
        drawFBText(ctx, step.label, x, baseY - stepH * t - 14 - (i > 2 ? 4 : 0), 6, labelA, "center", FB.colors[step.ci]);
        drawFBText(ctx, step.count, x, baseY + 10, 4, labelA * 0.7, "center", FB.text.dim);
        drawFBText(ctx, step.year, x, baseY + 18, 4, labelA * 0.5, "center", FB.text.dim);
      }
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Expanding circles — each organism a bigger ring ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const cx = W / 2, cy = H * 0.45;
    const organisms = [
      { label: "WORM", count: "302", r: 4, ci: 2, t0: 15 },
      { label: "MAGGOT", count: "3K", r: 9, ci: 3, t0: 55 },
      { label: "FLY", count: "139K", r: 17, ci: 4, t0: 100 },
      { label: "MOUSE", count: "70M", r: 30, ci: 5, t0: 155 },
      { label: "HUMAN", count: "86B", r: 48, ci: 0, t0: 210 },
    ];
    organisms.forEach((org, i) => {
      const t = interpolate(frame, [org.t0, org.t0 + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) return;
      const r = org.r * t;
      const [h, s, l] = cellHSL(org.ci);
      // Ring
      ctx.globalAlpha = a * t * 0.25;
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, 0.6)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Soft fill
      ctx.globalAlpha = a * t * 0.05;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.3)`;
      ctx.fill();
      // Label outside ring
      const labelY = cy - r - 6;
      drawFBText(ctx, org.label, cx, labelY, 5 + i, a * Math.min(1, t * 1.5), "center", FB.colors[org.ci]);
      drawFBText(ctx, org.count, cx, labelY - 8, 5, a * Math.min(1, t * 1.5) * 0.6, "center", FB.text.dim);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Timeline with dots growing exponentially ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const cy = H * 0.5;
    // Timeline axis
    const axisP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * axisP * 0.2;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.05, cy);
    ctx.lineTo(W * 0.95, cy);
    ctx.stroke();
    const points = [
      { x: W * 0.1, label: "WORM", sub: "302", year: "'86", dotR: 2, ci: 2, t0: 15 },
      { x: W * 0.28, label: "MAGGOT", sub: "3K", year: "'23", dotR: 4, ci: 3, t0: 55 },
      { x: W * 0.46, label: "FLY", sub: "139K", year: "'24", dotR: 7, ci: 4, t0: 100 },
      { x: W * 0.68, label: "MOUSE", sub: "70M", year: "NEXT", dotR: 14, ci: 5, t0: 155 },
      { x: W * 0.88, label: "HUMAN", sub: "86B", year: "?", dotR: 24, ci: 0, t0: 210 },
    ];
    points.forEach((p, i) => {
      const t = interpolate(frame, [p.t0, p.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) return;
      // Dot growing
      const [h, s, l] = cellHSL(p.ci);
      ctx.globalAlpha = a * t * 0.3;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, cy, p.dotR * t, 0, Math.PI * 2);
      ctx.fill();
      // Node
      drawFBNode(ctx, p.x, cy, Math.min(p.dotR * t, 6), p.ci, a * t, frame);
      // Labels
      drawFBText(ctx, p.label, p.x, cy - p.dotR * t - 8, 6, a * t, "center", FB.colors[p.ci]);
      drawFBText(ctx, p.sub, p.x, cy + p.dotR * t + 8, 5, a * t * 0.7, "center", FB.text.dim);
      drawFBText(ctx, p.year, p.x, cy + p.dotR * t + 16, 4, a * t * 0.5, "center", FB.text.dim);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Counter spinning through each number ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const cx = W / 2;
    const stages = [
      { label: "C. ELEGANS", count: 302, t0: 10, t1: 50, ci: 2 },
      { label: "LARVA", count: 3016, t0: 50, t1: 95, ci: 3 },
      { label: "DROSOPHILA", count: 139255, t0: 95, t1: 150, ci: 4 },
      { label: "MOUSE", count: 70000000, t0: 150, t1: 210, ci: 5 },
      { label: "HUMAN", count: 86000000000, t0: 210, t1: 280, ci: 0 },
    ];
    // Find active stage
    let activeIdx = 0;
    for (let i = stages.length - 1; i >= 0; i--) {
      if (frame >= stages[i].t0) { activeIdx = i; break; }
    }
    const st = stages[activeIdx];
    const stageP = interpolate(frame, [st.t0, st.t0 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Label
    drawFBText(ctx, st.label, cx, H * 0.2, 10, a * stageP, "center", FB.colors[st.ci]);
    // Counter with formatting
    const countP = interpolate(frame, [st.t0 + 5, st.t0 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayCount = Math.round(st.count * Math.min(1, countP));
    const fontSize = 14 + activeIdx * 2;
    drawFBCounter(ctx, displayCount, cx, H * 0.45, fontSize, FB.colors[st.ci], a * stageP);
    drawFBText(ctx, "NEURONS", cx, H * 0.6, 8, a * stageP, "center", FB.text.dim);
    // Progress dots for stages
    stages.forEach((s, i) => {
      const dotA = i <= activeIdx ? 1 : 0.2;
      ctx.globalAlpha = a * dotA;
      ctx.fillStyle = i <= activeIdx ? FB.colors[s.ci] : FB.text.dim;
      ctx.beginPath();
      ctx.arc(cx - 30 + i * 15, H * 0.78, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    // Year label
    const years = ["1986", "2023", "2024", "NEXT", "?"];
    drawFBText(ctx, years[activeIdx], cx, H * 0.88, 8, a * stageP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Log-scale bar chart, each bar exponentially taller ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const baseY = H * 0.85;
    const bars = [
      { label: "WORM", logH: 0.08, count: "302", ci: 2, t0: 15 },
      { label: "MAGGOT", logH: 0.15, count: "3K", ci: 3, t0: 55 },
      { label: "FLY", logH: 0.28, count: "139K", ci: 4, t0: 100 },
      { label: "MOUSE", logH: 0.55, count: "70M", ci: 5, t0: 155 },
      { label: "HUMAN", logH: 0.78, count: "86B", ci: 0, t0: 210 },
    ];
    const barW = W * 0.12;
    bars.forEach((b, i) => {
      const t = interpolate(frame, [b.t0, b.t0 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.1 + i * W * 0.18;
      const barH = b.logH * H * t;
      const [h, s, l] = cellHSL(b.ci);
      // Bar
      ctx.globalAlpha = a * t * 0.4;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.6)`;
      ctx.fillRect(x - barW / 2, baseY - barH, barW, barH);
      // Labels
      if (t > 0.4) {
        drawFBText(ctx, b.label, x, baseY + 8, 5, a * t, "center", FB.colors[b.ci]);
        drawFBText(ctx, b.count, x, baseY - barH - 8, 5, a * t, "center", FB.colors[b.ci]);
      }
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Node clusters — each organism shown as cluster of dots ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const clusters = [
      { label: "WORM", dots: 3, ci: 2, x: W * 0.1, t0: 15 },
      { label: "MAGGOT", dots: 7, ci: 3, x: W * 0.28, t0: 55 },
      { label: "FLY", dots: 15, ci: 4, x: W * 0.46, t0: 100 },
      { label: "MOUSE", dots: 30, ci: 5, x: W * 0.68, t0: 155 },
      { label: "HUMAN", dots: 50, ci: 0, x: W * 0.88, t0: 210 },
    ];
    clusters.forEach((cl, ci) => {
      const t = interpolate(frame, [cl.t0, cl.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) return;
      const rng = seeded(8400 + ci);
      const visibleDots = Math.floor(cl.dots * t);
      for (let d = 0; d < visibleDots; d++) {
        const dx = (rng() - 0.5) * W * 0.08;
        const dy = (rng() - 0.5) * H * 0.4;
        const dotR = 1 + ci * 0.3;
        drawFBNode(ctx, cl.x + dx, H * 0.45 + dy, dotR, cl.ci, a * t * 0.7, frame);
      }
      // Consume remaining random
      for (let d = visibleDots; d < cl.dots; d++) { rng(); rng(); }
      drawFBText(ctx, cl.label, cl.x, H * 0.84, 5 + ci, a * t, "center", FB.colors[cl.ci]);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Text sequence — each organism name appears with neuron count ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const cx = W / 2;
    const items = [
      { name: "WORM", count: "302 neurons", year: "1986", ci: 2, t0: 10 },
      { name: "MAGGOT", count: "3,016 neurons", year: "2023", ci: 3, t0: 55 },
      { name: "FLY", count: "139,255 neurons", year: "2024", ci: 4, t0: 100 },
      { name: "MOUSE", count: "70 million neurons", year: "NEXT", ci: 5, t0: 155 },
      { name: "HUMAN", count: "86 billion neurons", year: "?", ci: 0, t0: 210 },
    ];
    items.forEach((item, i) => {
      const t = interpolate(frame, [item.t0, item.t0 + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.08 + i * H * 0.17;
      // Progressively larger font for bigger brains
      const fontSize = 7 + i * 1.5;
      drawFBText(ctx, item.name, cx - 15, y, fontSize, a * t, "right", FB.colors[item.ci]);
      drawFBText(ctx, item.count, cx + 5, y, 6, a * t * 0.7, "left", FB.text.dim);
      drawFBText(ctx, item.year, cx + 5, y + 9, 5, a * t * 0.4, "left", FB.text.dim);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Single growing brain node for each organism ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const cx = W / 2, cy = H * 0.42;
    const stages = [
      { label: "WORM", r: 3, ci: 2, t0: 10, t1: 50 },
      { label: "MAGGOT", r: 6, ci: 3, t0: 50, t1: 95 },
      { label: "FLY", r: 12, ci: 4, t0: 95, t1: 150 },
      { label: "MOUSE", r: 24, ci: 5, t0: 150, t1: 210 },
      { label: "HUMAN", r: 42, ci: 0, t0: 210, t1: 280 },
    ];
    // Find active
    let ai = 0;
    for (let i = stages.length - 1; i >= 0; i--) {
      if (frame >= stages[i].t0) { ai = i; break; }
    }
    const st = stages[ai];
    const growP = interpolate(frame, [st.t0, st.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const prevR = ai > 0 ? stages[ai - 1].r : 0;
    const curR = prevR + (st.r - prevR) * growP;
    drawFBNode(ctx, cx, cy, curR, st.ci, a, frame);
    drawFBText(ctx, st.label, cx, cy + curR + 12, 10, a * growP, "center", FB.colors[st.ci]);
    // Ghost rings of previous stages
    for (let i = 0; i < ai; i++) {
      ctx.globalAlpha = a * 0.1;
      ctx.strokeStyle = FB.colors[stages[i].ci];
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, stages[i].r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Mountain silhouette — each peak taller ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 20);
    const baseY = H * 0.88;
    const peaks = [
      { x: W * 0.1, peakH: H * 0.06, label: "WORM", sub: "302", ci: 2, t0: 15 },
      { x: W * 0.28, peakH: H * 0.14, label: "MAGGOT", sub: "3K", ci: 3, t0: 55 },
      { x: W * 0.46, peakH: H * 0.26, label: "FLY", sub: "139K", ci: 4, t0: 100 },
      { x: W * 0.68, peakH: H * 0.48, label: "MOUSE", sub: "70M", ci: 5, t0: 155 },
      { x: W * 0.88, peakH: H * 0.72, label: "HUMAN", sub: "86B", ci: 0, t0: 210 },
    ];
    peaks.forEach((pk, i) => {
      const t = interpolate(frame, [pk.t0, pk.t0 + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) return;
      const [h, s, l] = cellHSL(pk.ci);
      const peakY = baseY - pk.peakH * t;
      // Triangle mountain
      ctx.globalAlpha = a * t * 0.2;
      ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, 0.4)`;
      ctx.beginPath();
      ctx.moveTo(pk.x - W * 0.07, baseY);
      ctx.lineTo(pk.x, peakY);
      ctx.lineTo(pk.x + W * 0.07, baseY);
      ctx.closePath();
      ctx.fill();
      // Peak dot
      drawFBNode(ctx, pk.x, peakY - 2, 2 + i, pk.ci, a * t, frame);
      // Label at peak
      drawFBText(ctx, pk.label, pk.x, peakY - 10 - i * 2, 5 + i * 0.5, a * t, "center", FB.colors[pk.ci]);
      drawFBText(ctx, pk.sub, pk.x, baseY + 6, 4, a * t * 0.5, "center", FB.text.dim);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_084: VariantDef[] = [
  { id: "fb-084-v1", label: "Ascending staircase blocks", component: V1 },
  { id: "fb-084-v2", label: "Expanding concentric rings", component: V2 },
  { id: "fb-084-v3", label: "Timeline with growing dots", component: V3 },
  { id: "fb-084-v4", label: "Counter spinning through stages", component: V4 },
  { id: "fb-084-v5", label: "Log-scale bar chart", component: V5 },
  { id: "fb-084-v6", label: "Node clusters growing", component: V6 },
  { id: "fb-084-v7", label: "Text list scaling up", component: V7 },
  { id: "fb-084-v8", label: "Single brain node morphing", component: V8 },
  { id: "fb-084-v9", label: "Mountain peaks ascending", component: V9 },
];
