import proj4 from "proj4";

const GRS80_TM =
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +datum=GRS80 +units=m +no_defs";
const WGS84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

export type LatLngTuple = [number, number];

// 공공데이터의 GRS80 TM 좌표를 지도 컴포넌트에서 쓰는 WGS84(lat,lng)로 변환할 때 사용.
export const transLocation = (x: number, y: number): LatLngTuple => {
  const [lng, lat] = proj4(GRS80_TM, WGS84, [x, y]) as [number, number];
  return [lat, lng];
};
