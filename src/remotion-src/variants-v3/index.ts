import type { VariantDef } from "../types";
import { RedFlash } from "./RedFlash";
import { EdgeRewrite } from "./EdgeRewrite";
import { RippleShock } from "./RippleShock";
import { WeightShift } from "./WeightShift";
import { PathHighlight } from "./PathHighlight";
import { Stopwatch } from "./Stopwatch";
import { ScalpelCut } from "./ScalpelCut";
import { BeforeAfter } from "./BeforeAfter";
import { SurgicalZoom } from "./SurgicalZoom";
import { CounterOverlay } from "./CounterOverlay";

export const VARIANTS_V3: VariantDef[] = [
  { id: "RedFlash", label: "Red Flash", component: RedFlash },
  { id: "EdgeRewrite", label: "Edge Rewrite", component: EdgeRewrite },
  { id: "RippleShock", label: "Ripple Shock", component: RippleShock },
  { id: "WeightShift", label: "Weight Shift", component: WeightShift },
  { id: "PathHighlight", label: "Path Highlight", component: PathHighlight },
  { id: "Stopwatch", label: "Stopwatch", component: Stopwatch },
  { id: "ScalpelCut", label: "Scalpel Cut", component: ScalpelCut },
  { id: "BeforeAfter", label: "Before/After", component: BeforeAfter },
  { id: "SurgicalZoom", label: "Surgical Zoom", component: SurgicalZoom },
  { id: "CounterOverlay", label: "Counter Overlay", component: CounterOverlay },
];
