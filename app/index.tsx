import { View } from 'react-native';

import { HomeMap } from '@widgets/home/ui/HomeMap';
import { HomeSidebar } from '@widgets/home/ui/HomeSidebar';

/**
 * 홈 라우트 (`/`) — 화면 조립만 담당.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/app/page.jsx` → `MainSection` (레이아웃만 RN으로 이식)
 *
 * 2. 사용 위젯
 *    - `widgets/home/ui/HomeSidebar`, `widgets/home/ui/HomeMap`
 *
 * 3. 역할
 *    - 비즈니스 로직 없음. 상·하 분할 레이아웃으로 사이드바와 지도를 배치한다.
 */
const Index = () => {
  return (
    <View className="flex-1 flex-col bg-rose-50">
      <View className="min-h-[260px] flex-[4] border-b border-pink-100 bg-white px-4 pt-2">
        <HomeSidebar />
      </View>
      <View className="min-h-[280px] flex-[6]">
        <HomeMap />
      </View>
    </View>
  );
};

export default Index;
