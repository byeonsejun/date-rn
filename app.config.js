/**
 * Expo 동적 설정: `EXPO_PUBLIC_MAPS_TILE_KEY`를 Android Google Maps에 주입한다.
 * `app.json`의 정적 값을 베이스로 두고, 네이티브 지도 타일 표시에 필요한 키만 병합한다.
 *
 * 이 키는 지도 타일 전용 클라이언트 키로, 데이터 호출용 키(웹 서버에만 존재)와 분리한다.
 * 번들/APK에 남는 게 정상이며 Google Cloud Console에서 Android 앱 제한(패키지명 + SHA-1)으로 보호한다.
 *
 * Android에서 react-native-maps는 Google Maps를 쓰므로 키가 없으면 회색/빈 지도가 될 수 있다.
 * 키 설정 후 `npx expo prebuild` 또는 개발 클라이언트를 다시 빌드해야 반영되는 경우가 있다.
 */
const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [...appJson.expo.plugins, "expo-localization"],
    android: {
      ...appJson.expo.android,
      config: {
        ...(appJson.expo.android && appJson.expo.android.config),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAPS_TILE_KEY ?? "",
        },
      },
      package: "com.byunsejun.projectrn"
    },
    extra: {
      eas: {
        projectId: "84a1e15c-8ea5-456f-b2a0-e7ed5841c7f8"
      }
    }
  },
};
