import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 045 — "They turned it on and fed it a signal — the neurons that detect sugar in a real fly."
// 9 variants — power-on, dormant grid waking up, sugar cluster glowing orange (DUR=120)

const DUR = 120;

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4501);
    return Array.from({ length: 60 }, () => ({ x: rng() * width * 0.8 + width * 0.1, y: rng() * height * 0.7 + height * 0.15 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const powerOn = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Grid of dormant nodes waking up
    for (let i = 0; i < 60; i++) {
      const wakeT = interpolate(frame, [25 + i * 0.5, 35 + i * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (wakeT > 0) drawNode(ctx, positions[i].x, positions[i].y, 2.5 * s, i % 2, a * wakeT * 0.5);
      else drawNodeDormant(ctx, positions[i].x, positions[i].y, 3 * s, a * powerOn);
    }
    // Sugar cluster (orange, top-left)
    const sugarA = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sugarA > 0) {
      for (let i = 0; i < 5; i++) {
        const sx = width * 0.2 + (i % 3) * 12 * s;
        const sy = height * 0.25 + Math.floor(i / 3) * 12 * s;
        drawNodeGradient(ctx, sx, sy, 5 * s * sugarA, 1, a);
      }
      ctx.globalAlpha = a * sugarA;
      ctx.fillStyle = C.orange; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("sugar signal", width * 0.2, height * 0.2);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    drawHeader(ctx, width, height, s, frame, DUR, "Power On + Sugar Input");
    // Power button animation
    const powerOn = stagger(frame, 0, 5, 15);
    ctx.strokeStyle = accent(0, a * powerOn); ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.arc(cx, cy - 15 * s, 15 * s, Math.PI * 0.3, Math.PI * 2.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - 30 * s); ctx.lineTo(cx, cy - 15 * s); ctx.stroke();
    // Sugar nodes appearing
    const sugarA = staggerRaw(frame, 0, 35, 20);
    for (let i = 0; i < 4; i++) {
      const sa = stagger(frame, i + 3, 5, 8);
      const sx = cx - 30 * s + i * 20 * s;
      drawNodeGradient(ctx, sx, cy + 25 * s, 5 * s * sa * sugarA, 1, a);
    }
    ctx.globalAlpha = a * sugarA;
    ctx.fillStyle = C.orange; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("sugar neurons", cx, cy + 45 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const positions = useMemo(() => {
    const rng = seeded(4533);
    return Array.from({ length: 40 }, () => ({ x: rng() * width * 0.8 + width * 0.1, y: rng() * height * 0.7 + height * 0.15 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    // All dormant, then wave of activation from sugar input
    const waveCenter = interpolate(frame, [30, 90], [0, width], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 40; i++) {
      const dist = Math.abs(positions[i].x - waveCenter);
      const active = dist < 40 * s;
      if (active && frame > 30) drawNode(ctx, positions[i].x, positions[i].y, 3 * s, i < 5 ? 1 : i % 2, a * 0.7);
      else drawNodeDormant(ctx, positions[i].x, positions[i].y, 3 * s, a * 0.4);
    }
    // Sugar label at wave front
    if (frame > 30) {
      ctx.fillStyle = C.orange; ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("sugar", Math.min(waveCenter, width * 0.85), height * 0.12);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    // Fly outline with sugar receptor highlighted
    const flyA = staggerRaw(frame, 0, 5, 20);
    drawFlyOutline(ctx, cx, cy, 70 * s, a * flyA);
    // Sugar receptors on head (proboscis area)
    const sugarA = staggerRaw(frame, 0, 40, 20);
    if (sugarA > 0) {
      for (let i = 0; i < 3; i++) {
        const rx = cx + (i - 1) * 8 * s;
        const ry = cy - 70 * s * 0.32 - 8 * s;
        drawNodeGradient(ctx, rx, ry, 4 * s * sugarA, 1, a);
      }
      ctx.globalAlpha = a * sugarA;
      ctx.fillStyle = C.orange; ctx.font = `600 ${7 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("sugar detectors", cx, cy - 70 * s * 0.32 - 20 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    // Switch from OFF to ON
    const switchOn = frame > 25;
    // Switch UI
    const sw = 40 * s, sh = 20 * s;
    ctx.strokeStyle = accent(0, a * 0.4); ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.roundRect(cx - sw / 2, cy - 30 * s - sh / 2, sw, sh, sh / 2);
    ctx.stroke();
    const knobX = switchOn ? cx + sw / 4 : cx - sw / 4;
    ctx.fillStyle = switchOn ? C.blue : C.gray;
    ctx.beginPath(); ctx.arc(knobX, cy - 30 * s, sh * 0.35, 0, Math.PI * 2); ctx.fill();
    // Sugar signal appears after switch
    if (switchOn) {
      const sigA = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < 5; i++) {
        const sa = stagger(frame, i, 4, 8);
        const sx = cx - 20 * s + i * 10 * s;
        drawNodeGradient(ctx, sx, cy + 15 * s, 5 * s * sa * sigA, 1, a);
      }
      ctx.globalAlpha = a * sigA;
      ctx.fillStyle = C.orange; ctx.font = `600 ${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("sugar signal", cx, cy + 40 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const grid = useMemo(() => {
    const rng = seeded(4566);
    return Array.from({ length: 80 }, () => ({ x: rng() * width, y: rng() * height }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    // Dark dormant grid -> rapid activation
    const activateT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 80; i++) {
      const active = i < 80 * activateT;
      if (active) drawNode(ctx, grid[i].x, grid[i].y, 2 * s, i % 2, a * 0.4);
      else drawNodeDormant(ctx, grid[i].x, grid[i].y, 2.5 * s, a * 0.2);
    }
    // Sugar cluster highlight
    const sugarA = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sugarA > 0) {
      for (let i = 0; i < 6; i++) {
        const glow = 1 + Math.sin(frame * 0.12 + i) * 0.2;
        drawNodeGradient(ctx, grid[i].x, grid[i].y, 4 * s * glow, 1, a * sugarA);
      }
    }
    drawCounter(ctx, width, height, s, `${Math.floor(activateT * 138639).toLocaleString()}`, "active");
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    // Panel: simulation panel with status
    drawPanel(ctx, width * 0.1, height * 0.15, width * 0.8, height * 0.7, 0, a * 0.3);
    // Status: OFF -> ON
    const onA = staggerRaw(frame, 0, 15, 10);
    ctx.fillStyle = onA > 0.5 ? C.green : C.red;
    ctx.beginPath(); ctx.arc(width * 0.18, height * 0.22, 4 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.text; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText(onA > 0.5 ? "RUNNING" : "OFF", width * 0.22, height * 0.23);
    // Sugar input indicator
    const sugarA = staggerRaw(frame, 0, 35, 15);
    ctx.globalAlpha = a * sugarA;
    ctx.fillStyle = C.orange; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("Input: Sugar neurons", cx, cy - 15 * s);
    ctx.globalAlpha = a;
    // Signal dots
    for (let i = 0; i < 5; i++) {
      const sa = stagger(frame, i + 3, 6, 8);
      drawNodeGradient(ctx, cx - 30 * s + i * 15 * s, cy + 10 * s, 5 * s * sa * sugarA, 1, a);
    }
    // Pulse animation
    const pulseA = sugarA > 0.5 ? Math.sin(frame * 0.15) * 0.3 + 0.7 : 0;
    for (let i = 0; i < 5; i++) {
      drawEdge(ctx, cx - 30 * s + i * 15 * s, cy + 10 * s, cx - 15 * s + i * 15 * s, cy + 30 * s, 1, a * pulseA * 0.3, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    const cx = width / 2, cy = height / 2;
    // Sugar molecule icon (hexagon) feeding into network
    const sugarA = stagger(frame, 0, 5, 15);
    // Hexagon
    ctx.strokeStyle = accent(1, a * sugarA); ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const hx = cx - 60 * s + Math.cos(ang) * 12 * s;
      const hy = cy + Math.sin(ang) * 12 * s;
      i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
    }
    ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = a * sugarA;
    ctx.fillStyle = C.orange; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("sugar", cx - 60 * s, cy + 25 * s);
    ctx.globalAlpha = a;
    // Arrow to network
    drawEdge(ctx, cx - 45 * s, cy, cx - 20 * s, cy, 1, a * 0.4, s);
    // Network responding
    const netA = staggerRaw(frame, 0, 30, 20);
    const netNodes = [{ x: cx - 10 * s, y: cy }, { x: cx + 15 * s, y: cy - 15 * s }, { x: cx + 15 * s, y: cy + 15 * s }, { x: cx + 40 * s, y: cy }];
    for (let i = 0; i < 4; i++) {
      drawNode(ctx, netNodes[i].x, netNodes[i].y, 4 * s * netA, i === 0 ? 1 : 0, a);
      if (i < 3) drawEdge(ctx, netNodes[i].x, netNodes[i].y, netNodes[i + 1].x, netNodes[i + 1].y, 0, a * netA * 0.2, s);
    }
    // Signal propagation
    if (netA > 0.5) {
      const pt = ((frame - 50) % 30) / 30;
      if (frame > 50) drawSignalPulse(ctx, netNodes[0].x, netNodes[0].y, netNodes[3].x, netNodes[3].y, pt, 1, s);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const grid = useMemo(() => {
    const rng = seeded(4599);
    return Array.from({ length: 50 }, () => ({ x: rng() * width * 0.8 + width * 0.1, y: rng() * height * 0.7 + height * 0.15 }));
  }, [width, height]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height, s);
    const a = fadeInOut(frame, DUR);
    ctx.globalAlpha = a;
    // Ripple activation from sugar point
    const sugarX = width * 0.2, sugarY = height * 0.3;
    const rippleR = interpolate(frame, [25, 90], [0, 200 * s], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 50; i++) {
      const dist = Math.hypot(grid[i].x - sugarX, grid[i].y - sugarY);
      if (dist < rippleR && frame > 25) {
        const intensity = 1 - dist / (200 * s);
        drawNode(ctx, grid[i].x, grid[i].y, 3 * s, i < 5 ? 1 : i % 2, a * intensity * 0.7);
      } else {
        drawNodeDormant(ctx, grid[i].x, grid[i].y, 3 * s, a * 0.25);
      }
    }
    // Sugar source
    const pulse = 1 + Math.sin(frame * 0.12) * 0.2;
    drawNodeGradient(ctx, sugarX, sugarY, 8 * s * pulse, 1, a);
    ctx.fillStyle = C.orange; ctx.font = `600 ${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("sugar", sugarX, sugarY - 15 * s);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={ref} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_045: VariantDef[] = [
  { id: "045-dormant-wake", label: "Dormant grid waking up", component: V1 },
  { id: "045-power-on", label: "Power on + sugar input", component: V2 },
  { id: "045-wave-activate", label: "Wave activation from sugar", component: V3 },
  { id: "045-fly-sugar", label: "Fly outline sugar receptors", component: V4 },
  { id: "045-switch-on", label: "Switch toggle with signal", component: V5 },
  { id: "045-rapid-activate", label: "Rapid grid activation", component: V6 },
  { id: "045-sim-panel", label: "Simulation panel status", component: V7 },
  { id: "045-sugar-molecule", label: "Sugar molecule to network", component: V8 },
  { id: "045-ripple-spread", label: "Ripple spreading from sugar", component: V9 },
];
