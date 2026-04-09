import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useLocationStore } from '@entities/location/model/store';
import { useMapStore } from '@entities/map/model/store';
import { useRestaurantStore } from '@entities/restaurant/model/store';

import type { MapMarkerData, MapRegion, MapType } from '@entities/map/model/types';

import { buildMapMarkers } from '@features/map/lib/markers';

/**
 * 지도 오케스트레이션 훅 (Orchestrator).
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx`
 *   - location 변화에 따른 center 이동
 *   - 마커 hover/selected 처리 (handleMarker)
 * - 웹: `components/SelectShowMapType.jsx`
 *   - selectedType 변경에 따른 showPoint 재계산
 *
 * 담당 역할 (FSD):
 * - `features/map/useMapController.ts`: store 구독 + 이벤트 핸들러 + 마커 배열 생성 오케스트레이션
 * - store 갱신은 `entities/map/model/store.ts`를 통해서만 수행한다.
 * - 마커 생성/필터링은 `features/map/lib/markers.ts`의 순수 함수를 사용한다.
 *
 * UI 제약:
 * - `features/map/ui/*`는 props-only 순수 UI여야 하며,
 *   이 훅은 비즈니스/상태 변경 책임을 진다.
 */
/** programmatic setRegion 호출 이후 onRegionChangeComplete 무시 기간 (ms) */
const PROGRAMMATIC_REGION_LOCK_MS = 1200;

/**
 * 웹 GoogleMapContainer.jsx `mapOptions.restriction.latLngBounds` 와 동일한 서울 경계.
 * 사용자가 지도를 드래그해 서울 밖으로 이동하면 이 경계 안으로 되돌린다.
 *
 * ROLLBACK: 이 블록(SEOUL_BOUNDS ~ clampToSeoulBounds)과
 *           handleRegionChangeComplete 내 "bounds 보정" 주석 블록을 제거하면 원복된다.
 */
const SEOUL_BOUNDS = {
  north: 37.7015,
  south: 37.4305,
  west: 126.762,
  east: 127.1845,
} as const;

/** 웹 mapOptions.minZoom: 11.5 에 대응 — 서울 전체 폭을 초과하는 줌아웃 방지 */
const MAX_LAT_DELTA = 0.27; // ≈ SEOUL_BOUNDS.north - SEOUL_BOUNDS.south
const MAX_LON_DELTA = 0.42; // ≈ SEOUL_BOUNDS.east  - SEOUL_BOUNDS.west

/** region 중심이 서울 경계를 벗어났거나 과도하게 줌아웃 되었을 때 보정값을 반환한다. */
function clampToSeoulBounds(region: MapRegion): { clamped: MapRegion; changed: boolean } {
  const lat = Math.max(SEOUL_BOUNDS.south, Math.min(SEOUL_BOUNDS.north, region.lat));
  const lon = Math.max(SEOUL_BOUNDS.west, Math.min(SEOUL_BOUNDS.east, region.lon));
  const latitudeDelta = Math.min(region.latitudeDelta, MAX_LAT_DELTA);
  const longitudeDelta = Math.min(region.longitudeDelta, MAX_LON_DELTA);
  const changed =
    lat !== region.lat ||
    lon !== region.lon ||
    latitudeDelta !== region.latitudeDelta ||
    longitudeDelta !== region.longitudeDelta;
  return { clamped: { lat, lon, latitudeDelta, longitudeDelta }, changed };
}

