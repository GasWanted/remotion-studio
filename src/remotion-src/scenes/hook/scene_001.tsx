import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";

// Scene 001 — Brain connectome grow: cute blob cells bloom from center (5s @ 30fps)
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const CELL_COLORS: [number, number, number][] = [
  [350, 65, 65], // rosy
  [25, 75, 62],  // orange
  [55, 70, 58],  // amber
  [140, 50, 55], // green
  [180, 55, 55], // teal
  [220, 55, 62], // blue
  [280, 45, 62], // violet
  [310, 55, 62], // pink
];

export const Scene001: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = width / 2;
  const cy = height / 2;
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const nodes: {
      x: number; y: number; r: number;
      hue: number; sat: number; lit: number;
      blobPhase: number; squish: number;
    }[] = [];
    for (let i = 0; i < 220; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.37;
      const col = CELL_COLORS[Math.floor(rand() * CELL_COLORS.length)];
      nodes.push({
        x: cx + Math.cos(a) * r * 1.35,
        y: cy + Math.sin(a) * r * 0.9,
        r: (2.5 + rand() * 3.5) * scale,
        hue: col[0], sat: col[1], lit: col[2],
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
  }, [width, height, cx, cy, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

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

    // Floating particles (always visible, behind cells)
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

    const visible = Math.floor(interpolate(frame, [3, 115], [1, data.nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Pseudopod connections
    for (const [a, b] of data.edges) {
      if (a >= visible || b >= visible) continue;
      const na = data.nodes[a], nb = data.nodes[b];
      const mx = (na.x + nb.x) / 2;
      const my = (na.y + nb.y) / 2;
      const perpX = -(nb.y - na.y) * 0.15;
      const perpY = (nb.x - na.x) * 0.15;
      const wave = Math.sin(frame * 0.03 + a * 0.5 + b * 0.3) * 5 * scale;
      const cpx = mx + perpX + wave;
      const cpy = my + perpY + wave * 0.5;

      ctx.strokeStyle = `hsla(${(na.hue + nb.hue) / 2}, 40%, 55%, 0.25)`;
      ctx.lineWidth = 2 * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.stroke();

      ctx.strokeStyle = `hsla(${(na.hue + nb.hue) / 2}, 50%, 75%, 0.1)`;
      ctx.lineWidth = 1 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx - 0.5 * scale, cpy - 0.5 * scale, nb.x, nb.y);
      ctx.stroke();
    }

    // Blob cells with eyes
    for (let i = 0; i < visible; i++) {
      const n = data.nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);

      const wobble = Math.sin(frame * 0.04 + n.blobPhase) * 0.08;
      const r = Math.max(0.1, n.r * (1 + wobble));
      const ry = Math.max(0.1, r * n.squish);

      // Soft outer glow
      const glowGrad = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r * 2.5);
      glowGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * 0.15})`);
      glowGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(n.x, n.y, r * 2.5, ry * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cell body
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(wobble * 0.5);

      const bodyGrad = ctx.createRadialGradient(-r * 0.2, -ry * 0.2, 0, 0, 0, r);
      bodyGrad.addColorStop(0, `hsla(${n.hue}, ${n.sat + 5}%, ${Math.min(85, n.lit + 18)}%, ${alpha})`);
      bodyGrad.addColorStop(0.7, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha})`);
      bodyGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit - 10}%, ${alpha * 0.9})`);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dot eyes
      if (r > 2.5 * scale) {
        const eyeSpacing = r * 0.3;
        const eyeY = -ry * 0.1;
        const eyeR = Math.max(0.4 * scale, r * 0.1);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeR * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeR * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(30, 20, 40, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
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
