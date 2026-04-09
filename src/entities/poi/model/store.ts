import { create } from "zustand";

import type { PoiCategory } from "@entities/poi/model/types";

/**
 * POI 관련 전역 선택 상태(필요 시).
 *
 * NOTE: Phase 4에서는 추천 계산이 정적 JSON + 현재 위치 기반으로 동작하므로
 *       이 store는 아직 UI에서 직접 사용하지 않는다.
 *       다만 progress.md 체크리스트 정합을 위해 최소 형태로만 둔다.
 */
export const usePoiStore = create<{
  selectedCategory: PoiCategory | "all";
  setSelectedCategory: (value: PoiCategory | "all") => void;
}>((set) => ({
  selectedCategory: "all",
  setSelectedCategory: (value) => set({ selectedCategory: value }),
}));

