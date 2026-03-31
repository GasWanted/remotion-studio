import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { VariantDef, VariantProps } from "../types";
import { seeded, drawBg, makeParticles, drawParticles, PALETTE, fadeInOut } from "../scenes/theme";

// Shot 19 — "Now you have twenty-one million flat images."
// 120 frames (4s). Grid of EM images tiling the screen.

/* ── V1: Mosaic Grid ── */
const V1: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19001);
    const cols = 12;
    const rows = 7;
    const tiles: { gray: number; blobX: number; blobY: number; blobR: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tiles.push({
          gray: 20 + rand() * 30,
          blobX: 0.2 + rand() * 0.6,
          blobY: 0.2 + rand() * 0.6,
          blobR: 0.1 + rand() * 0.2,
          delay: (r + c) * 0.8 + rand() * 3,
        });
      }
    }
    return { tiles, cols, rows };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const margin = 8 * scale;
    const gap = 1.5 * scale;
    const tileW = (width - 2 * margin - (data.cols - 1) * gap) / data.cols;
    const tileH = (height - 2 * margin - (data.rows - 1) * gap) / data.rows;

    for (let idx = 0; idx < data.tiles.length; idx++) {
      const tile = data.tiles[idx];
      const col = idx % data.cols;
      const row = Math.floor(idx / data.cols);
      const tileAppear = interpolate(frame, [5 + tile.delay, 10 + tile.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (tileAppear <= 0) continue;

      const tx = margin + col * (tileW + gap);
      const ty = margin + row * (tileH + gap);
      ctx.globalAlpha = fadeAlpha * tileAppear;

      // Tile background
      ctx.fillStyle = `hsl(0, 0%, ${tile.gray}%)`;
      ctx.fillRect(tx, ty, tileW, tileH);

      // Internal blob (neuron cross-section hint)
      ctx.fillStyle = `hsla(0, 0%, ${tile.gray + 12}%, 0.5)`;
      ctx.beginPath();
      ctx.arc(tx + tile.blobX * tileW, ty + tile.blobY * tileH, tile.blobR * Math.min(tileW, tileH), 0, Math.PI * 2);
      ctx.fill();

      // Grid line
      ctx.strokeStyle = `hsla(0, 0%, 40%, 0.15)`;
      ctx.lineWidth = 0.5 * scale;
      ctx.strokeRect(tx, ty, tileW, tileH);
    }

    // Counter overlay
    ctx.globalAlpha = fadeAlpha;
    const counterVal = Math.floor(interpolate(frame, [10, 100], [0, 21000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.fillRect(width * 0.6, height * 0.88, width * 0.36, 18 * scale);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `bold ${10 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${counterVal.toLocaleString()} images`, width * 0.94, height * 0.88 + 13 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V2: Stack Fan-Out ── */
const V2: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19002);
    const cards: { tx: number; ty: number; angle: number; gray: number; delay: number }[] = [];
    for (let i = 0; i < 40; i++) {
      cards.push({
        tx: width * (0.05 + rand() * 0.9),
        ty: height * (0.05 + rand() * 0.9),
        angle: (rand() - 0.5) * 0.3,
        gray: 22 + rand() * 28,
        delay: i * 1.5 + rand() * 5,
      });
    }
    return { cards };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const cx = width / 2;
    const cy = height / 2;
    const cardW = 28 * scale;
    const cardH = 22 * scale;

    for (const card of data.cards) {
      const fanProgress = interpolate(frame, [8 + card.delay, 25 + card.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (fanProgress <= 0) continue;
      const eased = fanProgress * fanProgress * (3 - 2 * fanProgress);

      const x = cx + (card.tx - cx) * eased;
      const y = cy + (card.ty - cy) * eased;
      const angle = card.angle * eased;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = fadeAlpha * fanProgress;

      // Card shadow
      ctx.fillStyle = "hsla(0, 0%, 0%, 0.2)";
      ctx.fillRect(-cardW / 2 + 2 * scale, -cardH / 2 + 2 * scale, cardW, cardH);

      // Card face
      ctx.fillStyle = `hsl(0, 0%, ${card.gray}%)`;
      ctx.fillRect(-cardW / 2, -cardH / 2, cardW, cardH);
      ctx.strokeStyle = "hsla(0, 0%, 55%, 0.3)";
      ctx.lineWidth = 0.6 * scale;
      ctx.strokeRect(-cardW / 2, -cardH / 2, cardW, cardH);

      // Tiny internal marks
      ctx.fillStyle = `hsla(0, 0%, ${card.gray + 15}%, 0.4)`;
      ctx.beginPath();
      ctx.arc(0, 0, cardW * 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Stack in center (cards remaining)
    ctx.globalAlpha = fadeAlpha;
    const stackProgress = interpolate(frame, [5, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const stackRemaining = Math.max(0, 1 - stackProgress);
    if (stackRemaining > 0.05) {
      const stackThickness = stackRemaining * 15 * scale;
      for (let i = 0; i < Math.ceil(stackRemaining * 8); i++) {
        const offset = i * 1.5 * scale;
        ctx.fillStyle = `hsla(0, 0%, ${30 - i * 2}%, 0.6)`;
        ctx.fillRect(cx - cardW / 2 - offset, cy - cardH / 2 - offset, cardW, cardH);
      }
    }

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("21 million images", width / 2, height * 0.94);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V3: Wall of Thumbnails ── */
const V3: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19003);
    const thumbs: { gray: number; circles: { cx: number; cy: number; r: number }[] }[] = [];
    for (let i = 0; i < 120; i++) {
      const circles: { cx: number; cy: number; r: number }[] = [];
      const numC = 2 + Math.floor(rand() * 4);
      for (let c = 0; c < numC; c++) {
        circles.push({ cx: rand(), cy: rand(), r: 0.08 + rand() * 0.15 });
      }
      thumbs.push({ gray: 18 + rand() * 30, circles });
    }
    return { thumbs };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const thumbSize = 18 * scale;
    const gap = 2 * scale;
    const cols = Math.floor(width / (thumbSize + gap));
    const rows = Math.floor(height / (thumbSize + gap));
    const totalSlots = cols * rows;

    // Fill like text: left-to-right, top-to-bottom
    const fillProgress = interpolate(frame, [5, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const visibleCount = Math.floor(fillProgress * totalSlots);

    const offsetX = (width - cols * (thumbSize + gap) + gap) / 2;
    const offsetY = (height - rows * (thumbSize + gap) + gap) / 2;

    for (let i = 0; i < Math.min(visibleCount, data.thumbs.length, totalSlots); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const tx = offsetX + col * (thumbSize + gap);
      const ty = offsetY + row * (thumbSize + gap);
      const thumb = data.thumbs[i % data.thumbs.length];

      ctx.fillStyle = `hsl(0, 0%, ${thumb.gray}%)`;
      ctx.fillRect(tx, ty, thumbSize, thumbSize);

      // Internal circles
      for (const circ of thumb.circles) {
        ctx.fillStyle = `hsla(0, 0%, ${thumb.gray + 12}%, 0.4)`;
        ctx.beginPath();
        ctx.arc(tx + circ.cx * thumbSize, ty + circ.cy * thumbSize, circ.r * thumbSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Counter in corner
    ctx.fillStyle = "hsla(0, 0%, 0%, 0.6)";
    ctx.fillRect(width - 90 * scale, 5 * scale, 85 * scale, 16 * scale);
    ctx.fillStyle = PALETTE.text.accent;
    ctx.font = `${8 * scale}px monospace`;
    ctx.textAlign = "right";
    ctx.fillText(`${visibleCount} / ${totalSlots}+`, width - 8 * scale, 17 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V4: Infinite Scroll ── */
const V4: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19004);
    const rows: { grays: number[]; offsets: number[] }[] = [];
    for (let r = 0; r < 20; r++) {
      const cols = 10;
      const grays: number[] = [];
      const offsets: number[] = [];
      for (let c = 0; c < cols; c++) {
        grays.push(18 + rand() * 30);
        offsets.push(rand() * 30);
      }
      rows.push({ grays, offsets });
    }
    return { rows };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const thumbSize = 24 * scale;
    const gap = 3 * scale;
    const scrollSpeed = interpolate(frame, [5, 115], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const scrollY = scrollSpeed * height * 1.5;

    for (let ri = 0; ri < data.rows.length; ri++) {
      const row = data.rows[ri];
      const rowY = ri * (thumbSize + gap) - scrollY;
      // Wrap vertically
      const wrappedY = ((rowY % (data.rows.length * (thumbSize + gap))) + data.rows.length * (thumbSize + gap)) % (data.rows.length * (thumbSize + gap));
      if (wrappedY < -thumbSize || wrappedY > height + thumbSize) continue;

      for (let ci = 0; ci < row.grays.length; ci++) {
        const tx = ci * (thumbSize + gap) + gap;
        ctx.fillStyle = `hsl(0, 0%, ${row.grays[ci]}%)`;
        ctx.fillRect(tx, wrappedY, thumbSize, thumbSize);
        // Mini detail
        ctx.fillStyle = `hsla(0, 0%, ${row.grays[ci] + 10}%, 0.3)`;
        ctx.beginPath();
        ctx.arc(tx + thumbSize / 2, wrappedY + thumbSize / 2, thumbSize * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Fade edges (top and bottom)
    const fadeH = 30 * scale;
    const topFade = ctx.createLinearGradient(0, 0, 0, fadeH);
    topFade.addColorStop(0, PALETTE.bg.edge);
    topFade.addColorStop(1, "rgba(21,16,29,0)");
    ctx.fillStyle = topFade;
    ctx.fillRect(0, 0, width, fadeH);
    const botFade = ctx.createLinearGradient(0, height - fadeH, 0, height);
    botFade.addColorStop(0, "rgba(21,16,29,0)");
    botFade.addColorStop(1, PALETTE.bg.edge);
    ctx.fillStyle = botFade;
    ctx.fillRect(0, height - fadeH, width, fadeH);

    // Scroll indicator
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("\u2193 21,000,000 images \u2193", width / 2, height * 0.95);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V5: Filmstrip Grid ── */
const V5: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19005);
    const strips: { y: number; speed: number; direction: number; grays: number[] }[] = [];
    const stripCount = 8;
    for (let i = 0; i < stripCount; i++) {
      const grays: number[] = [];
      for (let j = 0; j < 20; j++) grays.push(18 + rand() * 30);
      strips.push({
        y: height * (i + 0.5) / stripCount,
        speed: 0.3 + rand() * 0.7,
        direction: i % 2 === 0 ? 1 : -1,
        grays,
      });
    }
    return { strips };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const frameSize = 22 * scale;
    const frameGap = 4 * scale;
    const stripH = frameSize + 8 * scale;
    const sprocketR = 1.5 * scale;

    for (const strip of data.strips) {
      const scrollOffset = frame * strip.speed * strip.direction * 1.5 * scale;
      const topY = strip.y - stripH / 2;

      // Strip background
      ctx.fillStyle = "hsla(30, 15%, 12%, 0.5)";
      ctx.fillRect(0, topY, width, stripH);

      // Frames
      for (let i = 0; i < strip.grays.length; i++) {
        let fx = i * (frameSize + frameGap) + scrollOffset;
        // Wrap
        const totalLen = strip.grays.length * (frameSize + frameGap);
        fx = ((fx % totalLen) + totalLen) % totalLen - frameSize;
        if (fx > width + frameSize || fx < -frameSize * 2) continue;

        ctx.fillStyle = `hsl(0, 0%, ${strip.grays[i]}%)`;
        ctx.fillRect(fx, topY + 4 * scale, frameSize, frameSize);

        // Sprocket holes
        ctx.fillStyle = "hsla(0, 0%, 8%, 0.5)";
        ctx.beginPath();
        ctx.arc(fx + frameSize / 2, topY + 2 * scale, sprocketR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(fx + frameSize / 2, topY + stripH - 2 * scale, sprocketR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Center label
    ctx.fillStyle = "hsla(0, 0%, 0%, 0.5)";
    ctx.fillRect(width * 0.25, height * 0.46, width * 0.5, 16 * scale);
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("21 million flat images", width / 2, height * 0.46 + 12 * scale);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V6: Tiling from Center ── */
const V6: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19006);
    const tileSize = 24 * scale;
    const gap = 2 * scale;
    const step = tileSize + gap;
    const cx = width / 2;
    const cy = height / 2;
    // Generate tiles in expanding rings from center
    const tiles: { x: number; y: number; ring: number; gray: number }[] = [];
    // Center tile
    tiles.push({ x: cx - tileSize / 2, y: cy - tileSize / 2, ring: 0, gray: 25 + rand() * 25 });
    // Expanding rings
    for (let ring = 1; ring <= 8; ring++) {
      for (let dx = -ring; dx <= ring; dx++) {
        for (let dy = -ring; dy <= ring; dy++) {
          if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;
          const tx = cx + dx * step - tileSize / 2;
          const ty = cy + dy * step - tileSize / 2;
          if (tx < -tileSize || tx > width || ty < -tileSize || ty > height) continue;
          tiles.push({ x: tx, y: ty, ring, gray: 18 + rand() * 30 });
        }
      }
    }
    return { tiles, tileSize };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const maxRing = 8;
    const ringProgress = interpolate(frame, [5, 95], [0, maxRing], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (const tile of data.tiles) {
      if (tile.ring > ringProgress) continue;
      const tileAlpha = interpolate(ringProgress - tile.ring, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      ctx.globalAlpha = fadeAlpha * tileAlpha;

      ctx.fillStyle = `hsl(0, 0%, ${tile.gray}%)`;
      ctx.fillRect(tile.x, tile.y, data.tileSize, data.tileSize);

      // Blob
      ctx.fillStyle = `hsla(0, 0%, ${tile.gray + 12}%, 0.4)`;
      ctx.beginPath();
      ctx.arc(tile.x + data.tileSize / 2, tile.y + data.tileSize / 2, data.tileSize * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Fresh glow
      if (ringProgress - tile.ring < 0.3 && ringProgress - tile.ring > 0) {
        const glowStrength = 1 - (ringProgress - tile.ring) / 0.3;
        ctx.fillStyle = `hsla(180, 60%, 70%, ${glowStrength * 0.2})`;
        ctx.fillRect(tile.x, tile.y, data.tileSize, data.tileSize);
      }
    }

    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${8 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("expanding outward...", width / 2, height * 0.94);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V7: Image Rain ── */
const V7: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19007);
    const drops: { x: number; speed: number; gray: number; delay: number; size: number }[] = [];
    for (let i = 0; i < 80; i++) {
      drops.push({
        x: rand() * width,
        speed: 1.5 + rand() * 2.5,
        gray: 18 + rand() * 30,
        delay: rand() * 50,
        size: (10 + rand() * 14) * scale,
      });
    }
    return { drops };
  }, [width, height, scale]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    // Accumulated wall height grows from bottom
    const wallProgress = interpolate(frame, [10, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const wallHeight = wallProgress * height * 0.85;
    const wallTop = height - wallHeight;

    // Draw accumulated wall
    if (wallHeight > 0) {
      const wallCols = Math.ceil(width / (14 * scale));
      const wallRows = Math.ceil(wallHeight / (11 * scale));
      const rand = seeded(19070);
      for (let r = 0; r < wallRows; r++) {
        for (let c = 0; c < wallCols; c++) {
          const gray = 18 + rand() * 30;
          const wx = c * 14 * scale;
          const wy = height - (r + 1) * 11 * scale;
          if (wy < wallTop) continue;
          ctx.fillStyle = `hsl(0, 0%, ${gray}%)`;
          ctx.fillRect(wx, wy, 13 * scale, 10 * scale);
        }
      }
    }

    // Falling drops
    for (const drop of data.drops) {
      const elapsed = Math.max(0, frame - drop.delay);
      if (elapsed <= 0) continue;
      const fallY = elapsed * drop.speed * 2 * scale;
      const currentY = fallY;
      if (currentY > wallTop) continue; // absorbed into wall

      ctx.fillStyle = `hsl(0, 0%, ${drop.gray}%)`;
      ctx.fillRect(drop.x - drop.size / 2, currentY, drop.size, drop.size * 0.8);
      // Slight glow
      ctx.fillStyle = `hsla(0, 0%, ${drop.gray + 20}%, 0.2)`;
      ctx.beginPath();
      ctx.arc(drop.x, currentY + drop.size * 0.4, drop.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("accumulating...", width / 2, Math.min(wallTop - 15 * scale, height * 0.1));

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V8: Gallery Wall ── */
const V8: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(12, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19008);
    const images: { x: number; y: number; w: number; h: number; gray: number; delay: number }[] = [];
    // Gallery layout: varying sizes
    const positions = [
      { x: 0.08, y: 0.1, w: 0.18, h: 0.25 },
      { x: 0.30, y: 0.08, w: 0.15, h: 0.2 },
      { x: 0.48, y: 0.1, w: 0.22, h: 0.28 },
      { x: 0.74, y: 0.08, w: 0.18, h: 0.22 },
      { x: 0.05, y: 0.42, w: 0.2, h: 0.18 },
      { x: 0.28, y: 0.38, w: 0.25, h: 0.3 },
      { x: 0.56, y: 0.42, w: 0.17, h: 0.22 },
      { x: 0.76, y: 0.38, w: 0.2, h: 0.25 },
      { x: 0.1, y: 0.68, w: 0.22, h: 0.2 },
      { x: 0.36, y: 0.72, w: 0.15, h: 0.18 },
      { x: 0.55, y: 0.7, w: 0.2, h: 0.22 },
      { x: 0.78, y: 0.68, w: 0.17, h: 0.2 },
    ];
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      images.push({
        x: p.x * width, y: p.y * height,
        w: p.w * width, h: p.h * height,
        gray: 20 + rand() * 25,
        delay: i * 6 + rand() * 5,
      });
    }
    return { images };
  }, [width, height]);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    for (const img of data.images) {
      const appear = interpolate(frame, [8 + img.delay, 18 + img.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (appear <= 0) continue;
      ctx.globalAlpha = fadeAlpha * appear;

      // Frame (white border like gallery)
      const borderW = 3 * scale;
      ctx.fillStyle = `hsla(0, 0%, 90%, ${appear * 0.15})`;
      ctx.fillRect(img.x - borderW, img.y - borderW, img.w + borderW * 2, img.h + borderW * 2);

      // Image content
      ctx.fillStyle = `hsl(0, 0%, ${img.gray}%)`;
      ctx.fillRect(img.x, img.y, img.w, img.h);

      // EM-like details
      const rand = seeded(19008 + Math.floor(img.x * 100));
      for (let b = 0; b < 6; b++) {
        const bx = img.x + rand() * img.w;
        const by = img.y + rand() * img.h;
        const br = (2 + rand() * 4) * scale;
        ctx.fillStyle = `hsla(0, 0%, ${img.gray + 15}%, 0.4)`;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spotlight effect
      if (appear > 0.5 && appear < 0.9) {
        const spotAlpha = (1 - Math.abs(appear - 0.7) / 0.2) * 0.15;
        const spotGrad = ctx.createRadialGradient(img.x + img.w / 2, img.y + img.h / 2, 0, img.x + img.w / 2, img.y + img.h / 2, Math.max(img.w, img.h));
        spotGrad.addColorStop(0, `hsla(45, 50%, 70%, ${spotAlpha})`);
        spotGrad.addColorStop(1, `hsla(45, 50%, 70%, 0)`);
        ctx.fillStyle = spotGrad;
        ctx.fillRect(img.x, img.y, img.w, img.h);
      }
    }

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

/* ── V9: Matrix of Squares ── */
const V9: React.FC<VariantProps> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = Math.min(width, height) / 360;
  const particles = useMemo(() => makeParticles(10, width, height, scale), [width, height, scale]);
  const data = useMemo(() => {
    const rand = seeded(19009);
    const cols = 14;
    const rows = 8;
    const cells: { hue: number; sat: number; lit: number; gray: number; delay: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const colorIdx = Math.floor(rand() * 8);
        const pal = PALETTE.cellColors[colorIdx];
        cells.push({
          hue: pal[0], sat: pal[1], lit: pal[2],
          gray: 18 + rand() * 28,
          delay: (r + c) * 0.5 + rand() * 3,
        });
      }
    }
    return { cells, cols, rows };
  }, []);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawBg(ctx, width, height);
    drawParticles(ctx, particles, frame, scale);
    const fadeAlpha = fadeInOut(frame, 120);
    ctx.globalAlpha = fadeAlpha;

    const margin = 6 * scale;
    const gap = 2 * scale;
    const cellW = (width - 2 * margin - (data.cols - 1) * gap) / data.cols;
    const cellH = (height - 2 * margin - (data.rows - 1) * gap) / data.rows;

    // Phase 1: cells appear as colored (0-50)
    // Phase 2: color drains to grayscale (50-100)
    const drainProgress = interpolate(frame, [50, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

    for (let idx = 0; idx < data.cells.length; idx++) {
      const cell = data.cells[idx];
      const col = idx % data.cols;
      const row = Math.floor(idx / data.cols);
      const cellAppear = interpolate(frame, [5 + cell.delay, 12 + cell.delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (cellAppear <= 0) continue;

      ctx.globalAlpha = fadeAlpha * cellAppear;
      const cx = margin + col * (cellW + gap);
      const cy = margin + row * (cellH + gap);

      // Transition from colored to grayscale
      const currentSat = cell.sat * (1 - drainProgress);
      const currentLit = cell.lit * (1 - drainProgress) + cell.gray * drainProgress;
      const currentHue = cell.hue;
      ctx.fillStyle = `hsl(${currentHue}, ${currentSat}%, ${currentLit}%)`;
      ctx.fillRect(cx, cy, cellW, cellH);

      // If draining, add EM-like detail
      if (drainProgress > 0.3) {
        const detailAlpha = interpolate(drainProgress, [0.3, 0.8], [0, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        ctx.fillStyle = `hsla(0, 0%, ${cell.gray + 15}%, ${detailAlpha})`;
        ctx.beginPath();
        ctx.arc(cx + cellW * 0.5, cy + cellH * 0.5, Math.min(cellW, cellH) * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Label
    ctx.globalAlpha = fadeAlpha;
    ctx.fillStyle = PALETTE.text.dim;
    ctx.font = `${9 * scale}px system-ui`;
    ctx.textAlign = "center";
    const labelText = drainProgress > 0.5 ? "raw EM data" : "21 million images";
    ctx.fillText(labelText, width / 2, height * 0.95);

    ctx.globalAlpha = 1;
  });
  return <canvas ref={canvasRef} width={width} height={height} style={{ width, height }} />;
};

export const VARIANTS_SHOT_019: VariantDef[] = [
  { id: "mosaic-grid", label: "Mosaic Grid", component: V1 },
  { id: "stack-fan-out", label: "Stack Fan-Out", component: V2 },
  { id: "wall-of-thumbnails", label: "Wall of Thumbnails", component: V3 },
  { id: "infinite-scroll", label: "Infinite Scroll", component: V4 },
  { id: "filmstrip-grid", label: "Filmstrip Grid", component: V5 },
  { id: "tiling-from-center", label: "Tiling from Center", component: V6 },
  { id: "image-rain", label: "Image Rain", component: V7 },
  { id: "gallery-wall", label: "Gallery Wall", component: V8 },
  { id: "matrix-of-squares", label: "Matrix of Squares", component: V9 },
];
