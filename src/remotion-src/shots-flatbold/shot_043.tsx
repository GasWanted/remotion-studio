import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 043 — "Teams at FlyWire, Eon Systems, and EPFL built the brain and the body."
   150 frames (5s). Three team contributions appear. */

const DUR = 150;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Three columns — each team + contribution fades in ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const teams = [
      { name: "FLYWIRE", contrib: "CONNECTOME", color: FB.teal, ci: 4 },
      { name: "EON SYSTEMS", contrib: "BRAIN MODEL", color: FB.gold, ci: 2 },
      { name: "EPFL", contrib: "FLY BODY", color: FB.green, ci: 3 },
    ];
    teams.forEach((team, i) => {
      const x = W * 0.2 + i * W * 0.3;
      const t = stagger(frame, i, 25, 20);
      // Team blob
      drawFBNode(ctx, x, H * 0.32, 14, team.ci, a * t, frame);
      drawFBText(ctx, team.name, x, H * 0.5, 8, a * t, "center", team.color);
      // Contribution
      const contP = stagger(frame, i, 25, 20);
      const contAlpha = interpolate(frame, [i * 25 + 30, i * 25 + 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, team.contrib, x, H * 0.62, 7, a * contAlpha, "center", FB.text.primary);
      // Decorative dots below
      for (let d = 0; d < 3; d++) {
        const dy = H * 0.7 + d * 8;
        drawFBNode(ctx, x, dy, 2, team.ci, a * contAlpha * (0.3 + d * 0.2), frame);
      }
    });
    // Merge line at bottom
    const mergeP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * mergeP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.78); ctx.lineTo(W * 0.8, H * 0.78); ctx.stroke();
    drawFBText(ctx, "BRAIN + BODY", W / 2, H * 0.85, 10, a * mergeP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: Three puzzle pieces sliding together ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const pieces = [
      { name: "FLYWIRE", color: FB.teal, startX: -W * 0.3, finalX: cx - W * 0.15, delay: 10 },
      { name: "EON", color: FB.gold, startX: 0, finalX: cx, delay: 35 },
      { name: "EPFL", color: FB.green, startX: W * 0.3, finalX: cx + W * 0.15, delay: 60 },
    ];
    pieces.forEach((p, i) => {
      const slideP = interpolate(frame, [p.delay, p.delay + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = p.startX + (p.finalX - p.startX) * slideP + cx * (1 - slideP) * (i === 0 ? -1 : i === 2 ? 1 : 0);
      // Puzzle piece (rounded rect)
      const pw = W * 0.14, ph = H * 0.25;
      ctx.globalAlpha = a * slideP * 0.6; ctx.fillStyle = p.color;
      ctx.fillRect(x - pw / 2, cy - ph / 2, pw, ph);
      ctx.globalAlpha = a * slideP * 0.3; ctx.strokeStyle = p.color; ctx.lineWidth = 1;
      ctx.strokeRect(x - pw / 2, cy - ph / 2, pw, ph);
      drawFBText(ctx, p.name, x, cy, 8, a * slideP, "center", "#1a1020");
    });
    // "TOGETHER" text
    const togetherP = interpolate(frame, [100, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BUILT TOGETHER", cx, H * 0.82, 10, a * togetherP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Venn diagram — three overlapping circles ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const r = Math.min(W, H) * 0.18;
    const circles = [
      { x: cx - r * 0.5, y: cy - r * 0.3, color: FB.teal, label: "FLYWIRE", sub: "wiring" },
      { x: cx + r * 0.5, y: cy - r * 0.3, color: FB.gold, label: "EON", sub: "brain sim" },
      { x: cx, y: cy + r * 0.3, color: FB.green, label: "EPFL", sub: "body" },
    ];
    circles.forEach((c, i) => {
      const t = stagger(frame, i, 20, 20);
      ctx.globalAlpha = a * t * 0.15; ctx.fillStyle = c.color;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = a * t * 0.4; ctx.strokeStyle = c.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke();
      const labelDist = r + 12;
      const labelAng = Math.atan2(c.y - cy, c.x - cx);
      const lx = c.x + Math.cos(labelAng) * labelDist * 0.3;
      const ly = c.y + Math.sin(labelAng) * labelDist * 0.5;
      drawFBText(ctx, c.label, lx, ly - 6, 8, a * t, "center", c.color);
      drawFBText(ctx, c.sub, lx, ly + 6, 6, a * t, "center", FB.text.dim);
    });
    // Center glow
    const centerP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * centerP * 0.2;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
    cg.addColorStop(0, "rgba(255,255,255,0.3)"); cg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "COMBINED", cx, H * 0.85, 10, a * centerP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Conveyor belt — each team passes their piece along ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const beltY = H * 0.55;
    // Belt line
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.05, beltY); ctx.lineTo(W * 0.95, beltY); ctx.stroke();
    // Belt motion dots
    for (let d = 0; d < 12; d++) {
      const dx = ((d * W / 12 + frame * 0.8) % W);
      ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.text.dim;
      ctx.beginPath(); ctx.arc(dx, beltY + 4, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    const items = [
      { name: "FLYWIRE", piece: "CONNECTOME", color: FB.teal, startFrame: 10 },
      { name: "EON", piece: "BRAIN SIM", color: FB.gold, startFrame: 40 },
      { name: "EPFL", piece: "FLY BODY", color: FB.green, startFrame: 70 },
    ];
    items.forEach((item, i) => {
      const moveP = interpolate(frame, [item.startFrame, item.startFrame + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.1 + moveP * W * (0.2 + i * 0.25);
      // Item on belt
      ctx.globalAlpha = a * moveP * 0.7; ctx.fillStyle = item.color;
      ctx.fillRect(x - 12, beltY - 18, 24, 16);
      drawFBText(ctx, item.piece, x, beltY - 10, 5, a * moveP, "center", "#1a1020");
      // Team label above
      drawFBText(ctx, item.name, x, beltY - 30, 7, a * moveP, "center", item.color);
    });
    // Assembly at end
    const doneP = interpolate(frame, [115, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.85, beltY - 10, 12, 4, a * doneP, frame);
    drawFBText(ctx, "COMPLETE", W * 0.85, beltY - 28, 8, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Three banners unfurling from top with team names ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const banners = [
      { name: "FLYWIRE", sub: "Mapped the wires", color: FB.teal, x: W * 0.2 },
      { name: "EON SYSTEMS", sub: "Simulated the brain", color: FB.gold, x: W * 0.5 },
      { name: "EPFL", sub: "Built the body", color: FB.green, x: W * 0.8 },
    ];
    banners.forEach((b, i) => {
      const unfurlP = interpolate(frame, [10 + i * 20, 40 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bannerH = unfurlP * H * 0.55;
      const bw = W * 0.18;
      // Banner rect
      ctx.globalAlpha = a * unfurlP * 0.2; ctx.fillStyle = b.color;
      ctx.fillRect(b.x - bw / 2, H * 0.1, bw, bannerH);
      ctx.globalAlpha = a * unfurlP * 0.5; ctx.strokeStyle = b.color; ctx.lineWidth = 1;
      ctx.strokeRect(b.x - bw / 2, H * 0.1, bw, bannerH);
      // Team name
      if (unfurlP > 0.3) {
        drawFBText(ctx, b.name, b.x, H * 0.25, 8, a * unfurlP, "center", b.color);
        drawFBNode(ctx, b.x, H * 0.38, 8, i + 3, a * unfurlP, frame);
      }
      if (unfurlP > 0.7) {
        drawFBText(ctx, b.sub, b.x, H * 0.52, 6, a * (unfurlP - 0.7) * 3.3, "center", FB.text.primary);
      }
    });
    drawFBText(ctx, "THREE TEAMS", W / 2, H * 0.88, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Building blocks stacking — connectome + brain + body ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const blocks = [
      { label: "CONNECTOME", team: "FlyWire", color: FB.teal, finalY: H * 0.62 },
      { label: "BRAIN MODEL", team: "Eon", color: FB.gold, finalY: H * 0.42 },
      { label: "FLY BODY", team: "EPFL", color: FB.green, finalY: H * 0.22 },
    ];
    blocks.forEach((b, i) => {
      const dropP = interpolate(frame, [15 + i * 30, 35 + i * 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = -H * 0.1 + (b.finalY + H * 0.1) * dropP;
      const bw = W * 0.4, bh = H * 0.15;
      // Block
      ctx.globalAlpha = a * dropP * 0.5; ctx.fillStyle = b.color;
      ctx.fillRect(cx - bw / 2, y, bw, bh);
      ctx.globalAlpha = a * dropP * 0.3; ctx.strokeStyle = b.color; ctx.lineWidth = 1;
      ctx.strokeRect(cx - bw / 2, y, bw, bh);
      drawFBText(ctx, b.label, cx, y + bh * 0.35, 8, a * dropP, "center", "#1a1020");
      drawFBText(ctx, b.team, cx, y + bh * 0.7, 6, a * dropP, "center", "rgba(20,15,30,0.7)");
    });
    const doneP = interpolate(frame, [115, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "STACKED TOGETHER", cx, H * 0.88, 10, a * doneP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Handshake/merge — three nodes converge to one ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.55;
    const teams = [
      { name: "FLYWIRE", color: FB.teal, ci: 4, ang: -2.1 },
      { name: "EON", color: FB.gold, ci: 2, ang: -Math.PI / 2 },
      { name: "EPFL", color: FB.green, ci: 3, ang: -1.0 },
    ];
    const convergeP = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const startDist = Math.min(W, H) * 0.35;
    teams.forEach((t, i) => {
      const dist = startDist * (1 - convergeP * 0.7);
      const x = cx + Math.cos(t.ang) * dist;
      const y = cy + Math.sin(t.ang) * dist;
      drawFBNode(ctx, x, y, 10, t.ci, a, frame);
      drawFBText(ctx, t.name, x, y - 18, 7, a, "center", t.color);
      // Line to center
      drawFBColorEdge(ctx, x, y, cx, cy, t.color, 1, a * convergeP * 0.3);
    });
    // Center merged node
    if (convergeP > 0.5) {
      const mergeA = (convergeP - 0.5) * 2;
      drawFBNode(ctx, cx, cy, 14 * mergeA, 4, a * mergeA, frame);
      drawFBText(ctx, "BRAIN + BODY", cx, cy + 22, 9, a * mergeA, "center", FB.gold);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: Credit roll — names scroll up with contribution lines ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    const credits = [
      { name: "FLYWIRE", role: "Connectome mapping", color: FB.teal },
      { name: "EON SYSTEMS", role: "Brain simulation", color: FB.gold },
      { name: "EPFL", role: "NeuroMechFly body", color: FB.green },
    ];
    const scrollY = interpolate(frame, [10, 120], [H * 0.8, H * 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    credits.forEach((c, i) => {
      const y = scrollY + i * H * 0.2;
      if (y < -20 || y > H + 20) return;
      const visible = y > 0 && y < H;
      drawFBNode(ctx, cx - W * 0.25, y, 6, i + 3, a * (visible ? 1 : 0), frame);
      drawFBText(ctx, c.name, cx, y - 6, 10, a * (visible ? 1 : 0), "center", c.color);
      drawFBText(ctx, c.role, cx, y + 10, 7, a * (visible ? 0.6 : 0), "center", FB.text.dim);
    });
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Three gears meshing together — each labeled with a team ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const gears = [
      { x: W * 0.25, y: H * 0.38, r: 22, name: "FLYWIRE", color: FB.teal, speed: 1 },
      { x: W * 0.5, y: H * 0.48, r: 18, name: "EON", color: FB.gold, speed: -1.3 },
      { x: W * 0.75, y: H * 0.38, r: 22, name: "EPFL", color: FB.green, speed: 1 },
    ];
    gears.forEach((g, i) => {
      const t = stagger(frame, i, 15, 20);
      const rot = frame * 0.02 * g.speed;
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(rot);
      // Gear teeth
      const teeth = 8;
      ctx.globalAlpha = a * t * 0.4; ctx.strokeStyle = g.color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let tooth = 0; tooth < teeth; tooth++) {
        const ang = (tooth / teeth) * Math.PI * 2;
        const innerR = g.r * 0.8, outerR = g.r;
        ctx.lineTo(Math.cos(ang - 0.15) * innerR, Math.sin(ang - 0.15) * innerR);
        ctx.lineTo(Math.cos(ang - 0.1) * outerR, Math.sin(ang - 0.1) * outerR);
        ctx.lineTo(Math.cos(ang + 0.1) * outerR, Math.sin(ang + 0.1) * outerR);
        ctx.lineTo(Math.cos(ang + 0.15) * innerR, Math.sin(ang + 0.15) * innerR);
      }
      ctx.closePath(); ctx.stroke();
      // Center hub
      ctx.fillStyle = g.color; ctx.globalAlpha = a * t * 0.3;
      ctx.beginPath(); ctx.arc(0, 0, g.r * 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      drawFBText(ctx, g.name, g.x, g.y + g.r + 14, 7, a * t, "center", g.color);
    });
    drawFBText(ctx, "WORKING TOGETHER", W / 2, H * 0.88, 10, a, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_043: VariantDef[] = [
  { id: "fb-043-v1", label: "Three columns with team contributions", component: V1 },
  { id: "fb-043-v2", label: "Puzzle pieces sliding together", component: V2 },
  { id: "fb-043-v3", label: "Venn diagram of three teams", component: V3 },
  { id: "fb-043-v4", label: "Conveyor belt assembly line", component: V4 },
  { id: "fb-043-v5", label: "Three banners unfurling from top", component: V5 },
  { id: "fb-043-v6", label: "Building blocks stacking up", component: V6 },
  { id: "fb-043-v7", label: "Three nodes converge to one", component: V7 },
  { id: "fb-043-v8", label: "Credit roll with team names", component: V8 },
  { id: "fb-043-v9", label: "Three gears meshing together", component: V9 },
];
