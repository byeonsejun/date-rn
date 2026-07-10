import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@shared/i18n';
import { useLanguageStore } from '@shared/i18n/languageStore';

/** 세그먼트 강조색 — `MapTypeSelector`의 선택 상태 배색을 그대로 재사용 */
const LANGUAGE_TOGGLE_SELECTED_BG = '#f986bd';
const LANGUAGE_TOGGLE_SELECTED_TEXT = '#fff';
const LANGUAGE_TOGGLE_UNSELECTED_TEXT = '#404040';

const LANGUAGE_ACCESSIBILITY_LABEL: Record<SupportedLanguage, string> = {
  ko: 'Switch to Korean',
  en: 'Switch to English',
};

/**
 * 앱 상단 헤더 (타이틀 + 언어 토글).
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/Header.jsx` (제목 + 네비 영역)
 *
 * 2. 조립한 Feature
 *    - `shared/i18n/languageStore`의 `useLanguageStore` — 언어 선택/영속화.
 *
 * 3. 화면에서의 역할
 *    - 타이틀은 좌측, 언어 세그먼트 토글(KO/EN)은 우측에 둔다.
 *    - 통계 페이지는 데모 데이터라 입구(탭)를 제거했고,
 *      `/statistics`는 라우트에서 홈으로 redirect되므로 헤더의 네비게이션도 두지 않는다.
 *    - 홈은 `HomeSidebar`의 `ScrollView` 맨 위에 두어 헤더가 화면 스크롤과 함께 움직인다.
 *    - 언어 세그먼트의 "KO"/"EN" 라벨은 번역 대상이 아니다. 어느 언어 상태든 같은
 *      표기여야 사용자가 토글을 계속 찾을 수 있다.
 */
export const AppHeader = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <View className="flex-row items-center justify-between border-b border-pink-200 bg-white px-4 py-3">
      <Text className="text-xl font-bold text-neutral-900">{t('common.appName')}</Text>
      <View className="flex-row items-center gap-1 rounded-xl bg-neutral-100 p-1">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = lang === language;
          return (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={LANGUAGE_ACCESSIBILITY_LABEL[lang]}
              className="rounded-lg px-3 py-1.5"
              style={{ backgroundColor: isSelected ? LANGUAGE_TOGGLE_SELECTED_BG : 'transparent' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: isSelected ? LANGUAGE_TOGGLE_SELECTED_TEXT : LANGUAGE_TOGGLE_UNSELECTED_TEXT }}
              >
                {lang.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
