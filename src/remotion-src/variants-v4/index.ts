import type { VariantDef } from "../types";
import { EMSliceStack } from "./EMSliceStack";
import { Ultramicrotome } from "./Ultramicrotome";
import { WavelengthCompare } from "./WavelengthCompare";
import { PhotoCounter } from "./PhotoCounter";
import { SegmentationScan } from "./SegmentationScan";
import { NeuronAssembly } from "./NeuronAssembly";
import { ProofreadFix } from "./ProofreadFix";
import { ConnectomeReveal } from "./ConnectomeReveal";
import { FlyWireLabel } from "./FlyWireLabel";

export const VARIANTS_V4: VariantDef[] = [
  { id: "EMSliceStack", label: "EM Slice Stack", component: EMSliceStack },
  { id: "Ultramicrotome", label: "Ultramicrotome", component: Ultramicrotome },
  { id: "WavelengthCompare", label: "Wavelength Compare", component: WavelengthCompare },
  { id: "PhotoCounter", label: "Photo Counter", component: PhotoCounter },
  { id: "SegmentationScan", label: "Segmentation Scan", component: SegmentationScan },
  { id: "NeuronAssembly", label: "Neuron Assembly", component: NeuronAssembly },
  { id: "ProofreadFix", label: "Proofread Fix", component: ProofreadFix },
  { id: "ConnectomeReveal", label: "Connectome Reveal", component: ConnectomeReveal },
  { id: "FlyWireLabel", label: "FlyWire Label", component: FlyWireLabel },
];
