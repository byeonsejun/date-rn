import type { PoiCategory, PoiSuggestion } from "@entities/poi/model/types";
import { filterPoisByDistrict } from "@entities/poi/lib/filter";

import type {
  MapMarkerData,
  MapPoiCategory,
  MapType,
} from "@entities/map/model/types";

const mapTypeToPoiCategory: Record<MapType, PoiCategory | "all"> = {
  전체: "all",
  문화공간: "culturalSpace",
  공원: "park",
  두드림길: "dodreamgil",
};

const poiCategoryToMapType: Record<PoiCategory, MapType> = {
  park: "공원",
  culturalSpace: "문화공간",
  dodreamgil: "두드림길",
};

const poisEqualForMarker = (a: PoiSuggestion, b: PoiSuggestion): boolean =>
  a.category === b.category &&
  a.title === b.title &&
  a.lat.toFixed(6) === b.lat.toFixed(6) &&
  a.lon.toFixed(6) === b.lon.toFixed(6);

/**
 * `buildMapMarkers`와 동일한 district + 필터 기준으로 목록을 만들고,
 * 해당 POI의 마커 id(`poi:lat,lon#index`)를 반환한다. (사이드바 추천 카드 ↔ 지도 연동)
 */
export const getMapMarkerIdForPoiSuggestion = (params: {
  district: string;
  mapType: MapType;
  poi: PoiSuggestion;
}): string | null => {
  const normalizedDistrict = params.district.trim();
  if (!normalizedDistrict) return null;
  const poiCategory = mapTypeToPoiCategory[params.mapType];
  const list = filterPoisByDistrict(normalizedDistrict, poiCategory);
  const idx = list.findIndex((p) => poisEqualForMarker(p, params.poi));
  if (idx < 0) return null;
  return makePoiMarkerId(params.poi.lat, params.poi.lon, idx);
};

/**
 * 현재 지도 필터가 이 POI를 포함하지 않으면, 마커 id를 계산할 수 있는 `MapType`으로 맞춘다.
 */
export const mapTypeIncludingPoiCategory = (
  selectedType: MapType,
  poi: PoiSuggestion,
): MapType => {
  if (selectedType === "전체") return "전체";
  const allowed = mapTypeToPoiCategory[selectedType];
  if (allowed === "all" || allowed === poi.category) return selectedType;
  return poiCategoryToMapType[poi.category];
};

/**
 * 좌표를 안정적인 마커 id로 만들기 위한 문자열 키 생성.
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx`에서 `key`/`lat` 기반으로 마커를 식별하던 방식
 *
 * 담당 역할 (FSD):
 * - `features/map/lib`: 순수 비즈니스 로직(가공/정규화)만 담당한다.
 */
const makeMarkerId = (
  source: "currentLocation" | "poi",
  lat: number,
  lon: number,
): string => {
  // 소수점 자리수를 고정해 마커 선택/호버 id가 흔들리지 않게 한다.
  const latKey = lat.toFixed(6);
  const lonKey = lon.toFixed(6);
  return `${source}:${latKey},${lonKey}`;
};

/**
 * POI는 서로 다른 장소가 동일 좌표(또는 toFixed(6) 충돌)를 가질 수 있어
 * 좌표만으로는 id가 중복될 수 있다. 배열 인덱스로 항상 유일하게 만든다.
 */
const makePoiMarkerId = (
  lat: number,
  lon: number,
  index: number,
): string => {
  return `${makeMarkerId("poi", lat, lon)}#${index}`;
};

/**
 * POI 후보(PoiSuggestion[])를 react-native-maps Marker에 필요한 지도 마커 모델로 변환한다.
 *
 * 사용처:
 * - `features/map/useMapController.ts`에서 `showPoint`(지도 마커 배열)를 생성한다.
 *
 * FSD 역할:
 * - Entity 데이터(POI JSON)를 `filterPoisByDistrict`로 필터링한 뒤,
 *   `entities/map/model/types`의 `MapMarkerData`로 정규화한다.
 * - store/hook 의존이 없는 순수 함수다.
 *
 * @param district - 구 이름. (예: "중구")
 * @param mapType - 지도 필터 타입 ("전체"/"문화공간"/"공원"/"두드림길")
 * @param currentLocation - "현재 위치" 마커 표시를 위한 좌표(선택)
 */
export const buildMapMarkers = (
  params: {
    district: string;
    mapType: MapType;
    currentLocation?: { lat: number; lon: number } | null;
  },
): MapMarkerData[] => {
  const { district, mapType, currentLocation } = params;
  const normalizedDistrict = district.trim();

  const currentMarker = currentLocation
    ? {
        id: makeMarkerId("currentLocation", currentLocation.lat, currentLocation.lon),
        source: "currentLocation" as const,
        title: "현재 위치" as const,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
      }
    : null;

  if (!normalizedDistrict) {
    return currentMarker ? [currentMarker] : [];
  }

  const poiCategory = mapTypeToPoiCategory[mapType];
  const pois: PoiSuggestion[] = filterPoisByDistrict(
    normalizedDistrict,
    poiCategory,
  );

  const poiMarkers: MapMarkerData[] = pois.map((poi, index) => {
    const category = poi.category as MapPoiCategory;

    return {
      id: makePoiMarkerId(poi.lat, poi.lon, index),
      source: "poi",
      title: poi.title,
      category,
      kind: poi.kind,
      lat: poi.lat,
      lon: poi.lon,
      address: poi.address,
      imageUrl: poi.imageUrl,
      phne: poi.phne,
      detailCourse: poi.detailCourse,
      description: poi.description,
    };
  });

  return currentMarker ? [currentMarker, ...poiMarkers] : poiMarkers;
};

