import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 57 — "The fly chooses the food every time. The brain weighs the signals, and the body follows." — 150 frames */

// ---------- V1: Fly dot curves toward yellow sphere, avoids red ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Red sphere (danger) — upper right
    const rP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * rP * 0.4; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.22, 12, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "danger", W * 0.75, H * 0.35, 7, a * rP * 0.6, "center", FB.red);
    // Yellow sphere (food) — lower right
    const yP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * yP * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.65, 14, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "food", W * 0.75, H * 0.78, 7, a * yP * 0.6, "center", FB.gold);
    // Fly curves toward food
    const flyP = interpolate(frame, [20, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = W * 0.12 + flyP * W * 0.58;
    const flyY = H * 0.45 + Math.sin(flyP * Math.PI * 0.5) * H * 0.18;
    // Trail
    for (let i = 1; i < 10; i++) {
      const tt = Math.max(0, flyP - i * 0.06);
      const tx = W * 0.12 + tt * W * 0.58;
      const ty = H * 0.45 + Math.sin(tt * Math.PI * 0.5) * H * 0.18;
      ctx.globalAlpha = a * 0.1 * (1 - i / 10); ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI * 2); ctx.fill();
    }
    drawFBNode(ctx, flyX, flyY, 8, 4, a, frame);
    // "chooses food" label
    const chooseP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "chooses food", W / 2, H * 0.92, 12, a * chooseP, "center", FB.green);
    drawFBText(ctx, "every time", W / 2 + 60, H * 0.92, 10, a * chooseP * 0.6, "left", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Scale/balance — food side outweighs danger side ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cx = W / 2, pivotY = H * 0.35;
    // Pivot
    ctx.globalAlpha = a * 0.3; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.moveTo(cx - 8, pivotY + 8); ctx.lineTo(cx + 8, pivotY + 8); ctx.lineTo(cx, pivotY); ctx.closePath(); ctx.fill();
    // Beam tilts toward food (left side goes down = heavier)
    const tiltP = interpolate(frame, [30, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tiltAngle = -tiltP * 0.25;
    const beamLen = W * 0.35;
    ctx.save(); ctx.translate(cx, pivotY); ctx.rotate(tiltAngle);
    ctx.globalAlpha = a * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-beamLen, 0); ctx.lineTo(beamLen, 0); ctx.stroke();
    // Left pan: food (heavy)
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.arc(-beamLen, 8, 10, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "food", -beamLen, 26, 8, a, "center", FB.gold);
    // Right pan: danger (light)
    ctx.globalAlpha = a * 0.4; ctx.fillStyle = FB.red;
    ctx.beginPath(); ctx.arc(beamLen, 8, 7, 0, Math.PI * 2); ctx.fill();
    drawFBText(ctx, "danger", beamLen, 26, 8, a, "center", FB.red);
    ctx.restore();
    // Brain label at top
    const brainP = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "brain weighs signals", cx, H * 0.12, 10, a * brainP, "center", FB.purple);
    // Result
    const resP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "food wins", cx, H * 0.78, 14, a * resP, "center", FB.green);
    drawFBText(ctx, "every time", cx, H * 0.86, 9, a * resP * 0.6, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Signal bars — food signal tall, danger short, body follows tall ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const barW = W * 0.2;
    // Food signal bar
    const fP = interpolate(frame, [10, 60], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fBarH = H * 0.5 * fP;
    ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.2, H * 0.7 - fBarH, barW, fBarH);
    drawFBText(ctx, "food", W * 0.2 + barW / 2, H * 0.76, 9, a, "center", FB.gold);
    // Danger signal bar
    const dP = interpolate(frame, [10, 60], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dBarH = H * 0.5 * dP;
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.red;
    ctx.fillRect(W * 0.6, H * 0.7 - dBarH, barW, dBarH);
    drawFBText(ctx, "danger", W * 0.6 + barW / 2, H * 0.76, 9, a, "center", FB.red);
    // "weighs" label
    const wP = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "brain weighs", W / 2, H * 0.1, 10, a * wP, "center", FB.purple);
    // Winner arrow
    const winP = interpolate(frame, [75, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * winP * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.3, H * 0.7 - fBarH - 5); ctx.lineTo(W * 0.3, H * 0.7 - fBarH - 20); ctx.stroke();
    ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.moveTo(W * 0.3 - 5, H * 0.7 - fBarH - 16); ctx.lineTo(W * 0.3, H * 0.7 - fBarH - 20); ctx.lineTo(W * 0.3 + 5, H * 0.7 - fBarH - 16); ctx.fill();
    drawFBText(ctx, "CHOOSE", W * 0.3, H * 0.7 - fBarH - 28, 9, a * winP, "center", FB.green);
    // "body follows"
    const bP = interpolate(frame, [110, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "body follows", W / 2, H * 0.9, 11, a * bP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Fork in road — fly takes gold path every time ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Fork path
    const forkX = W * 0.35, forkY = H * 0.45;
    ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.05, forkY); ctx.lineTo(forkX, forkY); ctx.stroke();
    // Upper path (food)
    ctx.strokeStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(forkX, forkY); ctx.lineTo(W * 0.85, H * 0.25); ctx.stroke();
    drawFBNode(ctx, W * 0.85, H * 0.25, 10, 2, a, frame);
    drawFBText(ctx, "FOOD", W * 0.85, H * 0.15, 9, a, "center", FB.gold);
    // Lower path (danger)
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.red;
    ctx.beginPath(); ctx.moveTo(forkX, forkY); ctx.lineTo(W * 0.85, H * 0.65); ctx.stroke();
    drawFBNode(ctx, W * 0.85, H * 0.65, 8, 0, a * 0.5, frame);
    drawFBText(ctx, "danger", W * 0.85, H * 0.75, 8, a * 0.4, "center", FB.red);
    // Fly takes upper path
    const flyP = interpolate(frame, [25, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = W * 0.05 + flyP * W * 0.75;
    const flyY = flyP < 0.4 ? forkY : forkY + (flyP - 0.4) / 0.6 * (H * 0.25 - forkY);
    drawFBNode(ctx, flyX, flyY, 7, 4, a, frame);
    // Check mark at food
    const chkP = interpolate(frame, [95, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * chkP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(W * 0.78, H * 0.25); ctx.lineTo(W * 0.82, H * 0.28); ctx.lineTo(W * 0.9, H * 0.18); ctx.stroke();
    drawFBText(ctx, "every time", W / 2, H * 0.88, 12, a * chkP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Tally marks — food chosen 5/5 times ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    drawFBText(ctx, "food chosen:", W * 0.12, H * 0.3, 9, a, "left", FB.gold);
    // Tally marks appearing one by one
    for (let i = 0; i < 5; i++) {
      const tp = interpolate(frame, [15 + i * 15, 25 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const tx = W * 0.12 + i * W * 0.1;
      const isCross = i === 4; // fifth tally is diagonal
      ctx.globalAlpha = a * tp * 0.6; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2.5;
      if (isCross) {
        ctx.beginPath(); ctx.moveTo(tx - W * 0.15, H * 0.38); ctx.lineTo(tx + W * 0.05, H * 0.56); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.moveTo(tx, H * 0.38); ctx.lineTo(tx, H * 0.56); ctx.stroke();
      }
    }
    // Counter
    const countP = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "5 / 5", W / 2, H * 0.7, 20, FB.green, a * countP);
    drawFBText(ctx, "danger chosen:", W * 0.12, H * 0.82, 9, a, "left", FB.red);
    drawFBCounter(ctx, "0", W * 0.55, H * 0.82, 14, FB.red, a * countP);
    // "brain weighs, body follows"
    const sumP = interpolate(frame, [110, 135], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "brain weighs, body follows", W / 2, H * 0.92, 9, a * sumP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Brain node with two inputs — gold wins, drives body ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Two inputs
    const inP = interpolate(frame, [5, 30], [0, 1], { extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.12, H * 0.25, 10, 2, a * inP, frame);
    drawFBText(ctx, "food signal", W * 0.12, H * 0.15, 7, a * inP, "center", FB.gold);
    drawFBNode(ctx, W * 0.12, H * 0.6, 8, 0, a * inP, frame);
    drawFBText(ctx, "danger signal", W * 0.12, H * 0.7, 7, a * inP, "center", FB.red);
    // Brain center
    const brainP = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W / 2, H * 0.42, 16, 6, a * brainP, frame);
    drawFBText(ctx, "BRAIN", W / 2, H * 0.55, 9, a * brainP, "center", FB.purple);
    // Input lines — gold thick, red thin (gold wins)
    ctx.globalAlpha = a * brainP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.25); ctx.lineTo(W * 0.42, H * 0.4); ctx.stroke();
    ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.2, H * 0.6); ctx.lineTo(W * 0.42, H * 0.44); ctx.stroke();
    // Output to body
    const outP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * outP * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W * 0.58, H * 0.42); ctx.lineTo(W * 0.82, H * 0.42); ctx.stroke();
    drawFBNode(ctx, W * 0.88, H * 0.42, 10, 3, a * outP, frame);
    drawFBText(ctx, "BODY", W * 0.88, H * 0.55, 9, a * outP, "center", FB.green);
    drawFBText(ctx, "follows food", W * 0.88, H * 0.62, 7, a * outP, "center", FB.text.dim);
    // Result
    const resP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "food chosen every time", W / 2, H * 0.85, 10, a * resP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Repeated trials — fly path curves to gold 3 times in a row ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const trials = 3;
    for (let t = 0; t < trials; t++) {
      const ty = H * 0.12 + t * H * 0.28;
      const delay = t * 35;
      const tp = interpolate(frame, [delay + 5, delay + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Food sphere
      drawFBNode(ctx, W * 0.82, ty, 7, 2, a * tp, frame);
      // Danger sphere
      drawFBNode(ctx, W * 0.82, ty + H * 0.16, 6, 0, a * tp * 0.4, frame);
      // Fly path curving to food
      const pathP = interpolate(frame, [delay + 10, delay + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * pathP * 0.2; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.1, ty + H * 0.08);
      ctx.quadraticCurveTo(W * 0.5, ty + H * 0.08 - pathP * H * 0.06, W * 0.1 + pathP * W * 0.68, ty + pathP * 0);
      ctx.stroke();
      // Fly dot at path head
      const fx = W * 0.1 + pathP * W * 0.68;
      const fy = ty + H * 0.08 - pathP * H * 0.08;
      drawFBNode(ctx, fx, fy, 5, 4, a * pathP, frame);
      // Trial label
      drawFBText(ctx, `trial ${t + 1}`, W * 0.04, ty + H * 0.08, 6, a * tp * 0.4, "left", FB.text.dim);
    }
    const resP = interpolate(frame, [110, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "food every time", W / 2, H * 0.92, 12, a * resP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Pie chart — 100% food, 0% danger ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    const cx = W / 2, cy = H * 0.4, r = Math.min(W, H) * 0.22;
    // Fill grows from 0 to full circle (100% food)
    const fillP = interpolate(frame, [15, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.5; ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + fillP * Math.PI * 2);
    ctx.closePath(); ctx.fill();
    // Outline
    ctx.globalAlpha = a * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // Label
    const pct = Math.round(fillP * 100);
    drawFBCounter(ctx, pct + "%", cx, cy, 20, FB.gold, a);
    drawFBText(ctx, "food", cx, cy + 25, 10, a, "center", FB.gold);
    // "danger: 0%"
    const dP = interpolate(frame, [85, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "danger: 0%", cx, H * 0.75, 10, a * dP, "center", FB.red);
    drawFBText(ctx, "brain weighs, body follows", cx, H * 0.88, 9, a * dP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Arrow diagram — brain evaluates, arrow points to food ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 150);
    // Brain at center
    drawFBNode(ctx, W / 2, H * 0.35, 16, 6, a, frame);
    drawFBText(ctx, "BRAIN", W / 2, H * 0.22, 10, a, "center", FB.purple);
    drawFBText(ctx, "weighs signals", W / 2, H * 0.48, 8, a, "center", FB.text.dim);
    // Food below-left
    const fP = interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.2, H * 0.72, 12, 2, a * fP, frame);
    drawFBText(ctx, "FOOD", W * 0.2, H * 0.84, 9, a * fP, "center", FB.gold);
    // Danger below-right
    drawFBNode(ctx, W * 0.8, H * 0.72, 10, 0, a * fP * 0.5, frame);
    drawFBText(ctx, "danger", W * 0.8, H * 0.84, 8, a * fP * 0.4, "center", FB.red);
    // Arrow from brain to food (thick, green)
    const arrP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W * 0.42, H * 0.45); ctx.lineTo(W * 0.25, H * 0.65); ctx.stroke();
    ctx.fillStyle = FB.green;
    ctx.beginPath(); ctx.moveTo(W * 0.25, H * 0.65); ctx.lineTo(W * 0.28, H * 0.6); ctx.lineTo(W * 0.22, H * 0.62); ctx.fill();
    // Faint crossed line to danger
    ctx.globalAlpha = a * arrP * 0.1; ctx.strokeStyle = FB.red; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W * 0.58, H * 0.45); ctx.lineTo(W * 0.75, H * 0.65); ctx.stroke();
    ctx.setLineDash([]);
    // "every time" label
    const evP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "every time", W / 2, H * 0.92, 12, a * evP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_057: VariantDef[] = [
  { id: "fb-057-v1", label: "Fly curves toward food, avoids red", component: V1 },
  { id: "fb-057-v2", label: "Balance scale tips toward food", component: V2 },
  { id: "fb-057-v3", label: "Signal bars — food tall, danger short", component: V3 },
  { id: "fb-057-v4", label: "Fork in road, fly takes gold path", component: V4 },
  { id: "fb-057-v5", label: "Tally marks: 5/5 food chosen", component: V5 },
  { id: "fb-057-v6", label: "Brain node with competing inputs", component: V6 },
  { id: "fb-057-v7", label: "Three trials all curve to food", component: V7 },
  { id: "fb-057-v8", label: "Pie chart 100% food chosen", component: V8 },
  { id: "fb-057-v9", label: "Arrow from brain points to food", component: V9 },
];
