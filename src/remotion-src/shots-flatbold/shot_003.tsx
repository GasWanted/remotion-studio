// Shot 003 — "Think about a fruit fly... It's a speck of dust that flies around annoying you."
// Duration: 143 frames (~4.7s)
// CONCEPT: Orange dot with tiny wings does circles leaving orange trail → lands → trail fades →
//          magnifying glass slides across screen onto the fly → zooms in showing detailed fly
// 9 variations on timing, circle patterns, glass entry direction, landing spot

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, fadeInOut, cellHSL } from "./flatbold-kit";

const ORANGE = "#F1948A";
const ORANGE_BRIGHT = "#FF8C6B";
const DUR = 143;

/** Draw tiny fly: orange dot with two small wing lines */
function drawTinyFly(ctx: CanvasRenderingContext2D, x: number, y: number, sc: number, angle: number, alpha: number, wingPhase: number) {
  ctx.globalAlpha = alpha;
  // Body dot
  ctx.fillStyle = ORANGE_BRIGHT;
  ctx.beginPath(); ctx.arc(x, y, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
  // Two wings — flapping based on wingPhase
  const wingAngle = Math.sin(wingPhase) * 0.6;
  const wingLen = 4 * sc;
  ctx.strokeStyle = `rgba(255, 200, 160, ${alpha * 0.6})`;
  ctx.lineWidth = 1 * sc; ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    const wa = angle + Math.PI / 2 * side + wingAngle * side;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(wa) * wingLen, y + Math.sin(wa) * wingLen);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Draw detailed fly inside magnifier lens */
function drawDetailedFly(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, sc: number, frame: number, alpha: number) {
  if (size < 2 || alpha < 0.01) return;
  ctx.globalAlpha = alpha;
  const s = size;
  const [ah, as, al] = cellHSL(1); // orange tones

  // Abdomen
  const abdGrad = ctx.createRadialGradient(cx - s * 0.05, cy + s * 0.08, 0, cx, cy + s * 0.12, s * 0.3);
  abdGrad.addColorStop(0, `hsla(${ah}, ${as + 5}%, ${Math.min(85, al + 20)}%, ${alpha})`);
  abdGrad.addColorStop(0.6, `hsla(${ah}, ${as}%, ${al}%, ${alpha})`);
  abdGrad.addColorStop(1, `hsla(${ah}, ${as}%, ${al - 8}%, ${alpha * 0.9})`);
  ctx.fillStyle = abdGrad;
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.12, s * 0.28, s * 0.38, 0, 0, Math.PI * 2); ctx.fill();

  // Thorax
  const thorGrad = ctx.createRadialGradient(cx, cy - s * 0.18, 0, cx, cy - s * 0.18, s * 0.18);
  thorGrad.addColorStop(0, `hsla(${ah}, ${as}%, ${al + 15}%, ${alpha})`);
  thorGrad.addColorStop(1, `hsla(${ah}, ${as}%, ${al}%, ${alpha})`);
  ctx.fillStyle = thorGrad;
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.18, s * 0.18, s * 0.16, 0, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = `hsla(${ah}, ${as}%, ${al + 8}%, ${alpha})`;
  const headR = s * 0.13;
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.38, headR, headR * 0.85, 0, 0, Math.PI * 2); ctx.fill();

  // Compound eyes
  const [eh, es, el] = cellHSL(0);
  const eyeR = headR * 0.65;
  for (const side of [-1, 1]) {
    const ex = cx + side * headR * 0.75, ey = cy - s * 0.39;
    const eyeG = ctx.createRadialGradient(ex - eyeR * 0.15 * side, ey - eyeR * 0.15, 0, ex, ey, eyeR);
    eyeG.addColorStop(0, `hsla(${eh}, ${es + 10}%, ${el + 18}%, ${alpha})`);
    eyeG.addColorStop(0.7, `hsla(${eh}, ${es}%, ${el}%, ${alpha})`);
    eyeG.addColorStop(1, `hsla(${eh}, ${es}%, ${el - 8}%, ${alpha})`);
    ctx.fillStyle = eyeG;
    ctx.beginPath(); ctx.ellipse(ex, ey, eyeR, eyeR * 1.15, side * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,255,255,${alpha * 0.35})`;
    ctx.beginPath(); ctx.arc(ex - side * eyeR * 0.2, ey - eyeR * 0.3, eyeR * 0.22, 0, Math.PI * 2); ctx.fill();
  }

  // Wings
  const wFlutter = Math.sin(frame * 0.5) * 0.18;
  for (const side of [-1, 1]) {
    ctx.fillStyle = `hsla(30, 40%, 80%, ${alpha * 0.18})`;
    ctx.strokeStyle = `hsla(30, 40%, 80%, ${alpha * 0.1})`;
    ctx.lineWidth = 0.5 * sc;
    ctx.beginPath();
    ctx.ellipse(cx + side * s * 0.22, cy - s * 0.12, s * 0.28, s * 0.09, side * (-0.25 + wFlutter), 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

  // Legs
  ctx.strokeStyle = `hsla(${ah}, ${as}%, ${al - 5}%, ${alpha * 0.55})`;
  ctx.lineWidth = Math.max(0.5, 0.7 * sc); ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    for (let l = 0; l < 3; l++) {
      const bx = cx + side * s * 0.1, by = cy - s * 0.05 + l * s * 0.14;
      const kx = bx + side * s * 0.17, ky = by + s * 0.06;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(kx, ky); ctx.lineTo(kx + side * s * 0.07, ky + s * 0.07); ctx.stroke();
    }
  }

  // Antennae
  ctx.strokeStyle = `hsla(${ah}, ${as}%, ${al}%, ${alpha * 0.45})`;
  ctx.lineWidth = Math.max(0.4, 0.5 * sc);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * headR * 0.3, cy - s * 0.44);
    ctx.quadraticCurveTo(cx + side * s * 0.1, cy - s * 0.2, cx + side * s * 0.14, cy - s * 0.22);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Draw magnifying glass rim + handle */
function drawMagGlass(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sc: number, alpha: number) {
  ctx.globalAlpha = alpha;
  const [rh, rs, rl] = cellHSL(4);
  ctx.strokeStyle = `hsla(${rh}, ${rs}%, ${rl + 10}%, ${alpha * 0.4})`;
  ctx.lineWidth = 5 * sc;
  ctx.beginPath(); ctx.arc(cx, cy, r + 1 * sc, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = `hsla(${rh}, ${rs}%, ${rl + 20}%, ${alpha})`;
  ctx.lineWidth = 3 * sc;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  const ha = Math.PI * 0.75;
  ctx.strokeStyle = `hsla(${rh}, ${rs - 10}%, ${rl}%, ${alpha})`;
  ctx.lineWidth = 5 * sc; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx + Math.cos(ha) * r, cy + Math.sin(ha) * r);
  ctx.lineTo(cx + Math.cos(ha) * r * 1.55, cy + Math.sin(ha) * r * 1.55); ctx.stroke();
  ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.1})`;
  ctx.lineWidth = 1.5 * sc;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, -Math.PI * 0.6, -Math.PI * 0.15); ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Lens interior with matching bg + detailed fly */
