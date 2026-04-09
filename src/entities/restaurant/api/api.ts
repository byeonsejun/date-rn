/**
 * Google Places API — 맛집(Text Search) 조회 및 앱용 `Restaurant` 정규화.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/app/api/restaurants/route.js`
 *      - Text Search: `query=맛집`, `location=lat,lon`, `radius=1000`, `language=ko`, `types=restaurant`
 *      - 사진: Place Photo (maxwidth=250) — 웹은 base64 data URL, RN은 `imageUri`에 Photo API URL을 넣어 `expo-image`로 로드
 *
 * 2. 담당 역할
 *    - `entities/restaurant/api`: 네트워크 호출 + 응답 검증·매핑만 수행 (스토어/훅 없음).
 *
 * 3. 작동 원리 요약
 *    - `shared/api/client`의 `get`으로 절대 URL 호출
 *    - `results` 중 `photos`가 있는 항목만 남기고 `rating` 내림차순 정렬 후 상위 5개
 *    - 각 항목의 첫 `photo_reference`로 Place Photo 요청 URL을 만들어 `Restaurant.imageUri`에 설정
 */

import { get } from "@shared/api/client";
import { API_ENDPOINTS } from "@shared/api/endpoints";

import type {
  GooglePlaceTextSearchResult,
  GooglePlacesTextSearchResponse,
  Restaurant,
} from "@entities/restaurant/model/types";

const MAX_RESULTS = 5;
const PHOTO_MAX_WIDTH = 250;

const getGoogleMapsApiKey = (): string => {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
};

const buildTextSearchUrl = (lat: number, lon: number): string => {
  const key = getGoogleMapsApiKey();
  const q = encodeURIComponent("맛집");
  return `${API_ENDPOINTS.googlePlacesTextSearchBase}?query=${q}&location=${lat},${lon}&radius=1000&language=ko&key=${key}&types=restaurant`;
};

const buildPhotoUrl = (photoReference: string): string => {
  const key = getGoogleMapsApiKey();
  return `${API_ENDPOINTS.googlePlacePhotoBase}?photoreference=${encodeURIComponent(
    photoReference,
  )}&maxwidth=${PHOTO_MAX_WIDTH}&key=${key}`;
};

const mapResultToRestaurant = (
  item: GooglePlaceTextSearchResult,
): Restaurant | null => {
  const placeId = item.place_id;
  const name = item.name;
  const lat = item.geometry?.location.lat;
  const lng = item.geometry?.location.lng;
  const firstPhoto = item.photos?.[0];

  if (
    !placeId ||
    !name ||
    lat === undefined ||
    lng === undefined ||
    !firstPhoto?.photo_reference
  ) {
    return null;
  }

  return {
    placeId,
    name,
    rating: item.rating ?? 0,
    userRatingsTotal: item.user_ratings_total ?? 0,
    lat,
    lon: lng,
    imageUri: buildPhotoUrl(firstPhoto.photo_reference),
    openNow: item.opening_hours?.open_now ?? null,
  };
};

/**
 * 주어진 좌표 주변 맛집을 Text Search로 조회하고, 상위 5개를 `Restaurant[]`로 반환한다.
 */
export const fetchRestaurantsNearCoordinate = async (
  lat: number,
  lon: number,
): Promise<Restaurant[]> => {
  const key = getGoogleMapsApiKey();
  if (!key) {
    throw new Error("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
  }

  const url = buildTextSearchUrl(lat, lon);
  const data = await get<GooglePlacesTextSearchResponse>(url);

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    const msg = data.error_message ?? data.status;
    throw new Error(`Google Places Text Search failed: ${msg}`);
  }

  const raw = data.results ?? [];
  const filtered = raw
    .filter((r) => r.photos && r.photos.length > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, MAX_RESULTS);

  const mapped: Restaurant[] = [];
  for (const item of filtered) {
    const row = mapResultToRestaurant(item);
    if (row) mapped.push(row);
  }
  return mapped;
};
