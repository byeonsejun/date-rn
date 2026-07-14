import type { MapRegion } from "@entities/map/model/types";

/** POI 마커 선택 시 마커를 배치할 화면 상단 기준 y 위치 (px) */
export const POI_MARKER_TOP_Y_PX = 240;

/**
 * POI 마커 선택 시 하단 오버레이 상세 카드와 겹치지 않도록, 마커가 화면 상단
 * `POI_MARKER_TOP_Y_PX` 근처에 오게 카메라 중심 위도를 내린다.
 * (지도 마커 직접 탭 `useMapController.handleMarkerPress` · 사이드바 추천 카드
 * `focusPoiFromSidebar` 공통. 동적 mapPadding 대신 이 사전 보정을 사용한다)
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