function drawLensContent(ctx: CanvasRenderingContext2D, mx: number, my: number, r: number, sc: number, frame: number, alpha: number, flyAlpha: number) {
  ctx.save();
  ctx.beginPath(); ctx.arc(mx, my, Math.max(1, r - 2 * sc), 0, Math.PI * 2); ctx.clip();
  const bg = ctx.createRadialGradient(mx, my, 0, mx, my, r);
  bg.addColorStop(0, "#352a45"); bg.addColorStop(0.7, "#281e38"); bg.addColorStop(1, "#1e1528");
  ctx.fillStyle = bg; ctx.fillRect(mx - r, my - r, r * 2, r * 2);
  const glow = ctx.createRadialGradient(mx, my, r * 0.2, mx, my, r);
  glow.addColorStop(0, `rgba(200, 160, 100, ${alpha * 0.05})`); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(mx - r, my - r, r * 2, r * 2);
  drawDetailedFly(ctx, mx, my, r * 0.85, sc, frame, flyAlpha);
  ctx.restore();
}

interface Config {
  /** Circle pattern params */
  circleCenter: (w: number, h: number) => { x: number; y: number };
  circleRadiusX: number; // fraction of width
  circleRadiusY: number; // fraction of height
  circleSpeed: number;   // radians per frame
  wobble: number;        // secondary wobble amplitude (fraction)
  /** Landing spot */
  landPos: (w: number, h: number) => { x: number; y: number };
  landFrame: number;     // frame when fly lands
  /** Glass entry */
  glassStart: (w: number, h: number, r: number) => { x: number; y: number };
  glassArriveFrame: number;
}

