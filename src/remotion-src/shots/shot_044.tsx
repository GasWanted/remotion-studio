import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawCheck, drawX, drawNeuron } from "../icons";

// Shot 44 — "No training. No machine learning. Just the wiring."
// 90 frames (3s). Checklist: X Training, X ML, X Optimization, Check Raw wiring.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Checklist appearing line by line: X Training, X ML, X Optimization, Check Raw wiring
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const items = [
      { label: "Training", t: 8, isCheck: false },
      { label: "Machine Learning", t: 22, isCheck: false },
      { label: "Optimization", t: 36, isCheck: false },
      { label: "Raw Wiring", t: 52, isCheck: true },
    ];
    const startY = height * 0.2;
    const lineH = height * 0.17;
    const iconX = width * 0.22, textX = width * 0.32;
    for (const item of items) {
      const fade = interpolate(frame, [item.t, item.t + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fade > 0) {
        ctx.globalAlpha = alpha * fade;
        const idx = items.indexOf(item);
        const iy = startY + idx * lineH;
        if (item.isCheck) {
          drawCheck(ctx, iconX, iy, 14 * s, PALETTE.accent.green);
          ctx.fillStyle = PALETTE.accent.gold;
        } else {
          drawX(ctx, iconX, iy, 12 * s, PALETTE.accent.red);
          ctx.fillStyle = PALETTE.text.dim;
        }
        ctx.font = `${12 * s}px system-ui`;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(item.label, textX, iy);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Words crossed out one by one, "WIRING" stays highlighted
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const words = [
      { text: "Training", crossAt: 15 },
      { text: "ML", crossAt: 30 },
      { text: "Optimization", crossAt: 45 },
    ];
    const cx = width / 2;
    // Crossed-out words
    ctx.font = `${13 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      const y = height * 0.22 + i * height * 0.16;
      const crossed = interpolate(frame, [w.crossAt, w.crossAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(255,255,255,${0.6 - crossed * 0.4})`;
      ctx.fillText(w.text, cx, y);
      if (crossed > 0) {
        ctx.strokeStyle = PALETTE.accent.red;
        ctx.lineWidth = 2 * s;
        const tw = ctx.measureText(w.text).width;
        ctx.beginPath();
        ctx.moveTo(cx - tw / 2 - 5 * s, y);
        ctx.lineTo(cx - tw / 2 - 5 * s + (tw + 10 * s) * crossed, y);
        ctx.stroke();
      }
    }
    // "WIRING" highlighted
    const wiringFade = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wiringFade > 0) {
      ctx.globalAlpha = alpha * wiringFade;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${20 * s}px system-ui`;
      ctx.fillText("WIRING", cx, height * 0.76);
      // Glow
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 12 * s * wiringFade;
      ctx.fillText("WIRING", cx, height * 0.76);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Three doors closing (training, ML, optimization), one door opens (wiring)
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(8, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const doors = [
      { label: "Training", closeAt: 10 },
      { label: "ML", closeAt: 22 },
      { label: "Optim.", closeAt: 34 },
      { label: "Wiring", closeAt: -1 },
    ];
    const doorW = width * 0.2, doorH = height * 0.55;
    const startX = width * 0.06, gap = width * 0.02;
    for (let i = 0; i < 4; i++) {
      const dx = startX + i * (doorW + gap);
      const dy = height * 0.15;
      const d = doors[i];
      // Door frame
      ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(dx, dy, doorW, doorH);
      if (d.closeAt >= 0) {
        // Closing door
        const close = interpolate(frame, [d.closeAt, d.closeAt + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `hsla(0, 30%, 25%, ${close * 0.7})`;
        ctx.fillRect(dx + 1, dy + 1, (doorW - 2) * close, doorH - 2);
        ctx.fillStyle = `rgba(255,255,255,${0.6 - close * 0.4})`;
      } else {
        // Opening door (wiring)
        const open = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `hsla(50, 50%, 40%, ${open * 0.3})`;
        ctx.fillRect(dx + 1, dy + 1, doorW - 2, doorH - 2);
        // Gold glow
        if (open > 0) {
          ctx.shadowColor = PALETTE.accent.gold;
          ctx.shadowBlur = 10 * s * open;
          ctx.strokeStyle = `hsla(50, 70%, 55%, ${open * 0.6})`;
          ctx.strokeRect(dx, dy, doorW, doorH);
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = open > 0.5 ? PALETTE.accent.gold : PALETTE.text.primary;
      }
      ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(d.label, dx + doorW / 2, dy + doorH + 14 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Simple equation: data = NO, learning = NO, wiring = YES
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const items = [
      { left: "training data", right: "NO", t: 8, color: PALETTE.accent.red },
      { left: "learning", right: "NO", t: 25, color: PALETTE.accent.red },
      { left: "optimization", right: "NO", t: 42, color: PALETTE.accent.red },
      { left: "wiring", right: "YES", t: 58, color: PALETTE.accent.gold },
    ];
    const cy = height * 0.18;
    const lineH = height * 0.17;
    for (const item of items) {
      const idx = items.indexOf(item);
      const fade = interpolate(frame, [item.t, item.t + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fade > 0) {
        ctx.globalAlpha = alpha * fade;
        const y = cy + idx * lineH;
        ctx.fillStyle = PALETTE.text.primary;
        ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        ctx.fillText(item.left, width * 0.48, y);
        ctx.fillStyle = PALETTE.text.dim;
        ctx.fillText("=", width * 0.53, y);
        ctx.fillStyle = item.color;
        ctx.font = `bold ${13 * s}px system-ui`; ctx.textAlign = "left";
        ctx.fillText(item.right, width * 0.58, y);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Scales: ML side empty, Wiring side weighted
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const cx = width / 2, pivotY = height * 0.32;
    const tilt = interpolate(frame, [20, 55], [0, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const armLen = 80 * s;
    // Pivot
    ctx.fillStyle = PALETTE.text.dim;
    ctx.beginPath(); ctx.moveTo(cx, pivotY); ctx.lineTo(cx - 5 * s, pivotY + 10 * s); ctx.lineTo(cx + 5 * s, pivotY + 10 * s); ctx.closePath(); ctx.fill();
    // Stand
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, pivotY + 10 * s); ctx.lineTo(cx, height * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 25 * s, height * 0.75); ctx.lineTo(cx + 25 * s, height * 0.75); ctx.stroke();
    // Beam (tilted)
    const leftY = pivotY - Math.sin(tilt) * armLen * 0.3;
    const rightY = pivotY + Math.sin(tilt) * armLen * 0.3;
    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - armLen, leftY); ctx.lineTo(cx + armLen, rightY); ctx.stroke();
    // Left pan (ML — empty, lighter)
    const panW = 35 * s;
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx - armLen - panW, leftY + 15 * s);
    ctx.lineTo(cx - armLen + panW, leftY + 15 * s); ctx.stroke();
    // Strings
    ctx.beginPath(); ctx.moveTo(cx - armLen, leftY); ctx.lineTo(cx - armLen - panW, leftY + 15 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - armLen, leftY); ctx.lineTo(cx - armLen + panW, leftY + 15 * s); ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("ML", cx - armLen, leftY + 30 * s);
    // Right pan (Wiring — weighted)
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(cx + armLen - panW, rightY + 15 * s);
    ctx.lineTo(cx + armLen + panW, rightY + 15 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + armLen, rightY); ctx.lineTo(cx + armLen - panW, rightY + 15 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + armLen, rightY); ctx.lineTo(cx + armLen + panW, rightY + 15 * s); ctx.stroke();
    // Weight block on right pan
    if (tilt > 0.05) {
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.fillRect(cx + armLen - 12 * s, rightY + 2 * s, 24 * s, 12 * s);
    }
    ctx.fillStyle = PALETTE.text.accent; ctx.font = `${8 * s}px system-ui`;
    ctx.textAlign = "center"; ctx.fillText("Wiring", cx + armLen, rightY + 30 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Text "JUST THE WIRING" large centered, other words fading away small around it
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(12, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    // Scatter words that fade out
    const scatterWords = ["training", "learning", "data", "gradient", "loss", "epochs", "backprop", "optimizer"];
    const rand = seeded(44006);
    const fadeOut = interpolate(frame, [25, 55], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    for (const w of scatterWords) {
      const wx = 0.1 + rand() * 0.8, wy = 0.1 + rand() * 0.8;
      ctx.fillStyle = `rgba(255,255,255,${fadeOut})`;
      ctx.fillText(w, wx * width, wy * height);
    }
    // Main text appears
    const mainFade = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mainFade > 0) {
      ctx.globalAlpha = alpha * mainFade;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${22 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 15 * s * mainFade;
      ctx.fillText("JUST THE WIRING", width / 2, height / 2);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Neural net diagram with big X over it, then simple wiring diagram with checkmark
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    // Left: ML neural net layers
    const leftCx = width * 0.28, rightCx = width * 0.72;
    const layers = [3, 5, 4, 2];
    const layerSpacing = 28 * s;
    const startX = leftCx - (layers.length - 1) * layerSpacing / 2;
    for (let l = 0; l < layers.length; l++) {
      const lx = startX + l * layerSpacing;
      for (let n = 0; n < layers[l]; n++) {
        const ny = height * 0.4 + (n - (layers[l] - 1) / 2) * 16 * s;
        ctx.fillStyle = "hsla(220, 40%, 50%, 0.5)";
        ctx.beginPath(); ctx.arc(lx, ny, 4 * s, 0, Math.PI * 2); ctx.fill();
        // Connect to next layer
        if (l < layers.length - 1) {
          for (let m = 0; m < layers[l + 1]; m++) {
            const my = height * 0.4 + (m - (layers[l + 1] - 1) / 2) * 16 * s;
            ctx.strokeStyle = "hsla(220, 30%, 45%, 0.15)";
            ctx.lineWidth = 0.5 * s;
            ctx.beginPath(); ctx.moveTo(lx, ny); ctx.lineTo(startX + (l + 1) * layerSpacing, my); ctx.stroke();
          }
        }
      }
    }
    // Big X over neural net
    const xFade = interpolate(frame, [15, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xFade > 0) {
      ctx.globalAlpha = alpha * xFade;
      drawX(ctx, leftCx, height * 0.4, 45 * s, PALETTE.accent.red);
      ctx.globalAlpha = alpha;
    }
    // Right: simple wiring diagram
    const wireFade = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wireFade > 0) {
      ctx.globalAlpha = alpha * wireFade;
      const wNodes = [[0, -1], [0, 1], [1, 0], [2, -0.5], [2, 0.5]];
      for (const [wx, wy] of wNodes) {
        ctx.fillStyle = "hsla(160, 55%, 55%, 0.85)";
        ctx.beginPath();
        ctx.arc(rightCx - 15 * s + wx * 20 * s, height * 0.4 + wy * 15 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "hsla(160, 45%, 50%, 0.4)"; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(rightCx - 15 * s, height * 0.4 - 15 * s); ctx.lineTo(rightCx + 5 * s, height * 0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightCx - 15 * s, height * 0.4 + 15 * s); ctx.lineTo(rightCx + 5 * s, height * 0.4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightCx + 5 * s, height * 0.4); ctx.lineTo(rightCx + 25 * s, height * 0.4 - 8 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rightCx + 5 * s, height * 0.4); ctx.lineTo(rightCx + 25 * s, height * 0.4 + 8 * s); ctx.stroke();
      drawCheck(ctx, rightCx, height * 0.68, 20 * s, PALETTE.accent.green);
      ctx.globalAlpha = alpha;
    }
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("neural net", leftCx, height * 0.85);
    ctx.fillText("raw wiring", rightCx, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Crossed-out icons (graduation cap, gear, graph) -> highlighted circuit icon
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const icons = [
      { label: "Training", x: width * 0.16, crossAt: 10 },
      { label: "ML", x: width * 0.39, crossAt: 25 },
      { label: "Optimization", x: width * 0.62, crossAt: 40 },
    ];
    const iconY = height * 0.38, iconSz = 22 * s;
    // Draw icon placeholders (simple symbols)
    for (const ic of icons) {
      // Graduation cap shape
      if (ic.label === "Training") {
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(ic.x - iconSz * 0.4, iconY); ctx.lineTo(ic.x, iconY - iconSz * 0.3);
        ctx.lineTo(ic.x + iconSz * 0.4, iconY); ctx.lineTo(ic.x, iconY + iconSz * 0.15); ctx.closePath(); ctx.stroke();
      } else if (ic.label === "ML") {
        // Gear
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.arc(ic.x, iconY, iconSz * 0.25, 0, Math.PI * 2); ctx.stroke();
        for (let t = 0; t < 6; t++) {
          const a = (t / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(ic.x + Math.cos(a) * iconSz * 0.2, iconY + Math.sin(a) * iconSz * 0.2);
          ctx.lineTo(ic.x + Math.cos(a) * iconSz * 0.35, iconY + Math.sin(a) * iconSz * 0.35);
          ctx.stroke();
        }
      } else {
        // Graph line
        ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(ic.x - iconSz * 0.3, iconY + iconSz * 0.2);
        ctx.lineTo(ic.x - iconSz * 0.1, iconY - iconSz * 0.1);
        ctx.lineTo(ic.x + iconSz * 0.1, iconY + iconSz * 0.05);
        ctx.lineTo(ic.x + iconSz * 0.3, iconY - iconSz * 0.25); ctx.stroke();
      }
      // Cross out
      const cross = interpolate(frame, [ic.crossAt, ic.crossAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cross > 0) {
        ctx.globalAlpha = alpha * cross;
        drawX(ctx, ic.x, iconY, iconSz * 0.8, PALETTE.accent.red);
        ctx.globalAlpha = alpha;
      }
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText(ic.label, ic.x, iconY + iconSz * 0.7);
    }
    // Wiring icon (highlighted)
    const wireFade = interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wireFade > 0) {
      const wx = width * 0.84;
      ctx.globalAlpha = alpha * wireFade;
      // Simple circuit lines
      ctx.strokeStyle = PALETTE.accent.gold; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(wx - iconSz * 0.3, iconY - iconSz * 0.2);
      ctx.lineTo(wx, iconY); ctx.lineTo(wx + iconSz * 0.3, iconY - iconSz * 0.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, iconY); ctx.lineTo(wx + iconSz * 0.1, iconY + iconSz * 0.25); ctx.stroke();
      // Dots at junctions
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.beginPath(); ctx.arc(wx, iconY, 3 * s, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${8 * s}px system-ui`;
      ctx.textAlign = "center"; ctx.fillText("Wiring", wx, iconY + iconSz * 0.7);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Three options fading to gray, one lighting up gold: "Raw Wiring"
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(10, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const alpha = fadeInOut(frame, 90);
    ctx.globalAlpha = alpha;
    const options = [
      { text: "Training", fadeAt: 20 },
      { text: "Machine Learning", fadeAt: 30 },
      { text: "Optimization", fadeAt: 40 },
    ];
    const cx = width / 2;
    // All options start visible, then fade to gray
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const y = height * 0.2 + i * height * 0.15;
      const grayness = interpolate(frame, [opt.fadeAt, opt.fadeAt + 12], [0.7, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.fillStyle = `rgba(255,255,255,${grayness})`;
      ctx.font = `${11 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(opt.text, cx, y);
    }
    // "Raw Wiring" lights up gold
    const goldFade = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glowPulse = goldFade > 0 ? 0.85 + Math.sin(frame * 0.1) * 0.15 : 0;
    if (goldFade > 0) {
      ctx.globalAlpha = alpha * goldFade * glowPulse;
      ctx.fillStyle = PALETTE.accent.gold;
      ctx.font = `bold ${18 * s}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = PALETTE.accent.gold;
      ctx.shadowBlur = 12 * s;
      ctx.fillText("Raw Wiring", cx, height * 0.72);
      ctx.shadowBlur = 0;
      // Underline
      ctx.strokeStyle = PALETTE.accent.gold; ctx.lineWidth = 2 * s;
      const tw = ctx.measureText("Raw Wiring").width;
      ctx.beginPath(); ctx.moveTo(cx - tw / 2, height * 0.72 + 14 * s); ctx.lineTo(cx + tw / 2, height * 0.72 + 14 * s); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_044: VariantDef[] = [
  { id: "checklist", label: "Checklist", component: V1 },
  { id: "crossed-out", label: "Crossed Out", component: V2 },
  { id: "three-doors", label: "Three Doors", component: V3 },
  { id: "equation", label: "Equation", component: V4 },
  { id: "scales", label: "Scales", component: V5 },
  { id: "just-the-wiring", label: "Just The Wiring", component: V6 },
  { id: "net-vs-wiring", label: "Net vs Wiring", component: V7 },
  { id: "icon-crossout", label: "Icon Crossout", component: V8 },
  { id: "gold-highlight", label: "Gold Highlight", component: V9 },
];
