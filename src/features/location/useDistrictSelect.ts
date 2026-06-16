import { useCallback } from "react";
import { useLocationStore } from "@entities/location/model/store";
import { useGeolocation } from "@features/location/useGeolocation";

/**
 * 구 선택 시 스토어 갱신을 담당하는 Feature 훅.
 * "현재 위치"는 OS 권한·역지오코딩·서울 판별까지 `requestLocation` 한 경로로만 반영한다.
 *
 * NOTE: 과거에는 저장된 `outside` 플래그로 "현재 위치" 재측정을 사전 차단했으나,
 * 그 경우 서울 밖에서 한 번 측정한 뒤 서울로 이동해도 재측정이 영구 차단되는 버그가 있었다.
 * 이제는 항상 `requestLocation`으로 새 좌표를 측정하고, 서울 여부 안내는
 * 측정 결과에 따라 `useGeolocation` 내부에서 토스트로 처리한다(측정 전 차단 → 측정 후 안내).
 */
export const useDistrictSelect = () => {
  const { requestLocation } = useGeolocation();
  const allDistrictInfo = useLocationStore((s) => s.allDistrictInfo);
  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);

  const handleSelect = useCallback(
    async (value: string) => {
      if (value === "현재 위치") {
        await requestLocation();
        return;
      }
      setLocation(value);
    },
    [requestLocation, setLocation],
  );

  return { allDistrictInfo, location, handleSelect };
};
