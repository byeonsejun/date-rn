import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions } from "react-native";

import { fetchStatisticsData } from "@entities/statistics/api/api";
import { useStatisticsStore } from "@entities/statistics/model/store";

import type {
  StatisticsAge,
  StatisticsGenderLabel,
  StatisticsLocationData,
} from "@entities/statistics/model/types";

import { computeStatisticsCharts } from "@features/statistics/lib/chartWebAdapter";

/**
 * 1. 원본 출처
 * - 웹: `components/ChartComponent.jsx` + `RadarChart.jsx` + `BarChart.jsx`
 *
 * 2. 담당 역할
 * - 통계 필터 스토어 구독, `chartData.json` 로딩, 웹과 동일한 차트 어댑터 결과 제공.
 */
export const useStatistics = () => {
  const { width } = useWindowDimensions();
  const location = useStatisticsStore((s) => s.location);
  const gender = useStatisticsStore((s) => s.gender);
  const age = useStatisticsStore((s) => s.age);
  const setLocation = useStatisticsStore((s) => s.setLocation);
  const setGender = useStatisticsStore((s) => s.setGender);
  const setAge = useStatisticsStore((s) => s.setAge);

  const [rows, setRows] = useState<StatisticsLocationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await fetchStatisticsData();
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  /** `chartData.json`에 없는 지역이 스토어에 남아 있으면 첫 번째 구로 맞춘다. */
  useEffect(() => {
    if (rows.length === 0) return;
    const exists = rows.some((r) => r.location === location);
    if (!exists) {
      setLocation(rows[0].location);
    }
  }, [rows, location, setLocation]);

  const locationOptions = useMemo(
    () =>
      rows
        .map((item) => ({ label: item.location, value: item.location }))
        .sort((a, b) => a.label.localeCompare(b.label, "ko")),
    [rows],
  );

  const genderOptions: { label: StatisticsGenderLabel; value: StatisticsGenderLabel }[] = [
    { label: "남성", value: "남성" },
    { label: "여성", value: "여성" },
  ];

  const ageOptions = ([10, 20, 30, 40, 50, 60] as StatisticsAge[]).map((value) => ({
    label: value === 60 ? "60대 이상" : `${value}대`,
    value: String(value),
  }));

  const charts = useMemo(
    () => computeStatisticsCharts(rows, location, gender, age),
    [rows, location, gender, age],
  );

  const chartWidth = Math.max(280, width - 40);

  return {
    loading,
    chartWidth,
    filter: { location, gender, age },
    locationOptions,
    genderOptions,
    ageOptions,
    charts,
    setLocation,
    setGender,
    setAge,
  };
};
