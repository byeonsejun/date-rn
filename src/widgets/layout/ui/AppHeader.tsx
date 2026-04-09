import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

/**
 * 앱 상단 네비게이션 헤더.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/Header.jsx` (제목 + 네비 영역)
 *    - 모바일에서는 제목·짧은 부제만 표시하고, 향후 `statistics` 등 라우트 링크를 확장할 수 있다.
 *
 * 2. 조립한 Feature
 *    - 없음 (순수 레이아웃 위젯). `expo-router`만 사용한다.
 *
 * 3. 화면에서의 역할
 *    - 탭형 네비게이션(서울데이트/통계)으로 `/` ↔ `/statistics` 전환을 담당한다.
 *    - 홈은 `HomeSidebar`의 `ScrollView` 맨 위, 통계는 `StatisticsView`의 `ScrollView` 맨 위에 두어
 *      헤더가 해당 화면 스크롤과 함께 움직인다.
 */
export const AppHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isStatistics = pathname === '/statistics';
  const isHome = !isStatistics;

  return (
    <View className="border-b border-pink-200 bg-white px-4 py-3">
      <Text className="mb-2 text-xl font-bold text-neutral-900">서울, 너와 함께</Text>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => router.push('/')}
          accessibilityLabel="메인 화면으로 이동"
          className={
            isHome
              ? 'flex-1 items-center rounded-full bg-[#f986bd] px-3 py-2'
              : 'flex-1 items-center rounded-full bg-neutral-100 px-3 py-2'
          }
        >
          <Text className={isHome ? 'text-sm font-semibold text-white' : 'text-sm text-neutral-700'}>
            서울데이트
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/statistics')}
          accessibilityLabel="통계 화면으로 이동"
          className={
            isStatistics
              ? 'flex-1 items-center rounded-full bg-[#f986bd] px-3 py-2'
              : 'flex-1 items-center rounded-full bg-neutral-100 px-3 py-2'
          }
        >
          <Text className={isStatistics ? 'text-sm font-semibold text-white' : 'text-sm text-neutral-700'}>
            통계
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
