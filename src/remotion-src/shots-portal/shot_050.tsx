import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import {
  C, seeded, accent, easeOutBack, drawBg, fadeInOut, stagger, staggerRaw,
  drawNode, drawNodeGradient, drawNodeDormant, drawEdge, drawEdgeGlow, drawEdgeFaint,
  drawHeader, drawCounter, drawPerson, drawNeuronShape, drawFlyOutline, drawPanel,
  drawCheck, drawXMark, drawSignalPulse, drawBarChart, drawThresholdLine, lerp,
} from "./portal-kit";

// Shot 050 — "Nobody programmed 'if sugar, then eat.' Nobody wrote that rule. The wiring itself produces the behavior."
// DUR=120. No code — wiring replaces rules.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "No Rules Written", "emergent behavior");
    ctx.fillStyle = C.textDim; ctx.font = `${10 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("if(sugar) { eat(); }", width * 0.5, height * 0.48);
    if (frame > 30) {
      const t = Math.min(1, (frame - 30) / 20);
      drawXMark(ctx, width * 0.5, height * 0.48, 40 * s * t, 1, fo * t);
    }
    if (frame > 60) {
      const t = Math.min(1, (frame - 60) / 20);
      ctx.fillStyle = `rgba(64,144,255,${fo * t})`;
      ctx.font = `600 ${11 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("the wiring does it", width * 0.5, height * 0.7);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Code vs Wiring", "no rules needed");
    drawPanel(ctx, width * 0.05, height * 0.22, width * 0.42, height * 0.55, 1, fo);
    drawPanel(ctx, width * 0.53, height * 0.22, width * 0.42, height * 0.55, 0, fo);
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("if(sugar){", width * 0.26, height * 0.4);
    ctx.fillText("  eat();", width * 0.26, height * 0.48);
    ctx.fillText("}", width * 0.26, height * 0.56);
    drawXMark(ctx, width * 0.26, height * 0.48, 30 * s, 1, fo * stagger(frame, 2, 12, 15));
    const rng = seeded(502);
    for (let i = 0; i < 12; i++) {
      const t = stagger(frame, i, 4, 12);
      const nx = width * (0.56 + rng() * 0.36), ny = height * (0.28 + rng() * 0.42);
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
      if (i > 0) {
        const px = width * (0.56 + rng() * 0.36), py = height * (0.28 + rng() * 0.42);
        drawEdge(ctx, px, py, nx, ny, i, fo * t * 0.3, s);
      }
    }
    ctx.fillStyle = C.textDim; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("code", width * 0.26, height * 0.82);
    ctx.fillText("wiring", width * 0.74, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "NO CODE", "wiring produces behavior");
    const t = Math.min(1, frame / 30);
    ctx.fillStyle = `rgba(224,80,80,${fo * t})`;
    ctx.font = `700 ${36 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("NO CODE", width * 0.5, height * 0.5);
    if (frame > 40) {
      const nt = Math.min(1, (frame - 40) / 30);
      ctx.fillStyle = `rgba(64,144,255,${fo * nt})`;
      ctx.font = `${10 * s}px system-ui`;
      ctx.fillText("the wiring itself produces the behavior", width * 0.5, height * 0.65);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Network Replaces Code", "emergent logic");
    const codeLines = ["if (sugar) {", "  return eat;", "}"];
    const fadeCode = Math.max(0, 1 - frame / 50);
    ctx.fillStyle = `rgba(136,136,160,${fo * fadeCode})`;
    ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
    for (let i = 0; i < codeLines.length; i++) {
      ctx.fillText(codeLines[i], width * 0.5, height * (0.4 + i * 0.08));
    }
    if (frame > 30) {
      const nt = Math.min(1, (frame - 30) / 30);
      const rng = seeded(504);
      for (let i = 0; i < 15; i++) {
        const nx = width * (0.2 + rng() * 0.6), ny = height * (0.3 + rng() * 0.4);
        drawNode(ctx, nx, ny, 4 * s * nt, i, fo * nt);
        if (i > 0) {
          const px = width * (0.2 + rng() * 0.6), py = height * (0.3 + rng() * 0.4);
          drawEdge(ctx, px, py, nx, ny, i, fo * nt * 0.25, s);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Nobody Wrote It", "no programmer");
    drawPanel(ctx, width * 0.15, height * 0.3, width * 0.7, height * 0.35, 0, fo);
    ctx.fillStyle = C.textDim; ctx.font = `${9 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("if(sugar) { eat(); }", width * 0.5, height * 0.45);
    const xT = stagger(frame, 3, 10, 12);
    drawXMark(ctx, width * 0.5, height * 0.45, 50 * s * xT, 1, fo * xT);
    ctx.fillStyle = C.text; ctx.font = `600 ${10 * s}px system-ui`; ctx.textAlign = "center";
    const wT = stagger(frame, 6, 10, 12);
    ctx.globalAlpha = fo * wT;
    ctx.fillText("nobody wrote this rule", width * 0.5, height * 0.75);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Wiring = Behavior", "structure → function");
    const rng = seeded(506);
    for (let i = 0; i < 20; i++) {
      const t = stagger(frame, i, 3, 12);
      const nx = width * (0.15 + rng() * 0.7), ny = height * (0.25 + rng() * 0.5);
      drawNode(ctx, nx, ny, 4 * s * t, i, fo * t);
      if (i > 2) {
        const j = Math.floor(rng() * i);
        const px = width * (0.15 + rng() * 0.7), py = height * (0.25 + rng() * 0.5);
        drawEdgeGlow(ctx, px, py, nx, ny, i, fo * t * 0.2, s);
      }
    }
    ctx.fillStyle = C.text; ctx.font = `600 ${12 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("wiring = behavior", width * 0.5, height * 0.85);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Strikethrough", "rule deleted");
    ctx.fillStyle = C.textDim; ctx.font = `${11 * s}px monospace`; ctx.textAlign = "center";
    ctx.fillText("if(sugar) { eat(); }", width * 0.5, height * 0.45);
    if (frame > 20) {
      const t = Math.min(1, (frame - 20) / 20);
      ctx.strokeStyle = `rgba(224,80,80,${fo * t})`;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.45);
      ctx.lineTo(width * 0.2 + width * 0.6 * t, height * 0.45);
      ctx.stroke();
    }
    if (frame > 55) {
      const nt = Math.min(1, (frame - 55) / 25);
      drawNodeGradient(ctx, width * 0.35, height * 0.68, 8 * s * nt, 0, fo * nt);
      drawNodeGradient(ctx, width * 0.65, height * 0.68, 8 * s * nt, 1, fo * nt);
      drawEdgeGlow(ctx, width * 0.35, height * 0.68, width * 0.65, height * 0.68, 0, fo * nt * 0.5, s);
      ctx.fillStyle = C.text; ctx.font = `${8 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText("sugar", width * 0.35, height * 0.78);
      ctx.fillText("eat", width * 0.65, height * 0.78);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "Emergence", "structure → behavior");
    const phrases = ["sugar", "→", "wiring", "→", "eat"];
    for (let i = 0; i < phrases.length; i++) {
      const t = stagger(frame, i, 10, 12);
      const px = width * (0.15 + i * 0.17);
      ctx.fillStyle = i === 2 ? accent(0, fo * t) : `rgba(58,58,74,${fo * t})`;
      ctx.font = `${i === 2 ? 600 : 400} ${11 * s}px system-ui`; ctx.textAlign = "center";
      ctx.fillText(phrases[i], px, height * 0.5);
      if (i % 2 === 0) drawNode(ctx, px, height * 0.5 - 16 * s, 5 * s * t, i === 0 ? 1 : 0, fo * t);
    }
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s = Math.min(width, height) / 360;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const DUR = 120;
    drawBg(ctx, width, height, s);
    const fo = fadeInOut(frame, DUR);
    ctx.globalAlpha = fo;
    drawHeader(ctx, width, height, s, frame, DUR, "No Programmer", "self-organizing");
    drawPerson(ctx, width * 0.3, height * 0.5, 30 * s, C.grayDark);
    const xT = stagger(frame, 2, 12, 15);
    drawXMark(ctx, width * 0.3, height * 0.5, 35 * s * xT, 1, fo * xT);
    const nT = stagger(frame, 5, 10, 15);
    const rng = seeded(509);
    for (let i = 0; i < 10; i++) {
      const nx = width * (0.55 + rng() * 0.35), ny = height * (0.3 + rng() * 0.4);
      drawNode(ctx, nx, ny, 4 * s * nT, i, fo * nT);
    }
    ctx.fillStyle = C.text; ctx.font = `${9 * s}px system-ui`; ctx.textAlign = "center";
    ctx.fillText("self-organizing", width * 0.72, height * 0.82);
    ctx.globalAlpha = 1;
  });
  return <div style={{ width, height, backgroundColor: C.bg }}><canvas ref={canvasRef} width={width} height={height} /></div>;
};

export const VARIANTS_SHOT_050: VariantDef[] = [
  { id: "shot_050_v1", label: "code with X mark", component: V1 },
  { id: "shot_050_v2", label: "code vs wiring split", component: V2 },
  { id: "shot_050_v3", label: "NO CODE bold", component: V3 },
  { id: "shot_050_v4", label: "network replaces code", component: V4 },
  { id: "shot_050_v5", label: "nobody wrote it", component: V5 },
  { id: "shot_050_v6", label: "wiring equals behavior", component: V6 },
  { id: "shot_050_v7", label: "strikethrough rule", component: V7 },
  { id: "shot_050_v8", label: "emergence chain", component: V8 },
  { id: "shot_050_v9", label: "no programmer", component: V9 },
];
