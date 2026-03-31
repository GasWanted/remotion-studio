import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawFlyTop, drawPowerButton } from "../icons";

// Shot 45 — "They turned it on and fed it a signal — the neurons that detect sugar in a real fly."
// 120 frames (4s). Spike raster activates, sugar input neurons light up on one side.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Power button press -> raster/grid of neurons lights up, sugar neurons on left glow amber
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Power button
    const powerFade = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const powerX = width * 0.12, powerY = height * 0.2;
    if (powerFade > 0) {
      ctx.globalAlpha = alpha * powerFade;
      const glow = frame > 18 ? "hsla(140, 70%, 60%, 0.8)" : "hsla(0, 0%, 50%, 0.5)";
      drawPowerButton(ctx, powerX, powerY, 20 * s, glow);
      ctx.globalAlpha = alpha;
    }
    // Neuron grid
    const gridOn = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cols = 12, rows = 8;
    const gx = width * 0.2, gy = height * 0.15;
    const gw = width * 0.72, gh = height * 0.65;
    const rand = seeded(45001);
    const sugarCols = 3; // leftmost columns are sugar neurons
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const nx = gx + (c / (cols - 1)) * gw;
      const ny = gy + (r / (rows - 1)) * gh;
      const isSugar = c < sugarCols;
      const delay = isSugar ? 0 : (c - sugarCols) * 3;
      const nodeAlpha = interpolate(frame, [20 + delay, 30 + delay], [0.1, isSugar ? 0.9 : 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const baseColor = isSugar ? `hsla(40, 75%, 60%, ${nodeAlpha * gridOn})` : `hsla(220, 40%, 50%, ${nodeAlpha * gridOn * 0.6})`;
      ctx.fillStyle = baseColor;
      ctx.beginPath(); ctx.arc(nx, ny, (isSugar ? 4 : 3) * s, 0, Math.PI * 2); ctx.fill();
      // Spike flash for sugar neurons
      if (isSugar && frame > 30 && rand() < 0.3) {
        const flash = Math.sin((frame + r * 5 + c * 3) * 0.2) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(40, 80%, 70%, ${flash * 0.6})`;
        ctx.beginPath(); ctx.arc(nx, ny, 6 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Label
    const labelFade = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * labelFade;
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("sugar neurons", gx + sugarCols * gw / (cols * 2), height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Spike raster display: horizontal lines with vertical ticks, sugar neurons highlighted
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const spikeData = useMemo(() => {
    const rand = seeded(45002);
    const data: { neuron: number; time: number }[] = [];
    for (let n = 0; n < 16; n++) {
      const isSugar = n < 5;
      const rate = isSugar ? 0.08 : 0.02;
      for (let t = 0; t < 120; t++) if (rand() < rate) data.push({ neuron: n, time: t });
    }
    return data;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const rasterX = width * 0.12, rasterW = width * 0.76;
    const rasterY = height * 0.1, rasterH = height * 0.72;
    // Horizontal guide lines
    for (let n = 0; n < 16; n++) {
      const ny = rasterY + (n / 15) * rasterH;
      const isSugar = n < 5;
      ctx.strokeStyle = isSugar ? "hsla(40, 50%, 45%, 0.2)" : "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.5 * s;
      ctx.beginPath(); ctx.moveTo(rasterX, ny); ctx.lineTo(rasterX + rasterW, ny); ctx.stroke();
      // Neuron label
      ctx.fillStyle = isSugar ? "hsla(40, 60%, 60%, 0.6)" : PALETTE.text.dim;
      ctx.font = `${6 * s}px monospace`; ctx.textAlign = "right";
      ctx.fillText(isSugar ? `S${n + 1}` : `N${n + 1}`, rasterX - 4 * s, ny + 2 * s);
    }
    // Spike ticks (only show up to current frame)
    for (const spike of spikeData) {
      if (spike.time <= frame) {
        const sx = rasterX + (spike.time / 120) * rasterW;
        const sy = rasterY + (spike.neuron / 15) * rasterH;
        const isSugar = spike.neuron < 5;
        ctx.strokeStyle = isSugar ? "hsla(40, 75%, 65%, 0.85)" : "hsla(220, 45%, 55%, 0.5)";
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath(); ctx.moveTo(sx, sy - 3 * s); ctx.lineTo(sx, sy + 3 * s); ctx.stroke();
      }
    }
    // Time cursor
    const cursorX = rasterX + (frame / 120) * rasterW;
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * s;
    ctx.beginPath(); ctx.moveTo(cursorX, rasterY); ctx.lineTo(cursorX, rasterY + rasterH); ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("time →", rasterX + rasterW / 2, rasterY + rasterH + 14 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Wall of dormant neurons, sugar input cluster illuminates, activity spreads
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  const neurons = useMemo(() => {
    const rand = seeded(45003);
    return Array.from({ length: 60 }, () => ({
      x: 0.05 + rand() * 0.9, y: 0.08 + rand() * 0.78, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const activateTime = 25;
    for (const n of neurons) {
      const isSugar = n.x < 0.2;
      const dist = isSugar ? 0 : (n.x - 0.2) * 3;
      const activeT = activateTime + dist * 30;
      const active = interpolate(frame, [activeT, activeT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const dormant = 0.15;
      const brightness = dormant + active * (isSugar ? 0.8 : 0.4);
      const hue = isSugar ? 40 : n.hue;
      ctx.fillStyle = `hsla(${hue}, ${50 + active * 20}%, ${40 + active * 20}%, ${brightness})`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, (3 + active * 2) * s, 0, Math.PI * 2); ctx.fill();
      // Glow on active sugar neurons
      if (isSugar && active > 0.5) {
        ctx.fillStyle = `hsla(40, 70%, 60%, ${(active - 0.5) * 0.2})`;
        ctx.beginPath(); ctx.arc(n.x * width, n.y * height, 8 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("activity spreads →", width / 2, height * 0.93);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal: "STIMULUS: sugar" -> network visualization activates
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Terminal header
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(width * 0.05, height * 0.05, width * 0.9, height * 0.2);
    const textFade = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * textFade;
    ctx.fillStyle = PALETTE.accent.green; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "left";
    ctx.fillText("> STIMULUS: sugar", width * 0.1, height * 0.12);
    const okFade = interpolate(frame, [20, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (okFade > 0) {
      ctx.globalAlpha = alpha * okFade;
      ctx.fillStyle = PALETTE.text.accent;
      ctx.fillText("  injecting into GR neurons...", width * 0.1, height * 0.19);
    }
    ctx.globalAlpha = alpha;
    // Network below terminal
    const netActivate = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rand = seeded(45004);
    for (let i = 0; i < 30; i++) {
      const nx = 0.1 + rand() * 0.8, ny = 0.32 + rand() * 0.55;
      const isSugar = nx < 0.25;
      const delay = isSugar ? 0 : (nx - 0.25) * 2;
      const act = interpolate(netActivate, [delay, delay + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const hue = isSugar ? 40 : 220;
      ctx.fillStyle = `hsla(${hue}, ${40 + act * 30}%, ${35 + act * 25}%, ${0.2 + act * 0.6})`;
      ctx.beginPath(); ctx.arc(nx * width, ny * height, (2 + act * 2) * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Fly silhouette with tongue touching sugar crystal, brain region lights up
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Fly
    const flyX = width * 0.35, flyY = height * 0.5;
    drawFlyTop(ctx, flyX, flyY, 55 * s, "hsla(220, 35%, 50%, 0.7)");
    // Sugar crystal below fly (at mouth)
    const sugarX = flyX, sugarY = flyY - 55 * s * 0.45;
    const sugarAppear = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sugarAppear > 0) {
      ctx.globalAlpha = alpha * sugarAppear;
      // Diamond-shaped crystal
      ctx.fillStyle = "hsla(40, 70%, 70%, 0.8)";
      ctx.beginPath();
      const cr = 10 * s;
      ctx.moveTo(sugarX, sugarY - cr); ctx.lineTo(sugarX + cr * 0.7, sugarY);
      ctx.lineTo(sugarX, sugarY + cr); ctx.lineTo(sugarX - cr * 0.7, sugarY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText("sugar", sugarX, sugarY - cr - 6 * s);
      ctx.globalAlpha = alpha;
    }
    // Brain region lighting up (right side)
    const brainGlow = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (brainGlow > 0) {
      const bx = width * 0.72, by = height * 0.4;
      // Brain oval
      ctx.strokeStyle = `hsla(280, 35%, 50%, 0.4)`; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.ellipse(bx, by, 40 * s, 30 * s, 0, 0, Math.PI * 2); ctx.stroke();
      // Active region
      ctx.fillStyle = `hsla(40, 70%, 55%, ${brainGlow * 0.6})`;
      ctx.beginPath(); ctx.ellipse(bx - 15 * s, by - 5 * s, 12 * s * brainGlow, 10 * s * brainGlow, 0, 0, Math.PI * 2); ctx.fill();
      // Glow
      ctx.fillStyle = `hsla(40, 70%, 55%, ${brainGlow * 0.15})`;
      ctx.beginPath(); ctx.ellipse(bx - 15 * s, by - 5 * s, 25 * s, 20 * s, 0, 0, Math.PI * 2); ctx.fill();
      // Arrow from fly to brain
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1 * s;
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.beginPath(); ctx.moveTo(flyX + 30 * s, flyY - 10 * s); ctx.lineTo(bx - 45 * s, by); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText("GR neurons", bx, by + 38 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // ON switch flips, cascade begins from sugar-detecting neurons
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Switch
    const switchX = width * 0.13, switchY = height * 0.35;
    const switchH = 30 * s, switchW = 14 * s;
    const on = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(switchX - switchW / 2, switchY - switchH / 2, switchW, switchH);
    // Toggle position
    const toggleY = switchY - switchH / 2 + switchH * (1 - on) + switchH * 0.15;
    const toggleColor = on > 0.5 ? PALETTE.accent.green : "rgba(255,255,255,0.3)";
    ctx.fillStyle = toggleColor;
    ctx.fillRect(switchX - switchW / 2 + 2 * s, toggleY, switchW - 4 * s, switchH * 0.35);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("ON", switchX, switchY - switchH / 2 - 6 * s);
    // Cascade of neurons from left to right
    if (on > 0.5) {
      const rand = seeded(45006);
      const cascadeProgress = interpolate(frame, [25, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      for (let i = 0; i < 40; i++) {
        const nx = 0.22 + rand() * 0.72, ny = 0.12 + rand() * 0.72;
        const isSugar = nx < 0.35;
        const dist = nx - 0.22;
        const nodeAct = interpolate(cascadeProgress, [dist * 0.8, dist * 0.8 + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const hue = isSugar ? 40 : 200 + rand() * 80;
        ctx.fillStyle = `hsla(${hue}, ${40 + nodeAct * 30}%, ${35 + nodeAct * 25}%, ${0.15 + nodeAct * 0.65})`;
        ctx.beginPath(); ctx.arc(nx * width, ny * height, (2 + nodeAct * 2.5) * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Grid of dots, sugar neurons on edge glow yellow, activity wave propagates inward
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cols = 14, rows = 10;
    const gx = width * 0.08, gy = height * 0.08;
    const gw = width * 0.84, gh = height * 0.78;
    const waveCenter = interpolate(frame, [15, 100], [0, cols], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const nx = gx + (c / (cols - 1)) * gw;
      const ny = gy + (r / (rows - 1)) * gh;
      const isSugar = c === 0;
      const distFromEdge = c;
      const active = distFromEdge < waveCenter ? interpolate(waveCenter - distFromEdge, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
      const hue = isSugar ? 40 : 220 - active * 40;
      const brightness = 0.15 + active * 0.7;
      const radius = (2 + active * 2) * s;
      ctx.fillStyle = `hsla(${hue}, ${40 + active * 30}%, ${40 + active * 20}%, ${brightness})`;
      ctx.beginPath(); ctx.arc(nx, ny, radius, 0, Math.PI * 2); ctx.fill();
    }
    // Wave front line
    if (waveCenter > 0 && waveCenter < cols) {
      const frontX = gx + (waveCenter / (cols - 1)) * gw;
      ctx.strokeStyle = "hsla(40, 60%, 60%, 0.15)"; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(frontX, gy); ctx.lineTo(frontX, gy + gh); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "left"; ctx.fillText("sugar →", gx, gy + gh + 14 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Split: "INPUT: sugar" label on left, dark network on right slowly waking up
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const netNodes = useMemo(() => {
    const rand = seeded(45008);
    return Array.from({ length: 35 }, () => ({
      x: 0.52 + rand() * 0.44, y: 0.1 + rand() * 0.78, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    // Left side: INPUT label
    const labelFade = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * labelFade;
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${12 * s}px monospace`;
    ctx.textAlign = "center"; ctx.fillText("INPUT:", width * 0.22, height * 0.35);
    ctx.fillStyle = PALETTE.accent.gold; ctx.font = `bold ${18 * s}px system-ui`;
    ctx.fillText("sugar", width * 0.22, height * 0.5);
    // Arrow
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.38, height * 0.45); ctx.lineTo(width * 0.48, height * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width * 0.46, height * 0.43); ctx.lineTo(width * 0.48, height * 0.45); ctx.lineTo(width * 0.46, height * 0.47); ctx.stroke();
    ctx.globalAlpha = alpha;
    // Right side: network waking up
    const wakeUp = interpolate(frame, [30, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of netNodes) {
      const dist = (n.x - 0.52) / 0.44;
      const nodeWake = interpolate(wakeUp, [dist * 0.6, dist * 0.6 + 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const brightness = 0.1 + nodeWake * 0.7;
      ctx.fillStyle = `hsla(${n.hue}, ${30 + nodeWake * 30}%, ${30 + nodeWake * 25}%, ${brightness})`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, (2 + nodeWake * 2) * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Sugar crystal icon -> arrow -> cluster of neurons firing (amber pulses)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 120);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height * 0.45;
    // Sugar crystal (left)
    const crystalX = width * 0.18, crystalY = cy;
    const crystalFade = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * crystalFade;
    ctx.fillStyle = "hsla(40, 70%, 70%, 0.85)";
    const cr = 16 * s;
    ctx.beginPath();
    ctx.moveTo(crystalX, crystalY - cr); ctx.lineTo(crystalX + cr * 0.8, crystalY);
    ctx.lineTo(crystalX, crystalY + cr); ctx.lineTo(crystalX - cr * 0.8, crystalY);
    ctx.closePath(); ctx.fill();
    // Sparkle
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath(); ctx.arc(crystalX - cr * 0.2, crystalY - cr * 0.3, 2 * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("sugar", crystalX, crystalY + cr + 12 * s);
    ctx.globalAlpha = alpha;
    // Arrow
    const arrowFade = interpolate(frame, [20, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowFade > 0) {
      ctx.globalAlpha = alpha * arrowFade;
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(crystalX + cr + 8 * s, cy); ctx.lineTo(cx - 20 * s, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 25 * s, cy - 4 * s); ctx.lineTo(cx - 20 * s, cy); ctx.lineTo(cx - 25 * s, cy + 4 * s); ctx.stroke();
      ctx.globalAlpha = alpha;
    }
    // Neuron cluster (right)
    const clusterX = width * 0.7, clusterY = cy;
    const fireFade = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireFade > 0) {
      const rand = seeded(45009);
      for (let i = 0; i < 12; i++) {
        const angle = rand() * Math.PI * 2;
        const dist = rand() * 35 * s;
        const nx = clusterX + Math.cos(angle) * dist;
        const ny = clusterY + Math.sin(angle) * dist;
        // Amber pulse
        const pulse = 0.5 + Math.sin(frame * 0.12 + i * 1.3) * 0.4;
        ctx.globalAlpha = alpha * fireFade * pulse;
        ctx.fillStyle = "hsla(40, 75%, 60%, 0.9)";
        ctx.beginPath(); ctx.arc(nx, ny, 4 * s, 0, Math.PI * 2); ctx.fill();
        // Glow
        ctx.fillStyle = `hsla(40, 70%, 55%, ${pulse * 0.2})`;
        ctx.beginPath(); ctx.arc(nx, ny, 8 * s, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText("GR neurons firing", clusterX, clusterY + 45 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_045: VariantDef[] = [
  { id: "power-raster", label: "Power + Raster", component: V1 },
  { id: "spike-raster", label: "Spike Raster", component: V2 },
  { id: "activity-spread", label: "Activity Spread", component: V3 },
  { id: "terminal-stimulus", label: "Terminal Stimulus", component: V4 },
  { id: "fly-sugar-brain", label: "Fly + Sugar + Brain", component: V5 },
  { id: "on-switch", label: "ON Switch", component: V6 },
  { id: "dot-wave", label: "Dot Wave", component: V7 },
  { id: "input-label", label: "Input Label", component: V8 },
  { id: "crystal-to-fire", label: "Crystal to Fire", component: V9 },
];
