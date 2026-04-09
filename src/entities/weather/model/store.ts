import { create } from "zustand";
import type { WeatherCurrent } from "@shared/types/weather";
import type { EnrichedForecastItem } from "@entities/weather/model/types";

/**
 * 날씨 도메인의 상태 저장소.
 * FSD 원칙에 따라 entities/weather/model 세그먼트에 위치한다.
 * GPS/구 선택에 따른 fetch·동기화는 feature 레이어에서 이 스토어를 갱신한다.
 */

interface WeatherSlices {
  today?: WeatherCurrent;
  forecast?: EnrichedForecastItem[];
}

type WeatherStoreState = {
  myLocalWeather: WeatherSlices;
  showWeather: WeatherSlices;
  setMyLocalWeather: (value: WeatherSlices) => void;
  setShowWeather: (value: WeatherSlices) => void;
};

export const useWeatherStore = create<WeatherStoreState>((set) => ({
  myLocalWeather: { today: undefined, forecast: undefined },
  showWeather: { today: undefined, forecast: undefined },
  setMyLocalWeather: (value: WeatherSlices) => set({ myLocalWeather: value }),
  setShowWeather: (value: WeatherSlices) => set({ showWeather: value }),
}));
