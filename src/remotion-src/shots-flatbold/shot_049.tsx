import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 49 — "The brain's output neurons send electrical signals to 'virtual muscles.'" — 120 frames */

// ---------- V1: Chain — brain node fires pulse through wire to muscle blob ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Brain cluster left
    const brainP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    for (let i = 0; i < 5; i++) {
      const nx = W * 0.08 + (i % 3) * W * 0.06;
      const ny = H * 0.3 + Math.floor(i / 3) * H * 0.15;
      drawFBNode(ctx, nx, ny, 6, 6, a * brainP * 0.6, frame);
    }
    drawFBText(ctx, "BRAIN", W * 0.12, H * 0.15, 9, a * brainP, "center", FB.purple);
    // Output neuron — larger, glowing
    const outP = interpolate(frame, [18, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.32, H * 0.4, 10, 5, a * outP, frame);
    drawFBText(ctx, "output", W * 0.32, H * 0.52, 7, a * outP, "center", FB.teal);
    // Signal pulse traveling across wire
    const sigP = interpolate(frame, [35, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Wire
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.38, H * 0.4); ctx.lineTo(W * 0.68, H * 0.4); ctx.stroke();
    // Pulse dot
    if (sigP > 0 && sigP < 1) {
      const px = W * 0.38 + sigP * W * 0.3;
      ctx.globalAlpha = a * 0.8; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(px, H * 0.4, 4, 0, Math.PI * 2); ctx.fill();
    }
    // Muscle blob right
    const muscP = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const muscScale = 1 + muscP * 0.15 * Math.sin(frame * 0.2);
    drawFBNode(ctx, W * 0.78, H * 0.4, 14 * muscScale, 0, a * muscP, frame);
    drawFBText(ctx, "MUSCLE", W * 0.78, H * 0.56, 9, a * muscP, "center", FB.red);
    // Contraction pulses
    if (muscP > 0.5) {
      const ringA = (1 - muscP) * 0.3;
      ctx.globalAlpha = a * ringA; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(W * 0.78, H * 0.4, 18 + frame * 0.1 % 10, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Three parallel output channels, each to a different muscle ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const channels = [
      { label: "L1", ny: H * 0.2, ci: 5, mci: 0, delay: 5 },
      { label: "L2", ny: H * 0.45, ci: 6, mci: 1, delay: 18 },
      { label: "L3", ny: H * 0.7, ci: 4, mci: 3, delay: 31 },
    ];
    for (const ch of channels) {
      const chP = interpolate(frame, [ch.delay, ch.delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Neuron left
      drawFBNode(ctx, W * 0.15, ch.ny, 8, ch.ci, a * chP, frame);
      drawFBText(ctx, ch.label, W * 0.15, ch.ny + 14, 6, a * chP * 0.6, "center", FB.text.dim);
      // Wire
      ctx.globalAlpha = a * chP * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.22, ch.ny); ctx.lineTo(W * 0.7, ch.ny); ctx.stroke();
      // Traveling pulse
      const sigP = interpolate(frame, [ch.delay + 20, ch.delay + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sigP > 0 && sigP < 1) {
        ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(W * 0.22 + sigP * W * 0.48, ch.ny, 3, 0, Math.PI * 2); ctx.fill();
      }
      // Muscle right
      const mP = interpolate(frame, [ch.delay + 45, ch.delay + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.82, ch.ny, 10, ch.mci, a * mP, frame);
    }
    drawFBText(ctx, "output neurons", W * 0.15, H * 0.06, 8, a, "center", FB.purple);
    drawFBText(ctx, "virtual muscles", W * 0.82, H * 0.06, 8, a, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Electrical bolt animation from neuron to muscle ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Neuron
    drawFBNode(ctx, W * 0.2, H * 0.4, 14, 6, a, frame);
    drawFBText(ctx, "NEURON", W * 0.2, H * 0.56, 8, a, "center", FB.purple);
    // Muscle
    const muscP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flex = muscP > 0.5 ? 1 + Math.sin(frame * 0.15) * 0.08 : 1;
    drawFBNode(ctx, W * 0.8, H * 0.4, 16 * flex, 0, a * Math.max(0.3, muscP), frame);
    drawFBText(ctx, "MUSCLE", W * 0.8, H * 0.56, 8, a * muscP, "center", FB.red);
    // Lightning bolt path
    const boltP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (boltP > 0) {
      const rng = seeded(4900 + Math.floor(frame / 4));
      ctx.globalAlpha = a * boltP * 0.7; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2; ctx.lineCap = "round";
      ctx.beginPath();
      let bx = W * 0.28, by = H * 0.4;
      ctx.moveTo(bx, by);
      const segments = 6;
      const endX = W * 0.28 + boltP * W * 0.44;
      for (let i = 1; i <= segments; i++) {
        bx = W * 0.28 + (i / segments) * (endX - W * 0.28);
        by = H * 0.4 + (rng() - 0.5) * 20;
        if (bx > endX) break;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
    // "electrical signal" label
    const lbl = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "electrical signal", W / 2, H * 0.22, 9, a * lbl, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Waveform from brain side resolves into muscle contraction ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Spike waveform left half
    const waveP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 40; i++) {
      const wx = W * 0.05 + i * W * 0.012;
      if (wx > W * 0.05 + waveP * W * 0.48) break;
      const spike = (i % 8 === 3) ? -H * 0.15 : 0;
      const wy = H * 0.4 + spike + Math.sin(i * 0.5) * 3;
      if (i === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
    }
    ctx.stroke();
    drawFBText(ctx, "spikes", W * 0.15, H * 0.2, 9, a * waveP, "center", FB.gold);
    // Muscle on right contracts
    const muscP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const squeeze = muscP > 0 ? 1 + muscP * 0.2 * Math.sin(frame * 0.12) : 1;
    drawFBNode(ctx, W * 0.78, H * 0.4, 16, 0, a * Math.max(0.2, muscP), frame);
    if (muscP > 0.3) {
      // contraction lines
      ctx.globalAlpha = a * muscP * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const la = (i / 4) * Math.PI * 2 + frame * 0.05;
        ctx.beginPath();
        ctx.moveTo(W * 0.78 + Math.cos(la) * 20, H * 0.4 + Math.sin(la) * 20);
        ctx.lineTo(W * 0.78 + Math.cos(la) * 28, H * 0.4 + Math.sin(la) * 28);
        ctx.stroke();
      }
    }
    drawFBText(ctx, "virtual muscle", W * 0.78, H * 0.58, 8, a * muscP, "center", FB.red);
    // Arrow between
    const arrP = interpolate(frame, [45, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP * 0.4; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.55, H * 0.4); ctx.lineTo(W * 0.65, H * 0.4); ctx.stroke();
    ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.moveTo(W * 0.65, H * 0.4); ctx.lineTo(W * 0.62, H * 0.37); ctx.lineTo(W * 0.62, H * 0.43); ctx.fill();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Hub-and-spoke — central output neuron radiates to 6 muscles ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const cx = W * 0.35, cy = H * 0.45;
    drawFBNode(ctx, cx, cy, 14, 6, a, frame);
    drawFBText(ctx, "output neuron", cx, cy + 22, 7, a, "center", FB.purple);
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 0.4 + (i / 5) * Math.PI * 0.8;
      const mx = W * 0.75, my = H * 0.12 + i * H * 0.14;
      const delay = 10 + i * 8;
      const lineP = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Connection line
      ctx.globalAlpha = a * lineP * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + 16, cy); ctx.lineTo(mx - 12, my); ctx.stroke();
      // Pulse
      if (lineP > 0 && lineP < 1) {
        const px = cx + 16 + lineP * (mx - 12 - cx - 16);
        const py = cy + lineP * (my - cy);
        ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      // Muscle node
      const mP = interpolate(frame, [delay + 18, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, mx, my, 7, i % 4, a * mP, frame);
    }
    drawFBText(ctx, "muscles", W * 0.82, H * 0.06, 8, a, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Voltage trace spikes, each spike contracts a muscle bar ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Voltage trace at top
    drawFBText(ctx, "neuron voltage", W * 0.08, H * 0.08, 7, a, "left", FB.text.dim);
    ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const spikeTimes = [20, 45, 70, 90];
    for (let x = 0; x < W * 0.9; x += 2) {
      const t = (x / (W * 0.9)) * 120;
      let v = 0;
      for (const st of spikeTimes) {
        if (t > st && t < st + 5) v = -H * 0.12;
      }
      const wy = H * 0.22 + v;
      if (x === 0) ctx.moveTo(W * 0.05 + x, wy); else ctx.lineTo(W * 0.05 + x, wy);
    }
    ctx.stroke();
    // Muscle contraction bar at bottom
    drawFBText(ctx, "muscle force", W * 0.08, H * 0.55, 7, a, "left", FB.text.dim);
    let force = 0;
    for (const st of spikeTimes) {
      if (frame > st) force += Math.max(0, 1 - (frame - st) / 30) * 0.25;
    }
    force = Math.min(1, force);
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(W * 0.05, H * 0.62, W * 0.9, H * 0.08);
    ctx.globalAlpha = a * 0.7; ctx.fillStyle = FB.red;
    ctx.fillRect(W * 0.05, H * 0.62, W * 0.9 * force, H * 0.08);
    drawFBCounter(ctx, Math.round(force * 100) + "%", W / 2, H * 0.82, 14, FB.red, a);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Cascade — brain fires, signal hops through 3 relays to muscle ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const stages = [
      { x: W * 0.1, label: "brain", ci: 6 },
      { x: W * 0.3, label: "inter", ci: 5 },
      { x: W * 0.5, label: "output", ci: 4 },
      { x: W * 0.7, label: "signal", ci: 1 },
      { x: W * 0.9, label: "muscle", ci: 0 },
    ];
    const cy = H * 0.42;
    for (let i = 0; i < stages.length; i++) {
      const st = stages[i];
      const delay = i * 15;
      const sp = interpolate(frame, [delay + 5, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, st.x, cy, i === 4 ? 12 : 8, st.ci, a * sp, frame);
      drawFBText(ctx, st.label, st.x, cy + 18, 7, a * sp * 0.7, "center", FB.text.dim);
      // Connection to next
      if (i < stages.length - 1) {
        ctx.globalAlpha = a * sp * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(st.x + 10, cy); ctx.lineTo(stages[i + 1].x - 10, cy); ctx.stroke();
      }
      // Hop pulse
      const hopP = interpolate(frame, [delay + 10, delay + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (i < stages.length - 1 && hopP > 0 && hopP < 1) {
        const hx = st.x + 10 + hopP * (stages[i + 1].x - st.x - 20);
        ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(hx, cy, 3, 0, Math.PI * 2); ctx.fill();
      }
    }
    const lbl = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "electrical signals to virtual muscles", W / 2, H * 0.78, 8, a * lbl, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Split screen — "output neurons" left, "virtual muscles" right ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Divider
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.9); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "OUTPUT NEURONS", W * 0.25, H * 0.08, 8, a, "center", FB.purple);
    drawFBText(ctx, "VIRTUAL MUSCLES", W * 0.75, H * 0.08, 8, a, "center", FB.red);
    const rng = seeded(4907);
    for (let i = 0; i < 5; i++) {
      const ny = H * 0.18 + i * H * 0.15;
      const np = interpolate(frame, [5 + i * 6, 20 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.25, ny, 7, 5 + (i % 3), a * np, frame);
      // Signal arrow across divider
      const sigP = interpolate(frame, [25 + i * 8, 50 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sigP > 0) {
        ctx.globalAlpha = a * sigP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W * 0.32, ny); ctx.lineTo(W * 0.68, ny); ctx.stroke();
      }
      // Muscle node
      const mp = interpolate(frame, [40 + i * 8, 55 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, W * 0.75, ny, 8, i % 4, a * mp, frame);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Big neuron fires expanding rings that shrink into muscle ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const nx = W * 0.25, ny = H * 0.4;
    const mx = W * 0.75, my = H * 0.4;
    drawFBNode(ctx, nx, ny, 14, 6, a, frame);
    drawFBText(ctx, "output neuron", nx, ny + 22, 7, a, "center", FB.purple);
    // Expanding rings from neuron
    for (let i = 0; i < 4; i++) {
      const ringStart = 15 + i * 12;
      const rp = interpolate(frame, [ringStart, ringStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rp <= 0) continue;
      const ringX = nx + rp * (mx - nx);
      const ringR = 12 * (1 - rp * 0.6);
      ctx.globalAlpha = a * (1 - rp) * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ringX, ny, ringR, 0, Math.PI * 2); ctx.stroke();
    }
    // Muscle pulses when rings arrive
    const muscActive = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flex = muscActive > 0.3 ? 1 + Math.sin(frame * 0.15) * 0.1 : 1;
    drawFBNode(ctx, mx, my, 14 * flex, 0, a * Math.max(0.3, muscActive), frame);
    drawFBText(ctx, "virtual muscle", mx, my + 22, 7, a * muscActive, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_049: VariantDef[] = [
  { id: "fb-049-v1", label: "Brain node fires pulse to muscle blob", component: V1 },
  { id: "fb-049-v2", label: "Three parallel output channels", component: V2 },
  { id: "fb-049-v3", label: "Lightning bolt from neuron to muscle", component: V3 },
  { id: "fb-049-v4", label: "Spike waveform resolves into contraction", component: V4 },
  { id: "fb-049-v5", label: "Hub and spoke to six muscles", component: V5 },
  { id: "fb-049-v6", label: "Voltage trace drives muscle force bar", component: V6 },
  { id: "fb-049-v7", label: "Signal hops through relay chain", component: V7 },
  { id: "fb-049-v8", label: "Split screen neurons vs muscles", component: V8 },
  { id: "fb-049-v9", label: "Expanding rings shrink into muscle", component: V9 },
];
