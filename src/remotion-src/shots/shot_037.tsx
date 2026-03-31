import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawPerson, drawBarChart } from "../icons";

// Shot 037 — "It adds them up."
// 9 ways to show summation: +3, +2, -1 = 4, threshold at 3

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Stacking bar chart: +3 blue, +2 blue, -1 red -> total 4, threshold line at 3
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3701), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, baseY = height * 0.78;
    const unitH = 12 * s, barW = 50 * s;
    const inputs = [
      { val: 3, color: PALETTE.accent.blue, label: "+3", delay: 10 },
      { val: 2, color: PALETTE.accent.blue, label: "+2", delay: 35 },
      { val: -1, color: PALETTE.accent.red, label: "-1", delay: 60 },
    ];
    // Threshold line at 3 units
    const threshY = baseY - 3 * unitH;
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.beginPath(); ctx.moveTo(cx - 45 * s, threshY); ctx.lineTo(cx + 45 * s, threshY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("threshold = 3", cx + 48 * s, threshY + 3 * s);
    // Stacking bars
    let stackTop = baseY;
    for (const inp of inputs) {
      const t = interpolate(frame - inp.delay, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      const h = Math.abs(inp.val) * unitH * t;
      if (inp.val > 0) {
        ctx.fillStyle = inp.color.replace(")", `, ${fo * 0.7})`).replace("rgb", "rgba");
        ctx.fillStyle = `hsla(220, 55%, 62%, ${fo * 0.7})`;
        ctx.fillRect(cx - barW / 2, stackTop - h, barW, h);
        ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${10 * s}px system-ui`; ctx.textAlign = "center";
        if (t > 0.5) ctx.fillText(inp.label, cx, stackTop - h / 2 + 4 * s);
        stackTop -= h;
      } else {
        // Negative: red block removes from top
        ctx.fillStyle = `hsla(350, 55%, 55%, ${fo * 0.7})`;
        ctx.fillRect(cx - barW / 2, stackTop - h, barW, h);
        if (t > 0.5) {
          ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${10 * s}px system-ui`; ctx.textAlign = "center";
          ctx.fillText(inp.label, cx, stackTop - h / 2 + 4 * s);
        }
        stackTop += Math.abs(inp.val) * unitH * t;
      }
    }
    // Result text
    const resultT = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (resultT > 0) {
      ctx.globalAlpha = fo * resultT;
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("= 4  >  threshold!", cx, height * 0.15);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Numbers appearing and adding: 3 + 2 - 1 = 4
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3702), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cy = height * 0.45;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const steps = [
      { text: "3", x: width * 0.18, delay: 10, color: PALETTE.accent.blue },
      { text: "+", x: width * 0.3, delay: 22, color: PALETTE.text.dim },
      { text: "2", x: width * 0.4, delay: 30, color: PALETTE.accent.blue },
      { text: "-", x: width * 0.52, delay: 42, color: PALETTE.text.dim },
      { text: "1", x: width * 0.62, delay: 50, color: PALETTE.accent.red },
      { text: "=", x: width * 0.74, delay: 62, color: PALETTE.text.dim },
      { text: "4", x: width * 0.85, delay: 70, color: PALETTE.text.accent },
    ];
    for (const step of steps) {
      const t = interpolate(frame - step.delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      const scale = 0.5 + t * 0.5;
      ctx.globalAlpha = fo * t;
      ctx.fillStyle = step.color;
      ctx.font = `bold ${24 * s * scale}px system-ui`;
      ctx.fillText(step.text, step.x, cy);
    }
    // Threshold comparison
    const thT = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (thT > 0) {
      ctx.globalAlpha = fo * thT;
      ctx.fillStyle = PALETTE.accent.green; ctx.font = `${13 * s}px system-ui`;
      ctx.fillText("4 > 3  (threshold)", width / 2, height * 0.7);
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`;
      ctx.fillText("FIRE!", width / 2, height * 0.82);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Water filling a container from multiple pipes, threshold line marked
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3703), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, containerW = 60 * s, containerH = 80 * s;
    const containerTop = height * 0.25, containerBot = containerTop + containerH;
    // Container outline
    ctx.strokeStyle = `hsla(220, 40%, 55%, ${fo * 0.6})`; ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - containerW / 2, containerTop);
    ctx.lineTo(cx - containerW / 2, containerBot);
    ctx.lineTo(cx + containerW / 2, containerBot);
    ctx.lineTo(cx + containerW / 2, containerTop);
    ctx.stroke();
    // Threshold line at 3/5 of container height (= 3/5 * 80 = 48)
    const threshFrac = 3 / 5;
    const threshY = containerBot - containerH * threshFrac;
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([4 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(cx - containerW / 2 - 10 * s, threshY);
    ctx.lineTo(cx + containerW / 2 + 10 * s, threshY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "left";
    ctx.fillText("threshold", cx + containerW / 2 + 13 * s, threshY + 3 * s);
    // Fill level: +3 at frame 20-35, +2 at 40-55, -1 at 60-75
    let level = 0;
    level += interpolate(frame, [15, 35], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    level += interpolate(frame, [40, 55], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    level -= interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillFrac = Math.max(0, level / 5);
    const fillH = containerH * fillFrac;
    const fillTop = containerBot - fillH;
    // Water fill
    const aboveThresh = fillTop < threshY;
    ctx.fillStyle = aboveThresh ? `hsla(140, 50%, 50%, ${fo * 0.5})` : `hsla(220, 50%, 55%, ${fo * 0.4})`;
    ctx.fillRect(cx - containerW / 2 + 2 * s, fillTop, containerW - 4 * s, fillH);
    // Pipe labels
    const pipes = [
      { label: "+3", x: cx - 35 * s, active: frame >= 15 && frame < 35, hue: 220 },
      { label: "+2", x: cx, active: frame >= 40 && frame < 55, hue: 220 },
      { label: "-1", x: cx + 35 * s, active: frame >= 60 && frame < 75, hue: 350 },
    ];
    for (const pipe of pipes) {
      ctx.fillStyle = pipe.active ? `hsla(${pipe.hue}, 55%, 60%, ${fo})` : PALETTE.text.dim;
      ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(pipe.label, pipe.x, containerTop - 10 * s);
      // Drip animation when active
      if (pipe.active) {
        const drip = (frame * 0.15) % 1;
        ctx.fillStyle = `hsla(${pipe.hue}, 50%, 60%, ${fo * 0.6})`;
        ctx.beginPath(); ctx.arc(pipe.x, containerTop + drip * (fillTop - containerTop), 2 * s, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Level readout
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`level: ${level.toFixed(0)}`, cx, height * 0.9);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Battery charging: signal inputs add charge level
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3704), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const batW = 70 * s, batH = 35 * s;
    // Battery outline
    ctx.strokeStyle = `hsla(220, 40%, 55%, ${fo * 0.7})`; ctx.lineWidth = 2.5 * s;
    ctx.strokeRect(cx - batW / 2, cy - batH / 2, batW, batH);
    // Terminal nub
    ctx.fillStyle = `hsla(220, 40%, 55%, ${fo * 0.7})`;
    ctx.fillRect(cx + batW / 2, cy - 6 * s, 5 * s, 12 * s);
    // Charge level
    let charge = 0;
    charge += interpolate(frame, [15, 30], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge += interpolate(frame, [38, 50], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge -= interpolate(frame, [58, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxCharge = 5;
    const fillFrac = Math.max(0, charge / maxCharge);
    const fillW = (batW - 6 * s) * fillFrac;
    const aboveThresh = charge >= 3;
    ctx.fillStyle = aboveThresh ? `hsla(140, 55%, 50%, ${fo * 0.6})` : `hsla(220, 50%, 55%, ${fo * 0.5})`;
    ctx.fillRect(cx - batW / 2 + 3 * s, cy - batH / 2 + 3 * s, fillW, batH - 6 * s);
    // Threshold marker at 3/5
    const threshX = cx - batW / 2 + 3 * s + (batW - 6 * s) * (3 / 5);
    ctx.strokeStyle = `hsla(50, 55%, 60%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(threshX, cy - batH / 2 - 5 * s); ctx.lineTo(threshX, cy + batH / 2 + 5 * s); ctx.stroke();
    ctx.setLineDash([]);
    // Input labels
    const labels = [
      { text: "+3", delay: 15, hue: 220 },
      { text: "+2", delay: 38, hue: 220 },
      { text: "-1", delay: 58, hue: 350 },
    ];
    ctx.font = `bold ${12 * s}px system-ui`; ctx.textAlign = "center";
    for (let i = 0; i < labels.length; i++) {
      const lt = interpolate(frame - labels[i].delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lt > 0) {
        ctx.globalAlpha = fo * lt;
        ctx.fillStyle = `hsla(${labels[i].hue}, 55%, 60%, 1)`;
        ctx.fillText(labels[i].text, cx - 30 * s + i * 30 * s, cy - batH / 2 - 15 * s);
      }
    }
    // Result
    ctx.globalAlpha = fo;
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px system-ui`;
    ctx.fillText(`charge: ${charge.toFixed(0)} / ${maxCharge}`, cx, cy + batH / 2 + 20 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron body fills up with color as inputs arrive
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3705), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const neuronR = 30 * s;
    // Calculate fill
    let charge = 0;
    charge += interpolate(frame, [15, 30], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge += interpolate(frame, [38, 50], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge -= interpolate(frame, [58, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fillFrac = Math.max(0, Math.min(1, charge / 5));
    const aboveThresh = charge >= 3;
    // Neuron outline
    ctx.strokeStyle = `hsla(280, 45%, 55%, ${fo * 0.6})`; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(cx, cy, neuronR, 0, Math.PI * 2); ctx.stroke();
    // Fill from bottom up
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, neuronR - 1 * s, 0, Math.PI * 2); ctx.clip();
    const fillTop = cy + neuronR - fillFrac * neuronR * 2;
    const fillColor = aboveThresh ? `hsla(140, 55%, 55%, ${fo * 0.6})` : `hsla(220, 50%, 55%, ${fo * 0.5})`;
    ctx.fillStyle = fillColor;
    ctx.fillRect(cx - neuronR, fillTop, neuronR * 2, cy + neuronR - fillTop);
    ctx.restore();
    // Threshold ring
    const threshY = cy + neuronR - (3 / 5) * neuronR * 2;
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(cx - neuronR - 8 * s, threshY); ctx.lineTo(cx + neuronR + 8 * s, threshY); ctx.stroke();
    ctx.setLineDash([]);
    // Dendrites
    ctx.strokeStyle = `hsla(280, 45%, 55%, ${fo * 0.5})`; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
    const inputs = [
      { label: "+3", angle: Math.PI * 0.8, delay: 15, hue: 220 },
      { label: "+2", angle: Math.PI, delay: 38, hue: 220 },
      { label: "-1", angle: Math.PI * 1.2, delay: 58, hue: 350 },
    ];
    for (const inp of inputs) {
      const dx = Math.cos(inp.angle) * neuronR * 1.8, dy = Math.sin(inp.angle) * neuronR * 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
      const lt = interpolate(frame - inp.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lt > 0) {
        ctx.fillStyle = `hsla(${inp.hue}, 55%, 60%, ${fo * lt})`;
        ctx.font = `bold ${10 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(inp.label, cx + dx * 1.15, cy + dy * 1.15 + 4 * s);
      }
    }
    // Fire burst when threshold crossed
    if (aboveThresh && charge >= 3) {
      const burstT = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (burstT > 0) {
        const glow = ctx.createRadialGradient(cx, cy, neuronR, cx, cy, neuronR * 3);
        glow.addColorStop(0, `hsla(50, 60%, 65%, ${fo * (1 - burstT) * 0.3})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(cx, cy, neuronR * 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Balance scale: inputs land on one side, threshold weight on other
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3706), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, pivotY = height * 0.4;
    // Calculate tilt
    let inputWeight = 0;
    inputWeight += interpolate(frame, [15, 28], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    inputWeight += interpolate(frame, [35, 48], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    inputWeight -= interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const threshWeight = 3;
    const tilt = Math.min(0.15, Math.max(-0.15, (inputWeight - threshWeight) * 0.04));
    // Pivot triangle
    ctx.fillStyle = `hsla(220, 40%, 50%, ${fo * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, pivotY + 8 * s);
    ctx.lineTo(cx + 8 * s, pivotY + 8 * s);
    ctx.lineTo(cx, pivotY - 4 * s);
    ctx.closePath(); ctx.fill();
    // Stand
    ctx.strokeStyle = `hsla(220, 35%, 45%, ${fo * 0.5})`; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(cx, pivotY + 8 * s); ctx.lineTo(cx, height * 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 25 * s, height * 0.75); ctx.lineTo(cx + 25 * s, height * 0.75); ctx.stroke();
    // Beam
    const beamLen = 65 * s;
    ctx.save();
    ctx.translate(cx, pivotY);
    ctx.rotate(tilt);
    ctx.strokeStyle = `hsla(220, 40%, 55%, ${fo * 0.7})`; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
    // Left pan (inputs)
    const panW = 30 * s;
    ctx.strokeStyle = `hsla(220, 40%, 50%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(-beamLen, 18 * s); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-beamLen - panW / 2, 18 * s);
    ctx.quadraticCurveTo(-beamLen, 25 * s, -beamLen + panW / 2, 18 * s);
    ctx.stroke();
    // Input blocks on left pan
    const blocks = Math.min(Math.floor(inputWeight), 5);
    for (let i = 0; i < blocks; i++) {
      ctx.fillStyle = i < 5 ? `hsla(220, 50%, 58%, ${fo * 0.7})` : `hsla(350, 50%, 55%, ${fo * 0.7})`;
      ctx.fillRect(-beamLen - 6 * s + (i % 3) * 5 * s, 12 * s - Math.floor(i / 3) * 7 * s, 4 * s, 6 * s);
    }
    // Right pan (threshold)
    ctx.beginPath(); ctx.moveTo(beamLen, 0); ctx.lineTo(beamLen, 18 * s); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(beamLen - panW / 2, 18 * s);
    ctx.quadraticCurveTo(beamLen, 25 * s, beamLen + panW / 2, 18 * s);
    ctx.stroke();
    // Threshold weight
    ctx.fillStyle = `hsla(50, 50%, 55%, ${fo * 0.6})`;
    ctx.fillRect(beamLen - 8 * s, 8 * s, 16 * s, 10 * s);
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("3", beamLen, 16 * s);
    ctx.restore();
    // Labels
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("inputs", cx - beamLen, height * 0.82);
    ctx.fillText("threshold", cx + beamLen, height * 0.82);
    // Result
    if (inputWeight >= 3) {
      const rT = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rT > 0) {
        ctx.globalAlpha = fo * rT;
        ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${12 * s}px system-ui`;
        ctx.fillText("inputs win \u2192 fire!", cx, height * 0.2);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Progress bar filling up with each input, threshold marker
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3707), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height / 2;
    const barW = width * 0.7, barH = 22 * s;
    const barX = cx - barW / 2, barY = cy - barH / 2;
    // Background bar
    ctx.fillStyle = `hsla(220, 25%, 20%, ${fo * 0.5})`;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = `hsla(220, 35%, 45%, ${fo * 0.4})`; ctx.lineWidth = 1.5 * s;
    ctx.strokeRect(barX, barY, barW, barH);
    // Fill level
    let charge = 0;
    charge += interpolate(frame, [15, 30], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge += interpolate(frame, [38, 50], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    charge -= interpolate(frame, [58, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const maxVal = 5;
    const fillFrac = Math.max(0, charge / maxVal);
    const aboveThresh = charge >= 3;
    ctx.fillStyle = aboveThresh ? `hsla(140, 55%, 50%, ${fo * 0.6})` : `hsla(220, 50%, 55%, ${fo * 0.5})`;
    ctx.fillRect(barX + 2 * s, barY + 2 * s, (barW - 4 * s) * fillFrac, barH - 4 * s);
    // Threshold marker
    const threshX = barX + barW * (3 / maxVal);
    ctx.strokeStyle = `hsla(50, 55%, 60%, ${fo * 0.7})`; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(threshX, barY - 8 * s); ctx.lineTo(threshX, barY + barH + 8 * s); ctx.stroke();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("threshold", threshX, barY - 12 * s);
    // Input labels above bar at their timing
    const inputs = [
      { text: "+3", delay: 15, x: barX + barW * 0.3, hue: 220 },
      { text: "+2", delay: 38, x: barX + barW * 0.5, hue: 220 },
      { text: "-1", delay: 58, x: barX + barW * 0.4, hue: 350 },
    ];
    for (const inp of inputs) {
      const lt = interpolate(frame - inp.delay, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fade = interpolate(frame - inp.delay, [12, 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lt > 0 && fade > 0) {
        ctx.globalAlpha = fo * lt * fade;
        ctx.fillStyle = `hsla(${inp.hue}, 55%, 60%, 1)`;
        ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(inp.text, inp.x, barY - 25 * s);
      }
    }
    // Value readout
    ctx.globalAlpha = fo;
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(charge.toFixed(0), barX + (barW - 4 * s) * fillFrac + 2 * s, cy + 4 * s);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Tug of war: positive/negative signals, net pulls past threshold
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3708), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.45;
    // Calculate net position
    let positive = 0, negative = 0;
    positive += interpolate(frame, [15, 28], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    positive += interpolate(frame, [35, 48], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    negative += interpolate(frame, [55, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const net = positive - negative;
    const maxShift = 50 * s;
    const shift = (net / 5) * maxShift;
    // Rope
    ctx.strokeStyle = `hsla(40, 40%, 50%, ${fo * 0.6})`; ctx.lineWidth = 3 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx - 80 * s + shift, cy); ctx.lineTo(cx + 80 * s + shift, cy); ctx.stroke();
    // Center marker (threshold at 3)
    const threshShift = (3 / 5) * maxShift;
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * 0.5})`; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([3 * s, 3 * s]);
    ctx.beginPath(); ctx.moveTo(cx + threshShift, cy - 20 * s); ctx.lineTo(cx + threshShift, cy + 20 * s); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("threshold", cx + threshShift, cy + 28 * s);
    // Ground line marker
    ctx.strokeStyle = `hsla(220, 30%, 40%, ${fo * 0.3})`; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy - 15 * s); ctx.lineTo(cx, cy + 15 * s); ctx.stroke();
    // Positive pullers (left side, pulling right)
    const pColor = PALETTE.accent.blue;
    for (let i = 0; i < Math.min(5, Math.floor(positive)); i++) {
      drawPerson(ctx, cx - 85 * s - i * 15 * s + shift, cy, 8 * s, pColor);
    }
    // Negative pullers (right side, pulling left)
    const nColor = PALETTE.accent.red;
    for (let i = 0; i < Math.min(1, Math.floor(negative)); i++) {
      drawPerson(ctx, cx + 85 * s + i * 15 * s + shift, cy, 8 * s, nColor);
    }
    // Knot marker on rope
    ctx.fillStyle = `hsla(50, 55%, 60%, ${fo})`;
    ctx.beginPath(); ctx.arc(cx + shift, cy, 5 * s, 0, Math.PI * 2); ctx.fill();
    // Labels
    ctx.fillStyle = PALETTE.accent.blue; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText(`+${positive.toFixed(0)}`, cx - 50 * s + shift, cy - 18 * s);
    if (negative > 0) {
      ctx.fillStyle = PALETTE.accent.red;
      ctx.fillText(`-${negative.toFixed(0)}`, cx + 60 * s + shift, cy - 18 * s);
    }
    // Result
    if (net >= 3) {
      const rT = interpolate(frame, [78, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rT > 0) {
        ctx.globalAlpha = fo * rT;
        ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${13 * s}px system-ui`;
        ctx.fillText("past threshold \u2192 fire!", cx, height * 0.8);
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Digital counter incrementing: +3 -> 3 -> +2 -> 5 -> -1 -> 4 -> threshold!
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s, 3709), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 120);
    ctx.globalAlpha = fo;
    const cx = width / 2, cy = height * 0.4;
    // Calculate running total
    let total = 0;
    total += interpolate(frame, [10, 22], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const t2start = 35;
    total += interpolate(frame, [t2start, t2start + 12], [0, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const t3start = 58;
    total -= interpolate(frame, [t3start, t3start + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayTotal = Math.round(total);
    const aboveThresh = displayTotal >= 3;
    // Big counter display
    ctx.fillStyle = aboveThresh ? PALETTE.accent.gold : PALETTE.text.primary;
    ctx.font = `bold ${52 * s}px monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(displayTotal), cx, cy);
    // Input annotations
    const annotations = [
      { text: "+3", frame: 10, endFrame: 30, color: PALETTE.accent.blue },
      { text: "+2", frame: t2start, endFrame: t2start + 18, color: PALETTE.accent.blue },
      { text: "-1", frame: t3start, endFrame: t3start + 15, color: PALETTE.accent.red },
    ];
    for (const ann of annotations) {
      const show = frame >= ann.frame && frame < ann.endFrame;
      if (show) {
        const at = interpolate(frame, [ann.frame, ann.frame + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = fo * at;
        ctx.fillStyle = ann.color; ctx.font = `bold ${18 * s}px system-ui`;
        ctx.fillText(ann.text, cx + 50 * s, cy - 15 * s);
      }
    }
    // Threshold line
    ctx.globalAlpha = fo;
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("threshold = 3", cx, height * 0.65);
    ctx.strokeStyle = `hsla(50, 50%, 55%, ${fo * 0.4})`; ctx.lineWidth = 1 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.beginPath(); ctx.moveTo(cx - 50 * s, height * 0.6); ctx.lineTo(cx + 50 * s, height * 0.6); ctx.stroke();
    ctx.setLineDash([]);
    // "FIRE!" flash
    if (aboveThresh && frame > 75) {
      const fireT = interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fo * fireT;
      ctx.fillStyle = PALETTE.accent.gold; ctx.font = `bold ${20 * s}px system-ui`;
      ctx.fillText("FIRE!", cx, height * 0.82);
      // Burst glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * s);
      glow.addColorStop(0, `hsla(50, 60%, 65%, ${fo * fireT * 0.1})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 60 * s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_037: VariantDef[] = [
  { id: "stacking-bar", label: "Stacking Bars", component: V1 },
  { id: "math-add", label: "Math Addition", component: V2 },
  { id: "water-fill", label: "Water Container", component: V3 },
  { id: "battery", label: "Battery Charge", component: V4 },
  { id: "neuron-fill", label: "Neuron Fill", component: V5 },
  { id: "balance-scale", label: "Balance Scale", component: V6 },
  { id: "progress-bar", label: "Progress Bar", component: V7 },
  { id: "tug-of-war", label: "Tug of War", component: V8 },
  { id: "digital-counter", label: "Digital Counter", component: V9 },
];
