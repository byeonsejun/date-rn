import AsyncStorage from "@react-native-async-storage/async-storage";

// 저장된 사용자 설정/동의 여부 값을 읽어올 때 사용.
export const findStorageItem = async (key: string): Promise<string | null> => {
  return AsyncStorage.getItem(key);
};

// 사용자 설정/상태를 로컬에 저장할 때 사용.
export const createStorageItem = async (
  key: string,
  value: string,
): Promise<void> => {
  await AsyncStorage.setItem(key, value);
};

// 더 이상 필요 없는 로컬 상태를 제거할 때 사용.
export const removeStorageItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};
