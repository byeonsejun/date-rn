import type { EnrichedForecastItem } from '@entities/weather/model/types';
import type { WeatherCurrent } from '@shared/types/weather';
import { getInteger } from '@shared/lib/number';
import { Image, Text, View } from 'react-native';

interface ForecastListProps {
  items: EnrichedForecastItem[];
  dayValue?: number;
  currentWeather?: WeatherCurrent;
}

/**
 * 기존 웹 `components/Weather.jsx`의 시간대별 예보 목록 영역을 대체하는
 * 읽기 전용 엔티티 UI 리스트.
 */
export const ForecastList = ({ items, dayValue = 0, currentWeather }: ForecastListProps) => {
  const filteredItems = items.filter((item) => item.dayValue === dayValue);
  const nowIconCode = currentWeather?.weather?.[0]?.icon;
  const nowIconUri = nowIconCode
    ? `https://openweathermap.org/img/wn/${nowIconCode}.png`
    : undefined;
  const nowTemp = currentWeather?.main?.temp;
  const nowTempText =
    typeof nowTemp === 'number' && Number.isFinite(nowTemp)
      ? `${getInteger(nowTemp)}°`
      : '-°';

  return (
    <View className="flex-row flex-wrap gap-3">
      {dayValue === 0 ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>NOW</Text>
          {nowIconUri ? (
            <Image source={{ uri: nowIconUri }} style={{ width: 28, height: 28, transform: [{ scale: 1.5 }] }} />
          ) : (
            <View style={{ width: 28, height: 28 }} />
          )}
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '300', letterSpacing: -0.5, marginTop: 2 }}>
            {nowTempText}
          </Text>
        </View>
      ) : null}

      {filteredItems.map((item) => {
        const iconCode = item.weather[0]?.icon;
        const iconUri = iconCode ? `https://openweathermap.org/img/wn/${iconCode}.png` : undefined;
        const temp = item.main?.temp;
        const tempText = typeof temp === 'number' && Number.isFinite(temp) ? `${getInteger(temp)}°` : '-°';

        return (
          <View key={`${item.dt}-${item.time}`} style={{ alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500' }}>{item.time}</Text>
            {iconUri ? (
              <Image source={{ uri: iconUri }} style={{ width: 28, height: 28, transform: [{ scale: 1.5 }] }} />
            ) : (
              <View style={{ width: 28, height: 28 }} />
            )}
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '300', letterSpacing: -0.5, marginTop: 2 }}>{tempText}</Text>
          </View>
        );
      })}
    </View>
  );
};
