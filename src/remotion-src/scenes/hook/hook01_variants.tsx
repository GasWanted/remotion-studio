import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../../types";

/**
 * Hook-01 — "Evolution spent fifty million years wiring this brain."
 * 9 UNIQUE visual style explorations. Not Kurzgesagt copies — original AI channel identity.
 *
 * Each variant tells the same story: one neuron → exponential growth → full connectome.
 * Year counter accelerates from 1,000 → 50,000,000.
 * But each has a completely different visual language.
 */

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// Shared: build a branching tree of cells from one ancestor
interface Cell {
  x: number; y: number; rx: number; ry: number;
  gen: number; parent: number; seed: number; phase: number;
}

function buildTree(cx: number, cy: number, scale: number, seed: number): { cells: Cell[]; edges: [number, number][] } {
  const rand = seeded(seed);
  const cells: Cell[] = [];
  const edges: [number, number][] = [];

  // Root
  cells.push({ x: cx, y: cy, rx: 20 * scale, ry: 17 * scale, gen: 0, parent: -1, seed: 100, phase: 0 });

  function spawn(parentIdx: number, count: number, gen: number, spread: number, size: number) {
    const p = cells[parentIdx];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand() * 0.9 + gen * 0.6;
      const d = spread * (0.6 + rand() * 0.8) * scale;
      const sv = 0.6 + rand() * 0.7;
      const idx = cells.length;
      cells.push({
        x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d * 0.8,
        rx: size * sv * scale, ry: size * sv * scale * (0.78 + rand() * 0.18),
        gen, parent: parentIdx, seed: Math.floor(rand() * 9999), phase: rand() * Math.PI * 2,
      });
      edges.push([parentIdx, idx]);
    }
  }

  spawn(0, 2, 1, 50, 16);
  spawn(1, 2, 2, 42, 12); spawn(2, 2, 2, 42, 12);
  for (let i = 3; i <= 6; i++) spawn(i, 2, 3, 35, 9);
  for (let i = 7; i <= 14 && i < cells.length; i++) if (rand() < 0.7) spawn(i, 1 + Math.floor(rand() * 2), 4, 28, 6);
  for (let i = 15; i < cells.length && i < 25; i++) if (rand() < 0.4) spawn(i, 1, 5, 22, 4);

  // Lateral edges
  for (let i = 0; i < cells.length; i++) for (let j = i + 1; j < cells.length; j++) {
    if (cells[i].gen === cells[j].gen && cells[i].gen >= 2) {
      const dx = cells[i].x - cells[j].x, dy = cells[i].y - cells[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.12) edges.push([i, j]);
    }
  }

  return { cells, edges };
}

