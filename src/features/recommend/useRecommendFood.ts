import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { useTranslation } from "react-i18next";

import { useLocationStore } from "@entities/location/model/store";
import { useMapStore } from "@entities/map/model/store";
import { fetchRestaurantsNearCoordinate } from "@entities/restaurant/api/api";
import type { Restaurant } from "@entities/restaurant/model/types";
import { useRestaurantStore } from "@entities/restaurant/model/store";

import { findStorageItem } from "@shared/lib/storage";
import type { SupportedLanguage } from "@shared/i18n";

/**
 * 맛집 추천 패널 오케스트레이션 훅.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/RecommendFood.jsx`
 *      - `useLocationStore`의 `location`, `myGeoInfo`, `allDistrictInfo`
 *      - `POST /api/restaurants` → RN에서는 `entities/restaurant/api`가 Google Places 직접 호출
 *      - `recommendData`, `expansion`, `handleMarker`(맛집 썸네일 클릭)
 *
 * 2. 담당 역할
 *    - `features/recommend/useRecommendFood.ts`: 위치 스토어에서 좌표를 결정하고 API를 호출한 뒤
 *      `entities/restaurant` 스토어에 결과를 반영한다. 응답 정규화는 API 레이어에서 끝나며,
 *      패널 전용 표시 상태(로딩/에러)는 훅 로컬 state로 둔다.
 *    - **FSD:** `features/location`을 import하지 않고, 오직 `entities/location/model/store`만 읽는다.
 *
 * 3. 작동 원리 요약
 *    - `expansion`이 true일 때만 네트워크 요청을 시도한다.
 *    - 웹과 동일한 가드(동의·현재 위치·구 정보 준비)를 `AsyncStorage` + 스토어 필드로 판단한다.
 *    - 동일 `(language, location, lat, lon)` 키로 이미 성공한 적이 있으면 재요청하지 않는다.
 *      `language`가 키에 포함되어 있어, 구는 그대로 두고 언어만 토글해도 재요청된다.
 *    - 썸네일 탭 시 해당 추천식당 마커를 선택 상태로 만든다.
 */

/** `RecommendFood`가 `measureInWindow`로 잡은 패널 우측 끝(x+w). 없으면 과거 기본값(272dp) 사용 */
export const useRecommendFood = (panelRightEdgePx: number | null) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const location = useLocationStore((s) => s.location);
  const myGeoInfo = useLocationStore((s) => s.myGeoInfo);
  const allDistrictInfo = useLocationStore((s) => s.allDistrictInfo);

  const expansion = useRestaurantStore((s) => s.expansion);
  const setExpansion = useRestaurantStore((s) => s.setExpansion);
  const recommendData = useRestaurantStore((s) => s.recommendData);
  const setRecommendData = useRestaurantStore((s) => s.setRecommendData);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const lastSuccessKeyRef = useRef<string | null>(null);

  const resolveCoordinate = useCallback((): { lat: number; lon: number } | null => {
    if (location === "현재 위치") {
      if (!myGeoInfo) return null;
      return { lat: myGeoInfo.lat, lon: myGeoInfo.lon };
    }
    const row = allDistrictInfo.find((d) => d.location === location);
    if (!row) return null;
    return { lat: row.lat, lon: row.lon };
  }, [allDistrictInfo, location, myGeoInfo]);

  const onRestaurantPhotoPress = useCallback((item: Restaurant) => {
    const mapStore = useMapStore.getState();
    mapStore.onClickRecommendMaker(`place:${item.placeId}`);

    const screenWidth = Dimensions.get("window").width;
    const prevRegion = mapStore.region;
    const { latitudeDelta, longitudeDelta } = prevRegion;

    // 패널 우측 끝(화면 좌표). 측정 실패 시 left-4 + w-64에 맞춘 기존 추정값.
    const FALLBACK_PANEL_RIGHT_DP = 272;
    const rightEdge =
      typeof panelRightEdgePx === "number" && panelRightEdgePx > 0
        ? panelRightEdgePx
        : FALLBACK_PANEL_RIGHT_DP;
    const lonOffset = (rightEdge / 2) * (longitudeDelta / screenWidth);

    const nextLon = item.lon - lonOffset;
    const nextRegion = {
      lat: item.lat,
      lon: nextLon,
      latitudeDelta,
      longitudeDelta,
    };

    mapStore.setRegion(nextRegion);
  }, [panelRightEdgePx]);

  useEffect(() => {
    if (!expansion) return;

    const coord = resolveCoordinate();
    if (!coord) return;

    const key = `${language}:${location}:${coord.lat.toFixed(6)},${coord.lon.toFixed(6)}`;
    const cached = useRestaurantStore.getState().recommendData;
    if (lastSuccessKeyRef.current === key && cached !== undefined) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      const locationAgree = await findStorageItem("locationAgree");
      if (cancelled) return;
      if (locationAgree && !myGeoInfo) return;
      if (location === "현재 위치" && !myGeoInfo) return;
      if (!myGeoInfo && allDistrictInfo.length === 0) return;

      const coordAgain = resolveCoordinate();
      if (!coordAgain) return;
      const keyAgain = `${language}:${location}:${coordAgain.lat.toFixed(6)},${coordAgain.lon.toFixed(6)}`;
      if (lastSuccessKeyRef.current === keyAgain && useRestaurantStore.getState().recommendData !== undefined) {
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const data = await fetchRestaurantsNearCoordinate(coordAgain.lat, coordAgain.lon, language);
        if (cancelled) return;
        setRecommendData(data);
        lastSuccessKeyRef.current = keyAgain;
      } catch (e) {
        if (cancelled) return;
        setFetchError(e instanceof Error ? e.message : t('recommend.foodFetchError'));
        setRecommendData(undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [
    allDistrictInfo.length,
    expansion,
    language,
    location,
    myGeoInfo,
    resolveCoordinate,
    setRecommendData,
  ]);

  return {
    expansion,
    setExpansion,
    restaurants: recommendData ?? [],
    loading,
    fetchError,
    onRestaurantPhotoPress,
  };
};
