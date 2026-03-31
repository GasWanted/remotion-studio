"use client";

import { Player } from "@remotion/player";
import React, { useEffect, useState, useMemo } from "react";
import { loadVariants } from "@/lib/composition-registry";

interface Props {
  shotNum: number;
  variantIndex: number; // 1-9
  width: number;
  height: number;
  durationFrames: number;
}

export function VariantPlayer({ shotNum, variantIndex, width, height, durationFrames }: Props) {
  const [Component, setComponent] = useState<React.FC<any> | null>(null);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    loadVariants(shotNum).then((variants) => {
      if (cancelled) return;
      if (variantIndex >= 1 && variantIndex <= variants.length) {
        setComponent(() => variants[variantIndex - 1].component);
        setLabel(variants[variantIndex - 1].label);
      } else {
        setError(`Variant ${variantIndex} not found`);
      }
      setLoaded(true);
    }).catch((e) => {
      if (!cancelled) setError(String(e));
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [shotNum, variantIndex]);

  const WrappedComp = useMemo(() => {
    if (!Component) return null;
    const Comp = Component;
    const Wrapped: React.FC = () => <Comp width={width} height={height} sentence="" />;
    return Wrapped;
  }, [Component, width, height]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-500/10 text-red-400 text-xs p-2 text-center">
        {error}
      </div>
    );
  }

  if (!WrappedComp) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
        <div className="text-white/20 text-xs animate-pulse">Loading v{variantIndex}...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <Player
        component={WrappedComp}
        compositionWidth={width}
        compositionHeight={height}
        durationInFrames={Math.max(1, durationFrames)}
        fps={30}
        style={{ width: "100%", height: "100%" }}
        loop
        autoPlay
        controls={false}
      />
      {label && (
        <div className="absolute bottom-1 left-1 text-[9px] text-white/30 bg-black/40 px-1 rounded">
          {label}
        </div>
      )}
    </div>
  );
}
