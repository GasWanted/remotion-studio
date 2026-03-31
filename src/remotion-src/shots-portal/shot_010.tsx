import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 010 — "Neurons are smaller than the wavelength of light"
// 150 frames. Light wave vs neuron scale.

// V1: Sine wave drawn across screen, tiny neuron dot shown between wave peaks
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
    drawHeader(ctx, width, height, s, frame, DUR, "Smaller Than Light", "neuron vs wavelength");
    const cy = height * 0.55;
    // Animated sine wave
    const waveA = stagger(frame, 0, 8, 20);
    ctx.strokeStyle = accent(0, 0.5 * waveA); ctx.lineWidth = 2 * s;
    const freq = 0.025, amp = 35 * s;
    const offset = frame * 1.2;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + offset) * freq) * amp * waveA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Tiny neuron dot between peaks
    const dotA = stagger(frame, 5, 8, 15);
    const peakX = width / 2;
    drawNode(ctx, peakX, cy, 2.5 * s * dotA, 1, fo * dotA);
    // Wavelength bracket
    const wl = (Math.PI * 2) / freq;
    const bx1 = peakX - wl / 2, bx2 = peakX + wl / 2;
    const brackA = stagger(frame, 8, 8, 12);
    ctx.strokeStyle = accent(0, 0.4 * brackA); ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(bx1, cy + amp + 12 * s); ctx.lineTo(bx2, cy + amp + 12 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx1, cy + amp + 8 * s); ctx.lineTo(bx1, cy + amp + 16 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx2, cy + amp + 8 * s); ctx.lineTo(bx2, cy + amp + 16 * s); ctx.stroke();
    ctx.globalAlpha = fo * brackA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("wavelength", peakX, cy + amp + 26 * s);
    // Neuron label
    ctx.fillStyle = accent(1); ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("neuron", peakX, cy - 10 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Side-by-side: wave crest width vs neuron cross-section dot
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
    drawHeader(ctx, width, height, s, frame, DUR, "Size Comparison", "wave crest vs neuron");
    const cy = height * 0.55;
    // Left: wave crest width (large)
    const leftA = stagger(frame, 0, 8, 15);
    const lx = width * 0.3;
    ctx.strokeStyle = accent(0, 0.5 * leftA); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(lx - 40 * s, cy);
    ctx.quadraticCurveTo(lx, cy - 30 * s * leftA, lx + 40 * s, cy);
    ctx.stroke();
    // Width bracket
    ctx.strokeStyle = accent(0, 0.3 * leftA); ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(lx - 40 * s, cy + 15 * s); ctx.lineTo(lx + 40 * s, cy + 15 * s); ctx.stroke();
    ctx.globalAlpha = fo * leftA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("~500nm", lx, cy + 28 * s);
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`;
    ctx.fillText("light wave", lx, cy - 38 * s);
    // Right: tiny neuron dot
    const rightA = stagger(frame, 5, 8, 15);
    const rx = width * 0.7;
    ctx.globalAlpha = fo * rightA;
    drawNode(ctx, rx, cy, 3 * s * rightA, 1, fo * rightA);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("~0.5\u03BCm", rx, cy + 28 * s);
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`;
    ctx.fillText("neuron", rx, cy - 20 * s);
    // "vs" divider
    const vsA = stagger(frame, 3, 8, 12);
    ctx.globalAlpha = fo * vsA;
    ctx.fillStyle = C.grayDark; ctx.font = `italic ${10 * s}px system-ui`;
    ctx.fillText("vs", width / 2, cy + 5 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Light beam hitting a neuron but diffracting around it
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
    drawHeader(ctx, width, height, s, frame, DUR, "Diffraction", "light bends around");
    const cx = width / 2, cy = height * 0.55;
    // Incoming beam from left (parallel lines)
    const beamA = stagger(frame, 0, 8, 18);
    ctx.strokeStyle = accent(0, 0.3 * beamA); ctx.lineWidth = 1.5 * s;
    for (let i = -3; i <= 3; i++) {
      const by = cy + i * 8 * s;
      ctx.beginPath(); ctx.moveTo(width * 0.08, by); ctx.lineTo(cx - 8 * s, by); ctx.stroke();
    }
    // Neuron dot at center
    const dotA = stagger(frame, 3, 8, 12);
    drawNodeGradient(ctx, cx, cy, 4 * s * dotA, 1, fo * dotA);
    // Diffracted rays curving around the dot
    const diffA = stagger(frame, 6, 8, 18);
    ctx.strokeStyle = accent(0, 0.25 * diffA); ctx.lineWidth = 1.5 * s;
    for (let i = -3; i <= 3; i++) {
      const by = cy + i * 8 * s;
      const bendY = by + (i > 0 ? 6 : i < 0 ? -6 : 0) * s * diffA;
      ctx.beginPath();
      ctx.moveTo(cx + 8 * s, by);
      ctx.quadraticCurveTo(cx + 40 * s, bendY, width * 0.92, bendY);
      ctx.stroke();
    }
    // Label "can't resolve"
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("light diffracts around", cx, cy + 35 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Scale ruler: light wavelength bar (~500nm) vs neuron dot (~0.5um)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Scale Ruler", "wavelength vs neuron");
    const cx = width / 2, y1 = height * 0.42, y2 = height * 0.62;
    // Light wavelength bar (wide)
    const barA = stagger(frame, 0, 8, 18);
    const barW = 130 * s * barA;
    ctx.fillStyle = accent(0, 0.15 * barA);
    ctx.fillRect(cx - barW / 2, y1 - 8 * s, barW, 16 * s);
    ctx.strokeStyle = accent(0, 0.5 * barA); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - barW / 2, y1 - 8 * s, barW, 16 * s);
    ctx.globalAlpha = fo * barA;
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("visible light ~500nm", cx, y1 + 4 * s);
    // Neuron bar (tiny)
    const neuA = stagger(frame, 5, 8, 15);
    const neuW = 5 * s * neuA;
    ctx.globalAlpha = fo * neuA;
    ctx.fillStyle = accent(1, 0.25);
    ctx.fillRect(cx - neuW / 2, y2 - 8 * s, neuW, 16 * s);
    ctx.strokeStyle = accent(1, 0.6); ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(cx - neuW / 2, y2 - 8 * s, neuW, 16 * s);
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`;
    ctx.fillText("neuron ~0.5\u03BCm", cx, y2 + 4 * s);
    // Arrow between
    const arrA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * arrA;
    ctx.fillStyle = C.grayDark; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("\u2191 same scale \u2193", cx, (y1 + y2) / 2 + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Animated wave passing through, neuron dots invisible between peaks
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
    drawHeader(ctx, width, height, s, frame, DUR, "Hidden In Waves", "too small to see");
    const cy = height * 0.55;
    // Wave sweeping
    const waveA = stagger(frame, 0, 8, 20);
    ctx.strokeStyle = accent(0, 0.45 * waveA); ctx.lineWidth = 2.5 * s;
    const freq = 0.02, amp = 30 * s;
    const offset = frame * 2;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + offset) * freq) * amp * waveA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Neuron dots scattered — too small to see, drawn as dormant
    const dotsA = stagger(frame, 4, 8, 15);
    for (let i = 0; i < 5; i++) {
      const dx = width * (0.2 + i * 0.15);
      const dy = cy + Math.sin((dx + offset) * freq) * amp * waveA * 0.5;
      drawNodeDormant(ctx, dx, dy, 2.5 * s, fo * dotsA * 0.6);
    }
    // Label
    const labA = stagger(frame, 10, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neurons hidden between peaks", width / 2, cy + amp + 22 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Split: "wavelength of light" on left with wave, "neuron" on right tiny dot
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
    drawHeader(ctx, width, height, s, frame, DUR, "Wavelength vs Neuron", "light is bigger");
    const cy = height * 0.55;
    // Left panel: wavelength
    const leftA = stagger(frame, 0, 8, 15);
    drawPanel(ctx, width * 0.05, height * 0.25, width * 0.4, height * 0.5, 0, fo * leftA);
    ctx.globalAlpha = fo * leftA;
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("wavelength of light", width * 0.25, height * 0.32);
    // Wave inside left panel
    ctx.strokeStyle = accent(0, 0.5); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    for (let x = width * 0.08; x < width * 0.42; x += 2) {
      const y = cy + Math.sin((x + frame) * 0.04) * 20 * s;
      if (x < width * 0.09) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Right panel: neuron
    const rightA = stagger(frame, 4, 8, 15);
    drawPanel(ctx, width * 0.55, height * 0.25, width * 0.4, height * 0.5, 1, fo * rightA);
    ctx.globalAlpha = fo * rightA;
    ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neuron", width * 0.75, height * 0.32);
    // Tiny dot
    drawNode(ctx, width * 0.75, cy, 3 * s * rightA, 1, fo * rightA);
    // Greater-than arrow
    const vsA = stagger(frame, 7, 8, 12);
    ctx.globalAlpha = fo * vsA;
    ctx.fillStyle = C.text; ctx.font = `bold ${18 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(">", width / 2, cy + 3 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Multiple waves of different colors (visible spectrum), all too wide
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
    drawHeader(ctx, width, height, s, frame, DUR, "Visible Spectrum", "all wavelengths too wide");
    const cx = width / 2, cy = height * 0.52;
    const colors = [
      { color: "rgba(200,60,60,", freq: 0.018, label: "red ~700nm" },
      { color: "rgba(60,180,60,", freq: 0.022, label: "green ~550nm" },
      { color: "rgba(64,144,255,", freq: 0.028, label: "blue ~450nm" },
    ];
    // Draw each colored wave
    for (let w = 0; w < colors.length; w++) {
      const wA = stagger(frame, w * 2, 8, 18);
      const waveY = cy + (w - 1) * 28 * s;
      ctx.strokeStyle = colors[w].color + `${0.4 * wA})`; ctx.lineWidth = 2 * s;
      ctx.beginPath();
      for (let x = width * 0.1; x < width * 0.9; x += 2) {
        const y = waveY + Math.sin((x + frame * 1.5) * colors[w].freq) * 10 * s * wA;
        if (x < width * 0.11) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = fo * wA;
      ctx.fillStyle = C.textDim; ctx.font = `${6 * s}px system-ui`; ctx.textAlign = "right";
      ctx.fillText(colors[w].label, width * 0.09, waveY + 3 * s);
      ctx.globalAlpha = fo;
    }
    // Tiny neuron dot at center
    const dotA = stagger(frame, 8, 8, 12);
    drawNode(ctx, cx, cy, 2.5 * s * dotA, 1, fo * dotA);
    ctx.globalAlpha = fo * dotA;
    ctx.fillStyle = accent(1); ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neuron", cx, cy + 15 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Neuron node hiding inside a single wave peak — can't distinguish
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
    drawHeader(ctx, width, height, s, frame, DUR, "Hidden In Peak", "neuron lost inside wave");
    const cx = width / 2, cy = height * 0.55;
    // One large wave peak
    const waveA = stagger(frame, 0, 8, 20);
    ctx.strokeStyle = accent(0, 0.5 * waveA); ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    for (let x = width * 0.1; x < width * 0.9; x += 2) {
      const nx = (x - width * 0.1) / (width * 0.8);
      const y = cy - Math.sin(nx * Math.PI) * 50 * s * waveA;
      if (x < width * 0.11) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Fill under wave
    ctx.fillStyle = accent(0, 0.06 * waveA);
    ctx.lineTo(width * 0.9, cy); ctx.lineTo(width * 0.1, cy);
    ctx.fill();
    // Neuron hidden at peak
    const dotA = stagger(frame, 5, 8, 15);
    drawNode(ctx, cx, cy - 50 * s * waveA, 3 * s * dotA, 1, fo * dotA * 0.7);
    // Dashed circle showing "hidden here"
    const circA = stagger(frame, 8, 8, 12);
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.strokeStyle = accent(1, 0.4 * circA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy - 50 * s * waveA, 12 * s * circA, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = fo * circA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neuron hidden here", cx, cy - 50 * s * waveA + 22 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Comparison bars: visible light 400-700nm bar vs neuron size bar
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
    drawHeader(ctx, width, height, s, frame, DUR, "Size Bars", "wavelength vs neuron");
    const cx = width / 2, y1 = height * 0.4, y2 = height * 0.6;
    // Light bar (wide gradient bar)
    const barA = stagger(frame, 0, 8, 18);
    const barW = 140 * s * barA, barH = 18 * s;
    const grad = ctx.createLinearGradient(cx - barW / 2, 0, cx + barW / 2, 0);
    grad.addColorStop(0, `rgba(120,60,200,${0.6 * barA})`);
    grad.addColorStop(0.3, `rgba(64,144,255,${0.6 * barA})`);
    grad.addColorStop(0.5, `rgba(60,200,80,${0.6 * barA})`);
    grad.addColorStop(0.7, `rgba(255,200,0,${0.6 * barA})`);
    grad.addColorStop(1, `rgba(220,60,60,${0.6 * barA})`);
    ctx.fillStyle = grad;
    ctx.fillRect(cx - barW / 2, y1 - barH / 2, barW, barH);
    ctx.strokeStyle = `rgba(100,100,120,${0.3 * barA})`; ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx - barW / 2, y1 - barH / 2, barW, barH);
    ctx.globalAlpha = fo * barA;
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("400nm", cx - barW / 2, y1 - barH / 2 - 5 * s);
    ctx.textAlign = "right";
    ctx.fillText("700nm", cx + barW / 2, y1 - barH / 2 - 5 * s);
    ctx.textAlign = "center";
    ctx.fillText("visible light", cx, y1 + barH / 2 + 12 * s);
    // Neuron bar (tiny)
    const neuA = stagger(frame, 5, 8, 15);
    const neuW = 4 * s * neuA;
    ctx.globalAlpha = fo * neuA;
    ctx.fillStyle = accent(1, 0.7);
    ctx.fillRect(cx - neuW / 2, y2 - barH / 2, neuW, barH);
    ctx.strokeStyle = accent(1, 0.5); ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx - neuW / 2, y2 - barH / 2, neuW, barH);
    ctx.fillStyle = C.text; ctx.font = `600 ${8 * s}px system-ui`;
    ctx.fillText("neuron ~0.5\u03BCm", cx, y2 + barH / 2 + 12 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_010: VariantDef[] = [
  { id: "010-sine-neuron", label: "Sine Wave Tiny Dot", component: V1 },
  { id: "010-side-compare", label: "Side By Side Compare", component: V2 },
  { id: "010-diffraction", label: "Light Diffracts Around", component: V3 },
  { id: "010-scale-ruler", label: "Scale Ruler Bars", component: V4 },
  { id: "010-hidden-waves", label: "Hidden Between Peaks", component: V5 },
  { id: "010-split-panels", label: "Split Panel Compare", component: V6 },
  { id: "010-spectrum-waves", label: "Spectrum All Too Wide", component: V7 },
  { id: "010-hidden-peak", label: "Neuron In Wave Peak", component: V8 },
  { id: "010-color-bars", label: "Spectrum Size Bars", component: V9 },
];
