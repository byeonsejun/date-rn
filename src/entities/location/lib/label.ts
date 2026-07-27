import type { District } from "@shared/types/location";
import type { SupportedLanguage } from "@shared/i18n";

/**
 * 구 이름 표시 라벨.
 * 영어/일본어 모드에서 번역 필드로 치환하고, 값이 없으면 폴백한다.
 * (내부 저장값 `district.location`은 그대로 유지, 표시 시점에만 변환)
 *
 * 일본어 폴백은 `location_ja -> location_en -> location(ko)` 순서다.
 * (일본어 사용자에게는 한국어 원문보다 영어 표기가 더 유용하므로 en을 먼저 시도한다.
 *  자세한 근거는 docs/i18n-cjk-naming.md §6)
 */
export const getDistrictLabel = (
  district: Pick<District, "location" | "location_en" | "location_ja">,
  language: SupportedLanguage,
): string => {
  if (language === "ja") return district.location_ja ?? district.location_en ?? district.location;
  if (language === "en") return district.location_en ?? district.location;
  return district.location;
};
