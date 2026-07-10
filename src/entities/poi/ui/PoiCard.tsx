import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import type { PoiSuggestion, PoiCategory } from "@entities/poi/model/types";
import { getPoiDisplayTitle } from "@entities/poi/lib/label";
import { getCategoryLabel } from "@entities/map/lib/label";
import { MAP_TYPE_COLOR } from "@features/map/ui/MapTypeSelector";
import type { SupportedLanguage } from "@shared/i18n";

interface PoiCardProps {
  poi: PoiSuggestion;
  /** 썸네일(또는 이미지 없음 플레이스홀더) 탭 시에만 호출 */
  onPressThumbnail?: () => void;
}

/** 카드 왼쪽 세로 액센트 바 hex — MAP_TYPE_COLOR와 동일 */
const categoryAccentColor: Record<PoiCategory, string> = {
  park: MAP_TYPE_COLOR['공원'],
  culturalSpace: MAP_TYPE_COLOR['문화공간'],
  dodreamgil: MAP_TYPE_COLOR['두드림길'],
};

/**
 * POI 추천 카드 (순수 UI).
 *
 * 사용처:
 * - `features/recommend/ui/RecommendPlace.tsx`에서 `useRecommend()`가 만든 `PoiSuggestion`을 주입받아 렌더링한다.
 *
 * 원칙:
 * - store/hooks 직접 구독 금지
 * - props로 받은 데이터만 렌더링
 * - 탭은 썸네일 영역만 (`onPressThumbnail`)
 */
export const PoiCard = ({ poi, onPressThumbnail }: PoiCardProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const accentColor = categoryAccentColor[poi.category];
  const displayTitle = getPoiDisplayTitle(poi, language);
  const kindLabel = getCategoryLabel(poi.kind, language);

  const secondaryText =
    poi.category === "dodreamgil"
      ? language === "en"
        ? undefined
        : poi.detailCourse
      : poi.address;

  const thumbClassName = "h-[72px] w-[72px] overflow-hidden rounded-xl bg-neutral-100";

  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
      {/* 왼쪽 컬러 액센트 바 */}
      <View style={{ width: 5, alignSelf: 'stretch', backgroundColor: accentColor }} />

      <View className="flex-1 flex-row gap-3 p-3">
        <Pressable
          onPress={onPressThumbnail}
          disabled={!onPressThumbnail}
          accessibilityLabel={t('poi.viewOnMapLabel', { title: displayTitle })}
          accessibilityRole="button"
          className={thumbClassName}
        >
          {poi.imageUrl ? (
            <Image
              source={{ uri: poi.imageUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center">
              <Text className="text-[10px] font-semibold text-neutral-500">
                {kindLabel}
              </Text>
            </View>
          )}
        </Pressable>

        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-sm font-bold text-neutral-900" numberOfLines={1}>
              {displayTitle}
            </Text>
            <View
              style={{ backgroundColor: accentColor + '20', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: accentColor }}>
                {kindLabel}
              </Text>
            </View>
          </View>

          {secondaryText ? (
            <Text className="mt-1 text-xs leading-4 text-neutral-500" numberOfLines={2}>
              {secondaryText}
            </Text>
          ) : null}

          {poi.category !== "dodreamgil" && poi.phne ? (
            <Text className="mt-1.5 text-[11px] font-medium text-neutral-400">
              {t('poi.contactLabel', { phone: poi.phne })}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};
