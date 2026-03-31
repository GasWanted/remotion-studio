// Shot 006 — "Visible light waves are physically wider than that gap. Imagine trying to feel
//   the ridges on a coin while wearing thick oven mitts. Your 'tool' is just too blunt to"
// Duration: 133 frames (~4.4s)
// Mitt comes from the RIGHT (rotated 90°), BIG, tries to feel coin ridges and can't

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 133;

/** Gold coin with thick visible ridges */
function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sc: number, alpha: number) {
  if (r < 1) return;
  ctx.globalAlpha = alpha;
  const [ch, cs, cl] = cellHSL(2); // amber/gold
  const g = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, 0, x, y, r);
  g.addColorStop(0, `hsla(${ch},${cs + 5}%,${cl + 22}%,${alpha})`);
  g.addColorStop(0.6, `hsla(${ch},${cs}%,${cl}%,${alpha})`);
  g.addColorStop(1, `hsla(${ch},${cs}%,${cl - 8}%,${alpha})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  // Thick ridges
  ctx.strokeStyle = `hsla(${ch},${cs}%,${cl + 28}%,${alpha * 0.9})`;
  ctx.lineWidth = Math.max(1.5, 2 * sc);
  for (let i = 0; i < 36; i++) {
    const a2 = (i / 36) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a2) * r * 0.82, y + Math.sin(a2) * r * 0.82);
    ctx.lineTo(x + Math.cos(a2) * r * 0.97, y + Math.sin(a2) * r * 0.97);
    ctx.stroke();
  }
  // Specular
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.18})`;
  ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.22, r * 0.28, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

/** Boxing glove style mitt — big, round, shiny red. Horizontal, pointing left.
 *  tipX,tipY = the left edge (contact point). */
function drawMitt(ctx: CanvasRenderingContext2D, tipX: number, tipY: number, size: number, sc: number, alpha: number) {
  if (size < 2) return;
  ctx.globalAlpha = alpha;
  const s = size;
  const h = 355, sat = 70, l = 55;

  // Center of the big round body (offset right from tip)
  const cx = tipX + s * 0.38;

  // Shadow
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.08})`;
  ctx.beginPath(); ctx.ellipse(cx, tipY + s * 0.03, s * 0.4, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();

  // Big round body
  const g = ctx.createRadialGradient(cx - s * 0.1, tipY - s * 0.08, s * 0.05, cx, tipY, s * 0.38);
  g.addColorStop(0, `hsla(${h},${sat}%,${l + 25}%,${alpha})`);
  g.addColorStop(0.4, `hsla(${h},${sat}%,${l + 8}%,${alpha})`);
  g.addColorStop(1, `hsla(${h},${sat}%,${l - 12}%,${alpha})`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, tipY, s * 0.38, 0, Math.PI * 2); ctx.fill();

  // Thumb (sticking up)
  ctx.fillStyle = `hsla(${h},${sat}%,${l + 5}%,${alpha})`;
  ctx.beginPath(); ctx.ellipse(cx + s * 0.15, tipY - s * 0.35, s * 0.1, s * 0.14, 0.3, 0, Math.PI * 2); ctx.fill();

  // Big shiny highlight
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.15})`;
  ctx.beginPath(); ctx.ellipse(cx - s * 0.12, tipY - s * 0.15, s * 0.18, s * 0.1, -0.3, 0, Math.PI * 2); ctx.fill();

  // Wrist cuff
  ctx.fillStyle = `hsla(${h},${sat - 20}%,${l - 15}%,${alpha})`;
  ctx.beginPath(); ctx.ellipse(cx + s * 0.35, tipY, s * 0.08, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();

  ctx.globalAlpha = 1;
}

