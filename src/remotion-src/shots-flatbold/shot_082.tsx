import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 82 — "gauntlet: escape/groom/walk perfect, food = RUNS AWAY every time" — 210 frames */

// ---------- V1: Four-lane gauntlet, fly runs each lane, reverses at food ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2;
    const lanes = [
      { label: "ESCAPE", t0: 10, t1: 50, pass: true, ci: 3 },
      { label: "GROOM", t0: 40, t1: 80, pass: true, ci: 4 },
      { label: "WALK", t0: 70, t1: 110, pass: true, ci: 5 },
      { label: "FOOD", t0: 100, t1: 150, pass: false, ci: 0 },
    ];
    lanes.forEach((lane, i) => {
      const y = H * 0.12 + i * H * 0.18;
      const p = interpolate(frame, [lane.t0, lane.t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const reveal = interpolate(frame, [lane.t0 - 8, lane.t0 + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Track background
      ctx.globalAlpha = a * reveal * 0.1;
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      const trackW = W * 0.6;
      ctx.fillRect(cx - trackW / 2, y - 5, trackW, 10);
      // Fill bar
      ctx.globalAlpha = a * reveal * 0.3;
      ctx.fillStyle = lane.pass ? FB.green : FB.red;
      ctx.fillRect(cx - trackW / 2, y - 5, trackW * p, 10);
      // Label
      drawFBText(ctx, lane.label, cx - trackW / 2 - 4, y, 8, a * reveal, "right", FB.colors[lane.ci]);
      // Result
      if (p > 0.9) {
        const [h] = cellHSL(lane.ci);
        ctx.globalAlpha = a;
        ctx.fillStyle = lane.pass ? FB.green : FB.red;
        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.textAlign = "left";
        ctx.fillText(lane.pass ? "PASS" : "RUNS AWAY", cx + trackW / 2 + 4, y + 3);
      }
    });
    // Fly dot following current lane
    const flyLane = frame < 50 ? 0 : frame < 80 ? 1 : frame < 110 ? 2 : 3;
    const fl = lanes[flyLane];
    const flyP = interpolate(frame, [fl.t0, fl.t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyY = H * 0.12 + flyLane * H * 0.18;
    const trackW = W * 0.6;
    let flyX = cx - trackW / 2 + flyP * trackW;
    // Food lane reversal
    if (flyLane === 3 && flyP > 0.7) {
      const rev = interpolate(frame, [fl.t0 + (fl.t1 - fl.t0) * 0.7, fl.t1], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      flyX -= rev * trackW;
    }
    drawFBNode(ctx, flyX, flyY, 4, flyLane === 3 && flyP > 0.7 ? 0 : 3, a, frame);
    // Bottom dramatic text
    const endP = interpolate(frame, [160, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EVERY SINGLE TIME", cx, H * 0.9, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Three green checkmarks stacking, then dramatic red X slams ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2;
    const checks = [
      { label: "ESCAPE", fr: 15 },
      { label: "GROOM", fr: 50 },
      { label: "WALK", fr: 85 },
    ];
    checks.forEach((item, i) => {
      const t = interpolate(frame, [item.fr, item.fr + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.13 + i * H * 0.15;
      drawFBText(ctx, item.label, cx - 8, y, 11, a * t, "right", FB.green);
      // Checkmark circle
      if (t > 0.5) {
        ctx.globalAlpha = a * (t - 0.5) * 2;
        ctx.fillStyle = FB.green;
        ctx.beginPath();
        ctx.arc(cx + 14, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1225";
        ctx.font = "bold 8px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("\u2713", cx + 14, y + 1);
      }
    });
    // FOOD with red X slamming in
    const foodT = interpolate(frame, [120, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const foodY = H * 0.13 + 3 * H * 0.15;
    drawFBText(ctx, "FOOD", cx - 8, foodY, 11, a * foodT, "right", FB.red);
    const xSlam = interpolate(frame, [138, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (xSlam > 0) {
      const bounce = 1 + Math.max(0, 1 - (frame - 138) / 12) * 0.8;
      ctx.save();
      ctx.translate(cx + 14, foodY);
      ctx.scale(bounce, bounce);
      ctx.globalAlpha = a * xSlam;
      ctx.fillStyle = FB.red;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#1a1225";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -3); ctx.lineTo(3, 3);
      ctx.moveTo(3, -3); ctx.lineTo(-3, 3);
      ctx.stroke();
      ctx.restore();
    }
    // "RUNS AWAY" slam
    const runP = interpolate(frame, [155, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RUNS AWAY", cx, H * 0.82, 16, a * runP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Obstacle course as connected nodes, fly reverses at final node ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cy = H * 0.42;
    const stations = [
      { x: W * 0.08, label: "START", ci: 5 },
      { x: W * 0.28, label: "DANGER", ci: 0 },
      { x: W * 0.48, label: "GROOM", ci: 4 },
      { x: W * 0.68, label: "WALK", ci: 3 },
      { x: W * 0.88, label: "FOOD", ci: 2 },
    ];
    // Connect stations with edges
    for (let i = 0; i < stations.length - 1; i++) {
      const t = interpolate(frame, [i * 12, i * 12 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBColorEdge(ctx, stations[i].x, cy, stations[i + 1].x, cy, "rgba(255,255,255,0.15)", 1, a * t);
    }
    // Station nodes
    stations.forEach((s, i) => {
      const t = interpolate(frame, [i * 10, i * 10 + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBNode(ctx, s.x, cy, 6, s.ci, a * t, frame);
      drawFBText(ctx, s.label, s.x, cy + 16, 6, a * t, "center", FB.colors[s.ci]);
    });
    // Flying dot along the course
    const fwdP = interpolate(frame, [25, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const revP = interpolate(frame, [130, 175], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const dotX = W * 0.08 + (fwdP - revP) * W * 0.8;
    const dotColor = revP > 0 ? FB.red : FB.green;
    ctx.globalAlpha = a;
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(dotX, cy - 12, 3, 0, Math.PI * 2);
    ctx.fill();
    // Green checkmarks at passed stations
    [1, 2, 3].forEach(i => {
      if (fwdP > i * 0.25) {
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = FB.green;
        ctx.font = "bold 8px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText("\u2713", stations[i].x, cy - 12);
      }
    });
    // REVERSAL text
    if (revP > 0) {
      drawFBText(ctx, "REVERSAL", W * 0.7, cy - 24, 8, a * revP * 2, "center", FB.red);
    }
    const endP = interpolate(frame, [175, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "PERFECT COURSE. ZERO FOOD.", W / 2, H * 0.82, 10, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Scorecard grid with animated fill bars ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2;
    drawFBText(ctx, "GAUNTLET RESULTS", cx, H * 0.06, 8, a * interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    const tests = [
      { name: "ESCAPE", score: 100, color: FB.green, t0: 15 },
      { name: "GROOM", score: 100, color: FB.green, t0: 40 },
      { name: "WALK", score: 100, color: FB.green, t0: 65 },
      { name: "FEED", score: 0, color: FB.red, t0: 100 },
    ];
    tests.forEach((t, i) => {
      const reveal = interpolate(frame, [t.t0, t.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.16 + i * H * 0.16;
      const barW = W * 0.45;
      // Label
      drawFBText(ctx, t.name, cx - barW / 2 - 4, y, 8, a * reveal, "right", t.color);
      // Bar bg
      ctx.globalAlpha = a * reveal * 0.1;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(cx - barW / 2, y - 5, barW, 10);
      // Bar fill
      ctx.globalAlpha = a * reveal * 0.5;
      ctx.fillStyle = t.color;
      ctx.fillRect(cx - barW / 2, y - 5, barW * (t.score / 100) * reveal, 10);
      // Score
      if (reveal > 0.8) {
        drawFBText(ctx, `${t.score}%`, cx + barW / 2 + 8, y, 8, a * reveal, "left", t.color);
      }
    });
    // Summary
    const sumP = interpolate(frame, [145, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "3/4 FLAWLESS", cx, H * 0.85, 11, a * sumP, "center", FB.green);
    drawFBText(ctx, "1 INVERTED", cx, H * 0.93, 11, a * sumP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Food close-up, fly approaches then retreats with motion trails ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2, cy = H * 0.4;
    // Sugar cube glow
    const sugarP = interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * sugarP * 0.08;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    glow.addColorStop(0, FB.gold);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 30, cy - 30, 60, 60);
    // Sugar cube
    ctx.globalAlpha = a * sugarP;
    ctx.fillStyle = FB.gold;
    ctx.fillRect(cx - 6, cy - 6, 12, 12);
    drawFBText(ctx, "SUGAR", cx, cy + 14, 7, a * sugarP, "center", FB.gold);
    // Fly approaches
    const approachP = interpolate(frame, [35, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const retreatP = interpolate(frame, [95, 155], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyX = retreatP > 0
      ? cx - 18 - retreatP * 35
      : cx - 45 + approachP * 27;
    const flyColor = retreatP > 0 ? FB.red : FB.green;
    drawFBNode(ctx, flyX, cy, 5, retreatP > 0 ? 0 : 3, a, frame);
    // Motion trails on retreat
    if (retreatP > 0) {
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = a * retreatP * (0.25 - i * 0.05);
        ctx.strokeStyle = FB.red;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(flyX + 8 + i * 5, cy - 3);
        ctx.lineTo(flyX + 12 + i * 5, cy + 3);
        ctx.stroke();
      }
    }
    // Text
    const t1 = interpolate(frame, [160, 185], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RUNS AWAY", cx, H * 0.72, 16, a * t1, "center", FB.red);
    drawFBText(ctx, "EVERY. SINGLE. TIME.", cx, H * 0.86, 8, a * t1, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: MN9 spike raster going from active to flatline ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2;
    drawFBText(ctx, "FEED NEURON (MN9)", cx, H * 0.07, 7, a, "center", FB.text.dim);
    const chartW = W * 0.7, chartH = H * 0.35;
    const chartX = cx - chartW / 2, chartY = H * 0.2;
    // Axis lines
    ctx.globalAlpha = a * 0.2;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.stroke();
    // Before: active spikes
    const rng = seeded(8206);
    const beforeP = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 18; i++) {
      const sx = chartX + (i / 18) * chartW * 0.45;
      const sh = (0.25 + rng() * 0.75) * chartH;
      if (i / 18 < beforeP) {
        ctx.globalAlpha = a * 0.6;
        ctx.fillStyle = FB.green;
        ctx.fillRect(sx, chartY + chartH - sh, 2, sh);
      }
    }
    drawFBText(ctx, "BEFORE", chartX + chartW * 0.22, chartY - 4, 6, a * beforeP, "center", FB.green);
    // After: flatline
    const afterP = interpolate(frame, [90, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * afterP * 0.5;
    ctx.strokeStyle = FB.red;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(chartX + chartW * 0.55, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();
    drawFBText(ctx, "AFTER", chartX + chartW * 0.77, chartY - 4, 6, a * afterP, "center", FB.red);
    // "0 Hz"
    const zP = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBCounter(ctx, "0 Hz", cx, H * 0.76, 20, FB.red, a * zP);
    drawFBText(ctx, "SILENCED", cx, H * 0.9, 9, a * zP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Split-screen normal fly eats vs brainwashed fly flees ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cy = H * 0.42;
    // Left: normal
    const leftP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NORMAL", W * 0.25, H * 0.08, 8, a * leftP, "center", FB.green);
    ctx.globalAlpha = a * leftP;
    ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.28, cy - 4, 8, 8);
    drawFBNode(ctx, W * 0.18, cy, 5, 3, a * leftP, frame);
    // Arrow toward food
    ctx.strokeStyle = FB.green;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = a * leftP * 0.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.21, cy);
    ctx.lineTo(W * 0.26, cy);
    ctx.stroke();
    drawFBText(ctx, "EATS", W * 0.25, cy + 14, 7, a * leftP, "center", FB.green);
    // Divider
    ctx.globalAlpha = a * 0.15;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, H * 0.04);
    ctx.lineTo(W / 2, H * 0.82);
    ctx.stroke();
    // Right: brainwashed
    const rightP = interpolate(frame, [65, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BRAINWASHED", W * 0.75, H * 0.08, 8, a * rightP, "center", FB.red);
    ctx.globalAlpha = a * rightP;
    ctx.fillStyle = FB.gold;
    ctx.fillRect(W * 0.72, cy - 4, 8, 8);
    drawFBNode(ctx, W * 0.85, cy, 5, 0, a * rightP, frame);
    // Arrow away from food
    ctx.strokeStyle = FB.red;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = a * rightP * 0.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.78, cy);
    ctx.lineTo(W * 0.83, cy);
    ctx.stroke();
    drawFBText(ctx, "FLEES", W * 0.75, cy + 14, 7, a * rightP, "center", FB.red);
    // Bottom
    const endP = interpolate(frame, [135, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SAME FLY. SAME FOOD.", W / 2, H * 0.88, 10, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Heartbeat trace with active spikes then flatline ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210);
    const cx = W / 2, cy = H * 0.4;
    drawFBText(ctx, "HUNGER RESPONSE", cx, H * 0.07, 8, a, "center", FB.text.dim);
    const traceP = interpolate(frame, [10, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const traceW = W * 0.8;
    const traceX = cx - traceW / 2;
    ctx.globalAlpha = a;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const flatAt = traceW * 0.55;
    for (let px = 0; px < traceW * traceP; px += 1.5) {
      const x = traceX + px;
      let y: number;
      if (px < flatAt) {
        ctx.strokeStyle = FB.green;
        const phase = px * 0.13;
        const spike = Math.sin(phase) > 0.65 ? Math.sin(phase * 3.2) * H * 0.1 : 0;
        y = cy - spike;
      } else {
        ctx.strokeStyle = FB.red;
        y = cy;
      }
      px === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Labels
    if (traceP > 0.6) {
      const fP = interpolate(frame, [100, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, "FLATLINE", cx + traceW * 0.2, cy + 18, 9, a * fP, "center", FB.red);
    }
    const endP = interpolate(frame, [165, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "NO HUNGER. NO FEEDING.", cx, H * 0.78, 10, a * endP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: "STILL ESCAPED. STILL GROOMED. STILL WALKED." then "RAN FROM FOOD" ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 210, 8, 20);
    const cx = W / 2;
    const lines = [
      { text: "STILL ESCAPED", fr: 10, color: FB.green },
      { text: "STILL GROOMED", fr: 40, color: FB.green },
      { text: "STILL WALKED", fr: 70, color: FB.green },
    ];
    lines.forEach((l, i) => {
      const t = interpolate(frame, [l.fr, l.fr + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.15 + i * H * 0.14;
      drawFBText(ctx, l.text, cx, y, 10, a * t, "center", l.color);
      // Checkmark dot
      if (t > 0.7) {
        ctx.globalAlpha = a * (t - 0.7) / 0.3;
        ctx.fillStyle = FB.green;
        ctx.beginPath();
        ctx.arc(cx + 50, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // "BUT" beat
    const butP = interpolate(frame, [110, 128], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BUT", cx, H * 0.62, 9, a * butP, "center", FB.text.dim);
    // "RAN FROM FOOD"
    const ranP = interpolate(frame, [135, 168], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "RAN FROM FOOD", cx, H * 0.76, 16, a * ranP, "center", FB.red);
    const evP = interpolate(frame, [170, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EVERY SINGLE TIME", cx, H * 0.9, 8, a * evP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_082: VariantDef[] = [
  { id: "fb-082-v1", label: "Four-lane gauntlet with reversal", component: V1 },
  { id: "fb-082-v2", label: "Three checks then red X slam", component: V2 },
  { id: "fb-082-v3", label: "Node obstacle course reversal", component: V3 },
  { id: "fb-082-v4", label: "Scorecard with fill bars", component: V4 },
  { id: "fb-082-v5", label: "Food close-up retreat trails", component: V5 },
  { id: "fb-082-v6", label: "MN9 spike raster flatline", component: V6 },
  { id: "fb-082-v7", label: "Split-screen normal vs brainwashed", component: V7 },
  { id: "fb-082-v8", label: "Heartbeat trace flatline", component: V8 },
  { id: "fb-082-v9", label: "Still escaped but ran from food", component: V9 },
];
