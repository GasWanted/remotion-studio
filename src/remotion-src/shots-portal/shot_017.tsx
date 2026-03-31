import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 017 — "Each section gets collected onto a tape and fed through the electron beam one by one."
// 9 variants — tape collection, beam scanning (DUR=120)

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
    drawHeader(ctx, width, height, s, frame, DUR, "Tape Collection");
    const cx = width / 2, cy = height / 2;
    // Conveyor tape — horizontal line with sections on it
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.4})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(width * 0.1, cy);
    ctx.lineTo(width * 0.9, cy);
    ctx.stroke();
    // Sections moving along the tape
    const scrollOffset = frame * 1.2 * s;
    for (let i = 0; i < 10; i++) {
      const rawX = width * 0.15 + i * 25 * s - scrollOffset % (25 * s);
      if (rawX > width * 0.1 && rawX < width * 0.85) {
        const sa = stagger(frame, i, 3, 10);
        drawPanel(ctx, rawX - 8 * s, cy - 12 * s, 16 * s, 10 * s, i % 2, fo * sa * 0.7);
        drawNode(ctx, rawX, cy - 7 * s, 2.5 * s * sa, i % 2, fo * 0.5 * sa);
      }
    }
    // Beam scanning one section (vertical line)
    const beamX = cx;
    const beamA = 0.3 + Math.sin(frame * 0.15) * 0.2;
    ctx.strokeStyle = accent(0, fo * beamA);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(beamX, cy - 40 * s);
    ctx.lineTo(beamX, cy - 12 * s);
    ctx.stroke();
    drawNode(ctx, beamX, cy - 42 * s, 4 * s, 0, fo * 0.6);
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
    // Reel-to-reel tape concept
    // Left reel (source)
    const reel1X = cx - 45 * s, reelY = cy;
    ctx.strokeStyle = accent(0, fo * 0.4);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(reel1X, reelY, 18 * s, 0, Math.PI * 2);
    ctx.stroke();
    drawNode(ctx, reel1X, reelY, 4 * s, 0, fo * 0.5);
    // Right reel (collection)
    const reel2X = cx + 45 * s;
    ctx.beginPath();
    ctx.arc(reel2X, reelY, 18 * s, 0, Math.PI * 2);
    ctx.stroke();
    drawNode(ctx, reel2X, reelY, 4 * s, 0, fo * 0.5);
    // Tape between reels
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.5})`;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(reel1X + 18 * s, reelY - 2 * s);
    ctx.lineTo(reel2X - 18 * s, reelY - 2 * s);
    ctx.stroke();
    // Sections on tape
    const progress = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nSections = Math.floor(progress * 8);
    for (let i = 0; i < nSections; i++) {
      const px = lerp(reel1X + 20 * s, reel2X - 20 * s, (i + 0.5) / 8);
      const sa = stagger(frame, i + 2, 5, 8);
      drawNode(ctx, px, reelY - 2 * s, 3 * s * sa, i % 2, fo * 0.6 * sa);
    }
    // Beam at center
    const beamPulse = 0.5 + Math.sin(frame * 0.2) * 0.3;
    drawEdgeGlow(ctx, cx, reelY - 35 * s, cx, reelY - 5 * s, 0, fo * beamPulse, s);
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
    // Sequential processing: sections queuing, one being scanned
    const queueCount = 6;
    for (let i = 0; i < queueCount; i++) {
      const sa = stagger(frame, i, 4, 10);
      const qx = cx - 50 * s + i * 18 * s;
      // Is this the one being scanned?
      const activeIdx = Math.floor(interpolate(frame, [20, 100], [0, queueCount], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      const isActive = i === activeIdx;
      if (isActive) {
        drawNodeGradient(ctx, qx, cy, 7 * s * sa, 0, fo);
        // Beam highlight
        drawEdgeGlow(ctx, qx, cy - 30 * s, qx, cy - 8 * s, 0, fo * 0.5, s);
        drawNode(ctx, qx, cy - 32 * s, 3 * s, 0, fo * 0.7);
      } else if (i < activeIdx) {
        drawCheck(ctx, qx, cy, 5 * s, 0, fo * sa * 0.5);
      } else {
        drawNodeDormant(ctx, qx, cy, 7 * s * sa, fo * sa);
      }
    }
    // "one by one" label
    const la = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * la;
    ctx.fillStyle = C.textDim;
    ctx.font = `500 ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("one by one", cx, cy + 30 * s);
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
    // Electron beam cone from top hitting section
    const appear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Beam source at top
    drawNodeGradient(ctx, cx, cy - 50 * s, 6 * s * appear, 0, fo);
    // Cone of beam
    const beamPulse = 0.6 + Math.sin(frame * 0.12) * 0.2;
    ctx.fillStyle = accent(0, fo * 0.06 * beamPulse * appear);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 44 * s);
    ctx.lineTo(cx - 20 * s, cy);
    ctx.lineTo(cx + 20 * s, cy);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accent(0, fo * 0.2 * appear);
    ctx.lineWidth = 1 * s;
    ctx.stroke();
    // Section being scanned
    drawPanel(ctx, cx - 25 * s, cy, 50 * s, 5 * s, 1, fo * appear);
    // Scan line moving across section
    const scanX = cx - 25 * s + interpolate(frame, [25, 100], [0, 50 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, fo * 0.6);
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(scanX, cy);
    ctx.lineTo(scanX, cy + 5 * s);
    ctx.stroke();
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
    // Film strip style — sections in filmstrip frames
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.4})`;
    ctx.lineWidth = 1.5 * s;
    // Top and bottom rail
    ctx.beginPath();
    ctx.moveTo(width * 0.08, cy - 22 * s);
    ctx.lineTo(width * 0.92, cy - 22 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.08, cy + 22 * s);
    ctx.lineTo(width * 0.92, cy + 22 * s);
    ctx.stroke();
    // Sprocket holes
    for (let i = 0; i < 14; i++) {
      const hx = width * 0.1 + i * (width * 0.8 / 13);
      ctx.fillStyle = `rgba(180,180,200,${fo * 0.2})`;
      ctx.beginPath();
      ctx.arc(hx, cy - 27 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hx, cy + 27 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    // Section frames scrolling
    const scroll = frame * 1.5 * s;
    for (let i = 0; i < 8; i++) {
      const fx = width * 0.12 + i * 30 * s - (scroll % (30 * s));
      if (fx > width * 0.05 && fx < width * 0.9) {
        drawPanel(ctx, fx, cy - 18 * s, 26 * s, 36 * s, i % 2, fo * 0.5);
        drawNode(ctx, fx + 13 * s, cy, 4 * s, i % 2, fo * 0.4);
      }
    }
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
    // Vertical stack of sections with beam hitting top one
    for (let i = 0; i < 6; i++) {
      const sa = stagger(frame, i, 4, 10);
      const sy = cy + 20 * s - i * 8 * s;
      const depth = 1 - i * 0.12;
      ctx.fillStyle = `rgba(230,170,50,${fo * sa * 0.08 * depth})`;
      ctx.fillRect(cx - 25 * s * depth, sy, 50 * s * depth, 5 * s);
      ctx.strokeStyle = `rgba(200,140,30,${fo * sa * 0.2 * depth})`;
      ctx.lineWidth = 0.5 * s;
      ctx.strokeRect(cx - 25 * s * depth, sy, 50 * s * depth, 5 * s);
    }
    // Beam hitting the top section
    const topY = cy + 20 * s - 5 * 8 * s;
    const beamA = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawEdgeGlow(ctx, cx, topY - 30 * s, cx, topY, 0, fo * beamA * 0.5, s);
    drawNodeGradient(ctx, cx, topY - 32 * s, 4 * s * beamA, 0, fo * beamA);
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
    // Pulse traveling through sequence of sections
    const pulsePos = interpolate(frame, [10, 100], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 8; i++) {
      const sx = cx - 56 * s + i * 16 * s;
      const sa = stagger(frame, i, 3, 8);
      const dist = Math.abs(pulsePos - i);
      const glow = Math.max(0, 1 - dist * 0.5);
      if (glow > 0.1) {
        drawNodeGradient(ctx, sx, cy, 6 * s * sa, 0, fo * glow);
      } else {
        drawNodeDormant(ctx, sx, cy, 6 * s * sa, fo * sa);
      }
      // Connecting line
      if (i < 7) {
        drawEdgeFaint(ctx, sx + 5 * s, cy, sx + 11 * s, cy, s);
      }
    }
    // Progress indicator at bottom
    const progress = pulsePos / 7;
    drawPanel(ctx, cx - 40 * s, cy + 20 * s, 80 * s, 4 * s, 0, fo * 0.3);
    ctx.fillStyle = accent(0, fo * 0.5);
    ctx.fillRect(cx - 39 * s, cy + 21 * s, 78 * s * progress, 2 * s);
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
    // Grid of tiny rectangles filling in — each represents a photographed section
    const fill = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cols = 8, rows = 6;
    const cellW = 10 * s, cellH = 8 * s;
    const gridW = cols * cellW, gridH = rows * cellH;
    const ox = cx - gridW / 2, oy = cy - gridH / 2;
    const total = cols * rows;
    const filled = Math.floor(fill * total);
    for (let i = 0; i < total; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const x = ox + col * cellW, y = oy + row * cellH;
      if (i < filled) {
        ctx.fillStyle = accent(i % 2, fo * 0.15);
        ctx.fillRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
        drawNode(ctx, x + cellW / 2, y + cellH / 2, 1.5 * s, i % 2, fo * 0.4);
      } else {
        ctx.strokeStyle = `rgba(200,200,210,${fo * 0.2})`;
        ctx.lineWidth = 0.5 * s;
        ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
      }
    }
    drawCounter(ctx, width, height, s, `${filled}/${total}`);
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
    // Tape winding around a spool
    const wind = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Spool center
    drawNode(ctx, cx, cy, 6 * s, 0, fo * 0.5);
    // Tape spiral growing
    ctx.strokeStyle = `rgba(180,180,200,${fo * 0.4})`;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    const maxAngle = wind * Math.PI * 8;
    for (let a = 0; a < maxAngle; a += 0.1) {
      const r = (10 + a * 2) * s;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (r > 55 * s) break;
      if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // Section dots on the tape
    for (let i = 0; i < Math.floor(wind * 12); i++) {
      const a = i * Math.PI * 0.6;
      const r = (10 + a * 2) * s;
      if (r > 55 * s) break;
      drawNode(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2 * s, i % 2, fo * 0.5);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_017: VariantDef[] = [
  { id: "017-conveyor-beam", label: "Conveyor tape with beam", component: V1 },
  { id: "017-reel-to-reel", label: "Reel-to-reel tape feed", component: V2 },
  { id: "017-sequential-scan", label: "Sequential scan queue", component: V3 },
  { id: "017-beam-cone", label: "Electron beam cone", component: V4 },
  { id: "017-film-strip", label: "Film strip sections", component: V5 },
  { id: "017-vertical-stack", label: "Vertical stack beam hit", component: V6 },
  { id: "017-pulse-chain", label: "Pulse through section chain", component: V7 },
  { id: "017-grid-fill", label: "Grid filling with scans", component: V8 },
  { id: "017-tape-spiral", label: "Tape winding on spool", component: V9 },
];
