import { useCallback } from "react";
import { useLocationStore } from "@entities/location/model/store";
import { isMarkedOutside } from "@features/location/lib/seoulPolicy";
import { useGeolocation } from "@features/location/useGeolocation";

/**
 * 구 선택 시 서울 정책 가드 + 스토어 갱신을 담당하는 Feature 훅.
 * "현재 위치"는 OS 권한·역지오코딩·서울 판별까지 `requestLocation` 한 경로로만 반영한다.
 */
export const useDistrictSelect = () => {
  const { requestLocation } = useGeolocation();
  const allDistrictInfo = useLocationStore((s) => s.allDistrictInfo);
  const location = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const showSeoulOnlyToast = useLocationStore((s) => s.showSeoulOnlyToast);

  const handleSelect = useCallback(
    async (value: string) => {
      if (value === "현재 위치") {
        if (await isMarkedOutside()) {
          showSeoulOnlyToast();
          return;
        }
        await requestLocation();
        return;
      }
      setLocation(value);
    },
    [requestLocation, setLocation, showSeoulOnlyToast],
  );

  return { allDistrictInfo, location, handleSelect };
};
