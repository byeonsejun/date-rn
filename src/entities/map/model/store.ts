import { create } from "zustand";

import type {
  MapMarkerData,
  MapRegion,
  MapType,
} from "@entities/map/model/types";

const DEFAULT_REGION: MapRegion = {
  lat: 37.560825,
  lon: 126.995069,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

/**
 * 지도 도메인 스토어 (Zustand).
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx` + `components/SelectShowMapType.jsx`
 *   (showPoint, marker hover/selected, selectedType 관리)
 *
 * 담당 역할 (FSD):
 * - `entities/map/model`: 지도 화면에서 사용하는 상태의 저장소.
 * - 실제 데이터 생성/필터링/좌표 변환 로직은 `features/map/*`에 둔다.
 *
 * 상태 의미:
 * - `showPoint`: 지도에 표시할 POI 마커 배열 (currentLocation 포함 가능)
 * - `overMarkerId`: 마커 hover 상태 (RN에서는 모바일 UI에서 미사용일 수 있으나 구조 유지)
 * - `selectedMarkerId`: 클릭(선택)된 마커 id
 * - `selectedType`: 공원/문화공간/두드림길 필터
 * - `region`: MapView의 현재 카메라(영역) 상태
 * - `regionProgrammaticAt`: 코드 주도 카메라 이동(setRegionProgrammatic) 시각(ms).
 *   직후에 들어오는 늦은 onRegionChangeComplete가 카메라를 덮어쓰는 경합 판정에 쓴다.
 */
export const useMapStore = create<{
  showPoint: MapMarkerData[] | undefined;
  overMarkerId: string | null;
  selectedMarkerId: string | null;
  selectedType: MapType;
  region: MapRegion;
  regionProgrammaticAt: number;
  setShowPoint: (value: MapMarkerData[] | undefined) => void;
  setOverMarkerId: (value: string | null) => void;
  setSelectedMarkerId: (value: string | null) => void;
  setSelectedType: (value: MapType) => void;
  setRegion: (value: MapRegion) => void;
  /**
   * 코드 주도 카메라 이동 (구 전환/사이드바 POI 포커스/맛집 포커스/bounds 보정).
   * region 갱신과 호출 시각 기록을 한 번에 수행해, 이후 잠금 기간 내
   * onRegionChangeComplete가 이 이동을 덮어쓰지 못하게 한다.
   */
  setRegionProgrammatic: (value: MapRegion) => void;
  /**
   * 웹 로직의 `handleMarker(type, lat)`를 타입 안정화해 이식.
   * - `in`: 마커 hover 진입
   * - `out`: 마커 hover 이탈
   * - `click`: 마커 선택
   */
  handleMarker: (
    type: "in" | "out" | "click",
    markerId: string,
  ) => void;
  /**
   * (전방 호환) 추천 목록/외부 UI에서 특정 마커를 선택했을 때 사용한다.
   * 웹 원본의 `onClickRecommendMaker(lat)`를 map 모델에 맞게 이식.
   */
  onClickRecommendMaker: (markerId: string, _type?: MapType) => void;
}>((set) => ({
  showPoint: undefined,
  overMarkerId: null,
  selectedMarkerId: null,
  selectedType: "전체",
  region: DEFAULT_REGION,
  regionProgrammaticAt: 0,

  setShowPoint: (value) => set({ showPoint: value }),
  setOverMarkerId: (value) => set({ overMarkerId: value }),
  setSelectedMarkerId: (value) => set({ selectedMarkerId: value }),
  setSelectedType: (value) => set({ selectedType: value }),
  setRegion: (value) => set({ region: value }),
  setRegionProgrammatic: (value) => set({ region: value, regionProgrammaticAt: Date.now() }),

  handleMarker: (type, markerId) => {
    switch (type) {
      case "in":
        set({ overMarkerId: markerId });
        return;
      case "out":
        set({ overMarkerId: null });
        return;
      case "click":
        set({ selectedMarkerId: markerId });
        return;
      default:
        return;
    }
  },

  onClickRecommendMaker: (markerId) => {
    set({ selectedMarkerId: markerId, selectedType: "전체" });
  },
}));

