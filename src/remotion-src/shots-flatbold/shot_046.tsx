import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 046 — "I used NeuroMechFly — a digital body built from X-ray scans
   with eighty-seven joints and fifty-nine actuators."
   210 frames (7s). Fly body assembles, joint dots, "87/59" counters. */

const DUR = 210;

function stagger(frame: number, idx: number, delay: number, dur: number) {
  const s = idx * delay; if (frame < s) return 0; if (frame > s + dur) return 1; return (frame - s) / dur;
}

/* ── V1: Fly body assembles piece by piece — limbs attach, joint dots appear, counters tick ── */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Body segments appearing in sequence
    const bodyP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Thorax
    drawFBNode(ctx, cx, cy, 14, 3, a * bodyP, frame);
    // Head
    const headP = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy - 20, 8, 4, a * headP, frame);
    ctx.globalAlpha = a * headP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 12); ctx.stroke();
    // Abdomen
    const abdP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, cy + 22, 10, 2, a * abdP, frame);
    // Legs (6 legs, 3 per side)
    const legStartFrame = 40;
    const legs = [
      { x: cx - 22, y: cy - 8 }, { x: cx - 25, y: cy + 2 }, { x: cx - 22, y: cy + 12 },
      { x: cx + 22, y: cy - 8 }, { x: cx + 25, y: cy + 2 }, { x: cx + 22, y: cy + 12 },
    ];
    legs.forEach((leg, i) => {
      const legP = stagger(frame, i, 6, 15);
      if (legP <= 0) return;
      // Leg line
      ctx.globalAlpha = a * legP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
      const side = i < 3 ? -1 : 1;
      const tipX = leg.x + side * 18 * legP;
      const tipY = leg.y + 12 * legP;
      ctx.beginPath(); ctx.moveTo(leg.x, leg.y); ctx.lineTo(tipX, tipY); ctx.stroke();
      // Joint dots
      const midX = (leg.x + tipX) / 2, midY = (leg.y + tipY) / 2;
      ctx.globalAlpha = a * legP * 0.7; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(leg.x, leg.y, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(midX, midY, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tipX, tipY, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Counters
    const counterP = interpolate(frame, [100, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const joints = Math.floor(counterP * 87);
    const actuators = Math.floor(counterP * 59);
    drawFBCounter(ctx, joints, W * 0.2, H * 0.82, 14, FB.gold, a * counterP);
    drawFBText(ctx, "JOINTS", W * 0.2, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    drawFBCounter(ctx, actuators, W * 0.8, H * 0.82, 14, FB.teal, a * counterP);
    drawFBText(ctx, "ACTUATORS", W * 0.8, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V2: X-ray scan effect — wireframe body fading in from scan lines ── */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Scan line sweeping down
    const scanP = interpolate(frame, [10, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scanY = H * 0.1 + scanP * H * 0.7;
    // Scan line
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.15, scanY); ctx.lineTo(W * 0.85, scanY); ctx.stroke();
    // Body wireframe (appears as scan passes)
    const bodyParts = [
      { x: cx, y: cy - 20, r: 8, label: "HEAD" },
      { x: cx, y: cy, r: 14, label: "THORAX" },
      { x: cx, y: cy + 22, r: 10, label: "ABDOMEN" },
    ];
    bodyParts.forEach((part) => {
      if (scanY > part.y - part.r) {
        const revealP = Math.min(1, (scanY - (part.y - part.r)) / (part.r * 2));
        ctx.globalAlpha = a * revealP * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(part.x, part.y, part.r, 0, Math.PI * 2); ctx.stroke();
        // Joint dots
        const rng = seeded(part.y * 100);
        for (let j = 0; j < 4; j++) {
          const jx = part.x - part.r + rng() * part.r * 2;
          const jy = part.y - part.r + rng() * part.r * 2;
          ctx.globalAlpha = a * revealP * 0.6; ctx.fillStyle = FB.gold;
          ctx.beginPath(); ctx.arc(jx, jy, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
    });
    // Leg wireframes
    if (scanP > 0.4) {
      const legReveal = (scanP - 0.4) / 0.6;
      ctx.globalAlpha = a * legReveal * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1;
      for (let side = -1; side <= 1; side += 2) {
        for (let seg = 0; seg < 3; seg++) {
          const lx = cx + side * (12 + seg * 0);
          const ly = cy - 5 + seg * 8;
          ctx.beginPath();
          ctx.moveTo(lx, ly); ctx.lineTo(lx + side * 20 * legReveal, ly + 10 * legReveal);
          ctx.stroke();
        }
      }
    }
    // Counters
    const counterP = interpolate(frame, [100, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), W * 0.18, H * 0.85, 12, FB.gold, a * counterP);
    drawFBText(ctx, "joints", W * 0.18, H * 0.92, 7, a * counterP, "center", FB.text.dim);
    drawFBCounter(ctx, Math.floor(counterP * 59), W * 0.82, H * 0.85, 12, FB.teal, a * counterP);
    drawFBText(ctx, "actuators", W * 0.82, H * 0.92, 7, a * counterP, "center", FB.text.dim);
    drawFBText(ctx, "X-RAY SCAN \u2192 DIGITAL BODY", cx, H * 0.08, 8, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V3: Joint dots lighting up one by one across body outline ── */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Body outline (faint)
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.2, H * 0.25, 0, 0, Math.PI * 2); ctx.stroke();
    // Joint positions spread across body
    const rng = seeded(4603);
    const joints: { x: number; y: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * W * 0.18;
      joints.push({
        x: cx + Math.cos(ang) * dist,
        y: cy + Math.sin(ang) * dist * 0.85,
      });
    }
    // Light up joints in sequence
    joints.forEach((j, i) => {
      const t = stagger(frame, i, 3, 10);
      if (t <= 0) return;
      // Gold glow
      ctx.globalAlpha = a * t * 0.3;
      const g = ctx.createRadialGradient(j.x, j.y, 0, j.x, j.y, 6);
      g.addColorStop(0, FB.gold); g.addColorStop(1, "rgba(232,193,112,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(j.x, j.y, 6, 0, Math.PI * 2); ctx.fill();
      // Dot
      ctx.globalAlpha = a * t * 0.8; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(j.x, j.y, 2, 0, Math.PI * 2); ctx.fill();
    });
    // Running counter
    const litCount = Math.min(30, Math.floor(frame / 3));
    const counterP = interpolate(frame, [20, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), cx, H * 0.82, 14, FB.gold, a * counterP);
    drawFBText(ctx, "JOINTS", cx, H * 0.9, 8, a * counterP, "center", FB.text.dim);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V4: Blueprint grid with body schematic — dimensions and numbers ── */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    // Blueprint grid
    ctx.globalAlpha = a * 0.05; ctx.strokeStyle = FB.teal;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += W / 12) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += H / 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const cx = W / 2, cy = H * 0.42;
    // Body schematic
    const bodyP = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * bodyP * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    // Head
    ctx.beginPath(); ctx.arc(cx, cy - 18, 7, 0, Math.PI * 2); ctx.stroke();
    // Thorax
    ctx.beginPath(); ctx.ellipse(cx, cy, 12, 10, 0, 0, Math.PI * 2); ctx.stroke();
    // Abdomen
    ctx.beginPath(); ctx.ellipse(cx, cy + 18, 9, 12, 0, 0, Math.PI * 2); ctx.stroke();
    // Legs
    for (let side = -1; side <= 1; side += 2) {
      for (let seg = 0; seg < 3; seg++) {
        const ly = cy - 6 + seg * 8;
        ctx.beginPath();
        ctx.moveTo(cx + side * 12, ly);
        ctx.lineTo(cx + side * 28, ly + 8);
        ctx.lineTo(cx + side * 38, ly + 16);
        ctx.stroke();
      }
    }
    // Dimension lines and annotations
    const annotP = interpolate(frame, [70, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Height dimension
    ctx.globalAlpha = a * annotP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(cx + 30, cy - 25); ctx.lineTo(cx + 30, cy + 30); ctx.stroke();
    drawFBText(ctx, "87 joints", cx + 38, cy, 6, a * annotP, "left", FB.gold);
    // Width dimension
    ctx.beginPath(); ctx.moveTo(cx - 38, cy + 35); ctx.lineTo(cx + 38, cy + 35); ctx.stroke();
    drawFBText(ctx, "59 actuators", cx, cy + 42, 6, a * annotP, "center", FB.teal);
    // Counters
    const counterP = interpolate(frame, [130, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), W * 0.15, H * 0.85, 12, FB.gold, a * counterP);
    drawFBCounter(ctx, Math.floor(counterP * 59), W * 0.85, H * 0.85, 12, FB.teal, a * counterP);
    drawFBText(ctx, "NEUROMECHFLY BLUEPRINT", cx, H * 0.08, 8, a, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V5: Exploded view — body parts spread out then assemble ── */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    const assembleP = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const spread = (1 - assembleP) * 1.8;
    // Parts with spread positions
    const parts = [
      { label: "HEAD", finalX: cx, finalY: cy - 20, ci: 4, offX: -25, offY: -30, r: 8 },
      { label: "THORAX", finalX: cx, finalY: cy, ci: 3, offX: 0, offY: 0, r: 14 },
      { label: "ABDOMEN", finalX: cx, finalY: cy + 22, ci: 2, offX: 20, offY: 30, r: 10 },
      { label: "L-LEGS", finalX: cx - 22, finalY: cy, ci: 5, offX: -40, offY: 0, r: 6 },
      { label: "R-LEGS", finalX: cx + 22, finalY: cy, ci: 5, offX: 40, offY: 0, r: 6 },
    ];
    parts.forEach((p, i) => {
      const t = stagger(frame, i, 10, 20);
      const x = p.finalX + p.offX * spread;
      const y = p.finalY + p.offY * spread;
      drawFBNode(ctx, x, y, p.r, p.ci, a * t, frame);
      if (spread > 0.3) {
        drawFBText(ctx, p.label, x, y + p.r + 8, 5, a * t * spread, "center", FB.text.dim);
      }
    });
    // Connection lines when assembled
    if (assembleP > 0.8) {
      const connA = (assembleP - 0.8) * 5;
      ctx.globalAlpha = a * connA * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy - 14); ctx.lineTo(cx, cy - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10); ctx.lineTo(cx, cy + 14); ctx.stroke();
    }
    // Counters
    const counterP = interpolate(frame, [120, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), W * 0.2, H * 0.85, 12, FB.gold, a * counterP);
    drawFBText(ctx, "JOINTS", W * 0.2, H * 0.92, 7, a * counterP, "center", FB.text.dim);
    drawFBCounter(ctx, Math.floor(counterP * 59), W * 0.8, H * 0.85, 12, FB.teal, a * counterP);
    drawFBText(ctx, "ACTUATORS", W * 0.8, H * 0.92, 7, a * counterP, "center", FB.text.dim);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V6: Dual counter focus — 87 joints ticks up left, 59 actuators right, body center ── */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Simple fly body
    drawFBNode(ctx, cx, cy - 12, 6, 4, a, frame);
    drawFBNode(ctx, cx, cy, 10, 3, a, frame);
    drawFBNode(ctx, cx, cy + 14, 8, 2, a, frame);
    // Counters with big numbers
    const p = interpolate(frame, [20, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const jointCount = Math.floor(p * 87);
    const actCount = Math.floor(p * 59);
    // Left counter
    drawFBCounter(ctx, jointCount, W * 0.15, H * 0.35, 18, FB.gold, a * p);
    drawFBText(ctx, "JOINTS", W * 0.15, H * 0.48, 8, a * p, "center", FB.gold);
    // Bar fill
    ctx.globalAlpha = a * p * 0.3; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.05, H * 0.55, (W * 0.2) * (jointCount / 87), 4);
    // Right counter
    drawFBCounter(ctx, actCount, W * 0.85, H * 0.35, 18, FB.teal, a * p);
    drawFBText(ctx, "ACTUATORS", W * 0.85, H * 0.48, 8, a * p, "center", FB.teal);
    ctx.globalAlpha = a * p * 0.3; ctx.fillStyle = FB.teal;
    ctx.fillRect(W * 0.75, H * 0.55, (W * 0.2) * (actCount / 59), 4);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    drawFBText(ctx, "from X-ray scans", cx, H * 0.88, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V7: Skeleton view — stick figure fly with highlighted joints ── */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Stick figure fly
    const drawP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * drawP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    // Spine
    ctx.beginPath(); ctx.moveTo(cx, cy - 25); ctx.lineTo(cx, cy + 30); ctx.stroke();
    // Legs (stick)
    const legJoints: { x: number; y: number }[] = [];
    for (let side = -1; side <= 1; side += 2) {
      for (let seg = 0; seg < 3; seg++) {
        const attachY = cy - 8 + seg * 10;
        const midX = cx + side * 15, midY = attachY + 5;
        const tipX = cx + side * 28, tipY = attachY + 14;
        ctx.beginPath(); ctx.moveTo(cx, attachY); ctx.lineTo(midX, midY); ctx.lineTo(tipX, tipY); ctx.stroke();
        legJoints.push({ x: cx, y: attachY }, { x: midX, y: midY }, { x: tipX, y: tipY });
      }
    }
    // Highlight joints
    const jointRevealP = interpolate(frame, [50, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    legJoints.forEach((j, i) => {
      const t = stagger(frame, i, 3, 8);
      if (t <= 0) return;
      ctx.globalAlpha = a * t * 0.7; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(j.x, j.y, 2.5, 0, Math.PI * 2); ctx.fill();
    });
    // Head joint
    ctx.globalAlpha = a * drawP * 0.7; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(cx, cy - 25, 3, 0, Math.PI * 2); ctx.fill();
    // Counters
    const counterP = interpolate(frame, [130, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), W * 0.15, H * 0.82, 12, FB.gold, a * counterP);
    drawFBText(ctx, "joints", W * 0.15, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    drawFBCounter(ctx, Math.floor(counterP * 59), W * 0.85, H * 0.82, 12, FB.teal, a * counterP);
    drawFBText(ctx, "actuators", W * 0.85, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V8: X-ray scan lines morph into body — technical reveal ── */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2, cy = H * 0.42;
    // Horizontal scan lines
    const scanP = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const numLines = Math.floor(scanP * 20);
    for (let i = 0; i < numLines; i++) {
      const ly = H * 0.15 + (i / 20) * H * 0.6;
      ctx.globalAlpha = a * 0.1; ctx.strokeStyle = FB.teal; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(W * 0.2, ly); ctx.lineTo(W * 0.8, ly); ctx.stroke();
    }
    // Body emerges from scan
    const bodyP = interpolate(frame, [40, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyP > 0) {
      drawFBNode(ctx, cx, cy - 18, 7 * bodyP, 4, a * bodyP, frame);
      drawFBNode(ctx, cx, cy, 12 * bodyP, 3, a * bodyP, frame);
      drawFBNode(ctx, cx, cy + 18, 9 * bodyP, 2, a * bodyP, frame);
    }
    drawFBText(ctx, "X-RAY SCANS", cx, H * 0.08, 8, a * scanP, "center", FB.teal);
    drawFBText(ctx, "DIGITAL BODY", cx, H * 0.08, 8, a * bodyP, "center", FB.green);
    // Counters
    const counterP = interpolate(frame, [110, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, Math.floor(counterP * 87), W * 0.2, H * 0.82, 12, FB.gold, a * counterP);
    drawFBText(ctx, "joints", W * 0.2, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    drawFBCounter(ctx, Math.floor(counterP * 59), W * 0.8, H * 0.82, 12, FB.teal, a * counterP);
    drawFBText(ctx, "actuators", W * 0.8, H * 0.9, 7, a * counterP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* ── V9: Progress bars — joints fill to 87, actuators to 59, body above ── */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, DUR);
    const cx = W / 2;
    // Fly body (compact)
    const bodyP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, cx, H * 0.2, 6, 4, a * bodyP, frame);
    drawFBNode(ctx, cx, H * 0.28, 10, 3, a * bodyP, frame);
    drawFBNode(ctx, cx, H * 0.38, 8, 2, a * bodyP, frame);
    drawFBText(ctx, "NEUROMECHFLY", cx, H * 0.08, 9, a, "center", FB.green);
    // Progress bars
    const barP = interpolate(frame, [50, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const barW = W * 0.7, barH = 10;
    const barLeft = (W - barW) / 2;
    // Joints bar
    const jointY = H * 0.55;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(barLeft, jointY, barW, barH);
    ctx.globalAlpha = a * barP; ctx.fillStyle = FB.gold;
    ctx.fillRect(barLeft, jointY, barW * barP, barH);
    drawFBText(ctx, "JOINTS", barLeft - 5, jointY + barH / 2, 7, a, "right", FB.gold);
    drawFBCounter(ctx, Math.floor(barP * 87), barLeft + barW + 18, jointY + barH / 2, 10, FB.gold, a * barP);
    // Actuators bar
    const actY = H * 0.7;
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(barLeft, actY, barW, barH);
    ctx.globalAlpha = a * barP; ctx.fillStyle = FB.teal;
    ctx.fillRect(barLeft, actY, barW * barP * (59 / 87), barH);
    drawFBText(ctx, "ACTUATORS", barLeft - 5, actY + barH / 2, 7, a, "right", FB.teal);
    drawFBCounter(ctx, Math.floor(barP * 59), barLeft + barW + 18, actY + barH / 2, 10, FB.teal, a * barP);
    drawFBText(ctx, "from X-ray scans", cx, H * 0.88, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_046: VariantDef[] = [
  { id: "fb-046-v1", label: "Fly body assembles with joint dots and counters", component: V1 },
  { id: "fb-046-v2", label: "X-ray scan reveals wireframe body", component: V2 },
  { id: "fb-046-v3", label: "Joint dots light up across body outline", component: V3 },
  { id: "fb-046-v4", label: "Blueprint grid with schematic", component: V4 },
  { id: "fb-046-v5", label: "Exploded view then assembles", component: V5 },
  { id: "fb-046-v6", label: "Dual counter focus with body center", component: V6 },
  { id: "fb-046-v7", label: "Stick figure skeleton with highlighted joints", component: V7 },
  { id: "fb-046-v8", label: "Scan lines morph into digital body", component: V8 },
  { id: "fb-046-v9", label: "Progress bars filling to 87 and 59", component: V9 },
];
