import type {
  StatisticsAge,
  StatisticsGenderLabel,
  StatisticsLocationData,
} from "@entities/statistics/model/types";

/** 웹 `src/util/util.js`의 `getRandomNumber`와 동일 */
export const getRandomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const AGES: StatisticsAge[] = [10, 20, 30, 40, 50, 60];

const AGE_LABELS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"] as const;

/** 웹 `RadarChart.jsx`의 `wordConverter`와 동일 의미 */
export const placeTypeToKorean = (place: string): string => {
  switch (place) {
    case "cultural":
      return "문화공간";
    case "park":
      return "공원";
    case "dodream":
    case "dodreamgil":
      return "두드림길";
    default:
      return "문화공간";
  }
};

export type GenderVisitRow = {
  name: string;
  placeType: string;
  visit: number;
};

export type StatisticsChartsResult = {
  radar: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  radarLineColor: string;
  barMale: {
    labels: string[];
    data: number[];
    names: string[];
  };
  barFemale: {
    labels: string[];
    data: number[];
    names: string[];
  };
  radarHeadline: string;
  radarSubtitle: string;
  barTitle: string;
};

/**
 * 웹 `RadarChart.jsx`의 `resultData` + `BarChart.jsx`의 `dataFilterAll` 흐름을
 * 한 번에 계산한다 (필터 변경 시마다 동일 규칙으로 재계산).
 */
export const computeStatisticsCharts = (
  rows: StatisticsLocationData[],
  location: string,
  gender: StatisticsGenderLabel,
  age: StatisticsAge,
): StatisticsChartsResult | null => {
  const selected = rows.find((r) => r.location === location);
  if (!selected) return null;

  const filteredMale = selected.data.male;
  const filteredFemale = selected.data.female;
  const genderList = gender === "남성" ? filteredMale : filteredFemale;
  const ageFilter = genderList.find((item) => item.age === age);
  if (!ageFilter) return null;

  const randomArray = AGES.map(() => getRandomNumber(10, 50));
  const maxNum = Math.max(...randomArray) + getRandomNumber(10, 50);

  const maleData: GenderVisitRow[] = filteredMale.map((item) => ({
    name: item.title,
    placeType: item.place,
    visit: getRandomNumber(60, 100),
  }));
  const femaleData: GenderVisitRow[] = filteredFemale.map((item) => ({
    name: item.title,
    placeType: item.place,
    visit: getRandomNumber(60, 100),
  }));

  if (gender === "남성") {
    const idx = maleData.findIndex((item) => item.name === ageFilter.title);
    if (idx >= 0) {
      maleData[idx] = { ...maleData[idx], visit: maxNum };
    }
  } else {
    const idx = femaleData.findIndex((item) => item.name === ageFilter.title);
    if (idx >= 0) {
      femaleData[idx] = { ...femaleData[idx], visit: maxNum };
    }
  }

  const genderData = { male: maleData, female: femaleData };
  const currentGender = ageFilter.gender === "male" ? genderData.male : genderData.female;
  const currentData = currentGender.find((item) => item.name === ageFilter.title);

  const radarValues = [...randomArray];
  const ageIdx = ageFilter.age / 10 - 1;
  if (currentData) {
    radarValues[ageIdx] = currentData.visit;
  } else {
    radarValues[ageIdx] = maxNum;
  }

  const radarLineColor =
    gender === "남성" ? "rgba(53, 162, 235, 1)" : "rgba(255, 99, 132, 1)";

  return {
    radar: {
      labels: [...AGE_LABELS],
      datasets: [{ data: radarValues }],
    },
    radarLineColor,
    barMale: {
      labels: [...AGE_LABELS],
      data: maleData.map((item) => item.visit),
      names: maleData.map((item) => item.name),
    },
    barFemale: {
      labels: [...AGE_LABELS],
      data: femaleData.map((item) => item.visit),
      names: femaleData.map((item) => item.name),
    },
    radarHeadline: `${location} / ${gender} / ${age}대가 가장 많이 방문한 장소입니다.`,
    radarSubtitle: `${ageFilter.title} (${placeTypeToKorean(ageFilter.place)})`,
    barTitle: `${location}의 성별, 나이대별 가장높은 방문율을 기록한 장소입니다.`,
  };
};
