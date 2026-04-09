import { ScrollView, Text, View } from 'react-native';

import { PoiCard } from '@entities/poi/ui/PoiCard';
import { useRecommend } from '@features/recommend/useRecommend';

/**
 * POI 추천 리스트 UI.
 *
 * 사용처:
 * - Phase 4에서 “현재 위치/구” 기준으로 추천된 `PoiSuggestion[]`을 리스트로 보여준다.
 *   (정책/필터/랜덤은 훅 `useRecommend`에서 수행)
 *
 * - 계산/필터링 로직 없음 (useRecommend 결과를 props로 주입)
 * - 각 항목은 PoiCard에 위임
 */
export const RecommendPlace = () => {
  const { district, pois, onPoiCardPress } = useRecommend();

  const headerNode = district ? (
    <Text className="text-xs font-medium text-neutral-500">{district}</Text>
  ) : (
    <Text className="text-xs font-medium text-neutral-400">위치 필요</Text>
  );

  const listNode =
    pois.length > 0 ? (
      pois.map((poi) => (
        <PoiCard
          key={`${poi.kind}-${poi.title}-${poi.lat}-${poi.lon}`}
          poi={poi}
          onPressThumbnail={() => onPoiCardPress(poi)}
        />
      ))
    ) : (
      <Text className="text-xs text-neutral-500">추천 데이터를 불러오는 중입니다.</Text>
    );

  return (
    <View className="w-full h-[345px] overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm flex flex-col gap-2 p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-neutral-900">오늘 추천 데이트 장소</Text>
        {headerNode}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-2">{listNode}</View>
      </ScrollView>
    </View>
  );
};
