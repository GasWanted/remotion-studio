import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";
import { drawX, drawCheck, drawMonitor, drawNeuron } from "../icons";

/* Shot 023 — "We use PyTorch to run it—but instead of teaching it to talk,
   we're using it to mimic the physics of real biology." — 150 frames (5s)
   Split: chatbot crossed out vs biology neurons highlighted. */

const DUR = 150;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}
function accent(i: number) { return FB.colors[i % FB.colors.length]; }

function drawFlame(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number, color: string, alpha: number) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x, y - sz * 0.5);
  ctx.quadraticCurveTo(x + sz * 0.35, y - sz * 0.15, x + sz * 0.2, y + sz * 0.2);
  ctx.quadraticCurveTo(x + sz * 0.1, y + sz * 0.45, x, y + sz * 0.35);
  ctx.quadraticCurveTo(x - sz * 0.1, y + sz * 0.45, x - sz * 0.2, y + sz * 0.2);
  ctx.quadraticCurveTo(x - sz * 0.35, y - sz * 0.15, x, y - sz * 0.5);
  ctx.fill(); ctx.globalAlpha = 1;
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, alpha: number) {
  ctx.globalAlpha = alpha; ctx.fillStyle = color;
  const r = Math.min(w, h) * 0.2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + r, y - h / 2); ctx.lineTo(x + w / 2 - r, y - h / 2);
  ctx.arcTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r, r);
  ctx.lineTo(x + w / 2, y + h / 2 - r); ctx.arcTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2, r);
  ctx.lineTo(x - w / 2 + w * 0.3, y + h / 2); ctx.lineTo(x - w / 2 + w * 0.15, y + h / 2 + h * 0.25);
  ctx.lineTo(x - w / 2 + w * 0.2, y + h / 2); ctx.lineTo(x - w / 2 + r, y + h / 2);
  ctx.arcTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r, r);
  ctx.lineTo(x - w / 2, y - h / 2 + r); ctx.arcTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2, r);
  ctx.fill(); ctx.globalAlpha = 1;
}

