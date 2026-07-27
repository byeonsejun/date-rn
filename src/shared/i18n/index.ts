import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";

/**
 * 지원 언어 단일 소스(코드 + 토글 표기/접근성 라벨). 새 언어(예: zh) 추가 시
 * 이 배열에 한 항목만 추가하면 `SUPPORTED_LANGUAGES`·`SupportedLanguage` 타입·
 * 토글 세그먼트가 모두 자동 반영된다. (별도로 locales/xx.json 생성 + 아래 `resources`
 * 등록은 필요 — Metro는 런타임 디렉터리 스캔을 지원하지 않아 정적 등록이 필요하다.)
 */
export const LANGUAGES = [
  { code: "ko", label: "KO", a11yLabel: "Switch to Korean" },
  { code: "en", label: "EN", a11yLabel: "Switch to English" },
  { code: "ja", label: "JA", a11yLabel: "Switch to Japanese" },
] as const;

export type SupportedLanguage = (typeof LANGUAGES)[number]["code"];

export const SUPPORTED_LANGUAGES = LANGUAGES.map((l) => l.code) as readonly SupportedLanguage[];

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
      ja: { translation: ja },
    },
    lng: detectDeviceLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
  });
}

export default i18next;
