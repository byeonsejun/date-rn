import { useCallback, useRef } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import RNMapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MapMarkerData, MapType } from '@entities/map/model/types';

import { MapMarker } from '@features/map/ui/MapMarker';
import { MapPoiDetailCard } from '@features/map/ui/MapPoiDetailCard';
import { MapTypeSelector } from '@features/map/ui/MapTypeSelector';

type RNMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const SEOUL_BOUNDARY_NORTH_EAST = { latitude: 37.7015, longitude: 127.1845 };
const SEOUL_BOUNDARY_SOUTH_WEST = { latitude: 37.4305, longitude: 126.762 };
const SEOUL_MIN_ZOOM_LEVEL = 11.5;

/**
 * react-native-maps 기반 지도 UI.
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx` (GoogleMap + MarkerF)
 *
 * 담당 역할 (FSD):
 * - `features/map/ui`: 순수 UI(props-only). store/네트워크/필터링/로직 없음.
 * - 마커 렌더링/필터 적용 결과 등은 `features/map/useMapController.ts`가 주입한다.
 *
 * NOTE (Android / react-native-maps):
 * - `RNMapView`의 직접 자식은 `Marker` 등 지도 전용 노드만 두는 것이 안전하다.
 * - 일반 `View`(필터 UI)를 `MapView` **내부**에 두면 네이티브 뷰 계층에서
 *   "The specified child already has a parent" 류의 오류가 날 수 있으므로,
 *   `MapTypeSelector`는 지도와 **형제**로 두고 absolute 오버레이로 겹친다.
 */
