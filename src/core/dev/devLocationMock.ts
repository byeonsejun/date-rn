/**
 * Expo Go + 실기기에서 성남 등 서울 외 지역일 때도 서울 플로우를 검증하려면 이 상수를 `true`로 바꾼다.
 * 기본값은 `false`(opt-in) — dev 빌드라도 실제 GPS를 쓰게 해서 강동구 고정 좌표가
 * 테스트를 오도하지 않게 한다. (release 빌드는 `__DEV__`가 false라 어차피 항상 실제 GPS)
 */
export const USE_DEV_FIXED_GPS_FOR_EXPO_GO = __DEV__ && false;

/**
 * 서울특별시 강동구청 인근 (역지오·날씨 API가 강동구로 응답하도록 고정).
 */
export const DEV_MOCK_COORDINATES_GANGDONG = {
  latitude: 37.530868,
  longitude: 127.123382,
} as const;
