import type { District } from '@shared/types/location';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getDistrictLabel } from '@entities/location/lib/label';
import type { SupportedLanguage } from '@shared/i18n';

interface DistrictPickerProps {
  districts: District[];
  selected: string;
  onSelect: (value: string) => void;
}

/**
 * 구 목록을 가로 스크롤로 표시하고, 선택된 구를 시각적으로 강조한다.
 * 스토어·정책 로직 없이 전달받은 props만으로 렌더링하는 순수 UI.
 */
export const DistrictPicker = ({ districts, selected, onSelect }: DistrictPickerProps) => {
  const { i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;

  return (
    <View className="mb-3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 px-1">
          {districts.map((district) => {
            const active = district.location === selected;
            return (
              <Pressable
                key={district.location}
                onPress={() => onSelect(district.location)}
                className={`rounded-full px-3 py-1.5 ${active ? 'bg-[#f986bd]' : 'bg-neutral-100'}`}
              >
                <Text className={`text-sm ${active ? 'font-semibold text-white' : 'text-neutral-700'}`}>
                  {getDistrictLabel(district, language)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
