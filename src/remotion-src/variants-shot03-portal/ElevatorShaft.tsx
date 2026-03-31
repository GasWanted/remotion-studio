import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, C, accent } from "./portal-utils";

/**
 * Orbit System: Multiple elliptical orbits at different angles.
 * Scientists as glowing points orbiting a central hub.
 * Each ring adds more scientists. Planetary/atomic feel.
 */
export const ElevatorShaft: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const orbits = useMemo(() => {
    const rand = seeded(5007);
    const cx = width / 2, cy = height * 0.52;
    const rings: { rx: number; ry: number; tilt: number; speed: number; count: number; ringIdx: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const r = (30 + i * 20) * scale;
      rings.push({
        rx: r * (1.1 + rand() * 0.4),
        ry: r * (0.3 + rand() * 0.2),
        tilt: (rand() - 0.5) * 0.6,
        speed: (0.3 + rand() * 0.5) * (rand() > 0.5 ? 1 : -1),
        count: 4 + i * 4,
        ringIdx: i,
      });
    }
    return { rings, cx, cy };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = fadeOut;

    const { cx, cy } = orbits;

    // Header
    const ha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.globalAlpha = ha * fadeOut;
    ctx.fillStyle = C.text;
    ctx.font = `600 ${16 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.07);
    ctx.globalAlpha = fadeOut;

    let totalDots = 0;

    // Draw orbital rings and particles
    for (const ring of orbits.rings) {
      const ringReveal = interpolate(frame, [8 + ring.ringIdx * 12, 20 + ring.ringIdx * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (ringReveal <= 0) continue;

      ctx.globalAlpha = ringReveal * fadeOut;

      // Orbit path (faint ellipse)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ring.tilt);
      ctx.strokeStyle = "rgba(64,144,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Scientists on orbit
      const visibleOnRing = Math.floor(ringReveal * ring.count);
      for (let i = 0; i < visibleOnRing; i++) {
        totalDots++;
        const angle = (i / ring.count) * Math.PI * 2 + frame * ring.speed * 0.01;

        // Position on tilted ellipse
        const localX = Math.cos(angle) * ring.rx;
        const localY = Math.sin(angle) * ring.ry;
        const cosT = Math.cos(ring.tilt), sinT = Math.sin(ring.tilt);
        const px = cx + localX * cosT - localY * sinT;
        const py = cy + localX * sinT + localY * cosT;

        // Depth fade (behind = dimmer)
        const depth = Math.sin(angle); // -1 to 1
        const depthAlpha = 0.4 + depth * 0.6;
        const dotR = (2 + depth * 1) * scale;

        ctx.globalAlpha = ringReveal * depthAlpha * fadeOut;

        // Glow
        const g = ctx.createRadialGradient(px, py, 0, px, py, dotR * 3.5);
        g.addColorStop(0, accent(ring.ringIdx + i, 0.18));
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, dotR * 3.5, 0, Math.PI * 2); ctx.fill();

        // Core
        ctx.fillStyle = accent(ring.ringIdx + i, 0.9);
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI * 2); ctx.fill();

        // Highlight
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.beginPath(); ctx.arc(px - dotR * 0.2, py - dotR * 0.25, dotR * 0.3, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Central hub
    ctx.globalAlpha = fadeOut;
    const hubPulse = 1 + Math.sin(frame * 0.08) * 0.1;
    const hubR = 8 * scale * hubPulse;

    // Hub glow
    const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 4);
    hg.addColorStop(0, "rgba(64,144,255,0.15)");
    hg.addColorStop(0.5, "rgba(255,140,0,0.06)");
    hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = hg;
    ctx.beginPath(); ctx.arc(cx, cy, hubR * 4, 0, Math.PI * 2); ctx.fill();

    // Hub shadow
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath(); ctx.arc(cx + 1, cy + 1, hubR, 0, Math.PI * 2); ctx.fill();

    // Hub body
    const hubGrad = ctx.createRadialGradient(cx - hubR * 0.25, cy - hubR * 0.25, 0, cx, cy, hubR);
    hubGrad.addColorStop(0, "rgba(255,255,255,0.6)");
    hubGrad.addColorStop(0.4, C.blue);
    hubGrad.addColorStop(1, C.blueDark);
    ctx.fillStyle = hubGrad;
    ctx.beginPath(); ctx.arc(cx, cy, hubR, 0, Math.PI * 2); ctx.fill();

    // Hub specular
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(cx - hubR * 0.3, cy - hubR * 0.3, hubR * 0.3, hubR * 0.2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Counter
    ctx.fillStyle = C.text;
    ctx.font = `600 ${12 * scale}px monospace`;
    ctx.textAlign = "right";
    const growT = interpolate(frame, [8, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillText(`${Math.min(200, Math.floor(growT * 200))}+`, width * 0.92, height * 0.94);
  });

  return (
    <div style={{ width, height, backgroundColor: C.bg }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
