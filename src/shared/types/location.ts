export interface GeoCoord {
  lat: number;
  lon: number;
}

export interface District extends GeoCoord {
  location: string;
  location_en?: string;
  location_ja?: string;
  location_zh?: string;
}

export interface GeoInfo extends GeoCoord {
  district: string;
  city?: string;
  country?: string;
  isSeoul?: boolean;
}
