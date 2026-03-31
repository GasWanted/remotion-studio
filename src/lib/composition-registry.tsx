"use client";

import React from "react";

type VariantComponent = React.FC<{ width: number; height: number; sentence: string }>;

interface VariantDef {
  id: string;
  label: string;
  component: VariantComponent;
}

// Cache for loaded variant arrays
const variantCache: Record<number, VariantDef[]> = {};
const loadingPromises: Record<number, Promise<VariantDef[]>> = {};

// Static import map — webpack can analyze these
const importMap: Record<number, () => Promise<any>> = {
  1: () => import("@/remotion-src/shots-flatbold/shot_001"),
  2: () => import("@/remotion-src/shots-flatbold/shot_002"),
  3: () => import("@/remotion-src/shots-flatbold/shot_003"),
  4: () => import("@/remotion-src/shots-flatbold/shot_004"),
  5: () => import("@/remotion-src/shots-flatbold/shot_005"),
  6: () => import("@/remotion-src/shots-flatbold/shot_006"),
  7: () => import("@/remotion-src/shots-flatbold/shot_007"),
  8: () => import("@/remotion-src/shots-flatbold/shot_008"),
  9: () => import("@/remotion-src/shots-flatbold/shot_009"),
  10: () => import("@/remotion-src/shots-flatbold/shot_010"),
  11: () => import("@/remotion-src/shots-flatbold/shot_011"),
  12: () => import("@/remotion-src/shots-flatbold/shot_012"),
  13: () => import("@/remotion-src/shots-flatbold/shot_013"),
  14: () => import("@/remotion-src/shots-flatbold/shot_014"),
  15: () => import("@/remotion-src/shots-flatbold/shot_015"),
  16: () => import("@/remotion-src/shots-flatbold/shot_016"),
  17: () => import("@/remotion-src/shots-flatbold/shot_017"),
  18: () => import("@/remotion-src/shots-flatbold/shot_018"),
  19: () => import("@/remotion-src/shots-flatbold/shot_019"),
  20: () => import("@/remotion-src/shots-flatbold/shot_020"),
  21: () => import("@/remotion-src/shots-flatbold/shot_021"),
  22: () => import("@/remotion-src/shots-flatbold/shot_022"),
  23: () => import("@/remotion-src/shots-flatbold/shot_023"),
  24: () => import("@/remotion-src/shots-flatbold/shot_024"),
  25: () => import("@/remotion-src/shots-flatbold/shot_025"),
  26: () => import("@/remotion-src/shots-flatbold/shot_026"),
  27: () => import("@/remotion-src/shots-flatbold/shot_027"),
  28: () => import("@/remotion-src/shots-flatbold/shot_028"),
  29: () => import("@/remotion-src/shots-flatbold/shot_029"),
  30: () => import("@/remotion-src/shots-flatbold/shot_030"),
  31: () => import("@/remotion-src/shots-flatbold/shot_031"),
  32: () => import("@/remotion-src/shots-flatbold/shot_032"),
  33: () => import("@/remotion-src/shots-flatbold/shot_033"),
  34: () => import("@/remotion-src/shots-flatbold/shot_034"),
  35: () => import("@/remotion-src/shots-flatbold/shot_035"),
  36: () => import("@/remotion-src/shots-flatbold/shot_036"),
  37: () => import("@/remotion-src/shots-flatbold/shot_037"),
  38: () => import("@/remotion-src/shots-flatbold/shot_038"),
  39: () => import("@/remotion-src/shots-flatbold/shot_039"),
  40: () => import("@/remotion-src/shots-flatbold/shot_040"),
  41: () => import("@/remotion-src/shots-flatbold/shot_041"),
  42: () => import("@/remotion-src/shots-flatbold/shot_042"),
  43: () => import("@/remotion-src/shots-flatbold/shot_043"),
  44: () => import("@/remotion-src/shots-flatbold/shot_044"),
  45: () => import("@/remotion-src/shots-flatbold/shot_045"),
  46: () => import("@/remotion-src/shots-flatbold/shot_046"),
  47: () => import("@/remotion-src/shots-flatbold/shot_047"),
  48: () => import("@/remotion-src/shots-flatbold/shot_048"),
  49: () => import("@/remotion-src/shots-flatbold/shot_049"),
  50: () => import("@/remotion-src/shots-flatbold/shot_050"),
  51: () => import("@/remotion-src/shots-flatbold/shot_051"),
  52: () => import("@/remotion-src/shots-flatbold/shot_052"),
  53: () => import("@/remotion-src/shots-flatbold/shot_053"),
  54: () => import("@/remotion-src/shots-flatbold/shot_054"),
  55: () => import("@/remotion-src/shots-flatbold/shot_055"),
  56: () => import("@/remotion-src/shots-flatbold/shot_056"),
  57: () => import("@/remotion-src/shots-flatbold/shot_057"),
  58: () => import("@/remotion-src/shots-flatbold/shot_058"),
  59: () => import("@/remotion-src/shots-flatbold/shot_059"),
  60: () => import("@/remotion-src/shots-flatbold/shot_060"),
  61: () => import("@/remotion-src/shots-flatbold/shot_061"),
  62: () => import("@/remotion-src/shots-flatbold/shot_062"),
  63: () => import("@/remotion-src/shots-flatbold/shot_063"),
  64: () => import("@/remotion-src/shots-flatbold/shot_064"),
  65: () => import("@/remotion-src/shots-flatbold/shot_065"),
  66: () => import("@/remotion-src/shots-flatbold/shot_066"),
  67: () => import("@/remotion-src/shots-flatbold/shot_067"),
  68: () => import("@/remotion-src/shots-flatbold/shot_068"),
  69: () => import("@/remotion-src/shots-flatbold/shot_069"),
  70: () => import("@/remotion-src/shots-flatbold/shot_070"),
  71: () => import("@/remotion-src/shots-flatbold/shot_071"),
  72: () => import("@/remotion-src/shots-flatbold/shot_072"),
  73: () => import("@/remotion-src/shots-flatbold/shot_073"),
  74: () => import("@/remotion-src/shots-flatbold/shot_074"),
  75: () => import("@/remotion-src/shots-flatbold/shot_075"),
  76: () => import("@/remotion-src/shots-flatbold/shot_076"),
  77: () => import("@/remotion-src/shots-flatbold/shot_077"),
  78: () => import("@/remotion-src/shots-flatbold/shot_078"),
  79: () => import("@/remotion-src/shots-flatbold/shot_079"),
  80: () => import("@/remotion-src/shots-flatbold/shot_080"),
  81: () => import("@/remotion-src/shots-flatbold/shot_081"),
  82: () => import("@/remotion-src/shots-flatbold/shot_082"),
  83: () => import("@/remotion-src/shots-flatbold/shot_083"),
  84: () => import("@/remotion-src/shots-flatbold/shot_084"),
  85: () => import("@/remotion-src/shots-flatbold/shot_085"),
  86: () => import("@/remotion-src/shots-flatbold/shot_086"),
  87: () => import("@/remotion-src/shots-flatbold/shot_087"),
};

/**
 * Load all 9 variants for a shot. Cached + deduped.
 */
export async function loadVariants(shotNum: number): Promise<VariantDef[]> {
  if (variantCache[shotNum]) return variantCache[shotNum];
  if (loadingPromises[shotNum]) return loadingPromises[shotNum];

  const loader = importMap[shotNum];
  if (!loader) return [];

  const promise = loader().then((mod) => {
    const exportName = `VARIANTS_FB_${String(shotNum).padStart(3, "0")}`;
    const variants = mod[exportName] as VariantDef[] | undefined;
    if (variants) {
      variantCache[shotNum] = variants;
      return variants;
    }
    return [];
  }).catch((e) => {
    console.warn(`Failed to load shot ${shotNum}:`, e);
    return [];
  });

  loadingPromises[shotNum] = promise;
  return promise;
}

/**
 * Preload variants for a shot (call when scene changes to avoid visible loading).
 */
export function preloadVariants(shotNum: number): void {
  loadVariants(shotNum);
}
