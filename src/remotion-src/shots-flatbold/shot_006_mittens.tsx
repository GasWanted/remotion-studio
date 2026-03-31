// 9 unique mitten designs — pick the best one
// Each renders a mitten at center screen pointing left, with a coin below it

import React, { useRef, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, drawFBBg, fadeInOut, cellHSL } from "./flatbold-kit";

const DUR = 90;

function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, sc: number, alpha: number) {
  if (r < 1) return;
  ctx.globalAlpha = alpha;
  const [ch, cs, cl] = cellHSL(2);
  const g = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, 0, x, y, r);
  g.addColorStop(0, `hsla(${ch},${cs+5}%,${cl+22}%,${alpha})`);
  g.addColorStop(0.6, `hsla(${ch},${cs}%,${cl}%,${alpha})`);
  g.addColorStop(1, `hsla(${ch},${cs}%,${cl-8}%,${alpha})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${ch},${cs}%,${cl+28}%,${alpha*0.9})`;
  ctx.lineWidth = Math.max(1.5, 2 * sc);
  for (let i = 0; i < 36; i++) {
    const a = (i/36)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*0.82,y+Math.sin(a)*r*0.82);
    ctx.lineTo(x+Math.cos(a)*r*0.97,y+Math.sin(a)*r*0.97); ctx.stroke();
  }
  ctx.fillStyle = `rgba(255,255,255,${alpha*0.18})`;
  ctx.beginPath(); ctx.arc(x-r*0.22,y-r*0.22,r*0.28,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 1: Classic blob mitt — simple rounded shape, clear thumb ───
function mitt1(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [350, 65, 62]; // rosy red
  ctx.globalAlpha = a;
  // Body
  ctx.fillStyle = `hsla(${h},${sat}%,${l+8}%,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, s*0.45, s*0.32, 0, 0, Math.PI*2); ctx.fill();
  // Fingertip bulge
  ctx.fillStyle = `hsla(${h},${sat}%,${l+14}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.32, y, s*0.18, s*0.28, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+10}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.1, y-s*0.32, s*0.09, s*0.15, -0.3, 0, Math.PI*2); ctx.fill();
  // Cuff
  ctx.fillStyle = `hsla(${h},${sat-15}%,${l-8}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.42, y, s*0.06, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 2: Puffy cloud mitt — multiple overlapping circles ───
function mitt2(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [0, 60, 58]; // pure red
  ctx.globalAlpha = a;
  const puffs = [
    { dx: -0.3, dy: 0, r: 0.22 },
    { dx: -0.12, dy: -0.12, r: 0.2 },
    { dx: -0.12, dy: 0.12, r: 0.2 },
    { dx: 0.08, dy: -0.08, r: 0.18 },
    { dx: 0.08, dy: 0.08, r: 0.18 },
    { dx: 0.25, dy: 0, r: 0.16 },
  ];
  for (const p of puffs) {
    const px = x + p.dx * s, py = y + p.dy * s, pr = p.r * s;
    const g = ctx.createRadialGradient(px-pr*0.2, py-pr*0.2, 0, px, py, pr);
    g.addColorStop(0, `hsla(${h},${sat}%,${l+15}%,${a})`);
    g.addColorStop(1, `hsla(${h},${sat}%,${l-5}%,${a})`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI*2); ctx.fill();
  }
  // Thumb puff
  const g2 = ctx.createRadialGradient(x-s*0.08, y-s*0.32, 0, x-s*0.05, y-s*0.28, s*0.12);
  g2.addColorStop(0, `hsla(${h},${sat}%,${l+12}%,${a})`); g2.addColorStop(1, `hsla(${h},${sat}%,${l-2}%,${a})`);
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x-s*0.05, y-s*0.3, s*0.11, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 3: Cartoon boxing glove style — very round, shiny ───
function mitt3(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [355, 70, 55]; // deeper red
  ctx.globalAlpha = a;
  // Big round body
  const g = ctx.createRadialGradient(x-s*0.1, y-s*0.08, s*0.05, x, y, s*0.38);
  g.addColorStop(0, `hsla(${h},${sat}%,${l+25}%,${a})`);
  g.addColorStop(0.4, `hsla(${h},${sat}%,${l+8}%,${a})`);
  g.addColorStop(1, `hsla(${h},${sat}%,${l-12}%,${a})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, s*0.38, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.15, y-s*0.35, s*0.1, s*0.14, 0.3, 0, Math.PI*2); ctx.fill();
  // Big shiny highlight
  ctx.fillStyle = `rgba(255,255,255,${a*0.15})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.12, y-s*0.15, s*0.18, s*0.1, -0.3, 0, Math.PI*2); ctx.fill();
  // Wrist cuff
  ctx.fillStyle = `hsla(${h},${sat-20}%,${l-15}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.35, y, s*0.08, s*0.22, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 4: Flat geometric — angular mitt shape, clean design ───
function mitt4(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [345, 60, 60];
  ctx.globalAlpha = a;
  ctx.fillStyle = `hsla(${h},${sat}%,${l}%,${a})`;
  // Body as rounded rect path
  const bw = s*0.8, bh = s*0.5, r2 = s*0.12;
  const lx = x-bw*0.55, ty = y-bh/2;
  ctx.beginPath();
  ctx.moveTo(lx+r2, ty); ctx.lineTo(lx+bw-r2, ty);
  ctx.arcTo(lx+bw, ty, lx+bw, ty+r2, r2);
  ctx.lineTo(lx+bw, ty+bh-r2);
  ctx.arcTo(lx+bw, ty+bh, lx+bw-r2, ty+bh, r2);
  ctx.lineTo(lx+r2, ty+bh);
  ctx.arcTo(lx, ty+bh, lx, ty+bh-r2, r2*2); // rounder tip
  ctx.lineTo(lx, ty+r2);
  ctx.arcTo(lx, ty, lx+r2, ty, r2*2);
  ctx.closePath(); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+5}%,${a})`;
  ctx.beginPath();
  ctx.moveTo(x-s*0.05, ty); ctx.lineTo(x+s*0.05, ty-s*0.22);
  ctx.lineTo(x+s*0.15, ty-s*0.2); ctx.lineTo(x+s*0.1, ty);
  ctx.closePath(); ctx.fill();
  // Stripe accents
  ctx.strokeStyle = `hsla(${h},${sat-10}%,${l+15}%,${a*0.25})`;
  ctx.lineWidth = Math.max(1, 1.5*sc);
  ctx.beginPath(); ctx.moveTo(lx+bw*0.3, ty+2*sc); ctx.lineTo(lx+bw*0.3, ty+bh-2*sc); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx+bw*0.5, ty+2*sc); ctx.lineTo(lx+bw*0.5, ty+bh-2*sc); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 5: Knitted texture — visible knit rows ───
function mitt5(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [5, 55, 55]; // warm red
  ctx.globalAlpha = a;
  // Base shape
  ctx.fillStyle = `hsla(${h},${sat}%,${l}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.42, s*0.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `hsla(${h},${sat}%,${l+5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.28, y, s*0.18, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+3}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.05, y-s*0.3, s*0.08, s*0.13, -0.2, 0, Math.PI*2); ctx.fill();
  // Knit rows (horizontal V patterns)
  ctx.strokeStyle = `hsla(${h},${sat-5}%,${l+18}%,${a*0.2})`;
  ctx.lineWidth = Math.max(0.5, 0.8*sc);
  for (let row = -3; row <= 3; row++) {
    const ry = y + row * s * 0.08;
    for (let col = -4; col <= 4; col++) {
      const cx2 = x + col * s * 0.08;
      ctx.beginPath();
      ctx.moveTo(cx2-s*0.03, ry-s*0.03);
      ctx.lineTo(cx2, ry);
      ctx.lineTo(cx2+s*0.03, ry-s*0.03);
      ctx.stroke();
    }
  }
  // Cuff ribbing
  ctx.fillStyle = `hsla(${h},${sat-10}%,${l-5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.38, y, s*0.06, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 6: Silicone oven mitt — bright, rubbery, ridged grip ───
function mitt6(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [350, 75, 58]; // vivid red
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x-s*0.08, y-s*0.06, 0, x+s*0.05, y, s*0.45);
  g.addColorStop(0, `hsla(${h},${sat}%,${l+18}%,${a})`);
  g.addColorStop(0.5, `hsla(${h},${sat}%,${l}%,${a})`);
  g.addColorStop(1, `hsla(${h},${sat}%,${l-10}%,${a})`);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.44, s*0.3, 0, 0, Math.PI*2); ctx.fill();
  // Tip
  ctx.fillStyle = `hsla(${h},${sat}%,${l+10}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.32, y, s*0.16, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+8}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.08, y-s*0.3, s*0.09, s*0.14, -0.3, 0, Math.PI*2); ctx.fill();
  // Grip dots (silicone bumps)
  ctx.fillStyle = `hsla(${h},${sat}%,${l-8}%,${a*0.3})`;
  for (let r = -2; r <= 2; r++) {
    for (let c = -3; c <= 2; c++) {
      const dx = x + c*s*0.1, dy = y + r*s*0.1;
      ctx.beginPath(); ctx.arc(dx, dy, s*0.025, 0, Math.PI*2); ctx.fill();
    }
  }
  // Shiny streak
  ctx.fillStyle = `rgba(255,255,255,${a*0.1})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.15, y-s*0.12, s*0.25, s*0.05, -0.15, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 7: Furry mitt — soft fuzzy outline ───
function mitt7(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [355, 50, 55]; // muted red
  ctx.globalAlpha = a;
  // Base shape
  const bg = ctx.createRadialGradient(x-s*0.08, y, 0, x, y, s*0.42);
  bg.addColorStop(0, `hsla(${h},${sat}%,${l+15}%,${a})`);
  bg.addColorStop(1, `hsla(${h},${sat}%,${l-5}%,${a})`);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.42, s*0.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = `hsla(${h},${sat}%,${l+10}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.3, y, s*0.16, s*0.25, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+8}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.06, y-s*0.3, s*0.08, s*0.13, -0.2, 0, Math.PI*2); ctx.fill();
  // Furry edge — lots of tiny lines radiating outward
  ctx.strokeStyle = `hsla(${h},${sat}%,${l+20}%,${a*0.25})`;
  ctx.lineWidth = Math.max(0.5, 0.7*sc);
  const rng = { v: 42 }; // simple seed
  for (let i = 0; i < 60; i++) {
    const angle = (i/60)*Math.PI*2;
    rng.v = (rng.v * 16807) % 2147483647;
    const jitter = (rng.v / 2147483647 - 0.5) * 0.1;
    const innerR = 0.28 + Math.abs(Math.sin(angle*3))*0.08;
    const outerR = innerR + 0.04 + (rng.v/2147483647)*0.03;
    ctx.beginPath();
    ctx.moveTo(x+Math.cos(angle+jitter)*s*innerR, y+Math.sin(angle+jitter)*s*innerR*0.75);
    ctx.lineTo(x+Math.cos(angle+jitter)*s*outerR, y+Math.sin(angle+jitter)*s*outerR*0.75);
    ctx.stroke();
  }
  // Cuff (fluffy)
  ctx.fillStyle = `hsla(${h},${sat-15}%,${l+5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.38, y, s*0.08, s*0.26, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 8: Thick padded — layered padding visible in cross-section style ───
function mitt8(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [348, 60, 58];
  ctx.globalAlpha = a;
  // Outer shell
  ctx.fillStyle = `hsla(${h},${sat}%,${l-5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.46, s*0.34, 0, 0, Math.PI*2); ctx.fill();
  // Middle padding layer
  ctx.fillStyle = `hsla(${h},${sat-5}%,${l+5}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.38, s*0.27, 0, 0, Math.PI*2); ctx.fill();
  // Inner lining
  ctx.fillStyle = `hsla(${h},${sat-10}%,${l+15}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.3, s*0.2, 0, 0, Math.PI*2); ctx.fill();
  // Tip
  ctx.fillStyle = `hsla(${h},${sat}%,${l+8}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.33, y, s*0.17, s*0.28, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  ctx.fillStyle = `hsla(${h},${sat}%,${l+6}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.05, y-s*0.32, s*0.08, s*0.14, -0.25, 0, Math.PI*2); ctx.fill();
  // Layer edges visible
  ctx.strokeStyle = `hsla(${h},${sat}%,${l-15}%,${a*0.15})`;
  ctx.lineWidth = Math.max(0.5, 1*sc);
  ctx.beginPath(); ctx.ellipse(x, y, s*0.38, s*0.27, 0, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(x, y, s*0.46, s*0.34, 0, 0, Math.PI*2); ctx.stroke();
  ctx.globalAlpha = 1;
}

// ─── MITTEN 9: Cute character mitt — has dot eyes on the thumb (alive!) ───
function mitt9(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, sc: number, a: number) {
  const [h, sat, l] = [350, 65, 60];
  ctx.globalAlpha = a;
  // Body
  const bg = ctx.createRadialGradient(x-s*0.06, y-s*0.05, 0, x, y, s*0.43);
  bg.addColorStop(0, `hsla(${h},${sat}%,${l+18}%,${a})`);
  bg.addColorStop(0.6, `hsla(${h},${sat}%,${l}%,${a})`);
  bg.addColorStop(1, `hsla(${h},${sat}%,${l-10}%,${a})`);
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(x, y, s*0.43, s*0.32, 0, 0, Math.PI*2); ctx.fill();
  // Tip
  ctx.fillStyle = `hsla(${h},${sat}%,${l+12}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x-s*0.3, y, s*0.17, s*0.27, 0, 0, Math.PI*2); ctx.fill();
  // Thumb
  const thumbCx = x-s*0.06, thumbCy = y-s*0.32;
  ctx.fillStyle = `hsla(${h},${sat}%,${l+10}%,${a})`;
  ctx.beginPath(); ctx.ellipse(thumbCx, thumbCy, s*0.1, s*0.15, -0.2, 0, Math.PI*2); ctx.fill();
  // Eyes on the body (cute character!)
  const eyeY = y - s*0.05;
  for (const ex of [x-s*0.1, x+s*0.05]) {
    // White
    ctx.fillStyle = `rgba(255,255,255,${a*0.9})`;
    ctx.beginPath(); ctx.arc(ex, eyeY, s*0.045, 0, Math.PI*2); ctx.fill();
    // Pupil
    ctx.fillStyle = `rgba(30,20,40,${a*0.85})`;
    ctx.beginPath(); ctx.arc(ex, eyeY, s*0.03, 0, Math.PI*2); ctx.fill();
    // Highlight
    ctx.fillStyle = `rgba(255,255,255,${a*0.6})`;
    ctx.beginPath(); ctx.arc(ex-s*0.01, eyeY-s*0.015, s*0.012, 0, Math.PI*2); ctx.fill();
  }
  // Cuff
  ctx.fillStyle = `hsla(${h},${sat-15}%,${l-8}%,${a})`;
  ctx.beginPath(); ctx.ellipse(x+s*0.4, y, s*0.06, s*0.24, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
}

const mittFns = [mitt1, mitt2, mitt3, mitt4, mitt5, mitt6, mitt7, mitt8, mitt9];

function makeV(index: number): React.FC<VariantProps> {
  const Comp: React.FC<VariantProps> = ({ width: w, height: h }) => {
    const frame = useCurrentFrame();
    const ref = useRef<HTMLCanvasElement>(null);
    const sc = Math.min(w, h) / 360;
    useEffect(() => {
      const ctx = ref.current?.getContext("2d"); if (!ctx) return;
      drawFBBg(ctx, w, h, frame);
      const a = fadeInOut(frame, DUR);
      const cx = w * 0.4, cy = h * 0.55;
      drawCoin(ctx, cx, cy, 35 * sc, sc, a);
      // Mitt slides in from right
      const slideT = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const sE = slideT * slideT * (3 - 2 * slideT);
      const tipX = w + 60 * sc - sE * (w + 60 * sc - cx - 35 * sc - 5 * sc);
      mittFns[index](ctx, tipX, cy, 90 * sc, sc, a);
    });
    return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
  };
  return Comp;
}

export const VARIANTS_MITTENS: VariantDef[] = [
  { id: "mitt-v1", label: "Classic Blob", component: makeV(0) },
  { id: "mitt-v2", label: "Puffy Cloud", component: makeV(1) },
  { id: "mitt-v3", label: "Boxing Glove", component: makeV(2) },
  { id: "mitt-v4", label: "Flat Geometric", component: makeV(3) },
  { id: "mitt-v5", label: "Knitted", component: makeV(4) },
  { id: "mitt-v6", label: "Silicone Grip", component: makeV(5) },
  { id: "mitt-v7", label: "Furry", component: makeV(6) },
  { id: "mitt-v8", label: "Layered Padding", component: makeV(7) },
  { id: "mitt-v9", label: "Cute Character", component: makeV(8) },
];
