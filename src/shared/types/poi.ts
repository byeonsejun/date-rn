import type { GeoCoord } from "@shared/types/location";

export type PoiCategory = "park" | "culturalSpace" | "dodreamgil";

export interface PoiBase extends GeoCoord {
  id?: string;
  district?: string;
  name: string;
  address?: string;
  imageUrl?: string;
  category: PoiCategory;
}

export interface ParkPoi extends PoiBase {
  category: "park";
}

export interface CulturalSpacePoi extends PoiBase {
  category: "culturalSpace";
}

export interface DodreamgilPoi extends PoiBase {
  category: "dodreamgil";
}

export type Poi = ParkPoi | CulturalSpacePoi | DodreamgilPoi;

export interface MapPoint extends GeoCoord {
  id: string;
  title: string;
  address?: string;
  category: PoiCategory;
}
