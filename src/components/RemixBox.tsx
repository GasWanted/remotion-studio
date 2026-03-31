"use client";

import { useState } from "react";
import { Scene } from "@/lib/types";

interface Props {
  scene: Scene;
  selectedVariant: number | null;
  onPick: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function RemixBox({ scene, selectedVariant, onPick, onNext, onPrev }: Props) {
  const [remixText, setRemixText] = useState("");
  const [isRemixing, setIsRemixing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleRemix = async () => {
    if (!remixText.trim()) return;
    setIsRemixing(true);
    setStatus("Sending to Claude Code...");

    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shotNum: scene.id,
          narration: scene.narration,
          remixNotes: remixText,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Remixed! Reload to see new variants.");
        setRemixText("");
      } else {
        setStatus(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      setStatus(`Failed: ${e.message}`);
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {status && (
        <div className={`text-xs px-3 py-1.5 rounded ${status.includes("Error") || status.includes("Failed") ? "bg-red-500/10 text-red-400" : "bg-teal-500/10 text-teal-400"}`}>
          {status}
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* Navigation */}
        <button
          onClick={onPrev}
          className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          ← Prev
        </button>

        {/* Remix input */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={remixText}
            onChange={(e) => setRemixText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRemix()}
            placeholder="Remix: describe changes (e.g., 'bigger neurons, add trail, brighter colors')..."
            className="flex-1 px-4 py-2 rounded-lg bg-[#151520] border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-teal-400/50 focus:ring-1 focus:ring-teal-400/20"
            disabled={isRemixing}
          />
          <button
            onClick={handleRemix}
            disabled={!remixText.trim() || isRemixing}
            className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isRemixing ? "⏳ Remixing..." : "🔄 Remix (Claude)"}
          </button>
        </div>

        {/* Pick button */}
        <button
          onClick={onPick}
          disabled={selectedVariant === null}
          className="px-5 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          ✓ Pick {selectedVariant !== null ? `#${selectedVariant}` : ""}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
