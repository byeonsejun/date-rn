import { useCallback, useMemo } from "react";

import { useLocationStore } from "@entities/location/model/store";
import { useMapStore } from "@entities/map/model/store";
import type { PoiSuggestion } from "@entities/poi/model/types";

import { focusPoiMarkerFromSidebar } from "@features/map/lib/focusPoiFromSidebar";
import {
  getMapMarkerIdForPoiSuggestion,
  mapTypeIncludingPoiCategory,
} from "@features/map/lib/markers";
import { pickRandomPoiSet } from "@features/recommend/lib/recommend";

/**
 * POI 추천 훅 (Orchestrator).
 *
 * 사용처:
 * - `features/recommend/ui/RecommendPlace.tsx`가 이 훅의 결과(`district`, `pois`)만 받아 렌더링한다.
 *
 * - entities/location/model/store에서 현재 위치(구)를 읽는다.
 * - entities/poi의 순수 필터 + 추천(lib)의 순수 랜덤 로직을 조합한다.
 * - feature/ UI는 이 훅의 결과만 props로 주입받는다.
 */
const runAfterFrames = (fn: () => void, frameCount: number): void => {
  if (frameCount <= 0) {
    fn();
    return;
  }
  requestAnimationFrame(() => runAfterFrames(fn, frameCount - 1));
};

export const useRecommend = () => {
  const location = useLocationStore((s) => s.location);
  const myGeoInfo = useLocationStore((s) => s.myGeoInfo);
  const selectedType = useMapStore((s) => s.selectedType);
  const setSelectedType = useMapStore((s) => s.setSelectedType);

  const district = useMemo(() => {
    if (location === "현재 위치") return myGeoInfo?.gu;
    return location;
  }, [location, myGeoInfo]);

  const pois = useMemo(() => {
    if (!district) return [];
    return pickRandomPoiSet(district);
  }, [district]);

  const onPoiCardPress = useCallback(
    (poi: PoiSuggestion) => {
      if (!district) return;
      const nextType = mapTypeIncludingPoiCategory(selectedType, poi);
      const typeWillChange = nextType !== selectedType;
      if (typeWillChange) {
        setSelectedType(nextType);
      }

      const applyFocus = (): void => {
        const mt = useMapStore.getState().selectedType;
        const markerId = getMapMarkerIdForPoiSuggestion({
          district,
          mapType: mt,
          poi,
        });
        if (!markerId) return;
        focusPoiMarkerFromSidebar(markerId, poi);
        const found = useMapStore.getState().showPoint?.find((m) => m.id === markerId && m.source === "poi");
        if (!found) {
          runAfterFrames(() => {
            focusPoiMarkerFromSidebar(markerId, poi);
          }, 2);
        }
      };

      // 필터가 바뀌면 `showPoint`가 다음 프레임들에서 갱신되므로 한 프레임 더 기다린다.
      runAfterFrames(applyFocus, typeWillChange ? 3 : 2);
    },
    [district, selectedType, setSelectedType],
  );

  return { district, pois, onPoiCardPress };
};