function makeVariant(cfg: Config): React.FC<VariantProps> {
  const Comp: React.FC<VariantProps> = ({ width, height }) => {
    const frame = useCurrentFrame();
    const ref = useRef<HTMLCanvasElement>(null);
    const sc = Math.min(width, height) / 360;

    // Trail buffer: store last N positions
    const trail = useMemo(() => new Array(60).fill(null) as ({ x: number; y: number } | null)[], []);

    useEffect(() => {
      const ctx = ref.current?.getContext("2d");
      if (!ctx) return;
      drawFBBg(ctx, width, height, frame);
      const a = fadeInOut(frame, DUR);
      const cc = cfg.circleCenter(width, height);
      const land = cfg.landPos(width, height);

      // === FLY POSITION ===
      let fx: number, fy: number, flyAngle: number, isFlying: boolean;

      const landT = interpolate(frame, [cfg.landFrame, cfg.landFrame + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const landE = landT * landT * (3 - 2 * landT);

      if (frame < cfg.landFrame) {
        // Flying in circles with wobble
        const t = frame * cfg.circleSpeed;
        const baseX = cc.x + Math.cos(t) * width * cfg.circleRadiusX;
        const baseY = cc.y + Math.sin(t) * height * cfg.circleRadiusY;
        // Secondary wobble for organic feel
        const wobX = Math.sin(t * 3.7) * width * cfg.wobble;
        const wobY = Math.cos(t * 2.9) * height * cfg.wobble;
        fx = baseX + wobX;
        fy = baseY + wobY;
        flyAngle = t + Math.PI / 2;
        isFlying = true;
      } else {
        // Landing: interpolate from last circle position to land spot
        const preT = cfg.landFrame * cfg.circleSpeed;
        const preX = cc.x + Math.cos(preT) * width * cfg.circleRadiusX + Math.sin(preT * 3.7) * width * cfg.wobble;
        const preY = cc.y + Math.sin(preT) * height * cfg.circleRadiusY + Math.cos(preT * 2.9) * height * cfg.wobble;
        fx = preX + (land.x - preX) * landE;
        fy = preY + (land.y - preY) * landE;
        flyAngle = 0;
        isFlying = landT < 1;
      }

      // === TRAIL ===
      // Shift trail, add current position
      trail.pop();
      trail.unshift({ x: fx, y: fy });

      // Draw trail (fades out after landing)
      const trailFade = frame > cfg.landFrame ? interpolate(frame, [cfg.landFrame, cfg.landFrame + 30], [1, 0], { extrapolateRight: "clamp" }) : 1;
      if (trailFade > 0) {
        for (let i = 1; i < trail.length; i++) {
          const p = trail[i];
          if (!p) break;
          const prev = trail[i - 1]!;
          const segAlpha = (1 - i / trail.length) * 0.12 * trailFade;
          ctx.globalAlpha = a * segAlpha;
          ctx.strokeStyle = ORANGE;
          ctx.lineWidth = Math.max(0.5, (2 - i * 0.03) * sc);
          ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // === DRAW FLY DOT ===
      drawTinyFly(ctx, fx, fy, sc, flyAngle, a, frame * 0.8);

      // === MAGNIFYING GLASS ===
      const magR = 60 * sc;
      const glassStart = cfg.glassStart(width, height, magR);
      const glassT = interpolate(frame, [cfg.glassArriveFrame, cfg.glassArriveFrame + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const glassE = glassT * glassT * (3 - 2 * glassT);

      if (glassT > 0) {
        const mx = glassStart.x + (land.x - glassStart.x) * glassE;
        const my = glassStart.y + (land.y - glassStart.y) * glassE;
        const flyReveal = interpolate(frame, [cfg.glassArriveFrame + 20, cfg.glassArriveFrame + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        drawLensContent(ctx, mx, my, magR, sc, frame, a * glassE, a * flyReveal);
        drawMagGlass(ctx, mx, my, magR, sc, a * glassE);
      }
    });
    return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
  };
  return Comp;
}

// === 9 VARIATIONS ===
// Differ in: circle pattern, speed, landing spot, glass entry direction

const V1 = makeVariant({
  circleCenter: (w, h) => ({ x: w * 0.5, y: h * 0.45 }),
  circleRadiusX: 0.25, circleRadiusY: 0.2, circleSpeed: 0.08, wobble: 0.03,
  landPos: (w, h) => ({ x: w * 0.55, y: h * 0.5 }),
  landFrame: 55,
  glassStart: (w, h, r) => ({ x: -r * 2, y: h * 0.5 }),
  glassArriveFrame: 75,
});

const V2 = makeVariant({
  circleCenter: (w, h) => ({ x: w * 0.45, y: h * 0.4 }),
  circleRadiusX: 0.3, circleRadiusY: 0.15, circleSpeed: 0.1, wobble: 0.04,
  landPos: (w, h) => ({ x: w * 0.4, y: h * 0.55 }),
  landFrame: 50,
  glassStart: (w, h, r) => ({ x: w + r * 2, y: h * 0.3 }),
  glassArriveFrame: 70,
});

const V3 = makeVariant({
  circleCenter: (w, h) => ({ x: w * 0.5, y: h * 0.5 }),
  circleRadiusX: 0.2, circleRadiusY: 0.25, circleSpeed: 0.06, wobble: 0.05,
  landPos: (w, h) => ({ x: w * 0.5, y: h * 0.45 }),
  landFrame: 60,
  glassStart: (w, h, r) => ({ x: w + r * 2, y: h + r * 2 }),
  glassArriveFrame: 80,
});

const V4 = makeVariant({
  circleCenter: (w, h) => ({ x: w * 0.55, y: h * 0.45 }),
  circleRadiusX: 0.18, circleRadiusY: 0.18, circleSpeed: 0.12, wobble: 0.02,
  landPos: (w, h) => ({ x: w * 0.6, y: h * 0.4 }),
  landFrame: 45,
  glassStart: (w, h, r) => ({ x: -r * 2, y: -r * 2 }),
  glassArriveFrame: 65,
});

const V5 = makeVariant({
  // Figure-8 pattern (wider X, different speed ratio)
  circleCenter: (w, h) => ({ x: w * 0.5, y: h * 0.45 }),
  circleRadiusX: 0.3, circleRadiusY: 0.12, circleSpeed: 0.07, wobble: 0.06,
  landPos: (w, h) => ({ x: w * 0.35, y: h * 0.5 }),
  landFrame: 55,
  glassStart: (w, h, r) => ({ x: w * 0.5, y: h + r * 2 }),
  glassArriveFrame: 75,
});

const V6 = makeVariant({
  circleCenter: (w, h) => ({ x: w * 0.4, y: h * 0.5 }),
  circleRadiusX: 0.22, circleRadiusY: 0.22, circleSpeed: 0.09, wobble: 0.03,
  landPos: (w, h) => ({ x: w * 0.45, y: h * 0.48 }),
  landFrame: 50,
  glassStart: (w, h, r) => ({ x: w + r * 2, y: h * 0.6 }),
  glassArriveFrame: 72,
});

const V7 = makeVariant({
  // Tight fast circles
  circleCenter: (w, h) => ({ x: w * 0.5, y: h * 0.42 }),
  circleRadiusX: 0.15, circleRadiusY: 0.15, circleSpeed: 0.14, wobble: 0.04,
  landPos: (w, h) => ({ x: w * 0.5, y: h * 0.5 }),
  landFrame: 48,
  glassStart: (w, h, r) => ({ x: -r * 2, y: h * 0.7 }),
  glassArriveFrame: 68,
});

const V8 = makeVariant({
  // Wide lazy loops
  circleCenter: (w, h) => ({ x: w * 0.5, y: h * 0.45 }),
  circleRadiusX: 0.35, circleRadiusY: 0.25, circleSpeed: 0.05, wobble: 0.02,
  landPos: (w, h) => ({ x: w * 0.55, y: h * 0.55 }),
  landFrame: 60,
  glassStart: (w, h, r) => ({ x: w * 0.5, y: -r * 2 }),
  glassArriveFrame: 78,
});

const V9 = makeVariant({
  // Erratic with high wobble
  circleCenter: (w, h) => ({ x: w * 0.48, y: h * 0.48 }),
  circleRadiusX: 0.2, circleRadiusY: 0.18, circleSpeed: 0.11, wobble: 0.07,
  landPos: (w, h) => ({ x: w * 0.5, y: h * 0.45 }),
  landFrame: 52,
  glassStart: (w, h, r) => ({ x: -r * 2, y: h + r }),
  glassArriveFrame: 73,
});

/** Full-screen version of V9 (Erratic Wobble) for FB-003 */
export const FB003_Final = V9;

export const VARIANTS_FB_003: VariantDef[] = [
  { id: "fb003-v1", label: "Glass from Left", component: V1 },
  { id: "fb003-v2", label: "Glass from Right", component: V2 },
  { id: "fb003-v3", label: "Glass from Corner", component: V3 },
  { id: "fb003-v4", label: "Fast Tight Circles", component: V4 },
  { id: "fb003-v5", label: "Wide Figure-8", component: V5 },
  { id: "fb003-v6", label: "Steady Orbit", component: V6 },
  { id: "fb003-v7", label: "Quick Snap", component: V7 },
  { id: "fb003-v8", label: "Lazy Loops", component: V8 },
  { id: "fb003-v9", label: "Erratic Wobble", component: V9 },
];
