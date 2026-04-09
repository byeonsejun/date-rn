/**
 * 1. 원본 출처
 * - 웹: `portfolio-next/data/chartData.json`, `service/chart.js`, `components/ChartComponent.jsx`
 *
 * 2. 담당 역할
 * - 통계 차트 도메인의 원본 레코드/필터/집계 타입 계약을 정의한다.
 *
 * 3. 작동 원리 요약
 * - Entity API가 반환하는 raw 레코드 타입과 Feature 어댑터가 소비하는 필터 타입을
 *   명시적으로 분리해 UI/비즈니스 계층 간 의존을 고정한다.
 */
export type StatisticsGenderKey = "male" | "female";

export type StatisticsGenderLabel = "남성" | "여성";

export type StatisticsAge = 10 | 20 | 30 | 40 | 50 | 60;

export type StatisticsPlaceType = "cultural" | "park" | "dodreamgil";

export interface StatisticsRecord {
  title: string;
  place: StatisticsPlaceType;
  gender: StatisticsGenderKey;
  age: StatisticsAge;
}

export interface StatisticsLocationData {
  location: string;
  data: {
    male: StatisticsRecord[];
    female: StatisticsRecord[];
  };
}

export interface StatisticsFilterState {
  location: string;
  gender: StatisticsGenderLabel;
  age: StatisticsAge;
}
