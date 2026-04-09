import { addDays, format, fromUnixTime } from "date-fns";

type TimeUnit = "year" | "month" | "day" | "hours" | "minutes";

const pad2 = (value: number): string => value.toString().padStart(2, "0");

// 화면/로그에서 현재 시각 문자열 또는 특정 단위 값을 빠르게 얻기 위해 사용.
export const getCurrentTime = (type?: TimeUnit): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);
  const day = pad2(now.getDate());
  const hours = pad2(now.getHours());
  const minutes = pad2(now.getMinutes());

  if (!type) {
    return `${year} / ${month} / ${day}  ${hours}:${minutes}`;
  }

  const unitMap: Record<TimeUnit, string> = {
    year: String(year),
    month,
    day,
    hours,
    minutes,
  };

  return unitMap[type];
};

// 날씨 예보 섹션의 날짜 라벨(오늘 포함 3일치)을 만들기 위해 사용.
export const get3Days = (): string[] => {
  const today = new Date();
  return Array.from({ length: 3 }, (_, index) =>
    format(addDays(today, index), "MM-dd"),
  );
};

// 24시간 기준 시간 축 라벨(00:00~23:00)이 필요할 때 사용.
export const get24H = (): string[] => {
  return Array.from({ length: 24 }, (_, hour) => `${pad2(hour)}:00`);
};

// OpenWeather 등 Unix 초 단위 타임스탬프를 Date 객체로 변환할 때 사용.
export const fromUnixTimeToG = (unixSeconds: number): Date => {
  return fromUnixTime(unixSeconds);
};
