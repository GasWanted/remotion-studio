import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 033 — "The question is — if you copy every connection into a computer and turn it on, does it actually work?"
// 150 frames. 9 variants: power on question — monitor, power button, question mark.

const DUR = 150;

// V1: Monitor with network inside, power button pulsing, "?" overlay
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.45;
    const mw = 160 * s, mh = 100 * s;
    // Monitor frame
    const appear = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = `rgba(60,60,80,${fo * appear * 0.4})`;
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(cx - mw / 2, cy - mh / 2, mw, mh);
    // Stand
    ctx.fillStyle = `rgba(60,60,80,${fo * appear * 0.3})`;
    ctx.fillRect(cx - 10 * s, cy + mh / 2, 20 * s, 12 * s);
    ctx.fillRect(cx - 25 * s, cy + mh / 2 + 12 * s, 50 * s, 3 * s);
    // Screen content — network
    if (appear > 0.5) {
      const rng = seeded(3301);
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - mw / 2 + 3 * s, cy - mh / 2 + 3 * s, mw - 6 * s, mh - 6 * s);
      ctx.clip();
      ctx.fillStyle = `rgba(240,240,245,${fo})`;
      ctx.fillRect(cx - mw / 2, cy - mh / 2, mw, mh);
      for (let i = 0; i < 25; i++) {
        const nx = cx + (rng() - 0.5) * mw * 0.8;
        const ny = cy + (rng() - 0.5) * mh * 0.7;
        drawNodeDormant(ctx, nx, ny, 2 * s, fo * 0.5);
        if (i > 0 && i % 2 === 0) drawEdgeFaint(ctx, nx, ny, cx + (rng() - 0.5) * mw * 0.8, cy + (rng() - 0.5) * mh * 0.7, s);
      }
      ctx.restore();
    }
    // Power button
    const btnX = cx + mw / 2 + 20 * s, btnY = cy;
    const pulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
    ctx.strokeStyle = accent(0, fo * pulse);
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(btnX, btnY, 10 * s, 0.5, Math.PI * 2 - 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(btnX, btnY - 10 * s); ctx.lineTo(btnX, btnY - 4 * s); ctx.stroke();
    // Question mark
    const qT = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qT > 0) {
      ctx.fillStyle = C.text;
      ctx.font = `700 ${30 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.globalAlpha = fo * qT;
      ctx.fillText("?", cx, cy + 8 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Power button being pressed — network flickering
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Turn It On?", "the big question");
    const cx = width / 2, cy = height / 2;
    // Large power button
    const r = 40 * s;
    const pulse = 0.5 + Math.sin(frame * 0.06) * 0.5;
    const appear = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Outer ring
    ctx.strokeStyle = accent(0, fo * appear * (0.3 + pulse * 0.3));
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r * appear, 0.4, Math.PI * 2 - 0.4); ctx.stroke();
    // Power line
    ctx.strokeStyle = accent(0, fo * appear * 0.7);
    ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.8 * appear); ctx.lineTo(cx, cy - r * 0.25 * appear); ctx.stroke();
    // Glow behind button
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
    glow.addColorStop(0, `rgba(64,144,255,${fo * pulse * 0.08})`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, r * 2, 0, Math.PI * 2); ctx.fill();
    // Question below
    if (frame > 60) {
      ctx.fillStyle = C.textDim; ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("does it work?", cx, cy + r + 25 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Copy animation — nodes duplicating from left panel to right panel
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Copy & Run", "into a computer");
    // Left panel — brain (source)
    drawPanel(ctx, width * 0.05, height * 0.2, width * 0.35, height * 0.55, 0, fo * 0.5);
    // Right panel — computer (target)
    drawPanel(ctx, width * 0.6, height * 0.2, width * 0.35, height * 0.55, 1, fo * 0.5);
    const rng = seeded(3303);
    const copyProg = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Source nodes
    for (let i = 0; i < 15; i++) {
      const nx = width * 0.08 + rng() * width * 0.28;
      const ny = height * 0.25 + rng() * height * 0.45;
      drawNode(ctx, nx, ny, 2.5 * s, 0, fo * 0.6);
    }
    // Copied nodes appearing on right
    const copied = Math.floor(copyProg * 15);
    const rng2 = seeded(3303); // same seed for matching positions
    for (let i = 0; i < copied; i++) {
      const srcX = width * 0.08 + rng2() * width * 0.28;
      const srcY = height * 0.25 + rng2() * height * 0.45;
      const dstX = srcX + width * 0.55;
      drawNode(ctx, dstX, srcY, 2.5 * s, 1, fo);
    }
    // Arrow
    ctx.strokeStyle = accent(0, fo * 0.3);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.42, height / 2); ctx.lineTo(width * 0.58, height / 2); ctx.stroke();
    ctx.fillStyle = accent(0, fo * 0.3);
    ctx.beginPath(); ctx.moveTo(width * 0.56, height / 2 - 4 * s); ctx.lineTo(width * 0.6, height / 2); ctx.lineTo(width * 0.56, height / 2 + 4 * s); ctx.fill();
    // Labels
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("brain", width * 0.225, height * 0.17);
    ctx.fillText("computer", width * 0.775, height * 0.17);
    // Question
    if (copyProg > 0.8) {
      ctx.fillStyle = C.text; ctx.font = `700 ${14 * s}px system-ui`;
      ctx.fillText("?", width * 0.775, height * 0.82);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Network inside chip/circuit board outline, question mark hovering
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "In Silicon", "does it work?");
    const cx = width / 2, cy = height / 2;
    const chipW = 100 * s, chipH = 80 * s;
    // Chip outline
    ctx.strokeStyle = `rgba(60,60,80,${fo * 0.4})`;
    ctx.lineWidth = 2 * s;
    ctx.strokeRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);
    // Pins
    for (let i = 0; i < 6; i++) {
      const px = cx - chipW / 2 + (i + 0.5) * (chipW / 6);
      ctx.fillStyle = `rgba(60,60,80,${fo * 0.3})`;
      ctx.fillRect(px - 2 * s, cy - chipH / 2 - 8 * s, 4 * s, 8 * s);
      ctx.fillRect(px - 2 * s, cy + chipH / 2, 4 * s, 8 * s);
    }
    // Network inside chip
    const rng = seeded(3304);
    const prog = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(prog * 20);
    for (let i = 0; i < count; i++) {
      const nx = cx + (rng() - 0.5) * chipW * 0.8;
      const ny = cy + (rng() - 0.5) * chipH * 0.7;
      drawNode(ctx, nx, ny, 2 * s, i % 2, fo * 0.6);
      if (i > 0) drawEdgeFaint(ctx, nx, ny, cx + (rng() - 0.5) * chipW * 0.8, cy + (rng() - 0.5) * chipH * 0.7, s);
    }
    // Question mark
    const qT = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qT > 0) {
      ctx.fillStyle = C.text; ctx.font = `700 ${35 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * qT;
      ctx.fillText("?", cx, cy + 12 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Cursor hovering over ON button with network waiting
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Ready?", "cursor hovering");
    const cx = width / 2, cy = height * 0.42;
    // Dormant network
    const rng = seeded(3305);
    for (let i = 0; i < 30; i++) {
      drawNodeDormant(ctx, cx + (rng() - 0.5) * 200 * s, cy + (rng() - 0.5) * 120 * s, 2.5 * s, fo * 0.4);
    }
    // ON button
    const btnX = cx, btnY = height * 0.78;
    const btnR = 18 * s;
    const hover = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPanel(ctx, btnX - 30 * s, btnY - 12 * s, 60 * s, 24 * s, 0, fo * (0.4 + hover * 0.3));
    ctx.fillStyle = accent(0, fo * (0.5 + hover * 0.3));
    ctx.font = `700 ${10 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("ON", btnX, btnY + 4 * s);
    // Cursor approaching button
    const cursorX = lerp(cx + 60 * s, btnX + 5 * s, hover);
    const cursorY = lerp(height * 0.6, btnY - 5 * s, hover);
    ctx.strokeStyle = C.text; ctx.lineWidth = 1.5 * s;
    // Cursor arrow shape
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(cursorX, cursorY + 12 * s);
    ctx.lineTo(cursorX + 4 * s, cursorY + 9 * s);
    ctx.lineTo(cursorX + 7 * s, cursorY + 14 * s);
    ctx.stroke();
    // Anticipation pulse
    if (hover > 0.8) {
      const glow = ctx.createRadialGradient(btnX, btnY, 0, btnX, btnY, 35 * s);
      glow.addColorStop(0, `rgba(64,144,255,${fo * 0.08 * Math.sin(frame * 0.1)})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(btnX, btnY, 35 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Brain-to-computer transfer with "?" at the end
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cy = height / 2;
    // Brain (left)
    const brainX = width * 0.2;
    ctx.strokeStyle = accent(0, fo * 0.4);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.ellipse(brainX, cy, 30 * s, 25 * s, 0, 0, Math.PI * 2); ctx.stroke();
    const rng = seeded(3306);
    for (let i = 0; i < 10; i++) {
      drawNode(ctx, brainX + (rng() - 0.5) * 40 * s, cy + (rng() - 0.5) * 30 * s, 1.5 * s, 0, fo * 0.5);
    }
    // Arrow with traveling signal
    const arrowProg = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ax = width * 0.33, bx = width * 0.57;
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(bx, cy); ctx.stroke();
    if (arrowProg > 0) drawSignalPulse(ctx, ax, cy, bx, cy, arrowProg, 0, s);
    // Computer (right)
    const compX = width * 0.75;
    ctx.strokeStyle = `rgba(60,60,80,${fo * 0.3})`;
    ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(compX - 35 * s, cy - 25 * s, 70 * s, 45 * s);
    ctx.fillRect(compX - 8 * s, cy + 20 * s, 16 * s, 6 * s);
    if (arrowProg > 0.5) {
      for (let i = 0; i < 8; i++) {
        drawNodeDormant(ctx, compX + (rng() - 0.5) * 50 * s, cy + (rng() - 0.5) * 30 * s, 2 * s, fo * (arrowProg - 0.5) * 2);
      }
    }
    // Question
    if (arrowProg > 0.9) {
      ctx.fillStyle = C.text; ctx.font = `700 ${28 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("?", compX, cy + 8 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Toggle switch between OFF and ON, network waiting
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "The Switch", "on or off?");
    const cx = width / 2, cy = height * 0.4;
    // Network (dormant)
    const rng = seeded(3307);
    for (let i = 0; i < 25; i++) {
      drawNodeDormant(ctx, cx + (rng() - 0.5) * 220 * s, cy + (rng() - 0.5) * 130 * s, 2 * s, fo * 0.3);
    }
    // Toggle switch
    const switchX = cx, switchY = height * 0.78;
    const tw = 40 * s, th = 18 * s;
    const switchProg = interpolate(frame, [50, 100], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Track
    ctx.fillStyle = switchProg > 0.3 ? accent(0, fo * 0.3) : `rgba(200,200,210,${fo * 0.3})`;
    ctx.beginPath();
    ctx.arc(switchX - tw / 2 + th / 2, switchY, th / 2, Math.PI / 2, Math.PI * 3 / 2);
    ctx.arc(switchX + tw / 2 - th / 2, switchY, th / 2, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    // Knob
    const knobX = lerp(switchX - tw / 2 + th / 2, switchX + tw / 2 - th / 2, switchProg);
    drawNodeGradient(ctx, knobX, switchY, th / 2 - 1 * s, 0, fo);
    // Labels
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("OFF", switchX - tw / 2 - 12 * s, switchY + 3 * s);
    ctx.fillText("ON", switchX + tw / 2 + 10 * s, switchY + 3 * s);
    // Question
    if (frame > 80) {
      ctx.fillStyle = C.text; ctx.font = `700 ${16 * s}px system-ui`;
      ctx.fillText("does it work?", cx, switchY + 25 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Three stages: wiring -> computer -> "?" question reveal
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const positions = [width * 0.2, width * 0.5, width * 0.8];
    const cy = height / 2;
    // Stage 1: Wiring diagram
    const t1 = stagger(frame, 0, 1, 20);
    if (t1 > 0) {
      drawPanel(ctx, positions[0] - 35 * s, cy - 30 * s, 70 * s, 60 * s, 0, fo * t1 * 0.4);
      const rng = seeded(3308);
      for (let i = 0; i < 6; i++) {
        drawNode(ctx, positions[0] + (rng() - 0.5) * 50 * s, cy + (rng() - 0.5) * 40 * s, 2 * s * t1, 0, fo * t1 * 0.6);
      }
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("wiring", positions[0], cy + 40 * s);
    }
    // Arrow 1
    if (t1 > 0.5) {
      drawEdge(ctx, positions[0] + 40 * s, cy, positions[1] - 40 * s, cy, 0, fo * 0.2, s);
    }
    // Stage 2: Computer
    const t2 = stagger(frame, 30, 1, 20);
    if (t2 > 0) {
      ctx.strokeStyle = `rgba(60,60,80,${fo * t2 * 0.3})`;
      ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(positions[1] - 30 * s, cy - 25 * s, 60 * s, 40 * s);
      ctx.fillRect(positions[1] - 8 * s, cy + 15 * s, 16 * s, 5 * s);
      ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("computer", positions[1], cy + 40 * s);
    }
    // Arrow 2
    if (t2 > 0.5) {
      drawEdge(ctx, positions[1] + 35 * s, cy, positions[2] - 30 * s, cy, 1, fo * 0.2, s);
    }
    // Stage 3: Question mark
    const t3 = stagger(frame, 70, 1, 20);
    if (t3 > 0) {
      ctx.fillStyle = C.text; ctx.font = `700 ${40 * s}px system-ui`; ctx.textAlign = "center";
      ctx.globalAlpha = fo * t3;
      ctx.fillText("?", positions[2], cy + 14 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Full screen question mark growing from center with dormant network behind
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    // Background network slowly building
    const rng = seeded(3309);
    const netProg = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(netProg * 40);
    for (let i = 0; i < count; i++) {
      const x = cx + (rng() - 0.5) * 300 * s, y = cy + (rng() - 0.5) * 250 * s;
      drawNodeDormant(ctx, x, y, 2 * s, fo * 0.3);
      if (i > 0 && i % 3 === 0) drawEdgeFaint(ctx, x, y, cx + (rng() - 0.5) * 300 * s, cy + (rng() - 0.5) * 250 * s, s);
    }
    // Growing question mark
    const qSize = interpolate(frame, [50, 120], [0, 60 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qSize > 0) {
      ctx.fillStyle = C.text;
      ctx.font = `700 ${qSize}px system-ui`;
      ctx.textAlign = "center";
      ctx.globalAlpha = fo * 0.7;
      ctx.fillText("?", cx, cy + qSize * 0.3);
      ctx.globalAlpha = fo;
    }
    // Subtitle
    if (frame > 100) {
      ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("does it actually work?", cx, cy + 65 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_033: VariantDef[] = [
  { id: "033-monitor-power", label: "Monitor with power button", component: V1 },
  { id: "033-power-btn", label: "Power button pulsing", component: V2 },
  { id: "033-copy-transfer", label: "Brain to computer copy", component: V3 },
  { id: "033-chip-circuit", label: "Network inside chip", component: V4 },
  { id: "033-cursor-hover", label: "Cursor hovering ON button", component: V5 },
  { id: "033-brain-to-comp", label: "Brain to computer signal", component: V6 },
  { id: "033-toggle-switch", label: "Toggle switch off/on", component: V7 },
  { id: "033-three-stage", label: "Wiring to computer to ?", component: V8 },
  { id: "033-big-question", label: "Growing question mark", component: V9 },
];
