import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../../types";

/**
 * Hook-01 — "Evolution spent fifty million years wiring this brain."
 *
 * 9 NARRATIVE approaches. Not abstract network growth —
 * actual creatures evolving through time, brains growing inside them.
 * Characters, environments, a story.
 */

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// --- Shared creature drawing functions ---

/** Single-celled organism: round blob with one eye */
function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, hue: number, frame: number) {
  const wobble = Math.sin(frame * 0.06) * 0.05;
  const rx = r * (1 + wobble), ry = r * (1 - wobble * 0.6);

  // Body
  const grad = ctx.createRadialGradient(x - rx * 0.2, y - ry * 0.25, 0, x, y, rx);
  grad.addColorStop(0, `hsla(${hue}, 60%, 72%, 1)`);
  grad.addColorStop(0.6, `hsla(${hue}, 55%, 58%, 1)`);
  grad.addColorStop(1, `hsla(${hue}, 50%, 45%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();

  // Outline
  ctx.strokeStyle = `hsla(${hue}, 55%, 30%, 0.6)`;
  ctx.lineWidth = r * 0.1; ctx.stroke();

  // Single eye
  const eyeR = r * 0.22;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x + r * 0.1, y - r * 0.1, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1028";
  ctx.beginPath(); ctx.arc(x + r * 0.1, y - r * 0.08, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath(); ctx.arc(x + r * 0.05, y - r * 0.15, eyeR * 0.25, 0, Math.PI * 2); ctx.fill();

  // Tiny pseudopods
  ctx.strokeStyle = `hsla(${hue}, 50%, 55%, 0.5)`;
  ctx.lineWidth = r * 0.06;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + frame * 0.02;
    const tipX = x + Math.cos(a) * rx * 1.25;
    const tipY = y + Math.sin(a) * ry * 1.2;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * rx * 0.9, y + Math.sin(a) * ry * 0.9);
    ctx.lineTo(tipX, tipY); ctx.stroke();
  }
}

/** Worm creature: elongated blob with two eyes, segmented */
function drawWorm(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, frame: number) {
  const segments = 5;
  const segR = size * 0.25;
  const waveAmp = size * 0.08;

  // Body segments
  for (let i = segments - 1; i >= 0; i--) {
    const sx = x - size * 0.4 + i * (size * 0.2);
    const sy = y + Math.sin(frame * 0.05 + i * 0.8) * waveAmp;
    const sr = segR * (1 - i * 0.08);
    const grad = ctx.createRadialGradient(sx - sr * 0.15, sy - sr * 0.2, 0, sx, sy, sr);
    grad.addColorStop(0, `hsla(${hue}, 55%, 68%, 1)`);
    grad.addColorStop(1, `hsla(${hue}, 50%, 48%, 1)`);
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, 50%, 30%, 0.4)`;
    ctx.lineWidth = sr * 0.08; ctx.stroke();
  }

  // Head (first segment, larger)
  const hx = x - size * 0.4, hy = y + Math.sin(frame * 0.05) * waveAmp;
  // Two eyes
  const eyeR = segR * 0.18;
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(hx + side * segR * 0.25, hy - segR * 0.15, eyeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1a1028";
    ctx.beginPath(); ctx.arc(hx + side * segR * 0.25, hy - segR * 0.12, eyeR * 0.55, 0, Math.PI * 2); ctx.fill();
  }
}

