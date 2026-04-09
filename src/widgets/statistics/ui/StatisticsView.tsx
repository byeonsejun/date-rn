import { ScrollView, Text, View } from "react-native";

import { ChartCard } from "@entities/statistics/ui/ChartCard";

import type { StatisticsAge } from "@entities/statistics/model/types";

import { useStatistics } from "@features/statistics/useStatistics";
import { BarChart } from "@features/statistics/ui/BarChart";
import { ChartFilter } from "@features/statistics/ui/ChartFilter";
import { RadarChart } from "@features/statistics/ui/RadarChart";
import { AppHeader } from "@widgets/layout/ui/AppHeader";

/**
 * 통계 화면 — 시안 A: 로즈 톤 배경, 넉넉한 여백, 칩 필터 + 패턴 차트 + 가로 진행 막대 방문율.
 */
export const StatisticsView = () => {
  const {
    loading,
    chartWidth,
    filter,
    locationOptions,
    genderOptions,
    ageOptions,
    charts,
    setLocation,
    setGender,
    setAge,
  } = useStatistics();

  return (
    <ScrollView
      className="flex-1 bg-rose-50"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-3">
        <AppHeader />
      </View>

      <ChartFilter
        location={filter.location}
        gender={filter.gender}
        age={String(filter.age)}
        locationOptions={locationOptions}
        genderOptions={genderOptions}
        ageOptions={ageOptions}
        onChangeLocation={setLocation}
        onChangeGender={setGender}
        onChangeAge={(v) => setAge(Number(v) as StatisticsAge)}
      />

      <View className="mt-4 gap-4">
        <ChartCard title="연령대별 방문 패턴">
          {loading ? (
            <View className="h-52 items-center justify-center">
              <Text className="text-sm text-neutral-500">통계 데이터를 불러오는 중입니다.</Text>
            </View>
          ) : charts ? (
            <View className="gap-3">
              <Text className="text-center text-[15px] font-semibold leading-5 text-neutral-900">
                {charts.radarHeadline}
              </Text>
              <Text className="text-center text-sm text-neutral-500">{charts.radarSubtitle}</Text>
              <View className="overflow-hidden rounded-2xl bg-neutral-50/80 px-1 pt-2">
                <RadarChart width={chartWidth} lineColor={charts.radarLineColor} data={charts.radar} />
              </View>
            </View>
          ) : (
            <View className="h-52 items-center justify-center">
              <Text className="text-sm text-neutral-500">선택한 조건에 맞는 통계가 없습니다.</Text>
            </View>
          )}
        </ChartCard>

        <ChartCard title="방문율">
          {loading ? (
            <View className="h-52 items-center justify-center">
              <Text className="text-sm text-neutral-500">통계 데이터를 불러오는 중입니다.</Text>
            </View>
          ) : charts ? (
            <View className="gap-1">
              <Text className="mb-3 text-center text-sm text-neutral-500">{charts.barTitle}</Text>
              <Text className="mb-2 text-center text-xs text-neutral-400">
                행을 누르면 상세 모달에서 장소·방문 횟수를 확인할 수 있어요
              </Text>
              <BarChart
                pair={{
                  male: charts.barMale,
                  female: charts.barFemale,
                }}
              />
            </View>
          ) : (
            <View className="h-52 items-center justify-center">
              <Text className="text-sm text-neutral-500">선택한 조건에 맞는 통계가 없습니다.</Text>
            </View>
          )}
        </ChartCard>
      </View>
    </ScrollView>
  );
};
