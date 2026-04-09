/**
 * NOTE:
 * - FSD 규칙에 따라 맛집 상태(Zustand store)는 `entities/restaurant/model/store.ts`에 위치한다.
 * - 이 파일은 기존 import 경로(`@core/stores/useRestaurantStore`)를 깨지 않기 위한 호환용 리다이렉트다.
 *
 * 원본 출처:
 * - 웹: `stores/LocationStore.jsx`의 recommendData / expansion
 */
export { useRestaurantStore } from "@entities/restaurant/model/store";
