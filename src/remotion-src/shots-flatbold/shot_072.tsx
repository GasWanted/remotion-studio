import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 72 — "Hebbian rule — fire together wire together — but reversed for the food." — 180 frames (6s) */
const DUR = 180;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: Two neurons fire together, edge strengthens, then REVERSE stamp, edge weakens */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const hebbP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revP = interpolate(frame, [95, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const ax = W * 0.28, bx = W * 0.72, cy = H * 0.42;
    const pulse = Math.sin(frame * 0.15) * 0.3 + 0.7;
    const edgeW = frame < 90 ? (1 + hebbP * 4) * s : Math.max(0.4 * s, (5 - revP * 4.5) * s);
    const eColor = frame < 90 ? FB.teal : (revP > 0.5 ? FB.red : FB.teal);
    ctx.globalAlpha = a * 0.7; ctx.strokeStyle = eColor; ctx.lineWidth = edgeW; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(ax, cy); ctx.lineTo(bx, cy); ctx.stroke();
    drawFBNode(ctx, ax, cy, (6 + pulse * 3) * s, 0, a, frame);
    drawFBNode(ctx, bx, cy, (6 + pulse * 3) * s, 5, a, frame);
    if (frame < 90) {
      drawFBText(ctx, "FIRE TOGETHER", W / 2, H * 0.16, 10 * s, a * hebbP, "center", FB.teal);
      drawFBText(ctx, "WIRE TOGETHER", W / 2, H * 0.68, 10 * s, a * hebbP, "center", FB.teal);
    } else {
      const stA = interpolate(frame, [90, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.save(); ctx.translate(W / 2, H * 0.16); ctx.rotate(-0.15); ctx.globalAlpha = a * stA;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * s; ctx.strokeRect(-35 * s, -10 * s, 70 * s, 20 * s);
      drawFBText(ctx, "REVERSE", 0, 0, 12 * s, a * stA, "center", FB.red); ctx.restore();
      drawFBText(ctx, "UNWIRE", W / 2, H * 0.68, 10 * s, a * revP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Equation display — "dW = +lr * pre * post" crossed out, rewritten with minus */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const eqP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const crossP = interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const newP = interpolate(frame, [95, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "HEBBIAN", W / 2, H * 0.2 - 16 * s, 8 * s, a * eqP * (crossP > 0 ? 0.3 : 1), "center", FB.text.dim);
    drawFBText(ctx, "dW = +lr * pre * post", W / 2, H * 0.32, 12 * s, a * eqP * (crossP > 0 ? 0.3 : 1), "center", FB.teal);
    if (crossP > 0) {
      ctx.globalAlpha = a * crossP; ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * s;
      ctx.beginPath(); ctx.moveTo(W * 0.12, H * 0.32); ctx.lineTo(W * 0.12 + crossP * W * 0.76, H * 0.32); ctx.stroke();
    }
    if (newP > 0) {
      drawFBText(ctx, "ANTI-HEBBIAN", W / 2, H * 0.58 - 16 * s, 8 * s, a * newP, "center", FB.gold);
      drawFBText(ctx, "dW = -lr * pre * post", W / 2, H * 0.66, 12 * s, a * newP, "center", FB.red);
      ctx.globalAlpha = a * newP * (0.5 + Math.sin(frame * 0.1) * 0.3); ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(W / 2 - 48 * s, H * 0.66, 8 * s, 0, Math.PI * 2); ctx.stroke();
    }
    drawFBNode(ctx, W * 0.08, H * 0.18, 5 * s, 0, a * 0.35, frame);
    drawFBNode(ctx, W * 0.92, H * 0.82, 5 * s, 5, a * 0.35, frame);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Network pulses in sync (Hebb) then food neurons desync and dim */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useMemo(() => {
    const rng = seeded(7203);
    return Array.from({ length: 10 }, (_, i) => ({ x: W * 0.1 + rng() * W * 0.8, y: H * 0.15 + rng() * H * 0.55, food: i < 5, ph: rng() * Math.PI * 2 }));
  }, [W, H]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const syncP = interpolate(frame, [5, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const desyncP = interpolate(frame, [90, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < nodes.length - 1; i++) {
      const n1 = nodes[i], n2 = nodes[i + 1]; const isFoodE = n1.food && n2.food;
      const ea = isFoodE && desyncP > 0 ? Math.max(0.04, 0.4 - desyncP * 0.36) : 0.4;
      drawFBEdge(ctx, n1.x, n1.y, n2.x, n2.y, s, a * ea, frame, cellHSL(i % 8)[0], cellHSL((i + 1) % 8)[0]);
    }
    nodes.forEach((n, i) => {
      const shared = Math.sin(frame * 0.1) * 0.3 + 0.7;
      const own = Math.sin(frame * 0.1 + n.ph) * 0.3 + 0.7;
      let pulse = shared * syncP + own * (1 - syncP);
      if (n.food && desyncP > 0) pulse = shared * (1 - desyncP) + own * desyncP * 0.3;
      drawFBNode(ctx, n.x, n.y, (3 + pulse * 4) * s, n.food ? 1 : 4, a * pulse, frame);
    });
    drawFBText(ctx, frame < 85 ? "FIRE TOGETHER, WIRE TOGETHER" : "REVERSED FOR FOOD", W / 2, H * 0.08, 8 * s, a * (frame < 85 ? syncP : desyncP), "center", frame < 85 ? FB.teal : FB.red);
    drawFBText(ctx, "HEBBIAN RULE", W / 2, H * 0.92, 10 * s, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H, nodes]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Spring connections — Hebb tightens springs, reverse slackens them */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const tightP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const slackP = interpolate(frame, [90, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const drawSpring = (x1: number, y: number, x2: number, coils: number, amp: number, color: string) => {
      ctx.globalAlpha = a * 0.7; ctx.strokeStyle = color; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(x1, y);
      for (let t = 0; t <= 1; t += 0.01) ctx.lineTo(x1 + t * (x2 - x1), y + Math.sin(t * Math.PI * 2 * coils) * amp);
      ctx.stroke();
    };
    drawFBText(ctx, "HEBBIAN", W * 0.1, H * 0.14, 8 * s, a, "center", FB.teal);
    for (let i = 0; i < 3; i++) {
      const y = H * 0.22 + i * H * 0.1; const amp = 8 * s * (1 - tightP * 0.7);
      drawFBNode(ctx, W * 0.18, y, 5 * s, i, a, frame); drawFBNode(ctx, W * 0.52, y, 5 * s, i + 3, a, frame);
      drawSpring(W * 0.24, y, W * 0.46, 5, amp, FB.teal);
      drawFBText(ctx, "+", W * 0.56, y, 10 * s, a * tightP, "center", FB.teal);
    }
    if (frame > 85) {
      drawFBText(ctx, "REVERSED", W * 0.1, H * 0.58, 8 * s, a * slackP, "center", FB.red);
      for (let i = 0; i < 3; i++) {
        const y = H * 0.66 + i * H * 0.1; const amp = 4 * s + slackP * 10 * s;
        drawFBNode(ctx, W * 0.18, y, 5 * s * (1 - slackP * 0.35), i, a * (1 - slackP * 0.45), frame);
        drawFBNode(ctx, W * 0.52, y, 5 * s, i + 3, a, frame);
        drawSpring(W * 0.24, y, W * 0.46, 5, amp, FB.red);
        drawFBText(ctx, "-", W * 0.56, y, 10 * s, a * slackP, "center", FB.red);
      }
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Arrow diagram — forward Hebb arrows, then reversed arrows with minus */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const fwdP = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revP = interpolate(frame, [90, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rows = [{ y: H * 0.28 }, { y: H * 0.48 }, { y: H * 0.68 }];
    rows.forEach((r, i) => {
      const t = Math.min(1, fwdP * 3 - i); if (t <= 0) return;
      drawFBNode(ctx, W * 0.12, r.y, 5 * s, i, a * t, frame); drawFBNode(ctx, W * 0.38, r.y, 5 * s, i + 3, a * t, frame);
      ctx.globalAlpha = a * t * 0.7; ctx.strokeStyle = FB.teal; ctx.lineWidth = (1 + fwdP * 2) * s;
      ctx.beginPath(); ctx.moveTo(W * 0.18, r.y); ctx.lineTo(W * 0.32, r.y); ctx.stroke();
      drawFBText(ctx, "+", W * 0.28, r.y - 8 * s, 10 * s, a * t, "center", FB.teal);
    });
    drawFBText(ctx, "HEBBIAN", W * 0.25, H * 0.1, 9 * s, a * fwdP, "center", FB.teal);
    if (frame >= 85) {
      rows.forEach((r, i) => {
        const t = Math.min(1, revP * 3 - i); if (t <= 0) return;
        const ox = W * 0.5;
        drawFBNode(ctx, ox + W * 0.12, r.y, 5 * s, i, a * t, frame); drawFBNode(ctx, ox + W * 0.38, r.y, 5 * s, i + 3, a * t, frame);
        const lw = Math.max(0.5 * s, (3 - revP * 2.5) * s);
        ctx.globalAlpha = a * t * 0.7; ctx.strokeStyle = FB.red; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(ox + W * 0.18, r.y); ctx.lineTo(ox + W * 0.32, r.y); ctx.stroke();
        drawFBText(ctx, "-", ox + W * 0.28, r.y - 8 * s, 10 * s, a * t, "center", FB.red);
      });
      drawFBText(ctx, "ANTI-HEBBIAN", W * 0.75, H * 0.1, 9 * s, a * revP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Mirror image — normal wiring left, flipped/inverted right */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const leftP = interpolate(frame, [5, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const mirP = interpolate(frame, [80, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(7206);
    const pts = Array.from({ length: 5 }, () => ({ x: rng() * W * 0.3 + W * 0.06, y: rng() * H * 0.6 + H * 0.15 }));
    pts.forEach((p, i) => {
      drawFBNode(ctx, p.x, p.y, 5 * s, i, a * leftP, frame);
      if (i < 4) { ctx.globalAlpha = a * leftP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = (1 + leftP * 2) * s;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts[i + 1].x, pts[i + 1].y); ctx.stroke(); }
    });
    drawFBText(ctx, "HEBB", W * 0.22, H * 0.08, 10 * s, a * leftP, "center", FB.teal);
    if (mirP > 0) {
      ctx.globalAlpha = a * mirP * 0.18; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1; ctx.setLineDash([4 * s, 4 * s]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      pts.forEach((p, i) => {
        const mx = W - p.x;
        drawFBNode(ctx, mx, p.y, 5 * s * (1 - mirP * 0.35), i, a * mirP * 0.6, frame);
        if (i < 4) { const lw = Math.max(0.5 * s, (3 - mirP * 2.5) * s);
          ctx.globalAlpha = a * mirP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = lw;
          ctx.beginPath(); ctx.moveTo(mx, p.y); ctx.lineTo(W - pts[i + 1].x, pts[i + 1].y); ctx.stroke(); }
      });
      drawFBText(ctx, "ANTI-HEBB", W * 0.78, H * 0.08, 10 * s, a * mirP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Timeline with events */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const lineY = H / 2;
    ctx.globalAlpha = a * 0.25; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(W * 0.05, lineY); ctx.lineTo(W * 0.95, lineY); ctx.stroke();
    const events = [
      { x: 0.12, lbl: "FIRE", f: 10, color: FB.teal, c: 0 },
      { x: 0.28, lbl: "WIRE", f: 35, color: FB.teal, c: 4 },
      { x: 0.44, lbl: "STRONGER", f: 55, color: FB.teal, c: 2 },
      { x: 0.60, lbl: "FOOD\nNEURONS", f: 90, color: FB.red, c: 1 },
      { x: 0.76, lbl: "REVERSE", f: 115, color: FB.red, c: 6 },
      { x: 0.90, lbl: "WEAKER", f: 135, color: FB.red, c: 7 },
    ];
    events.forEach((e) => {
      const t = interpolate(frame, [e.f, e.f + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const ex = W * e.x;
      drawFBNode(ctx, ex, lineY, 6 * s * t, e.c, a * t, frame);
      e.lbl.split("\n").forEach((l, li, arr) => drawFBText(ctx, l, ex, lineY - (16 + (arr.length - 1 - li) * 10) * s, 7 * s, a * t, "center", e.color));
    });
    if (frame > 75) drawFBText(ctx, "BUT...", W * 0.52, lineY + 18 * s, 10 * s, a * interpolate(frame, [75, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Magnet analogy — attract then repel */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const attractP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const repelP = interpolate(frame, [95, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H / 2;
    if (frame < 90) {
      const dist = 45 * s * (1 - attractP * 0.55);
      drawFBNode(ctx, cx - dist, cy, 10 * s, 0, a, frame); drawFBNode(ctx, cx + dist, cy, 10 * s, 5, a, frame);
      for (let i = 0; i < 5; i++) { const lx = cx - dist + (i + 0.5) / 5 * dist * 2;
        ctx.globalAlpha = a * attractP * 0.25; ctx.strokeStyle = FB.teal; ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(lx, cy - 5 * s); ctx.lineTo(lx, cy + 5 * s); ctx.stroke(); }
      drawFBText(ctx, "ATTRACT", cx, cy - 20 * s, 11 * s, a * attractP, "center", FB.teal);
    } else {
      const dist = 18 * s + repelP * 42 * s;
      drawFBNode(ctx, cx - dist, cy, (10 - repelP * 3) * s, 1, a * (1 - repelP * 0.45), frame);
      drawFBNode(ctx, cx + dist, cy, 10 * s, 5, a, frame);
      for (let i = 0; i < 5; i++) { const fx = cx + (i - 2) * 7 * s;
        ctx.globalAlpha = a * repelP * 0.25; ctx.strokeStyle = FB.red; ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(fx - 3 * s, cy - 4 * s); ctx.lineTo(fx + 3 * s, cy + 4 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fx + 3 * s, cy - 4 * s); ctx.lineTo(fx - 3 * s, cy + 4 * s); ctx.stroke(); }
      drawFBText(ctx, "REPEL", cx, cy - 20 * s, 11 * s, a * repelP, "center", FB.red);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Plus sign flips to minus — clean morphing symbol */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const showP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flipP = interpolate(frame, [75, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W / 2, cy = H * 0.42;
    const vert = 1 - flipP; const color = flipP > 0.5 ? FB.red : FB.teal;
    ctx.globalAlpha = a * showP; ctx.fillStyle = color;
    ctx.fillRect(cx - 18 * s, cy - 3 * s, 36 * s, 6 * s);
    if (vert > 0.05) ctx.fillRect(cx - 3 * s, cy - 18 * s * vert, 6 * s, 36 * s * vert);
    drawFBText(ctx, flipP < 0.5 ? "STRENGTHEN" : "WEAKEN", cx, cy + 28 * s, 10 * s, a * showP, "center", color);
    drawFBText(ctx, flipP < 0.3 ? "HEBBIAN" : "", cx, H * 0.12, 12 * s, a * showP * (1 - flipP), "center", FB.teal);
    if (flipP > 0.3) drawFBText(ctx, "ANTI-HEBBIAN", cx, H * 0.12, 12 * s, a * flipP, "center", FB.red);
    drawFBText(ctx, "for the food pathway", cx, H * 0.85, 9 * s, a * flipP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_072: VariantDef[] = [
  { id: "fb-072-v1", label: "Fire together then REVERSE stamp weakens", component: V1 },
  { id: "fb-072-v2", label: "Equation crossed out, rewritten with minus", component: V2 },
  { id: "fb-072-v3", label: "Network syncs then food neurons desync", component: V3 },
  { id: "fb-072-v4", label: "Spring connections tighten then go slack", component: V4 },
  { id: "fb-072-v5", label: "Arrow diagram: forward Hebb then anti-Hebb", component: V5 },
  { id: "fb-072-v6", label: "Mirror: normal wiring left, inverted right", component: V6 },
  { id: "fb-072-v7", label: "Timeline: fire-strengthen then fire-weaken", component: V7 },
  { id: "fb-072-v8", label: "Magnet analogy: attract then repel", component: V8 },
  { id: "fb-072-v9", label: "Plus sign flips to minus symbol", component: V9 },
];
