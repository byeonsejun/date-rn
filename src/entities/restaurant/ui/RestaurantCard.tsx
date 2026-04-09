import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { StarRating } from "@shared/ui/StarRating";

/**
 * 맛집 1건 카드 (이름·별점·영업 여부·썸네일).
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/RecommendFood.jsx` 리스트 아이템(`<li>`) 레이아웃
 *
 * 2. 담당 역할
 *    - `entities/restaurant/ui`: props만으로 렌더하는 순수 UI (API·스토어 없음).
 *
 * 3. 작동 원리 요약
 *    - 썸네일은 `expo-image`로 `imageUri`를 표시하고, 탭 시 부모가 주입한 `onPressPhoto`를 호출한다.
 *    - 스타일은 NativeWind 절대 규칙 4에 맞춰 `className`에 **리터럴 문자열만** 두고, 가변 조합은 삼항으로 전체 문자열을 고른다.
 */

export const RestaurantCard = (props: {
  name: string;
  rating: number;
  userRatingsTotal: number;
  openNow: boolean | null;
  imageUri: string;
  onPressPhoto?: () => void;
  /** 지도에서 선택된 맛집 행 강조 */
  isActive?: boolean;
}) => {
  const { name, rating, userRatingsTotal, openNow, imageUri, onPressPhoto, isActive } = props;
  const [imageError, setImageError] = useState(false);

  const openStatusText =
    openNow === null
      ? "정보 없음"
      : openNow
        ? "영업중"
        : "영업 종료";

  const rowClassName = isActive
    ? "w-full min-h-[80px] flex-row justify-between py-2 pl-2 bg-sky-50"
    : "border-b border-neutral-200 w-full min-h-[80px] flex-row justify-between py-2";

  const titleClassName = isActive
    ? "text-base font-semibold text-sky-900"
    : "text-base text-neutral-900";

  const openStatusClassName = isActive
    ? "text-xs text-sky-600"
    : "text-xs text-neutral-500";

  return (
    <View className="w-full">
      {isActive ? <View className="h-0.5 w-full bg-sky-500" /> : null}
      <View className={rowClassName}>
        <View className="flex-1 pr-2">
          <Text className={titleClassName} numberOfLines={1}>
            {name}
          </Text>
          <View className="mt-0.5 flex-row flex-wrap items-center gap-1">
            <Text className="text-xs text-neutral-600">{rating}</Text>
            <StarRating value={rating} size={12} />
            <Text className="text-xs text-neutral-600">
              {`(${userRatingsTotal})`}
            </Text>
          </View>
          <Text className={openStatusClassName}>{openStatusText}</Text>
        </View>
        <Pressable
          onPress={onPressPhoto}
          disabled={!onPressPhoto}
          className="h-20 w-[84px] overflow-hidden rounded-lg bg-neutral-100"
        >
          {imageUri.length > 0 && !imageError ? (
            <Image
              source={{ uri: imageUri }}
              className="h-full w-full"
              resizeMode="cover"
              accessibilityLabel={name}
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-[10px] text-neutral-400">이미지 없음</Text>
            </View>
          )}
        </Pressable>
      </View>
      {isActive ? <View className="h-0.5 w-full bg-sky-500" /> : null}
    </View>
  );
};
