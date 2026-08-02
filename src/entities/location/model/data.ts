import type { District } from "@shared/types/location";

/**
 * 기존 웹 `service/location.js#localInfoData`를 RN 엔티티 모델로 이식한
 * 서울 자치구 기본 좌표 데이터.
 */
export const localInfoData: District[] = [
  { location: "현재 위치", location_en: "Current Location", location_ja: "現在地", location_zh: "当前位置", lat: 0, lon: 0 },
  { location: "중구", location_en: "Jung-gu", location_ja: "中区", location_zh: "中区", lat: 37.560825, lon: 126.995069 },
  { location: "강동구", location_en: "Gangdong-gu", location_ja: "江東区", location_zh: "江东区", lat: 37.550771, lon: 127.143998 },
  { location: "성동구", location_en: "Seongdong-gu", location_ja: "城東区", location_zh: "城东区", lat: 37.5361111, lon: 127.0669444 },
  { location: "마포구", location_en: "Mapo-gu", location_ja: "麻浦区", location_zh: "麻浦区", lat: 37.559305, lon: 126.908196 },
  { location: "종로구", location_en: "Jongno-gu", location_ja: "鍾路区", location_zh: "钟路区", lat: 37.5711111, lon: 126.9783333 },
  { location: "은평구", location_en: "Eunpyeong-gu", location_ja: "恩平区", location_zh: "恩平区", lat: 37.5908333, lon: 126.925 },
  { location: "영등포구", location_en: "Yeongdeungpo-gu", location_ja: "永登浦区", location_zh: "永登浦区", lat: 37.5230556, lon: 126.925 },
  { location: "강서구", location_en: "Gangseo-gu", location_ja: "江西区", location_zh: "江西区", lat: 37.5583163, lon: 126.8497566 },
  { location: "동대문구", location_en: "Dongdaemun-gu", location_ja: "東大門区", location_zh: "东大门区", lat: 37.583436, lon: 127.055543 },
  { location: "동작구", location_en: "Dongjak-gu", location_ja: "銅雀区", location_zh: "铜雀区", lat: 37.4913889, lon: 126.9583333 },
  { location: "광진구", location_en: "Gwangjin-gu", location_ja: "広津区", location_zh: "广津区", lat: 37.5488889, lon: 127.0722222 },
  { location: "용산구", location_en: "Yongsan-gu", location_ja: "龍山区", location_zh: "龙山区", lat: 37.5322222, lon: 126.975 },
  { location: "서대문구", location_en: "Seodaemun-gu", location_ja: "西大門区", location_zh: "西大门区", lat: 37.577352, lon: 126.938884 },
  { location: "서초구", location_en: "Seocho-gu", location_ja: "瑞草区", location_zh: "瑞草区", lat: 37.4844444, lon: 127.0161111 },
  { location: "관악구", location_en: "Gwanak-gu", location_ja: "冠岳区", location_zh: "冠岳区", lat: 37.467477, lon: 126.945134 },
  { location: "금천구", location_en: "Geumcheon-gu", location_ja: "衿川区", location_zh: "衿川区", lat: 37.4833333, lon: 126.9011111 },
  { location: "성북구", location_en: "Seongbuk-gu", location_ja: "城北区", location_zh: "城北区", lat: 37.594172, lon: 127.024814 },
  { location: "구로구", location_en: "Guro-gu", location_ja: "九老区", location_zh: "九老区", lat: 37.494358, lon: 126.856303 },
  { location: "양천구", location_en: "Yangcheon-gu", location_ja: "陽川区", location_zh: "阳川区", lat: 37.525053, lon: 126.864406 },
  { location: "강남구", location_en: "Gangnam-gu", location_ja: "江南区", location_zh: "江南区", lat: 37.5109112, lon: 127.0472229 },
  { location: "송파구", location_en: "Songpa-gu", location_ja: "松坡区", location_zh: "松坡区", lat: 37.5056, lon: 127.1153 },
  { location: "도봉구", location_en: "Dobong-gu", location_ja: "道峰区", location_zh: "道峰区", lat: 37.657944, lon: 127.038835 },
  { location: "강북구", location_en: "Gangbuk-gu", location_ja: "江北区", location_zh: "江北区", lat: 37.64447, lon: 127.026077 },
  { location: "중랑구", location_en: "Jungnang-gu", location_ja: "中浪区", location_zh: "中浪区", lat: 37.598299, lon: 127.089544 },
  { location: "노원구", location_en: "Nowon-gu", location_ja: "蘆原区", location_zh: "芦原区", lat: 37.63161, lon: 127.077236 },
];
