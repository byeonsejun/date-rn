/**
 * [진단용 임시 코드] 카메라(region) 변경 경로 추적 로그.
 *
 * 사이드바 POI 포커스 시 지도가 엉뚱한 곳을 비추는 간헐 버그(4e678ae 이후에도 재현)의
 * 실제 이벤트 순서를 실기기 콘솔에서 관찰하기 위한 것.
 * ⚠️ 원인 확정·수정 후 이 파일과 모든 logCamera 호출을 제거할 것.
 */
export const logCamera = (
  caller: string,
  region: { lat: number; lon: number; latitudeDelta?: number; longitudeDelta?: number },
  extra = "",
): void => {
  const ts = new Date().toISOString().slice(11, 23);
  const delta =
    typeof region.latitudeDelta === "number"
      ? ` Δlat=${region.latitudeDelta.toFixed(6)}`
      : "";
  console.log(
    `[CAMERA] ${ts} ${caller} → ${region.lat.toFixed(6)},${region.lon.toFixed(6)}${delta}${extra ? ` | ${extra}` : ""}`,
  );
};
