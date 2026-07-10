import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import i18n, { detectDeviceLanguage, type SupportedLanguage } from "./index";

/**
 * 사용자가 선택한 언어 상태. `entities/location/model/store.ts`의 persist 패턴을 따른다.
 * `skipHydration: true`이므로 `AppProvider`가 다른 persist 스토어와 함께 수동 rehydrate한다.
 *
 * 저장된 값이 없으면(최초 실행) 기기 언어 감지 결과를 기본값으로 쓰고,
 * 복원된 값이 있으면 `onRehydrateStorage`에서 i18next 인스턴스를 그 값으로 동기화한다.
 */
export const useLanguageStore = create<{
  language: SupportedLanguage;
  setLanguage: (value: SupportedLanguage) => void;
}>()(
  persist(
    (set) => ({
      language: detectDeviceLanguage(),
      setLanguage: (value) => {
        void i18n.changeLanguage(value);
        set({ language: value });
      },
    }),
    {
      name: "language-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state?.language) void i18n.changeLanguage(state.language);
      },
    },
  ),
);
