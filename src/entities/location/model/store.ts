import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { District } from "@shared/types/location";
import type { UserGeoContext } from "@entities/location/model/types";
import { localInfoData } from "@entities/location/model/data";

/**
 * `setLocationInfo`에 전달되는 번들. 원본 웹 `getAllLocationInfo()` 결과와 동일한 형태.
 */
export interface LocationInfoBundle {
  localInfoData: District[];
  culturalSpaceInfo: unknown[];
  dodreamgilInfo: unknown[];
  parkInfo: unknown[];
}

/**
 * 위치 도메인의 상태 저장소.
 * FSD 원칙에 따라 entities/location/model 세그먼트에 위치한다.
 * 선택 구·역지오 결과는 기기에 유지하기 위해 `persist`로 일부 필드를 저장한다.
 *
 * NOTE: `culturalSpaceInfo` 등 POI 배열은 향후 entities/poi로 분리 예정.
 * NOTE: `seoulOnlyToastVisible`은 feature-level UI 관심사이나
 *       location 도메인과 강하게 결합되어 있어 임시로 여기에 유지한다.
 */
export const useLocationStore = create<{
  location: string;
  allDistrictInfo: District[];
  culturalSpaceInfo: unknown[];
  dodreamgilInfo: unknown[];
  parkInfo: unknown[];
  myGeoInfo: UserGeoContext | undefined;
  seoulOnlyToastVisible: boolean;
  setLocation: (value: string) => void;
  setLocationInfo: (bundle: LocationInfoBundle) => void;
  setAllDistrictInfo: (value: District[]) => void;
  setMyGeoInfo: (value: UserGeoContext | undefined) => void;
  setSeoulOnlyToastVisible: (value: boolean) => void;
  showSeoulOnlyToast: () => void;
}>()(
  persist(
    (set) => ({
      location: "중구",
      // 날씨/지도는 초기 `allDistrictInfo`가 비어있으면 fetch를 아예 건너뛰므로
      // 기본값을 서울 구 데이터로 채워둔다.
      allDistrictInfo: localInfoData,
      culturalSpaceInfo: [],
      dodreamgilInfo: [],
      parkInfo: [],
      myGeoInfo: undefined,
      seoulOnlyToastVisible: false,
      setLocation: (value) => set({ location: value }),
      setLocationInfo: (bundle) =>
        set({
          allDistrictInfo: bundle.localInfoData,
          culturalSpaceInfo: bundle.culturalSpaceInfo,
          dodreamgilInfo: bundle.dodreamgilInfo,
          parkInfo: bundle.parkInfo,
        }),
      setAllDistrictInfo: (value) => set({ allDistrictInfo: value }),
      setMyGeoInfo: (value) => set({ myGeoInfo: value }),
      setSeoulOnlyToastVisible: (value) => set({ seoulOnlyToastVisible: value }),
      showSeoulOnlyToast: () => set({ seoulOnlyToastVisible: true }),
    }),
    {
      name: "location-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        myGeoInfo: state.myGeoInfo,
      }),
      skipHydration: true,
    },
  ),
);
