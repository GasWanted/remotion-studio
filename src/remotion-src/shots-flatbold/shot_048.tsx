import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 48 — "If the brain tells the legs to push the wrong way, the fly actually falls over." — 120 frames */

// ---------- V1: Fly body tilts and topples frame by frame ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const groundY = H * 0.78;
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    // Body tilts over time
    const tiltP = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tiltAngle = tiltP * Math.PI * 0.45;
    const cx = W / 2, cy = groundY - 30;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tiltAngle);
    // Body ellipse
    const [h, s, l] = cellHSL(4);
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
    ctx.beginPath(); ctx.ellipse(0, -10, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
    // Three legs each side
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    for (let side = -1; side <= 1; side += 2) {
      for (let li = 0; li < 3; li++) {
        const lx = -12 + li * 12, ly = -10;
        ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + side * 18, ly + 20); ctx.stroke();
      }
    }
    // Eyes on body
    drawFBNode(ctx, -6, -14, 3, 4, a, frame);
    drawFBNode(ctx, 6, -14, 3, 4, a, frame);
    ctx.restore();
    // "WRONG WAY" arrow if early
    if (frame < 60) {
      const arrA = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * arrA * 0.5; ctx.strokeStyle = FB.red; ctx.fillStyle = FB.red; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W * 0.7, H * 0.5); ctx.lineTo(W * 0.8, H * 0.35); ctx.stroke();
      drawFBText(ctx, "WRONG", W * 0.78, H * 0.32, 9, a * arrA, "center", FB.red);
    }
    // "falls over" label
    const fallLabel = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.92, 12, a * fallLabel, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Brain sends bad signal, legs push upward, body lifts then crashes ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Brain node at top
    const brainP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, W / 2, H * 0.1, 10, 6, a * brainP, frame);
    drawFBText(ctx, "BRAIN", W / 2, H * 0.2, 8, a * brainP, "center", FB.purple);
    // Bad signal pulse
    const sigP = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (sigP > 0 && sigP < 1) {
      const sy = H * 0.22 + sigP * H * 0.2;
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.red;
      ctx.beginPath(); ctx.arc(W / 2, sy, 4, 0, Math.PI * 2); ctx.fill();
    }
    // Legs push wrong direction (upward arrows)
    const legP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (legP > 0) {
      for (let i = 0; i < 3; i++) {
        const lx = W * 0.3 + i * W * 0.2;
        ctx.globalAlpha = a * legP * 0.4; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, H * 0.62); ctx.lineTo(lx, H * 0.52); ctx.stroke();
        ctx.fillStyle = FB.red;
        ctx.beginPath(); ctx.moveTo(lx - 4, H * 0.55); ctx.lineTo(lx, H * 0.52); ctx.lineTo(lx + 4, H * 0.55); ctx.fill();
      }
    }
    // Body falls sideways
    const crashP = interpolate(frame, [55, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bodyX = W / 2 + crashP * W * 0.15;
    const bodyY = H * 0.55 + crashP * H * 0.15;
    const bodyRot = crashP * Math.PI * 0.5;
    ctx.save(); ctx.translate(bodyX, bodyY); ctx.rotate(bodyRot);
    drawFBNode(ctx, 0, 0, 15, 4, a, frame);
    ctx.restore();
    const fallP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CRASH", W / 2, H * 0.88, 14, a * fallP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Two-panel comparison: correct push vs wrong push ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim;
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.12); ctx.lineTo(W / 2, H * 0.88); ctx.stroke();
    ctx.setLineDash([]);
    // Left: correct — stable
    const lp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "CORRECT", W * 0.25, H * 0.08, 9, a * lp, "center", FB.green);
    drawFBNode(ctx, W * 0.25, H * 0.45, 12, 3, a * lp, frame);
    ctx.globalAlpha = a * lp * 0.3; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.62); ctx.lineTo(W * 0.4, H * 0.62); ctx.stroke();
    drawFBText(ctx, "stable", W * 0.25, H * 0.72, 9, a * lp, "center", FB.green);
    // Right: wrong — toppled
    const rp = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WRONG", W * 0.75, H * 0.08, 9, a * rp, "center", FB.red);
    const toppleP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save();
    ctx.translate(W * 0.75, H * 0.55);
    ctx.rotate(toppleP * Math.PI * 0.4);
    drawFBNode(ctx, 0, 0, 12, 0, a * rp, frame);
    ctx.restore();
    ctx.globalAlpha = a * rp * 0.3; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.6, H * 0.62); ctx.lineTo(W * 0.9, H * 0.62); ctx.stroke();
    drawFBText(ctx, "falls over", W * 0.75, H * 0.82, 9, a * toppleP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Stick fly walking then stumbling ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const groundY = H * 0.75;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    // Walking phase then stumble
    const walkP = interpolate(frame, [5, 50], [0, 1], { extrapolateRight: "clamp" });
    const stumbleP = interpolate(frame, [50, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const cx = W * 0.2 + walkP * W * 0.3;
    const tilt = stumbleP * Math.PI * 0.35;
    const cy = groundY - 25 + stumbleP * 8;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(tilt);
    // Simple body
    const [h, s, l] = cellHSL(4);
    ctx.globalAlpha = a * 0.4; ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
    // Legs kicking
    ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
    const legAng = stumbleP > 0 ? stumbleP * 0.6 : Math.sin(frame * 0.15) * 0.3;
    for (let s2 = -1; s2 <= 1; s2 += 2) {
      ctx.beginPath(); ctx.moveTo(s2 * 8, 8); ctx.lineTo(s2 * 14, 20 + legAng * s2 * 8); ctx.stroke();
    }
    ctx.restore();
    // "Wrong signal" spark at stumble point
    if (stumbleP > 0 && stumbleP < 0.5) {
      drawFBText(ctx, "!", cx + 20, cy - 20, 14, a * (0.5 - stumbleP) * 2, "center", FB.red);
    }
    const labelP = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.9, 12, a * labelP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Signal meter — correct direction vs wrong direction ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Dial / gauge showing direction
    const cx = W / 2, cy = H * 0.4, r = Math.min(W, H) * 0.22;
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke();
    // Green zone (right half)
    ctx.globalAlpha = a * 0.08; ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 0.5, 0); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
    // Red zone (wrong half)
    ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, -Math.PI * 0.5); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fill();
    // Needle swings to wrong side
    const needleAngle = interpolate(frame, [15, 60], [-Math.PI * 0.3, -Math.PI * 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.8; ctx.strokeStyle = FB.red; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(needleAngle) * r * 0.85, cy + Math.sin(needleAngle) * r * 0.85);
    ctx.stroke();
    drawFBText(ctx, "WRONG", cx - r * 0.5, cy - r * 0.3, 8, a * 0.5, "center", FB.red);
    drawFBText(ctx, "RIGHT", cx + r * 0.5, cy - r * 0.3, 8, a * 0.5, "center", FB.green);
    // Result
    const resP = interpolate(frame, [70, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", cx, H * 0.78, 14, a * resP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Six legs with force arrows — three flip, fly topples ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const groundY = H * 0.65;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    // 6 legs as columns
    const legColors = [3, 3, 3, 0, 0, 0]; // first 3 green (correct), last 3 red (wrong)
    const legLabels = ["ok", "ok", "ok", "BAD", "BAD", "BAD"];
    for (let i = 0; i < 6; i++) {
      const lx = W * 0.12 + i * W * 0.135;
      const reveal = interpolate(frame, [5 + i * 5, 20 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const isWrong = i >= 3;
      const [h, s, l] = cellHSL(legColors[i]);
      // Leg line
      ctx.globalAlpha = a * reveal * 0.5; ctx.strokeStyle = `hsl(${h},${s}%,${l}%)`;
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, groundY); ctx.lineTo(lx, groundY - 30); ctx.stroke();
      // Force arrow: correct pushes down, wrong pushes up
      const dir = isWrong ? -1 : 1;
      ctx.strokeStyle = isWrong ? FB.red : FB.green; ctx.lineWidth = 1.5;
      const ay = groundY - 35;
      ctx.beginPath(); ctx.moveTo(lx, ay); ctx.lineTo(lx, ay + dir * 15); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.moveTo(lx - 3, ay + dir * 12); ctx.lineTo(lx, ay + dir * 15); ctx.lineTo(lx + 3, ay + dir * 12); ctx.fill();
      drawFBText(ctx, legLabels[i], lx, groundY + 12, 6, a * reveal * 0.6, "center", isWrong ? FB.red : FB.green);
    }
    // Body topples
    const toppleP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bx = W / 2 + toppleP * W * 0.08;
    const by = groundY - 45 + toppleP * 10;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(toppleP * 0.6);
    drawFBNode(ctx, 0, 0, 12, 4, a, frame);
    ctx.restore();
    const lbl = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.9, 12, a * lbl, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Balance bar tips over ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const pivotX = W / 2, pivotY = H * 0.55;
    // Pivot triangle
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.moveTo(pivotX - 8, pivotY + 10); ctx.lineTo(pivotX + 8, pivotY + 10); ctx.lineTo(pivotX, pivotY); ctx.closePath(); ctx.fill();
    // Balance beam tilts
    const tiltP = interpolate(frame, [25, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const beamAngle = tiltP * 0.4;
    const beamLen = W * 0.35;
    ctx.save(); ctx.translate(pivotX, pivotY); ctx.rotate(beamAngle);
    ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
    // Left end: "correct" weight
    drawFBNode(ctx, -beamLen, -8, 8, 3, a, frame);
    drawFBText(ctx, "correct", -beamLen, -22, 7, a * 0.6, "center", FB.green);
    // Right end: "wrong" weight — heavier
    drawFBNode(ctx, beamLen, -8, 12, 0, a, frame);
    drawFBText(ctx, "wrong", beamLen, -26, 7, a * 0.6, "center", FB.red);
    ctx.restore();
    const crashP = interpolate(frame, [85, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.82, 14, a * crashP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Domino chain — wrong signal cascades into topple ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    const n = 7;
    const groundY = H * 0.72;
    ctx.globalAlpha = a * 0.1; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const dx = W * 0.1 + i * W * 0.115;
      const fallDelay = 15 + i * 10;
      const dp = interpolate(frame, [fallDelay, fallDelay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const angle = dp * Math.PI * 0.4;
      ctx.save(); ctx.translate(dx, groundY);
      ctx.rotate(angle);
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = i === 0 ? FB.red : FB.teal;
      ctx.fillRect(-3, -28, 6, 28);
      ctx.restore();
    }
    // First domino labeled "WRONG"
    const wrongP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "WRONG", W * 0.1, H * 0.35, 8, a * wrongP, "center", FB.red);
    // Fly at end topples
    const flyFallP = interpolate(frame, [75, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save();
    ctx.translate(W * 0.88, groundY - 15);
    ctx.rotate(flyFallP * Math.PI * 0.45);
    drawFBNode(ctx, 0, 0, 10, 4, a, frame);
    ctx.restore();
    const lbl = interpolate(frame, [90, 112], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.9, 12, a * lbl, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Red "X" stamped over a walking fly ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 120);
    // Fly body at center
    drawFBNode(ctx, W / 2, H * 0.38, 16, 4, a, frame);
    // Six leg stubs
    const rng = seeded(4800);
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI * 0.6 + (i / 5) * Math.PI * 1.2;
      const lx = W / 2 + Math.cos(angle) * 28;
      const ly = H * 0.38 + Math.sin(angle) * 20;
      ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(W / 2, H * 0.38); ctx.lineTo(lx, ly); ctx.stroke();
    }
    // "Push wrong way" arrows on 3 legs
    const arrP = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) {
      const angle = -Math.PI * 0.6 + (i * 2 / 5) * Math.PI * 1.2;
      const lx = W / 2 + Math.cos(angle) * 28;
      const ly = H * 0.38 + Math.sin(angle) * 20;
      ctx.globalAlpha = a * arrP * 0.5; ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(angle) * 12, ly + Math.sin(angle) * 12); ctx.stroke();
    }
    // Big red X stamps over
    const xP = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const xSize = 35 + (1 - xP) * 20; // starts big, shrinks to place
    ctx.globalAlpha = a * xP * 0.6; ctx.strokeStyle = FB.red; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(W / 2 - xSize, H * 0.38 - xSize); ctx.lineTo(W / 2 + xSize, H * 0.38 + xSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + xSize, H * 0.38 - xSize); ctx.lineTo(W / 2 - xSize, H * 0.38 + xSize); ctx.stroke();
    const lbl = interpolate(frame, [80, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "falls over", W / 2, H * 0.82, 14, a * lbl, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_048: VariantDef[] = [
  { id: "fb-048-v1", label: "Fly body tilts and topples", component: V1 },
  { id: "fb-048-v2", label: "Brain sends bad signal, body crashes", component: V2 },
  { id: "fb-048-v3", label: "Two-panel correct vs wrong push", component: V3 },
  { id: "fb-048-v4", label: "Stick fly walks then stumbles", component: V4 },
  { id: "fb-048-v5", label: "Direction gauge swings to wrong side", component: V5 },
  { id: "fb-048-v6", label: "Six legs with flipped force arrows", component: V6 },
  { id: "fb-048-v7", label: "Balance bar tips over from wrong weight", component: V7 },
  { id: "fb-048-v8", label: "Domino chain from wrong signal", component: V8 },
  { id: "fb-048-v9", label: "Red X stamps over broken fly", component: V9 },
];
