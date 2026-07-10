import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import {
  fetchReverseGeocode,
  isSeoulRegion,
  buildUserGeoContext,
} from "@entities/location/api";
import { useLocationStore } from "@entities/location/model/store";
import { useWeatherStore } from "@entities/weather/model/store";
import {
  fetchRealTimeWeather,
  fetchForecastWeather,
} from "@entities/weather/api";
import type { SupportedLanguage } from "@shared/i18n";
import {
  markOutsideSeoul,
  markLocationAgreed,
  DEFAULT_DISTRICT,
} from "@features/location/lib/seoulPolicy";
import {
  DEV_MOCK_COORDINATES_GANGDONG,
  USE_DEV_FIXED_GPS_FOR_EXPO_GO,
} from "@core/dev/devLocationMock";

/**
 * 인스턴스 경계를 넘는 공유 in-flight 가드.
 *
 * `useGeolocation`은 `useAutoGeolocation`·`useLocationConsent`·`useDistrictSelect`가
 * 각각 별도 인스턴스를 만든다(로컬 `loading`은 인스턴스별로 분리됨). 첫 실행에서 자동 훅과
 * 동의 모달이 동시에 `requestLocation`을 호출하면 GPS+역지오+날씨 요청이 중첩될 수 있으므로,
 * 모듈 레벨 플래그로 동시 측정을 1건으로 직렬화한다.
 */
let measurementInFlight = false;

/**
 * 기존 웹 `service/weather.js#getUserGeoInfo` + `navigator.geolocation`을 대체한다.
 * expo-location으로 GPS 퍼미션 → 좌표 → 역지오코딩 → 서울 판별 → 스토어 갱신 흐름을 수행한다.
 * 개발 중 `USE_DEV_FIXED_GPS_FOR_EXPO_GO`가 켜지면 실제 GPS 대신 강동구 고정 좌표를 쓴다.
 */
export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);
  const { i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;

  const setLocation = useLocationStore((s) => s.setLocation);
  const setMyGeoInfo = useLocationStore((s) => s.setMyGeoInfo);
  const showSeoulOnlyToast = useLocationStore((s) => s.showSeoulOnlyToast);

  const setMyLocalWeather = useWeatherStore((s) => s.setMyLocalWeather);
  const setShowWeather = useWeatherStore((s) => s.setShowWeather);

  const requestLocation = useCallback(async () => {
    // 이미 다른 인스턴스가 측정 중이면 중복 호출을 막는다.
    if (measurementInFlight) return;
    measurementInFlight = true;
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation(DEFAULT_DISTRICT);
        return;
      }

      let latitude: number;
      let longitude: number;
      if (USE_DEV_FIXED_GPS_FOR_EXPO_GO) {
        latitude = DEV_MOCK_COORDINATES_GANGDONG.latitude;
        longitude = DEV_MOCK_COORDINATES_GANGDONG.longitude;
      } else {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const geocodeResponse = await fetchReverseGeocode(latitude, longitude);

      if (!isSeoulRegion(geocodeResponse)) {
        showSeoulOnlyToast();
        setLocation(DEFAULT_DISTRICT);
        await markOutsideSeoul();
        return;
      }

      const geoContext = buildUserGeoContext(geocodeResponse);
      if (geoContext) {
        setMyGeoInfo(geoContext);
      }
      await markLocationAgreed();

      const [today, forecast] = await Promise.all([
        fetchRealTimeWeather(latitude, longitude, language),
        fetchForecastWeather(latitude, longitude, language),
      ]);

      setMyLocalWeather({ today, forecast });
      setShowWeather({ today, forecast });
      setLocation("현재 위치");
    } catch {
      setLocation(DEFAULT_DISTRICT);
    } finally {
      measurementInFlight = false;
      setLoading(false);
    }
  }, [
    setLocation,
    setMyGeoInfo,
    showSeoulOnlyToast,
    setMyLocalWeather,
    setShowWeather,
    language,
  ]);

  return { requestLocation, loading };
};
