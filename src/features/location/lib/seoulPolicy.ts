import {
  createStorageItem,
  findStorageItem,
  removeStorageItem,
} from "@shared/lib/storage";

const OUTSIDE_KEY = "outside";
const CONSENT_KEY = "locationAgree";
const CONSENT_ASKED_KEY = "locationConsentAsked";

/**
 * 기존 웹 `service/weather.js#getUserGeoInfo`에서 서울 외 지역 감지 시
 * 수행하던 스토리지 조작 로직을 feature 단위로 캡슐화한다.
 */
export const markOutsideSeoul = async (): Promise<void> => {
  await removeStorageItem(CONSENT_KEY);
  await createStorageItem(OUTSIDE_KEY, "true");
};

/**
 * "현재 위치" 선택 시 서울 외 지역으로 마킹된 상태인지 확인한다.
 */
export const isMarkedOutside = async (): Promise<boolean> => {
  const value = await findStorageItem(OUTSIDE_KEY);
  return value === "true";
};

/**
 * 역지오코딩 성공 후 서울임이 확인되었을 때 동의 플래그를 저장한다.
 */
export const markLocationAgreed = async (): Promise<void> => {
  await removeStorageItem(OUTSIDE_KEY);
  await createStorageItem(CONSENT_KEY, "true");
};

/**
 * 위치 동의 모달을 이미 표시했는지 확인한다.
 */
export const hasAskedConsent = async (): Promise<boolean> => {
  const value = await findStorageItem(CONSENT_ASKED_KEY);
  return value === "true";
};

/**
 * 위치 동의 모달이 표시되었음을 기록한다.
 */
export const markConsentAsked = async (): Promise<void> => {
  await createStorageItem(CONSENT_ASKED_KEY, "true");
};

/**
 * 위치 권한이 동의되었는지 확인한다.
 */
export const hasLocationConsent = async (): Promise<boolean> => {
  const value = await findStorageItem(CONSENT_KEY);
  return value === "true";
};

/**
 * 위치 정책 관련 AsyncStorage만 비운다. Zustand `location-store`는 별도 제거가 필요하다.
 */
export const clearLocationPolicyStorage = async (): Promise<void> => {
  await removeStorageItem(OUTSIDE_KEY);
  await removeStorageItem(CONSENT_KEY);
  await removeStorageItem(CONSENT_ASKED_KEY);
};

export const DEFAULT_DISTRICT = "중구";
