import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 71 — "If a neuron fired for feeding, I weakened it proportional to its activity.
   If it fired for retreat, I strengthened it." — 180 frames (6s) */

const DUR = 180;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Two rows of blob neurons — top row FEED dims proportionally, bottom RETREAT brightens */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [30, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const acts = [0.9, 0.55, 0.8, 0.35, 0.7, 0.5];
    drawFBText(ctx, "FEED", W * 0.08, H * 0.25, 8 * s, a, "center", FB.gold);
    acts.forEach((v, i) => {
      const x = W * 0.2 + i * W * 0.12; const dim = 1 - v * p;
      drawFBNode(ctx, x, H * 0.25, (4 + v * 6) * s * Math.max(0.2, dim), 1, a * Math.max(0.12, dim), frame);
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.red;
      ctx.fillRect(x - 2 * s, H * 0.34, 4 * s, -v * H * 0.08 * p); ctx.globalAlpha = 1;
    });
    drawFBText(ctx, "RETREAT", W * 0.06, H * 0.68, 8 * s, a, "center", FB.teal);
    acts.forEach((v, i) => {
      const x = W * 0.2 + i * W * 0.12; const boost = Math.min(1.5, 1 + v * p * 0.6);
      drawFBNode(ctx, x, H * 0.68, (4 + v * 5) * s * boost, 4, a * Math.min(1, 0.2 + v * p), frame);
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.teal;
      ctx.fillRect(x - 2 * s, H * 0.76, 4 * s, v * H * 0.08 * p); ctx.globalAlpha = 1;
    });
    const lP = interpolate(frame, [100, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WEAKEN", W / 2, H * 0.1, 11 * s, a * lP, "center", FB.red);
    drawFBText(ctx, "STRENGTHEN", W / 2, H * 0.9, 11 * s, a * lP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Seesaw tilting from feed to retreat side */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const tilt = interpolate(frame, [30, 130], [0, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.58;
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.moveTo(cx, cy + 8 * s); ctx.lineTo(cx - 8 * s, cy + 18 * s);
    ctx.lineTo(cx + 8 * s, cy + 18 * s); ctx.closePath(); ctx.fill();
    const beam = W * 0.38;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 2 * s; ctx.globalAlpha = a * 0.6;
    ctx.beginPath(); ctx.moveTo(-beam, 0); ctx.lineTo(beam, 0); ctx.stroke();
    for (let i = 0; i < 4; i++) {
      const x = -beam + 14 * s + i * 18 * s;
      drawFBNode(ctx, x, -8 * s, (5 - tilt * 6 * (0.5 + i * 0.12)) * s, 1, a * Math.max(0.15, 1 - tilt * 2), frame);
    }
    drawFBText(ctx, "FEED", -beam * 0.55, -22 * s, 9 * s, a, "center", FB.red);
    for (let i = 0; i < 4; i++) {
      const x = beam - 14 * s - i * 18 * s;
      drawFBNode(ctx, x, -8 * s, (4 + tilt * 8) * s, 4, a * Math.min(1, 0.2 + tilt * 2), frame);
    }
    drawFBText(ctx, "RETREAT", beam * 0.55, -22 * s, 9 * s, a, "center", FB.teal);
    ctx.restore();
    drawFBText(ctx, "PROPORTIONAL", cx, H * 0.15, 12 * s, a * interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Activity meters — named neurons with bars that shrink/grow */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [20, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const feed = [{ n: "MN9", v: 0.85 }, { n: "F2", v: 0.6 }, { n: "F3", v: 0.45 }];
    const ret = [{ n: "MDN", v: 0.8 }, { n: "R2", v: 0.55 }, { n: "R3", v: 0.9 }];
    feed.forEach((d, i) => {
      const y = H * 0.12 + i * H * 0.1; const bw = W * 0.45 * d.v * (1 - p);
      drawFBNode(ctx, W * 0.1, y, 5 * s, 1, a * Math.max(0.15, 1 - d.v * p), frame);
      ctx.globalAlpha = a * 0.55; ctx.fillStyle = FB.red; ctx.fillRect(W * 0.18, y - 3 * s, bw, 6 * s);
      drawFBText(ctx, d.n, W * 0.05, y, 7 * s, a * 0.6, "center", FB.text.dim); ctx.globalAlpha = 1;
    });
    ret.forEach((d, i) => {
      const y = H * 0.56 + i * H * 0.1; const bw = W * 0.45 * d.v * p;
      drawFBNode(ctx, W * 0.1, y, (3 + 5 * p * d.v) * s, 4, a * (0.25 + 0.75 * d.v * p), frame);
      ctx.globalAlpha = a * 0.55; ctx.fillStyle = FB.teal; ctx.fillRect(W * 0.18, y - 3 * s, bw, 6 * s);
      drawFBText(ctx, d.n, W * 0.05, y, 7 * s, a * 0.6, "center", FB.text.dim); ctx.globalAlpha = 1;
    });
    drawFBText(ctx, "PROPORTIONAL TO ACTIVITY", W * 0.55, H * 0.45, 9 * s, a * p, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Spotlight sweep — each neuron lit reveals its weakening or strengthening */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const neurons = useMemo(() => {
    const rng = seeded(7104);
    return Array.from({ length: 14 }, (_, i) => ({
      x: W * 0.12 + rng() * W * 0.76, y: H * 0.12 + rng() * H * 0.6,
      feed: i < 7, act: 0.3 + rng() * 0.7,
    }));
  }, [W, H]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const sweepX = interpolate(frame, [10, 155], [W * 0.05, W * 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const p = interpolate(frame, [20, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    neurons.forEach((n) => {
      const lit = Math.max(0, 1 - Math.abs(n.x - sweepX) / (W * 0.14));
      if (n.feed) {
        const dim = Math.max(0.1, 1 - n.act * p);
        drawFBNode(ctx, n.x, n.y, (3 + n.act * 5) * s * dim, 1, a * (0.2 + lit * 0.8) * dim, frame);
      } else {
        const boost = Math.min(1.4, 1 + n.act * p * 0.5);
        drawFBNode(ctx, n.x, n.y, (3 + n.act * 5) * s * boost, 4, a * (0.2 + lit * 0.8), frame);
      }
    });
    ctx.globalAlpha = a * 0.07; ctx.fillStyle = FB.gold;
    ctx.fillRect(sweepX - 2, 0, 4, H); ctx.globalAlpha = 1;
    drawFBText(ctx, "FIRED FOR FEEDING? WEAKEN", W / 2, H * 0.06, 7 * s, a, "center", FB.red);
    drawFBText(ctx, "FIRED FOR RETREAT? STRENGTHEN", W / 2, H * 0.94, 7 * s, a, "center", FB.teal);
  }, [frame, W, H, neurons]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Thermometer gauges — feed gauges drain, retreat gauges fill */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [25, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fV = [0.9, 0.55, 0.75, 0.4]; const rV = [0.3, 0.85, 0.6, 0.7];
    const gW = 10 * s, gH = H * 0.25;
    fV.forEach((v, i) => {
      const x = W * 0.08 + i * W * 0.11; const fill = v * (1 - p);
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(x - gW / 2, H * 0.15, gW, gH);
      ctx.globalAlpha = a * 0.8; ctx.fillStyle = FB.red;
      ctx.fillRect(x - gW / 2, H * 0.15 + gH * (1 - fill), gW, gH * fill);
      drawFBNode(ctx, x, H * 0.12, 4 * s, 1, a * Math.max(0.12, fill), frame); ctx.globalAlpha = 1;
    });
    drawFBText(ctx, "FEED", W * 0.28, H * 0.07, 9 * s, a, "center", FB.red);
    rV.forEach((v, i) => {
      const x = W * 0.56 + i * W * 0.11; const fill = v * p;
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(x - gW / 2, H * 0.15, gW, gH);
      ctx.globalAlpha = a * 0.8; ctx.fillStyle = FB.teal;
      ctx.fillRect(x - gW / 2, H * 0.15 + gH * (1 - fill), gW, gH * fill);
      drawFBNode(ctx, x, H * 0.12, (3 + 4 * p * v) * s, 4, a * (0.3 + 0.7 * fill), frame); ctx.globalAlpha = 1;
    });
    drawFBText(ctx, "RETREAT", W * 0.76, H * 0.07, 9 * s, a, "center", FB.teal);
    drawFBText(ctx, "PROPORTIONAL TO ACTIVITY", W / 2, H * 0.88, 9 * s, a * p, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Hub-and-spoke — center target neuron, feed spokes thin, retreat spokes thicken */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [20, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H / 2;
    drawFBNode(ctx, cx, cy, 8 * s, 2, a, frame);
    const rng = seeded(7106);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 - Math.PI / 2; const d = 48 * s;
      const nx = cx + Math.cos(ang) * d, ny = cy + Math.sin(ang) * d;
      const act = 0.3 + rng() * 0.7; const isFeed = i < 4;
      if (isFeed) {
        const lw = Math.max(0.3 * s, (3 - act * 2.5 * p) * s);
        drawFBNode(ctx, nx, ny, (5 - act * 3 * p) * s, 1, a * Math.max(0.1, 1 - act * p), frame);
        ctx.globalAlpha = a * Math.max(0.08, 1 - act * p * 0.8); ctx.strokeStyle = FB.red;
        ctx.lineWidth = lw; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(cx, cy); ctx.stroke();
      } else {
        const lw = (1 + act * 2.5 * p) * s;
        drawFBNode(ctx, nx, ny, (3 + act * 4 * p) * s, 4, a * Math.min(1, 0.25 + act * p), frame);
        ctx.globalAlpha = a * Math.min(1, 0.25 + act * p); ctx.strokeStyle = FB.teal;
        ctx.lineWidth = lw; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(cx, cy); ctx.stroke();
      }
    }
    drawFBText(ctx, "WEAKENED", W * 0.12, H * 0.06, 8 * s, a * p, "center", FB.red);
    drawFBText(ctx, "STRENGTHENED", W * 0.88, H * 0.06, 8 * s, a * p, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Before/after split screen */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const sP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mP = interpolate(frame, [50, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sP * 0.25; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
    drawFBText(ctx, "BEFORE", W * 0.25, H * 0.06, 9 * s, a * sP, "center", FB.text.dim);
    drawFBText(ctx, "AFTER", W * 0.75, H * 0.06, 9 * s, a * sP, "center", FB.gold);
    const acts = [0.9, 0.6, 0.8, 0.5, 0.7];
    acts.forEach((v, i) => {
      const y = H * 0.16 + i * H * 0.14; const isFeed = i < 3;
      drawFBNode(ctx, W * 0.15, y, 5 * s, isFeed ? 1 : 4, a * sP, frame);
      ctx.globalAlpha = a * sP * 0.5; ctx.fillStyle = isFeed ? FB.red : FB.teal;
      ctx.fillRect(W * 0.22, y - 2 * s, W * 0.2 * v, 4 * s); ctx.globalAlpha = 1;
      const modV = isFeed ? v * (1 - mP) : v * (1 + mP * 0.5);
      drawFBNode(ctx, W * 0.65, y, (3 + Math.min(1, modV) * 4) * s, isFeed ? 1 : 4,
        a * sP * (isFeed ? Math.max(0.12, 1 - v * mP) : 1), frame);
      ctx.globalAlpha = a * sP * 0.5; ctx.fillStyle = isFeed ? FB.red : FB.teal;
      ctx.fillRect(W * 0.72, y - 2 * s, W * 0.2 * Math.min(1, modV), 4 * s); ctx.globalAlpha = 1;
    });
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Volume knobs — feed knobs rotate down, retreat knobs rotate up */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [20, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const drawKnob = (x: number, y: number, val: number, color: string, label: string) => {
      const r = 12 * s;
      ctx.globalAlpha = a * 0.12; const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2);
      glow.addColorStop(0, color); glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * 0.35; ctx.strokeStyle = color; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI * 0.75, Math.PI * 0.75); ctx.stroke();
      const ang = -Math.PI * 0.75 + val * Math.PI * 1.5;
      ctx.globalAlpha = a * 0.85; ctx.strokeStyle = color; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * r * 0.78, y + Math.sin(ang) * r * 0.78); ctx.stroke();
      drawFBText(ctx, label, x, y + r + 8 * s, 6 * s, a * 0.6, "center", FB.text.dim);
      drawFBText(ctx, Math.round(val * 100) + "%", x, y - r - 5 * s, 7 * s, a * 0.7, "center", color);
    };
    [0.9, 0.6, 0.8].forEach((v, i) => drawKnob(W * 0.12 + i * W * 0.16, H * 0.3, v * (1 - p), FB.red, "FEED " + (i + 1)));
    [0.3, 0.7, 0.9].forEach((v, i) => drawKnob(W * 0.12 + i * W * 0.16, H * 0.7, v * p, FB.teal, "RET " + (i + 1)));
    drawFBText(ctx, "ACTIVITY KNOBS", W * 0.72, H / 2, 10 * s, a * p, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Particle rain — feed particles fade as they fall, retreat particles grow as they rise */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const p = interpolate(frame, [20, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(7109);
    for (let i = 0; i < 22; i++) {
      const bx = W * 0.03 + rng() * W * 0.42; const speed = 0.5 + rng() * 1.5;
      const by = ((frame * speed + rng() * H) % H); const sz = (2 + rng() * 4) * s;
      const fadeA = Math.max(0, 1 - p * (0.4 + rng() * 0.6));
      drawFBNode(ctx, bx, by, sz * fadeA, 1, a * 0.45 * fadeA, frame);
    }
    for (let i = 0; i < 22; i++) {
      const bx = W * 0.55 + rng() * W * 0.42; const speed = 0.5 + rng() * 1.5;
      const by = H - ((frame * speed + rng() * H) % H); const sz = (2 + rng() * 4) * s;
      const growA = Math.min(1, 0.08 + p * (0.4 + rng() * 0.6));
      drawFBNode(ctx, bx, by, sz * (0.5 + growA * 0.6), 4, a * 0.45 * growA, frame);
    }
    drawFBText(ctx, "FEEDING", W * 0.22, H * 0.06, 10 * s, a * (1 - p * 0.7), "center", FB.red);
    drawFBText(ctx, "RETREAT", W * 0.78, H * 0.06, 10 * s, a * (0.25 + p * 0.75), "center", FB.teal);
    if (frame > 95) drawFBText(ctx, "PROPORTIONAL", W / 2, H * 0.92, 11 * s, a * interpolate(frame, [95, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_071: VariantDef[] = [
  { id: "fb-071-v1", label: "Two rows: feed dims, retreat brightens", component: V1 },
  { id: "fb-071-v2", label: "Seesaw tilting from feed to retreat", component: V2 },
  { id: "fb-071-v3", label: "Activity meter bars shrink and grow", component: V3 },
  { id: "fb-071-v4", label: "Spotlight sweep revealing changes", component: V4 },
  { id: "fb-071-v5", label: "Thermometer gauges drain and fill", component: V5 },
  { id: "fb-071-v6", label: "Hub-and-spoke connections thin/thicken", component: V6 },
  { id: "fb-071-v7", label: "Before/after split screen comparison", component: V7 },
  { id: "fb-071-v8", label: "Volume knobs rotating down and up", component: V8 },
  { id: "fb-071-v9", label: "Particle rain: feed fades, retreat rises", component: V9 },
];
