import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearLocationPolicyStorage } from "@features/location/lib/seoulPolicy";

/**
 * 개발 중 매 실행마다 첫 방문자처럼 테스트할 때 `true`로 둔다.
 * 실제 기기에서 상태를 유지해 테스트하려면 `false`로 바꾼다.
 */
export const RESET_LOCATION_STATE_ON_EACH_LAUNCH = __DEV__ && true;

const LOCATION_STORE_KEY = "location-store";

export async function clearAllLocationPersistenceForDevTest(): Promise<void> {
  await AsyncStorage.removeItem(LOCATION_STORE_KEY);
  await clearLocationPolicyStorage();
}
