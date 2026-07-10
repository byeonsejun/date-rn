import { ForecastList } from '@entities/weather/ui/ForecastList';
import { WeatherCard } from '@entities/weather/ui/WeatherCard';
import { useWeather } from '@features/weather/useWeather';
import { Loading } from '@shared/ui/Loading';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

const DAY_TABS = [
  { titleKey: 'weather.today', value: 0 },
  { titleKey: 'weather.tomorrow', value: 1 },
  { titleKey: 'weather.dayAfterTomorrow', value: 2 },
  { titleKey: 'weather.threeDaysLater', value: 3 },
] as const;

/**
 * 기존 웹 `components/Weather.jsx`의 전체 패널 역할을 대체한다.
 * Entity UI(WeatherCard, ForecastList)를 조합하고,
 * Feature 훅(useWeather)에서 상태를 읽어 렌더링한다.
 */
export const WeatherPanel = () => {
  const { t } = useTranslation();
  const { showWeather, selectWeather, setSelectWeather, location, loading } = useWeather();
  const todayWeather = showWeather.today;
  const forecastWeather = showWeather.forecast;

  // 웹 `Weather.jsx`와 동일: wbg.jpg 배경 + 반투명 어두운 오버레이
  const wbg = require('../../../../assets/images/wbg.jpg') as number;

  if (loading) {
    return (
      <ImageBackground
        source={wbg}
        resizeMode="cover"
        style={{ height: 280, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}
      >
        <View className="h-full w-full items-center justify-center bg-neutral-900/40">
          <Loading fullscreen={false} color="#f3eaf2" message={t('weather.loading')} />
        </View>
      </ImageBackground>
    );
  }

  if (!todayWeather) {
    return (
      <ImageBackground
        source={wbg}
        resizeMode="cover"
        style={{ height: 280, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}
      >
        <View className="h-full w-full items-center justify-center bg-neutral-900/40 px-4">
          <Text className="text-center text-sm text-white/90">
            {t('weather.loadError')}
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={wbg} resizeMode="cover" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      {/* 웹의 bg-neutral-900/20 backdrop-blur 역할 */}
      <View className="w-full bg-neutral-900/30 px-3 py-3">
        <WeatherCard locationName={location} weather={todayWeather} />

        <View style={{ marginTop: 12, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(0,0,0,0.2)',
              paddingBottom: 1,
            }}
          >
            {DAY_TABS.map((tab) => (
              <Pressable key={tab.value} onPress={() => setSelectWeather(tab.value)}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: selectWeather === tab.value ? '700' : '400',
                    opacity: selectWeather === tab.value ? 1 : 0.5,
                    borderBottomWidth: selectWeather === tab.value ? 2 : 0,
                    borderBottomColor: '#fff',
                    paddingBottom: 4,
                  }}
                >
                  {t(tab.titleKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {forecastWeather ? (
          <ForecastList items={forecastWeather} dayValue={selectWeather} currentWeather={todayWeather} />
        ) : null}
      </View>
    </ImageBackground>
  );
};
