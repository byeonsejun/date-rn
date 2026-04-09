/**
 * 공통 API 엔드포인트 상수 모음.
 * 앱 내부 프록시 경로와 외부 서비스 URL을 분리해 관리한다.
 */
export const API_ENDPOINTS = {
  weatherProxy: "/api/weather",
  locationProxy: "/api/location",
  restaurantsProxy: "/api/restaurants",
  openWeatherBase: "https://api.openweathermap.org/data/2.5",
  googleGeocodeBase: "https://maps.googleapis.com/maps/api/geocode/json",
  googlePlacesTextSearchBase:
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
  googlePlacePhotoBase: "https://maps.googleapis.com/maps/api/place/photo",
} as const;

/**
 * 앱에서 외부 요청 시 사용할 기본 API 베이스 URL.
 * 지정되지 않으면 상대 경로 기반으로 요청한다.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
