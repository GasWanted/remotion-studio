import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

export const GardenGrow: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;
    const flowerColors = [
      [340, 65, 65], // pink
      [20, 70, 62],  // warm orange
      [50, 70, 60],  // golden
      [300, 50, 65], // lilac
      [0, 70, 60],   // red
      [280, 55, 62], // purple
      [30, 75, 58],  // peach
    ];
    const nodes: { x: number; y: number; r: number; hue: number; sat: number; lit: number; stemBase: number; growDelay: number }[] = [];
    for (let i = 0; i < 200; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.5) * Math.min(width, height) * 0.36;
      const col = flowerColors[Math.floor(rand() * flowerColors.length)];
      const nodeY = cy + Math.sin(a) * r * 0.9;
      nodes.push({
        x: cx + Math.cos(a) * r * 1.3,
        y: nodeY,
        r: (2.5 + rand() * 3) * scale,
        hue: col[0], sat: col[1], lit: col[2],
        stemBase: nodeY + (15 + rand() * 30) * scale, // where stem grows from (soil level)
        growDelay: rand() * 0.3, // slight random delay in growth
      });
    }
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 55 * scale && rand() < 0.14) edges.push([i, j]);
      }
    }
    // Soil particles
    const soilRand = seeded(77);
    const soilBits: { x: number; y: number; r: number; shade: number }[] = [];
    for (let i = 0; i < 100; i++) {
      soilBits.push({
        x: soilRand() * width,
        y: height * 0.65 + soilRand() * height * 0.35,
        r: (1 + soilRand() * 3) * scale,
        shade: 20 + soilRand() * 30,
      });
    }
    return { nodes, edges, soilBits };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { nodes, edges, soilBits } = data;

    // Sky gradient: dark night sky at top
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, "#0c1428");
    sky.addColorStop(0.4, "#152040");
    sky.addColorStop(0.7, "#1e3050");
    sky.addColorStop(1, "#2a4060");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.65);

    // Soil/earth gradient at bottom
    const soil = ctx.createLinearGradient(0, height * 0.6, 0, height);
    soil.addColorStop(0, "#3a2820");
    soil.addColorStop(0.3, "#2c1e16");
    soil.addColorStop(1, "#1a1008");
    ctx.fillStyle = soil;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    // Grass line at soil boundary
    const grassY = height * 0.62;
    ctx.fillStyle = "#2a4020";
    ctx.beginPath();
    ctx.moveTo(0, grassY + 5 * scale);
    for (let x = 0; x < width; x += 3 * scale) {
      const grassH = (3 + Math.sin(x * 0.05 + frame * 0.02) * 2) * scale;
      ctx.lineTo(x, grassY - grassH);
      ctx.lineTo(x + 1.5 * scale, grassY);
    }
    ctx.lineTo(width, grassY + 5 * scale);
    ctx.closePath();
    ctx.fill();

    // Darker grass layer
    ctx.fillStyle = "#1e3018";
    ctx.beginPath();
    ctx.moveTo(0, grassY + 3 * scale);
    for (let x = 0; x < width; x += 4 * scale) {
      const grassH = (2 + Math.sin(x * 0.07 + 1 + frame * 0.015) * 1.5) * scale;
      ctx.lineTo(x, grassY - grassH);
      ctx.lineTo(x + 2 * scale, grassY + 1 * scale);
    }
    ctx.lineTo(width, grassY + 3 * scale);
    ctx.closePath();
    ctx.fill();

    // Soil texture bits
    for (const bit of soilBits) {
      ctx.fillStyle = `rgba(${bit.shade + 20}, ${bit.shade}, ${bit.shade - 10}, 0.15)`;
      ctx.beginPath();
      ctx.arc(bit.x, bit.y, bit.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft moonlight/stars in sky
    const moonX = width * 0.8;
    const moonY = height * 0.12;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40 * scale);
    moonGlow.addColorStop(0, "rgba(200, 220, 255, 0.15)");
    moonGlow.addColorStop(0.3, "rgba(150, 180, 220, 0.05)");
    moonGlow.addColorStop(1, "rgba(100, 130, 180, 0)");
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 40 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = fadeOut;

    const visible = Math.floor(interpolate(frame, [5, 120], [1, nodes.length], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }));

    // Draw edges as vine/root connections
    ctx.lineCap = "round";
    for (const [a, b] of edges) {
      if (a >= visible || b >= visible) continue;
      const na = nodes[a], nb = nodes[b];
      const mx = (na.x + nb.x) / 2;
      const my = (na.y + nb.y) / 2;

      // Determine if underground or above
      const isUnder = my > grassY;
      const vineColor = isUnder ? "rgba(80, 60, 40, 0.3)" : "rgba(60, 120, 50, 0.25)";

      const wave = Math.sin(frame * 0.02 + a + b) * 4 * scale;
      const cpx = mx + wave;
      const cpy = my + wave * 0.5;

      ctx.strokeStyle = vineColor;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cpx, cpy, nb.x, nb.y);
      ctx.stroke();

      // Tiny leaves on above-ground vines
      if (!isUnder && Math.abs(na.x - nb.x) > 10 * scale) {
        const leafX = mx + wave * 0.5;
        const leafY = my - 2 * scale;
        ctx.fillStyle = `rgba(80, 160, 60, 0.2)`;
        ctx.beginPath();
        ctx.ellipse(leafX, leafY, 2 * scale, 1 * scale, wave * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw nodes as growing flowers
    for (let i = 0; i < visible; i++) {
      const n = nodes[i];
      const age = visible - i;
      const growthRaw = Math.min(1, age / 15);
      const growth = Math.max(0, growthRaw - n.growDelay) / (1 - n.growDelay);
      const alpha = Math.min(1, age / 8);

      if (growth <= 0) continue;

      // Stem growing upward from stemBase to node position
      const stemTopY = n.stemBase - (n.stemBase - n.y) * Math.min(1, growth * 1.3);
      const sway = Math.sin(frame * 0.03 + i * 1.3) * 2 * scale * growth;

      // Stem
      ctx.strokeStyle = `rgba(60, 120, 50, ${alpha * 0.6})`;
      ctx.lineWidth = 1.2 * scale;
      ctx.beginPath();
      ctx.moveTo(n.x, n.stemBase);
      ctx.quadraticCurveTo(n.x + sway, (n.stemBase + stemTopY) / 2, n.x + sway * 0.5, stemTopY);
      ctx.stroke();

      // Bloom only when stem has grown enough
      if (growth > 0.5) {
        const bloomProgress = Math.min(1, (growth - 0.5) * 2);
        const bloomR = n.r * bloomProgress;
        const bloomX = n.x + sway * 0.5;
        const bloomY = stemTopY;

        // Flower glow
        const flowerGlow = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR * 3);
        flowerGlow.addColorStop(0, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * bloomProgress * 0.15})`);
        flowerGlow.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, 0)`);
        ctx.fillStyle = flowerGlow;
        ctx.beginPath();
        ctx.arc(bloomX, bloomY, bloomR * 3, 0, Math.PI * 2);
        ctx.fill();

        // Petals (5 small circles around center)
        if (bloomR > 2 * scale) {
          const petalR = bloomR * 0.55;
          for (let p = 0; p < 5; p++) {
            const pa = (p / 5) * Math.PI * 2 - Math.PI / 2;
            const px = bloomX + Math.cos(pa) * bloomR * 0.5;
            const py = bloomY + Math.sin(pa) * bloomR * 0.5;
            ctx.fillStyle = `hsla(${n.hue}, ${n.sat}%, ${Math.min(85, n.lit + 10)}%, ${alpha * bloomProgress * 0.7})`;
            ctx.beginPath();
            ctx.arc(px, py, petalR, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Center of flower
        const centerGrad = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR * 0.5);
        centerGrad.addColorStop(0, `hsla(${(n.hue + 40) % 360}, ${n.sat}%, ${Math.min(80, n.lit + 20)}%, ${alpha * bloomProgress})`);
        centerGrad.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.lit}%, ${alpha * bloomProgress * 0.6})`);
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(bloomX, bloomY, bloomR * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Tiny highlight on center
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * bloomProgress * 0.4})`;
        ctx.beginPath();
        ctx.arc(bloomX - bloomR * 0.1, bloomY - bloomR * 0.1, bloomR * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }

      // Underground root node (small dot at stem base)
      ctx.fillStyle = `rgba(100, 70, 40, ${alpha * 0.4})`;
      ctx.beginPath();
      ctx.arc(n.x, n.stemBase, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
