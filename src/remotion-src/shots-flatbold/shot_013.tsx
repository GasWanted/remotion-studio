// Shot 013 — "freezing the brain in resin, they captured a high-resolution snapshot of
//   its 'source code.' We aren't bringing a dead fly back to life; we're running its"
// Duration: 130 frames (~4.3s)
// STARTS from FB-012: completed pixel grid scan of brain tissue
// The scan IS the source code — frame it as code/data, frozen snapshot, not alive
// 9 unique variations

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  FB, seeded, drawFBBg, drawFBNode, drawFBText, drawFBCounter,
  fadeInOut, cellHSL,
} from "./flatbold-kit";

const DUR = 130;

/** Draw the completed pixel grid (from FB-012 ending) */
function drawPixelGrid(ctx: CanvasRenderingContext2D, cx: number, cy: number, gridW: number, gridH: number, cellSize: number, sc: number, alpha: number) {
  const cols = Math.floor(gridW / cellSize), rows = Math.floor(gridH / cellSize);
  const rng = seeded(1240); // same seed as FB-012
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const px = cx - gridW / 2 + col * cellSize;
    const py = cy - gridH / 2 + row * cellSize;
    const c = Math.floor(rng() * 8);
    const [ph, ps, pl] = cellHSL(c);
    ctx.globalAlpha = alpha * 0.85;
    ctx.fillStyle = `hsla(${ph},${ps + 10}%,${Math.min(85, pl + 12)}%,0.85)`;
    ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
  }
  ctx.globalAlpha = 1;
}

