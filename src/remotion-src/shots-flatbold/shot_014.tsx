// Shot 014 — "architecture on a digital processor."
// Duration: 90 frames (3s) — short punchy
// STARTS from FB-013: code lines with { } brackets visible (pixel grid became source code)
// The code gets loaded into / runs on a digital processor
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 90;

/** Code lines from FB-013 ending */
function drawCodeLines(ctx: CanvasRenderingContext2D, cx: number, cy: number, sc: number, alpha: number) {
  const lines = [
    "neuron[0]: v=-52.0mV syn=0.0",
    "neuron[1]: v=-48.3mV syn=1.2",
    "weight[0→1]: +0.275",
    "weight[1→0]: -0.183",
    "spike_threshold: -45.0mV",
    "connections: 54,000,000",
    "neurons: 139,000",
    "dt: 0.1ms",
    "// source code of a brain",
  ];
  const lineH = 14 * sc;
  const startY = cy - (lines.length * lineH) / 2;
  ctx.font = `${8 * sc}px 'Courier New', monospace`;
  ctx.textAlign = "left";
  for (let i = 0; i < lines.length; i++) {
    const [lh] = cellHSL(i % 8);
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = i === lines.length - 1 ? FB.text.accent : `hsla(${lh},45%,68%,0.85)`;
    ctx.fillText(lines[i], cx - 100 * sc, startY + i * lineH);
  }
  // Brackets
  ctx.globalAlpha = alpha * 0.25;
  ctx.font = `bold ${36 * sc}px 'Courier New', monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = FB.text.dim;
  ctx.fillText("{", cx - 120 * sc, cy + 5 * sc);
  ctx.fillText("}", cx + 120 * sc, cy + 5 * sc);
  ctx.globalAlpha = 1;
}

/** Draw processor chip */
function drawChip(ctx: CanvasRenderingContext2D, cx: number, cy: number, chipW: number, chipH: number, sc: number, alpha: number, glowT = 0) {
  const [ch, cs, cl] = cellHSL(5); // blue

  // Glow behind chip
  if (glowT > 0) {
    ctx.globalAlpha = alpha * glowT * 0.1;
    const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, chipW * 0.8));
    gg.addColorStop(0, `rgba(78,205,196,0.4)`); gg.addColorStop(1, "transparent");
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, chipW * 0.8), 0, Math.PI * 2); ctx.fill();
  }

  // Chip body
  ctx.globalAlpha = alpha * 0.6;
  const cg = ctx.createRadialGradient(cx - chipW * 0.1, cy - chipH * 0.1, 0, cx, cy, chipW * 0.6);
  cg.addColorStop(0, `hsla(${ch},${cs}%,${cl + 18}%,0.7)`);
  cg.addColorStop(0.6, `hsla(${ch},${cs}%,${cl}%,0.6)`);
  cg.addColorStop(1, `hsla(${ch},${cs}%,${cl - 12}%,0.4)`);
  ctx.fillStyle = cg; ctx.fillRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);

  // Border
  ctx.strokeStyle = `hsla(${ch},${cs}%,${cl + 22}%,${alpha * 0.6})`;
  ctx.lineWidth = Math.max(1.5, 2.5 * sc);
  ctx.strokeRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);

  // Pins on all 4 sides
  ctx.strokeStyle = `hsla(${ch},${cs}%,${cl + 12}%,${alpha * 0.35})`;
  ctx.lineWidth = Math.max(1, 1.5 * sc);
  const pinLen = 10 * sc;
  for (let i = 0; i < 8; i++) {
    const t = (i + 0.5) / 8;
    const px = cx - chipW / 2 + t * chipW;
    ctx.beginPath(); ctx.moveTo(px, cy - chipH / 2); ctx.lineTo(px, cy - chipH / 2 - pinLen); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, cy + chipH / 2); ctx.lineTo(px, cy + chipH / 2 + pinLen); ctx.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const t = (i + 0.5) / 6;
    const py = cy - chipH / 2 + t * chipH;
    ctx.beginPath(); ctx.moveTo(cx - chipW / 2, py); ctx.lineTo(cx - chipW / 2 - pinLen, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + chipW / 2, py); ctx.lineTo(cx + chipW / 2 + pinLen, py); ctx.stroke();
  }

  // Highlight
  ctx.globalAlpha = alpha * 0.06;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(cx - chipW / 2 + chipW * 0.08, cy - chipH / 2 + 3 * sc, chipW * 0.1, chipH - 6 * sc);

  ctx.globalAlpha = 1;
}

/* ── V1: Code shrinks into chip — code lines compress and get absorbed into a processor ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Code fades and shrinks toward center
    const codeFade = interpolate(frame, [0, 35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const codeScale = interpolate(frame, [0, 35], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(codeScale, codeScale); ctx.translate(-cx, -cy);
      drawCodeLines(ctx, cx, cy, sc / codeScale, a * codeFade);
      ctx.restore();
    }

    // Chip appears
    const chipT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipT > 0) {
      const cE = chipT * chipT * (3 - 2 * chipT);
      const glowT = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawChip(ctx, cx, cy, 120 * sc * cE, 90 * sc * cE, sc, a * cE, glowT);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Code streams into chip from left — chip on right, code lines fly into it ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;

    // Code lines on left, sliding right and fading
    const slideT = interpolate(frame, [0, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lines = ["neuron[0]: v=-52.0mV", "weight[0→1]: +0.275", "connections: 54M", "neurons: 139K", "dt: 0.1ms"];
    ctx.font = `${7 * sc}px 'Courier New', monospace`; ctx.textAlign = "left";
    for (let i = 0; i < lines.length; i++) {
      const lineSlide = interpolate(slideT, [i * 0.15, i * 0.15 + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lx = w * 0.05 + lineSlide * w * 0.45;
      const ly = cy - 40 * sc + i * 16 * sc;
      const lineA = lineSlide < 0.8 ? 1 : (1 - lineSlide) * 5;
      const [lh] = cellHSL(i % 8);
      ctx.globalAlpha = a * lineA * 0.6;
      ctx.fillStyle = `hsla(${lh},45%,68%,0.85)`;
      ctx.fillText(lines[i], lx, ly);
    }
    ctx.globalAlpha = 1;

    // Chip on right
    const chipT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipT > 0) {
      const cE = chipT * chipT * (3 - 2 * chipT);
      const glowT = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawChip(ctx, w * 0.72, cy, 110 * sc * cE, 85 * sc * cE, sc, a * cE, glowT);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Chip assembles from code fragments — code chars scatter then form chip shape ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const chars = useMemo(() => { const rng = seeded(1430);
    const txt = "neuron weight synapse spike threshold 139000 54000000 0.1ms";
    return Array.from({ length: 40 }, (_, i) => ({
      ch: txt[Math.floor(rng() * txt.length)],
      sx: rng() * w, sy: rng() * h,
      tx: w / 2 - 55 * sc + (i % 8) * 14 * sc,
      ty: h / 2 - 40 * sc + Math.floor(i / 8) * 16 * sc,
      c: Math.floor(rng() * 8),
    }));
  }, [w, h, sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const morphT = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const morphE = morphT * morphT * (3 - 2 * morphT);

    ctx.font = `${7 * sc}px 'Courier New', monospace`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const c of chars) {
      const x = c.sx + (c.tx - c.sx) * morphE;
      const y = c.sy + (c.ty - c.sy) * morphE;
      const [lh] = cellHSL(c.c);
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = morphE > 0.7 ? FB.teal : `hsla(${lh},45%,68%,0.85)`;
      ctx.fillText(c.ch, x, y);
    }
    ctx.globalAlpha = 1;

    // Chip border forms
    if (morphE > 0.6) {
      const bA = (morphE - 0.6) / 0.4;
      drawChip(ctx, w / 2, h / 2, 120 * sc * bA, 90 * sc * bA, sc, a * bA, bA);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Split transition — code left fades, chip right grows, arrow between ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h / 2;

    // Code on left fading
    const codeFade = interpolate(frame, [0, 50], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawCodeLines(ctx, w * 0.28, cy, sc, a * codeFade);

    // Arrow
    const arrowT = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (arrowT > 0) {
      ctx.globalAlpha = a * arrowT * 0.3;
      ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
      const ax1 = w * 0.48, ax2 = w * 0.48 + arrowT * w * 0.08;
      ctx.beginPath(); ctx.moveTo(ax1, cy); ctx.lineTo(ax2, cy); ctx.stroke();
      // Arrowhead
      ctx.beginPath(); ctx.moveTo(ax2, cy); ctx.lineTo(ax2 - 6 * sc, cy - 4 * sc);
      ctx.lineTo(ax2 - 6 * sc, cy + 4 * sc); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Chip on right
    const chipT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipT > 0) {
      const cE = chipT * chipT * (3 - 2 * chipT);
      const glowT = interpolate(frame, [45, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawChip(ctx, w * 0.73, cy, 100 * sc * cE, 80 * sc * cE, sc, a * cE, glowT);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Power on — code visible, chip appears with power-on flash, code absorbed ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Code fading
    const codeFade = interpolate(frame, [0, 30, 40, 55], [1, 1, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) drawCodeLines(ctx, cx, cy, sc, a * codeFade);

    // Flash at frame 35
    if (frame >= 33 && frame <= 38) {
      ctx.globalAlpha = (1 - Math.abs(frame - 35) / 3) * 0.1;
      ctx.fillStyle = `rgba(78,205,196,0.3)`; ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    // Chip with glow
    const chipT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipT > 0) {
      const cE = chipT * chipT * (3 - 2 * chipT);
      drawChip(ctx, cx, cy, 130 * sc * cE, 100 * sc * cE, sc, a * cE, cE);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Circuit traces grow from code — code chars become nodes, traces connect them ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Code fading
    const codeFade = interpolate(frame, [0, 25], [0.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) drawCodeLines(ctx, cx, cy, sc, a * codeFade);

    // Circuit traces spread from center
    const traceT = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (traceT > 0) {
      const rng = seeded(1460);
      ctx.strokeStyle = `rgba(78,205,196,${a * traceT * 0.25})`; ctx.lineWidth = Math.max(1, 1.5 * sc); ctx.lineCap = "square";
      for (let i = 0; i < 30; i++) {
        const angle = rng() * Math.PI * 2;
        const len = traceT * (30 + rng() * 90) * sc;
        const x2 = cx + Math.cos(angle) * len;
        const y2 = cy + Math.sin(angle) * len;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        if (rng() > 0.5) { ctx.lineTo(x2, cy); ctx.lineTo(x2, y2); }
        else { ctx.lineTo(cx, y2); ctx.lineTo(x2, y2); }
        ctx.stroke();
        if (traceT > 0.4) drawFBNode(ctx, x2, y2, 2.5 * sc, 4, a * (traceT - 0.4) * 1.7 * 0.5, frame);
      }
    }

    // Chip outline
    if (traceT > 0.5) {
      const bA = (traceT - 0.5) * 2;
      drawChip(ctx, cx, cy, 130 * sc * bA, 100 * sc * bA, sc, a * bA * 0.5, 0);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Monitor with code → chip overlay ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Monitor frame
    const mw = 230 * sc, mh = 150 * sc;
    ctx.globalAlpha = a * 0.25;
    ctx.fillStyle = "rgba(15,10,25,0.8)";
    ctx.fillRect(cx - mw / 2, cy - mh / 2 - 5 * sc, mw, mh);
    ctx.strokeStyle = "rgba(100,80,130,0.5)"; ctx.lineWidth = 2 * sc;
    ctx.strokeRect(cx - mw / 2, cy - mh / 2 - 5 * sc, mw, mh);
    // Stand
    ctx.fillStyle = "rgba(80,65,100,0.3)";
    ctx.fillRect(cx - 8 * sc, cy + mh / 2 - 5 * sc, 16 * sc, 12 * sc);
    ctx.fillRect(cx - 18 * sc, cy + mh / 2 + 5 * sc, 36 * sc, 4 * sc);
    ctx.globalAlpha = 1;

    // Code lines inside monitor
    const codeA = interpolate(frame, [0, 40, 55, 70], [0.6, 0.6, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeA > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(cx - mw / 2 + 3, cy - mh / 2 - 2, mw - 6, mh - 6); ctx.clip();
      drawCodeLines(ctx, cx, cy - 5 * sc, sc * 0.85, a * codeA);
      ctx.restore();
    }

    // Chip appears inside monitor
    const chipT = interpolate(frame, [35, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (chipT > 0) {
      const cE = chipT * chipT * (3 - 2 * chipT);
      drawChip(ctx, cx, cy - 5 * sc, 90 * sc * cE, 70 * sc * cE, sc, a * cE, cE);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Grid of processors — multiple small chips power on in sequence ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Code briefly visible then fades
    const codeFade = interpolate(frame, [0, 15], [0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeFade > 0) drawCodeLines(ctx, cx, cy, sc, a * codeFade);

    // 3x3 grid of chips powering on
    const chipSize = 50 * sc;
    const gap = 20 * sc;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const idx = row * 3 + col;
        const chipX = cx - (chipSize + gap) + col * (chipSize + gap);
        const chipY = cy - (chipSize * 0.75 + gap) + row * (chipSize * 0.75 + gap);
        const chipStart = 10 + idx * 6;
        const ct = interpolate(frame, [chipStart, chipStart + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (ct > 0) {
          const cE = ct * ct * (3 - 2 * ct);
          drawChip(ctx, chipX, chipY, chipSize * cE, chipSize * 0.75 * cE, sc, a * cE, cE > 0.8 ? (cE - 0.8) * 5 : 0);
        }
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Big chip with code flowing inside — chip is the frame, code runs within it ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Big chip fills most of the frame
    const chipT = interpolate(frame, [3, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cE = chipT * chipT * (3 - 2 * chipT);
    const chipW = 200 * sc * cE, chipH = 150 * sc * cE;
    drawChip(ctx, cx, cy, chipW, chipH, sc, a * cE, 0);

    // Code lines run INSIDE the chip
    if (cE > 0.3) {
      const codeA = (cE - 0.3) / 0.7;
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - chipW / 2 + 5, cy - chipH / 2 + 5, chipW - 10, chipH - 10); ctx.clip();

      const lines = ["v=-52.0mV", "syn=1.2", "w=+0.275", "spike!", "139K neurons", "running..."];
      const lineH = 12 * sc;
      // Lines scroll upward
      ctx.font = `${6 * sc}px 'Courier New', monospace`; ctx.textAlign = "left";
      for (let i = 0; i < lines.length; i++) {
        const scrollY = cy - chipH / 2 + 15 * sc + i * lineH - ((frame * 0.8) % (lines.length * lineH));
        const wrappedY = ((scrollY - (cy - chipH / 2)) % (chipH) + chipH) % chipH + (cy - chipH / 2);
        const [lh] = cellHSL((i + 2) % 8);
        ctx.globalAlpha = a * codeA * 0.5;
        ctx.fillStyle = `hsla(${lh},45%,68%,0.85)`;
        ctx.fillText(lines[i], cx - chipW / 2 + 12 * sc, wrappedY);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // Glow at the end
    const glowT = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glowT > 0) {
      ctx.globalAlpha = a * glowT * 0.08;
      const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, chipW * 0.7));
      gg.addColorStop(0, `rgba(78,205,196,0.4)`); gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, chipW * 0.7), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB014_Final = V5;

export const VARIANTS_FB_014: VariantDef[] = [
  { id: "fb014-v1", label: "Code Shrinks Into Chip", component: V1 },
  { id: "fb014-v2", label: "Code Streams Right", component: V2 },
  { id: "fb014-v3", label: "Chars Form Chip", component: V3 },
  { id: "fb014-v4", label: "Split + Arrow", component: V4 },
  { id: "fb014-v5", label: "Power-On Flash", component: V5 },
  { id: "fb014-v6", label: "Circuit Traces", component: V6 },
  { id: "fb014-v7", label: "Monitor + Chip", component: V7 },
  { id: "fb014-v8", label: "Chip Grid", component: V8 },
  { id: "fb014-v9", label: "Code Inside Chip", component: V9 },
];
