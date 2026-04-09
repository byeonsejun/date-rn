import type { StatisticsLocationData } from "@entities/statistics/model/types";

import chartDataRaw from "@entities/statistics/model/chartData.json";

/**
 * 웹 `chartData.json`의 `place: "dodream"`을 RN 타입의 `dodreamgil`로 통일한다.
 */
const normalizePlace = (place: string): StatisticsLocationData["data"]["male"][number]["place"] => {
  if (place === "dodream") return "dodreamgil";
  return place as StatisticsLocationData["data"]["male"][number]["place"];
};

const normalizeRows = (raw: unknown): StatisticsLocationData[] => {
  const arr = raw as StatisticsLocationData[];
  const seen = new Set<string>();
  const out: StatisticsLocationData[] = [];

  for (const loc of arr) {
    if (seen.has(loc.location)) continue;
    seen.add(loc.location);

    const mapRow = (row: StatisticsLocationData["data"]["male"][number]) => ({
      ...row,
      place: normalizePlace(row.place as string),
    });

    out.push({
      location: loc.location,
      data: {
        male: loc.data.male.map(mapRow),
        female: loc.data.female.map(mapRow),
      },
    });
  }

  return out;
};

/**
 * 1. 원본 출처
 * - 웹: `portfolio-next/data/chartData.json` + `service/chart.js`의 `getChartData`
 *
 * 2. 담당 역할
 * - 통계 원본 데이터를 비동기로 제공 (서버 API와 동일 시그니처 유지).
 */
export const fetchStatisticsData = async (): Promise<StatisticsLocationData[]> => {
  return Promise.resolve(normalizeRows(chartDataRaw));
};
