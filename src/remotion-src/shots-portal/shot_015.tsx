import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 015 — "and hardened it in resin."
// 9 variants — resin block forming around brain (DUR=120)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Resin Embedding");
    const cx = width / 2, cy = height / 2;
    // Resin block solidifying — rectangle growing in opacity
    const solidify = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bw = 55 * s, bh = 50 * s;
    // Amber/orange resin fill
    ctx.fillStyle = `rgba(255,180,60,${fo * solidify * 0.15})`;
    ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.strokeStyle = `rgba(255,160,40,${fo * (0.2 + solidify * 0.4)})`;
    ctx.lineWidth = (1 + solidify * 1.5) * s;
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    // Brain inside — blue node
    const ba = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNodeGradient(ctx, cx, cy, 14 * s * ba, 0, fo * 0.8);
    // Structural cross-links appearing as resin hardens
    if (solidify > 0.4) {
      const la = (solidify - 0.4) / 0.6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        drawEdgeFaint(ctx, cx + Math.cos(a) * 8 * s, cy + Math.sin(a) * 8 * s,
          cx + Math.cos(a) * 22 * s, cy + Math.sin(a) * 22 * s, s * la);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Amber block — rounded rectangle becoming more opaque
    const solidify = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bw = 60 * s, bh = 55 * s, r = 6 * s;
    ctx.fillStyle = `rgba(230,170,50,${fo * solidify * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2 + r, cy - bh / 2);
    ctx.lineTo(cx + bw / 2 - r, cy - bh / 2);
    ctx.arcTo(cx + bw / 2, cy - bh / 2, cx + bw / 2, cy - bh / 2 + r, r);
    ctx.lineTo(cx + bw / 2, cy + bh / 2 - r);
    ctx.arcTo(cx + bw / 2, cy + bh / 2, cx + bw / 2 - r, cy + bh / 2, r);
    ctx.lineTo(cx - bw / 2 + r, cy + bh / 2);
    ctx.arcTo(cx - bw / 2, cy + bh / 2, cx - bw / 2, cy + bh / 2 - r, r);
    ctx.lineTo(cx - bw / 2, cy - bh / 2 + r);
    ctx.arcTo(cx - bw / 2, cy - bh / 2, cx - bw / 2 + r, cy - bh / 2, r);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(200,140,30,${fo * 0.5})`;
    ctx.lineWidth = 1.5 * s;
    ctx.stroke();
    // Brain silhouette trapped inside
    drawNodeGradient(ctx, cx, cy, 12 * s, 0, fo * (0.4 + solidify * 0.4));
    // "hardened" label
    const la = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("hardened", cx, cy + 40 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Two-step: liquid -> solid (left to right)
    const phase = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left: liquid state (wavy outline)
    const la = stagger(frame, 0, 1, 12);
    ctx.strokeStyle = accent(1, fo * la * 0.5);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    for (let y = -25; y <= 25; y += 2) {
      const wx = cx - 45 * s + Math.sin(y * 0.2 + frame * 0.08) * 4 * s * (1 - phase);
      if (y === -25) ctx.moveTo(wx, cy + y * s); else ctx.lineTo(wx, cy + y * s);
    }
    ctx.stroke();
    drawNode(ctx, cx - 45 * s, cy, 10 * s * la, 1, fo * (1 - phase * 0.7));
    // Arrow
    drawEdgeGlow(ctx, cx - 25 * s, cy, cx + 20 * s, cy, 1, fo * phase * 0.4, s);
    // Right: solid block
    const ra = stagger(frame, 10, 1, 12);
    drawPanel(ctx, cx + 25 * s, cy - 20 * s * ra, 40 * s, 40 * s * ra, 1, fo * ra * phase);
    drawNode(ctx, cx + 45 * s, cy, 8 * s * ra, 0, fo * phase);
    // Labels
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.globalAlpha = fo * la;
    ctx.fillText("liquid", cx - 45 * s, cy + 25 * s);
    ctx.globalAlpha = fo * ra * phase;
    ctx.fillText("solid", cx + 45 * s, cy + 28 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // 3D-ish block with perspective — top face, front face, side face
    const grow = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bw = 50 * s, bh = 45 * s, depth = 15 * s;
    const lx = cx - bw / 2, ty = cy - bh / 2;
    // Side face
    ctx.fillStyle = `rgba(200,140,30,${fo * grow * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(lx + bw, ty); ctx.lineTo(lx + bw + depth, ty - depth);
    ctx.lineTo(lx + bw + depth, ty - depth + bh); ctx.lineTo(lx + bw, ty + bh);
    ctx.closePath(); ctx.fill();
    // Top face
    ctx.fillStyle = `rgba(240,190,70,${fo * grow * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(lx, ty); ctx.lineTo(lx + depth, ty - depth);
    ctx.lineTo(lx + bw + depth, ty - depth); ctx.lineTo(lx + bw, ty);
    ctx.closePath(); ctx.fill();
    // Front face
    ctx.fillStyle = `rgba(230,170,50,${fo * grow * 0.15})`;
    ctx.fillRect(lx, ty, bw, bh * grow);
    ctx.strokeStyle = `rgba(200,140,30,${fo * 0.4})`;
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(lx, ty, bw, bh * grow);
    // Brain trapped inside
    drawNodeGradient(ctx, cx, cy, 12 * s * grow, 0, fo * 0.7);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Resin pouring from top, pooling around brain
    const pour = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stream from top
    if (pour < 1) {
      ctx.strokeStyle = `rgba(230,170,50,${fo * 0.4})`;
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, cy - 20 * s + pour * 20 * s);
      ctx.stroke();
    }
    // Pool growing
    const poolH = 50 * s * pour;
    ctx.fillStyle = `rgba(230,170,50,${fo * 0.12})`;
    ctx.fillRect(cx - 35 * s, cy + 25 * s - poolH, 70 * s, poolH);
    // Brain embedded
    const ba = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNodeGradient(ctx, cx, cy + 5 * s, 14 * s * ba, 0, fo);
    // Solidification effect — outline sharpening
    const solid = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `rgba(200,140,30,${fo * solid * 0.6})`;
    ctx.lineWidth = (1 + solid) * s;
    ctx.strokeRect(cx - 35 * s, cy + 25 * s - poolH, 70 * s, poolH);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Molecular lattice forming — grid of connected dots
    const grow = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1506);
    const nodes: { x: number; y: number }[] = [];
    for (let i = 0; i < 16; i++) {
      const a = rng() * Math.PI * 2;
      const r = 15 + rng() * 25;
      nodes.push({ x: cx + Math.cos(a) * r * s, y: cy + Math.sin(a) * r * s });
    }
    // Edges forming as lattice crystallizes
    for (let i = 0; i < nodes.length; i++) {
      const na = stagger(frame, i, 3, 10);
      drawNode(ctx, nodes[i].x, nodes[i].y, 2 * s * na, 1, fo * 0.5);
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 30 * s && grow > j / nodes.length) {
          drawEdgeFaint(ctx, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, s);
        }
      }
    }
    // Brain center
    drawNodeGradient(ctx, cx, cy, 10 * s, 0, fo * 0.7);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Bar chart showing hardness increasing over time
    const t = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const values = Array.from({ length: 6 }, (_, i) => Math.min(1, t * 1.5 - i * 0.15) * 100);
    drawBarChart(ctx, cx - 40 * s, cy - 20 * s, 80 * s, 40 * s, values, 100, s);
    drawThresholdLine(ctx, cx - 40 * s, cy - 15 * s, 80 * s, "solid", s);
    // Label
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("hardness", cx, cy + 30 * s);
    // Small brain icon at top
    drawNode(ctx, cx, cy - 35 * s, 6 * s, 0, fo * 0.6);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Concentric rings shrinking inward — compression/hardening
    const compress = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 4; i >= 0; i--) {
      const baseR = (20 + i * 10) * s;
      const cR = baseR * (1 - compress * 0.3);
      const sa = stagger(frame, 4 - i, 5, 10);
      ctx.strokeStyle = `rgba(230,170,50,${fo * sa * (0.15 + i * 0.08)})`;
      ctx.lineWidth = (1 + compress * 1.5) * s;
      ctx.beginPath();
      ctx.arc(cx, cy, cR, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Solid brain at center
    drawNodeGradient(ctx, cx, cy, 12 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Before/after split view with divider line
    const reveal = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left side: "before" — soft, orange glow
    drawNode(ctx, cx - 35 * s, cy, 14 * s, 1, fo * 0.7);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("tissue", cx - 35 * s, cy + 25 * s);
    // Divider
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.3})`;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 35 * s);
    ctx.lineTo(cx, cy + 35 * s);
    ctx.stroke();
    ctx.setLineDash([]);
    // Right side: "after" — solid blue block shape
    if (reveal > 0) {
      drawPanel(ctx, cx + 15 * s, cy - 18 * s * reveal, 40 * s, 36 * s * reveal, 0, fo * reveal);
      drawNode(ctx, cx + 35 * s, cy, 10 * s * reveal, 0, fo * reveal);
      ctx.globalAlpha = fo * reveal;
      ctx.fillText("resin", cx + 35 * s, cy + 25 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_015: VariantDef[] = [
  { id: "015-solidify-block", label: "Resin block solidifying", component: V1 },
  { id: "015-amber-rounded", label: "Amber rounded block forms", component: V2 },
  { id: "015-liquid-to-solid", label: "Liquid to solid transition", component: V3 },
  { id: "015-3d-block", label: "3D perspective resin block", component: V4 },
  { id: "015-pour-and-set", label: "Resin poured and setting", component: V5 },
  { id: "015-lattice-form", label: "Molecular lattice forming", component: V6 },
  { id: "015-hardness-chart", label: "Hardness bar chart rising", component: V7 },
  { id: "015-compress-rings", label: "Concentric rings compressing", component: V8 },
  { id: "015-before-after", label: "Before/after tissue vs resin", component: V9 },
];
