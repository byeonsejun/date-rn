import { create } from "zustand";

import type { Restaurant } from "@entities/restaurant/model/types";

/**
 * 맛집(추천 식당) 패널 전역 상태 (Zustand).
 *
 * 1. 원본 출처
 *    - 웹: `stores/LocationStore.jsx`에 있던 `recommendData`, `expansion`, setter들
 *    - RN 초기: `core/stores/useRestaurantStore.ts` → Phase 6에서 본 파일로 이동
 *
 * 2. 담당 역할
 *    - `entities/restaurant/model/store.ts`: 맛집 목록 캐시·패널 펼침 여부만 보관
 *    - API 호출·좌표 결정은 `features/recommend/useRecommendFood.ts`가 담당
 *
 * 3. 작동 원리 요약
 *    - 훅이 `fetchRestaurantsNearCoordinate`로 받은 배열을 `setRecommendData`로 넣고,
 *      UI는 `recommendData`와 `expansion`만 구독해 렌더링한다.
 */
export const useRestaurantStore = create<{
  recommendData: Restaurant[] | undefined;
  expansion: boolean;
  setRecommendData: (value: Restaurant[] | undefined) => void;
  setExpansion: (value: boolean) => void;
}>((set) => ({
  recommendData: undefined,
  expansion: false,
  setRecommendData: (value) => set({ recommendData: value }),
  setExpansion: (value) => set({ expansion: value }),
}));
