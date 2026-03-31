export interface VariantProps {
  sentence: string;
  width: number;
  height: number;
}

export interface VariantDef {
  id: string;
  label: string;
  component: React.FC<VariantProps>;
}
