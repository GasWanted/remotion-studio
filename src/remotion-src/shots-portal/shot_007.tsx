import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 007 — "Smaller than a poppy seed."
// 90 frames. 9 variants showing extreme smallness.

// V1: Circle shrinking from large to tiny dot with "poppy seed" label
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Circle shrinking
    const shrinkT = interpolate(frame, [5, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const r = lerp(100 * s, 3 * s, shrinkT);
    if (r > 6 * s) {
      ctx.strokeStyle = accent(0, fo * 0.4);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      drawNodeGradient(ctx, cx, cy, r, 0, fo);
    }
    // Labels appear after shrink
    const labelT = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * labelT;
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("smaller than a", cx, cy - 20 * s);
    ctx.fillStyle = C.text;
    ctx.font = `600 ${11 * s}px system-ui`;
    ctx.fillText("poppy seed", cx, cy - 8 * s);
    // Arrow to dot
    ctx.strokeStyle = accent(0, fo * labelT * 0.4);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 6 * s);
    ctx.lineTo(cx, cy + 18 * s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Ruler/scale showing progressively smaller things, fly brain = smallest
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cy = height / 2;
    const items = [
      { label: "marble", r: 35, col: 1 },
      { label: "pea", r: 18, col: 1 },
      { label: "grain of rice", r: 8, col: 1 },
      { label: "poppy seed", r: 4, col: 1 },
      { label: "fly brain", r: 2, col: 0 },
    ];
    const gap = width / (items.length + 1);
    for (let i = 0; i < items.length; i++) {
      const t = stagger(frame, i * 5, 1, 10);
      if (t <= 0) continue;
      const x = gap * (i + 1);
      const item = items[i];
      if (i === items.length - 1) {
        drawNodeGradient(ctx, x, cy, item.r * s * t, 0, fo * t);
      } else {
        ctx.strokeStyle = `rgba(200,200,215,${fo * t * 0.5})`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(x, cy, item.r * s * t, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = i === items.length - 1 ? C.blue : C.textDim;
      ctx.font = `${i === items.length - 1 ? "600 " : ""}${6 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(item.label, x, cy + (item.r + 10) * s);
    }
    // Scale line at bottom
    const lineT = staggerRaw(frame, 0, 1, 30);
    drawThresholdLine(ctx, width * 0.08, height * 0.82, width * 0.84 * lineT, "scale", s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Single tiny dot in vast white space, text "smaller than a poppy seed"
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Tiny dot in center
    const dotT = stagger(frame, 5, 1, 10);
    drawNodeGradient(ctx, cx, cy, 2.5 * s * dotT, 0, fo * dotT);
    // Text above
    const textT = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * textT;
    ctx.fillStyle = C.text;
    ctx.font = `500 ${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("smaller than a poppy seed", cx, cy - 30 * s);
    // Concentric rings indicating zoom context (very faint)
    for (let r = 1; r <= 4; r++) {
      const rt = interpolate(frame, [25 + r * 5, 35 + r * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.strokeStyle = `rgba(200,200,215,${fo * rt * 0.1})`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 25 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Comparison objects: coin -> grain of rice -> poppy seed -> fly brain (even smaller)
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cy = height / 2;
    const objects = [
      { label: "coin", r: 40, x: width * 0.18 },
      { label: "rice grain", r: 12, x: width * 0.38 },
      { label: "poppy seed", r: 5, x: width * 0.58 },
      { label: "fly brain", r: 2, x: width * 0.78 },
    ];
    for (let i = 0; i < objects.length; i++) {
      const t = stagger(frame, i * 6, 1, 12);
      if (t <= 0) continue;
      const o = objects[i];
      if (i === objects.length - 1) {
        drawNodeGradient(ctx, o.x, cy, o.r * s * t, 0, fo * t);
      } else {
        ctx.strokeStyle = `rgba(200,200,215,${fo * t * 0.5})`;
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(o.x, cy, o.r * s * t, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(200,200,215,${fo * t * 0.08})`;
        ctx.fill();
      }
      ctx.fillStyle = i === objects.length - 1 ? C.blue : C.textDim;
      ctx.font = `${i === objects.length - 1 ? "600 " : ""}${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(o.label, o.x, cy + (o.r + 12) * s);
      // Arrow to next
      if (i < objects.length - 1) {
        const at = staggerRaw(frame, (i + 1) * 6 - 2, 1, 8);
        if (at > 0) {
          ctx.strokeStyle = `rgba(200,200,215,${fo * at * 0.3})`;
          ctx.lineWidth = 1 * s;
          ctx.beginPath();
          const ax = o.x + o.r * s + 5 * s;
          ctx.moveTo(ax, cy);
          ctx.lineTo(ax + 10 * s * at, cy);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Zoom in animation: surface -> poppy seed -> fly brain is even smaller
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const zoom = interpolate(frame, [5, 60], [1, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Poppy seed getting bigger as we zoom in
    const poppyR = 5 * s * zoom;
    if (poppyR < width / 2) {
      ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, poppyR, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Fly brain dot stays tiny
    const flyA = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyA > 0) {
      drawNodeGradient(ctx, cx, cy, 3 * s * easeOutBack(Math.min(1, flyA)), 0, fo * flyA);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${8 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("even smaller", cx, cy + 16 * s);
    }
    // Zoom indicator rings
    for (let r = 1; r <= 3; r++) {
      const rt = interpolate(frame, [10 + r * 8, 20 + r * 8], [0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rt > 0) {
        ctx.strokeStyle = `rgba(64,144,255,${fo * rt})`;
        ctx.lineWidth = 1 * s;
        ctx.setLineDash([3 * s, 3 * s]);
        ctx.beginPath();
        ctx.arc(cx, cy, r * 30 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Fly outline with brain dot highlighted, poppy seed reference nearby
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Fly outline
    const flyT = staggerRaw(frame, 5, 1, 20);
    drawFlyOutline(ctx, cx, cy + 5 * s, 50 * s * flyT, fo * flyT);
    // Brain dot in head - highlighted
    if (flyT > 0.5) {
      const brainT = stagger(frame, 20, 1, 10);
      const brainY = cy + 5 * s - 50 * s * flyT * 0.32;
      drawNodeGradient(ctx, cx, brainY, 3 * s * brainT, 0, fo * brainT);
      // Callout line
      if (brainT > 0.5) {
        ctx.strokeStyle = accent(0, fo * brainT * 0.3);
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 5 * s, brainY - 3 * s);
        ctx.lineTo(cx + 35 * s, brainY - 20 * s);
        ctx.stroke();
        ctx.fillStyle = C.textDim;
        ctx.font = `${6 * s}px system-ui`;
        ctx.textAlign = "left";
        ctx.fillText("< poppy seed", cx + 37 * s, brainY - 20 * s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Microscope zooming in on progressively smaller dots
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Microscope lens circle
    const lensR = 65 * s;
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.4})`;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, lensR, 0, Math.PI * 2);
    ctx.stroke();
    // Lens handle
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(cx + lensR * 0.7, cy + lensR * 0.7);
    ctx.lineTo(cx + lensR * 1.1, cy + lensR * 1.1);
    ctx.stroke();
    // Inside lens: zooming dots
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, lensR - 2 * s, 0, Math.PI * 2);
    ctx.clip();
    const zoomT = interpolate(frame, [10, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dotSize = lerp(30 * s, 3 * s, zoomT);
    drawNodeGradient(ctx, cx, cy, dotSize, 0, fo);
    // Label inside lens
    if (zoomT > 0.6) {
      ctx.fillStyle = C.textDim;
      ctx.font = `${6 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("fly brain", cx, cy + dotSize + 10 * s);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Text "< 1mm" with a tiny blue dot
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Main text
    const textT = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * textT;
    ctx.fillStyle = C.text;
    ctx.font = `700 ${28 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("< 1mm", cx, cy - 10 * s);
    // Tiny blue dot
    const dotT = stagger(frame, 18, 1, 10);
    drawNodeGradient(ctx, cx, cy + 25 * s, 2.5 * s * dotT, 0, fo * dotT);
    // Subtitle
    const subT = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * subT;
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("smaller than a poppy seed", cx, cy + 42 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Large poppy seed shape, fly brain dot shown smaller beside it
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 90;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Poppy seed (oval shape)
    const poppyT = staggerRaw(frame, 5, 1, 20);
    const poppyX = cx - 25 * s;
    ctx.fillStyle = `rgba(200,200,215,${fo * poppyT * 0.2})`;
    ctx.strokeStyle = `rgba(200,200,215,${fo * poppyT * 0.5})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(poppyX, cy, 22 * s * poppyT, 15 * s * poppyT, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("poppy seed", poppyX, cy + 25 * s);
    // Fly brain dot - smaller
    const flyT = stagger(frame, 20, 1, 10);
    if (flyT > 0) {
      const flyX = cx + 40 * s;
      drawNodeGradient(ctx, flyX, cy, 3 * s * flyT, 0, fo * flyT);
      ctx.fillStyle = C.blue;
      ctx.font = `600 ${7 * s}px system-ui`;
      ctx.fillText("fly brain", flyX, cy + 15 * s);
      // "even smaller" annotation
      ctx.fillStyle = C.textDim;
      ctx.font = `italic ${6 * s}px system-ui`;
      ctx.fillText("even smaller", flyX, cy + 24 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_007: VariantDef[] = [
  { id: "007-shrinking-circle", label: "Circle shrinking to dot", component: V1 },
  { id: "007-ruler-scale", label: "Ruler scale comparison", component: V2 },
  { id: "007-tiny-dot", label: "Tiny dot vast space", component: V3 },
  { id: "007-size-lineup", label: "Object size lineup", component: V4 },
  { id: "007-zoom-in", label: "Zoom in animation", component: V5 },
  { id: "007-fly-callout", label: "Fly with brain callout", component: V6 },
  { id: "007-microscope", label: "Microscope zoom", component: V7 },
  { id: "007-sub-1mm", label: "Sub 1mm text", component: V8 },
  { id: "007-poppy-compare", label: "Poppy seed comparison", component: V9 },
];
