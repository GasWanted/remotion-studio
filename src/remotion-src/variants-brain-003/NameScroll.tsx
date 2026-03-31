import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE } from "../scenes/theme";
import { drawPerson } from "./icons";

// Variant 6: Terminal scrolling names with person icons appearing beside them
export const NameScroll: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(3006);
    const particles = makeParticles(20, width, height, scale);
    // Generate placeholder researcher entries
    const prefixes = ["Dr.", "Prof.", "Dr.", "Prof.", "Dr.", ""];
    const firsts = ["S. Chen", "A. Patel", "M. Weber", "L. Kim", "J. Okafor", "R. Silva", "N. Tanaka", "E. Berg", "K. Müller", "P. Gupta",
      "T. Ivanov", "C. López", "H. Yamamoto", "D. Russo", "F. Andersen", "B. Zhao", "V. Kaur", "W. Schmidt", "I. Bianchi", "G. Fernandez",
      "O. Johansson", "U. Kowalski", "X. Li", "Y. Takahashi", "Z. Ahmad"];
    const institutions = ["Princeton", "Cambridge", "Janelia", "MPI", "ETH", "MIT", "Caltech", "Oxford", "HHMI", "Stanford"];
    const entries: { name: string; inst: string; hue: number }[] = [];
    for (let i = 0; i < 50; i++) {
      entries.push({
        name: `${prefixes[Math.floor(rand() * prefixes.length)]} ${firsts[Math.floor(rand() * firsts.length)]}`,
        inst: institutions[Math.floor(rand() * institutions.length)],
        hue: PALETTE.cellColors[Math.floor(rand() * PALETTE.cellColors.length)][0],
      });
    }
    return { particles, entries };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, data.particles, frame, scale);

    // Title
    ctx.globalAlpha = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${20 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("2024", width / 2, height * 0.1);

    // Terminal box
    const termX = width * 0.1, termY = height * 0.18;
    const termW = width * 0.8, termH = height * 0.68;
    ctx.fillStyle = `rgba(12, 10, 18, 0.7)`;
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = `hsla(180, 30%, 35%, 0.3)`;
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(termX, termY, termW, termH);

    // Scrolling entries
    ctx.save();
    ctx.beginPath();
    ctx.rect(termX + 2, termY + 2, termW - 4, termH - 4);
    ctx.clip();

    const lineH = 22 * scale;
    const scrollSpeed = 0.7;
    const scrollOffset = frame * scrollSpeed * scale;
    const startLine = Math.floor(scrollOffset / lineH);

    for (let i = 0; i < 20; i++) {
      const entryIdx = (startLine + i) % data.entries.length;
      const entry = data.entries[entryIdx];
      const y = termY + 15 * scale + i * lineH - (scrollOffset % lineH);
      if (y < termY - lineH || y > termY + termH + lineH) continue;

      ctx.globalAlpha = 1;
      // Person icon
      drawPerson(ctx, termX + 18 * scale, y, 7 * scale, `hsla(${entry.hue}, 50%, 60%, 0.8)`);

      // Name
      ctx.fillStyle = `hsla(${entry.hue}, 45%, 65%, 0.85)`;
      ctx.font = `${11 * scale}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(entry.name, termX + 30 * scale, y + 3 * scale);

      // Institution
      ctx.fillStyle = PALETTE.text.dim;
      ctx.fillText(`— ${entry.inst}`, termX + 30 * scale + ctx.measureText(entry.name).width + 8 * scale, y + 3 * scale);
    }
    ctx.restore();

    // Counter at bottom
    ctx.globalAlpha = 1;
    const count = Math.min(200, Math.floor(interpolate(frame, [5, 80], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${14 * scale}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(`${count}+ researchers`, width / 2, height * 0.93);

    const fadeOut = interpolate(frame, [130, 148], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (fadeOut < 1) {
      ctx.fillStyle = `rgba(21,16,29,${1 - fadeOut})`;
      ctx.fillRect(0, 0, width, height);
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
