/**
 * 공통 API 엔드포인트 상수 모음.
 *
 * 외부 API(OpenWeather/Google Geocode/Places) 직접 호출 URL은 두지 않는다.
 * 모든 데이터 호출은 웹 BFF 프록시(`/api/*`)로만 경유하며, 외부 키는 서버에만 둔다.
 */
export const API_ENDPOINTS = {
  weatherProxy: "/api/weather",
  locationProxy: "/api/location",
  restaurantsProxy: "/api/restaurants",
} as const;

/**
 * 모든 프록시 호출이 향할 웹 배포 도메인. 프록시 전용 구조이므로 필수 값이다.
 * 비어 있으면 `shared/api/client`가 요청 시점에 명확한 에러를 던진다.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
