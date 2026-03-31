import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 53 — "That wiring diagram of a dead fly is walking with the same tripod gait a real fly uses." — 180 frames */

// ---------- V1: Six legs alternate tripod — 3 up, 3 down, switching ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const cx = W / 2, bodyY = H * 0.35;
    // Body ellipse
    const bodyP = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: "clamp" });
    const [hb, sb, lb] = cellHSL(4);
    ctx.globalAlpha = a * bodyP * 0.25; ctx.fillStyle = `hsl(${hb},${sb}%,${lb}%)`;
    ctx.beginPath(); ctx.ellipse(cx, bodyY, 30, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Six legs: L1,R2,L3 = group A; R1,L2,R3 = group B
    const legPhase = (frame * 0.04) % (Math.PI * 2);
    const legPositions = [
      { x: cx - 22, label: "L1", groupA: true },
      { x: cx - 8, label: "L2", groupA: false },
      { x: cx + 8, label: "L3", groupA: true },
      { x: cx + 22, label: "R1", groupA: false },
      { x: cx + 36, label: "R2", groupA: true },
      { x: cx - 36, label: "R3", groupA: false },
    ];
    for (let i = 0; i < legPositions.length; i++) {
      const leg = legPositions[i];
      const phase = leg.groupA ? legPhase : legPhase + Math.PI;
      const lift = Math.max(0, Math.sin(phase)) * 15;
      const footY = bodyY + 28 - lift;
      const ci = leg.groupA ? 3 : 1;
      // Leg line
      ctx.globalAlpha = a * bodyP * 0.4; ctx.strokeStyle = leg.groupA ? FB.green : FB.gold;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(leg.x, bodyY + 10); ctx.lineTo(leg.x, footY); ctx.stroke();
      // Foot dot
      drawFBNode(ctx, leg.x, footY, 3, ci, a * bodyP, frame);
    }
    // Labels
    const lp = interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "tripod gait", cx, H * 0.65, 12, a * lp, "center", FB.green);
    drawFBText(ctx, "3 legs down, 3 legs up", cx, H * 0.74, 8, a * lp, "center", FB.text.dim);
    const deadP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "from a dead fly's wiring", cx, H * 0.88, 9, a * deadP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Side view — three stance legs, three swing legs alternating ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const groundY = H * 0.65;
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
    // Walking body moves right
    const walkP = interpolate(frame, [10, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const bx = W * 0.15 + walkP * W * 0.6;
    const by = groundY - 22;
    // Body
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(bx, by, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
    // 3 legs per side, alternating stance/swing
    const phase = frame * 0.06;
    for (let i = 0; i < 3; i++) {
      const lx = bx - 12 + i * 12;
      const isSwing = Math.sin(phase + i * Math.PI) > 0;
      const footY = isSwing ? groundY - 8 : groundY;
      const ci = isSwing ? 3 : 1;
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = isSwing ? FB.green : FB.gold;
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx, by + 8); ctx.lineTo(lx, footY); ctx.stroke();
      drawFBNode(ctx, lx, footY, 2.5, ci, a, frame);
    }
    // Legend
    const legP = interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.1, H * 0.82, 3, 3, a * legP, frame);
    drawFBText(ctx, "swing", W * 0.1 + 10, H * 0.82, 7, a * legP, "left", FB.green);
    drawFBNode(ctx, W * 0.1, H * 0.88, 3, 1, a * legP, frame);
    drawFBText(ctx, "stance", W * 0.1 + 10, H * 0.88, 7, a * legP, "left", FB.gold);
    drawFBText(ctx, "tripod gait", W * 0.75, H * 0.82, 10, a, "center", FB.green);
    drawFBText(ctx, "dead fly's wiring, walking", W * 0.75, H * 0.9, 7, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Timing diagram — 6 rows, alternating high/low ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const labels = ["L1", "R2", "L3", "R1", "L2", "R3"];
    const groupA = [true, true, true, false, false, false];
    const drawP = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 6; i++) {
      const ly = H * 0.1 + i * H * 0.12;
      const isA = groupA[i];
      drawFBText(ctx, labels[i], W * 0.06, ly, 8, a * 0.6, "center", isA ? FB.green : FB.gold);
      // Square wave
      ctx.globalAlpha = a * drawP * 0.5; ctx.strokeStyle = isA ? FB.green : FB.gold; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < W * 0.82 * drawP; x += 1) {
        const t = x / (W * 0.82) * 6 * Math.PI + (isA ? 0 : Math.PI);
        const high = Math.sin(t) > 0;
        const wy = ly + (high ? -6 : 6);
        if (x === 0) ctx.moveTo(W * 0.12 + x, wy); else ctx.lineTo(W * 0.12 + x, wy);
      }
      ctx.stroke();
    }
    // Group brackets
    const brackP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * brackP * 0.2; ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W * 0.96, H * 0.1); ctx.lineTo(W * 0.98, H * 0.1);
    ctx.lineTo(W * 0.98, H * 0.34); ctx.lineTo(W * 0.96, H * 0.34); ctx.stroke();
    drawFBText(ctx, "A", W * 0.96, H * 0.22, 8, a * brackP, "center", FB.green);
    ctx.strokeStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(W * 0.96, H * 0.46); ctx.lineTo(W * 0.98, H * 0.46);
    ctx.lineTo(W * 0.98, H * 0.7); ctx.lineTo(W * 0.96, H * 0.7); ctx.stroke();
    drawFBText(ctx, "B", W * 0.96, H * 0.58, 8, a * brackP, "center", FB.gold);
    drawFBText(ctx, "tripod gait pattern", W / 2, H * 0.85, 10, a, "center", FB.teal);
    drawFBText(ctx, "same as a real fly", W / 2, H * 0.92, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Top-down view — triangle of dots for each tripod group ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const cx = W / 2, cy = H * 0.4;
    // Body
    ctx.globalAlpha = a * 0.2; ctx.fillStyle = FB.teal;
    ctx.beginPath(); ctx.ellipse(cx, cy, 22, 14, 0, 0, Math.PI * 2); ctx.fill();
    // Group A triangle: L1, R2, L3
    const groupALegs = [
      { x: cx - 30, y: cy - 10 }, { x: cx + 30, y: cy }, { x: cx - 30, y: cy + 10 },
    ];
    const groupBLegs = [
      { x: cx + 30, y: cy - 10 }, { x: cx - 30, y: cy }, { x: cx + 30, y: cy + 10 },
    ];
    const phase = Math.sin(frame * 0.04) > 0;
    const aDown = phase, bDown = !phase;
    // Draw triangles
    const triP = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Group A
    ctx.globalAlpha = a * triP * (aDown ? 0.4 : 0.15);
    ctx.strokeStyle = FB.green; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(groupALegs[0].x, groupALegs[0].y);
    ctx.lineTo(groupALegs[1].x, groupALegs[1].y);
    ctx.lineTo(groupALegs[2].x, groupALegs[2].y);
    ctx.closePath(); ctx.stroke();
    for (const g of groupALegs) drawFBNode(ctx, g.x, g.y, aDown ? 5 : 3, 3, a * triP * (aDown ? 1 : 0.4), frame);
    // Group B
    ctx.globalAlpha = a * triP * (bDown ? 0.4 : 0.15);
    ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(groupBLegs[0].x, groupBLegs[0].y);
    ctx.lineTo(groupBLegs[1].x, groupBLegs[1].y);
    ctx.lineTo(groupBLegs[2].x, groupBLegs[2].y);
    ctx.closePath(); ctx.stroke();
    for (const g of groupBLegs) drawFBNode(ctx, g.x, g.y, bDown ? 5 : 3, 1, a * triP * (bDown ? 1 : 0.4), frame);
    // Labels
    drawFBText(ctx, "tripod A", W * 0.15, H * 0.68, 9, a, "center", FB.green);
    drawFBText(ctx, "tripod B", W * 0.85, H * 0.68, 9, a, "center", FB.gold);
    drawFBText(ctx, "dead fly's brain, real fly's gait", cx, H * 0.88, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: "DEAD" label fades into walking animation ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // "DEAD" fades
    const deadP = interpolate(frame, [5, 30, 60, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "DEAD", W / 2, H * 0.2, 20, a * deadP, "center", FB.text.dim);
    drawFBText(ctx, "wiring diagram", W / 2, H * 0.32, 9, a * deadP, "center", FB.text.dim);
    // "WALKING" appears
    const walkP = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WALKING", W / 2, H * 0.2, 20, a * walkP, "center", FB.green);
    // Animated legs below
    if (walkP > 0) {
      const groundY = H * 0.7;
      ctx.globalAlpha = a * walkP * 0.12; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.1, groundY); ctx.lineTo(W * 0.9, groundY); ctx.stroke();
      const bx = W / 2, by = groundY - 20;
      ctx.globalAlpha = a * walkP * 0.2; ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.ellipse(bx, by, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
      const phase = frame * 0.06;
      for (let i = 0; i < 6; i++) {
        const lx = bx - 15 + i * 6;
        const isSwing = Math.sin(phase + (i < 3 ? 0 : Math.PI)) > 0;
        const footY = isSwing ? groundY - 6 : groundY;
        ctx.globalAlpha = a * walkP * 0.4; ctx.strokeStyle = isSwing ? FB.green : FB.gold;
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx, by + 8); ctx.lineTo(lx, footY); ctx.stroke();
      }
    }
    drawFBText(ctx, "same tripod gait as a real fly", W / 2, H * 0.88, 9, a * walkP, "center", FB.teal);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Split — "REAL FLY" vs "SIMULATION" with matching gait bars ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    ctx.globalAlpha = a * 0.12; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.85); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "REAL FLY", W * 0.25, H * 0.06, 10, a, "center", FB.teal);
    drawFBText(ctx, "SIMULATION", W * 0.75, H * 0.06, 10, a, "center", FB.green);
    // Both sides: identical gait bars
    const drawP = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let side = 0; side < 2; side++) {
      const sx = side === 0 ? W * 0.05 : W * 0.55;
      const barW = W * 0.38;
      for (let i = 0; i < 6; i++) {
        const ly = H * 0.15 + i * H * 0.1;
        const isA = i < 3;
        const phase = isA ? 0 : Math.PI;
        ctx.globalAlpha = a * drawP * 0.4;
        ctx.strokeStyle = isA ? FB.green : FB.gold; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < barW * drawP; x += 2) {
          const t = x / barW * 4 * Math.PI + phase;
          const high = Math.sin(t) > 0;
          const wy = ly + (high ? -4 : 4);
          if (x === 0) ctx.moveTo(sx + x, wy); else ctx.lineTo(sx + x, wy);
        }
        ctx.stroke();
      }
    }
    // "=" between
    const eqP = interpolate(frame, [90, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "=", W / 2, H * 0.45, 20, a * eqP, "center", FB.gold);
    drawFBText(ctx, "same tripod gait", W / 2, H * 0.88, 10, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Footprint trail — alternating triangles along a path ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    const trailP = interpolate(frame, [10, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const numPrints = Math.floor(trailP * 12);
    for (let i = 0; i < numPrints; i++) {
      const px = W * 0.08 + (i / 12) * W * 0.84;
      const isA = i % 2 === 0;
      const py = H * 0.4 + (isA ? -8 : 8);
      // Three-dot triangle footprint
      const size = 4;
      const [h, s, l] = cellHSL(isA ? 3 : 1);
      ctx.globalAlpha = a * 0.4; ctx.fillStyle = `hsl(${h},${s}%,${l}%)`;
      ctx.beginPath(); ctx.arc(px, py - size, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px - size, py + size, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px + size, py + size, 2, 0, Math.PI * 2); ctx.fill();
    }
    // Flying dot at trail head
    if (trailP < 1) {
      const headX = W * 0.08 + trailP * W * 0.84;
      drawFBNode(ctx, headX, H * 0.4, 6, 4, a, frame);
    }
    drawFBText(ctx, "tripod A", W * 0.12, H * 0.22, 8, a, "center", FB.green);
    drawFBText(ctx, "tripod B", W * 0.12, H * 0.58, 8, a, "center", FB.gold);
    drawFBText(ctx, "dead fly walking with a real fly's gait", W / 2, H * 0.82, 9, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Network on left morphs into walking legs on right ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // Network cluster on left (wiring diagram)
    const netP = interpolate(frame, [5, 35], [0, 1], { extrapolateRight: "clamp" });
    const rng = seeded(5307);
    for (let i = 0; i < 12; i++) {
      const nx = W * 0.05 + rng() * W * 0.3;
      const ny = H * 0.1 + rng() * H * 0.6;
      drawFBNode(ctx, nx, ny, 3, i % 8, a * netP * 0.5, frame);
    }
    drawFBText(ctx, "wiring", W * 0.2, H * 0.78, 9, a * netP, "center", FB.purple);
    drawFBText(ctx, "diagram", W * 0.2, H * 0.86, 9, a * netP, "center", FB.purple);
    // Arrow
    const arrP = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP * 0.3; ctx.strokeStyle = FB.gold; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W * 0.4, H * 0.4); ctx.lineTo(W * 0.55, H * 0.4); ctx.stroke();
    ctx.fillStyle = FB.gold;
    ctx.beginPath(); ctx.moveTo(W * 0.55, H * 0.4); ctx.lineTo(W * 0.52, H * 0.37); ctx.lineTo(W * 0.52, H * 0.43); ctx.fill();
    // Walking animation on right
    const walkP = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (walkP > 0) {
      const bx = W * 0.72, by = H * 0.38;
      ctx.globalAlpha = a * walkP * 0.2; ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.ellipse(bx, by, 18, 10, 0, 0, Math.PI * 2); ctx.fill();
      const phase = frame * 0.06;
      for (let i = 0; i < 6; i++) {
        const lx = bx - 15 + i * 6;
        const isSwing = Math.sin(phase + (i < 3 ? 0 : Math.PI)) > 0;
        const footY = by + 18 - (isSwing ? 8 : 0);
        ctx.globalAlpha = a * walkP * 0.5; ctx.strokeStyle = isSwing ? FB.green : FB.gold;
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(lx, by + 8); ctx.lineTo(lx, footY); ctx.stroke();
      }
      drawFBText(ctx, "tripod gait", W * 0.72, H * 0.62, 9, a * walkP, "center", FB.green);
    }
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Heartbeat-style monitor showing tripod rhythm ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 180);
    // Two traces — group A and group B
    const traceP = interpolate(frame, [10, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const drawTrace = (cy: number, phase: number, color: string, label: string) => {
      ctx.globalAlpha = a * 0.5; ctx.strokeStyle = color; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < W * 0.85 * traceP; x += 2) {
        const t = x * 0.05 + phase;
        const v = Math.sin(t) > 0 ? -12 : 12;
        const wy = cy + v;
        if (x === 0) ctx.moveTo(W * 0.08 + x, wy); else ctx.lineTo(W * 0.08 + x, wy);
      }
      ctx.stroke();
      drawFBText(ctx, label, W * 0.04, cy, 7, a * 0.6, "center", color);
    };
    drawTrace(H * 0.3, 0, FB.green, "A");
    drawTrace(H * 0.55, Math.PI, FB.gold, "B");
    // "Anti-phase" annotation
    const annP = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * annP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(W * 0.5, H * 0.2); ctx.lineTo(W * 0.5, H * 0.68); ctx.stroke();
    ctx.setLineDash([]);
    drawFBText(ctx, "anti-phase", W * 0.5, H * 0.72, 8, a * annP, "center", FB.text.dim);
    drawFBText(ctx, "tripod gait", W / 2, H * 0.82, 12, a, "center", FB.teal);
    drawFBText(ctx, "dead fly's brain, real fly's walk", W / 2, H * 0.92, 8, a, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_053: VariantDef[] = [
  { id: "fb-053-v1", label: "Six legs alternating tripod groups", component: V1 },
  { id: "fb-053-v2", label: "Side view walking with stance and swing", component: V2 },
  { id: "fb-053-v3", label: "Timing diagram with square waves", component: V3 },
  { id: "fb-053-v4", label: "Top-down triangles for each tripod", component: V4 },
  { id: "fb-053-v5", label: "DEAD label fades into walking animation", component: V5 },
  { id: "fb-053-v6", label: "Real fly vs simulation same gait", component: V6 },
  { id: "fb-053-v7", label: "Footprint trail with alternating triangles", component: V7 },
  { id: "fb-053-v8", label: "Network morphs into walking legs", component: V8 },
  { id: "fb-053-v9", label: "Heartbeat monitor showing tripod rhythm", component: V9 },
];