// Shared: year counter drawing
function drawYearCounter(ctx: CanvasRenderingContext2D, frame: number, width: number, height: number, scale: number, color: string, bgColor: string) {
  const fadeIn = interpolate(frame, [8, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [130, 145], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const alpha = fadeIn * fadeOut;
  if (alpha <= 0) return;

  const yearT = interpolate(frame, [8, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const years = Math.min(Math.floor(1000 * Math.pow(50000, yearT)), 50_000_000);
  const text = years.toLocaleString("en-US");

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = bgColor;
  const px = width - 55 * scale, py = 25 * scale;
  const pw = (text.length * 10 + 65) * scale, ph = 26 * scale;
  ctx.beginPath();
  ctx.roundRect(px - pw, py, pw, ph, ph / 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = `bold ${16 * scale}px system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(text, px - 10 * scale, py + 18 * scale);
  ctx.globalAlpha = alpha * 0.5;
  ctx.font = `${9 * scale}px system-ui, sans-serif`;
  ctx.fillText("years", px - (text.length * 10 + 14) * scale, py + 18 * scale);
  ctx.restore();
}

// Shared: exponential growth timing
function growthVis(frame: number, totalCells: number): number {
  const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.max(1, Math.floor(Math.pow(t, 2.5) * totalCells));
}

// ======================================================================
// VARIANT 1 — "Neon Circuit"
// Dark background, cells are glowing neon circles with circuit-trace connections.
// Cyberpunk AI aesthetic — electric blue and hot pink.
// ======================================================================
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 101), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: deep dark blue-black
    const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
    bg.addColorStop(0, "#0a0818"); bg.addColorStop(0.5, "#060510"); bg.addColorStop(1, "#020208");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    // Grid lines (subtle circuit board)
    ctx.strokeStyle = "rgba(30, 60, 120, 0.06)"; ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30 * scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += 30 * scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    ctx.globalAlpha = fo;
    const neonColors = ["#00d4ff", "#ff2288", "#00ffaa", "#ff8800", "#aa44ff", "#44ffdd"];

    // Connections: glowing straight lines with right-angle bends
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 4);
      const col = neonColors[(a + b) % neonColors.length];

      // Glow
      ctx.strokeStyle = col.replace(")", `,${alpha * 0.15})`).replace("rgb", "rgba").replace("#", "");
      ctx.shadowColor = col; ctx.shadowBlur = 12 * scale;
      ctx.lineWidth = 3 * scale; ctx.lineCap = "round";
      // Right-angle path: go horizontal then vertical
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y);
      ctx.lineTo(cb.x, ca.y); ctx.lineTo(cb.x, cb.y);
      ctx.strokeStyle = `${col}${Math.floor(alpha * 60).toString(16).padStart(2, "0")}`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Nodes: glowing circles with bright rim
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 5);
      const r = c.rx * arr;
      if (r < 0.5) continue;
      const col = neonColors[i % neonColors.length];
      const pulse = 0.8 + Math.sin(frame * 0.05 + c.phase) * 0.2;

      // Outer glow
      ctx.shadowColor = col; ctx.shadowBlur = 15 * scale * pulse;
      ctx.fillStyle = `${col}15`;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 2.5, 0, Math.PI * 2); ctx.fill();

      // Fill
      ctx.fillStyle = `${col}30`;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();

      // Bright rim
      ctx.strokeStyle = `${col}${Math.floor(arr * pulse * 200).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();

      // Center dot
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.3 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "#00d4ff", "rgba(0,20,40,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 2 — "Watercolor Bloom"
// Soft, painterly. Cells are watercolor splashes that bleed into each other.
// Warm earth tones on cream/parchment background.
// ======================================================================
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 202), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: warm parchment
    const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
    bg.addColorStop(0, "#f5ede0"); bg.addColorStop(0.6, "#e8ddd0"); bg.addColorStop(1, "#d8cbb8");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    // Paper texture: subtle noise dots
    const rand = seeded(222);
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(180,160,130,${0.02 + rand() * 0.03})`;
      ctx.beginPath(); ctx.arc(rand() * width, rand() * height, rand() * 3 * scale, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = fo;
    const warmHues = [15, 25, 35, 350, 340, 180, 160, 200];

    // Connections: thin ink lines
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 5);
      ctx.strokeStyle = `rgba(80,60,40,${alpha * 0.25})`;
      ctx.lineWidth = 1.5 * scale;
      const mx = (ca.x + cb.x) / 2 + (ca.y - cb.y) * 0.15;
      const my = (ca.y + cb.y) / 2 + (cb.x - ca.x) * 0.12;
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.quadraticCurveTo(mx, my, cb.x, cb.y); ctx.stroke();
    }

    // Cells: watercolor splashes
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 8);
      const r = c.rx * arr;
      if (r < 0.5) continue;
      const hue = warmHues[i % warmHues.length];

      // Watercolor blob: multiple overlapping transparent layers
      for (let layer = 0; layer < 3; layer++) {
        const lr = r * (1.3 - layer * 0.15);
        const ox = Math.sin(c.seed + layer * 2) * r * 0.15;
        const oy = Math.cos(c.seed + layer * 3) * r * 0.12;
        const grad = ctx.createRadialGradient(c.x + ox, c.y + oy, 0, c.x + ox, c.y + oy, lr);
        grad.addColorStop(0, `hsla(${hue}, 55%, 55%, ${arr * 0.2})`);
        grad.addColorStop(0.5, `hsla(${hue}, 50%, 60%, ${arr * 0.12})`);
        grad.addColorStop(1, `hsla(${hue}, 45%, 65%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(c.x + ox, c.y + oy, lr, 0, Math.PI * 2); ctx.fill();
      }

      // Dark center dot
      ctx.fillStyle = `hsla(${hue}, 40%, 35%, ${arr * 0.6})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 0.25, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "rgba(80,60,40,0.8)", "rgba(245,237,224,0.6)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 3 — "Data Forge"
// Terminal/hacker aesthetic but warm. Cells are data clusters with hex values.
// Matrix-inspired but gold instead of green. AI-native feel.
// ======================================================================
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 303), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: near-black with amber tint
    ctx.fillStyle = "#0c0a08"; ctx.fillRect(0, 0, width, height);

    // Scrolling hex digits in background (very subtle)
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "#ffaa22"; ctx.font = `${10 * scale}px monospace`;
    const scrollY = (frame * 0.5) % (20 * scale);
    for (let row = -1; row < height / (14 * scale) + 1; row++) {
      for (let col = 0; col < width / (22 * scale); col++) {
        const hex = ((row * 37 + col * 13 + frame) % 256).toString(16).padStart(2, "0");
        ctx.fillText(hex, col * 22 * scale, row * 14 * scale + scrollY);
      }
    }

    ctx.globalAlpha = fo;

    // Connections: data transfer lines with traveling dots
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 4);
      ctx.strokeStyle = `rgba(255,170,34,${alpha * 0.2})`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y); ctx.stroke();

      // Traveling data packet
      const packetT = ((frame * 0.03 + a * 0.7) % 1);
      const px = ca.x + (cb.x - ca.x) * packetT;
      const py = ca.y + (cb.y - ca.y) * packetT;
      ctx.fillStyle = `rgba(255,200,80,${alpha * 0.7})`;
      ctx.beginPath(); ctx.arc(px, py, 1.5 * scale, 0, Math.PI * 2); ctx.fill();
    }

    // Nodes: hexagonal data clusters
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 5);
      const r = c.rx * arr;
      if (r < 1) continue;
      const pulse = 0.7 + Math.sin(frame * 0.04 + c.phase) * 0.3;

      // Hexagon shape
      ctx.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2 - Math.PI / 6;
        const px = c.x + Math.cos(a) * r, py = c.y + Math.sin(a) * r;
        v === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(255,170,34,${arr * pulse * 0.15})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,170,34,${arr * pulse * 0.6})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.stroke();

      // Hex value inside
      if (r > 6 * scale) {
        ctx.fillStyle = `rgba(255,200,100,${arr * 0.6})`;
        ctx.font = `${Math.min(r * 0.5, 8 * scale)}px monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(i.toString(16).toUpperCase().padStart(2, "0"), c.x, c.y);
      }
    }

    ctx.globalAlpha = 1; ctx.textBaseline = "alphabetic";
    drawYearCounter(ctx, frame, width, height, scale, "#ffaa22", "rgba(12,10,8,0.6)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 4 — "Constellation"
// Cells are stars. Connections form constellations. Deep space background.
// Serene, cosmic. The brain as a universe.
// ======================================================================
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 404), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: deep space
    const bg = ctx.createRadialGradient(width / 2, height * 0.4, 0, width / 2, height / 2, width * 0.7);
    bg.addColorStop(0, "#0a0820"); bg.addColorStop(0.5, "#050412"); bg.addColorStop(1, "#020208");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    // Background stars
    const rand = seeded(444);
    for (let i = 0; i < 150; i++) {
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.02 + i * 1.7));
      ctx.fillStyle = `rgba(200,210,255,${(0.05 + rand() * 0.15) * twinkle})`;
      ctx.beginPath(); ctx.arc(rand() * width, rand() * height, (0.3 + rand() * 1) * scale, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = fo;

    // Constellation lines
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 6);
      ctx.strokeStyle = `rgba(180,200,255,${alpha * 0.2})`;
      ctx.lineWidth = 1 * scale; ctx.setLineDash([4 * scale, 3 * scale]);
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Stars (cells)
    const starColors = ["#ffe8c0", "#ffd4a0", "#c0d8ff", "#ffe0d0", "#d0e8ff"];
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 5);
      const r = c.rx * arr * 0.6;
      if (r < 0.3) continue;
      const col = starColors[i % starColors.length];
      const pulse = 0.8 + Math.sin(frame * 0.04 + c.phase) * 0.2;

      // Star glow
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 4);
      glow.addColorStop(0, col + Math.floor(arr * pulse * 40).toString(16).padStart(2, "0"));
      glow.addColorStop(1, col + "00");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 4, 0, Math.PI * 2); ctx.fill();

      // Star core
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * pulse, 0, Math.PI * 2); ctx.fill();

      // 4-point diffraction spikes
      if (r > 3 * scale) {
        ctx.strokeStyle = `${col}${Math.floor(arr * 60).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1 * scale;
        for (const angle of [0, Math.PI / 2]) {
          ctx.beginPath();
          ctx.moveTo(c.x + Math.cos(angle) * r * 3, c.y + Math.sin(angle) * r * 3);
          ctx.lineTo(c.x - Math.cos(angle) * r * 3, c.y - Math.sin(angle) * r * 3);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "rgba(180,200,255,0.8)", "rgba(5,4,18,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 5 — "Isometric Blueprint"
// Clean technical drawing on dark blue grid. Cells are isometric cubes/spheres.
// Architectural precision. The brain as an engineered structure.
// ======================================================================
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 505), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: dark blueprint
    ctx.fillStyle = "#0a1428"; ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "rgba(40,80,160,0.08)"; ctx.lineWidth = 1;
    const gridS = 25 * scale;
    for (let x = 0; x < width; x += gridS) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
    for (let y = 0; y < height; y += gridS) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }

    ctx.globalAlpha = fo;

    // Connections: clean straight lines with measurement ticks
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 4);
      ctx.strokeStyle = `rgba(100,180,255,${alpha * 0.35})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y); ctx.stroke();
    }

    // Nodes: clean circles with dimension lines
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 5);
      const r = c.rx * arr;
      if (r < 0.5) continue;

      // Fill
      ctx.fillStyle = `rgba(60,140,220,${arr * 0.15})`;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();

      // Outline
      ctx.strokeStyle = `rgba(100,180,255,${arr * 0.7})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();

      // Center crosshair
      if (r > 5 * scale) {
        ctx.strokeStyle = `rgba(100,180,255,${arr * 0.3})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.beginPath(); ctx.moveTo(c.x - r * 0.6, c.y); ctx.lineTo(c.x + r * 0.6, c.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x, c.y - r * 0.6); ctx.lineTo(c.x, c.y + r * 0.6); ctx.stroke();
      }

      // Node label
      if (r > 8 * scale && c.gen <= 2) {
        ctx.fillStyle = `rgba(140,200,255,${arr * 0.5})`;
        ctx.font = `${7 * scale}px monospace`; ctx.textAlign = "center";
        ctx.fillText(`N${i.toString().padStart(3, "0")}`, c.x, c.y + r + 8 * scale);
      }
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "rgba(100,180,255,0.8)", "rgba(10,20,40,0.6)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 6 — "Molten Gold"
// Cells are drops of liquid gold on obsidian. Connections are flowing gold rivers.
// Luxurious, heavy, ancient. Evolution as a forge.
// ======================================================================
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 606), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: obsidian
    const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
    bg.addColorStop(0, "#1a1410"); bg.addColorStop(0.5, "#0e0c08"); bg.addColorStop(1, "#060504");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fo;

    // Connections: flowing gold rivers
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 5);
      const mx = (ca.x + cb.x) / 2 + Math.sin(frame * 0.02 + a) * 5 * scale;
      const my = (ca.y + cb.y) / 2 + Math.cos(frame * 0.015 + b) * 4 * scale;

      // Outer glow
      ctx.strokeStyle = `rgba(255,180,50,${alpha * 0.08})`;
      ctx.lineWidth = 6 * scale; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.quadraticCurveTo(mx, my, cb.x, cb.y); ctx.stroke();
      // Inner bright
      ctx.strokeStyle = `rgba(255,200,80,${alpha * 0.3})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.quadraticCurveTo(mx, my, cb.x, cb.y); ctx.stroke();
    }

    // Cells: molten gold drops
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 6);
      const wobble = Math.sin(frame * 0.03 + c.phase) * 0.06;
      const r = c.rx * arr * (1 + wobble);
      const ry = c.ry * arr * (1 - wobble * 0.4);
      if (r < 0.5) continue;

      // Molten glow
      const glow = ctx.createRadialGradient(c.x, c.y, r * 0.3, c.x, c.y, r * 3);
      glow.addColorStop(0, `rgba(255,180,50,${arr * 0.15})`);
      glow.addColorStop(1, `rgba(255,120,20,0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, r * 3, ry * 3, 0, 0, Math.PI * 2); ctx.fill();

      // Gold body with gradient
      const bodyGrad = ctx.createRadialGradient(c.x - r * 0.2, c.y - ry * 0.3, 0, c.x, c.y, r);
      bodyGrad.addColorStop(0, `rgba(255,230,150,${arr * 0.95})`);
      bodyGrad.addColorStop(0.5, `rgba(220,170,60,${arr * 0.9})`);
      bodyGrad.addColorStop(1, `rgba(180,120,30,${arr * 0.85})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.ellipse(c.x, c.y, r, ry, wobble * 0.5, 0, Math.PI * 2); ctx.fill();

      // Bright specular
      ctx.fillStyle = `rgba(255,250,220,${arr * 0.4})`;
      ctx.beginPath(); ctx.ellipse(c.x - r * 0.2, c.y - ry * 0.25, r * 0.3, ry * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "#ffcc44", "rgba(20,16,10,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 7 — "Particle Physics"
// Cells are subatomic particles with orbital rings. CERN / physics sim aesthetic.
// Clean, minimal, precise. Science as beauty.
// ======================================================================
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 707), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: clean dark
    ctx.fillStyle = "#08080c"; ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fo;

    // Connections: faint particle trails
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 5);
      ctx.strokeStyle = `rgba(150,200,255,${alpha * 0.12})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.setLineDash([2 * scale, 2 * scale]);
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Particles with orbital rings
    const particleColors = ["#60a0ff", "#ff6080", "#60ff90", "#ffaa40", "#c080ff"];
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 5);
      const r = c.rx * arr * 0.5;
      if (r < 0.3) continue;
      const col = particleColors[i % particleColors.length];

      // Orbital ring (tilted ellipse)
      if (r > 3 * scale) {
        const ringAngle = c.phase + frame * 0.01;
        ctx.strokeStyle = `${col}30`;
        ctx.lineWidth = 0.8 * scale;
        ctx.beginPath(); ctx.ellipse(c.x, c.y, r * 2.5, r * 0.8, ringAngle, 0, Math.PI * 2); ctx.stroke();

        // Orbiting electron dot
        const eAngle = frame * 0.06 + c.phase;
        const ex = c.x + Math.cos(eAngle) * r * 2.5 * Math.cos(ringAngle) - Math.sin(eAngle) * r * 0.8 * Math.sin(ringAngle);
        const ey = c.y + Math.cos(eAngle) * r * 2.5 * Math.sin(ringAngle) + Math.sin(eAngle) * r * 0.8 * Math.cos(ringAngle);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(ex, ey, 1.5 * scale, 0, Math.PI * 2); ctx.fill();
      }

      // Core particle
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 2);
      glow.addColorStop(0, `${col}30`); glow.addColorStop(1, `${col}00`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 2, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "rgba(150,200,255,0.8)", "rgba(8,8,12,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 8 — "Bioluminescent"
// Deep ocean. Cells are bioluminescent organisms pulsing in darkness.
// Organic, mysterious, alive. Teals and warm violets.
// ======================================================================
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 808), [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background: deep ocean
    const bg = ctx.createRadialGradient(width / 2, height * 0.6, 0, width / 2, height / 2, width * 0.7);
    bg.addColorStop(0, "#08152a"); bg.addColorStop(0.5, "#040e1a"); bg.addColorStop(1, "#020508");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fo;
    const bioColors: [number, number, number][] = [[170, 60, 55], [190, 50, 50], [280, 45, 55], [320, 40, 50], [140, 50, 50]];

    // Connections: bioluminescent filaments
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 5);
      const bc = bioColors[(a + b) % bioColors.length];
      const pulse = 0.5 + Math.sin(frame * 0.03 + a * 0.7) * 0.5;

      ctx.strokeStyle = `hsla(${bc[0]}, ${bc[1]}%, ${bc[2]}%, ${alpha * pulse * 0.2})`;
      ctx.lineWidth = 3 * scale; ctx.lineCap = "round";
      const mx = (ca.x + cb.x) / 2 + Math.sin(frame * 0.01 + a) * 8 * scale;
      const my = (ca.y + cb.y) / 2 + Math.cos(frame * 0.008 + b) * 6 * scale;
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.quadraticCurveTo(mx, my, cb.x, cb.y); ctx.stroke();
    }

    // Cells: pulsing bioluminescent orbs
    for (let i = 0; i < vis && i < tree.cells.length; i++) {
      const c = tree.cells[i];
      const age = vis - i;
      const arr = Math.min(1, age / 6);
      const r = c.rx * arr;
      if (r < 0.5) continue;
      const bc = bioColors[i % bioColors.length];
      const pulse = 0.6 + Math.sin(frame * 0.04 + c.phase) * 0.4;

      // Large soft glow
      const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 4);
      glow.addColorStop(0, `hsla(${bc[0]}, ${bc[1]}%, ${bc[2]}%, ${arr * pulse * 0.12})`);
      glow.addColorStop(0.5, `hsla(${bc[0]}, ${bc[1]}%, ${bc[2]}%, ${arr * pulse * 0.04})`);
      glow.addColorStop(1, `hsla(${bc[0]}, ${bc[1]}%, ${bc[2]}%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(c.x, c.y, r * 4, 0, Math.PI * 2); ctx.fill();

      // Body
      const bodyGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
      bodyGrad.addColorStop(0, `hsla(${bc[0]}, ${bc[1] + 10}%, ${Math.min(85, bc[2] + 25)}%, ${arr * pulse})`);
      bodyGrad.addColorStop(0.7, `hsla(${bc[0]}, ${bc[1]}%, ${bc[2]}%, ${arr * pulse * 0.7})`);
      bodyGrad.addColorStop(1, `hsla(${bc[0]}, ${bc[1]}%, ${bc[2] - 10}%, ${arr * pulse * 0.3})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "rgba(100,220,200,0.8)", "rgba(4,14,26,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// VARIANT 9 — "Cellular Cute" (our original theme, refined)
// Dark violet background. Blob cells with eyes, thick outlines, drop shadows.
// The Kurzgesagt-inspired original — but now with proper illustration quality.
// ======================================================================
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const tree = useMemo(() => buildTree(width / 2, height / 2, scale, 909), [width, height, scale]);
  const motes = useMemo(() => {
    const rand = seeded(999);
    return Array.from({ length: 35 }, () => ({
      x: rand() * width, y: rand() * height, r: (0.8 + rand() * 2) * scale,
      speed: 0.1 + rand() * 0.3, phase: rand() * Math.PI * 2,
      hue: [45, 180, 280, 350][Math.floor(rand() * 4)],
    }));
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const fo = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const vis = growthVis(frame, tree.cells.length);

    // Background
    const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
    bg.addColorStop(0, "#2e2045"); bg.addColorStop(0.5, "#1e1535"); bg.addColorStop(1, "#110c20");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    // Motes
    for (const m of motes) {
      const px = m.x + Math.sin(frame * 0.015 * m.speed + m.phase) * 10 * scale;
      const py = m.y + Math.cos(frame * 0.012 * m.speed + m.phase * 1.3) * 8 * scale;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.03 + m.phase));
      ctx.fillStyle = `hsla(${m.hue}, 50%, 70%, ${tw * 0.15})`;
      ctx.beginPath(); ctx.arc(px, py, m.r * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(${m.hue}, 55%, 75%, ${tw * 0.4})`;
      ctx.beginPath(); ctx.arc(px, py, m.r, 0, Math.PI * 2); ctx.fill();
    }

    ctx.globalAlpha = fo;
    const cellHues = [350, 25, 55, 140, 180, 220, 280, 310];

    // Use the kurz.ts illustration engine
    const { drawKurzBlob, drawKurzEyes, drawKurzConnection, drawKurzGlow } = require("../../kurz");

    // Connections
    for (const [a, b] of tree.edges) {
      if (a >= vis || b >= vis) continue;
      const ca = tree.cells[a], cb = tree.cells[b];
      const age = vis - Math.max(a, b);
      const alpha = Math.min(1, age / 4);
      const avgHue = cellHues[(a + b) % cellHues.length];
      drawKurzConnection(ctx, ca.x, ca.y, cb.x, cb.y, 3 * scale, avgHue, 45, 50, alpha * fo, frame * 0.02 + a * 0.7);
    }

    // Sort back-to-front by generation
    const order = Array.from({ length: Math.min(vis, tree.cells.length) }, (_, i) => i);
    order.sort((a, b) => tree.cells[b].gen - tree.cells[a].gen);

    for (const i of order) {
      const c = tree.cells[i];
      const age = vis - i;
      if (age <= 0) continue;
      const raw = Math.min(1, age / 6);
      const arr = raw < 0.6 ? (raw / 0.6) * 1.12 : raw < 0.85 ? 1.12 - ((raw - 0.6) / 0.25) * 0.12 : 1;
      const wobble = Math.sin(frame * 0.025 + c.phase) * 0.05;
      const rx = c.rx * arr * (1 + wobble);
      const ry = c.ry * arr * (1 - wobble * 0.3);
      if (rx < 1) continue;

      const hue = cellHues[i % cellHues.length];
      const outW = Math.max(1, (3 - c.gen * 0.4)) * scale;
      const style = { hue, sat: 55, lit: 58, outlineWidth: outW, outlineColor: `hsla(${hue}, 55%, 25%, 0.65)` };

      drawKurzGlow(ctx, c.x, c.y, rx, ry, hue, 55, 58, 0.08 * arr);
      drawKurzBlob(ctx, c.x, c.y, rx, ry, style, fo * arr, c.seed);
      if (c.gen <= 2 && rx > 8 * scale && arr > 0.7) {
        drawKurzEyes(ctx, c.x, c.y, rx, ry, fo * arr, outW * 0.7, style.outlineColor);
      }
    }

    ctx.globalAlpha = 1;
    drawYearCounter(ctx, frame, width, height, scale, "hsla(40,60%,75%,0.9)", "rgba(20,15,30,0.5)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// Export all 9 variants
// ======================================================================
export const VARIANTS_HOOK_001: VariantDef[] = [
  { id: "neon-circuit", label: "Neon Circuit", component: V1 },
  { id: "watercolor-bloom", label: "Watercolor Bloom", component: V2 },
  { id: "data-forge", label: "Data Forge", component: V3 },
  { id: "constellation", label: "Constellation", component: V4 },
  { id: "iso-blueprint", label: "Isometric Blueprint", component: V5 },
  { id: "molten-gold", label: "Molten Gold", component: V6 },
  { id: "particle-physics", label: "Particle Physics", component: V7 },
  { id: "bioluminescent", label: "Bioluminescent", component: V8 },
  { id: "cellular-cute", label: "Cellular Cute", component: V9 },
];
