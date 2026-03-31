import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 63 — "A brain isn't software where you can edit random lines of code
   and hope it compiles. If you change the wrong connection, the entire system
   breaks." — 180 frames (6s) */

// ---------- V1: code editor with errors appearing, then "SYSTEM BREAKS" ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    // Code lines
    const lines = [
      "synapse[1042] = random()",
      "synapse[8891] = random()",
      "synapse[3307] = random()",
      "// compile...",
    ];
    lines.forEach((ln, i) => {
      const t = interpolate(frame, [10 + i * 15, 22 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.12 + i * H * 0.1;
      drawFBText(ctx, ln, W * 0.08, y, 7 * s, a * t, "left", i < 3 ? FB.teal : FB.text.dim);
      // Red underline for error
      if (i < 3) {
        const errP = interpolate(frame, [70 + i * 10, 85 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * errP; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
        ctx.beginPath(); ctx.moveTo(W * 0.08, y + 5 * s); ctx.lineTo(W * 0.6, y + 5 * s); ctx.stroke();
        drawFBText(ctx, "ERROR", W * 0.82, y, 6 * s, a * errP, "center", FB.red);
      }
    });
    // Crash message
    const crashP = interpolate(frame, [110, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * crashP * 0.06; ctx.fillStyle = FB.red; ctx.fillRect(0, 0, W, H);
    drawFBText(ctx, "COMPILATION FAILED", W / 2, H * 0.62, 10 * s, a * crashP, "center", FB.red);
    // "SYSTEM BREAKS"
    const sysP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SYSTEM BREAKS", W / 2, H * 0.78, 16 * s, a * sysP, "center", FB.red);
    drawFBText(ctx, "a brain isn't software", W / 2, H * 0.9, 8 * s, a * sysP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: brain vs code side by side — code is linear, brain is tangled ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    // Divider
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.text.dim; ctx.fillRect(W / 2 - 1, H * 0.08, 2, H * 0.65);
    // Left: software — neat lines
    const leftP = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "SOFTWARE", W * 0.25, H * 0.08, 9 * s, a * leftP, "center", FB.teal);
    for (let i = 0; i < 5; i++) {
      const y = H * 0.18 + i * H * 0.1;
      ctx.globalAlpha = a * leftP * 0.3; ctx.fillStyle = FB.teal;
      ctx.fillRect(W * 0.06, y, W * 0.35 * (0.5 + Math.sin(i) * 0.3), 3 * s);
    }
    drawFBText(ctx, "edit line 3 -> OK", W * 0.25, H * 0.68, 7 * s, a * leftP, "center", FB.green);
    // Right: brain — tangled web
    const rightP = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAIN", W * 0.75, H * 0.08, 9 * s, a * rightP, "center", FB.purple);
    const rng = seeded(6320);
    const brainNodes: [number, number][] = [];
    for (let i = 0; i < 8; i++) brainNodes.push([W * 0.58 + rng() * W * 0.35, H * 0.18 + rng() * H * 0.4]);
    for (let i = 0; i < 12; i++) {
      const fi = Math.floor(rng() * 8), ti = Math.floor(rng() * 8);
      if (fi !== ti) drawFBColorEdge(ctx, brainNodes[fi][0], brainNodes[fi][1], brainNodes[ti][0], brainNodes[ti][1], FB.purple, s * 0.4, a * rightP * 0.4);
    }
    brainNodes.forEach(([x, y], i) => drawFBNode(ctx, x, y, 4 * s, (i + 3) % 8, a * rightP, frame));
    // "edit one -> breaks all"
    const breakP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "edit one -> BREAKS ALL", W * 0.75, H * 0.68, 7 * s, a * breakP, "center", FB.red);
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE ENTIRE SYSTEM BREAKS", W / 2, H * 0.85, 12 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: single red X on one connection → cascade of red through network ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6330);
    const nodes: [number, number][] = [];
    for (let i = 0; i < 10; i++) nodes.push([W * 0.1 + rng() * W * 0.8, H * 0.12 + rng() * H * 0.5]);
    // Cascade: node 0 is the "wrong connection" that turns red, then spreads
    const cascadeSpeed = 12;
    nodes.forEach(([x, y], i) => {
      const dist = Math.sqrt((x - nodes[0][0]) ** 2 + (y - nodes[0][1]) ** 2);
      const normalDist = dist / (W * 0.5);
      const redFrame = 60 + normalDist * 80;
      const redP = interpolate(frame, [redFrame, redFrame + cascadeSpeed], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const colorIdx = redP > 0.5 ? 0 : (i + 2) % 8;
      drawFBNode(ctx, x, y, 6 * s, colorIdx, a, frame);
    });
    // Edges turning red
    for (let i = 0; i < 14; i++) {
      const fi = Math.floor(rng() * 10), ti = Math.floor(rng() * 10);
      if (fi === ti) continue;
      const edgeDist = Math.min(
        Math.sqrt((nodes[fi][0] - nodes[0][0]) ** 2 + (nodes[fi][1] - nodes[0][1]) ** 2),
        Math.sqrt((nodes[ti][0] - nodes[0][0]) ** 2 + (nodes[ti][1] - nodes[0][1]) ** 2)
      ) / (W * 0.5);
      const redFrame = 60 + edgeDist * 80;
      const redP = interpolate(frame, [redFrame, redFrame + cascadeSpeed], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBColorEdge(ctx, nodes[fi][0], nodes[fi][1], nodes[ti][0], nodes[ti][1], redP > 0.5 ? FB.red : FB.text.dim, s * 0.5, a * 0.4);
    }
    // The wrong edit marker
    const editP = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
    if (editP > 0) {
      ctx.globalAlpha = a * editP; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s; ctx.lineCap = "round";
      const [nx, ny] = nodes[0];
      ctx.beginPath(); ctx.moveTo(nx - 5 * s, ny - 5 * s); ctx.lineTo(nx + 5 * s, ny + 5 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nx + 5 * s, ny - 5 * s); ctx.lineTo(nx - 5 * s, ny + 5 * s); ctx.stroke();
      drawFBText(ctx, "WRONG ONE", nx, ny - 12 * s, 6 * s, a * editP, "center", FB.red);
    }
    const endP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ENTIRE SYSTEM BREAKS", W / 2, H * 0.78, 13 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Jenga tower — pulling one block collapses it ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    const nRows = 7;
    const blockW = 16 * s, blockH = 6 * s;
    const pullRow = 3;
    const collapseP = interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 0; r < nRows; r++) {
      const horizontal = r % 2 === 0;
      for (let b = 0; b < 3; b++) {
        const baseY = H * 0.7 - r * blockH;
        const baseX = cx - blockW * 1.5 + b * blockW;
        const isPulled = r === pullRow && b === 1;
        if (isPulled) {
          const pullP = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const px = baseX + pullP * 30 * s;
          ctx.globalAlpha = a; ctx.fillStyle = FB.gold; ctx.fillRect(px, baseY, blockW - 2, blockH - 1); continue;
        }
        // Blocks above pulled row collapse
        const drop = r > pullRow ? collapseP * (r - pullRow) * 4 * s : 0;
        const tilt = r > pullRow ? collapseP * (r - pullRow) * 0.05 : 0;
        ctx.save(); ctx.translate(baseX + blockW / 2, baseY + drop); ctx.rotate(tilt);
        ctx.globalAlpha = a; ctx.fillStyle = r > pullRow && collapseP > 0.3 ? FB.red : FB.teal;
        ctx.fillRect(-blockW / 2, 0, blockW - 2, blockH - 1);
        ctx.restore();
      }
    }
    const pullLblP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WRONG CONNECTION", cx + 35 * s, H * 0.7 - pullRow * blockH, 6 * s, a * pullLblP, "left", FB.gold);
    const endP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EVERYTHING FALLS", cx, H * 0.85, 13 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: "NOT SOFTWARE" crossed out, "BIOLOGY" emphasized ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // "SOFTWARE" with strikethrough
    const swP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "SOFTWARE", cx, H * 0.2, 16 * s, a * swP, "center", FB.text.dim);
    const strikeP = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * strikeP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx - 55 * s, H * 0.2); ctx.lineTo(cx + 55 * s, H * 0.2); ctx.stroke();
    // "BIOLOGY" appears
    const bioP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BIOLOGY", cx, H * 0.4, 18 * s, a * bioP, "center", FB.green);
    // Explanation
    const expP = interpolate(frame, [85, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "Every connection depends", cx, H * 0.56, 8 * s, a * expP, "center", FB.text.dim);
    drawFBText(ctx, "on every other connection", cx, H * 0.63, 8 * s, a * expP, "center", FB.text.dim);
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CHANGE ONE, BREAK ALL", cx, H * 0.82, 12 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: gear system — remove one gear, everything jams ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const gears = [
      { x: W * 0.25, y: H * 0.3, r: 18, teeth: 8 },
      { x: W * 0.48, y: H * 0.35, r: 14, teeth: 6 },
      { x: W * 0.65, y: H * 0.28, r: 16, teeth: 7 },
      { x: W * 0.8, y: H * 0.4, r: 12, teeth: 5 },
    ];
    const removeIdx = 1;
    const removeP = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const jamP = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spinning = jamP < 0.5;
    gears.forEach((g, i) => {
      if (i === removeIdx && removeP > 0.8) return; // removed
      const rot = spinning ? frame * 0.03 * (i % 2 === 0 ? 1 : -1) : 0;
      const gAlpha = i === removeIdx ? (1 - removeP) : 1;
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(rot);
      ctx.globalAlpha = a * gAlpha;
      ctx.strokeStyle = i === removeIdx ? FB.gold : (jamP > 0.5 ? FB.red : FB.teal);
      ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(0, 0, g.r * s, 0, Math.PI * 2); ctx.stroke();
      for (let t = 0; t < g.teeth; t++) {
        const angle = (t / g.teeth) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * g.r * s, Math.sin(angle) * g.r * s);
        ctx.lineTo(Math.cos(angle) * (g.r + 4) * s, Math.sin(angle) * (g.r + 4) * s);
        ctx.stroke();
      }
      ctx.restore();
    });
    if (removeP > 0.3) drawFBText(ctx, "REMOVED", gears[removeIdx].x, gears[removeIdx].y + 22 * s, 6 * s, a * removeP, "center", FB.gold);
    if (jamP > 0.5) drawFBText(ctx, "JAMMED", W / 2, H * 0.6, 12 * s, a * jamP, "center", FB.red);
    const endP = interpolate(frame, [120, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SYSTEM BREAKS", W / 2, H * 0.78, 14 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: error log scrolling, increasingly red ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const errors = [
      "ValueError: weight out of range",
      "RuntimeError: NaN in layer 4",
      "Warning: unstable gradient",
      "Error: neuron 8891 diverged",
      "FATAL: cascade failure",
      "FATAL: all outputs NaN",
      "SYSTEM HALTED",
    ];
    const scrollOffset = interpolate(frame, [10, 140], [0, errors.length - 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < errors.length; i++) {
      const y = H * 0.12 + (i - scrollOffset) * H * 0.1;
      if (y < H * 0.05 || y > H * 0.7) continue;
      const severity = i / errors.length;
      const col = severity > 0.6 ? FB.red : severity > 0.3 ? FB.gold : FB.text.dim;
      drawFBText(ctx, errors[i], W * 0.08, y, 7 * s, a * 0.8, "left", col);
    }
    const endP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE ENTIRE SYSTEM BREAKS", W / 2, H * 0.85, 12 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: wrecking ball hitting a delicate neural web ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const rng = seeded(638);
    // Delicate web
    const webNodes: [number, number][] = [];
    for (let i = 0; i < 8; i++) webNodes.push([W * 0.3 + rng() * W * 0.4, H * 0.15 + rng() * H * 0.45]);
    const hitP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scatterP = interpolate(frame, [80, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 12; i++) {
      const fi = Math.floor(rng() * 8), ti = Math.floor(rng() * 8);
      if (fi === ti) continue;
      const broken = scatterP > 0.3;
      drawFBColorEdge(ctx, webNodes[fi][0], webNodes[fi][1], webNodes[ti][0], webNodes[ti][1], broken ? FB.red : FB.teal, s * 0.4, a * (1 - scatterP * 0.6));
    }
    webNodes.forEach(([x, y], i) => {
      const scatter = scatterP * (rng() - 0.5) * 40 * s;
      drawFBNode(ctx, x + scatter, y + scatter, 5 * s, (i + 2) % 8, a * (1 - scatterP * 0.5), frame);
    });
    // Wrecking ball swinging in
    const ballX = interpolate(frame, [20, 60], [W * 0.05, W * 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ballY = H * 0.35;
    if (hitP < 1) {
      ctx.globalAlpha = a; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(ballX, ballY, 10 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(ballX, ballY - 10 * s); ctx.lineTo(ballX - 20 * s, H * 0.05); ctx.stroke();
    }
    drawFBText(ctx, "RANDOM EDIT", ballX, ballY + 15 * s, 6 * s, a * (1 - hitP), "center", FB.gold);
    const endP = interpolate(frame, [130, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SYSTEM BREAKS", W / 2, H * 0.82, 14 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: equals sign — "random edit" =/= "fix", big red X ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // "RANDOM EDIT"
    const leftP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "RANDOM", cx - 35 * s, H * 0.28, 12 * s, a * leftP, "center", FB.gold);
    drawFBText(ctx, "EDIT", cx - 35 * s, H * 0.36, 12 * s, a * leftP, "center", FB.gold);
    // Not-equals
    const neqP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * neqP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * s;
    ctx.beginPath(); ctx.moveTo(cx - 8 * s, H * 0.3); ctx.lineTo(cx + 8 * s, H * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 8 * s, H * 0.34); ctx.lineTo(cx + 8 * s, H * 0.34); ctx.stroke();
    // Slash through
    ctx.beginPath(); ctx.moveTo(cx + 10 * s, H * 0.26); ctx.lineTo(cx - 10 * s, H * 0.38); ctx.stroke();
    // "FIX"
    drawFBText(ctx, "FIX", cx + 35 * s, H * 0.32, 16 * s, a * neqP, "center", FB.green);
    // Brain network below
    const netP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(639);
    for (let i = 0; i < 6; i++) {
      const nx = W * 0.2 + rng() * W * 0.6;
      const ny = H * 0.5 + rng() * H * 0.2;
      drawFBNode(ctx, nx, ny, 5 * s, (i + 1) % 8, a * netP, frame);
    }
    // Big X over the network
    const xP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * xP; ctx.strokeStyle = FB.red; ctx.lineWidth = 4 * s; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.48); ctx.lineTo(W * 0.85, H * 0.72); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.85, H * 0.48); ctx.lineTo(W * 0.15, H * 0.72); ctx.stroke();
    const endP = interpolate(frame, [135, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "THE ENTIRE SYSTEM BREAKS", cx, H * 0.88, 11 * s, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_063: VariantDef[] = [
  { id: "fb-063-v1", label: "Code errors then SYSTEM BREAKS", component: V1 },
  { id: "fb-063-v2", label: "Software vs brain side by side", component: V2 },
  { id: "fb-063-v3", label: "Wrong connection cascades red", component: V3 },
  { id: "fb-063-v4", label: "Jenga block pulled collapses tower", component: V4 },
  { id: "fb-063-v5", label: "NOT SOFTWARE crossed out BIOLOGY", component: V5 },
  { id: "fb-063-v6", label: "Gear removed jams the system", component: V6 },
  { id: "fb-063-v7", label: "Error log scrolling increasingly red", component: V7 },
  { id: "fb-063-v8", label: "Wrecking ball hits delicate web", component: V8 },
  { id: "fb-063-v9", label: "Random edit not-equals fix big X", component: V9 },
];
