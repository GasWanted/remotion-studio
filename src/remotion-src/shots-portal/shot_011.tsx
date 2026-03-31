import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 011 — "So you use electrons instead. They have a much shorter wavelength"
// 120 frames. Electron solution.

// V1: Light wave (large, blue) fading out, electron wave (tiny, orange) fading in
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
    drawHeader(ctx, width, height, s, frame, DUR, "Electrons Instead", "shorter wavelength");
    const cy = height * 0.55;
    // Light wave fading out
    const lightA = interpolate(frame, [5, 20, 50, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(0, 0.5 * lightA); ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + frame) * 0.02) * 30 * s * lightA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Electron wave fading in (much tighter frequency)
    const elecA = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = accent(1, 0.6 * elecA); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + frame * 2) * 0.12) * 8 * s * elecA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Labels
    ctx.fillStyle = accent(0); ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
    ctx.globalAlpha = fo * lightA;
    ctx.fillText("light", width * 0.05, cy - 35 * s);
    ctx.globalAlpha = fo * elecA;
    ctx.fillStyle = accent(1); ctx.fillText("electrons", width * 0.05, cy + 20 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Side by side: light wavelength bar vs electron wavelength bar (electron much shorter)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Wavelength Comparison", "light vs electrons");
    const cx = width / 2, y1 = height * 0.42, y2 = height * 0.62;
    // Light bar (wide, blue)
    const barA = stagger(frame, 0, 8, 15);
    const lightW = 130 * s * barA;
    drawPanel(ctx, cx - lightW / 2, y1 - 10 * s, lightW, 20 * s, 0, fo * barA);
    ctx.globalAlpha = fo * barA;
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("light ~500nm", cx, y1 + 4 * s);
    // Electron bar (tiny, orange)
    const elecA = stagger(frame, 4, 8, 15);
    const elecW = 3 * s * elecA;
    ctx.globalAlpha = fo * elecA;
    drawPanel(ctx, cx - elecW / 2, y2 - 10 * s, Math.max(1, elecW), 20 * s, 1, fo * elecA);
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("electrons ~0.01nm", cx, y2 + 4 * s);
    // Ratio label
    const ratA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * ratA;
    ctx.fillStyle = C.grayDark; ctx.font = `italic ${9 * s}px system-ui`;
    ctx.fillText("50,000\u00D7 shorter", cx, (y1 + y2) / 2 + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Beam switch: light beam can't resolve -> electron beam resolves clearly
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
    drawHeader(ctx, width, height, s, frame, DUR, "Beam Switch", "light fails, electrons resolve");
    const cx = width / 2, cy = height * 0.55;
    const switchT = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Beam source on left
    const beamA = stagger(frame, 0, 8, 12);
    const beamColor = switchT < 0.5 ? accent(0, 0.5 * beamA) : accent(1, 0.6 * beamA);
    ctx.strokeStyle = beamColor; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(width * 0.1, cy); ctx.lineTo(cx - 25 * s, cy); ctx.stroke();
    // Target region
    const targets = [-15, -5, 5, 15];
    if (switchT < 0.5) {
      // Light: blurry blobs
      for (const off of targets) {
        const grad = ctx.createRadialGradient(cx + off * s, cy, 0, cx + off * s, cy, 10 * s);
        grad.addColorStop(0, accent(0, 0.2));
        grad.addColorStop(1, accent(0, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx + off * s, cy, 10 * s, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      // Electrons: sharp resolved nodes
      for (let i = 0; i < targets.length; i++) {
        const nodeA = stagger(frame, i + 8, 4, 8);
        drawNode(ctx, cx + targets[i] * s, cy, 3.5 * s * nodeA, 1, fo * nodeA * switchT);
      }
    }
    // Label
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.globalAlpha = fo * beamA;
    ctx.fillText(switchT < 0.5 ? "light beam — can't resolve" : "electron beam — resolved!", cx, cy + 30 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Two sine waves: top wide (light), bottom tight (electrons)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Two Waves", "wide vs tight");
    const y1 = height * 0.4, y2 = height * 0.65;
    // Top: wide light wave
    const topA = stagger(frame, 0, 8, 18);
    ctx.strokeStyle = accent(0, 0.5 * topA); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    for (let x = width * 0.1; x < width * 0.9; x += 2) {
      const y = y1 + Math.sin((x + frame) * 0.02) * 18 * s * topA;
      if (x < width * 0.11) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = fo * topA;
    ctx.fillStyle = accent(0); ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "right";
    ctx.fillText("light", width * 0.09, y1 + 4 * s);
    // Bottom: tight electron wave
    const botA = stagger(frame, 4, 8, 18);
    ctx.globalAlpha = fo * botA;
    ctx.strokeStyle = accent(1, 0.6 * botA); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    for (let x = width * 0.1; x < width * 0.9; x += 2) {
      const y = y2 + Math.sin((x + frame * 2) * 0.12) * 6 * s * botA;
      if (x < width * 0.11) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = accent(1); ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "right";
    ctx.fillText("electrons", width * 0.09, y2 + 4 * s);
    // Neuron dots visible between electron peaks
    const dotA = stagger(frame, 8, 8, 12);
    for (let i = 0; i < 3; i++) {
      const dx = width * (0.35 + i * 0.15);
      drawNode(ctx, dx, y2, 2.5 * s * dotA, 1, fo * dotA);
    }
    ctx.globalAlpha = fo * dotA;
    ctx.fillStyle = C.textDim; ctx.font = `${6 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neurons visible", width / 2, y2 + 18 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Neuron dots visible when electron wave is used
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
    drawHeader(ctx, width, height, s, frame, DUR, "Now Visible", "electrons resolve neurons");
    const cy = height * 0.55;
    // Electron wave across
    const waveA = stagger(frame, 0, 8, 18);
    ctx.strokeStyle = accent(1, 0.4 * waveA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + frame * 2) * 0.1) * 6 * s * waveA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Neuron dots popping in along the wave
    for (let i = 0; i < 7; i++) {
      const dotA = stagger(frame, i * 2 + 4, 5, 10);
      const dx = width * (0.12 + i * 0.11);
      drawNode(ctx, dx, cy, 3.5 * s * dotA, i % 2, fo * dotA);
    }
    // Check mark = success
    const chkA = stagger(frame, 18, 8, 12);
    if (chkA > 0) drawCheck(ctx, width / 2, height * 0.8, 12 * s, 0, fo * chkA);
    ctx.globalAlpha = fo * chkA;
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("resolved", width / 2, height * 0.87);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Text "electrons" with tight waveform, "shorter wavelength" subtitle
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
    const cx = width / 2, cy = height * 0.42;
    // Title text "electrons"
    const txtA = stagger(frame, 0, 8, 15);
    ctx.globalAlpha = fo * txtA;
    ctx.fillStyle = accent(1); ctx.font = `700 ${20 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("electrons", cx, cy);
    // Tight waveform underneath
    const waveA = stagger(frame, 3, 8, 18);
    const waveY = cy + 25 * s;
    ctx.strokeStyle = accent(1, 0.6 * waveA); ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    for (let x = width * 0.2; x < width * 0.8; x += 2) {
      const y = waveY + Math.sin((x + frame * 2) * 0.12) * 10 * s * waveA;
      if (x < width * 0.21) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Subtitle
    const subA = stagger(frame, 7, 8, 12);
    ctx.globalAlpha = fo * subA;
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("shorter wavelength", cx, cy + 55 * s);
    // Small node decoration
    drawNode(ctx, cx - 50 * s, cy + 25 * s, 3 * s * subA, 1, fo * subA);
    drawNode(ctx, cx + 50 * s, cy + 25 * s, 3 * s * subA, 1, fo * subA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Particle beam (orange dots) hitting target, resolving detail
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
    drawHeader(ctx, width, height, s, frame, DUR, "Electron Beam", "particle bombardment");
    const cx = width / 2, cy = height * 0.55;
    // Beam source
    const srcA = stagger(frame, 0, 8, 12);
    drawNodeGradient(ctx, width * 0.12, cy, 6 * s * srcA, 1, fo * srcA);
    // Flying electron particles
    for (let i = 0; i < 6; i++) {
      const t = ((frame * 2 + i * 18) % 100) / 100;
      const px = lerp(width * 0.18, cx - 15 * s, t);
      const py = cy + Math.sin(i * 1.3) * 8 * s;
      const pa = Math.sin(t * Math.PI);
      drawNode(ctx, px, py, 2 * s, 1, fo * pa * srcA);
    }
    // Target structure resolving
    const resolveA = stagger(frame, 6, 8, 18);
    const targets = [
      { x: cx + 10 * s, y: cy - 12 * s },
      { x: cx + 25 * s, y: cy - 4 * s },
      { x: cx + 15 * s, y: cy + 10 * s },
      { x: cx + 35 * s, y: cy + 5 * s },
      { x: cx + 30 * s, y: cy - 15 * s },
    ];
    for (let i = 0; i < targets.length; i++) {
      const tA = stagger(frame, i + 8, 4, 10);
      drawNode(ctx, targets[i].x, targets[i].y, 3 * s * tA, i % 2, fo * resolveA * tA);
      if (i < targets.length - 1) {
        drawEdgeFaint(ctx, targets[i].x, targets[i].y, targets[i + 1].x, targets[i + 1].y, s * tA);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Split panel: LEFT light beam (blurry) -> RIGHT electron beam (sharp)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Light vs Electrons", "blurry to sharp");
    const cy = height * 0.55;
    // Left panel: light (blurry)
    const leftA = stagger(frame, 0, 8, 15);
    drawPanel(ctx, width * 0.05, height * 0.25, width * 0.4, height * 0.5, 0, fo * leftA);
    ctx.globalAlpha = fo * leftA;
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("light", width * 0.25, height * 0.3);
    // Blurry blobs inside left
    for (let i = 0; i < 4; i++) {
      const bx = width * 0.15 + i * width * 0.06;
      const grad = ctx.createRadialGradient(bx, cy, 0, bx, cy, 8 * s);
      grad.addColorStop(0, accent(0, 0.2 * leftA));
      grad.addColorStop(1, accent(0, 0));
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bx, cy, 8 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Right panel: electrons (sharp)
    const rightA = stagger(frame, 4, 8, 15);
    drawPanel(ctx, width * 0.55, height * 0.25, width * 0.4, height * 0.5, 1, fo * rightA);
    ctx.globalAlpha = fo * rightA;
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("electrons", width * 0.75, height * 0.3);
    // Sharp nodes inside right
    for (let i = 0; i < 4; i++) {
      const nA = stagger(frame, i + 6, 4, 8);
      drawNode(ctx, width * 0.65 + i * width * 0.06, cy, 3.5 * s * nA, 1, fo * nA);
    }
    // Arrow between
    const arrA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * arrA;
    ctx.fillStyle = C.grayDark; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("\u2192", width / 2, cy + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Wavelength comparison counter: light 500nm -> electrons 0.01nm
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
    drawHeader(ctx, width, height, s, frame, DUR, "Wavelength Counter", "dramatic reduction");
    const cx = width / 2, cy = height * 0.5;
    // Animated counter going from 500 down to 0.01
    const countT = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const value = countT < 1 ? lerp(500, 0.01, countT * countT) : 0.01;
    const displayVal = value > 1 ? value.toFixed(0) : value.toFixed(2);
    // Color transition: blue -> orange as value drops
    const colorT = Math.min(1, countT * 1.5);
    const blueA = 1 - colorT;
    const orangeA = colorT;
    // Counter display
    ctx.fillStyle = blueA > orangeA ? accent(0) : accent(1);
    ctx.font = `700 ${28 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(displayVal, cx, cy);
    ctx.fillStyle = C.text; ctx.font = `${10 * s}px system-ui`;
    ctx.fillText("nm", cx + 50 * s, cy);
    // Labels
    const topA = stagger(frame, 0, 8, 12);
    ctx.globalAlpha = fo * topA * blueA;
    ctx.fillStyle = accent(0); ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("light", cx, cy - 30 * s);
    ctx.globalAlpha = fo * orangeA;
    ctx.fillStyle = accent(1);
    ctx.fillText("electrons", cx, cy - 30 * s);
    // Node decoration at bottom
    const decA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * decA;
    drawNode(ctx, cx - 20 * s, cy + 35 * s, 3 * s * decA, 1, fo * decA);
    drawNode(ctx, cx, cy + 35 * s, 3 * s * decA, 1, fo * decA);
    drawNode(ctx, cx + 20 * s, cy + 35 * s, 3 * s * decA, 1, fo * decA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_011: VariantDef[] = [
  { id: "011-wave-switch", label: "Light Fades Electron In", component: V1 },
  { id: "011-bar-compare", label: "Wavelength Bar Compare", component: V2 },
  { id: "011-beam-switch", label: "Beam Switch Resolve", component: V3 },
  { id: "011-two-waves", label: "Wide vs Tight Waves", component: V4 },
  { id: "011-dots-visible", label: "Neurons Now Visible", component: V5 },
  { id: "011-electron-text", label: "Electrons Title Wave", component: V6 },
  { id: "011-particle-beam", label: "Particle Bombardment", component: V7 },
  { id: "011-split-panel", label: "Blurry vs Sharp Panel", component: V8 },
  { id: "011-counter", label: "Wavelength Counter", component: V9 },
];
