import { useCallback, useState } from "react";
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
 * 기존 웹 `service/weather.js#getUserGeoInfo` + `navigator.geolocation`을 대체한다.
 * expo-location으로 GPS 퍼미션 → 좌표 → 역지오코딩 → 서울 판별 → 스토어 갱신 흐름을 수행한다.
 * 개발 중 `USE_DEV_FIXED_GPS_FOR_EXPO_GO`가 켜지면 실제 GPS 대신 강동구 고정 좌표를 쓴다.
 */
export const useGeolocation = () => {
  const [loading, setLoading] = useState(false);

  const setLocation = useLocationStore((s) => s.setLocation);
  const setMyGeoInfo = useLocationStore((s) => s.setMyGeoInfo);
  const showSeoulOnlyToast = useLocationStore((s) => s.showSeoulOnlyToast);

  const setMyLocalWeather = useWeatherStore((s) => s.setMyLocalWeather);
  const setShowWeather = useWeatherStore((s) => s.setShowWeather);

  const requestLocation = useCallback(async () => {
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
        fetchRealTimeWeather(latitude, longitude),
        fetchForecastWeather(latitude, longitude),
      ]);

      setMyLocalWeather({ today, forecast });
      setShowWeather({ today, forecast });
      setLocation("현재 위치");
    } catch {
      setLocation(DEFAULT_DISTRICT);
    } finally {
      setLoading(false);
    }
  }, [
    setLocation,
    setMyGeoInfo,
    showSeoulOnlyToast,
    setMyLocalWeather,
    setShowWeather,
  ]);

  return { requestLocation, loading };
};
