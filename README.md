# Seoul Date Platform — React Native (Expo) App

서울 자치구 기반 데이트 장소·날씨·맛집 추천 서비스의 **네이티브 앱 구현체**입니다.

> 이 저장소는 웹(Next.js) 버전의 **네이티브 앱 버전**입니다.
> 서비스 전체 설명과 라이브 데모는 메인(웹) 저장소를 참고하세요.
>
> - 웹(메인) 저장소: https://github.com/byeonsejun/date
> - 라이브 데모(웹): https://date-eight-navy.vercel.app/
>
> 이 README는 RN 고유의 스택·구조·실행/빌드 방법에 집중한 간결 버전입니다.

## 기술 스택

`package.json` 기준 실제 버전입니다.

| 항목 | 버전 / 라이브러리 |
| --- | --- |
| 프레임워크 | Expo SDK `~54.0.33` |
| 라우팅 | expo-router `~6.0.23` (파일 기반 라우팅) |
| 런타임 | React Native `0.81.5`, React `19.1.0` |
| 언어 | TypeScript `~5.9.2` |
| 상태관리 | Zustand `^4.5.5` |
| 영속화 | `@react-native-async-storage/async-storage` `2.2.0` (Zustand persist) |
| 지도 | react-native-maps `1.20.1` |
| 위치 | expo-location `~19.0.8` |
| 스타일 | NativeWind `^4.2.1` (Tailwind) |
| 애니메이션 | react-native-reanimated `~4.1.1` |

## 아키텍처

Feature-Sliced Design(FSD)을 따릅니다. 소스는 `src/` 아래 5개 레이어로 구성됩니다.

```
src/
├── core/       # 앱 인프라 (프로바이더, 환경변수 설정, 개발용 유틸)
├── shared/     # 공통 인프라·UI (api 클라이언트, 타입, lib, ui 프리미티브)
├── entities/   # 도메인 모델 (model/store · api · ui 세그먼트)
├── features/   # 사용자 시나리오 단위 로직 (훅 + ui)
└── widgets/    # feature 조합 화면 (home, layout, statistics)
```

- 라우트 진입점은 저장소 루트의 `app/`(expo-router)이며, 화면 조립/로직은 `widgets` 이하 레이어에 둡니다.
- 도메인 상태(Zustand store)는 각 entity의 `model/store.ts`에 위치합니다.

## 외부 API · 키 처리

외부 API 키는 **앱 번들에 두지 않습니다.** 모든 데이터 호출(날씨/위치/맛집)은 웹 BFF 프록시(`/api/*`)로 경유하며, 외부 API 키는 웹 서버에만 존재합니다.

- 앱 → `EXPO_PUBLIC_API_BASE_URL`(웹 배포 도메인)의 `/api/weather`, `/api/location`, `/api/restaurants` 프록시 호출.
- 예외: **Android 지도 타일 키**(`EXPO_PUBLIC_MAPS_TILE_KEY`)는 클라이언트 키 특성상 번들에 포함됩니다. 이 키는 Google Cloud Console에서 **Android 앱 제한(패키지명 + SHA-1)**으로 보호합니다.

## 실행 방법

사전 준비: Node.js, npm. 의존성 설치 후 환경변수를 채웁니다.

```bash
npm install

# 환경변수 템플릿 복사 후 값 입력 (아래 "환경변수" 섹션 참고)
cp .env.example .env
```

`package.json` scripts:

```bash
npm run start     # expo start (개발 서버)
npm run android   # expo start --android
npm run ios       # expo start --ios
npm run web       # expo start --web
npm run lint      # expo lint
```

> `react-native-maps`는 네이티브 모듈입니다. 네이티브 지도 기능을 포함해 실행하려면
> 개발용 빌드(`eas.json`의 `development` 프로파일, `developmentClient: true`)나 prebuild된 개발 클라이언트를 사용하세요.

## 빌드 (APK)

[EAS Build](https://docs.expo.dev/build/introduction/)를 사용합니다. `eas.json`에 `development` / `preview` / `production` 프로파일이 정의되어 있고, `preview` 프로파일이 Android **APK**를 산출합니다(`buildType: "apk"`).

```bash
# EAS CLI 필요 (eas.json cli.version: ">= 18.5.0")
eas build --profile preview --platform android
```

## 환경변수

`.env.example`을 `.env`로 복사한 뒤 값을 채웁니다. 현재 코드가 참조하는 `EXPO_PUBLIC_*` 변수는 다음 둘입니다.

| 변수 | 용도 |
| --- | --- |
| `EXPO_PUBLIC_API_BASE_URL` | 웹 BFF 프록시 도메인. 모든 `/api/*` 데이터 호출이 향하는 웹 배포 주소(프록시 전용 구조라 필수). |
| `EXPO_PUBLIC_MAPS_TILE_KEY` | Android 지도 타일용 클라이언트 키(`app.config.js`에서 사용). Cloud Console 앱 제한으로 보호. |

> 외부 API 키(OpenWeather, Google Places/Geocode 등)는 이 앱에 두지 않습니다. 웹 서버 환경변수에만 존재합니다.
