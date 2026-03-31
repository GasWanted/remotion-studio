import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 41 — "But the fly brain has a hundred and thirty-eight thousand of them, connected by fifteen million synapses"
// 150 frames (5s). Exponential neuron multiplication: 1→2→4→...→138K

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Single neuron splits to 2, to 4, to 8... filling screen, counter shows 138,000
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 41001), [width, height, s]);
  const neurons = useMemo(() => {
    const rand = seeded(41001);
    return Array.from({ length: 200 }, () => ({
      x: rand() * 1, y: rand() * 1,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    // Exponential growth
    const growT = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const count = Math.min(200, Math.floor(Math.pow(2, growT * 8)));
    for (let i = 0; i < count; i++) {
      const n = neurons[i];
      const ns = Math.max(3, 14 - count * 0.06) * s;
      drawNeuron(ctx, n.x * width, n.y * height, ns, `hsla(${n.hue}, 50%, 58%, ${0.6})`, frame);
    }
    // Counter
    const displayNum = interpolate(frame, [10, 130], [1, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${14 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(Math.floor(displayNum).toLocaleString(), width / 2, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom out: one neuron → cluster → dense network → vast connectome
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41002), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(41002);
    return Array.from({ length: 300 }, () => ({
      x: 0.5 + (rand() - 0.5) * 2, y: 0.5 + (rand() - 0.5) * 2,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    // Zoom out effect — scale shrinks, more neurons visible
    const zoomT = interpolate(frame, [10, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const viewScale = 1 + zoomT * 4; // From tight to wide
    const neuronSize = Math.max(2, 20 / viewScale) * s;
    const visCount = Math.floor(3 + zoomT * 297);
    const cx = width / 2, cy = height / 2;
    for (let i = 0; i < visCount; i++) {
      const n = data[i];
      const nx = cx + (n.x - 0.5) * width / viewScale;
      const ny = cy + (n.y - 0.5) * height / viewScale;
      if (nx < -20 || nx > width + 20 || ny < -20 || ny > height + 20) continue;
      ctx.fillStyle = `hsla(${n.hue}, 45%, 55%, ${Math.min(0.7, 0.3 + (1 - zoomT) * 0.4)})`;
      ctx.beginPath(); ctx.arc(nx, ny, neuronSize, 0, Math.PI * 2); ctx.fill();
    }
    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(`zoom: ${viewScale.toFixed(1)}x`, width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Counter rapidly counting 1→138,639 with neurons filling behind
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41003), [width, height, s]);
  const neurons = useMemo(() => {
    const rand = seeded(41003);
    return Array.from({ length: 250 }, () => ({
      x: rand(), y: rand(),
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    // Exponential counter
    const countT = interpolate(frame, [5, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayNum = Math.floor(Math.pow(138639, countT));
    const fillCount = Math.min(250, Math.floor(countT * 250));
    // Background neurons
    for (let i = 0; i < fillCount; i++) {
      const n = neurons[i];
      ctx.fillStyle = `hsla(${n.hue}, 40%, 50%, 0.3)`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, 2.5 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Connections between nearby neurons
    if (fillCount > 10) {
      ctx.strokeStyle = `hsla(220, 30%, 45%, 0.1)`;
      ctx.lineWidth = 0.5 * s;
      for (let i = 0; i < Math.min(fillCount, 100); i++) {
        const a = neurons[i];
        for (let j = i + 1; j < Math.min(fillCount, 100); j++) {
          const b = neurons[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (dx * dx + dy * dy < 0.02) {
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }
      }
    }
    // Big counter
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${24 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(displayNum.toLocaleString(), width / 2, height / 2);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Multiplication: neuron divides like cells, screen fills exponentially
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41004), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    // Cell division stages
    const stageT = interpolate(frame, [5, 130], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stage = Math.floor(stageT);
    const stageProgress = stageT - stage;
    const count = Math.pow(2, stage);
    const cols = Math.ceil(Math.sqrt(count * (width / height)));
    const rows = Math.ceil(count / cols);
    const cellW = width / cols, cellH = height / rows;
    const neuronSize = Math.max(3, Math.min(18, cellW * 0.25, cellH * 0.25)) * s;
    let idx = 0;
    for (let r = 0; r < rows && idx < count; r++) {
      for (let c = 0; c < cols && idx < count; c++) {
        const nx = (c + 0.5) * cellW;
        const ny = (r + 0.5) * cellH;
        const hue = PALETTE.cellColors[idx % 8][0];
        // Mitosis animation for newest generation
        if (stage > 0 && idx >= count / 2 && stageProgress < 0.3) {
          const parentC = c % 2 === 0 ? c + 1 : c - 1;
          const fromX = (parentC + 0.5) * cellW;
          const t = stageProgress / 0.3;
          const ax = fromX + (nx - fromX) * t;
          ctx.globalAlpha = alpha * t;
          drawNeuron(ctx, ax, ny, neuronSize, `hsla(${hue}, 50%, 58%, 0.7)`, frame);
          ctx.globalAlpha = alpha;
        } else {
          drawNeuron(ctx, nx, ny, neuronSize, `hsla(${hue}, 50%, 58%, 0.7)`, frame);
        }
        idx++;
      }
    }
    // Count label
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${11 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(`${count} neurons`, cx, height * 0.93);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Single dot, camera pulls back to reveal millions of dots
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s, 41005), [width, height, s]);
  const dots = useMemo(() => {
    const rand = seeded(41005);
    return Array.from({ length: 400 }, () => ({
      x: (rand() - 0.5), y: (rand() - 0.5),
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height / 2;
    const pullback = interpolate(frame, [15, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoom = 0.02 + pullback * 0.98; // starts zoomed in tight
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      const dx = cx + d.x * width * zoom;
      const dy = cy + d.y * height * zoom;
      if (dx < -5 || dx > width + 5 || dy < -5 || dy > height + 5) continue;
      const dotR = Math.max(1, (3 - pullback * 2)) * s;
      ctx.fillStyle = `hsla(${d.hue}, 45%, 55%, ${0.5})`;
      ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2); ctx.fill();
    }
    // Highlight center dot at start
    if (pullback < 0.2) {
      const highlight = 1 - pullback / 0.2;
      const gr = 15 * s * highlight;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      g.addColorStop(0, `hsla(55, 80%, 75%, ${highlight * 0.4})`);
      g.addColorStop(1, `hsla(55, 80%, 75%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Text number growing: 1 → 100 → 10,000 → 138,639 with increasing neuron density
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41006), [width, height, s]);
  const neurons = useMemo(() => {
    const rand = seeded(41006);
    return Array.from({ length: 200 }, () => ({
      x: rand(), y: rand(),
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    // Milestone numbers
    const milestones = [1, 10, 100, 1000, 10000, 100000, 138639];
    const t = interpolate(frame, [5, 130], [0, milestones.length - 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const idx = Math.min(Math.floor(t), milestones.length - 1);
    const num = milestones[idx];
    // Background density
    const density = Math.min(200, Math.floor((t / (milestones.length - 1)) * 200));
    for (let i = 0; i < density; i++) {
      const n = neurons[i];
      const dotR = Math.max(1.5, 4 - density * 0.015) * s;
      ctx.fillStyle = `hsla(${n.hue}, 40%, 50%, 0.25)`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, dotR, 0, Math.PI * 2); ctx.fill();
    }
    // Number
    const fontSize = num < 1000 ? 36 : num < 100000 ? 28 : 22;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${fontSize * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(num.toLocaleString(), width / 2, height / 2);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron army: rows and columns filling in like a parade ground
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41007), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const fillT = interpolate(frame, [10, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxCols = 20, maxRows = 14;
    const totalCells = maxCols * maxRows;
    const filledCells = Math.floor(fillT * totalCells);
    const cellW = width / maxCols, cellH = height * 0.8 / maxRows;
    const offsetY = height * 0.05;
    for (let i = 0; i < filledCells; i++) {
      const row = Math.floor(i / maxCols);
      const col = i % maxCols;
      const nx = (col + 0.5) * cellW;
      const ny = offsetY + (row + 0.5) * cellH;
      const hue = PALETTE.cellColors[i % 8][0];
      const nSize = Math.min(cellW, cellH) * 0.3;
      ctx.fillStyle = `hsla(${hue}, 45%, 55%, 0.6)`;
      ctx.beginPath(); ctx.arc(nx, ny, nSize, 0, Math.PI * 2); ctx.fill();
    }
    // Count
    const displayNum = Math.floor(interpolate(frame, [10, 130], [1, 138639], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(displayNum.toLocaleString() + " neurons", width / 2, height * 0.94);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // One neuron becomes two, connected by a line, then four, dense graph emerges
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41008), [width, height, s]);
  const graph = useMemo(() => {
    const rand = seeded(41008);
    const nodes: { x: number; y: number; gen: number; hue: number }[] = [
      { x: 0.5, y: 0.5, gen: 0, hue: PALETTE.cellColors[0][0] },
    ];
    const edges: [number, number][] = [];
    for (let gen = 1; gen <= 7; gen++) {
      const parentCount = nodes.length;
      for (let p = 0; p < parentCount; p++) {
        if (nodes[p].gen !== gen - 1) continue;
        const childCount = 1 + Math.floor(rand() * 2);
        for (let c = 0; c < childCount && nodes.length < 150; c++) {
          const ang = rand() * Math.PI * 2;
          const dist = 0.05 + rand() * 0.1;
          const nx = Math.max(0.05, Math.min(0.95, nodes[p].x + Math.cos(ang) * dist));
          const ny = Math.max(0.05, Math.min(0.95, nodes[p].y + Math.sin(ang) * dist));
          const idx = nodes.length;
          nodes.push({ x: nx, y: ny, gen, hue: PALETTE.cellColors[idx % 8][0] });
          edges.push([p, idx]);
        }
      }
    }
    return { nodes, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const genT = interpolate(frame, [10, 130], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visGen = Math.floor(genT);
    // Edges
    for (const [a, b] of graph.edges) {
      if (graph.nodes[a].gen > visGen || graph.nodes[b].gen > visGen) continue;
      ctx.strokeStyle = `hsla(220, 30%, 45%, 0.2)`;
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(graph.nodes[a].x * width, graph.nodes[a].y * height);
      ctx.lineTo(graph.nodes[b].x * width, graph.nodes[b].y * height);
      ctx.stroke();
    }
    // Nodes
    for (const n of graph.nodes) {
      if (n.gen > visGen) continue;
      const nodeSize = Math.max(2, 6 - visGen * 0.5) * s;
      ctx.fillStyle = `hsla(${n.hue}, 50%, 58%, 0.7)`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, nodeSize, 0, Math.PI * 2); ctx.fill();
    }
    // Synapse counter
    const synCount = graph.edges.filter(([a, b]) => graph.nodes[a].gen <= visGen && graph.nodes[b].gen <= visGen).length;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(`${synCount} synapses`, width / 2, height * 0.93);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Contrast split: left "1 neuron" (simple), right "138,639" (dense)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 41009), [width, height, s]);
  const denseDots = useMemo(() => {
    const rand = seeded(41009);
    return Array.from({ length: 300 }, () => ({
      x: rand(), y: rand(),
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const revealT = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const denseT = interpolate(frame, [50, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mid = width / 2;
    // Divider
    ctx.strokeStyle = `hsla(220, 30%, 40%, ${revealT * 0.5})`;
    ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(mid, height * 0.1); ctx.lineTo(mid, height * 0.85); ctx.stroke();
    // Left: single neuron
    ctx.globalAlpha = alpha * revealT;
    drawNeuron(ctx, mid * 0.5, height * 0.45, 20 * s, `hsla(220, 55%, 60%, 0.85)`, frame);
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${12 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("1 neuron", mid * 0.5, height * 0.75);
    ctx.globalAlpha = alpha;
    // Right: dense network
    if (denseT > 0) {
      ctx.globalAlpha = alpha * denseT;
      const visCount = Math.floor(denseT * 300);
      for (let i = 0; i < visCount; i++) {
        const d = denseDots[i];
        const dx = mid + d.x * mid;
        const dy = d.y * height;
        ctx.fillStyle = `hsla(${d.hue}, 40%, 50%, 0.4)`;
        ctx.beginPath(); ctx.arc(dx, dy, 1.5 * s, 0, Math.PI * 2); ctx.fill();
      }
      // Connections
      ctx.strokeStyle = `hsla(220, 25%, 40%, 0.08)`;
      ctx.lineWidth = 0.5 * s;
      for (let i = 0; i < Math.min(visCount, 80); i++) {
        const a = denseDots[i];
        const j = (i * 7 + 3) % visCount;
        const b = denseDots[j];
        ctx.beginPath();
        ctx.moveTo(mid + a.x * mid, a.y * height);
        ctx.lineTo(mid + b.x * mid, b.y * height);
        ctx.stroke();
      }
      ctx.fillStyle = PALETTE.text.accent;
      ctx.font = `bold ${12 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("138,639", mid + mid * 0.5, height * 0.75);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * s}px system-ui`;
      ctx.fillText("15M synapses", mid + mid * 0.5, height * 0.8);
      ctx.globalAlpha = alpha;
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_041: VariantDef[] = [
  { id: "exponential-fill", label: "Exponential Fill", component: V1 },
  { id: "zoom-out", label: "Zoom Out", component: V2 },
  { id: "rapid-counter", label: "Rapid Counter", component: V3 },
  { id: "cell-division", label: "Cell Division", component: V4 },
  { id: "pullback-reveal", label: "Pullback Reveal", component: V5 },
  { id: "milestone-numbers", label: "Milestone Numbers", component: V6 },
  { id: "parade-ground", label: "Parade Ground", component: V7 },
  { id: "growing-graph", label: "Growing Graph", component: V8 },
  { id: "contrast-split", label: "Contrast Split", component: V9 },
];
