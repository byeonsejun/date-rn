import type { MapRegion } from "@entities/map/model/types";

/** `useMapController`의 POI 마커 탭 시 카메라 보정과 동일 (화면 상단 여백 px) */
export const POI_MARKER_TOP_Y_PX = 240;

/**
 * POI 마커 선택 시 상세 카드와 겹치지 않도록, 마커가 화면 상단 `POI_MARKER_TOP_Y_PX` 근처에 오게
 * 카메라 중심 위도를 내린다. (지도 탭·사이드바 추천 카드 공통)
 */
export const computePoiMarkerRegionFocus = (
  poi: { lat: number; lon: number },
  region: Pick<MapRegion, "latitudeDelta" | "longitudeDelta">,
  screenHeight: number,
): MapRegion => {
  const latOffset =
    (screenHeight / 2 - POI_MARKER_TOP_Y_PX) * (region.latitudeDelta / screenHeight);
  return {
    lat: poi.lat - latOffset,
    lon: poi.lon,
    latitudeDelta: region.latitudeDelta,
    longitudeDelta: region.longitudeDelta,
  };
};
