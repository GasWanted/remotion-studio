import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";
import { drawNeuron } from "../icons";

// Shot 24 — "It traces each neuron's full 3D shape through the stack."
// 120 frames (4s). 2D flat blobs morph into a 3D neuron shape.

const V1: React.FC<VariantProps> = ({ width, height }) => {
  // Flat-to-3D Extrusion: 3 flat circles (cross-sections) stacked. They extrude
  // upward connecting into a tube-like structure. Branches sprout.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24001), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.35;
    const centerY = height * 0.5;
    // Phase 1: flat discs appear
    const discAppear = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 2: extrude into tubes
    const extrudeProgress = interpolate(frame, [25, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 3: branches sprout
    const branchProgress = interpolate(frame, [55, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Draw 3 cross-section discs
    const discPositions = [
      { y: centerY - 35 * scale, r: 8 * scale },
      { y: centerY, r: 12 * scale },
      { y: centerY + 35 * scale, r: 7 * scale },
    ];
    if (discAppear > 0) {
      for (let i = 0; i < discPositions.length; i++) {
        const d = discPositions[i];
        const dAlpha = interpolate(discAppear, [i * 0.25, Math.min(1, i * 0.25 + 0.35)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (dAlpha <= 0) continue;
        ctx.globalAlpha = fadeAlpha * dAlpha * (1 - extrudeProgress * 0.5);
        ctx.fillStyle = `hsla(220, 55%, 55%, 0.6)`;
        ctx.beginPath();
        ctx.ellipse(centerX, d.y, d.r, d.r * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsla(220, 50%, 60%, 0.5)`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(centerX, d.y, d.r, d.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Extrude: connect discs into tube
    if (extrudeProgress > 0) {
      ctx.globalAlpha = fadeAlpha * extrudeProgress;
      // Main tube body
      const tubeGrad = ctx.createLinearGradient(centerX - 15 * scale, 0, centerX + 15 * scale, 0);
      tubeGrad.addColorStop(0, `hsla(220, 50%, 45%, 0.4)`);
      tubeGrad.addColorStop(0.5, `hsla(220, 55%, 60%, 0.7)`);
      tubeGrad.addColorStop(1, `hsla(220, 50%, 45%, 0.4)`);
      ctx.fillStyle = tubeGrad;
      const tubeTop = discPositions[0].y;
      const tubeBottom = discPositions[2].y;
      const tubeWidth = 10 * scale * extrudeProgress;
      ctx.beginPath();
      ctx.moveTo(centerX - tubeWidth, tubeTop);
      ctx.quadraticCurveTo(centerX - tubeWidth * 1.3, centerY, centerX - tubeWidth, tubeBottom);
      ctx.lineTo(centerX + tubeWidth, tubeBottom);
      ctx.quadraticCurveTo(centerX + tubeWidth * 1.3, centerY, centerX + tubeWidth, tubeTop);
      ctx.closePath();
      ctx.fill();
      // Cell body bulge
      ctx.fillStyle = `hsla(220, 60%, 55%, ${extrudeProgress * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 14 * scale * extrudeProgress, 10 * scale * extrudeProgress, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Branches sprout
    if (branchProgress > 0) {
      ctx.globalAlpha = fadeAlpha * branchProgress;
      ctx.strokeStyle = `hsla(220, 55%, 58%, 0.7)`;
      ctx.lineWidth = 2 * scale;
      ctx.lineCap = "round";
      // Dendrites (left, upper)
      const dendrites = [
        { angle: Math.PI * 0.75, len: 40, split: true },
        { angle: Math.PI * 0.85, len: 35, split: false },
        { angle: Math.PI * 0.65, len: 30, split: true },
        { angle: Math.PI * 0.55, len: 25, split: false },
      ];
      for (let i = 0; i < dendrites.length; i++) {
        const d = dendrites[i];
        const dProgress = interpolate(branchProgress, [i * 0.2, Math.min(1, i * 0.2 + 0.35)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (dProgress <= 0) continue;
        const len = d.len * scale * dProgress;
        const endX = centerX + Math.cos(d.angle) * len;
        const endY = centerY - 20 * scale + Math.sin(d.angle) * len;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 20 * scale);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        if (d.split && dProgress > 0.7) {
          const splitLen = 15 * scale * (dProgress - 0.7) / 0.3;
          ctx.lineWidth = 1.5 * scale;
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX + Math.cos(d.angle - 0.4) * splitLen, endY + Math.sin(d.angle - 0.4) * splitLen);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(endX, endY);
          ctx.lineTo(endX + Math.cos(d.angle + 0.3) * splitLen, endY + Math.sin(d.angle + 0.3) * splitLen);
          ctx.stroke();
          ctx.lineWidth = 2 * scale;
        }
      }
      // Axon (right, extending far)
      const axonLen = 80 * scale * branchProgress;
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 10 * scale);
      ctx.quadraticCurveTo(centerX + axonLen * 0.5, centerY + 15 * scale, centerX + axonLen, centerY + 5 * scale);
      ctx.stroke();
      // Axon terminal branches
      if (branchProgress > 0.7) {
        const termProgress = (branchProgress - 0.7) / 0.3;
        ctx.lineWidth = 1.5 * scale;
        const termX = centerX + axonLen;
        const termY = centerY + 5 * scale;
        for (let i = 0; i < 3; i++) {
          const tAngle = -0.3 + i * 0.3;
          const tLen = 12 * scale * termProgress;
          ctx.beginPath();
          ctx.moveTo(termX, termY);
          ctx.lineTo(termX + Math.cos(tAngle) * tLen, termY + Math.sin(tAngle) * tLen);
          ctx.stroke();
        }
      }
    }
    // "Full 3D shape" label
    const labelAlpha = interpolate(frame, [85, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("flat slices → full 3D neuron shape", width * 0.5, height * 0.92);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V2: React.FC<VariantProps> = ({ width, height }) => {
  // Neuron Growing from Slices: stacked disc outlines. From center, a neuron shape
  // grows — cell body first, then dendrites, then axon. Slices fade away.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24002), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.42;
    // Phase: slices visible, then fade as neuron grows
    const sliceFade = interpolate(frame, [35, 60], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neuronGrow = interpolate(frame, [25, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stacked disc outlines
    if (sliceFade > 0) {
      ctx.globalAlpha = fadeAlpha * sliceFade;
      const discCount = 6;
      for (let i = 0; i < discCount; i++) {
        const discAppear = interpolate(frame, [3 + i * 3, 10 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (discAppear <= 0) continue;
        const dy = centerY - 30 * scale + (i / (discCount - 1)) * 60 * scale;
        const dr = (8 + Math.sin(i * 1.2) * 3) * scale;
        ctx.strokeStyle = `hsla(220, 40%, 50%, ${discAppear * sliceFade * 0.5})`;
        ctx.lineWidth = 1.5 * scale;
        ctx.beginPath();
        ctx.ellipse(centerX, dy, dr, dr * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Neuron grows from center
    if (neuronGrow > 0) {
      ctx.globalAlpha = fadeAlpha * neuronGrow;
      // Cell body
      const bodyGrow = interpolate(neuronGrow, [0, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (bodyGrow > 0) {
        const bodyR = 15 * scale * bodyGrow;
        const bodyGrad = ctx.createRadialGradient(centerX - bodyR * 0.2, centerY - bodyR * 0.2, 0, centerX, centerY, bodyR);
        bodyGrad.addColorStop(0, `hsla(220, 60%, 70%, ${bodyGrow * 0.9})`);
        bodyGrad.addColorStop(1, `hsla(220, 55%, 50%, ${bodyGrow * 0.5})`);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bodyR, 0, Math.PI * 2);
        ctx.fill();
      }
      // Dendrites grow
      const dendGrow = interpolate(neuronGrow, [0.2, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (dendGrow > 0) {
        ctx.strokeStyle = `hsla(220, 55%, 58%, ${dendGrow * 0.8})`;
        ctx.lineWidth = 2.5 * scale;
        ctx.lineCap = "round";
        const branches = [
          { angle: -2.4, len: 50, subs: [{ angle: -0.5, len: 22 }, { angle: 0.4, len: 18 }] },
          { angle: -2.0, len: 40, subs: [{ angle: -0.3, len: 15 }] },
          { angle: -2.8, len: 35, subs: [{ angle: 0.3, len: 20 }] },
          { angle: -1.6, len: 30, subs: [] },
        ];
        for (let i = 0; i < branches.length; i++) {
          const b = branches[i];
          const bProgress = interpolate(dendGrow, [i * 0.2, Math.min(1, i * 0.2 + 0.4)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (bProgress <= 0) continue;
          const len = b.len * scale * bProgress;
          const endX = centerX + Math.cos(b.angle) * len;
          const endY = centerY + Math.sin(b.angle) * len;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
          // Sub-branches
          if (bProgress > 0.6) {
            ctx.lineWidth = 1.5 * scale;
            for (const sub of b.subs) {
              const subLen = sub.len * scale * (bProgress - 0.6) / 0.4;
              ctx.beginPath();
              ctx.moveTo(endX, endY);
              ctx.lineTo(endX + Math.cos(b.angle + sub.angle) * subLen, endY + Math.sin(b.angle + sub.angle) * subLen);
              ctx.stroke();
            }
            ctx.lineWidth = 2.5 * scale;
          }
        }
      }
      // Axon grows
      const axonGrow = interpolate(neuronGrow, [0.4, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (axonGrow > 0) {
        ctx.strokeStyle = `hsla(220, 55%, 58%, ${axonGrow * 0.8})`;
        ctx.lineWidth = 3 * scale;
        const axonLen = 100 * scale * axonGrow;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.quadraticCurveTo(centerX + axonLen * 0.5, centerY + 20 * scale, centerX + axonLen, centerY + 10 * scale);
        ctx.stroke();
        // Terminal boutons
        if (axonGrow > 0.8) {
          const termAlpha = (axonGrow - 0.8) / 0.2;
          const termX = centerX + axonLen;
          const termY = centerY + 10 * scale;
          ctx.fillStyle = `hsla(220, 55%, 60%, ${termAlpha * 0.7})`;
          for (let t = 0; t < 4; t++) {
            const tAngle = -0.6 + t * 0.4;
            const tLen = 8 * scale;
            ctx.beginPath();
            ctx.arc(termX + Math.cos(tAngle) * tLen, termY + Math.sin(tAngle) * tLen, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    // Label
    const labelAlpha = interpolate(frame, [88, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("full 3D shape traced through the stack", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V3: React.FC<VariantProps> = ({ width, height }) => {
  // Wireframe to Solid: neuron shape drawn as wireframe. Lines thicken and fill in
  // with gradient colors. Satisfying fill effect.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24003), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.45;
    const centerY = height * 0.42;
    // Phase 1: wireframe draws itself
    const wireProgress = interpolate(frame, [5, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 2: lines thicken and fill
    const fillProgress = interpolate(frame, [45, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const lineThickness = interpolate(fillProgress, [0, 0.5], [1.5, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scale;
    const fillAlpha = interpolate(fillProgress, [0.3, 1], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Define neuron segments
    const segments = [
      // Dendrites
      { x1: 0, y1: 0, x2: -55, y2: -35, t: 0.0 },
      { x1: -55, y1: -35, x2: -75, y2: -50, t: 0.08 },
      { x1: -55, y1: -35, x2: -65, y2: -20, t: 0.1 },
      { x1: 0, y1: 0, x2: -45, y2: -55, t: 0.05 },
      { x1: -45, y1: -55, x2: -60, y2: -70, t: 0.12 },
      { x1: 0, y1: 0, x2: -40, y2: 15, t: 0.15 },
      { x1: -40, y1: 15, x2: -55, y2: 25, t: 0.2 },
      // Axon
      { x1: 0, y1: 0, x2: 90, y2: 5, t: 0.25 },
      { x1: 90, y1: 5, x2: 110, y2: -8, t: 0.5 },
      { x1: 90, y1: 5, x2: 108, y2: 18, t: 0.55 },
      { x1: 90, y1: 5, x2: 115, y2: 5, t: 0.6 },
    ];
    // Draw segments
    ctx.lineCap = "round";
    for (const seg of segments) {
      const segProgress = interpolate(wireProgress, [seg.t, Math.min(1, seg.t + 0.2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (segProgress <= 0) continue;
      const x1 = centerX + seg.x1 * scale;
      const y1 = centerY + seg.y1 * scale;
      const x2 = x1 + (seg.x2 - seg.x1) * scale * segProgress;
      const y2 = y1 + (seg.y2 - seg.y1) * scale * segProgress;
      // Glow fill
      if (fillAlpha > 0) {
        ctx.globalAlpha = fadeAlpha * fillAlpha;
        ctx.strokeStyle = `hsla(220, 55%, 55%, ${fillAlpha * 0.5})`;
        ctx.lineWidth = lineThickness * 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // Wire line
      ctx.globalAlpha = fadeAlpha;
      ctx.strokeStyle = `hsla(220, 60%, 65%, 0.8)`;
      ctx.lineWidth = lineThickness;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    // Cell body
    const bodyProgress = interpolate(wireProgress, [0, 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyProgress > 0) {
      const bodyR = 12 * scale * bodyProgress;
      // Wireframe circle
      ctx.strokeStyle = `hsla(220, 60%, 65%, 0.8)`;
      ctx.lineWidth = lineThickness;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bodyR, 0, Math.PI * 2);
      ctx.stroke();
      // Fill
      if (fillAlpha > 0) {
        const bodyGrad = ctx.createRadialGradient(centerX - bodyR * 0.3, centerY - bodyR * 0.3, 0, centerX, centerY, bodyR);
        bodyGrad.addColorStop(0, `hsla(220, 60%, 70%, ${fillAlpha * 0.9})`);
        bodyGrad.addColorStop(1, `hsla(220, 55%, 50%, ${fillAlpha * 0.5})`);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, bodyR, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Stage labels
    const wireLabel = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const solidLabel = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (wireLabel > 0 && fillProgress < 0.3) {
      ctx.globalAlpha = fadeAlpha * wireLabel * (1 - fillProgress * 3);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("wireframe", width * 0.5, height * 0.12);
    }
    if (solidLabel > 0) {
      ctx.globalAlpha = fadeAlpha * solidLabel;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("solid 3D shape", width * 0.5, height * 0.12);
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [88, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("tracing the full 3D shape", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V4: React.FC<VariantProps> = ({ width, height }) => {
  // Slice Stack collapses → Rotating Neuron: stack of slices collapses vertically.
  // When fully collapsed, the neuron shape appears and slowly rotates.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24004), [width, height, scale]);
  const sliceCount = 8;
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const centerX = width * 0.5;
    const centerY = height * 0.42;
    // Phase 1: slices spread out
    const spreadPhase = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 2: collapse
    const collapsePhase = interpolate(frame, [25, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Phase 3: neuron reveal
    const neuronReveal = interpolate(frame, [50, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sliceSpacing = 10 * scale * spreadPhase * (1 - collapsePhase);
    // Draw slices collapsing
    if (collapsePhase < 1) {
      const sliceAlpha = 1 - neuronReveal;
      for (let i = 0; i < sliceCount; i++) {
        ctx.globalAlpha = fadeAlpha * spreadPhase * sliceAlpha;
        const sliceY = centerY + (i - sliceCount / 2) * sliceSpacing;
        const sliceR = (8 + Math.sin(i * 0.8) * 3) * scale;
        ctx.fillStyle = `hsla(220, 40%, 50%, 0.4)`;
        ctx.beginPath();
        ctx.ellipse(centerX, sliceY, sliceR * 2, sliceR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `hsla(220, 45%, 55%, 0.5)`;
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.ellipse(centerX, sliceY, sliceR * 2, sliceR * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Neuron appears with rotation
    if (neuronReveal > 0) {
      ctx.globalAlpha = fadeAlpha * neuronReveal;
      // Slight rotation via lateral offset
      const rotateAngle = interpolate(frame, [55, 110], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotateAngle * Math.sin(frame * 0.03));
      // Scale up neuron
      const neuronScale = neuronReveal * 45;
      drawNeuron(ctx, 0, 0, neuronScale * scale, `hsla(220, 60%, 60%, ${neuronReveal})`, frame);
      ctx.restore();
      // "3D" label
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${14 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("3D", centerX + 60 * scale, centerY - 35 * scale);
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("slices collapse into full 3D shape", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V5: React.FC<VariantProps> = ({ width, height }) => {
  // Point Cloud to Neuron: scattered dots converge and align into neuron shape.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24005), [width, height, scale]);
  const pointCount = 80;
  const points = useMemo(() => {
    const rand = seeded(24051);
    return Array.from({ length: pointCount }, () => {
      // Random start position
      const startX = rand() * width;
      const startY = rand() * height;
      // Target forms a neuron-like shape
      const isBody = rand() < 0.15;
      const isDendrite = rand() < 0.5;
      let targetX: number, targetY: number;
      if (isBody) {
        const a = rand() * Math.PI * 2;
        const r = rand() * 12 * scale;
        targetX = width * 0.4 + Math.cos(a) * r;
        targetY = height * 0.42 + Math.sin(a) * r;
      } else if (isDendrite) {
        const branch = Math.floor(rand() * 4);
        const baseAngle = Math.PI * 0.6 + branch * Math.PI * 0.15;
        const dist = 15 * scale + rand() * 50 * scale;
        targetX = width * 0.4 + Math.cos(baseAngle + Math.PI) * dist + (rand() - 0.5) * 8 * scale;
        targetY = height * 0.42 + Math.sin(baseAngle + Math.PI) * dist + (rand() - 0.5) * 8 * scale;
      } else {
        const dist = rand() * 90 * scale;
        targetX = width * 0.4 + dist + (rand() - 0.5) * 6 * scale;
        targetY = height * 0.42 + (rand() - 0.5) * 12 * scale;
      }
      return { startX, startY, targetX, targetY, delay: rand() * 30, size: 1.5 + rand() * 2 };
    });
  }, [width, height, scale, pointCount]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const convergeProgress = interpolate(frame, [10, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (const p of points) {
      const pointProgress = interpolate(convergeProgress, [p.delay / 30 * 0.3, Math.min(1, p.delay / 30 * 0.3 + 0.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const currentX = p.startX + (p.targetX - p.startX) * pointProgress;
      const currentY = p.startY + (p.targetY - p.startY) * pointProgress;
      const brightness = 40 + pointProgress * 25;
      ctx.fillStyle = `hsla(220, ${30 + pointProgress * 30}%, ${brightness}%, ${0.4 + pointProgress * 0.5})`;
      ctx.beginPath();
      ctx.arc(currentX, currentY, p.size * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Glow around converged shape
    if (convergeProgress > 0.7) {
      const glowAlpha = (convergeProgress - 0.7) / 0.3;
      const glow = ctx.createRadialGradient(width * 0.4, height * 0.42, 10 * scale, width * 0.4, height * 0.42, 60 * scale);
      glow.addColorStop(0, `hsla(220, 55%, 60%, ${glowAlpha * 0.15})`);
      glow.addColorStop(1, `hsla(220, 55%, 60%, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(width * 0.4, height * 0.42, 60 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Label
    const labelAlpha = interpolate(frame, [85, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("points converge into neuron shape", width * 0.5, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V6: React.FC<VariantProps> = ({ width, height }) => {
  // Skeleton Assembly: neuron skeleton draws itself segment by segment.
  // Each extends from the previous. Building the whole structure step by step.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24006), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const cx = width * 0.4;
    const cy = height * 0.42;
    // Define skeleton segments in order of drawing
    const segments = [
      // Cell body area → primary dendrite trunk
      { x1: 0, y1: 0, x2: -35, y2: -25, thickness: 2.5, startFrame: 5 },
      // Dendrite branches
      { x1: -35, y1: -25, x2: -60, y2: -45, thickness: 2, startFrame: 14 },
      { x1: -60, y1: -45, x2: -75, y2: -55, thickness: 1.5, startFrame: 20 },
      { x1: -60, y1: -45, x2: -70, y2: -35, thickness: 1.5, startFrame: 22 },
      { x1: -35, y1: -25, x2: -55, y2: -10, thickness: 2, startFrame: 16 },
      { x1: -55, y1: -10, x2: -70, y2: -5, thickness: 1.5, startFrame: 25 },
      // Another dendrite trunk
      { x1: 0, y1: 0, x2: -30, y2: 20, thickness: 2, startFrame: 10 },
      { x1: -30, y1: 20, x2: -50, y2: 30, thickness: 1.5, startFrame: 28 },
      // Axon (thick, long)
      { x1: 0, y1: 0, x2: 40, y2: 3, thickness: 3, startFrame: 32 },
      { x1: 40, y1: 3, x2: 80, y2: 8, thickness: 2.5, startFrame: 42 },
      { x1: 80, y1: 8, x2: 110, y2: 5, thickness: 2.5, startFrame: 52 },
      // Axon terminals
      { x1: 110, y1: 5, x2: 125, y2: -5, thickness: 1.5, startFrame: 62 },
      { x1: 110, y1: 5, x2: 128, y2: 10, thickness: 1.5, startFrame: 65 },
      { x1: 110, y1: 5, x2: 122, y2: 20, thickness: 1.5, startFrame: 68 },
    ];
    ctx.lineCap = "round";
    for (const seg of segments) {
      const segProgress = interpolate(frame, [seg.startFrame, seg.startFrame + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (segProgress <= 0) continue;
      const x1 = cx + seg.x1 * scale;
      const y1 = cy + seg.y1 * scale;
      const x2 = x1 + (seg.x2 - seg.x1) * scale * segProgress;
      const y2 = y1 + (seg.y2 - seg.y1) * scale * segProgress;
      ctx.strokeStyle = `hsla(220, 55%, 60%, 0.8)`;
      ctx.lineWidth = seg.thickness * scale;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Growth tip glow
      if (segProgress < 1) {
        ctx.fillStyle = `hsla(180, 60%, 70%, ${(1 - segProgress) * 0.6})`;
        ctx.beginPath();
        ctx.arc(x2, y2, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cell body
    const bodyAlpha = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyAlpha > 0) {
      const bodyGrad = ctx.createRadialGradient(cx - 2 * scale, cy - 2 * scale, 0, cx, cy, 10 * scale);
      bodyGrad.addColorStop(0, `hsla(220, 60%, 70%, ${bodyAlpha * 0.9})`);
      bodyGrad.addColorStop(1, `hsla(220, 55%, 50%, ${bodyAlpha * 0.4})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    // Segment counter
    const builtSegments = segments.filter(s => frame >= s.startFrame + 10).length;
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${10 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${builtSegments} / ${segments.length} segments`, width * 0.5, height * 0.82);
    // Label
    const labelAlpha = interpolate(frame, [85, 103], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("skeleton built segment by segment", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V7: React.FC<VariantProps> = ({ width, height }) => {
  // Branching Tree Growth: cell body in center, branches extend and split.
  // Axon grows long to the right. Organic growth animation.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24007), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const cx = width * 0.38;
    const cy = height * 0.42;
    // Overall growth progress
    const growthProgress = interpolate(frame, [5, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Cell body pulses to life
    const bodyGrow = interpolate(growthProgress, [0, 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyGrow > 0) {
      const pulse = 1 + Math.sin(frame * 0.08) * 0.05;
      const bodyR = 14 * scale * bodyGrow * pulse;
      const grad = ctx.createRadialGradient(cx - bodyR * 0.25, cy - bodyR * 0.25, 0, cx, cy, bodyR);
      grad.addColorStop(0, `hsla(220, 65%, 72%, ${bodyGrow * 0.9})`);
      grad.addColorStop(0.7, `hsla(220, 58%, 58%, ${bodyGrow * 0.7})`);
      grad.addColorStop(1, `hsla(220, 50%, 45%, ${bodyGrow * 0.4})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Recursive branching function
    const drawBranch = (
      x: number, y: number, angle: number, length: number,
      thickness: number, depth: number, startProgress: number,
    ) => {
      const branchProgress = interpolate(growthProgress, [startProgress, Math.min(1, startProgress + 0.12)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (branchProgress <= 0 || depth > 4) return;
      const endX = x + Math.cos(angle) * length * branchProgress;
      const endY = y + Math.sin(angle) * length * branchProgress;
      // Organic curve
      const midX = (x + endX) / 2 + Math.sin(angle + Math.PI / 2) * length * 0.1;
      const midY = (y + endY) / 2 + Math.cos(angle + Math.PI / 2) * length * 0.1;
      ctx.strokeStyle = `hsla(220, ${50 + depth * 5}%, ${55 + depth * 3}%, ${0.8 - depth * 0.1})`;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
      // Growth tip
      if (branchProgress < 1) {
        ctx.fillStyle = `hsla(140, 55%, 65%, ${(1 - branchProgress) * 0.5})`;
        ctx.beginPath();
        ctx.arc(endX, endY, thickness * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      // Branch splits
      if (branchProgress > 0.8 && depth < 4) {
        const splitAngle = 0.4 + depth * 0.1;
        const subLength = length * 0.65;
        const subThickness = thickness * 0.7;
        const subStart = startProgress + 0.1;
        drawBranch(endX, endY, angle - splitAngle, subLength, subThickness, depth + 1, subStart);
        drawBranch(endX, endY, angle + splitAngle, subLength, subThickness, depth + 1, subStart + 0.03);
      }
    };
    // Dendrite branches (leftward/upward)
    drawBranch(cx, cy, Math.PI * 0.8, 45 * scale, 3 * scale, 0, 0.08);
    drawBranch(cx, cy, Math.PI * 0.65, 40 * scale, 2.5 * scale, 0, 0.12);
    drawBranch(cx, cy, Math.PI * 0.95, 35 * scale, 2 * scale, 0, 0.16);
    // Axon (rightward, longer)
    const axonProgress = interpolate(growthProgress, [0.2, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (axonProgress > 0) {
      const axonLen = 110 * scale * axonProgress;
      ctx.strokeStyle = `hsla(220, 55%, 58%, 0.8)`;
      ctx.lineWidth = 3.5 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cx + axonLen * 0.5, cy + 12 * scale, cx + axonLen, cy + 5 * scale);
      ctx.stroke();
      // Terminal boutons
      if (axonProgress > 0.85) {
        const termProgress = (axonProgress - 0.85) / 0.15;
        const termX = cx + axonLen;
        const termY = cy + 5 * scale;
        drawBranch(termX, termY, -0.3, 15 * scale, 2 * scale, 3, 0.75);
        drawBranch(termX, termY, 0.1, 12 * scale, 2 * scale, 3, 0.78);
        drawBranch(termX, termY, 0.5, 14 * scale, 2 * scale, 3, 0.81);
        // Ignore drawBranch for simplicity; draw directly
        ctx.fillStyle = `hsla(220, 55%, 60%, ${termProgress * 0.7})`;
        for (let t = 0; t < 4; t++) {
          const tAngle = -0.5 + t * 0.35;
          const tDist = 15 * scale * termProgress;
          ctx.beginPath();
          ctx.arc(termX + Math.cos(tAngle) * tDist, termY + Math.sin(tAngle) * tDist, 2.5 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // Bottom label
    const labelAlpha = interpolate(frame, [88, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeAlpha * labelAlpha;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron grows branch by branch", width * 0.5, height * 0.9);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V8: React.FC<VariantProps> = ({ width, height }) => {
  // Morphing Blob: amorphous oval gradually deforms — parts stretch into branches.
  // Blob becomes a neuron through smooth shape morphing.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24008), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const cx = width * 0.42;
    const cy = height * 0.42;
    const morphProgress = interpolate(frame, [8, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Define control points that morph from blob to neuron
    // Using polar coordinates: angle -> radius
    const numPoints = 32;
    const blobRadius = 25 * scale;
    ctx.beginPath();
    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      // Base blob shape (slightly irregular oval)
      const blobR = blobRadius * (1 + Math.sin(angle * 2) * 0.15 + Math.cos(angle * 3) * 0.1);
      // Neuron shape: protrusions at specific angles
      let neuronR = blobRadius * 0.5; // Default body size for neuron
      // Dendrites (left side, PI +/- range)
      const dendAngle1 = Math.PI * 0.75;
      const dendAngle2 = Math.PI * 0.9;
      const dendAngle3 = Math.PI * 1.1;
      const dendDist1 = Math.abs(angle - dendAngle1);
      const dendDist2 = Math.abs(angle - dendAngle2);
      const dendDist3 = Math.abs(angle - dendAngle3);
      if (dendDist1 < 0.15) neuronR = blobRadius * 2.0;
      else if (dendDist2 < 0.12) neuronR = blobRadius * 1.6;
      else if (dendDist3 < 0.12) neuronR = blobRadius * 1.4;
      // Axon (right side, angle near 0)
      const axonDist = Math.min(Math.abs(angle), Math.abs(angle - Math.PI * 2));
      if (axonDist < 0.1) neuronR = blobRadius * 3.5;
      else if (axonDist < 0.2) neuronR = blobRadius * 2.5;
      const currentR = blobR + (neuronR - blobR) * morphProgress;
      const px = cx + Math.cos(angle) * currentR;
      const py = cy + Math.sin(angle) * currentR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    // Fill with gradient
    const bodyGrad = ctx.createRadialGradient(cx - 5 * scale, cy - 5 * scale, 0, cx, cy, blobRadius * 2);
    bodyGrad.addColorStop(0, `hsla(220, 60%, 68%, 0.8)`);
    bodyGrad.addColorStop(0.5, `hsla(220, 55%, 55%, 0.6)`);
    bodyGrad.addColorStop(1, `hsla(220, 50%, 45%, 0.3)`);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.strokeStyle = `hsla(220, 50%, 60%, 0.6)`;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    // Stage labels
    const blobLabel = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const morphLabel = interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const neuronLabel = interpolate(frame, [80, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (blobLabel > 0 && morphProgress < 0.3) {
      ctx.globalAlpha = fadeAlpha * blobLabel * (1 - morphProgress * 3);
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("amorphous blob", cx, cy + blobRadius + 20 * scale);
    }
    if (morphLabel > 0 && morphProgress > 0.3 && morphProgress < 0.8) {
      ctx.globalAlpha = fadeAlpha * morphLabel;
      ctx.fillStyle = PALETTE.text.dim;
      ctx.font = `${10 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("morphing...", cx, height * 0.78);
    }
    if (neuronLabel > 0) {
      ctx.globalAlpha = fadeAlpha * neuronLabel;
      ctx.fillStyle = PALETTE.accent.blue;
      ctx.font = `bold ${11 * scale}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("neuron shape revealed", cx, height * 0.88);
    }
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

const V9: React.FC<VariantProps> = ({ width, height }) => {
  // Progressive Detail: Stage 1: vague fuzzy blob. Stage 2: rough protrusions.
  // Stage 3: recognizable branches. Stage 4: fine detail.
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(18, width, height, scale, 24009), [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;
    const cx = width * 0.45;
    const cy = height * 0.4;
    // 4 progressive stages
    const stage = interpolate(frame, [5, 95], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    // Stage 1: Fuzzy blob (always drawn, fades as detail increases)
    const blob1Alpha = interpolate(stage, [0, 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const blurRadius = interpolate(stage, [0, 4], [45, 12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * scale;
    if (blob1Alpha > 0) {
      const fuzz = ctx.createRadialGradient(cx, cy, 0, cx, cy, blurRadius);
      fuzz.addColorStop(0, `hsla(220, 50%, 60%, ${blob1Alpha * 0.7})`);
      fuzz.addColorStop(0.6, `hsla(220, 40%, 50%, ${blob1Alpha * 0.35})`);
      fuzz.addColorStop(1, `hsla(220, 30%, 40%, 0)`);
      ctx.fillStyle = fuzz;
      ctx.beginPath();
      ctx.arc(cx, cy, blurRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    // Stage 2: Rough protrusions emerge
    if (stage > 1) {
      const protrusionAlpha = interpolate(stage, [1, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * protrusionAlpha;
      const protrusions = [
        { angle: Math.PI * 0.75, len: 30 },
        { angle: Math.PI * 0.9, len: 25 },
        { angle: Math.PI * 1.1, len: 20 },
        { angle: 0.05, len: 50 },
      ];
      for (const p of protrusions) {
        const len = p.len * scale * protrusionAlpha;
        const endX = cx + Math.cos(p.angle) * len;
        const endY = cy + Math.sin(p.angle) * len;
        const grad = ctx.createRadialGradient(endX, endY, 0, endX, endY, 10 * scale);
        grad.addColorStop(0, `hsla(220, 45%, 55%, 0.5)`);
        grad.addColorStop(1, `hsla(220, 35%, 45%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(endX, endY, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Stage 3: Recognizable branches
    if (stage > 2) {
      const branchAlpha = interpolate(stage, [2, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * branchAlpha;
      ctx.strokeStyle = `hsla(220, 55%, 58%, ${branchAlpha * 0.8})`;
      ctx.lineWidth = 2.5 * scale;
      ctx.lineCap = "round";
      // Dendrites
      const branches = [
        [cx, cy, cx - 35 * scale, cy - 25 * scale],
        [cx - 35 * scale, cy - 25 * scale, cx - 55 * scale, cy - 40 * scale],
        [cx - 35 * scale, cy - 25 * scale, cx - 50 * scale, cy - 15 * scale],
        [cx, cy, cx - 25 * scale, cy + 15 * scale],
      ];
      for (const [x1, y1, x2, y2] of branches) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2 - x1) * branchAlpha, y1 + (y2 - y1) * branchAlpha);
        ctx.stroke();
      }
      // Axon
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 80 * scale * branchAlpha, cy + 5 * scale);
      ctx.stroke();
    }
    // Stage 4: Fine detail — spines, boutons
    if (stage > 3) {
      const detailAlpha = interpolate(stage, [3, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * detailAlpha;
      // Small spines along dendrites
      ctx.strokeStyle = `hsla(220, 50%, 60%, ${detailAlpha * 0.6})`;
      ctx.lineWidth = 1 * scale;
      const rand = seeded(24091);
      for (let i = 0; i < 15; i++) {
        const baseT = rand();
        const baseAngle = Math.PI * (0.65 + rand() * 0.5);
        const baseDist = 10 + rand() * 30;
        const bx = cx + Math.cos(baseAngle) * baseDist * scale;
        const by = cy + Math.sin(baseAngle) * baseDist * scale * 0.8;
        const spineAngle = rand() * Math.PI * 2;
        const spineLen = (2 + rand() * 4) * scale;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(spineAngle) * spineLen, by + Math.sin(spineAngle) * spineLen);
        ctx.stroke();
        // Tiny dot at end
        ctx.fillStyle = `hsla(220, 55%, 65%, ${detailAlpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(bx + Math.cos(spineAngle) * spineLen, by + Math.sin(spineAngle) * spineLen, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      // Boutons at axon terminal
      for (let t = 0; t < 5; t++) {
        const tAngle = -0.5 + t * 0.25;
        const tX = cx + 80 * scale + Math.cos(tAngle) * 12 * scale;
        const tY = cy + 5 * scale + Math.sin(tAngle) * 12 * scale;
        ctx.fillStyle = `hsla(220, 55%, 58%, ${detailAlpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(tX, tY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Cell body (more defined at higher stages)
    const bodyDetail = interpolate(stage, [0, 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (bodyDetail > 0.3) {
      ctx.globalAlpha = fadeAlpha * bodyDetail;
      const bodyR = 12 * scale;
      const grad = ctx.createRadialGradient(cx - 3 * scale, cy - 3 * scale, 0, cx, cy, bodyR);
      grad.addColorStop(0, `hsla(220, 62%, 68%, ${bodyDetail * 0.9})`);
      grad.addColorStop(1, `hsla(220, 50%, 48%, ${bodyDetail * 0.4})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, bodyR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Stage indicators
    const stageNames = ["vague blob", "rough protrusions", "recognizable branches", "fine detail"];
    const currentStage = Math.min(3, Math.floor(stage));
    const stageAlpha = interpolate(stage % 1, [0.1, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = fadeAlpha * Math.min(1, stageAlpha);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${11 * scale}px system-ui`;
    ctx.textAlign = "center";
    if (currentStage >= 0 && currentStage < stageNames.length) {
      ctx.fillText(`stage ${currentStage + 1}: ${stageNames[currentStage]}`, width * 0.5, height * 0.82);
    }
    // Resolution bar
    const barY = height * 0.87;
    const barW = width * 0.5;
    const barX = (width - barW) / 2;
    const barH = 5 * scale;
    ctx.globalAlpha = fadeAlpha * 0.6;
    ctx.fillStyle = "rgba(40, 30, 55, 0.5)";
    ctx.fillRect(barX, barY, barW, barH);
    const fillFraction = stage / 4;
    ctx.fillStyle = PALETTE.accent.blue;
    ctx.fillRect(barX, barY, barW * fillFraction, barH);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("low res", barX, barY - 4 * scale);
    ctx.textAlign = "right";
    ctx.fillText("high res", barX + barW, barY - 4 * scale);
    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_024: VariantDef[] = [
  { id: "flat-to-3d", label: "Flat-to-3D Extrusion", component: V1 },
  { id: "grow-from-slices", label: "Growing from Slices", component: V2 },
  { id: "wireframe-solid", label: "Wireframe to Solid", component: V3 },
  { id: "collapse-rotate", label: "Stack Collapse", component: V4 },
  { id: "point-cloud", label: "Point Cloud", component: V5 },
  { id: "skeleton", label: "Skeleton Assembly", component: V6 },
  { id: "branching-tree", label: "Branching Tree", component: V7 },
  { id: "morphing-blob", label: "Morphing Blob", component: V8 },
  { id: "progressive-detail", label: "Progressive Detail", component: V9 },
];
