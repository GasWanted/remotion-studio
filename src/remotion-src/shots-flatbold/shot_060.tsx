import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 60 — "Since the whole thing runs in PyTorch, those numbers are editable."
   90 frames (3s) */

// ---------- V1: cursor clicks a weight, types a new value ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Code-like box
    ctx.globalAlpha = a * 0.15;
    ctx.fillStyle = FB.text.primary;
    ctx.fillRect(W * 0.1, H * 0.15, W * 0.8, H * 0.55);
    // Weight line
    const oldVal = "+347";
    const newVal = "-120";
    const editP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const displayVal = editP < 0.5 ? oldVal : newVal;
    const displayCol = editP < 0.5 ? FB.green : FB.red;
    drawFBText(ctx, "weights[42][17] = ", cx - 20 * s, cy, 10 * s, a, "right", FB.text.dim);
    drawFBText(ctx, displayVal, cx + 10 * s, cy, 14 * s, a, "center", displayCol);
    // Cursor blink
    if (editP > 0.3 && Math.floor(frame / 8) % 2 === 0) {
      ctx.globalAlpha = a;
      ctx.fillStyle = FB.gold;
      ctx.fillRect(cx + 28 * s, cy - 8 * s, 2 * s, 16 * s);
    }
    // "EDITABLE" label
    const labelP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EDITABLE", cx, H * 0.82, 14 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: PyTorch tensor display, one cell highlighted and changing ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const rng = seeded(6020);
    drawFBText(ctx, "torch.sparse_coo_tensor", W / 2, H * 0.08, 8 * s, a, "center", FB.purple);
    const rows = 4, nCols = 5;
    const cellW = W * 0.14, cellH = H * 0.1;
    const startX = W * 0.15, startY = H * 0.18;
    const editR = 2, editC = 3;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < nCols; c++) {
        const x = startX + c * cellW, y = startY + r * cellH;
        const isEdit = r === editR && c === editC;
        const val = Math.round((rng() - 0.4) * 800);
        ctx.globalAlpha = a * (isEdit ? 0.3 : 0.08);
        ctx.fillStyle = isEdit ? FB.gold : FB.text.dim;
        ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        if (isEdit) {
          const editP = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const newVal = Math.round(interpolate(editP, [0, 1], [val, val * -2]));
          drawFBText(ctx, String(newVal), x + cellW / 2, y + cellH / 2, 8 * s, a, "center", FB.gold);
        } else {
          drawFBText(ctx, String(val), x + cellW / 2, y + cellH / 2, 6 * s, a * 0.6, "center", FB.text.dim);
        }
      }
    }
    const labelP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PYTORCH MAKES IT EDITABLE", W / 2, H * 0.82, 10 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: code snippet with line being modified ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const lines = [
      { text: "# brain weights", color: FB.text.dim },
      { text: "W = load('weights.pt')", color: FB.teal },
      { text: "W[42, 17] = -120  # edit", color: FB.gold },
      { text: "save(W)", color: FB.teal },
    ];
    lines.forEach((ln, i) => {
      const t = interpolate(frame, [8 + i * 10, 18 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.2 + i * H * 0.14;
      const highlight = i === 2;
      if (highlight) {
        ctx.globalAlpha = a * t * 0.12;
        ctx.fillStyle = FB.gold;
        ctx.fillRect(W * 0.08, y - 6 * s, W * 0.84, 12 * s);
      }
      drawFBText(ctx, ln.text, W * 0.1, y, 9 * s, a * t, "left", ln.color);
    });
    const labelP = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "JUST CHANGE THE NUMBER", W / 2, H * 0.82, 11 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: before/after weight comparison with arrow ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Before box
    const befP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * befP * 0.15;
    ctx.fillStyle = FB.green;
    ctx.fillRect(W * 0.08, cy - 18 * s, W * 0.3, 36 * s);
    drawFBText(ctx, "BEFORE", W * 0.23, cy - 24 * s, 7 * s, a * befP, "center", FB.text.dim);
    drawFBCounter(ctx, "+347", W * 0.23, cy, 16 * s, FB.green, a * befP);
    // Arrow
    const arrP = interpolate(frame, [25, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP;
    ctx.fillStyle = FB.gold;
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, cy - 4 * s); ctx.lineTo(cx + 8 * s, cy);
    ctx.lineTo(cx - 5 * s, cy + 4 * s); ctx.closePath(); ctx.fill();
    // After box
    const aftP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * aftP * 0.15;
    ctx.fillStyle = FB.red;
    ctx.fillRect(W * 0.62, cy - 18 * s, W * 0.3, 36 * s);
    drawFBText(ctx, "AFTER", W * 0.77, cy - 24 * s, 7 * s, a * aftP, "center", FB.text.dim);
    drawFBCounter(ctx, "-120", W * 0.77, cy, 16 * s, FB.red, a * aftP);
    const labelP = interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NUMBERS ARE EDITABLE", cx, H * 0.78, 12 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: node connection weight morphs live ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const lx = W * 0.25, rx = W * 0.75, cy = H * 0.4;
    drawFBNode(ctx, lx, cy, 14 * s, 3, a, frame);
    drawFBNode(ctx, rx, cy, 14 * s, 1, a, frame);
    // Weight morphing
    const morphP = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wVal = interpolate(morphP, [0, 0.3, 0.6, 1], [500, 200, -100, -400]);
    const col = wVal > 0 ? FB.green : FB.red;
    const thick = Math.abs(wVal) / 500 * 3 + 0.5;
    drawFBColorEdge(ctx, lx + 14 * s, cy, rx - 14 * s, cy, col, s * thick, a);
    drawFBCounter(ctx, (wVal > 0 ? "+" : "") + Math.round(wVal), W / 2, cy - 16 * s, 12 * s, col, a);
    // Cursor icon near the weight
    if (morphP > 0.1 && morphP < 0.9) {
      ctx.globalAlpha = a * 0.7;
      ctx.fillStyle = FB.gold;
      ctx.beginPath();
      ctx.moveTo(W / 2 + 20 * s, cy - 5 * s);
      ctx.lineTo(W / 2 + 24 * s, cy + 8 * s);
      ctx.lineTo(W / 2 + 18 * s, cy + 5 * s);
      ctx.closePath(); ctx.fill();
    }
    const labelP = interpolate(frame, [65, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "LIVE EDITING IN PYTORCH", W / 2, H * 0.75, 10 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: text-editor feel — multiple weight lines, one gets rewritten ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const weights = ["+412", "-89", "+1003", "+256", "-641"];
    const editIdx = 2;
    weights.forEach((w, i) => {
      const y = H * 0.15 + i * H * 0.13;
      const isEdit = i === editIdx;
      const t = interpolate(frame, [3 + i * 5, 10 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (isEdit) {
        const strikeP = interpolate(frame, [30, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const newP = interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // Strikethrough old value
        drawFBText(ctx, w, W * 0.4, y, 11 * s, a * t * (1 - newP * 0.7), "center", FB.text.dim);
        if (strikeP > 0) {
          ctx.globalAlpha = a * strikeP;
          ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * s;
          ctx.beginPath(); ctx.moveTo(W * 0.3, y); ctx.lineTo(W * 0.5, y); ctx.stroke();
        }
        if (newP > 0) {
          drawFBText(ctx, "-777", W * 0.65, y, 11 * s, a * newP, "center", FB.gold);
        }
      } else {
        const positive = w.startsWith("+");
        drawFBText(ctx, w, W * 0.4, y, 10 * s, a * t * 0.5, "center", positive ? FB.green : FB.red);
      }
      drawFBText(ctx, `syn_${i}`, W * 0.15, y, 7 * s, a * t * 0.4, "center", FB.text.dim);
    });
    const labelP = interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EDIT ANY SYNAPSE", W / 2, H * 0.85, 12 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: PyTorch logo hint + "editable" stamp ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    // Flame-like shape for PyTorch hint
    const flameP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flameP * 0.4;
    ctx.fillStyle = FB.red;
    ctx.beginPath();
    ctx.arc(cx, H * 0.3, 20 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = FB.bg;
    ctx.beginPath();
    ctx.arc(cx + 5 * s, H * 0.32, 8 * s, 0, Math.PI * 2);
    ctx.fill();
    drawFBText(ctx, "PyTorch", cx, H * 0.48, 14 * s, a * flameP, "center", FB.red);
    // Matrix of weights beneath
    const matP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(607);
    for (let i = 0; i < 8; i++) {
      const x = W * 0.15 + (i % 4) * W * 0.18;
      const y = H * 0.58 + Math.floor(i / 4) * H * 0.09;
      const val = Math.round((rng() - 0.4) * 600);
      drawFBText(ctx, String(val), x, y, 7 * s, a * matP * 0.5, "center", val > 0 ? FB.green : FB.red);
    }
    // EDITABLE stamp
    const stampP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stampRot = interpolate(stampP, [0, 1], [-0.15, -0.08]);
    ctx.save();
    ctx.translate(cx, H * 0.62);
    ctx.rotate(stampRot);
    ctx.globalAlpha = a * stampP * 0.8;
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
    ctx.strokeRect(-40 * s, -10 * s, 80 * s, 20 * s);
    drawFBText(ctx, "EDITABLE", 0, 0, 12 * s, a * stampP, "center", FB.gold);
    ctx.restore();
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: weight counter being typed digit by digit ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const digits = ["-", "1", "2", "0"];
    let display = "";
    digits.forEach((d, i) => {
      const t = interpolate(frame, [15 + i * 10, 20 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t > 0.5) display += d;
    });
    // Background box
    ctx.globalAlpha = a * 0.1;
    ctx.fillStyle = FB.text.primary;
    ctx.fillRect(cx - 40 * s, cy - 16 * s, 80 * s, 32 * s);
    drawFBText(ctx, display || "_", cx, cy, 22 * s, a, "center", FB.gold);
    // Blinking cursor
    if (display.length < 4 && Math.floor(frame / 6) % 2 === 0) {
      const cursorX = cx + display.length * 8 * s;
      ctx.globalAlpha = a; ctx.fillStyle = FB.gold;
      ctx.fillRect(cursorX, cy - 10 * s, 2 * s, 20 * s);
    }
    drawFBText(ctx, "synapse_value =", cx, cy - 28 * s, 8 * s, a, "center", FB.text.dim);
    const doneP = interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TYPE ANY NUMBER", cx, H * 0.72, 11 * s, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: network with one edge flashing as it gets rewritten ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 90);
    const s = Math.min(W, H) / 360;
    // Small network: 5 nodes
    const positions: [number, number][] = [
      [W * 0.2, H * 0.25], [W * 0.5, H * 0.15], [W * 0.8, H * 0.3],
      [W * 0.35, H * 0.55], [W * 0.65, H * 0.55],
    ];
    const conns: [number, number][] = [[0,1],[1,2],[0,3],[3,4],[1,4],[2,4]];
    const editConn = 3; // highlight connection 3→4
    conns.forEach(([fi, ti], idx) => {
      const isEdit = idx === editConn;
      const flash = isEdit ? 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.12)) : 0.3;
      const col = isEdit ? FB.gold : FB.text.dim;
      drawFBColorEdge(ctx, positions[fi][0], positions[fi][1], positions[ti][0], positions[ti][1], col, s * (isEdit ? 2 : 0.8), a * flash);
    });
    positions.forEach(([x, y], i) => drawFBNode(ctx, x, y, 8 * s, i + 1, a, frame));
    // The edited weight morphing
    const morphP = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const val = Math.round(interpolate(morphP, [0, 1], [450, -300]));
    const midX = (positions[3][0] + positions[4][0]) / 2;
    const midY = (positions[3][1] + positions[4][1]) / 2;
    drawFBCounter(ctx, (val > 0 ? "+" : "") + val, midX, midY - 10 * s, 10 * s, FB.gold, a);
    const labelP = interpolate(frame, [65, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "REWRITE ANY CONNECTION", W / 2, H * 0.82, 10 * s, a * labelP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_060: VariantDef[] = [
  { id: "fb-060-v1", label: "Cursor clicks weight types new value", component: V1 },
  { id: "fb-060-v2", label: "PyTorch tensor cell highlighted editing", component: V2 },
  { id: "fb-060-v3", label: "Code snippet line modified", component: V3 },
  { id: "fb-060-v4", label: "Before/after weight comparison", component: V4 },
  { id: "fb-060-v5", label: "Connection weight morphs live", component: V5 },
  { id: "fb-060-v6", label: "Text editor weight lines rewritten", component: V6 },
  { id: "fb-060-v7", label: "PyTorch logo with EDITABLE stamp", component: V7 },
  { id: "fb-060-v8", label: "Digit-by-digit weight typing", component: V8 },
  { id: "fb-060-v9", label: "Network edge flashing during rewrite", component: V9 },
];
