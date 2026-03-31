import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 009 — "The brain is too small to see with a normal microscope."
// 120 frames. Microscope limitation.

// V1: Microscope icon (circle lens) trying to focus on tiny fly brain dot — blurry/failed
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
    drawHeader(ctx, width, height, s, frame, DUR, "Too Small", "microscope limitation");
    const cx = width / 2, cy = height * 0.55;
    // Microscope tube
    const tubeA = stagger(frame, 0, 8, 15);
    ctx.strokeStyle = C.grayDark; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 20 * s, cy - 40 * s * tubeA);
    ctx.lineTo(cx - 20 * s, cy + 10 * s * tubeA);
    ctx.stroke();
    // Lens circle
    ctx.strokeStyle = accent(0, 0.6 * tubeA); ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(cx - 20 * s, cy + 18 * s, 10 * s * tubeA, 0, Math.PI * 2); ctx.stroke();
    // Base
    ctx.strokeStyle = C.gray; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx - 40 * s, cy + 30 * s * tubeA); ctx.lineTo(cx, cy + 30 * s * tubeA); ctx.stroke();
    // Tiny brain dot (target)
    const dotA = stagger(frame, 3, 8, 12);
    drawNode(ctx, cx + 40 * s, cy + 10 * s, 2.5 * s * dotA, 0, fo * dotA);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("fly brain", cx + 40 * s, cy + 24 * s);
    // Blurry failed focus rings
    const blurA = stagger(frame, 6, 8, 15);
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = accent(0, 0.15 * blurA / i); ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.arc(cx + 40 * s, cy + 10 * s, (8 + i * 8) * s * blurA, 0, Math.PI * 2); ctx.stroke();
    }
    // X mark over the attempt
    const xA = stagger(frame, 10, 8, 12);
    if (xA > 0) drawXMark(ctx, cx + 10 * s, cy - 5 * s, 12 * s, 1, fo * xA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Lens zooming in but resolution limit reached — dot stays blurry (concentric fading circles)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Resolution Limit", "can't resolve");
    const cx = width / 2, cy = height * 0.55;
    // Zoom lens circle expanding
    const zoom = interpolate(frame, [10, 80], [0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lensR = 45 * s * zoom;
    ctx.strokeStyle = accent(0, 0.3); ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx, cy, lensR, 0, Math.PI * 2); ctx.stroke();
    // Concentric blurry rings inside (can't resolve)
    for (let i = 1; i <= 5; i++) {
      const ringA = Math.max(0, 1 - i * 0.18) * (0.3 + zoom * 0.15);
      ctx.strokeStyle = accent(0, ringA); ctx.lineWidth = (3 - i * 0.4) * s;
      ctx.beginPath(); ctx.arc(cx, cy, (lensR * i) / 6, 0, Math.PI * 2); ctx.stroke();
    }
    // Center blob — stays blurry, never resolves to a sharp dot
    const blobR = lerp(8, 12, zoom) * s;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blobR);
    grad.addColorStop(0, accent(0, 0.3));
    grad.addColorStop(1, accent(0, 0));
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, blobR, 0, Math.PI * 2); ctx.fill();
    // Label
    const labA = stagger(frame, 8, 8, 12);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.globalAlpha = fo * labA;
    ctx.fillText("still blurry", cx, cy + lensR + 15 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Eye icon → arrow → crossed-out fly brain = can't see
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
    drawHeader(ctx, width, height, s, frame, DUR, "Can't See", "invisible to light");
    const cy = height * 0.55;
    const x1 = width * 0.22, x2 = width / 2, x3 = width * 0.78;
    // Eye icon
    const eyeA = stagger(frame, 0, 8, 12);
    ctx.strokeStyle = accent(0, 0.7 * eyeA); ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1 - 14 * s, cy);
    ctx.quadraticCurveTo(x1, cy - 12 * s, x1 + 14 * s, cy);
    ctx.quadraticCurveTo(x1, cy + 12 * s, x1 - 14 * s, cy);
    ctx.stroke();
    drawNode(ctx, x1, cy, 4 * s * eyeA, 0, fo * eyeA);
    // Arrow
    const arrowA = stagger(frame, 3, 8, 12);
    drawEdge(ctx, x1 + 20 * s, cy, x2 - 20 * s, cy, 0, 0.3 * arrowA, s);
    ctx.fillStyle = accent(0, 0.4 * arrowA);
    ctx.beginPath();
    ctx.moveTo(x2 - 22 * s, cy - 4 * s); ctx.lineTo(x2 - 16 * s, cy); ctx.lineTo(x2 - 22 * s, cy + 4 * s);
    ctx.fill();
    // Tiny brain dot
    const brainA = stagger(frame, 5, 8, 12);
    drawNode(ctx, x3, cy, 2.5 * s * brainA, 0, fo * brainA);
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("fly brain", x3, cy + 16 * s);
    // X mark over brain
    const xA = stagger(frame, 8, 8, 12);
    if (xA > 0) drawXMark(ctx, x3, cy, 14 * s, 1, fo * xA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Scale bar showing microscope resolution vs neuron size (neuron smaller)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Scale Mismatch", "resolution vs size");
    const cx = width / 2, cy = height * 0.5;
    // Microscope resolution bar (wide, blue)
    const barA = stagger(frame, 0, 8, 15);
    const barW = 120 * s * barA;
    drawPanel(ctx, cx - barW / 2, cy - 20 * s, barW, 16 * s, 0, fo * barA);
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.globalAlpha = fo * barA;
    ctx.fillText("microscope resolution ~200nm", cx, cy - 6 * s);
    // Neuron size bar (tiny, orange)
    const neuA = stagger(frame, 4, 8, 15);
    const neuW = 8 * s * neuA;
    drawPanel(ctx, cx - neuW / 2, cy + 14 * s, neuW, 16 * s, 1, fo * neuA);
    ctx.globalAlpha = fo * neuA;
    ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("neuron ~0.5\u03BCm", cx, cy + 46 * s);
    // Arrow between pointing "smaller"
    const compA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * compA;
    ctx.fillStyle = C.textDim; ctx.font = `600 ${9 * s}px system-ui`;
    ctx.fillText("too small to resolve", cx, cy + 62 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Magnifying glass circle sweeping across, everything inside is blurred
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dots = useMemo(() => {
    const rng = seeded(951);
    return Array.from({ length: 8 }, (_, i) => ({
      x: 0.2 + rng() * 0.6, y: 0.35 + rng() * 0.4, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Can't Resolve", "magnification fails");
    // Dots (neurons we want to see)
    for (const d of dots) {
      const da = stagger(frame, d.i, 3, 10);
      drawNode(ctx, d.x * width, d.y * height, 3 * s * da, d.i, fo * da);
    }
    // Sweeping magnifying glass
    const sweep = interpolate(frame, [15, 100], [0.15, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glassX = sweep * width, glassY = height * 0.55;
    const glassR = 30 * s;
    // Blurred area inside glass
    const grad = ctx.createRadialGradient(glassX, glassY, 0, glassX, glassY, glassR);
    grad.addColorStop(0, "rgba(200,200,215,0.25)");
    grad.addColorStop(0.7, "rgba(200,200,215,0.15)");
    grad.addColorStop(1, "rgba(200,200,215,0)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(glassX, glassY, glassR, 0, Math.PI * 2); ctx.fill();
    // Glass ring
    ctx.strokeStyle = accent(0, 0.5); ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(glassX, glassY, glassR, 0, Math.PI * 2); ctx.stroke();
    // Handle
    ctx.strokeStyle = C.grayDark; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(glassX + glassR * 0.7, glassY + glassR * 0.7);
    ctx.lineTo(glassX + glassR * 1.3, glassY + glassR * 1.3);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Text "TOO SMALL" with tiny dot and microscope icon, X mark over it
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
    const cx = width / 2, cy = height * 0.45;
    // "TOO SMALL" text
    const txtA = stagger(frame, 0, 8, 15);
    ctx.globalAlpha = fo * txtA;
    ctx.fillStyle = C.text; ctx.font = `700 ${20 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("TOO SMALL", cx, cy);
    // Tiny dot below text
    const dotA = stagger(frame, 3, 8, 12);
    drawNode(ctx, cx, cy + 30 * s, 2 * s * dotA, 0, fo * dotA);
    ctx.globalAlpha = fo * dotA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`;
    ctx.fillText("neuron", cx, cy + 42 * s);
    // Microscope lens icon
    const scopeA = stagger(frame, 5, 8, 12);
    ctx.strokeStyle = accent(0, 0.5 * scopeA); ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx - 35 * s, cy + 30 * s, 10 * s * scopeA, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.grayDark; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 35 * s, cy + 40 * s * scopeA + 2 * s);
    ctx.lineTo(cx - 35 * s, cy + 55 * s * scopeA);
    ctx.stroke();
    // X mark
    const xA = stagger(frame, 8, 8, 12);
    if (xA > 0) drawXMark(ctx, cx, cy + 30 * s, 18 * s, 1, fo * xA);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Light waves passing OVER the tiny brain dot (waves wider than target)
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
    drawHeader(ctx, width, height, s, frame, DUR, "Light Passes Over", "wavelength too wide");
    const cx = width / 2, cy = height * 0.55;
    // Tiny brain dot
    const dotA = stagger(frame, 0, 8, 12);
    drawNode(ctx, cx, cy, 2.5 * s * dotA, 0, fo * dotA);
    // Animated sine wave passing across
    const waveA = stagger(frame, 2, 8, 15);
    ctx.strokeStyle = accent(0, 0.35 * waveA); ctx.lineWidth = 2 * s;
    const waveOffset = frame * 1.5;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const y = cy + Math.sin((x + waveOffset) * 0.03) * 25 * s * waveA;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Wavelength bracket
    const brackA = stagger(frame, 6, 8, 12);
    const wl = (Math.PI * 2) / 0.03; // one full wavelength in px
    const bx1 = cx - wl / 2, bx2 = cx + wl / 2;
    ctx.strokeStyle = accent(1, 0.5 * brackA); ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(bx1, cy + 40 * s); ctx.lineTo(bx2, cy + 40 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx1, cy + 36 * s); ctx.lineTo(bx1, cy + 44 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx2, cy + 36 * s); ctx.lineTo(bx2, cy + 44 * s); ctx.stroke();
    ctx.globalAlpha = fo * brackA;
    ctx.fillStyle = C.textDim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("wavelength", cx, cy + 54 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Resolution limit: clean image fading to pixelated/blurred as zoom increases
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
    drawHeader(ctx, width, height, s, frame, DUR, "Resolution Limit", "zoom reveals nothing");
    const cx = width / 2, cy = height * 0.55;
    // Progressive zoom => increasing blur
    const zoom = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // At low zoom: draw sharp nodes; at high zoom: draw fuzzy blobs
    const gridSize = Math.max(2, Math.floor(lerp(3, 12, zoom)));
    const cellR = lerp(30, 8, zoom) * s;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const gx = cx + (c - gridSize / 2 + 0.5) * cellR * 2.2;
        const gy = cy + (r - gridSize / 2 + 0.5) * cellR * 2.2;
        if (Math.abs(gx - cx) > width * 0.4 || Math.abs(gy - cy) > height * 0.35) continue;
        if (zoom < 0.4) {
          drawNode(ctx, gx, gy, cellR * 0.35, (r + c) % 2, fo * (1 - zoom * 1.5));
        } else {
          // Blurry blob
          const blur = (zoom - 0.4) / 0.6;
          const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, cellR * (0.4 + blur * 0.6));
          grad.addColorStop(0, accent((r + c) % 2, 0.2));
          grad.addColorStop(1, accent((r + c) % 2, 0));
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(gx, gy, cellR * (0.4 + blur * 0.6), 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    // Zoom label
    const labA = stagger(frame, 8, 8, 12);
    ctx.globalAlpha = fo * labA;
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`zoom: ${Math.floor(zoom * 100)}%`, cx, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Microscope panel with "NO SIGNAL" / empty view panel
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
    drawHeader(ctx, width, height, s, frame, DUR, "No Signal", "microscope view");
    const cx = width / 2, cy = height * 0.52;
    // View panel (portal card)
    const panA = stagger(frame, 0, 8, 15);
    const pw = 100 * s * panA, ph = 70 * s * panA;
    drawPanel(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 0, fo * panA);
    // Empty interior with scan lines
    for (let i = 0; i < 6; i++) {
      const ly = cy - ph / 2 + (i + 1) * (ph / 7);
      ctx.strokeStyle = `rgba(180,180,200,${0.08 * panA})`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath(); ctx.moveTo(cx - pw / 2, ly); ctx.lineTo(cx + pw / 2, ly); ctx.stroke();
    }
    // "NO SIGNAL" text
    const txtA = stagger(frame, 5, 8, 12);
    const blink = Math.sin(frame * 0.08) > 0 ? 1 : 0.4;
    ctx.globalAlpha = fo * txtA * blink;
    ctx.fillStyle = C.red; ctx.font = `700 ${10 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("NO SIGNAL", cx, cy + 2 * s);
    // Microscope outline on right
    ctx.globalAlpha = fo;
    const scopeA = stagger(frame, 3, 8, 12);
    ctx.strokeStyle = C.gray; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    const sx = cx + pw / 2 + 25 * s, sy = cy;
    ctx.beginPath(); ctx.moveTo(sx, sy - 20 * s * scopeA); ctx.lineTo(sx, sy + 10 * s * scopeA); ctx.stroke();
    ctx.beginPath(); ctx.arc(sx, sy + 16 * s, 6 * s * scopeA, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 10 * s, sy + 24 * s * scopeA); ctx.lineTo(sx + 10 * s, sy + 24 * s * scopeA); ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_009: VariantDef[] = [
  { id: "009-microscope-blur", label: "Microscope Can't Focus", component: V1 },
  { id: "009-concentric-blur", label: "Concentric Fading Rings", component: V2 },
  { id: "009-eye-x-brain", label: "Eye Arrow X Brain", component: V3 },
  { id: "009-scale-bar", label: "Scale Bar Mismatch", component: V4 },
  { id: "009-magnify-sweep", label: "Magnifying Glass Sweep", component: V5 },
  { id: "009-too-small-text", label: "TOO SMALL Label", component: V6 },
  { id: "009-wave-over", label: "Light Waves Pass Over", component: V7 },
  { id: "009-zoom-blur", label: "Zoom Pixelates", component: V8 },
  { id: "009-no-signal", label: "No Signal Panel", component: V9 },
];
