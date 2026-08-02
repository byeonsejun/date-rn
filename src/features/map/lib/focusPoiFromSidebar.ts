import { Dimensions } from "react-native";

import { useMapStore } from "@entities/map/model/store";
import type { PoiSuggestion } from "@entities/poi/model/types";
import type { MapMarkerData, MapRegion } from "@entities/map/model/types";
import { computePoiMarkerRegionFocus } from "@features/map/lib/poiMarkerCamera";

/**
 * 사이드바「오늘 추천 데이트 장소」에서 썸네일을 탭했을 때,
 * 해당 마커를 선택하고 지도를 마커 좌표로 이동한다.
 *
 * POI 상세는 화면 하단 오버레이 카드로 표시되므로,
 * 마커가 카드에 가리지 않도록 `computePoiMarkerRegionFocus`로
 * region 중심 위도를 미리 보정한다. (동적 mapPadding은 SDK 카메라 경합 때문에 사용하지 않는다)
 * `showPoint` 갱신 전이면 임시 마커를 주입해 상세 카드가 즉시 렌더되도록 한다.
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
      titleEn: fallbackPoi.titleEn,
      titleJa: fallbackPoi.titleJa,
      titleZh: fallbackPoi.titleZh,
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

  // 마커가 하단 상세 카드에 가리지 않도록 카드 높이를 고려해 중심 위도를 보정한다.
  const next: MapRegion = computePoiMarkerRegionFocus(
    { lat, lon },
    map.region,
    Dimensions.get("window").height,
  );
  // programmatic 이동으로 기록해, 직후의 늦은 onRegionChangeComplete
  // (직전 pan 감속)가 이 이동을 덮어쓰지 못하게 한다.
  map.setRegionProgrammatic(next);
};
