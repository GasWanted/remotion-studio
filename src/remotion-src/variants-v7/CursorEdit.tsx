import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantProps } from "../types";

// A sparse matrix of weight numbers. Cursor clicks, changes values. Simple, anticlimactic.
function seeded(s: number) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

interface CellData {
  row: number;
  col: number;
  original: string;
  edited: string;
  editFrame: number;
}

export const CursorEdit: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const S = Math.min(width, height) / 360;

  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const grid = useMemo(() => {
    const rand = seeded(55);
    const rows = 8;
    const cols = 6;
    const cells: { value: string; row: number; col: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Most cells empty (sparse), some have weights
        if (rand() > 0.35) {
          cells.push({ value: "·", row: r, col: c });
        } else {
          const v = (rand() * 8 - 2).toFixed(1);
          cells.push({ value: v, row: r, col: c });
        }
      }
    }
    // Specific edits to perform
    const edits: CellData[] = [
      { row: 2, col: 3, original: "4.2", edited: "0.1", editFrame: 40 },
      { row: 5, col: 1, original: "3.7", edited: "0.0", editFrame: 70 },
      { row: 3, col: 4, original: "2.9", edited: "0.3", editFrame: 95 },
    ];
    // Make sure those cells have the original values
    for (const edit of edits) {
      const idx = cells.findIndex(c => c.row === edit.row && c.col === edit.col);
      if (idx >= 0) cells[idx].value = edit.original;
    }
    return { cells, rows, cols, edits };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = fadeOut;

    const { cells, rows, cols, edits } = grid;
    const cellW = (width - 60 * S) / cols;
    const cellH = (height - 60 * S) / rows;
    const offsetX = 30 * S;
    const offsetY = 25 * S;

    const fontSize = Math.min(13 * S, cellW * 0.35);
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Grid lines (very subtle)
    ctx.strokeStyle = "rgba(40,45,60,0.3)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + r * cellH);
      ctx.lineTo(offsetX + cols * cellW, offsetY + r * cellH);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + c * cellW, offsetY);
      ctx.lineTo(offsetX + c * cellW, offsetY + rows * cellH);
      ctx.stroke();
    }

    // Build edit state map
    const editMap = new Map<string, CellData>();
    for (const e of edits) {
      editMap.set(`${e.row},${e.col}`, e);
    }

    // Draw cell values
    for (const cell of cells) {
      const cx = offsetX + cell.col * cellW + cellW / 2;
      const cy = offsetY + cell.row * cellH + cellH / 2;
      const key = `${cell.row},${cell.col}`;
      const edit = editMap.get(key);

      if (edit && frame >= edit.editFrame) {
        // After edit: show new value in cyan
        const flash = Math.max(0, 1 - (frame - edit.editFrame) / 20);
        if (flash > 0) {
          ctx.fillStyle = `rgba(80,255,180,${flash * 0.15})`;
          ctx.fillRect(
            offsetX + cell.col * cellW + 1,
            offsetY + cell.row * cellH + 1,
            cellW - 2,
            cellH - 2
          );
        }
        ctx.fillStyle = `rgba(80,255,180,${0.9 - flash * 0.2})`;
        ctx.fillText(edit.edited, cx, cy);
      } else if (cell.value === "·") {
        ctx.fillStyle = "rgba(50,55,70,0.4)";
        ctx.fillText("·", cx, cy);
      } else {
        ctx.fillStyle = "rgba(160,170,200,0.6)";
        ctx.fillText(cell.value, cx, cy);
      }
    }

    // Draw cursor
    // Find which edit the cursor is heading to
    let cursorTarget: CellData | null = null;
    for (const edit of edits) {
      if (frame < edit.editFrame + 10) {
        cursorTarget = edit;
        break;
      }
    }

    if (cursorTarget && frame >= 20) {
      const targetX = offsetX + cursorTarget.col * cellW + cellW / 2;
      const targetY = offsetY + cursorTarget.row * cellH + cellH / 2;

      // Cursor approaches
      const moveStart = cursorTarget.editFrame - 20;
      const moveEnd = cursorTarget.editFrame - 2;
      const startX = offsetX - 20 * S;
      const startY = offsetY - 10 * S;

      const curX = interpolate(frame, [moveStart, moveEnd], [startX, targetX], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });
      const curY = interpolate(frame, [moveStart, moveEnd], [startY, targetY], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      });

      // Draw cursor arrow
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.moveTo(curX, curY);
      ctx.lineTo(curX, curY + 14 * S);
      ctx.lineTo(curX + 4 * S, curY + 10 * S);
      ctx.lineTo(curX + 9 * S, curY + 10 * S);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Click flash
      if (frame >= cursorTarget.editFrame && frame < cursorTarget.editFrame + 4) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1.5 * S;
        const r = (frame - cursorTarget.editFrame) * 5 * S;
        ctx.beginPath();
        ctx.arc(targetX, targetY, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Header label
    ctx.fillStyle = "rgba(120,130,160,0.4)";
    ctx.font = `${9 * S}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("weight_matrix.dat", offsetX, 8 * S);
  });

  return (
    <div style={{ width, height, backgroundColor: "#0a0a0f" }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
