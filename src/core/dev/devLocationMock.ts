/**
 * Expo Go + 실기기에서 성남 등 서울 외 지역일 때도 서울 플로우를 검증하려면 `true`.
 * 실제 GPS를 쓰려면 `false`로 둔다.
 */
export const USE_DEV_FIXED_GPS_FOR_EXPO_GO = __DEV__ && true;

/**
 * 서울특별시 강동구청 인근 (역지오·날씨 API가 강동구로 응답하도록 고정).
 */
export const DEV_MOCK_COORDINATES_GANGDONG = {
  latitude: 37.530868,
  longitude: 127.123382,
} as const;
