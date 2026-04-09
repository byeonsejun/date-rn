import { useMemo } from 'react';
import { View } from 'react-native';

import type { MapRegion } from '@entities/map/model/types';

import { MapView } from '@features/map/ui/MapView';
import { useMapController } from '@features/map/useMapController';
import { RecommendFood } from '@features/recommend/ui/RecommendFood';

type RNMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const mapRegionToRn = (r: MapRegion): RNMapRegion => ({
  latitude: r.lat,
  longitude: r.lon,
  latitudeDelta: r.latitudeDelta,
  longitudeDelta: r.longitudeDelta,
});

const rnRegionToMapRegion = (r: RNMapRegion): MapRegion => ({
  lat: r.latitude,
  lon: r.longitude,
  latitudeDelta: r.latitudeDelta,
  longitudeDelta: r.longitudeDelta,
});

/**
 * 홈 화면 메인 지도 + 맛집 플로팅 패널.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/MainSection.jsx` 우측 (Google Map + RecommendFood)
 *
 * 2. 조립한 Feature
 *    - `features/map`: `useMapController`, `MapView` (내부에 `MapTypeSelector` 포함)
 *    - `features/recommend`: `RecommendFood` (내부에서 `useRecommendFood` 사용)
 *
 * 3. 화면에서의 역할
 *    - `entities/map` 스토어의 `MapRegion`은 lat/lon 표준이고, `MapView`는 RN Maps용
 *      `latitude/longitude`를 요구하므로 **이 위젯에서만** 양방향 변환을 수행한다 (절대 규칙 5:
 *      UI 컴포넌트 내부 어댑터가 아니라 조립 계층에서 경계 명시).
 *    - `RecommendFood`는 지도 위에 absolute로 겹친다.
 */
export const HomeMap = () => {
  const {
    region,
    showPoint,
    overMarkerId,
    selectedMarkerId,
    selectedMarker,
    selectedType,
    recommendExpansion,
    handleSelectType,
    handleMarkerPress,
    handleClosePoiDetail,
    handleRegionChangeComplete,
  } = useMapController();

  // 추천식당 패널이 펼쳐지면 패널 우측 끝(left-4 + w-64 = 16+256 = 272px)만큼
  // mapPadding.left를 늘려 Google Maps SDK가 마커를 가시 영역 중앙에 배치하게 한다.
  const RESTAURANT_PANEL_RIGHT_PX = 272;
  const mapLeftPad = recommendExpansion ? RESTAURANT_PANEL_RIGHT_PX : 12;
  const stableRegion = useMemo(() => mapRegionToRn(region), [region]);

  return (
    <View className="relative flex-1">
      <View className={selectedMarker && selectedMarker.source !== 'restaurant' ? 'z-20 flex-1' : 'z-0 flex-1'}>
        <MapView
          region={stableRegion}
          markers={showPoint}
          selectedType={selectedType}
          overMarkerId={overMarkerId}
          selectedMarkerId={selectedMarkerId}
          selectedMarker={selectedMarker}
          mapLeftPad={mapLeftPad}
          onSelectType={handleSelectType}
          onMarkerPress={handleMarkerPress}
          onClosePoiDetail={handleClosePoiDetail}
          onRegionChangeComplete={(next) => handleRegionChangeComplete(rnRegionToMapRegion(next))}
        />
      </View>
      <RecommendFood />
    </View>
  );
};
