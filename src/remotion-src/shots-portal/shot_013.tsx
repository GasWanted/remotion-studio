import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 013 — "But an electron beam can only photograph a thin flat section."
// 120 frames. Flat section limitation.

// V1: 3D brain shape, electron beam hits it but only captures a thin slice
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
    drawHeader(ctx, width, height, s, frame, DUR, "Thin Slice", "only one plane captured");
    const cx = width / 2, cy = height * 0.55;
    // 3D brain ellipse (dim outline, suggests volume)
    const brainA = stagger(frame, 0, 8, 15);
    ctx.strokeStyle = accent(0, 0.2 * brainA); ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, 40 * s * brainA, 30 * s * brainA, 0, 0, Math.PI * 2); ctx.stroke();
    // Multiple depth ellipses (dim, showing 3D)
    for (let i = -2; i <= 2; i++) {
      if (i === 0) continue;
      ctx.strokeStyle = accent(0, 0.08 * brainA); ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.ellipse(cx + i * 4 * s, cy, 35 * s * brainA, 25 * s * brainA, 0.1 * i, 0, Math.PI * 2); ctx.stroke();
    }
    // Highlighted thin slice (bright horizontal plane)
    const sliceA = stagger(frame, 4, 8, 15);
    ctx.fillStyle = accent(1, 0.2 * sliceA);
    ctx.fillRect(cx - 42 * s, cy - 2 * s, 84 * s * sliceA, 4 * s);
    ctx.strokeStyle = accent(1, 0.6 * sliceA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - 42 * s, cy); ctx.lineTo(cx + 42 * s * sliceA, cy); ctx.stroke();
    // Beam arrow from top
    const beamA = stagger(frame, 2, 8, 12);
    ctx.strokeStyle = accent(1, 0.4 * beamA); ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy - 50 * s); ctx.lineTo(cx, cy - 5 * s); ctx.stroke();
    ctx.fillStyle = accent(1, 0.5 * beamA);
    ctx.beginPath(); ctx.moveTo(cx - 4 * s, cy - 10 * s); ctx.lineTo(cx, cy - 2 * s); ctx.lineTo(cx + 4 * s, cy - 10 * s); ctx.fill();
    // Label
    const labA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("one thin slice", cx, cy + 42 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Stack of layers: only one thin layer is bright/photographed, rest are dim
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
    drawHeader(ctx, width, height, s, frame, DUR, "Layer Stack", "one layer photographed");
    const cx = width / 2, cy = height * 0.5;
    const numLayers = 7;
    const layerH = 8 * s, gap = 3 * s;
    const totalH = numLayers * (layerH + gap);
    const activeLayer = 3; // middle layer is the one captured
    for (let i = 0; i < numLayers; i++) {
      const ly = cy - totalH / 2 + i * (layerH + gap);
      const lA = stagger(frame, i, 4, 10);
      const isActive = i === activeLayer;
      const layerW = 80 * s * lA;
      // 3D perspective offset
      const offsetX = (i - 3) * 3 * s;
      if (isActive) {
        // Bright active layer
        ctx.fillStyle = accent(1, 0.3 * lA);
        ctx.fillRect(cx - layerW / 2 + offsetX, ly, layerW, layerH);
        ctx.strokeStyle = accent(1, 0.7 * lA); ctx.lineWidth = 1.5 * s;
        ctx.strokeRect(cx - layerW / 2 + offsetX, ly, layerW, layerH);
        // Nodes on the active layer
        for (let n = 0; n < 4; n++) {
          const nA = stagger(frame, n + 8, 4, 8);
          drawNode(ctx, cx - layerW / 3 + n * layerW / 4 + offsetX, ly + layerH / 2, 2.5 * s * nA, 1, fo * nA);
        }
      } else {
        // Dim layers
        ctx.fillStyle = `rgba(200,200,215,${0.1 * lA})`;
        ctx.fillRect(cx - layerW / 2 + offsetX, ly, layerW, layerH);
        ctx.strokeStyle = `rgba(200,200,215,${0.2 * lA})`; ctx.lineWidth = 1 * s;
        ctx.strokeRect(cx - layerW / 2 + offsetX, ly, layerW, layerH);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Beam arrow hitting a surface, only the top plane lights up
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
    drawHeader(ctx, width, height, s, frame, DUR, "Surface Only", "beam hits top plane");
    const cx = width / 2, cy = height * 0.5;
    // 3D block (isometric-ish)
    const blockA = stagger(frame, 0, 8, 15);
    const bw = 60 * s * blockA, bh = 40 * s * blockA, depth = 20 * s * blockA;
    // Back face
    ctx.fillStyle = `rgba(200,200,215,${0.1 * blockA})`;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2 + depth, cy - bh / 2 - depth);
    ctx.lineTo(cx + bw / 2 + depth, cy - bh / 2 - depth);
    ctx.lineTo(cx + bw / 2 + depth, cy + bh / 2 - depth);
    ctx.lineTo(cx - bw / 2 + depth, cy + bh / 2 - depth);
    ctx.fill();
    // Side face
    ctx.fillStyle = `rgba(200,200,215,${0.08 * blockA})`;
    ctx.beginPath();
    ctx.moveTo(cx + bw / 2, cy - bh / 2); ctx.lineTo(cx + bw / 2 + depth, cy - bh / 2 - depth);
    ctx.lineTo(cx + bw / 2 + depth, cy + bh / 2 - depth); ctx.lineTo(cx + bw / 2, cy + bh / 2);
    ctx.fill();
    // Front face (outline)
    ctx.strokeStyle = `rgba(180,180,200,${0.3 * blockA})`; ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
    // Top face (the surface that lights up)
    const surfA = stagger(frame, 4, 8, 15);
    ctx.fillStyle = accent(1, 0.2 * surfA);
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, cy - bh / 2); ctx.lineTo(cx - bw / 2 + depth, cy - bh / 2 - depth);
    ctx.lineTo(cx + bw / 2 + depth, cy - bh / 2 - depth); ctx.lineTo(cx + bw / 2, cy - bh / 2);
    ctx.fill();
    ctx.strokeStyle = accent(1, 0.5 * surfA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, cy - bh / 2); ctx.lineTo(cx - bw / 2 + depth, cy - bh / 2 - depth);
    ctx.lineTo(cx + bw / 2 + depth, cy - bh / 2 - depth); ctx.lineTo(cx + bw / 2, cy - bh / 2);
    ctx.closePath(); ctx.stroke();
    // Beam from above
    const beamA = stagger(frame, 2, 8, 12);
    ctx.strokeStyle = accent(1, 0.4 * beamA); ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, height * 0.15); ctx.lineTo(cx, cy - bh / 2 - depth / 2); ctx.stroke();
    ctx.fillStyle = accent(1, 0.5 * beamA);
    ctx.beginPath();
    ctx.moveTo(cx - 4 * s, cy - bh / 2 - depth / 2 - 6 * s);
    ctx.lineTo(cx, cy - bh / 2 - depth / 2);
    ctx.lineTo(cx + 4 * s, cy - bh / 2 - depth / 2 - 6 * s);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Thin rectangle (bright) extracted from a 3D cube (dim outline)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Extracted Slice", "thin section from volume");
    const cx = width * 0.35, cy = height * 0.55;
    // Dim cube outline
    const cubeA = stagger(frame, 0, 8, 15);
    ctx.strokeStyle = `rgba(180,180,200,${0.25 * cubeA})`; ctx.lineWidth = 1.5 * s;
    const cw = 40 * s * cubeA;
    ctx.strokeRect(cx - cw, cy - cw, cw * 2, cw * 2);
    // Depth lines
    const d = 12 * s * cubeA;
    ctx.beginPath(); ctx.moveTo(cx - cw, cy - cw); ctx.lineTo(cx - cw + d, cy - cw - d); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + cw, cy - cw); ctx.lineTo(cx + cw + d, cy - cw - d); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + cw, cy + cw); ctx.lineTo(cx + cw + d, cy + cw - d); ctx.stroke();
    // Extracted slice moving right
    const extractT = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceX = lerp(cx, width * 0.72, extractT);
    const sliceW = 60 * s, sliceH = 4 * s;
    ctx.fillStyle = accent(1, 0.25 * cubeA);
    ctx.fillRect(sliceX - sliceW / 2, cy - sliceH / 2, sliceW, sliceH);
    ctx.strokeStyle = accent(1, 0.6 * cubeA); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(sliceX - sliceW / 2, cy - sliceH / 2, sliceW, sliceH);
    // Nodes on the slice
    if (extractT > 0.3) {
      const nodeA = (extractT - 0.3) / 0.7;
      for (let i = 0; i < 4; i++) {
        drawNode(ctx, sliceX - sliceW / 3 + i * sliceW / 3.5, cy, 2.5 * s * nodeA, i % 2, fo * nodeA);
      }
    }
    // Label
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("3D volume", cx, cy + cw + 14 * s);
    ctx.fillText("thin section", sliceX, cy + 18 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Cross-section view: knife cutting through, revealing one flat image
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
    drawHeader(ctx, width, height, s, frame, DUR, "Cross Section", "knife cuts one plane");
    const cx = width / 2, cy = height * 0.55;
    // Brain ellipse
    const brainA = stagger(frame, 0, 8, 15);
    ctx.strokeStyle = accent(0, 0.25 * brainA); ctx.lineWidth = 2 * s;
    ctx.fillStyle = accent(0, 0.05 * brainA);
    ctx.beginPath(); ctx.ellipse(cx, cy, 45 * s * brainA, 30 * s * brainA, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Cutting line sweeping down
    const cutT = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cutY = lerp(cy - 35 * s, cy, cutT);
    ctx.strokeStyle = accent(1, 0.6 * cutT); ctx.lineWidth = 2 * s;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(cx - 50 * s, cutY); ctx.lineTo(cx + 50 * s, cutY); ctx.stroke();
    ctx.setLineDash([]);
    // Knife triangle
    ctx.fillStyle = accent(1, 0.4 * cutT);
    ctx.beginPath();
    ctx.moveTo(cx + 52 * s, cutY - 6 * s); ctx.lineTo(cx + 60 * s, cutY);
    ctx.lineTo(cx + 52 * s, cutY + 6 * s); ctx.fill();
    // Revealed cross-section image
    if (cutT > 0.5) {
      const revA = (cutT - 0.5) / 0.5;
      const imgY = cy + 45 * s;
      drawPanel(ctx, cx - 40 * s, imgY, 80 * s, 20 * s, 1, fo * revA);
      for (let i = 0; i < 5; i++) {
        const nA = stagger(frame, i + 10, 3, 8);
        drawNode(ctx, cx - 30 * s + i * 15 * s, imgY + 10 * s, 2.5 * s * nA, i % 2, fo * nA * revA);
      }
      ctx.globalAlpha = fo * revA;
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("flat image", cx, imgY + 34 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Text "thin flat section" with a glowing 2D rectangle
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
    const cx = width / 2, cy = height * 0.4;
    // Title text
    const txtA = stagger(frame, 0, 8, 15);
    ctx.globalAlpha = fo * txtA;
    ctx.fillStyle = C.text; ctx.font = `700 ${16 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("thin flat section", cx, cy);
    // Glowing 2D rectangle below
    const rectA = stagger(frame, 3, 8, 18);
    const rw = 110 * s * rectA, rh = 6 * s;
    const ry = cy + 22 * s;
    // Glow
    const glow = ctx.createRadialGradient(cx, ry, 0, cx, ry, rw * 0.6);
    glow.addColorStop(0, accent(1, 0.12 * rectA));
    glow.addColorStop(1, accent(1, 0));
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, ry, rw * 0.6, 0, Math.PI * 2); ctx.fill();
    // Rectangle
    ctx.fillStyle = accent(1, 0.3 * rectA);
    ctx.fillRect(cx - rw / 2, ry - rh / 2, rw, rh);
    ctx.strokeStyle = accent(1, 0.6 * rectA); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - rw / 2, ry - rh / 2, rw, rh);
    // Nodes on the rectangle
    for (let i = 0; i < 5; i++) {
      const nA = stagger(frame, i + 6, 4, 8);
      drawNode(ctx, cx - rw / 3 + i * rw / 4, ry, 2.5 * s * nA, i % 2, fo * nA);
    }
    // Subtitle
    const subA = stagger(frame, 12, 8, 12);
    ctx.globalAlpha = fo * subA;
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("2D image of 3D structure", cx, ry + 25 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Multiple horizontal planes in a stack, beam can only see one at a time
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
    drawHeader(ctx, width, height, s, frame, DUR, "One At A Time", "beam scans single plane");
    const cx = width / 2, cy = height * 0.5;
    const numPlanes = 6;
    const planeGap = 14 * s;
    const totalH = numPlanes * planeGap;
    // Active plane cycles
    const activeIdx = Math.floor(interpolate(frame, [15, 100], [0, numPlanes - 0.01], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < numPlanes; i++) {
      const py = cy - totalH / 2 + i * planeGap;
      const lA = stagger(frame, i, 3, 8);
      const isActive = i === activeIdx;
      const pw = 80 * s * lA;
      // Perspective offset
      const offX = (i - numPlanes / 2) * 2 * s;
      if (isActive) {
        ctx.fillStyle = accent(1, 0.2 * lA);
        ctx.fillRect(cx - pw / 2 + offX, py, pw, 3 * s);
        ctx.strokeStyle = accent(1, 0.6 * lA); ctx.lineWidth = 1 * s;
        ctx.strokeRect(cx - pw / 2 + offX, py, pw, 3 * s);
        // Beam pointer
        drawNode(ctx, cx - pw / 2 - 10 * s + offX, py + 1.5 * s, 3 * s, 1, fo * lA);
      } else {
        ctx.fillStyle = `rgba(200,200,215,${0.12 * lA})`;
        ctx.fillRect(cx - pw / 2 + offX, py, pw, 3 * s);
      }
    }
    // Label
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`plane ${activeIdx + 1} of ${numPlanes}`, cx, cy + totalH / 2 + 18 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Camera icon -> arrow -> flat rectangle (not 3D volume)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Flat Capture", "2D not 3D");
    const cy = height * 0.55;
    const x1 = width * 0.2, x2 = width / 2, x3 = width * 0.8;
    // Camera/beam icon (simplified as lens circle + body rectangle)
    const camA = stagger(frame, 0, 8, 12);
    ctx.strokeStyle = accent(1, 0.5 * camA); ctx.lineWidth = 2 * s;
    ctx.strokeRect(x1 - 12 * s, cy - 8 * s * camA, 20 * s * camA, 16 * s * camA);
    ctx.beginPath(); ctx.arc(x1 + 10 * s * camA, cy, 5 * s * camA, 0, Math.PI * 2); ctx.stroke();
    drawNode(ctx, x1 + 10 * s * camA, cy, 2 * s * camA, 1, fo * camA);
    // Arrow
    const arrA = stagger(frame, 3, 8, 12);
    drawEdge(ctx, x1 + 22 * s, cy, x2 - 20 * s, cy, 1, 0.3 * arrA, s);
    ctx.fillStyle = accent(1, 0.4 * arrA);
    ctx.beginPath();
    ctx.moveTo(x2 - 22 * s, cy - 4 * s); ctx.lineTo(x2 - 14 * s, cy); ctx.lineTo(x2 - 22 * s, cy + 4 * s);
    ctx.fill();
    // Flat rectangle (result)
    const flatA = stagger(frame, 5, 8, 15);
    const rw = 70 * s * flatA, rh = 5 * s;
    ctx.fillStyle = accent(1, 0.2 * flatA);
    ctx.fillRect(x3 - rw / 2, cy - rh / 2, rw, rh);
    ctx.strokeStyle = accent(1, 0.6 * flatA); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(x3 - rw / 2, cy - rh / 2, rw, rh);
    // Nodes on the flat result
    for (let i = 0; i < 4; i++) {
      const nA = stagger(frame, i + 8, 4, 8);
      drawNode(ctx, x3 - rw / 3 + i * rw / 3.5, cy, 2 * s * nA, i % 2, fo * nA);
    }
    // Labels
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("electron beam", x1, cy + 20 * s);
    ctx.fillText("flat section", x3, cy + 16 * s);
    // X over "3D" with check on "2D"
    drawXMark(ctx, x2, cy - 18 * s, 8 * s, 1, fo * labA);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("not 3D", x2, cy - 28 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Brain outline with a single horizontal slice highlighted, "one section at a time" label
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
    drawHeader(ctx, width, height, s, frame, DUR, "One Section", "at a time");
    const cx = width / 2, cy = height * 0.52;
    // Brain outline (fly brain shape)
    const brainA = stagger(frame, 0, 8, 15);
    ctx.strokeStyle = accent(0, 0.3 * brainA); ctx.lineWidth = 2 * s;
    ctx.fillStyle = accent(0, 0.04 * brainA);
    ctx.beginPath(); ctx.ellipse(cx, cy, 50 * s * brainA, 35 * s * brainA, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    // Moving horizontal slice
    const sliceY = cy + Math.sin(frame * 0.04) * 22 * s;
    const sliceA = stagger(frame, 3, 8, 15);
    // Clipping to brain bounds
    const sliceHalfW = Math.sqrt(Math.max(0, 1 - Math.pow((sliceY - cy) / (35 * s), 2))) * 50 * s * brainA;
    ctx.fillStyle = accent(1, 0.2 * sliceA);
    ctx.fillRect(cx - sliceHalfW, sliceY - 2 * s, sliceHalfW * 2, 4 * s);
    ctx.strokeStyle = accent(1, 0.6 * sliceA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - sliceHalfW, sliceY); ctx.lineTo(cx + sliceHalfW, sliceY); ctx.stroke();
    // Nodes on the current slice
    if (sliceA > 0.5) {
      const numNodes = 3;
      for (let i = 0; i < numNodes; i++) {
        const nx = cx - sliceHalfW * 0.6 + i * sliceHalfW * 0.6;
        const nA = stagger(frame, i + 6, 4, 8);
        drawNode(ctx, nx, sliceY, 2.5 * s * nA, i % 2, fo * nA * sliceA);
      }
    }
    // Label
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("one section at a time", cx, cy + 48 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_013: VariantDef[] = [
  { id: "013-brain-slice", label: "Brain With Thin Slice", component: V1 },
  { id: "013-layer-stack", label: "Layer Stack Active", component: V2 },
  { id: "013-beam-surface", label: "Beam Hits Surface", component: V3 },
  { id: "013-extract-rect", label: "Extract From Cube", component: V4 },
  { id: "013-knife-cross", label: "Knife Cross Section", component: V5 },
  { id: "013-flat-text", label: "Thin Flat Section Text", component: V6 },
  { id: "013-planes-cycle", label: "One Plane At A Time", component: V7 },
  { id: "013-camera-flat", label: "Camera To Flat Result", component: V8 },
  { id: "013-brain-section", label: "Brain Slice Moving", component: V9 },
];
