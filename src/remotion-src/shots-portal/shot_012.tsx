import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 012 — "which lets you see detail down to a few nanometers."
// 120 frames. Nanometer resolution reveal.

// V1: Blurry cloud resolving into sharp individual nodes — "nanometers" label
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(1201);
    return Array.from({ length: 8 }, (_, i) => ({
      x: 0.3 + rng() * 0.4, y: 0.35 + rng() * 0.35, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Nanometers", "sharp detail emerges");
    const resolve = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      const nx = n.x * width, ny = n.y * height;
      if (resolve < 0.6) {
        // Blurry blob
        const blur = 1 - resolve / 0.6;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, lerp(4, 15, blur) * s);
        grad.addColorStop(0, accent(n.i, 0.3 * blur));
        grad.addColorStop(1, accent(n.i, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(nx, ny, lerp(4, 15, blur) * s, 0, Math.PI * 2); ctx.fill();
      }
      if (resolve > 0.3) {
        const sharp = Math.min(1, (resolve - 0.3) / 0.5);
        drawNode(ctx, nx, ny, 3.5 * s * sharp, n.i, fo * sharp);
      }
    }
    // Edges between resolved nodes
    if (resolve > 0.7) {
      const edgeA = (resolve - 0.7) / 0.3;
      for (let i = 0; i < nodes.length - 1; i++) {
        drawEdgeFaint(ctx, nodes[i].x * width, nodes[i].y * height,
          nodes[i + 1].x * width, nodes[i + 1].y * height, s * edgeA);
      }
    }
    // Label
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("nanometers", width / 2, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Zoom in: fuzzy blob -> sharp distinct neurons emerging at nano scale
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
    drawHeader(ctx, width, height, s, frame, DUR, "Zoom In", "fuzzy to sharp");
    const cx = width / 2, cy = height * 0.55;
    const zoom = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Expanding zoom ring
    const ringR = lerp(15, 55, zoom) * s;
    ctx.strokeStyle = accent(1, 0.3); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
    // Inside: blur => sharp
    if (zoom < 0.5) {
      const blobR = lerp(12, 25, zoom * 2) * s;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobR);
      grad.addColorStop(0, accent(0, 0.35));
      grad.addColorStop(1, accent(0, 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, blobR, 0, Math.PI * 2); ctx.fill();
    }
    if (zoom > 0.3) {
      const sharp = (zoom - 0.3) / 0.7;
      const positions = [
        { x: -15, y: -10 }, { x: 10, y: -12 }, { x: -8, y: 8 },
        { x: 12, y: 6 }, { x: 0, y: -2 }, { x: -18, y: 3 },
      ];
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const nA = stagger(frame, i + 5, 4, 8);
        drawNode(ctx, cx + p.x * s * sharp * 1.5, cy + p.y * s * sharp * 1.5,
          3 * s * nA * sharp, i % 2, fo * nA * sharp);
      }
    }
    // Zoom label
    drawCounter(ctx, width, height, s, `${Math.floor(zoom * 100)}%`, "zoom");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Resolution bar improving: um -> nm, image getting clearer
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
    drawHeader(ctx, width, height, s, frame, DUR, "Resolution Improving", "\u03BCm to nm");
    const cx = width / 2, cy = height * 0.5;
    const progress = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Resolution bar shrinking (getting finer)
    const barW = lerp(140, 20, progress) * s;
    drawPanel(ctx, cx - barW / 2, cy - 10 * s, barW, 20 * s, progress < 0.5 ? 0 : 1, fo);
    // Scale labels
    const scales = ["\u03BCm", "100nm", "10nm", "nm"];
    const scaleIdx = Math.min(3, Math.floor(progress * 4));
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(scales[scaleIdx], cx, cy + 5 * s);
    // Image quality below — more nodes visible as resolution improves
    const imgY = cy + 35 * s;
    const numVisible = Math.floor(lerp(1, 7, progress));
    for (let i = 0; i < numVisible; i++) {
      const dx = cx + (i - numVisible / 2 + 0.5) * 14 * s;
      const nA = stagger(frame, i + 3, 3, 8);
      drawNode(ctx, dx, imgY, 3.5 * s * nA, i % 2, fo * nA);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Electron beam scanning across, revealing detailed structure line by line
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(1204);
    return Array.from({ length: 12 }, (_, i) => ({
      x: 0.2 + rng() * 0.6, y: 0.3 + rng() * 0.45, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Scanning", "electron beam reveals");
    // Scan line moving left to right
    const scanX = interpolate(frame, [10, 95], [0.1, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Scan line
    ctx.strokeStyle = accent(1, 0.4); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(scanX * width, height * 0.22); ctx.lineTo(scanX * width, height * 0.82); ctx.stroke();
    // Glow on scan line
    const grad = ctx.createLinearGradient(scanX * width - 8 * s, 0, scanX * width + 8 * s, 0);
    grad.addColorStop(0, accent(1, 0));
    grad.addColorStop(0.5, accent(1, 0.1));
    grad.addColorStop(1, accent(1, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(scanX * width - 8 * s, height * 0.22, 16 * s, height * 0.6);
    // Nodes: revealed (sharp) if left of scan, dormant if right
    for (const n of nodes) {
      if (n.x < scanX) {
        const revA = Math.min(1, (scanX - n.x) * 10);
        drawNode(ctx, n.x * width, n.y * height, 3.5 * s * revA, n.i % 2, fo * revA);
      } else {
        drawNodeDormant(ctx, n.x * width, n.y * height, 3.5 * s, fo * 0.5);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Before/after: left blurry, right sharp with individual nodes visible
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
    drawHeader(ctx, width, height, s, frame, DUR, "Before / After", "nanometer resolution");
    const cy = height * 0.55;
    // Left panel: blurry (before)
    const leftA = stagger(frame, 0, 8, 15);
    drawPanel(ctx, width * 0.05, height * 0.25, width * 0.4, height * 0.5, 0, fo * leftA);
    ctx.globalAlpha = fo * leftA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("before", width * 0.25, height * 0.3);
    // Blurry blobs
    for (let i = 0; i < 4; i++) {
      const bx = width * 0.15 + (i % 2) * width * 0.15;
      const by = cy + (i < 2 ? -10 : 10) * s;
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, 10 * s);
      grad.addColorStop(0, accent(i, 0.25 * leftA));
      grad.addColorStop(1, accent(i, 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bx, by, 10 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Right panel: sharp (after)
    const rightA = stagger(frame, 4, 8, 15);
    drawPanel(ctx, width * 0.55, height * 0.25, width * 0.4, height * 0.5, 1, fo * rightA);
    ctx.globalAlpha = fo * rightA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("after", width * 0.75, height * 0.3);
    // Sharp nodes
    for (let i = 0; i < 4; i++) {
      const nx = width * 0.65 + (i % 2) * width * 0.15;
      const ny = cy + (i < 2 ? -10 : 10) * s;
      const nA = stagger(frame, i + 6, 4, 8);
      drawNode(ctx, nx, ny, 3.5 * s * nA, i, fo * nA);
    }
    // Edges in right panel
    const edgeA = stagger(frame, 12, 8, 12);
    if (edgeA > 0) {
      drawEdgeFaint(ctx, width * 0.65, cy - 10 * s, width * 0.8, cy - 10 * s, s * edgeA);
      drawEdgeFaint(ctx, width * 0.65, cy + 10 * s, width * 0.8, cy + 10 * s, s * edgeA);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Scale counter: "1000nm -> 100nm -> 10nm -> 1nm" with progressively sharper image
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
    drawHeader(ctx, width, height, s, frame, DUR, "Scale Down", "zooming to nanometers");
    const cx = width / 2, cy = height * 0.45;
    const progress = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Counter value
    const values = [1000, 100, 10, 1];
    const idx = Math.min(3, Math.floor(progress * 4));
    const val = values[idx];
    ctx.fillStyle = accent(idx % 2 === 0 ? 0 : 1);
    ctx.font = `700 ${24 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(`${val} nm`, cx, cy);
    // Image below getting sharper
    const imgY = cy + 30 * s;
    const sharpness = progress;
    // Cluster of nodes at increasing sharpness
    for (let i = 0; i < 5; i++) {
      const dx = cx + (i - 2) * 16 * s;
      if (sharpness < 0.3) {
        const grad = ctx.createRadialGradient(dx, imgY, 0, dx, imgY, 12 * s);
        grad.addColorStop(0, accent(i, 0.2)); grad.addColorStop(1, accent(i, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(dx, imgY, 12 * s, 0, Math.PI * 2); ctx.fill();
      } else {
        const nA = Math.min(1, (sharpness - 0.3) / 0.4);
        drawNode(ctx, dx, imgY, 4 * s * nA, i % 2, fo * nA);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Dense cluster of overlapping blobs resolving into individual sharp nodes
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(1207);
    return Array.from({ length: 10 }, (_, i) => ({
      x: 0.3 + rng() * 0.4, y: 0.35 + rng() * 0.35, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Resolving Detail", "blobs to nodes");
    const resolve = interpolate(frame, [10, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      const nx = n.x * width, ny = n.y * height;
      // Blob shrinks and sharpens
      const blobR = lerp(14, 3.5, resolve) * s;
      const blobAlpha = lerp(0.15, 0, resolve);
      if (blobAlpha > 0.01) {
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, blobR);
        grad.addColorStop(0, accent(n.i, blobAlpha));
        grad.addColorStop(1, accent(n.i, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(nx, ny, blobR, 0, Math.PI * 2); ctx.fill();
      }
      // Sharp node appears
      if (resolve > 0.4) {
        const sharp = (resolve - 0.4) / 0.6;
        drawNode(ctx, nx, ny, 3.5 * s * sharp, n.i % 2, fo * sharp);
      }
    }
    // Connections appear last
    if (resolve > 0.8) {
      const edgeA = (resolve - 0.8) / 0.2;
      for (let i = 0; i < nodes.length - 1; i++) {
        drawEdgeFaint(ctx, nodes[i].x * width, nodes[i].y * height,
          nodes[i + 1].x * width, nodes[i + 1].y * height, s * edgeA);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Grid of pixels getting finer until individual neurons are dots
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
    drawHeader(ctx, width, height, s, frame, DUR, "Pixel Resolution", "coarse to fine");
    const cx = width / 2, cy = height * 0.55;
    const progress = interpolate(frame, [10, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gridW = 100 * s, gridH = 70 * s;
    // Grid gets finer over time
    const cellCount = Math.floor(lerp(3, 12, progress));
    const cellW = gridW / cellCount, cellH = gridH / cellCount;
    for (let r = 0; r < cellCount; r++) {
      for (let c = 0; c < cellCount; c++) {
        const gx = cx - gridW / 2 + c * cellW;
        const gy = cy - gridH / 2 + r * cellH;
        const ci = (r + c) % 2;
        if (progress < 0.7) {
          // Pixel blocks
          ctx.fillStyle = accent(ci, lerp(0.15, 0.08, progress));
          ctx.fillRect(gx, gy, cellW - 1, cellH - 1);
        } else {
          // Individual dots
          const dotA = (progress - 0.7) / 0.3;
          drawNode(ctx, gx + cellW / 2, gy + cellH / 2, (cellW * 0.3) * dotA, ci, fo * dotA);
        }
      }
    }
    // Label
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${cellCount}\u00D7${cellCount}`, cx, cy + gridH / 2 + 14 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Text "nanometers" with a ruler showing tiny increments, sharp node at the tip
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
    const cx = width / 2, cy = height * 0.42;
    // "nanometers" text
    const txtA = stagger(frame, 0, 8, 15);
    ctx.globalAlpha = fo * txtA;
    ctx.fillStyle = accent(1); ctx.font = `700 ${18 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("nanometers", cx, cy);
    // Ruler below with fine tick marks
    const rulerA = stagger(frame, 3, 8, 18);
    const rulerY = cy + 25 * s;
    const rulerW = 120 * s * rulerA;
    ctx.globalAlpha = fo * rulerA;
    ctx.strokeStyle = C.grayDark; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - rulerW / 2, rulerY); ctx.lineTo(cx + rulerW / 2, rulerY); ctx.stroke();
    // Tick marks (getting finer toward right)
    const numTicks = 20;
    for (let i = 0; i <= numTicks; i++) {
      const tx = cx - rulerW / 2 + (i / numTicks) * rulerW;
      const tickH = i % 5 === 0 ? 8 : i % 2 === 0 ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(tx, rulerY); ctx.lineTo(tx, rulerY + tickH * s); ctx.stroke();
    }
    // Scale labels
    ctx.fillStyle = C.textDim; ctx.font = `${6 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("0", cx - rulerW / 2, rulerY + 14 * s);
    ctx.fillText("5nm", cx, rulerY + 14 * s);
    ctx.fillText("10nm", cx + rulerW / 2, rulerY + 14 * s);
    // Sharp node at the tip of the ruler
    const nodeA = stagger(frame, 8, 8, 12);
    drawNodeGradient(ctx, cx + rulerW / 2 + 12 * s, rulerY, 5 * s * nodeA, 1, fo * nodeA);
    // Subtitle
    const subA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * subA;
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("individual neurons visible", cx, cy + 60 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_012: VariantDef[] = [
  { id: "012-cloud-resolve", label: "Cloud To Sharp Nodes", component: V1 },
  { id: "012-zoom-sharpen", label: "Zoom In Sharpen", component: V2 },
  { id: "012-resolution-bar", label: "Resolution Bar Improve", component: V3 },
  { id: "012-scan-reveal", label: "Scan Line Reveal", component: V4 },
  { id: "012-before-after", label: "Before After Panels", component: V5 },
  { id: "012-scale-counter", label: "Scale Counter Down", component: V6 },
  { id: "012-blobs-resolve", label: "Dense Blobs Resolve", component: V7 },
  { id: "012-pixel-grid", label: "Pixel Grid Refine", component: V8 },
  { id: "012-ruler-node", label: "Ruler With Sharp Node", component: V9 },
];
