/**
 * Expo 클라이언트에서 사용하는 `EXPO_PUBLIC_*` 환경변수 키 목록.
 * 빌드 타임에 문자열로 치환되므로 런타임 동적 키 접근은 지원하지 않는다.
 */
export type ExpoPublicEnvKey =
  | "EXPO_PUBLIC_WEATHER_API_KEY"
  | "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
  | "EXPO_PUBLIC_GOOGLE_MAPS_ID"
  | "EXPO_PUBLIC_API_BASE_URL";

/**
 * 타입 안전하게 단일 환경변수를 읽는다. 미설정 시 `undefined`.
 */
export const getExpoPublicEnv = (key: ExpoPublicEnvKey): string | undefined => {
  return process.env[key];
};

/**
 * 앱 전역에서 사용하는 공개 환경변수 스냅샷.
 * `shared/api` 및 엔티티 API와 동일한 값을 참조하도록 한 곳에서 정리한다.
 */
export const env = {
  weatherApiKey: getExpoPublicEnv("EXPO_PUBLIC_WEATHER_API_KEY") ?? "",
  googleMapsApiKey: getExpoPublicEnv("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY") ?? "",
  googleMapsId: getExpoPublicEnv("EXPO_PUBLIC_GOOGLE_MAPS_ID") ?? "",
  apiBaseUrl: getExpoPublicEnv("EXPO_PUBLIC_API_BASE_URL") ?? "",
} as const;
