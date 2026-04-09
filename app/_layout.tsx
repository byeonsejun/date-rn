import '../global.css';

import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppProvider } from '@core/providers/AppProvider';

import { RootOverlays } from '@widgets/layout/ui/RootOverlays';

/**
 * 루트 레이아웃: 글로벌 스타일, persist hydration, 스택·전역 오버레이.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/app/layout.jsx` (main + LocationConsent + Toast)
 *
 * 2. 사용 위젯
 *    - `widgets/layout/ui/RootOverlays` — 위치 동의 모달 + 서울 한정 토스트
 *
 * 3. 역할
 *    - `AppProvider`로 스토어 hydration 게이트 유지.
 *    - `AppHeader`는 각 화면의 스크롤 영역 안에 두어(홈: `HomeSidebar`, 통계: `StatisticsView`)
 *      헤더가 콘텐츠와 함께 스크롤되도록 한다 — 여기서는 렌더하지 않는다.
 *    - `Stack`은 `headerShown: false`로 두고, 라우트 콘텐츠(`app/index.tsx` 등)에는 로직을 두지 않는다.
 */
const RootLayout = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    // Edge-to-edge에서도 동작: 밝은 배경 위에 어두운 내비 버튼(뒤로/홈/최근) 유지
    NavigationBar.setStyle('light');
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppProvider>
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
          <View className="flex-1">
            <View className="flex-1">
              <Stack screenOptions={{ headerShown: false }} />
            </View>
            <RootOverlays />
          </View>
        </SafeAreaView>
      </AppProvider>
    </>
  );
};

export default RootLayout;
