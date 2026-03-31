import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawPerson, drawPin, drawBust } from "../icons";

// Shot 04 — "set out to do something that had never been done before"
// 9 ways to show institution network / collaboration

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Hub-and-spoke: big labeled hubs connected, small person icons clustered around each
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4001);
    const hubs = [
      { x: width * 0.3, y: height * 0.35, label: "Princeton", hue: 220 },
      { x: width * 0.7, y: height * 0.3, label: "Cambridge", hue: 140 },
      { x: width * 0.5, y: height * 0.6, label: "Janelia", hue: 280 },
      { x: width * 0.2, y: height * 0.7, label: "", hue: 55 },
      { x: width * 0.8, y: height * 0.65, label: "", hue: 350 },
    ];
    const people: { hx: number; x: number; y: number; hue: number }[] = [];
    hubs.forEach((h, hi) => {
      const n = hi < 3 ? 12 : 6;
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2, d = 15 * s + r() * 20 * s;
        people.push({ hx: hi, x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d, hue: h.hue });
      }
    });
    const edges: [number, number][] = [[0,1],[0,2],[1,2],[2,3],[2,4]];
    return { hubs, people, edges };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const t = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    // Edges
    for (const [a, b] of data.edges) {
      const et = interpolate(t, [0.2, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (et <= 0) continue;
      const ha = data.hubs[a], hb = data.hubs[b];
      ctx.strokeStyle = `hsla(220, 30%, 55%, ${et * 0.3})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(ha.x, ha.y); ctx.lineTo(ha.x + (hb.x - ha.x) * et, ha.y + (hb.y - ha.y) * et); ctx.stroke();
    }
    // Hub circles
    for (const h of data.hubs) {
      ctx.fillStyle = `hsla(${h.hue}, 35%, 40%, 0.3)`;
      ctx.beginPath(); ctx.arc(h.x, h.y, 30 * s, 0, Math.PI * 2); ctx.fill();
      if (h.label && t > 0.3) {
        ctx.fillStyle = PALETTE.text.dim;
        ctx.font = `${10 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(h.label, h.x, h.y - 22 * s);
      }
    }
    // People
    const vis = Math.floor(t * data.people.length);
    for (let i = 0; i < vis; i++) {
      const p = data.people[i];
      drawPerson(ctx, p.x, p.y, 6 * s, `hsla(${p.hue}, 50%, 60%, 0.8)`);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("127 institutions", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Constellation: institutions as stars connected by lines, person counts shown
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(35, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4002);
    const stars: { x: number; y: number; hue: number; size: number; label: string; count: number }[] = [];
    const names = ["Princeton", "Cambridge", "Janelia", "MPI", "ETH", "MIT", "Caltech"];
    for (let i = 0; i < 7; i++) {
      stars.push({ x: width * (0.2 + r() * 0.6), y: height * (0.2 + r() * 0.55), hue: PALETTE.cellColors[i % 8][0], size: (8 + r() * 10) * s, label: names[i], count: 10 + Math.floor(r() * 30) });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < stars.length; i++) for (let j = i + 1; j < stars.length; j++) if (r() < 0.35) edges.push([i, j]);
    return { stars, edges };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const vis = Math.floor(t * data.stars.length);
    for (const [a, b] of data.edges) {
      if (a >= vis || b >= vis) continue;
      const sa = data.stars[a], sb = data.stars[b];
      ctx.strokeStyle = `hsla(220, 25%, 50%, 0.15)`;
      ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(sa.x, sa.y); ctx.lineTo(sb.x, sb.y); ctx.stroke();
    }
    for (let i = 0; i < vis; i++) {
      const st = data.stars[i];
      ctx.fillStyle = `hsla(${st.hue}, 55%, 65%, 0.8)`;
      ctx.beginPath(); ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `hsla(${st.hue}, 55%, 65%, 0.15)`;
      ctx.beginPath(); ctx.arc(st.x, st.y, st.size * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PALETTE.text.dim; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(st.label, st.x, st.y + st.size + 12 * s);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Pipeline: institutions as boxes in a pipeline, arrows between them
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const labs = ["Janelia", "Princeton", "Cambridge", "MPI", "ETH", "HHMI", "127 labs"];
    const boxW = 65 * s, boxH = 28 * s, gap = 12 * s;
    const totalW = labs.length * (boxW + gap) - gap;
    const startX = (width - totalW) / 2;
    const cy = height / 2;
    for (let i = 0; i < labs.length; i++) {
      const showT = interpolate(frame, [10 + i * 10, 20 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (showT <= 0) continue;
      const x = startX + i * (boxW + gap);
      const hue = PALETTE.cellColors[i % 8][0];
      ctx.globalAlpha = fo * showT;
      ctx.fillStyle = `hsla(${hue}, 35%, 30%, 0.5)`;
      ctx.fillRect(x, cy - boxH / 2, boxW, boxH);
      ctx.strokeStyle = `hsla(${hue}, 45%, 55%, 0.6)`;
      ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(x, cy - boxH / 2, boxW, boxH);
      ctx.fillStyle = PALETTE.text.primary;
      ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(labs[i], x + boxW / 2, cy + 4 * s);
      if (i < labs.length - 1) {
        ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1 * s;
        ctx.beginPath(); ctx.moveTo(x + boxW + 2, cy); ctx.lineTo(x + boxW + gap - 2, cy); ctx.stroke();
      }
    }
    ctx.globalAlpha = fo;
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("never been done before", width / 2, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Handshake network: pairs of person icons shaking hands, forming a web
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4004);
    const pairs: { x: number; y: number; hue1: number; hue2: number; delay: number }[] = [];
    for (let i = 0; i < 25; i++) {
      pairs.push({ x: width * (0.1 + r() * 0.8), y: height * (0.15 + r() * 0.65), hue1: PALETTE.cellColors[Math.floor(r() * 8)][0], hue2: PALETTE.cellColors[Math.floor(r() * 8)][0], delay: r() * 60 });
    }
    return { pairs };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    for (const p of data.pairs) {
      const t = interpolate(frame - p.delay, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (t <= 0) continue;
      ctx.globalAlpha = fo * t;
      drawPerson(ctx, p.x - 8 * s, p.y, 7 * s, `hsla(${p.hue1}, 50%, 60%, 0.85)`);
      drawPerson(ctx, p.x + 8 * s, p.y, 7 * s, `hsla(${p.hue2}, 50%, 60%, 0.85)`);
      // Handshake line
      ctx.strokeStyle = `hsla(50, 50%, 65%, ${t * 0.4})`;
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(p.x - 3 * s, p.y + 2 * s); ctx.lineTo(p.x + 3 * s, p.y + 2 * s); ctx.stroke();
    }
    ctx.globalAlpha = fo;
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("127 institutions collaborating", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Flag parade: institution flags/banners in a row, unfurling
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const flags = 12;
    const flagW = 22 * s, flagH = 30 * s, gap = (width * 0.8) / flags;
    const baseY = height * 0.35;
    for (let i = 0; i < flags; i++) {
      const showT = interpolate(frame, [5 + i * 6, 15 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (showT <= 0) continue;
      const x = width * 0.1 + i * gap + gap / 2;
      const hue = PALETTE.cellColors[i % 8][0];
      const wave = Math.sin(frame * 0.06 + i * 0.8) * 3 * s;
      // Pole
      ctx.strokeStyle = PALETTE.text.dim; ctx.lineWidth = 1.5 * s;
      ctx.beginPath(); ctx.moveTo(x, baseY - 5 * s); ctx.lineTo(x, baseY + flagH + 15 * s); ctx.stroke();
      // Flag
      ctx.fillStyle = `hsla(${hue}, 50%, 55%, ${showT * 0.7})`;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + flagW + wave, baseY + flagH * 0.2);
      ctx.lineTo(x + flagW + wave * 0.5, baseY + flagH * 0.5);
      ctx.lineTo(x, baseY + flagH * showT);
      ctx.closePath(); ctx.fill();
    }
    // People below flags
    const pCount = Math.floor(interpolate(frame, [30, 100], [0, 40], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    const r = seeded(4005);
    for (let i = 0; i < pCount; i++) {
      const px = width * 0.1 + r() * width * 0.8;
      const py = height * 0.7 + r() * height * 0.15;
      drawPerson(ctx, px, py, 5 * s, `hsla(${PALETTE.cellColors[Math.floor(r() * 8)][0]}, 45%, 55%, 0.6)`);
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("127 institutions, one mission", width / 2, height * 0.93);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Zoom-out from single person to crowd: starts with one person, camera pulls back
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4006);
    const people: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.5) * Math.min(width, height) * 0.4;
      people.push({ x: width / 2 + Math.cos(a) * d, y: height / 2 + Math.sin(a) * d * 0.7, hue: PALETTE.cellColors[Math.floor(r() * 8)][0] });
    }
    return { people };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    const zoom = interpolate(frame, [5, 100], [3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fo;
    ctx.save();
    ctx.translate(width / 2, height / 2); ctx.scale(zoom, zoom); ctx.translate(-width / 2, -height / 2);
    const vis = Math.floor(interpolate(frame, [5, 100], [1, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    for (let i = 0; i < vis; i++) {
      const p = data.people[i];
      drawPerson(ctx, p.x, p.y, 6 * s, `hsla(${p.hue}, 50%, 60%, 0.8)`);
    }
    ctx.restore();
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText(`${vis}+ scientists`, width / 2, height * 0.93);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Org chart: tree of institution nodes branching down to researcher icons
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const t = interpolate(frame, [5, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Root
    const rootY = height * 0.15;
    if (t > 0) {
      ctx.fillStyle = PALETTE.text.accent; ctx.font = `bold ${14 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("FlyWire Consortium", width / 2, rootY);
    }
    // Level 1: 5 institutions
    const l1 = ["Princeton", "Cambridge", "Janelia", "MPI", "HHMI"];
    const l1Y = height * 0.33;
    for (let i = 0; i < l1.length; i++) {
      const showT = interpolate(t, [0.15, 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (showT <= 0) continue;
      const x = width * (0.15 + i * 0.175);
      ctx.strokeStyle = `hsla(220, 30%, 50%, ${showT * 0.3})`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(width / 2, rootY + 8 * s); ctx.lineTo(x, l1Y - 10 * s); ctx.stroke();
      ctx.fillStyle = `hsla(${PALETTE.cellColors[i][0]}, 45%, 55%, ${showT * 0.8})`;
      ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(l1[i], x, l1Y);
      // People below each
      const pT = interpolate(t, [0.4, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const pCount = Math.floor(pT * 6);
      for (let p = 0; p < pCount; p++) {
        drawPerson(ctx, x - 12 * s + p * 5 * s, l1Y + 20 * s + Math.floor(p / 3) * 12 * s, 4 * s, `hsla(${PALETTE.cellColors[i][0]}, 45%, 55%, 0.7)`);
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${11 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("200+ scientists, 127 labs", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Jigsaw: institution-colored puzzle pieces assembling together
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4008);
    const pieces: { tx: number; ty: number; sx: number; sy: number; hue: number; label: string }[] = [];
    const grid = 4, cellW = width * 0.5 / grid, cellH = height * 0.4 / grid;
    const labels = ["Princeton", "Cambridge", "Janelia", "MPI", "ETH", "MIT", "Caltech", "Oxford", "HHMI", "Stanford", "Harvard", "Yale", "UCL", "Kyoto", "EPFL", "Zurich"];
    for (let row = 0; row < grid; row++) for (let col = 0; col < grid; col++) {
      const tx = width * 0.25 + col * cellW + cellW / 2;
      const ty = height * 0.25 + row * cellH + cellH / 2;
      pieces.push({ tx, ty, sx: r() * width, sy: r() * height, hue: PALETTE.cellColors[(row * grid + col) % 8][0], label: labels[row * grid + col] || "" });
    }
    return { pieces };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    const t = interpolate(frame, [10, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const p of data.pieces) {
      const x = p.sx + (p.tx - p.sx) * t;
      const y = p.sy + (p.ty - p.sy) * t;
      const cellW = width * 0.5 / 4 * 0.9, cellH = height * 0.4 / 4 * 0.9;
      ctx.fillStyle = `hsla(${p.hue}, 40%, 45%, 0.5)`;
      ctx.fillRect(x - cellW / 2, y - cellH / 2, cellW, cellH);
      ctx.strokeStyle = `hsla(${p.hue}, 50%, 60%, 0.4)`;
      ctx.lineWidth = 1 * s;
      ctx.strokeRect(x - cellW / 2, y - cellH / 2, cellW, cellH);
      if (p.label && t > 0.5) {
        ctx.fillStyle = PALETTE.text.dim; ctx.font = `${7 * s}px system-ui`; ctx.textAlign = "center";
        ctx.fillText(p.label, x, y + 3 * s);
      }
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("assembling the collaboration", width / 2, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Email / message lines connecting person icons across screen
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  const parts = useMemo(() => makeParticles(25, width, height, s), [width, height, s]);
  const data = useMemo(() => {
    const r = seeded(4009);
    const nodes: { x: number; y: number; hue: number }[] = [];
    for (let i = 0; i < 20; i++) {
      nodes.push({ x: width * (0.1 + r() * 0.8), y: height * (0.15 + r() * 0.6), hue: PALETTE.cellColors[Math.floor(r() * 8)][0] });
    }
    const msgs: { from: number; to: number; delay: number }[] = [];
    for (let i = 0; i < 30; i++) {
      msgs.push({ from: Math.floor(r() * nodes.length), to: Math.floor(r() * nodes.length), delay: r() * 80 });
    }
    return { nodes, msgs };
  }, [width, height, s]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, parts, frame, s);
    const fo = fadeInOut(frame, 150);
    ctx.globalAlpha = fo;
    // Person nodes
    for (const n of data.nodes) {
      drawPerson(ctx, n.x, n.y, 8 * s, `hsla(${n.hue}, 50%, 60%, 0.8)`);
    }
    // Flying message dots
    for (const m of data.msgs) {
      if (m.from === m.to) continue;
      const mt = interpolate(frame - m.delay, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (mt <= 0 || mt >= 1) continue;
      const a = data.nodes[m.from], b = data.nodes[m.to];
      const mx = a.x + (b.x - a.x) * mt, my = a.y + (b.y - a.y) * mt;
      ctx.fillStyle = `hsla(50, 60%, 70%, 0.8)`;
      ctx.beginPath(); ctx.arc(mx, my, 3 * s, 0, Math.PI * 2); ctx.fill();
      // Trail
      ctx.strokeStyle = `hsla(50, 50%, 60%, 0.15)`; ctx.lineWidth = 1 * s;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke();
    }
    ctx.fillStyle = PALETTE.text.dim; ctx.font = `${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("a worldwide collaboration", width / 2, height * 0.92);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_004: VariantDef[] = [
  { id: "hub-spoke", label: "Hub & Spoke", component: V1 },
  { id: "constellation", label: "Constellation", component: V2 },
  { id: "pipeline", label: "Pipeline Boxes", component: V3 },
  { id: "handshakes", label: "Handshake Pairs", component: V4 },
  { id: "flags", label: "Flag Parade", component: V5 },
  { id: "zoom-out", label: "Zoom Out Crowd", component: V6 },
  { id: "org-chart", label: "Org Chart Tree", component: V7 },
  { id: "jigsaw", label: "Jigsaw Assembly", component: V8 },
  { id: "messages", label: "Message Network", component: V9 },
];
