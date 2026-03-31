import type { VariantDef } from "../types";
import { KurzDeepBlue } from "./KurzDeepBlue";
import { WarmSunset } from "./WarmSunset";
import { NeonPurple } from "./NeonPurple";
import { EarthTones } from "./EarthTones";
import { MintClean } from "./MintClean";
import { CosmicPink } from "./CosmicPink";
import { FlatBold } from "./FlatBold";
import { PaperTexture } from "./PaperTexture";
import { OceanDepth } from "./OceanDepth";

export const VARIANTS_EXP: VariantDef[] = [
  { id: "KurzDeepBlue", label: "Kurz Deep Blue", component: KurzDeepBlue },
  { id: "WarmSunset", label: "Warm Sunset", component: WarmSunset },
  { id: "NeonPurple", label: "Neon Purple", component: NeonPurple },
  { id: "EarthTones", label: "Earth Tones", component: EarthTones },
  { id: "MintClean", label: "Mint Clean", component: MintClean },
  { id: "CosmicPink", label: "Cosmic Pink", component: CosmicPink },
  { id: "FlatBold", label: "Flat Bold", component: FlatBold },
  { id: "PaperTexture", label: "Paper Texture", component: PaperTexture },
  { id: "OceanDepth", label: "Ocean Depth", component: OceanDepth },
];
