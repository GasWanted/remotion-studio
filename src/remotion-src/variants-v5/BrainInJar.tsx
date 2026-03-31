import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A network (pulsing nodes) enclosed in a bell jar outline.
// Output signals hit the jar walls and dissipate. Isolation feeling.

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface Node { x: number; y: number; phase: number; }
interface Edge { a: number; b: number; }
interface Escapee { nodeIdx: number; angle: number; startFrame: number; speed: number; }

function buildData(width: number, height: number, scale: number) {
  const rand = seeded(444);
  const cx = width / 2;
  const cy = height * 0.48;
  const jarW = Math.min(width, height) * 0.34;
  const jarH = Math.min(width, height) * 0.40;

  // Network inside jar
  const nodes: Node[] = [];
  for (let i = 0; i < 50; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.pow(rand(), 0.6) * jarW * 0.7;
    const ny = Math.pow(rand(), 0.5) * jarH * 0.7;
    nodes.push({
      x: cx + Math.cos(a) * r * 0.6,
      y: cy - jarH * 0.35 + ny,
      phase: rand() * Math.PI * 2,
    });
  }

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < 40 * scale && rand() < 0.25) {
        edges.push({ a: i, b: j });
      }
    }
  }

  // Escapee signals: nodes that send signals outward toward jar walls
  const escapees: Escapee[] = [];
  for (let i = 0; i < 10; i++) {
    const nIdx = Math.floor(rand() * nodes.length);
    const angle = rand() * Math.PI * 2;
    escapees.push({
      nodeIdx: nIdx,
      angle,
      startFrame: 15 + Math.floor(rand() * 90),
      speed: (1.5 + rand() * 1.5) * scale,
    });
  }

  return { cx, cy, jarW, jarH, nodes, edges, escapees };
}

export const BrainInJar: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const data = useMemo(() => buildData(width, height, scale), [width, height, scale]);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { cx, cy, jarW, jarH, nodes, edges, escapees } = data;

    // Bell jar outline
    const jarTop = cy - jarH * 0.5;
    const jarBottom = cy + jarH * 0.5;
    const jarLeft = cx - jarW;
    const jarRight = cx + jarW;

    // Draw jar — rounded top (dome), straight sides, flat bottom
    ctx.strokeStyle = "rgba(120, 160, 220, 0.3)";
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    // Left side
    ctx.moveTo(jarLeft, jarBottom);
    ctx.lineTo(jarLeft, jarTop + jarH * 0.2);
    // Dome
    ctx.quadraticCurveTo(jarLeft, jarTop - jarH * 0.1, cx, jarTop - jarH * 0.15);
    ctx.quadraticCurveTo(jarRight, jarTop - jarH * 0.1, jarRight, jarTop + jarH * 0.2);
    // Right side
    ctx.lineTo(jarRight, jarBottom);
    ctx.stroke();

    // Base/platform
    ctx.strokeStyle = "rgba(120, 160, 220, 0.4)";
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(jarLeft - 10 * scale, jarBottom);
    ctx.lineTo(jarRight + 10 * scale, jarBottom);
    ctx.stroke();

    // Glass reflection hints
    ctx.strokeStyle = "rgba(150, 200, 255, 0.06)";
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(jarLeft + 6 * scale, jarTop + jarH * 0.15);
    ctx.lineTo(jarLeft + 6 * scale, jarBottom - 10 * scale);
    ctx.stroke();

    // Draw edges
    for (const e of edges) {
      const pulse = 0.15 + 0.1 * Math.sin(frame * 0.06 + e.a * 2);
      ctx.strokeStyle = `rgba(80, 160, 220, ${pulse})`;
      ctx.lineWidth = 0.8 * scale;
      ctx.beginPath();
      ctx.moveTo(nodes[e.a].x, nodes[e.a].y);
      ctx.lineTo(nodes[e.b].x, nodes[e.b].y);
      ctx.stroke();
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const pulse = 0.4 + 0.4 * Math.sin(frame * 0.08 + n.phase);
      ctx.fillStyle = `rgba(100, 200, 255, ${pulse * 0.8})`;
      ctx.shadowColor = "rgba(100, 200, 255, 0.3)";
      ctx.shadowBlur = pulse * 4 * scale;
      ctx.beginPath();
      ctx.arc(n.x, n.y, (1.5 + pulse) * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Escapee signals — travel outward then dissipate at jar wall
    for (const esc of escapees) {
      const elapsed = frame - esc.startFrame;
      if (elapsed < 0) continue;

      const origin = nodes[esc.nodeIdx];
      const dx = Math.cos(esc.angle) * esc.speed * elapsed;
      const dy = Math.sin(esc.angle) * esc.speed * elapsed;
      const px = origin.x + dx;
      const py = origin.y + dy;

      // Check if outside jar bounds (approximate)
      const inJarX = px > jarLeft + 5 * scale && px < jarRight - 5 * scale;
      const inJarY = py > jarTop - jarH * 0.1 && py < jarBottom - 2 * scale;
      // Distance from center for dome check
      const dFromCenter = Math.abs(px - cx);
      const topAllowed = jarTop + jarH * 0.2 - (1 - (dFromCenter / jarW)) * jarH * 0.35;
      const inDome = py > topAllowed;
      const inside = inJarX && inJarY && inDome;

      if (inside) {
        // Still traveling
        ctx.fillStyle = "rgba(255, 180, 60, 0.7)";
        ctx.shadowColor = "#ffaa33";
        ctx.shadowBlur = 4 * scale;
        ctx.beginPath();
        ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Hit the wall — dissipation ring
        const hitAge = elapsed;
        const dissipateA = interpolate(hitAge, [0, 15], [0.5, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        // Clamp to jar boundary
        const wallX = Math.max(jarLeft + 3 * scale, Math.min(jarRight - 3 * scale, px));
        const wallY = Math.max(jarTop - jarH * 0.1, Math.min(jarBottom - 3 * scale, py));

        if (dissipateA > 0) {
          ctx.strokeStyle = `rgba(255, 140, 40, ${dissipateA})`;
          ctx.lineWidth = 1 * scale;
          const ringR = (3 + elapsed * 0.3) * scale;
          ctx.beginPath();
          ctx.arc(wallX, wallY, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // "NO BODY" text fading in at bottom
    const noBodyIn = interpolate(frame, [90, 110], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    if (noBodyIn > 0) {
      ctx.fillStyle = `rgba(180, 140, 160, ${noBodyIn * 0.5})`;
      ctx.font = `${9 * scale}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("signals go nowhere", cx, jarBottom + 20 * scale);
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
