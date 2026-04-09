import { useMapStore } from "@entities/map/model/store";
import type { PoiSuggestion } from "@entities/poi/model/types";
import type { MapMarkerData, MapRegion } from "@entities/map/model/types";

/**
 * 사이드바「오늘 추천 데이트 장소」에서 썸네일을 탭했을 때,
 * 해당 마커를 선택하고 지도를 마커 좌표로 단순 중앙 정렬한다.
 *
 * POI 상세는 Callout(마커 좌표 위 말풍선)으로 표시하므로
 * 하단 모달 회피를 위한 세로 오프셋이 더 이상 필요 없다.
 * `showPoint` 갱신 전이면 임시 마커를 주입해 Callout이 즉시 렌더되도록 한다.
 */
export const focusPoiMarkerFromSidebar = (
  markerId: string,
  fallbackPoi: PoiSuggestion,
): void => {
  const map = useMapStore.getState();
  map.setSelectedMarkerId(markerId);

  const found = map.showPoint?.find((m) => m.id === markerId && m.source === "poi");
  const lat = found ? found.lat : fallbackPoi.lat;
  const lon = found ? found.lon : fallbackPoi.lon;

  // `showPoint`(POI 목록)이 아직 준비되지 않은 타이밍이면,
  // 선택된 POI 마커가 바로 렌더되도록 임시 마커를 주입한다.
  if (!found) {
    const focusMarker: MapMarkerData = {
      id: markerId,
      source: "poi",
      title: fallbackPoi.title,
      category: fallbackPoi.category,
      kind: fallbackPoi.kind,
      lat: fallbackPoi.lat,
      lon: fallbackPoi.lon,
      address: fallbackPoi.address,
      imageUrl: fallbackPoi.imageUrl,
      phne: fallbackPoi.phne,
      detailCourse: fallbackPoi.detailCourse,
      description: fallbackPoi.description,
    };

    const nextShowPoint = map.showPoint ? [...map.showPoint] : [];
    if (!nextShowPoint.some((m) => m.id === markerId)) nextShowPoint.unshift(focusMarker);
    map.setShowPoint(nextShowPoint.length > 0 ? nextShowPoint : undefined);
  }

  const { latitudeDelta, longitudeDelta } = map.region;
  const next: MapRegion = { lat, lon, latitudeDelta, longitudeDelta };
  map.setRegion(next);
};
