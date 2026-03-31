// Shot 002 — "entire instinct in 32 seconds."
// Duration: 90 frames (3s)
// STARTS from FB-001 final state: 140-node fly head with dense connections
// Then: something dramatic happens — breaking, rewiring, shattering for "I broke that instinct"

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter,
  fadeInOut, cellHSL, drawFBColorEdge,
} from "./flatbold-kit";

const N = 140;

/** Fly-head target positions — identical to shot_001_explore so the shapes match */
function makeFlyHeadTargets(cx: number, cy: number, count: number, scale: number, seed: number) {
  const rng = seeded(seed);
  const targets: { x: number; y: number }[] = [];
  const leftEyeX = cx - 55 * scale, leftEyeY = cy - 5 * scale;
  const leftRx = 40 * scale, leftRy = 50 * scale;
  const rightEyeX = cx + 55 * scale, rightEyeY = cy - 5 * scale;
  const rightRx = 40 * scale, rightRy = 50 * scale;
  const headRx = 25 * scale, headRy = 35 * scale;
  const antL = { x: cx - 35 * scale, y: cy - 70 * scale };
  const antR = { x: cx + 35 * scale, y: cy - 70 * scale };
  const prob = { x: cx, y: cy + 55 * scale };

  const eyeCount = Math.floor(count * 0.35);
  const headCount = Math.floor(count * 0.15);
  const antCount = Math.floor(count * 0.04);
  const probCount = Math.floor(count * 0.02);
  const extra = count - eyeCount * 2 - headCount - antCount * 2 - probCount;

  for (let i = 0; i < eyeCount + Math.floor(extra / 2); i++) {
    const a = rng() * Math.PI * 2, d = Math.pow(rng(), 0.5);
    targets.push({ x: leftEyeX + Math.cos(a) * d * leftRx, y: leftEyeY + Math.sin(a) * d * leftRy });
  }
  for (let i = 0; i < eyeCount + Math.ceil(extra / 2); i++) {
    const a = rng() * Math.PI * 2, d = Math.pow(rng(), 0.5);
    targets.push({ x: rightEyeX + Math.cos(a) * d * rightRx, y: rightEyeY + Math.sin(a) * d * rightRy });
  }
  for (let i = 0; i < headCount; i++) {
    const a = rng() * Math.PI * 2, d = Math.pow(rng(), 0.5);
    targets.push({ x: cx + Math.cos(a) * d * headRx, y: cy + Math.sin(a) * d * headRy });
  }
  for (let i = 0; i < antCount; i++) { targets.push({ x: antL.x + (rng() - 0.5) * 8 * scale, y: antL.y - i * 6 * scale }); }
  for (let i = 0; i < antCount; i++) { targets.push({ x: antR.x + (rng() - 0.5) * 8 * scale, y: antR.y - i * 6 * scale }); }
  for (let i = 0; i < probCount; i++) { targets.push({ x: prob.x + (rng() - 0.5) * 6 * scale, y: prob.y + i * 5 * scale }); }
  return targets;
}

function makeEdges(targets: { x: number; y: number }[], scale: number, seed: number) {
  const rng = seeded(seed);
  const edges: [number, number][] = [];
  for (let i = 0; i < targets.length; i++) {
    for (let j = i + 1; j < targets.length; j++) {
      const dx = targets[i].x - targets[j].x, dy = targets[i].y - targets[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 35 * scale && rng() < 0.3) edges.push([i, j]);
    }
  }
  return edges;
}

interface NodeData { x: number; y: number; r: number; c: number; vx: number; vy: number; }

function makeNodeData(targets: { x: number; y: number }[], scale: number, seed: number): NodeData[] {
  const rng = seeded(seed);
  return targets.map((t) => ({
    x: t.x, y: t.y,
    r: (1.5 + rng() * 3) * scale,
    c: Math.floor(rng() * 8),
    vx: (rng() - 0.5) * 8,
    vy: (rng() - 0.5) * 8,
  }));
}

