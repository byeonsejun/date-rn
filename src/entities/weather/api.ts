import { format } from "date-fns";
import { API_BASE_URL, API_ENDPOINTS } from "@shared/api/endpoints";
import { env } from "@core/config/env";
import { get, post } from "@shared/api/client";
import { fromUnixTimeToG } from "@shared/lib/date";
import type {
  WeatherCurrent,
  WeatherForecast,
  WeatherForecastItem,
} from "@shared/types/weather";
import type { EnrichedForecastItem } from "@entities/weather/model/types";

interface WeatherProxyBody {
  pro: "http" | "https";
  type: "weather" | "forecast";
  lat: number;
  lon: number;
}

const fetchRealTimeWeatherDirect = (lat: number, lon: number) => {
  return get<WeatherCurrent>(`${API_ENDPOINTS.openWeatherBase}/weather`, {
    params: {
      lat,
      lon,
      appid: env.weatherApiKey,
      lang: "kr",
      units: "metric",
    },
  });
};

const fetchForecastWeatherDirect = (lat: number, lon: number) => {
  return get<WeatherForecast>(`${API_ENDPOINTS.openWeatherBase}/forecast`, {
    params: {
      lat,
      lon,
      appid: env.weatherApiKey,
      lang: "kr",
      units: "metric",
    },
  });
};

/**
 * 기존 웹 `service/weather.js#getRealTimeWeather`를 대체한다.
 * API_BASE_URL이 있으면 기존 프록시(`/api/weather`)를, 없으면 OpenWeather 직접 호출을 사용한다.
 */
export const fetchRealTimeWeather = async (
  lat: number,
  lon: number,
): Promise<WeatherCurrent> => {
  if (API_BASE_URL) {
    try {
      return await post<WeatherCurrent, WeatherProxyBody>(
        API_ENDPOINTS.weatherProxy,
        {
          pro: "https",
          type: "weather",
          lat,
          lon,
        },
      );
    } catch {
      // 모바일 환경에서 프록시 라우트 실패 시 직접 OpenWeather를 사용한다.
      return fetchRealTimeWeatherDirect(lat, lon);
    }
  }

  return fetchRealTimeWeatherDirect(lat, lon);
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
 * 프록시 호출 결과/직접 호출 결과를 동일한 예보 모델로 정규화한다.
 */
export const fetchForecastWeather = async (
  lat: number,
  lon: number,
): Promise<EnrichedForecastItem[]> => {
  const forecastResponse = API_BASE_URL
    ? await (async () => {
        try {
          return await post<WeatherForecast, WeatherProxyBody>(
            API_ENDPOINTS.weatherProxy,
            {
              pro: "https",
              type: "forecast",
              lat,
              lon,
            },
          );
        } catch {
          return fetchForecastWeatherDirect(lat, lon);
        }
      })()
    : await fetchForecastWeatherDirect(lat, lon);

  return forecastResponse.list.map((item) => enrichForecastItem(item.dt, item));
};
