import type { VariantDef } from "../types";
import { HexGrid } from "./HexGrid";
import { CircuitBoard } from "./CircuitBoard";
import { ConcentricRings } from "./ConcentricRings";
import { Topographic } from "./Topographic";
import { StainedGlass } from "./StainedGlass";
import { Blueprint } from "./Blueprint";
import { Watercolor } from "./Watercolor";
import { Constellation3D } from "./Constellation3D";
import { Microscope } from "./Microscope";

export const VARIANTS_EXP2: VariantDef[] = [
  { id: "HexGrid", label: "Hex Grid", component: HexGrid },
  { id: "CircuitBoard", label: "Circuit Board", component: CircuitBoard },
  { id: "ConcentricRings", label: "Concentric Rings", component: ConcentricRings },
  { id: "Topographic", label: "Topographic", component: Topographic },
  { id: "StainedGlass", label: "Stained Glass", component: StainedGlass },
  { id: "Blueprint", label: "Blueprint", component: Blueprint },
  { id: "Watercolor", label: "Watercolor", component: Watercolor },
  { id: "Constellation3D", label: "Constellation 3D", component: Constellation3D },
  { id: "Microscope", label: "Microscope", component: Microscope },
];
