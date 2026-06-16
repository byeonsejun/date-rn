import { format } from "date-fns";
import { API_ENDPOINTS } from "@shared/api/endpoints";
import { post } from "@shared/api/client";
import { fromUnixTimeToG } from "@shared/lib/date";
import type { WeatherCurrent, WeatherForecast, WeatherForecastItem } from "@shared/types/weather";
import type { EnrichedForecastItem } from "@entities/weather/model/types";

interface WeatherProxyBody {
  type: "weather" | "forecast";
  lat: number;
  lon: number;
}

/**
 * 기존 웹 `service/weather.js#getRealTimeWeather`를 대체한다.
 * 외부 직접 호출 없이 웹 BFF 프록시(`POST /api/weather`)로만 조회한다. (계약: `{ type, lat, lon }`)
 */
export const fetchRealTimeWeather = (
  lat: number,
  lon: number,
): Promise<WeatherCurrent> => {
  return post<WeatherCurrent, WeatherProxyBody>(API_ENDPOINTS.weatherProxy, {
    type: "weather",
    lat,
    lon,
  });
};

/**
 * 기존 웹 `service/weather.js#getForecastWeather`의 후처리 규칙을
 * 엔티티 모델(`EnrichedForecastItem`)로 변환한다.
 */
const enrichForecastItem = (
  dt: number,
  item: WeatherForecastItem,
): EnrichedForecastItem => {
  const realTime = new Date();
  const itemDate = fromUnixTimeToG(dt);
  const finishItemDate = fromUnixTimeToG(dt);
  const formattedTime = format(itemDate, "ha");
  finishItemDate.setHours(23, 59, 59, 999);
  const diffInTime = finishItemDate.getTime() - realTime.getTime();
  const dayValue = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

  return {
    ...item,
    date: itemDate,
    time: formattedTime,
    dayValue,
  };
};

/**
 * 기존 웹 `service/weather.js#getForecastWeather`를 대체한다.
 * 웹 BFF 프록시(`POST /api/weather`, `{ type: "forecast" }`) 결과를 예보 모델로 정규화한다.
 */
export const fetchForecastWeather = async (
  lat: number,
  lon: number,
): Promise<EnrichedForecastItem[]> => {
  const forecastResponse = await post<WeatherForecast, WeatherProxyBody>(
    API_ENDPOINTS.weatherProxy,
    {
      type: "forecast",
      lat,
      lon,
    },
  );

  return forecastResponse.list.map((item) => enrichForecastItem(item.dt, item));
};
