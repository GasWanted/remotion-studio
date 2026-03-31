import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 023 — "and figures out which pieces belong to the same neuron across all seven thousand slices."
// 9 variants — matching neurons across slices, color assignment (DUR=150)

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
    drawHeader(ctx, width, height, s, frame, DUR, "Neuron Tracking");
    const cx = width / 2, cy = height / 2;
    // Stacked layers with same-colored blob connected through them
    const layers = 6;
    const layerH = 10 * s;
    const totalH = layers * layerH;
    const connect = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Track a neuron through layers (blue blob wandering)
    const trackX = [0, 5, -3, 8, 2, -4];
    for (let l = 0; l < layers; l++) {
      const ly = cy - totalH / 2 + l * layerH;
      const la = stagger(frame, l, 4, 10);
      // Layer line
      ctx.strokeStyle = `rgba(200,200,215,${fo * la * 0.3})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 40 * s, ly);
      ctx.lineTo(cx + 40 * s, ly);
      ctx.stroke();
      // Dormant blobs
      const rng = seeded(2301 + l);
      for (let i = 0; i < 5; i++) {
        const bx = cx + (rng() - 0.5) * 70 * s;
        drawNodeDormant(ctx, bx, ly, 3 * s * la, fo * la);
      }
      // Tracked neuron blob (blue, highlighted)
      const bx = cx + trackX[l] * s;
      drawNodeGradient(ctx, bx, ly, 4 * s * la, 0, fo * la);
      // Connection line to next layer
      if (l < layers - 1 && connect > l / layers) {
        const nextBx = cx + trackX[l + 1] * s;
        const nextLy = ly + layerH;
        drawEdgeGlow(ctx, bx, ly + 3 * s, nextBx, nextLy - 3 * s, 0, fo * 0.4, s);
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
    const DUR = 150;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Gray blobs gaining color one by one (assignment)
    const rng = seeded(2302);
    const blobs = Array.from({ length: 15 }, () => ({
      x: cx + (rng() - 0.5) * 90 * s,
      y: cy + (rng() - 0.5) * 60 * s,
      r: 4 + rng() * 5,
      ci: Math.floor(rng() * 2),
    }));
    const colorize = interpolate(frame, [15, 100], [0, blobs.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const sa = stagger(frame, i, 2, 8);
      if (i < colorize) {
        drawNode(ctx, b.x, b.y, b.r * s * sa, b.ci, fo * 0.6);
        // Color assignment flash
        if (Math.abs(colorize - i) < 1) {
          const flash = 1 - (colorize - i);
          ctx.strokeStyle = accent(b.ci, fo * flash * 0.5);
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(b.x, b.y, (b.r + 5) * s, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        drawNodeDormant(ctx, b.x, b.y, b.r * s * sa, fo * sa);
      }
    }
    drawCounter(ctx, width, height, s, `${Math.floor(colorize)}/${blobs.length}`, "identified");
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
    // Three distinct neurons tracked across 4 slices — each gets its own color
    const slices = 4;
    const neurons = 3;
    const colors = [0, 1, 0];
    const positions = [
      [-15, -10, -5, -12],
      [5, 8, 3, 10],
      [20, 15, 22, 18],
    ];
    for (let sl = 0; sl < slices; sl++) {
      const sx = cx - 45 * s + sl * 30 * s;
      const sa = stagger(frame, sl, 8, 12);
      // Slice panel
      drawPanel(ctx, sx - 12 * s, cy - 25 * s * sa, 24 * s, 50 * s * sa, 0, fo * sa * 0.3);
      // Neuron blobs in this slice
      for (let n = 0; n < neurons; n++) {
        const ny = cy + positions[n][sl] * s;
        const na = stagger(frame, sl * neurons + n + 5, 2, 8);
        drawNode(ctx, sx, ny, 4 * s * na, colors[n], fo * 0.6 * na);
      }
    }
    // Connecting lines across slices for each neuron
    const connectA = interpolate(frame, [40, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let n = 0; n < neurons; n++) {
      for (let sl = 0; sl < slices - 1; sl++) {
        if (connectA > sl / slices) {
          const sx1 = cx - 45 * s + sl * 30 * s;
          const sx2 = cx - 45 * s + (sl + 1) * 30 * s;
          const ny1 = cy + positions[n][sl] * s;
          const ny2 = cy + positions[n][sl + 1] * s;
          drawEdge(ctx, sx1 + 5 * s, ny1, sx2 - 5 * s, ny2, colors[n], fo * connectA * 0.4, s);
        }
      }
    }
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
    // 3D reconstruction emerging — flat slices assembling into depth
    const assemble = interpolate(frame, [15, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const layers = 8;
    for (let l = 0; l < layers; l++) {
      const la = stagger(frame, l, 3, 10);
      // Flat: all on same Y; assembled: spread in Y with perspective offset
      const flatY = cy;
      const assembledY = cy - 25 * s + l * (50 * s / layers);
      const ly = lerp(flatY, assembledY, assemble);
      const perspX = l * 2 * s * assemble;
      const depth = 1 - l * 0.05 * assemble;
      // Layer rect
      ctx.fillStyle = accent(l % 2, fo * la * 0.06 * depth);
      ctx.fillRect(cx - 30 * s * depth + perspX, ly - 2 * s, 60 * s * depth, 4 * s);
      ctx.strokeStyle = accent(l % 2, fo * la * 0.2 * depth);
      ctx.lineWidth = 0.5 * s;
      ctx.strokeRect(cx - 30 * s * depth + perspX, ly - 2 * s, 60 * s * depth, 4 * s);
    }
    // Neuron shape emerging as they assemble
    if (assemble > 0.5) {
      const na = (assemble - 0.5) * 2;
      ctx.strokeStyle = accent(0, fo * na * 0.5);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 5 * s, cy - 25 * s);
      ctx.quadraticCurveTo(cx + 10 * s, cy, cx - 3 * s, cy + 25 * s);
      ctx.stroke();
      drawNodeGradient(ctx, cx, cy, 5 * s * na, 0, fo * na);
    }
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
    // Counter: "7,000 slices" with vertical stack visualization
    const count = Math.floor(interpolate(frame, [10, 80], [0, 7000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const appear = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stack of thin lines
    const stackH = 60 * s;
    const nLines = Math.min(30, Math.floor(count / 250));
    for (let i = 0; i < nLines; i++) {
      const ly = cy + stackH / 2 - i * (stackH / 30);
      const la = stagger(frame, i, 1, 6);
      ctx.strokeStyle = accent(i % 2, fo * la * 0.3);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 25 * s, ly);
      ctx.lineTo(cx + 25 * s, ly);
      ctx.stroke();
    }
    // Connecting thread (the tracked neuron)
    const threadA = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (threadA > 0) {
      ctx.strokeStyle = accent(0, fo * threadA * 0.6);
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      const rng = seeded(2305);
      for (let i = 0; i <= nLines; i++) {
        const ly = cy + stackH / 2 - i * (stackH / 30);
        const bx = cx + (rng() - 0.5) * 10 * s;
        if (i === 0) ctx.moveTo(bx, ly); else ctx.lineTo(bx, ly);
      }
      ctx.stroke();
    }
    // Counter text
    ctx.fillStyle = C.text;
    ctx.font = `700 ${16 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(count.toLocaleString(), cx, cy - 45 * s);
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.fillText("slices connected", cx, cy - 35 * s);
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
    // Jigsaw puzzle — pieces snapping into place
    const pieces = 9;
    const gridCols = 3, gridRows = 3;
    const pw = 22 * s, ph = 18 * s;
    const rng = seeded(2306);
    for (let i = 0; i < pieces; i++) {
      const col = i % gridCols, row = Math.floor(i / gridCols);
      const targetX = cx - pw * 1.5 + col * pw + pw / 2;
      const targetY = cy - ph * 1.5 + row * ph + ph / 2;
      const sa = stagger(frame, i, 6, 15);
      const startX = cx + (rng() - 0.5) * 120 * s;
      const startY = cy + (rng() - 0.5) * 80 * s;
      const px = lerp(startX, targetX, sa);
      const py = lerp(startY, targetY, sa);
      drawPanel(ctx, px - pw / 2, py - ph / 2, pw, ph, i % 2, fo * 0.5);
      drawNode(ctx, px, py, 3 * s * sa, i % 2, fo * 0.4 * sa);
    }
    // "matched" label
    const la = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("pieces matched", cx, cy + 38 * s);
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
    // Side-by-side: scattered blobs (left) -> organized by color (right)
    const organize = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2307);
    const n = 12;
    for (let i = 0; i < n; i++) {
      const rawX = cx + (rng() - 0.5) * 80 * s;
      const rawY = cy + (rng() - 0.5) * 60 * s;
      const ci = i % 2;
      // Target: sorted by color (left cluster blue, right cluster orange)
      const targetX = ci === 0 ? cx - 25 * s + (i % 3) * 10 * s : cx + 15 * s + (i % 3) * 10 * s;
      const targetY = cy - 15 * s + Math.floor((i % 6) / 3) * 15 * s;
      const bx = lerp(rawX, targetX, organize);
      const by = lerp(rawY, targetY, organize);
      const sa = stagger(frame, i, 1, 8);
      drawNode(ctx, bx, by, 5 * s * sa, ci, fo * 0.6);
    }
    // Labels appearing
    if (organize > 0.7) {
      const la = (organize - 0.7) / 0.3;
      ctx.globalAlpha = fo * la;
      ctx.fillStyle = C.blue;
      ctx.font = `500 ${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron A", cx - 20 * s, cy + 28 * s);
      ctx.fillStyle = C.orange;
      ctx.fillText("neuron B", cx + 25 * s, cy + 28 * s);
    }
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
    // Thread being pulled through stacked sections
    const pull = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stack of horizontal lines (slices)
    for (let i = 0; i < 10; i++) {
      const ly = cy - 35 * s + i * 8 * s;
      const la = stagger(frame, i, 2, 8);
      ctx.strokeStyle = `rgba(200,200,215,${fo * la * 0.3})`;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 40 * s, ly);
      ctx.lineTo(cx + 40 * s, ly);
      ctx.stroke();
    }
    // Thread being pulled through (vertical curve)
    if (pull > 0) {
      const maxLayer = Math.floor(pull * 10);
      ctx.strokeStyle = accent(0, fo * 0.6);
      ctx.lineWidth = 2.5 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= maxLayer; i++) {
        const ly = cy - 35 * s + i * 8 * s;
        const bx = cx + Math.sin(i * 0.8) * 12 * s;
        if (i === 0) ctx.moveTo(bx, ly); else ctx.lineTo(bx, ly);
        // Blob on intersection
        drawNodeGradient(ctx, bx, ly, 3.5 * s, 0, fo * 0.8);
      }
      ctx.stroke();
    }
    // "same neuron" label
    const la = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("same neuron", cx, cy + 50 * s);
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
    // Neuron shape being built slice by slice from bottom
    const build = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceCount = Math.floor(build * 12);
    // Build a vertical neuron shape
    const rng = seeded(2309);
    for (let i = 0; i < sliceCount; i++) {
      const ly = cy + 30 * s - i * 5 * s;
      const blobR = (3 + Math.sin(i * 0.6) * 2) * s;
      const blobX = cx + Math.sin(i * 0.4) * 8 * s;
      // Slice indicator
      ctx.fillStyle = accent(0, fo * 0.06);
      ctx.fillRect(cx - 30 * s, ly - 2 * s, 60 * s, 4 * s);
      // Blob on this slice
      drawNodeGradient(ctx, blobX, ly, blobR, 0, fo * 0.7);
    }
    // Once complete, draw connecting outline
    if (build > 0.8) {
      const oa = (build - 0.8) / 0.2;
      ctx.strokeStyle = accent(0, fo * oa * 0.4);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const ly = cy + 30 * s - i * 5 * s;
        const blobX = cx + Math.sin(i * 0.4) * 8 * s;
        if (i === 0) ctx.moveTo(blobX, ly); else ctx.lineTo(blobX, ly);
      }
      ctx.stroke();
    }
    // "7000 slices" counter
    drawCounter(ctx, width, height, s, "7,000", "slices matched");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_023: VariantDef[] = [
  { id: "023-track-through-layers", label: "Neuron tracked through layers", component: V1 },
  { id: "023-color-assignment", label: "Blobs gaining color identity", component: V2 },
  { id: "023-three-neurons-slices", label: "Three neurons across slices", component: V3 },
  { id: "023-3d-assembly", label: "Flat slices assembling to 3D", component: V4 },
  { id: "023-counter-stack", label: "7000 slices with thread", component: V5 },
  { id: "023-jigsaw-snap", label: "Jigsaw pieces snapping together", component: V6 },
  { id: "023-scatter-to-sorted", label: "Scattered to sorted by color", component: V7 },
  { id: "023-thread-pull", label: "Thread pulled through stack", component: V8 },
  { id: "023-build-neuron", label: "Neuron built slice by slice", component: V9 },
];
