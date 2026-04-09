/**
 * Expo 동적 설정: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`를 Android Google Maps에 주입한다.
 * `app.json`의 정적 값을 베이스로 두고, 네이티브 지도 타일 표시에 필요한 키만 병합한다.
 *
 * Android에서 react-native-maps는 Google Maps를 쓰므로 키가 없으면 회색/빈 지도가 될 수 있다.
 * 키 설정 후 `npx expo prebuild` 또는 개발 클라이언트를 다시 빌드해야 반영되는 경우가 있다.
 */
const appJson = require("./app.json");

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        ...(appJson.expo.android && appJson.expo.android.config),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
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
