import { getRandomIndexItem } from "@shared/lib/random";

import { filterPoisByDistrict } from "@entities/poi/lib/filter";
import type { PoiCategory, PoiSuggestion } from "@entities/poi/model/types";

const pickOneByCategory = (
  district: string,
  category: PoiCategory,
): PoiSuggestion | undefined => {
  /**
   * 특정 구(district) + 특정 카테고리(category)에 대해
   * `filterPoisByDistrict`로 후보 목록을 만든 뒤 1개를 랜덤 선택한다.
   */
  const list = filterPoisByDistrict(district, category);
  return getRandomIndexItem(list);
};

/**
 * 랜덤 추천 세트 생성 (순수 비즈니스 로직).
 *
 * 사용처:
 * - `features/recommend/useRecommend.ts`에서 “오늘 추천 3개”를 만들기 위해 호출된다.
 * - 문화공간 1개
 * - 공원 1개
 * - 두드림길 1개
 */
export const pickRandomPoiSet = (district: string): PoiSuggestion[] => {
  const culture = pickOneByCategory(district, "culturalSpace");
  const park = pickOneByCategory(district, "park");
  const dodreamgil = pickOneByCategory(district, "dodreamgil");

  return [culture, park, dodreamgil].filter(
    (v): v is PoiSuggestion => Boolean(v),
  );
};

