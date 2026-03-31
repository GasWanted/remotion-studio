import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawPerson, drawBarChart } from "../icons";

// Shot 034 — "To answer that, you need to understand what neurons actually do."
// 9 ways to show a single neuron schematic

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Central neuron growing from body outward, dendrites left, axon right
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s, 3401), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const grow = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Cell body grows first
    const bodyR = 14 * s * Math.min(1, grow * 3);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR * 3);
    glow.addColorStop(0, `hsla(280, 55%, 65%, ${fo * 0.2})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, bodyR * 3, 0, Math.PI * 2); ctx.fill();
    const bg = ctx.createRadialGradient(cx - bodyR * 0.2, cy - bodyR * 0.2, 0, cx, cy, bodyR);
    bg.addColorStop(0, `hsla(280, 60%, 75%, ${fo})`);
    bg.addColorStop(1, `hsla(280, 55%, 55%, ${fo * 0.7})`);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
    // Dendrites grow left
    const dendGrow = interpolate(grow, [0.3, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(280, 50%, 60%, ${fo * 0.9})`;
    ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * 0.65 + (i / 4) * Math.PI * 0.7;
      const len = (35 + i * 8) * s * dendGrow;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.stroke();
      // Branch tips
      if (dendGrow > 0.5) {
        const tipX = cx + Math.cos(a) * len, tipY = cy + Math.sin(a) * len;
        for (let b = -1; b <= 1; b += 2) {
          const ba = a + b * 0.4;
          ctx.beginPath(); ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX + Math.cos(ba) * len * 0.35, tipY + Math.sin(ba) * len * 0.35);
          ctx.stroke();
        }
      }
    }
    // Axon grows right
    const axonGrow = interpolate(grow, [0.4, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const axonLen = 80 * s * axonGrow;
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + axonLen, cy + 3 * s); ctx.stroke();
    // Axon terminals
    if (axonGrow > 0.7) {
      const tx = cx + axonLen, ty = cy + 3 * s;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath(); ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 12 * s, ty + i * 8 * s); ctx.stroke();
        ctx.fillStyle = `hsla(280, 50%, 65%, ${fo})`;
        ctx.beginPath(); ctx.arc(tx + 12 * s, ty + i * 8 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron with labeled parts (text: "dendrites", "cell body", "axon")
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3402), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.45;
    const t = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Draw neuron
    if (t > 0) drawNeuron(ctx, cx, cy, 60 * s, `hsla(220, 55%, 65%, ${fo})`, frame);
    // Labels appear sequentially
    ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    const labelT1 = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelT1 > 0) {
      ctx.fillStyle = `hsla(140, 50%, 65%, ${fo * labelT1})`;
      ctx.fillText("dendrites", cx - 30 * s, cy + 30 * s);
      ctx.strokeStyle = `hsla(140, 50%, 65%, ${fo * labelT1 * 0.4})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(cx - 30 * s, cy + 25 * s); ctx.lineTo(cx - 20 * s, cy + 5 * s); ctx.stroke();
    }
    const labelT2 = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelT2 > 0) {
      ctx.fillStyle = `hsla(50, 60%, 65%, ${fo * labelT2})`;
      ctx.fillText("cell body", cx, cy - 22 * s);
      ctx.strokeStyle = `hsla(50, 60%, 65%, ${fo * labelT2 * 0.4})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(cx, cy - 17 * s); ctx.lineTo(cx, cy - 10 * s); ctx.stroke();
    }
    const labelT3 = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelT3 > 0) {
      ctx.fillStyle = `hsla(350, 55%, 65%, ${fo * labelT3})`;
      ctx.fillText("axon", cx + 40 * s, cy - 10 * s);
      ctx.strokeStyle = `hsla(350, 55%, 65%, ${fo * labelT3 * 0.4})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(cx + 35 * s, cy - 5 * s); ctx.lineTo(cx + 25 * s, cy + 2 * s); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron inside a question mark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3403), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Big question mark outline
    const qT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * qT * 0.3})`;
    ctx.lineWidth = 4 * s; ctx.lineCap = "round";
    ctx.font = `bold ${120 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.strokeText("?", cx, cy);
    // Neuron fades in inside the curve
    const nT = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (nT > 0) {
      ctx.globalAlpha = fo * nT;
      drawNeuron(ctx, cx - 5 * s, cy - 10 * s, 40 * s, `hsla(280, 55%, 65%, 1)`, frame);
    }
    // "what does it do?" text
    const tT = interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tT > 0) {
      ctx.globalAlpha = fo * tT;
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("what does it actually do?", cx, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Multiple small neurons scattered, one in center highlighted/zoomed
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3404), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(3404);
    const neurons: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 18; i++) {
      neurons.push({ x: width * (0.1 + r() * 0.8), y: height * (0.1 + r() * 0.8), hue: PALETTE.cellColors[Math.floor(r() * 8)][0] });
    }
    return { neurons };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    // Small background neurons dim
    for (const n of data.neurons) {
      ctx.globalAlpha = fo * 0.25;
      drawNeuron(ctx, n.x, n.y, 18 * s, `hsla(${n.hue}, 40%, 50%, 0.5)`, frame);
    }
    // Central highlighted neuron grows
    const zoom = interpolate(frame, [20, 60], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo;
    // Highlight glow
    const glowR = 50 * s * zoom;
    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowR * 2);
    glow.addColorStop(0, `hsla(280, 55%, 65%, ${fo * 0.15})`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(width / 2, height / 2, glowR * 2, 0, Math.PI * 2); ctx.fill();
    drawNeuron(ctx, width / 2, height / 2, 55 * s * zoom, `hsla(280, 55%, 65%, ${fo})`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron drawn as a circuit diagram (electronic component style)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3405), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const t = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(140, 50%, 60%, ${fo * 0.9})`; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    // Input wires (left)
    const inputs = 3;
    for (let i = 0; i < inputs; i++) {
      const iy = cy - 25 * s + i * 25 * s;
      const drawLen = Math.min(t * 3, 1);
      ctx.beginPath(); ctx.moveTo(cx - 80 * s, iy);
      ctx.lineTo(cx - 80 * s + 40 * s * drawLen, iy); ctx.stroke();
      // Input labels
      if (t > 0.3) {
        ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px monospace`; ctx.textAlign = "right";
        ctx.fillText(`in${i + 1}`, cx - 83 * s, iy + 3 * s);
      }
    }
    // Op-amp triangle (summing junction)
    if (t > 0.2) {
      const triT = interpolate(t, [0.2, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(50, 55%, 60%, ${fo * triT})`;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 30 * s, cy - 30 * s);
      ctx.lineTo(cx + 20 * s, cy);
      ctx.lineTo(cx - 30 * s, cy + 30 * s);
      ctx.closePath(); ctx.stroke();
      // Sigma symbol inside
      ctx.fillStyle = `hsla(50, 55%, 65%, ${fo * triT})`; ctx.font = `${16 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("\u03A3", cx - 8 * s, cy + 5 * s);
    }
    // Output wire (right)
    if (t > 0.5) {
      const outT = interpolate(t, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `hsla(350, 55%, 60%, ${fo * outT})`; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(cx + 20 * s, cy);
      ctx.lineTo(cx + 20 * s + 60 * s * outT, cy); ctx.stroke();
      // Threshold step indicator
      if (outT > 0.5) {
        ctx.beginPath(); ctx.moveTo(cx + 50 * s, cy + 8 * s);
        ctx.lineTo(cx + 50 * s, cy - 8 * s); ctx.lineTo(cx + 65 * s, cy - 8 * s); ctx.stroke();
        ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px monospace`; ctx.textAlign = "left";
        ctx.fillText("out", cx + 83 * s, cy + 3 * s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron pulsing with gentle glow, "what does it do?" text
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s, 3406), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.42;
    // Pulsing glow rings
    const pulse = Math.sin(frame * 0.08) * 0.5 + 0.5;
    for (let ring = 3; ring >= 0; ring--) {
      const r = (30 + ring * 18) * s + pulse * 8 * s;
      ctx.fillStyle = `hsla(280, 55%, 60%, ${fo * 0.06 * (4 - ring)})`;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    drawNeuron(ctx, cx, cy, 50 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    // Text
    const tT = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tT > 0) {
      ctx.globalAlpha = fo * tT;
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("what does it do?", cx, height * 0.78);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron as a tree — roots = dendrites, trunk = body, branches = axon
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3407), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, baseY = height * 0.55;
    const t = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.lineCap = "round";
    // Roots (dendrites) — grow downward
    const rootT = interpolate(t, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(25, 45%, 50%, ${fo * 0.7})`; ctx.lineWidth = 2 * s;
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * 0.3 + (i / 4) * Math.PI * 0.4;
      const len = (25 + i * 6) * s * rootT;
      ctx.beginPath(); ctx.moveTo(cx, baseY);
      ctx.lineTo(cx + Math.cos(a) * len, baseY + Math.sin(a) * len); ctx.stroke();
    }
    // Trunk — grows upward
    const trunkT = interpolate(t, [0.2, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(25, 40%, 45%, ${fo * 0.9})`; ctx.lineWidth = 4 * s;
    const trunkTop = baseY - 60 * s * trunkT;
    ctx.beginPath(); ctx.moveTo(cx, baseY); ctx.lineTo(cx, trunkTop); ctx.stroke();
    // Cell body knot
    if (trunkT > 0.5) {
      ctx.fillStyle = `hsla(140, 45%, 50%, ${fo * 0.6})`;
      ctx.beginPath(); ctx.arc(cx, baseY, 8 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Branches (axon terminals) — grow upward
    const branchT = interpolate(t, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(140, 50%, 55%, ${fo * 0.8})`; ctx.lineWidth = 2 * s;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI * 0.15 + (i / 5) * -Math.PI * 0.7;
      const len = (20 + i * 5) * s * branchT;
      ctx.beginPath(); ctx.moveTo(cx, trunkTop);
      ctx.lineTo(cx + Math.cos(a) * len, trunkTop + Math.sin(a) * len); ctx.stroke();
      // Leaf dots
      if (branchT > 0.6) {
        ctx.fillStyle = `hsla(140, 55%, 60%, ${fo * 0.5})`;
        const lx = cx + Math.cos(a) * len, ly = trunkTop + Math.sin(a) * len;
        ctx.beginPath(); ctx.arc(lx, ly, 3 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Labels
    if (t > 0.7) {
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("roots = dendrites", cx, height * 0.82);
      ctx.fillText("branches = axon", cx, height * 0.18);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // 3D-ish neuron rotating (parallax shift with frame)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3408), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const angle = (frame / 120) * Math.PI * 0.6 - Math.PI * 0.15;
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    // Dendrites with 3D parallax
    ctx.strokeStyle = `hsla(220, 55%, 62%, ${fo * 0.8})`; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const baseA = Math.PI * 0.6 + (i / 4) * Math.PI * 0.8;
      const len = (30 + i * 7) * s;
      const dx = Math.cos(baseA) * len, dy = Math.sin(baseA) * len;
      const px = dx * cosA, py = dy;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + px, cy + py); ctx.stroke();
    }
    // Axon with parallax
    const axLen = 70 * s;
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + axLen * cosA, cy + 5 * s * sinA); ctx.stroke();
    // Cell body
    const bodyR = 12 * s;
    const bg = ctx.createRadialGradient(cx - bodyR * 0.3 * cosA, cy - bodyR * 0.3, 0, cx, cy, bodyR);
    bg.addColorStop(0, `hsla(220, 60%, 78%, ${fo})`);
    bg.addColorStop(1, `hsla(220, 55%, 50%, ${fo * 0.6})`);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
    // Shadow underneath for depth
    ctx.fillStyle = `hsla(220, 30%, 20%, ${fo * 0.15})`;
    ctx.beginPath(); ctx.ellipse(cx, cy + 25 * s, 30 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron being sketched/drawn progressively
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3409), [width, height, s]);
  const segments = useMemo(() => {
    const segs: { x1: number; y1: number; x2: number; y2: number; t: number }[] = [];
    const cx = width / 2, cy = height / 2;
    let idx = 0;
    // Body outline segments
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      const r = 12 * s;
      segs.push({ x1: cx + Math.cos(a) * r, y1: cy + Math.sin(a) * r, x2: cx + Math.cos(a + 0.3) * r, y2: cy + Math.sin(a + 0.3) * r, t: idx++ });
    }
    // Dendrites
    for (let i = 0; i < 4; i++) {
      const a = Math.PI * 0.7 + (i / 3) * Math.PI * 0.6;
      const len = (35 + i * 8) * s;
      segs.push({ x1: cx, y1: cy, x2: cx + Math.cos(a) * len, y2: cy + Math.sin(a) * len, t: idx++ });
    }
    // Axon
    segs.push({ x1: cx, y1: cy, x2: cx + 75 * s, y2: cy + 3 * s, t: idx++ });
    // Terminals
    for (let i = -2; i <= 2; i++) {
      segs.push({ x1: cx + 75 * s, y1: cy + 3 * s, x2: cx + 88 * s, y2: cy + 3 * s + i * 8 * s, t: idx++ });
    }
    const total = idx;
    return { segs, total };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const progress = interpolate(frame, [5, 90], [0, segments.total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `hsla(50, 55%, 65%, ${fo * 0.9})`; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    for (const seg of segments.segs) {
      if (seg.t > progress) break;
      const segP = Math.min(1, progress - seg.t);
      const ex = seg.x1 + (seg.x2 - seg.x1) * segP;
      const ey = seg.y1 + (seg.y2 - seg.y1) * segP;
      ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(ex, ey); ctx.stroke();
    }
    // Pencil cursor at current draw point
    if (progress > 0 && progress < segments.total) {
      const curSeg = segments.segs[Math.min(Math.floor(progress), segments.segs.length - 1)];
      const segP = progress - Math.floor(progress);
      const px = curSeg.x1 + (curSeg.x2 - curSeg.x1) * segP;
      const py = curSeg.y1 + (curSeg.y2 - curSeg.y1) * segP;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.beginPath(); ctx.arc(px, py, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_034: VariantDef[] = [
  { id: "grow-out", label: "Growing Neuron", component: V1 },
  { id: "labeled", label: "Labeled Parts", component: V2 },
  { id: "question", label: "Question Mark", component: V3 },
  { id: "zoom-focus", label: "Zoom Focus", component: V4 },
  { id: "circuit", label: "Circuit Style", component: V5 },
  { id: "pulse-glow", label: "Pulse Glow", component: V6 },
  { id: "tree", label: "Tree Metaphor", component: V7 },
  { id: "parallax-3d", label: "3D Parallax", component: V8 },
  { id: "sketch", label: "Progressive Sketch", component: V9 },
];
