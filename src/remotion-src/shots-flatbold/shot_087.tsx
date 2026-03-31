import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 87 — "'Choice' is just the output of a wiring diagram. And diagrams can be edited." — 300 frames. FADE TO BLACK. */

// ---------- V1: Brain-as-document with cursor editing, fade to black ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 50);
    const cx = W / 2, cy = H * 0.38;
    // Document outline
    const docP = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * docP * 0.25;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy - 32);
    ctx.lineTo(cx + 18, cy - 32);
    ctx.lineTo(cx + 28, cy - 22);
    ctx.lineTo(cx + 28, cy + 32);
    ctx.lineTo(cx - 28, cy + 32);
    ctx.closePath();
    ctx.stroke();
    // Page fold
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 32);
    ctx.lineTo(cx + 18, cy - 22);
    ctx.lineTo(cx + 28, cy - 22);
    ctx.stroke();
    // Wire-like code lines
    const rng = seeded(8700);
    for (let i = 0; i < 7; i++) {
      const lineP = interpolate(frame, [15 + i * 4, 25 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ly = cy - 22 + i * 8;
      const lw = (14 + rng() * 22) * lineP;
      ctx.globalAlpha = a * docP * lineP * 0.45;
      ctx.fillStyle = FB.colors[i % 8];
      ctx.fillRect(cx - 22, ly, lw, 2);
    }
    // Blinking cursor traveling across lines
    const cursorP = interpolate(frame, [50, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const curLine = Math.floor(cursorP * 6);
    const cursorY = cy - 22 + curLine * 8;
    if (Math.sin(frame * 0.2) > -0.3) {
      ctx.globalAlpha = a * 0.85;
      ctx.fillStyle = FB.gold;
      ctx.fillRect(cx - 22 + cursorP * 38, cursorY - 4, 1.5, 10);
    }
    // Labels
    const t1 = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "YOUR BRAIN", cx, H * 0.74, 10, a * t1, "center", FB.purple);
    drawFBText(ctx, "IS A DOCUMENT", cx, H * 0.84, 9, a * t1, "center", FB.text.dim);
    // Fade to black
    const darken = interpolate(frame, [230, 300], [0, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: "CHOICE = WIRING" equation building, then "CAN BE CHANGED" ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 50);
    const cx = W / 2, cy = H * 0.32;
    const t1 = interpolate(frame, [12, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOICE", cx - 22, cy, 15, a * t1, "right", FB.gold);
    const t2 = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", cx, cy, 15, a * t2, "center", FB.text.dim);
    const t3 = interpolate(frame, [45, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRING", cx + 25, cy, 15, a * t3, "left", FB.teal);
    // Underline
    if (t3 > 0.5) {
      ctx.globalAlpha = a * (t3 - 0.5) * 2;
      ctx.fillStyle = FB.gold;
      ctx.fillRect(cx - 48, cy + 13, 96, 2);
    }
    // Second revelation
    const t4 = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRING CAN BE CHANGED", cx, H * 0.52, 9, a * t4, "center", FB.text.primary);
    const t5 = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THEREFORE", cx, H * 0.65, 7, a * t5, "center", FB.text.dim);
    const t6 = interpolate(frame, [170, 205], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOICE CAN BE CHANGED", cx, H * 0.76, 12, a * t6, "center", FB.red);
    // Fade to black
    const darken = interpolate(frame, [240, 300], [0, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Network being rewired in real time — edges dissolve, new ones form ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useMemo(() => {
    const rng = seeded(8701);
    return Array.from({ length: 10 }, () => ({
      x: rng() * W * 0.7 + W * 0.15,
      y: rng() * H * 0.5 + H * 0.1,
    }));
  }, [W, H]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 50);
    const editP = interpolate(frame, [70, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Original edges (some fading)
    const rng2 = seeded(8702);
    for (let i = 0; i < 12; i++) {
      const a1 = Math.floor(rng2() * 10);
      const a2 = Math.floor(rng2() * 10);
      if (a1 !== a2) {
        const fade = i < 5 ? (1 - editP) : 1;
        drawFBEdge(ctx, nodes[a1].x, nodes[a1].y, nodes[a2].x, nodes[a2].y, 1, a * 0.2 * fade, frame);
      }
    }
    // New golden edges
    if (editP > 0.2) {
      const newP = (editP - 0.2) / 0.8;
      const newEdges = [[0, 7], [2, 9], [4, 6], [1, 8]];
      newEdges.forEach(([n1, n2], i) => {
        const ep = Math.max(0, Math.min(1, newP * 2 - i * 0.2));
        drawFBColorEdge(ctx, nodes[n1].x, nodes[n1].y, nodes[n2].x, nodes[n2].y, FB.gold, 1.2, a * ep * 0.5);
      });
    }
    // Nodes
    nodes.forEach((n, i) => {
      const t = interpolate(frame, [i * 3, i * 3 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, n.x, n.y, 3.5, i % 8, a * t, frame);
    });
    // "REWIRED"
    const rewP = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REWIRED", W / 2, H * 0.82, 12, a * rewP, "center", FB.gold);
    // Fade
    const darken = interpolate(frame, [230, 300], [0, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H, nodes]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: "DIAGRAMS CAN BE EDITED." — massive final statement, slow fade ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 60);
    const cx = W / 2, cy = H * 0.38;
    const t1 = interpolate(frame, [18, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DIAGRAMS", cx, cy - 12, 18, a * t1, "center", FB.teal);
    const t2 = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CAN BE", cx, cy + 8, 11, a * t2, "center", FB.text.dim);
    const t3 = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EDITED", cx, cy + 28, 22, a * t3, "center", FB.gold);
    // Period with finality
    const dotP = interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * dotP;
    ctx.fillStyle = FB.gold;
    ctx.beginPath();
    ctx.arc(cx + 36, cy + 28 + 4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Slow complete fade to black
    const darken = interpolate(frame, [170, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Blueprint grid with wiring erased and redrawn in gold ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 50);
    // Blueprint grid
    const gridP = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * gridP * 0.05;
    ctx.strokeStyle = FB.blue;
    ctx.lineWidth = 0.5;
    for (let x = W * 0.06; x < W * 0.94; x += W * 0.07) {
      ctx.beginPath(); ctx.moveTo(x, H * 0.05); ctx.lineTo(x, H * 0.82); ctx.stroke();
    }
    for (let y = H * 0.05; y < H * 0.82; y += H * 0.1) {
      ctx.beginPath(); ctx.moveTo(W * 0.06, y); ctx.lineTo(W * 0.94, y); ctx.stroke();
    }
    // Old wiring fading
    const rng = seeded(8703);
    const eraseP = interpolate(frame, [35, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 8; i++) {
      const x1 = W * 0.1 + rng() * W * 0.35;
      const y1 = H * 0.1 + rng() * H * 0.55;
      const x2 = W * 0.5 + rng() * W * 0.35;
      const y2 = H * 0.1 + rng() * H * 0.55;
      const fade = i < 4 ? Math.max(0, 1 - eraseP * 2) : 1;
      drawFBColorEdge(ctx, x1, y1, x2, y2, FB.blue, 0.8, a * gridP * 0.25 * fade);
    }
    // New golden wiring drawn in
    const drawP = interpolate(frame, [120, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng2 = seeded(8704);
    for (let i = 0; i < 5; i++) {
      const p = Math.max(0, Math.min(1, drawP * 2 - i * 0.25));
      const x1 = W * 0.12 + rng2() * W * 0.3;
      const y1 = H * 0.12 + rng2() * H * 0.5;
      const x2 = W * 0.5 + rng2() * W * 0.3;
      const y2 = H * 0.12 + rng2() * H * 0.5;
      if (p > 0) {
        drawFBColorEdge(ctx, x1, y1, x2, y2, FB.gold, 1.2, a * p * 0.5);
      }
    }
    // Label
    const labelP = interpolate(frame, [190, 220], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REWRITTEN", W / 2, H * 0.88, 12, a * labelP, "center", FB.gold);
    // Fade
    const darken = interpolate(frame, [240, 300], [0, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Philosophical text cascade — "we like to think..." fading ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 60);
    const cx = W / 2;
    const t1 = interpolate(frame, [12, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WE LIKE TO THINK", cx, H * 0.18, 9, a * t1, "center", FB.text.primary);
    const t2 = interpolate(frame, [35, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "OUR CHOICES", cx, H * 0.3, 13, a * t2, "center", FB.gold);
    const t3 = interpolate(frame, [58, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BELONG TO US", cx, H * 0.42, 13, a * t3, "center", FB.gold);
    // Counter-argument
    const t4 = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BUT", cx, H * 0.56, 9, a * t4, "center", FB.text.dim);
    const t5 = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOICE IS JUST", cx, H * 0.66, 9, a * t5, "center", FB.text.primary);
    const t6 = interpolate(frame, [172, 205], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE OUTPUT", cx, H * 0.76, 13, a * t6, "center", FB.red);
    const t7 = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "OF A WIRING DIAGRAM", cx, H * 0.86, 9, a * t7, "center", FB.red);
    // Fade to black
    const darken = interpolate(frame, [240, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Input → WIRING BOX → Output, "EDITABLE" stamp slams on wiring ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 50);
    const cy = H * 0.4;
    // Input node
    const t1 = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.1, cy, 6, 5, a * t1, frame);
    drawFBText(ctx, "INPUT", W * 0.1, cy + 14, 6, a * t1, "center", FB.blue);
    // Wiring box
    const boxP = interpolate(frame, [22, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * boxP * 0.2;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W * 0.28, cy - 14, W * 0.38, 28);
    // Internal wires
    const rng = seeded(8705);
    for (let i = 0; i < 5; i++) {
      const wx = W * 0.3 + rng() * W * 0.15;
      const wy = cy - 10 + rng() * 20;
      const wx2 = W * 0.48 + rng() * W * 0.15;
      const wy2 = cy - 10 + rng() * 20;
      drawFBEdge(ctx, wx, wy, wx2, wy2, 0.7, a * boxP * 0.2);
    }
    drawFBText(ctx, "WIRING", W * 0.47, cy, 7, a * boxP * 0.6, "center", FB.text.dim);
    // Arrows
    ctx.globalAlpha = a * boxP * 0.3;
    ctx.strokeStyle = FB.blue;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W * 0.17, cy); ctx.lineTo(W * 0.27, cy); ctx.stroke();
    // Output node
    const t2 = interpolate(frame, [48, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = FB.gold;
    ctx.beginPath();
    ctx.moveTo(W * 0.67, cy); ctx.lineTo(W * 0.77, cy); ctx.stroke();
    drawFBNode(ctx, W * 0.84, cy, 6, 3, a * t2, frame);
    drawFBText(ctx, "CHOICE", W * 0.84, cy + 14, 6, a * t2, "center", FB.gold);
    // "EDITABLE" stamp
    const stampP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stampP > 0) {
      const scale = 1 + Math.max(0, 1 - (frame - 100) / 20) * 0.5;
      ctx.save();
      ctx.translate(W * 0.47, cy);
      ctx.scale(scale, scale);
      ctx.rotate(-0.12);
      ctx.globalAlpha = a * stampP * 0.75;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 2;
      ctx.strokeRect(-20, -9, 40, 18);
      drawFBText(ctx, "EDITABLE", 0, 0, 7, a * stampP, "center", FB.red);
      ctx.restore();
    }
    // Fade to black
    const darken = interpolate(frame, [230, 300], [0, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Contemplation — three dots, "choice is wiring", slow fade ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 300, 8, 70);
    const cx = W / 2, cy = H * 0.34;
    // Statement
    const t1 = interpolate(frame, [12, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHOICE", cx, cy - 8, 16, a * t1, "center", FB.gold);
    const t2 = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IS WIRING", cx, cy + 12, 11, a * t2, "center", FB.teal);
    // Three contemplation dots
    for (let i = 0; i < 3; i++) {
      const dotP = interpolate(frame, [80 + i * 16, 95 + i * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * dotP;
      ctx.fillStyle = FB.text.dim;
      ctx.beginPath();
      ctx.arc(cx - 8 + i * 8, H * 0.56, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // "AND WIRING CAN BE EDITED"
    const t3 = interpolate(frame, [145, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "AND WIRING", cx, H * 0.7, 9, a * t3, "center", FB.text.primary);
    const t4 = interpolate(frame, [178, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CAN BE EDITED", cx, H * 0.8, 12, a * t4, "center", FB.red);
    // Total fade to black
    const darken = interpolate(frame, [210, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Near-black with "DIAGRAMS CAN BE EDITED." emerging then sinking ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    // Start near-black
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    // Very faint background particles barely visible
    drawFBBg(ctx, W, H, frame);
    ctx.fillStyle = "#0a0710";
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, W, H);
    const a = fadeInOut(frame, 300, 30, 80);
    const cx = W / 2;
    // Words emerging from darkness
    const t1 = interpolate(frame, [45, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DIAGRAMS", cx, H * 0.36, 15, a * t1, "center", FB.text.dim);
    const t2 = interpolate(frame, [85, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CAN BE", cx, H * 0.48, 9, a * t2, "center", FB.text.dim);
    const t3 = interpolate(frame, [115, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EDITED.", cx, H * 0.6, 20, a * t3, "center", FB.gold);
    // Complete fade to total black
    const darken = interpolate(frame, [190, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = darken;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_087: VariantDef[] = [
  { id: "fb-087-v1", label: "Brain as editable document cursor", component: V1 },
  { id: "fb-087-v2", label: "CHOICE = WIRING equation builds", component: V2 },
  { id: "fb-087-v3", label: "Network edges dissolve and reform", component: V3 },
  { id: "fb-087-v4", label: "DIAGRAMS CAN BE EDITED massive", component: V4 },
  { id: "fb-087-v5", label: "Blueprint wiring erased redrawn", component: V5 },
  { id: "fb-087-v6", label: "Philosophical text cascade fading", component: V6 },
  { id: "fb-087-v7", label: "Input wiring output EDITABLE stamp", component: V7 },
  { id: "fb-087-v8", label: "Contemplation dots slow fade", component: V8 },
  { id: "fb-087-v9", label: "Near-black EDITED emerges sinks", component: V9 },
];
