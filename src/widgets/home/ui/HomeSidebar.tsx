import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { DistrictPicker } from "@features/location/ui/DistrictPicker";
import { useDistrictSelect } from "@features/location/useDistrictSelect";
import { RecommendPlace } from "@features/recommend/ui/RecommendPlace";
import { WeatherPanel } from "@features/weather/ui/WeatherPanel";
import { AppHeader } from "@widgets/layout/ui/AppHeader";

/**
 * 홈 화면 좌측·상단 사이드바 (구 선택, 날씨, POI 추천).
 *
 * 1. 원본 출처
 *    - 웹: `Aside.jsx` 등 메인 레이아웃 좌측 패널 (District + Weather + RecommendPlace 대응)
 *
 * 2. 조립한 Feature
 *    - `features/location`: `DistrictPicker` + `useDistrictSelect` (구 목록·선택 핸들러)
 *    - `features/weather`: `WeatherPanel` (내부에서 `useWeather` 사용)
 *    - `features/recommend`: `RecommendPlace` (내부에서 `useRecommend` 사용)
 *
 * 3. 화면에서의 역할
 *    - `AppHeader`를 스크롤 맨 위에 두어 지역/날씨/추천과 함께 스크롤되고, 지도는 홈 레이아웃에서 별도 고정 영역으로 둔다.
 *    - 위 세 블록을 세로로 스크롤 가능한 영역에 배치한다.
 *    - 서로 다른 Feature 슬라이스를 **widgets에서만** 한 화면에 묶는다 (feature 간 직접 import 없음).
 */
export const HomeSidebar = () => {
  const { t } = useTranslation();
  const { allDistrictInfo, location, handleSelect } = useDistrictSelect();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-4">
        <AppHeader />
      </View>

      <View className="mb-4">
        <Text className="mb-2 text-sm font-semibold text-neutral-700">
          {t('home.districtSelectTitle')}
        </Text>
        <DistrictPicker
          districts={allDistrictInfo}
          selected={location}
          onSelect={handleSelect}
        />
      </View>

      <View className="mb-0">
        <Text className="mb-2 text-sm font-semibold text-neutral-700">
          {t('home.weatherSectionTitle')}
        </Text>
        <WeatherPanel />
      </View>

      <RecommendPlace />
    </ScrollView>
  );
};
