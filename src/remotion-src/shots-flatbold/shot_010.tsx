// Shot 010 — "resin until it was hard as a rock, and shaved it into seven thousand slices."
// Duration: 135 frames (~4.5s)
// STARTS from FB-009: brain encased in big amber resin block
// Then: a blade shaves thin slices off the block, slices stack up, counter shows 7,050
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 135;

function drawResinBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number, w2: number, h2: number, sc: number, alpha: number) {
  const [rh, rs, rl] = cellHSL(2);
  const depth = 8 * sc;
  ctx.globalAlpha = alpha * 0.15;
  ctx.fillStyle = `hsla(${rh},${rs}%,${rl - 15}%,0.3)`;
  ctx.fillRect(cx - w2/2 + depth, cy - h2/2 - depth, w2, h2);
  const lg = ctx.createLinearGradient(cx, cy - h2/2, cx, cy + h2/2);
  lg.addColorStop(0, `hsla(${rh},${rs}%,${rl + 8}%,${alpha * 0.3})`);
  lg.addColorStop(0.5, `hsla(${rh},${rs + 5}%,${rl}%,${alpha * 0.35})`);
  lg.addColorStop(1, `hsla(${rh},${rs + 10}%,${rl - 8}%,${alpha * 0.4})`);
  ctx.globalAlpha = 1; ctx.fillStyle = lg;
  ctx.fillRect(cx - w2/2, cy - h2/2, w2, h2);
  ctx.globalAlpha = alpha * 0.5;
  ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 15}%,0.6)`;
  ctx.lineWidth = Math.max(1.5, 2.5 * sc);
  ctx.strokeRect(cx - w2/2, cy - h2/2, w2, h2);
  ctx.beginPath();
  ctx.moveTo(cx-w2/2,cy-h2/2); ctx.lineTo(cx-w2/2+depth,cy-h2/2-depth);
  ctx.lineTo(cx+w2/2+depth,cy-h2/2-depth); ctx.lineTo(cx+w2/2,cy-h2/2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx+w2/2,cy-h2/2); ctx.lineTo(cx+w2/2+depth,cy-h2/2-depth);
  ctx.lineTo(cx+w2/2+depth,cy+h2/2-depth); ctx.lineTo(cx+w2/2,cy+h2/2); ctx.stroke();
  ctx.globalAlpha = alpha * 0.08;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(cx - w2/2 + w2*0.08, cy - h2/2 + 3*sc, w2*0.08, h2 - 6*sc);
  ctx.globalAlpha = 1;
}

function drawSlice(ctx: CanvasRenderingContext2D, x: number, y: number, w2: number, h2: number, sc: number, alpha: number) {
  const [rh, rs, rl] = cellHSL(2);
  ctx.globalAlpha = alpha * 0.4;
  ctx.fillStyle = `hsla(${rh},${rs + 5}%,${rl + 5}%,0.35)`;
  ctx.fillRect(x - w2/2, y - h2/2, w2, h2);
  ctx.strokeStyle = `hsla(${rh},${rs}%,${rl + 18}%,${alpha * 0.4})`;
  ctx.lineWidth = Math.max(0.5, 1 * sc);
  ctx.strokeRect(x - w2/2, y - h2/2, w2, h2);
  ctx.globalAlpha = 1;
}

function drawBlade(ctx: CanvasRenderingContext2D, x: number, y: number, bladeW: number, sc: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `hsla(200,20%,75%,${alpha * 0.7})`;
  ctx.beginPath();
  ctx.moveTo(x, y - bladeW/2); ctx.lineTo(x + 4*sc, y); ctx.lineTo(x, y + bladeW/2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
  ctx.lineWidth = 1 * sc;
  ctx.beginPath(); ctx.moveTo(x, y - bladeW/2); ctx.lineTo(x, y + bladeW/2); ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ── V1: Block shrinks as blade shaves, slices stack to the right ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const blockW = 160*sc, blockH = 150*sc, blockCx = w*0.32, blockCy = h/2;
    const sliceT = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceCount = Math.floor(sliceT * 30);
    const shrink = sliceT * 0.7;
    drawResinBlock(ctx, blockCx, blockCy, blockW*(1-shrink), blockH, sc, a);
    const bladeX = blockCx + blockW*(1-shrink)/2;
    drawBlade(ctx, bladeX + Math.sin(frame*0.3)*3*sc, blockCy, blockH*0.8, sc, a*0.8);
    const stackX = w*0.65;
    for (let i = 0; i < sliceCount; i++) {
      const sx = stackX + i*(3*sc + 1*sc);
      if (sx > w - 10*sc) break;
      drawSlice(ctx, sx, blockCy, 3*sc, blockH*0.9, sc, a * Math.min(1, (sliceCount-i)/3));
    }
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), w/2, h*0.08, 14*sc, FB.teal, a*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Blade sweeps top to bottom, slices fly off right ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2, blockW = 150*sc, blockH = 150*sc;
    const sliceT = interpolate(frame, [10, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cuts = Math.floor(sliceT*20), shrink = sliceT*0.6;
    drawResinBlock(ctx, cx - shrink*blockW*0.3, cy, blockW*(1-shrink), blockH, sc, a);
    const cutPhase = (sliceT*20) % 1;
    const bladeY = cy - blockH/2 + cutPhase*blockH;
    const bladeX = cx - shrink*blockW*0.3 + blockW*(1-shrink)/2;
    ctx.globalAlpha = a*0.6; ctx.strokeStyle = "rgba(200,220,240,0.7)"; ctx.lineWidth = 1.5*sc;
    ctx.beginPath(); ctx.moveTo(bladeX - blockW*0.4, bladeY); ctx.lineTo(bladeX + 15*sc, bladeY); ctx.stroke(); ctx.globalAlpha = 1;
    for (let i = 0; i < cuts; i++) {
      const age = cuts - i;
      drawSlice(ctx, bladeX + 20*sc + Math.min(age*8*sc, w*0.35), cy, 2.5*sc, blockH*0.85, sc, a * Math.max(0, 1-age/25));
    }
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), cx, h*0.07, 13*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Side view — slices fan out ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h/2;
    const sliceT = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const blockW = 120*sc, blockH = 140*sc, shrink = sliceT*0.65, blockX = w*0.22;
    drawResinBlock(ctx, blockX, cy, blockW*(1-shrink), blockH, sc, a);
    const cutX = blockX + blockW*(1-shrink)/2 + 3*sc;
    drawBlade(ctx, cutX, cy, blockH*0.85, sc, a*0.7);
    const sliceCount = Math.floor(sliceT*25);
    for (let i = 0; i < sliceCount; i++) {
      const t = i/25;
      const sx = cutX + 20*sc + t*w*0.5;
      ctx.save(); ctx.translate(sx, cy); ctx.rotate((t-0.5)*0.3);
      drawSlice(ctx, 0, 0, 2.5*sc, blockH*0.85*(1-t*0.1), sc, a*Math.min(1, (sliceCount-i)/3));
      ctx.restore();
    }
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), w*0.7, h*0.08, 14*sc, FB.teal, a*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Top-down — slices peel upward ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2, blockW = 170*sc, blockH = 155*sc;
    const sliceT = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shrink = sliceT*0.5;
    drawResinBlock(ctx, cx, cy + shrink*blockH*0.25, blockW, blockH*(1-shrink), sc, a);
    const sliceCount = Math.floor(sliceT*22);
    for (let i = 0; i < sliceCount; i++) {
      drawSlice(ctx, cx, cy - blockH/2 - (sliceCount-i)*4*sc, blockW*0.95, 2*sc, sc, a * Math.min(1, (sliceCount-i)/4) * 0.7);
    }
    const bladeY = cy + shrink*blockH*0.25 - blockH*(1-shrink)/2;
    ctx.globalAlpha = a*0.6; ctx.strokeStyle = "rgba(200,220,240,0.7)"; ctx.lineWidth = 1.5*sc;
    ctx.beginPath(); ctx.moveTo(cx-blockW*0.55, bladeY); ctx.lineTo(cx+blockW*0.55, bladeY); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 0.5*sc;
    ctx.beginPath(); ctx.moveTo(cx-blockW*0.55, bladeY-1); ctx.lineTo(cx+blockW*0.55, bladeY-1); ctx.stroke();
    ctx.globalAlpha = 1;
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), cx, h*0.92, 13*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Rapid chop — vibrating block, slices cascade down ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h*0.4, blockW = 160*sc, blockH = 120*sc;
    const sliceT = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shrink = sliceT*0.6;
    const vibrate = Math.sin(frame*1.5)*2*sc*(1-sliceT);
    drawResinBlock(ctx, cx+vibrate, cy, blockW*(1-shrink), blockH, sc, a);
    const bladeX = cx + blockW*(1-shrink)/2 + 5*sc;
    drawBlade(ctx, bladeX + Math.abs(Math.sin(frame*0.8))*3*sc, cy, blockH*0.75, sc, a*0.7);
    const sliceCount = Math.floor(sliceT*28);
    for (let i = 0; i < sliceCount; i++) {
      const age = sliceCount - i;
      const fallY = cy + blockH/2 + 10*sc + age*5*sc;
      if (fallY > h+10) continue;
      drawSlice(ctx, cx + Math.sin(i*1.7)*15*sc, fallY, 2.5*sc, blockH*0.8, sc, a*Math.max(0, 1-age/30));
    }
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), cx, h*0.88, 14*sc, FB.teal, a*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Block morphs into layers ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2, blockW = 170*sc, blockH = 155*sc;
    const morphT = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const morphE = morphT*morphT*(3-2*morphT);
    if (morphE < 1) drawResinBlock(ctx, cx, cy, blockW, blockH, sc, a*(1-morphE));
    if (morphE > 0) {
      const layers = 25;
      const sliceH = blockH/layers;
      const [rh, rs, rl] = cellHSL(2);
      for (let i = 0; i < layers; i++) {
        const lt = interpolate(morphE, [i/layers, (i+1)/layers], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (lt <= 0) continue;
        const ly = cy - blockH/2 + i*sliceH + sliceH/2;
        const gap = lt*2*sc;
        ctx.globalAlpha = a*lt*0.35;
        ctx.fillStyle = `hsla(${rh},${rs+5}%,${rl + i%2*5}%,0.35)`;
        ctx.fillRect(cx - blockW/2, ly - sliceH/2 + gap/2, blockW, sliceH - gap);
        ctx.globalAlpha = 1;
      }
    }
    if (morphT > 0.2) drawFBCounter(ctx, Math.round(morphT*7050).toLocaleString("en-US"), cx, h*0.07, 14*sc, FB.teal, a*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Conveyor belt ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h*0.45, beltY = h*0.7;
    const sliceT = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const blockW = 120*sc, blockH = 130*sc, shrink = sliceT*0.6;
    drawResinBlock(ctx, w*0.2, cy, blockW*(1-shrink), blockH, sc, a);
    drawBlade(ctx, w*0.2 + blockW*(1-shrink)/2 + 5*sc, cy, blockH*0.8, sc, a*0.7);
    ctx.globalAlpha = a*0.2; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2*sc;
    ctx.beginPath(); ctx.moveTo(w*0.3, beltY); ctx.lineTo(w*0.95, beltY); ctx.stroke();
    for (let i = 0; i < 15; i++) {
      const dx = ((i*w*0.045 + frame*2) % (w*0.65)) + w*0.3;
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.arc(dx, beltY, 2*sc, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const sliceCount = Math.floor(sliceT*20);
    for (let i = 0; i < sliceCount; i++) {
      const beltX = w*0.35 + ((i*18*sc + frame*1.5) % (w*0.6));
      drawSlice(ctx, beltX, beltY - 15*sc, 2.5*sc, blockH*0.6, sc, a*0.6);
    }
    if (sliceT > 0.1) drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), w/2, h*0.08, 13*sc, FB.teal, a*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Explosion of slices ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const slices = useMemo(() => { const rng = seeded(1080);
    return Array.from({ length: 40 }, () => ({ angle: rng()*Math.PI*2, speed: 0.5+rng()*2, rot: (rng()-0.5)*0.1 }));
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w/2, cy = h/2, blockW = 170*sc, blockH = 155*sc;
    const blockA = interpolate(frame, [0, 35, 40], [1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (blockA > 0) drawResinBlock(ctx, cx, cy, blockW, blockH, sc, a*blockA);
    if (frame >= 38 && frame <= 43) {
      ctx.globalAlpha = (1-Math.abs(frame-40)/3)*0.06; ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h); ctx.globalAlpha = 1;
    }
    const shatterT = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (shatterT > 0) {
      for (const s of slices) {
        const dist = shatterT*s.speed*120*sc;
        const sx = cx + Math.cos(s.angle)*dist, sy = cy + Math.sin(s.angle)*dist;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rot*shatterT*20);
        drawSlice(ctx, 0, 0, 2*sc, blockH*0.4, sc, a*Math.max(0,1-shatterT*0.8)*0.5);
        ctx.restore();
      }
    }
    if (shatterT > 0.1) drawFBCounter(ctx, "7,050", cx, h*0.08, 16*sc, FB.teal, a*shatterT*0.6);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Progressive — block left shrinks, neat stack right grows ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cy = h/2, blockW = 130*sc, blockH = 140*sc;
    const sliceT = interpolate(frame, [8, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shrink = sliceT*0.7, blockX = w*0.25;
    drawResinBlock(ctx, blockX, cy, blockW*(1-shrink), blockH, sc, a);
    if (sliceT > 0.1) {
      ctx.globalAlpha = a*0.2; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5*sc;
      ctx.setLineDash([4*sc,3*sc]);
      ctx.beginPath(); ctx.moveTo(blockX + blockW*(1-shrink)/2 + 15*sc, cy); ctx.lineTo(w*0.55, cy); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    const stackX = w*0.72, sliceCount = Math.floor(sliceT*30);
    const totalStackW = sliceCount*4*sc, stackStartX = stackX - totalStackW/2;
    for (let i = 0; i < sliceCount; i++) drawSlice(ctx, stackStartX + i*4*sc, cy, 2.5*sc, blockH*0.85, sc, a*0.5);
    drawFBCounter(ctx, Math.round(sliceT*7050).toLocaleString("en-US"), w/2, h*0.1, 16*sc, FB.teal, a*0.7);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB010_Final = V9;

export const VARIANTS_FB_010: VariantDef[] = [
  { id: "fb010-v1", label: "Blade + Stack Right", component: V1 },
  { id: "fb010-v2", label: "Vertical Sweep", component: V2 },
  { id: "fb010-v3", label: "Fan Spread", component: V3 },
  { id: "fb010-v4", label: "Peel Upward", component: V4 },
  { id: "fb010-v5", label: "Rapid Cascade", component: V5 },
  { id: "fb010-v6", label: "Morph to Layers", component: V6 },
  { id: "fb010-v7", label: "Conveyor Belt", component: V7 },
  { id: "fb010-v8", label: "Shatter into Slices", component: V8 },
  { id: "fb010-v9", label: "Progressive Stack", component: V9 },
];
