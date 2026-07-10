import i18n, { type SupportedLanguage } from "@shared/i18n";

import type { MapType } from "@entities/map/model/types";

/**
 * 지도 카테고리 표시 라벨 ("전체"/"공원"/"문화공간"/"두드림길").
 *
 * - `MapType`(전체 포함)과 `PoiKind`/`MapPoiKind`(전체 제외) 양쪽에서 재사용하기 위해
 *   `MapType`을 파라미터 타입으로 사용한다. (`PoiKind`/`MapPoiKind`는 구조적으로 하위 집합)
 * - `i18next.getFixedT`로 요청 언어 고정 `t`를 얻어, React 훅 없이도(예: 목록 map 콜백) 호출 가능하다.
 */
export const getCategoryLabel = (
  category: MapType,
  language: SupportedLanguage,
): string => {
  const t = i18n.getFixedT(language);
  switch (category) {
    case "전체":
      return t("map.category.all");
    case "공원":
      return t("map.category.park");
    case "문화공간":
      return t("map.category.culturalSpace");
    case "두드림길":
      return t("map.category.dodreamgil");
  }
};
