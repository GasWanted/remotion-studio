// Shot 018 — "To fix it, a project called FlyWire opened the data to the public."
// Duration: 120 frames (4s at 30fps)
// CONCEPT: The broken network "opens up" — expands, broadcasts outward, data flows to the world
// 9 genuinely different visual metaphors

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter,
  fadeInOut, cellHSL, drawFBColorEdge, drawFBArrow,
  drawIconGlobe, drawPersonBlob,
} from "./flatbold-kit";

const DUR = 120;

/* ── V1: Network unfolds — compact cluster expands outward like a flower opening ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const expandT = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ease = expandT * expandT * (3 - 2 * expandT);
    const rng = seeded(1800);
    const nodeCount = 14;
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + rng() * 0.5;
      const closeDist = (5 + rng() * 15) * sc;
      const farDist = (40 + rng() * 100) * sc;
      const dist = closeDist + (farDist - closeDist) * ease;
      const nx = cx + Math.cos(angle) * dist;
      const ny = cy + Math.sin(angle) * dist * 0.7;
      drawFBNode(ctx, nx, ny, (4 + rng() * 3) * sc, i % 8, a * 0.7, frame);
      // Edge back to center
      if (ease > 0.3) {
        drawFBEdge(ctx, cx, cy, nx, ny, sc, a * 0.2, frame, 180, 220);
      }
    }
    // Center glow
    ctx.globalAlpha = a * (1 - ease * 0.5) * 0.2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * sc);
    g.addColorStop(0, FB.teal); g.addColorStop(1, "transparent");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 30 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    const textA = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLYWIRE", cx, h * 0.92, 14 * sc, a * textA, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Data streams radiate — lines of light shoot out from center to all directions ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Central data source
    drawFBNode(ctx, cx, cy, 10 * sc, 4, a, frame);
    // Radiating data streams
    const streamCount = 16;
    const rng = seeded(1810);
    for (let i = 0; i < streamCount; i++) {
      const angle = (i / streamCount) * Math.PI * 2;
      const speed = 0.8 + rng() * 0.4;
      const startFrame = 15 + rng() * 20;
      const streamT = interpolate(frame, [startFrame, startFrame + 50 * speed], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (streamT <= 0) continue;
      const maxDist = Math.max(w, h) * 0.6;
      const headDist = streamT * maxDist;
      const tailDist = Math.max(0, headDist - 30 * sc);
      const hx = cx + Math.cos(angle) * headDist;
      const hy = cy + Math.sin(angle) * headDist;
      const tx = cx + Math.cos(angle) * tailDist;
      const ty = cy + Math.sin(angle) * tailDist;
      const [hue] = cellHSL(i % 8);
      ctx.globalAlpha = a * (1 - streamT * 0.5) * 0.6;
      ctx.strokeStyle = `hsla(${hue}, 60%, 65%, 0.7)`;
      ctx.lineWidth = 2 * sc;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke();
      // Data dot at head
      ctx.fillStyle = `hsla(${hue}, 60%, 75%, 0.8)`;
      ctx.beginPath(); ctx.arc(hx, hy, 2 * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawFBText(ctx, "OPENED TO THE PUBLIC", cx, h * 0.08, 10 * sc, a * interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Globe receiving data — network sends data arcs to a globe icon ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    // Left: small network
    const netCx = w * 0.22, netCy = h / 2;
    const rng = seeded(1820);
    for (let i = 0; i < 6; i++) {
      const nx = netCx + (rng() - 0.5) * w * 0.2;
      const ny = netCy + (rng() - 0.5) * h * 0.35;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * 0.6, frame);
    }
    // Right: globe
    const globeX = w * 0.75, globeY = h / 2;
    const globeT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawIconGlobe(ctx, globeX, globeY, 50 * sc * globeT, FB.teal, a * globeT);
    // Data arcs flying from network to globe
    const arcCount = 8;
    for (let i = 0; i < arcCount; i++) {
      const arcStart = 30 + i * 8;
      const arcT = interpolate(frame, [arcStart, arcStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (arcT <= 0 || arcT >= 1) continue;
      const sx = netCx + (rng() - 0.5) * w * 0.15;
      const sy = netCy + (rng() - 0.5) * h * 0.25;
      const px = sx + (globeX - sx) * arcT;
      const py = sy + (globeY - sy) * arcT - Math.sin(arcT * Math.PI) * 30 * sc;
      const [hue] = cellHSL(i);
      ctx.globalAlpha = a * (1 - Math.abs(arcT - 0.5) * 2) * 0.8;
      ctx.fillStyle = `hsla(${hue}, 60%, 70%, 0.8)`;
      ctx.beginPath(); ctx.arc(px, py, 3 * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawFBText(ctx, "FLYWIRE", w / 2, h * 0.08, 12 * sc, a, "center", FB.teal);
    drawFBText(ctx, "DATA → WORLD", w / 2, h * 0.93, 10 * sc, a * globeT, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Barriers lifting — walls around the network rise up and disappear ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    // Network in center
    const rng = seeded(1830);
    for (let i = 0; i < 8; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.35;
      const ny = cy + (rng() - 0.5) * h * 0.35;
      drawFBNode(ctx, nx, ny, 5 * sc, i, a * 0.7, frame);
    }
    // Four walls around the network — they lift up and fade
    const liftT = interpolate(frame, [20, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const liftEase = liftT * liftT * (3 - 2 * liftT);
    const wallInset = 35 * sc;
    const wallAlpha = a * (1 - liftEase) * 0.5;
    const liftOffset = liftEase * 80 * sc;
    // Top wall
    ctx.globalAlpha = wallAlpha;
    ctx.fillStyle = "rgba(232,80,80,0.3)";
    ctx.fillRect(wallInset, wallInset - liftOffset, w - 2 * wallInset, 4 * sc);
    // Bottom wall
    ctx.fillRect(wallInset, h - wallInset + liftOffset, w - 2 * wallInset, 4 * sc);
    // Left wall
    ctx.fillRect(wallInset - liftOffset, wallInset, 4 * sc, h - 2 * wallInset);
    // Right wall
    ctx.fillRect(w - wallInset + liftOffset, wallInset, 4 * sc, h - 2 * wallInset);
    ctx.globalAlpha = 1;
    // After walls gone: "OPEN" text
    if (liftEase > 0.7) {
      const openA = (liftEase - 0.7) / 0.3;
      drawFBText(ctx, "OPEN", cx, h * 0.9, 18 * sc, a * openA, "center", FB.green);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Lock icon opening — padlock unlocks and data spills out ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.4;
    // Lock body
    const lockW = 40 * sc, lockH = 30 * sc;
    ctx.globalAlpha = a * 0.7;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(cx - lockW / 2, cy, lockW, lockH);
    // Shackle (opens)
    const openT = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shackleR = 14 * sc;
    const shackleOpen = openT * 0.8; // radians of opening
    ctx.strokeStyle = openT > 0.5 ? FB.green : FB.text.dim;
    ctx.lineWidth = 4 * sc;
    ctx.beginPath();
    // Left part stays fixed
    ctx.moveTo(cx - shackleR, cy);
    ctx.arc(cx, cy - shackleR * 0.3, shackleR, Math.PI, Math.PI * 2 - shackleOpen);
    ctx.stroke();
    // Keyhole
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = FB.bg;
    ctx.beginPath(); ctx.arc(cx, cy + lockH * 0.35, 4 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 1.5 * sc, cy + lockH * 0.35, 3 * sc, 8 * sc);
    ctx.globalAlpha = 1;
    // After unlock: data dots flow outward
    if (openT > 0.5) {
      const flowT = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rng = seeded(1850);
      const dotCount = Math.floor(flowT * 30);
      for (let i = 0; i < dotCount; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = (20 + rng() * 100) * sc * flowT;
        const dx = cx + Math.cos(angle) * dist;
        const dy = cy + lockH / 2 + Math.sin(angle) * dist * 0.6;
        const [hue] = cellHSL(Math.floor(rng() * 8));
        ctx.globalAlpha = a * (1 - flowT * 0.5) * 0.5;
        ctx.fillStyle = `hsla(${hue}, 55%, 65%, 0.7)`;
        ctx.beginPath(); ctx.arc(dx, dy, 2 * sc, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    drawFBText(ctx, "FLYWIRE", cx, h * 0.08, 12 * sc, a, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Broadcast tower — central tower sends signal rings outward ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.35;
    // Tower (simple triangle + antenna)
    ctx.globalAlpha = a * 0.7;
    ctx.fillStyle = FB.teal;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25 * sc);
    ctx.lineTo(cx - 12 * sc, cy + 15 * sc);
    ctx.lineTo(cx + 12 * sc, cy + 15 * sc);
    ctx.closePath(); ctx.fill();
    // Antenna line
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(cx, cy - 25 * sc); ctx.lineTo(cx, cy - 40 * sc); ctx.stroke();
    ctx.globalAlpha = 1;
    // Broadcasting rings
    for (let r = 0; r < 5; r++) {
      const ringT = ((frame - r * 15) / 50) % 1;
      if (ringT < 0) continue;
      const radius = ringT * Math.max(w, h) * 0.5;
      ctx.globalAlpha = a * (1 - ringT) * 0.25;
      ctx.strokeStyle = FB.teal;
      ctx.lineWidth = 2 * sc;
      ctx.beginPath();
      ctx.arc(cx, cy - 30 * sc, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // People receiving at the edges
    const receiveT = interpolate(frame, [40, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (receiveT > 0) {
      const positions = [
        { x: w * 0.1, y: h * 0.75 }, { x: w * 0.3, y: h * 0.85 },
        { x: w * 0.5, y: h * 0.8 }, { x: w * 0.7, y: h * 0.85 },
        { x: w * 0.9, y: h * 0.75 },
      ];
      for (let i = 0; i < positions.length; i++) {
        const pT = Math.min(1, Math.max(0, (receiveT - i * 0.15) * 3));
        drawPersonBlob(ctx, positions[i].x, positions[i].y, 12 * sc, i, a * pT * 0.6);
      }
    }
    drawFBText(ctx, "OPEN DATA", cx, h * 0.08, 12 * sc, a, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Envelope opening — sealed data envelope unfolds, contents spread ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.4;
    const envW = 70 * sc, envH = 45 * sc;
    // Envelope body
    ctx.globalAlpha = a * 0.6;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(cx - envW / 2, cy - envH / 4, envW, envH);
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * sc;
    ctx.strokeRect(cx - envW / 2, cy - envH / 4, envW, envH);
    // Flap opening
    const flapT = interpolate(frame, [15, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flapAngle = flapT * Math.PI * 0.6;
    ctx.save();
    ctx.translate(cx, cy - envH / 4);
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = FB.text.dim;
    ctx.beginPath();
    ctx.moveTo(-envW / 2, 0);
    ctx.lineTo(0, -Math.cos(flapAngle) * envH * 0.4);
    ctx.lineTo(envW / 2, 0);
    ctx.closePath();
    ctx.fill(); ctx.strokeStyle = FB.teal; ctx.lineWidth = 1 * sc; ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
    // Documents / data flying out
    if (flapT > 0.5) {
      const flyT = interpolate(frame, [35, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rng = seeded(1870);
      for (let i = 0; i < 12; i++) {
        const angle = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 0.8;
        const dist = (20 + rng() * 100) * sc * flyT;
        const dx = cx + Math.cos(angle) * dist;
        const dy = cy - envH / 2 + Math.sin(angle) * dist;
        const sz = (3 + rng() * 4) * sc;
        drawFBNode(ctx, dx, dy, sz, Math.floor(rng() * 8), a * (1 - flyT * 0.4) * 0.6, frame);
      }
    }
    drawFBText(ctx, "FLYWIRE", cx, h * 0.9, 12 * sc, a, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Network splits open — like curtains parting to reveal data ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const splitT = interpolate(frame, [20, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const splitEase = splitT * splitT * (3 - 2 * splitT);
    const splitDist = splitEase * w * 0.25;
    // Left cluster moves left
    const rng = seeded(1880);
    for (let i = 0; i < 6; i++) {
      const nx = cx - 30 * sc + (rng() - 0.5) * 40 * sc - splitDist;
      const ny = cy + (rng() - 0.5) * h * 0.5;
      drawFBNode(ctx, nx, ny, 5 * sc, i, a * 0.6, frame);
    }
    // Right cluster moves right
    for (let i = 0; i < 6; i++) {
      const nx = cx + 30 * sc + (rng() - 0.5) * 40 * sc + splitDist;
      const ny = cy + (rng() - 0.5) * h * 0.5;
      drawFBNode(ctx, nx, ny, 5 * sc, i + 2, a * 0.6, frame);
    }
    // Center: revealed data/light
    if (splitEase > 0.3) {
      const revealA = (splitEase - 0.3) / 0.7;
      ctx.globalAlpha = a * revealA * 0.15;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, splitDist * 1.5);
      g.addColorStop(0, FB.teal); g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      drawFBText(ctx, "PUBLIC", cx, cy, 16 * sc, a * revealA, "center", FB.teal);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Doors opening — two door panels swing open revealing a glowing network ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const openT = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const doorW = w * 0.4 * (1 - openT);
    // Behind the doors: glowing network
    const rng = seeded(1890);
    for (let i = 0; i < 10; i++) {
      const nx = cx + (rng() - 0.5) * w * 0.5;
      const ny = cy + (rng() - 0.5) * h * 0.5;
      const visible = nx > cx - w / 2 + doorW && nx < cx + w / 2 - doorW;
      if (visible || openT > 0.8) {
        drawFBNode(ctx, nx, ny, (4 + rng() * 3) * sc, i % 8, a * openT * 0.7, frame);
      }
    }
    // Left door
    ctx.globalAlpha = a * 0.6;
    ctx.fillStyle = "rgba(42,31,53,0.9)";
    ctx.fillRect(0, 0, cx - w / 2 + doorW + w / 2, h);
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(cx - w * 0.5 * (1 - openT), 0);
    ctx.lineTo(cx - w * 0.5 * (1 - openT), h); ctx.stroke();
    // Right door
    ctx.fillRect(cx + w / 2 - doorW, 0, doorW + w / 2, h);
    ctx.beginPath(); ctx.moveTo(cx + w * 0.5 * (1 - openT), 0);
    ctx.lineTo(cx + w * 0.5 * (1 - openT), h); ctx.stroke();
    ctx.globalAlpha = 1;
    // Handle dots
    if (openT < 0.5) {
      ctx.globalAlpha = a * (1 - openT * 2) * 0.5;
      ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx - 8 * sc, cy, 3 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 8 * sc, cy, 3 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    const textA = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "OPENED TO THE PUBLIC", cx, h * 0.92, 10 * sc, a * textA, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_018: VariantDef[] = [
  { id: "fb018-v1", label: "Network Unfolds", component: V1 },
  { id: "fb018-v2", label: "Data Streams Radiate", component: V2 },
  { id: "fb018-v3", label: "Globe Receives Data", component: V3 },
  { id: "fb018-v4", label: "Barriers Lift", component: V4 },
  { id: "fb018-v5", label: "Lock Opens", component: V5 },
  { id: "fb018-v6", label: "Broadcast Tower", component: V6 },
  { id: "fb018-v7", label: "Envelope Opens", component: V7 },
  { id: "fb018-v8", label: "Network Splits Open", component: V8 },
  { id: "fb018-v9", label: "Doors Swing Open", component: V9 },
];
