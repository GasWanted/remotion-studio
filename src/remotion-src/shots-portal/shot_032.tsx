import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 032 — "But a wiring diagram is just a map."
// 120 frames. 9 variants: static map metaphor — flat, lifeless, no activity.

const DUR = 120;

// V1: Network fading to gray — all nodes becoming dormant
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(3201);
    return Array.from({ length: 50 }, (_, i) => ({
      x: (rng() - 0.5) * 260, y: (rng() - 0.5) * 210, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Just a Map", "static, lifeless");
    const cx = width / 2, cy = height / 2;
    const fade = interpolate(frame, [20, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 50)
          drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
      }
    }
    for (const n of nodes) {
      const nx = cx + n.x * s, ny = cy + n.y * s;
      if (fade > 0.3) drawNode(ctx, nx, ny, 2.5 * s, n.i % 2, fo * fade);
      else drawNodeDormant(ctx, nx, ny, 3 * s, fo);
    }
    // "Just a map" label
    if (fade < 0.5) {
      ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("just a map", cx, cy + 100 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Flat paper map with fold lines, network drawn on it
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
    drawHeader(ctx, width, height, s, frame, DUR, "Paper Map", "flat diagram");
    const cx = width / 2, cy = height / 2;
    const pw = 180 * s, ph = 130 * s;
    // Paper background
    ctx.fillStyle = `rgba(245,242,235,${fo * 0.8})`;
    ctx.fillRect(cx - pw / 2, cy - ph / 2, pw, ph);
    ctx.strokeStyle = `rgba(200,195,185,${fo * 0.4})`;
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(cx - pw / 2, cy - ph / 2, pw, ph);
    // Fold lines
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.strokeStyle = `rgba(200,195,185,${fo * 0.2})`;
    ctx.beginPath(); ctx.moveTo(cx, cy - ph / 2); ctx.lineTo(cx, cy + ph / 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - pw / 2, cy); ctx.lineTo(cx + pw / 2, cy); ctx.stroke();
    ctx.setLineDash([]);
    // Static network on paper
    const rng = seeded(3202);
    for (let i = 0; i < 25; i++) {
      const nx = cx + (rng() - 0.5) * pw * 0.8;
      const ny = cy + (rng() - 0.5) * ph * 0.8;
      drawNodeDormant(ctx, nx, ny, 2.5 * s, fo * 0.6);
      if (i > 0) {
        const px = cx + (rng() - 0.5) * pw * 0.8;
        drawEdgeFaint(ctx, nx, ny, px, cy + (rng() - 0.5) * ph * 0.8, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Blueprint style — grid with dormant schematic nodes
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
    drawHeader(ctx, width, height, s, frame, DUR, "Blueprint", "diagram only");
    const cx = width / 2, cy = height / 2;
    // Blueprint grid
    const gridSp = 25 * s;
    ctx.strokeStyle = `rgba(180,190,210,${fo * 0.1})`;
    ctx.lineWidth = 0.5 * s;
    for (let x = cx - 120 * s; x <= cx + 120 * s; x += gridSp) {
      ctx.beginPath(); ctx.moveTo(x, cy - 90 * s); ctx.lineTo(x, cy + 90 * s); ctx.stroke();
    }
    for (let y = cy - 90 * s; y <= cy + 90 * s; y += gridSp) {
      ctx.beginPath(); ctx.moveTo(cx - 120 * s, y); ctx.lineTo(cx + 120 * s, y); ctx.stroke();
    }
    // Dormant nodes on grid intersections
    const rng = seeded(3203);
    for (let i = 0; i < 30; i++) {
      const gx = Math.round((rng() - 0.5) * 8) * gridSp + cx;
      const gy = Math.round((rng() - 0.5) * 6) * gridSp + cy;
      const t = stagger(frame, i, 1.5, 8);
      drawNodeDormant(ctx, gx, gy, 3 * s * t, fo);
      if (i > 0 && i % 3 === 0) {
        const pgx = Math.round((rng() - 0.5) * 8) * gridSp + cx;
        drawEdgeFaint(ctx, gx, gy, pgx, Math.round((rng() - 0.5) * 6) * gridSp + cy, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Frozen network — nodes that should be active but aren't
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
    drawHeader(ctx, width, height, s, frame, DUR, "Frozen", "no signals flowing");
    const cx = width / 2, cy = height / 2;
    // Static neuron shape — no animation (frame=0 for static)
    drawNeuronShape(ctx, cx, cy, 60 * s, fo * 0.35, 0);
    // Overlay gray wash
    ctx.fillStyle = `rgba(200,200,210,${fo * 0.15})`;
    ctx.fillRect(0, 0, width, height);
    // "No signal" indicators
    const rng = seeded(3204);
    for (let i = 0; i < 5; i++) {
      const nx = cx + (rng() - 0.5) * 160 * s;
      const ny = cy + (rng() - 0.5) * 120 * s;
      drawNodeDormant(ctx, nx, ny, 4 * s, fo * 0.5);
    }
    ctx.fillStyle = C.grayDark; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("no activity", cx, cy + 80 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Network with label "MAP" stamped over it
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
    const cx = width / 2, cy = height / 2;
    // Background network
    const rng = seeded(3205);
    for (let i = 0; i < 40; i++) {
      const x = cx + (rng() - 0.5) * 260 * s, y = cy + (rng() - 0.5) * 200 * s;
      drawNodeDormant(ctx, x, y, 2.5 * s, fo * 0.4);
      if (i > 0 && i % 2 === 0) drawEdgeFaint(ctx, x, y, cx + (rng() - 0.5) * 260 * s, cy + (rng() - 0.5) * 200 * s, s);
    }
    // Stamp "MAP"
    const stampT = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (stampT > 0) {
      const stampScale = 1 + (1 - stampT) * 0.5; // impact effect
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(stampScale, stampScale);
      ctx.strokeStyle = C.grayDark;
      ctx.lineWidth = 3 * s;
      ctx.font = `700 ${40 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.strokeText("MAP", 0, 12 * s);
      // Border rectangle
      ctx.strokeRect(-55 * s, -25 * s, 110 * s, 48 * s);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Desaturating network — color draining away
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(3206);
    return Array.from({ length: 40 }, (_, i) => ({
      x: (rng() - 0.5) * 250, y: (rng() - 0.5) * 200, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Just Lines", "color draining");
    const cx = width / 2, cy = height / 2;
    const color = interpolate(frame, [15, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 50)
          drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
      }
    }
    for (const n of nodes) {
      const nx = cx + n.x * s, ny = cy + n.y * s;
      if (color > 0.1) drawNode(ctx, nx, ny, 2.5 * s, n.i % 2, fo * color);
      else drawNodeDormant(ctx, nx, ny, 3 * s, fo);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Flat diagram with compass rose — cartography metaphor
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
    drawHeader(ctx, width, height, s, frame, DUR, "Cartography", "a map, nothing more");
    const cx = width / 2, cy = height / 2;
    // Network
    const rng = seeded(3207);
    for (let i = 0; i < 30; i++) {
      const x = cx + (rng() - 0.5) * 200 * s, y = cy + (rng() - 0.5) * 160 * s;
      drawNodeDormant(ctx, x, y, 2 * s, fo * 0.5);
    }
    // Compass rose
    const cr = 20 * s;
    const appear = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const compassX = width * 0.82, compassY = height * 0.78;
    ctx.strokeStyle = `rgba(160,160,180,${fo * appear * 0.4})`;
    ctx.lineWidth = 1 * s;
    // N-S
    ctx.beginPath(); ctx.moveTo(compassX, compassY - cr); ctx.lineTo(compassX, compassY + cr); ctx.stroke();
    // E-W
    ctx.beginPath(); ctx.moveTo(compassX - cr, compassY); ctx.lineTo(compassX + cr, compassY); ctx.stroke();
    // N label
    ctx.fillStyle = C.grayDark; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("N", compassX, compassY - cr - 4 * s);
    drawNodeDormant(ctx, compassX, compassY, 3 * s, fo * appear);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Stacked flat panels — 2D slices with no depth, emphasizing flatness
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
    drawHeader(ctx, width, height, s, frame, DUR, "Flat", "no dimension");
    const cx = width / 2, cy = height / 2;
    const rng = seeded(3208);
    for (let i = 0; i < 5; i++) {
      const t = stagger(frame, i * 6, 1, 10);
      if (t <= 0) continue;
      const py = cy - 50 * s + i * 22 * s;
      ctx.strokeStyle = `rgba(200,200,215,${fo * t * 0.2})`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath(); ctx.moveTo(cx - 100 * s, py); ctx.lineTo(cx + 100 * s, py); ctx.stroke();
      for (let p = 0; p < 6; p++) {
        drawNodeDormant(ctx, cx + (rng() - 0.5) * 180 * s, py, 2 * s * t, fo * t * 0.5);
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("just a diagram", cx, cy + 80 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Outlined brain with question mark — the "so what?" moment
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
    drawHeader(ctx, width, height, s, frame, DUR, "But...", "just a map");
    const cx = width / 2, cy = height / 2;
    // Brain outline
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.35})`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, 70 * s, 55 * s, 0, 0, Math.PI * 2); ctx.stroke();
    // Dormant internal nodes
    const rng = seeded(3209);
    for (let i = 0; i < 20; i++) {
      const a = rng() * Math.PI * 2, r = rng() * 50 * s;
      drawNodeDormant(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8, 2 * s, fo * 0.4);
    }
    // "?" overlay
    const qT = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (qT > 0) {
      ctx.fillStyle = C.grayDark;
      ctx.font = `700 ${50 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.globalAlpha = fo * qT * 0.5;
      ctx.fillText("?", cx, cy + 18 * s);
      ctx.globalAlpha = fo;
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_032: VariantDef[] = [
  { id: "032-fade-gray", label: "Network fading to gray", component: V1 },
  { id: "032-paper-map", label: "Paper map with folds", component: V2 },
  { id: "032-blueprint", label: "Blueprint grid dormant", component: V3 },
  { id: "032-frozen", label: "Frozen static neuron", component: V4 },
  { id: "032-stamp", label: "MAP stamp overlay", component: V5 },
  { id: "032-desaturate", label: "Color draining away", component: V6 },
  { id: "032-compass", label: "Compass rose cartography", component: V7 },
  { id: "032-flat-lines", label: "Flat horizontal lines", component: V8 },
  { id: "032-brain-question", label: "Brain outline with question", component: V9 },
];
