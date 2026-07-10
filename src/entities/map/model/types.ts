import type { GeoCoord } from "@shared/types/location";

export type MapType = "전체" | "문화공간" | "공원" | "두드림길";

export type MapPoiCategory = "park" | "culturalSpace" | "dodreamgil";

export type MapPoiKind = "공원" | "문화공간" | "두드림길";

/**
 * @typedef MapRegion
 * react-native-maps에서 사용하는 카메라(region) 값 타입.
 *
 * NOTE: 이 프로젝트에서는 마커 좌표는 `lat/lon`을 내부 표준으로 사용하고,
 * MapView의 `region` 객체는 latitude/longitude로 변환해서 전달한다.
 */
export interface MapRegion extends GeoCoord {
  latitudeDelta: number;
  longitudeDelta: number;
}

export type MapMarkerSource = "currentLocation" | "poi" | "restaurant";

/**
 * 지도 마커 데이터 (엔티티 모델).
 *
 * - `entities/map`은 다른 엔티티 슬라이스를 import하지 않기 위해,
 *   POI 관련 타입을 여기서 독립적으로 정의한다.
 * - 실제 데이터(POI JSON 기반)는 feature/lib에서 `PoiSuggestion` -> 이 모델로 변환한다.
 */
export type MapMarkerData =
  | {
      id: string;
      source: "currentLocation";
      title: "현재 위치";
      lat: number;
      lon: number;
    }
  | {
      id: string;
      source: "poi";
      title: string;
      titleEn?: string;
      category: MapPoiCategory;
      kind: MapPoiKind;
      lat: number;
      lon: number;
      address?: string;
      imageUrl?: string;
      phne?: string;
      detailCourse?: string;
      description?: string;
    }
  | {
      id: string;
      source: "restaurant";
      placeId: string;
      title: string;
      kind: "추천식당";
      lat: number;
      lon: number;
      imageUrl?: string;
      rating: number;
      userRatingsTotal: number;
      openNow: boolean | null;
    };

