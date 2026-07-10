import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapMarker as NativeMapMarker } from 'react-native-maps';

import type { MapMarkerData } from '@entities/map/model/types';
import { MAP_TYPE_COLOR } from '@features/map/ui/MapTypeSelector';

const getBackgroundColor = (marker: MapMarkerData): string => {
  if (marker.source === 'currentLocation') return '#d81919';
  if (marker.source === 'restaurant') return '#0ea5e9';

  switch (marker.category) {
    case 'park':
      return MAP_TYPE_COLOR['공원'];
    case 'culturalSpace':
      return MAP_TYPE_COLOR['문화공간'];
    case 'dodreamgil':
      return MAP_TYPE_COLOR['두드림길'];
    default:
      return '#737373';
  }
};

/**
 * 커스텀 마커 UI.
 *
 * 원본 출처:
 * - 웹: `components/GoogleMapContainer.jsx`의 `MarkerF` 아이콘 스타일링
 *
 * 담당 역할 (FSD):
 * - `features/map/ui`: 순수 UI(props-only). store 접근/필터링/좌표계 변환 없음.
 * - marker 클릭 이벤트는 부모가 주입한 `onPress`로 위임한다.
 */
export const MapMarker = (props: {
  marker: MapMarkerData;
  isSelected: boolean;
  isOver: boolean;
  onPress: (markerId: string) => void;
}) => {
  const { marker, isSelected, isOver, onPress } = props;
  const { t } = useTranslation();
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const bgColor = getBackgroundColor(marker);
  // 선택 지름·border·아래 `scale(isOver)`는 한 세트로 본다. `react-native-maps`는 마커 자식의
  // 레이아웃 크기(상위가 인식하는 박스)로 스냅/캡처하는데, scale로 그려지는 영역이 박스 밖으로
  // 나가면 잘린다. size만 단독으로 바꾸지 말고 scale·border와 함께 맞출 것.
  const size = isSelected ? 29.4 : 28;
  const borderColor = isSelected ? '#f986bd' : '#ffffff';
  const borderWidth = isSelected ? 2 : 1;

  useEffect(() => {
    // 커스텀 마커의 네이티브 추적 렌더링을 짧게만 활성화해 깜빡임을 줄인다.
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 200);
    return () => clearTimeout(timer);
  }, [isSelected, isOver, marker.id]);

  return (
    <NativeMapMarker
      identifier={marker.id}
      coordinate={{ latitude: marker.lat, longitude: marker.lon }}
      onPress={() => onPress(marker.id)}
      tracksViewChanges={tracksViewChanges}
      zIndex={isSelected ? 999 : isOver ? 100 : 1}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          borderWidth,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          // ↑ size와 함께 볼 것(호버 시 약 1.05배로 레이아웃 밖으로 그려질 수 있음).
          transform: [{ scale: isOver ? 1.05 : 1 }],
        }}
      >
        <Text className="text-[10px] font-bold text-white" numberOfLines={1} adjustsFontSizeToFit>
          {marker.source === 'currentLocation' ? t('map.currentMarkerLabel') : marker.source === 'restaurant' ? t('map.restaurantLabel') : marker.kind}
        </Text>
      </View>
    </NativeMapMarker>
  );
};
