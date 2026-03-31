import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 036 — "You breed a fly with a light-sensitive protein in one specific
   type of neuron. When you shine a red light, only that neuron fires."
   210 frames (7s). Red light → one neuron fires while others stay quiet. */

const DUR = 210;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Fly outline with neuron grid — red light hits, ONE fires ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Phase 1: fly breeding — small fly cell appears (0-60)
    const breedP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BREED", W * 0.15, H * 0.12, 9, a * breedP, "center", FB.text.dim);
    drawFBNode(ctx, W * 0.15, H * 0.35, 12, 3, a * breedP, frame);
    // Phase 2: protein inserted — one neuron turns red (40-100)
    const protP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neurons: { x: number; y: number }[] = [];
    for (let i = 0; i < 9; i++) {
      neurons.push({ x: W * 0.45 + (i % 3) * W * 0.12, y: H * 0.2 + Math.floor(i / 3) * H * 0.2 });
    }
    neurons.forEach((n, i) => {
      const isTarget = i === 4;
      if (isTarget && protP > 0) {
        ctx.globalAlpha = a * protP * 0.3;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 15);
        g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 15, 0, Math.PI * 2); ctx.fill();
      }
      drawFBNode(ctx, n.x, n.y, 6, isTarget && protP > 0.5 ? 0 : 4, a * protP);
    });
    drawFBText(ctx, "LIGHT-SENSITIVE", W * 0.62, H * 0.08, 8, a * protP, "center", FB.red);
    drawFBText(ctx, "PROTEIN", W * 0.62, H * 0.15, 8, a * protP, "center", FB.red);
    // Phase 3: red light shines (100-160)
    const lightP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightP > 0) {
      ctx.globalAlpha = a * lightP * 0.2; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = a * lightP * 0.5; ctx.fillStyle = FB.red;
      ctx.beginPath();
      ctx.moveTo(W * 0.55, 0); ctx.lineTo(neurons[4].x - 12, neurons[4].y - 10);
      ctx.lineTo(neurons[4].x + 12, neurons[4].y - 10); ctx.lineTo(W * 0.65, 0);
      ctx.closePath(); ctx.fill();
    }
    // Phase 4: ONLY target neuron fires (140-210)
    const fireP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      const target = neurons[4];
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2;
        const sLen = fireP * 20;
        ctx.globalAlpha = a * fireP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(target.x + Math.cos(ang) * 8, target.y + Math.sin(ang) * 8);
        ctx.lineTo(target.x + Math.cos(ang) * (8 + sLen), target.y + Math.sin(ang) * (8 + sLen));
        ctx.stroke();
      }
      drawFBText(ctx, "FIRES!", target.x, target.y + 22, 9, a * fireP, "center", FB.red);
      drawFBText(ctx, "quiet", neurons[0].x, neurons[0].y + 12, 6, a * fireP, "center", FB.text.dim);
      drawFBText(ctx, "quiet", neurons[8].x, neurons[8].y + 12, 6, a * fireP, "center", FB.text.dim);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Timeline — breed → insert protein → shine light → fire ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const steps = [
      { label: "BREED FLY", x: W * 0.12 },
      { label: "ADD PROTEIN", x: W * 0.35 },
      { label: "SHINE RED", x: W * 0.58 },
      { label: "ONE FIRES", x: W * 0.82 },
    ];
    const lineY = H * 0.45;
    const lineP = interpolate(frame, [10, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.08, lineY); ctx.lineTo(W * 0.92, lineY); ctx.stroke();
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.08, lineY); ctx.lineTo(W * 0.08 + lineP * W * 0.84, lineY); ctx.stroke();
    steps.forEach((s, i) => {
      const t = stagger(frame, i, 35, 25);
      const ci = i === 3 ? 0 : i + 3;
      drawFBNode(ctx, s.x, lineY, 8, ci, a * t, frame);
      drawFBText(ctx, s.label, s.x, lineY + 20, 7, a * t, "center", i === 3 ? FB.red : FB.text.primary);
    });
    // Red light cone at step 3
    const lightP = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightP > 0) {
      ctx.globalAlpha = a * lightP * 0.2; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.moveTo(steps[2].x, lineY - 8);
      ctx.lineTo(steps[2].x - 15, lineY - 30); ctx.lineTo(steps[2].x + 15, lineY - 30);
      ctx.closePath(); ctx.fill();
    }
    // Spike at step 4
    const fireP = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      for (let sp = 0; sp < 5; sp++) {
        const ang = (sp / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.globalAlpha = a * fireP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(steps[3].x + Math.cos(ang) * 10, lineY + Math.sin(ang) * 10);
        ctx.lineTo(steps[3].x + Math.cos(ang) * 22, lineY + Math.sin(ang) * 22);
        ctx.stroke();
      }
    }
    drawFBText(ctx, "ONLY THAT NEURON", W / 2, H * 0.88, 10, a * lineP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Single large neuron — protein dots appear, light washes, spike ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    drawFBNode(ctx, cx, cy, 22, 4, a, frame);
    const protP = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3603);
    for (let i = 0; i < 8; i++) {
      const ang = rng() * Math.PI * 2, dist = 10 + rng() * 10;
      const px = cx + Math.cos(ang) * dist, py = cy + Math.sin(ang) * dist;
      const t = stagger(frame, i, 5, 12);
      ctx.globalAlpha = a * t * protP * 0.7; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "PROTEIN INSERTED", cx, H * 0.12, 8, a * protP, "center", FB.red);
    const lightP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightP > 0) {
      ctx.globalAlpha = a * lightP * 0.2; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
      drawFBText(ctx, "RED LIGHT ON", cx, H * 0.08, 9, a * lightP, "center", FB.red);
    }
    const fireP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      ctx.globalAlpha = a * (1 - fireP) * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 22 + fireP * 30, 0, Math.PI * 2); ctx.stroke();
      for (let s = 0; s < 8; s++) {
        const ang = (s / 8) * Math.PI * 2;
        ctx.globalAlpha = a * fireP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 24, cy + Math.sin(ang) * 24);
        ctx.lineTo(cx + Math.cos(ang) * (24 + fireP * 25), cy + Math.sin(ang) * (24 + fireP * 25));
        ctx.stroke();
      }
      drawFBText(ctx, "SPIKE!", cx, cy + 40, 12, a * fireP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Side-by-side — normal neuron dark vs modified neuron reacts to red ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const leftX = W * 0.25, rightX = W * 0.75, cy = H * 0.42;
    drawFBText(ctx, "NORMAL", leftX, H * 0.1, 9, a, "center", FB.text.dim);
    drawFBText(ctx, "MODIFIED", rightX, H * 0.1, 9, a, "center", FB.red);
    drawFBNode(ctx, leftX, cy, 14, 4, a, frame);
    drawFBNode(ctx, rightX, cy, 14, 0, a, frame);
    const protP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(3604);
    for (let i = 0; i < 6; i++) {
      const ang = rng() * Math.PI * 2, dist = 6 + rng() * 7;
      ctx.globalAlpha = a * protP * 0.6; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(rightX + Math.cos(ang) * dist, cy + Math.sin(ang) * dist, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    const lightP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightP > 0) {
      ctx.globalAlpha = a * lightP * 0.15; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
      drawFBText(ctx, "RED LIGHT", W / 2, H * 0.78, 10, a * lightP, "center", FB.red);
    }
    const resultP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resultP > 0) {
      drawFBText(ctx, "nothing", leftX, cy + 25, 8, a * resultP, "center", FB.text.dim);
      for (let s = 0; s < 6; s++) {
        const ang = (s / 6) * Math.PI * 2;
        ctx.globalAlpha = a * resultP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rightX + Math.cos(ang) * 16, cy + Math.sin(ang) * 16);
        ctx.lineTo(rightX + Math.cos(ang) * (16 + resultP * 20), cy + Math.sin(ang) * (16 + resultP * 20));
        ctx.stroke();
      }
      drawFBText(ctx, "FIRES!", rightX, cy + 25, 10, a * resultP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: DNA helix with protein gene splice ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const helixP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 12; i++) {
      const y = H * 0.15 + (i / 11) * H * 0.55;
      const wave = Math.sin(i * 0.8 + frame * 0.03) * W * 0.06;
      const t = stagger(frame, i, 4, 15);
      drawFBNode(ctx, W * 0.22 + wave, y, 3, i % 8, a * t * helixP, frame);
      drawFBNode(ctx, W * 0.22 - wave, y, 3, (i + 4) % 8, a * t * helixP, frame);
      ctx.globalAlpha = a * t * helixP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.22 + wave, y); ctx.lineTo(W * 0.22 - wave, y); ctx.stroke();
    }
    const insertP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const insertY = H * 0.15 + 5 * (H * 0.55 / 11);
    if (insertP > 0) {
      ctx.globalAlpha = a * insertP * 0.4;
      const ig = ctx.createRadialGradient(W * 0.22, insertY, 0, W * 0.22, insertY, 20);
      ig.addColorStop(0, FB.red); ig.addColorStop(1, "rgba(232,80,80,0)");
      ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(W * 0.22, insertY, 20, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "PROTEIN GENE", W * 0.22, insertY + 18, 7, a * insertP, "center", FB.red);
    }
    const arrowP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrowP * 0.5; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.38, H * 0.45); ctx.lineTo(W * 0.38 + arrowP * W * 0.2, H * 0.45); ctx.stroke();
    drawFBNode(ctx, W * 0.72, H * 0.45, 14, 0, a * arrowP, frame);
    const lightP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lightP > 0) {
      ctx.globalAlpha = a * lightP * 0.15; ctx.fillStyle = FB.red; ctx.fillRect(W * 0.55, 0, W * 0.45, H);
    }
    const fireP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      ctx.globalAlpha = a * (1 - fireP) * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W * 0.72, H * 0.45, 14 + fireP * 25, 0, Math.PI * 2); ctx.stroke();
      drawFBText(ctx, "FIRES!", W * 0.72, H * 0.72, 11, a * fireP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Row of neurons, red light sweeps — only one reacts ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.42;
    const count = 7, targetIdx = 3;
    const spacing = W * 0.11;
    const startX = W / 2 - ((count - 1) * spacing) / 2;
    const sweepX = interpolate(frame, [60, 160], [W * 0.02, W * 0.98], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.12; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, sweepX, H);
    for (let i = 0; i < count; i++) {
      const nx = startX + i * spacing;
      const isTarget = i === targetIdx;
      const appear = stagger(frame, i, 6, 15);
      drawFBNode(ctx, nx, cy, 8, isTarget ? 0 : 5, a * appear, frame);
      if (isTarget) drawFBText(ctx, "HAS PROTEIN", nx, cy - 16, 6, a * appear, "center", FB.red);
      if (Math.abs(nx - sweepX) < 20 && frame > 60 && isTarget) {
        ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        for (let s = 0; s < 5; s++) {
          const ang = (s / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(nx + Math.cos(ang) * 10, cy + Math.sin(ang) * 10);
          ctx.lineTo(nx + Math.cos(ang) * 22, cy + Math.sin(ang) * 22);
          ctx.stroke();
        }
      }
      if (sweepX > nx + 20 && frame > 70) {
        drawFBText(ctx, isTarget ? "FIRED" : "quiet", nx, cy + 18, 6, a * 0.7, "center", isTarget ? FB.red : FB.text.dim);
      }
    }
    drawFBText(ctx, "ONLY THE MODIFIED NEURON RESPONDS", W / 2, H * 0.88, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Before/after split — dark brain vs red-lit, one spark ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.05); ctx.lineTo(W / 2, H * 0.95); ctx.stroke();
    drawFBText(ctx, "BEFORE LIGHT", W * 0.25, H * 0.08, 8, a, "center", FB.text.dim);
    drawFBText(ctx, "AFTER LIGHT", W * 0.75, H * 0.08, 8, a, "center", FB.red);
    const rng = seeded(3607);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 7; i++) {
      nodes.push({ x: W * 0.08 + rng() * W * 0.32, y: H * 0.2 + rng() * H * 0.55 });
      const t = stagger(frame, i, 8, 15);
      drawFBNode(ctx, nodes[i].x, nodes[i].y, 5, i === 3 ? 0 : 5, a * t, frame);
    }
    const afterP = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    nodes.forEach((n, i) => {
      const nx = n.x + W * 0.5;
      drawFBNode(ctx, nx, n.y, 5, i === 3 ? 0 : 5, a * afterP, frame);
      if (i === 3 && afterP > 0.5) {
        const sparkP = (afterP - 0.5) * 2;
        for (let s = 0; s < 6; s++) {
          const ang = (s / 6) * Math.PI * 2 + frame * 0.05;
          ctx.globalAlpha = a * sparkP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(nx + Math.cos(ang) * 7, n.y + Math.sin(ang) * 7);
          ctx.lineTo(nx + Math.cos(ang) * (7 + sparkP * 18), n.y + Math.sin(ang) * (7 + sparkP * 18));
          ctx.stroke();
        }
        ctx.globalAlpha = a * sparkP * 0.3;
        const g = ctx.createRadialGradient(nx, n.y, 0, nx, n.y, 25);
        g.addColorStop(0, FB.red); g.addColorStop(1, "rgba(232,80,80,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, n.y, 25, 0, Math.PI * 2); ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Lock-and-key — red light is key, protein is lock ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const lockP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy, 16, 0, a * lockP, frame);
    ctx.globalAlpha = a * lockP * 0.7; ctx.fillStyle = "#1a1020";
    ctx.beginPath(); ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 2, cy - 3, 4, 8);
    drawFBText(ctx, "PROTEIN", cx, cy + 25, 7, a * lockP, "center", FB.red);
    const keyP = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const keyX = W * 0.08 + keyP * (cx - W * 0.08 - 20);
    ctx.globalAlpha = a * keyP * 0.8; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(keyX - 8, cy, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(keyX - 2, cy - 2, 12, 4);
    ctx.fillRect(keyX + 6, cy - 4, 2, 3); ctx.fillRect(keyX + 10, cy - 4, 2, 3);
    drawFBText(ctx, "RED LIGHT", keyX - 5, cy - 14, 7, a * keyP, "center", FB.red);
    const unlockP = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (unlockP > 0) {
      const flashR = unlockP * 35;
      ctx.globalAlpha = a * (1 - unlockP) * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, flashR, 0, Math.PI * 2); ctx.stroke();
      drawFBText(ctx, "NEURON FIRES", cx, H * 0.78, 11, a * unlockP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Equation: fly + gene = controllable neuron ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cy = H * 0.3;
    const eqP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.15, cy, 10, 3, a * eqP, frame);
    drawFBText(ctx, "FLY", W * 0.15, cy + 18, 8, a * eqP, "center", FB.text.primary);
    drawFBText(ctx, "+", W * 0.3, cy, 14, a * eqP, "center", FB.text.dim);
    ctx.save(); ctx.translate(W * 0.45, cy); ctx.rotate(Math.PI / 4);
    ctx.globalAlpha = a * eqP; ctx.fillStyle = FB.red;
    ctx.fillRect(-6, -6, 12, 12); ctx.restore();
    drawFBText(ctx, "GENE", W * 0.45, cy + 18, 8, a * eqP, "center", FB.red);
    drawFBText(ctx, "=", W * 0.58, cy, 14, a * eqP, "center", FB.text.dim);
    drawFBNode(ctx, W * 0.75, cy, 12, 0, a * eqP, frame);
    drawFBText(ctx, "READY", W * 0.75, cy + 18, 7, a * eqP, "center", FB.red);
    const demoP = interpolate(frame, [90, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const demoY = H * 0.65;
    drawFBNode(ctx, W * 0.35, demoY, 10, 0, a * demoP, frame);
    if (demoP > 0) {
      ctx.globalAlpha = a * demoP * 0.4; ctx.fillStyle = FB.red;
      ctx.beginPath();
      ctx.moveTo(W * 0.35 - 8, demoY - 12); ctx.lineTo(W * 0.35 - 20, 0);
      ctx.lineTo(W * 0.35 + 20, 0); ctx.lineTo(W * 0.35 + 8, demoY - 12);
      ctx.closePath(); ctx.fill();
    }
    const fireP = interpolate(frame, [150, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      ctx.globalAlpha = a * fireP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W * 0.35, demoY, 10 + fireP * 20, 0, Math.PI * 2); ctx.stroke();
      drawFBText(ctx, "ONLY THIS ONE FIRES", W * 0.65, demoY, 9, a * fireP, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_036: VariantDef[] = [
  { id: "fb-036-v1", label: "Fly with neuron grid, one fires under red light", component: V1 },
  { id: "fb-036-v2", label: "Timeline breed-insert-shine-fire", component: V2 },
  { id: "fb-036-v3", label: "Single neuron gains protein then spikes", component: V3 },
  { id: "fb-036-v4", label: "Side-by-side normal vs modified", component: V4 },
  { id: "fb-036-v5", label: "DNA helix with protein gene splice", component: V5 },
  { id: "fb-036-v6", label: "Red light sweeps row, only one reacts", component: V6 },
  { id: "fb-036-v7", label: "Before/after split, one spark", component: V7 },
  { id: "fb-036-v8", label: "Lock-and-key: light is key, protein is lock", component: V8 },
  { id: "fb-036-v9", label: "Equation: fly + gene = controllable neuron", component: V9 },
];
