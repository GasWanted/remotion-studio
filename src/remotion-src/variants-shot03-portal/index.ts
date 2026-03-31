import type { VariantDef } from "../types";
import { TestChamber } from "./TestChamber";
import { ApertureTerminal } from "./ApertureTerminal";
import { PortalFlow } from "./PortalFlow";
import { ConveyorLine } from "./ConveyorLine";
import { GelExperiment } from "./GelExperiment";
import { CubeArray } from "./CubeArray";
import { ElevatorShaft } from "./ElevatorShaft";
import { GladosSurveillance } from "./GladosSurveillance";
import { CaveJohnsonEra } from "./CaveJohnsonEra";

export const VARIANTS_SHOT03_PORTAL: VariantDef[] = [
  { id: "NetworkGrow", label: "Network Grow", component: TestChamber },
  { id: "StreamConverge", label: "Stream Converge", component: ApertureTerminal },
  { id: "HexMosaic", label: "Hex Mosaic", component: PortalFlow },
  { id: "PulseRings", label: "Pulse Rings", component: ConveyorLine },
  { id: "BranchingTree", label: "Branching Tree", component: GelExperiment },
  { id: "CardFlip", label: "Card Flip", component: CubeArray },
  { id: "OrbitSystem", label: "Orbit System", component: ElevatorShaft },
  { id: "BarRise", label: "Bar Rise", component: GladosSurveillance },
  { id: "WaveField", label: "Wave Field", component: CaveJohnsonEra },
];
