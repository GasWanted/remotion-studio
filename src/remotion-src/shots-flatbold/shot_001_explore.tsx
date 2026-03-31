// Shot 001 Explore — "Nature spent 50M years fine-tuning a brain to crave sugar. I broke that"
// CONCEPT: ~140 nodes spiral in chaotically → settle into FLY HEAD silhouette → connections form
// 9 unique variations on spiral-in mechanic

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

interface Ball {
  sx: number; sy: number;  // orbit start offset
  tx: number; ty: number;  // target (fly head shape)
  r: number; c: number;
  orbitAngle: number;       // initial orbit angle
  orbitSpeed: number;       // orbit angular velocity
  orbitDist: number;        // starting distance from center
}

/** Generate fly-head-shaped target positions:
 *  Two large compound eyes (left + right ellipses) + central head region + antennae */
function makeFlyHeadTargets(cx: number, cy: number, count: number, scale: number, seed: number) {
  const rng = seeded(seed);
  const targets: { x: number; y: number }[] = [];

  // Left eye: ellipse centered at (-55, -5), rx=40, ry=50
  const leftEyeX = cx - 55 * scale, leftEyeY = cy - 5 * scale;
  const leftRx = 40 * scale, leftRy = 50 * scale;

  // Right eye: mirror
  const rightEyeX = cx + 55 * scale, rightEyeY = cy - 5 * scale;
  const rightRx = 40 * scale, rightRy = 50 * scale;

  // Central head: smaller ellipse at center, overlapping eyes slightly
  const headRx = 25 * scale, headRy = 35 * scale;

  // Antennae: two small clusters above eyes
  const antL = { x: cx - 35 * scale, y: cy - 70 * scale };
  const antR = { x: cx + 35 * scale, y: cy - 70 * scale };

  // Proboscis: small cluster below center
  const prob = { x: cx, y: cy + 55 * scale };

  // Distribute nodes across regions
  const eyeCount = Math.floor(count * 0.35); // per eye
  const headCount = Math.floor(count * 0.15);
  const antCount = Math.floor(count * 0.04); // per antenna
  const probCount = Math.floor(count * 0.02);
  // Remaining fill extra into eyes
  const extra = count - eyeCount * 2 - headCount - antCount * 2 - probCount;

  // Left eye
  for (let i = 0; i < eyeCount + Math.floor(extra / 2); i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.5);
    targets.push({ x: leftEyeX + Math.cos(a) * d * leftRx, y: leftEyeY + Math.sin(a) * d * leftRy });
  }

  // Right eye
  for (let i = 0; i < eyeCount + Math.ceil(extra / 2); i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.5);
    targets.push({ x: rightEyeX + Math.cos(a) * d * rightRx, y: rightEyeY + Math.sin(a) * d * rightRy });
  }

  // Central head
  for (let i = 0; i < headCount; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.pow(rng(), 0.5);
    targets.push({ x: cx + Math.cos(a) * d * headRx, y: cy + Math.sin(a) * d * headRy });
  }

  // Antennae (left)
  for (let i = 0; i < antCount; i++) {
    const spread = 8 * scale;
    targets.push({ x: antL.x + (rng() - 0.5) * spread, y: antL.y + (rng() - 0.5) * spread - i * 6 * scale });
  }

  // Antennae (right)
  for (let i = 0; i < antCount; i++) {
    const spread = 8 * scale;
    targets.push({ x: antR.x + (rng() - 0.5) * spread, y: antR.y + (rng() - 0.5) * spread - i * 6 * scale });
  }

  // Proboscis
  for (let i = 0; i < probCount; i++) {
    targets.push({ x: prob.x + (rng() - 0.5) * 6 * scale, y: prob.y + i * 5 * scale });
  }

  return targets;
}

/** Connect nearby nodes — more aggressive than before for dense wiring */
function makeEdges(targets: { x: number; y: number }[], scale: number, seed: number, threshold = 35, prob = 0.3) {
  const rng = seeded(seed);
  const edges: [number, number][] = [];
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const dx = targets[i].x - targets[j].x, dy = targets[i].y - targets[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold * scale && rng() < prob) edges.push([i, j]);
    }
  }
  return edges;
}

function makeBalls(targets: { x: number; y: number }[], cx: number, cy: number, scale: number, seed: number): Ball[] {
  const rng = seeded(seed);
  return targets.map((t) => {
    const angle = rng() * Math.PI * 2;
    const dist = 160 * scale + rng() * 100 * scale;
    return {
      sx: cx + Math.cos(angle) * dist,
      sy: cy + Math.sin(angle) * dist,
      tx: t.x, ty: t.y,
      r: (1.5 + rng() * 3) * scale,
      c: Math.floor(rng() * 8),
      orbitAngle: angle,
      orbitSpeed: 0.02 + rng() * 0.04,
      orbitDist: dist,
    };
  });
}

