import type { VariantDef } from "../types";
import { PortalLab } from "./PortalLab";
import { Cyberpunk } from "./Cyberpunk";
import { MatrixCode } from "./MatrixCode";
import { KurzgesagtWarm } from "./KurzgesagtWarm";
import { HolographicHUD } from "./HolographicHUD";
import { RetroArcade } from "./RetroArcade";
import { BlueprintTech } from "./BlueprintTech";
import { DeepOcean } from "./DeepOcean";
import { Synthwave } from "./Synthwave";
import { StainedGlass } from "./StainedGlass";
import { PaperCraft } from "./PaperCraft";
import { InfraredThermal } from "./InfraredThermal";
import { Chalkboard } from "./Chalkboard";
import { ArtDeco } from "./ArtDeco";
import { MicroscopeSlide } from "./MicroscopeSlide";
import { NeonSign } from "./NeonSign";
import { WatercolorInk } from "./WatercolorInk";
import { CosmicNebula } from "./CosmicNebula";

/** Grid A: first 9 themes */
export const VARIANTS_SHOT03_THEMES_A: VariantDef[] = [
  { id: "PortalLab", label: "Portal 2 Lab", component: PortalLab },
  { id: "Cyberpunk", label: "Cyberpunk", component: Cyberpunk },
  { id: "MatrixCode", label: "Matrix", component: MatrixCode },
  { id: "KurzgesagtWarm", label: "Kurzgesagt", component: KurzgesagtWarm },
  { id: "HolographicHUD", label: "Holographic HUD", component: HolographicHUD },
  { id: "RetroArcade", label: "Retro Arcade", component: RetroArcade },
  { id: "BlueprintTech", label: "Blueprint", component: BlueprintTech },
  { id: "DeepOcean", label: "Deep Ocean", component: DeepOcean },
  { id: "Synthwave", label: "Synthwave", component: Synthwave },
];

/** Grid B: next 9 themes */
export const VARIANTS_SHOT03_THEMES_B: VariantDef[] = [
  { id: "StainedGlass", label: "Stained Glass", component: StainedGlass },
  { id: "PaperCraft", label: "Paper Craft", component: PaperCraft },
  { id: "InfraredThermal", label: "Infrared Thermal", component: InfraredThermal },
  { id: "Chalkboard", label: "Chalkboard", component: Chalkboard },
  { id: "ArtDeco", label: "Art Deco", component: ArtDeco },
  { id: "MicroscopeSlide", label: "Microscope Slide", component: MicroscopeSlide },
  { id: "NeonSign", label: "Neon Sign", component: NeonSign },
  { id: "WatercolorInk", label: "Watercolor Ink", component: WatercolorInk },
  { id: "CosmicNebula", label: "Cosmic Nebula", component: CosmicNebula },
];
