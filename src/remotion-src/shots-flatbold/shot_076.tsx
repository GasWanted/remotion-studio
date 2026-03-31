import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { FB, seeded, drawFBBg, drawFBNode, drawFBEdge, drawFBText, drawFBCounter, fadeInOut, cellHSL, drawFBColorEdge } from "./flatbold-kit";

/* Shot 76 — "But then something happened I totally didn't expect." — 90 frames (3s) */
const DUR = 90;
const sc_ = (W: number, H: number) => Math.min(W, H) / 360;

/* V1: "?" growing from center with pulsing glow */
const V1: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const gP = interpolate(frame, [8, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sc = 0.2 + gP * 0.8;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    drawFBText(ctx, "?", 0, 0, 44 * s, a * gP, "center", FB.gold); ctx.restore();
    if (gP > 0.5) { const pulse = Math.sin(frame * 0.12) * 0.12 + 0.14; ctx.globalAlpha = a * pulse;
      const glow = ctx.createRadialGradient(cx, cy, 5 * s, cx, cy, 38 * s); glow.addColorStop(0, FB.gold); glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(cx - 38 * s, cy - 38 * s, 76 * s, 76 * s); }
    drawFBText(ctx, "UNEXPECTED", cx, H * 0.8, 10 * s, a * interpolate(frame, [52, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V2: "BUT THEN..." suspense text */
const V2: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2;
    drawFBText(ctx, "BUT", cx, H * 0.26, 16 * s, a * interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    drawFBText(ctx, "THEN...", cx, H * 0.46, 16 * s, a * interpolate(frame, [20, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.primary);
    drawFBText(ctx, "?", cx, H * 0.7, 26 * s, a * interpolate(frame, [48, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V3: Eye opening wide in surprise */
const V3: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4; const oP = interpolate(frame, [8, 52], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lidH = 18 * s * (1 - oP);
    ctx.globalAlpha = a; ctx.fillStyle = "rgba(255,255,255,0.88)"; ctx.beginPath(); ctx.ellipse(cx, cy, 26 * s, 16 * s * oP, 0, 0, Math.PI * 2); ctx.fill();
    if (oP > 0.2) { ctx.fillStyle = FB.gold; ctx.beginPath(); ctx.arc(cx, cy, 9 * s * oP, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1a1a2e"; ctx.beginPath(); ctx.arc(cx, cy, 5 * s * oP, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.beginPath(); ctx.arc(cx - 3 * s, cy - 3 * s, 2 * s * oP, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = FB.bg; ctx.fillRect(cx - 30 * s, cy - 20 * s, 60 * s, lidH); ctx.fillRect(cx - 30 * s, cy + 20 * s - lidH, 60 * s, lidH);
    drawFBText(ctx, "SOMETHING", cx, H * 0.76, 9 * s, a * oP, "center", FB.text.dim);
    drawFBText(ctx, "UNEXPECTED", cx, H * 0.87, 9 * s, a * oP, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V4: Three exclamation marks bouncing in */
const V4: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H); const cx = W / 2, cy = H * 0.38;
    [{ x: cx - 22 * s, d: 8 }, { x: cx, d: 20 }, { x: cx + 22 * s, d: 32 }].forEach((m) => {
      const t = interpolate(frame, [m.d, m.d + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const bounce = t < 1 ? 1 + (1 - t) * 0.3 : 1;
      ctx.save(); ctx.translate(m.x, cy); ctx.scale(bounce, bounce);
      drawFBText(ctx, "!", 0, 0, 28 * s, a * t, "center", FB.gold); ctx.restore(); });
    drawFBText(ctx, "DIDN'T EXPECT THIS", cx, H * 0.76, 9 * s, a * interpolate(frame, [52, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V5: Calm network then sudden bright flash */
const V5: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  const nodes = useMemo(() => { const rng = seeded(7605); return Array.from({ length: 8 }, () => ({ x: rng(), y: rng() })); }, []);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    nodes.forEach((n, i) => { drawFBNode(ctx, W * 0.1 + n.x * W * 0.8, H * 0.08 + n.y * H * 0.6, 5 * s, 4, a * 0.45, frame); });
    const flashP = interpolate(frame, [38, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const fadeP = interpolate(frame, [48, 62], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (flashP > 0) { const f = flashP < 1 ? flashP : fadeP; ctx.globalAlpha = f * 0.35; ctx.fillStyle = FB.gold; ctx.fillRect(0, 0, W, H);
      nodes.forEach((n) => drawFBNode(ctx, W * 0.1 + n.x * W * 0.8, H * 0.08 + n.y * H * 0.6, 8 * s, 2, a * f, frame)); }
    drawFBText(ctx, "UNEXPECTED", W / 2, H * 0.84, 12 * s, a * interpolate(frame, [56, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H, nodes]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V6: Curtain pulling aside to reveal ? */
const V6: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const rP = interpolate(frame, [12, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = a * 0.65; ctx.fillStyle = "rgba(30,20,40,0.88)";
    ctx.fillRect(0, 0, W * 0.5 * (1 - rP), H); ctx.fillRect(W - W * 0.5 * (1 - rP), 0, W * 0.5 * (1 - rP), H);
    if (rP > 0.3) drawFBText(ctx, "?", W / 2, H * 0.4, 38 * s, a * (rP - 0.3) / 0.7, "center", FB.gold);
    drawFBText(ctx, "SOMETHING NEW", W / 2, H * 0.8, 9 * s, a * interpolate(frame, [58, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V7: Ripple rings expanding from center with ! */
const V7: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.4;
    for (let i = 0; i < 4; i++) { const sF = 14 + i * 12;
      const rP = interpolate(frame, [sF, sF + 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (rP > 0) { ctx.globalAlpha = a * (1 - rP) * 0.35; ctx.strokeStyle = FB.gold; ctx.lineWidth = 2 * s;
        ctx.beginPath(); ctx.arc(cx, cy, rP * 48 * s, 0, Math.PI * 2); ctx.stroke(); } }
    drawFBText(ctx, "!", cx, cy, 28 * s, a * interpolate(frame, [18, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.gold);
    drawFBText(ctx, "UNEXPECTED", cx, H * 0.8, 10 * s, a * interpolate(frame, [42, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V8: Wobbling ? with orbiting smaller ?s */
const V8: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR); const s = sc_(W, H);
    const cx = W / 2, cy = H * 0.38; const gP = interpolate(frame, [6, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(frame * 0.08) * 0.14);
    drawFBText(ctx, "?", 0, 0, 42 * s, a * gP, "center", FB.gold); ctx.restore();
    for (let i = 0; i < 3; i++) { const ang = frame * 0.03 + i * Math.PI * 2 / 3; const d = 32 * s;
      drawFBText(ctx, "?", cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, 11 * s, a * gP * 0.35, "center", FB.text.dim); }
    drawFBText(ctx, "TOTALLY UNEXPECTED", cx, H * 0.8, 8 * s, a * interpolate(frame, [48, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), "center", FB.text.dim);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

/* V9: Slow suspense dots then SOMETHING HAPPENED */
const V9: React.FC<VariantProps> = ({ width: W, height: H }) => {
  const frame = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return;
    drawFBBg(ctx, W, H, frame); const a = fadeInOut(frame, DUR, 6, 18); const s = sc_(W, H); const cx = W / 2;
    for (let i = 0; i < 3; i++) { const t = interpolate(frame, [12 + i * 14, 26 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      drawFBText(ctx, ".", cx - 12 * s + i * 12 * s, H * 0.38, 22 * s, a * t, "center", FB.gold); }
    const t2 = interpolate(frame, [58, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    drawFBText(ctx, "SOMETHING", cx, H * 0.62, 11 * s, a * t2, "center", FB.text.primary);
    drawFBText(ctx, "HAPPENED", cx, H * 0.76, 11 * s, a * t2, "center", FB.gold);
    ctx.globalAlpha = 1;
  }, [frame, W, H]);
  return <canvas ref={ref} width={W} height={H} style={{ width: W, height: H }} />;
};

export const VARIANTS_FB_076: VariantDef[] = [
  { id: "fb-076-v1", label: "Question mark growing with pulsing glow", component: V1 },
  { id: "fb-076-v2", label: "BUT THEN suspense text", component: V2 },
  { id: "fb-076-v3", label: "Eye opening wide in surprise", component: V3 },
  { id: "fb-076-v4", label: "Exclamation marks bouncing in", component: V4 },
  { id: "fb-076-v5", label: "Calm network sudden bright flash", component: V5 },
  { id: "fb-076-v6", label: "Curtain pulling aside to reveal ?", component: V6 },
  { id: "fb-076-v7", label: "Ripple rings expanding with !", component: V7 },
  { id: "fb-076-v8", label: "Wobbling ? with orbiting smaller ?s", component: V8 },
  { id: "fb-076-v9", label: "Slow suspense dots then reveal", component: V9 },
];
