import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge, drawPersonBlob, drawIconPerson, drawIconBuilding } from "./flatbold-kit";

/* Shot 032 — "To solve that, researchers at Janelia Research Campus spent years
   building custom fly strains where specific neurons grow green under a microscope."
   — 210 frames (7s)
   Fly with ONE green glowing neuron, microscope view. */

const DUR = 210;

function accent(i: number) { return FB.colors[i % FB.colors.length]; }

/* V1: Fly outline, one neuron glows green, microscope lens appears */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    // Fly head outline
    const flyP = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * flyP * 0.25; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, 35 * sc, 0, Math.PI * 2); ctx.stroke();
    // Eyes
    ctx.beginPath(); ctx.arc(cx - 18 * sc, cy - 8 * sc, 12 * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 18 * sc, cy - 8 * sc, 12 * sc, 0, Math.PI * 2); ctx.stroke();
    // Dim neurons inside
    const rng = seeded(3201);
    for (let i = 0; i < 15; i++) {
      const angle = rng() * Math.PI * 2, dist = rng() * 28 * sc;
      const nx = cx + Math.cos(angle) * dist, ny = cy + Math.sin(angle) * dist;
      drawFBNode(ctx, nx, ny, 2 * sc, 6, a * flyP * 0.15, frame);
    }
    // ONE green glowing neuron
    const glowP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const gnx = cx + 5 * sc, gny = cy + 3 * sc;
    if (glowP > 0) {
      // Outer glow
      const pulse = 0.7 + Math.sin(frame * 0.08) * 0.3;
      ctx.globalAlpha = a * glowP * 0.2 * pulse;
      const gGrad = ctx.createRadialGradient(gnx, gny, 0, gnx, gny, 25 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.5)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad;
      ctx.beginPath(); ctx.arc(gnx, gny, 25 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, gnx, gny, 5 * sc, 3, a * glowP, frame);
    }
    // Microscope lens frame
    const scopeP = interpolate(frame, [110, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (scopeP > 0) {
      ctx.globalAlpha = a * scopeP * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3 * sc;
      ctx.beginPath(); ctx.arc(cx, cy, 40 * sc, 0, Math.PI * 2); ctx.stroke();
      // Lens handle
      ctx.beginPath(); ctx.moveTo(cx + 28 * sc, cy + 28 * sc);
      ctx.lineTo(cx + 45 * sc, cy + 45 * sc); ctx.stroke();
    }
    drawFBText(ctx, "JANELIA RESEARCH CAMPUS", cx, H * 0.8, 8 * sc, a * flyP, "center", FB.text.dim);
    drawFBText(ctx, "ONE NEURON GLOWS GREEN", cx, H * 0.88, 10 * sc, a * glowP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: Microscope view — circular viewport, green neuron appears inside */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    const r = Math.min(W, H) * 0.32;
    // Circular viewport
    const viewP = interpolate(frame, [5, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.globalAlpha = a * viewP;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
    // Dark interior
    ctx.fillStyle = "rgba(10,8,15,0.5)"; ctx.fillRect(0, 0, W, H);
    // Dim neural tissue
    const rng = seeded(3202);
    for (let i = 0; i < 25; i++) {
      const nx = cx + (rng() - 0.5) * r * 1.8, ny = cy + (rng() - 0.5) * r * 1.8;
      ctx.globalAlpha = a * 0.08; ctx.fillStyle = FB.text.dim;
      ctx.beginPath(); ctx.arc(nx, ny, 2 * sc, 0, Math.PI * 2); ctx.fill();
    }
    // Green neuron appearing
    const greenP = interpolate(frame, [60, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (greenP > 0) {
      const pulse = 0.8 + Math.sin(frame * 0.06) * 0.2;
      // Branching shape
      ctx.globalAlpha = a * greenP * pulse * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 2 * sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy - 15 * sc); ctx.lineTo(cx, cy + 20 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 12 * sc, cy - 10 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 15 * sc, cy - 8 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 10 * sc); ctx.lineTo(cx - 10 * sc, cy + 18 * sc); ctx.stroke();
      // Soma glow
      ctx.globalAlpha = a * greenP * 0.3;
      const gGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(cx, cy, 20 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, cx, cy, 4 * sc, 3, a * greenP, frame);
    }
    ctx.restore();
    // Viewport border
    ctx.globalAlpha = a * viewP * 0.4; ctx.strokeStyle = FB.teal; ctx.lineWidth = 3 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "CUSTOM FLY STRAIN", cx, H * 0.85, 10 * sc, a * viewP, "center", FB.teal);
    drawFBText(ctx, "specific neuron glows green", cx, H * 0.92, 8 * sc, a * greenP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Time-lapse — dark field, green spot brightens year by year */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    drawFBText(ctx, "YEARS OF WORK", cx, H * 0.06, 10 * sc, a, "center", FB.gold);
    // Timeline bar
    const years = ["Y1", "Y2", "Y3", "Y4", "Y5"];
    years.forEach((y, i) => {
      const yP = interpolate(frame, [20 + i * 30, 40 + i * 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const yx = W * 0.12 + i * W * 0.19;
      drawFBText(ctx, y, yx, H * 0.18, 8 * sc, a * yP, "center", FB.text.dim);
      // Progress dot
      ctx.globalAlpha = a * yP * 0.5; ctx.fillStyle = FB.teal;
      ctx.beginPath(); ctx.arc(yx, H * 0.24, 3 * sc, 0, Math.PI * 2); ctx.fill();
    });
    // Green glow building up
    const glowIntensity = interpolate(frame, [20, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const pulse = 0.8 + Math.sin(frame * 0.06) * 0.2;
    ctx.globalAlpha = a * glowIntensity * 0.3 * pulse;
    const gGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35 * sc * glowIntensity);
    gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
    ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(cx, cy, 35 * sc, 0, Math.PI * 2); ctx.fill();
    drawFBNode(ctx, cx, cy, 8 * sc * glowIntensity, 3, a * glowIntensity, frame);
    // Fly outline dim
    ctx.globalAlpha = a * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, 30 * sc, 0, Math.PI * 2); ctx.stroke();
    drawFBText(ctx, "GREEN FLUORESCENCE", cx, H * 0.7, 10 * sc, a * glowIntensity, "center", FB.green);
    drawFBText(ctx, "specific neurons labeled", cx, H * 0.78, 8 * sc, a * glowIntensity, "center", FB.text.dim);
    drawIconBuilding(ctx, W * 0.5, H * 0.9, 16 * sc, FB.text.dim, a * 0.4);
    drawFBText(ctx, "JANELIA", cx + 12 * sc, H * 0.9, 7 * sc, a * 0.4, "left", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Petri dish — fly silhouette inside, green neuron highlights */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.42;
    // Dish circle
    const dishP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * dishP * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(cx, cy, 38 * sc, 0, Math.PI * 2); ctx.stroke();
    // Tiny fly body
    ctx.globalAlpha = a * dishP * 0.2; ctx.fillStyle = FB.text.dim;
    ctx.beginPath(); ctx.ellipse(cx, cy, 12 * sc, 6 * sc, 0, 0, Math.PI * 2); ctx.fill();
    // Wings
    ctx.beginPath(); ctx.ellipse(cx - 8 * sc, cy - 4 * sc, 8 * sc, 3 * sc, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + 8 * sc, cy - 4 * sc, 8 * sc, 3 * sc, 0.3, 0, Math.PI * 2); ctx.fill();
    // Green neuron appears
    const greenP = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (greenP > 0) {
      const gnx = cx + 2 * sc, gny = cy - 2 * sc;
      const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
      ctx.globalAlpha = a * greenP * 0.4 * pulse;
      const gGrad = ctx.createRadialGradient(gnx, gny, 0, gnx, gny, 15 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.7)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(gnx, gny, 15 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, gnx, gny, 3 * sc, 3, a * greenP, frame);
    }
    // Label arrow
    const labP = interpolate(frame, [110, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labP > 0) {
      ctx.globalAlpha = a * labP * 0.5; ctx.strokeStyle = FB.green; ctx.lineWidth = 1 * sc;
      ctx.beginPath(); ctx.moveTo(cx + 20 * sc, cy - 15 * sc); ctx.lineTo(cx + 45 * sc, cy - 30 * sc); ctx.stroke();
      drawFBText(ctx, "GFP", cx + 50 * sc, cy - 30 * sc, 8 * sc, a * labP, "left", FB.green);
    }
    drawFBText(ctx, "CUSTOM GENETIC LINE", cx, H * 0.78, 9 * sc, a * dishP, "center", FB.teal);
    drawFBText(ctx, "one neuron type glows", cx, H * 0.86, 8 * sc, a * greenP, "center", FB.green);
    drawFBText(ctx, "JANELIA RESEARCH CAMPUS", cx, H * 0.94, 7 * sc, a * 0.4, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Before/after — dark neuron vs illuminated neuron */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    // Left: dark / invisible
    const p1 = interpolate(frame, [10, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "BEFORE", W * 0.25, H * 0.08, 10 * sc, a * p1, "center", FB.text.dim);
    ctx.globalAlpha = a * p1 * 0.1; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath(); ctx.arc(W * 0.25, H * 0.4, 25 * sc, 0, Math.PI * 2); ctx.stroke();
    // Invisible neurons
    for (let i = 0; i < 8; i++) {
      drawFBNode(ctx, W * 0.15 + Math.random() * W * 0.2, H * 0.28 + Math.random() * H * 0.24, 2 * sc, 6, a * p1 * 0.08, frame);
    }
    drawFBText(ctx, "invisible", W * 0.25, H * 0.65, 8 * sc, a * p1, "center", FB.text.dim);
    // Right: green glow
    const p2 = interpolate(frame, [70, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "AFTER", W * 0.75, H * 0.08, 10 * sc, a * p2, "center", FB.green);
    ctx.globalAlpha = a * p2 * 0.15; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
    ctx.beginPath(); ctx.arc(W * 0.75, H * 0.4, 25 * sc, 0, Math.PI * 2); ctx.stroke();
    // Green glowing neuron
    if (p2 > 0) {
      const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
      ctx.globalAlpha = a * p2 * 0.3 * pulse;
      const gGrad = ctx.createRadialGradient(W * 0.75, H * 0.4, 0, W * 0.75, H * 0.4, 20 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(W * 0.75, H * 0.4, 20 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, W * 0.75, H * 0.4, 5 * sc, 3, a * p2, frame);
    }
    drawFBText(ctx, "GREEN!", W * 0.75, H * 0.65, 8 * sc, a * p2, "center", FB.green);
    // Arrow
    const arP = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2192", W / 2, H * 0.4, 16 * sc, a * arP, "center", FB.gold);
    drawFBText(ctx, "YEARS OF GENETIC ENGINEERING", W / 2, H * 0.82, 8 * sc, a, "center", FB.text.dim);
    drawFBText(ctx, "at Janelia Research Campus", W / 2, H * 0.9, 7 * sc, a * 0.5, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: DNA helix morphing into green glow */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2;
    // Simplified DNA double helix
    const helixP = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * helixP * 0.5; ctx.strokeStyle = FB.teal; ctx.lineWidth = 1.5 * sc;
    for (let s = 0; s < 2; s++) {
      ctx.beginPath();
      for (let t = 0; t < 30; t++) {
        const x = W * 0.3 + (t / 30) * W * 0.4;
        const y = H * 0.2 + Math.sin(t * 0.5 + s * Math.PI + frame * 0.03) * 15 * sc;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Green insertion point
    const insertP = interpolate(frame, [60, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (insertP > 0) {
      ctx.globalAlpha = a * insertP * 0.6; ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.arc(cx, H * 0.2, 4 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBText(ctx, "GFP gene", cx, H * 0.12, 7 * sc, a * insertP, "center", FB.green);
    }
    // Arrow down to fly
    const flyP = interpolate(frame, [110, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2193", cx, H * 0.35, 14 * sc, a * flyP, "center", FB.gold);
    // Fly with green neuron
    if (flyP > 0) {
      ctx.globalAlpha = a * flyP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
      ctx.beginPath(); ctx.arc(cx, H * 0.55, 20 * sc, 0, Math.PI * 2); ctx.stroke();
      const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
      ctx.globalAlpha = a * flyP * 0.3 * pulse;
      const gGrad = ctx.createRadialGradient(cx, H * 0.55, 0, cx, H * 0.55, 15 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(cx, H * 0.55, 15 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, cx, H * 0.55, 4 * sc, 3, a * flyP, frame);
    }
    drawFBText(ctx, "GENETIC ENGINEERING", cx, H * 0.78, 10 * sc, a * flyP, "center", FB.teal);
    drawFBText(ctx, "neuron glows green", cx, H * 0.86, 8 * sc, a * flyP, "center", FB.green);
    drawFBText(ctx, "JANELIA", cx, H * 0.94, 7 * sc, a * 0.4, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Building + researchers, arrow to microscope, arrow to green neuron */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    // Building
    const bP = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawIconBuilding(ctx, W * 0.15, H * 0.3, 22 * sc, FB.text.dim, a * bP);
    drawFBText(ctx, "JANELIA", W * 0.15, H * 0.45, 7 * sc, a * bP, "center", FB.text.dim);
    // Researchers
    const rP = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let i = 0; i < 3; i++) drawPersonBlob(ctx, W * 0.32 + i * 12 * sc, H * 0.32, 14 * sc, i + 1, a * rP);
    drawFBText(ctx, "YEARS", W * 0.38, H * 0.45, 8 * sc, a * rP, "center", FB.gold);
    // Arrow
    drawFBText(ctx, "\u2192", W * 0.55, H * 0.32, 12 * sc, a * rP, "center", FB.gold);
    // Microscope = circle lens
    const mP = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * mP * 0.3; ctx.strokeStyle = FB.teal; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(W * 0.72, H * 0.3, 15 * sc, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W * 0.72, H * 0.3 + 15 * sc); ctx.lineTo(W * 0.72, H * 0.3 + 30 * sc); ctx.stroke();
    // Green result
    const gP = interpolate(frame, [100, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "\u2192", W * 0.85, H * 0.32, 12 * sc, a * gP, "center", FB.gold);
    if (gP > 0) {
      const pulse = 0.8 + Math.sin(frame * 0.07) * 0.2;
      ctx.globalAlpha = a * gP * 0.3 * pulse;
      const gGrad = ctx.createRadialGradient(W * 0.92, H * 0.3, 0, W * 0.92, H * 0.3, 15 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(W * 0.92, H * 0.3, 15 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, W * 0.92, H * 0.3, 4 * sc, 3, a * gP, frame);
    }
    drawFBText(ctx, "CUSTOM FLY STRAINS", W / 2, H * 0.65, 10 * sc, a * gP, "center", FB.teal);
    drawFBText(ctx, "specific neurons glow green", W / 2, H * 0.73, 8 * sc, a * gP, "center", FB.green);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Sequence of flies — each one has a different neuron glowing */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    drawFBText(ctx, "DIFFERENT STRAIN, DIFFERENT NEURON", W / 2, H * 0.06, 8 * sc, a, "center", FB.gold);
    const flies = 5;
    for (let i = 0; i < flies; i++) {
      const fx = W * 0.1 + i * W * 0.18 + W * 0.02;
      const fy = H * 0.42;
      const fP = interpolate(frame, [15 + i * 25, 40 + i * 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      // Fly head outline
      ctx.globalAlpha = a * fP * 0.2; ctx.strokeStyle = FB.text.dim; ctx.lineWidth = 1.5 * sc;
      ctx.beginPath(); ctx.arc(fx, fy, 14 * sc, 0, Math.PI * 2); ctx.stroke();
      // Green neuron at different positions
      const rng = seeded(3208 + i);
      const gAngle = rng() * Math.PI * 2, gDist = rng() * 8 * sc;
      const gnx = fx + Math.cos(gAngle) * gDist, gny = fy + Math.sin(gAngle) * gDist;
      const pulse = 0.8 + Math.sin(frame * 0.07 + i) * 0.2;
      ctx.globalAlpha = a * fP * 0.3 * pulse;
      const gGrad = ctx.createRadialGradient(gnx, gny, 0, gnx, gny, 8 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.7)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(gnx, gny, 8 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, gnx, gny, 2 * sc, 3, a * fP, frame);
      drawFBText(ctx, "#" + (i + 1), fx, fy + 20 * sc, 7 * sc, a * fP, "center", FB.text.dim);
    }
    const labP = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "EACH STRAIN LIGHTS ONE CELL TYPE", W / 2, H * 0.78, 9 * sc, a * labP, "center", FB.green);
    drawFBText(ctx, "Janelia Research Campus", W / 2, H * 0.88, 7 * sc, a * 0.4, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Spotlight — dark stage, single green neuron spotlight slowly illuminates */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR);
    const sc = Math.min(W, H) / 360;
    const cx = W / 2, cy = H * 0.4;
    // Dim background neurons
    const rng = seeded(3209);
    for (let i = 0; i < 20; i++) {
      const nx = W * 0.05 + rng() * W * 0.9, ny = H * 0.05 + rng() * H * 0.7;
      drawFBNode(ctx, nx, ny, 2 * sc, 6, a * 0.06, frame);
    }
    // Spotlight cone
    const spotP = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (spotP > 0) {
      ctx.globalAlpha = a * spotP * 0.08;
      ctx.fillStyle = FB.green;
      ctx.beginPath(); ctx.moveTo(cx - 10 * sc, 0); ctx.lineTo(cx - 25 * sc * spotP, cy + 20 * sc);
      ctx.lineTo(cx + 25 * sc * spotP, cy + 20 * sc); ctx.lineTo(cx + 10 * sc, 0); ctx.closePath(); ctx.fill();
    }
    // Illuminated neuron
    const glowP = interpolate(frame, [70, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (glowP > 0) {
      const pulse = 0.8 + Math.sin(frame * 0.06) * 0.2;
      ctx.globalAlpha = a * glowP * 0.4 * pulse;
      const gGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25 * sc);
      gGrad.addColorStop(0, "rgba(110,221,138,0.6)"); gGrad.addColorStop(1, "rgba(110,221,138,0)");
      ctx.fillStyle = gGrad; ctx.beginPath(); ctx.arc(cx, cy, 25 * sc, 0, Math.PI * 2); ctx.fill();
      drawFBNode(ctx, cx, cy, 6 * sc, 3, a * glowP, frame);
      // Branching neuron shape
      ctx.globalAlpha = a * glowP * 0.4; ctx.strokeStyle = FB.green; ctx.lineWidth = 1.5 * sc; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy - 12 * sc); ctx.lineTo(cx, cy + 15 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 4 * sc); ctx.lineTo(cx - 12 * sc, cy - 14 * sc); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 5 * sc); ctx.lineTo(cx + 10 * sc, cy + 14 * sc); ctx.stroke();
    }
    drawFBText(ctx, "ONE NEURON, MADE VISIBLE", cx, H * 0.75, 10 * sc, a * glowP, "center", FB.green);
    drawFBText(ctx, "Janelia Research Campus", cx, H * 0.85, 7 * sc, a * 0.4, "center", FB.text.dim);
    drawFBText(ctx, "years of custom fly strains", cx, H * 0.92, 7 * sc, a * 0.4, "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_032: VariantDef[] = [
  { id: "fb-032-v1", label: "Fly outline, one green neuron, microscope lens", component: V1 },
  { id: "fb-032-v2", label: "Circular microscope viewport, green neuron", component: V2 },
  { id: "fb-032-v3", label: "Time-lapse: green glow builds year by year", component: V3 },
  { id: "fb-032-v4", label: "Petri dish fly with GFP highlight", component: V4 },
  { id: "fb-032-v5", label: "Before/after: invisible to green glow", component: V5 },
  { id: "fb-032-v6", label: "DNA helix -> GFP insertion -> green neuron", component: V6 },
  { id: "fb-032-v7", label: "Building -> researchers -> microscope -> glow", component: V7 },
  { id: "fb-032-v8", label: "Sequence of flies, each with different neuron", component: V8 },
  { id: "fb-032-v9", label: "Spotlight illuminates single green neuron", component: V9 },
];
