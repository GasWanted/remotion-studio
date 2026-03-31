import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 39 — "That's it. Receive, add up, fire or don't."
// 90 frames (3s). Fast replay: RECEIVE → SUM → FIRE? loop.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Three text labels cycling: RECEIVE → SUM → FIRE? in a loop with arrows
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 39001), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const labels = ["RECEIVE", "SUM", "FIRE?"];
    const colors = [PALETTE.accent.blue, PALETTE.accent.gold, PALETTE.accent.red];
    const cycle = (frame * 0.06) % 3;
    const activeIdx = Math.floor(cycle);
    const cx = width / 2, cy = height * 0.45;
    const spacing = 100 * s;
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * spacing;
      const isActive = i === activeIdx;
      const sz = isActive ? 16 * s : 12 * s;
      ctx.fillStyle = isActive ? colors[i] : PALETTE.text.dim;
      ctx.font = `bold ${sz}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(labels[i], x, cy);
      // Arrow to next
      if (i < 2) {
        ctx.strokeStyle = PALETTE.text.dim;
        ctx.lineWidth = 1.5 * s;
        const ax = x + spacing * 0.35, ay = cy;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 12 * s, ay); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + 12 * s, ay);
        ctx.lineTo(ax + 7 * s, ay - 4 * s);
        ctx.moveTo(ax + 12 * s, ay);
        ctx.lineTo(ax + 7 * s, ay + 4 * s);
        ctx.stroke();
      }
    }
    // Loop arrow from FIRE? back to RECEIVE
    ctx.strokeStyle = `hsla(220, 40%, 55%, 0.4)`;
    ctx.lineWidth = 1.5 * s;
    const arcY = cy + 30 * s;
    ctx.beginPath();
    ctx.moveTo(cx + spacing, cy + 14 * s);
    ctx.quadraticCurveTo(cx, arcY + 20 * s, cx - spacing, cy + 14 * s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Animated flow diagram: input → Sigma → threshold check → output, looping
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 39002), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const cy = height * 0.45;
    const boxes = [
      { x: width * 0.15, label: "IN", color: PALETTE.accent.blue },
      { x: width * 0.4, label: "\u03A3", color: PALETTE.accent.gold },
      { x: width * 0.65, label: "\u2265\u03B8?", color: PALETTE.accent.red },
      { x: width * 0.88, label: "OUT", color: PALETTE.accent.green },
    ];
    const flowPos = (frame * 0.04) % 1;
    // Boxes and connections
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      const bw = 35 * s, bh = 22 * s;
      ctx.strokeStyle = b.color; ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(b.x - bw / 2, cy - bh / 2, bw, bh);
      ctx.fillStyle = b.color;
      ctx.font = `bold ${10 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b.label, b.x, cy);
      // Arrow
      if (i < boxes.length - 1) {
        const nx = boxes[i + 1].x;
        ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.moveTo(b.x + bw / 2 + 3 * s, cy);
        ctx.lineTo(nx - bw / 2 - 3 * s, cy);
        ctx.stroke();
      }
    }
    // Traveling dot
    const totalW = boxes[3].x - boxes[0].x;
    const dotX = boxes[0].x + flowPos * totalW;
    ctx.fillStyle = `hsla(55, 90%, 80%, 0.8)`;
    ctx.beginPath(); ctx.arc(dotX, cy, 3.5 * s, 0, Math.PI * 2); ctx.fill();
    // "loop" label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `italic ${8 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("repeat", width / 2, cy + 35 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron doing the cycle: inputs arrive, glow builds, fires, repeat
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s, 39003), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const cx = width * 0.5, cy = height * 0.45;
    // Cycle repeats every 30 frames
    const cycleFrame = frame % 30;
    const inputT = interpolate(cycleFrame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const chargeT = interpolate(cycleFrame, [8, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fireT = interpolate(cycleFrame, [18, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Input lines arriving from left
    for (let i = 0; i < 3; i++) {
      const iy = cy + (i - 1) * 20 * s;
      const lineEnd = cx - 30 * s;
      const lineStart = lineEnd - 40 * s;
      const px = lineStart + (lineEnd - lineStart) * inputT;
      ctx.strokeStyle = `hsla(${PALETTE.cellColors[i][0]}, 55%, 60%, 0.4)`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(lineStart, iy); ctx.lineTo(lineEnd, iy); ctx.stroke();
      if (inputT < 1) {
        ctx.fillStyle = `hsla(${PALETTE.cellColors[i][0]}, 70%, 70%, 0.8)`;
        ctx.beginPath(); ctx.arc(px, iy, 3 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Glow
    if (chargeT > 0) {
      const gr = 25 * s * chargeT;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, gr);
      g.addColorStop(0, `hsla(55, 90%, 80%, ${chargeT * 0.4})`);
      g.addColorStop(1, `hsla(55, 90%, 80%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, gr, 0, Math.PI * 2); ctx.fill();
    }
    drawNeuron(ctx, cx, cy, 28 * s, `hsla(220, 55%, ${55 + chargeT * 30}%, 0.9)`, frame);
    // Fire output
    if (fireT > 0) {
      const outX = cx + 27 * s + fireT * 60 * s;
      ctx.fillStyle = `hsla(55, 90%, 80%, ${(1 - fireT) * 0.9})`;
      ctx.beginPath(); ctx.arc(outX, cy, 4 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Phase label
    const phase = cycleFrame < 8 ? "receive" : cycleFrame < 18 ? "sum" : "fire!";
    const phaseColor = cycleFrame < 8 ? PALETTE.accent.blue : cycleFrame < 18 ? PALETTE.accent.gold : PALETTE.accent.red;
    ctx.fillStyle = phaseColor;
    ctx.font = `bold ${10 * s}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(phase, cx, cy + 45 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Minimalist icons cycling: antenna → calculator → lightning bolt
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 39004), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const cy = height * 0.42;
    const spacing = 80 * s;
    const cyclePhase = Math.floor((frame * 0.08) % 3);
    const icons = [
      // Antenna
      (x: number, active: boolean) => {
        const c = active ? PALETTE.accent.blue : PALETTE.text.dim;
        ctx.strokeStyle = c; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x, cy + 15 * s); ctx.lineTo(x, cy - 10 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 10 * s, cy - 18 * s); ctx.lineTo(x, cy - 10 * s); ctx.lineTo(x + 10 * s, cy - 18 * s); ctx.stroke();
        for (let w = 1; w <= 2; w++) {
          ctx.strokeStyle = active ? `hsla(220, 60%, 65%, ${0.5 / w})` : `hsla(220, 20%, 40%, ${0.3 / w})`;
          ctx.beginPath(); ctx.arc(x, cy - 10 * s, w * 8 * s, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
        }
      },
      // Plus/sum
      (x: number, active: boolean) => {
        const c = active ? PALETTE.accent.gold : PALETTE.text.dim;
        ctx.strokeStyle = c; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x - 12 * s, cy); ctx.lineTo(x + 12 * s, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, cy - 12 * s); ctx.lineTo(x, cy + 12 * s); ctx.stroke();
      },
      // Lightning bolt
      (x: number, active: boolean) => {
        const c = active ? PALETTE.accent.red : PALETTE.text.dim;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(x + 2 * s, cy - 18 * s);
        ctx.lineTo(x - 8 * s, cy + 2 * s);
        ctx.lineTo(x, cy);
        ctx.lineTo(x - 2 * s, cy + 18 * s);
        ctx.lineTo(x + 8 * s, cy - 2 * s);
        ctx.lineTo(x, cy);
        ctx.closePath(); ctx.fill();
      },
    ];
    for (let i = 0; i < 3; i++) {
      const x = width / 2 + (i - 1) * spacing;
      icons[i](x, i === cyclePhase);
      // Arrow between
      if (i < 2) {
        ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1 * s;
        const ax = x + spacing * 0.32;
        ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(ax + 10 * s, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + 10 * s, cy); ctx.lineTo(ax + 6 * s, cy - 3 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax + 10 * s, cy); ctx.lineTo(ax + 6 * s, cy + 3 * s); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Text "That's it." large and centered, small neuron cycle below
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 39005), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    // Big text
    const textT = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.primary;
    ctx.font = `bold ${28 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.globalAlpha = alpha * textT;
    ctx.fillText("That's it.", width / 2, height * 0.32);
    ctx.globalAlpha = alpha;
    // Small neuron cycle below
    const cy = height * 0.65;
    const cycleFrame = frame % 30;
    const charge = interpolate(cycleFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fire = interpolate(cycleFrame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawNeuron(ctx, width / 2, cy, 18 * s, `hsla(220, 55%, ${55 + charge * 30}%, 0.8)`, frame);
    if (fire > 0) {
      const outX = width / 2 + 20 * s + fire * 40 * s;
      ctx.fillStyle = `hsla(55, 80%, 75%, ${(1 - fire) * 0.8})`;
      ctx.beginPath(); ctx.arc(outX, cy, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Small input dots arriving
    if (charge < 1) {
      for (let i = 0; i < 2; i++) {
        const ix = width / 2 - 20 * s - (1 - charge) * 30 * s;
        const iy = cy + (i - 0.5) * 12 * s;
        ctx.fillStyle = `hsla(${PALETTE.cellColors[i][0]}, 60%, 65%, ${(1 - charge) * 0.7})`;
        ctx.beginPath(); ctx.arc(ix, iy, 2.5 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Three-panel comic strip: receive / add / fire
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 39006), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const panelW = width * 0.28, panelH = height * 0.55;
    const panelY = height * 0.2;
    const panels = [
      { x: width * 0.1, label: "receive", color: PALETTE.accent.blue },
      { x: width * 0.38, label: "add up", color: PALETTE.accent.gold },
      { x: width * 0.66, label: "fire!", color: PALETTE.accent.red },
    ];
    for (let i = 0; i < 3; i++) {
      const p = panels[i];
      const panelT = interpolate(frame, [5 + i * 10, 20 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = alpha * panelT;
      // Panel border
      ctx.strokeStyle = `hsla(220, 30%, 40%, 0.5)`;
      ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(p.x, panelY, panelW, panelH);
      // Label
      ctx.fillStyle = p.color;
      ctx.font = `bold ${9 * s}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x + panelW / 2, panelY + panelH + 14 * s);
      // Panel content
      const pcx = p.x + panelW / 2, pcy = panelY + panelH / 2;
      if (i === 0) {
        // Arrows arriving at neuron
        drawNeuron(ctx, pcx + 8 * s, pcy, 16 * s, `hsla(220, 55%, 60%, 0.8)`, frame);
        for (let j = 0; j < 3; j++) {
          ctx.strokeStyle = `hsla(${PALETTE.cellColors[j][0]}, 55%, 60%, 0.5)`;
          ctx.lineWidth = 1.5 * s;
          const ay = pcy + (j - 1) * 14 * s;
          ctx.beginPath(); ctx.moveTo(pcx - 30 * s, ay); ctx.lineTo(pcx - 8 * s, pcy); ctx.stroke();
        }
      } else if (i === 1) {
        // Sum symbol with glow
        ctx.fillStyle = PALETTE.accent.gold;
        ctx.font = `bold ${22 * s}px system-ui`;
        ctx.textBaseline = "middle";
        ctx.fillText("\u03A3", pcx, pcy);
      } else {
        // Lightning / fire burst
        drawNeuron(ctx, pcx - 5 * s, pcy, 16 * s, `hsla(55, 80%, 75%, 0.9)`, frame);
        ctx.strokeStyle = `hsla(55, 90%, 75%, 0.6)`;
        ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.moveTo(pcx + 11 * s, pcy); ctx.lineTo(pcx + 30 * s, pcy); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Clock-like circular diagram with three stages
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 39007), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const cx = width / 2, cy = height * 0.45;
    const r = 55 * s;
    // Circle
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.4)`;
    ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Three segments
    const labels = ["RECEIVE", "SUM", "FIRE?"];
    const colors = [PALETTE.accent.blue, PALETTE.accent.gold, PALETTE.accent.red];
    const handAngle = ((frame * 0.07) % 1) * Math.PI * 2 - Math.PI / 2;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      const lx = cx + Math.cos(a) * (r + 18 * s);
      const ly = cy + Math.sin(a) * (r + 18 * s);
      // Segment arc
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a - 0.15, a + Math.PI * 2 / 3 - 0.15);
      ctx.stroke();
      // Label
      ctx.fillStyle = colors[i];
      ctx.font = `bold ${8 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(labels[i], lx, ly);
    }
    // Clock hand
    ctx.strokeStyle = PALETTE.text.primary;
    ctx.lineWidth = 2.5 * s;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(handAngle) * r * 0.7, cy + Math.sin(handAngle) * r * 0.7);
    ctx.stroke();
    // Center dot
    ctx.fillStyle = PALETTE.text.primary;
    ctx.beginPath(); ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Simple state machine: idle → charging → fire → idle
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s, 39008), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const states = [
      { x: width * 0.2, y: height * 0.4, label: "idle", color: PALETTE.text.dim },
      { x: width * 0.5, y: height * 0.25, label: "charging", color: PALETTE.accent.gold },
      { x: width * 0.8, y: height * 0.4, label: "fire!", color: PALETTE.accent.red },
    ];
    const activeIdx = Math.floor((frame * 0.07) % 3);
    for (let i = 0; i < 3; i++) {
      const st = states[i];
      const isActive = i === activeIdx;
      const r = 22 * s;
      // Circle
      ctx.strokeStyle = isActive ? st.color : `hsla(220, 20%, 35%, 0.5)`;
      ctx.lineWidth = isActive ? 2.5 * s : 1.5 * s;
      ctx.beginPath(); ctx.arc(st.x, st.y, r, 0, Math.PI * 2); ctx.stroke();
      if (isActive) {
        ctx.fillStyle = st.color.replace(")", ", 0.15)").replace("rgb", "rgba");
        ctx.beginPath(); ctx.arc(st.x, st.y, r, 0, Math.PI * 2); ctx.fill();
      }
      // Label
      ctx.fillStyle = isActive ? st.color : PALETTE.text.dim;
      ctx.font = `${isActive ? "bold " : ""}${9 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(st.label, st.x, st.y);
      // Arrow to next
      if (i < 2) {
        const nx = states[i + 1];
        const ang = Math.atan2(nx.y - st.y, nx.x - st.x);
        const sx = st.x + Math.cos(ang) * (r + 4 * s);
        const sy = st.y + Math.sin(ang) * (r + 4 * s);
        const ex = nx.x - Math.cos(ang) * (r + 4 * s);
        const ey = nx.y - Math.sin(ang) * (r + 4 * s);
        ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      }
    }
    // Return arrow from fire to idle
    ctx.strokeStyle = `hsla(220, 30%, 45%, 0.35)`;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(states[2].x, states[2].y + 22 * s + 4 * s);
    ctx.quadraticCurveTo(width / 2, height * 0.72, states[0].x, states[0].y + 22 * s + 4 * s);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Big bold "RECEIVE → SUM → FIRE" text, each word lights up in sequence
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s, 39009), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const words = ["RECEIVE", "\u2192", "SUM", "\u2192", "FIRE"];
    const wordColors = [PALETTE.accent.blue, PALETTE.text.dim, PALETTE.accent.gold, PALETTE.text.dim, PALETTE.accent.red];
    const activeWord = Math.floor((frame * 0.1) % 3);
    const activeIndices = [0, 2, 4]; // Word indices for receive, sum, fire
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const cy = height * 0.45;
    let totalW = 0;
    const sizes: number[] = [];
    for (let i = 0; i < words.length; i++) {
      const sz = (i % 2 === 0) ? 18 * s : 14 * s;
      sizes.push(sz);
      ctx.font = `bold ${sz}px system-ui`;
      totalW += ctx.measureText(words[i]).width + 8 * s;
    }
    let x = (width - totalW) / 2;
    for (let i = 0; i < words.length; i++) {
      ctx.font = `bold ${sizes[i]}px system-ui`;
      const w = ctx.measureText(words[i]).width;
      const isLit = activeIndices[activeWord] === i;
      if (isLit) {
        // Glow behind text
        const g = ctx.createRadialGradient(x + w / 2, cy, 0, x + w / 2, cy, w * 0.7);
        g.addColorStop(0, wordColors[i].replace(")", ", 0.2)").replace("rgb", "rgba").replace("#", ""));
        g.addColorStop(1, "transparent");
        // simplified glow
        ctx.fillStyle = `${wordColors[i]}`;
        ctx.globalAlpha = alpha * 0.15;
        ctx.beginPath(); ctx.arc(x + w / 2, cy, w * 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alpha;
      }
      ctx.fillStyle = isLit ? wordColors[i] : PALETTE.text.dim;
      ctx.textAlign = "left";
      ctx.fillText(words[i], x, cy);
      x += w + 8 * s;
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_039: VariantDef[] = [
  { id: "cycling-labels", label: "Cycling Labels", component: V1 },
  { id: "flow-diagram", label: "Flow Diagram", component: V2 },
  { id: "neuron-cycle", label: "Neuron Cycle", component: V3 },
  { id: "icon-cycle", label: "Icon Cycle", component: V4 },
  { id: "thats-it-text", label: "That's It Text", component: V5 },
  { id: "comic-strip", label: "Comic Strip", component: V6 },
  { id: "clock-diagram", label: "Clock Diagram", component: V7 },
  { id: "state-machine", label: "State Machine", component: V8 },
  { id: "bold-sequence", label: "Bold Sequence", component: V9 },
];
