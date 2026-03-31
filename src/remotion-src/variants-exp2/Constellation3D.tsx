import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const Constellation3D: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const nodes: { x: number; y: number; r: number; brightness: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: cy + Math.sin(a) * r * 0.9,
        r: (1.5 + rand() * 2.5) * scale,
        brightness: 0.5 + rand() * 0.5,
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Star layers for parallax background
    const starRand = seeded(111);
    const layers: { x: number; y: number; r: number; speed: number; color: string }[][] = [];
    for (let layer = 0; layer < 4; layer++) {
      const stars: { x: number; y: number; r: number; speed: number; color: string }[] = [];
      const count = layer === 0 ? 300 : layer === 1 ? 150 : layer === 2 ? 60 : 20;
      const speed = [0.05, 0.15, 0.35, 0.6][layer];
      const maxR = [0.5, 0.8, 1.2, 2.0][layer];
      const colors = [
        "rgba(180, 190, 220, 0.4)",
        "rgba(200, 210, 240, 0.6)",
        "rgba(220, 225, 255, 0.8)",
        "rgba(255, 255, 255, 1.0)",
      ];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: starRand() * width * 1.5 - width * 0.25,
          y: starRand() * height * 1.5 - height * 0.25,
          r: (0.3 + starRand() * maxR) * scale,
          speed,
          color: colors[layer],
        });
      }
      layers.push(stars);
    }
    // Nebula patches
    const nebRand = seeded(222);
    const nebulae: { x: number; y: number; r: number; hue: number }[] = [];
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: nebRand() * width,
        y: nebRand() * height,
        r: (60 + nebRand() * 100) * scale,
        hue: nebRand() * 360,
      });
    }
    return { nodes, edges, layers, nebulae };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { nodes, edges, layers, nebulae } = data;

    // Deep space black
    ctx.fillStyle = "#020208";
    ctx.fillRect(0, 0, width, height);

    // Very subtle deep blue gradient from center
    const spaceGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.6);
    spaceGrad.addColorStop(0, "rgba(10, 15, 40, 0.4)");
    spaceGrad.addColorStop(1, "rgba(2, 2, 8, 0)");
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Nebula patches
    for (const neb of nebulae) {
      const h = neb.hue;
      const drift = Math.sin(frame * 0.005 + neb.hue) * 5 * scale;
      for (let layer = 0; layer < 3; layer++) {
        const nr = neb.r * (0.5 + layer * 0.3);
        const grad = ctx.createRadialGradient(
          neb.x + drift, neb.y + drift * 0.7, 0,
          neb.x + drift, neb.y + drift * 0.7, nr
        );
        const alpha = 0.02 - layer * 0.005;
        grad.addColorStop(0, `hsla(${h}, 60%, 30%, ${alpha})`);
        grad.addColorStop(1, `hsla(${h}, 40%, 15%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Parallax star layers — camera pans slowly right and up
    const panX = frame * 0.3 * scale;
    const panY = frame * -0.15 * scale;

    for (const layer of layers) {
      for (const star of layer) {
        const sx = ((star.x - panX * star.speed) % (width * 1.5) + width * 1.5) % (width * 1.5) - width * 0.25;
        const sy = ((star.y - panY * star.speed) % (height * 1.5) + height * 1.5) % (height * 1.5) - height * 0.25;

        if (sx < -5 || sx > width + 5 || sy < -5 || sy > height + 5) continue;

        // Twinkle
        const twinkle = 0.5 + 0.5 * Math.sin(frame * 0.08 + star.x * 0.1 + star.y * 0.13);
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw constellation lines (edges)
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];

      ctx.strokeStyle = "rgba(150, 170, 220, 0.2)";
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();

      // Dotted guide line effect
      const dx = nb.x - na.x, dy = nb.y - na.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dots = Math.floor(dist / (4 * scale));
      ctx.fillStyle = "rgba(120, 140, 200, 0.1)";
      for (let d = 1; d < dots; d++) {
        const t = d / dots;
        ctx.beginPath();
        ctx.arc(na.x + dx * t, na.y + dy * t, 0.3 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw nodes as bright stars with lens flare crosses
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const alpha = Math.min(1, age / 8);
      const pulse = 0.7 + Math.sin(frame * 0.06 + i * 1.9) * 0.3;
      const bright = n.brightness * pulse;

      // Outer glow (large, soft)
      const outerGlow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 10);
      outerGlow.addColorStop(0, `rgba(180, 200, 255, ${alpha * bright * 0.15})`);
      outerGlow.addColorStop(0.3, `rgba(140, 160, 220, ${alpha * bright * 0.05})`);
      outerGlow.addColorStop(1, "rgba(100, 120, 200, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 10, 0, Math.PI * 2);
      ctx.fill();

      // Lens flare cross (4-point)
      const flareLen = n.r * (6 + bright * 4);
      const flareAlpha = alpha * bright * 0.4;

      // Horizontal flare
      const hGrad = ctx.createLinearGradient(n.x - flareLen, n.y, n.x + flareLen, n.y);
      hGrad.addColorStop(0, "rgba(200, 220, 255, 0)");
      hGrad.addColorStop(0.4, `rgba(200, 220, 255, ${flareAlpha * 0.3})`);
      hGrad.addColorStop(0.5, `rgba(220, 235, 255, ${flareAlpha})`);
      hGrad.addColorStop(0.6, `rgba(200, 220, 255, ${flareAlpha * 0.3})`);
      hGrad.addColorStop(1, "rgba(200, 220, 255, 0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(n.x - flareLen, n.y - 0.5 * scale, flareLen * 2, 1 * scale);

      // Vertical flare
      const vGrad = ctx.createLinearGradient(n.x, n.y - flareLen, n.x, n.y + flareLen);
      vGrad.addColorStop(0, "rgba(200, 220, 255, 0)");
      vGrad.addColorStop(0.4, `rgba(200, 220, 255, ${flareAlpha * 0.3})`);
      vGrad.addColorStop(0.5, `rgba(220, 235, 255, ${flareAlpha})`);
      vGrad.addColorStop(0.6, `rgba(200, 220, 255, ${flareAlpha * 0.3})`);
      vGrad.addColorStop(1, "rgba(200, 220, 255, 0)");
      ctx.fillStyle = vGrad;
      ctx.fillRect(n.x - 0.5 * scale, n.y - flareLen, 1 * scale, flareLen * 2);

      // Bright core
      const coreGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 1.5);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * bright * 0.95})`);
      coreGrad.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * bright * 0.5})`);
      coreGrad.addColorStop(1, "rgba(150, 170, 230, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Constellation label for the first cluster
    if (visible > 20) {
      ctx.font = `italic ${6 * scale}px serif`;
      ctx.fillStyle = `rgba(140, 160, 210, ${Math.min(0.25, (visible - 20) / 40) * fadeOut})`;
      const labelNode = nodes[0];
      ctx.fillText("Connectomae Major", labelNode.x + 15 * scale, labelNode.y - 10 * scale);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
