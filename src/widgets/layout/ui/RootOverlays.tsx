import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useLocationStore } from "@entities/location/model/store";

import { LocationConsentModal } from "@features/location/ui/LocationConsentModal";
import { useAutoGeolocation } from "@features/location/useAutoGeolocation";
import { useLocationConsent } from "@features/location/useLocationConsent";

import { Toast } from "@shared/ui/Toast";

const SEOUL_TOAST_AUTO_DISMISS_MS = 5000;

/**
 * 루트 레이아웃 전역 오버레이 (위치 동의 모달 + 서울 한정 토스트).
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/app/layout.jsx`의 `<LocationConsentModal />`, `<SeoulOnlyToast />`
 *
 * 2. 조립한 Feature
 *    - `features/location`: `useLocationConsent`, `LocationConsentModal`
 *    - `entities/location/model/store`: `seoulOnlyToastVisible` 구독
 *    - `shared/ui/Toast`
 *
 * 3. 화면에서의 역할
 *    - `app/`에는 로직을 두지 않고, 위젯 계층에서만 Feature 훅·UI를 묶어
 *      앱 전역에 한 번만 마운트되도록 한다 (FSD: widgets가 feature 조립 담당).
 */
export const RootOverlays = () => {
  const { t } = useTranslation();

  // 권한이 이미 허용된 사용자는 콜드 스타트 시 1회 자동으로 현재 위치를 측정한다.
  // (미허용 사용자는 조용히 스킵되고 아래 동의 모달 흐름이 첫 사용자를 담당)
  useAutoGeolocation();

  const { visible, handleAgree, handleDecline } = useLocationConsent();
  const seoulOnlyToastVisible = useLocationStore((s) => s.seoulOnlyToastVisible);
  const setSeoulOnlyToastVisible = useLocationStore(
    (s) => s.setSeoulOnlyToastVisible,
  );

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setSeoulOnlyToastVisible(false);
  }, [setSeoulOnlyToastVisible]);

  useEffect(() => {
    if (!seoulOnlyToastVisible) return;
    timerRef.current = setTimeout(closeToast, SEOUL_TOAST_AUTO_DISMISS_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [seoulOnlyToastVisible, closeToast]);

  return (
    <>
      <LocationConsentModal
        visible={visible}
        onAgree={handleAgree}
        onDecline={handleDecline}
      />
      <Toast
        visible={seoulOnlyToastVisible}
        message={t('location.seoulOnlyToast')}
        onClose={closeToast}
      />
    </>
  );
};
