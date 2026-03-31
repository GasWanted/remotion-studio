import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron, drawFlyTop, drawCheck, drawX } from "../icons";

// Shot 57 — "There's no body, no world, no consequences.
//            To really know if this thing works, you have to give it something to control."

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // Three phrases fading in
    const phrases = ["no body", "no world", "no consequences"];
    for (let i = 0; i < 3; i++) {
      const appear = t > (i + 0.5) / 5;
      if (appear) {
        const a = interpolate(t, [(i + 0.5) / 5, (i + 1.5) / 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`; ctx.font = `${14 * s}px system-ui`;
        ctx.fillText(phrases[i], width / 2, height * (0.25 + i * 0.14));
      }
    }
    // Fly body outline materializing
    if (t > 0.7) {
      const bodyA = interpolate(t, [0.7, 1], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFlyTop(ctx, width / 2, height * 0.72, 25 * s, `hsla(200, 40%, 55%, ${bodyA})`);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain with empty plug socket on left
    drawNeuron(ctx, width * 0.25, height * 0.45, 20 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Socket (open circle)
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.arc(width * 0.48, height * 0.45, 8 * s, 0, Math.PI * 2); ctx.stroke();
    // Plug/connector line from brain to socket
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.35, height * 0.45); ctx.lineTo(width * 0.4, height * 0.45); ctx.stroke();
    // Body silhouette materializing on right
    if (t > 0.5) {
      const bodyA = interpolate(t, [0.5, 1], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFlyTop(ctx, width * 0.75, height * 0.45, 25 * s, `hsla(200, 40%, 55%, ${bodyA})`);
      // Connector from socket to body
      ctx.strokeStyle = `rgba(255,255,255,${bodyA * 0.3})`; ctx.lineWidth = 1.5 * s;
      ctx.setLineDash([3 * s, 3 * s]);
      ctx.beginPath(); ctx.moveTo(width * 0.56, height * 0.45); ctx.lineTo(width * 0.63, height * 0.45); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("needs connection", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center"; ctx.font = `${12 * s}px system-ui`;
    // brain → ??? → behavior
    ctx.fillStyle = PALETTE.text.primary; ctx.fillText("brain", width * 0.2, height * 0.48);
    drawNeuron(ctx, width * 0.2, height * 0.35, 15 * s, `hsla(280, 45%, 55%, 0.5)`, frame);
    // Arrow
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.32, height * 0.42); ctx.lineTo(width * 0.42, height * 0.42); ctx.stroke();
    // ???
    const qPulse = 0.5 + 0.5 * Math.sin(frame * 0.08);
    ctx.fillStyle = `rgba(232,193,112,${qPulse * 0.7})`; ctx.font = `bold ${20 * s}px system-ui`;
    ctx.fillText("???", width / 2, height * 0.45);
    // Arrow
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.58, height * 0.42); ctx.lineTo(width * 0.68, height * 0.42); ctx.stroke();
    // Behavior
    ctx.fillStyle = PALETTE.text.primary; ctx.font = `${12 * s}px system-ui`;
    ctx.fillText("behavior", width * 0.8, height * 0.48);
    // Subtitle
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("the gap needs to be filled", width / 2, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain connected to nothing
    drawNeuron(ctx, width * 0.3, height * 0.45, 20 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Disconnected line
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.beginPath(); ctx.moveTo(width * 0.42, height * 0.45); ctx.lineTo(width * 0.58, height * 0.45); ctx.stroke();
    ctx.setLineDash([]);
    // Phantom fly body forming
    if (t > 0.5) {
      const bodyA = interpolate(t, [0.5, 1], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Ghost outline shimmer
      const shimmer = 0.8 + 0.2 * Math.sin(frame * 0.1);
      drawFlyTop(ctx, width * 0.72, height * 0.45, 25 * s, `hsla(200, 40%, 55%, ${bodyA * shimmer})`);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("a body starts to form", width / 2, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "left"; ctx.font = `${12 * s}px system-ui`;
    // Checklist
    const items = [
      { label: "Brain", done: true },
      { label: "Body", done: false },
      { label: "World", done: false },
    ];
    for (let i = 0; i < items.length; i++) {
      const appear = t > (i + 0.5) / 5;
      if (!appear) continue;
      const iy = height * (0.3 + i * 0.15);
      if (items[i].done) {
        drawCheck(ctx, width * 0.3, iy - 2 * s, 10 * s, PALETTE.accent.green);
      } else {
        drawX(ctx, width * 0.3, iy - 2 * s, 10 * s, PALETTE.accent.red);
      }
      ctx.fillStyle = items[i].done ? PALETTE.text.primary : PALETTE.text.dim;
      ctx.fillText(items[i].label, width * 0.4, iy + 4 * s);
    }
    // Bottom quote
    if (t > 0.7) {
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("give it something to control", width / 2, height * 0.82);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // Joystick / controller icon (simple)
    const cx = width / 2, cy = height * 0.38;
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2 * s;
    // Stick base
    ctx.beginPath(); ctx.ellipse(cx, cy + 20 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2); ctx.stroke();
    // Stick
    const wobble = Math.sin(frame * 0.05) * 3 * s;
    ctx.beginPath(); ctx.moveTo(cx, cy + 15 * s); ctx.lineTo(cx + wobble, cy - 10 * s); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath(); ctx.arc(cx + wobble, cy - 10 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
    // Disconnected cable
    ctx.setLineDash([3 * s, 3 * s]); ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath(); ctx.moveTo(cx, cy + 28 * s); ctx.lineTo(cx, cy + 50 * s); ctx.stroke();
    ctx.setLineDash([]);
    // Brain disconnected
    drawNeuron(ctx, cx, cy + 65 * s, 15 * s, `hsla(280, 40%, 50%, 0.4)`, frame);
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`;
    ctx.fillText("disconnected", cx, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain sending commands into void
    drawNeuron(ctx, width * 0.25, height * 0.4, 18 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Signal pulses going right into nothing
    for (let i = 0; i < 4; i++) {
      const pulseT = (frame * 0.02 + i * 0.25) % 1;
      const px = width * 0.38 + pulseT * width * 0.25;
      const alpha = (1 - pulseT) * 0.4;
      ctx.fillStyle = `rgba(232,193,112,${alpha})`;
      ctx.beginPath(); ctx.arc(px, height * 0.4, 3 * s, 0, Math.PI * 2); ctx.fill();
    }
    // Body outline catching signals
    if (t > 0.5) {
      const bodyA = interpolate(t, [0.5, 1], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFlyTop(ctx, width * 0.75, height * 0.4, 22 * s, `hsla(200, 40%, 55%, ${bodyA})`);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("give it something to control", width / 2, height * 0.78);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(15, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [15, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.textAlign = "center";
    // Text appearing line by line
    const lines = [
      { text: "to really know...", t: 0.1 },
      { text: "give it something", t: 0.45 },
      { text: "to control.", t: 0.65 },
    ];
    for (const l of lines) {
      if (t > l.t) {
        const a = interpolate(t, [l.t, l.t + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const i = lines.indexOf(l);
        ctx.fillStyle = i === 2 ? `rgba(232,193,112,${a})` : `rgba(255,255,255,${a * 0.7})`;
        ctx.font = i === 2 ? `bold ${16 * s}px system-ui` : `${13 * s}px system-ui`;
        ctx.fillText(l.text, width / 2, height * (0.35 + i * 0.15));
      }
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(20, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height); drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150); ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Brain on left
    drawNeuron(ctx, width * 0.25, height * 0.45, 20 * s, `hsla(280, 45%, 55%, 0.7)`, frame);
    // Arrow pointing right
    ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(width * 0.38, height * 0.45); ctx.lineTo(width * 0.52, height * 0.45); ctx.stroke();
    // Arrow head
    ctx.beginPath(); ctx.moveTo(width * 0.52, height * 0.45);
    ctx.lineTo(width * 0.49, height * 0.42); ctx.moveTo(width * 0.52, height * 0.45);
    ctx.lineTo(width * 0.49, height * 0.48); ctx.stroke();
    // Empty space where body should be
    if (t < 0.6) {
      ctx.setLineDash([4 * s, 4 * s]); ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.ellipse(width * 0.72, height * 0.45, 20 * s, 28 * s, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("?", width * 0.72, height * 0.48);
    }
    // Body silhouette fading in
    if (t > 0.55) {
      const bodyA = interpolate(t, [0.55, 1], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFlyTop(ctx, width * 0.72, height * 0.45, 25 * s, `hsla(200, 40%, 55%, ${bodyA})`);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("embodiment", width / 2, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_057: VariantDef[] = [
  { id: "three-phrases", label: "Three Phrases", component: V1 },
  { id: "plug-socket", label: "Plug Socket", component: V2 },
  { id: "brain-gap", label: "Brain ??? Gap", component: V3 },
  { id: "phantom-body", label: "Phantom Body", component: V4 },
  { id: "checklist", label: "Checklist", component: V5 },
  { id: "joystick", label: "Joystick", component: V6 },
  { id: "pulse-catch", label: "Pulse Catch", component: V7 },
  { id: "text-reveal", label: "Text Reveal", component: V8 },
  { id: "body-fadein", label: "Body Fade-in", component: V9 },
];
