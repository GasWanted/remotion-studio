import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob } from "./flatbold-kit";

/* Shot 86 — "If we can do it to a fly... what about us? FEAR/CRAVING/MEMORY dials, flip the weight" — 450 frames */

// ---------- V1: Fly morphs into human silhouette, three dials appear ----------
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    // Phase 1: Fly cell
    const flyP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyFade = interpolate(frame, [80, 120], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flyFade > 0) {
      drawFBNode(ctx, cx, H * 0.3, 10 * flyP, 4, a * flyFade, frame);
      drawFBText(ctx, "FLY", cx, H * 0.48, 10, a * flyP * flyFade, "center", FB.teal);
    }
    // Phase 2: Human silhouette
    const humanP = interpolate(frame, [100, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (humanP > 0) {
      drawPersonBlob(ctx, cx, H * 0.28, 22 * humanP, 0, a * humanP);
      drawFBText(ctx, "YOU", cx, H * 0.48, 12, a * humanP, "center", FB.red);
    }
    // Phase 3: Three dials
    const dials = [
      { label: "FEAR", ci: 0, t0: 180 },
      { label: "CRAVING", ci: 2, t0: 230 },
      { label: "MEMORY", ci: 6, t0: 280 },
    ];
    dials.forEach((dial, i) => {
      const t = interpolate(frame, [dial.t0, dial.t0 + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = cx - 30 + i * 30;
      const y = H * 0.65;
      // Dial arc
      const [h, s, l] = cellHSL(dial.ci);
      ctx.globalAlpha = a * t * 0.3;
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 10, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();
      // Needle sweeping
      const needleAng = Math.PI * 0.8 + t * Math.PI * 1.4;
      ctx.globalAlpha = a * t * 0.7;
      ctx.strokeStyle = FB.colors[dial.ci];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(needleAng) * 8, y + Math.sin(needleAng) * 8);
      ctx.stroke();
      drawFBText(ctx, dial.label, x, y + 16, 6, a * t, "center", FB.colors[dial.ci]);
    });
    // "FLIP THE WEIGHT"
    const flipP = interpolate(frame, [350, 390], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLIP", cx, H * 0.84, 12, a * flipP, "center", FB.text.dim);
    drawFBText(ctx, "THE WEIGHT", cx, H * 0.93, 14, a * flipP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V2: Three weight sliders — FEAR / CRAVING / MEMORY — being flipped ----------
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    // "What if it were you?"
    const introP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const introFade = interpolate(frame, [80, 110], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHAT IF IT WERE", cx, H * 0.15, 9, a * introP * introFade, "center", FB.text.primary);
    drawFBText(ctx, "YOU?", cx, H * 0.28, 16, a * introP * introFade, "center", FB.red);
    // Sliders
    const sliders = [
      { label: "FEAR", color: FB.red, t0: 120, flipT0: 300 },
      { label: "CRAVING", color: FB.gold, t0: 170, flipT0: 330 },
      { label: "MEMORY", color: FB.purple, t0: 220, flipT0: 360 },
    ];
    const sliderW = W * 0.5;
    sliders.forEach((sl, i) => {
      const t = interpolate(frame, [sl.t0, sl.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const flipP = interpolate(frame, [sl.flipT0, sl.flipT0 + 25], [0.7, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.35 + i * H * 0.16;
      // Track
      ctx.globalAlpha = a * t * 0.12;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(cx - sliderW / 2, y - 3, sliderW, 6);
      // Fill
      ctx.globalAlpha = a * t * 0.35;
      ctx.fillStyle = sl.color;
      ctx.fillRect(cx - sliderW / 2, y - 3, sliderW * flipP, 6);
      // Thumb
      ctx.globalAlpha = a * t * 0.8;
      ctx.fillStyle = sl.color;
      ctx.beginPath();
      ctx.arc(cx - sliderW / 2 + sliderW * flipP, y, 4, 0, Math.PI * 2);
      ctx.fill();
      // Label
      drawFBText(ctx, sl.label, cx - sliderW / 2 - 4, y, 7, a * t, "right", sl.color);
    });
    // "FLIP THE WEIGHT" final text
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "JUST... FLIP THE WEIGHT", cx, H * 0.9, 10, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V3: Brain network with labeled regions being toggled ----------
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2, cy = H * 0.38;
    // Human brain as network
    const netP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(8600);
    const nodes: { x: number; y: number; ci: number }[] = [];
    for (let i = 0; i < 12; i++) {
      nodes.push({
        x: cx + (rng() - 0.5) * W * 0.6,
        y: cy + (rng() - 0.5) * H * 0.4,
        ci: i % 8,
      });
    }
    // Edges
    for (let i = 0; i < 14; i++) {
      const a1 = Math.floor(rng() * 12);
      const a2 = Math.floor(rng() * 12);
      if (a1 !== a2) {
        drawFBEdge(ctx, nodes[a1].x, nodes[a1].y, nodes[a2].x, nodes[a2].y, 1, a * netP * 0.15, frame);
      }
    }
    for (const n of nodes) {
      drawFBNode(ctx, n.x, n.y, 3, n.ci, a * netP * 0.5, frame);
    }
    // Three highlighted regions
    const regions = [
      { label: "FEAR", x: cx - 25, y: cy - 15, ci: 0, t0: 100, flipT: 300 },
      { label: "CRAVING", x: cx + 5, y: cy + 10, ci: 2, t0: 160, flipT: 340 },
      { label: "MEMORY", x: cx + 25, y: cy - 5, ci: 6, t0: 220, flipT: 380 },
    ];
    regions.forEach((r) => {
      const t = interpolate(frame, [r.t0, r.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const flipped = frame > r.flipT;
      const flipA = interpolate(frame, [r.flipT, r.flipT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Highlight circle
      const [h, s, l] = cellHSL(r.ci);
      ctx.globalAlpha = a * t * 0.15;
      ctx.strokeStyle = `hsla(${h}, ${s}%, ${l}%, 0.5)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      // Label with flip state
      const color = flipped ? FB.text.dim : FB.colors[r.ci];
      drawFBText(ctx, r.label, r.x, r.y + 16, 6, a * t, "center", color);
      // Flip indicator
      if (flipped) {
        drawFBText(ctx, "FLIPPED", r.x, r.y + 24, 4, a * flipA * 0.6, "center", FB.red);
      }
    });
    // Bottom text
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "YOUR DEEPEST SELF", cx, H * 0.82, 10, a * endP, "center", FB.text.primary);
    drawFBText(ctx, "EDITABLE", cx, H * 0.92, 14, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V4: Weight value flipping: +1.0 → -1.0, dramatic ----------
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    // Context: fly → human
    const flyP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flyFade = interpolate(frame, [60, 85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IF A FLY...", cx, H * 0.15, 10, a * flyP * flyFade, "center", FB.teal);
    const humanP = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHAT ABOUT YOU?", cx, H * 0.15, 10, a * humanP, "center", FB.red);
    // Three weights
    const weights = [
      { label: "FEAR", t0: 130, flipT0: 280 },
      { label: "CRAVING", t0: 180, flipT0: 320 },
      { label: "MEMORY", t0: 230, flipT0: 360 },
    ];
    weights.forEach((w, i) => {
      const t = interpolate(frame, [w.t0, w.t0 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const flipP = interpolate(frame, [w.flipT0, w.flipT0 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.28 + i * H * 0.18;
      drawFBText(ctx, w.label, cx - 30, y, 9, a * t, "right", FB.text.primary);
      // Weight value flipping from +1.0 to -1.0
      const val = interpolate(flipP, [0, 1], [1.0, -1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const color = val > 0 ? FB.green : FB.red;
      drawFBCounter(ctx, val.toFixed(1), cx + 15, y, 14, color, a * t);
      // Flip flash
      if (flipP > 0 && flipP < 0.3) {
        ctx.globalAlpha = a * (0.3 - flipP) * 2;
        ctx.fillStyle = FB.gold;
        ctx.fillRect(cx - 5, y - 8, 40, 16);
      }
    });
    // Final
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "JUST... FLIP THE WEIGHT", cx, H * 0.88, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V5: Human silhouette with glowing internal nodes being switched ----------
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    // Human outline (simple head + shoulders)
    const outlineP = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * outlineP * 0.15;
    ctx.strokeStyle = FB.text.dim;
    ctx.lineWidth = 1;
    // Head circle
    ctx.beginPath();
    ctx.arc(cx, H * 0.22, 14, 0, Math.PI * 2);
    ctx.stroke();
    // Body/shoulders
    ctx.beginPath();
    ctx.moveTo(cx - 20, H * 0.38);
    ctx.quadraticCurveTo(cx, H * 0.32, cx + 20, H * 0.38);
    ctx.lineTo(cx + 25, H * 0.58);
    ctx.lineTo(cx - 25, H * 0.58);
    ctx.closePath();
    ctx.stroke();
    // Internal glowing points
    const points = [
      { label: "FEAR", x: cx - 6, y: H * 0.2, ci: 0, t0: 80, switchT: 280 },
      { label: "CRAVING", x: cx + 6, y: H * 0.2, ci: 2, t0: 140, switchT: 330 },
      { label: "MEMORY", x: cx, y: H * 0.26, ci: 6, t0: 200, switchT: 380 },
    ];
    points.forEach((p) => {
      const t = interpolate(frame, [p.t0, p.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const switched = frame > p.switchT;
      const switchP = interpolate(frame, [p.switchT, p.switchT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Glow
      const [h, s, l] = cellHSL(switched ? 0 : p.ci);
      ctx.globalAlpha = a * t * 0.1;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
      glow.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0.5)`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - 10, p.y - 10, 20, 20);
      // Dot
      drawFBNode(ctx, p.x, p.y, 3, switched ? 0 : p.ci, a * t, frame);
      // Label below silhouette
      const labelY = H * 0.62 + points.indexOf(p) * H * 0.08;
      drawFBText(ctx, p.label, cx, labelY, 7, a * t, "center", switched ? FB.red : FB.colors[p.ci]);
      if (switched) {
        drawFBText(ctx, "SWITCHED", cx + 30, labelY, 5, a * switchP * 0.5, "left", FB.red);
      }
    });
    // Bottom
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLIP THE WEIGHT", cx, H * 0.9, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V6: Scale comparison — tiny fly node next to huge human node ----------
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cy = H * 0.35;
    // Fly node (small)
    const flyP = interpolate(frame, [10, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.25, cy, 6 * flyP, 4, a * flyP, frame);
    drawFBText(ctx, "FLY", W * 0.25, cy + 14, 8, a * flyP, "center", FB.teal);
    drawFBText(ctx, "139K", W * 0.25, cy + 22, 5, a * flyP * 0.5, "center", FB.text.dim);
    // Arrow
    const arrP = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * arrP * 0.3;
    ctx.strokeStyle = FB.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.35, cy);
    ctx.lineTo(W * 0.55, cy);
    ctx.stroke();
    drawFBText(ctx, "?", W * 0.45, cy - 8, 10, a * arrP, "center", FB.gold);
    // Human node (huge)
    const humanP = interpolate(frame, [80, 140], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBNode(ctx, W * 0.75, cy, 25 * humanP, 0, a * humanP, frame);
    drawFBText(ctx, "HUMAN", W * 0.75, cy + 32, 10, a * humanP, "center", FB.red);
    drawFBText(ctx, "86B", W * 0.75, cy + 42, 6, a * humanP * 0.5, "center", FB.text.dim);
    // Dials appearing
    const dials = [
      { label: "FEAR", t0: 180 },
      { label: "CRAVING", t0: 230 },
      { label: "MEMORY", t0: 280 },
    ];
    dials.forEach((d, i) => {
      const t = interpolate(frame, [d.t0, d.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const x = W * 0.3 + i * W * 0.2;
      drawFBText(ctx, d.label, x, H * 0.72, 8, a * t, "center", FB.colors[i === 0 ? 0 : i === 1 ? 2 : 6]);
    });
    // End
    const endP = interpolate(frame, [370, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FIND THE CONNECTIONS", W / 2, H * 0.84, 8, a * endP, "center", FB.text.dim);
    drawFBText(ctx, "FLIP THE WEIGHT", W / 2, H * 0.93, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V7: Toggle switches — ON/OFF for each emotion ----------
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    drawPersonBlob(ctx, cx, H * 0.14, 16, 0, a * interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const toggles = [
      { label: "YOUR DEEPEST FEAR", ci: 0, t0: 60, flipT: 280 },
      { label: "YOUR GREATEST CRAVING", ci: 2, t0: 120, flipT: 330 },
      { label: "YOUR MOST PRIVATE MEMORY", ci: 6, t0: 180, flipT: 380 },
    ];
    toggles.forEach((tg, i) => {
      const t = interpolate(frame, [tg.t0, tg.t0 + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const flipP = interpolate(frame, [tg.flipT, tg.flipT + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.32 + i * H * 0.16;
      const isOn = flipP < 0.5;
      // Toggle track
      const trackW = 18, trackH = 8;
      ctx.globalAlpha = a * t * 0.2;
      ctx.fillStyle = isOn ? FB.green : FB.red;
      const rx = cx + 35;
      ctx.beginPath();
      ctx.arc(rx - trackW / 2 + trackH / 2, y, trackH / 2, Math.PI / 2, Math.PI * 1.5);
      ctx.arc(rx + trackW / 2 - trackH / 2, y, trackH / 2, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      // Thumb
      const thumbX = isOn ? rx + trackW / 2 - trackH / 2 : rx - trackW / 2 + trackH / 2;
      ctx.globalAlpha = a * t * 0.7;
      ctx.fillStyle = isOn ? FB.green : FB.red;
      ctx.beginPath();
      ctx.arc(thumbX, y, trackH / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      // Label
      drawFBText(ctx, tg.label, cx + 20, y, 6, a * t, "right", FB.colors[tg.ci]);
    });
    // Bottom
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "JUST...", cx, H * 0.82, 9, a * endP, "center", FB.text.dim);
    drawFBText(ctx, "FLIP THE WEIGHT", cx, H * 0.92, 14, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V8: Three words appearing in void, each FLIPPED and crossed out ----------
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, W, H, frame);
    const a = fadeInOut(frame, 450, 8, 30);
    const cx = W / 2;
    // "IF A FLY..." → "WHAT ABOUT US?"
    const t0 = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const t0Fade = interpolate(frame, [60, 85], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "IF A FLY...", cx, H * 0.12, 9, a * t0 * t0Fade, "center", FB.teal);
    const t1 = interpolate(frame, [55, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "WHAT ABOUT US?", cx, H * 0.12, 10, a * t1, "center", FB.red);
    // Three concepts
    const concepts = [
      { text: "FEAR", t0: 110, flipT: 260, color: FB.red },
      { text: "CRAVING", t0: 170, flipT: 310, color: FB.gold },
      { text: "MEMORY", t0: 230, flipT: 360, color: FB.purple },
    ];
    concepts.forEach((c, i) => {
      const t = interpolate(frame, [c.t0, c.t0 + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const y = H * 0.3 + i * H * 0.15;
      drawFBText(ctx, c.text, cx, y, 14, a * t, "center", c.color);
      // Strikethrough after flip
      const sP = interpolate(frame, [c.flipT, c.flipT + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sP > 0) {
        ctx.globalAlpha = a * sP * 0.6;
        ctx.fillStyle = FB.text.dim;
        ctx.fillRect(cx - 35, y, 70 * sP, 2);
      }
    });
    // "GONE" / "FLIPPED"
    const goneP = interpolate(frame, [380, 410], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLIPPED", cx, H * 0.78, 16, a * goneP, "center", FB.red);
    drawFBText(ctx, "JUST LIKE THAT", cx, H * 0.9, 8, a * goneP, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

// ---------- V9: Haunting slow text, almost black — meditative dread ----------
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    // Darker than normal background
    drawFBBg(ctx, W, H, frame);
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#0a0710";
    ctx.fillRect(0, 0, W, H);
    const a = fadeInOut(frame, 450, 15, 40);
    const cx = W / 2;
    const lines = [
      { text: "AND IF WE CAN", t0: 20, t1: 80, color: FB.text.dim, size: 8 },
      { text: "DO THAT TO A FLY", t0: 50, t1: 110, color: FB.teal, size: 10 },
      { text: "WHAT HAPPENS", t0: 100, t1: 180, color: FB.text.primary, size: 9 },
      { text: "WHEN WE CAN DO IT", t0: 140, t1: 220, color: FB.text.primary, size: 9 },
      { text: "TO US?", t0: 190, t1: 300, color: FB.red, size: 16 },
      { text: "YOUR DEEPEST FEAR", t0: 260, t1: 340, color: FB.red, size: 8 },
      { text: "YOUR GREATEST CRAVING", t0: 300, t1: 380, color: FB.gold, size: 8 },
      { text: "YOUR MOST PRIVATE MEMORY", t0: 340, t1: 420, color: FB.purple, size: 8 },
    ];
    lines.forEach((l) => {
      const fadeIn = interpolate(frame, [l.t0, l.t0 + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const fadeOut = interpolate(frame, [l.t1, l.t1 + 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const vis = Math.min(fadeIn, fadeOut);
      if (vis > 0) {
        drawFBText(ctx, l.text, cx, H * 0.4, l.size, a * vis, "center", l.color);
      }
    });
    // Final persistent
    const endP = interpolate(frame, [400, 435], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "FLIP THE WEIGHT", cx, H * 0.85, 12, a * endP, "center", FB.red);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} />;
};

export const VARIANTS_FB_086: VariantDef[] = [
  { id: "fb-086-v1", label: "Fly morphs to human three dials", component: V1 },
  { id: "fb-086-v2", label: "Three weight sliders flipping", component: V2 },
  { id: "fb-086-v3", label: "Brain network regions toggled", component: V3 },
  { id: "fb-086-v4", label: "Weight value plus to minus flip", component: V4 },
  { id: "fb-086-v5", label: "Human silhouette internal switches", component: V5 },
  { id: "fb-086-v6", label: "Scale fly vs human node", component: V6 },
  { id: "fb-086-v7", label: "Toggle switches for emotions", component: V7 },
  { id: "fb-086-v8", label: "Words appearing then struck through", component: V8 },
  { id: "fb-086-v9", label: "Haunting slow text meditative dread", component: V9 },
];