/** Fish: oval body, tail fin, eye, dorsal fin */
function drawFish(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, frame: number, flip = false) {
  const dir = flip ? -1 : 1;
  const tailWag = Math.sin(frame * 0.08) * 0.15;

  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);

  // Tail fin
  ctx.fillStyle = `hsla(${hue}, 50%, 52%, 0.8)`;
  ctx.beginPath();
  ctx.moveTo(size * 0.35, 0);
  ctx.lineTo(size * 0.6, -size * 0.2 + tailWag * size);
  ctx.lineTo(size * 0.6, size * 0.2 + tailWag * size);
  ctx.closePath(); ctx.fill();

  // Body
  const grad = ctx.createRadialGradient(-size * 0.1, -size * 0.08, 0, 0, 0, size * 0.35);
  grad.addColorStop(0, `hsla(${hue}, 55%, 70%, 1)`);
  grad.addColorStop(0.6, `hsla(${hue}, 52%, 58%, 1)`);
  grad.addColorStop(1, `hsla(${hue}, 48%, 42%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.35, size * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 50%, 30%, 0.5)`;
  ctx.lineWidth = size * 0.02; ctx.stroke();

  // Dorsal fin
  ctx.fillStyle = `hsla(${hue}, 45%, 55%, 0.7)`;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.16);
  ctx.quadraticCurveTo(0, -size * 0.32, size * 0.12, -size * 0.16);
  ctx.fill();

  // Eye
  const eyeR = size * 0.05;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(-size * 0.18, -size * 0.02, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1028";
  ctx.beginPath(); ctx.arc(-size * 0.18, -size * 0.01, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.beginPath(); ctx.arc(-size * 0.195, -size * 0.035, eyeR * 0.25, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

/** Lizard: four legs, long tail, head with eye */
function drawLizard(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, frame: number) {
  const legPhase = frame * 0.06;

  // Tail
  ctx.strokeStyle = `hsla(${hue}, 48%, 50%, 0.8)`;
  ctx.lineWidth = size * 0.04; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x + size * 0.25, y);
  ctx.quadraticCurveTo(x + size * 0.5, y + Math.sin(frame * 0.05) * size * 0.08, x + size * 0.65, y + size * 0.05);
  ctx.stroke();

  // Body
  const grad = ctx.createRadialGradient(x - size * 0.05, y - size * 0.04, 0, x, y, size * 0.25);
  grad.addColorStop(0, `hsla(${hue}, 52%, 62%, 1)`);
  grad.addColorStop(1, `hsla(${hue}, 48%, 42%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(x, y, size * 0.25, size * 0.1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 50%, 30%, 0.5)`;
  ctx.lineWidth = size * 0.02; ctx.stroke();

  // Four legs
  ctx.strokeStyle = `hsla(${hue}, 48%, 48%, 0.8)`;
  ctx.lineWidth = size * 0.03;
  const legPositions = [[-0.15, -1], [-0.15, 1], [0.12, -1], [0.12, 1]];
  for (let i = 0; i < 4; i++) {
    const [lx, side] = legPositions[i];
    const legSwing = Math.sin(legPhase + i * Math.PI / 2) * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(x + lx * size, y + side * size * 0.08);
    ctx.lineTo(x + lx * size + legSwing, y + side * size * 0.2);
    ctx.stroke();
  }

  // Head
  ctx.fillStyle = `hsla(${hue}, 52%, 58%, 1)`;
  ctx.beginPath(); ctx.ellipse(x - size * 0.28, y - size * 0.01, size * 0.09, size * 0.07, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 50%, 30%, 0.5)`;
  ctx.lineWidth = size * 0.015; ctx.stroke();

  // Eye
  const eyeR = size * 0.025;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - size * 0.32, y - size * 0.03, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1028";
  ctx.beginPath(); ctx.arc(x - size * 0.32, y - size * 0.025, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();
}

/** Mouse/small mammal: round body, ears, tail, eye */
function drawMouse(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, frame: number) {
  // Tail
  ctx.strokeStyle = `hsla(${hue + 10}, 30%, 55%, 0.6)`;
  ctx.lineWidth = size * 0.02; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x + size * 0.2, y + size * 0.05);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.05, x + size * 0.5, y + Math.sin(frame * 0.04) * size * 0.05);
  ctx.stroke();

  // Body
  const grad = ctx.createRadialGradient(x - size * 0.04, y - size * 0.05, 0, x, y, size * 0.2);
  grad.addColorStop(0, `hsla(${hue}, 35%, 68%, 1)`);
  grad.addColorStop(1, `hsla(${hue}, 32%, 48%, 1)`);
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(x, y, size * 0.2, size * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 30%, 32%, 0.5)`;
  ctx.lineWidth = size * 0.02; ctx.stroke();

  // Head
  ctx.fillStyle = `hsla(${hue}, 35%, 62%, 1)`;
  ctx.beginPath(); ctx.ellipse(x - size * 0.2, y - size * 0.02, size * 0.1, size * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `hsla(${hue}, 30%, 32%, 0.5)`;
  ctx.lineWidth = size * 0.015; ctx.stroke();

  // Ears
  ctx.fillStyle = `hsla(${hue + 10}, 40%, 65%, 0.8)`;
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(x - size * 0.23 + side * size * 0.06, y - size * 0.1, size * 0.04, size * 0.055, side * 0.3, 0, Math.PI * 2); ctx.fill();
  }

  // Eye
  const eyeR = size * 0.025;
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(x - size * 0.24, y - size * 0.04, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1028";
  ctx.beginPath(); ctx.arc(x - size * 0.24, y - size * 0.035, eyeR * 0.6, 0, Math.PI * 2); ctx.fill();

  // Legs (tiny)
  ctx.strokeStyle = `hsla(${hue}, 30%, 50%, 0.6)`;
  ctx.lineWidth = size * 0.025;
  for (const lx of [-0.1, 0.08]) {
    ctx.beginPath(); ctx.moveTo(x + lx * size, y + size * 0.12); ctx.lineTo(x + lx * size, y + size * 0.2); ctx.stroke();
  }
}

/** Fruit fly: tiny, wings, big eyes */
function drawFly(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, hue: number, frame: number) {
  // Wings
  ctx.fillStyle = `hsla(220, 20%, 70%, 0.25)`;
  const wingFlap = Math.sin(frame * 0.15) * 0.2;
  ctx.beginPath(); ctx.ellipse(x - size * 0.05, y - size * 0.12, size * 0.2, size * 0.06, -0.4 + wingFlap, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + size * 0.05, y - size * 0.12, size * 0.2, size * 0.06, 0.4 - wingFlap, 0, Math.PI * 2); ctx.fill();

  // Abdomen
  ctx.fillStyle = `hsla(${hue}, 30%, 40%, 0.9)`;
  ctx.beginPath(); ctx.ellipse(x + size * 0.08, y + size * 0.02, size * 0.1, size * 0.06, 0.2, 0, Math.PI * 2); ctx.fill();

  // Thorax
  ctx.fillStyle = `hsla(${hue}, 28%, 38%, 1)`;
  ctx.beginPath(); ctx.ellipse(x - size * 0.02, y, size * 0.08, size * 0.07, 0, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = `hsla(${hue}, 25%, 42%, 1)`;
  ctx.beginPath(); ctx.ellipse(x - size * 0.12, y - size * 0.01, size * 0.06, size * 0.055, 0, 0, Math.PI * 2); ctx.fill();

  // Big compound eyes (red-ish)
  ctx.fillStyle = `hsla(350, 50%, 45%, 0.8)`;
  for (const side of [-1, 1]) {
    ctx.beginPath(); ctx.ellipse(x - size * 0.14 + side * size * 0.035, y - size * 0.025, size * 0.03, size * 0.035, side * 0.3, 0, Math.PI * 2); ctx.fill();
  }
}

/** Simple brain icon at a given complexity level (0-5) */
function drawBrainIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, complexity: number, hue: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (complexity === 0) {
    // Just a dot
    ctx.fillStyle = `hsla(${hue}, 50%, 65%, 0.8)`;
    ctx.beginPath(); ctx.arc(x, y, size * 0.15, 0, Math.PI * 2); ctx.fill();
  } else if (complexity <= 2) {
    // Small cluster
    const count = complexity * 3 + 2;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const d = size * 0.15;
      const nr = size * 0.08;
      ctx.fillStyle = `hsla(${hue}, 50%, 65%, 0.6)`;
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, nr, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // Brain shape with folds
    const brainW = size * 0.35, brainH = size * 0.28;
    const grad = ctx.createRadialGradient(x - brainW * 0.15, y - brainH * 0.2, 0, x, y, brainW);
    grad.addColorStop(0, `hsla(${hue}, 55%, 70%, 0.9)`);
    grad.addColorStop(1, `hsla(${hue}, 50%, 50%, 0.8)`);
    ctx.fillStyle = grad;

    // Brain lobes
    ctx.beginPath();
    ctx.ellipse(x - brainW * 0.2, y, brainW * 0.55, brainH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + brainW * 0.2, y, brainW * 0.55, brainH, 0, 0, Math.PI * 2);
    ctx.fill();

    // Folds (sulci lines)
    if (complexity >= 4) {
      ctx.strokeStyle = `hsla(${hue}, 45%, 42%, 0.4)`;
      ctx.lineWidth = size * 0.01;
      for (let i = 0; i < complexity - 2; i++) {
        const fx = x + (i - (complexity - 3) / 2) * brainW * 0.2;
        ctx.beginPath();
        ctx.moveTo(fx, y - brainH * 0.7);
        ctx.quadraticCurveTo(fx + brainW * 0.08, y, fx - brainW * 0.05, y + brainH * 0.6);
        ctx.stroke();
      }
    }

    ctx.strokeStyle = `hsla(${hue}, 50%, 35%, 0.4)`;
    ctx.lineWidth = size * 0.015;
    ctx.beginPath(); ctx.ellipse(x, y, brainW * 0.7, brainH, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

/** Draw environment: ocean, land, or forest strip */
function drawEnvironment(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, type: "ocean" | "land" | "forest", alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;

  if (type === "ocean") {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "hsla(210, 50%, 35%, 0.3)");
    grad.addColorStop(1, "hsla(220, 55%, 18%, 0.5)");
    ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
    // Bubbles
    for (let i = 0; i < 6; i++) {
      const bx = x + (i / 5) * w * 0.8 + w * 0.1;
      const by = y + h * 0.3 + Math.sin(i * 2.1) * h * 0.25;
      ctx.fillStyle = `hsla(200, 40%, 70%, ${0.1 + Math.sin(i * 3.7) * 0.05})`;
      ctx.beginPath(); ctx.arc(bx, by, w * 0.01 + i * 0.5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (type === "land") {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "hsla(180, 30%, 55%, 0.15)");
    grad.addColorStop(0.5, "hsla(100, 35%, 35%, 0.25)");
    grad.addColorStop(1, "hsla(35, 35%, 28%, 0.35)");
    ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
  } else {
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "hsla(140, 30%, 30%, 0.2)");
    grad.addColorStop(1, "hsla(100, 30%, 22%, 0.35)");
    ctx.fillStyle = grad; ctx.fillRect(x, y, w, h);
    // Simple tree shapes
    for (let i = 0; i < 3; i++) {
      const tx = x + w * (0.2 + i * 0.3);
      ctx.fillStyle = `hsla(130, 30%, 25%, ${0.2 + i * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(tx, y + h * 0.2);
      ctx.lineTo(tx - w * 0.06, y + h * 0.7);
      ctx.lineTo(tx + w * 0.06, y + h * 0.7);
      ctx.closePath(); ctx.fill();
    }
  }
  ctx.restore();
}

/** Background for all variants */
function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.65);
  bg.addColorStop(0, "#1e1832"); bg.addColorStop(0.6, "#161228"); bg.addColorStop(1, "#0e0a1a");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
}

/** Year counter */
function drawYears(ctx: CanvasRenderingContext2D, frame: number, w: number, h: number, scale: number, color: string) {
  const fadeIn = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [130, 146], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const alpha = fadeIn * fadeOut;
  if (alpha <= 0) return;

  const t = interpolate(frame, [5, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const years = Math.min(Math.floor(1000 * Math.pow(50000, t)), 50_000_000);
  const text = years.toLocaleString("en-US");

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `bold ${14 * scale}px system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(`${text} years`, w - 15 * scale, 22 * scale);
  ctx.restore();
}

// Evolution stages timeline
interface Stage {
  name: string;
  frameStart: number;
  frameEnd: number;
  env: "ocean" | "land" | "forest";
  brainComplexity: number;
  creatureHue: number;
}

const STAGES: Stage[] = [
  { name: "Single cell", frameStart: 5, frameEnd: 30, env: "ocean", brainComplexity: 0, creatureHue: 140 },
  { name: "Worm", frameStart: 25, frameEnd: 50, env: "ocean", brainComplexity: 1, creatureHue: 25 },
  { name: "Fish", frameStart: 45, frameEnd: 70, env: "ocean", brainComplexity: 2, creatureHue: 210 },
  { name: "Lizard", frameStart: 65, frameEnd: 90, env: "land", brainComplexity: 3, creatureHue: 100 },
  { name: "Mammal", frameStart: 85, frameEnd: 110, env: "forest", brainComplexity: 4, creatureHue: 30 },
  { name: "Fruit fly", frameStart: 110, frameEnd: 145, env: "land", brainComplexity: 1, creatureHue: 280 },
];

function stageAlpha(frame: number, stage: Stage): number {
  const fadeIn = interpolate(frame, [stage.frameStart, stage.frameStart + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [stage.frameEnd - 8, stage.frameEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return fadeIn * fadeOut;
}

// ======================================================================
// V1 — "Side-Scroll Journey"
// Creature walks/swims across screen through evolving environments.
// Ocean → Land → Forest. Brain grows above each creature.
// ======================================================================
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const cx = width / 2, cy = height * 0.6;
    const creatureSize = 60 * scale;

    // Ground line
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(0, cy + creatureSize * 0.4); ctx.lineTo(width, cy + creatureSize * 0.4); ctx.stroke();

    // Draw current stage
    for (const stage of STAGES) {
      const alpha = stageAlpha(frame, stage);
      if (alpha <= 0) continue;

      ctx.save(); ctx.globalAlpha = alpha;

      // Environment hint
      drawEnvironment(ctx, 0, cy - creatureSize * 0.5, width, height * 0.4, stage.env, alpha * 0.5);

      // Creature
      const walkX = cx + Math.sin(frame * 0.03) * 15 * scale;
      switch (stage.name) {
        case "Single cell": drawCell(ctx, walkX, cy, creatureSize * 0.3, stage.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, walkX, cy, creatureSize * 0.8, stage.creatureHue, frame); break;
        case "Fish": drawFish(ctx, walkX, cy - creatureSize * 0.1, creatureSize, stage.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, walkX, cy, creatureSize, stage.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, walkX, cy - creatureSize * 0.05, creatureSize, stage.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, walkX, cy, creatureSize * 0.7, stage.creatureHue, frame); break;
      }

      // Brain icon above
      drawBrainIcon(ctx, walkX, cy - creatureSize * 0.7, creatureSize * 0.6, stage.brainComplexity, stage.creatureHue, alpha);

      // Stage label
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.font = `${10 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(stage.name, walkX, cy + creatureSize * 0.6);

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V2 — "Morphing Timeline"
// One creature in center continuously morphs through all stages.
// Smooth crossfade between forms. Brain above morphs too.
// ======================================================================
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const cx = width / 2, cy = height * 0.58;
    const size = 80 * scale;

    // Morphing: two stages overlap during transitions
    for (const stage of STAGES) {
      const alpha = stageAlpha(frame, stage);
      if (alpha <= 0) continue;
      ctx.save(); ctx.globalAlpha = alpha;

      switch (stage.name) {
        case "Single cell": drawCell(ctx, cx, cy, size * 0.35, stage.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, cx, cy, size, stage.creatureHue, frame); break;
        case "Fish": drawFish(ctx, cx, cy, size * 1.1, stage.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, cx, cy, size * 1.2, stage.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, cx, cy, size * 1.1, stage.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, cx, cy, size * 0.8, stage.creatureHue, frame); break;
      }

      // Brain above
      drawBrainIcon(ctx, cx, cy - size * 0.7, size * 0.7, stage.brainComplexity, stage.creatureHue, alpha);

      ctx.restore();
    }

    // Era label
    for (const stage of STAGES) {
      const alpha = stageAlpha(frame, stage);
      if (alpha <= 0) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgba(255,255,255,0.4)`;
      ctx.font = `${11 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(stage.name, cx, cy + size * 0.55);
    }
    ctx.globalAlpha = 1;

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V3 — "Vertical Ascent"
// Camera pans upward. Ocean at bottom, land in middle, sky at top.
// Each era is a layer. Creatures at their layer.
// ======================================================================
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    // Scrolling: camera moves upward
    const scrollT = interpolate(frame, [5, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scrollY = scrollT * height * 1.5;

    const cx = width / 2;
    const size = 55 * scale;
    const layers = [
      { y: height * 2.0, stage: STAGES[0], env: "ocean" as const },
      { y: height * 1.6, stage: STAGES[1], env: "ocean" as const },
      { y: height * 1.2, stage: STAGES[2], env: "ocean" as const },
      { y: height * 0.85, stage: STAGES[3], env: "land" as const },
      { y: height * 0.55, stage: STAGES[4], env: "forest" as const },
      { y: height * 0.3, stage: STAGES[5], env: "land" as const },
    ];

    for (const layer of layers) {
      const screenY = layer.y - scrollY;
      if (screenY < -height * 0.3 || screenY > height * 1.3) continue;

      const distFromCenter = Math.abs(screenY - height * 0.5) / (height * 0.5);
      const layerAlpha = Math.max(0, 1 - distFromCenter * 0.8);

      ctx.save(); ctx.globalAlpha = layerAlpha;

      // Environment strip
      drawEnvironment(ctx, 0, screenY - size * 0.3, width, size * 1.2, layer.env, layerAlpha * 0.4);

      // Creature
      const s = layer.stage;
      switch (s.name) {
        case "Single cell": drawCell(ctx, cx, screenY, size * 0.3, s.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, cx, screenY, size * 0.7, s.creatureHue, frame); break;
        case "Fish": drawFish(ctx, cx, screenY, size * 0.9, s.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, cx, screenY, size, s.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, cx, screenY, size, s.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, cx, screenY, size * 0.6, s.creatureHue, frame); break;
      }

      // Label
      ctx.fillStyle = `rgba(255,255,255,${layerAlpha * 0.45})`;
      ctx.font = `${9 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(s.name, cx, screenY + size * 0.5);

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V4 — "Film Strip Epochs"
// Screen divided into 6 vertical strips, each an era.
// Strips light up left to right. Creature + brain in each.
// ======================================================================
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const stripW = width / 6;
    const cy = height * 0.6;
    const size = 45 * scale;

    for (let i = 0; i < 6; i++) {
      const stage = STAGES[i];
      const stripX = i * stripW;
      const stripCx = stripX + stripW / 2;

      // Strip lights up
      const lightT = interpolate(frame, [stage.frameStart, stage.frameStart + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const dimT = interpolate(frame, [stage.frameEnd, stage.frameEnd + 5], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const alpha = lightT * dimT;

      // Strip divider
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(stripX, 0); ctx.lineTo(stripX, height); ctx.stroke();
      }

      ctx.save(); ctx.globalAlpha = alpha;

      // Environment
      drawEnvironment(ctx, stripX, cy - size * 0.5, stripW, height * 0.35, stage.env, alpha * 0.3);

      // Creature
      switch (stage.name) {
        case "Single cell": drawCell(ctx, stripCx, cy, size * 0.25, stage.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, stripCx, cy, size * 0.6, stage.creatureHue, frame); break;
        case "Fish": drawFish(ctx, stripCx, cy, size * 0.7, stage.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, stripCx, cy, size * 0.8, stage.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, stripCx, cy, size * 0.75, stage.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, stripCx, cy, size * 0.5, stage.creatureHue, frame); break;
      }

      // Brain above
      drawBrainIcon(ctx, stripCx, cy - size * 0.65, size * 0.5, stage.brainComplexity, stage.creatureHue, alpha);

      // Label below
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.font = `${7 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(stage.name, stripCx, cy + size * 0.55);

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V5 — "Tree of Life"
// A tree grows from bottom. Each branch = an era. Creatures sit on branches.
// The fly is on a tiny twig at the end.
// ======================================================================
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const cx = width / 2;
    const size = 40 * scale;

    // Tree trunk
    const trunkGrowth = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const trunkTop = height * 0.85 - trunkGrowth * height * 0.5;
    ctx.strokeStyle = `hsla(30, 30%, 35%, 0.5)`;
    ctx.lineWidth = 4 * scale; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, height * 0.9); ctx.lineTo(cx, trunkTop); ctx.stroke();

    // Branches with creatures
    const branches = [
      { x: cx - width * 0.25, y: height * 0.7, stageIdx: 0, growFrame: 20 },
      { x: cx + width * 0.2, y: height * 0.6, stageIdx: 1, growFrame: 35 },
      { x: cx - width * 0.3, y: height * 0.48, stageIdx: 2, growFrame: 50 },
      { x: cx + width * 0.25, y: height * 0.38, stageIdx: 3, growFrame: 65 },
      { x: cx - width * 0.2, y: height * 0.28, stageIdx: 4, growFrame: 80 },
      { x: cx + width * 0.15, y: height * 0.2, stageIdx: 5, growFrame: 100 },
    ];

    for (const branch of branches) {
      const branchT = interpolate(frame, [branch.growFrame, branch.growFrame + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (branchT <= 0) continue;

      // Branch line
      ctx.strokeStyle = `hsla(30, 25%, 40%, ${branchT * 0.4})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath(); ctx.moveTo(cx, branch.y + height * 0.05);
      ctx.lineTo(cx + (branch.x - cx) * branchT, branch.y); ctx.stroke();

      if (branchT < 0.5) continue;
      const creatureAlpha = (branchT - 0.5) * 2;
      ctx.save(); ctx.globalAlpha = creatureAlpha;

      const stage = STAGES[branch.stageIdx];
      switch (stage.name) {
        case "Single cell": drawCell(ctx, branch.x, branch.y - size * 0.15, size * 0.2, stage.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, branch.x, branch.y - size * 0.1, size * 0.5, stage.creatureHue, frame); break;
        case "Fish": drawFish(ctx, branch.x, branch.y - size * 0.15, size * 0.6, stage.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, branch.x, branch.y - size * 0.1, size * 0.65, stage.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, branch.x, branch.y - size * 0.1, size * 0.6, stage.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, branch.x, branch.y - size * 0.1, size * 0.4, stage.creatureHue, frame); break;
      }

      ctx.fillStyle = `rgba(255,255,255,${creatureAlpha * 0.4})`;
      ctx.font = `${7 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(stage.name, branch.x, branch.y + size * 0.25);

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V6 — "Scale Zoom-Out"
// Start on single cell filling the screen. Camera zooms out.
// At each zoom level, a more complex creature appears.
// End zoomed all the way out: tiny fly brain is a speck.
// ======================================================================
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const cx = width / 2, cy = height / 2;
    const zoomT = interpolate(frame, [5, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Current stage based on zoom
    const stageIdx = Math.min(5, Math.floor(zoomT * 6));
    const stageT = (zoomT * 6) - stageIdx; // 0-1 within current stage
    const stage = STAGES[stageIdx];

    // Size shrinks as we zoom out
    const baseSize = interpolate(zoomT, [0, 1], [180, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scale;

    ctx.save();
    ctx.globalAlpha = interpolate(frame, [132, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    switch (stage.name) {
      case "Single cell": drawCell(ctx, cx, cy, baseSize * 0.4, stage.creatureHue, frame); break;
      case "Worm": drawWorm(ctx, cx, cy, baseSize, stage.creatureHue, frame); break;
      case "Fish": drawFish(ctx, cx, cy, baseSize * 1.1, stage.creatureHue, frame); break;
      case "Lizard": drawLizard(ctx, cx, cy, baseSize * 1.1, stage.creatureHue, frame); break;
      case "Mammal": drawMouse(ctx, cx, cy, baseSize, stage.creatureHue, frame); break;
      case "Fruit fly": drawFly(ctx, cx, cy, baseSize * 0.7, stage.creatureHue, frame); break;
    }

    // Brain above, size relative to creature
    drawBrainIcon(ctx, cx, cy - baseSize * 0.6, baseSize * 0.5, stage.brainComplexity, stage.creatureHue, 0.7);

    // Label
    ctx.fillStyle = `rgba(255,255,255,0.4)`;
    ctx.font = `${Math.max(7, 12 - zoomT * 5) * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(stage.name, cx, cy + baseSize * 0.55);

    ctx.restore();
    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V7 — "Split Brain Comparison"
// Screen splits into panels. Each panel shows a creature with its brain
// drawn to ACTUAL relative scale. The fly panel's brain is a speck.
// ======================================================================
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    // Panels appear one by one
    const panels = [
      { stage: STAGES[0], brainScale: 0.03, label: "~300 neurons", showFrame: 8 },
      { stage: STAGES[2], brainScale: 0.08, label: "~100K neurons", showFrame: 25 },
      { stage: STAGES[3], brainScale: 0.15, label: "~1M neurons", showFrame: 45 },
      { stage: STAGES[4], brainScale: 0.6, label: "~70M neurons", showFrame: 65 },
      { stage: STAGES[5], brainScale: 0.05, label: "138,639", showFrame: 95 },
    ];

    const panelW = width / 5;
    const cy = height * 0.58;
    const size = 38 * scale;

    for (let i = 0; i < panels.length; i++) {
      const p = panels[i];
      const alpha = interpolate(frame, [p.showFrame, p.showFrame + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (alpha <= 0) continue;

      const px = i * panelW + panelW / 2;

      ctx.save(); ctx.globalAlpha = alpha;

      // Divider
      if (i > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(i * panelW, height * 0.1); ctx.lineTo(i * panelW, height * 0.9); ctx.stroke();
      }

      // Brain (scaled to show relative size)
      const brainR = p.brainScale * panelW * 0.4;
      drawBrainIcon(ctx, px, height * 0.3, brainR * 2, p.stage.brainComplexity, p.stage.creatureHue, alpha);

      // Creature
      const s = p.stage;
      switch (s.name) {
        case "Single cell": drawCell(ctx, px, cy, size * 0.22, s.creatureHue, frame); break;
        case "Fish": drawFish(ctx, px, cy, size * 0.6, s.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, px, cy, size * 0.6, s.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, px, cy, size * 0.55, s.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, px, cy, size * 0.4, s.creatureHue, frame); break;
      }

      // Label
      ctx.fillStyle = `rgba(255,255,255,0.4)`;
      ctx.font = `${7 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(p.label, px, height * 0.82);
      ctx.font = `${7 * scale}px system-ui, sans-serif`;
      ctx.fillText(s.name, px, cy + size * 0.5);

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V8 — "Spiral Timeline"
// A spiral unwinds from center. Creatures placed along the spiral
// at their era points. Brain complexity increases outward.
// ======================================================================
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);

    const cx = width / 2, cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.38;
    const spiralT = interpolate(frame, [5, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const totalAngle = spiralT * Math.PI * 3.5;

    // Draw spiral path
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 2 * scale; ctx.beginPath();
    for (let t = 0; t <= totalAngle; t += 0.05) {
      const r = (t / (Math.PI * 3.5)) * maxRadius;
      const px = cx + Math.cos(t) * r;
      const py = cy + Math.sin(t) * r;
      t === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Place creatures along spiral
    const creaturePositions = [0.05, 0.2, 0.38, 0.55, 0.72, 0.9];
    const size = 35 * scale;

    for (let i = 0; i < 6; i++) {
      if (spiralT < creaturePositions[i]) continue;
      const ct = creaturePositions[i];
      const angle = ct * Math.PI * 3.5;
      const r = ct * maxRadius;
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;

      const alpha = interpolate(spiralT, [ct, ct + 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.save(); ctx.globalAlpha = alpha;

      const stage = STAGES[i];
      switch (stage.name) {
        case "Single cell": drawCell(ctx, px, py, size * 0.18, stage.creatureHue, frame); break;
        case "Worm": drawWorm(ctx, px, py, size * 0.45, stage.creatureHue, frame); break;
        case "Fish": drawFish(ctx, px, py, size * 0.55, stage.creatureHue, frame); break;
        case "Lizard": drawLizard(ctx, px, py, size * 0.55, stage.creatureHue, frame); break;
        case "Mammal": drawMouse(ctx, px, py, size * 0.5, stage.creatureHue, frame); break;
        case "Fruit fly": drawFly(ctx, px, py, size * 0.35, stage.creatureHue, frame); break;
      }

      ctx.restore();
    }

    drawYears(ctx, frame, width, height, scale, "rgba(230,210,170,0.7)");
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
// V9 — "Pop-up Book"
// Pages flip. Each page is an era with a pop-up creature.
// Paper-craft aesthetic, warm cream tones, fold lines visible.
// ======================================================================
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Warm cream base
    ctx.fillStyle = "#f0e8d8";
    ctx.fillRect(0, 0, width, height);

    // Paper texture
    const rand = seeded(999);
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(180,165,140,${0.02 + rand() * 0.02})`;
      ctx.beginPath(); ctx.arc(rand() * width, rand() * height, rand() * 4 * scale, 0, Math.PI * 2); ctx.fill();
    }

    // Current page
    const pageIdx = Math.min(5, Math.floor(interpolate(frame, [5, 130], [0, 5.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    const pageT = interpolate(frame, [5 + pageIdx * 21, 5 + pageIdx * 21 + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cx = width / 2, cy = height * 0.55;
    const size = 70 * scale;

    // Page fold line (center horizontal)
    ctx.strokeStyle = "rgba(160,140,120,0.2)";
    ctx.lineWidth = 1; ctx.setLineDash([5 * scale, 3 * scale]);
    ctx.beginPath(); ctx.moveTo(width * 0.15, cy - size * 0.1); ctx.lineTo(width * 0.85, cy - size * 0.1); ctx.stroke();
    ctx.setLineDash([]);

    // Pop-up effect: creature rises from fold
    const popT = Math.min(1, pageT * 1.5);
    const popScale = popT < 0.7 ? (popT / 0.7) * 1.1 : 1.1 - ((popT - 0.7) / 0.3) * 0.1;

    ctx.save();
    ctx.globalAlpha = pageT;
    ctx.translate(cx, cy);
    ctx.scale(popScale, popScale);
    ctx.translate(-cx, -cy);

    const stage = STAGES[pageIdx];
    // Draw with paper-like colors (desaturated)
    const paperHue = stage.creatureHue;
    switch (stage.name) {
      case "Single cell": drawCell(ctx, cx, cy - size * 0.2, size * 0.3, paperHue, frame); break;
      case "Worm": drawWorm(ctx, cx, cy - size * 0.15, size * 0.7, paperHue, frame); break;
      case "Fish": drawFish(ctx, cx, cy - size * 0.15, size * 0.85, paperHue, frame); break;
      case "Lizard": drawLizard(ctx, cx, cy - size * 0.1, size * 0.9, paperHue, frame); break;
      case "Mammal": drawMouse(ctx, cx, cy - size * 0.1, size * 0.8, paperHue, frame); break;
      case "Fruit fly": drawFly(ctx, cx, cy - size * 0.15, size * 0.6, paperHue, frame); break;
    }

    ctx.restore();

    // Page number
    ctx.fillStyle = "rgba(120,100,80,0.4)";
    ctx.font = `${10 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`${stage.name}`, cx, cy + size * 0.5);
    ctx.font = `${8 * scale}px monospace`;
    ctx.fillText(`${pageIdx + 1} / 6`, cx, height * 0.88);

    // Year counter (dark text on light bg)
    const fadeIn = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const yearT = interpolate(frame, [5, 125], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const years = Math.min(Math.floor(1000 * Math.pow(50000, yearT)), 50_000_000);
    ctx.globalAlpha = fadeIn;
    ctx.fillStyle = "rgba(100,80,60,0.6)";
    ctx.font = `bold ${14 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText(`${years.toLocaleString()} years`, width - 15 * scale, 22 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

// ======================================================================
export const VARIANTS_HOOK_001_STORY: VariantDef[] = [
  { id: "side-scroll", label: "Side-Scroll Journey", component: V1 },
  { id: "morphing", label: "Morphing Timeline", component: V2 },
  { id: "vertical-ascent", label: "Vertical Ascent", component: V3 },
  { id: "film-strips", label: "Film Strip Epochs", component: V4 },
  { id: "tree-of-life", label: "Tree of Life", component: V5 },
  { id: "scale-zoom", label: "Scale Zoom-Out", component: V6 },
  { id: "brain-compare", label: "Split Brain Compare", component: V7 },
  { id: "spiral-time", label: "Spiral Timeline", component: V8 },
  { id: "popup-book", label: "Pop-up Book", component: V9 },
];