/* ── V1: Red shockwave — pulse from center shatters the fly head outward ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const shatter = interpolate(frame, [25, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    // Shockwave ring
    if (shatter > 0) {
      const ringR = shatter * Math.max(width, height) * 0.6;
      ctx.globalAlpha = a * (1 - shatter) * 0.5;
      ctx.strokeStyle = FB.red;
      ctx.lineWidth = 4 * sc;
      ctx.beginPath(); ctx.arc(data.cx, data.cy, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    const pos = data.nodes.map((n) => {
      const dx = n.x - data.cx, dy = n.y - data.cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pushX = (dx / dist) * shatter * 150 * sc;
      const pushY = (dy / dist) * shatter * 150 * sc;
      return { x: n.x + pushX, y: n.y + pushY };
    });

    if (shatter < 0.8) {
      for (const [i, j] of data.edges) {
        const ea = (1 - shatter) * 0.4;
        drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea, frame, cellHSL(data.nodes[i].c)[0], cellHSL(data.nodes[j].c)[0]);
      }
    }
    for (let i = 0; i < data.nodes.length; i++) {
      const nodeA = shatter < 0.5 ? 1 : 1 - (shatter - 0.5) * 2;
      drawFBNode(ctx, pos[i].x, pos[i].y, data.nodes[i].r, shatter > 0.3 ? 0 : data.nodes[i].c, a * nodeA, frame);
    }

    // Flash
    if (frame >= 23 && frame <= 30) {
      ctx.globalAlpha = (1 - Math.abs(frame - 26) / 4) * 0.25;
      ctx.fillStyle = FB.red; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1;
    }
    drawFBText(ctx, "32 SECONDS", width / 2, height * 0.92, 14 * sc, a * shatter, "center", FB.red);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Crack propagation — red lightning crack splits the fly head in two ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const crackT = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const split = interpolate(frame, [40, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const pos = data.nodes.map((n) => {
      const side = n.x < data.cx ? -1 : 1;
      return { x: n.x + side * split * 40 * sc, y: n.y + split * 10 * sc };
    });

    for (const [i, j] of data.edges) {
      const crossesCrack = (data.nodes[i].x < data.cx) !== (data.nodes[j].x < data.cx);
      const ea = crossesCrack ? Math.max(0, 0.4 - crackT) : 0.4 * (1 - split * 0.5);
      if (ea > 0) drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea, frame, cellHSL(data.nodes[i].c)[0], cellHSL(data.nodes[j].c)[0]);
    }
    for (let i = 0; i < data.nodes.length; i++) drawFBNode(ctx, pos[i].x, pos[i].y, data.nodes[i].r, data.nodes[i].c, a, frame);

    // Red crack down the middle
    if (crackT > 0) {
      const rng = seeded(4000);
      ctx.globalAlpha = a;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 3 * sc; ctx.lineCap = "round";
      ctx.beginPath();
      let cy2 = data.cy - 80 * sc;
      ctx.moveTo(data.cx, cy2);
      for (let i = 0; i < 12; i++) {
        cy2 += 14 * sc;
        const cx2 = data.cx + (rng() - 0.5) * 20 * sc;
        if (i / 12 < crackT) ctx.lineTo(cx2, cy2);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/** Full-screen version of V2 (Crack Split) for FB-002 */
export const FB002_Final = V2;

