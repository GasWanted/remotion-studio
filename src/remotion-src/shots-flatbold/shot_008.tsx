// Shot 008 — "To see a brain, you need a finer touch. You need electrons. Their wavelengths are
//   a hundred thousand times smaller than light—it's like swapping those oven mitts for a needle."
// Duration: 144 frames (~4.8s)
// STARTS from FB-007: two neurons with gap, light failed
// NOW: electrons are tiny enough to pass THROUGH THE GAP (top to bottom between the two neurons)
// The gap is a narrow vertical slit — electrons thread through it, light couldn't
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 144;

function drawSynapse(ctx: CanvasRenderingContext2D, cx: number, cy: number, sc: number, frame: number, alpha: number) {
  const nR = 30 * sc, g = 5 * sc;
  drawFBNode(ctx, cx - nR - g / 2, cy, nR, 4, alpha, frame);
  drawFBNode(ctx, cx + nR + g / 2, cy, nR, 0, alpha, frame);
}

/** Draw the gap slit highlight */
function drawGapHighlight(ctx: CanvasRenderingContext2D, cx: number, cy: number, sc: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = FB.teal;
  ctx.fillRect(cx - 2.5 * sc, cy - 35 * sc, 5 * sc, 70 * sc);
  ctx.globalAlpha = 1;
}

