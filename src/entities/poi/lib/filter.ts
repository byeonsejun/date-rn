import type {
  PoiCategory,
  PoiKind,
  PoiSuggestion,
} from "@entities/poi/model/types";

import parkJson from "@entities/poi/model/data/park.json";
import culturalSpaceJson from "@entities/poi/model/data/culturalSpace.json";
import dodreamgilJson from "@entities/poi/model/data/dodreamgil.json";

/**
 * POI 원본(JSON) 최상위 그룹 구조:
 * - `location`: 구 이름
 * - `data`: 해당 구의 POI 배열
 */
type PoiGroup<T> = {
  location: string;
  data: T[];
};

/**
 * POI 원본 JSON의 좌표(latitude/longitude 또는 X/Y)를 숫자로 안전 변환한다.
 * (원본이 문자열/number 혼재일 수 있으므로 isFinite 확인)
 */
const toNumber = (value: unknown): number | undefined => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
};

/** 원본 JSON 설명 필드(HTML)를 지도/텍스트 UI용 평문으로 줄인다. */
const htmlDescriptionToPlain = (raw: string | undefined): string | undefined => {
  if (!raw) return undefined;
  const t = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return t.length > 0 ? t : undefined;
};

/**
 * `category`(park/culturalSpace/dodreamgil) -> UI 표시용 `kind` 매핑.
 * 추천 화면에서 같은 형태로 렌더링하기 위해 정규화한다.
 */
const kindByCategory: Record<PoiCategory, PoiKind> = {
  park: "공원",
  culturalSpace: "문화공간",
  dodreamgil: "두드림길",
};

/**
 * 구 + POI 카테고리에 해당하는 POI 목록을 반환한다.
 *
 * 사용처:
 * - `features/recommend/lib/recommend.ts`에서 랜덤 추천을 만들기 위한 “후보 데이터 생성”
 *
 * (순수 함수)
 *
 * - 공원/문화공간: `location === district` 매칭
 * - 두드림길: `location.includes(district)` 매칭 (원본 웹 로직 재현)
 */
export const filterPoisByDistrict = (
  district: string,
  category: PoiCategory | "all",
): PoiSuggestion[] => {
  const normalizedDistrict = district.trim();
  if (!normalizedDistrict) return [];

  if (category === "park") return filterParkByDistrict(normalizedDistrict);
  if (category === "culturalSpace")
    return filterCulturalSpaceByDistrict(normalizedDistrict);
  if (category === "dodreamgil")
    return filterDodreamgilByDistrict(normalizedDistrict);

  return [
    ...filterCulturalSpaceByDistrict(normalizedDistrict),
    ...filterParkByDistrict(normalizedDistrict),
    ...filterDodreamgilByDistrict(normalizedDistrict),
  ];
};

type ParkRaw = {
  latitude: string | number;
  longitude: string | number;
  p_park: string;
  p_addr?: string;
  p_img?: string;
  p_admintel?: string;
  p_list_content?: string;
  template_url?: string;
  p_name?: string;
  p_park_en?: string;
};

type CulturalSpaceRaw = {
  X_COORD: string | number;
  Y_COORD: string | number;
  FAC_NAME: string;
  address?: string;
  MAIN_IMG?: string;
  PHNE?: string;
  FAC_DESC?: string;
  SUBJCODE?: string;
  HOMEPAGE?: string;
  FAC_NAME_en?: string;
};

type DodreamgilRaw = {
  latitude: string | number;
  longitude: string | number;
  CPI_NAME: string;
  DETAIL_COURSE?: string;
  CONTENT?: string;
  COURSE_CATEGORY_NM?: string;
  LEAD_TIME?: string;
  DISTANCE?: string;
  COURSE_LEVEL?: string;
  COURSE_NAME?: string;
  CPI_NAME_en?: string;
};

const filterParkByDistrict = (district: string): PoiSuggestion[] => {
  const groups = parkJson as PoiGroup<ParkRaw>[];
  const group = groups.find((g) => g.location === district);
  if (!group) return [];

  /**
   * `park.json` -> `PoiSuggestion` 형태로 변환한다.
   * (필터링/랜덤 선택의 대상이 되기 위한 최소 모델 생성)
   */
  return group.data.reduce<PoiSuggestion[]>((acc, p) => {
    const lat = toNumber(p.latitude);
    const lon = toNumber(p.longitude);
    if (lat === undefined || lon === undefined) return acc;

    acc.push({
      category: "park",
      kind: kindByCategory.park,
      title: p.p_park,
      titleEn: p.p_park_en,
      lat,
      lon,
      address: p.p_addr,
      imageUrl: p.p_img,
      phne: p.p_admintel,
      description: htmlDescriptionToPlain(p.p_list_content),
    });
    return acc;
  }, []);
};

const filterCulturalSpaceByDistrict = (district: string): PoiSuggestion[] => {
  const groups = culturalSpaceJson as PoiGroup<CulturalSpaceRaw>[];
  const group = groups.find((g) => g.location === district);
  if (!group) return [];

  /**
   * `culturalSpace.json` -> `PoiSuggestion` 형태로 변환한다.
   * (문화공간 카테고리 후보 데이터)
   */
  return group.data.reduce<PoiSuggestion[]>((acc, c) => {
    const lat = toNumber(c.X_COORD);
    const lon = toNumber(c.Y_COORD);
    if (lat === undefined || lon === undefined) return acc;

    acc.push({
      category: "culturalSpace",
      kind: kindByCategory.culturalSpace,
      title: c.FAC_NAME,
      titleEn: c.FAC_NAME_en,
      lat,
      lon,
      address: c.address,
      imageUrl: c.MAIN_IMG,
      phne: c.PHNE,
      description: htmlDescriptionToPlain(c.FAC_DESC),
    });
    return acc;
  }, []);
};

const filterDodreamgilByDistrict = (district: string): PoiSuggestion[] => {
  const groups = dodreamgilJson as PoiGroup<DodreamgilRaw>[];
  const group = groups.find((g) => g.location.includes(district));
  if (!group) return [];

  /**
   * `dodreamgil.json` -> `PoiSuggestion` 형태로 변환한다.
   * (두드림길은 원본 웹과 동일하게 `includes` 매칭을 사용한다.)
   */
  return group.data.reduce<PoiSuggestion[]>((acc, d) => {
    const lat = toNumber(d.latitude);
    const lon = toNumber(d.longitude);
    if (lat === undefined || lon === undefined) return acc;

    acc.push({
      category: "dodreamgil",
      kind: kindByCategory.dodreamgil,
      title: d.CPI_NAME,
      titleEn: d.CPI_NAME_en,
      lat,
      lon,
      detailCourse: d.DETAIL_COURSE,
      description: htmlDescriptionToPlain(d.CONTENT),
    });
    return acc;
  }, []);
};

