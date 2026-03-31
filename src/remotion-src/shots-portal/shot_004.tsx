import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 004 — "set out to do something that had never been done before —"
// 120 frames. 9 variants showing unprecedented ambition/collaboration.

// V1: Hub-and-spoke: 5 institution hub nodes connected by edges, person nodes clustered around each
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const layout = useMemo(() => {
    const rng = seeded(401);
    const hubs = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(a) * 75, y: Math.sin(a) * 65, i };
    });
    const people = hubs.flatMap((hub, hi) =>
      Array.from({ length: 8 }, (_, pi) => {
        const a = rng() * Math.PI * 2;
        const r = 12 + rng() * 18;
        return { x: hub.x + Math.cos(a) * r, y: hub.y + Math.sin(a) * r, hi, i: hi * 8 + pi };
      })
    );
    return { hubs, people };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Never done before", "unprecedented collaboration");
    const cx = width / 2, cy = height / 2;
    // Inter-hub edges
    for (let i = 0; i < layout.hubs.length; i++) {
      for (let j = i + 1; j < layout.hubs.length; j++) {
        const t = staggerRaw(frame, (i + j) * 5, 1, 15);
        if (t > 0) {
          drawEdge(ctx, cx + layout.hubs[i].x * s, cy + layout.hubs[i].y * s,
            cx + layout.hubs[j].x * s, cy + layout.hubs[j].y * s, 0, fo * t * 0.2, s);
        }
      }
    }
    // People
    for (const p of layout.people) {
      const t = stagger(frame, p.i + 10, 0.5, 8);
      if (t <= 0) continue;
      drawPerson(ctx, cx + p.x * s, cy + p.y * s, 5 * s * t, accent(p.hi, fo * t * 0.6));
    }
    // Hub nodes on top
    for (const hub of layout.hubs) {
      const t = stagger(frame, hub.i * 3, 1, 10);
      drawNodeGradient(ctx, cx + hub.x * s, cy + hub.y * s, 7 * s * t, hub.i % 2, fo * t);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V2: Constellation: institution nodes with labels connected by faint lines
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const stars = useMemo(() => {
    const labels = ["Cambridge", "Harvard", "NIH", "Janelia", "MPI", "Princeton", "HHMI"];
    const rng = seeded(402);
    return labels.map((lbl, i) => {
      const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      const r = 55 + rng() * 40;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, lbl, i };
    });
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "A constellation", "of institutions");
    const cx = width / 2, cy = height / 2;
    // Edges
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const t = staggerRaw(frame, (i * stars.length + j) * 2, 1, 12);
        if (t > 0) drawEdgeFaint(ctx, cx + stars[i].x * s, cy + stars[i].y * s,
          cx + stars[j].x * s, cy + stars[j].y * s, s);
      }
    }
    // Star nodes + labels
    for (const st of stars) {
      const t = stagger(frame, st.i * 4, 1, 10);
      if (t <= 0) continue;
      drawNodeGradient(ctx, cx + st.x * s, cy + st.y * s, 5 * s * t, st.i % 2, fo * t);
      ctx.fillStyle = C.textDim;
      ctx.font = `${6 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(st.lbl, cx + st.x * s, cy + st.y * s + 12 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V3: Pipeline: boxes in a row connected by arrows, each fading in
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const steps = ["Plan", "Slice", "Image", "Trace", "Assemble"];
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "The pipeline", "never done before");
    const cy = height / 2;
    const gap = width / (steps.length + 1);
    for (let i = 0; i < steps.length; i++) {
      const t = stagger(frame, i * 6, 1, 12);
      if (t <= 0) continue;
      const x = gap * (i + 1);
      drawPanel(ctx, x - 22 * s, cy - 14 * s, 44 * s, 28 * s, i % 2, fo * t);
      ctx.fillStyle = C.text;
      ctx.font = `500 ${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(steps[i], x, cy + 3 * s);
      // Arrow to next
      if (i < steps.length - 1) {
        const at = staggerRaw(frame, (i + 1) * 6 - 3, 1, 8);
        if (at > 0) {
          const ax1 = x + 22 * s, ax2 = gap * (i + 2) - 22 * s;
          drawEdge(ctx, ax1, cy, lerp(ax1, ax2, at), cy, i % 2, fo * at * 0.5, s);
          if (at > 0.8) {
            ctx.fillStyle = accent(i % 2, fo * at * 0.5);
            ctx.beginPath();
            ctx.moveTo(ax2 - 4 * s, cy - 3 * s);
            ctx.lineTo(ax2, cy);
            ctx.lineTo(ax2 - 4 * s, cy + 3 * s);
            ctx.fill();
          }
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V4: Handshake pairs: pairs of person silhouettes with connecting lines between them
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const pairs = useMemo(() => {
    const rng = seeded(404);
    return Array.from({ length: 20 }, (_, i) => ({
      x: (rng() * 0.7 + 0.15) * width,
      y: (rng() * 0.55 + 0.22) * height,
      gap: 14 + rng() * 10,
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
    drawHeader(ctx, width, height, s, frame, DUR, "Collaboration", "pairing up worldwide");
    for (const p of pairs) {
      const t = stagger(frame, p.i * 3, 1, 10);
      if (t <= 0) continue;
      const lx = p.x - p.gap * s / 2, rx = p.x + p.gap * s / 2;
      drawPerson(ctx, lx, p.y, 6 * s * t, accent(0, fo * t * 0.7));
      drawPerson(ctx, rx, p.y, 6 * s * t, accent(1, fo * t * 0.7));
      drawEdge(ctx, lx + 3 * s, p.y, rx - 3 * s, p.y, p.i % 2, fo * t * 0.3, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V5: World map dots: nodes scattered geographically with edges between them
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const cities = useMemo(() => {
    // Approximate positions for key neuroscience cities
    const coords = [
      { x: -85, y: -15, lbl: "US East" }, { x: -105, y: -10, lbl: "US West" },
      { x: 0, y: -30, lbl: "UK" }, { x: 10, y: -28, lbl: "Germany" },
      { x: 135, y: -10, lbl: "Japan" }, { x: 120, y: 0, lbl: "China" },
      { x: 25, y: -25, lbl: "Switzerland" }, { x: -75, y: -20, lbl: "Canada" },
    ];
    return coords.map((c, i) => ({ x: c.x * 0.9, y: c.y * 1.5, lbl: c.lbl, i }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Global effort", "across continents");
    const cx = width / 2, cy = height / 2;
    // Draw connecting edges
    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const et = staggerRaw(frame, (i * cities.length + j) * 2, 1, 15);
        if (et > 0) {
          drawEdge(ctx, cx + cities[i].x * s, cy + cities[i].y * s,
            cx + cities[j].x * s, cy + cities[j].y * s, 0, fo * et * 0.15, s);
        }
      }
    }
    // Nodes
    for (const c of cities) {
      const t = stagger(frame, c.i * 5, 1, 10);
      if (t <= 0) continue;
      drawNodeGradient(ctx, cx + c.x * s, cy + c.y * s, 5 * s * t, c.i % 2, fo * t);
      ctx.fillStyle = C.textDim;
      ctx.font = `${5.5 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(c.lbl, cx + c.x * s, cy + c.y * s + 12 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V6: Zoom out: starts with one person node, pulls back to reveal hundreds
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const nodes = useMemo(() => {
    const rng = seeded(406);
    return Array.from({ length: 200 }, (_, i) => {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 140;
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
    const cx = width / 2, cy = height / 2;
    // Zoom starts large (focused on one), ends small (see all)
    const zoom = interpolate(frame, [5, 80], [6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      const nx = cx + n.x * s / zoom;
      const ny = cy + n.y * s / zoom;
      if (nx < -10 || nx > width + 10 || ny < -10 || ny > height + 10) continue;
      const nodeR = (zoom > 3 && n.i === 0 ? 8 : 2.5) * s / Math.sqrt(zoom);
      if (n.i === 0) {
        drawNodeGradient(ctx, nx, ny, nodeR, 0, fo);
      } else {
        drawNode(ctx, nx, ny, nodeR, n.i % 2, fo);
      }
    }
    // Label for the center person when zoomed in
    if (zoom > 3) {
      const la = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fo * la * Math.min(1, (zoom - 3) / 2);
      ctx.fillStyle = C.textDim;
      ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("one scientist", cx, cy + 20 * s);
    }
    // Counter appears as zoom completes
    const cta = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo * cta;
    drawCounter(ctx, width, height, s, "200+", "scientists");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V7: Org chart: tree structure branching down
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
    drawHeader(ctx, width, height, s, frame, DUR, "Organization", "branching structure");
    const cx = width / 2;
    // Tree levels: 1 -> 3 -> 9 -> 27
    const levels = [
      [{ x: cx, y: height * 0.2 }],
      [{ x: cx - 70 * s, y: height * 0.38 }, { x: cx, y: height * 0.38 }, { x: cx + 70 * s, y: height * 0.38 }],
      Array.from({ length: 9 }, (_, i) => ({ x: cx + (i - 4) * 30 * s, y: height * 0.56 })),
      Array.from({ length: 18 }, (_, i) => ({ x: cx + (i - 8.5) * 16 * s, y: height * 0.74 })),
    ];
    let globalIdx = 0;
    for (let lvl = 0; lvl < levels.length; lvl++) {
      const parentLvl = lvl > 0 ? levels[lvl - 1] : null;
      for (let ni = 0; ni < levels[lvl].length; ni++) {
        const n = levels[lvl][ni];
        const t = stagger(frame, globalIdx, 1, 10);
        globalIdx++;
        if (t <= 0) continue;
        // Edge to parent
        if (parentLvl) {
          const pi = Math.floor(ni * parentLvl.length / levels[lvl].length);
          drawEdge(ctx, parentLvl[pi].x, parentLvl[pi].y + 5 * s, n.x, n.y - 5 * s, lvl % 2, fo * t * 0.3, s);
        }
        const r = lvl === 0 ? 7 : lvl === 1 ? 5 : lvl === 2 ? 3.5 : 2.5;
        drawNode(ctx, n.x, n.y, r * s * t, lvl % 2, fo * t);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V8: Jigsaw: panel cards assembling from scattered positions
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const pieces = useMemo(() => {
    const rng = seeded(408);
    const cols = 4, rows = 3;
    const pw = width * 0.65 / cols, ph = height * 0.5 / rows;
    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      return {
        tx: width * 0.18 + col * pw, ty: height * 0.22 + row * ph,
        sx: rng() * width, sy: rng() * height, // scatter position
        pw, ph, i,
      };
    });
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Assembling", "the pieces come together");
    for (const p of pieces) {
      const t = staggerRaw(frame, p.i * 5, 1, 20);
      const x = lerp(p.sx, p.tx, t);
      const y = lerp(p.sy, p.ty, t);
      drawPanel(ctx, x, y, p.pw - 2 * s, p.ph - 2 * s, p.i % 2, fo * (0.3 + t * 0.7));
      // Small icon in each
      drawNode(ctx, x + p.pw / 2, y + p.ph / 2, 3 * s, p.i % 2, fo * t);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

// V9: Message network: person nodes with signal pulses traveling between them
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const net = useMemo(() => {
    const rng = seeded(409);
    const nodes = Array.from({ length: 15 }, (_, i) => ({
      x: (rng() * 0.7 + 0.15) * width,
      y: (rng() * 0.55 + 0.22) * height,
      i,
    }));
    const edges: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < width * 0.32) edges.push({ a: i, b: j });
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
    drawHeader(ctx, width, height, s, frame, DUR, "Communication", "messages flowing");
    // Edges
    for (const e of net.edges) {
      const a = net.nodes[e.a], b = net.nodes[e.b];
      const t = staggerRaw(frame, (e.a + e.b) * 3, 1, 12);
      if (t > 0) drawEdgeFaint(ctx, a.x, a.y, b.x, b.y, s);
    }
    // Signal pulses
    for (let i = 0; i < net.edges.length; i++) {
      const e = net.edges[i];
      const a = net.nodes[e.a], b = net.nodes[e.b];
      const pulseT = ((frame + i * 17) % 40) / 40;
      if (frame > 20 + i * 2) {
        drawSignalPulse(ctx, a.x, a.y, b.x, b.y, pulseT, i % 2, s);
      }
    }
    // Person nodes
    for (const n of net.nodes) {
      const t = stagger(frame, n.i * 2, 1, 10);
      if (t <= 0) continue;
      drawPerson(ctx, n.x, n.y, 7 * s * t, accent(n.i, fo * t * 0.7));
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_004: VariantDef[] = [
  { id: "004-hub-spoke", label: "Hub and spoke institutions", component: V1 },
  { id: "004-constellation", label: "Constellation of labs", component: V2 },
  { id: "004-pipeline", label: "Pipeline boxes", component: V3 },
  { id: "004-handshake", label: "Handshake pairs", component: V4 },
  { id: "004-world-dots", label: "World map dots", component: V5 },
  { id: "004-zoom-out", label: "Zoom out reveal", component: V6 },
  { id: "004-org-chart", label: "Org chart tree", component: V7 },
  { id: "004-jigsaw", label: "Jigsaw assembly", component: V8 },
  { id: "004-message-net", label: "Message network pulses", component: V9 },
];
