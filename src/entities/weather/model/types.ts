import type {
  WeatherCurrent,
  WeatherForecastItem,
} from "@shared/types/weather";

/**
 * 기존 웹 `service/weather.js`의 forecast 후처리(`date`, `time`, `day_value`)를
 * 타입으로 명시한 엔티티 전용 예보 아이템 모델.
 */
export interface EnrichedForecastItem extends WeatherForecastItem {
  date: Date;
  time: string;
  dayValue: number;
}

/**
 * 화면에서 함께 소비하는 현재 날씨 + 예보 목록 묶음 모델.
 */
export interface WeatherBundle {
  today: WeatherCurrent | null;
  forecast: EnrichedForecastItem[];
}
