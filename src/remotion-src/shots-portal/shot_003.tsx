import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 003 — "In 2024, a team of over two hundred scientists"
// 120 frames. 9 variants showing 200+ scientists assembling.

// V1: Network of 200+ nodes growing from center, edges connecting nearby nodes
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(301);
    return Array.from({ length: 220 }, (_, i) => {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 140;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, d: r, i };
    }).sort((a, b) => a.d - b.d);
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "over 200 scientists");
    const cx = width / 2, cy = height / 2;
    const shown = Math.min(nodes.length, Math.floor(interpolate(frame, [5, 90], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    // Draw edges first
    for (let i = 0; i < shown; i++) {
      const n = nodes[i];
      for (let j = i + 1; j < shown; j++) {
        const m = nodes[j];
        const dist = Math.hypot(n.x - m.x, n.y - m.y);
        if (dist < 28) {
          drawEdgeFaint(ctx, cx + n.x * s, cy + n.y * s, cx + m.x * s, cy + m.y * s, s);
        }
      }
    }
    // Draw nodes
    for (let i = 0; i < shown; i++) {
      const n = nodes[i];
      const t = stagger(frame, i, 0.4, 6);
      drawNode(ctx, cx + n.x * s, cy + n.y * s, 2.5 * s * t, n.i % 2, fo * t);
    }
    drawCounter(ctx, width, height, s, `${shown}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Hex mosaic: honeycomb of 200+ hexagonal tiles filling from center outward
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const hexes = useMemo(() => {
    const result: { x: number; y: number; d: number; i: number }[] = [];
    const r = 8;
    const dx = r * 1.75, dy = r * 1.52;
    let idx = 0;
    for (let row = -10; row <= 10; row++) {
      for (let col = -12; col <= 12; col++) {
        const ox = col * dx + (row % 2 ? dx / 2 : 0);
        const oy = row * dy;
        const d = Math.hypot(ox, oy);
        if (d < 130) { result.push({ x: ox, y: oy, d, i: idx++ }); }
      }
    }
    return result.sort((a, b) => a.d - b.d);
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "assembling the team");
    const cx = width / 2, cy = height / 2;
    for (let i = 0; i < hexes.length; i++) {
      const h = hexes[i];
      const t = stagger(frame, i, 0.3, 8);
      if (t <= 0) continue;
      const hx = cx + h.x * s, hy = cy + h.y * s;
      const hr = 7 * s * t;
      ctx.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = Math.PI / 6 + v * Math.PI / 3;
        const px = hx + Math.cos(a) * hr, py = hy + Math.sin(a) * hr;
        v === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = accent(h.i, fo * t * 0.15);
      ctx.fill();
      ctx.strokeStyle = accent(h.i, fo * t * 0.4);
      ctx.lineWidth = 0.8 * s;
      ctx.stroke();
    }
    const shown = hexes.filter((_, i) => stagger(frame, i, 0.3, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "contributors");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Spiral: two spiral arms of nodes growing outward (blue + orange)
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
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "a growing collaboration");
    const cx = width / 2, cy = height / 2;
    const totalPerArm = 110;
    for (let arm = 0; arm < 2; arm++) {
      const offset = arm * Math.PI;
      for (let i = 0; i < totalPerArm; i++) {
        const gi = arm * totalPerArm + i;
        const t = stagger(frame, gi, 0.3, 8);
        if (t <= 0) continue;
        const a = offset + i * 0.18;
        const r = 5 + i * 0.9;
        const nx = cx + Math.cos(a) * r * s;
        const ny = cy + Math.sin(a) * r * s;
        drawNode(ctx, nx, ny, 2 * s * t, arm, fo * t);
        // Connect to previous
        if (i > 0) {
          const pa = offset + (i - 1) * 0.18;
          const pr = 5 + (i - 1) * 0.9;
          drawEdgeFaint(ctx, nx, ny, cx + Math.cos(pa) * pr * s, cy + Math.sin(pa) * pr * s, s);
        }
      }
    }
    const shown = Math.min(220, Math.floor(interpolate(frame, [5, 90], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    drawCounter(ctx, width, height, s, `${shown}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Grid of person silhouettes filling row by row using drawPerson
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const people = useMemo(() => {
    const result: { x: number; y: number; i: number }[] = [];
    const cols = 16, rows = 14;
    const gx = width / (cols + 1), gy = (height * 0.7) / (rows + 1);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({ x: gx * (c + 1), y: height * 0.18 + gy * (r + 1), i: idx++ });
      }
    }
    return result;
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "over two hundred scientists");
    let count = 0;
    for (const p of people) {
      const t = stagger(frame, p.i, 0.35, 6);
      if (t <= 0) continue;
      count++;
      drawPerson(ctx, p.x, p.y, 7 * s * t, accent(p.i, fo * t * 0.7));
    }
    drawCounter(ctx, width, height, s, `${Math.min(count, 224)}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Phyllotaxis (fibonacci sunflower) pattern of nodes blooming
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle
    return Array.from({ length: 220 }, (_, i) => {
      const a = i * golden;
      const r = Math.sqrt(i) * 8;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "phyllotaxis of talent");
    const cx = width / 2, cy = height / 2;
    for (const n of nodes) {
      const t = stagger(frame, n.i, 0.35, 8);
      if (t <= 0) continue;
      drawNode(ctx, cx + n.x * s, cy + n.y * s, 2.5 * s * t, n.i % 2, fo * t);
    }
    const shown = nodes.filter((_, i) => stagger(frame, i, 0.35, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Concentric rings of nodes expanding outward
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const result: { x: number; y: number; ring: number; i: number }[] = [];
    let idx = 0;
    for (let ring = 0; ring < 10; ring++) {
      const count = ring === 0 ? 1 : Math.floor(ring * 7);
      const r = ring * 14;
      for (let j = 0; j < count; j++) {
        const a = (j / count) * Math.PI * 2;
        result.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, ring, i: idx++ });
      }
    }
    return result;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "rings of collaboration");
    const cx = width / 2, cy = height / 2;
    // Draw ring outlines
    for (let ring = 1; ring < 10; ring++) {
      const rt = staggerRaw(frame, ring * 20, 1, 15);
      if (rt <= 0) continue;
      ctx.strokeStyle = `rgba(200,200,215,${fo * rt * 0.15})`;
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, ring * 14 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const n of nodes) {
      const t = stagger(frame, n.i, 0.35, 8);
      if (t <= 0) continue;
      drawNode(ctx, cx + n.x * s, cy + n.y * s, 2.5 * s * t, n.ring % 2, fo * t);
    }
    const shown = nodes.filter((_, i) => stagger(frame, i, 0.35, 8) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Rain: nodes falling from top and landing in grid positions with bounce
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const targets = useMemo(() => {
    const rng = seeded(307);
    const result: { tx: number; ty: number; delay: number; i: number }[] = [];
    const cols = 16, rows = 14;
    const gx = width / (cols + 1), gy = (height * 0.65) / (rows + 1);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          tx: gx * (c + 1),
          ty: height * 0.22 + gy * (r + 1),
          delay: rng() * 70,
          i: idx++,
        });
      }
    }
    return result.sort((a, b) => a.delay - b.delay);
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "scientists arriving");
    let count = 0;
    for (const t of targets) {
      const progress = Math.max(0, Math.min(1, (frame - t.delay) / 12));
      if (progress <= 0) continue;
      count++;
      const bounce = progress < 1 ? easeOutBack(progress) : 1;
      const y = lerp(-10, t.ty, bounce);
      drawNode(ctx, t.tx, y, 2 * s, t.i % 2, fo * Math.min(1, progress * 2));
    }
    drawCounter(ctx, width, height, s, `${Math.min(count, 224)}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Wave field: dense dot grid activated by wave front from center
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dots = useMemo(() => {
    const result: { x: number; y: number; d: number }[] = [];
    const sp = 14;
    for (let gx = -12; gx <= 12; gx++) {
      for (let gy = -12; gy <= 12; gy++) {
        const x = gx * sp, y = gy * sp;
        const d = Math.hypot(x, y);
        if (d < 160) result.push({ x, y, d });
      }
    }
    return result;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "wave of collaboration");
    const cx = width / 2, cy = height / 2;
    const waveFront = interpolate(frame, [5, 85], [0, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    let active = 0;
    for (const dot of dots) {
      const dx = cx + dot.x * s, dy = cy + dot.y * s;
      if (dot.d < waveFront) {
        const intensity = Math.max(0, 1 - Math.abs(dot.d - waveFront) / 40);
        drawNode(ctx, dx, dy, (1.5 + intensity * 1.5) * s, dot.d % 28 < 14 ? 0 : 1, fo * (0.4 + intensity * 0.6));
        active++;
      } else {
        drawNodeDormant(ctx, dx, dy, 2 * s, fo * 0.5);
      }
    }
    drawCounter(ctx, width, height, s, `${active}`, "activated");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Domino chain: nodes in grid, activation cascades from center outward
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const result: { x: number; y: number; d: number; i: number }[] = [];
    const sp = 16;
    let idx = 0;
    for (let gx = -10; gx <= 10; gx++) {
      for (let gy = -8; gy <= 8; gy++) {
        const x = gx * sp, y = gy * sp;
        result.push({ x, y, d: Math.hypot(x, y), i: idx++ });
      }
    }
    return result.sort((a, b) => a.d - b.d);
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "2024", "cascade effect");
    const cx = width / 2, cy = height / 2;
    let active = 0;
    for (const n of nodes) {
      const nx = cx + n.x * s, ny = cy + n.y * s;
      const activateFrame = n.d * 0.6;
      const t = Math.max(0, Math.min(1, (frame - activateFrame) / 10));
      if (t > 0) {
        active++;
        const pulse = t < 1 ? 1 + (1 - t) * 0.5 : 1;
        drawNode(ctx, nx, ny, 2.5 * s * pulse, n.i % 2, fo * t);
        // Connect to nearby active nodes
        for (const m of nodes) {
          if (m.i >= n.i) break;
          const dist = Math.hypot(n.x - m.x, n.y - m.y);
          if (dist < 20) {
            const mt = Math.max(0, Math.min(1, (frame - m.d * 0.6) / 10));
            if (mt > 0) drawEdgeFaint(ctx, nx, ny, cx + m.x * s, cy + m.y * s, s);
          }
        }
      } else {
        drawNodeDormant(ctx, nx, ny, 2 * s, fo * 0.4);
      }
    }
    drawCounter(ctx, width, height, s, `${active}`, "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_003: VariantDef[] = [
  { id: "003-network-grow", label: "Network growing from center", component: V1 },
  { id: "003-hex-mosaic", label: "Honeycomb hex mosaic", component: V2 },
  { id: "003-spiral-arms", label: "Double spiral arms", component: V3 },
  { id: "003-person-grid", label: "Person silhouettes grid", component: V4 },
  { id: "003-phyllotaxis", label: "Fibonacci sunflower", component: V5 },
  { id: "003-concentric", label: "Concentric rings", component: V6 },
  { id: "003-rain-land", label: "Nodes raining into grid", component: V7 },
  { id: "003-wave-field", label: "Wave activation field", component: V8 },
  { id: "003-domino-cascade", label: "Domino cascade from center", component: V9 },
];
