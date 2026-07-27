import type { SupportedLanguage } from "@shared/i18n";

/**
 * POI 표시 title.
 * 영어/일본어 모드에서 번역 필드로 치환하고, 값이 없으면 폴백한다.
 * (내부 저장값 `title`은 그대로 유지, 표시 시점에만 변환)
 *
 * 일본어 폴백은 `titleJa -> titleEn -> title(ko)` 순서다.
 * (일본어 사용자에게는 한국어 원문보다 영어 표기가 더 유용하므로 en을 먼저 시도한다.
 *  자세한 근거는 docs/i18n-cjk-naming.md §6)
 */
export const getPoiDisplayTitle = (
  poi: { title: string; titleEn?: string; titleJa?: string },
  language: SupportedLanguage,
): string => {
  if (language === "ja") return poi.titleJa ?? poi.titleEn ?? poi.title;
  if (language === "en") return poi.titleEn ?? poi.title;
  return poi.title;
};
