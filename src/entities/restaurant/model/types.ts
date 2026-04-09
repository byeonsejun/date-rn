/**
 * 맛집(레스토랑) 도메인 — Google Places API 응답·앱 내부 정규화 모델.
 *
 * 1. 원본 출처
 *    - 웹 Next.js `app/api/restaurants/route.js` (Text Search + Place Photo)
 *    - Google Places API Text Search / Place Photo JSON 스키마
 *
 * 2. 담당 역할
 *    - `entities/restaurant/model`: 외부 API 계약과 앱에서 쓰는 최소 필드만 타입으로 고정한다.
 *
 * 3. 작동 원리 요약
 *    - Text Search `results[]` 항목에서 `place_id`, `name`, `rating`, `geometry`, `photos`, `opening_hours` 등을 읽고,
 *      사진은 Photo API URL(또는 별도 fetch)로 연결 가능한 `photo_reference`를 보관한다.
 *    - 앱 전용 `Restaurant` 타입은 리스트·카드 UI에 필요한 필드만 담은 정규화 결과다.
 */

/**
 * Google Places Photo 리소스 (Text Search / Place Details `photos[]` 항목).
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
  html_attributions?: string[];
}

/**
 * Google Places Text Search `results[]` 단일 항목 (앱에서 쓰는 필드만).
 */
export interface GooglePlaceTextSearchResult {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: {
    location: { lat: number; lng: number };
  };
  photos?: PlacePhoto[];
  opening_hours?: { open_now?: boolean };
}

export interface GooglePlacesTextSearchResponse {
  status: string;
  error_message?: string;
  results?: GooglePlaceTextSearchResult[];
}

/**
 * 맛집 패널·카드에 표시하기 위해 정규화한 식당 1건.
 * (웹 라우트가 붙이던 `img_src` 대신 RN에서는 `imageUri`로 통일한다.)
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
