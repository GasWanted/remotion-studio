import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawMonitor } from "../icons";

// Shot 43 — "every neuron following that same rule, every connection weighted exactly as measured."
// 150 frames (5s). Bio network morphs to digital — organic neurons transition to circuit/terminal.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Organic neuron network morphing into circuit board traces
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(43001);
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 10; i++) nodes.push({ x: 0.15 + rand() * 0.7, y: 0.15 + rand() * 0.65, hue: PALETTE.cellColors[i % 8][0] });
    const edges: [number, number][] = [];
    for (let i = 0; i < 10; i++) for (let j = i + 1; j < 10; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.35 && rand() < 0.4) edges.push([i, j]);
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
    const morph = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Edges: organic curves -> straight right-angle traces
    for (const [a, b] of data.edges) {
      const na = data.nodes[a], nb = data.nodes[b];
      const ax = na.x * width, ay = na.y * height;
      const bx = nb.x * width, by = nb.y * height;
      const midX = (ax + bx) / 2, midY = (ay + by) / 2;
      // Organic: curved; Digital: L-shaped
      const bioColor = `hsla(280, 40%, 55%, ${0.5 * (1 - morph)})`;
      const digiColor = `hsla(160, 70%, 50%, ${0.6 * morph})`;
      ctx.lineWidth = (2 - morph) * s;
      if (morph < 0.5) {
        ctx.strokeStyle = bioColor;
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(midX + 10 * s, midY - 10 * s, bx, by); ctx.stroke();
      }
      if (morph > 0) {
        ctx.strokeStyle = digiColor;
        ctx.lineWidth = (1 + morph) * s;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, by); ctx.lineTo(bx, by); ctx.stroke();
      }
    }
    // Nodes: organic blobs -> squares
    for (const n of data.nodes) {
      const nx = n.x * width, ny = n.y * height;
      const blobR = 8 * s * (1 - morph);
      const sqR = 5 * s * morph;
      if (blobR > 0.5) {
        ctx.fillStyle = `hsla(${n.hue}, 45%, 55%, ${0.8 * (1 - morph)})`;
        ctx.beginPath(); ctx.arc(nx, ny, blobR, 0, Math.PI * 2); ctx.fill();
      }
      if (sqR > 0.5) {
        ctx.fillStyle = `hsla(160, 65%, 55%, ${0.9 * morph})`;
        ctx.fillRect(nx - sqR, ny - sqR, sqR * 2, sqR * 2);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Split screen: left biological, right digital terminal with code
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const reveal = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Divider
    const divX = width / 2;
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(divX, height * 0.1); ctx.lineTo(divX, height * 0.9); ctx.stroke();
    // Left: biological neurons
    ctx.globalAlpha = alpha * reveal;
    const bioNodes = [[0.15, 0.3], [0.25, 0.55], [0.1, 0.65], [0.3, 0.4], [0.2, 0.75]];
    for (const [bx, by] of bioNodes) {
      drawNeuron(ctx, bx * width, by * height, 18 * s, "hsla(280, 45%, 60%, 0.8)", frame);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("biological", width * 0.22, height * 0.13);
    // Right: terminal code
    const codeLines = [
      "neuron[0].v = -65mV",
      "neuron[0].w = [3.2, -1.5]",
      "neuron[1].v = -70mV",
      "neuron[1].w = [2.1, 0.8]",
      "spike_if(v > thresh)",
    ];
    const codeStart = interpolate(frame, [40, 90], [0, codeLines.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(divX + 8 * s, height * 0.18, width * 0.42, height * 0.6);
    for (let i = 0; i < Math.floor(codeStart); i++) {
      ctx.fillStyle = i < 4 ? "hsla(140, 60%, 60%, 0.8)" : PALETTE.text.accent;
      ctx.font = `${7.5 * s}px monospace`; ctx.textAlign = "left";
      ctx.fillText(codeLines[i], divX + 14 * s, height * 0.28 + i * 13 * s);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("digital", width * 0.75, height * 0.13);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Neurons fading from organic blobs to geometric nodes with clean edges
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(43003);
    return Array.from({ length: 15 }, () => ({
      x: 0.1 + rand() * 0.8, y: 0.12 + rand() * 0.7,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0], wobble: rand() * Math.PI * 2,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const morph = interpolate(frame, [25, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      const nx = n.x * width, ny = n.y * height;
      // Organic blob
      if (morph < 1) {
        ctx.fillStyle = `hsla(${n.hue}, 45%, 55%, ${0.7 * (1 - morph)})`;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.3) {
          const r = (8 + Math.sin(a * 3 + n.wobble + frame * 0.02) * 2.5) * s * (1 - morph);
          const px = nx + Math.cos(a) * r, py = ny + Math.sin(a) * r;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
      // Geometric hexagon
      if (morph > 0) {
        ctx.fillStyle = `hsla(${n.hue}, 60%, 60%, ${0.85 * morph})`;
        ctx.beginPath();
        const r = 6 * s * morph;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
          const px = nx + Math.cos(a) * r, py = ny + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Monitor powering on, showing the network inside a screen
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const netNodes = useMemo(() => {
    const rand = seeded(43004);
    return Array.from({ length: 20 }, () => ({ x: rand(), y: rand(), hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const monW = 130 * s, monH = 85 * s;
    const cx = width / 2, cy = height * 0.42;
    // Monitor appearing
    const monFade = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = alpha * monFade;
    drawMonitor(ctx, cx, cy, monW, monH, "hsla(220, 40%, 55%, 0.7)");
    // Power-on glow
    const powerOn = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (powerOn > 0) {
      ctx.fillStyle = `hsla(220, 30%, 12%, ${powerOn * 0.85})`;
      ctx.fillRect(cx - monW / 2 + 3, cy - monH / 2 + 3, monW - 6, monH - 6);
      // Network inside screen
      ctx.save();
      ctx.beginPath();
      ctx.rect(cx - monW / 2 + 3, cy - monH / 2 + 3, monW - 6, monH - 6);
      ctx.clip();
      const netReveal = interpolate(frame, [45, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const shown = Math.floor(netReveal * netNodes.length);
      const sx = cx - monW / 2 + 8, sy = cy - monH / 2 + 8;
      const sw = monW - 16, sh = monH - 16;
      for (let i = 0; i < shown; i++) {
        const n = netNodes[i];
        ctx.fillStyle = `hsla(${n.hue}, 55%, 60%, ${netReveal * 0.8})`;
        ctx.beginPath(); ctx.arc(sx + n.x * sw, sy + n.y * sh, 2.5 * s, 0, Math.PI * 2); ctx.fill();
      }
      // Edges between nearby nodes
      for (let i = 0; i < shown; i++) for (let j = i + 1; j < shown; j++) {
        const dx = netNodes[i].x - netNodes[j].x, dy = netNodes[i].y - netNodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.3) {
          ctx.strokeStyle = `hsla(180, 40%, 50%, ${netReveal * 0.2})`;
          ctx.lineWidth = 0.5 * s;
          ctx.beginPath();
          ctx.moveTo(sx + netNodes[i].x * sw, sy + netNodes[i].y * sh);
          ctx.lineTo(sx + netNodes[j].x * sw, sy + netNodes[j].y * sh);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Biological tissue dissolving to reveal clean digital graph beneath
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const rand = seeded(43005);
    return Array.from({ length: 25 }, () => ({
      x: 0.08 + rand() * 0.84, y: 0.08 + rand() * 0.78,
      r: 3 + rand() * 6, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const dissolve = interpolate(frame, [20, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Bio tissue layer (dissolving)
    for (const d of data) {
      const tissueAlpha = (1 - dissolve) * 0.6;
      if (tissueAlpha > 0.01) {
        ctx.fillStyle = `hsla(${d.hue}, 35%, 40%, ${tissueAlpha})`;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.4) {
          const r = d.r * s * (1 + Math.sin(a * 2.5 + frame * 0.02) * 0.2);
          const px = d.x * width + Math.cos(a) * r, py = d.y * height + Math.sin(a) * r;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
      }
    }
    // Digital nodes (appearing)
    for (const d of data) {
      if (dissolve > 0.1) {
        ctx.fillStyle = `hsla(160, 60%, 55%, ${dissolve * 0.85})`;
        ctx.beginPath();
        ctx.arc(d.x * width, d.y * height, 3 * s * dissolve, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Digital edges
    if (dissolve > 0.3) {
      for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
        const dx = data[i].x - data[j].x, dy = data[i].y - data[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.22) {
          ctx.strokeStyle = `hsla(160, 50%, 50%, ${(dissolve - 0.3) * 0.3})`;
          ctx.lineWidth = 0.7 * s;
          ctx.beginPath();
          ctx.moveTo(data[i].x * width, data[i].y * height);
          ctx.lineTo(data[j].x * width, data[j].y * height);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Copy operation: neurons duplicated from bio side to digital side
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(43006);
    return Array.from({ length: 6 }, (_, i) => ({
      y: 0.2 + (i / 5) * 0.6, hue: PALETTE.cellColors[i % 8][0],
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const bioX = width * 0.22, digiX = width * 0.78;
    // Arrow in middle
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.38, height * 0.5);
    ctx.lineTo(width * 0.58, height * 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width * 0.55, height * 0.47);
    ctx.lineTo(width * 0.58, height * 0.5); ctx.lineTo(width * 0.55, height * 0.53); ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("copy", width / 2, height * 0.45);
    // Bio neurons (always visible)
    for (const n of nodes) {
      drawNeuron(ctx, bioX, n.y * height, 16 * s, `hsla(${n.hue}, 45%, 55%, 0.8)`, frame);
    }
    // Digital copies appearing one by one
    for (let i = 0; i < nodes.length; i++) {
      const copyStart = 20 + i * 18;
      const copyFade = interpolate(frame, [copyStart, copyStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (copyFade > 0) {
        ctx.globalAlpha = alpha * copyFade;
        // Digital node as clean circle with cyan tint
        ctx.fillStyle = `hsla(160, 60%, 55%, 0.85)`;
        ctx.beginPath(); ctx.arc(digiX, nodes[i].y * height, 5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `hsla(160, 60%, 55%, 0.4)`;
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(digiX - 8 * s, nodes[i].y * height - 8 * s, 16 * s, 16 * s);
        ctx.globalAlpha = alpha;
      }
    }
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("bio", bioX, height * 0.1);
    ctx.fillText("digital", digiX, height * 0.1);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Terminal typing: "loading neuron 1... neuron 2... neuron 138,639"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    // Terminal background
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    const termX = width * 0.08, termY = height * 0.1;
    const termW = width * 0.84, termH = height * 0.75;
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1 * s;
    ctx.strokeRect(termX, termY, termW, termH);
    const lines: { text: string; t: number; color: string }[] = [
      { text: "> loading connectome...", t: 10, color: PALETTE.accent.green },
      { text: "  neuron 1 ........... OK", t: 25, color: "hsla(140, 60%, 60%, 0.7)" },
      { text: "  neuron 2 ........... OK", t: 35, color: "hsla(140, 60%, 60%, 0.7)" },
      { text: "  neuron 3 ........... OK", t: 45, color: "hsla(140, 60%, 60%, 0.7)" },
      { text: "  ...", t: 55, color: PALETTE.text.dim },
      { text: "  neuron 138,639 ..... OK", t: 70, color: PALETTE.accent.gold },
      { text: "", t: 80, color: "" },
      { text: "  all weights copied.", t: 90, color: PALETTE.accent.green },
      { text: "  exact match: 100%", t: 105, color: PALETTE.text.accent },
    ];
    const lineH = 12 * s;
    ctx.font = `${7.5 * s}px monospace`; ctx.textAlign = "left";
    for (const line of lines) {
      if (frame >= line.t && line.text) {
        ctx.fillStyle = line.color;
        const idx = lines.indexOf(line);
        ctx.fillText(line.text, termX + 10 * s, termY + 18 * s + idx * lineH);
      }
    }
    // Cursor blink
    if (Math.floor(frame / 15) % 2 === 0) {
      const lastLine = lines.filter(l => frame >= l.t).length;
      ctx.fillStyle = PALETTE.accent.green;
      ctx.fillRect(termX + 10 * s, termY + 18 * s + lastLine * lineH - 7 * s, 5 * s, 9 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Organic colors fading to green/cyan digital palette
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(14, width, height, s), [width, height, s]);
  const nodes = useMemo(() => {
    const rand = seeded(43008);
    return Array.from({ length: 20 }, () => ({
      x: 0.1 + rand() * 0.8, y: 0.1 + rand() * 0.75,
      hue: PALETTE.cellColors[Math.floor(rand() * 8)][0],
      sat: 35 + rand() * 30, r: 4 + rand() * 5,
    }));
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const shift = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const n of nodes) {
      // Interpolate hue from organic to cyan/green range
      const targetHue = 140 + (n.hue % 40);
      const hue = n.hue + (targetHue - n.hue) * shift;
      const sat = n.sat + (65 - n.sat) * shift;
      const lit = 50 + shift * 10;
      ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, 0.8)`;
      ctx.beginPath(); ctx.arc(n.x * width, n.y * height, n.r * s, 0, Math.PI * 2); ctx.fill();
      // Glow in digital mode
      if (shift > 0.5) {
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lit}%, ${(shift - 0.5) * 0.15})`;
        ctx.beginPath(); ctx.arc(n.x * width, n.y * height, n.r * s * 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Connecting lines also shift
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 0.2) {
        const lineHue = 280 * (1 - shift) + 160 * shift;
        ctx.strokeStyle = `hsla(${lineHue}, 40%, 50%, 0.2)`;
        ctx.lineWidth = 0.7 * s;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
        ctx.lineTo(nodes[j].x * width, nodes[j].y * height);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Brain shape made of neurons -> same shape made of dots and lines (digital)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  const dots = useMemo(() => {
    const rand = seeded(43009);
    const pts: { x: number; y: number; hue: number }[] = [];
    // Generate points in a rough brain/oval shape
    for (let i = 0; i < 50; i++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * 0.32;
      const x = 0.5 + Math.cos(angle) * r * 1.3;
      const y = 0.48 + Math.sin(angle) * r * 0.9;
      pts.push({ x, y, hue: PALETTE.cellColors[Math.floor(rand() * 8)][0] });
    }
    return pts;
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 150);
    ctx.globalAlpha = alpha;
    const morph = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Draw brain outline (fading)
    if (morph < 0.8) {
      ctx.strokeStyle = `hsla(280, 35%, 50%, ${0.3 * (1 - morph)})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.48, width * 0.35, height * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Neurons -> dots
    for (const d of dots) {
      const px = d.x * width, py = d.y * height;
      if (morph < 0.7) {
        // Organic neuron blob
        ctx.fillStyle = `hsla(${d.hue}, 40%, 50%, ${0.6 * (1 - morph)})`;
        const r = (3 + Math.sin(d.x * 10 + frame * 0.02) * 1) * s * (1 - morph);
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }
      // Digital dot
      ctx.fillStyle = `hsla(160, 60%, 55%, ${0.85 * morph})`;
      ctx.beginPath(); ctx.arc(px, py, 2 * s * morph, 0, Math.PI * 2); ctx.fill();
    }
    // Digital edges
    if (morph > 0.3) {
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 0.1) {
          ctx.strokeStyle = `hsla(160, 50%, 50%, ${(morph - 0.3) * 0.2})`;
          ctx.lineWidth = 0.5 * s;
          ctx.beginPath();
          ctx.moveTo(dots[i].x * width, dots[i].y * height);
          ctx.lineTo(dots[j].x * width, dots[j].y * height);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_043: VariantDef[] = [
  { id: "circuit-morph", label: "Circuit Morph", component: V1 },
  { id: "split-bio-digital", label: "Split Bio/Digital", component: V2 },
  { id: "blob-to-hex", label: "Blob to Hexagon", component: V3 },
  { id: "monitor-network", label: "Monitor Network", component: V4 },
  { id: "tissue-dissolve", label: "Tissue Dissolve", component: V5 },
  { id: "copy-operation", label: "Copy Operation", component: V6 },
  { id: "terminal-loading", label: "Terminal Loading", component: V7 },
  { id: "color-shift", label: "Color Shift", component: V8 },
  { id: "brain-to-graph", label: "Brain to Graph", component: V9 },
];
