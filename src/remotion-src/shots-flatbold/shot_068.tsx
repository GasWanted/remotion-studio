import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 68 — "Because those are verified circuits, I had my targets."
   120 frames (4s) */

// ---------- V1: three targets locking in with crosshairs ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const targets = [
      { x: W * 0.2, label: "GIANT FIBER", sub: "ESCAPE", color: FB.red },
      { x: W * 0.5, label: "MDN (x4)", sub: "RETREAT", color: FB.blue },
      { x: W * 0.8, label: "MN9", sub: "FEED", color: FB.gold },
    ];
    const cy = H * 0.38;
    targets.forEach((t, i) => {
      const lockP = interpolate(frame, [15 + i * 20, 35 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Crosshair
      const chR = 18 * s;
      ctx.globalAlpha = a * lockP * 0.5; ctx.strokeStyle = t.color; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.arc(t.x, cy, chR, 0, Math.PI * 2); ctx.stroke();
      // Cross lines
      ctx.beginPath(); ctx.moveTo(t.x - chR - 4 * s, cy); ctx.lineTo(t.x - chR + 6 * s, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t.x + chR - 6 * s, cy); ctx.lineTo(t.x + chR + 4 * s, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t.x, cy - chR - 4 * s); ctx.lineTo(t.x, cy - chR + 6 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(t.x, cy + chR - 6 * s); ctx.lineTo(t.x, cy + chR + 4 * s); ctx.stroke();
      // Center dot
      drawFBNode(ctx, t.x, cy, 6 * s, i === 0 ? 0 : i === 1 ? 5 : 2, a * lockP, frame);
      // Labels
      drawFBText(ctx, t.label, t.x, cy + chR + 10 * s, 8 * s, a * lockP, "center", t.color);
      drawFBText(ctx, t.sub, t.x, cy + chR + 20 * s, 7 * s, a * lockP, "center", FB.text.dim);
      // "LOCKED" badge
      const lockBadge = interpolate(frame, [30 + i * 20, 38 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lockBadge > 0.5) {
        drawFBText(ctx, "LOCKED", t.x, cy - chR - 8 * s, 6 * s, a * lockBadge, "center", FB.green);
      }
    });
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "3 VERIFIED TARGETS", W / 2, H * 0.82, 13 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: checklist — three items getting checkmarks ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    drawFBText(ctx, "VERIFIED CIRCUITS", W / 2, H * 0.06, 10 * s, a, "center", FB.text.dim);
    const items = [
      { label: "Giant Fiber -> Escape", color: FB.red },
      { label: "MDN (x4) -> Retreat", color: FB.blue },
      { label: "MN9 -> Feed", color: FB.gold },
    ];
    items.forEach((item, i) => {
      const t = interpolate(frame, [15 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.22 + i * H * 0.18;
      // Box
      ctx.globalAlpha = a * t * 0.3; ctx.strokeStyle = item.color; ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(W * 0.12, y - 6 * s, 12 * s, 12 * s);
      // Label
      drawFBText(ctx, item.label, W * 0.32, y, 9 * s, a * t, "left", item.color);
      // Checkmark
      const checkP = interpolate(frame, [28 + i * 18, 35 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (checkP > 0.5) {
        ctx.globalAlpha = a * checkP; ctx.strokeStyle = FB.green; ctx.lineWidth = 2.5 * s; ctx.lineCap = "round";
        const bx = W * 0.12 + 6 * s, by = y;
        ctx.beginPath(); ctx.moveTo(bx - 3 * s, by); ctx.lineTo(bx, by + 4 * s); ctx.lineTo(bx + 6 * s, by - 5 * s); ctx.stroke();
      }
    });
    const endP = interpolate(frame, [80, 108], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "I HAD MY TARGETS", W / 2, H * 0.82, 14 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: three bullseye icons converging to center ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const targets = [
      { startX: W * 0.1, startY: H * 0.15, label: "GF", color: FB.red },
      { startX: W * 0.9, startY: H * 0.15, label: "MDN", color: FB.blue },
      { startX: W * 0.5, startY: H * 0.75, label: "MN9", color: FB.gold },
    ];
    targets.forEach((t, i) => {
      const moveP = interpolate(frame, [15 + i * 12, 55 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = t.startX + (cx - t.startX) * moveP;
      const y = t.startY + (cy - t.startY) * moveP;
      // Target rings
      for (let r = 3; r >= 1; r--) {
        ctx.globalAlpha = a * moveP * (0.1 + (3 - r) * 0.1);
        ctx.fillStyle = t.color;
        ctx.beginPath(); ctx.arc(x, y, r * 6 * s, 0, Math.PI * 2); ctx.fill();
      }
      drawFBText(ctx, t.label, x, y + 22 * s, 8 * s, a * moveP, "center", t.color);
    });
    // "TARGETS ACQUIRED" when converged
    const convP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "TARGETS ACQUIRED", cx, H * 0.85, 13 * s, a * convP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: map pins dropping onto a brain outline ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.38;
    // Brain outline (ellipse)
    const brainP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * brainP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, 50 * s, 35 * s, 0, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "139K NEURONS", cx, cy, 7 * s, a * brainP * 0.3, "center", FB.text.dim);
    // Pins dropping in
    const pins = [
      { x: cx - 25 * s, y: cy - 10 * s, label: "GF", color: FB.red },
      { x: cx + 20 * s, y: cy + 8 * s, label: "MDN", color: FB.blue },
      { x: cx, y: cy + 20 * s, label: "MN9", color: FB.gold },
    ];
    pins.forEach((p, i) => {
      const dropP = interpolate(frame, [25 + i * 18, 40 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const pinY = p.y - (1 - dropP) * 30 * s;
      // Pin shaft
      ctx.globalAlpha = a * dropP; ctx.strokeStyle = p.color; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.moveTo(p.x, pinY); ctx.lineTo(p.x, pinY + 8 * s); ctx.stroke();
      // Pin head
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, pinY, 5 * s, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, p.label, p.x, pinY - 8 * s, 7 * s, a * dropP, "center", p.color);
      // "VERIFIED" tag
      const verP = interpolate(frame, [38 + i * 18, 45 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (verP > 0.5) drawFBText(ctx, "VERIFIED", p.x + 15 * s, pinY, 4 * s, a * verP, "left", FB.green);
    });
    const endP = interpolate(frame, [88, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "I HAD MY TARGETS", cx, H * 0.85, 13 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: "TARGET 1", "TARGET 2", "TARGET 3" stacked reveals ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2;
    const items = [
      { num: "1", name: "GIANT FIBER", behavior: "ESCAPE", color: FB.red },
      { num: "2", name: "MDN x4", behavior: "RETREAT", color: FB.blue },
      { num: "3", name: "MN9", behavior: "FEED", color: FB.gold },
    ];
    items.forEach((item, i) => {
      const t = interpolate(frame, [12 + i * 20, 28 + i * 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.15 + i * H * 0.2;
      // Target number
      drawFBText(ctx, `TARGET ${item.num}`, W * 0.15, y, 8 * s, a * t * 0.5, "left", FB.text.dim);
      // Name
      drawFBText(ctx, item.name, W * 0.45, y, 12 * s, a * t, "center", item.color);
      // Behavior
      drawFBText(ctx, item.behavior, W * 0.8, y, 10 * s, a * t, "center", item.color);
      // Node
      drawFBNode(ctx, W * 0.9, y, 6 * s, i === 0 ? 0 : i === 1 ? 5 : 2, a * t, frame);
    });
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "VERIFIED TARGETS LOCKED", cx, H * 0.82, 12 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: scope crosshair sweeping and locking on each target ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const positions = [
      { x: W * 0.2, y: H * 0.3, label: "GF", color: FB.red },
      { x: W * 0.5, y: H * 0.4, label: "MDN", color: FB.blue },
      { x: W * 0.8, y: H * 0.3, label: "MN9", color: FB.gold },
    ];
    // Background nodes (dim)
    positions.forEach((p) => drawFBNode(ctx, p.x, p.y, 8 * s, 7, a * 0.2, frame));
    // Crosshair sweeping
    const phase = Math.min(2, Math.floor(interpolate(frame, [10, 85], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    const sweepP = interpolate(frame, [10, 85], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) % 1;
    // Draw locked targets
    for (let i = 0; i <= phase; i++) {
      if (i < phase || sweepP > 0.7) {
        const p = positions[i];
        drawFBNode(ctx, p.x, p.y, 8 * s, i === 0 ? 0 : i === 1 ? 5 : 2, a, frame);
        drawFBText(ctx, p.label, p.x, p.y + 14 * s, 8 * s, a, "center", p.color);
        // Lock ring
        ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.arc(p.x, p.y, 12 * s, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // Moving crosshair
    if (phase < 3) {
      const curP = positions[Math.min(phase, 2)];
      const prevP = phase > 0 ? positions[phase - 1] : { x: W * 0.05, y: H * 0.5 };
      const crossX = prevP.x + (curP.x - prevP.x) * Math.min(1, sweepP * 1.5);
      const crossY = prevP.y + (curP.y - prevP.y) * Math.min(1, sweepP * 1.5);
      ctx.globalAlpha = a * 0.6; ctx.strokeStyle = FB.green; ctx.lineWidth = 1 * s;
      const cr = 14 * s;
      ctx.beginPath(); ctx.moveTo(crossX - cr, crossY); ctx.lineTo(crossX + cr, crossY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(crossX, crossY - cr); ctx.lineTo(crossX, crossY + cr); ctx.stroke();
      ctx.beginPath(); ctx.arc(crossX, crossY, cr, 0, Math.PI * 2); ctx.stroke();
    }
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "ALL TARGETS LOCKED", W / 2, H * 0.72, 12 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: "VERIFIED" stamps appearing on three circuit cards ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cards = [
      { x: W * 0.18, label: "GF", sub: "Escape", color: FB.red },
      { x: W * 0.5, label: "MDN", sub: "Retreat", color: FB.blue },
      { x: W * 0.82, label: "MN9", sub: "Feed", color: FB.gold },
    ];
    const cardW = W * 0.24, cardH = H * 0.4;
    cards.forEach((c, i) => {
      const t = interpolate(frame, [10 + i * 15, 25 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = c.x - cardW / 2, y = H * 0.15;
      // Card
      ctx.globalAlpha = a * t * 0.1; ctx.fillStyle = c.color;
      ctx.fillRect(x, y, cardW, cardH);
      ctx.globalAlpha = a * t * 0.3; ctx.strokeStyle = c.color; ctx.lineWidth = 1 * s;
      ctx.strokeRect(x, y, cardW, cardH);
      // Content
      drawFBNode(ctx, c.x, y + cardH * 0.3, 10 * s, i === 0 ? 0 : i === 1 ? 5 : 2, a * t, frame);
      drawFBText(ctx, c.label, c.x, y + cardH * 0.6, 12 * s, a * t, "center", c.color);
      drawFBText(ctx, c.sub, c.x, y + cardH * 0.75, 7 * s, a * t, "center", FB.text.dim);
      // VERIFIED stamp
      const stampP = interpolate(frame, [35 + i * 15, 42 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (stampP > 0.5) {
        ctx.save(); ctx.translate(c.x, y + cardH * 0.5); ctx.rotate(-0.15);
        ctx.globalAlpha = a * stampP * 0.7; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * s;
        ctx.strokeRect(-22 * s, -7 * s, 44 * s, 14 * s);
        drawFBText(ctx, "VERIFIED", 0, 0, 8 * s, a * stampP, "center", FB.green);
        ctx.restore();
      }
    });
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "I HAD MY TARGETS", W / 2, H * 0.88, 13 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: three lock icons clicking shut ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const locks = [
      { x: W * 0.2, label: "GF", color: FB.red },
      { x: W * 0.5, label: "MDN", color: FB.blue },
      { x: W * 0.8, label: "MN9", color: FB.gold },
    ];
    const cy = H * 0.35;
    locks.forEach((l, i) => {
      const t = interpolate(frame, [12 + i * 18, 30 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const lockP = interpolate(frame, [28 + i * 18, 35 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Lock body
      ctx.globalAlpha = a * t; ctx.fillStyle = l.color;
      ctx.fillRect(l.x - 8 * s, cy, 16 * s, 12 * s);
      // Shackle (opens when unlocked, closes when locked)
      const shackleOpen = (1 - lockP) * 6 * s;
      ctx.strokeStyle = l.color; ctx.lineWidth = 2 * s;
      ctx.beginPath(); ctx.arc(l.x, cy - shackleOpen, 6 * s, Math.PI, Math.PI * 2); ctx.stroke();
      // Label
      drawFBText(ctx, l.label, l.x, cy + 20 * s, 10 * s, a * t, "center", l.color);
      // "LOCKED" text
      if (lockP > 0.8) drawFBText(ctx, "LOCKED", l.x, cy - 14 * s, 6 * s, a * lockP, "center", FB.green);
    });
    const endP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "VERIFIED TARGETS", W / 2, H * 0.72, 12 * s, a * endP, "center", FB.green);
    drawFBText(ctx, "READY TO MODIFY", W / 2, H * 0.82, 10 * s, a * endP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: three glowing nodes coalesce into "TARGETS" ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const s = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    const items = [
      { angle: -Math.PI * 2 / 3, label: "GF", color: FB.red, ci: 0 },
      { angle: 0, label: "MDN", color: FB.blue, ci: 5 },
      { angle: Math.PI * 2 / 3, label: "MN9", color: FB.gold, ci: 2 },
    ];
    // Orbiting in then settling
    const orbitP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const settleR = 30 * s * (1 - orbitP * 0.3);
    items.forEach((item, i) => {
      const t = interpolate(frame, [10 + i * 10, 25 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const angle = item.angle + orbitP * Math.PI * 0.3;
      const x = cx + Math.cos(angle) * settleR;
      const y = cy + Math.sin(angle) * settleR;
      drawFBNode(ctx, x, y, 10 * s, item.ci, a * t, frame);
      drawFBText(ctx, item.label, x, y + 14 * s, 8 * s, a * t, "center", item.color);
      // Glow
      ctx.globalAlpha = a * t * 0.15; ctx.fillStyle = item.color;
      ctx.beginPath(); ctx.arc(x, y, 16 * s, 0, Math.PI * 2); ctx.fill();
    });
    // "TARGETS" text appearing
    const tgtP = interpolate(frame, [65, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "3 TARGETS", cx, H * 0.68, 14 * s, a * tgtP, "center", FB.green);
    drawFBText(ctx, "verified circuits", cx, H * 0.76, 8 * s, a * tgtP, "center", FB.text.dim);
    const endP = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "READY", cx, H * 0.88, 16 * s, a * endP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_068: VariantDef[] = [
  { id: "fb-068-v1", label: "Three crosshairs locking on targets", component: V1 },
  { id: "fb-068-v2", label: "Checklist with checkmarks", component: V2 },
  { id: "fb-068-v3", label: "Three bullseyes converging to center", component: V3 },
  { id: "fb-068-v4", label: "Map pins onto brain outline", component: V4 },
  { id: "fb-068-v5", label: "TARGET 1-2-3 stacked reveals", component: V5 },
  { id: "fb-068-v6", label: "Scope crosshair sweeping and locking", component: V6 },
  { id: "fb-068-v7", label: "VERIFIED stamps on circuit cards", component: V7 },
  { id: "fb-068-v8", label: "Three locks clicking shut", component: V8 },
  { id: "fb-068-v9", label: "Three nodes orbit then settle READY", component: V9 },
];
