import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { MapType } from '@entities/map/model/types';
import { getCategoryLabel } from '@entities/map/lib/label';
import type { SupportedLanguage } from '@shared/i18n';

const MAP_TYPES: MapType[] = ['전체', '문화공간', '공원', '두드림길'];

/** 전체/카테고리별 브랜드 컬러 (앱 전역 공통) */
export const MAP_TYPE_COLOR: Record<MapType, string> = {
  전체: '#f986bd',
  문화공간: '#7f388c',
  공원: '#000080',
  두드림길: '#006400',
};

/**
 * 지도 타입 필터 UI.
 *
 * 원본 출처:
 * - 웹: `components/SelectShowMapType.jsx` (selectType 토글 버튼)
 *
 * 담당 역할 (FSD):
 * - `features/map/ui`: 순수 UI(props-only). 비즈니스 로직/스토어 접근 없음.
 * - 선택 상태/클릭 이벤트는 부모(예: `useMapController`)가 주입한다.
 */
export const MapTypeSelector = (props: { selectedType: MapType; onSelectType: (type: MapType) => void }) => {
  const { selectedType, onSelectType } = props;
  const { i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;

  return (
    <View className="absolute z-10 top-2 left-2 right-2 flex flex-row items-center justify-center">
      <View className="flex-row items-center justify-center gap-2 rounded-xl bg-white/80 px-2 py-2">
        {MAP_TYPES.map((type) => {
          const isSelected = type === selectedType;
          return (
            <Pressable
              key={type}
              onPress={() => onSelectType(type)}
              className="px-3 py-1.5 rounded-lg"
              style={isSelected ? { backgroundColor: MAP_TYPE_COLOR[type] } : { backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Text
                className="text-xs font-semibold"
                style={isSelected ? { color: '#fff' } : { color: '#404040' }}
              >
                {getCategoryLabel(type, language)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
