import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 47 — "The signal fans out. Thousands of neurons pass it along, adding, filtering, competing."
// 150 frames (5s). Activity cascades through the network like a wave.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Signal starts at edge, wave front of activation spreads across dense network
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(47001);
    return Array.from({ length: 80 }, () => ({
      x: rand() * 0.9 + 0.05, y: rand() * 0.8 + 0.1,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const waveFront = interpolate(frame, [10, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Draw edges between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.18) {
          const edgeActive = Math.min(nodes[i].x, nodes[j].x) < waveFront;
          ctx.strokeStyle = edgeActive
            ? `hsla(${(nodes[i].hue + nodes[j].hue) / 2}, 50%, 55%, 0.3)`
            : `hsla(220, 10%, 30%, 0.1)`;
          ctx.lineWidth = (edgeActive ? 1.2 : 0.5) * s;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
          ctx.lineTo(nodes[j].x * width, nodes[j].y * height);
          ctx.stroke();
        }
      }
    }

    // Draw nodes, active if behind wave front
    for (const n of nodes) {
      const active = n.x < waveFront;
      const brightness = active ? 0.8 : 0.2;
      const radius = (active ? 3.5 : 2) * s;
      ctx.fillStyle = `hsla(${n.hue}, ${active ? 60 : 15}%, ${active ? 65 : 35}%, ${brightness})`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wave front line
    ctx.strokeStyle = `hsla(45, 80%, 65%, 0.3)`;
    ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 6 * s]);
    ctx.beginPath();
    ctx.moveTo(waveFront * width, height * 0.05);
    ctx.lineTo(waveFront * width, height * 0.95);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Cascade: one neuron fires, triggers neighbors, chain reaction fills screen
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(47002);
    return Array.from({ length: 60 }, () => ({
      x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    // Cascade from center
    const cx = 0.15, cy = 0.5; // starting point
    const cascadeRadius = interpolate(frame, [10, 130], [0, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const dist = Math.sqrt((n.x - cx) ** 2 + (n.y - cy) ** 2);
      const active = dist < cascadeRadius;
      const justFired = active && dist > cascadeRadius - 0.1;

      // Edges
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const d = Math.sqrt((n.x - m.x) ** 2 + (n.y - m.y) ** 2);
        if (d < 0.2 && active) {
          ctx.strokeStyle = `hsla(${n.hue}, 40%, 50%, ${justFired ? 0.5 : 0.15})`;
          ctx.lineWidth = (justFired ? 1.5 : 0.6) * s;
          ctx.beginPath();
          ctx.moveTo(n.x * width, n.y * height);
          ctx.lineTo(m.x * width, m.y * height);
          ctx.stroke();
        }
      }

      const nodeR = (active ? (justFired ? 4.5 : 3) : 1.5) * s;
      ctx.fillStyle = `hsla(${n.hue}, ${active ? 65 : 15}%, ${justFired ? 75 : active ? 58 : 30}%, ${active ? 0.9 : 0.25})`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, nodeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Origin spark
    if (frame < 30) {
      const sparkAlpha = interpolate(frame, [5, 15, 25], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 15 * s;
      ctx.fillStyle = `hsla(45, 90%, 70%, ${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(cx * width, cy * height, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Ripple from center: concentric waves of neural activation expanding outward
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const cx = width / 2, cy = height * 0.45;
    const maxR = Math.max(width, height) * 0.6;

    // Multiple ripple rings
    for (let ring = 0; ring < 5; ring++) {
      const ringDelay = ring * 18;
      const ringProg = interpolate(frame, [10 + ringDelay, 80 + ringDelay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (ringProg <= 0) continue;
      const r = ringProg * maxR;
      const ringAlpha = Math.max(0, 0.6 - ringProg * 0.6);
      const hue = PALETTE.cellColors[ring % 8][0];
      ctx.strokeStyle = `hsla(${hue}, 55%, 60%, ${ringAlpha})`;
      ctx.lineWidth = (3 - ring * 0.4) * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center neuron pulsing
    const pulse = Math.sin(frame * 0.12) * 0.3 + 0.7;
    drawNeuron(ctx, cx, cy, 20 * s, `hsla(45, 80%, 65%, ${pulse})`, frame);

    // Scatter dots lighting up with wave
    const rand = seeded(47003);
    for (let i = 0; i < 50; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = (20 + rand() * 130) * s;
      const px = cx + Math.cos(ang) * dist;
      const py = cy + Math.sin(ang) * dist;
      const activateFrame = 10 + (dist / maxR) * 100;
      const dotActive = frame > activateFrame;
      ctx.fillStyle = dotActive
        ? `hsla(${PALETTE.cellColors[i % 8][0]}, 55%, 60%, 0.6)`
        : `hsla(220, 10%, 30%, 0.15)`;
      ctx.beginPath();
      ctx.arc(px, py, (dotActive ? 2.5 : 1.2) * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Particle flow: signal dots routing through a network graph
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  const graph = useMemo(() => {
    const rand = seeded(47004);
    const nodes = Array.from({ length: 30 }, () => ({
      x: rand() * 0.8 + 0.1, y: rand() * 0.7 + 0.15,
    }));
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.sqrt((nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2);
        if (d < 0.25 && rand() < 0.3) edges.push([i, j]);
      }
    }
    return { nodes, edges };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    // Draw graph edges
    for (const [i, j] of graph.edges) {
      ctx.strokeStyle = `hsla(220, 20%, 40%, 0.2)`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(graph.nodes[i].x * width, graph.nodes[i].y * height);
      ctx.lineTo(graph.nodes[j].x * width, graph.nodes[j].y * height);
      ctx.stroke();
    }

    // Draw graph nodes
    for (const n of graph.nodes) {
      ctx.fillStyle = `hsla(220, 20%, 45%, 0.4)`;
      ctx.beginPath();
      ctx.arc(n.x * width, n.y * height, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signal particles flowing along edges
    const flowProg = interpolate(frame, [10, 140], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let p = 0; p < 25; p++) {
      const edgeIdx = p % graph.edges.length;
      const [ei, ej] = graph.edges[edgeIdx];
      const t = ((flowProg + p * 0.12) % 1);
      const px = graph.nodes[ei].x + (graph.nodes[ej].x - graph.nodes[ei].x) * t;
      const py = graph.nodes[ei].y + (graph.nodes[ej].y - graph.nodes[ei].y) * t;
      const hue = PALETTE.cellColors[p % 8][0];
      ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.7)`;
      ctx.beginPath();
      ctx.arc(px * width, py * height, 2 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Color wave sweeping across a grid of dots, each lighting up as wave passes
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const cols = 18, rows = 12;
    const cellW = width / (cols + 1), cellH = height / (rows + 1);
    const waveFront = interpolate(frame, [10, 130], [-0.1, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px = (c + 1) * cellW;
        const py = (r + 1) * cellH;
        const norm = c / cols;
        const dist = Math.abs(norm - waveFront);
        const active = norm < waveFront;
        const nearWave = dist < 0.08;

        const hue = PALETTE.cellColors[(r + c) % 8][0];
        if (nearWave) {
          ctx.fillStyle = `hsla(${hue}, 80%, 75%, 0.9)`;
          ctx.beginPath();
          ctx.arc(px, py, 3.5 * s, 0, Math.PI * 2);
          ctx.fill();
        } else if (active) {
          ctx.fillStyle = `hsla(${hue}, 55%, 58%, 0.6)`;
          ctx.beginPath();
          ctx.arc(px, py, 2.5 * s, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `hsla(220, 10%, 30%, 0.2)`;
          ctx.beginPath();
          ctx.arc(px, py, 1.5 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // River branching: one stream splits into hundreds of tributaries
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  const branches = useMemo(() => {
    const rand = seeded(47006);
    const result: { x1: number; y1: number; x2: number; y2: number; depth: number; hue: number }[] = [];
    function branch(x: number, y: number, angle: number, len: number, depth: number) {
      if (depth > 5 || len < 8) return;
      const x2 = x + Math.cos(angle) * len;
      const y2 = y + Math.sin(angle) * len;
      const hue = PALETTE.cellColors[depth % 8][0];
      result.push({ x1: x, y1: y, x2, y2, depth, hue });
      const spread = 0.4 + rand() * 0.3;
      branch(x2, y2, angle - spread, len * (0.6 + rand() * 0.2), depth + 1);
      branch(x2, y2, angle + spread, len * (0.6 + rand() * 0.2), depth + 1);
      if (rand() < 0.3) branch(x2, y2, angle, len * 0.5, depth + 1);
    }
    branch(0.05, 0.5, 0, 0.25, 0);
    return result;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const growProg = interpolate(frame, [5, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(growProg * branches.length);

    for (let i = 0; i < visibleCount; i++) {
      const b = branches[i];
      const lineAlpha = Math.max(0.15, 0.7 - b.depth * 0.12);
      ctx.strokeStyle = `hsla(${b.hue}, 50%, 55%, ${lineAlpha})`;
      ctx.lineWidth = Math.max(0.5, (3 - b.depth * 0.5)) * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x1 * width, b.y1 * height);
      ctx.lineTo(b.x2 * width, b.y2 * height);
      ctx.stroke();

      // Tip dot
      if (i > visibleCount - 8) {
        ctx.fillStyle = `hsla(${b.hue}, 70%, 70%, 0.8)`;
        ctx.beginPath();
        ctx.arc(b.x2 * width, b.y2 * height, 2 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Dense field of neurons, activity wave passes through like wind through grass
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  const field = useMemo(() => {
    const rand = seeded(47007);
    return Array.from({ length: 100 }, () => ({
      x: rand(), y: rand() * 0.7 + 0.15,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      phase: rand() * Math.PI * 2,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const waveFront = interpolate(frame, [10, 120], [-0.1, 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const n of field) {
      const distToWave = n.x - waveFront;
      const nearWave = Math.abs(distToWave) < 0.08;
      const activated = distToWave < 0;

      // Grass-like sway from wave
      const sway = nearWave ? Math.sin(frame * 0.15 + n.phase) * 6 * s : (activated ? Math.sin(frame * 0.03 + n.phase) * 2 * s : 0);

      const px = n.x * width + sway;
      const py = n.y * height;

      // Stem
      ctx.strokeStyle = `hsla(${n.hue}, ${activated ? 45 : 15}%, ${activated ? 50 : 30}%, ${activated ? 0.4 : 0.15})`;
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(px, py + 8 * s);
      ctx.lineTo(px + sway * 0.5, py - 6 * s);
      ctx.stroke();

      // Dot (neuron head)
      const dotR = (nearWave ? 3.5 : activated ? 2.5 : 1.5) * s;
      ctx.fillStyle = nearWave
        ? `hsla(${n.hue}, 80%, 75%, 0.9)`
        : `hsla(${n.hue}, ${activated ? 50 : 15}%, ${activated ? 55 : 30}%, ${activated ? 0.6 : 0.2})`;
      ctx.beginPath();
      ctx.arc(px + sway * 0.5, py - 6 * s, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Heat map: cool blues warming to hot oranges as signal propagates
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(6, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const cols = 20, rows = 14;
    const cellW = width / cols, cellH = height / rows;
    const waveFront = interpolate(frame, [10, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const norm = c / cols;
        const heat = Math.max(0, Math.min(1, (waveFront - norm) * 3));
        // Blue (cold) -> orange (hot)
        const hue = interpolate(heat, [0, 1], [220, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const sat = interpolate(heat, [0, 1], [20, 75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const lit = interpolate(heat, [0, 1], [20, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const alpha = interpolate(heat, [0, 1], [0.15, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${alpha})`;
        ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
      }
    }

    // Label
    if (waveFront > 0.3) {
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "left";
      ctx.fillText("cool", 6 * s, height - 8 * s);
      ctx.textAlign = "right";
      ctx.fillText("hot", width - 6 * s, height - 8 * s);
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Domino wave: neurons tipping one by one in an expanding frontier
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  const dominoes = useMemo(() => {
    const rand = seeded(47009);
    return Array.from({ length: 50 }, (_, i) => ({
      x: 0.05 + (i / 50) * 0.9 + (rand() - 0.5) * 0.02,
      y: 0.3 + rand() * 0.4,
      h: (12 + rand() * 8) * 1,
      hue: PALETTE.cellColors[i % 8][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const a = fadeInOut(frame, 150);
    ctx.globalAlpha = a;

    const waveFront = interpolate(frame, [10, 130], [0, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const d of dominoes) {
      const fallProg = interpolate(waveFront, [d.x - 0.02, d.x + 0.04], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const angle = fallProg * Math.PI * 0.45; // tip over ~80 degrees

      const px = d.x * width;
      const py = d.y * height;
      const h = d.h * s;
      const w = 3 * s;

      ctx.save();
      ctx.translate(px, py + h / 2);
      ctx.rotate(angle);

      const bright = fallProg > 0.5 ? 65 : 45;
      ctx.fillStyle = `hsla(${d.hue}, 50%, ${bright}%, 0.75)`;
      ctx.fillRect(-w / 2, -h, w, h);

      ctx.restore();

      // Flash at tip moment
      if (fallProg > 0.3 && fallProg < 0.7) {
        ctx.fillStyle = `hsla(${d.hue}, 80%, 75%, ${0.6 - Math.abs(fallProg - 0.5) * 2})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_047: VariantDef[] = [
  { id: "wave-front", label: "Wave Front Activation", component: V1 },
  { id: "cascade-chain", label: "Cascade Chain Reaction", component: V2 },
  { id: "concentric-ripple", label: "Concentric Ripple", component: V3 },
  { id: "particle-flow", label: "Particle Flow Graph", component: V4 },
  { id: "color-wave-grid", label: "Color Wave Grid", component: V5 },
  { id: "river-branching", label: "River Branching", component: V6 },
  { id: "wind-through-grass", label: "Wind Through Grass", component: V7 },
  { id: "heat-map", label: "Heat Map Propagation", component: V8 },
  { id: "domino-wave", label: "Domino Wave", component: V9 },
];
