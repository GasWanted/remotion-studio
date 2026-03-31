"use client";

import { useState, useCallback } from "react";
import { SCENES } from "@/lib/scenes";
import { Scene } from "@/lib/types";
import { SceneTimeline } from "@/components/SceneTimeline";
import { NarrationBar } from "@/components/NarrationBar";
import { PreviousScene } from "@/components/PreviousScene";
import { VariantGrid } from "@/components/VariantGrid";
import { RemixBox } from "@/components/RemixBox";

export default function ReviewPage() {
  const [currentId, setCurrentId] = useState(1);
  const [scenes, setScenes] = useState<Scene[]>(SCENES);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const current = scenes.find((s) => s.id === currentId)!;
  const previous = currentId > 1 ? scenes.find((s) => s.id === currentId - 1) ?? null : null;

  const pickVariant = useCallback(() => {
    if (selectedVariant === null) return;
    setScenes((prev) =>
      prev.map((s) =>
        s.id === currentId ? { ...s, status: "final", pickedVariant: selectedVariant } : s
      )
    );
    setSelectedVariant(null);
    if (currentId < scenes.length) setCurrentId(currentId + 1);
  }, [currentId, selectedVariant, scenes.length]);

  const goTo = (id: number) => {
    setCurrentId(id);
    setSelectedVariant(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0d0d18]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-teal-400">Remotion Studio</h1>
          <span className="text-xs text-white/30">AI Animation Review Tool</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-white/40">
            Scene {currentId} / {scenes.length}
          </span>
          <span className="text-green-400">
            {scenes.filter((s) => s.status === "final").length} final
          </span>
          <span className="text-yellow-400">
            {scenes.filter((s) => s.status === "pending").length} pending
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Narration bar */}
        <NarrationBar scene={current} />

        {/* Main area: previous + grid */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Previous scene */}
          <div className="w-64 flex-shrink-0">
            <PreviousScene scene={previous} />
          </div>

          {/* 3x3 variant grid */}
          <div className="flex-1 flex flex-col gap-3">
            <VariantGrid
              scene={current}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          </div>
        </div>

        {/* Remix + actions */}
        <div className="px-4 pb-3">
          <RemixBox
            scene={current}
            selectedVariant={selectedVariant}
            onPick={pickVariant}
            onNext={() => goTo(Math.min(currentId + 1, scenes.length))}
            onPrev={() => goTo(Math.max(currentId - 1, 1))}
          />
        </div>
      </div>

      {/* Timeline */}
      <SceneTimeline scenes={scenes} currentId={currentId} onSelect={goTo} />
    </div>
  );
}
