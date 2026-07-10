import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

/**
 * 앱 상단 헤더 (타이틀 표시 전용).
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/Header.jsx` (제목 + 네비 영역)
 *
 * 2. 조립한 Feature
 *    - 없음 (순수 레이아웃 위젯).
 *
 * 3. 화면에서의 역할
 *    - 화면 타이틀만 표시한다. 통계 페이지는 데모 데이터라 입구(탭)를 제거했고,
 *      `/statistics`는 라우트에서 홈으로 redirect되므로 헤더의 네비게이션도 두지 않는다.
 *    - 홈은 `HomeSidebar`의 `ScrollView` 맨 위에 두어 헤더가 화면 스크롤과 함께 움직인다.
 */
export const AppHeader = () => {
  const { t } = useTranslation();
  return (
    <View className="border-b border-pink-200 bg-white px-4 py-3">
      <Text className="text-xl font-bold text-neutral-900">{t('common.appName')}</Text>
    </View>
  );
};
