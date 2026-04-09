import { type ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import {
  RESET_LOCATION_STATE_ON_EACH_LAUNCH,
  clearAllLocationPersistenceForDevTest,
} from "@core/dev/locationTestReset";
import { useLocationStore } from "@entities/location/model/store";
import { Loading } from "@shared/ui/Loading";

interface AppProviderProps {
  children: ReactNode;
}

/**
 * persist 스토어가 `skipHydration: true`이므로, AsyncStorage에서 상태를 병합하기 전에
 * UI가 기본값으로 한 번 그려지는 것을 막기 위해 수동 `rehydrate` 후 자식을 렌더한다.
 * 원본 웹의 동기 `localStorage`와 달리 RN은 비동기 복원이 필수다.
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async (): Promise<void> => {
      if (RESET_LOCATION_STATE_ON_EACH_LAUNCH) {
        await clearAllLocationPersistenceForDevTest();
      }
      await Promise.all([useLocationStore.persist.rehydrate()]);
      setHydrated(true);
    };

    void hydrate();
  }, []);

  if (!hydrated) {
    return (
      <View className="flex-1 bg-white">
        <Loading fullscreen message="설정 불러오는 중..." />
      </View>
    );
  }

  return children;
};
