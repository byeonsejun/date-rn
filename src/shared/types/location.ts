export interface GeoCoord {
  lat: number;
  lon: number;
}

export interface District extends GeoCoord {
  location: string;
}

export interface GeoInfo extends GeoCoord {
  district: string;
  city?: string;
  country?: string;
  isSeoul?: boolean;
}