/* ── V3: Connections turn red one by one — infection spreading through network ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const infect = interpolate(frame, [10, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const infected = Math.floor(infect * data.edges.length);

    for (let i = 0; i < data.edges.length; i++) {
      const [ai, bi] = data.edges[i];
      const isRed = i < infected;
      const hA = cellHSL(data.nodes[ai].c)[0], hB = cellHSL(data.nodes[bi].c)[0];
      if (isRed) {
        drawFBColorEdge(ctx, data.nodes[ai].x, data.nodes[ai].y, data.nodes[bi].x, data.nodes[bi].y, FB.red, sc, a * 0.6);
      } else {
        drawFBEdge(ctx, data.nodes[ai].x, data.nodes[ai].y, data.nodes[bi].x, data.nodes[bi].y, sc, a * 0.4, frame, hA, hB);
      }
    }
    // Track which nodes are infected (connected to any red edge)
    const nodeInfected = new Set<number>();
    for (let i = 0; i < infected; i++) { nodeInfected.add(data.edges[i][0]); nodeInfected.add(data.edges[i][1]); }
    for (let i = 0; i < data.nodes.length; i++) {
      drawFBNode(ctx, data.nodes[i].x, data.nodes[i].y, data.nodes[i].r, nodeInfected.has(i) ? 0 : data.nodes[i].c, a, frame);
    }
    drawFBCounter(ctx, Math.round(infect * 32) + "s", width / 2, height * 0.92, 14 * sc, FB.red, a);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Dissolve — nodes flicker and vanish from edges inward ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    const dists = nodes.map((n) => Math.sqrt((n.x - cx) ** 2 + (n.y - cy) ** 2));
    const maxDist = Math.max(...dists);
    return { nodes, edges, cx, cy, dists, maxDist };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const dissolve = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const [i, j] of data.edges) {
      // Outer edges dissolve first
      const edgeDist = Math.max(data.dists[i], data.dists[j]) / data.maxDist;
      const threshold = 1 - edgeDist; // outer = lower threshold
      const alive = dissolve < threshold + 0.3;
      if (alive) {
        const flicker = dissolve > threshold ? Math.random() * 0.5 : 1;
        drawFBEdge(ctx, data.nodes[i].x, data.nodes[i].y, data.nodes[j].x, data.nodes[j].y, sc, a * 0.4 * flicker, frame);
      }
    }
    for (let i = 0; i < data.nodes.length; i++) {
      const normDist = data.dists[i] / data.maxDist;
      const threshold = 1 - normDist;
      const alive = dissolve < threshold + 0.3;
      if (alive) {
        const flicker = dissolve > threshold ? 0.3 + Math.random() * 0.7 : 1;
        drawFBNode(ctx, data.nodes[i].x, data.nodes[i].y, data.nodes[i].r, data.nodes[i].c, a * flicker, frame);
      }
    }
    drawFBText(ctx, "32 SECONDS", width / 2, height * 0.92, 14 * sc, a * dissolve, "center", FB.red);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Glitch corruption — random blocks of the fly head get displaced/scrambled ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const glitch = interpolate(frame, [15, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const pos = data.nodes.map((n, i) => {
      // Glitch: random displacement that increases over time
      const seed = Math.sin(i * 73.7 + Math.floor(frame / 3) * 17.3);
      const intensity = glitch * glitch;
      const dx = seed * intensity * 60 * sc;
      const dy = Math.cos(i * 41.3 + Math.floor(frame / 3) * 23.1) * intensity * 40 * sc;
      return { x: n.x + dx, y: n.y + dy };
    });

    for (const [i, j] of data.edges) {
      const ea = 0.4 * (1 - glitch * 0.7);
      drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * ea, frame);
    }
    for (let i = 0; i < data.nodes.length; i++) {
      drawFBNode(ctx, pos[i].x, pos[i].y, data.nodes[i].r, glitch > 0.5 ? 0 : data.nodes[i].c, a, frame);
    }

    // Scanlines
    if (glitch > 0.2) {
      ctx.globalAlpha = a * glitch * 0.15;
      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = y % 8 < 4 ? "rgba(255,50,50,0.1)" : "transparent";
        ctx.fillRect(0, y, width, 2);
      }
      ctx.globalAlpha = 1;
    }
    drawFBCounter(ctx, "32s", width / 2, height * 0.07, 14 * sc, FB.red, a * glitch);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Color drain — all color drains to gray/red, gold sugar pathway dies ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const drain = interpolate(frame, [10, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const [i, j] of data.edges) {
      // Edges desaturate
      const hA = cellHSL(data.nodes[i].c), hB = cellHSL(data.nodes[j].c);
      const avgH = (hA[0] + hB[0]) / 2;
      const sat = Math.max(0, 40 - drain * 40);
      ctx.globalAlpha = a * 0.4;
      ctx.strokeStyle = drain > 0.8 ? `hsla(0, 0%, 30%, 0.25)` : `hsla(${avgH}, ${sat}%, 55%, 0.25)`;
      ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(data.nodes[i].x, data.nodes[i].y); ctx.lineTo(data.nodes[j].x, data.nodes[j].y); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < data.nodes.length; i++) {
      const n = data.nodes[i];
      const [h, s, l] = cellHSL(n.c);
      const sat = Math.max(0, s - drain * s);
      const lit2 = l - drain * 20;
      ctx.globalAlpha = a;
      ctx.fillStyle = drain > 0.8 ? `hsla(0, 10%, ${lit2}%, 1)` : `hsla(${h}, ${sat}%, ${lit2}%, 1)`;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (drain > 0.6) {
      drawFBText(ctx, "INSTINCT BROKEN", width / 2, height * 0.92, 13 * sc, a * (drain - 0.6) * 2.5, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Explosion scatter — nodes fly outward with physics (gravity pull down) ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const boom = Math.max(0, frame - 25);
    const boomT = interpolate(frame, [25, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const pos = data.nodes.map((n) => {
      if (boom <= 0) return { x: n.x, y: n.y };
      const t = boom / 30;
      return { x: n.x + n.vx * t * 12, y: n.y + n.vy * t * 12 + t * t * 80 }; // gravity
    });

    if (boomT < 0.6) {
      for (const [i, j] of data.edges) {
        drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * (1 - boomT) * 0.4, frame);
      }
    }
    for (let i = 0; i < data.nodes.length; i++) {
      const nodeA = boomT > 0 ? Math.max(0, 1 - boomT * 1.2) : 1;
      drawFBNode(ctx, pos[i].x, pos[i].y, data.nodes[i].r, boomT > 0.2 ? 0 : data.nodes[i].c, a * nodeA, frame);
    }

    // Flash
    if (frame >= 24 && frame <= 30) {
      ctx.globalAlpha = (1 - Math.abs(frame - 27) / 4) * 0.3;
      ctx.fillStyle = FB.red; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1;
    }
    drawFBCounter(ctx, "32", width / 2, height / 2, 50 * sc, FB.red, a * boomT * 0.4);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Rewire — connections detach and reattach to wrong nodes, network scrambles ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    // Wrong targets: each edge endpoint shifts to a random other node
    const rng = seeded(5080);
    const wrongEdges = edges.map(([ai, bi]) => [
      rng() < 0.6 ? Math.floor(rng() * nodes.length) : ai,
      rng() < 0.6 ? Math.floor(rng() * nodes.length) : bi,
    ] as [number, number]);
    return { nodes, edges, wrongEdges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const rewire = interpolate(frame, [15, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let e = 0; e < data.edges.length; e++) {
      const [oi, oj] = data.edges[e];
      const [wi, wj] = data.wrongEdges[e];
      const x1 = data.nodes[oi].x + (data.nodes[wi].x - data.nodes[oi].x) * rewire;
      const y1 = data.nodes[oi].y + (data.nodes[wi].y - data.nodes[oi].y) * rewire;
      const x2 = data.nodes[oj].x + (data.nodes[wj].x - data.nodes[oj].x) * rewire;
      const y2 = data.nodes[oj].y + (data.nodes[wj].y - data.nodes[oj].y) * rewire;
      const isWrong = wi !== oi || wj !== oj;
      const color = isWrong && rewire > 0.3 ? FB.red : undefined;
      if (color) drawFBColorEdge(ctx, x1, y1, x2, y2, color, sc, a * 0.4);
      else drawFBEdge(ctx, x1, y1, x2, y2, sc, a * 0.4, frame);
    }
    for (let i = 0; i < data.nodes.length; i++) drawFBNode(ctx, data.nodes[i].x, data.nodes[i].y, data.nodes[i].r, data.nodes[i].c, a, frame);
    drawFBText(ctx, "REWIRED", width / 2, height * 0.92, 14 * sc, a * rewire, "center", FB.red);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Heartbeat flatline — fly head pulses like a heartbeat, then red flatline ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(width, height) / 360;
  const data = useMemo(() => {
    const cx = width / 2, cy = height / 2;
    const targets = makeFlyHeadTargets(cx, cy, N, sc, 3090);
    const edges = makeEdges(targets, sc, 3091);
    const nodes = makeNodeData(targets, sc, 3092);
    return { nodes, edges, cx, cy };
  }, [width, height, sc]);

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawFBBg(ctx, width, height, frame);
    const a = fadeInOut(frame, 90);
    const flatlineFrame = 55;
    const isAlive = frame < flatlineFrame;

    // Pulse: scale the whole network rhythmically
    const pulse = isAlive ? 1 + Math.sin(frame * 0.25) * 0.04 : 1;
    const dimming = isAlive ? 1 : interpolate(frame, [flatlineFrame, 80], [1, 0.2], { extrapolateRight: "clamp" });

    const pos = data.nodes.map((n) => ({
      x: data.cx + (n.x - data.cx) * pulse,
      y: data.cy + (n.y - data.cy) * pulse,
    }));

    for (const [i, j] of data.edges) {
      drawFBEdge(ctx, pos[i].x, pos[i].y, pos[j].x, pos[j].y, sc, a * 0.4 * dimming, frame, cellHSL(data.nodes[i].c)[0], cellHSL(data.nodes[j].c)[0]);
    }
    for (let i = 0; i < data.nodes.length; i++) {
      drawFBNode(ctx, pos[i].x, pos[i].y, data.nodes[i].r, !isAlive ? 0 : data.nodes[i].c, a * dimming, frame);
    }

    // EKG line at bottom
    const ekg_y = height * 0.88;
    ctx.globalAlpha = a;
    ctx.strokeStyle = isAlive ? FB.green : FB.red;
    ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const t = (x / width) * 8 + frame * 0.15;
      let y = ekg_y;
      if (isAlive) {
        const beat = t % 2;
        if (beat > 0.8 && beat < 1.0) y -= 20 * sc * Math.sin((beat - 0.8) * Math.PI / 0.2);
        else if (beat > 1.0 && beat < 1.15) y += 8 * sc;
      }
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.globalAlpha = 1;

    if (!isAlive) drawFBCounter(ctx, "32s", width / 2, height * 0.08, 16 * sc, FB.red, a);
  });
  return <canvas ref={ref} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_FB_002: VariantDef[] = [
  { id: "fb002-v1", label: "Shockwave Shatter", component: V1 },
  { id: "fb002-v2", label: "Crack Split", component: V2 },
  { id: "fb002-v3", label: "Infection Spread", component: V3 },
  { id: "fb002-v4", label: "Edge Dissolve", component: V4 },
  { id: "fb002-v5", label: "Glitch Corrupt", component: V5 },
  { id: "fb002-v6", label: "Color Drain", component: V6 },
  { id: "fb002-v7", label: "Gravity Explosion", component: V7 },
  { id: "fb002-v8", label: "Rewire Scramble", component: V8 },
  { id: "fb002-v9", label: "Heartbeat Flatline", component: V9 },
];