/* V1: Split screen — chatbot with X on left, biology network on right */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const midX = W / 2;
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX, H * 0.15); ctx.lineTo(midX, H * 0.85); ctx.stroke();
    const leftP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBubble(ctx, W * 0.25, H * 0.4, W * 0.3, H * 0.2, "rgba(100,100,140,0.25)", a * leftP);
    drawFBText(ctx, "Hello, how", W * 0.25, H * 0.36, 8, a * leftP * 0.6, "center", FB.text.dim);
    drawFBText(ctx, "can I help?", W * 0.25, H * 0.46, 8, a * leftP * 0.6, "center", FB.text.dim);
    const xP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xP > 0) drawX(ctx, W * 0.25, H * 0.4, 40, FB.red, a * xP);
    drawFBText(ctx, "CHATBOT", W * 0.25, H * 0.7, 10, a * leftP, "center", FB.text.dim);
    const rightP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2301);
    for (let i = 0; i < 7; i++) {
      const nx = W * 0.6 + rng() * W * 0.3, ny = H * 0.2 + rng() * H * 0.5;
      drawFBNode(ctx, nx, ny, 5 + rng() * 4, i % 5, a * rightP);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.6 + rng() * W * 0.3, H * 0.2 + rng() * H * 0.5, 0.7, a * rightP * 0.4, frame);
      else { rng(); rng(); }
    }
    drawCheck(ctx, W * 0.75, H * 0.7, 20, FB.green, a * rightP);
    drawFBText(ctx, "BIOLOGY", W * 0.75, H * 0.78, 10, a * rightP, "center", FB.green);
    drawFlame(ctx, midX, H * 0.08, 18, FB.colors[1], a);
    drawFBText(ctx, "PyTorch", midX, H * 0.18, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Flame morphs — text stream dissolves left, spike train emerges right */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    drawFlame(ctx, W / 2, H * 0.12, 22, FB.colors[1], a);
    const textFade = interpolate(frame, [10, 50, 60, 90], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const words = ["the", "cat", "sat", "on", "the"];
    words.forEach((w, i) => {
      drawFBText(ctx, w, W * 0.22, H * 0.3 + i * H * 0.1, 10, a * textFade * stagger(frame, i, 6, 12), "center", FB.text.dim);
    });
    if (textFade > 0.5) drawX(ctx, W * 0.22, H / 2, 35, FB.red, a * (textFade - 0.5) * 2);
    const spikeP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 6; i++) {
      const sy = H * 0.25 + i * H * 0.1;
      const t = stagger(frame, i, 8, 15);
      if (spikeP > 0) {
        ctx.globalAlpha = a * spikeP * t; ctx.strokeStyle = accent(i); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(W * 0.68, sy); ctx.lineTo(W * 0.72, sy);
        ctx.lineTo(W * 0.73, sy - 10); ctx.lineTo(W * 0.74, sy); ctx.lineTo(W * 0.82, sy); ctx.stroke();
      }
    }
    drawFBText(ctx, "NOT TALK", W * 0.22, H * 0.88, 10, a, "center", FB.red);
    drawFBText(ctx, "BIOLOGY", W * 0.78, H * 0.88, 10, a * spikeP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Arrow redirect — chat path crossed, arrow bends toward neuron cluster */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    drawFlame(ctx, cx, H * 0.1, 20, FB.colors[1], a);
    drawFBText(ctx, "PyTorch", cx, H * 0.2, 11, a, "center", FB.gold);
    const crossP = interpolate(frame, [15, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBubble(ctx, W * 0.2, H * 0.6, W * 0.2, H * 0.12, "rgba(80,80,120,0.2)", a * crossP);
    if (crossP > 0.5) drawX(ctx, W * 0.2, H * 0.6, 30, FB.red, a * (crossP - 0.5) * 2);
    const bendP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2303);
    for (let i = 0; i < 5; i++) {
      const nx = W * 0.7 + rng() * W * 0.2, ny = H * 0.5 + rng() * H * 0.25;
      drawFBNode(ctx, nx, ny, 5 + rng() * 3, i, a * bendP);
    }
    drawFBText(ctx, "REAL BIOLOGY", W * 0.8, H * 0.88, 10, a * bendP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Two monitors — left screen shows "A B C", right shows neuron spikes */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const lP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawMonitor(ctx, W * 0.22, H * 0.4, W * 0.28, H * 0.35, "rgba(100,100,140,0.3)");
    drawFBText(ctx, "A B C ...", W * 0.22, H * 0.38, 12, a * lP * 0.5, "center", FB.text.dim);
    const xP = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xP > 0) { drawX(ctx, W * 0.22, H * 0.38, 35, FB.red, a * xP); drawFBText(ctx, "NOT THIS", W * 0.22, H * 0.62, 9, a * xP, "center", FB.red); }
    const rP = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawMonitor(ctx, W * 0.72, H * 0.4, W * 0.28, H * 0.35, "rgba(80,140,100,0.3)");
    for (let i = 0; i < 4; i++) {
      const sy = H * 0.3 + i * H * 0.06;
      ctx.globalAlpha = a * rP; ctx.strokeStyle = accent(i); ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let j = 0; j < 20; j++) {
        const jx = W * 0.6 + j * W * 0.012;
        const spike = (j + i * 3 + Math.floor(frame * 0.1)) % 7 === 0;
        j === 0 ? ctx.moveTo(jx, spike ? sy - 8 : sy) : ctx.lineTo(jx, spike ? sy - 8 : sy);
      }
      ctx.stroke();
    }
    drawCheck(ctx, W * 0.72, H * 0.55, 16, FB.green, a * rP);
    drawFBText(ctx, "PHYSICS", W * 0.72, H * 0.62, 9, a * rP, "center", FB.green);
    drawFlame(ctx, W / 2, H * 0.08, 16, FB.colors[1], a);
    drawFBText(ctx, "PyTorch", W / 2, H * 0.88, 11, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Transformation — "LANGUAGE MODEL" label morphs into "BRAIN SIMULATOR" */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H / 2;
    drawFlame(ctx, cx, H * 0.12, 22, FB.colors[1], a);
    const phase1 = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const phase2 = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeOld = interpolate(frame, [40, 65], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOld > 0) {
      drawFBText(ctx, "LANGUAGE", cx, cy - 10, 16, a * phase1 * fadeOld, "center", FB.text.dim);
      drawFBText(ctx, "MODEL", cx, cy + 10, 16, a * phase1 * fadeOld, "center", FB.text.dim);
      if (phase2 > 0) drawX(ctx, cx, cy, 50, FB.red, a * fadeOld * 0.6);
    }
    if (phase2 > 0) {
      drawFBText(ctx, "BRAIN", cx, cy - 10, 16, a * phase2, "center", FB.green);
      drawFBText(ctx, "SIMULATOR", cx, cy + 10, 16, a * phase2, "center", FB.green);
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + frame * 0.02;
        drawFBNode(ctx, cx + Math.cos(angle) * 45, cy + Math.sin(angle) * 45, 3, i, a * phase2 * 0.7);
      }
    }
    drawFBText(ctx, "PyTorch", cx, H * 0.22, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Pipeline fork — flame splits, language path dimmed+X, biology path bright */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    drawFlame(ctx, cx, H * 0.1, 18, FB.colors[1], a);
    drawFBNode(ctx, cx, H * 0.3, 6, 3, a);
    const brP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawBubble(ctx, W * 0.2, H * 0.62, W * 0.2, H * 0.1, "rgba(80,80,120,0.15)", a * brP * 0.4);
    drawFBText(ctx, "LANGUAGE", W * 0.2, H * 0.62, 8, a * brP * 0.4, "center", FB.text.dim);
    drawX(ctx, W * 0.2, H * 0.62, 25, FB.red, a * brP * 0.6);
    const bioP = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2306);
    for (let i = 0; i < 4; i++) {
      drawFBNode(ctx, W * 0.72 + rng() * W * 0.16, H * 0.52 + rng() * H * 0.2, 4 + rng() * 3, i + 1, a * bioP);
    }
    drawFBText(ctx, "BIOLOGY", W * 0.8, H * 0.78, 9, a * bioP, "center", FB.green);
    drawFBText(ctx, "SAME TOOL \u2192 DIFFERENT PURPOSE", cx, H * 0.92, 8, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Conveyor — words scroll up and dim, neuron blobs scroll down and glow */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const wordFade = interpolate(frame, [10, 40, 50, 80], [0, 1, 1, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const words = ["hello", "world", "chat", "text", "talk"];
    words.forEach((w, i) => {
      const wy = (H * 0.2 + i * H * 0.12 + frame * 0.3) % (H * 0.7) + H * 0.1;
      drawFBText(ctx, w, W * 0.22, wy, 9, a * wordFade * 0.5, "center", FB.text.dim);
    });
    if (wordFade < 0.5) drawX(ctx, W * 0.22, H / 2, 35, FB.red, a * (1 - wordFade * 2));
    const bioP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 6; i++) {
      const ny = (H * 0.15 + i * H * 0.12 + frame * 0.4) % (H * 0.7) + H * 0.1;
      drawFBNode(ctx, W * 0.75, ny, 5, i, a * bioP);
    }
    drawCheck(ctx, W * 0.75, H * 0.88, 14, FB.green, a * bioP);
    drawFBText(ctx, "WORDS", W * 0.22, H * 0.05, 10, a * wordFade, "center", FB.text.dim);
    drawFBText(ctx, "NEURONS", W * 0.75, H * 0.05, 10, a * bioP, "center", FB.green);
    drawFlame(ctx, W / 2, H * 0.05, 14, FB.colors[1], a);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Before/After — "USUALLY" chat dimmed, "HERE" neuron net bright */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const p1 = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "USUALLY:", W * 0.12, H * 0.18, 9, a * p1, "left", FB.text.dim);
    drawBubble(ctx, cx, H * 0.2, W * 0.4, H * 0.08, "rgba(80,80,120,0.2)", a * p1);
    drawFBText(ctx, "teach it to talk", cx, H * 0.2, 8, a * p1 * 0.6, "center", FB.text.dim);
    const xP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xP > 0) drawX(ctx, cx, H * 0.2, 30, FB.red, a * xP);
    const p2 = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "HERE:", W * 0.12, H * 0.52, 9, a * p2, "left", FB.green);
    const rng = seeded(2308);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.3 + rng() * W * 0.4, ny = H * 0.5 + rng() * H * 0.2;
      drawFBNode(ctx, nx, ny, 4 + rng() * 3, i, a * p2);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.3 + rng() * W * 0.4, H * 0.5 + rng() * H * 0.2, 0.7, a * p2 * 0.3, frame);
      else { rng(); rng(); }
    }
    drawFBText(ctx, "mimic real biology", cx, H * 0.76, 10, a * p2, "center", FB.green);
    drawFlame(ctx, cx, H * 0.92, 14, FB.colors[1], a);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Equation swap — "P(word|context)" crossed, "V(t+1)=V(t)+I" appears with orbiting neurons */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H / 2;
    drawFlame(ctx, cx, H * 0.08, 18, FB.colors[1], a);
    drawFBText(ctx, "SAME ENGINE, DIFFERENT PHYSICS", cx, H * 0.2, 8, a, "center", FB.gold);
    const oldP = interpolate(frame, [10, 35, 50, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "P(word | context)", cx, cy - 8, 14, a * oldP, "center", FB.text.dim);
    if (oldP > 0.8 && frame > 45) drawX(ctx, cx, cy - 8, 45, FB.red, a * interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const newP = interpolate(frame, [75, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "V(t+1) = V(t) + I", cx, cy - 8, 14, a * newP, "center", FB.green);
    if (newP > 0.3) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + frame * 0.015;
        drawFBNode(ctx, cx + Math.cos(angle) * 55, cy + Math.sin(angle) * 30, 3, i + 1, a * newP * 0.5);
      }
    }
    drawFBText(ctx, "voltage equation", cx, H * 0.72, 9, a * newP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_023: VariantDef[] = [
  { id: "fb-023-v1", label: "Split screen: chatbot X vs neurons check", component: V1 },
  { id: "fb-023-v2", label: "Text stream dissolves, spike stream emerges", component: V2 },
  { id: "fb-023-v3", label: "Arrow redirect from chat to biology", component: V3 },
  { id: "fb-023-v4", label: "Two monitors: text vs neural spikes", component: V4 },
  { id: "fb-023-v5", label: "Label morph: Language Model -> Brain Simulator", component: V5 },
  { id: "fb-023-v6", label: "Pipeline fork: language dimmed, biology bright", component: V6 },
  { id: "fb-023-v7", label: "Conveyor: words fading, neurons flowing", component: V7 },
  { id: "fb-023-v8", label: "Before/After: usually vs here panels", component: V8 },
  { id: "fb-023-v9", label: "Equation swap: P(word) -> V(t+1)", component: V9 },
];
