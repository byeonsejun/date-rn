import { useEffect, useState } from "react";
import { hasAskedConsent, markConsentAsked } from "@features/location/lib/seoulPolicy";
import { useGeolocation } from "@features/location/useGeolocation";

/**
 * 위치 동의 모달의 표시 여부·동의/거부 핸들링을 담당하는 Feature 훅.
 * 동의 시 `requestLocation`으로 GPS·역지오코딩·날씨까지 구 선택과 동일한 경로를 탄다.
 */
export const useLocationConsent = () => {
  const { requestLocation } = useGeolocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = async () => {
      const asked = await hasAskedConsent();
      if (!asked) setVisible(true);
    };
    void check();
  }, []);

  const handleAgree = async () => {
    await markConsentAsked();
    setVisible(false);
    await requestLocation();
  };

  const handleDecline = async () => {
    await markConsentAsked();
    setVisible(false);
  };

  return { visible, handleAgree, handleDecline };
};
