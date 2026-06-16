/**
 * Expo 클라이언트에서 사용하는 `EXPO_PUBLIC_*` 환경변수 키 목록.
 * 빌드 타임에 문자열로 치환되므로 런타임 동적 키 접근은 지원하지 않는다.
 *
 * NOTE: 외부 API 키(OpenWeather/Google Places·Geocode)는 더 이상 번들에 두지 않는다.
 * 모든 외부 호출은 웹 BFF 프록시(`/api/*`)로 경유하며 키는 웹 서버에만 존재한다.
 * - `EXPO_PUBLIC_API_BASE_URL`  : 프록시가 향할 웹 배포 도메인 (필수)
 * - `EXPO_PUBLIC_MAPS_TILE_KEY` : Android 지도 타일용 클라이언트 키. 번들에 남는 게 정상이며
 *                                 Google Cloud Console에서 Android 앱 제한(패키지명 + SHA-1)으로 보호한다.
 *                                 `app.config.js`에서만 사용한다.
 */
export type ExpoPublicEnvKey =
  | "EXPO_PUBLIC_API_BASE_URL"
  | "EXPO_PUBLIC_MAPS_TILE_KEY";

/**
 * 타입 안전하게 단일 환경변수를 읽는다. 미설정 시 `undefined`.
 */
export const getExpoPublicEnv = (key: ExpoPublicEnvKey): string | undefined => {
  return process.env[key];
};

/**
 * 앱 전역에서 사용하는 공개 환경변수 스냅샷.
 * 외부 API 키는 포함하지 않는다 (프록시 전용).
 */
export const env = {
  apiBaseUrl: getExpoPublicEnv("EXPO_PUBLIC_API_BASE_URL") ?? "",
} as const;
