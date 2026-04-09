import type { GeoCoord } from "@shared/types/location";

export interface RestaurantPhotoRef {
  photoReference?: string;
  width?: number;
  height?: number;
}

export interface Restaurant extends GeoCoord {
  id: string;
  name: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  imageBase64?: string;
  photos?: RestaurantPhotoRef[];
}
