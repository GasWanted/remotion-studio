import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 038 — "It's a remote control for individual neurons in a living animal."
   90 frames (3s). Remote control with neuron buttons. */

const DUR = 90;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: TV remote with labeled neuron buttons ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.45;
    // Remote body
    const remoteW = W * 0.28, remoteH = H * 0.6;
    const rx = cx - remoteW / 2, ry = cy - remoteH / 2;
    const scaleP = interpolate(frame, [5, 20], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, cy); ctx.scale(scaleP, scaleP); ctx.translate(-cx, -cy);
    ctx.globalAlpha = a * 0.8; ctx.fillStyle = "rgba(40,30,55,0.9)";
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry); ctx.lineTo(rx + remoteW - 8, ry);
    ctx.quadraticCurveTo(rx + remoteW, ry, rx + remoteW, ry + 8);
    ctx.lineTo(rx + remoteW, ry + remoteH - 8);
    ctx.quadraticCurveTo(rx + remoteW, ry + remoteH, rx + remoteW - 8, ry + remoteH);
    ctx.lineTo(rx + 8, ry + remoteH);
    ctx.quadraticCurveTo(rx, ry + remoteH, rx, ry + remoteH - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.quadraticCurveTo(rx, ry, rx + 8, ry);
    ctx.fill();
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1; ctx.stroke();
    // Buttons
    const buttons = ["JUMP", "FEED", "GROOM", "TURN", "WALK"];
    const btnColors = [FB.red, FB.gold, FB.teal, FB.blue, FB.green];
    buttons.forEach((label, i) => {
      const by = ry + 20 + i * (remoteH - 40) / 5;
      const t = stagger(frame, i, 6, 12);
      ctx.globalAlpha = a * t * 0.8;
      ctx.fillStyle = btnColors[i];
      ctx.beginPath();
      ctx.arc(cx, by + 8, 6, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath(); ctx.arc(cx - 1.5, by + 6, 2, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, label, cx, by + 22, 6, a * t, "center", btnColors[i]);
    });
    ctx.restore();
    // Press animation on "JUMP" button
    const pressP = interpolate(frame, [55, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pressP > 0) {
      const glow = ctx.createRadialGradient(cx, ry + 28, 0, cx, ry + 28, 20);
      glow.addColorStop(0, `rgba(232,80,80,${pressP * 0.5})`); glow.addColorStop(1, "rgba(232,80,80,0)");
      ctx.globalAlpha = a; ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, ry + 28, 20, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "REMOTE CONTROL", cx, H * 0.92, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Hand pressing button → signal → neuron fires → behavior label ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Button on left
    const pressP = interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.15, H * 0.45, 10 - pressP * 2, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "PRESS", W * 0.15, H * 0.6, 7, a * pressP, "center", FB.text.dim);
    // Signal wave
    const sigP = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sigP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = W * 0.22; x < W * 0.22 + sigP * W * 0.3; x += 2) {
      const y = H * 0.45 + Math.sin((x - W * 0.22) * 0.2) * 8;
      if (x <= W * 0.23) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Neuron in center
    drawFBNode(ctx, W * 0.58, H * 0.45, 10, 0, a * sigP, frame);
    // Fire and label on right
    const fireP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fireP > 0) {
      for (let s = 0; s < 4; s++) {
        const ang = (s / 4) * Math.PI * 2;
        ctx.globalAlpha = a * fireP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.58 + Math.cos(ang) * 12, H * 0.45 + Math.sin(ang) * 12);
        ctx.lineTo(W * 0.58 + Math.cos(ang) * 22, H * 0.45 + Math.sin(ang) * 22);
        ctx.stroke();
      }
      drawFBText(ctx, "BEHAVIOR", W * 0.82, H * 0.45, 10, a * fireP, "center", FB.gold);
    }
    drawFBText(ctx, "NEURON REMOTE CONTROL", W / 2, H * 0.88, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Game controller with neuron icons instead of buttons ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Controller body
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = "rgba(50,35,65,0.8)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, W * 0.3, H * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1; ctx.stroke();
    // D-pad of neurons (left side)
    const dPadX = cx - W * 0.12, dPadY = cy;
    const dirs = [
      { dx: 0, dy: -12, label: "UP" }, { dx: 0, dy: 12, label: "DN" },
      { dx: -12, dy: 0, label: "L" }, { dx: 12, dy: 0, label: "R" },
    ];
    dirs.forEach((d, i) => {
      const t = stagger(frame, i, 5, 10);
      drawFBNode(ctx, dPadX + d.dx, dPadY + d.dy, 5, i + 2, a * t, frame);
    });
    // Action neurons (right side)
    const actX = cx + W * 0.12, actY = cy;
    const actions = [
      { dx: 0, dy: -12, label: "JUMP", c: 0 },
      { dx: 12, dy: 0, label: "FEED", c: 3 },
      { dx: 0, dy: 12, label: "GROOM", c: 4 },
      { dx: -12, dy: 0, label: "TURN", c: 5 },
    ];
    actions.forEach((act, i) => {
      const t = stagger(frame, i + 4, 5, 10);
      drawFBNode(ctx, actX + act.dx, actY + act.dy, 5, act.c, a * t, frame);
      drawFBText(ctx, act.label, actX + act.dx, actY + act.dy + 10, 5, a * t * 0.7, "center", FB.text.dim);
    });
    // Highlight cycling button
    const activeIdx = Math.floor((frame / 15) % 4);
    const act = actions[activeIdx];
    ctx.globalAlpha = a * 0.3;
    const glow = ctx.createRadialGradient(actX + act.dx, actY + act.dy, 0, actX + act.dx, actY + act.dy, 12);
    glow.addColorStop(0, FB.red); glow.addColorStop(1, "rgba(232,80,80,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(actX + act.dx, actY + act.dy, 12, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "NEURON CONTROLLER", cx, H * 0.88, 9, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Light switch panel — each switch activates a different neuron ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const switches = ["JUMP", "WALK", "FEED", "TURN"];
    const colors = [FB.red, FB.green, FB.gold, FB.blue];
    const sw = W * 0.16, gap = W * 0.04;
    const totalW = switches.length * sw + (switches.length - 1) * gap;
    const startX = W / 2 - totalW / 2;
    switches.forEach((label, i) => {
      const x = startX + i * (sw + gap) + sw / 2;
      const t = stagger(frame, i, 8, 15);
      const flipFrame = 30 + i * 12;
      const isOn = frame > flipFrame;
      const flipP = interpolate(frame, [flipFrame, flipFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Switch plate
      ctx.globalAlpha = a * t * 0.5; ctx.fillStyle = "rgba(40,30,55,0.8)";
      ctx.fillRect(x - sw / 2 + 4, H * 0.25, sw - 8, H * 0.45);
      ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.strokeRect(x - sw / 2 + 4, H * 0.25, sw - 8, H * 0.45);
      // Toggle position
      const toggleY = isOn ? H * 0.35 : H * 0.55;
      ctx.globalAlpha = a * t; ctx.fillStyle = isOn ? colors[i] : "rgba(80,60,100,0.6)";
      ctx.fillRect(x - 5, toggleY, 10, 12);
      // Neuron glow when on
      if (isOn && flipP > 0) {
        drawFBNode(ctx, x, H * 0.8, 6, i, a * flipP, frame);
        drawFBText(ctx, label, x, H * 0.88, 6, a * flipP, "center", colors[i]);
      } else {
        drawFBText(ctx, label, x, H * 0.78, 6, a * t * 0.5, "center", FB.text.dim);
      }
    });
    drawFBText(ctx, "REMOTE CONTROL", W / 2, H * 0.12, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Dial knob — rotate to select neuron, press to fire ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const dialR = Math.min(W, H) * 0.22;
    // Dial body
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = "rgba(45,32,58,0.8)";
    ctx.beginPath(); ctx.arc(cx, cy, dialR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5; ctx.stroke();
    // Neuron labels around dial
    const neurons = ["JUMP", "WALK", "FEED", "GROOM", "TURN"];
    const nColors = [FB.red, FB.green, FB.gold, FB.teal, FB.blue];
    neurons.forEach((n, i) => {
      const ang = (i / neurons.length) * Math.PI * 2 - Math.PI / 2;
      const lx = cx + Math.cos(ang) * (dialR + 12);
      const ly = cy + Math.sin(ang) * (dialR + 12);
      drawFBText(ctx, n, lx, ly, 6, a * 0.7, "center", nColors[i]);
      // Tick mark
      ctx.globalAlpha = a * 0.3; ctx.strokeStyle = nColors[i]; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * (dialR - 4), cy + Math.sin(ang) * (dialR - 4));
      ctx.lineTo(cx + Math.cos(ang) * (dialR + 4), cy + Math.sin(ang) * (dialR + 4));
      ctx.stroke();
    });
    // Rotating pointer
    const rotAngle = interpolate(frame, [10, 70], [-Math.PI / 2, Math.PI * 1.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.9; ctx.strokeStyle = FB.red; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rotAngle) * (dialR * 0.7), cy + Math.sin(rotAngle) * (dialR * 0.7));
    ctx.stroke();
    // Center dot
    ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "FOR INDIVIDUAL NEURONS", cx, H * 0.88, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Phone screen with app buttons for each neuron ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H / 2;
    const phoneW = W * 0.32, phoneH = H * 0.7;
    // Phone outline
    ctx.globalAlpha = a * 0.7;
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - phoneW / 2 + 6, cy - phoneH / 2);
    ctx.lineTo(cx + phoneW / 2 - 6, cy - phoneH / 2);
    ctx.quadraticCurveTo(cx + phoneW / 2, cy - phoneH / 2, cx + phoneW / 2, cy - phoneH / 2 + 6);
    ctx.lineTo(cx + phoneW / 2, cy + phoneH / 2 - 6);
    ctx.quadraticCurveTo(cx + phoneW / 2, cy + phoneH / 2, cx + phoneW / 2 - 6, cy + phoneH / 2);
    ctx.lineTo(cx - phoneW / 2 + 6, cy + phoneH / 2);
    ctx.quadraticCurveTo(cx - phoneW / 2, cy + phoneH / 2, cx - phoneW / 2, cy + phoneH / 2 - 6);
    ctx.lineTo(cx - phoneW / 2, cy - phoneH / 2 + 6);
    ctx.quadraticCurveTo(cx - phoneW / 2, cy - phoneH / 2, cx - phoneW / 2 + 6, cy - phoneH / 2);
    ctx.stroke();
    // App grid
    const apps = ["JUMP", "WALK", "FEED", "GROOM", "TURN", "FLY"];
    const appC = [FB.red, FB.green, FB.gold, FB.teal, FB.blue, FB.purple];
    const cols = 2, rows = 3;
    const appW = phoneW * 0.35, appH = phoneH * 0.13;
    apps.forEach((label, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const ax = cx - phoneW * 0.25 + col * phoneW * 0.5;
      const ay = cy - phoneH * 0.25 + row * phoneH * 0.22;
      const t = stagger(frame, i, 5, 10);
      ctx.globalAlpha = a * t * 0.7; ctx.fillStyle = appC[i];
      ctx.fillRect(ax - appW / 2, ay - appH / 2, appW, appH);
      drawFBText(ctx, label, ax, ay, 7, a * t, "center", "#1a1020");
    });
    // Tap highlight cycling
    const tapIdx = Math.floor((frame / 18) % apps.length);
    const tc = tapIdx % cols, tr = Math.floor(tapIdx / cols);
    const tapX = cx - phoneW * 0.25 + tc * phoneW * 0.5;
    const tapY = cy - phoneH * 0.25 + tr * phoneH * 0.22;
    ctx.globalAlpha = a * 0.3;
    const tg = ctx.createRadialGradient(tapX, tapY, 0, tapX, tapY, 15);
    tg.addColorStop(0, "rgba(255,255,255,0.4)"); tg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(tapX, tapY, 15, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "NEURON APP", cx, H * 0.92, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Keyboard keys — each key is a neuron, pressed key glows ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const keys = ["J", "W", "F", "G", "T", "E"];
    const labels = ["JUMP", "WALK", "FEED", "GROOM", "TURN", "ESCAPE"];
    const kColors = [FB.red, FB.green, FB.gold, FB.teal, FB.blue, FB.purple];
    const keyW = W * 0.1, keyH = H * 0.12, gap = W * 0.03;
    const totalW = keys.length * keyW + (keys.length - 1) * gap;
    const startX = W / 2 - totalW / 2;
    const cy = H * 0.4;
    const pressIdx = Math.floor((frame / 12) % keys.length);
    keys.forEach((k, i) => {
      const x = startX + i * (keyW + gap);
      const t = stagger(frame, i, 4, 10);
      const isPressed = i === pressIdx && frame > 20;
      const pressOff = isPressed ? 3 : 0;
      // Key cap
      ctx.globalAlpha = a * t * 0.8;
      ctx.fillStyle = isPressed ? kColors[i] : "rgba(50,38,65,0.8)";
      ctx.fillRect(x, cy + pressOff, keyW, keyH);
      ctx.strokeStyle = isPressed ? kColors[i] : FB.text.dim;
      ctx.lineWidth = 1; ctx.strokeRect(x, cy + pressOff, keyW, keyH);
      drawFBText(ctx, k, x + keyW / 2, cy + keyH / 2 + pressOff, 12, a * t, "center", isPressed ? "#1a1020" : FB.text.primary);
      drawFBText(ctx, labels[i], x + keyW / 2, cy + keyH + 12 + pressOff, 5, a * t * 0.6, "center", kColors[i]);
    });
    drawFBText(ctx, "NEURON KEYBOARD", W / 2, H * 0.12, 10, a, "center", FB.gold);
    drawFBText(ctx, "one key = one neuron", W / 2, H * 0.88, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Wireless signal from remote to fly brain — concentric arcs ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Remote on left
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = "rgba(50,35,65,0.8)";
    ctx.fillRect(W * 0.08, H * 0.3, W * 0.1, H * 0.3);
    ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.08, H * 0.3, W * 0.1, H * 0.3);
    // Button
    ctx.fillStyle = FB.red; ctx.beginPath(); ctx.arc(W * 0.13, H * 0.42, 5, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "REMOTE", W * 0.13, H * 0.68, 7, a, "center", FB.text.dim);
    // Wireless arcs
    const sigP = interpolate(frame, [15, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let arc = 0; arc < 3; arc++) {
      const arcP = Math.max(0, sigP - arc * 0.2);
      if (arcP <= 0) continue;
      ctx.globalAlpha = a * arcP * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W * 0.2, H * 0.45, 15 + arc * 18, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.stroke();
    }
    // Brain cluster on right
    const rng = seeded(3808);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.6 + rng() * W * 0.28, ny = H * 0.2 + rng() * H * 0.5;
      const t = stagger(frame, i, 4, 12);
      drawFBNode(ctx, nx, ny, 5, i, a * t * sigP, frame);
    }
    drawFBText(ctx, "LIVING BRAIN", W * 0.75, H * 0.82, 8, a * sigP, "center", FB.teal);
    drawFBText(ctx, "INDIVIDUAL NEURON CONTROL", W / 2, H * 0.92, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Mixing board with slider per neuron ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const sliders = ["N1", "N2", "N3", "N4", "N5"];
    const sColors = [FB.red, FB.teal, FB.gold, FB.green, FB.blue];
    const sliderW = 8, sliderH = H * 0.45;
    const gap = W * 0.14;
    const startX = W / 2 - ((sliders.length - 1) * gap) / 2;
    const topY = H * 0.2;
    sliders.forEach((label, i) => {
      const x = startX + i * gap;
      const t = stagger(frame, i, 6, 12);
      // Track
      ctx.globalAlpha = a * t * 0.3; ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(x - sliderW / 2, topY, sliderW, sliderH);
      // Animated slider position
      const sliderPos = 0.3 + 0.5 * Math.sin(frame * 0.05 + i * 1.2);
      const knobY = topY + sliderH * (1 - sliderPos);
      // Fill below knob
      ctx.globalAlpha = a * t * 0.5; ctx.fillStyle = sColors[i];
      ctx.fillRect(x - sliderW / 2, knobY, sliderW, topY + sliderH - knobY);
      // Knob
      ctx.globalAlpha = a * t; ctx.fillStyle = sColors[i];
      ctx.fillRect(x - 8, knobY - 3, 16, 6);
      drawFBText(ctx, label, x, topY + sliderH + 12, 7, a * t, "center", sColors[i]);
    });
    drawFBText(ctx, "NEURON MIXER", W / 2, H * 0.08, 10, a, "center", FB.gold);
    drawFBText(ctx, "individual control", W / 2, H * 0.92, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_038: VariantDef[] = [
  { id: "fb-038-v1", label: "TV remote with neuron buttons", component: V1 },
  { id: "fb-038-v2", label: "Button press sends signal to neuron", component: V2 },
  { id: "fb-038-v3", label: "Game controller with neuron D-pad", component: V3 },
  { id: "fb-038-v4", label: "Light switch panel per neuron", component: V4 },
  { id: "fb-038-v5", label: "Dial knob to select neuron", component: V5 },
  { id: "fb-038-v6", label: "Phone app with neuron buttons", component: V6 },
  { id: "fb-038-v7", label: "Keyboard keys mapped to neurons", component: V7 },
  { id: "fb-038-v8", label: "Wireless signal from remote to brain", component: V8 },
  { id: "fb-038-v9", label: "Mixing board with neuron sliders", component: V9 },
];
