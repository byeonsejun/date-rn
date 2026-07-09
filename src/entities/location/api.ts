import { API_ENDPOINTS } from "@shared/api/endpoints";
import { post } from "@shared/api/client";
import type { GeoCoord } from "@shared/types/location";
import type {
  AddressComponent,
  GeocodeResult,
  ReverseGeocodeResponse,
  UserGeoContext,
} from "@entities/location/model/types";

type LocationProxyBody = GeoCoord;

/**
 * 기존 웹 `app/api/location/route.js` + `service/weather.js#getUserGeoInfo`의
 * 역지오코딩 호출부를 엔티티 API로 분리한 함수.
 *
 * 외부 Google Geocode 직접 호출 없이 웹 BFF 프록시(`POST /api/location`)로만 조회한다.
 * (계약: `{ lat, lon }`)
 */
export const fetchReverseGeocode = (
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResponse> => {
  return post<ReverseGeocodeResponse, LocationProxyBody>(
    API_ENDPOINTS.locationProxy,
    { lat, lon },
  );
};

/**
 * 기존 웹 코드의 `plus_code.compound_code` 검사 규칙을 재사용해
 * 현재 위치가 서울인지 판별한다.
 */
export const isSeoulRegion = (response: ReverseGeocodeResponse): boolean => {
  const areaFlag = response.plus_code?.compound_code?.split(" ")?.[2];
  return areaFlag === "서울특별시";
};

/**
 * 주소 컴포넌트에서 특정 type을 가진 항목을 추출한다.
 */
const pickAddressComponent = (
  components: AddressComponent[],
  type: string,
): AddressComponent | undefined => {
  return components.find((component) => component.types.includes(type));
};

/**
 * 기존 웹 `result = { point, address, gu, dong }` 생성 로직을
 * 엔티티 모델 `UserGeoContext`로 변환한다.
 */
export const buildUserGeoContext = (
  response: ReverseGeocodeResponse,
): UserGeoContext | null => {
  const withDong = response.results.filter((result) =>
    result.address_components.some((component) =>
      component.types.includes("sublocality_level_2"),
    ),
  );

  const targetResult: GeocodeResult | undefined = withDong.at(-1);
  if (!targetResult) return null;

  const gu = pickAddressComponent(
    targetResult.address_components,
    "sublocality_level_1",
  );
  const dong = pickAddressComponent(
    targetResult.address_components,
    "sublocality_level_2",
  );

  const loc = targetResult.geometry.location;
  const lon =
    typeof loc.lon === "number" ? loc.lon : loc.lng;
  if (typeof loc.lat !== "number" || typeof lon !== "number") {
    return null;
  }

  return {
    lat: loc.lat,
    lon,
    district: gu?.long_name ?? "",
    city: "서울특별시",
    isSeoul: isSeoulRegion(response),
    fullAddress: targetResult.formatted_address,
    gu: gu?.long_name,
    dong: dong?.long_name,
  };
};
