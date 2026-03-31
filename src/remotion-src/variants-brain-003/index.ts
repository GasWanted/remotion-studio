import type { VariantDef } from "../types";
import { PeopleGrid } from "./PeopleGrid";
import { ConferenceHall } from "./ConferenceHall";
import { WorldMapPins } from "./WorldMapPins";
import { PhotoWall } from "./PhotoWall";
import { CrowdWave } from "./CrowdWave";
import { NameScroll } from "./NameScroll";
import { CollabNetwork } from "./CollabNetwork";
import { StadiumFill } from "./StadiumFill";
import { Yearbook } from "./Yearbook";

export const VARIANTS_BRAIN_003: VariantDef[] = [
  { id: "people-grid", label: "People Grid", component: PeopleGrid },
  { id: "conference-hall", label: "Conference Hall", component: ConferenceHall },
  { id: "world-map-pins", label: "World Map Pins", component: WorldMapPins },
  { id: "photo-wall", label: "Photo Wall", component: PhotoWall },
  { id: "crowd-wave", label: "Crowd Wave", component: CrowdWave },
  { id: "name-scroll", label: "Name Scroll", component: NameScroll },
  { id: "collab-network", label: "Collab Network", component: CollabNetwork },
  { id: "stadium-fill", label: "Stadium Fill", component: StadiumFill },
  { id: "yearbook", label: "Yearbook", component: Yearbook },
];
