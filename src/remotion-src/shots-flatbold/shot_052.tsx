import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 52 — "The walking pattern isn't invented; high-speed cameras captured real flies at two thousand frames per second to drive the motor patterns." — 180 frames */

// ---------- V1: Camera icon flashes "2000 FPS," data streams into pattern display ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // Camera body
    const camX = W * 0.2, camY = H * 0.3;
    const camP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * camP * 0.4; ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 2;
    ctx.strokeRect(camX - 18, camY - 12, 36, 24);
    ctx.beginPath(); ctx.arc(camX, camY, 8, 0, Math.PI * 2); ctx.stroke();
    // Flash
    const flash = Math.sin(frame * 0.15) > 0.5 && frame < 90;
    if (flash) {
      ctx.globalAlpha = a * 0.3; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(camX, camY, 12, 0, Math.PI * 2); ctx.fill();
    }
    // "2000 FPS" counter
    const fpsP = interpolate(frame, [25, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fpsVal = Math.floor(interpolate(frame, [25, 60], [0, 2000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, fpsVal, camX, camY + 28, 12, FB.gold, a * fpsP);
    drawFBText(ctx, "FPS", camX + 28, camY + 28, 8, a * fpsP, "left", FB.text.dim);
    // Data stream flowing right
    const dataP = interpolate(frame, [60, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(5200);
    for (let i = 0; i < 12; i++) {
      const dp = Math.max(0, dataP - i * 0.05);
      if (dp <= 0) continue;
      const dx = camX + 30 + dp * W * 0.45;
      const dy = camY + (rng() - 0.5) * 20;
      ctx.globalAlpha = a * (1 - dp) * 0.4; ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(dx, dy, 2, 0, Math.PI * 2); ctx.fill();
    }
    // Motor pattern waveform on right
    const waveP = interpolate(frame, [100, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (waveP > 0) {
      ctx.globalAlpha = a * waveP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < W * 0.35 * waveP; x += 2) {
        const wy = H * 0.6 + Math.sin(x * 0.1) * 12;
        if (x === 0) ctx.moveTo(W * 0.55 + x, wy); else ctx.lineTo(W * 0.55 + x, wy);
      }
      ctx.stroke();
      drawFBText(ctx, "motor pattern", W * 0.75, H * 0.78, 8, a * waveP, "center", FB.green);
    }
    drawFBText(ctx, "not invented  -  captured", W / 2, H * 0.92, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Film strip frames revealing a walking fly ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const numFrames = 6;
    const fW = W * 0.12, fH = H * 0.25;
    const startX = W * 0.05;
    const scrollX = interpolate(frame, [20, 140], [0, -W * 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Sprocket holes
    ctx.globalAlpha = a * 0.15; ctx.fillStyle = FB.text.dim;
    for (let i = 0; i < 16; i++) {
      const sx = startX + i * (fW + 8) + scrollX;
      if (sx < -fW || sx > W + fW) continue;
      ctx.beginPath(); ctx.arc(sx + fW / 2, H * 0.15, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(sx + fW / 2, H * 0.15 + fH + 12, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Frames with fly positions
    for (let i = 0; i < 10; i++) {
      const fx = startX + i * (fW + 8) + scrollX;
      if (fx < -fW || fx > W + fW) continue;
      const revP = interpolate(frame, [15 + i * 8, 25 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = a * revP * 0.08; ctx.fillStyle = FB.teal;
      ctx.fillRect(fx, H * 0.18, fW, fH);
      ctx.globalAlpha = a * revP * 0.3; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
      ctx.strokeRect(fx, H * 0.18, fW, fH);
      // Simple fly dot at slightly different positions
      const flyY = H * 0.18 + fH * 0.5 + Math.sin(i * 0.8) * fH * 0.15;
      drawFBNode(ctx, fx + fW / 2, flyY, 5, 4, a * revP, frame);
    }
    // "2,000 FPS"
    const fpsP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "2,000", W / 2, H * 0.62, 22, FB.gold, a * fpsP);
    drawFBText(ctx, "frames per second", W / 2, H * 0.72, 9, a * fpsP, "center", FB.text.dim);
    drawFBText(ctx, "real data, not invented", W / 2, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Big "2000" counter tick-up with camera lens flare ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const val = Math.floor(interpolate(frame, [15, 80], [0, 2000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    drawFBCounter(ctx, val, W / 2, H * 0.32, 28, FB.gold, a);
    drawFBText(ctx, "frames per second", W / 2, H * 0.45, 10, a, "center", FB.text.dim);
    // Lens flare on counter landing
    if (val >= 2000 && frame <= 88) {
      const flareA = 1 - (frame - 80) / 8;
      ctx.globalAlpha = a * Math.max(0, flareA) * 0.3; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(W / 2, H * 0.32, 30 + (frame - 80) * 3, 0, Math.PI * 2); ctx.fill();
    }
    // Camera outline at top
    const camP = interpolate(frame, [5, 20], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * camP * 0.3; ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - 15, H * 0.08, 30, 18);
    ctx.beginPath(); ctx.arc(W / 2, H * 0.08 + 9, 6, 0, Math.PI * 2); ctx.stroke();
    // "captured from real flies"
    const labelP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "captured from real flies", W / 2, H * 0.62, 10, a * labelP, "center", FB.teal);
    // Waveform representing motor patterns
    const wP = interpolate(frame, [120, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * wP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W * 0.8 * wP; x += 2) {
      const wy = H * 0.78 + Math.sin(x * 0.08 - frame * 0.03) * 10;
      if (x === 0) ctx.moveTo(W * 0.1 + x, wy); else ctx.lineTo(W * 0.1 + x, wy);
    }
    ctx.stroke();
    drawFBText(ctx, "motor patterns", W / 2, H * 0.92, 8, a * wP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Arrow from "CAMERA" to "DATA" to "PATTERN" pipeline ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const stages = [
      { label: "CAMERA", sub: "2000 fps", x: W * 0.15, ci: 5, color: FB.teal },
      { label: "DATA", sub: "joint angles", x: W * 0.45, ci: 1, color: FB.gold },
      { label: "PATTERN", sub: "motor output", x: W * 0.78, ci: 3, color: FB.green },
    ];
    const cy = H * 0.4;
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      const sp = interpolate(frame, [10 + i * 25, 30 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, cy, 14, s.ci, a * sp, frame);
      drawFBText(ctx, s.label, s.x, cy - 22, 9, a * sp, "center", s.color);
      drawFBText(ctx, s.sub, s.x, cy + 22, 7, a * sp * 0.6, "center", FB.text.dim);
      if (i < stages.length - 1) {
        const next = stages[i + 1];
        ctx.globalAlpha = a * sp * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(s.x + 16, cy); ctx.lineTo(next.x - 16, cy); ctx.stroke();
        ctx.fillStyle = FB.text.dim;
        ctx.beginPath(); ctx.moveTo(next.x - 16, cy); ctx.lineTo(next.x - 20, cy - 3); ctx.lineTo(next.x - 20, cy + 3); ctx.fill();
      }
    }
    // Traveling data packet
    const pktP = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (pktP > 0 && pktP < 1) {
      const px = W * 0.15 + pktP * W * 0.63;
      ctx.globalAlpha = a * 0.6; ctx.fillStyle = FB.gold;
      ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
    }
    drawFBText(ctx, "not invented - captured", W / 2, H * 0.78, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Grid of captured frames filling in one by one ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const cols = 6, rows = 4;
    const cellW = W * 0.12, cellH = H * 0.14;
    const gapX = (W - cols * cellW) / (cols + 1);
    const gapY = (H * 0.65 - rows * cellH) / (rows + 1);
    const rng = seeded(5204);
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx2 = gapX + c * (cellW + gapX);
        const cy2 = H * 0.05 + gapY + r * (cellH + gapY);
        const revP = interpolate(frame, [5 + idx * 3, 15 + idx * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.globalAlpha = a * revP * 0.06; ctx.fillStyle = FB.teal;
        ctx.fillRect(cx2, cy2, cellW, cellH);
        ctx.globalAlpha = a * revP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 0.5;
        ctx.strokeRect(cx2, cy2, cellW, cellH);
        // Fly dot in different position per cell
        drawFBNode(ctx, cx2 + cellW / 2 + (rng() - 0.5) * 8, cy2 + cellH / 2 + (rng() - 0.5) * 8, 3, idx % 8, a * revP * 0.7, frame);
        idx++;
      }
    }
    const fpsP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "2,000 FPS", W / 2, H * 0.82, 14, FB.gold, a * fpsP);
    drawFBText(ctx, "real fly data", W / 2, H * 0.92, 9, a * fpsP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Slow-motion effect — fast dots slow to frame-by-frame ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // "Real speed" blur at top
    const blurP = interpolate(frame, [5, 40], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * blurP * 0.3; ctx.fillStyle = FB.teal;
    ctx.fillRect(W * 0.1, H * 0.15, W * 0.8, 4); // streak
    drawFBText(ctx, "real speed: blur", W / 2, H * 0.1, 8, a * blurP, "center", FB.text.dim);
    // "Slow motion" — individual positions visible
    const slowP = interpolate(frame, [50, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (slowP > 0) {
      const numDots = Math.floor(slowP * 15);
      for (let i = 0; i < numDots; i++) {
        const dx = W * 0.1 + (i / 15) * W * 0.8;
        const dy = H * 0.38 + Math.sin(i * 0.5) * 8;
        drawFBNode(ctx, dx, dy, 4, i % 8, a * slowP, frame);
      }
      drawFBText(ctx, "2000 fps: every detail", W / 2, H * 0.52, 8, a * slowP, "center", FB.gold);
    }
    // Joint angle data at bottom
    const dataP = interpolate(frame, [110, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (dataP > 0) {
      ctx.globalAlpha = a * dataP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        for (let x = 0; x < W * 0.8 * dataP; x += 2) {
          const wy = H * 0.7 + j * H * 0.08 + Math.sin(x * 0.05 + j * 2) * 8;
          if (x === 0) ctx.moveTo(W * 0.1 + x, wy); else ctx.lineTo(W * 0.1 + x, wy);
        }
        ctx.stroke();
      }
      drawFBText(ctx, "motor patterns", W / 2, H * 0.93, 8, a * dataP, "center", FB.green);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Split: "INVENTED" crossed out vs "CAPTURED" checked ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // "INVENTED" with strikethrough
    const invP = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
    drawFBText(ctx, "INVENTED", W * 0.3, H * 0.35, 14, a * invP * 0.5, "center", FB.text.dim);
    const strikeP = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (strikeP > 0) {
      ctx.globalAlpha = a * strikeP * 0.7; ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(W * 0.15, H * 0.35); ctx.lineTo(W * 0.15 + strikeP * W * 0.3, H * 0.35); ctx.stroke();
    }
    // "CAPTURED" with check
    const capP = interpolate(frame, [60, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "CAPTURED", W * 0.7, H * 0.35, 14, a * capP, "center", FB.green);
    if (capP > 0.8) {
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(W * 0.58, H * 0.35); ctx.lineTo(W * 0.62, H * 0.38); ctx.lineTo(W * 0.68, H * 0.3); ctx.stroke();
    }
    // Camera + "2000 FPS" below
    const detP = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * detP * 0.3; ctx.strokeStyle = FB.text.primary; ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - 15, H * 0.55, 30, 18);
    ctx.beginPath(); ctx.arc(W / 2, H * 0.55 + 9, 6, 0, Math.PI * 2); ctx.stroke();
    drawFBCounter(ctx, "2,000 FPS", W / 2, H * 0.78, 14, FB.gold, a * detP);
    drawFBText(ctx, "high-speed cameras on real flies", W / 2, H * 0.88, 8, a * detP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Fly silhouette with motion-capture dots tracked ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const cx = W / 2, cy = H * 0.38;
    // Fly body outline
    const bodyP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    ctx.globalAlpha = a * bodyP * 0.15; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(cx, cy, 25, 15, 0, 0, Math.PI * 2); ctx.fill();
    // Motion-capture dots on joints
    const joints = [
      { x: cx - 20, y: cy + 5 }, { x: cx - 30, y: cy + 15 }, { x: cx - 35, y: cy + 25 },
      { x: cx + 20, y: cy + 5 }, { x: cx + 30, y: cy + 15 }, { x: cx + 35, y: cy + 25 },
      { x: cx - 18, y: cy - 3 }, { x: cx + 18, y: cy - 3 },
      { x: cx, y: cy - 12 }, { x: cx, y: cy + 15 },
    ];
    for (let i = 0; i < joints.length; i++) {
      const jp = interpolate(frame, [15 + i * 4, 28 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const j = joints[i];
      const wobble = Math.sin(frame * 0.08 + i) * 2;
      drawFBNode(ctx, j.x + wobble, j.y, 3, i % 8, a * jp, frame);
      // Tracking line
      if (jp > 0.5) {
        ctx.globalAlpha = a * jp * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(j.x + wobble, j.y); ctx.lineTo(j.x + wobble + 5, j.y - 8); ctx.stroke();
      }
    }
    drawFBText(ctx, "high-speed capture", cx, H * 0.68, 10, a, "center", FB.teal);
    const fpsP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "2,000 FPS", cx, H * 0.78, 14, FB.gold, a * fpsP);
    drawFBText(ctx, "real data drives motor patterns", cx, H * 0.9, 8, a * fpsP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Data transfer animation — dots flow from camera to waveform ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // Camera icon left
    drawFBNode(ctx, W * 0.12, H * 0.2, 12, 5, a, frame);
    drawFBText(ctx, "2000 fps", W * 0.12, H * 0.32, 8, a, "center", FB.gold);
    // Waveform right
    const wP = interpolate(frame, [80, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * wP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < W * 0.4 * wP; x += 2) {
      const wy = H * 0.2 + Math.sin(x * 0.08 - frame * 0.03) * 15;
      if (x === 0) ctx.moveTo(W * 0.55 + x, wy); else ctx.lineTo(W * 0.55 + x, wy);
    }
    ctx.stroke();
    drawFBText(ctx, "motor pattern", W * 0.75, H * 0.38, 8, a * wP, "center", FB.green);
    // Streaming dots between
    const rng = seeded(5208);
    for (let i = 0; i < 20; i++) {
      const speed = 0.3 + rng() * 0.7;
      const dp = ((frame * speed * 0.015 + rng()) % 1);
      const dx = W * 0.22 + dp * W * 0.3;
      const dy = H * 0.2 + (rng() - 0.5) * 18;
      ctx.globalAlpha = a * 0.3 * Math.sin(dp * Math.PI); ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // "not invented" label
    drawFBText(ctx, "not invented  -  captured from real flies", W / 2, H * 0.6, 8, a, "center", FB.text.dim);
    // Six leg angle traces at bottom
    const trP = interpolate(frame, [100, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 6; i++) {
      const ly = H * 0.68 + i * H * 0.04;
      ctx.globalAlpha = a * trP * 0.3; ctx.strokeStyle = FB.colors[i % 8]; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < W * 0.8 * trP; x += 3) {
        const wy = ly + Math.sin(x * 0.06 + i * 1.2) * 4;
        if (x === 0) ctx.moveTo(W * 0.1 + x, wy); else ctx.lineTo(W * 0.1 + x, wy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_052: VariantDef[] = [
  { id: "fb-052-v1", label: "Camera flashes 2000 FPS, data streams to waveform", component: V1 },
  { id: "fb-052-v2", label: "Film strip frames of walking fly", component: V2 },
  { id: "fb-052-v3", label: "Big counter tick-up with lens flare", component: V3 },
  { id: "fb-052-v4", label: "Camera to data to pattern pipeline", component: V4 },
  { id: "fb-052-v5", label: "Grid of captured frames filling in", component: V5 },
  { id: "fb-052-v6", label: "Slow-motion blur to frame-by-frame detail", component: V6 },
  { id: "fb-052-v7", label: "Invented crossed out vs captured checked", component: V7 },
  { id: "fb-052-v8", label: "Fly silhouette with motion-capture dots", component: V8 },
  { id: "fb-052-v9", label: "Streaming dots from camera to waveform", component: V9 },
];
