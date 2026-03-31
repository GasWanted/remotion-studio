// Shot 004 — "BUT inside that tiny head is a universe of 139K neurons and 54M connections"
// Duration: 150 frames (5s)
// STARTS from FB-003 ending: magnifying glass + fly at (w*0.5, h*0.45), magR=60*sc
// Zooms INTO the fly's head, then 9 completely different visual reveals

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter,
  fadeInOut, cellHSL, drawFBColorEdge,
} from "./flatbold-kit";

const DUR = 150;

// ── Fly + magnifying glass (from shot_003) ──
function drawFly(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, sc: number, frame: number, alpha: number) {
  if (s < 2 || alpha < 0.01) return;
  ctx.globalAlpha = alpha;
  const [ah, as, al] = cellHSL(1);
  const abdG = ctx.createRadialGradient(cx-s*0.05,cy+s*0.08,0,cx,cy+s*0.12,s*0.3);
  abdG.addColorStop(0,`hsla(${ah},${as+5}%,${Math.min(85,al+20)}%,${alpha})`);
  abdG.addColorStop(0.6,`hsla(${ah},${as}%,${al}%,${alpha})`);
  abdG.addColorStop(1,`hsla(${ah},${as}%,${al-8}%,${alpha*0.9})`);
  ctx.fillStyle=abdG; ctx.beginPath(); ctx.ellipse(cx,cy+s*0.12,s*0.28,s*0.38,0,0,Math.PI*2); ctx.fill();
  const thG=ctx.createRadialGradient(cx,cy-s*0.18,0,cx,cy-s*0.18,s*0.18);
  thG.addColorStop(0,`hsla(${ah},${as}%,${al+15}%,${alpha})`); thG.addColorStop(1,`hsla(${ah},${as}%,${al}%,${alpha})`);
  ctx.fillStyle=thG; ctx.beginPath(); ctx.ellipse(cx,cy-s*0.18,s*0.18,s*0.16,0,0,Math.PI*2); ctx.fill();
  const hR=s*0.13; ctx.fillStyle=`hsla(${ah},${as}%,${al+8}%,${alpha})`;
  ctx.beginPath(); ctx.ellipse(cx,cy-s*0.38,hR,hR*0.85,0,0,Math.PI*2); ctx.fill();
  const [eh,es2,el]=cellHSL(0); const eR=hR*0.65;
  for (const d of [-1,1]) { const ex=cx+d*hR*0.75,ey=cy-s*0.39;
    const eG=ctx.createRadialGradient(ex-eR*0.15*d,ey-eR*0.15,0,ex,ey,eR);
    eG.addColorStop(0,`hsla(${eh},${es2+10}%,${el+18}%,${alpha})`); eG.addColorStop(1,`hsla(${eh},${es2}%,${el-8}%,${alpha})`);
    ctx.fillStyle=eG; ctx.beginPath(); ctx.ellipse(ex,ey,eR,eR*1.15,d*0.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=`rgba(255,255,255,${alpha*0.35})`; ctx.beginPath(); ctx.arc(ex-d*eR*0.2,ey-eR*0.3,eR*0.22,0,Math.PI*2); ctx.fill(); }
  for (const d of [-1,1]) { ctx.fillStyle=`hsla(30,40%,80%,${alpha*0.15})`; ctx.beginPath(); ctx.ellipse(cx+d*s*0.22,cy-s*0.12,s*0.28,s*0.09,d*-0.25,0,Math.PI*2); ctx.fill(); }
  ctx.strokeStyle=`hsla(${ah},${as}%,${al-5}%,${alpha*0.5})`; ctx.lineWidth=Math.max(0.5,0.7*sc); ctx.lineCap="round";
  for (const d of [-1,1]) for (let l=0;l<3;l++) { const bx=cx+d*s*0.1,by=cy-s*0.05+l*s*0.14;
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx+d*s*0.17,by+s*0.06); ctx.lineTo(bx+d*s*0.24,by+s*0.13); ctx.stroke(); }
  ctx.globalAlpha=1;
}
function drawMagGlass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sc: number, alpha: number) {
  ctx.globalAlpha=alpha; const [rh,rs,rl]=cellHSL(4);
  ctx.strokeStyle=`hsla(${rh},${rs}%,${rl+10}%,${alpha*0.4})`; ctx.lineWidth=5*sc;
  ctx.beginPath(); ctx.arc(cx,cy,r+1*sc,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle=`hsla(${rh},${rs}%,${rl+20}%,${alpha})`; ctx.lineWidth=3*sc;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
  const ha=Math.PI*0.75; ctx.strokeStyle=`hsla(${rh},${rs-10}%,${rl}%,${alpha})`;
  ctx.lineWidth=5*sc; ctx.lineCap="round";
  ctx.beginPath(); ctx.moveTo(cx+Math.cos(ha)*r,cy+Math.sin(ha)*r);
  ctx.lineTo(cx+Math.cos(ha)*r*1.55,cy+Math.sin(ha)*r*1.55); ctx.stroke();
  ctx.strokeStyle=`rgba(255,255,255,${alpha*0.1})`; ctx.lineWidth=1.5*sc;
  ctx.beginPath(); ctx.arc(cx,cy,r*0.78,-Math.PI*0.6,-Math.PI*0.15); ctx.stroke(); ctx.globalAlpha=1;
}

/** Shared zoom-into-head: fly grows, head stays centered, body scrolls off, lens expands, glass fades.
 *  After this, the full canvas is available for the network reveal. */
function drawZoomInto(ctx: CanvasRenderingContext2D, frame: number, w: number, h: number, sc: number, a: number, zoomStart: number, zoomDur: number) {
  const gcx = w * 0.5, gcy = h * 0.45, baseR = 60 * sc;

  // Zoom progress
  const zT = interpolate(frame, [zoomStart, zoomStart + zoomDur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zE = zT * zT * (3 - 2 * zT);

  // Lens grows from 60*sc to covering screen
  const maxR = Math.sqrt(w * w + h * h) * 0.6;
  const lensR = baseR + (maxR - baseR) * zE;

  // Lens clip
  ctx.save();
  ctx.beginPath(); ctx.arc(gcx, gcy, Math.max(1, lensR - 2 * sc), 0, Math.PI * 2); ctx.clip();

  // Lens background
  const bg = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, lensR);
  bg.addColorStop(0, "#352a45"); bg.addColorStop(0.7, "#281e38"); bg.addColorStop(1, "#1e1528");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

  // Fly zooms: 1x → 12x, head stays at gcy
  const flyScale = 1 + zE * 11;
  const flySize = baseR * 0.85 * flyScale;
  // Head is at flyCenterY - flySize*0.38, keep that = gcy
  const flyCenterY = gcy + flySize * 0.38;
  const flyAlpha = interpolate(zT, [0.6, 0.85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (flyAlpha > 0) {
    drawFly(ctx, gcx, flyCenterY, flySize, sc, frame, a * flyAlpha);
  }

  // Glass rim fades early
  ctx.restore();
  const rimAlpha = interpolate(zE, [0, 0.3], [1, 0], { extrapolateRight: "clamp" });
  if (rimAlpha > 0) drawMagGlass(ctx, gcx, gcy, lensR, sc, a * rimAlpha);

  // Return: is the fly gone yet? And the network-ready alpha
  const netReady = interpolate(zT, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return { netReady, zE };
}

/* ── V1: Hyperspace tunnel — neurons fly past like stars in warp drive ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const stars = useMemo(() => { const rng = seeded(9110);
    return Array.from({ length: 150 }, () => ({ a: rng()*Math.PI*2, d: 0.05+rng()*0.95, c: Math.floor(rng()*8), r: (1+rng()*2.5)*sc, speed: 0.5+rng()*2 }));
  }, [sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 35);
    if (netReady <= 0) return;
    const cx = w/2, cy = h*0.45;
    // Stars fly outward from center like hyperspace
    for (const s of stars) {
      const t = ((frame * s.speed * 0.03 + s.d) % 1);
      const dist = t * Math.max(w, h) * 0.7;
      const x = cx + Math.cos(s.a) * dist;
      const y = cy + Math.sin(s.a) * dist * 0.7;
      // Streak: line from current to slightly behind
      const streakLen = Math.min(dist * 0.15, 20 * sc);
      const bx = x - Math.cos(s.a) * streakLen, by = y - Math.sin(s.a) * streakLen * 0.7;
      const sA = a * netReady * (1 - t * 0.5);
      ctx.globalAlpha = sA * 0.6;
      const [sh,ss,sl] = cellHSL(s.c);
      ctx.strokeStyle = `hsla(${sh},${ss}%,${sl+15}%,0.8)`; ctx.lineWidth = s.r * 0.8; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke();
      drawFBNode(ctx, x, y, s.r * (0.3 + t * 0.7), s.c, sA, frame);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/** Full-screen version of V1 (Hyperspace Tunnel) for FB-004 */
export const FB004_Final = V1;

/* ── V2: X-ray scan — fly stays but becomes transparent, brain skeleton visible inside ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const brainNodes = useMemo(() => { const rng = seeded(9120); const cx=w/2, cy=h*0.45;
    return Array.from({ length: 80 }, () => { const a2=rng()*Math.PI*2, d=Math.pow(rng(),0.5)*55*sc;
      return { x: cx+Math.cos(a2)*d*1.3, y: cy+Math.sin(a2)*d*0.7-15*sc, c: Math.floor(rng()*8), r: (1.5+rng()*2.5)*sc }; });
  }, [w, h, sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const gcx=w*0.5, gcy=h*0.45, baseR=60*sc;
    // Lens expands
    const zT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const zE = zT*zT*(3-2*zT);
    const maxR = Math.sqrt(w*w+h*h)*0.6;
    const lensR = baseR + (maxR-baseR)*zE;
    ctx.save(); ctx.beginPath(); ctx.arc(gcx,gcy,Math.max(1,lensR-2*sc),0,Math.PI*2); ctx.clip();
    const bg=ctx.createRadialGradient(gcx,gcy,0,gcx,gcy,lensR);
    bg.addColorStop(0,"#352a45"); bg.addColorStop(0.7,"#281e38"); bg.addColorStop(1,"#1e1528");
    ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    // Fly zooms in but stays as a TRANSPARENT outline
    const flyScale = 1 + zE*5;
    const flySize = baseR*0.85*flyScale;
    const flyCY = gcy + flySize*0.38;
    const flyOutlineAlpha = interpolate(zT, [0.3, 0.7], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFly(ctx, gcx, flyCY, flySize, sc, frame, a * flyOutlineAlpha);
    // X-ray scan line sweeps across
    const scanT = interpolate(frame, [25, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scanT > 0) {
      const scanX = w * scanT;
      ctx.globalAlpha = a * 0.3;
      ctx.fillStyle = `hsla(180,50%,60%,0.15)`;
      ctx.fillRect(scanX - 3*sc, 0, 6*sc, h);
      ctx.globalAlpha = 1;
    }
    // Brain nodes appear behind the scan line
    for (let i = 0; i < brainNodes.length; i++) {
      const n = brainNodes[i];
      const revealed = n.x < w * scanT;
      if (!revealed) continue;
      const revealAge = Math.min(1, (w*scanT - n.x) / (50*sc));
      drawFBNode(ctx, n.x, n.y, n.r * revealAge, n.c, a * revealAge * 0.9, frame);
      // Connect to nearby revealed nodes
      for (let j = 0; j < i; j++) {
        const nj = brainNodes[j]; if (nj.x >= w*scanT) continue;
        const dx=n.x-nj.x, dy=n.y-nj.y;
        if (Math.sqrt(dx*dx+dy*dy) < 35*sc) {
          drawFBEdge(ctx, n.x,n.y, nj.x,nj.y, sc, a*revealAge*0.25, frame, cellHSL(n.c)[0], cellHSL(nj.c)[0]);
        }
      }
    }
    ctx.restore();
    const rimA = interpolate(zE,[0,0.3],[1,0],{extrapolateRight:"clamp"});
    if (rimA>0) drawMagGlass(ctx,gcx,gcy,lensR,sc,a*rimA);
    if (scanT > 0.5) { drawFBCounter(ctx,"139,000",w/2,h*0.07,14*sc,FB.teal,a*(scanT-0.5)*2*0.8);
      drawFBText(ctx,"neurons visible under X-ray",w/2,h*0.12,8*sc,a*(scanT-0.5)*2*0.3,"center",FB.text.dim); }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Eyes crack open — compound eyes split, neurons pour out like light ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const particles = useMemo(() => { const rng = seeded(9130);
    return Array.from({ length: 200 }, () => ({ a: rng()*Math.PI*2, speed: 1+rng()*4, c: Math.floor(rng()*8), r: (1+rng()*2)*sc, eye: rng()>0.5?-1:1, delay: rng()*25 }));
  }, [sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 30);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    // Two eye positions (where compound eyes were when zoomed)
    const leftEye = { x: cx - 35*sc, y: cy - 5*sc };
    const rightEye = { x: cx + 35*sc, y: cy - 5*sc };
    // Cracks on each eye
    const crackT = interpolate(frame, [28, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const eye of [leftEye, rightEye]) {
      if (crackT > 0) {
        ctx.globalAlpha = a * netReady * (1 - crackT*0.5);
        ctx.strokeStyle = FB.gold; ctx.lineWidth = 2*sc; ctx.lineCap = "round";
        for (let c = 0; c < 5; c++) {
          const ca = (c/5)*Math.PI*2; const cl = crackT*25*sc;
          ctx.beginPath(); ctx.moveTo(eye.x, eye.y);
          ctx.lineTo(eye.x+Math.cos(ca)*cl, eye.y+Math.sin(ca)*cl); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    // Neurons pour out from both eyes
    const pourT = interpolate(frame, [35, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    let count = 0;
    for (const p of particles) {
      const t = pourT - p.delay/80;
      if (t <= 0) continue;
      count++;
      const source = p.eye < 0 ? leftEye : rightEye;
      const dist = t * p.speed * 40 * sc;
      const x = source.x + Math.cos(p.a) * dist;
      const y = source.y + Math.sin(p.a) * dist;
      const pA = Math.max(0, 1 - dist / (Math.max(w,h)*0.5));
      drawFBNode(ctx, x, y, p.r * Math.min(1, t*3), p.c, a * netReady * pA, frame);
    }
    const n = Math.round(count/particles.length*139000);
    drawFBCounter(ctx, n.toLocaleString("en-US"), cx, h*0.93, 13*sc, FB.teal, a*netReady*0.7);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Microscope zoom levels — 10x → 100x → 1000x → 10000x, each showing more detail ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 3, 25);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    const levels = [
      { label: "10x", count: 5, r: 8, color: 3, startF: 25, endF: 50 },
      { label: "100x", count: 20, r: 5, color: 4, startF: 45, endF: 75 },
      { label: "1,000x", count: 60, r: 3, color: 5, startF: 70, endF: 100 },
      { label: "10,000x", count: 150, r: 1.8, color: 6, startF: 95, endF: 130 },
    ];
    let totalVisible = 0;
    for (const lv of levels) {
      const lt = interpolate(frame, [lv.startF, lv.endF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lt <= 0) continue;
      const shown = Math.floor(lt * lv.count);
      const rng = seeded(9140 + lv.count);
      for (let i = 0; i < shown; i++) {
        const a2 = rng()*Math.PI*2, d = Math.pow(rng(),0.5)*120*sc;
        const nx = cx+Math.cos(a2)*d*1.2, ny = cy+Math.sin(a2)*d*0.8;
        drawFBNode(ctx, nx, ny, lv.r*sc, lv.color, a*lt*0.7, frame);
        totalVisible++;
      }
      // Zoom level label
      const labelA = interpolate(frame, [lv.startF, lv.startF+8, lv.endF-5, lv.endF], [0, 0.8, 0.8, 0.2], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
      drawFBText(ctx, lv.label, w*0.92, h*0.08, 14*sc, a*labelA*0.6, "right", FB.text.accent);
    }
    // Connections appear at higher zoom
    if (frame > 80) {
      const rng = seeded(9141);
      const connA = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
      for (let i = 0; i < 40; i++) {
        const a2=rng()*Math.PI*2, d1=rng()*100*sc, d2=rng()*100*sc, a3=rng()*Math.PI*2;
        drawFBEdge(ctx, cx+Math.cos(a2)*d1, cy+Math.sin(a2)*d1*0.8, cx+Math.cos(a3)*d2, cy+Math.sin(a3)*d2*0.8, sc, a*connA*0.15, frame);
      }
    }
    const n = Math.min(139000, totalVisible * 500);
    drawFBCounter(ctx, n.toLocaleString("en-US"), cx, h*0.93, 11*sc, FB.teal, a*netReady*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Blueprint unfold — head outline unfolds flat like a map, revealing wiring diagram ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const wiring = useMemo(() => { const rng = seeded(9150);
    return Array.from({ length: 80 }, () => ({
      x1: w*0.1+rng()*w*0.8, y1: h*0.15+rng()*h*0.7,
      x2: w*0.1+rng()*w*0.8, y2: h*0.15+rng()*h*0.7,
      c: Math.floor(rng()*8),
    }));
  }, [w, h]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 30);
    if (netReady <= 0) return;
    // Blueprint grid
    const gridA = a * netReady * 0.04;
    ctx.globalAlpha = gridA; ctx.strokeStyle = "rgba(100,200,220,0.2)"; ctx.lineWidth = 0.5*sc;
    for (let x = 0; x < w; x += 20*sc) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 20*sc) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // Wiring traces draw themselves
    const drawT = interpolate(frame, [30, 115], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    const shown = Math.floor(drawT * wiring.length);
    for (let i = 0; i < shown; i++) {
      const wi = wiring[i]; const t = Math.min(1, (shown-i)/3);
      drawFBColorEdge(ctx, wi.x1,wi.y1, wi.x2,wi.y2, `hsla(${cellHSL(wi.c)[0]},40%,55%,${a*t*0.4})`, sc, a*t*0.5);
      drawFBNode(ctx, wi.x1, wi.y1, 2.5*sc, wi.c, a*t*0.8, frame);
      drawFBNode(ctx, wi.x2, wi.y2, 2*sc, (wi.c+3)%8, a*t*0.6, frame);
    }
    drawFBText(ctx, "WIRING DIAGRAM", w/2, h*0.05, 12*sc, a*netReady*0.5, "center", FB.teal);
    drawFBCounter(ctx, "54,000,000 connections", w/2, h*0.95, 10*sc, FB.purple, a*drawT*0.5);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Head shatters like glass — pieces fall revealing dense network behind ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const shards = useMemo(() => { const rng = seeded(9160); const cx=w/2, cy=h*0.45;
    return Array.from({ length: 25 }, () => {
      const a2=rng()*Math.PI*2, d=rng()*50*sc;
      return { x: cx+Math.cos(a2)*d, y: cy+Math.sin(a2)*d*0.7, size: (8+rng()*15)*sc,
        vx: (rng()-0.5)*3, vy: 1+rng()*3, rot: (rng()-0.5)*0.1, c: Math.floor(rng()*8) };
    });
  }, [w, h, sc]);
  const network = useMemo(() => { const rng = seeded(9161); const cx=w/2, cy=h*0.45;
    return Array.from({ length: 100 }, () => { const a2=rng()*Math.PI*2, d=Math.pow(rng(),0.5)*110*sc;
      return { x: cx+Math.cos(a2)*d*1.2, y: cy+Math.sin(a2)*d*0.85, c: Math.floor(rng()*8), r: (1.5+rng()*2.5)*sc }; });
  }, [w, h, sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 28);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    // Network (behind shards)
    const netA = interpolate(frame, [35, 90], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    for (let i = 1; i < network.length; i++) {
      const ni=network[i-1], nj=network[i]; const dx=ni.x-nj.x, dy=ni.y-nj.y;
      if (Math.sqrt(dx*dx+dy*dy)<45*sc) drawFBEdge(ctx, ni.x,ni.y, nj.x,nj.y, sc, a*netA*0.3, frame, cellHSL(ni.c)[0], cellHSL(nj.c)[0]);
    }
    for (const n of network) drawFBNode(ctx, n.x, n.y, n.r*netA, n.c, a*netA*0.8, frame);
    // Shards fall
    const shatterT = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    if (shatterT > 0) {
      const fallT = Math.max(0, frame - 30);
      for (const s of shards) {
        const sx = s.x + s.vx*fallT*2, sy = s.y + s.vy*fallT*2 + fallT*fallT*0.3;
        const sa = Math.max(0, 1 - fallT/40);
        if (sa <= 0) continue;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(s.rot*fallT);
        ctx.globalAlpha = a*sa*0.5;
        const [sh,ss,sl] = cellHSL(s.c);
        ctx.fillStyle = `hsla(${sh},${ss-20}%,${sl-10}%,0.4)`;
        ctx.fillRect(-s.size/2, -s.size/2, s.size, s.size*0.7);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    // Flash on shatter
    if (frame >= 29 && frame <= 34) { ctx.globalAlpha=0.15*(1-Math.abs(frame-31)/3); ctx.fillStyle="#fff"; ctx.fillRect(0,0,w,h); ctx.globalAlpha=1; }
    drawFBCounter(ctx, "139,000", cx, h*0.07, 15*sc, FB.teal, a*netA*0.8);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Depth layers — zoom through 5 transparent layers, each denser than the last ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 30);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    // 5 layers zoom past (parallax)
    const layers = [
      { depth: 0.2, count: 10, r: 5, colorBase: 0 },
      { depth: 0.4, count: 25, r: 4, colorBase: 2 },
      { depth: 0.6, count: 50, r: 3, colorBase: 4 },
      { depth: 0.8, count: 80, r: 2, colorBase: 6 },
      { depth: 1.0, count: 120, r: 1.5, colorBase: 1 },
    ];
    const zoomDepth = interpolate(frame, [28, 125], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    let totalN = 0;
    for (const layer of layers) {
      // Layer scrolls based on depth (parallax)
      const layerZ = zoomDepth - layer.depth;
      const layerScale = 1 + layerZ * 3; // closer = bigger
      const layerA = layerZ > 0 ? Math.max(0, 1 - layerZ*2) : Math.max(0, 1 + layerZ*3);
      if (layerA <= 0.02) continue;
      const rng = seeded(9170 + layer.count);
      const shown = Math.floor(layerA * layer.count);
      for (let i = 0; i < shown; i++) {
        const a2=rng()*Math.PI*2, d=Math.pow(rng(),0.5)*100*sc*layerScale;
        const nx=cx+Math.cos(a2)*d*1.2, ny=cy+Math.sin(a2)*d*0.8;
        drawFBNode(ctx, nx, ny, layer.r*sc*layerScale, (layer.colorBase+i)%8, a*layerA*0.6*netReady, frame);
        totalN++;
      }
    }
    const n = Math.min(139000, totalN*300);
    drawFBCounter(ctx, n.toLocaleString("en-US"), cx, h*0.07, 13*sc, FB.teal, a*netReady*0.7);
    drawFBText(ctx, "54 million connections", cx, h*0.94, 9*sc, a*zoomDepth*0.4, "center", FB.purple);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Big bang — single point explodes into expanding universe of neurons ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const nodes = useMemo(() => { const rng = seeded(9180);
    return Array.from({ length: 180 }, () => ({ a: rng()*Math.PI*2, maxD: (30+rng()*120)*sc,
      c: Math.floor(rng()*8), r: (1+rng()*2.5)*sc, speed: 0.3+rng()*0.7 }));
  }, [sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 28);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    // Initial bright flash at center
    const bangT = interpolate(frame, [28, 35], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    if (bangT > 0 && bangT < 1) {
      const flashR = bangT * 40 * sc;
      const g = ctx.createRadialGradient(cx,cy,0,cx,cy,flashR);
      g.addColorStop(0, `rgba(255,255,200,${(1-bangT)*0.4})`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,flashR,0,Math.PI*2); ctx.fill();
    }
    // Nodes expand outward from center
    const expandT = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft:"clamp", extrapolateRight:"clamp" });
    let visible = 0;
    for (const n of nodes) {
      const d = expandT * n.maxD * n.speed;
      if (d < 2) continue;
      visible++;
      const x = cx + Math.cos(n.a)*d*1.1, y = cy + Math.sin(n.a)*d*0.8;
      drawFBNode(ctx, x, y, n.r * Math.min(1, expandT*3), n.c, a*netReady*0.8, frame);
    }
    // Connections form between nearby settled nodes
    if (expandT > 0.4) {
      const connA = (expandT-0.4)/0.6;
      const rng = seeded(9181);
      for (let i = 0; i < 50; i++) {
        const a1=rng()*Math.PI*2, d1=rng()*expandT*100*sc;
        const a2=a1+(rng()-0.5)*1.5, d2=rng()*expandT*100*sc;
        drawFBEdge(ctx, cx+Math.cos(a1)*d1,cy+Math.sin(a1)*d1*0.8, cx+Math.cos(a2)*d2,cy+Math.sin(a2)*d2*0.8, sc, a*connA*0.15*netReady, frame);
      }
    }
    const count = Math.min(139000, Math.round(visible/nodes.length*139000));
    drawFBCounter(ctx, count.toLocaleString("en-US"), cx, h*0.07, 15*sc, FB.teal, a*expandT*0.8);
    if (expandT > 0.6) drawFBText(ctx, "54,000,000 connections", cx, h*0.94, 9*sc, a*(expandT-0.6)*2.5*0.4, "center", FB.purple);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Pulse reveal — concentric heartbeat pulses reveal rings of neurons with each beat ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const nodes = useMemo(() => { const rng = seeded(9190); const cx=w/2, cy=h*0.45;
    return Array.from({ length: 140 }, () => { const a2=rng()*Math.PI*2, d=Math.pow(rng(),0.5)*120*sc;
      return { x: cx+Math.cos(a2)*d*1.2, y: cy+Math.sin(a2)*d*0.85, dist: d, c: Math.floor(rng()*8), r: (1.5+rng()*2.5)*sc }; });
  }, [w, h, sc]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const { netReady } = drawZoomInto(ctx, frame, w, h, sc, a, 5, 28);
    if (netReady <= 0) return;
    const cx=w/2, cy=h*0.45;
    // Pulse rings expand every ~18 frames
    const pulseInterval = 18;
    const numPulses = Math.floor((frame - 28) / pulseInterval);
    const maxPulseR = 140 * sc;
    // Draw pulse rings
    for (let p = 0; p <= numPulses; p++) {
      const pFrame = frame - 28 - p * pulseInterval;
      if (pFrame < 0) continue;
      const pR = (pFrame / 25) * maxPulseR;
      const pA = Math.max(0, 1 - pFrame / 35);
      ctx.globalAlpha = a * pA * 0.15 * netReady;
      const [ph] = cellHSL(p % 8);
      ctx.strokeStyle = `hsla(${ph},50%,60%,0.4)`; ctx.lineWidth = 2*sc;
      ctx.beginPath(); ctx.arc(cx, cy, pR, 0, Math.PI*2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Nodes revealed when a pulse passes them
    let visible = 0;
    for (const n of nodes) {
      // Was any pulse at this node's distance?
      let revealed = false;
      for (let p = 0; p <= numPulses; p++) {
        const pFrame = frame - 28 - p * pulseInterval;
        const pR = (pFrame / 25) * maxPulseR;
        if (pR >= n.dist) { revealed = true; break; }
      }
      if (!revealed) continue;
      visible++;
      drawFBNode(ctx, n.x, n.y, n.r, n.c, a * netReady * 0.85, frame);
    }
    // Connections
    for (let i = 0; i < nodes.length; i++) { for (let j = i+1; j < Math.min(i+10, nodes.length); j++) {
      const ni=nodes[i], nj=nodes[j]; const dx=ni.x-nj.x, dy=ni.y-nj.y;
      if (Math.sqrt(dx*dx+dy*dy)<35*sc) {
        let both = false;
        for (let p=0;p<=numPulses;p++) { const pR=(Math.max(0,frame-28-p*pulseInterval)/25)*maxPulseR; if (pR>=ni.dist && pR>=nj.dist) { both=true; break; } }
        if (both) drawFBEdge(ctx, ni.x,ni.y, nj.x,nj.y, sc, a*netReady*0.25, frame, cellHSL(ni.c)[0], cellHSL(nj.c)[0]);
      }
    }}
    const n = Math.min(139000, Math.round(visible/nodes.length*139000));
    drawFBCounter(ctx, n.toLocaleString("en-US"), cx, h*0.07, 14*sc, FB.teal, a*netReady*0.7);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const VARIANTS_FB_004: VariantDef[] = [
  { id: "fb004-v1", label: "Hyperspace Tunnel", component: V1 },
  { id: "fb004-v2", label: "X-Ray Scan", component: V2 },
  { id: "fb004-v3", label: "Eyes Crack Open", component: V3 },
  { id: "fb004-v4", label: "Microscope Zoom", component: V4 },
  { id: "fb004-v5", label: "Blueprint Unfold", component: V5 },
  { id: "fb004-v6", label: "Head Shatters", component: V6 },
  { id: "fb004-v7", label: "Depth Layers", component: V7 },
  { id: "fb004-v8", label: "Big Bang", component: V8 },
  { id: "fb004-v9", label: "Pulse Reveal", component: V9 },
];