export const MapView = (props: {
  region: RNMapRegion;
  markers: MapMarkerData[] | undefined;
  selectedType: MapType;
  overMarkerId: string | null;
  selectedMarkerId: string | null;
  selectedMarker: MapMarkerData | null;
  mapLeftPad?: number;
  onSelectType: (type: MapType) => void;
  onMarkerPress: (markerId: string) => void;
  onClosePoiDetail: () => void;
  onRegionChangeComplete: (region: RNMapRegion) => void;
}) => {
  const {
    region,
    markers,
    selectedType,
    overMarkerId,
    selectedMarkerId,
    selectedMarker,
    mapLeftPad = 12,
    onSelectType,
    onMarkerPress,
    onClosePoiDetail,
    onRegionChangeComplete,
  } = props;

  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const mapRef = useRef<RNMapView | null>(null);
  // 하단 시스템 바와 겹치지 않도록 지도 SDK 기본 UI 최소 여백을 보장한다.
  const mapControlBottomPad = Math.max(insets.bottom + 4, 28);
  // 상세 패널 / 액션 버튼은 홈 인디케이터(시스템 바) 바로 위를 기준으로 배치한다.
  const detailBottomPad = Math.max(insets.bottom, 8);
  // POI 모달이 열려 있으면 그 높이만큼 mapPadding.bottom을 늘려
  // Google Maps SDK가 마커를 모달 위 가시 영역 중앙에 배치하도록 한다.
  const poiModalHeight = selectedMarker && selectedMarker.source !== 'restaurant' ? 220 : 0;
  const mapBottomPad = mapControlBottomPad + poiModalHeight;
  // POI 카드 너비: 구글 SDK 우측 버튼 영역(~90px + 여백 35px)을 피한다.
  const googleActionButtonsWidth = 90;
  const poiCardWidth = Math.max(viewportWidth - (googleActionButtonsWidth + 35), 220);
  const openDirections = useCallback(async () => {
    if (!selectedMarker || (selectedMarker.source !== 'restaurant' && selectedMarker.source !== 'poi')) return;
    const destination = `${selectedMarker.lat},${selectedMarker.lon}`;
    // 앱 선택(chooser)을 유도하기 위해 범용 URL만 사용한다.
    // 참고: 사용자가 기본 앱을 이미 지정한 경우에는 선택창이 생략될 수 있다.
    const universalDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    await Linking.openURL(universalDirectionsUrl);
  }, [selectedMarker]);

  const openInGoogleMaps = useCallback(async () => {
    if (!selectedMarker || (selectedMarker.source !== 'restaurant' && selectedMarker.source !== 'poi')) return;
    const destination = `${selectedMarker.lat},${selectedMarker.lon}`;
    const nativeMapUrl = `geo:${selectedMarker.lat},${selectedMarker.lon}?q=${encodeURIComponent(
      selectedMarker.title,
    )}`;
    const webMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;

    if (Platform.OS === 'android') {
      const canOpenNative = await Linking.canOpenURL(nativeMapUrl);
      if (canOpenNative) {
        await Linking.openURL(nativeMapUrl);
        return;
      }
    }
    await Linking.openURL(webMapUrl);
  }, [selectedMarker]);

  const lockToSeoulBounds = useCallback(() => {
    // 웹 GoogleMap `restriction + strictBounds`와 유사한 "벽" 체감을 위해
    // 네이티브 카메라 타깃 경계를 직접 설정한다.
    mapRef.current?.setMapBoundaries(SEOUL_BOUNDARY_NORTH_EAST, SEOUL_BOUNDARY_SOUTH_WEST);
  }, []);

  return (
    <View className="relative h-full w-full rounded-2xl bg-neutral-100">
      {/* rounded-2xl 모서리 클리핑은 포인터 이벤트 없는 오버레이로만 처리한다.
          overflow-hidden을 지도 컨테이너에 직접 걸면 iOS에서 내부 마커 뷰까지
          잘려 원형 마커가 깨지는 문제가 발생한다. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 16,
          overflow: 'hidden',
          zIndex: 0,
        }}
      />
      <RNMapView
        ref={mapRef}
        provider="google"
        toolbarEnabled={false}
        minZoomLevel={SEOUL_MIN_ZOOM_LEVEL}
        className="h-full w-full"
        style={styles.map}
        region={region}
        mapPadding={{ top: 12, right: 0, bottom: mapBottomPad, left: mapLeftPad }}
        onMapReady={lockToSeoulBounds}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {markers?.map((marker) => (
          <MapMarker
            key={marker.id}
            marker={marker}
            isSelected={marker.id === selectedMarkerId}
            isOver={marker.id === overMarkerId}
            onPress={onMarkerPress}
          />
        ))}
      </RNMapView>

      {markers === undefined ? (
        <View className="absolute inset-0 z-[5] items-center justify-center bg-neutral-100/70">
          <Text className="text-xs font-semibold text-neutral-700">{t('map.loadingMarkers')}</Text>
        </View>
      ) : markers.length === 0 ? (
        <View className="absolute inset-0 z-[5] items-center justify-center bg-neutral-100/70">
          <Text className="text-xs font-semibold text-neutral-700">{t('map.noMarkers')}</Text>
        </View>
      ) : null}

      <MapTypeSelector selectedType={selectedType} onSelectType={onSelectType} />

      {selectedMarker && selectedMarker.source !== 'restaurant' ? (
        <View
          className="absolute left-3 z-[12]"
          style={{ bottom: detailBottomPad, maxHeight: '50%', width: poiCardWidth }}
        >
          <MapPoiDetailCard
            key={selectedMarker.id}
            marker={selectedMarker}
            onClose={onClosePoiDetail}
            onOpenMaps={() => { void openInGoogleMaps(); }}
            onOpenDirections={() => { void openDirections(); }}
          />
        </View>
      ) : null}

      {selectedMarker && selectedMarker.source === 'restaurant' ? (
        <View className="absolute right-3 z-[12] flex-row gap-2" style={{ bottom: detailBottomPad }}>
          <Pressable
            onPress={() => { void openInGoogleMaps(); }}
            className="rounded-xl bg-neutral-700 px-4 py-3 shadow-md"
            accessibilityLabel={t('map.viewSelectedRestaurantOnMaps')}
          >
            <Text className="text-sm font-semibold text-white">{t('map.viewMap')}</Text>
          </Pressable>
          <Pressable
            onPress={() => { void openDirections(); }}
            className="rounded-xl bg-sky-500 px-4 py-3 shadow-md"
            accessibilityLabel={t('map.directionsToSelectedRestaurant')}
          >
            <Text className="text-sm font-semibold text-white">{t('map.directions')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  /** NativeWind가 MapView에 높이를 못 줄 때 Android에서 빈 영역이 되는 것을 막는다. */
  map: { flex: 1, width: '100%', height: '100%' },
});
