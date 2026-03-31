// Shot 005 — "can't actually use light to see them. A synapse—the microscopic gap where
//   two neurons talk—is only about 200 nanometers across."
// Duration: 150 frames (5s)
// STARTS from FB-004: hyperspace slows down
// 9 genuinely different visual stories about why light can't see synapses

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  fadeInOut, cellHSL, drawFBArrow,
} from "./flatbold-kit";

const DUR = 150;

/** Hyperspace slowdown from FB-004 ending */
function drawHyperspaceSlowdown(ctx: CanvasRenderingContext2D, frame: number, w: number, h: number, sc: number, a: number, endFrame: number, seed: number) {
  const rng = seeded(seed);
  const cx = w / 2, cy = h * 0.45;
  const slowT = interpolate(frame, [0, endFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const speed = 1 - slowT * slowT;
  const fadeA = 1 - slowT;
  for (let i = 0; i < 60; i++) {
    const angle = rng() * Math.PI * 2, baseD = 0.05 + rng() * 0.95;
    const spd = 0.5 + rng() * 2, c = Math.floor(rng() * 8), r = (1 + rng() * 2) * sc;
    const t = ((frame * spd * 0.03 * speed + baseD) % 1);
    const dist = t * Math.max(w, h) * 0.7;
    const x = cx + Math.cos(angle) * dist, y = cy + Math.sin(angle) * dist * 0.7;
    const streakLen = Math.min(dist * 0.15, 20 * sc) * speed;
    const bx = x - Math.cos(angle) * streakLen, by = y - Math.sin(angle) * streakLen * 0.7;
    const sA = a * (1 - t * 0.5) * fadeA;
    if (sA > 0.01) {
      const [sh, ss, sl] = cellHSL(c);
      ctx.globalAlpha = sA * 0.4;
      ctx.strokeStyle = `hsla(${sh},${ss}%,${sl + 15}%,0.6)`; ctx.lineWidth = r * 0.6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/* ── V1: Two neurons chatting — signals spark across gap, light wave rolls through blind ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 25, 5510);
    const cx = w / 2, cy = h / 2;

    // Two neurons appear
    const neuT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neuE = neuT * neuT * (3 - 2 * neuT);
    const gap = 6 * sc; const nR = 35 * sc * neuE;
    const lx = cx - nR - gap / 2, rx = cx + nR + gap / 2;

    if (neuE > 0) {
      drawFBNode(ctx, lx, cy, nR, 4, a * neuE, frame);
      drawFBNode(ctx, rx, cy, nR, 0, a * neuE, frame);

      // Tiny signal sparks crossing the gap
      if (neuE > 0.5) {
        const sparkT = ((frame * 0.08) % 1);
        const sparkX = cx - gap / 2 + sparkT * gap;
        ctx.globalAlpha = a * (1 - Math.abs(sparkT - 0.5) * 2) * 0.8;
        ctx.fillStyle = FB.gold;
        ctx.beginPath(); ctx.arc(sparkX, cy, 2 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;

        // "200nm" in the gap
        drawFBText(ctx, "200nm", cx, cy - nR - 10 * sc, 8 * sc, a * neuE * 0.5, "center", FB.text.dim);
      }
    }

    // Light wave sweeps across (frame 60-120) — big yellow band, way wider than gap
    const waveT = interpolate(frame, [60, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveT > 0) {
      const waveX = -w * 0.2 + waveT * w * 1.4;
      const waveW = 60 * sc; // way wider than 6*sc gap
      ctx.globalAlpha = a * 0.15;
      ctx.fillStyle = "rgba(255,220,80,0.4)";
      // Sine-edged band
      ctx.beginPath();
      for (let dy = -h / 2; dy <= h / 2; dy += 2) {
        const xOff = Math.sin(dy * 0.03) * waveW * 0.3;
        dy === -h / 2 ? ctx.moveTo(waveX - waveW / 2 + xOff, cy + dy) : ctx.lineTo(waveX - waveW / 2 + xOff, cy + dy);
      }
      for (let dy = h / 2; dy >= -h / 2; dy -= 2) {
        const xOff = Math.sin(dy * 0.03) * waveW * 0.3;
        ctx.lineTo(waveX + waveW / 2 + xOff, cy + dy);
      }
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;

      // Wave passes right over the gap — it doesn't even register
      if (waveT > 0.8) {
        drawFBText(ctx, "can't see it", cx, h * 0.85, 12 * sc, a * (waveT - 0.8) * 5 * 0.6, "center", FB.red);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Scale comparison — two bars showing 200nm vs 500nm light wavelength ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 20, 5520);
    const cx = w / 2, cy = h / 2;

    const revT = interpolate(frame, [22, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revE = revT * revT * (3 - 2 * revT);

    if (revE > 0) {
      // Synapse gap bar (tiny, teal)
      const gapBarW = 20 * sc * revE; const barH = 14 * sc; const barY = cy - 30 * sc;
      ctx.globalAlpha = a * revE;
      const [gh, gs, gl] = cellHSL(4);
      ctx.fillStyle = `hsla(${gh},${gs}%,${gl}%,0.8)`;
      ctx.fillRect(cx - gapBarW / 2, barY, gapBarW, barH);
      drawFBText(ctx, "synapse: 200nm", cx, barY - 10 * sc, 9 * sc, a * revE * 0.6, "center", FB.teal);

      // Light wavelength bar (huge, gold) — appears after
      const lightT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lightT > 0) {
        const lightBarW = gapBarW * 2.5 * lightT; // 2.5x wider
        const lightBarY = cy + 20 * sc;
        ctx.fillStyle = `rgba(255,220,80,0.5)`;
        ctx.fillRect(cx - lightBarW / 2, lightBarY, lightBarW, barH);
        drawFBText(ctx, "light: ~500nm", cx, lightBarY + barH + 12 * sc, 9 * sc, a * lightT * 0.6, "center", FB.gold);

        // Arrow showing light is bigger
        if (lightT > 0.5) {
          const compA = (lightT - 0.5) * 2;
          // Bracket from gap bar to light bar
          drawFBText(ctx, "2.5x TOO WIDE", cx, cy + 55 * sc, 11 * sc, a * compA * 0.7, "center", FB.red);
        }
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Microscope view — circular viewport, everything blurry, gap not visible ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 22, 5530);
    const cx = w / 2, cy = h / 2;

    const scopeT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scopeT > 0) {
      const scopeR = 100 * sc;
      // Microscope circular viewport
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, scopeR * scopeT, 0, Math.PI * 2); ctx.clip();
      // Inside: blurry blobs (what light microscope sees)
      ctx.fillStyle = "#1e1528"; ctx.fillRect(cx - scopeR, cy - scopeR, scopeR * 2, scopeR * 2);

      // Big blurry blobs — neurons are visible but gap is just... nothing
      const [lh, ls, ll] = cellHSL(4);
      const blobR = 40 * sc;
      // Left blob
      const g1 = ctx.createRadialGradient(cx - 30 * sc, cy, 0, cx - 30 * sc, cy, blobR);
      g1.addColorStop(0, `hsla(${lh},${ls - 20}%,${ll - 10}%,${a * scopeT * 0.4})`);
      g1.addColorStop(1, `hsla(${lh},${ls - 20}%,${ll - 10}%,0)`);
      ctx.fillStyle = g1; ctx.fillRect(cx - scopeR, cy - scopeR, scopeR * 2, scopeR * 2);
      // Right blob
      const [rh] = cellHSL(0);
      const g2 = ctx.createRadialGradient(cx + 30 * sc, cy, 0, cx + 30 * sc, cy, blobR);
      g2.addColorStop(0, `hsla(${rh},30%,40%,${a * scopeT * 0.35})`);
      g2.addColorStop(1, `hsla(${rh},30%,40%,0)`);
      ctx.fillStyle = g2; ctx.fillRect(cx - scopeR, cy - scopeR, scopeR * 2, scopeR * 2);

      // No gap visible — it all blurs together
      ctx.restore();

      // Scope rim
      ctx.globalAlpha = a * scopeT;
      ctx.strokeStyle = `hsla(220,30%,50%,0.6)`; ctx.lineWidth = 4 * sc;
      ctx.beginPath(); ctx.arc(cx, cy, scopeR * scopeT, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;

      drawFBText(ctx, "LIGHT MICROSCOPE", cx, cy - scopeR - 12 * sc, 9 * sc, a * scopeT * 0.5, "center", FB.text.dim);

      // "?" over the gap area
      if (scopeT > 0.6) {
        drawFBText(ctx, "?", cx, cy, 30 * sc, a * (scopeT - 0.6) * 2.5 * 0.6, "center", FB.red);
      }

      // "gap invisible" text
      if (frame > 90) {
        const tA = interpolate(frame, [90, 110], [0, 0.7], { extrapolateRight: "clamp" });
        drawFBText(ctx, "gap invisible", cx, cy + scopeR + 15 * sc, 11 * sc, a * tA, "center", FB.red);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Light blob tries to squeeze through — bounces off like it's too big ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 20, 5540);
    const cx = w / 2, cy = h / 2;

    // Neurons grow in
    const neuT = interpolate(frame, [18, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nR = 30 * sc * neuT, gap = 5 * sc;
    if (neuT > 0) {
      drawFBNode(ctx, cx - nR - gap / 2, cy, nR, 4, a * neuT, frame);
      drawFBNode(ctx, cx + nR + gap / 2, cy, nR, 0, a * neuT, frame);
      drawFBText(ctx, "200nm", cx, cy - nR - 8 * sc, 7 * sc, a * neuT * 0.4, "center", FB.text.dim);
    }

    // Big yellow light blob approaches from left
    const blobR = 28 * sc; // way bigger than gap
    const approachT = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounceT = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounceE = Math.sin(bounceT * Math.PI); // bounce back

    if (approachT > 0) {
      const targetX = cx - gap / 2 - blobR; // right up against left neuron
      const startX = -blobR;
      const blobX = startX + (targetX - startX) * approachT - bounceE * 60 * sc;
      const squish = bounceT > 0 ? 1 + bounceE * 0.3 : 1; // squishes on impact

      ctx.globalAlpha = a * 0.3;
      const g = ctx.createRadialGradient(blobX, cy, 0, blobX, cy, blobR * squish);
      g.addColorStop(0, "rgba(255,230,80,0.5)"); g.addColorStop(0.6, "rgba(255,200,50,0.2)"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(blobX, cy, blobR * squish, blobR / squish, 0, 0, Math.PI * 2); ctx.fill();
      // Solid core
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = "rgba(255,220,80,0.7)";
      ctx.beginPath(); ctx.arc(blobX, cy, blobR * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      if (bounceT > 0.3) {
        drawFBText(ctx, "TOO BIG", blobX, cy + blobR + 12 * sc, 10 * sc, a * bounceT * 0.7, "center", FB.red);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Split screen — "what light sees" vs "what's actually there" ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 18, 5550);

    const splitT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (splitT <= 0) return;
    const divX = w / 2;

    // Divider
    ctx.globalAlpha = a * splitT * 0.3;
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([4 * sc, 4 * sc]);
    ctx.beginPath(); ctx.moveTo(divX, h * 0.08); ctx.lineTo(divX, h * 0.92); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    const revT = interpolate(frame, [35, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // LEFT: "What light sees" — blurry, merged, no gap
    const lcx = w * 0.25, lcy = h * 0.5;
    drawFBText(ctx, "WHAT LIGHT SEES", lcx, h * 0.1, 8 * sc, a * splitT * 0.5, "center", FB.gold);
    if (revT > 0) {
      // One big blurry merged blob
      const g = ctx.createRadialGradient(lcx, lcy, 0, lcx, lcy, 50 * sc);
      g.addColorStop(0, `rgba(120,100,140,${a * revT * 0.3})`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lcx, lcy, 50 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "blur", lcx, lcy, 14 * sc, a * revT * 0.3, "center", FB.text.dim);
    }

    // RIGHT: "What's actually there" — crisp neurons with visible gap
    const rcx = w * 0.75, rcy = h * 0.5;
    drawFBText(ctx, "WHAT'S THERE", rcx, h * 0.1, 8 * sc, a * splitT * 0.5, "center", FB.teal);
    if (revT > 0) {
      const gap = 5 * sc, nR = 25 * sc * revT;
      drawFBNode(ctx, rcx - nR - gap / 2, rcy, nR, 4, a * revT, frame);
      drawFBNode(ctx, rcx + nR + gap / 2, rcy, nR, 0, a * revT, frame);
      // Signal spark in gap
      const sparkX = rcx + Math.sin(frame * 0.1) * gap * 0.3;
      ctx.globalAlpha = a * revT * 0.7; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(sparkX, rcy, 1.5 * sc, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      drawFBText(ctx, "200nm gap", rcx, rcy + nR + 12 * sc, 8 * sc, a * revT * 0.5, "center", FB.text.accent);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Photon rain — yellow photons fall like rain, pass right over the gap ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const photons = useMemo(() => { const rng = seeded(5560);
    return Array.from({ length: 50 }, () => ({ x: rng() * w, speed: 1.5 + rng() * 3, size: (3 + rng() * 5) * sc, offset: rng() * h }));
  }, [w, h, sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 20, 5560);
    const cx = w / 2, cy = h / 2;

    // Neurons
    const neuT = interpolate(frame, [18, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nR = 30 * sc * neuT, gap = 5 * sc;
    if (neuT > 0) {
      drawFBNode(ctx, cx - nR - gap / 2, cy, nR, 4, a * neuT, frame);
      drawFBNode(ctx, cx + nR + gap / 2, cy, nR, 0, a * neuT, frame);
    }

    // Photon rain (starts frame 40)
    const rainT = interpolate(frame, [40, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rainT > 0) {
      for (const p of photons) {
        const y = (p.offset + (frame - 40) * p.speed * 2) % (h + p.size * 2) - p.size;
        ctx.globalAlpha = a * rainT * 0.25;
        ctx.fillStyle = "rgba(255,220,80,0.6)";
        // Photon as a fat circle — wider than the gap
        ctx.beginPath(); ctx.arc(p.x, y, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // The photons near the gap just sail over it — nothing detected
      if (frame > 80) {
        const tA = interpolate(frame, [80, 100], [0, 0.6], { extrapolateRight: "clamp" });
        drawFBText(ctx, "photons too big for the gap", cx, h * 0.88, 10 * sc, a * tA, "center", FB.red);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Wave amplitude overlay — sine wave drawn ON TOP of the gap showing it's wider ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 22, 5570);
    const cx = w / 2, cy = h / 2;

    // Two neurons with gap
    const neuT = interpolate(frame, [20, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const nR = 28 * sc * neuT, gap = 5 * sc;
    if (neuT > 0) {
      drawFBNode(ctx, cx - nR - gap / 2, cy, nR, 4, a * neuT, frame);
      drawFBNode(ctx, cx + nR + gap / 2, cy, nR, 0, a * neuT, frame);
      // Gap bracket lines
      ctx.globalAlpha = a * neuT * 0.3; ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1 * sc;
      ctx.setLineDash([2 * sc, 2 * sc]);
      ctx.beginPath(); ctx.moveTo(cx - gap / 2, cy - nR - 5 * sc); ctx.lineTo(cx - gap / 2, cy + nR + 5 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + gap / 2, cy - nR - 5 * sc); ctx.lineTo(cx + gap / 2, cy + nR + 5 * sc); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      drawFBText(ctx, "200nm", cx, cy + nR + 14 * sc, 8 * sc, a * neuT * 0.5, "center", FB.text.accent);
    }

    // Sine wave drawn horizontally across the scene — its amplitude is clearly way bigger than gap
    const waveT = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveT > 0) {
      const waveAmp = 35 * sc; // vs gap of 5*sc — 7x wider
      const wavelength = 50 * sc;
      const waveLen = w * waveT;

      ctx.globalAlpha = a * 0.4;
      ctx.strokeStyle = "rgba(255,220,80,0.7)"; ctx.lineWidth = 3 * sc;
      ctx.beginPath();
      for (let x = cx - waveLen / 2; x <= cx + waveLen / 2; x += 2) {
        const y = cy + Math.sin((x - cx) / wavelength * Math.PI * 2 + frame * 0.05) * waveAmp;
        x === cx - waveLen / 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Arrow showing wave height vs gap
      if (waveT > 0.5) {
        const arrA = (waveT - 0.5) * 2;
        // Vertical double-arrow showing wave amplitude
        const arrX = cx + 80 * sc;
        drawFBArrow(ctx, arrX, cy - waveAmp, arrX, cy + waveAmp, FB.gold, sc, a * arrA * 0.5);
        drawFBText(ctx, "~500nm", arrX + 12 * sc, cy, 7 * sc, a * arrA * 0.4, "left", FB.gold);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Zoom-out reveal — same hyperspace as FB-004 but decelerating, then synapse zoom-out ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  // Same 150 stars, same seed as FB-004 V1 so it looks identical at frame 0
  const stars = useMemo(() => { const rng = seeded(9110);
    return Array.from({ length: 150 }, () => ({ a: rng()*Math.PI*2, d: 0.05+rng()*0.95, c: Math.floor(rng()*8), r: (1+rng()*2.5)*sc, speed: 0.5+rng()*2 }));
  }, [sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h * 0.45;

    // Hyperspace decelerates over first 35 frames (same as FB-004 ending)
    const slowT = interpolate(frame, [0, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const speedMult = 1 - slowT * slowT; // same deceleration curve
    const hyperAlpha = 1 - slowT; // fade hyperspace out

    if (hyperAlpha > 0.01) {
      for (const s of stars) {
        const t = ((frame * s.speed * 0.03 * speedMult + s.d) % 1);
        const dist = t * Math.max(w, h) * 0.7;
        const x = cx + Math.cos(s.a) * dist;
        const y = cy + Math.sin(s.a) * dist * 0.7;
        const streakLen = Math.min(dist * 0.15, 20 * sc) * speedMult;
        const bx = x - Math.cos(s.a) * streakLen, by = y - Math.sin(s.a) * streakLen * 0.7;
        const sA = a * hyperAlpha * (1 - t * 0.5);
        if (sA > 0.01) {
          ctx.globalAlpha = sA * 0.6;
          const [sh,ss,sl] = cellHSL(s.c);
          ctx.strokeStyle = `hsla(${sh},${ss}%,${sl+15}%,0.8)`; ctx.lineWidth = s.r * 0.8; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke();
          drawFBNode(ctx, x, y, s.r * (0.3 + t * 0.7), s.c, sA, frame);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Synapse zoom-out: starts zoomed in on gap, slowly pulls out
    const zoomT = interpolate(frame, [25, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zoom = interpolate(zoomT, [0, 1], [15, 1]);
    const gapScreenW = 5 * sc * zoom;
    const nR = 30 * sc * zoom;

    if (nR > 1 && zoomT > 0) {
      const synA = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, cx - nR - gapScreenW / 2, cy, Math.min(nR, w * 0.4), 4, a * synA, frame);
      drawFBNode(ctx, cx + nR + gapScreenW / 2, cy, Math.min(nR, w * 0.4), 0, a * synA, frame);
    }

  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Two worlds — top half: the real synapse working, bottom half: what a camera captures (nothing) ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    drawHyperspaceSlowdown(ctx, frame, w, h, sc, a, 20, 5590);
    const cx = w / 2;

    const revT = interpolate(frame, [22, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (revT <= 0) return;

    // Horizontal divider
    ctx.globalAlpha = a * revT * 0.2; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.beginPath(); ctx.moveTo(w * 0.05, h / 2); ctx.lineTo(w * 0.95, h / 2); ctx.stroke(); ctx.globalAlpha = 1;

    // TOP: "Reality" — two neurons, active synapse with sparks
    const topCy = h * 0.28;
    drawFBText(ctx, "REALITY", w * 0.08, topCy - 45 * sc, 8 * sc, a * revT * 0.5, "left", FB.teal);
    const nR = 22 * sc * revT, gap = 4 * sc;
    drawFBNode(ctx, cx - nR - gap / 2, topCy, nR, 4, a * revT, frame);
    drawFBNode(ctx, cx + nR + gap / 2, topCy, nR, 0, a * revT, frame);
    // Active signal crossing
    if (revT > 0.5) {
      const sparkPhase = ((frame * 0.12) % 1);
      const sx = cx - gap / 2 + sparkPhase * gap;
      ctx.globalAlpha = a * (1 - Math.abs(sparkPhase - 0.5) * 2) * 0.8;
      ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(sx, topCy, 2 * sc, 0, Math.PI * 2); ctx.fill();
      // Tiny lightning bolt
      ctx.strokeStyle = FB.gold; ctx.lineWidth = 1 * sc;
      ctx.beginPath(); ctx.moveTo(cx - gap * 0.4, topCy - 3 * sc); ctx.lineTo(cx, topCy); ctx.lineTo(cx - gap * 0.2, topCy + 3 * sc); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    drawFBText(ctx, "200nm", cx, topCy + nR + 10 * sc, 7 * sc, a * revT * 0.4, "center", FB.text.accent);

    // BOTTOM: "Through light" — same area but just a blurry smudge
    const botCy = h * 0.72;
    drawFBText(ctx, "THROUGH LIGHT", w * 0.08, botCy - 45 * sc, 8 * sc, a * revT * 0.5, "left", FB.gold);
    // Blurry merged blob
    const blurG = ctx.createRadialGradient(cx, botCy, 0, cx, botCy, 50 * sc);
    blurG.addColorStop(0, `rgba(100,85,110,${a * revT * 0.25})`); blurG.addColorStop(1, "transparent");
    ctx.fillStyle = blurG; ctx.beginPath(); ctx.arc(cx, botCy, 50 * sc, 0, Math.PI * 2); ctx.fill();

    if (frame > 80) {
      const endA = interpolate(frame, [80, 100], [0, 0.6], { extrapolateRight: "clamp" });
      drawFBText(ctx, "invisible", cx, botCy, 16 * sc, a * endA, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/** Full-screen version of V8 (Zoom-Out Reveal) for FB-005 */
export const FB005_Final = V8;

export const VARIANTS_FB_005: VariantDef[] = [
  { id: "fb005-v1", label: "Neurons Chat + Wave Blind", component: V1 },
  { id: "fb005-v2", label: "Scale Bars", component: V2 },
  { id: "fb005-v3", label: "Microscope Blur", component: V3 },
  { id: "fb005-v4", label: "Light Blob Bounces", component: V4 },
  { id: "fb005-v5", label: "Split: Real vs Light", component: V5 },
  { id: "fb005-v6", label: "Photon Rain", component: V6 },
  { id: "fb005-v7", label: "Wave Amplitude Overlay", component: V7 },
  { id: "fb005-v8", label: "Zoom-Out Reveal", component: V8 },
  { id: "fb005-v9", label: "Reality vs Camera", component: V9 },
];
