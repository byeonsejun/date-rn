import type { District } from "@shared/types/location";
import type { SupportedLanguage } from "@shared/i18n";

/**
 * 구 이름 표시 라벨.
 * 영어 모드에서만 `location_en`으로 치환하고, 값이 없으면 한국어로 폴백한다.
 * (내부 저장값 `district.location`은 그대로 유지, 표시 시점에만 변환)
 */
export const getDistrictLabel = (
  district: Pick<District, "location" | "location_en">,
  language: SupportedLanguage,
): string => {
  if (language === "en" && district.location_en) return district.location_en;
  return district.location;
};