const N = 140; // node count

/* ── V1: Uniform spiral — all nodes orbit at same radius, then converge ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3010);
    const edges = makeEdges(targets, sc, 3011);
    const balls = makeBalls(targets, cx, cy, sc, 3012);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [20, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * (3 - 2 * t);

    const pos = data.balls.map((b, i) => {
      const orbA = b.orbitAngle + frame * b.orbitSpeed * (1 - e);
      const orbD = b.orbitDist * (1 - e);
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.35) {
      const ea = (e - 0.35) / 0.65;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Double vortex — two counter-rotating spirals merge ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3020);
    const edges = makeEdges(targets, sc, 3021);
    const balls = makeBalls(targets, cx, cy, sc, 3022);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [15, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * (3 - 2 * t);

    const pos = data.balls.map((b, i) => {
      const dir = i % 2 === 0 ? 1 : -1; // counter-rotate
      const orbA = b.orbitAngle + frame * b.orbitSpeed * dir * (1 - e);
      const orbD = b.orbitDist * (1 - e);
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.35) {
      const ea = (e - 0.35) / 0.65;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Slow start fast finish — gentle drift then accelerating snap ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3030);
    const edges = makeEdges(targets, sc, 3031);
    const balls = makeBalls(targets, cx, cy, sc, 3032);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    // Cubic ease-in: very slow start, rapid finish
    const t = interpolate(frame, [10, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * t;

    const pos = data.balls.map((b) => {
      const orbA = b.orbitAngle + frame * b.orbitSpeed * 0.6 * (1 - e);
      const orbD = b.orbitDist * (1 - e);
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD * 0.7;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.4) {
      const ea = (e - 0.4) / 0.6;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Eyes first — left-eye nodes spiral in first, then right eye, then center ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3040);
    const edges = makeEdges(targets, sc, 3041);
    const balls = makeBalls(targets, cx, cy, sc, 3042);
    // Region: left eye = first ~35%, right eye = next ~35%, rest = center/antenna/proboscis
    const leftEnd = Math.floor(N * 0.35 + (N - Math.floor(N * 0.35) * 2 - Math.floor(N * 0.15) - Math.floor(N * 0.04) * 2 - Math.floor(N * 0.02)) / 2);
    const rightEnd = leftEnd + Math.floor(N * 0.35 + (N - Math.floor(N * 0.35) * 2 - Math.floor(N * 0.15) - Math.floor(N * 0.04) * 2 - Math.floor(N * 0.02)) / 2);
    return { balls, edges, cx, cy, leftEnd, rightEnd };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);

    const pos = data.balls.map((b, i) => {
      // Stagger: left eye 0-80, right eye 20-100, center 50-120
      let start = 50, end = 120;
      if (i < data.leftEnd) { start = 0; end = 80; }
      else if (i < data.rightEnd) { start = 20; end = 100; }
      const t = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const e = t * t * (3 - 2 * t);
      const orbA = b.orbitAngle + frame * b.orbitSpeed * (1 - e);
      const orbD = b.orbitDist * (1 - e);
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e, e };
    });

    for (const [i, j] of data.edges) {
      const ea = Math.min(pos[i].e, pos[j].e);
      if (ea > 0.4) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * (ea - 0.4) / 0.6 * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Tightening orbit — orbit radius shrinks gradually like a drain ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3050);
    const edges = makeEdges(targets, sc, 3051);
    const balls = makeBalls(targets, cx, cy, sc, 3052);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Orbit shrinks continuously, speed increases as radius decreases (angular momentum conservation)
    const radiusFactor = 1 - t;
    const speedMult = 1 + t * 3;
    const snap = interpolate(frame, [90, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const snapE = snap * snap;

    const pos = data.balls.map((b) => {
      const orbA = b.orbitAngle + frame * b.orbitSpeed * speedMult;
      const orbD = b.orbitDist * radiusFactor;
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD * 0.75;
      return { x: ox + (b.tx - ox) * snapE, y: oy + (b.ty - oy) * snapE };
    });

    if (snapE > 0.2) {
      const ea = (snapE - 0.2) / 0.8;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Color-grouped — each color spirals in its own cluster, clusters merge into head ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3060);
    const edges = makeEdges(targets, sc, 3061);
    const balls = makeBalls(targets, cx, cy, sc, 3062);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * (3 - 2 * t);

    const pos = data.balls.map((b) => {
      // Each color group orbits from a different cluster center
      const groupAngle = (b.c / 8) * Math.PI * 2;
      const groupCx = data.cx + Math.cos(groupAngle) * 100 * sc * (1 - e);
      const groupCy = data.cy + Math.sin(groupAngle) * 70 * sc * (1 - e);
      const orbA = b.orbitAngle + frame * b.orbitSpeed * (1 - e);
      const orbD = 30 * sc * (1 - e);
      const ox = groupCx + Math.cos(orbA) * orbD;
      const oy = groupCy + Math.sin(orbA) * orbD;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.35) {
      const ea = (e - 0.35) / 0.65;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Figure-8 — nodes trace figure-eight paths while converging ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3070);
    const edges = makeEdges(targets, sc, 3071);
    const balls = makeBalls(targets, cx, cy, sc, 3072);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [15, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * (3 - 2 * t);

    const pos = data.balls.map((b) => {
      // Figure-8 (lemniscate): x = cos(t), y = sin(2t)/2
      const phase = b.orbitAngle + frame * b.orbitSpeed * 1.5 * (1 - e);
      const figX = Math.cos(phase) * b.orbitDist * 0.8 * (1 - e);
      const figY = Math.sin(phase * 2) * 0.4 * b.orbitDist * 0.8 * (1 - e);
      const ox = data.cx + figX;
      const oy = data.cy + figY;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.35) {
      const ea = (e - 0.35) / 0.65;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Pulsing waves — nodes orbit in pulsing rings that breathe in/out before settling ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3080);
    const edges = makeEdges(targets, sc, 3081);
    const balls = makeBalls(targets, cx, cy, sc, 3082);
    return { balls, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);
    const t = interpolate(frame, [10, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const e = t * t * (3 - 2 * t);

    const pos = data.balls.map((b) => {
      // Breathing pulse on orbit radius
      const pulse = 1 + Math.sin(frame * 0.06 + b.orbitAngle * 3) * 0.35 * (1 - e);
      const orbA = b.orbitAngle + frame * b.orbitSpeed * (1 - e);
      const orbD = b.orbitDist * (1 - e) * pulse;
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD * 0.75;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e };
    });

    if (e > 0.35) {
      const ea = (e - 0.35) / 0.65;
      for (const [i, j] of data.edges) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Cascade — inner nodes settle first (domino from center out), spiral shrinks outward ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const balls = makeBalls(targets, cx, cy, sc, 3092);
    // Sort by distance from center for cascade order
    const dists = targets.map((t, i) => ({ i, d: Math.sqrt((t.x - cx) ** 2 + (t.y - cy) ** 2) }));
    dists.sort((a, b) => a.d - b.d);
    const order = new Array(N);
    dists.forEach((d, rank) => { order[d.i] = rank; });
    return { balls, edges, cx, cy, order };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 150);

    const pos = data.balls.map((b, i) => {
      const rank = data.order[i];
      const start = 10 + (rank / N) * 60;
      const end = start + 40;
      const t = interpolate(frame, [start, end], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const e = t * t * (3 - 2 * t);
      const orbA = b.orbitAngle + frame * b.orbitSpeed * (1 - e);
      const orbD = b.orbitDist * (1 - e);
      const ox = data.cx + Math.cos(orbA) * orbD;
      const oy = data.cy + Math.sin(orbA) * orbD;
      return { x: ox + (b.tx - ox) * e, y: oy + (b.ty - oy) * e, e };
    });

    for (const [i, j] of data.edges) {
      const ea = Math.min(pos[i].e, pos[j].e);
      if (ea > 0.5) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * (ea - 0.5) * 2 * 0.4, frame, cellHSL(data.balls[i].c)[0], cellHSL(data.balls[j].c)[0]);
    }
    for (let i = 0; i < data.balls.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.balls[i].r, data.balls[i].c, a, frame);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/** Full-screen version of V9 (Cascade Center-Out) for FB-001 */
export const FB001_Final = V9;

export const VARIANTS_FB_001X: VariantDef[] = [
  { id: "fb001x-v1", label: "Uniform Spiral", component: V1 },
  { id: "fb001x-v2", label: "Double Vortex", component: V2 },
  { id: "fb001x-v3", label: "Slow Start Fast Snap", component: V3 },
  { id: "fb001x-v4", label: "Eyes First", component: V4 },
  { id: "fb001x-v5", label: "Tightening Orbit", component: V5 },
  { id: "fb001x-v6", label: "Color Clusters", component: V6 },
  { id: "fb001x-v7", label: "Figure-8 Paths", component: V7 },
  { id: "fb001x-v8", label: "Pulsing Waves", component: V8 },
  { id: "fb001x-v9", label: "Cascade Center-Out", component: V9 },
];
