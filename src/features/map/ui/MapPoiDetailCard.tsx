import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import type { MapMarkerData } from '@entities/map/model/types';

interface MapPoiDetailCardProps {
  marker: MapMarkerData;
  onClose: () => void;
  onOpenMaps?: () => void;
  onOpenDirections?: () => void;
}

/**
 * 마커 선택 시 POI/현재위치 요약 패널 (지도 위 오버레이).
 *
 * 1. 원본 출처
 *    - 웹: `GoogleMapContainer.jsx` 마커 클릭 시 정보창/패널 패턴
 *
 * 2. 역할
 *    - `buildMapMarkers`가 넣은 `title`, `description`, `detailCourse`, `address`, `imageUrl`, `phne` 표시
 *
 * 3. 용도
 *    - `MapView`가 props로만 조립한다 (절대 규칙 5).
 */
export const MapPoiDetailCard = ({ marker, onClose, onOpenMaps, onOpenDirections }: MapPoiDetailCardProps) => {
  if (marker.source === 'currentLocation') {
    return (
      <View className="min-h-[120px] max-h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
        <View className="mb-2 flex-row items-center justify-between border-b border-neutral-100 p-3">
          <Text className="text-base font-semibold text-neutral-900">현재 위치</Text>
          <Pressable onPress={onClose} accessibilityLabel="패널 닫기" className="rounded-lg bg-neutral-100 px-2 py-1">
            <Text className="text-xs font-medium text-neutral-700">닫기</Text>
          </Pressable>
        </View>
        <ScrollView
          className="flex-1 px-3 pr-6"
          contentContainerStyle={{ paddingBottom: 12 }}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-sm text-neutral-600">지도에서 현재 위치를 표시합니다.</Text>
        </ScrollView>
      </View>
    );
  }
  if (marker.source === 'restaurant') {
    const openStatusText = marker.openNow === null ? '정보 없음' : marker.openNow ? '영업중' : '영업 종료';
    return (
      <View className="min-h-[120px] max-h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
        <View className="flex-row items-start gap-3 border-b border-neutral-100 p-3">
          {marker.imageUrl ? (
            <Image source={{ uri: marker.imageUrl }} className="h-16 w-16 rounded-xl bg-neutral-100" resizeMode="cover" />
          ) : (
            <View className="h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
              <Text className="text-xs text-neutral-500">식당</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-neutral-900" numberOfLines={2}>
              {marker.title}
            </Text>
            <Text className="mt-1 text-xs text-neutral-500">
              {`평점 ${marker.rating.toFixed(1)} (${marker.userRatingsTotal})`}
            </Text>
            <Text className="mt-1 text-xs text-neutral-600">{openStatusText}</Text>
          </View>
          <Pressable onPress={onClose} accessibilityLabel="패널 닫기" className="rounded-lg bg-neutral-100 px-2 py-1">
            <Text className="text-xs font-medium text-neutral-700">닫기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const bodyParts: string[] = [];
  if (marker.description) {
    bodyParts.push(marker.description);
  }
  if (marker.category === 'dodreamgil' && marker.detailCourse?.trim()) {
    bodyParts.push(marker.detailCourse.trim());
  }
  if (marker.address) {
    bodyParts.push(marker.address);
  }
  const bodyText = bodyParts.length > 0 ? bodyParts.join('\n\n') : '상세 정보가 없습니다.';

  return (
    <View className="min-h-[120px] max-h-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
      <View className="flex-row items-start gap-3 border-b border-neutral-100 p-3">
        {marker.imageUrl ? (
          <Image source={{ uri: marker.imageUrl }} className="h-16 w-16 rounded-xl bg-neutral-100" resizeMode="cover" />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-neutral-100">
            <Text className="text-xs text-neutral-500">{marker.kind}</Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="text-base font-semibold text-neutral-900" numberOfLines={2}>
            {marker.title}
          </Text>
          <Text className="mt-1 text-xs text-neutral-500">{marker.kind}</Text>
          {marker.phne ? <Text className="mt-1 text-xs text-neutral-600">{marker.phne}</Text> : null}
        </View>
        <Pressable onPress={onClose} accessibilityLabel="패널 닫기" className="rounded-lg bg-neutral-100 px-2 py-1">
          <Text className="text-xs font-medium text-neutral-700">닫기</Text>
        </Pressable>
      </View>
      <ScrollView
        className="flex-1 px-3 py-2 pr-6"
        contentContainerStyle={{ paddingBottom: 12 }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-sm leading-5 text-neutral-700">{bodyText}</Text>
      </ScrollView>
      {(onOpenMaps || onOpenDirections) ? (
        <View className="flex-row gap-2 border-t border-neutral-100 px-3 py-2">
          {onOpenMaps ? (
            <Pressable
              onPress={onOpenMaps}
              className="flex-1 items-center rounded-xl bg-neutral-700 py-2"
              accessibilityLabel="구글맵에서 보기"
            >
              <Text className="text-sm font-semibold text-white">지도</Text>
            </Pressable>
          ) : null}
          {onOpenDirections ? (
            <Pressable
              onPress={onOpenDirections}
              className="flex-1 items-center rounded-xl bg-sky-500 py-2"
              accessibilityLabel="길찾기"
            >
              <Text className="text-sm font-semibold text-white">길찾기</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
