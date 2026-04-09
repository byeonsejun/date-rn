import type { District, GeoCoord, GeoInfo } from "@shared/types/location";

/**
 * 기존 웹 `service/weather.js#getUserGeoInfo`에서 분해해 사용하던
 * 지오코딩 결과의 최소 주소 컴포넌트 모델.
 */
export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Google Geocoding API 응답에서 실제 사용되는 location 결과 모델.
 */
/**
 * Google Geocoding JSON은 `geometry.location`에 `lng`를 쓴다 (`lon` 아님).
 */
export interface GeocodeResult {
  address_components: AddressComponent[];
  formatted_address?: string;
  geometry: {
    location: GeoCoord & { lng?: number };
  };
}

/**
 * Google Geocoding API의 최소 응답 모델.
 */
export interface ReverseGeocodeResponse {
  plus_code?: {
    compound_code?: string;
  };
  results: GeocodeResult[];
}

/**
 * 기존 웹 코드의 `setMyGeoInfo(result)` 형태를 엔티티 레벨로 명시한 모델.
 */
export interface UserGeoContext extends GeoInfo {
  fullAddress?: string;
  gu?: string;
  dong?: string;
}

export type { District };
