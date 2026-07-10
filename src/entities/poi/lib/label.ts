import type { SupportedLanguage } from "@shared/i18n";

/**
 * POI 표시 title.
 * 영어 모드에서만 `titleEn`으로 치환하고, 값이 없으면 한국어 title로 폴백한다.
 * (내부 저장값 `title`은 그대로 유지, 표시 시점에만 변환)
 */
export const getPoiDisplayTitle = (
  poi: { title: string; titleEn?: string },
  language: SupportedLanguage,
): string => {
  if (language === "en" && poi.titleEn) return poi.titleEn;
  return poi.title;
};
