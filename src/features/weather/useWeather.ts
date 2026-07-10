import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocationStore } from "@entities/location/model/store";
import { useWeatherStore } from "@entities/weather/model/store";
import {
  fetchRealTimeWeather,
  fetchForecastWeather,
} from "@entities/weather/api";
import type { SupportedLanguage } from "@shared/i18n";

/**
 * 구 선택 → 날씨 fetch → 스토어 갱신 오케스트레이션 훅.
 * FSD 원칙: 같은 레이어(features)의 다른 slice를 import하지 않는다.
 * "현재 위치" GPS 트리거는 widget 레이어에서 useGeolocation과 조합해 처리한다.
 *
 * 비동기 `getSelectLocation` 완료 시점에 사용자가 이미 다른 지역(또는 현재 위치)으로
 * 바꿨을 수 있으므로, 반드시 **요청 시점 구 이름과 스토어의 location이 일치할 때만**
 * `setShowWeather` 한다. 그렇지 않으면 늦게 도착한 응답이 GPS/다른 구 날씨를 덮어쓴다.
 */
export const useWeather = () => {
  const { i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const location = useLocationStore((s) => s.location);
  const allDistrictInfo = useLocationStore((s) => s.allDistrictInfo);
  const myLocalWeather = useWeatherStore((s) => s.myLocalWeather);
  const showWeather = useWeatherStore((s) => s.showWeather);
  const setShowWeather = useWeatherStore((s) => s.setShowWeather);

  const [loading, setLoading] = useState(false);
  const [selectWeather, setSelectWeather] = useState(0);
  const [needsGps, setNeedsGps] = useState(false);

  const getSelectLocation = useCallback(
    async (districtName: string, lang: SupportedLanguage) => {
      const found = allDistrictInfo.find(
        (item) => item.location === districtName,
      );
      if (!found) return;

      setLoading(true);
      try {
        const [today, forecast] = await Promise.all([
          fetchRealTimeWeather(found.lat, found.lon, lang),
          fetchForecastWeather(found.lat, found.lon, lang),
        ]);
        if (useLocationStore.getState().location !== districtName) {
          return;
        }
        setShowWeather({ today, forecast });
      } finally {
        setLoading(false);
      }
    },
    [allDistrictInfo, setShowWeather],
  );

  /**
   * 구 단위 선택: `myLocalWeather` 변경과 무관하게 `location`이 바뀔 때만 fetch.
   * `language`도 의존성에 포함해, 구는 그대로 두고 언어만 토글해도 description을
   * 새 언어로 다시 받아오도록 한다.
   */
  useEffect(() => {
    if (allDistrictInfo.length === 0) return;
    if (location === "현재 위치") return;

    setNeedsGps(false);
    void getSelectLocation(location, language);
  }, [location, language, allDistrictInfo.length, getSelectLocation]);

  /** "현재 위치": GPS로 채운 `myLocalWeather`만 화면에 반영 (구 fetch와 경로 분리) */
  useEffect(() => {
    if (allDistrictInfo.length === 0) return;
    if (location !== "현재 위치") return;

    if (myLocalWeather.today) {
      setShowWeather({
        today: myLocalWeather.today,
        forecast: myLocalWeather.forecast,
      });
      setNeedsGps(false);
      setLoading(false);
    } else {
      setNeedsGps(true);
    }
  }, [location, myLocalWeather, allDistrictInfo.length, setShowWeather]);

  return {
    showWeather,
    selectWeather,
    setSelectWeather,
    location,
    loading,
    needsGps,
  };
};
