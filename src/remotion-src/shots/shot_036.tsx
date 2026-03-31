import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawPerson, drawBarChart } from "../icons";

// Shot 036 — "A neuron receives electrical signals from other neurons it's connected to."
// 9 ways to show three input neurons sending signals to a central neuron

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Three neurons on left sending pulses (glowing dots) along connections to central neuron
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(18, width, height, s, 3601), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width * 0.65, cy = height / 2;
    const inputs = [
      { x: width * 0.2, y: height * 0.25, hue: 220, delay: 15 },
      { x: width * 0.15, y: height * 0.5, hue: 140, delay: 40 },
      { x: width * 0.2, y: height * 0.75, hue: 350, delay: 65 },
    ];
    // Draw connections
    ctx.lineCap = "round";
    for (const inp of inputs) {
      ctx.strokeStyle = `hsla(${inp.hue}, 40%, 50%, ${fo * 0.25})`; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(inp.x, inp.y); ctx.lineTo(cx, cy); ctx.stroke();
    }
    // Draw input neurons
    for (const inp of inputs) {
      drawNeuron(ctx, inp.x, inp.y, 28 * s, `hsla(${inp.hue}, 55%, 60%, ${fo * 0.8})`, frame);
    }
    // Central neuron
    drawNeuron(ctx, cx, cy, 35 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    // Traveling pulse dots
    for (const inp of inputs) {
      const pulseFrame = (frame - inp.delay) % 50;
      if (pulseFrame < 0) continue;
      const t = interpolate(pulseFrame, [0, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0 || t >= 1) continue;
      const px = inp.x + (cx - inp.x) * t, py = inp.y + (cy - inp.y) * t;
      ctx.fillStyle = `hsla(${inp.hue}, 60%, 70%, ${fo * 0.9})`;
      ctx.beginPath(); ctx.arc(px, py, 4 * s, 0, Math.PI * 2); ctx.fill();
      const glow = ctx.createRadialGradient(px, py, 0, px, py, 12 * s);
      glow.addColorStop(0, `hsla(${inp.hue}, 60%, 70%, ${fo * 0.25})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(px, py, 12 * s, 0, Math.PI * 2); ctx.fill();
      // Flash on arrival
      if (t > 0.9) {
        const flash = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25 * s);
        flash.addColorStop(0, `hsla(${inp.hue}, 55%, 70%, ${fo * 0.2 * (1 - t) * 10})`);
        flash.addColorStop(1, "transparent");
        ctx.fillStyle = flash;
        ctx.beginPath(); ctx.arc(cx, cy, 25 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Arrows converging on a central circle from multiple directions
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3602), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const dirs = [
      { angle: Math.PI * 1.15, hue: 220, delay: 10 },
      { angle: Math.PI * 0.85, hue: 140, delay: 35 },
      { angle: Math.PI * 1.5, hue: 350, delay: 60 },
      { angle: Math.PI * 0.5, hue: 55, delay: 85 },
      { angle: Math.PI * 0.15, hue: 280, delay: 105 },
    ];
    const dist = 70 * s;
    for (const d of dirs) {
      const t = interpolate(frame - d.delay, [0, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      const sx = cx + Math.cos(d.angle) * dist, sy = cy + Math.sin(d.angle) * dist;
      const ex = cx + Math.cos(d.angle) * 18 * s, ey = cy + Math.sin(d.angle) * 18 * s;
      const curX = sx + (ex - sx) * t, curY = sy + (ey - sy) * t;
      // Arrow shaft
      ctx.strokeStyle = `hsla(${d.hue}, 50%, 60%, ${fo * t * 0.7})`; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(curX, curY); ctx.stroke();
      // Arrowhead
      if (t > 0.7) {
        const ha = d.angle + Math.PI;
        ctx.beginPath();
        ctx.moveTo(curX + Math.cos(ha + 0.4) * 8 * s, curY + Math.sin(ha + 0.4) * 8 * s);
        ctx.lineTo(curX, curY);
        ctx.lineTo(curX + Math.cos(ha - 0.4) * 8 * s, curY + Math.sin(ha - 0.4) * 8 * s);
        ctx.stroke();
      }
      // Source dot
      ctx.fillStyle = `hsla(${d.hue}, 55%, 60%, ${fo * t})`;
      ctx.beginPath(); ctx.arc(sx, sy, 5 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Central receiving neuron
    const bodyR = 14 * s;
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, bodyR);
    bg.addColorStop(0, `hsla(280, 60%, 75%, ${fo})`);
    bg.addColorStop(1, `hsla(280, 55%, 50%, ${fo * 0.6})`);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.arc(cx, cy, bodyR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("receives", cx, height * 0.88);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Particle streams flowing from three sources into one target
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const bgParts = useMemo(() => makeParticles(12, width, height, s, 3603), [width, height, s]);
  const streams = useMemo(() => {
    const r = seeded(3603);
    const sources = [
      { x: width * 0.15, y: height * 0.2, hue: 220 },
      { x: width * 0.1, y: height * 0.5, hue: 140 },
      { x: width * 0.15, y: height * 0.8, hue: 55 },
    ];
    const particles: { sx: number; sy: number; hue: number; speed: number; offset: number }[] = [];
    for (const src of sources) {
      for (let i = 0; i < 15; i++) {
        particles.push({ sx: src.x, sy: src.y, hue: src.hue, speed: 0.6 + r() * 0.5, offset: r() * 60 });
      }
    }
    return { sources, particles };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, bgParts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const tx = width * 0.7, ty = height / 2;
    // Flowing particles
    for (const p of streams.particles) {
      const t = ((frame + p.offset) * p.speed * 0.015) % 1;
      const px = p.sx + (tx - p.sx) * t, py = p.sy + (ty - p.sy) * t;
      const sz = (2 + Math.sin(t * Math.PI) * 2) * s;
      ctx.fillStyle = `hsla(${p.hue}, 55%, 65%, ${fo * Math.sin(t * Math.PI) * 0.7})`;
      ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill();
    }
    // Source circles
    for (const src of streams.sources) {
      ctx.fillStyle = `hsla(${src.hue}, 50%, 55%, ${fo * 0.5})`;
      ctx.beginPath(); ctx.arc(src.x, src.y, 8 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Target neuron
    drawNeuron(ctx, tx, ty, 40 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Network graph with edges lighting up sequentially toward center
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3604), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(3604);
    const nodes: { x: number; y: number; hue: number; layer: number }[] = [];
    // Layer 0: outer ring (sources)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      nodes.push({ x: width / 2 + Math.cos(a) * 65 * s, y: height / 2 + Math.sin(a) * 50 * s, hue: PALETTE.cellColors[i][0], layer: 0 });
    }
    // Layer 1: middle ring
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      nodes.push({ x: width / 2 + Math.cos(a) * 32 * s, y: height / 2 + Math.sin(a) * 25 * s, hue: PALETTE.cellColors[i + 2][0], layer: 1 });
    }
    // Layer 2: center
    nodes.push({ x: width / 2, y: height / 2, hue: 280, layer: 2 });
    const edges: [number, number][] = [];
    for (let i = 0; i < 8; i++) edges.push([i, 8 + (i % 4)]);
    for (let i = 8; i < 12; i++) edges.push([i, 12]);
    return { nodes, edges };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    // Light up edges sequentially
    for (let i = 0; i < data.edges.length; i++) {
      const [a, b] = data.edges[i];
      const na = data.nodes[a], nb = data.nodes[b];
      const lightT = interpolate(frame, [15 + i * 8, 30 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const baseAlpha = 0.12;
      ctx.strokeStyle = `hsla(${na.hue}, 40%, 55%, ${fo * (baseAlpha + lightT * 0.4)})`;
      ctx.lineWidth = (1.5 + lightT * 1.5) * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y); ctx.stroke();
    }
    // Draw nodes
    for (const n of data.nodes) {
      const r = n.layer === 2 ? 10 * s : n.layer === 1 ? 6 * s : 4 * s;
      ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, ${fo * 0.8})`;
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Three colored waves merging into one neuron
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3605), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width * 0.7, cy = height / 2;
    const waves = [
      { y: height * 0.25, hue: 220, amp: 8, wl: 30, phase: 0 },
      { y: height * 0.5, hue: 140, amp: 6, wl: 25, phase: 1.5 },
      { y: height * 0.75, hue: 55, amp: 10, wl: 35, phase: 3 },
    ];
    const waveLen = width * 0.55;
    const startX = width * 0.08;
    for (const w of waves) {
      ctx.strokeStyle = `hsla(${w.hue}, 55%, 60%, ${fo * 0.7})`; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= waveLen; i += 2) {
        const progress = i / waveLen;
        // Waves converge toward center y as they approach neuron
        const mergeY = w.y + (cy - w.y) * Math.pow(progress, 2);
        const amplitude = w.amp * s * (1 - progress * 0.5);
        const yy = mergeY + Math.sin((i / (w.wl * s)) * Math.PI * 2 + frame * 0.06 + w.phase) * amplitude;
        i === 0 ? ctx.moveTo(startX + i, yy) : ctx.lineTo(startX + i, yy);
      }
      ctx.stroke();
    }
    // Central neuron
    drawNeuron(ctx, cx, cy, 35 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("signals converge", cx, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Postman metaphor: three envelopes arriving at a mailbox (neuron)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3606), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width * 0.65, cy = height / 2;
    // Mailbox (neuron as mailbox)
    ctx.fillStyle = `hsla(280, 45%, 45%, ${fo * 0.6})`;
    ctx.fillRect(cx - 15 * s, cy - 20 * s, 30 * s, 35 * s);
    ctx.strokeStyle = `hsla(280, 50%, 60%, ${fo * 0.8})`; ctx.lineWidth = 2 * s;
    ctx.strokeRect(cx - 15 * s, cy - 20 * s, 30 * s, 35 * s);
    // Flag
    ctx.fillStyle = `hsla(350, 55%, 55%, ${fo})`;
    ctx.fillRect(cx + 15 * s, cy - 15 * s, 3 * s, 20 * s);
    ctx.fillRect(cx + 15 * s, cy - 15 * s, 10 * s, 8 * s);
    // Slot
    ctx.fillStyle = `hsla(280, 30%, 25%, ${fo})`;
    ctx.fillRect(cx - 10 * s, cy - 17 * s, 20 * s, 4 * s);
    // Three envelopes arriving
    const envs = [
      { sx: width * 0.1, sy: height * 0.2, hue: 220, delay: 15 },
      { sx: width * 0.08, sy: height * 0.5, hue: 140, delay: 50 },
      { sx: width * 0.1, sy: height * 0.8, hue: 55, delay: 85 },
    ];
    for (const env of envs) {
      const t = interpolate(frame - env.delay, [0, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      const ex = env.sx + (cx - env.sx) * Math.min(t, 1);
      const ey = env.sy + (cy - 15 * s - env.sy) * Math.min(t, 1);
      if (t < 0.95) {
        // Envelope shape
        const ew = 18 * s, eh = 12 * s;
        ctx.fillStyle = `hsla(${env.hue}, 50%, 60%, ${fo * 0.8})`;
        ctx.fillRect(ex - ew / 2, ey - eh / 2, ew, eh);
        // Flap
        ctx.beginPath(); ctx.moveTo(ex - ew / 2, ey - eh / 2);
        ctx.lineTo(ex, ey); ctx.lineTo(ex + ew / 2, ey - eh / 2); ctx.closePath();
        ctx.strokeStyle = `hsla(${env.hue}, 40%, 45%, ${fo})`; ctx.lineWidth = 1.5 * s; ctx.stroke();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("signals arrive", cx, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Three rivers flowing into a lake (neuron as lake)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3607), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const lx = width * 0.6, ly = height / 2;
    // Lake (neuron body)
    const lakeR = 28 * s;
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lakeR);
    lg.addColorStop(0, `hsla(220, 50%, 55%, ${fo * 0.5})`);
    lg.addColorStop(1, `hsla(220, 40%, 35%, ${fo * 0.2})`);
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.ellipse(lx, ly, lakeR * 1.3, lakeR * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(220, 45%, 55%, ${fo * 0.4})`; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.ellipse(lx, ly, lakeR * 1.3, lakeR * 0.8, 0, 0, Math.PI * 2); ctx.stroke();
    // Rivers (curved paths)
    const rivers = [
      { sx: width * 0.05, sy: height * 0.15, cp1x: width * 0.25, cp1y: height * 0.1, cp2x: width * 0.4, cp2y: height * 0.3, hue: 200 },
      { sx: width * 0.02, sy: height * 0.5, cp1x: width * 0.15, cp1y: height * 0.45, cp2x: width * 0.35, cp2y: height * 0.48, hue: 180 },
      { sx: width * 0.05, sy: height * 0.85, cp1x: width * 0.2, cp1y: height * 0.9, cp2x: width * 0.4, cp2y: height * 0.7, hue: 160 },
    ];
    for (const riv of rivers) {
      ctx.strokeStyle = `hsla(${riv.hue}, 45%, 55%, ${fo * 0.5})`; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(riv.sx, riv.sy);
      ctx.bezierCurveTo(riv.cp1x, riv.cp1y, riv.cp2x, riv.cp2y, lx - lakeR * 0.8, ly);
      ctx.stroke();
      // Flow particles
      for (let i = 0; i < 5; i++) {
        const pt = ((frame * 0.008 + i * 0.2) % 1);
        const t2 = pt, t1 = 1 - t2;
        const px = t1 * t1 * t1 * riv.sx + 3 * t1 * t1 * t2 * riv.cp1x + 3 * t1 * t2 * t2 * riv.cp2x + t2 * t2 * t2 * (lx - lakeR * 0.8);
        const py = t1 * t1 * t1 * riv.sy + 3 * t1 * t1 * t2 * riv.cp1y + 3 * t1 * t2 * t2 * riv.cp2y + t2 * t2 * t2 * ly;
        ctx.fillStyle = `hsla(${riv.hue}, 50%, 65%, ${fo * 0.6})`;
        ctx.beginPath(); ctx.arc(px, py, 2.5 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("signals flow in", lx, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Signal dots racing along curved paths to center neuron
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3608), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width * 0.65, cy = height / 2;
    const paths = [
      { sx: width * 0.1, sy: height * 0.2, cpx: width * 0.3, cpy: height * 0.1, hue: 220 },
      { sx: width * 0.08, sy: height * 0.5, cpx: width * 0.35, cpy: height * 0.6, hue: 140 },
      { sx: width * 0.1, sy: height * 0.8, cpx: width * 0.25, cpy: height * 0.9, hue: 55 },
    ];
    // Draw curved paths
    ctx.lineCap = "round";
    for (const p of paths) {
      ctx.strokeStyle = `hsla(${p.hue}, 35%, 45%, ${fo * 0.2})`; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(p.sx, p.sy);
      ctx.quadraticCurveTo(p.cpx, p.cpy, cx, cy); ctx.stroke();
    }
    // Racing dots (multiple per path)
    for (const p of paths) {
      for (let d = 0; d < 3; d++) {
        const t = ((frame * 0.012 + d * 0.33) % 1);
        const t1 = 1 - t;
        const px = t1 * t1 * p.sx + 2 * t1 * t * p.cpx + t * t * cx;
        const py = t1 * t1 * p.sy + 2 * t1 * t * p.cpy + t * t * cy;
        const alpha = Math.sin(t * Math.PI);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${fo * alpha * 0.9})`;
        ctx.beginPath(); ctx.arc(px, py, 3.5 * s, 0, Math.PI * 2); ctx.fill();
        // Trail
        ctx.fillStyle = `hsla(${p.hue}, 50%, 60%, ${fo * alpha * 0.15})`;
        ctx.beginPath(); ctx.arc(px, py, 8 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Source neurons
    for (const p of paths) {
      ctx.fillStyle = `hsla(${p.hue}, 50%, 55%, ${fo * 0.6})`;
      ctx.beginPath(); ctx.arc(p.sx, p.sy, 6 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Target neuron
    drawNeuron(ctx, cx, cy, 35 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Three neurons flash one by one, central neuron receives each pulse with a ripple
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3609), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const cx = width * 0.65, cy = height / 2;
    const inputs = [
      { x: width * 0.2, y: height * 0.22, hue: 220, fireFrame: 20 },
      { x: width * 0.15, y: height * 0.5, hue: 140, fireFrame: 55 },
      { x: width * 0.2, y: height * 0.78, hue: 350, fireFrame: 90 },
    ];
    // Connections
    for (const inp of inputs) {
      ctx.strokeStyle = `hsla(${inp.hue}, 35%, 45%, ${fo * 0.2})`; ctx.lineWidth = 1.5 * s; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(inp.x, inp.y); ctx.lineTo(cx, cy); ctx.stroke();
    }
    // Input neurons with flash
    for (const inp of inputs) {
      const since = frame - inp.fireFrame;
      const flash = since >= 0 && since < 12 ? Math.sin((since / 12) * Math.PI) : 0;
      const baseAlpha = 0.6 + flash * 0.4;
      // Flash glow
      if (flash > 0) {
        const glow = ctx.createRadialGradient(inp.x, inp.y, 0, inp.x, inp.y, 25 * s);
        glow.addColorStop(0, `hsla(${inp.hue}, 60%, 70%, ${fo * flash * 0.35})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(inp.x, inp.y, 25 * s, 0, Math.PI * 2); ctx.fill();
      }
      drawNeuron(ctx, inp.x, inp.y, 25 * s, `hsla(${inp.hue}, 55%, ${55 + flash * 15}%, ${fo * baseAlpha})`, frame);
      // Pulse traveling to center
      if (since >= 5 && since < 25) {
        const pt = (since - 5) / 20;
        const px = inp.x + (cx - inp.x) * pt, py = inp.y + (cy - inp.y) * pt;
        ctx.fillStyle = `hsla(${inp.hue}, 60%, 70%, ${fo * 0.8})`;
        ctx.beginPath(); ctx.arc(px, py, 4 * s, 0, Math.PI * 2); ctx.fill();
      }
      // Ripple at center on arrival
      if (since >= 25 && since < 40) {
        const ripT = (since - 25) / 15;
        ctx.strokeStyle = `hsla(${inp.hue}, 50%, 60%, ${fo * (1 - ripT) * 0.4})`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(cx, cy, (15 + ripT * 30) * s, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Central neuron
    drawNeuron(ctx, cx, cy, 35 * s, `hsla(280, 55%, 65%, ${fo})`, frame);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_036: VariantDef[] = [
  { id: "pulse-dots", label: "Pulse Dots", component: V1 },
  { id: "converge-arrows", label: "Converging Arrows", component: V2 },
  { id: "particle-streams", label: "Particle Streams", component: V3 },
  { id: "network-light", label: "Network Light-Up", component: V4 },
  { id: "wave-merge", label: "Wave Merge", component: V5 },
  { id: "mailbox", label: "Mailbox Metaphor", component: V6 },
  { id: "rivers", label: "Rivers to Lake", component: V7 },
  { id: "racing-dots", label: "Racing Dots", component: V8 },
  { id: "flash-ripple", label: "Flash & Ripple", component: V9 },
];
