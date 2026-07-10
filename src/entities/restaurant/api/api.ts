/**
 * 맛집 — 웹 BFF 프록시(`POST /api/restaurants`) 조회 및 앱용 `Restaurant` 정규화.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/app/api/restaurants/route.ts`
 *      - 서버가 Google Places(Text Search `query=맛집`, `radius=1000`, top5) + Place Photo를 처리하고
 *        `NormalizedRestaurant[]`(camelCase)로 반환한다. 외부 키는 서버에만 존재한다.
 *
 * 2. 담당 역할
 *    - `entities/restaurant/api`: 프록시 호출 + 응답 매핑만 수행한다 (스토어/훅 없음).
 *      필터·정렬·top5·사진 프록시는 모두 웹 서버가 담당하므로 RN은 매핑만 한다.
 *
 * 3. 작동 원리 요약
 *    - `shared/api/client`의 `post`가 기본 헤더로 `X-Client: rn`을 보낸다.
 *      그 결과 웹이 `imgSrc`를 자체 사진 프록시의 **절대 URL**로 내려주어 `expo-image`가 바로 로드한다.
 *    - 혹시 상대경로가 오면 `API_BASE_URL`을 붙여 방어적으로 절대화한다.
 */

import { post } from "@shared/api/client";
import { API_BASE_URL, API_ENDPOINTS } from "@shared/api/endpoints";
import type { SupportedLanguage } from "@shared/i18n";

import type {
  Restaurant,
  RestaurantProxyItem,
} from "@entities/restaurant/model/types";

interface RestaurantsProxyBody {
  lat: number;
  lon: number;
  lang: SupportedLanguage;
}

/**
 * 절대 URL이면 그대로, 상대경로면 `API_BASE_URL`을 붙여 절대화한다. (방어용)
 */
const toAbsoluteImageUri = (imgSrc: string): string => {
  if (!imgSrc) return "";
  return /^https?:\/\//i.test(imgSrc) ? imgSrc : `${API_BASE_URL}${imgSrc}`;
};

const mapProxyItemToRestaurant = (item: RestaurantProxyItem): Restaurant => ({
  placeId: item.placeId,
  name: item.name,
  rating: item.rating ?? 0,
  userRatingsTotal: item.userRatingsTotal ?? 0,
  lat: item.lat,
  lon: item.lon,
  imageUri: toAbsoluteImageUri(item.imgSrc),
  openNow: item.openNow ?? null,
});

/**
 * 주어진 좌표 주변 맛집을 웹 프록시로 조회해 `Restaurant[]`로 반환한다.
 * 웹 서버가 이미 top5까지 처리하므로 RN은 응답을 매핑만 한다.
 */
export const fetchRestaurantsNearCoordinate = async (
  lat: number,
  lon: number,
  lang: SupportedLanguage,
): Promise<Restaurant[]> => {
  const data = await post<RestaurantProxyItem[], RestaurantsProxyBody>(
    API_ENDPOINTS.restaurantsProxy,
    { lat, lon, lang },
  );

  return (data ?? []).map(mapProxyItemToRestaurant);
};
