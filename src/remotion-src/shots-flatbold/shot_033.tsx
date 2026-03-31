import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 033 — "By matching those glowing shapes to the electron scans,
   they put a name to the wires." — 150 frames (5s)
   Green glow matches EM scan, labels appear. */

const DUR = 150;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Left green glow shape, right EM gray shape, overlay -> label appears */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Left: green glow neuron shape
    const leftP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "LIGHT MICROSCOPE", W * 0.25, H * 0.08, 7 * sc, a * leftP, "center", FB.green);
    ctx.globalAlpha = a * leftP * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy - 15 * sc); ctx.lineTo(W * 0.25, cy + 20 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy); ctx.lineTo(W * 0.18, cy - 12 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy + 8 * sc); ctx.lineTo(W * 0.32, cy + 15 * sc); ctx.stroke();
    const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
    ctx.globalAlpha = a * leftP * 0.2 * pulse;
    const gGrad = ctx.createRadialGradient(W * 0.25, cy, 0, W * 0.25, cy, 18 * sc);
    gGrad.addColorStop(0, "rgba(110,221,138,0.5)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
    ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(W * 0.25, cy, 18 * sc, 0, Math.PI * 2); ctx.fill();
    // Right: EM gray shape (same branching, different style)
    const rightP = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ELECTRON SCAN", W * 0.75, H * 0.08, 7 * sc, a * rightP, "center", FB.text.dim);
    ctx.globalAlpha = a * rightP * 0.5; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2.5 * sc;
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy - 15 * sc); ctx.lineTo(W * 0.75, cy + 20 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy); ctx.lineTo(W * 0.68, cy - 12 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy + 8 * sc); ctx.lineTo(W * 0.82, cy + 15 * sc); ctx.stroke();
    // Match arrow
    const matchP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", cx, cy, 18 * sc, a * matchP, "center", FB.gold);
    // Label appears
    const labelP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelP > 0) {
      ctx.save(); ctx.translate(cx, H * 0.7);
      ctx.globalAlpha = a * labelP * 0.2; ctx.fillStyle = FB.gold;
      ctx.fillRect(-W * 0.15, -8 * sc, W * 0.3, 16 * sc);
      ctx.globalAlpha = a * labelP; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * sc;
      ctx.strokeRect(-W * 0.15, -8 * sc, W * 0.3, 16 * sc);
      drawFBText(ctx, "DNa02", 0, 0, 12 * sc, a * labelP, "center", FB.gold);
      ctx.restore();
    }
    drawFBText(ctx, "SHAPE MATCH \u2192 NAME", cx, H * 0.88, 9 * sc, a * matchP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Overlay animation — green and gray silhouettes slide together, label pops */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const slideP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const greenX = interpolate(slideP, [0, 1], [W * 0.2, cx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const grayX = interpolate(slideP, [0, 1], [W * 0.8, cx], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Green shape
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(greenX, cy - 18 * sc); ctx.lineTo(greenX - 3 * sc, cy + 18 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(greenX, cy); ctx.lineTo(greenX - 14 * sc, cy - 10 * sc); ctx.stroke();
    // Gray shape
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2.5 * sc;
    ctx.beginPath(); ctx.moveTo(grayX, cy - 18 * sc); ctx.lineTo(grayX - 3 * sc, cy + 18 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(grayX, cy); ctx.lineTo(grayX - 14 * sc, cy - 10 * sc); ctx.stroke();
    // Match flash
    if (slideP > 0.9) {
      const flashP = interpolate(frame, [70, 80, 95], [0, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * flashP * 0.15; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 30 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Label
    const labelP = interpolate(frame, [85, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MATCH!", cx, H * 0.62, 12 * sc, a * labelP, "center", FB.gold);
    // Name tag
    const nameP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MN9", cx, H * 0.75, 16 * sc, a * nameP, "center", FB.green);
    drawFBText(ctx, "a name for the wire", cx, H * 0.86, 8 * sc, a * nameP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Multiple neurons matched — cascade of green->gray->label pairs */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const names = ["DNa01", "MN9", "GF", "aDN1", "P9"];
    names.forEach((name, i) => {
      const y = H * 0.1 + i * H * 0.16;
      const matchP = interpolate(frame, [10 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Green blob left
      const pulse = 0.8 + Math.sin(frame * 0.06 + i) * 0.2;
      ctx.globalAlpha = a * matchP * 0.3 * pulse;
      const gGrad = ctx.createRadialGradient(W * 0.15, y, 0, W * 0.15, y, 10 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.5)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(W * 0.15, y, 10 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, W * 0.15, y, 4 * sc, 3, a * matchP, frame);
      // Gray blob middle
      drawFBNode(ctx, W * 0.4, y, 4 * sc, 6, a * matchP * 0.5, frame);
      // Arrow
      drawFBText(ctx, "\u2192", W * 0.28, y, 8 * sc, a * matchP, "center", FB.gold);
      drawFBText(ctx, "=", W * 0.52, y, 10 * sc, a * matchP, "center", FB.gold);
      // Name label
      const labelP = interpolate(frame, [25 + i * 18, 40 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, name, W * 0.72, y, 11 * sc, a * labelP, "center", FB.green);
    });
    const doneP = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NAMES FOR THE WIRES", W / 2, H * 0.92, 10 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Puzzle pieces — green shape + EM shape fit together, label revealed */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.38;
    // Left puzzle piece (green tinted)
    const p1 = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const leftX = interpolate(frame, [30, 65], [W * 0.2, cx - 12 * sc], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p1 * 0.3; ctx.fillStyle = FB.green;
    ctx.fillRect(leftX - 15 * sc, cy - 15 * sc, 30 * sc, 30 * sc);
    ctx.globalAlpha = a * p1 * 0.6; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5 * sc;
    ctx.strokeRect(leftX - 15 * sc, cy - 15 * sc, 30 * sc, 30 * sc);
    // Tab on right side
    ctx.fillStyle = FB.green; ctx.globalAlpha = a * p1 * 0.3;
    ctx.beginPath(); ctx.arc(leftX + 15 * sc, cy, 5 * sc, -Math.PI / 2, Math.PI / 2); ctx.fill();
    drawFBText(ctx, "GFP", leftX, cy, 8 * sc, a * p1, "center", FB.green);
    // Right puzzle piece (gray)
    const rightX = interpolate(frame, [30, 65], [W * 0.8, cx + 12 * sc], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * p1 * 0.2; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(rightX - 15 * sc, cy - 15 * sc, 30 * sc, 30 * sc);
    ctx.globalAlpha = a * p1 * 0.4; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
    ctx.strokeRect(rightX - 15 * sc, cy - 15 * sc, 30 * sc, 30 * sc);
    // Notch on left side
    ctx.fillStyle = "#1e1528"; ctx.globalAlpha = a * p1;
    ctx.beginPath(); ctx.arc(rightX - 15 * sc, cy, 5 * sc, -Math.PI / 2, Math.PI / 2); ctx.fill();
    drawFBText(ctx, "EM", rightX, cy, 8 * sc, a * p1, "center", FB.text.dim);
    // Fit flash
    const fitP = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fitP > 0) {
      ctx.globalAlpha = a * fitP * 0.15; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 25 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Label
    const labelP = interpolate(frame, [85, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IDENTIFIED:", cx, H * 0.62, 9 * sc, a * labelP, "center", FB.text.dim);
    drawFBText(ctx, "Giant Fiber", cx, H * 0.72, 14 * sc, a * labelP, "center", FB.gold);
    drawFBText(ctx, "glow + scan = name", cx, H * 0.86, 8 * sc, a * fitP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Registry — name tags fill in a list as shapes are matched */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "NEURON REGISTRY", W / 2, H * 0.06, 10 * sc, a, "center", FB.gold);
    const entries = ["DNa01 \u2713", "DNa02 \u2713", "MN9 \u2713", "Giant Fiber \u2713", "aDN1 \u2713", "P9_oDN1 \u2713"];
    entries.forEach((e, i) => {
      const eP = interpolate(frame, [15 + i * 15, 35 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ey = H * 0.15 + i * H * 0.12;
      // Row bg
      ctx.globalAlpha = a * eP * 0.06; ctx.fillStyle = FB.green;
      ctx.fillRect(W * 0.1, ey - 6 * sc, W * 0.8, 12 * sc);
      // Green dot
      const pulse = 0.8 + Math.sin(frame * 0.06 + i) * 0.2;
      ctx.globalAlpha = a * eP * 0.3 * pulse; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(W * 0.15, ey, 4 * sc, 0, Math.PI * 2); ctx.fill();
      // Name
      drawFBText(ctx, e, W * 0.5, ey, 10 * sc, a * eP, "center", FB.green);
    });
    const doneP = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NAMED BY SHAPE MATCHING", W / 2, H * 0.92, 9 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Split microscope — left fluorescent green, right EM gray, merge center */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const midX = W / 2, cy = H * 0.4;
    // Left half: green fluorescent
    const lP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * lP * 0.05; ctx.fillStyle = FB.green;
    ctx.fillRect(0, H * 0.12, midX, H * 0.55);
    drawFBText(ctx, "FLUORESCENCE", W * 0.25, H * 0.08, 8 * sc, a * lP, "center", FB.green);
    // Green neuron branches
    ctx.globalAlpha = a * lP * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy - 20 * sc); ctx.lineTo(W * 0.25, cy + 20 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy - 5 * sc); ctx.lineTo(W * 0.15, cy - 18 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.25, cy + 8 * sc); ctx.lineTo(W * 0.35, cy + 16 * sc); ctx.stroke();
    // Right half: EM gray
    const rP = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.05; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(midX, H * 0.12, midX, H * 0.55);
    drawFBText(ctx, "ELECTRON SCAN", W * 0.75, H * 0.08, 8 * sc, a * rP, "center", FB.text.dim);
    ctx.globalAlpha = a * rP * 0.35; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2.5 * sc;
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy - 20 * sc); ctx.lineTo(W * 0.75, cy + 20 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy - 5 * sc); ctx.lineTo(W * 0.65, cy - 18 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.75, cy + 8 * sc); ctx.lineTo(W * 0.85, cy + 16 * sc); ctx.stroke();
    // Merge animation
    const mergeP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mergeP > 0.5) {
      ctx.globalAlpha = a * (mergeP - 0.5) * 0.2; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(midX, cy, 20 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Label at center
    const labelP = interpolate(frame, [95, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2192 MATCH \u2190", midX, cy, 10 * sc, a * mergeP, "center", FB.gold);
    drawFBText(ctx, "aDN1", midX, H * 0.75, 16 * sc, a * labelP, "center", FB.green);
    drawFBText(ctx, "now it has a name", midX, H * 0.85, 8 * sc, a * labelP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Stacked comparison — green shape | gray shape | name, row by row */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "GLOW", W * 0.2, H * 0.06, 8 * sc, a, "center", FB.green);
    drawFBText(ctx, "SCAN", W * 0.5, H * 0.06, 8 * sc, a, "center", FB.text.dim);
    drawFBText(ctx, "NAME", W * 0.8, H * 0.06, 8 * sc, a, "center", FB.gold);
    const rows = ["DNa01", "MN9", "GF", "aDN1", "P9"];
    rows.forEach((name, i) => {
      const ry = H * 0.15 + i * H * 0.15;
      const rP = interpolate(frame, [10 + i * 12, 25 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Green dot
      const pulse = 0.8 + Math.sin(frame * 0.07 + i) * 0.2;
      ctx.globalAlpha = a * rP * 0.3 * pulse; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(W * 0.2, ry, 6 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, W * 0.2, ry, 3 * sc, 3, a * rP, frame);
      // Gray dot
      drawFBNode(ctx, W * 0.5, ry, 3 * sc, 6, a * rP * 0.4, frame);
      // Arrow and name
      const matchP = interpolate(frame, [20 + i * 12, 35 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "=", W * 0.35, ry, 8 * sc, a * matchP * 0.5, "center", FB.gold);
      drawFBText(ctx, "\u2192", W * 0.65, ry, 8 * sc, a * matchP * 0.5, "center", FB.gold);
      drawFBText(ctx, name, W * 0.8, ry, 10 * sc, a * matchP, "center", FB.green);
    });
    const doneP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WIRES NOW HAVE NAMES", W / 2, H * 0.92, 10 * sc, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Fingerprint match — neuron "fingerprint" compared and labeled */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Fingerprint-style circles (green)
    const fpP = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 1; r <= 4; r++) {
      ctx.globalAlpha = a * fpP * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 1 * sc;
      ctx.beginPath(); ctx.arc(W * 0.25, cy, r * 6 * sc, 0, Math.PI * 2); ctx.stroke();
    }
    drawFBText(ctx, "SHAPE A", W * 0.25, cy + 30 * sc, 7 * sc, a * fpP, "center", FB.green);
    // Fingerprint-style circles (gray / EM)
    const emP = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let r = 1; r <= 4; r++) {
      ctx.globalAlpha = a * emP * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1 * sc;
      ctx.beginPath(); ctx.arc(W * 0.75, cy, r * 6 * sc, 0, Math.PI * 2); ctx.stroke();
    }
    drawFBText(ctx, "SHAPE B", W * 0.75, cy + 30 * sc, 7 * sc, a * emP, "center", FB.text.dim);
    // Match
    const matchP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "MATCH", cx, cy, 14 * sc, a * matchP, "center", FB.gold);
    // Result
    const resP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IDENTIFIED:", cx, H * 0.65, 9 * sc, a * resP, "center", FB.text.dim);
    drawFBText(ctx, "aDN1", cx, H * 0.76, 18 * sc, a * resP, "center", FB.green);
    drawFBText(ctx, "the wire has a name", cx, H * 0.88, 8 * sc, a * resP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Big reveal — "?" node becomes named node through green/EM comparison */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.35;
    // Start with "?" node
    const qP = interpolate(frame, [5, 20, 50, 65], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy, 18 * sc, 6, a * qP, frame);
    drawFBText(ctx, "?", cx, cy, 16 * sc, a * qP, "center", FB.gold);
    // Process: green comparison
    const greenP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (greenP > 0) {
      const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
      ctx.globalAlpha = a * greenP * 0.2 * pulse;
      const gGrad = ctx.createRadialGradient(cx - 25 * sc, cy, 0, cx - 25 * sc, cy, 12 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.5)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(cx - 25 * sc, cy, 12 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // EM comparison
    const emP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx + 25 * sc, cy, 6 * sc, 6, a * emP * 0.4, frame);
    // Transform: named node appears
    const nameP = interpolate(frame, [75, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (nameP > 0) {
      drawFBNode(ctx, cx, cy, 18 * sc, 3, a * nameP, frame);
      drawFBText(ctx, "MN9", cx, cy, 12 * sc, a * nameP, "center", FB.text.primary);
      // Glow
      ctx.globalAlpha = a * nameP * 0.15;
      const nGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 * sc);
      nGrad.addColorStop(0, "rgba(110,221,138,0.4)"); nGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = nGrad; ctx.beginPath(); ctx.arc(cx, cy, 30 * sc, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "? \u2192 NAME", cx, H * 0.62, 12 * sc, a * nameP, "center", FB.gold);
    drawFBText(ctx, "matching glow to scan", cx, H * 0.75, 8 * sc, a * nameP, "center", FB.text.dim);
    drawFBText(ctx, "puts a name to the wires", cx, H * 0.83, 8 * sc, a * nameP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_033: VariantDef[] = [
  { id: "fb-033-v1", label: "Green glow shape = EM shape, label appears", component: V1 },
  { id: "fb-033-v2", label: "Overlay: green and gray slide together, name pops", component: V2 },
  { id: "fb-033-v3", label: "Cascade of green->gray->label pairs", component: V3 },
  { id: "fb-033-v4", label: "Puzzle pieces fit together, label revealed", component: V4 },
  { id: "fb-033-v5", label: "Registry list fills in as shapes matched", component: V5 },
  { id: "fb-033-v6", label: "Split fluorescent/EM merge at center", component: V6 },
  { id: "fb-033-v7", label: "Row comparison: glow | scan | name", component: V7 },
  { id: "fb-033-v8", label: "Fingerprint circles compared and labeled", component: V8 },
  { id: "fb-033-v9", label: "? node transforms into named node", component: V9 },
];
