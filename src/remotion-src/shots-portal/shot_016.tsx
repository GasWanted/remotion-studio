import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 016 — "Then a machine called an ultramicrotome shaved off sections — forty nanometers thick,
// about a thousand times thinner than a human hair."
// 9 variants — slicing machine, ultra-thin sections (DUR=150)

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Ultramicrotome");
    const cx = width / 2, cy = height / 2;
    // Resin block on left
    const bw = 35 * s, bh = 50 * s;
    ctx.fillStyle = `rgba(230,170,50,${fo * 0.15})`;
    ctx.fillRect(cx - 50 * s, cy - bh / 2, bw, bh);
    ctx.strokeStyle = `rgba(200,140,30,${fo * 0.4})`;
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - 50 * s, cy - bh / 2, bw, bh);
    // Blade sweeping across — diagonal line
    const sweep = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bladeX = lerp(cx - 15 * s, cx - 15 * s, sweep);
    const bladeY = lerp(cy - 30 * s, cy + 30 * s, sweep);
    ctx.strokeStyle = accent(0, fo * 0.7);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(bladeX - 15 * s, bladeY);
    ctx.lineTo(bladeX + 5 * s, bladeY);
    ctx.stroke();
    // Thin slices stacking to the right
    const sliceCount = Math.floor(interpolate(frame, [30, 120], [0, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < sliceCount; i++) {
      const sx = cx + 10 * s + i * 6 * s;
      const sa = stagger(frame, i + 5, 6, 10);
      ctx.fillStyle = `rgba(230,170,50,${fo * sa * 0.12})`;
      ctx.fillRect(sx, cy - 20 * s, 3 * s, 40 * s);
      ctx.strokeStyle = `rgba(200,140,30,${fo * sa * 0.3})`;
      ctx.lineWidth = 0.5 * s;
      ctx.strokeRect(sx, cy - 20 * s, 3 * s, 40 * s);
    }
    // "40nm" label
    drawCounter(ctx, width, height, s, "40 nm", "thickness");
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Hair comparison — thick line vs thin line
    const reveal = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Human hair (thick)
    ctx.strokeStyle = `rgba(180,160,130,${fo * reveal * 0.6})`;
    ctx.lineWidth = 8 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 50 * s, cy - 20 * s);
    ctx.lineTo(cx + 50 * s, cy - 20 * s);
    ctx.stroke();
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("human hair ~40,000 nm", cx, cy - 8 * s);
    // Section (ultra-thin) — barely visible
    const thinReveal = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, fo * thinReveal * 0.8);
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 50 * s, cy + 20 * s);
    ctx.lineTo(cx + 50 * s, cy + 20 * s);
    ctx.stroke();
    ctx.globalAlpha = fo * thinReveal;
    ctx.fillStyle = C.blue;
    ctx.fillText("section: 40 nm", cx, cy + 32 * s);
    // "1000x" label
    const lbl = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * lbl;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${14 * s}px system-ui`;
    ctx.fillText("1000x thinner", cx, cy + 50 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Block being sliced — side view with blade
    const bw = 40 * s, bh = 60 * s;
    // Blade (wedge shape) moving down repeatedly
    const cycle = (frame % 30) / 30;
    const bladeY = cy - bh / 2 + cycle * bh;
    ctx.fillStyle = accent(0, fo * 0.3);
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, bladeY - 3 * s);
    ctx.lineTo(cx + bw + 5 * s, bladeY);
    ctx.lineTo(cx - 5 * s, bladeY + 3 * s);
    ctx.closePath();
    ctx.fill();
    // Block
    ctx.fillStyle = `rgba(230,170,50,${fo * 0.15})`;
    ctx.fillRect(cx, cy - bh / 2, bw, bh);
    ctx.strokeStyle = `rgba(200,140,30,${fo * 0.4})`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx, cy - bh / 2, bw, bh);
    // Cut lines on the block
    const cuts = Math.floor(frame / 30);
    for (let i = 0; i < Math.min(cuts, 5); i++) {
      const cutY = cy - bh / 2 + (i + 1) * bh / 6;
      ctx.strokeStyle = accent(0, fo * 0.3);
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx, cutY);
      ctx.lineTo(cx + bw, cutY);
      ctx.stroke();
    }
    // Counter
    drawCounter(ctx, width, height, s, "40 nm");
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Stack of sections fanning out like cards
    const fan = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = 7;
    for (let i = 0; i < count; i++) {
      const sa = stagger(frame, i, 5, 12);
      const angle = lerp(0, (i - count / 2) * 0.08, fan);
      const ox = (i - count / 2) * 8 * s * fan;
      ctx.save();
      ctx.translate(cx + ox, cy);
      ctx.rotate(angle);
      const sw = 35 * s, sh = 45 * s;
      ctx.fillStyle = `rgba(230,170,50,${fo * sa * 0.1})`;
      ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
      ctx.strokeStyle = `rgba(200,140,30,${fo * sa * 0.3})`;
      ctx.lineWidth = 0.8 * s;
      ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);
      // Brain dot inside each section
      drawNode(ctx, 0, 0, 4 * s * sa, i % 2, fo * 0.5 * sa);
      ctx.restore();
    }
    // "7,050 sections" label
    const la = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("7,050 sections", cx, cy + 40 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Diamond knife edge — sharp triangular blade
    const appear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = accent(0, fo * appear * 0.3);
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, cy - 5 * s);
    ctx.lineTo(cx + 10 * s, cy);
    ctx.lineTo(cx - 40 * s, cy + 5 * s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent(0, fo * appear * 0.6);
    ctx.lineWidth = 1 * s;
    ctx.stroke();
    // Block approaching blade from right
    const approach = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const blockX = lerp(cx + 60 * s, cx + 12 * s, approach);
    ctx.fillStyle = `rgba(230,170,50,${fo * 0.15})`;
    ctx.fillRect(blockX, cy - 25 * s, 30 * s, 50 * s);
    ctx.strokeStyle = `rgba(200,140,30,${fo * 0.4})`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(blockX, cy - 25 * s, 30 * s, 50 * s);
    // Slices peeling off at contact point
    if (approach > 0.5) {
      const sliceN = Math.floor((approach - 0.5) * 10);
      for (let i = 0; i < sliceN; i++) {
        const sx = cx - 10 * s - i * 5 * s;
        const sy = cy + lerp(-20, 30, i / 5) * s;
        ctx.fillStyle = `rgba(230,170,50,${fo * 0.08})`;
        ctx.fillRect(sx, sy - 2 * s, 2 * s, 25 * s);
      }
    }
    // Label
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${7 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("diamond knife", cx - 15 * s, cy + 35 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Zoom scale comparison
    // Full block
    const s1 = stagger(frame, 0, 1, 15);
    drawPanel(ctx, cx - 65 * s, cy - 20 * s * s1, 30 * s, 40 * s * s1, 1, fo * s1);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${6 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.globalAlpha = fo * s1;
    ctx.fillText("block", cx - 50 * s, cy + 28 * s);
    // Zoom arrow
    const za = stagger(frame, 8, 1, 10);
    drawEdge(ctx, cx - 30 * s, cy, cx - 10 * s, cy, 0, fo * za * 0.4, s);
    // Single section (thin rectangle)
    const s2 = stagger(frame, 15, 1, 15);
    ctx.fillStyle = `rgba(230,170,50,${fo * s2 * 0.15})`;
    ctx.fillRect(cx - 5 * s, cy - 20 * s * s2, 3 * s, 40 * s * s2);
    ctx.strokeStyle = accent(0, fo * s2 * 0.4);
    ctx.lineWidth = 0.5 * s;
    ctx.strokeRect(cx - 5 * s, cy - 20 * s * s2, 3 * s, 40 * s * s2);
    ctx.globalAlpha = fo * s2;
    ctx.fillStyle = C.textDim;
    ctx.fillText("section", cx - 3 * s, cy + 28 * s);
    // Zoom arrow 2
    const za2 = stagger(frame, 22, 1, 10);
    drawEdge(ctx, cx + 5 * s, cy, cx + 25 * s, cy, 0, fo * za2 * 0.4, s);
    // Dimension label
    const s3 = stagger(frame, 28, 1, 15);
    ctx.globalAlpha = fo * s3;
    ctx.fillStyle = C.blue;
    ctx.font = `700 ${12 * s}px system-ui`;
    ctx.fillText("40 nm", cx + 45 * s, cy + 4 * s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Animated counter showing section number increasing
    const count = Math.floor(interpolate(frame, [10, 120], [0, 7050], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const appear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = C.text;
    ctx.font = `700 ${22 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = fo * appear;
    ctx.fillText(count.toLocaleString(), cx, cy - 5 * s);
    // "sections" label below
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${9 * s}px system-ui`;
    ctx.fillText("sections", cx, cy + 18 * s);
    // Thin line at top representing one section
    const lineA = stagger(frame, 5, 1, 15);
    ctx.strokeStyle = accent(0, fo * lineA * 0.5);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 40 * s, cy - 30 * s);
    ctx.lineTo(cx + 40 * s, cy - 30 * s);
    ctx.stroke();
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Machine schematic — simple mechanism outline
    const appear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Base plate
    ctx.strokeStyle = accent(0, fo * appear * 0.4);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 55 * s, cy + 30 * s);
    ctx.lineTo(cx + 55 * s, cy + 30 * s);
    ctx.stroke();
    // Arm rotating
    const armAngle = Math.sin(frame * 0.04) * 0.2;
    ctx.save();
    ctx.translate(cx - 20 * s, cy + 30 * s);
    ctx.rotate(armAngle - Math.PI / 2);
    ctx.strokeStyle = accent(0, fo * appear * 0.6);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -40 * s);
    ctx.stroke();
    // Blade at end of arm
    ctx.fillStyle = accent(0, fo * appear * 0.4);
    ctx.fillRect(-8 * s, -42 * s, 16 * s, 3 * s);
    ctx.restore();
    // Block on platform
    ctx.fillStyle = `rgba(230,170,50,${fo * appear * 0.15})`;
    ctx.fillRect(cx + 10 * s, cy + 10 * s, 25 * s, 20 * s);
    // Sections coming off
    const sliceT = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nSlices = Math.floor(sliceT * 6);
    for (let i = 0; i < nSlices; i++) {
      const sx = cx + 40 * s + i * 5 * s;
      drawNode(ctx, sx, cy + 5 * s, 2 * s, i % 2, fo * 0.5);
    }
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Scale ladder — 1mm, 1um, 40nm
    const scales = [
      { label: "1 mm", w: 80, ci: 1 },
      { label: "1 \u03bcm", w: 20, ci: 0 },
      { label: "40 nm", w: 3, ci: 0 },
    ];
    for (let i = 0; i < scales.length; i++) {
      const sa = stagger(frame, i, 15, 12);
      const y = cy - 25 * s + i * 25 * s;
      const sw = scales[i].w * s * sa;
      ctx.strokeStyle = accent(scales[i].ci, fo * sa * 0.6);
      ctx.lineWidth = (3 - i) * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - sw / 2, y);
      ctx.lineTo(cx + sw / 2, y);
      ctx.stroke();
      // End caps
      ctx.beginPath();
      ctx.moveTo(cx - sw / 2, y - 4 * s);
      ctx.lineTo(cx - sw / 2, y + 4 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + sw / 2, y - 4 * s);
      ctx.lineTo(cx + sw / 2, y + 4 * s);
      ctx.stroke();
      ctx.globalAlpha = fo * sa;
      ctx.fillStyle = i === 2 ? C.blue : C.textDim;
      ctx.font = `${i === 2 ? 600 : 500} ${(i === 2 ? 9 : 7) * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(scales[i].label, cx, y - 8 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_016: VariantDef[] = [
  { id: "016-blade-sweep", label: "Blade sweeps across block", component: V1 },
  { id: "016-hair-compare", label: "Hair vs section thickness", component: V2 },
  { id: "016-cycle-cut", label: "Cycling blade cuts block", component: V3 },
  { id: "016-fan-sections", label: "Sections fanning out", component: V4 },
  { id: "016-diamond-knife", label: "Diamond knife approach", component: V5 },
  { id: "016-zoom-scale", label: "Zoom scale comparison", component: V6 },
  { id: "016-counter-sections", label: "Section counter 7050", component: V7 },
  { id: "016-machine-schematic", label: "Machine arm schematic", component: V8 },
  { id: "016-scale-ladder", label: "Scale ladder mm to nm", component: V9 },
];
