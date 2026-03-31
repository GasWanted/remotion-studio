import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import {
  drawKurzBackground, drawKurzBlob, drawKurzEyes, drawKurzConnection,
  drawKurzGlow, makeKurzMotes, drawKurzMotes, KurzBlobStyle,
} from "../../kurz";

/**
 * Hook-01 — "Evolution spent fifty million years wiring this brain."
 *
 * Starts with ONE neuron. It divides. 1 → 2 → 4 → 8 → ...
 * Exponential growth fills the screen with a connectome.
 * Year counter in corner accelerates through geological time.
 * Gold/amber tint — something forged by deep time.
 */

function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface CellDef {
  x: number; y: number;
  rx: number; ry: number;
  hue: number; sat: number; lit: number;
  blobSeed: number;
  wobblePhase: number;
  generation: number; // 0 = first cell, 1 = its children, etc.
  parentIdx: number;  // which cell it split from (-1 for root)
}

export const Scene001Kurz: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;

  const data = useMemo(() => {
    const rand = seeded(42);
    const cx = width / 2, cy = height / 2;

    // Build a tree of cells that "divide" from a single ancestor
    const cells: CellDef[] = [];

    // Generation 0: the first cell, center screen
    cells.push({
      x: cx, y: cy,
      rx: 22 * scale, ry: 18 * scale,
      hue: 40, sat: 60, lit: 60, // warm gold — the original
      blobSeed: 100,
      wobblePhase: 0,
      generation: 0,
      parentIdx: -1,
    });

    // Each generation: children sprout from existing cells
    // Gen 1: 2 children from cell 0
    // Gen 2: 4 children (2 from each gen 1)
    // Gen 3: 8 children
    // Gen 4: ~12 children (not all divide — space runs out)
    // Gen 5: ~15 smaller background cells
    // Total: ~42 cells

    const goldHues = [35, 40, 45, 30, 50, 25, 55]; // warm amber palette

    function addChildren(parentIdx: number, count: number, gen: number, spreadRadius: number, cellSize: number) {
      const parent = cells[parentIdx];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + rand() * 0.8 + gen * 0.5;
        const dist = spreadRadius * (0.7 + rand() * 0.6);
        const sizeVar = 0.7 + rand() * 0.6;
        cells.push({
          x: parent.x + Math.cos(angle) * dist * scale,
          y: parent.y + Math.sin(angle) * dist * scale * 0.8,
          rx: cellSize * sizeVar * scale,
          ry: cellSize * sizeVar * scale * (0.8 + rand() * 0.15),
          hue: goldHues[Math.floor(rand() * goldHues.length)],
          sat: 50 + rand() * 20 - gen * 3,
          lit: 55 + rand() * 12 - gen * 2,
          blobSeed: Math.floor(rand() * 10000),
          wobblePhase: rand() * Math.PI * 2,
          generation: gen,
          parentIdx: parentIdx,
        });
      }
    }

    // Gen 1: 2 from root
    addChildren(0, 2, 1, 45, 18);
    // Gen 2: 2 from each gen 1 cell
    addChildren(1, 2, 2, 40, 14);
    addChildren(2, 2, 2, 40, 14);
    // Gen 3: 2 from each gen 2
    for (let i = 3; i <= 6; i++) addChildren(i, 2, 3, 35, 11);
    // Gen 4: 1-2 from some gen 3 cells
    for (let i = 7; i <= 14; i++) {
      if (rand() < 0.7) addChildren(i, 1 + Math.floor(rand() * 2), 4, 30, 8);
    }
    // Gen 5: tiny background cells from gen 4
    const gen4Start = 15;
    for (let i = gen4Start; i < cells.length && i < gen4Start + 10; i++) {
      if (rand() < 0.5) addChildren(i, 1 + Math.floor(rand() * 2), 5, 25, 5);
    }

    // Build connection list (each child connected to parent)
    const connections: { from: number; to: number }[] = [];
    for (let i = 1; i < cells.length; i++) {
      connections.push({ from: cells[i].parentIdx, to: i });
    }

    // Also add some lateral connections between same-generation siblings
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        if (cells[i].generation === cells[j].generation && cells[i].generation >= 2) {
          const dx = cells[i].x - cells[j].x, dy = cells[i].y - cells[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 60 * scale && rand() < 0.15) {
            connections.push({ from: i, to: j });
          }
        }
      }
    }

    const motes = makeKurzMotes(35, width, height, scale, 77);

    return { cells, connections, motes, cx, cy };
  }, [width, height, scale]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const totalFrames = 150;
    const fadeOut = interpolate(frame, [132, 148], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });

    // --- Background ---
    drawKurzBackground(ctx, width, height, frame);
    drawKurzMotes(ctx, data.motes, frame, scale);

    // --- Growth timing: exponential reveal ---
    // Frame 5: cell 0 appears
    // By frame 120: all cells visible
    // The key: early cells appear slowly (dramatic), later cells appear fast (exponential acceleration)
    const growthT = interpolate(frame, [5, 120], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    // Exponential curve: slow start, explosive end
    const visibleCount = Math.max(1, Math.floor(Math.pow(growthT, 2.5) * data.cells.length));

    ctx.globalAlpha = fadeOut;

    // --- Draw connections (behind cells) ---
    for (const conn of data.connections) {
      // Connection appears when BOTH cells are visible
      if (conn.from >= visibleCount || conn.to >= visibleCount) continue;
      const youngerIdx = Math.max(conn.from, conn.to);
      const age = visibleCount - youngerIdx;
      const connAlpha = Math.min(1, age / 4);

      const from = data.cells[conn.from], to = data.cells[conn.to];
      const avgHue = (from.hue + to.hue) / 2;
      const thickness = Math.max(1.5, (5 - from.generation * 0.5)) * scale;

      drawKurzConnection(
        ctx, from.x, from.y, to.x, to.y,
        thickness, avgHue, 45, 50,
        connAlpha * fadeOut * 0.8,
        frame * 0.02 + conn.from * 0.7
      );
    }

    // --- Draw cells (back-to-front: higher generation = further back visually) ---
    // Sort: high generation first (small/back), low generation last (big/front)
    const drawOrder = Array.from({ length: Math.min(visibleCount, data.cells.length) }, (_, i) => i);
    drawOrder.sort((a, b) => data.cells[b].generation - data.cells[a].generation);

    for (const i of drawOrder) {
      const cell = data.cells[i];
      const cellIdx = i; // position in appearance order
      const age = visibleCount - cellIdx;
      if (age <= 0) continue;

      // Arrival: pop in with bounce
      const rawArrival = Math.min(1, age / 6);
      const arrival = rawArrival < 0.6
        ? (rawArrival / 0.6) * 1.15
        : rawArrival < 0.85
          ? 1.15 - ((rawArrival - 0.6) / 0.25) * 0.15
          : 1.0;

      // Wobble
      const wobble = Math.sin(frame * 0.025 + cell.wobblePhase) * 0.05;
      const rx = cell.rx * arrival * (1 + wobble);
      const ry = cell.ry * arrival * (1 - wobble * 0.3);
      if (rx < 0.5 || ry < 0.5) continue;

      // Outline gets thinner for smaller/further cells
      const outlineW = Math.max(1, (3 - cell.generation * 0.4)) * scale;

      const style: KurzBlobStyle = {
        hue: cell.hue,
        sat: cell.sat,
        lit: cell.lit,
        outlineWidth: outlineW,
        outlineColor: `hsla(${cell.hue}, ${cell.sat}%, ${Math.max(10, cell.lit - 35)}%, 0.65)`,
      };

      // Glow
      drawKurzGlow(ctx, cell.x, cell.y, rx, ry, cell.hue, cell.sat, cell.lit, 0.08 * arrival);

      // Blob body
      drawKurzBlob(ctx, cell.x, cell.y, rx, ry, style, fadeOut * arrival, cell.blobSeed);

      // Eyes: only on gen 0-2 cells (the big visible ones)
      if (cell.generation <= 2 && rx > 8 * scale && arrival > 0.7) {
        drawKurzEyes(
          ctx, cell.x, cell.y, rx, ry,
          fadeOut * arrival,
          outlineW * 0.7,
          style.outlineColor
        );
      }
    }

    ctx.globalAlpha = 1;

    // --- Year counter overlay ---
    const counterFadeIn = interpolate(frame, [8, 25], [0, 1], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const counterFadeOut = interpolate(frame, [130, 145], [1, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    });
    const counterAlpha = counterFadeIn * counterFadeOut;
    if (counterAlpha > 0) {
      const yearT = interpolate(frame, [8, 125], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      const years = Math.floor(1000 * Math.pow(50000, yearT));
      const yearText = Math.min(years, 50_000_000).toLocaleString("en-US");

      ctx.globalAlpha = counterAlpha;

      // Counter background pill
      const counterX = width - 60 * scale;
      const counterY = 30 * scale;
      ctx.fillStyle = "rgba(15, 10, 25, 0.4)";
      const pillW = (yearText.length * 11 + 70) * scale;
      const pillH = 28 * scale;
      const pillR = pillH / 2;
      ctx.beginPath();
      ctx.moveTo(counterX - pillW + pillR, counterY);
      ctx.lineTo(counterX - pillR, counterY);
      ctx.arc(counterX - pillR, counterY + pillR, pillR, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(counterX - pillW + pillR, counterY + pillH);
      ctx.arc(counterX - pillW + pillR, counterY + pillR, pillR, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      // Year number
      ctx.fillStyle = `hsla(40, 65%, 75%, 0.9)`;
      ctx.font = `bold ${18 * scale}px system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.fillText(yearText, counterX - 12 * scale, counterY + 19 * scale);

      // "years" label
      ctx.fillStyle = `hsla(40, 50%, 65%, 0.5)`;
      ctx.font = `${10 * scale}px system-ui, sans-serif`;
      ctx.fillText("years", counterX - (yearText.length * 11 + 16) * scale, counterY + 19 * scale);

      ctx.globalAlpha = 1;
    }
  });

  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};
