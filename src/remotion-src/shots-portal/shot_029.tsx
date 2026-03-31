import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 029 — "When they were done, they had the complete wiring diagram of an adult brain."
// 120 frames. 9 variants: complete connectome reveal.

const DUR = 120;

// V1: Dense network filling from center outward, all edges glowing at end
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2901);
    return Array.from({ length: 200 }, (_, i) => {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 130;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Complete", "full wiring diagram");
    const cx = width / 2, cy = height / 2;
    const shown = Math.floor(interpolate(frame, [5, 80], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const glow = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < shown; i++) {
      for (let j = i + 1; j < shown; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 22) {
          if (glow > 0) drawEdgeGlow(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, i % 2, fo * glow * 0.3, s);
          else drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
        }
      }
    }
    for (let i = 0; i < shown; i++) {
      drawNode(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, (1.5 + glow) * s, nodes[i].i % 2, fo);
    }
    drawCounter(ctx, width, height, s, `${shown}`, "neurons mapped");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Brain outline filling with glowing connections inside
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
    drawHeader(ctx, width, height, s, frame, DUR, "Complete Map", "adult fly brain");
    const cx = width / 2, cy = height / 2;
    // Brain outline (ellipse)
    ctx.strokeStyle = accent(0, fo * 0.4);
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, 90 * s, 70 * s, 0, 0, Math.PI * 2); ctx.stroke();
    // Filling nodes
    const rng = seeded(2902);
    const prog = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.floor(prog * 100);
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const rx = rng() * 80 * s, ry = rng() * 60 * s;
      const nx = cx + Math.cos(a) * rx, ny = cy + Math.sin(a) * ry;
      drawNode(ctx, nx, ny, 1.5 * s, i % 2, fo * 0.7);
      if (i > 0 && i % 3 === 0) {
        const pa = rng() * Math.PI * 2;
        const prx = rng() * 80 * s;
        drawEdgeFaint(ctx, nx, ny, cx + Math.cos(pa) * prx, cy + Math.sin(pa) * rng() * 60 * s, s);
      }
    }
    // Triumphant glow at end
    if (prog > 0.9) {
      const ga = (prog - 0.9) / 0.1;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100 * s);
      glow.addColorStop(0, `rgba(64,144,255,${ga * 0.1})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.ellipse(cx, cy, 100 * s, 80 * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    drawCounter(ctx, width, height, s, "100%", "mapped");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Fly outline with all internal connections lit up
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
    drawHeader(ctx, width, height, s, frame, DUR, "Full Diagram", "every connection");
    const cx = width / 2, cy = height / 2;
    const appear = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFlyOutline(ctx, cx, cy, 120 * s * appear, fo * appear);
    // Dense internal connections in head area
    const rng = seeded(2903);
    const prog = interpolate(frame, [30, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nodeCount = Math.floor(prog * 60);
    for (let i = 0; i < nodeCount; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * 10 * s;
      drawNode(ctx, cx + Math.cos(a) * r, cy - 38 * s * appear + Math.sin(a) * r, 1 * s, i % 2, fo * prog);
    }
    if (prog > 0.8) drawCheck(ctx, cx, cy + 60 * s, 10 * s, 0, fo * (prog - 0.8) / 0.2);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Mosaic tiles completing a picture — each tile reveals a section
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
    drawHeader(ctx, width, height, s, frame, DUR, "Mosaic Complete", "every piece in place");
    const cols = 8, rows = 6;
    const tw = (width * 0.75) / cols, th = (height * 0.55) / rows;
    const ox = width * 0.125, oy = height * 0.25;
    const rng = seeded(2904);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const t = stagger(frame, idx, 1.2, 8);
        if (t <= 0) continue;
        drawPanel(ctx, ox + c * tw + 1, oy + r * th + 1, tw - 2, th - 2, idx % 2, fo * t * 0.5);
        // Mini network inside each tile
        for (let p = 0; p < 3; p++) {
          drawNode(ctx, ox + c * tw + rng() * tw, oy + r * th + rng() * th, 1.5 * s * t, idx % 2, fo * t * 0.7);
        }
      }
    }
    drawCounter(ctx, width, height, s, `${cols * rows}`, "sections");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Ring of completion closing — arc drawing around brain
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
    drawHeader(ctx, width, height, s, frame, DUR, "Done", "complete diagram");
    const cx = width / 2, cy = height / 2;
    const r = 65 * s;
    const sweep = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Inner neuron shapes
    const rng = seeded(2905);
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2, d = rng() * 50 * s;
      drawNode(ctx, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2 * s, i % 2, fo * sweep);
    }
    // Completion arc
    ctx.strokeStyle = accent(0, fo * 0.7);
    ctx.lineWidth = 4 * s;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * sweep); ctx.stroke();
    // Completion glow
    if (sweep > 0.95) {
      ctx.strokeStyle = accent(0, fo * 0.3);
      ctx.lineWidth = 10 * s;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      drawCheck(ctx, cx, cy + r + 15 * s, 8 * s, 0, fo);
    }
    // Node at sweep tip
    const tipA = -Math.PI / 2 + Math.PI * 2 * sweep;
    drawNodeGradient(ctx, cx + Math.cos(tipA) * r, cy + Math.sin(tipA) * r, 4 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Explosion of nodes outward then snapping into place — formation
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2906);
    return Array.from({ length: 80 }, (_, i) => {
      const a = rng() * Math.PI * 2, r = 20 + rng() * 100;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Formation", "snapping into place");
    const cx = width / 2, cy = height / 2;
    const assemble = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      const scatter = 1.8 - assemble * 0.8;
      const nx = cx + n.x * s * scatter, ny = cy + n.y * s * scatter;
      drawNode(ctx, nx, ny, 2 * s, n.i % 2, fo);
      if (assemble > 0.5) {
        for (const m of nodes) {
          if (m.i <= n.i) continue;
          if (Math.hypot(n.x - m.x, n.y - m.y) < 25) {
            drawEdgeFaint(ctx, nx, ny, cx + m.x * s * scatter, cy + m.y * s * scatter, s);
            break;
          }
        }
      }
    }
    if (assemble > 0.9) drawCheck(ctx, cx, cy + 90 * s, 10 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Layered brain slices all visible, stacked with transparency
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
    drawHeader(ctx, width, height, s, frame, DUR, "All Layers", "complete stack");
    const cx = width / 2, cy = height / 2;
    const layers = 10;
    const rng = seeded(2907);
    for (let i = 0; i < layers; i++) {
      const t = stagger(frame, i, 4, 10);
      if (t <= 0) continue;
      const offset = (i - layers / 2) * 6 * s;
      ctx.strokeStyle = accent(i, fo * t * 0.25);
      ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.ellipse(cx + offset * 0.5, cy + offset, 60 * s, 45 * s, 0, 0, Math.PI * 2); ctx.stroke();
      for (let p = 0; p < 8; p++) {
        const a = rng() * Math.PI * 2, r = rng() * 45 * s;
        drawNode(ctx, cx + offset * 0.5 + Math.cos(a) * r, cy + offset + Math.sin(a) * r * 0.75, 1.2 * s * t, i % 2, fo * t * 0.6);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Network with all connections lit simultaneously — "complete" flash
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2908);
    return Array.from({ length: 60 }, (_, i) => ({
      x: (rng() - 0.5) * 260, y: (rng() - 0.5) * 210, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "All Connected", "every synapse mapped");
    const cx = width / 2, cy = height / 2;
    const build = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flash = interpolate(frame, [75, 85, 90, 100], [0, 1, 1, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shown = Math.floor(build * nodes.length);
    for (let i = 0; i < shown; i++) {
      for (let j = i + 1; j < shown; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 45) {
          if (flash > 0) drawEdgeGlow(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, i % 2, fo * flash * 0.25, s);
          else drawEdgeFaint(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, cx + nodes[j].x * s, cy + nodes[j].y * s, s);
        }
      }
    }
    for (let i = 0; i < shown; i++) {
      drawNode(ctx, cx + nodes[i].x * s, cy + nodes[i].y * s, (2 + flash) * s, nodes[i].i % 2, fo);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Puzzle last piece: grid with one piece missing, then it clicks in
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
    drawHeader(ctx, width, height, s, frame, DUR, "Last Piece", "diagram complete");
    const cols = 6, rows = 5;
    const tw = (width * 0.7) / cols, th = (height * 0.5) / rows;
    const ox = width * 0.15, oy = height * 0.25;
    const lastIdx = 17; // the last piece
    const snapIn = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const tx = ox + c * tw, ty = oy + r * th;
        if (idx === lastIdx) {
          const snap = easeOutBack(snapIn);
          const flyY = lerp(-30 * s, 0, snap);
          if (snapIn > 0) {
            drawPanel(ctx, tx + 1, ty + flyY + 1, tw - 2, th - 2, 1, fo * snapIn);
            drawNodeGradient(ctx, tx + tw / 2, ty + flyY + th / 2, 4 * s * snapIn, 1, fo * snapIn);
          }
        } else {
          const t = stagger(frame, idx, 1, 6);
          if (t <= 0) continue;
          drawPanel(ctx, tx + 1, ty + 1, tw - 2, th - 2, idx % 2, fo * t * 0.5);
          drawNode(ctx, tx + tw / 2, ty + th / 2, 2 * s * t, idx % 2, fo * t);
        }
      }
    }
    if (snapIn > 0.9) drawCheck(ctx, width / 2, oy + rows * th + 15 * s, 10 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_029: VariantDef[] = [
  { id: "029-dense-glow", label: "Dense network glowing", component: V1 },
  { id: "029-brain-fill", label: "Brain outline filling", component: V2 },
  { id: "029-fly-complete", label: "Fly outline with connections", component: V3 },
  { id: "029-mosaic", label: "Mosaic tiles completing", component: V4 },
  { id: "029-ring-close", label: "Completion ring closing", component: V5 },
  { id: "029-formation", label: "Explosion to formation", component: V6 },
  { id: "029-layer-stack", label: "All layers visible", component: V7 },
  { id: "029-flash", label: "Complete network flash", component: V8 },
  { id: "029-puzzle", label: "Last puzzle piece", component: V9 },
];
