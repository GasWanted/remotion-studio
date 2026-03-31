// Shot 007 — "feel the detail. Light is the same way; the waves are so large they just wash
//   right over the synapse without bouncing back. To the light, the gap doesn't even exist."
// Duration: 130 frames (~4.3s)
// STARTS from FB-006: mitt/coin analogy
// Light tries to pass through the gap FROM THE TOP — too wide, washes over without entering
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 130;

function drawSyn(ctx: CanvasRenderingContext2D, cx: number, cy: number, sc: number, frame: number, alpha: number, scale2 = 1) {
  const nR = 30 * sc * scale2, g = 5 * sc * scale2;
  drawFBNode(ctx, cx - nR - g / 2, cy, nR, 4, alpha, frame);
  drawFBNode(ctx, cx + nR + g / 2, cy, nR, 0, alpha, frame);
}

/* ── V1: Fat yellow ball drops from top, hits the neurons, can't fit through the gap, bounces back up ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);

    const ballR = 22 * sc;
    const gapTop = cy - 30 * sc;
    const fallT = interpolate(frame, [10, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const squishT = interpolate(frame, [38, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounceT = interpolate(frame, [50, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    let by = -ballR + fallT * fallT * (gapTop - ballR + ballR);
    by = Math.min(by, gapTop - ballR * 0.7);
    let sX = 1, sY = 1;

    if (squishT > 0 && bounceT === 0) {
      sX = 1 + squishT * 0.35;
      sY = 1 - squishT * 0.25;
    }
    if (bounceT > 0) {
      by = gapTop - ballR * 0.7 - bounceT * h * 0.4;
      sX = 1; sY = 1;
    }

    if (fallT > 0) {
      const ballA = bounceT > 0 ? 1 - bounceT * 0.8 : 1;
      ctx.globalAlpha = a * ballA * 0.2;
      const g = ctx.createRadialGradient(cx, by, 0, cx, by, ballR * 1.8);
      g.addColorStop(0, "rgba(255,230,80,0.5)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, by, ballR * 1.8 * sX, ballR * 1.8 * sY, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * ballA * 0.6;
      ctx.fillStyle = "rgba(255,220,60,0.8)";
      ctx.beginPath(); ctx.ellipse(cx, by, ballR * sX, ballR * sY, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Multiple yellow blobs rain down, all get stuck above the gap ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    const blobs = [
      { start: 5, r: 18, xOff: 0 },
      { start: 20, r: 22, xOff: -8 },
      { start: 35, r: 16, xOff: 5 },
      { start: 50, r: 25, xOff: -3 },
      { start: 65, r: 20, xOff: 6 },
    ];

    for (const b of blobs) {
      const ft = interpolate(frame, [b.start, b.start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (ft <= 0) continue;
      const br = b.r * sc;
      let by = -br + ft * ft * (gapTop - br + br);
      by = Math.min(by, gapTop - br * 0.6);
      // Pile up
      const pileOffset = blobs.filter(bb => bb.start < b.start).length * 3 * sc;
      by -= pileOffset;

      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = "rgba(255,220,60,0.6)";
      ctx.beginPath(); ctx.arc(cx + b.xOff * sc, by, br, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Wide yellow wave band sweeps down from top, washes over neurons without entering gap ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);

    // Horizontal yellow band sweeps top to bottom
    const sweepT = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sweepT > 0) {
      const bandY = -50 * sc + sweepT * (h + 100 * sc);
      const bandH = 60 * sc; // way wider than 5*sc gap
      ctx.globalAlpha = a * 0.18;
      ctx.fillStyle = "rgba(255,220,60,0.3)";
      // Wavy edges
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const yOff = Math.sin(x * 0.015 + frame * 0.04) * 8 * sc;
        x === 0 ? ctx.moveTo(x, bandY - bandH / 2 + yOff) : ctx.lineTo(x, bandY - bandH / 2 + yOff);
      }
      for (let x = w; x >= 0; x -= 3) {
        const yOff = Math.sin(x * 0.015 + frame * 0.04) * 8 * sc;
        ctx.lineTo(x, bandY + bandH / 2 + yOff);
      }
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      // Band passes right over the gap — doesn't enter it
      // Gap stays dark/invisible
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Yellow flood from top — light pours down, pools above the gap, can't get through ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    // Yellow fills from top, pools at the gap level
    const fillT = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fillT > 0) {
      const poolY = gapTop; // pools above the gap
      const fillY = poolY - (1 - fillT) * h * 0.5; // descends from above

      ctx.globalAlpha = a * 0.15;
      ctx.fillStyle = "rgba(255,220,60,0.3)";
      // Wavy bottom edge
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(w, 0); ctx.lineTo(w, fillY);
      for (let x = w; x >= 0; x -= 3) {
        const yOff = Math.sin(x * 0.012 + frame * 0.06) * 5 * sc;
        ctx.lineTo(x, fillY + yOff);
      }
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      // Pool "surface" wobble at gap level
      if (fillT > 0.7) {
        ctx.globalAlpha = a * 0.1;
        ctx.strokeStyle = "rgba(255,220,60,0.4)"; ctx.lineWidth = 2 * sc;
        ctx.beginPath();
        for (let x = cx - 40 * sc; x <= cx + 40 * sc; x += 2) {
          const yy = gapTop + Math.sin(x * 0.03 + frame * 0.08) * 3 * sc;
          x === cx - 40 * sc ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Photon rain — big yellow circles fall, each blocked by the neuron tops, none enter gap ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const photons = useMemo(() => { const rng = seeded(7050);
    return Array.from({ length: 30 }, () => ({
      x: w * 0.1 + rng() * w * 0.8, speed: 1 + rng() * 2.5,
      r: (10 + rng() * 15) * sc, offset: rng() * h * 0.5,
    }));
  }, [w, h, sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    for (const p of photons) {
      let py = -p.r + (p.offset + frame * p.speed * 1.2);
      // Stop at the neuron top (can't pass through gap)
      const nearGap = Math.abs(p.x - cx) < 15 * sc;
      if (nearGap) py = Math.min(py, gapTop - p.r * 0.5);
      // Otherwise pass alongside (not through)

      ctx.globalAlpha = a * 0.12;
      const g = ctx.createRadialGradient(p.x, py, 0, p.x, py, p.r);
      g.addColorStop(0, "rgba(255,230,80,0.4)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, py, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * 0.2;
      ctx.fillStyle = "rgba(255,220,60,0.5)";
      ctx.beginPath(); ctx.arc(p.x, py, p.r * 0.35, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Fat sine wave vertical — big wave tries to enter the gap from top, amplitude too wide ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    // Vertical sine wave descending — amplitude way wider than gap
    const waveT = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveT > 0) {
      const waveEnd = -30 * sc + waveT * (gapTop + 30 * sc); // stops at gap
      const amp = 30 * sc; // gap is 5*sc, wave is 30*sc wide = 6x too big

      ctx.globalAlpha = a * 0.4;
      ctx.strokeStyle = "rgba(255,220,60,0.7)"; ctx.lineWidth = 3 * sc;
      ctx.beginPath();
      for (let y = -10 * sc; y <= waveEnd; y += 2) {
        const x = cx + Math.sin(y / (20 * sc) * Math.PI * 2 + frame * 0.06) * amp;
        y === -10 * sc ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // At the bottom: wave is wider than gap, gets "blocked"
      if (waveT > 0.7) {
        // Splash effect — wave spreads sideways when it hits
        const splashT = (waveT - 0.7) / 0.3;
        ctx.globalAlpha = a * splashT * 0.15;
        ctx.fillStyle = "rgba(255,220,60,0.3)";
        const splashW = amp + splashT * 30 * sc;
        ctx.fillRect(cx - splashW, gapTop - 5 * sc, splashW * 2, 10 * sc);
        ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Light splits around neurons — yellow stream comes from top, splits left and right, gap stays empty ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;
    const nR = 30 * sc;

    // Yellow stream from top center
    const streamT = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (streamT > 0) {
      const streamEnd = streamT * (gapTop + 20 * sc);
      // Main stream down
      ctx.globalAlpha = a * 0.15;
      ctx.fillStyle = "rgba(255,220,60,0.3)";
      ctx.fillRect(cx - 25 * sc, 0, 50 * sc, Math.min(streamEnd, gapTop));
      ctx.globalAlpha = 1;
    }

    // After hitting: splits around the neurons
    const splitT = interpolate(frame, [45, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (splitT > 0) {
      const splitE = splitT * splitT * (3 - 2 * splitT);
      // Left branch curves around left neuron
      ctx.globalAlpha = a * 0.12;
      ctx.fillStyle = "rgba(255,220,60,0.25)";
      ctx.beginPath();
      ctx.moveTo(cx - 5 * sc, gapTop);
      ctx.quadraticCurveTo(cx - nR - 20 * sc, cy, cx - nR - 15 * sc, cy + 40 * sc * splitE);
      ctx.lineTo(cx - nR - 35 * sc, cy + 40 * sc * splitE);
      ctx.quadraticCurveTo(cx - nR - 40 * sc, cy, cx - 25 * sc, gapTop);
      ctx.closePath(); ctx.fill();
      // Right branch
      ctx.beginPath();
      ctx.moveTo(cx + 5 * sc, gapTop);
      ctx.quadraticCurveTo(cx + nR + 20 * sc, cy, cx + nR + 15 * sc, cy + 40 * sc * splitE);
      ctx.lineTo(cx + nR + 35 * sc, cy + 40 * sc * splitE);
      ctx.quadraticCurveTo(cx + nR + 40 * sc, cy, cx + 25 * sc, gapTop);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      // Gap stays dark — nothing got through
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Repeated drops — yellow ball falls, squishes, splits into two halves sliding off each neuron ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;
    const nR = 30 * sc;

    const ballR = 22 * sc;
    const fallT = interpolate(frame, [8, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const splitT = interpolate(frame, [32, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    if (fallT > 0 && splitT === 0) {
      let by = -ballR + fallT * fallT * (gapTop - ballR + ballR);
      by = Math.min(by, gapTop - ballR * 0.7);
      ctx.globalAlpha = a * 0.4;
      ctx.fillStyle = "rgba(255,220,60,0.7)";
      ctx.beginPath(); ctx.arc(cx, by, ballR, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (splitT > 0) {
      const sE = splitT * splitT;
      const splitDist = sE * (nR + 20 * sc);
      const slideY = gapTop - ballR * 0.5 + sE * 30 * sc;
      const fadeA = Math.max(0, 1 - splitT * 1.3);

      // Left half
      ctx.globalAlpha = a * fadeA * 0.3;
      ctx.fillStyle = "rgba(255,220,60,0.6)";
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, cx, h); ctx.clip();
      ctx.beginPath(); ctx.arc(cx - splitDist, slideY, ballR * (1 - sE * 0.3), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // Right half
      ctx.save(); ctx.beginPath(); ctx.rect(cx, 0, w, h); ctx.clip();
      ctx.beginPath(); ctx.arc(cx + splitDist, slideY, ballR * (1 - sE * 0.3), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Fat beam from top — wide yellow beam hits the neurons, scatters, gap stays untouched ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    drawSyn(ctx, cx, cy, sc, frame, a);
    const gapTop = cy - 30 * sc;

    // Wide beam source at top
    const beamT = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (beamT > 0) {
      const beamW = 50 * sc; // way wider than 5*sc gap
      const beamEnd = beamT * (gapTop + 10 * sc);

      // Beam body
      ctx.globalAlpha = a * 0.15;
      ctx.fillStyle = "rgba(255,220,60,0.3)";
      ctx.fillRect(cx - beamW / 2, 0, beamW, Math.min(beamEnd, gapTop));
      // Beam center brighter
      ctx.globalAlpha = a * 0.08;
      ctx.fillStyle = "rgba(255,240,100,0.4)";
      ctx.fillRect(cx - beamW * 0.15, 0, beamW * 0.3, Math.min(beamEnd, gapTop));
      ctx.globalAlpha = 1;

      // Source dot
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = "rgba(255,230,80,0.7)";
      ctx.beginPath(); ctx.arc(cx, 8 * sc, 6 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Impact scatter — beam hits and sprays sideways
    const scatterT = interpolate(frame, [38, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scatterT > 0) {
      const rng = seeded(7090);
      for (let i = 0; i < 15; i++) {
        const sa = -Math.PI * 0.3 + rng() * Math.PI * 0.6 + (rng() > 0.5 ? Math.PI : 0);
        const sd = scatterT * (20 + rng() * 40) * sc;
        const sx = cx + Math.cos(sa) * sd;
        const sy = gapTop + Math.sin(sa) * sd * 0.3;
        const sA = Math.max(0, 1 - scatterT * 1.2) * 0.15;
        ctx.globalAlpha = a * sA;
        ctx.fillStyle = "rgba(255,220,60,0.5)";
        ctx.beginPath(); ctx.arc(sx, sy, (3 + rng() * 4) * sc, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB007_Final = V6;

export const VARIANTS_FB_007: VariantDef[] = [
  { id: "fb007-v1", label: "Ball Bounce Back", component: V1 },
  { id: "fb007-v2", label: "Blob Pileup", component: V2 },
  { id: "fb007-v3", label: "Wave Band Sweeps", component: V3 },
  { id: "fb007-v4", label: "Yellow Flood Pools", component: V4 },
  { id: "fb007-v5", label: "Photon Rain Blocked", component: V5 },
  { id: "fb007-v6", label: "Fat Sine Blocked", component: V6 },
  { id: "fb007-v7", label: "Stream Splits Around", component: V7 },
  { id: "fb007-v8", label: "Ball Splits in Two", component: V8 },
  { id: "fb007-v9", label: "Wide Beam Scatters", component: V9 },
];
