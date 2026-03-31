import type { VariantDef } from "../types";
import { SoftBubbles } from "./SoftBubbles";
import { PastelLayers } from "./PastelLayers";
import { GlowOrbs } from "./GlowOrbs";
import { IsometricBlocks } from "./IsometricBlocks";
import { CloudyDay } from "./CloudyDay";
import { CellularCute } from "./CellularCute";
import { NeonCity } from "./NeonCity";
import { PaperCraft } from "./PaperCraft";
import { GardenGrow } from "./GardenGrow";

export const VARIANTS_EXP3: VariantDef[] = [
  { id: "SoftBubbles", label: "Soft Bubbles", component: SoftBubbles },
  { id: "PastelLayers", label: "Pastel Layers", component: PastelLayers },
  { id: "GlowOrbs", label: "Glow Orbs", component: GlowOrbs },
  { id: "IsometricBlocks", label: "Isometric Blocks", component: IsometricBlocks },
  { id: "CloudyDay", label: "Cloudy Day", component: CloudyDay },
  { id: "CellularCute", label: "Cellular Cute", component: CellularCute },
  { id: "NeonCity", label: "Neon City", component: NeonCity },
  { id: "PaperCraft", label: "Paper Craft", component: PaperCraft },
  { id: "GardenGrow", label: "Garden Grow", component: GardenGrow },
];