/* ── V1: Light blob falls from top, gets stuck above gap. Then tiny teal dot falls and passes clean through ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);

    const gapTop = cy - 30 * sc;
    const gapBot = cy + 30 * sc;

    // Phase 1: fat yellow blob drops from top, gets stuck at the gap opening
    const lightFall = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lightStuck = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lightLeave = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lightR = 20 * sc;

    if (lightFall > 0 && lightLeave < 1) {
      let ly = -lightR + lightFall * lightFall * (gapTop - lightR + lightR);
      ly = Math.min(ly, gapTop - lightR * 0.8);
      // Stuck: squishes trying to fit
      const sX = 1 + lightStuck * 0.3;
      const sY = 1 - lightStuck * 0.2;
      // Fading out
      const la = (1 - lightLeave);
      ctx.globalAlpha = a * la * 0.2;
      const g = ctx.createRadialGradient(cx, ly, 0, cx, ly, lightR * 1.5);
      g.addColorStop(0, "rgba(255,230,80,0.5)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, ly, lightR * 1.5 * sX, lightR * 1.5 * sY, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * la * 0.6;
      ctx.fillStyle = "rgba(255,220,60,0.8)";
      ctx.beginPath(); ctx.ellipse(cx, ly, lightR * sX, lightR * sY, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Phase 2: tiny teal electron dot falls from top and passes clean through
    const eFall = interpolate(frame, [65, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (eFall > 0) {
      const eR = 2 * sc; // tiny!
      const ey = -eR + eFall * (h + eR * 2); // falls all the way through

      // Teal dot
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = `rgba(78,205,196,0.9)`;
      ctx.beginPath(); ctx.arc(cx, ey, eR, 0, Math.PI * 2); ctx.fill();
      // Tiny glow
      const eg = ctx.createRadialGradient(cx, ey, 0, cx, ey, eR * 4);
      eg.addColorStop(0, `rgba(78,205,196,${a * 0.2})`); eg.addColorStop(1, "transparent");
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(cx, ey, eR * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      // Gap lights up as electron passes through it
      if (ey > gapTop && ey < gapBot) {
        drawGapHighlight(ctx, cx, cy, sc, a * 0.5);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Stream of electrons threading through gap continuously ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);

    // Old yellow wave fading
    const oldA = interpolate(frame, [0, 25], [0.25, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (oldA > 0) {
      ctx.globalAlpha = a * oldA;
      ctx.strokeStyle = "rgba(255,220,60,0.5)"; ctx.lineWidth = 3 * sc;
      ctx.beginPath();
      for (let x = cx - w * 0.3; x <= cx + w * 0.3; x += 2) {
        const y = cy + Math.sin((x - cx) / (50 * sc) * Math.PI * 2) * 30 * sc;
        x === cx - w * 0.3 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    // Stream of teal electrons falling top to bottom through the gap
    const streamT = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (streamT > 0) {
      const eCount = 25;
      for (let i = 0; i < eCount; i++) {
        const phase = (i / eCount + frame * 0.025) % 1;
        const ey = -10 * sc + phase * (h + 20 * sc);
        // Slight x jitter but stays within gap width
        const jx = Math.sin(i * 3.7 + frame * 0.05) * 1.5 * sc;
        ctx.globalAlpha = a * streamT * 0.7;
        ctx.fillStyle = `rgba(78,205,196,0.85)`;
        ctx.beginPath(); ctx.arc(cx + jx, ey, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Gap glows from the stream
      drawGapHighlight(ctx, cx, cy, sc, a * streamT * 0.4);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Side by side — left: yellow ball stuck above gap, right: teal dot passes through ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([3*sc,3*sc]); ctx.beginPath(); ctx.moveTo(w/2, h*0.05); ctx.lineTo(w/2, h*0.95); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    const lcx = w * 0.25, rcx = w * 0.75, cy = h / 2;
    const synSc = sc * 0.6;
    const gapTop = cy - 18 * sc;

    // LEFT: synapse + fat ball stuck
    drawSynapse(ctx, lcx, cy, synSc, frame, a);
    const lFall = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (lFall > 0) {
      const lr = 14 * sc;
      let ly = -lr + lFall * lFall * (gapTop - lr + lr);
      ly = Math.min(ly, gapTop - lr * 0.7);
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = "rgba(255,220,60,0.7)";
      ctx.beginPath(); ctx.arc(lcx, ly, lr, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      // X
      if (lFall > 0.8) {
        ctx.globalAlpha = a * (lFall - 0.8) * 5 * 0.5;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(lcx-8*sc, ly-8*sc); ctx.lineTo(lcx+8*sc, ly+8*sc); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lcx+8*sc, ly-8*sc); ctx.lineTo(lcx-8*sc, ly+8*sc); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // RIGHT: synapse + tiny electron passes through
    drawSynapse(ctx, rcx, cy, synSc, frame, a);
    const rFall = interpolate(frame, [45, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rFall > 0) {
      const er = 2 * sc;
      const ey = -er + rFall * (h + er * 2);
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = `rgba(78,205,196,0.9)`;
      ctx.beginPath(); ctx.arc(rcx, ey, er, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      // Gap glows as it passes
      if (ey > gapTop && ey < cy + 18 * sc) {
        ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.teal;
        ctx.fillRect(rcx - 1.5 * synSc, gapTop, 3 * synSc, 36 * sc);
        ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Glove stuck, then needle threads through — both approach the gap from top ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    // Phase 1: red glove drops from top, gets stuck at gap
    const gloveFall = interpolate(frame, [5, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gloveLeave = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gloveFall > 0 && gloveLeave < 1) {
      const gr = 25 * sc;
      let gy = -gr + gloveFall * gloveFall * (gapTop - gr + gr);
      gy = Math.min(gy, gapTop - gr * 0.7);
      // Boxing glove
      const gh = 355, gs = 70, gl = 55;
      const gg = ctx.createRadialGradient(cx - gr * 0.1, gy - gr * 0.08, gr * 0.05, cx, gy, gr);
      gg.addColorStop(0, `hsla(${gh},${gs}%,${gl+25}%,${a * (1-gloveLeave)})`);
      gg.addColorStop(0.4, `hsla(${gh},${gs}%,${gl+8}%,${a * (1-gloveLeave)})`);
      gg.addColorStop(1, `hsla(${gh},${gs}%,${gl-12}%,${a * (1-gloveLeave)})`);
      ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, gy, gr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${a * (1-gloveLeave) * 0.12})`;
      ctx.beginPath(); ctx.ellipse(cx - gr * 0.1, gy - gr * 0.12, gr * 0.15, gr * 0.08, -0.3, 0, Math.PI * 2); ctx.fill();
    }

    // Phase 2: thin teal needle drops from top and passes through the gap
    const needleFall = interpolate(frame, [65, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (needleFall > 0) {
      const needleLen = 40 * sc;
      const needleW = 1.5 * sc;
      const ny = -needleLen + needleFall * (h + needleLen * 2);

      // Thin vertical needle
      ctx.globalAlpha = a * 0.8;
      ctx.strokeStyle = `rgba(78,205,196,0.9)`; ctx.lineWidth = needleW; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, ny); ctx.lineTo(cx, ny + needleLen); ctx.stroke();
      // Sharp tip at bottom
      ctx.fillStyle = `rgba(78,205,196,0.9)`;
      ctx.beginPath();
      ctx.moveTo(cx, ny + needleLen + 6 * sc);
      ctx.lineTo(cx - 2 * sc, ny + needleLen);
      ctx.lineTo(cx + 2 * sc, ny + needleLen);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      // Gap glows as needle passes through
      if (ny + needleLen > gapTop && ny < cy + 30 * sc) {
        drawGapHighlight(ctx, cx, cy, sc, a * 0.5);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Electron beam from top — thin teal beam scans down through the gap, lights up the slit ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);

    // Beam source dot at top
    const beamT = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamT > 0) {
      ctx.globalAlpha = a * beamT * 0.7;
      ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(cx, 12 * sc, 4 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Beam extends downward
    const beamExtend = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamExtend > 0) {
      const beamEnd = 12 * sc + beamExtend * (h - 24 * sc);
      // Thin beam line
      ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = `rgba(78,205,196,0.8)`; ctx.lineWidth = 1.5 * sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, 12 * sc); ctx.lineTo(cx, beamEnd); ctx.stroke();
      // Glow
      ctx.globalAlpha = a * 0.1;
      ctx.strokeStyle = `rgba(78,205,196,0.3)`; ctx.lineWidth = 8 * sc;
      ctx.beginPath(); ctx.moveTo(cx, 12 * sc); ctx.lineTo(cx, beamEnd); ctx.stroke();
      ctx.globalAlpha = 1;

      // When beam reaches the gap — gap lights up bright
      const gapTop = cy - 30 * sc;
      if (beamEnd > gapTop) {
        const passT = Math.min(1, (beamEnd - gapTop) / (60 * sc));
        drawGapHighlight(ctx, cx, cy, sc, a * passT * 0.6);
        // Bright flash at gap
        if (passT > 0 && passT < 0.5) {
          const flashR = 12 * sc;
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, flashR);
          fg.addColorStop(0, `rgba(78,205,196,${a * (0.5 - passT) * 0.5})`); fg.addColorStop(1, "transparent");
          ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, flashR, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Multiple failed light drops, then one electron makes it through ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    // 3 yellow balls fall and get stuck
    const balls = [
      { start: 3, xOff: -5, r: 18 },
      { start: 18, xOff: 3, r: 22 },
      { start: 33, xOff: -2, r: 15 },
    ];
    for (const b of balls) {
      const ft = interpolate(frame, [b.start, b.start + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fadeT = interpolate(frame, [b.start + 25, b.start + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (ft <= 0 || fadeT >= 1) continue;
      const br = b.r * sc;
      let by = -br + ft * ft * (gapTop - br + br);
      by = Math.min(by, gapTop - br * 0.6);
      const ba = (1 - fadeT) * 0.4;
      ctx.globalAlpha = a * ba;
      ctx.fillStyle = "rgba(255,220,60,0.7)";
      ctx.beginPath(); ctx.arc(cx + b.xOff * sc, by, br, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Then: tiny teal dot passes through
    const eFall = interpolate(frame, [75, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (eFall > 0) {
      const ey = -5 * sc + eFall * (h + 10 * sc);
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = `rgba(78,205,196,0.9)`;
      ctx.beginPath(); ctx.arc(cx, ey, 2 * sc, 0, Math.PI * 2); ctx.fill();
      // Trail
      for (let t = 1; t <= 8; t++) {
        const ty = ey - t * 6 * sc;
        ctx.globalAlpha = a * 0.3 * (1 - t / 8);
        ctx.beginPath(); ctx.arc(cx, ty, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (ey > gapTop && ey < cy + 30 * sc) drawGapHighlight(ctx, cx, cy, sc, a * 0.5);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Wave shrinks into beam — fat horizontal wave compresses vertically into thin vertical beam passing through gap ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSynapse(ctx, cx, cy, sc, frame, a);

    const morphT = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const morphE = morphT * morphT * (3 - 2 * morphT);

    // Horizontal fat wave morphs into vertical thin beam
    // Width shrinks, height grows, color shifts yellow→teal
    const waveW = w * 0.6 * (1 - morphE * 0.99); // wide → hairline
    const waveH = 60 * sc * (1 - morphE) + h * 0.8 * morphE; // short → full height
    const amp = 30 * sc * (1 - morphE); // oscillation → straight

    const r2 = Math.round(255 - morphE * 177);
    const g2 = Math.round(220 + morphE * 15);
    const b2 = Math.round(60 + morphE * 136);

    ctx.globalAlpha = a * (0.25 + morphE * 0.4);
    ctx.strokeStyle = `rgba(${r2},${g2},${b2},0.7)`;
    ctx.lineWidth = Math.max(1, (3 - morphE * 2.5) * sc);
    ctx.beginPath();
    if (morphE < 0.7) {
      // Horizontal wave
      for (let x = cx - waveW / 2; x <= cx + waveW / 2; x += 2) {
        const y = cy + Math.sin((x - cx) / (50 * sc) * Math.PI * 2 + frame * 0.05) * amp;
        x === cx - waveW / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    } else {
      // Vertical beam
      const beamTop = cy - waveH / 2;
      const beamBot = cy + waveH / 2;
      ctx.moveTo(cx, beamTop); ctx.lineTo(cx, beamBot);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Gap lights up once it's a beam
    if (morphE > 0.6) {
      drawGapHighlight(ctx, cx, cy, sc, a * (morphE - 0.6) / 0.4 * 0.5);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Zoom into gap — camera pushes into the gap slit, electron dots rain through it ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Zoom into the gap: neurons grow huge, gap becomes a wide corridor
    const zoomT = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoomE = zoomT * zoomT * (3 - 2 * zoomT);
    const zoom = 1 + zoomE * 8;
    const nR = 30 * sc * zoom;
    const gap = 5 * sc * zoom;

    // Only draw neuron edges (they're mostly off-screen at high zoom)
    const [lh, ls, ll] = cellHSL(4);
    const [rh, rs, rl] = cellHSL(0);
    // Left wall
    ctx.globalAlpha = a * 0.4;
    const lgr = ctx.createRadialGradient(cx - gap / 2 - nR * 0.3, cy, nR * 0.3, cx - gap / 2, cy, nR);
    lgr.addColorStop(0, `hsla(${lh},${ls}%,${ll + 10}%,0.5)`); lgr.addColorStop(1, `hsla(${lh},${ls}%,${ll - 10}%,0.05)`);
    ctx.fillStyle = lgr; ctx.fillRect(0, 0, cx - gap / 2, h);
    // Right wall
    const rgr = ctx.createRadialGradient(cx + gap / 2 + nR * 0.3, cy, nR * 0.3, cx + gap / 2, cy, nR);
    rgr.addColorStop(0, `hsla(${rh},${rs}%,${rl + 10}%,0.5)`); rgr.addColorStop(1, `hsla(${rh},${rs}%,${rl - 10}%,0.05)`);
    ctx.fillStyle = rgr; ctx.fillRect(cx + gap / 2, 0, w, h);
    ctx.globalAlpha = 1;

    // Electron dots rain through the corridor
    const rainT = interpolate(frame, [35, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rainT > 0) {
      for (let i = 0; i < 20; i++) {
        const phase = (i / 20 + frame * 0.02) % 1;
        const ey = -5 * sc + phase * (h + 10 * sc);
        const jx = Math.sin(i * 4.3 + frame * 0.04) * gap * 0.3;
        ctx.globalAlpha = a * rainT * 0.7;
        ctx.fillStyle = `rgba(78,205,196,0.85)`;
        ctx.beginPath(); ctx.arc(cx + jx, ey, Math.max(1, 2 * sc * zoom * 0.2), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Gap corridor glows
      ctx.globalAlpha = a * rainT * 0.08;
      ctx.fillStyle = `rgba(78,205,196,0.3)`;
      ctx.fillRect(cx - gap / 2, 0, gap, h);
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Split — top half: light rains down (big blobs blocked by neurons), bottom half: electrons rain through gap ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;

    // Horizontal divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.beginPath(); ctx.moveTo(w * 0.05, h / 2); ctx.lineTo(w * 0.95, h / 2); ctx.stroke(); ctx.globalAlpha = 1;

    // TOP: light fails
    const topCy = h * 0.25;
    drawSynapse(ctx, cx, topCy, sc * 0.55, frame, a);
    // Yellow blobs rain but get stuck above gap
    for (let i = 0; i < 5; i++) {
      const phase = (i / 5 + frame * 0.01) % 1;
      const lr = (10 + i * 3) * sc * 0.55;
      const lx = cx + Math.sin(i * 2.1) * 15 * sc;
      let ly = -lr + phase * (h * 0.4);
      const gapTop = topCy - 16 * sc;
      ly = Math.min(ly, gapTop - lr * 0.6);
      ctx.globalAlpha = a * 0.2;
      ctx.fillStyle = "rgba(255,220,60,0.5)";
      ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // BOTTOM: electrons succeed
    const botCy = h * 0.75;
    drawSynapse(ctx, cx, botCy, sc * 0.55, frame, a);
    // Tiny teal dots pass through
    for (let i = 0; i < 12; i++) {
      const phase = (i / 12 + frame * 0.02) % 1;
      const ey = h * 0.55 + phase * h * 0.4;
      const jx = Math.sin(i * 3.7 + frame * 0.05) * 1 * sc;
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = `rgba(78,205,196,0.8)`;
      ctx.beginPath(); ctx.arc(cx + jx, ey, 1.2 * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Gap glows
    drawGapHighlight(ctx, cx, botCy, sc * 0.55, a * 0.3);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB008_Final = V8;

export const VARIANTS_FB_008: VariantDef[] = [
  { id: "fb008-v1", label: "Light Stuck, Electron Through", component: V1 },
  { id: "fb008-v2", label: "Electron Stream", component: V2 },
  { id: "fb008-v3", label: "Side by Side", component: V3 },
  { id: "fb008-v4", label: "Glove → Needle", component: V4 },
  { id: "fb008-v5", label: "Beam From Top", component: V5 },
  { id: "fb008-v6", label: "3 Fails Then Success", component: V6 },
  { id: "fb008-v7", label: "Wave → Beam Morph", component: V7 },
  { id: "fb008-v8", label: "Zoom Into Corridor", component: V8 },
  { id: "fb008-v9", label: "Top Fails / Bottom Wins", component: V9 },
];
