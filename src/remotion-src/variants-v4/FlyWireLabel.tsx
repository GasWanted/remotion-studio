import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const FlyWireLabel: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const network = useMemo(() => {
    const rand = seeded(909);
    const cx = width / 2;
    const cy = height * 0.4;
    const nodes: { x: number; y: number; r: number; hue: number; pulseOffset: number }[] = [];
    const nodeCount = 120;
    for (let i = 0; i < nodeCount; i++) {
      const angle = rand() * Math.PI * 2;
      const dist = Math.pow(rand(), 0.6) * Math.min(width, height) * 0.32;
      nodes.push({
        x: cx + Math.cos(angle) * dist * 1.3,
        y: cy + Math.sin(angle) * dist * 0.7,
        r: (1 + rand() * 2.5) * scale,
        hue: 190 + rand() * 60,
        pulseOffset: rand() * Math.PI * 2,
      });
    }

    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 45 * scale && rand() < 0.12) {
          edges.push([i, j]);
        }
      }
    }

    return { nodes, edges };
  }, [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Network fades in
    const netAlpha = interpolate(frame, [0, 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Pulse activation wave
    const pulseT = frame * 0.06;

    // Draw edges
    ctx.globalAlpha = fadeOut * netAlpha;
    for (const [a, b] of network.edges) {
      const na = network.nodes[a];
      const nb = network.nodes[b];
      const midPulse = (Math.sin(pulseT + na.pulseOffset) + 1) * 0.5;
      ctx.strokeStyle = `rgba(80, 180, 220, ${0.1 + midPulse * 0.2})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    }

    // Draw nodes
    for (const n of network.nodes) {
      const pulse = (Math.sin(pulseT + n.pulseOffset) + 1) * 0.5;
      const brightened = interpolate(pulse, [0, 1], [0.4, 0.9]);
      ctx.fillStyle = `hsla(${n.hue}, 60%, ${40 + pulse * 25}%, ${brightened})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fill();

      // Glow on bright pulses
      if (pulse > 0.7) {
        ctx.fillStyle = `hsla(${n.hue}, 60%, 70%, ${(pulse - 0.7) * 0.3})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Counter section
    const counterStart = 40;
    const counterEnd = 110;
    const counterT = interpolate(frame, [counterStart, counterEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

    const counterAlpha = interpolate(frame, [counterStart, counterStart + 15], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (counterAlpha > 0) {
      ctx.globalAlpha = fadeOut * counterAlpha;

      const neurons = Math.floor(counterT * 138639);
      const synapses = Math.floor(counterT * 15091983);

      const statY = height * 0.75;
      ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
      ctx.fillRect(width * 0.1, statY - 10 * scale, width * 0.8, 42 * scale);

      ctx.fillStyle = "#dde";
      ctx.font = `${12 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        `${neurons.toLocaleString("en-US")} neurons`,
        width / 2,
        statY + 6 * scale
      );
      ctx.fillStyle = "#aab";
      ctx.font = `${10 * scale}px monospace`;
      ctx.fillText(
        `${synapses.toLocaleString("en-US")} synapses`,
        width / 2,
        statY + 22 * scale
      );
    }

    // "FlyWire" label fades in last
    const labelAlpha = interpolate(frame, [90, 120], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

    if (labelAlpha > 0) {
      ctx.globalAlpha = fadeOut * labelAlpha;
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${22 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("FlyWire", width / 2, height * 0.15);

      // Subtle glow behind text
      ctx.fillStyle = `rgba(100, 180, 255, ${0.06 * labelAlpha})`;
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.15, 60 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
