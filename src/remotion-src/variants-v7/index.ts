import type { VariantDef } from "../types";
import { WeightDemo } from "./WeightDemo";
import { EvolutionPath } from "./EvolutionPath";
import { DataSnap } from "./DataSnap";
import { CursorEdit } from "./CursorEdit";
import { FeedDim } from "./FeedDim";
import { RetreatGrow } from "./RetreatGrow";
import { BeforeAfterFlow } from "./BeforeAfterFlow";
import { TinyFraction } from "./TinyFraction";
import { ThirtyTwoSeconds } from "./ThirtyTwoSeconds";

export const VARIANTS_V7: VariantDef[] = [
  { id: "WeightDemo", label: "Weight Demo", component: WeightDemo },
  { id: "EvolutionPath", label: "Evolution Path", component: EvolutionPath },
  { id: "DataSnap", label: "Data Snap", component: DataSnap },
  { id: "CursorEdit", label: "Cursor Edit", component: CursorEdit },
  { id: "FeedDim", label: "Feed Dim", component: FeedDim },
  { id: "RetreatGrow", label: "Retreat Grow", component: RetreatGrow },
  { id: "BeforeAfterFlow", label: "Before/After Flow", component: BeforeAfterFlow },
  { id: "TinyFraction", label: "Tiny Fraction", component: TinyFraction },
  { id: "ThirtyTwoSeconds", label: "32 Seconds", component: ThirtyTwoSeconds },
];
