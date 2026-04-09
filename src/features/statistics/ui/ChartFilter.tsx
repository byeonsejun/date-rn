import { Pressable, ScrollView, Text, View } from "react-native";

import { Select } from "@shared/ui/Select";

import type { StatisticsGenderLabel } from "@entities/statistics/model/types";

interface ChartFilterProps {
  location: string;
  gender: StatisticsGenderLabel;
  age: string;
  locationOptions: { label: string; value: string }[];
  genderOptions: { label: StatisticsGenderLabel; value: StatisticsGenderLabel }[];
  ageOptions: { label: string; value: string }[];
  onChangeLocation: (value: string) => void;
  onChangeGender: (value: StatisticsGenderLabel) => void;
  onChangeAge: (value: string) => void;
}

/**
 * 시안 A: 지역은 가로 스크롤 칩, 성별·연령은 컴팩트 세그먼트 행.
 */
export const ChartFilter = ({
  location,
  gender,
  age,
  locationOptions,
  genderOptions,
  ageOptions,
  onChangeLocation,
  onChangeGender,
  onChangeAge,
}: ChartFilterProps) => {
  return (
    <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        통계 지역
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", flexWrap: "nowrap", gap: 8, paddingBottom: 4 }}
      >
        {locationOptions.map((opt) => {
          const active = opt.value === location;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChangeLocation(opt.value)}
              className={`rounded-full px-4 py-2.5 ${active ? "bg-[#f986bd]" : "bg-neutral-100"}`}
            >
              <Text className={`text-sm font-medium ${active ? "text-white" : "text-neutral-800"}`}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="mt-4 flex-row flex-wrap gap-4">
        <View className="min-w-[140px] flex-1 gap-2">
          <Text className="text-xs font-semibold text-neutral-500">성별</Text>
          <Select options={genderOptions} value={gender} onChange={onChangeGender} />
        </View>
        <View className="min-w-[140px] flex-1 gap-2">
          <Text className="text-xs font-semibold text-neutral-500">연령대</Text>
          <Select options={ageOptions} value={age} onChange={onChangeAge} />
        </View>
      </View>
    </View>
  );
};
