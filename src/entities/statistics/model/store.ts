import { create } from "zustand";

import type {
  StatisticsAge,
  StatisticsFilterState,
  StatisticsGenderLabel,
} from "@entities/statistics/model/types";

/**
 * 1. 원본 출처
 * - 웹: `components/ChartComponent.jsx`의 지역/성별/연령 로컬 상태(useState)
 *
 * 2. 담당 역할
 * - 통계 화면 필터(지역/성별/연령) 전역 상태를 관리한다.
 *
 * 3. 작동 원리 요약
 * - Feature 훅이 이 스토어를 구독해 차트 어댑터 계산을 수행하고,
 *   UI 컴포넌트는 필터 값/핸들러를 props로만 전달받는다.
 */
export const useStatisticsStore = create<
  StatisticsFilterState & {
    setLocation: (value: string) => void;
    setGender: (value: StatisticsGenderLabel) => void;
    setAge: (value: StatisticsAge) => void;
  }
>((set) => ({
  location: "중구",
  gender: "남성",
  age: 20,
  setLocation: (value) => set({ location: value }),
  setGender: (value) => set({ gender: value }),
  setAge: (value) => set({ age: value }),
}));
