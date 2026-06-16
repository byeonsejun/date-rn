import { useEffect, useRef } from "react";
import * as Location from "expo-location";

import { useGeolocation } from "@features/location/useGeolocation";

/**
 * 앱 콜드 스타트 시 1회 자동으로 현재 위치를 측정하는 Feature 훅. (지도앱식 자동 갱신)
 *
 * 1. 동작
 *    - mount 1회만 실행. AppState(백그라운드→active) 재측정은 이번 범위 밖이며,
 *      복귀 시 갱신은 기존 "현재 위치" 버튼(`useDistrictSelect`)이 담당한다.
 *    - 측정은 기존 `requestLocation` 경로를 그대로 재사용한다(새 측정/판정 로직을 만들지 않음).
 *      서울 밖이면 그 경로에서 기존 토스트가 그대로 뜬다.
 *
 * 2. 권한 게이트 (조용한 조회만)
 *    - `getForegroundPermissionsAsync()`(프롬프트 없는 조회) 결과가 `granted`일 때만 자동 측정한다.
 *    - `undetermined`/`denied`면 아무것도 하지 않고 조용히 스킵한다. 권한 요청 프롬프트는
 *      띄우지 않는다(첫 사용자 권한 요청은 동의 모달 흐름이 전담).
 *    - NOTE: `locationAgree`(CONSENT_KEY)는 "서울일 때만" 저장되므로 게이트로 쓰지 않는다.
 *      성남 등 서울 밖에서 동의한 사용자를 잘못 배제하지 않도록 OS 권한 상태로만 판단한다.
 *
 * 3. 실패/거부 fallback
 *    - 사용자 액션이 아니므로 실패 시 추가 토스트 없이 조용히 무시한다.
 *      (`requestLocation` 내부의 기존 catch 폴백(중구) 동작은 그대로 유지된다.)
 *    - 중복 측정은 `useGeolocation`의 모듈 레벨 in-flight 가드가 막는다
 *      (자동 훅과 동의 모달이 첫 실행에서 겹쳐도 1건만 수행).
 */
export const useAutoGeolocation = (): void => {
  const { requestLocation } = useGeolocation();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async (): Promise<void> => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== "granted") return;
        await requestLocation();
      } catch {
        // 자동 측정 실패는 조용히 무시한다.
      }
    };

    void run();
  }, [requestLocation]);
};
