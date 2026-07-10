import type { District } from "@shared/types/location";

/**
 * 기존 웹 `service/location.js#localInfoData`를 RN 엔티티 모델로 이식한
 * 서울 자치구 기본 좌표 데이터.
 */
export const localInfoData: District[] = [
  { location: "현재 위치", location_en: "Current Location", lat: 0, lon: 0 },
  { location: "중구", location_en: "Jung-gu", lat: 37.560825, lon: 126.995069 },
  { location: "강동구", location_en: "Gangdong-gu", lat: 37.550771, lon: 127.143998 },
  { location: "성동구", location_en: "Seongdong-gu", lat: 37.5361111, lon: 127.0669444 },
  { location: "마포구", location_en: "Mapo-gu", lat: 37.559305, lon: 126.908196 },
  { location: "종로구", location_en: "Jongno-gu", lat: 37.5711111, lon: 126.9783333 },
  { location: "은평구", location_en: "Eunpyeong-gu", lat: 37.5908333, lon: 126.925 },
  { location: "영등포구", location_en: "Yeongdeungpo-gu", lat: 37.5230556, lon: 126.925 },
  { location: "강서구", location_en: "Gangseo-gu", lat: 37.5583163, lon: 126.8497566 },
  { location: "동대문구", location_en: "Dongdaemun-gu", lat: 37.583436, lon: 127.055543 },
  { location: "동작구", location_en: "Dongjak-gu", lat: 37.4913889, lon: 126.9583333 },
  { location: "광진구", location_en: "Gwangjin-gu", lat: 37.5488889, lon: 127.0722222 },
  { location: "용산구", location_en: "Yongsan-gu", lat: 37.5322222, lon: 126.975 },
  { location: "서대문구", location_en: "Seodaemun-gu", lat: 37.577352, lon: 126.938884 },
  { location: "서초구", location_en: "Seocho-gu", lat: 37.4844444, lon: 127.0161111 },
  { location: "관악구", location_en: "Gwanak-gu", lat: 37.467477, lon: 126.945134 },
  { location: "금천구", location_en: "Geumcheon-gu", lat: 37.4833333, lon: 126.9011111 },
  { location: "성북구", location_en: "Seongbuk-gu", lat: 37.594172, lon: 127.024814 },
  { location: "구로구", location_en: "Guro-gu", lat: 37.494358, lon: 126.856303 },
  { location: "양천구", location_en: "Yangcheon-gu", lat: 37.525053, lon: 126.864406 },
  { location: "강남구", location_en: "Gangnam-gu", lat: 37.5109112, lon: 127.0472229 },
  { location: "송파구", location_en: "Songpa-gu", lat: 37.5056, lon: 127.1153 },
  { location: "도봉구", location_en: "Dobong-gu", lat: 37.657944, lon: 127.038835 },
  { location: "강북구", location_en: "Gangbuk-gu", lat: 37.64447, lon: 127.026077 },
  { location: "중랑구", location_en: "Jungnang-gu", lat: 37.598299, lon: 127.089544 },
  { location: "노원구", location_en: "Nowon-gu", lat: 37.63161, lon: 127.077236 },
];
