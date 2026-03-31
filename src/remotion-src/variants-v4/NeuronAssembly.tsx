import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { VariantProps } from "../types";

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export const NeuronAssembly: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(606);
    // Start as flat colored blobs
    const numBlobs = 12;
    const blobs: {
      startX: number;
      startY: number;
      color: string;
      hue: number;
    }[] = [];
    for (let i = 0; i < numBlobs; i++) {
      const hue = Math.floor(rand() * 360);
      blobs.push({
        startX: 0.15 + rand() * 0.7,
        startY: 0.2 + rand() * 0.6,
        color: `hsl(${hue}, 70%, 55%)`,
        hue,
      });
    }

    // Neuron branches (target shape)
    const branches: { x1: number; y1: number; x2: number; y2: number; thickness: number; hue: number }[] = [];
    // Soma
    const somaX = 0.5;
    const somaY = 0.45;

    // Dendrites going up and to sides
    const dendrites = [
      { dx: -0.15, dy: -0.25 },
      { dx: 0.12, dy: -0.28 },
      { dx: -0.08, dy: -0.3 },
      { dx: 0.18, dy: -0.2 },
      { dx: -0.22, dy: -0.15 },
      { dx: 0.05, dy: -0.32 },
    ];
    for (const d of dendrites) {
      const midX = somaX + d.dx * 0.4;
      const midY = somaY + d.dy * 0.4;
      branches.push({ x1: somaX, y1: somaY, x2: midX, y2: midY, thickness: 3, hue: 200 + rand() * 60 });
      branches.push({ x1: midX, y1: midY, x2: somaX + d.dx, y2: somaY + d.dy, thickness: 1.5, hue: 200 + rand() * 60 });
      // Sub-branches
      for (let j = 0; j < 2; j++) {
        branches.push({
          x1: somaX + d.dx * (0.6 + rand() * 0.3),
          y1: somaY + d.dy * (0.6 + rand() * 0.3),
          x2: somaX + d.dx + (rand() - 0.5) * 0.1,
          y2: somaY + d.dy + (rand() - 0.5) * 0.08,
          thickness: 0.8,
          hue: 200 + rand() * 60,
        });
      }
    }

    // Axon going down
    branches.push({ x1: somaX, y1: somaY, x2: somaX + 0.02, y2: somaY + 0.2, thickness: 3.5, hue: 30 });
    branches.push({ x1: somaX + 0.02, y1: somaY + 0.2, x2: somaX - 0.05, y2: somaY + 0.35, thickness: 2.5, hue: 30 });
    // Axon terminals
    for (let i = 0; i < 4; i++) {
      branches.push({
        x1: somaX - 0.05 + rand() * 0.02,
        y1: somaY + 0.32 + rand() * 0.05,
        x2: somaX - 0.1 + rand() * 0.12,
        y2: somaY + 0.38 + rand() * 0.08,
        thickness: 1,
        hue: 30,
      });
    }

    return { blobs, branches, somaX, somaY };
  }, []);

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    // Morph: 0 = flat blobs, 1 = neuron shape
    const morphT = interpolate(frame, [15, 100], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });

    // Phase 1: Show flat blobs fading out
    const blobAlpha = interpolate(morphT, [0, 0.5], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (blobAlpha > 0) {
      for (const b of data.blobs) {
        const bx = b.startX * width;
        const by = b.startY * height;
        ctx.globalAlpha = fadeOut * blobAlpha;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.ellipse(bx, by, 20 * scale, 15 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Phase 2: Neuron branches growing in
    const branchAlpha = interpolate(morphT, [0.2, 0.6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const branchGrowth = interpolate(morphT, [0.2, 0.9], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    if (branchAlpha > 0) {
      ctx.globalAlpha = fadeOut * branchAlpha;

      // Soma
      const sx = data.somaX * width;
      const sy = data.somaY * height;
      const somaR = 10 * scale * branchGrowth;
      ctx.fillStyle = "rgba(100, 200, 255, 0.8)";
      ctx.beginPath();
      ctx.arc(sx, sy, somaR, 0, Math.PI * 2);
      ctx.fill();

      // Glow on soma
      ctx.fillStyle = "rgba(100, 200, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(sx, sy, somaR * 2, 0, Math.PI * 2);
      ctx.fill();

      // Branches
      const branchesShown = Math.floor(branchGrowth * data.branches.length);
      for (let i = 0; i < branchesShown; i++) {
        const br = data.branches[i];
        const x1 = br.x1 * width;
        const y1 = br.y1 * height;
        const x2 = br.x2 * width;
        const y2 = br.y2 * height;

        ctx.strokeStyle = `hsla(${br.hue}, 70%, 60%, ${0.7 * branchAlpha})`;
        ctx.lineWidth = br.thickness * scale;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Small terminal dot
        if (br.thickness < 2) {
          ctx.fillStyle = `hsla(${br.hue}, 70%, 70%, ${0.5 * branchAlpha})`;
          ctx.beginPath();
          ctx.arc(x2, y2, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3D depth effect — subtle shadow offset after morph
    if (morphT > 0.7) {
      const depthAlpha = interpolate(morphT, [0.7, 1], [0, 0.15], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      ctx.globalAlpha = fadeOut * depthAlpha;
      const sx = data.somaX * width + 3 * scale;
      const sy = data.somaY * height + 3 * scale;
      ctx.fillStyle = "rgba(100, 200, 255, 1)";
      ctx.beginPath();
      ctx.arc(sx, sy, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
