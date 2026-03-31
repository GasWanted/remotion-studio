// Shot 022 — "Next, a team at Eon Systems took that wiring diagram and turned it into a digital simulation."
// Duration: 150 frames (5s at 30fps)
// CONCEPT: Physical wiring diagram transforms into a digital simulation — analog to digital conversion
// 9 genuinely different visual metaphors

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  drawFBCounter, fadeInOut, stagger, cellHSL, drawFBColorEdge,
  drawFBArrow,
} from "./flatbold-kit";

const DUR = 150;

/* ── V1: Physical diagram morphs to digital — wiggly lines become clean grid ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    const morphT = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ease = morphT * morphT * (3 - 2 * morphT);
    // Node positions: wiggly organic → clean grid
    const rng = seeded(2200);
    const gridSize = 4;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = r * gridSize + c;
        // Organic position
        const ox = cx + (rng() - 0.5) * w * 0.65;
        const oy = cy + (rng() - 0.5) * h * 0.55;
        // Grid position
        const gx = cx - (gridSize - 1) * 20 * sc / 2 + c * 20 * sc;
        const gy = cy - (gridSize - 1) * 20 * sc / 2 + r * 20 * sc;
        const nx = ox + (gx - ox) * ease;
        const ny = oy + (gy - oy) * ease;
        const colorIdx = ease > 0.5 ? idx % 8 : 7;
        drawFBNode(ctx, nx, ny, (3 + ease * 2) * sc, colorIdx, a * 0.7, frame);
      }
    }
    // Wiggly edges morph to straight edges
    const rng2 = seeded(2201);
    for (let i = 0; i < 8; i++) {
      const from = Math.floor(rng2() * gridSize * gridSize);
      const to = Math.floor(rng2() * gridSize * gridSize);
      if (from === to) continue;
      const r1 = Math.floor(from / gridSize), c1 = from % gridSize;
      const r2 = Math.floor(to / gridSize), c2 = to % gridSize;
      const rng3 = seeded(2200);
      // Recalculate positions
      const positions: { x: number; y: number }[] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const ox = cx + (rng3() - 0.5) * w * 0.65;
          const oy = cy + (rng3() - 0.5) * h * 0.55;
          const gx = cx - (gridSize - 1) * 20 * sc / 2 + c * 20 * sc;
          const gy = cy - (gridSize - 1) * 20 * sc / 2 + r * 20 * sc;
          positions.push({ x: ox + (gx - ox) * ease, y: oy + (gy - oy) * ease });
        }
      }
      const color = ease > 0.5 ? FB.teal : FB.text.dim;
      drawFBColorEdge(ctx, positions[from].x, positions[from].y, positions[to].x, positions[to].y, color, sc, a * 0.3);
    }
    // Labels
    const labelA = ease < 0.5 ? 1 - ease * 2 : 0;
    const labelB = ease > 0.5 ? (ease - 0.5) * 2 : 0;
    drawFBText(ctx, "WIRING DIAGRAM", cx, h * 0.9, 10 * sc, a * labelA, "center", FB.text.dim);
    drawFBText(ctx, "DIGITAL SIMULATION", cx, h * 0.9, 10 * sc, a * labelB, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Brain enters computer — brain outline on left, monitor on right, data flows between ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;
    // Left: brain outline
    const brainCx = w * 0.22, brainCy = cy;
    const brainT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * brainT * 0.4;
    ctx.strokeStyle = FB.purple; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
      const r = (30 + Math.sin(t * 5) * 5 + Math.sin(t * 3) * 4) * sc;
      const x = brainCx + Math.cos(t) * r;
      const y = brainCy + Math.sin(t) * r * 0.65;
      t < 0.01 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 1;
    // Network dots inside brain
    const rng = seeded(2210);
    for (let i = 0; i < 8; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * 22 * sc;
      drawFBNode(ctx, brainCx + Math.cos(angle) * dist, brainCy + Math.sin(angle) * dist * 0.65, 3 * sc, i, a * brainT * 0.4, frame);
    }
    // Right: monitor/screen
    const monCx = w * 0.78, monW = 50 * sc, monH = 38 * sc;
    const monT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * monT * 0.6;
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.strokeRect(monCx - monW / 2, cy - monH / 2, monW, monH);
    // Stand
    ctx.fillStyle = FB.teal;
    ctx.fillRect(monCx - 3 * sc, cy + monH / 2, 6 * sc, 8 * sc);
    ctx.fillRect(monCx - 10 * sc, cy + monH / 2 + 8 * sc, 20 * sc, 2 * sc);
    ctx.globalAlpha = 1;
    // Screen content: clean grid appears
    if (monT > 0.5) {
      const gridT = (monT - 0.5) * 2;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const gx = monCx - 14 * sc + c * 14 * sc;
          const gy = cy - 10 * sc + r * 10 * sc;
          drawFBNode(ctx, gx, gy, 2 * sc, r * 3 + c, a * gridT * 0.6, frame);
        }
      }
    }
    // Data flow: dots travel from brain to monitor
    const flowT = interpolate(frame, [40, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let d = 0; d < 10; d++) {
      const dotPhase = (flowT * 3 + d * 0.1) % 1;
      const dx = brainCx + 35 * sc + dotPhase * (monCx - monW / 2 - brainCx - 45 * sc);
      const dy = cy + Math.sin(dotPhase * Math.PI * 2 + d) * 8 * sc;
      const [hue] = cellHSL(d % 8);
      ctx.globalAlpha = a * Math.sin(dotPhase * Math.PI) * 0.5;
      ctx.fillStyle = `hsla(${hue}, 55%, 65%, 0.8)`;
      ctx.beginPath(); ctx.arc(dx, dy, 2 * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawFBText(ctx, "EON SYSTEMS", w / 2, h * 0.08, 10 * sc, a, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Analog signals become digital — wavy line transforms to stepped square wave ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    const morphT = interpolate(frame, [25, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Draw waveform that morphs from smooth to stepped
    ctx.globalAlpha = a * 0.8;
    const waveColor = morphT < 0.5 ? FB.purple : FB.teal;
    ctx.strokeStyle = waveColor; ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = w * 0.08 + t * w * 0.84;
      // Smooth wave
      const smoothY = cy + Math.sin(t * Math.PI * 4 + frame * 0.02) * h * 0.15;
      // Stepped wave
      const stepVal = Math.round(Math.sin(t * Math.PI * 4 + frame * 0.02) * 4) / 4;
      const steppedY = cy + stepVal * h * 0.15;
      const y = smoothY + (steppedY - smoothY) * morphT;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Labels
    const analogA = 1 - morphT;
    const digitalA = morphT;
    drawFBText(ctx, "ANALOG", w * 0.15, h * 0.12, 10 * sc, a * analogA, "center", FB.purple);
    drawFBText(ctx, "DIGITAL", w * 0.85, h * 0.12, 10 * sc, a * digitalA, "center", FB.teal);
    // Binary underneath when digital
    if (morphT > 0.5) {
      const binA = (morphT - 0.5) * 2;
      const rng = seeded(2230);
      for (let i = 0; i < 24; i++) {
        const bx = w * 0.08 + (i / 24) * w * 0.84;
        drawFBText(ctx, rng() > 0.5 ? "1" : "0", bx, h * 0.78, 7 * sc, a * binA * 0.3, "center", FB.teal);
      }
    }
    drawFBText(ctx, "WIRING \u2192 SIMULATION", cx, h * 0.92, 10 * sc, a, "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Code terminal — connectome data loading into a Python/PyTorch session ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    // Terminal window
    const tX = w * 0.06, tY = h * 0.06;
    const tW = w * 0.88, tH = h * 0.82;
    ctx.globalAlpha = a * 0.1;
    ctx.fillStyle = "#0a0a18";
    ctx.fillRect(tX, tY, tW, tH);
    ctx.globalAlpha = a;
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * sc;
    ctx.strokeRect(tX, tY, tW, tH);
    // Title bar
    ctx.globalAlpha = a * 0.2;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(tX, tY, tW, 12 * sc);
    ctx.globalAlpha = a;
    // Traffic lights
    [FB.red, FB.gold, FB.green].forEach((c, i) => {
      ctx.fillStyle = c; ctx.globalAlpha = a * 0.5;
      ctx.beginPath(); ctx.arc(tX + 7 * sc + i * 8 * sc, tY + 6 * sc, 2 * sc, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // Code lines
    const lines = [
      { text: ">>> import torch", color: FB.blue },
      { text: ">>> W = load_connectome()", color: FB.teal },
      { text: "Loading 139,255 neurons...", color: FB.text.dim },
      { text: "Loading 54M synapses...", color: FB.text.dim },
      { text: ">>> model = LIFNetwork(W)", color: FB.teal },
      { text: ">>> model.to('cuda')", color: FB.purple },
      { text: ">>> sim = model.run(1000)", color: FB.gold },
      { text: "Simulating 1000 timesteps...", color: FB.text.dim },
      { text: "[=========>         ] 47%", color: FB.green },
    ];
    const lineH = (tH - 18 * sc) / (lines.length + 1);
    lines.forEach((line, i) => {
      const lineT = stagger(frame, i, 8, 12);
      const ly = tY + 18 * sc + (i + 0.5) * lineH;
      drawFBText(ctx, line.text, tX + 6 * sc, ly, 7.5 * sc, a * lineT, "left", line.color);
    });
    // Cursor blink at end
    const lastLine = Math.min(lines.length - 1, Math.floor(frame / 8));
    if (Math.floor(frame / 10) % 2 === 0) {
      const curY = tY + 18 * sc + (lastLine + 0.5) * lineH;
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.text.primary;
      ctx.fillRect(tX + 6 * sc + lines[lastLine].text.length * 4.5 * sc + 3 * sc, curY - 4 * sc, 1.5 * sc, 8 * sc);
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Network digitize sweep — vertical line sweeps left to right, transforming organic to digital ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h * 0.45;
    const sweepT = interpolate(frame, [20, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sweepX = w * sweepT;
    // Nodes — organic on right of sweep, digital on left
    const rng = seeded(2250);
    for (let i = 0; i < 14; i++) {
      const nx = w * 0.05 + rng() * w * 0.9;
      const ny = cy + (rng() - 0.5) * h * 0.6;
      const isDigitized = nx < sweepX;
      if (isDigitized) {
        // Snap to grid
        const gridX = Math.round(nx / (20 * sc)) * 20 * sc;
        const gridY = Math.round(ny / (20 * sc)) * 20 * sc;
        drawFBNode(ctx, gridX, gridY, 4 * sc, i % 8, a * 0.7, frame);
      } else {
        drawFBNode(ctx, nx, ny, 3 * sc, 7, a * 0.3, frame);
      }
    }
    // Sweep line
    if (sweepT > 0 && sweepT < 1) {
      ctx.globalAlpha = a * 0.5;
      ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * sc;
      ctx.setLineDash([4 * sc, 4 * sc]);
      ctx.beginPath(); ctx.moveTo(sweepX, h * 0.05); ctx.lineTo(sweepX, h * 0.85); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
    // Labels
    drawFBText(ctx, "DIGITAL", w * 0.15, h * 0.92, 9 * sc, a * sweepT, "center", FB.teal);
    drawFBText(ctx, "WIRING", w * 0.85, h * 0.92, 9 * sc, a * (1 - sweepT), "center", FB.text.dim);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Weight matrix appears — network connections become a sparse matrix grid ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;
    const morphT = interpolate(frame, [25, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Network positions (fade out) → matrix positions (fade in)
    const size = 6;
    const cellW = w * 0.06, cellH = h * 0.07;
    const matOx = cx - (size * cellW) / 2;
    const matOy = cy - (size * cellH) / 2;
    const rng = seeded(2260);
    const netNodes: { x: number; y: number }[] = [];
    for (let i = 0; i < size; i++) {
      netNodes.push({
        x: cx + (rng() - 0.5) * w * 0.6,
        y: cy + (rng() - 0.5) * h * 0.5,
      });
    }
    // Morphing nodes from network to row headers
    for (let i = 0; i < size; i++) {
      const nx = netNodes[i].x * (1 - morphT) + (matOx - 8 * sc) * morphT;
      const ny = netNodes[i].y * (1 - morphT) + (matOy + i * cellH + cellH / 2) * morphT;
      drawFBNode(ctx, nx, ny, (3 - morphT) * sc, i, a * 0.7, frame);
    }
    // Network edges (fade out)
    if (morphT < 0.7) {
      for (let i = 0; i < size - 1; i++) {
        drawFBEdge(ctx, netNodes[i].x, netNodes[i].y, netNodes[i + 1].x, netNodes[i + 1].y, sc, a * (1 - morphT) * 0.3, frame, 220, 220);
      }
    }
    // Matrix (fade in)
    if (morphT > 0.3) {
      const matA = (morphT - 0.3) / 0.7;
      const valRng = seeded(2261);
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const mx = matOx + c * cellW;
          const my = matOy + r * cellH;
          ctx.globalAlpha = a * matA * 0.12;
          ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 0.5 * sc;
          ctx.strokeRect(mx, my, cellW, cellH);
          const val = (valRng() * 2 - 1).toFixed(1);
          const nonZero = Math.abs(parseFloat(val)) > 0.3;
          drawFBText(ctx, val, mx + cellW / 2, my + cellH / 2, 6 * sc, a * matA * (nonZero ? 0.7 : 0.2), "center", nonZero ? FB.teal : FB.text.dim);
        }
      }
    }
    ctx.globalAlpha = 1;
    const label = morphT < 0.5 ? "WIRING DIAGRAM" : "WEIGHT MATRIX";
    drawFBText(ctx, label, cx, h * 0.92, 10 * sc, a, "center", morphT < 0.5 ? FB.purple : FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Power-on sequence — boot text loads connectome, simulation starts ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.35;
    // Power symbol ring
    const powerT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const onT = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * powerT;
    ctx.strokeStyle = onT > 0.5 ? FB.green : FB.text.dim;
    ctx.lineWidth = 3 * sc;
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * sc, -Math.PI * 0.7 + onT * Math.PI * 2, -Math.PI * 0.7 + Math.PI * 2);
    ctx.stroke();
    // Power line
    ctx.beginPath(); ctx.moveTo(cx, cy - 18 * sc); ctx.lineTo(cx, cy - 8 * sc); ctx.stroke();
    ctx.globalAlpha = 1;
    // Boot sequence text
    const bootStart = 55;
    const bootLines = [
      { text: "LOADING CONNECTOME...", color: FB.teal, delay: 0 },
      { text: "139,255 NEURONS", color: FB.green, delay: 12 },
      { text: "54M SYNAPSES", color: FB.green, delay: 22 },
      { text: "BUILDING LIF MODEL...", color: FB.teal, delay: 35 },
      { text: "SIMULATION READY", color: FB.gold, delay: 55 },
    ];
    bootLines.forEach((line, i) => {
      const lineFrame = frame - bootStart - line.delay;
      if (lineFrame < 0) return;
      const t = Math.min(1, lineFrame / 10);
      const ly = h * 0.55 + i * h * 0.07;
      drawFBText(ctx, line.text, cx, ly, 8 * sc, a * t, "center", line.color);
      // Check mark after loaded
      if (lineFrame > 12 && line.color === FB.green) {
        drawFBText(ctx, "\u2713", cx + 65 * sc, ly, 9 * sc, a * 0.6, "center", FB.green);
      }
    });
    // Final RUN
    const runT = interpolate(frame, [130, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (runT > 0) {
      drawFBText(ctx, "\u25B6 RUN", cx, h * 0.94, 13 * sc, a * runT, "center", FB.green);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Split screen — left is biological wiring (hand-drawn style), right is digital clone ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;
    // Divider line
    ctx.globalAlpha = a * 0.2;
    ctx.fillStyle = FB.text.dim;
    ctx.fillRect(w / 2 - 0.5 * sc, h * 0.08, 1 * sc, h * 0.78);
    ctx.globalAlpha = 1;
    // Left: biological wiring (wiggly, organic)
    const leftT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2280);
    for (let i = 0; i < 7; i++) {
      const nx = w * 0.05 + rng() * w * 0.38;
      const ny = h * 0.15 + rng() * h * 0.65;
      const t = stagger(frame, i, 3, 12);
      drawFBNode(ctx, nx, ny, 4 * sc, 5, a * t * 0.5, frame);
      // Wiggly line to next
      if (i > 0) {
        const pnx = w * 0.05 + rng() * w * 0.38;
        const pny = h * 0.15 + rng() * h * 0.65;
        drawFBEdge(ctx, nx, ny, pnx, pny, sc, a * t * 0.2, frame, 280, 280);
      } else { rng(); rng(); }
    }
    drawFBText(ctx, "BIOLOGICAL", w * 0.24, h * 0.06, 9 * sc, a * leftT, "center", FB.purple);
    // Right: digital mirror (clean, same layout)
    const rightT = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng2 = seeded(2280);
    for (let i = 0; i < 7; i++) {
      const nx = w - (w * 0.05 + rng2() * w * 0.38);
      const ny = h * 0.15 + rng2() * h * 0.65;
      const t = stagger(frame - 50, i, 4, 12);
      drawFBNode(ctx, nx, ny, 4 * sc, 4, a * t * rightT * 0.6, frame);
      if (i > 0) {
        const pnx = w - (w * 0.05 + rng2() * w * 0.38);
        const pny = h * 0.15 + rng2() * h * 0.65;
        drawFBColorEdge(ctx, nx, ny, pnx, pny, FB.teal, sc, a * t * rightT * 0.3);
      } else { rng2(); rng2(); }
    }
    drawFBText(ctx, "DIGITAL", w * 0.76, h * 0.06, 9 * sc, a * rightT, "center", FB.teal);
    // Equals sign appears
    const eqT = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", w / 2, cy, 20 * sc, a * eqT, "center", FB.gold);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Eon Systems logo + transformation arrow — company name with conversion visual ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.35;
    // Circuit traces in background
    const rng = seeded(2290);
    for (let i = 0; i < 12; i++) {
      const x1 = rng() * w, y1 = rng() * h;
      const x2 = x1 + (rng() - 0.5) * w * 0.3;
      ctx.globalAlpha = a * 0.08;
      ctx.strokeStyle = FB.teal; ctx.lineWidth = 0.8 * sc;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + (rng() - 0.5) * h * 0.15);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // "EON SYSTEMS" text
    const nameT = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EON SYSTEMS", cx, cy, 18 * sc, a * nameT, "center", FB.teal);
    // Underline trace
    if (nameT > 0.5) {
      const lineT = (nameT - 0.5) * 2;
      ctx.globalAlpha = a * lineT;
      ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * sc;
      ctx.beginPath();
      ctx.moveTo(cx - 60 * sc, cy + 12 * sc);
      ctx.lineTo(cx - 60 * sc + 120 * sc * lineT, cy + 12 * sc);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Transformation visual below
    const transT = interpolate(frame, [50, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Left: wiring icon
    const leftX = w * 0.2, iconY = h * 0.65;
    const rng2 = seeded(2291);
    for (let i = 0; i < 5; i++) {
      const nx = leftX + (rng2() - 0.5) * 40 * sc;
      const ny = iconY + (rng2() - 0.5) * 30 * sc;
      drawFBNode(ctx, nx, ny, 3 * sc, 7, a * transT * 0.4, frame);
    }
    drawFBText(ctx, "WIRING", leftX, iconY + 28 * sc, 8 * sc, a * transT * 0.5, "center", FB.text.dim);
    // Arrow
    const arrowT = interpolate(frame, [65, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBArrow(ctx, w * 0.38, iconY, w * 0.62, iconY, FB.gold, sc * 1.5, a * arrowT);
    // Right: simulation icon
    const rightX = w * 0.8;
    const simT = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const gx = rightX - 12 * sc + c * 12 * sc;
        const gy = iconY - 12 * sc + r * 12 * sc;
        drawFBNode(ctx, gx, gy, 3 * sc, r * 3 + c, a * simT * 0.6, frame);
      }
    }
    drawFBText(ctx, "SIMULATION", rightX, iconY + 28 * sc, 8 * sc, a * simT * 0.5, "center", FB.teal);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_022: VariantDef[] = [
  { id: "fb022-v1", label: "Organic to Grid Morph", component: V1 },
  { id: "fb022-v2", label: "Brain Enters Computer", component: V2 },
  { id: "fb022-v3", label: "Analog to Digital Wave", component: V3 },
  { id: "fb022-v4", label: "Code Terminal Session", component: V4 },
  { id: "fb022-v5", label: "Digitize Sweep Line", component: V5 },
  { id: "fb022-v6", label: "Network to Weight Matrix", component: V6 },
  { id: "fb022-v7", label: "Power-On Boot Sequence", component: V7 },
  { id: "fb022-v8", label: "Bio vs Digital Split", component: V8 },
  { id: "fb022-v9", label: "Eon Systems + Transform", component: V9 },
];
