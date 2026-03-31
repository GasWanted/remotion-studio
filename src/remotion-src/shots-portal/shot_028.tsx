import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 028 — "clicking on neurons, fixing errors, verifying every connection."
// 120 frames. 9 variants: click-fix-verify cycle.

const DUR = 120;

// V1: Cursor clicking on red node, turning it blue with checkmark
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2801);
    return Array.from({ length: 20 }, (_, i) => ({
      x: (rng() - 0.5) * 240, y: (rng() - 0.5) * 200,
      fixFrame: 15 + i * 5, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Click & Fix", "verifying neurons");
    const cx = width / 2, cy = height / 2;
    let fixed = 0;
    for (const n of nodes) {
      const nx = cx + n.x * s, ny = cy + n.y * s;
      const isFixed = frame > n.fixFrame + 8;
      if (isFixed) {
        fixed++;
        drawNode(ctx, nx, ny, 3.5 * s, 0, fo);
        drawCheck(ctx, nx, ny + 6 * s, 4 * s, 0, fo * 0.7);
      } else if (frame > n.fixFrame - 5) {
        const pulse = Math.sin((frame - n.fixFrame) * 0.3) * 0.3 + 1;
        drawNode(ctx, nx, ny, 4 * s * pulse, 1, fo);
      } else {
        drawNode(ctx, nx, ny, 3 * s, 1, fo * 0.5);
      }
    }
    // Cursor
    const activeIdx = Math.min(nodes.length - 1, Math.floor((frame - 10) / 5));
    if (activeIdx >= 0 && activeIdx < nodes.length) {
      const target = nodes[activeIdx];
      const tx = cx + target.x * s, ty = cy + target.y * s;
      ctx.strokeStyle = C.text;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(tx, ty - 8 * s); ctx.lineTo(tx, ty + 8 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx - 8 * s, ty); ctx.lineTo(tx + 8 * s, ty); ctx.stroke();
    }
    drawCounter(ctx, width, height, s, `${fixed}`, "fixed");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Checklist items appearing one by one with checks
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
    drawHeader(ctx, width, height, s, frame, DUR, "Verify All", "connection by connection");
    const items = 10;
    const startY = height * 0.2;
    const rowH = height * 0.065;
    let checked = 0;
    for (let i = 0; i < items; i++) {
      const t = stagger(frame, i, 6, 10);
      if (t <= 0) continue;
      const iy = startY + i * rowH;
      // Connection line
      ctx.fillStyle = accent(0, fo * t * 0.1);
      ctx.fillRect(width * 0.3, iy, width * 0.45 * t, 2 * s);
      // Nodes at ends
      drawNode(ctx, width * 0.28, iy + 1 * s, 3 * s * t, 0, fo * t);
      if (t > 0.5) {
        drawNode(ctx, width * 0.28 + width * 0.45 * t, iy + 1 * s, 3 * s * t, 1, fo * t);
      }
      if (t > 0.8) { drawCheck(ctx, width * 0.82, iy + 1 * s, 5 * s, 0, fo * t); checked++; }
    }
    drawCounter(ctx, width, height, s, `${checked}/${items}`, "verified");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Before/after split — left shows errors, right shows corrected
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
    drawHeader(ctx, width, height, s, frame, DUR, "Before / After", "fixing errors");
    const divider = width / 2;
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(divider, height * 0.18); ctx.lineTo(divider, height * 0.85); ctx.stroke();
    const rng = seeded(2803);
    for (let i = 0; i < 12; i++) {
      const t = stagger(frame, i, 3, 8);
      if (t <= 0) continue;
      const bx = width * 0.12 + rng() * width * 0.3;
      const by = height * 0.25 + rng() * height * 0.5;
      const isErr = i % 3 === 0;
      drawNode(ctx, bx, by, 3.5 * s * t, isErr ? 1 : 0, fo * t);
      if (isErr) drawXMark(ctx, bx, by, 5 * s, 1, fo * t * 0.7);
      // Fixed version on right
      drawNode(ctx, bx + divider - width * 0.12, by, 3.5 * s * t, 0, fo * t);
      if (isErr) drawCheck(ctx, bx + divider - width * 0.12, by, 5 * s, 0, fo * t * 0.7);
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("Before", width * 0.25, height * 0.16);
    ctx.fillText("After", width * 0.75, height * 0.16);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Magnifying glass scanning over a dense network, highlighting errors
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(2804);
    return Array.from({ length: 50 }, (_, i) => ({
      x: (rng() - 0.5) * 280, y: (rng() - 0.5) * 220, i,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Inspect", "scanning for errors");
    const cx = width / 2, cy = height / 2;
    // Background nodes
    for (const n of nodes) {
      drawNodeDormant(ctx, cx + n.x * s, cy + n.y * s, 3 * s, fo * 0.4);
    }
    // Magnifier position
    const scanX = cx + Math.sin(frame * 0.04) * 80 * s;
    const scanY = cy + Math.cos(frame * 0.03) * 50 * s;
    const magR = 35 * s;
    // Magnifier ring
    ctx.strokeStyle = accent(0, fo * 0.5);
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(scanX, scanY, magR, 0, Math.PI * 2); ctx.stroke();
    // Handle
    ctx.beginPath(); ctx.moveTo(scanX + magR * 0.7, scanY + magR * 0.7);
    ctx.lineTo(scanX + magR * 1.3, scanY + magR * 1.3); ctx.stroke();
    // Nodes within magnifier are enhanced
    for (const n of nodes) {
      const nx = cx + n.x * s, ny = cy + n.y * s;
      const dist = Math.hypot(nx - scanX, ny - scanY);
      if (dist < magR) {
        const isErr = n.i % 8 === 3;
        drawNode(ctx, nx, ny, 4 * s, isErr ? 1 : 0, fo);
        if (isErr) drawXMark(ctx, nx, ny, 5 * s, 1, fo * 0.8);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Three-step cycle icons: click -> fix -> verify
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
    drawHeader(ctx, width, height, s, frame, DUR, "The Cycle", "click, fix, verify");
    const cy = height * 0.5;
    const positions = [width * 0.22, width * 0.5, width * 0.78];
    const labels = ["Click", "Fix", "Verify"];
    for (let i = 0; i < 3; i++) {
      const t = stagger(frame, i * 15, 1, 12);
      if (t <= 0) continue;
      const px = positions[i];
      drawNodeGradient(ctx, px, cy, 16 * s * t, i % 2, fo * t);
      ctx.fillStyle = C.text; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labels[i], px, cy + 24 * s);
      // Arrow to next
      if (i < 2 && t > 0.5) {
        const nx = positions[i + 1];
        drawEdge(ctx, px + 18 * s, cy, nx - 18 * s, cy, i % 2, fo * t * 0.4, s);
        // Arrowhead
        const ax = nx - 20 * s;
        ctx.fillStyle = accent(i % 2, fo * t * 0.4);
        ctx.beginPath(); ctx.moveTo(ax, cy - 3 * s); ctx.lineTo(ax + 6 * s, cy); ctx.lineTo(ax, cy + 3 * s); ctx.fill();
      }
    }
    // Cycle results
    if (frame > 70) {
      drawXMark(ctx, positions[0], cy - 22 * s, 6 * s, 1, fo * 0.6);
      drawNode(ctx, positions[1], cy - 22 * s, 4 * s, 0, fo * 0.6);
      drawCheck(ctx, positions[2], cy - 22 * s, 6 * s, 0, fo * 0.6);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Red-to-blue transformation: grid of nodes transitioning color wave
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
    drawHeader(ctx, width, height, s, frame, DUR, "Repair Wave", "errors corrected");
    const cols = 10, rows = 8;
    const cx = width / 2, cy = height / 2;
    const waveFront = interpolate(frame, [10, 90], [-1, cols + 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    let corrected = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const nx = cx + (c - cols / 2 + 0.5) * 22 * s;
        const ny = cy + (r - rows / 2 + 0.5) * 22 * s;
        const fixed = c < waveFront;
        drawNode(ctx, nx, ny, 3.5 * s, fixed ? 0 : 1, fo);
        if (fixed) corrected++;
      }
    }
    drawCounter(ctx, width, height, s, `${corrected}`, "fixed");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Connection repair: broken edge redrawing with glow
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
    drawHeader(ctx, width, height, s, frame, DUR, "Rewiring", "fixing connections");
    const cx = width / 2, cy = height / 2;
    const pairs = [
      [-60, -40, 60, -30], [-50, 10, 40, 30], [-30, -60, 50, -50],
      [0, 50, 70, 20], [-70, 30, -10, 60],
    ];
    for (let i = 0; i < pairs.length; i++) {
      const [x1, y1, x2, y2] = pairs[i];
      const t = stagger(frame, i * 12, 1, 15);
      if (t <= 0) continue;
      const ax = cx + x1 * s, ay = cy + y1 * s;
      const bx = cx + x2 * s, by = cy + y2 * s;
      drawNode(ctx, ax, ay, 4 * s, 0, fo);
      drawNode(ctx, bx, by, 4 * s, 0, fo);
      if (t < 0.5) {
        // Broken edge (dashed)
        ctx.setLineDash([3 * s, 3 * s]);
        ctx.strokeStyle = `rgba(224,80,80,${fo * 0.4})`;
        ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        ctx.setLineDash([]);
      } else {
        drawEdgeGlow(ctx, ax, ay, bx, by, 0, fo * (t - 0.5) * 2, s);
        if (t > 0.8) drawCheck(ctx, (ax + bx) / 2, (ay + by) / 2 - 8 * s, 5 * s, 0, fo);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Progress ring filling up as neurons get verified
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
    drawHeader(ctx, width, height, s, frame, DUR, "Progress", "verifying all");
    const cx = width / 2, cy = height * 0.48;
    const r = 55 * s;
    const prog = interpolate(frame, [10, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Track
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.2})`;
    ctx.lineWidth = 6 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Progress arc
    ctx.strokeStyle = accent(0, fo * 0.7);
    ctx.lineWidth = 6 * s;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog); ctx.stroke();
    // Percentage
    ctx.fillStyle = C.text; ctx.font = `700 ${20 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`${Math.floor(prog * 100)}%`, cx, cy + 7 * s);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("verified", cx, cy + 18 * s);
    // Checkmarks along progress
    for (let i = 0; i < Math.floor(prog * 8); i++) {
      const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
      drawCheck(ctx, cx + Math.cos(a) * (r + 12 * s), cy + Math.sin(a) * (r + 12 * s), 3 * s, 0, fo * 0.6);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Tile flip: panels flipping from "error" face to "verified" face
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
    drawHeader(ctx, width, height, s, frame, DUR, "Tile Flip", "error to verified");
    const cols = 4, rows = 3;
    const tw = (width * 0.7) / cols, th = (height * 0.5) / rows;
    const ox = width * 0.15, oy = height * 0.25;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const t = stagger(frame, idx * 5, 1, 12);
        if (t <= 0) continue;
        const tx = ox + c * tw, ty = oy + r * th;
        const flipped = t > 0.6;
        drawPanel(ctx, tx + 2, ty + 2, tw - 4, th - 4, flipped ? 0 : 1, fo * t * 0.6);
        const midX = tx + tw / 2, midY = ty + th / 2;
        if (flipped) {
          drawNode(ctx, midX, midY, 4 * s, 0, fo * t);
          drawCheck(ctx, midX, midY + 8 * s, 4 * s, 0, fo * t);
        } else {
          drawNode(ctx, midX, midY, 4 * s, 1, fo * t);
          drawXMark(ctx, midX, midY + 8 * s, 4 * s, 1, fo * t);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_028: VariantDef[] = [
  { id: "028-click-fix", label: "Cursor clicking and fixing", component: V1 },
  { id: "028-checklist", label: "Verification checklist", component: V2 },
  { id: "028-before-after", label: "Before and after split", component: V3 },
  { id: "028-magnifier", label: "Magnifying glass scan", component: V4 },
  { id: "028-cycle-steps", label: "Click fix verify cycle", component: V5 },
  { id: "028-repair-wave", label: "Red-to-blue wave", component: V6 },
  { id: "028-rewire", label: "Connection rewiring", component: V7 },
  { id: "028-progress-ring", label: "Progress ring filling", component: V8 },
  { id: "028-tile-flip", label: "Tile flip error to verified", component: V9 },
];
