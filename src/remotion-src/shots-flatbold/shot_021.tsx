// Shot 021 — "This isn't just a computer model; it's a verified map of a biological machine."
// Duration: 60 frames (2s at 30fps)
// CONCEPT: Network glows green, verified/certified stamp or seal, "VERIFIED" text, polished look
// 9 genuinely different visual metaphors

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  fadeInOut, cellHSL, drawFBColorEdge, drawIconCheckCircle,
  drawFBDashedCircle,
} from "./flatbold-kit";

const DUR = 60;

/* ── V1: Green glow sweep — a wave of green light washes across the network ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Sweep position
    const sweepT = interpolate(frame, [8, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sweepX = -w * 0.2 + sweepT * w * 1.4;
    // Network nodes
    const rng = seeded(2100);
    for (let i = 0; i < 12; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.75;
      const ny = cy + (rng() - 0.5) * h * 0.65;
      const isVerified = nx < sweepX;
      const colorIdx = isVerified ? 3 : 7; // green vs dim
      const nodeA = isVerified ? 0.8 : 0.3;
      drawFBNode(ctx, nx, ny, (4 + rng() * 3) * sc, colorIdx, a * nodeA, frame);
      if (i > 0) {
        const pnx = cx + (rng() - 0.5) * w * 0.75;
        const pny = cy + (rng() - 0.5) * h * 0.65;
        const color = isVerified ? FB.green : `rgba(255,255,255,0.1)`;
        drawFBColorEdge(ctx, nx, ny, pnx, pny, color, sc, a * (isVerified ? 0.4 : 0.1));
      } else { rng(); rng(); }
    }
    // Sweep line
    if (sweepT > 0 && sweepT < 1) {
      ctx.globalAlpha = a * 0.3;
      ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.moveTo(sweepX, 0); ctx.lineTo(sweepX, h); ctx.stroke();
      // Glow around sweep line
      const g = ctx.createLinearGradient(sweepX - 20 * sc, 0, sweepX + 5 * sc, 0);
      g.addColorStop(0, "transparent"); g.addColorStop(0.5, `rgba(110,221,138,0.15)`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(sweepX - 20 * sc, 0, 25 * sc, h);
      ctx.globalAlpha = 1;
    }
    drawFBText(ctx, "VERIFIED", cx, h * 0.93, 13 * sc, a * sweepT, "center", FB.green);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Stamp slam — "VERIFIED" stamp slams down onto the network ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Background network (dim)
    const rng = seeded(2110);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.7;
      const ny = cy + (rng() - 0.5) * h * 0.6;
      drawFBNode(ctx, nx, ny, 5 * sc, 3, a * 0.35, frame);
    }
    // Stamp slams at frame 18
    const stampT = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stampT > 0) {
      const slamScale = stampT < 0.5 ? stampT * 2 * 1.4 : 1 + (1 - stampT) * 0.15;
      const slamY = cy - (1 - stampT) * 30 * sc;
      // Stamp rectangle
      const sw = 80 * sc * Math.min(1, slamScale), sh = 35 * sc * Math.min(1, slamScale);
      ctx.save();
      ctx.translate(cx, slamY);
      ctx.rotate((1 - stampT) * -0.12);
      ctx.globalAlpha = a * stampT * 0.8;
      ctx.strokeStyle = FB.green; ctx.lineWidth = 3 * sc;
      ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);
      // Double border
      ctx.strokeRect(-sw / 2 + 4 * sc, -sh / 2 + 4 * sc, sw - 8 * sc, sh - 8 * sc);
      drawFBText(ctx, "VERIFIED", 0, 0, 16 * sc * Math.min(1, slamScale), a * stampT, "center", FB.green);
      ctx.restore();
      // Impact shockwave
      if (stampT > 0.4 && stampT < 0.8) {
        const shockA = 1 - (stampT - 0.4) / 0.4;
        ctx.globalAlpha = a * shockA * 0.15;
        ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc;
        ctx.beginPath(); ctx.arc(cx, slamY, (stampT - 0.4) * 200 * sc, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Gold seal/badge — scalloped seal appears with "VERIFIED" inside ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    const sealT = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sealR = 45 * sc * sealT;
    // Scalloped seal edge
    ctx.globalAlpha = a * sealT;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 2; t += 0.08) {
      const scallop = sealR + Math.sin(t * 14) * 5 * sc;
      const x = cx + Math.cos(t) * scallop;
      const y = cy + Math.sin(t) * scallop;
      t < 0.01 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.globalAlpha = a * sealT * 0.1;
    ctx.fillStyle = FB.gold; ctx.fill();
    ctx.globalAlpha = a * sealT;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5 * sc; ctx.stroke();
    // Inner circle
    ctx.beginPath(); ctx.arc(cx, cy, sealR - 8 * sc, 0, Math.PI * 2); ctx.stroke();
    // Text inside
    drawFBText(ctx, "VERIFIED", cx, cy - 5 * sc, 11 * sc, a * sealT, "center", FB.gold);
    drawFBText(ctx, "MAP", cx, cy + 9 * sc, 9 * sc, a * sealT, "center", FB.gold);
    ctx.globalAlpha = 1;
    // Ribbon tails
    if (sealT > 0.6) {
      const ribA = (sealT - 0.6) / 0.4;
      ctx.globalAlpha = a * ribA * 0.5;
      ctx.fillStyle = FB.gold;
      // Left ribbon
      ctx.beginPath();
      ctx.moveTo(cx - 15 * sc, cy + sealR); ctx.lineTo(cx - 20 * sc, cy + sealR + 20 * sc);
      ctx.lineTo(cx - 8 * sc, cy + sealR + 14 * sc); ctx.closePath(); ctx.fill();
      // Right ribbon
      ctx.beginPath();
      ctx.moveTo(cx + 15 * sc, cy + sealR); ctx.lineTo(cx + 20 * sc, cy + sealR + 20 * sc);
      ctx.lineTo(cx + 8 * sc, cy + sealR + 14 * sc); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Check marks cascade — check marks appear across the network one by one ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    // Grid of check marks
    const cols = 5, rows = 4;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const cx = w * (0.12 + (c / (cols - 1)) * 0.76);
        const cy = h * (0.15 + (r / (rows - 1)) * 0.6);
        // Node appears first
        const nodeT = interpolate(frame, [3 + idx * 1.5, 8 + idx * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawFBNode(ctx, cx, cy, 6 * sc, 3, a * nodeT * 0.4, frame);
        // Check mark appears after
        const checkT = interpolate(frame, [10 + idx * 1.5, 16 + idx * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (checkT > 0) {
          const bounce = checkT < 0.6 ? checkT / 0.6 * 1.2 : 1 + (1 - checkT) / 0.4 * 0.1;
          drawIconCheckCircle(ctx, cx, cy, 12 * sc * Math.min(1.1, bounce), FB.green, a * checkT);
        }
      }
    }
    drawFBText(ctx, "VERIFIED", w / 2, h * 0.92, 14 * sc, a, "center", FB.green);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Gold certified border — ornate border draws itself around the network ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Central network (green-tinted)
    const rng = seeded(2150);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.45;
      const ny = cy + (rng() - 0.5) * h * 0.4;
      drawFBNode(ctx, nx, ny, 5 * sc, 3, a * 0.5, frame);
      if (i > 0) drawFBEdge(ctx, nx, ny, cx + (rng() - 0.5) * w * 0.45, cy + (rng() - 0.5) * h * 0.4, sc, a * 0.15, frame, 140, 140);
      else { rng(); rng(); }
    }
    // Border draws itself
    const borderT = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const inset = 15 * sc;
    const perimeter = 2 * (w - 2 * inset) + 2 * (h - 2 * inset);
    const drawLen = borderT * perimeter;
    ctx.globalAlpha = a * borderT;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    // Trace border clockwise
    let remaining = drawLen;
    const segments = [
      { x1: inset, y1: inset, x2: w - inset, y2: inset }, // top
      { x1: w - inset, y1: inset, x2: w - inset, y2: h - inset }, // right
      { x1: w - inset, y1: h - inset, x2: inset, y2: h - inset }, // bottom
      { x1: inset, y1: h - inset, x2: inset, y2: inset }, // left
    ];
    let started = false;
    for (const seg of segments) {
      const segLen = Math.sqrt((seg.x2 - seg.x1) ** 2 + (seg.y2 - seg.y1) ** 2);
      if (remaining <= 0) break;
      const drawFrac = Math.min(1, remaining / segLen);
      const ex = seg.x1 + (seg.x2 - seg.x1) * drawFrac;
      const ey = seg.y1 + (seg.y2 - seg.y1) * drawFrac;
      if (!started) { ctx.moveTo(seg.x1, seg.y1); started = true; }
      ctx.lineTo(ex, ey);
      remaining -= segLen;
    }
    ctx.stroke();
    // Corner dots
    if (borderT > 0.8) {
      const dotA = (borderT - 0.8) / 0.2;
      const corners = [[inset, inset], [w - inset, inset], [w - inset, h - inset], [inset, h - inset]];
      for (const [cx2, cy2] of corners) {
        ctx.globalAlpha = a * dotA * 0.6;
        ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(cx2, cy2, 3 * sc, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    drawFBText(ctx, "CERTIFIED", cx, h * 0.92, 12 * sc, a * borderT, "center", FB.gold);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Network pulses green — all edges/nodes pulse with green energy ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const pulseT = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 0.6 + Math.sin(frame * 0.15) * 0.3;
    // Network
    const rng = seeded(2160);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.7;
      const ny = cy + (rng() - 0.5) * h * 0.6;
      nodes.push({ x: nx, y: ny });
    }
    // Green glow behind entire network
    ctx.globalAlpha = a * pulseT * pulse * 0.08;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.4);
    g.addColorStop(0, FB.green); g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    // Edges
    for (let i = 0; i < nodes.length - 1; i++) {
      drawFBColorEdge(ctx, nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y, FB.green, sc, a * pulseT * pulse * 0.4);
    }
    // A few cross-edges
    drawFBColorEdge(ctx, nodes[0].x, nodes[0].y, nodes[5].x, nodes[5].y, FB.green, sc, a * pulseT * pulse * 0.3);
    drawFBColorEdge(ctx, nodes[3].x, nodes[3].y, nodes[8].x, nodes[8].y, FB.green, sc, a * pulseT * pulse * 0.3);
    // Nodes
    for (let i = 0; i < nodes.length; i++) {
      drawFBNode(ctx, nodes[i].x, nodes[i].y, (5 + pulse * 2) * sc, 3, a * pulseT * 0.8, frame);
    }
    drawFBText(ctx, "VERIFIED MAP", cx, h * 0.93, 12 * sc, a * pulseT, "center", FB.green);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Shield badge — shield shape with check mark inside ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    const shieldT = interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shieldW = 50 * sc, shieldH = 65 * sc;
    // Shield shape
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(shieldT, shieldT);
    ctx.globalAlpha = a * shieldT;
    ctx.beginPath();
    ctx.moveTo(0, -shieldH / 2);
    ctx.quadraticCurveTo(shieldW / 2, -shieldH / 2, shieldW / 2, -shieldH * 0.15);
    ctx.quadraticCurveTo(shieldW / 2, shieldH * 0.3, 0, shieldH / 2);
    ctx.quadraticCurveTo(-shieldW / 2, shieldH * 0.3, -shieldW / 2, -shieldH * 0.15);
    ctx.quadraticCurveTo(-shieldW / 2, -shieldH / 2, 0, -shieldH / 2);
    ctx.closePath();
    ctx.globalAlpha = a * shieldT * 0.12;
    ctx.fillStyle = FB.green; ctx.fill();
    ctx.globalAlpha = a * shieldT;
    ctx.strokeStyle = FB.green; ctx.lineWidth = 3 * sc; ctx.stroke();
    ctx.restore();
    // Check mark inside shield
    const checkT = interpolate(frame, [25, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (checkT > 0) {
      drawIconCheckCircle(ctx, cx, cy, 22 * sc * checkT, FB.green, a * checkT);
    }
    drawFBText(ctx, "BIOLOGICAL MACHINE", cx, h * 0.88, 10 * sc, a * shieldT, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Before/after — dim "model" on left transforms to glowing "verified map" on right ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;
    const transT = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left: dim "computer model"
    const leftCx = w * 0.25;
    const rng = seeded(2180);
    for (let i = 0; i < 5; i++) {
      const nx = leftCx + (rng() - 0.5) * w * 0.2;
      const ny = cy + (rng() - 0.5) * h * 0.4;
      drawFBNode(ctx, nx, ny, 4 * sc, 7, a * (1 - transT * 0.3) * 0.3, frame);
    }
    drawFBText(ctx, "MODEL", leftCx, h * 0.87, 9 * sc, a * (1 - transT * 0.5), "center", FB.text.dim);
    // Arrow
    const arrowA = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2192", w / 2, cy, 18 * sc, a * arrowA, "center", FB.gold);
    // Right: glowing green "verified map"
    const rightCx = w * 0.75;
    const rng2 = seeded(2181);
    for (let i = 0; i < 5; i++) {
      const nx = rightCx + (rng2() - 0.5) * w * 0.2;
      const ny = cy + (rng2() - 0.5) * h * 0.4;
      drawFBNode(ctx, nx, ny, 5 * sc, 3, a * transT * 0.8, frame);
    }
    if (transT > 0.5) {
      drawIconCheckCircle(ctx, rightCx, cy - 30 * sc, 14 * sc, FB.green, a * (transT - 0.5) * 2);
    }
    drawFBText(ctx, "VERIFIED MAP", rightCx, h * 0.87, 9 * sc, a * transT, "center", FB.green);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Text reveal with glow — "VERIFIED MAP" letter by letter with green glow bloom ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Background network faintly
    const rng = seeded(2190);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.8;
      const ny = cy + (rng() - 0.5) * h * 0.7;
      drawFBNode(ctx, nx, ny, 4 * sc, 3, a * 0.15, frame);
    }
    // "VERIFIED" text types in
    const word = "VERIFIED";
    const typeT = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const chars = Math.floor(typeT * word.length);
    const shown = word.slice(0, chars);
    // Green glow behind text
    if (chars > 0) {
      ctx.globalAlpha = a * typeT * 0.12;
      const gw = chars * 12 * sc;
      const g = ctx.createRadialGradient(cx, cy - 5 * sc, 0, cx, cy - 5 * sc, gw);
      g.addColorStop(0, FB.green); g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy - 5 * sc, gw, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    drawFBText(ctx, shown, cx, cy - 5 * sc, 22 * sc, a, "center", FB.green);
    // Cursor blink
    if (typeT < 1 && Math.floor(frame / 8) % 2 === 0) {
      ctx.globalAlpha = a * 0.7;
      ctx.fillStyle = FB.green;
      ctx.font = `bold ${22 * sc}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      const tw = ctx.measureText(shown).width;
      ctx.fillRect(cx + tw / 2 + 2 * sc, cy - 5 * sc - 10 * sc, 2 * sc, 20 * sc);
      ctx.globalAlpha = 1;
    }
    // "MAP" appears after VERIFIED
    if (typeT >= 1) {
      const mapT = interpolate(frame, [34, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "MAP", cx, cy + 18 * sc, 16 * sc, a * mapT, "center", FB.gold);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_021: VariantDef[] = [
  { id: "fb021-v1", label: "Green Glow Sweep", component: V1 },
  { id: "fb021-v2", label: "Stamp Slam", component: V2 },
  { id: "fb021-v3", label: "Gold Seal Badge", component: V3 },
  { id: "fb021-v4", label: "Check Marks Cascade", component: V4 },
  { id: "fb021-v5", label: "Gold Certified Border", component: V5 },
  { id: "fb021-v6", label: "Green Pulse Network", component: V6 },
  { id: "fb021-v7", label: "Shield + Check", component: V7 },
  { id: "fb021-v8", label: "Model to Verified Map", component: V8 },
  { id: "fb021-v9", label: "Text Reveal + Glow", component: V9 },
];