export const useMapController = () => {
  /**
   * 지역구 전환 등 programmatic한 setRegion 호출 시각.
   * onRegionChangeComplete가 직전 pan 감속을 덮어쓰는 레이스 컨디션을 방지한다.
   */
  const programmaticRegionSetAt = useRef<number>(0);

  const location = useLocationStore((s) => s.location);
  const myGeoInfo = useLocationStore((s) => s.myGeoInfo);
  const allDistrictInfo = useLocationStore((s) => s.allDistrictInfo);

  const showPoint = useMapStore((s) => s.showPoint);
  const overMarkerId = useMapStore((s) => s.overMarkerId);
  const selectedMarkerId = useMapStore((s) => s.selectedMarkerId);
  const selectedType = useMapStore((s) => s.selectedType);
  const region = useMapStore((s) => s.region);
  const recommendData = useRestaurantStore((s) => s.recommendData);
  const recommendExpansion = useRestaurantStore((s) => s.expansion);

  const setShowPoint = useMapStore((s) => s.setShowPoint);
  const setOverMarkerId = useMapStore((s) => s.setOverMarkerId);
  const setSelectedMarkerId = useMapStore((s) => s.setSelectedMarkerId);
  const setSelectedType = useMapStore((s) => s.setSelectedType);
  const setRegion = useMapStore((s) => s.setRegion);

  const filteredDistrict = useMemo(() => {
    if (location === '현재 위치') return myGeoInfo?.gu ?? myGeoInfo?.district ?? '';
    return location;
  }, [location, myGeoInfo]);

  const currentLocationCoord = useMemo(() => {
    if (location !== '현재 위치') return null;
    if (!myGeoInfo) return null;
    const { lat, lon } = myGeoInfo;
    if (
      typeof lat !== 'number' ||
      typeof lon !== 'number' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon)
    ) {
      return null;
    }
    return { lat, lon };
  }, [location, myGeoInfo]);

  const computeCenter = useCallback((): { lat: number; lon: number } | null => {
    if (location === '현재 위치') {
      if (myGeoInfo) {
        const { lat, lon } = myGeoInfo;
        if (
          typeof lat === 'number' &&
          typeof lon === 'number' &&
          Number.isFinite(lat) &&
          Number.isFinite(lon)
        ) {
          return { lat, lon };
        }
      }
      // 위치 권한 미확보/지오코딩 미완료 상태: 기본값으로 중구 좌표를 사용.
      const fallback = allDistrictInfo.find((d) => d.location === '중구');
      if (!fallback) return null;
      return { lat: fallback.lat, lon: fallback.lon };
    }

    const found = allDistrictInfo.find((d) => d.location === location);
    if (!found) return null;
    return { lat: found.lat, lon: found.lon };
  }, [allDistrictInfo, location, myGeoInfo]);

  const makeRegion = useCallback(
    (center: { lat: number; lon: number }): MapRegion => ({
      lat: center.lat,
      lon: center.lon,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    }),
    [],
  );

  // 웹의 `handleCenterPosition(location)`에 해당.
  useEffect(() => {
    const center = computeCenter();
    if (!center) return;
    const next = makeRegion(center);
    // programmatic 변경 시각을 기록해 onRegionChangeComplete 덮어쓰기를 방지한다.
    programmaticRegionSetAt.current = Date.now();
    setSelectedMarkerId(null);
    setRegion(next);
  }, [computeCenter, makeRegion, setRegion, setSelectedMarkerId]);

  // 웹의 `SelectShowMapType` useEffect(필터/selectedType 변경에 따른 showPoint 재계산) 이식.
  useEffect(() => {
    const district = filteredDistrict.trim();
    if (!district) {
      setShowPoint(undefined);
      return;
    }

    const markers = buildMapMarkers({
      district,
      mapType: selectedType,
      currentLocation: currentLocationCoord,
    });
    setShowPoint(markers);
  }, [filteredDistrict, selectedType, currentLocationCoord, setShowPoint]);

  const recommendMarkers = useMemo((): MapMarkerData[] => {
    if (!recommendExpansion || !recommendData || recommendData.length === 0) {
      return [];
    }
    return recommendData.map((item) => ({
      id: `place:${item.placeId}`,
      source: 'restaurant',
      placeId: item.placeId,
      title: item.name,
      kind: '추천식당',
      lat: item.lat,
      lon: item.lon,
      imageUrl: item.imageUri,
      rating: item.rating,
      userRatingsTotal: item.userRatingsTotal,
      openNow: item.openNow,
    }));
  }, [recommendData, recommendExpansion]);

  const mergedMarkers = useMemo((): MapMarkerData[] | undefined => {
    // `showPoint`(POI/현재위치)가 아직 준비되지 않은 타이밍에도,
    // 추천식당(`recommendMarkers`)은 먼저 보여주도록 안전하게 합친다.
    if (!showPoint) {
      return recommendMarkers.length > 0 ? recommendMarkers : undefined;
    }
    if (recommendMarkers.length === 0) return showPoint;
    return [...showPoint, ...recommendMarkers];
  }, [recommendMarkers, showPoint]);

  const selectedMarker = useMemo((): MapMarkerData | null => {
    if (!selectedMarkerId || !mergedMarkers) return null;
    return mergedMarkers.find((m) => m.id === selectedMarkerId) ?? null;
  }, [mergedMarkers, selectedMarkerId]);

  /**
   * 마커 클릭 처리.
   *
   * NOTE: RN에서는 모바일 hover가 없어, 웹의 `onMouseOver/onMouseOut`에 대응되는
   * `overMarkerId`는 현재 구현에서 직접 사용하지 않는다.
   *
   * POI 마커 상세는 Callout(마커 좌표 위 말풍선)으로 표시하므로
   * 더 이상 하단 모달과의 겹침을 피하기 위한 카메라 오프셋이 필요 없다.
   */
  const handleMarkerPress = useCallback(
    (markerId: string) => {
      setSelectedMarkerId(markerId);
    },
    [setSelectedMarkerId],
  );

  const handleMarkerIn = useCallback((markerId: string) => setOverMarkerId(markerId), [setOverMarkerId]);

  const handleMarkerOut = useCallback(() => setOverMarkerId(null), [setOverMarkerId]);

  const handleSelectType = useCallback(
    (value: MapType) => {
      setSelectedType(value);
    },
    [setSelectedType],
  );

  const handleRegionChangeComplete = useCallback(
    (next: MapRegion) => {
      // programmatic setRegion 직후에 들어오는 onRegionChangeComplete는 무시한다.
      // (지역구 전환 직후 pan 감속이 완료되며 발생하는 레이스 컨디션 방지)
      if (Date.now() - programmaticRegionSetAt.current < PROGRAMMATIC_REGION_LOCK_MS) {
        return;
      }
      // bounds 보정: 서울 경계 밖으로 드래그하거나 과도하게 줌아웃 했을 때
      // programmatic 보정으로 처리해 재귀 이벤트를 차단한다.
      const { clamped, changed } = clampToSeoulBounds(next);
      if (changed) {
        programmaticRegionSetAt.current = Date.now();
        setRegion(clamped);
        return;
      }
      setRegion(next);
    },
    [setRegion],
  );

  const handleClosePoiDetail = useCallback(() => {
    setSelectedMarkerId(null);
  }, [setSelectedMarkerId]);

  return {
    region,
    showPoint: mergedMarkers,
    overMarkerId,
    selectedMarkerId,
    selectedMarker,
    selectedType,
    recommendExpansion,
    handleSelectType,
    handleMarkerPress,
    handleMarkerIn,
    handleMarkerOut,
    handleClosePoiDetail,
    handleRegionChangeComplete,
  };
};
