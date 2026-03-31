// Shot 016 — "the same neuron in the next. To turn those flat images back into a 3D brain,
//   an AI spent years tracing the path of every single cell, pixel by pixel,
//   connecting the dots through the stack."
// Duration: 139 frames (~4.6s)
// STARTS from FB-015: screen full of flat 2D image tiles (column waterfall)
// Shows: AI connects dots across slices — blobs in one layer linked to blobs in the next — 3D emerges
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText,
  fadeInOut, cellHSL, drawFBColorEdge,
} from "./flatbold-kit";

const DUR = 139;

/* ── V1: Stacked slices with dots connected — horizontal layers, lines link matching dots between them ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const data = useMemo(() => {
    const rng = seeded(1610);
    const layers = 7;
    const nodesPerLayer = 8;
    const nodes: { x: number; y: number; layer: number; c: number }[] = [];
    const connections: [number, number][] = [];
    for (let l = 0; l < layers; l++) {
      for (let n = 0; n < nodesPerLayer; n++) {
        nodes.push({
          x: 0.12 + rng() * 0.76,
          y: (l + 0.3 + rng() * 0.4) / layers,
          layer: l, c: Math.floor(rng() * 8),
        });
        // Connect to node in next layer
        if (l < layers - 1) {
          const fromIdx = l * nodesPerLayer + n;
          const toIdx = (l + 1) * nodesPerLayer + Math.floor(rng() * nodesPerLayer);
          connections.push([fromIdx, toIdx]);
        }
      }
    }
    return { nodes, connections, layers };
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Tiles fading from FB-015
    const tileFade = interpolate(frame, [0, 20], [0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (tileFade > 0) {
      const rng = seeded(1570);
      const tileSize = 20 * sc;
      const cols = Math.ceil(w / tileSize);
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < 5; row++) {
          const [ph, ps, pl] = cellHSL(Math.floor(rng() * 8));
          ctx.globalAlpha = a * tileFade * 0.3;
          ctx.fillStyle = `hsla(${ph},${ps + 10}%,${Math.min(85, pl + 12)}%,0.5)`;
          ctx.fillRect(col * tileSize, row * tileSize * 3, tileSize - 1, tileSize - 1);
        }
      }
      ctx.globalAlpha = 1;
    }

    // Layer lines (faint horizontal)
    const layerT = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (layerT > 0) {
      for (let l = 0; l < data.layers; l++) {
        const ly = (l + 0.5) / data.layers * h;
        ctx.globalAlpha = a * layerT * 0.06;
        ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
        ctx.beginPath(); ctx.moveTo(w * 0.05, ly); ctx.lineTo(w * 0.95, ly); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Nodes appear per layer
    const nodeT = interpolate(frame, [15, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shownNodes = Math.floor(nodeT * data.nodes.length);
    for (let i = 0; i < shownNodes; i++) {
      const n = data.nodes[i];
      drawFBNode(ctx, n.x * w, n.y * h, 3.5 * sc, n.c, a * 0.7, frame);
    }

    // Connections traced between layers (AI connecting the dots)
    const connT = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shownConns = Math.floor(connT * data.connections.length);
    for (let i = 0; i < shownConns; i++) {
      const [from, to] = data.connections[i];
      if (from >= data.nodes.length || to >= data.nodes.length) continue;
      const nf = data.nodes[from], nt = data.nodes[to];
      const lineA = Math.min(1, (shownConns - i) / 3);
      drawFBEdge(ctx, nf.x * w, nf.y * h, nt.x * w, nt.y * h, sc, a * lineA * 0.35, frame, cellHSL(nf.c)[0], cellHSL(nt.c)[0]);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: 2D circles → 3D connected — flat circles on stacked planes, lines grow between matching ones ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const slices = useMemo(() => {
    const rng = seeded(1620);
    return Array.from({ length: 5 }, (_, layer) => ({
      y: 0.15 + layer * 0.17,
      blobs: Array.from({ length: 6 }, () => ({
        x: 0.1 + rng() * 0.8, r: (3 + rng() * 4) * sc, c: Math.floor(rng() * 8),
      })),
    }));
  }, [sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Slices appear with slight 3D perspective (each offset slightly right)
    const sliceT = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let s = 0; s < slices.length; s++) {
      const sl = slices[s];
      const sReveal = interpolate(sliceT, [s * 0.15, s * 0.15 + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (sReveal <= 0) continue;
      const offsetX = s * 8 * sc; // 3D offset
      const ly = sl.y * h;

      // Slice background line
      ctx.globalAlpha = a * sReveal * 0.08;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(w * 0.05 + offsetX, ly - 1, w * 0.8, 2);
      ctx.globalAlpha = 1;

      // Blobs on this slice
      for (const blob of sl.blobs) {
        drawFBNode(ctx, blob.x * w * 0.8 + w * 0.1 + offsetX, ly, blob.r * sReveal, blob.c, a * sReveal * 0.7, frame);
      }
    }

    // AI traces connections between layers (matching blobs)
    const traceT = interpolate(frame, [35, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (traceT > 0) {
      const rng = seeded(1621);
      for (let s = 0; s < slices.length - 1; s++) {
        const sl1 = slices[s], sl2 = slices[s + 1];
        for (let b = 0; b < sl1.blobs.length; b++) {
          const connReveal = interpolate(traceT, [(s * sl1.blobs.length + b) / (slices.length * 6), (s * sl1.blobs.length + b + 1) / (slices.length * 6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (connReveal <= 0) continue;
          const b2 = Math.floor(rng() * sl2.blobs.length);
          const x1 = sl1.blobs[b].x * w * 0.8 + w * 0.1 + s * 8 * sc;
          const y1 = sl1.y * h;
          const x2 = sl2.blobs[b2].x * w * 0.8 + w * 0.1 + (s + 1) * 8 * sc;
          const y2 = sl2.y * h;
          drawFBColorEdge(ctx, x1, y1, x2, y2, `hsla(${cellHSL(sl1.blobs[b].c)[0]},40%,55%,${a * connReveal * 0.3})`, sc, a * connReveal * 0.4);
        }
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Scan line traces a neuron — highlights one blob, follows it across multiple slices ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2;

    // 6 horizontal slice layers
    const layers = 6;
    const rng = seeded(1630);
    // One tracked neuron (golden) drifts position across layers
    const trackedPositions = Array.from({ length: layers }, (_, i) => ({
      x: 0.4 + Math.sin(i * 0.7) * 0.15 + (rng() - 0.5) * 0.05,
    }));

    const sliceT = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const traceT = interpolate(frame, [25, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const tracedLayers = Math.floor(traceT * layers);

    for (let l = 0; l < layers; l++) {
      const ly = h * 0.1 + (l / (layers - 1)) * h * 0.8;
      const lReveal = interpolate(sliceT, [l * 0.1, l * 0.1 + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lReveal <= 0) continue;

      // Slice line
      ctx.globalAlpha = a * lReveal * 0.06;
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
      ctx.beginPath(); ctx.moveTo(w * 0.05, ly); ctx.lineTo(w * 0.95, ly); ctx.stroke();
      ctx.globalAlpha = 1;

      // Random blobs on each slice (dim)
      for (let b = 0; b < 8; b++) {
        const bx = 0.08 + rng() * 0.84;
        drawFBNode(ctx, bx * w, ly, (2 + rng() * 3) * sc, Math.floor(rng() * 8), a * lReveal * 0.3, frame);
      }

      // The tracked neuron (bright gold, larger)
      const isTraced = l < tracedLayers;
      const tx = trackedPositions[l].x * w;
      drawFBNode(ctx, tx, ly, (isTraced ? 5 : 3) * sc, 3, a * lReveal * (isTraced ? 0.9 : 0.4), frame);

      // Connection to previous tracked position
      if (isTraced && l > 0) {
        const prevTx = trackedPositions[l - 1].x * w;
        const prevLy = h * 0.1 + ((l - 1) / (layers - 1)) * h * 0.8;
        drawFBColorEdge(ctx, prevTx, prevLy, tx, ly, FB.gold, sc, a * 0.5);
      }
    }

    // Scan cursor on current tracing layer
    if (tracedLayers > 0 && tracedLayers < layers) {
      const curLy = h * 0.1 + (tracedLayers / (layers - 1)) * h * 0.8;
      const curTx = trackedPositions[tracedLayers].x * w;
      ctx.globalAlpha = a * 0.3;
      const sg = ctx.createRadialGradient(curTx, curLy, 0, curTx, curLy, 12 * sc);
      sg.addColorStop(0, `rgba(78,205,196,0.5)`); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(curTx, curLy, 12 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: 3D assembly — flat blobs rise off their slices and assemble into a 3D neuron shape ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const blobs = useMemo(() => { const rng = seeded(1640);
    return Array.from({ length: 30 }, () => {
      const layer = Math.floor(rng() * 6);
      const a2 = rng() * Math.PI * 2, d = Math.pow(rng(), 0.5) * 60 * sc;
      return {
        flatX: 0.1 + rng() * 0.8, flatY: 0.1 + layer * 0.15,
        assembledX: 0.5 + Math.cos(a2) * d / w, assembledY: 0.5 + Math.sin(a2) * d * 0.7 / h,
        c: Math.floor(rng() * 8), r: (2 + rng() * 3) * sc,
      };
    });
  }, [w, h, sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const assembleT = interpolate(frame, [15, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const assembleE = assembleT * assembleT * (3 - 2 * assembleT);

    // Blobs transition from flat layer positions to assembled 3D positions
    for (let i = 0; i < blobs.length; i++) {
      const b = blobs[i];
      const x = (b.flatX + (b.assembledX - b.flatX) * assembleE) * w;
      const y = (b.flatY + (b.assembledY - b.flatY) * assembleE) * h;
      drawFBNode(ctx, x, y, b.r, b.c, a * 0.7, frame);
    }

    // Connections form as assembly progresses
    if (assembleE > 0.3) {
      const connA = (assembleE - 0.3) / 0.7;
      for (let i = 1; i < blobs.length; i++) {
        const b1 = blobs[i - 1], b2 = blobs[i];
        const x1 = (b1.flatX + (b1.assembledX - b1.flatX) * assembleE) * w;
        const y1 = (b1.flatY + (b1.assembledY - b1.flatY) * assembleE) * h;
        const x2 = (b2.flatX + (b2.assembledX - b2.flatX) * assembleE) * w;
        const y2 = (b2.flatY + (b2.assembledY - b2.flatY) * assembleE) * h;
        const dx = x1 - x2, dy = y1 - y2;
        if (Math.sqrt(dx * dx + dy * dy) < 60 * sc) {
          drawFBEdge(ctx, x1, y1, x2, y2, sc, a * connA * 0.25, frame, cellHSL(b1.c)[0], cellHSL(b2.c)[0]);
        }
      }
    }

    // Layer lines fade as assembly happens
    if (assembleE < 0.7) {
      for (let l = 0; l < 6; l++) {
        const ly = h * (0.1 + l * 0.15);
        ctx.globalAlpha = a * (1 - assembleE / 0.7) * 0.05;
        ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
        ctx.beginPath(); ctx.moveTo(w * 0.05, ly); ctx.lineTo(w * 0.95, ly); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Side-by-side — left shows flat slices stacked, right shows the 3D result forming ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([3*sc,3*sc]); ctx.beginPath(); ctx.moveTo(w/2, h*0.05); ctx.lineTo(w/2, h*0.95); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    const revT = interpolate(frame, [5, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1650);

    // LEFT: flat slices with blobs
    const lcx = w * 0.25;
    for (let l = 0; l < 5; l++) {
      const ly = h * 0.15 + l * h * 0.15;
      const lRev = interpolate(revT, [l * 0.15, l * 0.15 + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lRev <= 0) continue;
      // Slice bg
      ctx.globalAlpha = a * lRev * 0.08;
      ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(w * 0.05, ly - 1, w * 0.4, 2);
      ctx.globalAlpha = 1;
      for (let b = 0; b < 5; b++) {
        drawFBNode(ctx, lcx - 40 * sc + rng() * 80 * sc, ly, (2 + rng() * 2) * sc, Math.floor(rng() * 8), a * lRev * 0.5, frame);
      }
    }

    // RIGHT: 3D network assembling
    const buildT = interpolate(frame, [30, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rcx = w * 0.75, rcy = h / 2;
    const rng2 = seeded(1651);
    const rNodes: { x: number; y: number; c: number }[] = [];
    for (let i = 0; i < 25; i++) {
      const a2 = rng2() * Math.PI * 2, d = Math.pow(rng2(), 0.5) * 60 * sc;
      rNodes.push({ x: rcx + Math.cos(a2) * d, y: rcy + Math.sin(a2) * d * 0.7, c: Math.floor(rng2() * 8) });
    }
    const shown = Math.floor(buildT * rNodes.length);
    for (let i = 1; i < shown; i++) {
      drawFBEdge(ctx, rNodes[i-1].x, rNodes[i-1].y, rNodes[i].x, rNodes[i].y, sc, a * buildT * 0.2, frame);
    }
    for (let i = 0; i < shown; i++) drawFBNode(ctx, rNodes[i].x, rNodes[i].y, 3 * sc, rNodes[i].c, a * buildT * 0.6, frame);

    // Arrow
    if (revT > 0.5 && buildT > 0.1) {
      ctx.globalAlpha = a * 0.2; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(w * 0.47, h / 2); ctx.lineTo(w * 0.53, h / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.53, h / 2); ctx.lineTo(w * 0.52, h / 2 - 3 * sc); ctx.moveTo(w * 0.53, h / 2); ctx.lineTo(w * 0.52, h / 2 + 3 * sc); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Thread weaving — a single colored thread weaves through stacked slices connecting blobs ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const layers = 8;
    const rng = seeded(1660);
    const waypoints: { x: number; y: number }[] = [];
    for (let l = 0; l < layers; l++) {
      waypoints.push({ x: 0.2 + rng() * 0.6, y: 0.08 + l / (layers - 1) * 0.84 });
    }

    // Slice layers
    const sliceRevT = interpolate(frame, [3, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let l = 0; l < layers; l++) {
      const ly = waypoints[l].y * h;
      const lr = interpolate(sliceRevT, [l * 0.1, l * 0.1 + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (lr <= 0) continue;
      ctx.globalAlpha = a * lr * 0.06;
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
      ctx.beginPath(); ctx.moveTo(w * 0.05, ly); ctx.lineTo(w * 0.95, ly); ctx.stroke();
      ctx.globalAlpha = 1;
      // Random blobs
      for (let b = 0; b < 6; b++) drawFBNode(ctx, (0.08 + rng() * 0.84) * w, ly, (2 + rng() * 2) * sc, Math.floor(rng() * 8), a * lr * 0.3, frame);
      // Waypoint blob (brighter)
      drawFBNode(ctx, waypoints[l].x * w, ly, 4 * sc, 3, a * lr * 0.7, frame);
    }

    // Thread traces the waypoints
    const threadT = interpolate(frame, [20, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (threadT > 0) {
      const threadLen = threadT * (waypoints.length - 1);
      ctx.globalAlpha = a * 0.6;
      ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * sc; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath();
      for (let i = 0; i <= Math.min(Math.floor(threadLen), waypoints.length - 1); i++) {
        const wp = waypoints[i];
        i === 0 ? ctx.moveTo(wp.x * w, wp.y * h) : ctx.lineTo(wp.x * w, wp.y * h);
      }
      // Partial segment to current position
      const frac = threadLen - Math.floor(threadLen);
      const curIdx = Math.min(Math.floor(threadLen), waypoints.length - 2);
      if (curIdx >= 0 && curIdx < waypoints.length - 1) {
        const from = waypoints[curIdx], to = waypoints[curIdx + 1];
        ctx.lineTo(from.x * w + (to.x - from.x) * w * frac, from.y * h + (to.y - from.y) * h * frac);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Multiple threads — several colored threads traced simultaneously through the stack ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const threads = useMemo(() => { const rng = seeded(1670);
    return Array.from({ length: 5 }, (_, t) => ({
      color: t, delay: t * 12,
      waypoints: Array.from({ length: 7 }, (_, l) => ({ x: 0.1 + rng() * 0.8, y: 0.08 + l / 6 * 0.84 })),
    }));
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Faint layer lines
    for (let l = 0; l < 7; l++) {
      const ly = h * (0.08 + l / 6 * 0.84);
      ctx.globalAlpha = a * 0.04; ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 0.5 * sc;
      ctx.beginPath(); ctx.moveTo(w * 0.03, ly); ctx.lineTo(w * 0.97, ly); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Each thread traces its path
    for (const thread of threads) {
      const tT = interpolate(frame, [10 + thread.delay, 90 + thread.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (tT <= 0) continue;
      const [th] = cellHSL(thread.color);
      const threadLen = tT * (thread.waypoints.length - 1);

      // Waypoint nodes
      for (let i = 0; i <= Math.min(Math.floor(threadLen) + 1, thread.waypoints.length - 1); i++) {
        const wp = thread.waypoints[i];
        drawFBNode(ctx, wp.x * w, wp.y * h, 3 * sc, thread.color, a * tT * 0.6, frame);
      }

      // Thread line
      ctx.globalAlpha = a * tT * 0.4;
      ctx.strokeStyle = `hsla(${th},50%,60%,0.6)`; ctx.lineWidth = 1.5 * sc; ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= Math.min(Math.floor(threadLen), thread.waypoints.length - 1); i++) {
        const wp = thread.waypoints[i];
        i === 0 ? ctx.moveTo(wp.x * w, wp.y * h) : ctx.lineTo(wp.x * w, wp.y * h);
      }
      const frac = threadLen - Math.floor(threadLen);
      const ci = Math.min(Math.floor(threadLen), thread.waypoints.length - 2);
      if (ci >= 0 && ci < thread.waypoints.length - 1) {
        const f = thread.waypoints[ci], t2 = thread.waypoints[ci + 1];
        ctx.lineTo(f.x * w + (t2.x - f.x) * w * frac, f.y * h + (t2.y - f.y) * h * frac);
      }
      ctx.stroke(); ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Scan + connect — teal scan bar moves down, as it passes each layer, connections form ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const data = useMemo(() => { const rng = seeded(1680);
    const layers = 6;
    const nodes: { x: number; y: number; c: number; layer: number }[] = [];
    for (let l = 0; l < layers; l++) {
      for (let n = 0; n < 7; n++) {
        nodes.push({ x: 0.08 + rng() * 0.84, y: 0.1 + l / (layers - 1) * 0.8, c: Math.floor(rng() * 8), layer: l });
      }
    }
    return { nodes, layers };
  }, []);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const scanT = interpolate(frame, [10, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scanY = h * (0.05 + scanT * 0.9);

    // All nodes (dim)
    for (const n of data.nodes) drawFBNode(ctx, n.x * w, n.y * h, 3 * sc, n.c, a * 0.25, frame);

    // Nodes above scan line: bright + connected
    const rng = seeded(1681);
    for (const n of data.nodes) {
      if (n.y * h > scanY) continue;
      drawFBNode(ctx, n.x * w, n.y * h, 3.5 * sc, n.c, a * 0.7, frame);
    }
    // Connections between scanned layers
    for (let i = 0; i < data.nodes.length; i++) {
      const ni = data.nodes[i];
      if (ni.y * h > scanY) continue;
      for (let j = i + 1; j < Math.min(i + 8, data.nodes.length); j++) {
        const nj = data.nodes[j];
        if (nj.y * h > scanY) continue;
        if (ni.layer === nj.layer) continue;
        const dx = (ni.x - nj.x) * w, dy = (ni.y - nj.y) * h;
        if (Math.sqrt(dx * dx + dy * dy) < 80 * sc) {
          drawFBEdge(ctx, ni.x * w, ni.y * h, nj.x * w, nj.y * h, sc, a * 0.15, frame, cellHSL(ni.c)[0], cellHSL(nj.c)[0]);
        }
      }
    }

    // Scan bar
    ctx.globalAlpha = a * 0.5;
    ctx.strokeStyle = `rgba(78,205,196,0.7)`; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(w, scanY); ctx.stroke();
    ctx.globalAlpha = a * 0.06;
    ctx.fillStyle = `rgba(78,205,196,0.2)`;
    ctx.fillRect(0, scanY - 6 * sc, w, 12 * sc);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Pixel-by-pixel — zoom into two adjacent slices, matching colored circles get connected one by one ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  const pairs = useMemo(() => { const rng = seeded(1690);
    return Array.from({ length: 12 }, () => ({
      x1: 0.1 + rng() * 0.8, x2: 0.1 + rng() * 0.8, c: Math.floor(rng() * 8), r: (3 + rng() * 3) * sc,
    }));
  }, [sc]);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    const topY = h * 0.3, botY = h * 0.7;

    // Two slice layers
    ctx.globalAlpha = a * 0.08;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(w * 0.05, topY - 1, w * 0.9, 2);
    ctx.fillRect(w * 0.05, botY - 1, w * 0.9, 2);
    ctx.globalAlpha = 1;

    // Blobs on each layer + connections forming
    const connT = interpolate(frame, [15, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const connected = Math.floor(connT * pairs.length);

    for (let i = 0; i < pairs.length; i++) {
      const p = pairs[i];
      const isConn = i < connected;
      // Top blob
      drawFBNode(ctx, p.x1 * w, topY, p.r, p.c, a * (isConn ? 0.8 : 0.3), frame);
      // Bottom blob
      drawFBNode(ctx, p.x2 * w, botY, p.r, p.c, a * (isConn ? 0.8 : 0.3), frame);
      // Connection line
      if (isConn) {
        const lineAge = Math.min(1, (connected - i) / 2);
        drawFBColorEdge(ctx, p.x1 * w, topY, p.x2 * w, botY, `hsla(${cellHSL(p.c)[0]},50%,60%,${a * lineAge * 0.4})`, sc, a * lineAge * 0.5);
      }
    }

    // Scan cursor on current pair
    if (connected < pairs.length && connected > 0) {
      const cp = pairs[connected];
      ctx.globalAlpha = a * 0.2;
      const sg = ctx.createRadialGradient(cp.x1 * w, topY, 0, cp.x1 * w, topY, 10 * sc);
      sg.addColorStop(0, `rgba(78,205,196,0.4)`); sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cp.x1 * w, topY, 10 * sc, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB016_Final = V2;

export const VARIANTS_FB_016: VariantDef[] = [
  { id: "fb016-v1", label: "Dots Across Layers", component: V1 },
  { id: "fb016-v2", label: "3D Perspective Slices", component: V2 },
  { id: "fb016-v3", label: "Trace One Neuron", component: V3 },
  { id: "fb016-v4", label: "Flat → 3D Assembly", component: V4 },
  { id: "fb016-v5", label: "Side by Side", component: V5 },
  { id: "fb016-v6", label: "Single Thread", component: V6 },
  { id: "fb016-v7", label: "Multiple Threads", component: V7 },
  { id: "fb016-v8", label: "Scan Bar Connect", component: V8 },
  { id: "fb016-v9", label: "Pair by Pair", component: V9 },
];