/* ── V1: Pixel grid transforms — grid cells rearrange into code-like rows of characters ── */
const V1: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Grid fading
    const gridA = interpolate(frame, [0, 40, 55, 70], [1, 1, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gridA > 0) drawPixelGrid(ctx, cx, cy, 220 * sc, 150 * sc, 8 * sc, sc, a * gridA);

    // Code lines appear (monospace text rows representing the "source code")
    const codeT = interpolate(frame, [35, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (codeT > 0) {
      const lines = [
        "neuron[0]: v=-52.0mV syn=0.0",
        "neuron[1]: v=-48.3mV syn=1.2",
        "weight[0→1]: +0.275",
        "weight[1→0]: -0.183",
        "spike_threshold: -45.0mV",
        "connections: 54,000,000",
        "neurons: 139,000",
        "dt: 0.1ms",
        "// source code of a brain",
      ];
      const shownLines = Math.floor(codeT * lines.length);
      const lineH = 16 * sc;
      const startY = cy - (lines.length * lineH) / 2;

      ctx.font = `${9 * sc}px 'Courier New', monospace`;
      ctx.textAlign = "left";
      for (let i = 0; i < shownLines; i++) {
        const lineA = Math.min(1, (shownLines - i) / 2);
        const [lh] = cellHSL(i % 8);
        ctx.globalAlpha = a * codeT * lineA * 0.85;
        ctx.fillStyle = i === lines.length - 1 ? FB.text.accent : `hsla(${lh},40%,65%,0.8)`;
        ctx.fillText(lines[i], cx - 110 * sc, startY + i * lineH);
      }
      ctx.globalAlpha = 1;
    }

    // "{ }" brackets framing the code
    if (codeT > 0.3) {
      const brA = (codeT - 0.3) / 0.7;
      ctx.globalAlpha = a * brA * 0.3;
      ctx.font = `bold ${40 * sc}px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = FB.text.dim;
      ctx.fillText("{", cx - 130 * sc, cy + 5 * sc);
      ctx.fillText("}", cx + 130 * sc, cy + 5 * sc);
      ctx.globalAlpha = 1;
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V2: Freeze frame — grid gets a "frozen" ice/crystal overlay, "SNAPSHOT" stamp ── */
const V2: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Pixel grid
    drawPixelGrid(ctx, cx, cy, 220 * sc, 150 * sc, 8 * sc, sc, a);

    // Ice/freeze overlay spreads from center
    const freezeT = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (freezeT > 0) {
      const freezeR = freezeT * Math.max(w, h) * 0.5;
      ctx.globalAlpha = a * freezeT * 0.08;
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(1, freezeR));
      fg.addColorStop(0, "rgba(180,220,255,0.3)"); fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, freezeR), 0, Math.PI * 2); ctx.fill();

      // Frost crystal lines radiating from center
      ctx.strokeStyle = `rgba(180,220,255,${a * freezeT * 0.1})`;
      ctx.lineWidth = 0.5 * sc;
      const rng = seeded(1300);
      for (let i = 0; i < 20; i++) {
        const angle = rng() * Math.PI * 2;
        const len = freezeT * (40 + rng() * 80) * sc;
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // "SOURCE CODE" text
    if (freezeT > 0.5) {
      const txtA = (freezeT - 0.5) * 2;
      drawFBText(ctx, "SOURCE CODE", cx, h * 0.08, 16 * sc, a * txtA * 0.6, "center", FB.teal);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V3: Grid → matrix — pixel grid morphs into a data matrix with numbers ── */
const V3: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const gridW = 220 * sc, gridH = 150 * sc, cellSize = 12 * sc;
    const cols = Math.floor(gridW / cellSize), rows = Math.floor(gridH / cellSize);

    const morphT = interpolate(frame, [10, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const rng = seeded(1240);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = cx - gridW / 2 + col * cellSize;
        const py = cy - gridH / 2 + row * cellSize;
        const c = Math.floor(rng() * 8);
        const [ph, ps, pl] = cellHSL(c);

        // Colored cell fades, number appears
        ctx.globalAlpha = a * (1 - morphT * 0.7) * 0.4;
        ctx.fillStyle = `hsla(${ph},${ps}%,${pl}%,0.5)`;
        ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);

        // Number overlay
        if (morphT > 0.2) {
          const numA = (morphT - 0.2) / 0.8;
          ctx.globalAlpha = a * numA * 0.5;
          ctx.fillStyle = `hsla(${ph},${ps - 10}%,${pl + 15}%,0.7)`;
          ctx.font = `${5 * sc}px 'Courier New', monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          const val = (Math.floor(rng() * 900) / 100).toFixed(1);
          ctx.fillText(val, px + cellSize / 2, py + cellSize / 2);
        }
      }
    }
    ctx.globalAlpha = 1;

    if (morphT > 0.5) drawFBText(ctx, "frozen architecture", cx, h * 0.92, 11 * sc, a * (morphT - 0.5) * 2 * 0.4, "center", FB.text.accent);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V4: Camera shutter — grid freezes with a camera flash/shutter effect ── */
const V4: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    drawPixelGrid(ctx, cx, cy, 220 * sc, 150 * sc, 8 * sc, sc, a);

    // Shutter flash at frame 30
    const flashFrame = 30;
    if (frame >= flashFrame - 1 && frame <= flashFrame + 5) {
      ctx.globalAlpha = (1 - Math.abs(frame - flashFrame) / 5) * 0.2;
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1;
    }

    // After flash: photo border appears around the grid
    const borderT = interpolate(frame, [35, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (borderT > 0) {
      const bE = borderT * borderT * (3 - 2 * borderT);
      ctx.globalAlpha = a * bE * 0.4;
      ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 3 * sc;
      const bw = 230 * sc, bh = 160 * sc;
      ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);
      // Photo white border
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(cx - bw / 2 - 8 * sc, cy - bh / 2 - 8 * sc, bw + 16 * sc, bh + 16 * sc);
      ctx.globalAlpha = 1;

      // "snapshot" text below like a photo caption
      if (bE > 0.5) {
        drawFBText(ctx, "high-resolution snapshot", cx, cy + bh / 2 + 20 * sc, 10 * sc, a * (bE - 0.5) * 2 * 0.5, "center", FB.text.dim);
        drawFBText(ctx, "SOURCE CODE", cx, cy + bh / 2 + 36 * sc, 13 * sc, a * (bE - 0.5) * 2 * 0.6, "center", FB.text.accent);
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V5: Not alive — grid visible, "X" over heartbeat, "not alive, just architecture" ── */
const V5: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    drawPixelGrid(ctx, cx, cy - 15 * sc, 200 * sc, 130 * sc, 8 * sc, sc, a * 0.7);

    // Flatline EKG at bottom (not alive)
    const ekgT = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (ekgT > 0) {
      const ekgY = h * 0.82;
      ctx.globalAlpha = a * ekgT * 0.5;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = w * 0.15; x <= w * 0.85; x += 2) {
        ctx.lineTo(x, ekgY); // flat line — no heartbeat
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Red X over where heartbeat should be
      if (ekgT > 0.5) {
        const xA = (ekgT - 0.5) * 2;
        ctx.globalAlpha = a * xA * 0.4;
        ctx.strokeStyle = FB.red; ctx.lineWidth = 2.5 * sc; ctx.lineCap = "round";
        const xSize = 12 * sc;
        ctx.beginPath(); ctx.moveTo(cx - xSize, ekgY - xSize); ctx.lineTo(cx + xSize, ekgY + xSize); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + xSize, ekgY - xSize); ctx.lineTo(cx - xSize, ekgY + xSize); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Text
    const txtT = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (txtT > 0) {
      drawFBText(ctx, "not alive", cx, h * 0.07, 13 * sc, a * txtT * 0.5, "center", FB.red);
      drawFBText(ctx, "just architecture", cx, h * 0.93, 11 * sc, a * txtT * 0.4, "center", FB.text.accent);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V6: Terminal — grid fades into a terminal window showing brain data ── */
const V6: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    // Grid fading
    const gridA = interpolate(frame, [0, 30, 45, 60], [1, 1, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (gridA > 0) drawPixelGrid(ctx, cx, cy, 200 * sc, 130 * sc, 8 * sc, sc, a * gridA);

    // Terminal window
    const termT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (termT > 0) {
      const tE = termT * termT * (3 - 2 * termT);
      const tw = 240 * sc * tE, th = 160 * sc * tE;

      // Window bg
      ctx.globalAlpha = a * tE * 0.3;
      ctx.fillStyle = "rgba(20,15,30,0.8)";
      ctx.fillRect(cx - tw / 2, cy - th / 2, tw, th);
      // Title bar
      ctx.fillStyle = "rgba(60,50,80,0.6)";
      ctx.fillRect(cx - tw / 2, cy - th / 2, tw, 14 * sc);
      // Dots
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = [FB.red, FB.gold, FB.green][i];
        ctx.globalAlpha = a * tE * 0.4;
        ctx.beginPath(); ctx.arc(cx - tw / 2 + 10 * sc + i * 10 * sc, cy - th / 2 + 7 * sc, 2.5 * sc, 0, Math.PI * 2); ctx.fill();
      }
      // Border
      ctx.globalAlpha = a * tE * 0.3;
      ctx.strokeStyle = "rgba(100,80,130,0.5)"; ctx.lineWidth = 1 * sc;
      ctx.strokeRect(cx - tw / 2, cy - th / 2, tw, th);
      ctx.globalAlpha = 1;

      // Terminal text
      if (tE > 0.5) {
        const txtA = (tE - 0.5) * 2;
        const lines = [
          "$ cat brain.dat",
          "neurons: 139,000",
          "synapses: 54,000,000",
          "format: frozen_snapshot",
          "status: NOT_ALIVE",
          "type: source_code",
        ];
        const lineH = 13 * sc;
        const startY = cy - th / 2 + 22 * sc;
        const shownLines = Math.floor(txtA * lines.length);
        ctx.font = `${7 * sc}px 'Courier New', monospace`;
        ctx.textAlign = "left";
        for (let i = 0; i < shownLines; i++) {
          ctx.globalAlpha = a * txtA * 0.5;
          ctx.fillStyle = i === 0 ? FB.green : FB.teal;
          ctx.fillText(lines[i], cx - tw / 2 + 10 * sc, startY + i * lineH);
        }
        // Blinking cursor
        if (Math.floor(frame / 15) % 2 === 0) {
          ctx.fillStyle = FB.green;
          ctx.fillRect(cx - tw / 2 + 10 * sc + shownLines > 0 ? ctx.measureText(lines[Math.min(shownLines, lines.length - 1)]).width + 12 * sc : 10 * sc, startY + (shownLines - 1) * lineH - 7 * sc, 5 * sc, 10 * sc);
        }
        ctx.globalAlpha = 1;
      }
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V7: Film negative — grid inverts colors like a photographic negative ── */
const V7: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;
    const gridW = 220 * sc, gridH = 150 * sc, cellSize = 8 * sc;

    const invertT = interpolate(frame, [20, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    const cols = Math.floor(gridW / cellSize), rows = Math.floor(gridH / cellSize);
    const rng = seeded(1240);

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const px = cx - gridW / 2 + col * cellSize;
      const py = cy - gridH / 2 + row * cellSize;
      const c = Math.floor(rng() * 8);
      const [ph, ps, pl] = cellHSL(c);
      // Invert: shift hue 180, invert lightness
      const invH = (ph + 180 * invertT) % 360;
      const invL = pl + (85 - pl) * invertT * 0.5;
      ctx.globalAlpha = a * 0.5;
      ctx.fillStyle = `hsla(${invH},${ps}%,${invL}%,0.5)`;
      ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
    }
    ctx.globalAlpha = 1;

    // Film sprocket holes on sides
    if (invertT > 0.3) {
      const fA = (invertT - 0.3) / 0.7;
      ctx.globalAlpha = a * fA * 0.15;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 8; i++) {
        const hy = cy - gridH / 2 + (i / 7) * gridH;
        ctx.fillRect(cx - gridW / 2 - 12 * sc, hy - 3 * sc, 8 * sc, 6 * sc);
        ctx.fillRect(cx + gridW / 2 + 4 * sc, hy - 3 * sc, 8 * sc, 6 * sc);
      }
      ctx.globalAlpha = 1;
    }

    if (invertT > 0.5) drawFBText(ctx, "captured", cx, h * 0.08, 13 * sc, a * (invertT - 0.5) * 2 * 0.5, "center", FB.text.accent);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V8: Grid to chip — pixel grid shrinks into a chip/USB icon shape ── */
const V8: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);
    const cx = w / 2, cy = h / 2;

    const shrinkT = interpolate(frame, [10, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const shrinkE = shrinkT * shrinkT * (3 - 2 * shrinkT);
    const gridScale = 1 - shrinkE * 0.6;

    drawPixelGrid(ctx, cx, cy, 220 * sc * gridScale, 150 * sc * gridScale, 8 * sc * gridScale, sc, a);

    // Chip outline grows around the shrunken grid
    if (shrinkE > 0.3) {
      const chipA = (shrinkE - 0.3) / 0.7;
      const chipW = 100 * sc, chipH = 80 * sc;
      ctx.globalAlpha = a * chipA * 0.4;
      ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
      ctx.strokeRect(cx - chipW / 2, cy - chipH / 2, chipW, chipH);
      // Pins on all sides
      for (let i = 0; i < 6; i++) {
        const t2 = (i / 5);
        // Top pins
        ctx.strokeStyle = `rgba(78,205,196,${a * chipA * 0.3})`; ctx.lineWidth = 1.5 * sc;
        const px = cx - chipW / 2 + t2 * chipW;
        ctx.beginPath(); ctx.moveTo(px, cy - chipH / 2); ctx.lineTo(px, cy - chipH / 2 - 10 * sc); ctx.stroke();
        // Bottom pins
        ctx.beginPath(); ctx.moveTo(px, cy + chipH / 2); ctx.lineTo(px, cy + chipH / 2 + 10 * sc); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (shrinkE > 0.5) drawFBText(ctx, "digital copy", cx, h * 0.92, 11 * sc, a * (shrinkE - 0.5) * 2 * 0.4, "center", FB.text.accent);
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

/* ── V9: Split — left: scan image (frozen, static), right: "not alive" with flatline ── */
const V9: React.FC<VariantProps> = ({ width: w, height: h }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const sc = Math.min(w, h) / 360;
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, w, h, frame); const a = fadeInOut(frame, DUR);

    // Divider
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1 * sc;
    ctx.setLineDash([3 * sc, 3 * sc]); ctx.beginPath(); ctx.moveTo(w / 2, h * 0.05); ctx.lineTo(w / 2, h * 0.95); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    // LEFT: frozen scan
    const lT = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawPixelGrid(ctx, w * 0.25, h / 2, 130 * sc * lT, 100 * sc * lT, 6 * sc, sc, a * lT);
    if (lT > 0.5) drawFBText(ctx, "source code", w * 0.25, h * 0.12, 10 * sc, a * (lT - 0.5) * 2 * 0.5, "center", FB.teal);

    // RIGHT: brain network but frozen/gray with flatline
    const rT = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (rT > 0) {
      const rng = seeded(1390);
      const rcx = w * 0.75, rcy = h * 0.45;
      for (let i = 0; i < 20; i++) {
        const a2 = rng() * Math.PI * 2, d = Math.pow(rng(), 0.5) * 50 * sc;
        ctx.globalAlpha = a * rT * 0.2;
        ctx.fillStyle = "rgba(120,110,130,0.4)";
        ctx.beginPath(); ctx.arc(rcx + Math.cos(a2) * d, rcy + Math.sin(a2) * d * 0.8, (2 + rng() * 2) * sc, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Flatline
      ctx.globalAlpha = a * rT * 0.4;
      ctx.strokeStyle = FB.red; ctx.lineWidth = 1.5 * sc;
      ctx.beginPath(); ctx.moveTo(w * 0.6, h * 0.75); ctx.lineTo(w * 0.9, h * 0.75); ctx.stroke();
      ctx.globalAlpha = 1;
      if (rT > 0.5) drawFBText(ctx, "not alive", w * 0.75, h * 0.85, 10 * sc, a * (rT - 0.5) * 2 * 0.4, "center", FB.red);
    }
  });
  return <canvas ref={ref} width={w} height={h} style={{ width: w, height: h }} />;
};

export const FB013_Final = V1;

export const VARIANTS_FB_013: VariantDef[] = [
  { id: "fb013-v1", label: "Grid → Code", component: V1 },
  { id: "fb013-v2", label: "Freeze Snapshot", component: V2 },
  { id: "fb013-v3", label: "Number Matrix", component: V3 },
  { id: "fb013-v4", label: "Camera Shutter", component: V4 },
  { id: "fb013-v5", label: "Not Alive + Flatline", component: V5 },
  { id: "fb013-v6", label: "Terminal Window", component: V6 },
  { id: "fb013-v7", label: "Film Negative", component: V7 },
  { id: "fb013-v8", label: "Grid → Chip", component: V8 },
  { id: "fb013-v9", label: "Split: Code vs Dead", component: V9 },
];
