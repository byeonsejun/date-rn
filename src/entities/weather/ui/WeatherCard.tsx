import { format } from "date-fns";
import { Image, Text, View } from "react-native";
import { getInteger } from "@shared/lib/number";
import { getCurrentTime } from "@shared/lib/date";
import type { WeatherCurrent } from "@shared/types/weather";

interface WeatherCardProps {
  locationName: string;
  weather: WeatherCurrent;
}

/**
 * 웹 `components/Weather.jsx` 상단 영역을 그대로 이식.
 * - 왼쪽: 지역명 / 날짜 / 날씨 아이콘+설명
 * - 오른쪽: 기온(대형)
 */
export const WeatherCard = ({ locationName, weather }: WeatherCardProps) => {
  const iconCode = weather.weather[0]?.icon;
  const description = weather.weather[0]?.description ?? "-";
  const iconUri = iconCode
    ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    : undefined;

  const monthName = format(new Date(), "MMMM");
  const day = getCurrentTime("day");
  const year = getCurrentTime("year");

  return (
    <View className="flex-row items-start justify-between">
      {/* 왼쪽: 지역명 / 날짜 / 아이콘+날씨 */}
      <View>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
          {locationName}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500', marginBottom: 10 }}>
          {monthName} {day}, {year}
        </Text>
        <View className="items-center">
          {iconUri ? (
            <Image
              source={{ uri: iconUri }}
              style={{ width: 56, height: 56, transform: [{ scale: 1.5 }] }}
            />
          ) : (
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          )}
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 4 }}>
            {description}
          </Text>
        </View>
      </View>

      {/* 오른쪽: 기온 */}
      <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'flex-start' }}>
        <Text style={{ color: '#fff', fontSize: 84, fontWeight: '200', lineHeight: 84, letterSpacing: -5 }}>
          {getInteger(weather.main.temp)}
        </Text>
        <Text style={{ color: '#fff', fontSize: 48, fontWeight: '200', lineHeight: 60 }}>°</Text>
      </View>
    </View>
  );
};
