/**
 * NOTE:
 * - FSD 규칙에 따라 지도 상태(Zustand store)는 `entities/map/model/store.ts`에 위치한다.
 * - 이 파일은 기존 import 경로(@core/stores/useMapStore)를 깨지 않기 위한 호환용 리다이렉트다.
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx` + `components/SelectShowMapType.jsx`
 */
export { useMapStore } from "@entities/map/model/store";
