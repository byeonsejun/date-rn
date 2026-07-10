import { useCallback } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MapMarkerData, MapType } from '@entities/map/model/types';
import { getPoiDisplayTitle } from '@entities/poi/lib/label';
import type { SupportedLanguage } from '@shared/i18n';

import { MapPoiDetailCard } from '@features/map/ui/MapPoiDetailCard';
import { MapTypeSelector } from '@features/map/ui/MapTypeSelector';

type RNMapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/**
 * 웹용 지도 UI. `react-native-maps`는 웹 번들을 지원하지 않으므로
 * 동일 props 계약으로 플레이스홀더 + 오버레이 UI만 제공한다.
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
  onRegionChangeComplete: (_region: RNMapRegion) => void;
}) => {
  const {
    region,
    markers,
    selectedType,
    selectedMarker,
    mapLeftPad = 12,
    onSelectType,
    onMarkerPress,
    onClosePoiDetail,
  } = props;

  const { t, i18n } = useTranslation();
  const language = i18n.language as SupportedLanguage;
  const insets = useSafeAreaInsets();
  const { width: viewportWidth } = useWindowDimensions();
  const detailBottomPad = Math.max(insets.bottom, 8);
  const googleActionButtonsWidth = 90;
  const poiCardWidth = Math.max(viewportWidth - (googleActionButtonsWidth + 35), 220);

  const openDirections = useCallback(async () => {
    if (!selectedMarker || (selectedMarker.source !== 'restaurant' && selectedMarker.source !== 'poi')) return;
    const destination = `${selectedMarker.lat},${selectedMarker.lon}`;
    await Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
    );
  }, [selectedMarker]);

  const openInGoogleMaps = useCallback(async () => {
    if (!selectedMarker || (selectedMarker.source !== 'restaurant' && selectedMarker.source !== 'poi')) return;
    const destination = `${selectedMarker.lat},${selectedMarker.lon}`;
    await Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,
    );
  }, [selectedMarker]);

  const openMapInBrowser = useCallback(async () => {
    const { latitude, longitude } = region;
    await Linking.openURL(
      `https://www.google.com/maps/@${latitude},${longitude},13z`,
    );
  }, [region]);

  return (
    <View className="relative h-full w-full rounded-2xl bg-neutral-100">
      <View style={styles.mapPlaceholder} className="items-center justify-center px-6">
        <Text className="mb-2 text-center text-sm font-semibold text-neutral-800">
          {t('map.webPreviewUnavailable')}
        </Text>
        <Text className="mb-4 text-center text-xs text-neutral-600">
          {t('map.webPreviewHint')}
        </Text>
        <Pressable
          onPress={() => { void openMapInBrowser(); }}
          className="rounded-xl bg-sky-500 px-4 py-2"
          accessibilityLabel={t('map.openCurrentAreaInBrowser')}
        >
          <Text className="text-sm font-semibold text-white">{t('map.openInGoogleMapsBrowser')}</Text>
        </Pressable>
        {markers && markers.length > 0 ? (
          <View className="mt-4 w-full max-w-md gap-2">
            {markers.slice(0, 8).map((marker) => (
              <Pressable
                key={marker.id}
                onPress={() => onMarkerPress(marker.id)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2"
              >
                <Text className="text-xs font-semibold text-neutral-800">
                  {marker.source === 'poi' ? getPoiDisplayTitle(marker, language) : marker.title}
                </Text>
              </Pressable>
            ))}
            {markers.length > 8 ? (
              <Text className="text-center text-[11px] text-neutral-500">
                {t('map.moreMarkersHint', { count: markers.length - 8 })}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

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
          style={{ bottom: detailBottomPad, maxHeight: '50%', width: poiCardWidth, marginLeft: mapLeftPad - 12 }}
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
          >
            <Text className="text-sm font-semibold text-white">{t('map.viewMap')}</Text>
          </Pressable>
          <Pressable
            onPress={() => { void openDirections(); }}
            className="rounded-xl bg-sky-500 px-4 py-3 shadow-md"
          >
            <Text className="text-sm font-semibold text-white">{t('map.directions')}</Text>
          </Pressable>
        </View>
      ) : null}

    </View>
  );
};

const styles = StyleSheet.create({
  mapPlaceholder: { flex: 1, width: '100%', height: '100%', minHeight: 240 },
});
