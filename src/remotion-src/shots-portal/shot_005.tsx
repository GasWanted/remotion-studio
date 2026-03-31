import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 005 — "map every single connection inside an adult brain."
// 120 frames. 9 variants showing mapping/connections.

// V1: Dense network growing: nodes appear with edges drawing between them, filling screen
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const net = useMemo(() => {
    const rng = seeded(501);
    const nodes = Array.from({ length: 80 }, (_, i) => ({
      x: (rng() * 0.75 + 0.125) * width,
      y: (rng() * 0.6 + 0.2) * height,
      i,
    }));
    const edges: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < width * 0.18) edges.push({ a: i, b: j });
      }
    }
    return { nodes, edges };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Mapping connections", "every single one");
    const edgeProgress = interpolate(frame, [10, 95], [0, net.edges.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < Math.floor(edgeProgress); i++) {
      const e = net.edges[i];
      drawEdgeFaint(ctx, net.nodes[e.a].x, net.nodes[e.a].y, net.nodes[e.b].x, net.nodes[e.b].y, s);
    }
    for (const n of net.nodes) {
      const t = stagger(frame, n.i, 0.8, 8);
      if (t <= 0) continue;
      drawNode(ctx, n.x, n.y, 3 * s * t, n.i % 2, fo * t);
    }
    drawCounter(ctx, width, height, s, `${Math.floor(edgeProgress)}`, "connections");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Brain outline filled with connection lines, progressively drawn
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const lines = useMemo(() => {
    const rng = seeded(502);
    const cx = 0, cy = 0, br = 90;
    return Array.from({ length: 120 }, (_, i) => {
      let x1, y1, x2, y2;
      do {
        const a1 = rng() * Math.PI * 2, r1 = rng() * br;
        const a2 = rng() * Math.PI * 2, r2 = rng() * br;
        x1 = Math.cos(a1) * r1 * 1.1; y1 = Math.sin(a1) * r1 * 0.85;
        x2 = Math.cos(a2) * r2 * 1.1; y2 = Math.sin(a2) * r2 * 0.85;
      } while (Math.hypot(x1 - x2, y1 - y2) < 20);
      return { x1, y1, x2, y2, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Brain map", "tracing every path");
    const cx = width / 2, cy = height * 0.52;
    // Brain outline
    ctx.strokeStyle = `rgba(200,200,215,${fo * 0.3})`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 100 * s, 78 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Internal lines
    for (const ln of lines) {
      const t = staggerRaw(frame, ln.i * 0.6, 1, 12);
      if (t <= 0) continue;
      drawEdge(ctx, cx + ln.x1 * s, cy + ln.y1 * s,
        cx + lerp(ln.x1, ln.x2, t) * s, cy + lerp(ln.y1, ln.y2, t) * s,
        ln.i % 2, fo * t * 0.25, s);
    }
    const shown = lines.filter((_, i) => staggerRaw(frame, i * 0.6, 1, 12) > 0).length;
    drawCounter(ctx, width, height, s, `${shown}`, "traced");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Grid of nodes, edges appearing one by one until densely connected
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const layout = useMemo(() => {
    const rng = seeded(503);
    const cols = 8, rows = 6;
    const gx = width * 0.7 / cols, gy = height * 0.55 / rows;
    const nodes = Array.from({ length: cols * rows }, (_, i) => ({
      x: width * 0.15 + (i % cols) * gx + gx / 2,
      y: height * 0.2 + Math.floor(i / cols) * gy + gy / 2,
      i,
    }));
    const edges: { a: number; b: number; d: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const k = Math.floor(rng() * 3) + 1;
      for (let n = 0; n < k; n++) {
        const j = Math.floor(rng() * nodes.length);
        if (j !== i) edges.push({ a: i, b: j, d: edges.length });
      }
    }
    return { nodes, edges };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Every connection", "filling in the map");
    // Edges
    const edgeCount = Math.floor(interpolate(frame, [10, 90], [0, layout.edges.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < edgeCount; i++) {
      const e = layout.edges[i];
      const a = layout.nodes[e.a], b = layout.nodes[e.b];
      drawEdgeFaint(ctx, a.x, a.y, b.x, b.y, s);
    }
    // Nodes
    for (const n of layout.nodes) {
      drawNode(ctx, n.x, n.y, 3 * s, n.i % 2, fo);
    }
    drawCounter(ctx, width, height, s, `${edgeCount}`, "connections mapped");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Map unfolding: panels revealing sections of a wiring diagram
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
    drawHeader(ctx, width, height, s, frame, DUR, "Unfolding", "the wiring diagram");
    const cols = 3, rows = 2;
    const pw = width * 0.75 / cols, ph = height * 0.5 / rows;
    const rng = seeded(504);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const t = stagger(frame, idx * 5, 1, 15);
        if (t <= 0) continue;
        const px = width * 0.12 + c * pw;
        const py = height * 0.22 + r * ph;
        drawPanel(ctx, px, py, pw - 4 * s, ph - 4 * s, idx % 2, fo * t);
        // Draw mini wiring inside panel
        for (let n = 0; n < 8; n++) {
          const nx = px + rng() * (pw - 10 * s) + 3 * s;
          const ny = py + rng() * (ph - 10 * s) + 5 * s;
          drawNode(ctx, nx, ny, 2 * s * t, n % 2, fo * t * 0.7);
          if (n > 0) {
            const px2 = px + rng() * (pw - 10 * s) + 3 * s;
            const py2 = py + rng() * (ph - 10 * s) + 5 * s;
            drawEdgeFaint(ctx, nx, ny, px2, py2, s);
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: Lines radiating from center, branching and connecting
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
    drawHeader(ctx, width, height, s, frame, DUR, "Radiating", "connections branching out");
    const cx = width / 2, cy = height / 2;
    drawNodeGradient(ctx, cx, cy, 6 * s, 0, fo);
    const branches = 12;
    for (let b = 0; b < branches; b++) {
      const a = (b / branches) * Math.PI * 2;
      const bt = staggerRaw(frame, b * 3, 1, 20);
      if (bt <= 0) continue;
      const len = 100 * s * bt;
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
      drawEdgeGlow(ctx, cx, cy, ex, ey, b % 2, fo * bt * 0.4, s);
      drawNode(ctx, ex, ey, 3 * s, b % 2, fo * bt);
      // Sub-branches
      if (bt > 0.5) {
        for (let sub = -1; sub <= 1; sub += 2) {
          const sa = a + sub * 0.5;
          const sl = 30 * s * (bt - 0.5) * 2;
          const sx = ex + Math.cos(sa) * sl, sy = ey + Math.sin(sa) * sl;
          drawEdge(ctx, ex, ey, sx, sy, (b + 1) % 2, fo * (bt - 0.5) * 0.4, s);
          drawNode(ctx, sx, sy, 2 * s, (b + 1) % 2, fo * (bt - 0.5));
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Counter: "0 -> 15,000,000" as connection lines draw across screen
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const lines = useMemo(() => {
    const rng = seeded(506);
    return Array.from({ length: 100 }, (_, i) => ({
      x1: rng() * width, y1: rng() * height,
      x2: rng() * width, y2: rng() * height,
      i,
    }));
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    // Lines drawing
    const shown = Math.floor(interpolate(frame, [5, 85], [0, lines.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < shown; i++) {
      const ln = lines[i];
      drawEdge(ctx, ln.x1, ln.y1, ln.x2, ln.y2, i % 2, fo * 0.15, s);
    }
    // Counter in center
    const count = Math.floor(interpolate(frame, [5, 95], [0, 15000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const formatted = count.toLocaleString();
    ctx.fillStyle = C.text;
    ctx.font = `700 ${22 * s}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatted, width / 2, height / 2);
    ctx.fillStyle = C.textDim;
    ctx.font = `${8 * s}px system-ui`;
    ctx.fillText("synaptic connections", width / 2, height / 2 + 18 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Dot matrix forming brain shape, connections lighting up
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const dots = useMemo(() => {
    const result: { x: number; y: number; d: number; i: number }[] = [];
    const cx = 0, cy = 0;
    const sp = 10;
    let idx = 0;
    for (let gx = -12; gx <= 12; gx++) {
      for (let gy = -10; gy <= 10; gy++) {
        const x = gx * sp, y = gy * sp;
        // Brain shape: ellipse check
        if ((x * x) / (120 * 120) + (y * y) / (90 * 90) < 1) {
          result.push({ x, y, d: Math.hypot(x, y), i: idx++ });
        }
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
    drawHeader(ctx, width, height, s, frame, DUR, "Brain matrix", "connections lighting up");
    const cx = width / 2, cy = height * 0.52;
    const waveFront = interpolate(frame, [5, 80], [0, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const dot of dots) {
      const dx = cx + dot.x * s, dy = cy + dot.y * s;
      if (dot.d < waveFront) {
        drawNode(ctx, dx, dy, 2.5 * s, dot.i % 2, fo);
      } else {
        drawNodeDormant(ctx, dx, dy, 2.5 * s, fo * 0.6);
      }
    }
    // Some connection lines in active region
    for (let i = 0; i < dots.length; i++) {
      if (dots[i].d >= waveFront) continue;
      const j = (i + 7) % dots.length;
      if (dots[j].d < waveFront && Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y) < 25) {
        drawEdgeFaint(ctx, cx + dots[i].x * s, cy + dots[i].y * s, cx + dots[j].x * s, cy + dots[j].y * s, s);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Circuit trace: right-angle connections drawing between nodes
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const layout = useMemo(() => {
    const rng = seeded(508);
    const nodes = Array.from({ length: 24 }, (_, i) => ({
      x: (rng() * 0.7 + 0.15) * width,
      y: (rng() * 0.55 + 0.22) * height,
      i,
    }));
    const edges: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({ a: i, b: i + 1 });
      if (rng() > 0.6 && i + 3 < nodes.length) edges.push({ a: i, b: i + 3 });
    }
    return { nodes, edges };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Circuit traces", "right-angle wiring");
    // Draw right-angle edges
    for (let i = 0; i < layout.edges.length; i++) {
      const t = staggerRaw(frame, i * 2, 1, 15);
      if (t <= 0) continue;
      const e = layout.edges[i];
      const a = layout.nodes[e.a], b = layout.nodes[e.b];
      const midX = b.x, midY = a.y;
      ctx.strokeStyle = accent(i % 2, fo * t * 0.3);
      ctx.lineWidth = 1.5 * s;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(midX, midY);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // Nodes on top
    for (const n of layout.nodes) {
      const t = stagger(frame, n.i, 1.5, 8);
      if (t <= 0) continue;
      drawNode(ctx, n.x, n.y, 3.5 * s * t, n.i % 2, fo * t);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Web: concentric circles with radial connections, spider-web pattern
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
    drawHeader(ctx, width, height, s, frame, DUR, "Neural web", "every connection mapped");
    const cx = width / 2, cy = height / 2;
    const rings = 7, spokes = 16;
    const maxR = 110 * s;
    const progress = interpolate(frame, [5, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Concentric rings
    for (let r = 1; r <= rings; r++) {
      const rt = Math.max(0, Math.min(1, (progress * rings - r + 1)));
      if (rt <= 0) continue;
      const radius = (r / rings) * maxR;
      ctx.strokeStyle = accent(r, fo * rt * 0.2);
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Radial spokes
    for (let sp = 0; sp < spokes; sp++) {
      const st = Math.max(0, Math.min(1, (progress * spokes - sp) / 2));
      if (st <= 0) continue;
      const a = (sp / spokes) * Math.PI * 2;
      drawEdge(ctx, cx, cy, cx + Math.cos(a) * maxR * st, cy + Math.sin(a) * maxR * st, sp % 2, fo * st * 0.2, s);
    }
    // Nodes at intersections
    for (let r = 1; r <= rings; r++) {
      for (let sp = 0; sp < spokes; sp++) {
        const idx = (r - 1) * spokes + sp;
        const t = stagger(frame, idx, 0.5, 6);
        if (t <= 0) continue;
        const a = (sp / spokes) * Math.PI * 2;
        const radius = (r / rings) * maxR;
        drawNode(ctx, cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, 2 * s * t, (r + sp) % 2, fo * t);
      }
    }
    drawNodeGradient(ctx, cx, cy, 5 * s, 0, fo);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_005: VariantDef[] = [
  { id: "005-dense-network", label: "Dense network growing", component: V1 },
  { id: "005-brain-outline", label: "Brain outline filling", component: V2 },
  { id: "005-grid-edges", label: "Grid edges appearing", component: V3 },
  { id: "005-map-unfold", label: "Map panels unfolding", component: V4 },
  { id: "005-radiating", label: "Radiating branches", component: V5 },
  { id: "005-counter", label: "15M counter with lines", component: V6 },
  { id: "005-dot-matrix", label: "Brain dot matrix", component: V7 },
  { id: "005-circuit-trace", label: "Circuit trace wiring", component: V8 },
  { id: "005-spider-web", label: "Spider web connections", component: V9 },
];
