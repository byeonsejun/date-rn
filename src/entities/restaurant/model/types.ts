/**
 * 맛집(레스토랑) 도메인 — 웹 BFF 프록시 응답·앱 내부 정규화 모델.
 *
 * 1. 원본 출처
 *    - 웹 Next.js `app/api/restaurants/route.ts` 가 Google Places(Text Search + Place Photo)를
 *      서버에서 호출·필터·정렬·top5 처리 후 정규화(`NormalizedRestaurant`) 배열로 반환한다.
 *    - RN은 외부 Google API를 직접 호출하지 않고 이 프록시 응답만 소비한다.
 *
 * 2. 담당 역할
 *    - `entities/restaurant/model`: 프록시 응답 계약과 앱에서 쓰는 최소 필드만 타입으로 고정한다.
 */

/**
 * 웹 BFF(`/api/restaurants`)가 내려주는 정규화 식당 1건.
 * 웹의 `NormalizedRestaurant` 스키마와 동일하다.
 * `imgSrc`는 `X-Client: rn` 헤더가 있을 때 자체 사진 프록시의 절대 URL로 내려온다.
 */
export interface RestaurantProxyItem {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  formattedAddress?: string;
  openNow?: boolean;
  lat: number;
  lon: number;
  imgSrc: string;
}

/**
 * 맛집 패널·카드에 표시하기 위해 정규화한 식당 1건.
 * (웹 응답의 `imgSrc`를 RN에서는 `imageUri`로 통일한다.)
 */
export interface Restaurant {
  placeId: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  lat: number;
  lon: number;
  /** 사진이 없으면 빈 문자열 */
  imageUri: string;
  /** `opening_hours.open_now` — 정보 없으면 null */
  openNow: boolean | null;
}
