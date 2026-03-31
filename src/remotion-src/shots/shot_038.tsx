import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 38 — "If the total crosses a threshold — it fires, and sends its own signal out to every neuron on the other end."
// 120 frames (4s). Neuron FIRES, signal splits to three outputs.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Central neuron flashes bright, three output lines shoot signals to three target neurons
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s, 38001), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width * 0.3, cy = height * 0.5;
    const fireT = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const signalT = interpolate(frame, [35, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Charge glow
    if (fireT > 0) {
      const glowR = 40 * s * fireT;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g.addColorStop(0, `hsla(55, 90%, 80%, ${fireT * 0.6})`);
      g.addColorStop(1, `hsla(55, 90%, 80%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
    }
    drawNeuron(ctx, cx, cy, 30 * s, `hsla(220, 55%, ${62 + fireT * 25}%, 0.9)`, frame);
    // Three targets
    const targets = [
      { x: width * 0.75, y: height * 0.2 },
      { x: width * 0.8, y: height * 0.5 },
      { x: width * 0.75, y: height * 0.8 },
    ];
    for (let i = 0; i < 3; i++) {
      const t = targets[i];
      drawNeuron(ctx, t.x, t.y, 20 * s, `hsla(${PALETTE.cellColors[i][0]}, 50%, 55%, 0.7)`, frame);
      if (signalT > 0) {
        const px = cx + (t.x - cx) * signalT;
        const py = cy + (t.y - cy) * signalT;
        ctx.strokeStyle = `hsla(55, 80%, 70%, ${(1 - signalT) * 0.7})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(cx + 27 * s, cy); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.fillStyle = `hsla(55, 90%, 80%, ${(1 - signalT * 0.5) * 0.9})`;
        ctx.beginPath(); ctx.arc(px, py, 4 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Explosion effect from neuron, three shockwaves radiating to targets
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s, 38002), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width * 0.35, cy = height * 0.5;
    const chargeT = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bangT = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const waveT = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuron(ctx, cx, cy, 28 * s, `hsla(350, 65%, ${60 + chargeT * 30}%, 0.9)`, frame);
    // Explosion flash
    if (bangT > 0 && bangT < 1) {
      const flash = (1 - bangT);
      ctx.fillStyle = `hsla(45, 100%, 90%, ${flash * 0.5})`;
      ctx.beginPath(); ctx.arc(cx, cy, 50 * s * bangT, 0, Math.PI * 2); ctx.fill();
    }
    // Shockwaves
    const angles = [-Math.PI / 4, 0, Math.PI / 4];
    for (let i = 0; i < 3; i++) {
      if (waveT > 0) {
        const dist = waveT * width * 0.5;
        const tx = cx + Math.cos(angles[i]) * dist;
        const ty = cy + Math.sin(angles[i]) * dist;
        ctx.strokeStyle = `hsla(${PALETTE.cellColors[i + 1][0]}, 60%, 65%, ${(1 - waveT) * 0.6})`;
        ctx.lineWidth = 3 * s * (1 - waveT);
        ctx.beginPath(); ctx.arc(tx, ty, 15 * s * (1 - waveT * 0.5), 0, Math.PI * 2); ctx.stroke();
        // Expanding ring
        ctx.strokeStyle = `hsla(55, 70%, 70%, ${(1 - waveT) * 0.3})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(cx, cy, dist, angles[i] - 0.2, angles[i] + 0.2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron charges up (glow intensifies), then BANG — three arrows shoot right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 38003), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width * 0.22, cy = height * 0.5;
    const chargeT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fireFrame = 45;
    const arrowT = interpolate(frame, [fireFrame, fireFrame + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Charging glow
    const glowR = 20 * s + chargeT * 35 * s;
    const glowAlpha = chargeT * 0.5 * (frame < fireFrame ? 1 : Math.max(0, 1 - (frame - fireFrame) / 15));
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    g.addColorStop(0, `hsla(45, 100%, 85%, ${glowAlpha})`);
    g.addColorStop(1, `hsla(45, 100%, 85%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, glowR, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, cx, cy, 30 * s, `hsla(25, 75%, ${55 + chargeT * 30}%, 0.9)`, frame);
    // Three arrows
    const yOffsets = [-height * 0.22, 0, height * 0.22];
    for (let i = 0; i < 3; i++) {
      if (arrowT > 0) {
        const ax = cx + 30 * s + arrowT * (width * 0.65);
        const ay = cy + yOffsets[i] * arrowT;
        ctx.strokeStyle = `hsla(${PALETTE.cellColors[i + 2][0]}, 65%, 65%, ${(1 - arrowT * 0.5) * 0.8})`;
        ctx.lineWidth = 3 * s;
        ctx.beginPath(); ctx.moveTo(cx + 27 * s, cy); ctx.lineTo(ax, ay); ctx.stroke();
        // Arrowhead
        const ang = Math.atan2(ay - cy, ax - cx);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 8 * s * Math.cos(ang - 0.4), ay - 8 * s * Math.sin(ang - 0.4));
        ctx.lineTo(ax - 8 * s * Math.cos(ang + 0.4), ay - 8 * s * Math.sin(ang + 0.4));
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Single pulse splits into three at a fork in the axon
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s, 38004), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const startX = width * 0.1, midX = width * 0.45, cy = height * 0.5;
    const endPoints = [
      { x: width * 0.85, y: height * 0.2 },
      { x: width * 0.9, y: height * 0.5 },
      { x: width * 0.85, y: height * 0.8 },
    ];
    // Draw axon path
    ctx.strokeStyle = `hsla(220, 40%, 45%, 0.5)`;
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(startX, cy); ctx.lineTo(midX, cy); ctx.stroke();
    for (const ep of endPoints) {
      ctx.beginPath(); ctx.moveTo(midX, cy); ctx.lineTo(ep.x, ep.y); ctx.stroke();
    }
    // Fork circle
    ctx.fillStyle = `hsla(220, 40%, 55%, 0.3)`;
    ctx.beginPath(); ctx.arc(midX, cy, 6 * s, 0, Math.PI * 2); ctx.fill();
    // Traveling pulse
    const pulseT = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const splitT = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pulseT > 0 && pulseT < 1) {
      const px = startX + (midX - startX) * pulseT;
      ctx.fillStyle = `hsla(55, 90%, 80%, 0.9)`;
      ctx.beginPath(); ctx.arc(px, cy, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
    if (splitT > 0) {
      for (let i = 0; i < 3; i++) {
        const ep = endPoints[i];
        const px = midX + (ep.x - midX) * splitT;
        const py = cy + (ep.y - cy) * splitT;
        ctx.fillStyle = `hsla(${PALETTE.cellColors[i][0]}, 70%, 70%, ${(1 - splitT * 0.5) * 0.9})`;
        ctx.beginPath(); ctx.arc(px, py, 4 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron with bar crossing threshold line, then signal pulses out three directions
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 38005), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Voltage bar on left
    const barX = width * 0.12, barY = height * 0.15, barW = 18 * s, barH = height * 0.6;
    const threshY = barY + barH * 0.25;
    const fillT = interpolate(frame, [5, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillH = barH * fillT;
    // Bar bg
    ctx.fillStyle = `hsla(220, 30%, 20%, 0.5)`;
    ctx.fillRect(barX, barY, barW, barH);
    // Fill
    const crossed = fillT > 0.75;
    ctx.fillStyle = crossed ? `hsla(55, 90%, 65%, 0.8)` : `hsla(220, 50%, 55%, 0.6)`;
    ctx.fillRect(barX, barY + barH - fillH, barW, fillH);
    // Threshold line
    ctx.strokeStyle = PALETTE.accent.red;
    ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(barX - 5 * s, threshY); ctx.lineTo(barX + barW + 5 * s, threshY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("threshold", barX + barW + 6 * s, threshY + 3 * s);
    // Central neuron
    const ncx = width * 0.42, ncy = height * 0.5;
    drawNeuron(ctx, ncx, ncy, 28 * s, crossed ? `hsla(55, 80%, 75%, 0.9)` : `hsla(220, 55%, 60%, 0.8)`, frame);
    // Output signals
    const sigT = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crossed && sigT > 0) {
      const targets = [
        { x: width * 0.82, y: height * 0.2 },
        { x: width * 0.85, y: height * 0.55 },
        { x: width * 0.8, y: height * 0.85 },
      ];
      for (let i = 0; i < 3; i++) {
        const t = targets[i];
        const px = ncx + (t.x - ncx) * sigT;
        const py = ncy + (t.y - ncy) * sigT;
        ctx.strokeStyle = `hsla(55, 60%, 60%, ${(1 - sigT) * 0.5})`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(ncx + 25 * s, ncy); ctx.lineTo(t.x, t.y); ctx.stroke();
        ctx.fillStyle = `hsla(55, 80%, 75%, ${(1 - sigT * 0.5)})`;
        ctx.beginPath(); ctx.arc(px, py, 4 * s, 0, Math.PI * 2); ctx.fill();
        drawNeuron(ctx, t.x, t.y, 16 * s, `hsla(${PALETTE.cellColors[i + 3][0]}, 50%, 55%, 0.6)`, frame);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Domino: neuron fires, triggers chain to 3 neighbors
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 38006), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Chain: source -> mid -> 3 targets
    const src = { x: width * 0.15, y: height * 0.5 };
    const mid = { x: width * 0.45, y: height * 0.5 };
    const targets = [
      { x: width * 0.78, y: height * 0.2 },
      { x: width * 0.82, y: height * 0.5 },
      { x: width * 0.78, y: height * 0.8 },
    ];
    const fire1 = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const travel = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fire2 = interpolate(frame, [45, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spread = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Connection lines
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(mid.x, mid.y); ctx.stroke();
    for (const t of targets) {
      ctx.beginPath(); ctx.moveTo(mid.x, mid.y); ctx.lineTo(t.x, t.y); ctx.stroke();
    }
    // Source neuron fires
    const srcLit = fire1 > 0 ? Math.min(1, fire1 * 2) : 0;
    drawNeuron(ctx, src.x, src.y, 24 * s, `hsla(350, 60%, ${55 + srcLit * 30}%, 0.9)`, frame);
    // Traveling pulse src -> mid
    if (travel > 0 && travel < 1) {
      const px = src.x + (mid.x - src.x) * travel;
      ctx.fillStyle = `hsla(55, 90%, 80%, ${(1 - travel) * 0.8})`;
      ctx.beginPath(); ctx.arc(px, src.y, 4 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Mid neuron
    const midLit = fire2 > 0 ? Math.min(1, fire2 * 2) : 0;
    drawNeuron(ctx, mid.x, mid.y, 24 * s, `hsla(55, 70%, ${55 + midLit * 30}%, 0.9)`, frame);
    // Spread to 3
    for (let i = 0; i < 3; i++) {
      const t = targets[i];
      const lit = spread > 0 ? Math.min(1, spread * 2) : 0;
      drawNeuron(ctx, t.x, t.y, 18 * s, `hsla(${PALETTE.cellColors[i + 4][0]}, 55%, ${50 + lit * 25}%, 0.8)`, frame);
      if (spread > 0 && spread < 1) {
        const px = mid.x + (t.x - mid.x) * spread;
        const py = mid.y + (t.y - mid.y) * spread;
        ctx.fillStyle = `hsla(55, 90%, 80%, ${(1 - spread) * 0.8})`;
        ctx.beginPath(); ctx.arc(px, py, 3 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Lightning bolt from neuron splits into 3 branches
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s, 38007), [width, height, s]);
  const boltPaths = useMemo(() => {
    const rand = seeded(38007);
    const cx = 0.25, cy = 0.5;
    const ends = [{ x: 0.85, y: 0.15 }, { x: 0.88, y: 0.5 }, { x: 0.85, y: 0.85 }];
    return ends.map(end => {
      const pts: { x: number; y: number }[] = [{ x: cx, y: cy }];
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        pts.push({
          x: cx + (end.x - cx) * t + (rand() - 0.5) * 0.06,
          y: cy + (end.y - cy) * t + (rand() - 0.5) * 0.06,
        });
      }
      return pts;
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width * 0.25, cy = height * 0.5;
    drawNeuron(ctx, cx, cy, 30 * s, `hsla(280, 50%, 65%, 0.9)`, frame);
    const boltT = interpolate(frame, [25, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (boltT > 0) {
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (let b = 0; b < 3; b++) {
        const pts = boltPaths[b];
        const visiblePts = Math.floor(boltT * pts.length);
        if (visiblePts < 2) continue;
        // Glow
        ctx.strokeStyle = `hsla(55, 100%, 85%, ${(1 - boltT * 0.3) * 0.3})`;
        ctx.lineWidth = 6 * s;
        ctx.beginPath();
        for (let i = 0; i < visiblePts; i++) {
          const p = pts[i];
          i === 0 ? ctx.moveTo(p.x * width, p.y * height) : ctx.lineTo(p.x * width, p.y * height);
        }
        ctx.stroke();
        // Core
        ctx.strokeStyle = `hsla(55, 100%, 90%, ${(1 - boltT * 0.3) * 0.8})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        for (let i = 0; i < visiblePts; i++) {
          const p = pts[i];
          i === 0 ? ctx.moveTo(p.x * width, p.y * height) : ctx.lineTo(p.x * width, p.y * height);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron as radio tower: broadcast signal reaches 3 receivers
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 38008), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const towerX = width * 0.28, towerY = height * 0.5;
    // Tower (triangle)
    ctx.strokeStyle = `hsla(220, 50%, 60%, 0.8)`;
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(towerX, towerY - 30 * s);
    ctx.lineTo(towerX - 12 * s, towerY + 30 * s);
    ctx.lineTo(towerX + 12 * s, towerY + 30 * s);
    ctx.closePath(); ctx.stroke();
    // Antenna
    ctx.beginPath();
    ctx.moveTo(towerX, towerY - 30 * s);
    ctx.lineTo(towerX, towerY - 45 * s);
    ctx.stroke();
    // Neuron at top
    drawNeuron(ctx, towerX, towerY - 45 * s, 15 * s, `hsla(350, 60%, 65%, 0.9)`, frame);
    // Broadcast waves
    const broadcastT = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (broadcastT > 0) {
      for (let w = 0; w < 3; w++) {
        const waveT = (broadcastT * 3 - w);
        if (waveT < 0 || waveT > 1) continue;
        const r = waveT * 100 * s;
        ctx.strokeStyle = `hsla(55, 70%, 70%, ${(1 - waveT) * 0.4})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.arc(towerX, towerY - 45 * s, r, -Math.PI * 0.7, Math.PI * 0.2);
        ctx.stroke();
      }
    }
    // Three receivers
    const receivers = [
      { x: width * 0.78, y: height * 0.18 },
      { x: width * 0.82, y: height * 0.5 },
      { x: width * 0.78, y: height * 0.82 },
    ];
    const receiveT = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      const r = receivers[i];
      const lit = receiveT > 0 ? receiveT : 0;
      drawNeuron(ctx, r.x, r.y, 18 * s, `hsla(${PALETTE.cellColors[i + 2][0]}, 55%, ${50 + lit * 25}%, 0.8)`, frame);
      // Small antenna icon
      ctx.strokeStyle = `hsla(220, 40%, 55%, 0.5)`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(r.x, r.y - 18 * s); ctx.lineTo(r.x, r.y - 28 * s); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Pipeline: pressure builds, valve opens, flow splits three ways
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 38009), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const pipeW = 10 * s;
    const valveX = width * 0.4, cy = height * 0.5;
    const pressureT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const openT = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flowT = interpolate(frame, [55, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Input pipe
    ctx.strokeStyle = `hsla(220, 40%, 50%, 0.6)`;
    ctx.lineWidth = pipeW;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(width * 0.05, cy); ctx.lineTo(valveX, cy); ctx.stroke();
    // Pressure fill
    const fillEnd = width * 0.05 + (valveX - width * 0.05) * pressureT;
    ctx.strokeStyle = `hsla(${pressureT > 0.8 ? 0 : 200}, ${50 + pressureT * 30}%, 60%, 0.5)`;
    ctx.lineWidth = pipeW * 0.6;
    ctx.beginPath(); ctx.moveTo(width * 0.05, cy); ctx.lineTo(fillEnd, cy); ctx.stroke();
    // Valve
    const valveOpen = openT;
    ctx.fillStyle = valveOpen > 0.5 ? `hsla(140, 60%, 55%, 0.8)` : `hsla(0, 60%, 55%, 0.8)`;
    ctx.fillRect(valveX - 4 * s, cy - pipeW * 0.7 * (1 - valveOpen * 0.5), 8 * s, pipeW * 1.4 * (1 - valveOpen * 0.3));
    // Output pipes
    const outEnds = [
      { x: width * 0.88, y: height * 0.2 },
      { x: width * 0.92, y: height * 0.5 },
      { x: width * 0.88, y: height * 0.8 },
    ];
    for (const oe of outEnds) {
      ctx.strokeStyle = `hsla(220, 40%, 50%, 0.6)`;
      ctx.lineWidth = pipeW * 0.7;
      ctx.beginPath(); ctx.moveTo(valveX, cy); ctx.lineTo(oe.x, oe.y); ctx.stroke();
    }
    // Flow particles
    if (flowT > 0) {
      for (let i = 0; i < 3; i++) {
        const oe = outEnds[i];
        for (let p = 0; p < 4; p++) {
          const pt = ((flowT * 4 + p * 0.25) % 1);
          const px = valveX + (oe.x - valveX) * pt;
          const py = cy + (oe.y - cy) * pt;
          ctx.fillStyle = `hsla(${PALETTE.cellColors[i + 1][0]}, 70%, 70%, ${0.7 * (1 - pt * 0.5)})`;
          ctx.beginPath(); ctx.arc(px, py, 3 * s, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_038: VariantDef[] = [
  { id: "central-fire", label: "Central Fire", component: V1 },
  { id: "explosion-shockwave", label: "Explosion Shockwave", component: V2 },
  { id: "charge-bang-arrows", label: "Charge Bang Arrows", component: V3 },
  { id: "pulse-fork-split", label: "Pulse Fork Split", component: V4 },
  { id: "threshold-bar", label: "Threshold Bar", component: V5 },
  { id: "domino-chain", label: "Domino Chain", component: V6 },
  { id: "lightning-branches", label: "Lightning Branches", component: V7 },
  { id: "radio-broadcast", label: "Radio Broadcast", component: V8 },
  { id: "pipeline-valve", label: "Pipeline Valve", component: V9 },
];