/** Bare fingertip — small, precise */
function drawFinger(ctx: CanvasRenderingContext2D, tipX: number, tipY: number, size: number, sc: number, alpha: number) {
  ctx.globalAlpha = alpha;
  const [fh, fs, fl] = cellHSL(7); // pink
  const fg = ctx.createRadialGradient(tipX + size * 0.05, tipY, 0, tipX + size * 0.1, tipY, size * 0.2);
  fg.addColorStop(0, `hsla(${fh},${fs}%,${fl + 15}%,${alpha})`);
  fg.addColorStop(1, `hsla(${fh},${fs}%,${fl}%,${alpha})`);
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.ellipse(tipX + size * 0.1, tipY, size * 0.18, size * 0.08, 0, 0, Math.PI * 2); ctx.fill();
  // Nail
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.15})`;
  ctx.beginPath(); ctx.ellipse(tipX + size * 0.02, tipY, size * 0.04, size * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

/* ── V1: Mitt slides in from right, presses coin, ridges disappear ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.35, cy = h / 2;
    drawCoin(ctx, cx, cy, 45 * sc, sc, a);

    const slideT = interpolate(frame, [15, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const slideE = slideT * slideT * (3 - 2 * slideT);
    const mittSize = 120 * sc;
    const startX = w + mittSize * 0.5;
    const endX = cx + 45 * sc + 5 * sc; // tip touches the coin edge
    const tipX = startX + (endX - startX) * slideE;

    drawMitt(ctx, tipX, cy, mittSize, sc, a);

    // After contact: red overlay covers the ridges
    if (slideE > 0.9) {
      const coverA = (slideE - 0.9) * 10;
      ctx.globalAlpha = a * coverA * 0.35;
      const [rh, rs, rl] = cellHSL(0);
      ctx.fillStyle = `hsla(${rh},${rs}%,${rl}%,0.5)`;
      ctx.beginPath(); ctx.arc(cx, cy, 43 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Finger from right (feels ridges + sparkles), then mitt from right (feels nothing) ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.3, cy = h / 2;
    drawCoin(ctx, cx, cy, 45 * sc, sc, a);

    const coinEdge = cx + 45 * sc;

    // Phase 1: finger slides in from right, touches coin
    const fingerSlide = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fingerLeave = interpolate(frame, [45, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fingerSlide > 0 && fingerLeave < 1) {
      const fStartX = w + 20 * sc;
      const fEndX = coinEdge + 2 * sc;
      const fTipX = fStartX + (fEndX - fStartX) * fingerSlide + fingerLeave * (w - fEndX);
      drawFinger(ctx, fTipX, cy, 40 * sc, sc, a * (1 - fingerLeave));

      // Sparkles when touching
      if (fingerSlide > 0.8 && fingerLeave < 0.3) {
        const rng = seeded(6201);
        for (let i = 0; i < 8; i++) {
          const sa = rng() * Math.PI * 2;
          const sd = 20 * sc + rng() * 20 * sc;
          const sparkle = Math.sin(frame * 0.25 + i * 1.7) * 0.5 + 0.5;
          ctx.globalAlpha = a * sparkle * 0.6;
          ctx.fillStyle = FB.gold;
          ctx.beginPath(); ctx.arc(cx + Math.cos(sa) * sd, cy + Math.sin(sa) * sd, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Phase 2: big mitt slides in from right
    const mittSlide = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mittSlide > 0) {
      const mE = mittSlide * mittSlide * (3 - 2 * mittSlide);
      const mittSize = 130 * sc;
      const mStartX = w + mittSize * 0.5;
      const mEndX = coinEdge + 3 * sc;
      const mTipX = mStartX + (mEndX - mStartX) * mE;
      drawMitt(ctx, mTipX, cy, mittSize, sc, a);

      // No sparkles — dead flat
      if (mE > 0.8) {
        const nopeA = (mE - 0.8) * 5;
        ctx.globalAlpha = a * nopeA * 0.5;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(cx - 20 * sc, cy + 55 * sc); ctx.lineTo(cx + 20 * sc, cy + 55 * sc); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Mitt slides in fast, smashes into coin, bounces back ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.35, cy = h / 2;
    drawCoin(ctx, cx, cy, 45 * sc, sc, a);

    const coinEdge = cx + 45 * sc;
    const mittSize = 130 * sc;
    const slideT = interpolate(frame, [12, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bounceT = interpolate(frame, [40, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const slideE = slideT * slideT; // accelerating in

    let tipX = w + mittSize * 0.3 - slideE * (w + mittSize * 0.3 - coinEdge - 3 * sc);
    let squishX = 1;

    if (bounceT > 0) {
      // Squish then bounce back
      if (bounceT < 0.3) {
        squishX = 1 - bounceT * 1.5; // compress
        tipX = coinEdge + 3 * sc;
      } else {
        const bt = (bounceT - 0.3) / 0.7;
        tipX = coinEdge + 3 * sc + bt * w * 0.5; // flies back right
      }
    }

    ctx.save();
    ctx.translate(tipX, cy);
    ctx.scale(squishX < 1 ? squishX : 1, squishX < 1 ? 1 + (1 - squishX) * 0.3 : 1);
    drawMitt(ctx, 0, 0, mittSize, sc, a);
    ctx.restore();

    // Impact flash
    if (frame >= 39 && frame <= 43) {
      ctx.globalAlpha = (1 - Math.abs(frame - 41) / 3) * 0.08;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Three mitts, each bigger, all fail ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.3, cy = h / 2;
    drawCoin(ctx, cx, cy, 40 * sc, sc, a);

    const coinEdge = cx + 40 * sc;
    const mitts = [
      { start: 5, size: 80, yOff: -20 },
      { start: 35, size: 110, yOff: 0 },
      { start: 68, size: 145, yOff: 15 },
    ];

    for (const m of mitts) {
      const slideT = interpolate(frame, [m.start, m.start + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const leaveT = interpolate(frame, [m.start + 25, m.start + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (slideT <= 0) continue;
      const mE = slideT * slideT * (3 - 2 * slideT);
      const startX = w + m.size * sc * 0.3;
      const endX = coinEdge + 3 * sc;
      const tipX = startX + (endX - startX) * mE + leaveT * w * 0.4;
      const tipA = 1 - leaveT;
      if (tipA > 0) drawMitt(ctx, tipX, cy + m.yOff * sc, m.size * sc, sc, a * tipA);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Mitt slides in, presses, ridges highlighted before → hidden after ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.35, cy = h / 2;
    const coinR = 45 * sc;
    drawCoin(ctx, cx, cy, coinR, sc, a);

    // Ridges pulse gold before mitt arrives
    const preMitt = frame < 45;
    if (preMitt) {
      const pulse = 0.5 + Math.sin(frame * 0.15) * 0.4;
      const [ch, cs, cl] = cellHSL(2);
      ctx.strokeStyle = `hsla(${ch},${cs}%,${cl + 28}%,${a * pulse * 0.7})`;
      ctx.lineWidth = Math.max(1.5, 2.5 * sc);
      for (let i = 0; i < 36; i++) {
        const a2 = (i / 36) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a2) * coinR * 0.82, cy + Math.sin(a2) * coinR * 0.82);
        ctx.lineTo(cx + Math.cos(a2) * coinR * 0.97, cy + Math.sin(a2) * coinR * 0.97);
        ctx.stroke();
      }
    }

    // Mitt slides in
    const slideT = interpolate(frame, [30, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (slideT > 0) {
      const sE = slideT * slideT * (3 - 2 * slideT);
      const mittSize = 130 * sc;
      const tipX = w + mittSize * 0.3 - sE * (w + mittSize * 0.3 - cx - coinR - 3 * sc);
      drawMitt(ctx, tipX, cy, mittSize, sc, a);

      // After contact: red wash over ridges
      if (sE > 0.85) {
        const ca = (sE - 0.85) / 0.15;
        ctx.globalAlpha = a * ca * 0.3;
        const [rh, rs, rl] = cellHSL(0);
        ctx.fillStyle = `hsla(${rh},${rs}%,${rl}%,0.4)`;
        ctx.beginPath(); ctx.arc(cx, cy, coinR - 2 * sc, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Side by side coins — top touched by finger (sparkles), bottom by mitt (nothing) ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const coinR = 35 * sc;

    // Top: coin + finger
    const topCx = w * 0.3, topCy = h * 0.3;
    drawCoin(ctx, topCx, topCy, coinR, sc, a);
    const fT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fT > 0) {
      const fE = fT * fT * (3 - 2 * fT);
      const fTipX = w + 20 * sc - fE * (w + 20 * sc - topCx - coinR - 2 * sc);
      drawFinger(ctx, fTipX, topCy, 35 * sc, sc, a);
      if (fE > 0.8) {
        const rng = seeded(6261);
        for (let i = 0; i < 6; i++) {
          const sa = rng() * Math.PI * 2, sd = 15 * sc + rng() * 15 * sc;
          ctx.globalAlpha = a * (Math.sin(frame * 0.2 + i) * 0.3 + 0.5) * 0.5;
          ctx.fillStyle = FB.gold;
          ctx.beginPath(); ctx.arc(topCx + Math.cos(sa) * sd, topCy + Math.sin(sa) * sd, 2 * sc, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    // Bottom: coin + mitt
    const botCx = w * 0.3, botCy = h * 0.7;
    drawCoin(ctx, botCx, botCy, coinR, sc, a);
    const mT = interpolate(frame, [40, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (mT > 0) {
      const mE = mT * mT * (3 - 2 * mT);
      const mTipX = w + 60 * sc - mE * (w + 60 * sc - botCx - coinR - 3 * sc);
      drawMitt(ctx, mTipX, botCy, 120 * sc, sc, a);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Mitt slides in slow motion, cross-section shows padding vs ridges ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.35, cy = h / 2;
    drawCoin(ctx, cx, cy, 45 * sc, sc, a);

    // Slow mitt approach
    const slideT = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sE = slideT * slideT;
    const mittSize = 140 * sc;
    const coinEdge = cx + 45 * sc;
    const tipX = w + mittSize * 0.3 - sE * (w + mittSize * 0.3 - coinEdge - 5 * sc);
    drawMitt(ctx, tipX, cy, mittSize, sc, a);

    // Show distance closing — dashed line between mitt tip and coin
    if (slideT < 0.9 && slideT > 0.1) {
      const gapDist = tipX - coinEdge;
      if (gapDist > 5 * sc) {
        ctx.globalAlpha = a * 0.2;
        ctx.setLineDash([3 * sc, 3 * sc]);
        ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
        ctx.beginPath(); ctx.moveTo(coinEdge + 2 * sc, cy); ctx.lineTo(tipX - 2 * sc, cy); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Mitt wobbles trying different pressures — light/medium/hard, none work ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.32, cy = h / 2;
    drawCoin(ctx, cx, cy, 45 * sc, sc, a);

    const coinEdge = cx + 45 * sc;
    const mittSize = 125 * sc;
    const restX = coinEdge + 3 * sc;

    // Mitt arrives first
    const arriveT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const arriveE = arriveT * arriveT * (3 - 2 * arriveT);
    let tipX = w + mittSize * 0.3 - arriveE * (w + mittSize * 0.3 - restX);

    // Then wobbles: presses in, backs off, presses harder, backs off, really hard
    if (arriveE >= 1) {
      const wobbleT = interpolate(frame, [38, 115], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const phase = wobbleT % 1;
      const push = Math.sin(phase * Math.PI); // 0→1→0
      const attempt = Math.floor(wobbleT);
      const pushDist = (8 + attempt * 5) * sc; // each attempt pushes harder
      tipX = restX - push * pushDist;
    }

    drawMitt(ctx, tipX, cy, mittSize, sc, a);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Mitt presses, then lifts showing coin ridges still there (untouched/unfelt) ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w * 0.35, cy = h / 2;
    const coinR = 45 * sc;
    drawCoin(ctx, cx, cy, coinR, sc, a);

    const coinEdge = cx + coinR;
    const mittSize = 130 * sc;
    const slideT = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const liftT = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const sE = slideT * slideT * (3 - 2 * slideT);
    const restX = coinEdge + 3 * sc;
    const tipX = w + mittSize * 0.3 - sE * (w + mittSize * 0.3 - restX) + liftT * w * 0.4;
    const mittA = 1 - liftT * 0.8;

    if (mittA > 0) drawMitt(ctx, tipX, cy, mittSize, sc, a * mittA);

    // After lift: ridges glow green — still there, mitt couldn't feel them
    if (liftT > 0.4) {
      const revA = (liftT - 0.4) / 0.6;
      ctx.strokeStyle = `hsla(140,55%,60%,${a * revA * 0.6})`;
      ctx.lineWidth = Math.max(1.5, 2.5 * sc);
      for (let i = 0; i < 36; i++) {
        const a2 = (i / 36) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a2) * coinR * 0.82, cy + Math.sin(a2) * coinR * 0.82);
        ctx.lineTo(cx + Math.cos(a2) * coinR * 0.97, cy + Math.sin(a2) * coinR * 0.97);
        ctx.stroke();
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB006_Final = V3;

export const VARIANTS_FB_006: VariantDef[] = [
  { id: "fb006-v1", label: "Slide + Cover", component: V1 },
  { id: "fb006-v2", label: "Finger vs Mitt", component: V2 },
  { id: "fb006-v3", label: "Smash + Bounce", component: V3 },
  { id: "fb006-v4", label: "Three Sizes", component: V4 },
  { id: "fb006-v5", label: "Ridges Highlighted", component: V5 },
  { id: "fb006-v6", label: "Stacked Compare", component: V6 },
  { id: "fb006-v7", label: "Slow Approach", component: V7 },
  { id: "fb006-v8", label: "Wobble Press", component: V8 },
  { id: "fb006-v9", label: "Press + Reveal", component: V9 },
];
