import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ko from "./locales/ko.json";

/**
 * 지원 언어 목록. 새 언어(예: ja, zh) 추가 시:
 * 1) locales/xx.json 생성
 * 2) 아래 `resources`와 `SUPPORTED_LANGUAGES`에 한 줄씩 등록
 * (Metro는 런타임 디렉터리 스캔을 지원하지 않아 정적 등록이 필요하다.)
 */
export const SUPPORTED_LANGUAGES = ["ko", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "ko";

const isSupportedLanguage = (value: string | null | undefined): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value ?? "");

/** 기기 언어를 감지하되, 지원하지 않는 언어면 `DEFAULT_LANGUAGE`로 폴백한다. */
export const detectDeviceLanguage = (): SupportedLanguage => {
  const deviceLanguageCode = getLocales()[0]?.languageCode;
  return isSupportedLanguage(deviceLanguageCode) ? deviceLanguageCode : DEFAULT_LANGUAGE;
};

if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
    },
    lng: detectDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
  });
}

export default i18next;
