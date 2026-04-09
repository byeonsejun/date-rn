import type { GeoCoord } from "@shared/types/location";

export type PoiCategory = "park" | "culturalSpace" | "dodreamgil";

export type PoiKind = "공원" | "문화공간" | "두드림길";

/**
 * 추천 화면에 필요한 POI 최종 모델.
 * (원본 JSON의 필드명을 UI 친화적인 형태로 정규화한 모델)
 */
export interface PoiSuggestion extends GeoCoord {
  category: PoiCategory;
  kind: PoiKind;
  title: string;
  address?: string;
  imageUrl?: string;
  phne?: string;

  /**
   * 두드림길 상세 코스 문자열.
   * (공원/문화공간에서는 undefined)
   */
  detailCourse?: string;

  /**
   * 공원 `p_list_content`, 문화공간 `FAC_DESC`, 두드림길 `CONTENT` 등 본문 설명.
   * (필터 단계에서 HTML 태그는 제거한 평문으로 정규화한다.)
   */
  description?: string;
}

