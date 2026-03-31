import type { VariantDef } from "../types";
import { SHOT_PLAN } from "./shot-plan";

// Import all shot variant arrays
import { VARIANTS_FB_001 } from "./shot_001";
import { VARIANTS_FB_002 } from "./shot_002";
import { VARIANTS_FB_003 } from "./shot_003";
import { VARIANTS_FB_004 } from "./shot_004";
import { VARIANTS_FB_005 } from "./shot_005";
import { VARIANTS_FB_006 } from "./shot_006";
import { VARIANTS_FB_007 } from "./shot_007";
import { VARIANTS_FB_008 } from "./shot_008";
import { VARIANTS_FB_009 } from "./shot_009";
import { VARIANTS_FB_010 } from "./shot_010";
import { VARIANTS_FB_011 } from "./shot_011";
import { VARIANTS_FB_012 } from "./shot_012";
import { VARIANTS_FB_013 } from "./shot_013";
import { VARIANTS_FB_014 } from "./shot_014";
import { VARIANTS_FB_015 } from "./shot_015";
import { VARIANTS_FB_016 } from "./shot_016";
import { VARIANTS_FB_017 } from "./shot_017";
import { VARIANTS_FB_018 } from "./shot_018";
import { VARIANTS_FB_019 } from "./shot_019";
import { VARIANTS_FB_020 } from "./shot_020";
import { VARIANTS_FB_021 } from "./shot_021";
import { VARIANTS_FB_022 } from "./shot_022";
import { VARIANTS_FB_023 } from "./shot_023";
import { VARIANTS_FB_024 } from "./shot_024";
import { VARIANTS_FB_025 } from "./shot_025";
import { VARIANTS_FB_026 } from "./shot_026";
import { VARIANTS_FB_027 } from "./shot_027";
import { VARIANTS_FB_028 } from "./shot_028";
import { VARIANTS_FB_029 } from "./shot_029";
import { VARIANTS_FB_030 } from "./shot_030";
import { VARIANTS_FB_031 } from "./shot_031";
import { VARIANTS_FB_032 } from "./shot_032";
import { VARIANTS_FB_033 } from "./shot_033";
import { VARIANTS_FB_034 } from "./shot_034";
import { VARIANTS_FB_035 } from "./shot_035";
import { VARIANTS_FB_036 } from "./shot_036";
import { VARIANTS_FB_037 } from "./shot_037";
import { VARIANTS_FB_038 } from "./shot_038";
import { VARIANTS_FB_039 } from "./shot_039";
import { VARIANTS_FB_040 } from "./shot_040";
import { VARIANTS_FB_041 } from "./shot_041";
import { VARIANTS_FB_042 } from "./shot_042";
import { VARIANTS_FB_043 } from "./shot_043";
import { VARIANTS_FB_044 } from "./shot_044";
import { VARIANTS_FB_045 } from "./shot_045";
import { VARIANTS_FB_046 } from "./shot_046";
import { VARIANTS_FB_047 } from "./shot_047";
import { VARIANTS_FB_048 } from "./shot_048";
import { VARIANTS_FB_049 } from "./shot_049";
import { VARIANTS_FB_050 } from "./shot_050";
import { VARIANTS_FB_051 } from "./shot_051";
import { VARIANTS_FB_052 } from "./shot_052";
import { VARIANTS_FB_053 } from "./shot_053";
import { VARIANTS_FB_054 } from "./shot_054";
import { VARIANTS_FB_055 } from "./shot_055";
import { VARIANTS_FB_056 } from "./shot_056";
import { VARIANTS_FB_057 } from "./shot_057";
import { VARIANTS_FB_058 } from "./shot_058";
import { VARIANTS_FB_059 } from "./shot_059";
import { VARIANTS_FB_060 } from "./shot_060";
import { VARIANTS_FB_061 } from "./shot_061";
import { VARIANTS_FB_062 } from "./shot_062";
import { VARIANTS_FB_063 } from "./shot_063";
import { VARIANTS_FB_064 } from "./shot_064";
import { VARIANTS_FB_065 } from "./shot_065";
import { VARIANTS_FB_066 } from "./shot_066";
import { VARIANTS_FB_067 } from "./shot_067";
import { VARIANTS_FB_068 } from "./shot_068";
import { VARIANTS_FB_069 } from "./shot_069";
import { VARIANTS_FB_070 } from "./shot_070";
import { VARIANTS_FB_071 } from "./shot_071";
import { VARIANTS_FB_072 } from "./shot_072";
import { VARIANTS_FB_073 } from "./shot_073";
import { VARIANTS_FB_074 } from "./shot_074";
import { VARIANTS_FB_075 } from "./shot_075";
import { VARIANTS_FB_076 } from "./shot_076";
import { VARIANTS_FB_077 } from "./shot_077";
import { VARIANTS_FB_078 } from "./shot_078";
import { VARIANTS_FB_079 } from "./shot_079";
import { VARIANTS_FB_080 } from "./shot_080";
import { VARIANTS_FB_081 } from "./shot_081";
import { VARIANTS_FB_082 } from "./shot_082";
import { VARIANTS_FB_083 } from "./shot_083";
import { VARIANTS_FB_084 } from "./shot_084";
import { VARIANTS_FB_085 } from "./shot_085";
import { VARIANTS_FB_086 } from "./shot_086";
import { VARIANTS_FB_087 } from "./shot_087";

