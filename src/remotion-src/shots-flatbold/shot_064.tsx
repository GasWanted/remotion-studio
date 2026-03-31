import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 64 — "I needed to know exactly which connections controlled feeding
   and which ones controlled retreat." — 120 frames (4s) */

// ---------- V1: two branching pathways from brain — FEED(gold) vs RETREAT(blue) ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Brain node at top center
    const brainP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.12, 14 * s, 6, a * brainP, frame);
    drawFBText(ctx, "BRAIN", cx, H * 0.12, 7 * s, a * brainP * 0.7, "center", FB.bg);
    // Feed pathway (left, gold)
    const feedP = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const feedNodes: [number, number][] = [[cx - 25 * s, H * 0.28], [cx - 40 * s, H * 0.42], [cx - 30 * s, H * 0.58]];
    feedNodes.forEach(([x, y], i) => {
      const t = interpolate(frame, [25 + i * 8, 35 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, x, y, 7 * s, 2, a * t, frame);
      if (i > 0) drawFBColorEdge(ctx, feedNodes[i - 1][0], feedNodes[i - 1][1], x, y, FB.gold, s, a * t);
    });
    drawFBColorEdge(ctx, cx, H * 0.12 + 14 * s, feedNodes[0][0], feedNodes[0][1], FB.gold, s, a * feedP);
    drawFBText(ctx, "FEED", cx - 35 * s, H * 0.68, 11 * s, a * feedP, "center", FB.gold);
    // Retreat pathway (right, blue)
    const retP = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retNodes: [number, number][] = [[cx + 25 * s, H * 0.28], [cx + 40 * s, H * 0.42], [cx + 30 * s, H * 0.58]];
    retNodes.forEach(([x, y], i) => {
      const t = interpolate(frame, [45 + i * 8, 55 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, x, y, 7 * s, 5, a * t, frame);
      if (i > 0) drawFBColorEdge(ctx, retNodes[i - 1][0], retNodes[i - 1][1], x, y, FB.blue, s, a * t);
    });
    drawFBColorEdge(ctx, cx, H * 0.12 + 14 * s, retNodes[0][0], retNodes[0][1], FB.blue, s, a * retP);
    drawFBText(ctx, "RETREAT", cx + 35 * s, H * 0.68, 11 * s, a * retP, "center", FB.blue);
    // "WHICH IS WHICH?"
    const qP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHICH CONNECTIONS CONTROL WHAT?", cx, H * 0.85, 9 * s, a * qP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: magnifying glass scanning connections, labeling gold/blue ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6420);
    // Network
    const nodes: [number, number][] = [];
    for (let i = 0; i < 8; i++) nodes.push([W * 0.12 + rng() * W * 0.76, H * 0.1 + rng() * H * 0.5]);
    for (let i = 0; i < 10; i++) {
      const fi = Math.floor(rng() * 8), ti = Math.floor(rng() * 8);
      if (fi !== ti) drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.text.dim, s * 0.4, a * 0.3);
    }
    nodes.forEach(([x, y], i) => drawFBNode(ctx, x, y, 5 * s, i % 8, a, frame));
    // Magnifying glass scanning
    const scanP = interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const magX = interpolate(scanP, [0, 0.5, 1], [W * 0.15, W * 0.5, W * 0.85]);
    const magY = H * 0.35;
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(magX, magY, 15 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(magX + 10 * s, magY + 10 * s); ctx.lineTo(magX + 20 * s, magY + 20 * s); ctx.stroke();
    // Labels appear as scanner passes
    if (scanP > 0.2) drawFBText(ctx, "FEED", W * 0.25, H * 0.7, 10 * s, a * Math.min(1, (scanP - 0.2) * 3), "center", FB.gold);
    if (scanP > 0.6) drawFBText(ctx, "RETREAT", W * 0.7, H * 0.7, 10 * s, a * Math.min(1, (scanP - 0.6) * 3), "center", FB.blue);
    const endP = interpolate(frame, [95, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MAPPING THE PATHWAYS", W / 2, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: two colored streams splitting from shared tangle ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Tangle in center
    const tangleP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    const rng = seeded(643);
    for (let i = 0; i < 12; i++) {
      const x = cx + (rng() - 0.5) * 40 * s;
      const y = H * 0.25 + (rng() - 0.5) * 20 * s;
      drawFBNode(ctx, x, y, 3 * s, Math.floor(rng() * 8), a * tangleP, frame);
    }
    drawFBText(ctx, "139K NEURONS", cx, H * 0.08, 8 * s, a * tangleP, "center", FB.text.dim);
    // Gold stream splitting left-down
    const goldP = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * goldP * 0.4; ctx.strokeStyle = FB.gold; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(cx - 10 * s, H * 0.3);
    ctx.quadraticCurveTo(cx - 30 * s, H * 0.45, W * 0.2, H * 0.65); ctx.stroke();
    drawFBNode(ctx, W * 0.2, H * 0.65, 10 * s, 2, a * goldP, frame);
    drawFBText(ctx, "FEED", W * 0.2, H * 0.78, 12 * s, a * goldP, "center", FB.gold);
    // Blue stream splitting right-down
    const blueP = interpolate(frame, [45, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * blueP * 0.4; ctx.strokeStyle = FB.blue; ctx.lineWidth = 4 * s;
    ctx.beginPath(); ctx.moveTo(cx + 10 * s, H * 0.3);
    ctx.quadraticCurveTo(cx + 30 * s, H * 0.45, W * 0.8, H * 0.65); ctx.stroke();
    drawFBNode(ctx, W * 0.8, H * 0.65, 10 * s, 5, a * blueP, frame);
    drawFBText(ctx, "RETREAT", W * 0.8, H * 0.78, 12 * s, a * blueP, "center", FB.blue);
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FIND THE PATHWAYS", cx, H * 0.92, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: question marks on connections, then two get highlighted ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const rng = seeded(644);
    // 7 nodes
    const nodes: [number, number][] = [];
    for (let i = 0; i < 7; i++) nodes.push([W * 0.1 + rng() * W * 0.8, H * 0.12 + rng() * H * 0.45]);
    // All connections with ? marks
    const edges: [number, number][] = [];
    for (let i = 0; i < 9; i++) {
      const fi = Math.floor(rng() * 7), ti = Math.floor(rng() * 7);
      if (fi !== ti) edges.push([fi, ti]);
    }
    edges.forEach(([fi, ti], idx) => {
      const t = interpolate(frame, [5 + idx * 4, 12 + idx * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.text.dim, s * 0.5, a * t * 0.3);
      const mx = (nodes[fi][0] + nodes[ti][0]) / 2, my = (nodes[fi][1] + nodes[ti][1]) / 2;
      drawFBText(ctx, "?", mx, my, 7 * s, a * t * 0.4, "center", FB.text.dim);
    });
    nodes.forEach(([x, y], i) => drawFBNode(ctx, x, y, 5 * s, i % 8, a, frame));
    // Highlight feed edge (gold)
    const hlFeedP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (edges.length > 1) {
      const [fi, ti] = edges[0];
      drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.gold, s * 2, a * hlFeedP);
      drawFBText(ctx, "FEED", (nodes[fi][0] + nodes[ti][0]) / 2, (nodes[fi][1] + nodes[ti][1]) / 2 - 8 * s, 8 * s, a * hlFeedP, "center", FB.gold);
    }
    // Highlight retreat edge (blue)
    const hlRetP = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (edges.length > 3) {
      const [fi, ti] = edges[3];
      drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], FB.blue, s * 2, a * hlRetP);
      drawFBText(ctx, "RETREAT", (nodes[fi][0] + nodes[ti][0]) / 2, (nodes[fi][1] + nodes[ti][1]) / 2 - 8 * s, 8 * s, a * hlRetP, "center", FB.blue);
    }
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHICH CONTROLS WHICH?", W / 2, H * 0.85, 11 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: two target icons — gold bullseye for feed, blue for retreat ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Feed target (left)
    const feedP = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
    const feedX = W * 0.3, feedY = H * 0.38;
    for (let r = 3; r >= 1; r--) {
      ctx.globalAlpha = a * feedP * (0.15 + (3 - r) * 0.15);
      ctx.fillStyle = FB.gold; ctx.beginPath();
      ctx.arc(feedX, feedY, r * 10 * s, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "FEED", feedX, feedY + 35 * s, 14 * s, a * feedP, "center", FB.gold);
    drawFBText(ctx, "MN9 pathway", feedX, feedY + 48 * s, 7 * s, a * feedP, "center", FB.text.dim);
    // Retreat target (right)
    const retP = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retX = W * 0.7, retY = H * 0.38;
    for (let r = 3; r >= 1; r--) {
      ctx.globalAlpha = a * retP * (0.15 + (3 - r) * 0.15);
      ctx.fillStyle = FB.blue; ctx.beginPath();
      ctx.arc(retX, retY, r * 10 * s, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "RETREAT", retX, retY + 35 * s, 14 * s, a * retP, "center", FB.blue);
    drawFBText(ctx, "MDN pathway", retX, retY + 48 * s, 7 * s, a * retP, "center", FB.text.dim);
    const endP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NEEDED TO KNOW EXACTLY", W / 2, H * 0.85, 11 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: labeled flow diagram — sensory input → decision → FEED or RETREAT ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Input
    const inP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.1, H * 0.4, 10 * s, 4, a * inP, frame);
    drawFBText(ctx, "SUGAR", W * 0.1, H * 0.4 + 16 * s, 7 * s, a * inP, "center", FB.text.dim);
    // Processing
    const procP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, W * 0.18, H * 0.4, cx - 12 * s, H * 0.4, FB.text.dim, s, a * procP);
    drawFBNode(ctx, cx, H * 0.4, 12 * s, 6, a * procP, frame);
    drawFBText(ctx, "???", cx, H * 0.4, 8 * s, a * procP, "center", FB.bg);
    // Fork to feed
    const feedP = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, cx + 12 * s, H * 0.35, W * 0.82, H * 0.2, FB.gold, s * 1.5, a * feedP);
    drawFBNode(ctx, W * 0.88, H * 0.2, 10 * s, 2, a * feedP, frame);
    drawFBText(ctx, "FEED", W * 0.88, H * 0.2 + 16 * s, 10 * s, a * feedP, "center", FB.gold);
    // Fork to retreat
    const retP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBColorEdge(ctx, cx + 12 * s, H * 0.45, W * 0.82, H * 0.6, FB.blue, s * 1.5, a * retP);
    drawFBNode(ctx, W * 0.88, H * 0.6, 10 * s, 5, a * retP, frame);
    drawFBText(ctx, "RETREAT", W * 0.88, H * 0.6 + 16 * s, 10 * s, a * retP, "center", FB.blue);
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHICH PATH DOES WHAT?", cx, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: two keys — gold key "FEED", blue key "RETREAT" ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Gold key
    const keyP1 = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
    const kx1 = W * 0.3, ky = H * 0.38;
    ctx.save(); ctx.translate(kx1, ky); ctx.globalAlpha = a * keyP1;
    // Key head (circle)
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(0, -8 * s, 10 * s, 0, Math.PI * 2); ctx.stroke();
    // Key shaft
    ctx.beginPath(); ctx.moveTo(0, 2 * s); ctx.lineTo(0, 22 * s); ctx.stroke();
    // Key teeth
    ctx.beginPath(); ctx.moveTo(0, 14 * s); ctx.lineTo(6 * s, 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 20 * s); ctx.lineTo(6 * s, 20 * s); ctx.stroke();
    ctx.restore();
    drawFBText(ctx, "FEED", kx1, ky + 32 * s, 12 * s, a * keyP1, "center", FB.gold);
    // Blue key
    const keyP2 = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const kx2 = W * 0.7;
    ctx.save(); ctx.translate(kx2, ky); ctx.globalAlpha = a * keyP2;
    ctx.strokeStyle = FB.blue; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(0, -8 * s, 10 * s, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 2 * s); ctx.lineTo(0, 22 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 14 * s); ctx.lineTo(6 * s, 14 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 20 * s); ctx.lineTo(6 * s, 20 * s); ctx.stroke();
    ctx.restore();
    drawFBText(ctx, "RETREAT", kx2, ky + 32 * s, 12 * s, a * keyP2, "center", FB.blue);
    const endP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FIND THE RIGHT KEYS", W / 2, H * 0.85, 11 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: binary sort — connections sliding into gold or blue columns ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    // Column headers
    drawFBText(ctx, "FEED", W * 0.25, H * 0.08, 12 * s, a, "center", FB.gold);
    drawFBText(ctx, "RETREAT", W * 0.75, H * 0.08, 12 * s, a, "center", FB.blue);
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.12, 2, H * 0.6);
    // Synapses sorting into columns
    const rng = seeded(648);
    for (let i = 0; i < 10; i++) {
      const t = interpolate(frame, [10 + i * 7, 25 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const isFeed = rng() > 0.5;
      const targetX = isFeed ? W * 0.15 + rng() * W * 0.2 : W * 0.6 + rng() * W * 0.2;
      const targetY = H * 0.18 + (i % 5) * H * 0.11;
      const startX = W * 0.5;
      const x = startX + (targetX - startX) * t;
      drawFBNode(ctx, x, targetY, 4 * s, isFeed ? 2 : 5, a * t, frame);
    }
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SORT EVERY CONNECTION", W / 2, H * 0.88, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: spotlight sweeping across network, revealing gold and blue zones ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const rng = seeded(649);
    // Grid of small neurons
    const cells: { x: number; y: number; type: "feed" | "retreat" | "other" }[] = [];
    for (let i = 0; i < 30; i++) {
      const x = W * 0.08 + rng() * W * 0.84;
      const y = H * 0.08 + rng() * H * 0.6;
      const type = rng() < 0.25 ? "feed" : rng() < 0.5 ? "retreat" : "other";
      cells.push({ x, y, type });
    }
    // Spotlight sweep
    const spotX = interpolate(frame, [10, 90], [W * 0.05, W * 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    cells.forEach((c) => {
      const dist = Math.abs(c.x - spotX);
      const lit = dist < 30 * s;
      const col = c.type === "feed" ? 2 : c.type === "retreat" ? 5 : 7;
      const nodeAlpha = lit ? 0.9 : 0.15;
      drawFBNode(ctx, c.x, c.y, 4 * s, col, a * nodeAlpha, frame);
      if (lit && c.type !== "other") {
        drawFBText(ctx, c.type === "feed" ? "F" : "R", c.x, c.y - 7 * s, 5 * s, a * 0.8, "center", c.type === "feed" ? FB.gold : FB.blue);
      }
    });
    // Spotlight beam
    ctx.globalAlpha = a * 0.08;
    const grad = ctx.createRadialGradient(spotX, H * 0.35, 0, spotX, H * 0.35, 35 * s);
    grad.addColorStop(0, "rgba(255,255,255,0.3)"); grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(spotX - 35 * s, 0, 70 * s, H * 0.7);
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FINDING FEED vs RETREAT", W / 2, H * 0.85, 10 * s, a * endP, "center", FB.text.primary);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_064: VariantDef[] = [
  { id: "fb-064-v1", label: "Two branching pathways FEED vs RETREAT", component: V1 },
  { id: "fb-064-v2", label: "Magnifying glass scans connections", component: V2 },
  { id: "fb-064-v3", label: "Gold and blue streams from tangle", component: V3 },
  { id: "fb-064-v4", label: "Question marks then highlighted", component: V4 },
  { id: "fb-064-v5", label: "Bullseye targets feed and retreat", component: V5 },
  { id: "fb-064-v6", label: "Flow diagram sensory to two outputs", component: V6 },
  { id: "fb-064-v7", label: "Two keys gold FEED blue RETREAT", component: V7 },
  { id: "fb-064-v8", label: "Connections sorting into two columns", component: V8 },
  { id: "fb-064-v9", label: "Spotlight reveals gold and blue zones", component: V9 },
];
