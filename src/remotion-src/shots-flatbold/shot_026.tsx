import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";
import { drawX, drawCheck, drawPowerButton } from "../icons";

/* Shot 026 — "Nobody coded a rule like, 'if you see sugar, then eat.' They just
   copied the wiring and turned it on." — 210 frames (7s)
   Code "if sugar then eat" crossed out red, wiring copied, power on. */

const DUR = 210;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Code block crossed out, then wiring copies in, power button activates */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Phase 1: code appears
    const codeP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lines = ["if (see_sugar):", "  eat();"];
    lines.forEach((l, i) => drawFBText(ctx, l, cx, H * 0.2 + i * 14 * sc, 10 * sc, a * codeP, "center", FB.green));
    // Phase 2: crossed out red
    const crossP = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crossP > 0) {
      ctx.globalAlpha = a * crossP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * sc;
      ctx.beginPath(); ctx.moveTo(cx - W * 0.2, H * 0.15); ctx.lineTo(cx + W * 0.2, H * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + W * 0.2, H * 0.15); ctx.lineTo(cx - W * 0.2, H * 0.35); ctx.stroke();
      drawFBText(ctx, "NOBODY WROTE THIS", cx, H * 0.4, 9 * sc, a * crossP, "center", FB.red);
    }
    // Phase 3: wiring copied
    const wireP = interpolate(frame, [90, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2601);
    for (let i = 0; i < 10; i++) {
      const nx = W * 0.15 + rng() * W * 0.7, ny = H * 0.5 + rng() * H * 0.22;
      const nP = interpolate(frame, [90 + i * 4, 105 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 4 * sc + rng() * 3 * sc, i, a * nP);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.15 + rng() * W * 0.7, H * 0.5 + rng() * H * 0.22, sc, a * nP * 0.3, frame);
      else { rng(); rng(); }
    }
    drawFBText(ctx, "JUST COPIED THE WIRING", cx, H * 0.77, 10 * sc, a * wireP, "center", FB.teal);
    // Phase 4: power on
    const powerP = interpolate(frame, [155, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (powerP > 0) {
      drawPowerButton(ctx, cx, H * 0.88, 20 * sc, FB.green, a * powerP);
      ctx.globalAlpha = a * powerP * 0.1; ctx.fillStyle = FB.green; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Split — left "DIDN'T write", right "ACTUALLY did" */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.85); ctx.stroke();
    const leftP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DIDN'T WRITE", W * 0.25, H * 0.08, 9 * sc, a * leftP, "center", FB.red);
    const codeLines = ["if sugar:", "  eat()", "if danger:", "  run()"];
    codeLines.forEach((l, i) => drawFBText(ctx, l, W * 0.25, H * 0.25 + i * H * 0.1, 9 * sc, a * leftP * 0.5, "center", FB.text.dim));
    const xP = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xP > 0) drawX(ctx, W * 0.25, H * 0.38, 60, FB.red, a * xP);
    const rightP = interpolate(frame, [70, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ACTUALLY DID", W * 0.75, H * 0.08, 9 * sc, a * rightP, "center", FB.green);
    const rng = seeded(2602);
    for (let i = 0; i < 8; i++) {
      const nx = W * 0.58 + rng() * W * 0.35, ny = H * 0.18 + rng() * H * 0.5;
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * rightP * interpolate(frame, [75 + i * 5, 90 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.58 + rng() * W * 0.35, H * 0.18 + rng() * H * 0.5, sc, a * rightP * 0.2, frame);
      else { rng(); rng(); }
    }
    drawFBText(ctx, "copy wiring", W * 0.75, H * 0.72, 8 * sc, a * rightP, "center", FB.teal);
    const pwrP = interpolate(frame, [140, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPowerButton(ctx, W * 0.75, H * 0.82, 18 * sc, FB.green, a * pwrP);
    drawFBText(ctx, "turn it on", W * 0.75, H * 0.92, 8 * sc, a * pwrP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Code types out, gets deleted, wiring materializes, power flick */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const codeStr = "if (see_sugar) { eat(); }";
    const typed = Math.floor(interpolate(frame, [5, 50], [0, codeStr.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const fadeCode = interpolate(frame, [55, 80], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeCode > 0) {
      drawFBText(ctx, codeStr.slice(0, typed), cx, H * 0.25, 9 * sc, a * fadeCode, "center", FB.green);
      if (typed < codeStr.length && Math.sin(frame * 0.3) > 0) {
        ctx.globalAlpha = a * fadeCode; ctx.fillStyle = FB.text.primary;
        ctx.fillRect(cx + typed * 3.5 * sc - codeStr.length * 1.75 * sc, H * 0.25 - 6 * sc, 2, 12 * sc);
      }
    }
    const delP = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (delP > 0 && delP < 1) drawX(ctx, cx, H * 0.25, 40, FB.red, a * delP);
    const wireP = interpolate(frame, [90, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2603);
    for (let i = 0; i < 12; i++) {
      const nx = W * 0.1 + rng() * W * 0.8, ny = H * 0.35 + rng() * H * 0.35;
      const nP = interpolate(frame, [90 + i * 3, 100 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 3 * sc + rng() * 3 * sc, i % 8, a * nP);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.1 + rng() * W * 0.8, H * 0.35 + rng() * H * 0.35, sc, a * nP * 0.2, frame);
      else { rng(); rng(); }
    }
    drawFBText(ctx, "COPY THE WIRING", cx, H * 0.78, 10 * sc, a * wireP, "center", FB.teal);
    const pwrP = interpolate(frame, [155, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pwrP > 0) {
      drawPowerButton(ctx, cx, H * 0.9, 20 * sc, FB.green, a * pwrP);
      ctx.globalAlpha = a * pwrP * 0.08; ctx.fillStyle = FB.green; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Sugar cube crossed out, wiring plays instead */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const sugarP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarP * 0.3; ctx.fillStyle = FB.text.dim;
    ctx.fillRect(W * 0.15, H * 0.15, 20 * sc, 20 * sc);
    drawFBText(ctx, "S", W * 0.15 + 10 * sc, H * 0.15 + 10 * sc, 10 * sc, a * sugarP * 0.6, "center", FB.text.primary);
    drawFBText(ctx, "\u2192", W * 0.35, H * 0.25, 14 * sc, a * sugarP * 0.5, "center", FB.text.dim);
    drawFBText(ctx, "eat()", W * 0.5, H * 0.25, 12 * sc, a * sugarP * 0.5, "center", FB.text.dim);
    const crossP = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (crossP > 0) drawX(ctx, W * 0.35, H * 0.22, 55, FB.red, a * crossP);
    drawFBText(ctx, "NO HAND-CODED RULES", cx, H * 0.4, 10 * sc, a * crossP, "center", FB.red);
    const wireP = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "INSTEAD:", cx, H * 0.5, 9 * sc, a * wireP, "center", FB.gold);
    const rng = seeded(2604);
    for (let i = 0; i < 8; i++) {
      const nx = W * 0.2 + rng() * W * 0.6, ny = H * 0.56 + rng() * H * 0.2;
      const nP = interpolate(frame, [75 + i * 5, 95 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * nP);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.2 + rng() * W * 0.6, H * 0.56 + rng() * H * 0.2, sc, a * nP * 0.2, frame);
      else { rng(); rng(); }
    }
    const pwrP = interpolate(frame, [145, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPowerButton(ctx, cx, H * 0.85, 18 * sc, FB.green, a * pwrP);
    drawFBText(ctx, "TURNED IT ON", cx, H * 0.94, 9 * sc, a * pwrP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Three-act — "RULES?" big X, "WIRING" copies, "POWER" green */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const a1 = interpolate(frame, [5, 30, 55, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RULES?", cx, H * 0.35, 22 * sc, a * a1, "center", FB.text.dim);
    const xP = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (a1 > 0) drawX(ctx, cx, H * 0.35, 60, FB.red, a * a1 * xP);
    const a2 = interpolate(frame, [75, 100, 130, 145], [0, 1, 1, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (a2 > 0) {
      drawFBText(ctx, "COPY", cx, H * 0.3, 14 * sc, a * a2, "center", FB.teal);
      drawFBText(ctx, "THE WIRING", cx, H * 0.42, 14 * sc, a * a2, "center", FB.teal);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.01;
        drawFBNode(ctx, cx + Math.cos(angle) * 40 * sc, H * 0.36 + Math.sin(angle) * 15 * sc, 3 * sc, i, a * a2 * 0.5);
      }
    }
    const a3 = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (a3 > 0) {
      drawPowerButton(ctx, cx, H * 0.65, 30 * sc, FB.green, a * a3);
      drawFBText(ctx, "TURN IT ON", cx, H * 0.82, 16 * sc, a * a3, "center", FB.green);
      ctx.globalAlpha = a * a3 * 0.08; ctx.fillStyle = FB.green; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Monitor: code deleted, replaced by network visualization */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * sc;
    ctx.strokeRect(W * 0.08, H * 0.08, W * 0.84, H * 0.7);
    const codeFade = interpolate(frame, [5, 30, 60, 85], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ["if sugar:", "  eat()", "if touch:", "  groom()"].forEach((l, i) => {
      drawFBText(ctx, l, W * 0.2, H * 0.18 + i * 12 * sc, 9 * sc, a * codeFade * 0.6, "left", FB.green);
    });
    if (codeFade > 0.5 && frame > 50) {
      ctx.globalAlpha = a * (codeFade - 0.5) * 2; ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * sc;
      ctx.beginPath(); ctx.moveTo(W * 0.12, H * 0.14); ctx.lineTo(W * 0.55, H * 0.58); ctx.stroke();
    }
    const netP = interpolate(frame, [90, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(2606);
    for (let i = 0; i < 10; i++) {
      const nx = W * 0.15 + rng() * W * 0.7, ny = H * 0.15 + rng() * H * 0.5;
      const nP = interpolate(frame, [90 + i * 4, 105 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, nx, ny, 4 * sc, i, a * nP);
      if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.15 + rng() * W * 0.7, H * 0.15 + rng() * H * 0.5, sc, a * nP * 0.2, frame);
      else { rng(); rng(); }
    }
    const pwrP = interpolate(frame, [160, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPowerButton(ctx, cx, H * 0.88, 18 * sc, FB.green, a * pwrP);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Stamp machine — code page REJECTED, wiring page accepted */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const slideIn = interpolate(frame, [5, 30], [W * -0.3, W * 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pageFade = interpolate(frame, [5, 30, 70, 90], [0, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * pageFade * 0.15; ctx.fillStyle = "#fff";
    ctx.fillRect(slideIn, H * 0.15, W * 0.35, H * 0.5);
    drawFBText(ctx, "if sugar:", slideIn + W * 0.05, H * 0.25, 8 * sc, a * pageFade * 0.5, "left", FB.text.dim);
    drawFBText(ctx, "  eat()", slideIn + W * 0.05, H * 0.33, 8 * sc, a * pageFade * 0.5, "left", FB.text.dim);
    const rejP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rejP > 0) {
      ctx.save(); ctx.translate(slideIn + W * 0.17, H * 0.38); ctx.rotate(-0.15);
      ctx.globalAlpha = a * rejP * 0.8; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * sc;
      ctx.strokeRect(-W * 0.12, -8 * sc, W * 0.24, 16 * sc);
      drawFBText(ctx, "REJECTED", 0, 0, 12 * sc, a * rejP, "center", FB.red);
      ctx.restore();
    }
    const wireSlide = interpolate(frame, [90, 120], [W * 1.3, W * 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wireP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * wireP * 0.1; ctx.fillStyle = FB.teal;
    ctx.fillRect(wireSlide, H * 0.15, W * 0.35, H * 0.5);
    const rng = seeded(2607);
    for (let i = 0; i < 6; i++) drawFBNode(ctx, wireSlide + W * 0.03 + rng() * W * 0.29, H * 0.2 + rng() * H * 0.4, 3 * sc, i, a * wireP);
    drawFBText(ctx, "WIRING", wireSlide + W * 0.17, H * 0.7, 10 * sc, a * wireP, "center", FB.teal);
    const pwrP = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPowerButton(ctx, cx, H * 0.88, 20 * sc, FB.green, a * pwrP);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Stacked emphasis text — NO HAND-CODED RULES / JUST COPIED THE WIRING */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    const words = [
      { text: "NO", y: H * 0.15, size: 18, color: FB.red, start: 5 },
      { text: "HAND-CODED", y: H * 0.28, size: 14, color: FB.red, start: 12 },
      { text: "RULES", y: H * 0.4, size: 20, color: FB.red, start: 22 },
      { text: "JUST", y: H * 0.56, size: 12, color: FB.text.dim, start: 55 },
      { text: "COPIED", y: H * 0.66, size: 16, color: FB.teal, start: 65 },
      { text: "THE WIRING", y: H * 0.78, size: 18, color: FB.teal, start: 78 },
    ];
    words.forEach(w => {
      const p = interpolate(frame, [w.start, w.start + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const punch = Math.max(1, 1.3 - (frame - w.start - 10) * 0.03);
      drawFBText(ctx, w.text, cx, w.y, w.size * sc * Math.min(1.2, punch), a * p, "center", w.color);
    });
    const pwrP = interpolate(frame, [130, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pwrP > 0) {
      drawPowerButton(ctx, cx, H * 0.92, 18 * sc, FB.green, a * pwrP);
      ctx.globalAlpha = a * pwrP * 0.06; ctx.fillStyle = FB.green; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Flip book — page 1 code, page 2 X, page 3 wiring, page 4 power on */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.45;
    const page = frame < 55 ? 1 : frame < 95 ? 2 : frame < 155 ? 3 : 4;
    for (let p = 1; p <= 4; p++) {
      ctx.globalAlpha = a * (p === page ? 0.8 : 0.2); ctx.fillStyle = p === page ? FB.gold : FB.text.dim;
      ctx.beginPath(); ctx.arc(cx + (p - 2.5) * 12 * sc, H * 0.95, 3 * sc, 0, Math.PI * 2); ctx.fill();
    }
    if (page === 1) {
      const p = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, 'if (sugar)', cx, cy - 8 * sc, 14 * sc, a * p, "center", FB.green);
      drawFBText(ctx, '{ eat(); }', cx, cy + 12 * sc, 14 * sc, a * p, "center", FB.green);
    } else if (page === 2) {
      const p = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawX(ctx, cx, cy, 80, FB.red, a * p);
      drawFBText(ctx, "NOPE", cx, cy + 45 * sc, 14 * sc, a * p, "center", FB.red);
    } else if (page === 3) {
      const p = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const rng = seeded(2609);
      for (let i = 0; i < 10; i++) {
        const nx = W * 0.15 + rng() * W * 0.7, ny = H * 0.2 + rng() * H * 0.45;
        drawFBNode(ctx, nx, ny, 4 * sc, i, a * p * interpolate(frame, [98 + i * 3, 108 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
        if (i > 0) drawFBEdge(ctx, nx, ny, W * 0.15 + rng() * W * 0.7, H * 0.2 + rng() * H * 0.45, sc, a * p * 0.2, frame);
        else { rng(); rng(); }
      }
      drawFBText(ctx, "COPIED WIRING", cx, H * 0.75, 11 * sc, a * p, "center", FB.teal);
    } else {
      const p = interpolate(frame, [155, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawPowerButton(ctx, cx, cy - 10 * sc, 35 * sc, FB.green, a * p);
      drawFBText(ctx, "TURNED IT ON", cx, cy + 35 * sc, 14 * sc, a * p, "center", FB.green);
      ctx.globalAlpha = a * p * 0.1; ctx.fillStyle = FB.green; ctx.fillRect(0, 0, W, H);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_026: VariantDef[] = [
  { id: "fb-026-v1", label: "Code crossed out, wiring copies in, power on", component: V1 },
  { id: "fb-026-v2", label: "Split: didn't write vs actually did", component: V2 },
  { id: "fb-026-v3", label: "Code types then deletes, wiring materializes", component: V3 },
  { id: "fb-026-v4", label: "Sugar->eat crossed out, wiring instead, power", component: V4 },
  { id: "fb-026-v5", label: "Three-act: NO RULES / COPY WIRING / POWER ON", component: V5 },
  { id: "fb-026-v6", label: "Monitor: code deleted, replaced by network", component: V6 },
  { id: "fb-026-v7", label: "Stamp machine: code rejected, wiring accepted", component: V7 },
  { id: "fb-026-v8", label: "Stacked emphasis: NO RULES, JUST WIRING, ON", component: V8 },
  { id: "fb-026-v9", label: "Flip book: code, X, wiring, power", component: V9 },
];