const VARIANT_MAP: Record<number, VariantDef[]> = {
  1: VARIANTS_FB_001, 2: VARIANTS_FB_002, 3: VARIANTS_FB_003, 4: VARIANTS_FB_004,
  5: VARIANTS_FB_005, 6: VARIANTS_FB_006, 7: VARIANTS_FB_007, 8: VARIANTS_FB_008,
  9: VARIANTS_FB_009, 10: VARIANTS_FB_010, 11: VARIANTS_FB_011, 12: VARIANTS_FB_012,
  13: VARIANTS_FB_013, 14: VARIANTS_FB_014, 15: VARIANTS_FB_015, 16: VARIANTS_FB_016,
  17: VARIANTS_FB_017, 18: VARIANTS_FB_018, 19: VARIANTS_FB_019, 20: VARIANTS_FB_020,
  21: VARIANTS_FB_021, 22: VARIANTS_FB_022, 23: VARIANTS_FB_023, 24: VARIANTS_FB_024,
  25: VARIANTS_FB_025, 26: VARIANTS_FB_026, 27: VARIANTS_FB_027, 28: VARIANTS_FB_028,
  29: VARIANTS_FB_029, 30: VARIANTS_FB_030, 31: VARIANTS_FB_031, 32: VARIANTS_FB_032,
  33: VARIANTS_FB_033, 34: VARIANTS_FB_034, 35: VARIANTS_FB_035, 36: VARIANTS_FB_036,
  37: VARIANTS_FB_037, 38: VARIANTS_FB_038, 39: VARIANTS_FB_039, 40: VARIANTS_FB_040,
  41: VARIANTS_FB_041, 42: VARIANTS_FB_042, 43: VARIANTS_FB_043, 44: VARIANTS_FB_044,
  45: VARIANTS_FB_045, 46: VARIANTS_FB_046, 47: VARIANTS_FB_047, 48: VARIANTS_FB_048,
  49: VARIANTS_FB_049, 50: VARIANTS_FB_050, 51: VARIANTS_FB_051, 52: VARIANTS_FB_052,
  53: VARIANTS_FB_053, 54: VARIANTS_FB_054, 55: VARIANTS_FB_055, 56: VARIANTS_FB_056,
  57: VARIANTS_FB_057, 58: VARIANTS_FB_058, 59: VARIANTS_FB_059, 60: VARIANTS_FB_060,
  61: VARIANTS_FB_061, 62: VARIANTS_FB_062, 63: VARIANTS_FB_063, 64: VARIANTS_FB_064,
  65: VARIANTS_FB_065,
  66: VARIANTS_FB_066, 67: VARIANTS_FB_067, 68: VARIANTS_FB_068, 69: VARIANTS_FB_069,
  70: VARIANTS_FB_070, 71: VARIANTS_FB_071, 72: VARIANTS_FB_072, 73: VARIANTS_FB_073,
  74: VARIANTS_FB_074, 75: VARIANTS_FB_075, 76: VARIANTS_FB_076, 77: VARIANTS_FB_077,
  78: VARIANTS_FB_078, 79: VARIANTS_FB_079, 80: VARIANTS_FB_080, 81: VARIANTS_FB_081,
  82: VARIANTS_FB_082, 83: VARIANTS_FB_083, 84: VARIANTS_FB_084, 85: VARIANTS_FB_085,
  86: VARIANTS_FB_086, 87: VARIANTS_FB_087,
};

export interface FBShotDef {
  id: string;
  narration: string;
  durationFrames: number;
  variants: VariantDef[];
  section: string;
}

export const FLATBOLD_SHOTS: FBShotDef[] = SHOT_PLAN.map((sp) => ({
  id: sp.id,
  narration: sp.narration,
  durationFrames: sp.durationFrames,
  variants: VARIANT_MAP[sp.shotNum] || [],
  section: sp.section,
}));
