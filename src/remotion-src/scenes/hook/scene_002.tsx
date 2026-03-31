import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";

// Scene 002 — Ripple shock rewire: cute cell network hit by shockwave (5s @ 30fps)
// Cells start happy, ripple from center turns them startled — colors shift warm/red,
// eyes go wide, wobble intensifies. Represents brainwashing.
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const CELL_COLORS: [number, number, number][] = [
  [350, 65, 65], [25, 75, 62], [55, 70, 58], [140, 50, 55],
  [180, 55, 55], [220, 55, 62], [280, 45, 62], [310, 55, 62],
];

const SHOCKED_COLORS: [number, number, number][] = [
  [0, 70, 55], [15, 75, 52], [30, 80, 50], [340, 65, 50],
  [355, 60, 58], [10, 70, 48], [320, 55, 55], [5, 65, 52],
];

export const Scene002: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const cx = width / 2, cy = height / 2;

  const data = useMemo(() => {
    const rand = seeded(42);
    const nodes: {
      x: number; y: number; r: number; dist: number;
      hue: number; sat: number; lit: number;
      shockedHue: number; shockedSat: number; shockedLit: number;
      blobPhase: number; squish: number;
    }[] = [];
    for (let i = 0; i < 220; i++) {
      const a = rand() * Math.PI * 2;
      const rd = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.37;
      const x = cx + Math.cos(a) * rd * 1.35;
      const y = cy + Math.sin(a) * rd * 0.9;
      const col = CELL_COLORS[Math.floor(rand() * CELL_COLORS.length)];
      const scol = SHOCKED_COLORS[Math.floor(rand() * SHOCKED_COLORS.length)];
      nodes.push({
        x, y,
        r: (2.5 + rand() * 3.5) * scale,
        dist: Math.sqrt((x - cx) ** 2 + (y - cy) ** 2),
        hue: col[0], sat: col[1], lit: col[2],
        shockedHue: scol[0], shockedSat: scol[1], shockedLit: scol[2],
        blobPhase: rand() * Math.PI * 2,
        squish: 0.85 + rand() * 0.3,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.13) edges.push([i, j]);
      }
    }
    // Floating particles
    const pRand = seeded(88);
    const particles: { x: number; y: number; r: number; speed: number; phase: number; hue: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: pRand() * width, y: pRand() * height,
        r: (0.5 + pRand() * 1.5) * scale,
        speed: 0.1 + pRand() * 0.3,
        phase: pRand() * Math.PI * 2,
        hue: [50, 120, 200, 340][Math.floor(pRand() * 4)],
      });
    }
    return { nodes, edges, particles };
  }, [width, height, scale, cx, cy]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const maxDist = Math.max(...data.nodes.map((n) => n.dist));
  const rippleR = interpolate(frame, [35, 105], [0, maxDist * 1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Dark violet gradient background
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.6);
    bg.addColorStop(0, "#2a1f35");
    bg.addColorStop(0.6, "#1e1528");
    bg.addColorStop(1, "#15101d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Floating particles
    for (const p of data.particles) {
      const px = p.x + Math.sin(frame * 0.02 * p.speed + p.phase) * 8 * scale;
      const py = p.y + Math.cos(frame * 0.015 * p.speed + p.phase * 1.3) * 6 * scale;
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.04 + p.phase));
      ctx.fillStyle = `hsla(${p.hue}, 50%, 70%, ${twinkle * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = fadeOut;

    // Pseudopod connections
    for (const [a, b] of data.edges) {
      const na = data.nodes[a], nb = data.nodes[b];
      const hitA = na.dist < rippleR, hitB = nb.dist < rippleR;
      const bothHit = hitA && hitB;

      const mx = (na.x + nb.x) / 2;
      const my = (na.y + nb.y) / 2;
      const perpX = -(nb.y - na.y) * 0.15;
      const perpY = (nb.x - na.x) * 0.15;
      const wave = Math.sin(frame * 0.03 + a * 0.5 + b * 0.3) * (bothHit ? 8 : 5) * scale;
      const cpx = mx + perpX + wave;
      const cpy = my + perpY + wave * 0.5;

      const edgeHue = bothHit
        ? (na.shockedHue + nb.shockedHue) / 2
        : (na.hue + nb.hue) / 2;
      ctx.strokeStyle = `hsla(${edgeHue}, ${bothHit ? 55 : 40}%, 55%, ${bothHit ? 0.35 : 0.25})`;
      ctx.lineWidth = (bothHit ? 2.5 : 2) * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.stroke();
    }

    // Ripple ring
    if (rippleR > 0 && rippleR < maxDist * 1.2) {
      const ringAlpha = 0.5 * (1 - rippleR / (maxDist * 1.2));
      const ringGrad = ctx.createRadialGradient(cx, cy, Math.max(0, rippleR - 4 * scale), cx, cy, rippleR + 4 * scale);
      ringGrad.addColorStop(0, `hsla(0, 0%, 100%, 0)`);
      ringGrad.addColorStop(0.4, `hsla(350, 70%, 70%, ${ringAlpha})`);
      ringGrad.addColorStop(0.6, `hsla(20, 80%, 80%, ${ringAlpha * 0.8})`);
      ringGrad.addColorStop(1, `hsla(0, 0%, 100%, 0)`);
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 8 * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Blob cells
    for (const n of data.nodes) {
      const hit = n.dist < rippleR;
      // Smooth transition as ripple passes
      const hitT = hit ? Math.min(1, (rippleR - n.dist) / (30 * scale)) : 0;

      const hue = n.hue + (n.shockedHue - n.hue) * hitT;
      const sat = n.sat + (n.shockedSat - n.sat) * hitT;
      const lit = n.lit + (n.shockedLit - n.lit) * hitT;

      const wobbleSpeed = 0.04 + hitT * 0.06; // wobble faster when shocked
      const wobbleAmp = 0.08 + hitT * 0.12;
      const wobble = Math.sin(frame * wobbleSpeed + n.blobPhase) * wobbleAmp;
      const r = Math.max(0.1, n.r * (1 + wobble) * (1 + hitT * 0.15)); // swell slightly when hit
      const ry = Math.max(0.1, r * n.squish);

      // Outer glow
      const glowGrad = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.5);
      glowGrad.addColorStop(0, `hsla(${hue}, ${sat}%, ${lit}%, ${0.15 + hitT * 0.1})`);
      glowGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit}%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 2.5, ry * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cell body
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(wobble * 0.5);

      const bodyGrad = ctx.createRadialGradient(-r * 0.2, -ry * 0.2, 0, 0, 0, r);
      bodyGrad.addColorStop(0, `hsla(${hue}, ${sat + 5}%, ${Math.min(85, lit + 18)}%, 1)`);
      bodyGrad.addColorStop(0.7, `hsla(${hue}, ${sat}%, ${lit}%, 1)`);
      bodyGrad.addColorStop(1, `hsla(${hue}, ${sat}%, ${lit - 10}%, 0.9)`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes — grow wider when shocked
      if (r > 2.5 * scale) {
        const eyeSpacing = r * 0.3;
        const eyeY = -ry * 0.1;
        const eyeScale = 1 + hitT * 0.5; // eyes widen
        const eyeR = Math.max(0.4 * scale, r * 0.1) * eyeScale;

        // White of eyes
        ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeR * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeR * 1.3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils — shrink when shocked (surprise)
        const pupilScale = 1 - hitT * 0.3;
        ctx.fillStyle = `rgba(30, 20, 40, 0.85)`;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeR * pupilScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeR * pupilScale, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = `rgba(255, 255, 255, 0.7)`;
        ctx.beginPath();
        ctx.arc(-eyeSpacing - eyeR * 0.2, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing - eyeR * 0.2, eyeY - eyeR * 0.3, eyeR * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
