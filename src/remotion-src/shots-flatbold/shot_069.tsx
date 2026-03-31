import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 69 — "I needed to weaken the connections leading into the feeding path
   and strengthen the ones leading into the retreat path." — 150 frames (5s) */

// ---------- V1: two pathways — feed dims while retreat brightens ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Shared source at top
    const srcP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.1, 12 * s, 4, a * srcP, frame);
    drawFBText(ctx, "SUGAR INPUT", cx, H * 0.1 + 16 * s, 6 * s, a * srcP, "center", FB.text.dim);
    // Transition — feed weakens, retreat strengthens
    const transP = interpolate(frame, [35, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Feed path (left) — dimming
    const feedA = 0.8 - transP * 0.65;
    const feedThick = (2.5 - transP * 2) * s;
    drawFBColorEdge(ctx, cx - 5 * s, H * 0.18, W * 0.25, H * 0.45, FB.gold, Math.max(0.3, feedThick), a * feedA);
    drawFBNode(ctx, W * 0.25, H * 0.5, 10 * s, 2, a * feedA, frame);
    drawFBText(ctx, "FEED", W * 0.25, H * 0.5 + 16 * s, 10 * s, a * feedA, "center", FB.gold);
    drawFBText(ctx, "MN9", W * 0.25, H * 0.5 + 26 * s, 6 * s, a * feedA, "center", FB.text.dim);
    // "WEAKEN" label
    if (transP > 0.1) {
      drawFBText(ctx, "WEAKEN", W * 0.12, H * 0.35, 8 * s, a * transP * 0.7, "center", FB.red);
      // Down arrow
      ctx.globalAlpha = a * transP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(W * 0.12, H * 0.38); ctx.lineTo(W * 0.12, H * 0.42); ctx.stroke();
    }
    // Retreat path (right) — brightening
    const retA = 0.2 + transP * 0.7;
    const retThick = (0.5 + transP * 2.5) * s;
    drawFBColorEdge(ctx, cx + 5 * s, H * 0.18, W * 0.75, H * 0.45, FB.blue, retThick, a * retA);
    drawFBNode(ctx, W * 0.75, H * 0.5, 10 * s, 5, a * retA, frame);
    drawFBText(ctx, "RETREAT", W * 0.75, H * 0.5 + 16 * s, 10 * s, a * retA, "center", FB.blue);
    drawFBText(ctx, "MDN", W * 0.75, H * 0.5 + 26 * s, 6 * s, a * retA, "center", FB.text.dim);
    // "STRENGTHEN" label
    if (transP > 0.1) {
      drawFBText(ctx, "STRENGTHEN", W * 0.88, H * 0.35, 8 * s, a * transP * 0.7, "center", FB.green);
      ctx.globalAlpha = a * transP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(W * 0.88, H * 0.38); ctx.lineTo(W * 0.88, H * 0.32); ctx.stroke();
    }
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN FEED, STRENGTHEN RETREAT", cx, H * 0.82, 9 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: weight bars — feed bars shrinking, retreat bars growing ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const transP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Feed bars (left column) — shrinking
    drawFBText(ctx, "FEED WEIGHTS", W * 0.25, H * 0.08, 8 * s, a, "center", FB.gold);
    for (let i = 0; i < 5; i++) {
      const y = H * 0.15 + i * H * 0.08;
      const maxW = W * 0.3;
      const barW = maxW * (0.8 - transP * 0.7 + Math.sin(i * 1.2) * 0.1);
      ctx.globalAlpha = a * (0.8 - transP * 0.5); ctx.fillStyle = FB.gold;
      ctx.fillRect(W * 0.1, y, Math.max(0, barW), 4 * s);
    }
    // Retreat bars (right column) — growing
    drawFBText(ctx, "RETREAT WEIGHTS", W * 0.75, H * 0.08, 8 * s, a, "center", FB.blue);
    for (let i = 0; i < 5; i++) {
      const y = H * 0.15 + i * H * 0.08;
      const maxW = W * 0.3;
      const barW = maxW * (0.1 + transP * 0.8 + Math.sin(i * 1.5) * 0.1);
      ctx.globalAlpha = a * (0.2 + transP * 0.7); ctx.fillStyle = FB.blue;
      ctx.fillRect(W * 0.58, y, barW, 4 * s);
    }
    // Center arrows
    const arrP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.55); ctx.lineTo(W * 0.25, H * 0.62); ctx.stroke();
    drawFBText(ctx, "WEAKEN", W * 0.25, H * 0.66, 8 * s, a * arrP, "center", FB.red);
    ctx.strokeStyle = FB.green;
    ctx.beginPath(); ctx.moveTo(W * 0.75, H * 0.62); ctx.lineTo(W * 0.75, H * 0.55); ctx.stroke();
    drawFBText(ctx, "STRENGTHEN", W * 0.75, H * 0.66, 8 * s, a * arrP, "center", FB.green);
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REBALANCE THE PATHWAYS", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: see-saw — feed side rising (lighter), retreat side pressing down ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, pivotY = H * 0.5;
    // Pivot triangle
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.moveTo(cx, pivotY + 5 * s); ctx.lineTo(cx - 6 * s, pivotY + 15 * s); ctx.lineTo(cx + 6 * s, pivotY + 15 * s); ctx.closePath(); ctx.fill();
    // Tilt
    const tiltP = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tilt = tiltP * 0.3; // left (feed) goes UP = lighter
    ctx.save(); ctx.translate(cx, pivotY); ctx.rotate(tilt);
    ctx.globalAlpha = a; ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(-55 * s, 0); ctx.lineTo(55 * s, 0); ctx.stroke();
    // Feed side (left) — goes up = weakened
    drawFBNode(ctx, -45 * s, -8 * s, 10 * s, 2, a * (1 - tiltP * 0.6), frame);
    drawFBText(ctx, "FEED", -45 * s, 16 * s, 8 * s, a, "center", FB.gold);
    // Retreat side (right) — goes down = strengthened
    drawFBNode(ctx, 45 * s, -8 * s, 10 * s * (0.7 + tiltP * 0.5), 5, a * (0.3 + tiltP * 0.7), frame);
    drawFBText(ctx, "RETREAT", 45 * s, 16 * s, 8 * s, a, "center", FB.blue);
    ctx.restore();
    // Labels
    const labP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKER", W * 0.2, H * 0.3, 9 * s, a * labP, "center", FB.red);
    drawFBText(ctx, "STRONGER", W * 0.8, H * 0.3, 9 * s, a * labP, "center", FB.green);
    const endP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TIP THE BALANCE", cx, H * 0.82, 12 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: weight numbers changing — feed numbers dropping, retreat rising ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const transP = interpolate(frame, [20, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Feed weights dropping
    drawFBText(ctx, "FEED SYNAPSES", W * 0.3, H * 0.08, 8 * s, a, "center", FB.gold);
    const feedWeights = [347, 210, 89, 450, 180];
    feedWeights.forEach((w, i) => {
      const y = H * 0.16 + i * H * 0.1;
      const val = Math.round(w * (1 - transP * 0.85));
      drawFBCounter(ctx, "+" + val, W * 0.3, y, 10 * s, FB.gold, a * (1 - transP * 0.5));
    });
    // Retreat weights rising
    drawFBText(ctx, "RETREAT SYNAPSES", W * 0.7, H * 0.08, 8 * s, a, "center", FB.blue);
    const retWeights = [20, 5, 12, 8, 15];
    retWeights.forEach((w, i) => {
      const y = H * 0.16 + i * H * 0.1;
      const val = Math.round(w + transP * 400);
      drawFBCounter(ctx, "+" + val, W * 0.7, y, 10 * s, FB.blue, a * (0.3 + transP * 0.7));
    });
    // Down/up arrows
    const arrP = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN", W * 0.3, H * 0.72, 10 * s, a * arrP, "center", FB.red);
    drawFBText(ctx, "STRENGTHEN", W * 0.7, H * 0.72, 10 * s, a * arrP, "center", FB.green);
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TARGETED MODIFICATION", W / 2, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: two dial gauges — feed turning down, retreat turning up ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const transP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dials = [
      { x: W * 0.28, label: "FEED", angle: Math.PI * 0.8 - transP * Math.PI * 0.6, color: FB.gold },
      { x: W * 0.72, label: "RETREAT", angle: Math.PI * 0.2 + transP * Math.PI * 0.6, color: FB.blue },
    ];
    const dialY = H * 0.38, dialR = 24 * s;
    dials.forEach((d) => {
      // Arc background
      ctx.globalAlpha = a * 0.2; ctx.strokeStyle = d.color; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.arc(d.x, dialY, dialR, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
      // Needle
      ctx.globalAlpha = a; ctx.strokeStyle = d.color; ctx.lineWidth = 2 * s;
      const needleX = d.x + Math.cos(d.angle) * dialR * 0.8;
      const needleY = dialY - Math.sin(d.angle) * dialR * 0.8;
      ctx.beginPath(); ctx.moveTo(d.x, dialY); ctx.lineTo(needleX, needleY); ctx.stroke();
      // Center dot
      ctx.fillStyle = d.color; ctx.beginPath(); ctx.arc(d.x, dialY, 3 * s, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, d.label, d.x, dialY + dialR + 10 * s, 10 * s, a, "center", d.color);
    });
    drawFBText(ctx, "WEAKEN", W * 0.28, H * 0.68, 8 * s, a * transP, "center", FB.red);
    drawFBText(ctx, "STRENGTHEN", W * 0.72, H * 0.68, 8 * s, a * transP, "center", FB.green);
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ADJUST THE DIALS", W / 2, H * 0.85, 11 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: network edges — feed edges fading red, retreat edges growing green ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6960);
    const transP = interpolate(frame, [25, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Nodes
    const nodes: [number, number][] = [];
    for (let i = 0; i < 8; i++) nodes.push([W * 0.1 + rng() * W * 0.8, H * 0.1 + rng() * H * 0.5]);
    // MN9 (feed target) = node 0, MDN (retreat target) = node 1
    nodes[0] = [W * 0.25, H * 0.55]; nodes[1] = [W * 0.75, H * 0.55];
    // Feed edges (to node 0) — fading
    for (let i = 2; i < 5; i++) {
      const feedA = 0.6 - transP * 0.5;
      drawFBColorEdge(ctx, nodes[i][0], nodes[i][1], nodes[0][0], nodes[0][1], FB.gold, s * (2 - transP * 1.5), a * Math.max(0.1, feedA));
    }
    // Retreat edges (to node 1) — growing
    for (let i = 5; i < 8; i++) {
      const retA = 0.1 + transP * 0.7;
      drawFBColorEdge(ctx, nodes[i][0], nodes[i][1], nodes[1][0], nodes[1][1], FB.blue, s * (0.5 + transP * 2), a * retA);
    }
    // Nodes
    nodes.forEach(([x, y], i) => {
      const ci = i === 0 ? 2 : i === 1 ? 5 : (i + 3) % 8;
      const na = i === 0 ? (0.8 - transP * 0.5) : i === 1 ? (0.3 + transP * 0.6) : 0.5;
      drawFBNode(ctx, x, y, i < 2 ? 10 * s : 5 * s, ci, a * na, frame);
    });
    drawFBText(ctx, "MN9", nodes[0][0], nodes[0][1] + 14 * s, 8 * s, a, "center", FB.gold);
    drawFBText(ctx, "MDN", nodes[1][0], nodes[1][1] + 14 * s, 8 * s, a, "center", FB.blue);
    const endP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN FEED, STRENGTHEN RETREAT", W / 2, H * 0.82, 9 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: slider pair — feed slider going left, retreat slider going right ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const transP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliders = [
      { y: H * 0.3, label: "FEED", knobFrac: 0.75 - transP * 0.6, color: FB.gold },
      { y: H * 0.55, label: "RETREAT", knobFrac: 0.15 + transP * 0.65, color: FB.blue },
    ];
    const sliderW = W * 0.6, sliderX = W * 0.2;
    sliders.forEach((sl) => {
      // Track
      ctx.globalAlpha = a * 0.3; ctx.fillStyle = FB.text.dim;
      ctx.fillRect(sliderX, sl.y - 1.5 * s, sliderW, 3 * s);
      // Filled portion
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = sl.color;
      ctx.fillRect(sliderX, sl.y - 1.5 * s, sliderW * sl.knobFrac, 3 * s);
      // Knob
      ctx.globalAlpha = a; ctx.fillStyle = sl.color;
      ctx.beginPath(); ctx.arc(sliderX + sl.knobFrac * sliderW, sl.y, 5 * s, 0, Math.PI * 2); ctx.fill();
      // Label
      drawFBText(ctx, sl.label, W * 0.1, sl.y, 9 * s, a, "center", sl.color);
      // Percentage
      const pct = Math.round(sl.knobFrac * 100);
      drawFBText(ctx, pct + "%", sliderX + sliderW + 15 * s, sl.y, 8 * s, a, "center", sl.color);
    });
    // Direction labels
    drawFBText(ctx, "WEAKEN", W * 0.3, H * 0.73, 9 * s, a * transP, "center", FB.red);
    drawFBText(ctx, "STRENGTHEN", W * 0.7, H * 0.73, 9 * s, a * transP, "center", FB.green);
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RECIPROCAL ADJUSTMENT", W / 2, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: two volume knobs — feed turning down, retreat turning up ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const transP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const knobs = [
      { x: W * 0.3, label: "FEED", angle: Math.PI * 1.3 - transP * Math.PI * 0.8, color: FB.gold, dir: "DOWN" },
      { x: W * 0.7, label: "RETREAT", angle: Math.PI * 0.5 + transP * Math.PI * 0.8, color: FB.blue, dir: "UP" },
    ];
    const knobY = H * 0.38, knobR = 20 * s;
    knobs.forEach((k) => {
      // Outer ring
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = k.color; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.arc(k.x, knobY, knobR, 0, Math.PI * 2); ctx.stroke();
      // Indicator notch
      ctx.globalAlpha = a; ctx.fillStyle = k.color;
      const nx = k.x + Math.cos(k.angle) * knobR * 0.7;
      const ny = knobY + Math.sin(k.angle) * knobR * 0.7;
      ctx.beginPath(); ctx.arc(nx, ny, 3 * s, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, k.label, k.x, knobY + knobR + 12 * s, 10 * s, a, "center", k.color);
      drawFBText(ctx, k.dir, k.x, knobY + knobR + 24 * s, 7 * s, a * transP, "center", k.dir === "DOWN" ? FB.red : FB.green);
    });
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN FEED, STRENGTHEN RETREAT", W / 2, H * 0.85, 9 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: arrow diagram — gold arrows shrinking, blue arrows growing ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    const transP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Feed arrows (left) — shrinking
    drawFBText(ctx, "FEED PATH", W * 0.25, H * 0.08, 9 * s, a, "center", FB.gold);
    for (let i = 0; i < 4; i++) {
      const y = H * 0.18 + i * H * 0.1;
      const len = (30 - transP * 25) * s;
      ctx.globalAlpha = a * (0.7 - transP * 0.5); ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(W * 0.1, y); ctx.lineTo(W * 0.1 + len, y); ctx.stroke();
      // Arrowhead
      ctx.fillStyle = FB.gold; ctx.beginPath();
      ctx.moveTo(W * 0.1 + len + 3 * s, y); ctx.lineTo(W * 0.1 + len, y - 2 * s); ctx.lineTo(W * 0.1 + len, y + 2 * s); ctx.closePath(); ctx.fill();
    }
    // Retreat arrows (right) — growing
    drawFBText(ctx, "RETREAT PATH", W * 0.75, H * 0.08, 9 * s, a, "center", FB.blue);
    for (let i = 0; i < 4; i++) {
      const y = H * 0.18 + i * H * 0.1;
      const len = (5 + transP * 28) * s;
      ctx.globalAlpha = a * (0.2 + transP * 0.7); ctx.strokeStyle = FB.blue; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(W * 0.58, y); ctx.lineTo(W * 0.58 + len, y); ctx.stroke();
      ctx.fillStyle = FB.blue; ctx.beginPath();
      ctx.moveTo(W * 0.58 + len + 3 * s, y); ctx.lineTo(W * 0.58 + len, y - 2 * s); ctx.lineTo(W * 0.58 + len, y + 2 * s); ctx.closePath(); ctx.fill();
    }
    const labP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SHRINKING", W * 0.25, H * 0.62, 9 * s, a * labP, "center", FB.red);
    drawFBText(ctx, "GROWING", W * 0.75, H * 0.62, 9 * s, a * labP, "center", FB.green);
    const endP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN FEED, STRENGTHEN RETREAT", cx, H * 0.82, 9 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_069: VariantDef[] = [
  { id: "fb-069-v1", label: "Two pathways feed dims retreat brightens", component: V1 },
  { id: "fb-069-v2", label: "Weight bars shrink and grow", component: V2 },
  { id: "fb-069-v3", label: "See-saw feed rises retreat presses down", component: V3 },
  { id: "fb-069-v4", label: "Weight numbers dropping and rising", component: V4 },
  { id: "fb-069-v5", label: "Two dial gauges adjusting", component: V5 },
  { id: "fb-069-v6", label: "Network edges fading and strengthening", component: V6 },
  { id: "fb-069-v7", label: "Slider pair reciprocal adjustment", component: V7 },
  { id: "fb-069-v8", label: "Volume knobs feed down retreat up", component: V8 },
  { id: "fb-069-v9", label: "Arrow diagram shrinking and growing", component: V9 },
];
