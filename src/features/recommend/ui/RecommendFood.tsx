import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useMapStore } from '@entities/map/model/store';

import { RestaurantCard } from '@entities/restaurant/ui/RestaurantCard';

import { useRecommendFood } from '@features/recommend/useRecommendFood';

import { Loading } from '@shared/ui/Loading';

/**
 * 맛집 추천 플로팅 패널 (펼침/접힘 + Top 5 리스트).
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/RecommendFood.jsx`
 *
 * 2. 담당 역할
 *    - `features/recommend/ui`: `useRecommendFood`가 넘긴 데이터만 렌더 (스토어/API 직접 호출 없음).
 *
 * 3. 작동 원리 요약
 *    - 접힘 상태에서는 아이콘 버튼만 노출하고, 펼치면 `RestaurantCard` 리스트를 표시한다.
 *    - 스타일 분기는 절대 규칙 4에 따라 `className`에 **리터럴 문자열을 두는 삼항**만 사용한다.
 */

export const RecommendFood = () => {
  const panelRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollViewportHRef = useRef(0);
  const scrollContentHRef = useRef(0);
  const rowLayoutRef = useRef<Record<string, { y: number; height: number }>>({});
  const [panelRightEdgePx, setPanelRightEdgePx] = useState<number | null>(null);

  const onPanelLayout = useCallback((_e: LayoutChangeEvent) => {
    panelRef.current?.measureInWindow((x, _y, w, _h) => {
      if (w > 0) setPanelRightEdgePx(x + w);
    });
  }, []);

  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId);

  const {
    expansion,
    setExpansion,
    restaurants,
    loading,
    fetchError,
    onRestaurantPhotoPress,
  } = useRecommendFood(panelRightEdgePx);

  const restaurantPlaceIdsKey = useMemo(
    () => restaurants.map((r) => r.placeId).join('|'),
    [restaurants],
  );

  const scrollActiveRowToCenter = useCallback(() => {
    if (!selectedMarkerId?.startsWith('place:')) return;
    const placeId = selectedMarkerId.slice('place:'.length);
    const row = rowLayoutRef.current[placeId];
    const vh = scrollViewportHRef.current;
    const contentH = scrollContentHRef.current;
    if (!row || vh <= 0) return;
    const rowCenter = row.y + row.height / 2;
    let y = rowCenter - vh / 2;
    const maxY = Math.max(0, contentH - vh);
    y = Math.max(0, Math.min(maxY, y));
    scrollRef.current?.scrollTo({ y, animated: true });
  }, [selectedMarkerId]);

  useEffect(() => {
    if (!expansion || loading || fetchError || restaurantPlaceIdsKey.length === 0) return;
    if (!selectedMarkerId?.startsWith('place:')) return;
    let innerRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      innerRaf = requestAnimationFrame(() => {
        scrollActiveRowToCenter();
      });
    });
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(innerRaf);
    };
  }, [
    expansion,
    loading,
    fetchError,
    restaurantPlaceIdsKey,
    selectedMarkerId,
    scrollActiveRowToCenter,
  ]);

  const expandedOuterClassName =
    'w-64 max-h-[360px] min-h-[280px] rounded-2xl border border-neutral-200 bg-white p-3 shadow-md';
  const collapsedFabClassName = 'h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 shadow-sm';

  return (
    <View
      ref={panelRef}
      onLayout={onPanelLayout}
      className="absolute bottom-[82px] left-4 z-[5]"
    >
      {expansion ? (
        <View className={expandedOuterClassName}>
          <View className="mb-2 flex-row items-center justify-between pr-1">
            <Text className="text-base font-bold text-neutral-900">추천식당 리스트 Top 5</Text>
            <Pressable onPress={() => setExpansion(false)} className="rounded-lg border border-neutral-200 px-2 py-1">
              <Text className="text-xs font-semibold text-neutral-700">닫기</Text>
            </Pressable>
          </View>

          <View className="mt-1 flex-1 border-t border-neutral-200">
            {loading ? (
              <Loading message="불러오는 중..." size="large" color="#0ea5e9" />
            ) : fetchError ? (
              <Text className="py-4 text-center text-xs text-red-600">{fetchError}</Text>
            ) : (
              <ScrollView
                ref={scrollRef}
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                onLayout={(e) => {
                  scrollViewportHRef.current = e.nativeEvent.layout.height;
                }}
                onContentSizeChange={(_w, h) => {
                  scrollContentHRef.current = h;
                  if (!selectedMarkerId?.startsWith('place:')) return;
                  requestAnimationFrame(() => {
                    scrollActiveRowToCenter();
                  });
                }}
              >
                {restaurants.map((item) => (
                  <View
                    key={item.placeId}
                    onLayout={(e) => {
                      const { y, height } = e.nativeEvent.layout;
                      rowLayoutRef.current[item.placeId] = { y, height };
                    }}
                  >
                    <RestaurantCard
                      name={item.name}
                      rating={item.rating}
                      userRatingsTotal={item.userRatingsTotal}
                      openNow={item.openNow}
                      imageUri={item.imageUri}
                      onPressPhoto={
                        panelRightEdgePx ? () => onRestaurantPhotoPress(item) : undefined
                      }
                      isActive={selectedMarkerId === `place:${item.placeId}`}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setExpansion(true)}
          accessibilityLabel="추천 식당 보기"
          className={collapsedFabClassName}
        >
          <MaterialIcons name="restaurant" size={22} color="#fff" />
        </Pressable>
      )}
    </View>
  );
};
