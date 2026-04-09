# Research Notes

## Phase 0: 프로젝트 초기 세팅에서 배운 것들

### 1. Path Alias — babel 플러그인이 필요 없는 이유

Expo SDK 49+ 부터 Metro 번들러가 `tsconfig.json`의 `paths` 필드를 **네이티브로 읽는다**.
따라서 `babel-plugin-module-resolver`를 별도 설치할 필요가 없다.

**설정 방법:** `tsconfig.json`에 `baseUrl`과 `paths`만 선언하면 끝.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["./src/shared/*"],
      "@entities/*": ["./src/entities/*"],
      // ...
    },
  },
}
```

- `baseUrl: "."` — paths의 기준점을 프로젝트 루트로 잡는다.
- TypeScript(IDE 자동완성 + 타입 체크)와 Metro(런타임 번들링) 양쪽 모두 이 설정 하나로 해결된다.
- 이전 Expo SDK(< 49)에서는 babel-plugin-module-resolver가 필수였지만, 현재는 오히려 충돌을 일으킬 수 있으므로 사용하지 않는다.

---

### 2. Zustand — React Native에서의 특이점

`zustand`는 웹과 RN에서 동일하게 동작한다. 추가 설정이 필요 없다.

단, **persist 미들웨어**를 사용할 때 차이가 발생한다:

- 웹: `localStorage`를 기본 storage로 사용
- RN: `@react-native-async-storage/async-storage`를 직접 주입해야 함

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      /* state */
    }),
    {
      name: "store-key",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

핵심: `createJSONStorage(() => AsyncStorage)`로 감싸야 한다. AsyncStorage는 비동기이므로 zustand의 persist가 이를 Promise 기반으로 처리해 준다.

---

### 3. Expo 환경변수 — `EXPO_PUBLIC_` 접두사 규칙

Expo에서 클라이언트 코드가 접근할 수 있는 환경변수는 반드시 `EXPO_PUBLIC_` 접두사가 붙어야 한다.

| 변수명                        | 접근 가능 여부                                                      |
| ----------------------------- | ------------------------------------------------------------------- |
| `EXPO_PUBLIC_WEATHER_API_KEY` | O (클라이언트에서 `process.env.EXPO_PUBLIC_WEATHER_API_KEY`로 접근) |
| `SECRET_KEY`                  | X (빌드 시에만 사용, 런타임 접근 불가)                              |

Next.js의 `NEXT_PUBLIC_` 접두사와 같은 개념이다.

주의: `.env` 파일은 `.gitignore`에 반드시 추가한다. Expo는 `.env`, `.env.local`, `.env.development` 등을 자동 로드한다.

---

### 4. NativeWind v4 + Expo SDK 54 호환성 핵심

| 항목                    | 값                                                    |
| ----------------------- | ----------------------------------------------------- |
| nativewind              | `4.2.1` (4.2.0+ 필수 — Reanimated v4 패치 포함)       |
| tailwindcss             | `3.4.17` (v4.x는 NativeWind v5용이므로 사용 불가)     |
| react-native-reanimated | `~4.1.1` (Expo SDK 54 기본, v3으로 다운그레이드 불가) |

babel.config.js에서 `react-native-reanimated/plugin`만 사용하고, `react-native-worklets/plugin`은 절대 별도 추가하지 않는다 (Reanimated v4에 이미 내장).

---

## Phase 1 (shared/types + shared/lib) 작업 핵심 정리

### 1. 유틸 이식 전략: "원본 함수명 유지 + 책임 분리"

웹 원본 `util.js`는 날짜/좌표/랜덤/스토리지/숫자 유틸이 한 파일에 섞여 있었고, RN 마이그레이션에서는 이를 **목적별 파일로 분리**했다.

- `src/shared/lib/date.ts`
  - `getCurrentTime`, `get3Days`, `get24H`, `fromUnixTimeToG`
  - 포맷/계산은 `date-fns`에 위임
- `src/shared/lib/geo.ts`
  - `transLocation` (GRS80 TM -> WGS84)
  - `proj4` 좌표 변환 결과를 앱에서 바로 쓰기 좋게 `[lat, lng]`로 반환
- `src/shared/lib/random.ts`
  - `getRandomIndexItem`, `makeRandomNumberIn`, `getRandomNumber`
  - 빈 배열 방어 처리(`undefined`) 추가
- `src/shared/lib/storage.ts`
  - `findStorageItem`, `createStorageItem`, `removeStorageItem`
  - `localStorage` -> `AsyncStorage`로 비동기 전환
- `src/shared/lib/number.ts`
  - `getInteger` 분리

핵심은 이후 feature 코드에서 이름을 크게 바꾸지 않고도(학습 비용 최소화) import 경로만 `@shared/lib/*`로 교체할 수 있게 만든 점이다.

### 2. React Native 스토리지 전환 포인트

웹의 `window.localStorage`는 동기 API지만, RN의 `AsyncStorage`는 비동기 API다.
그래서 동일한 역할의 래퍼라도 반환 타입이 달라진다.

- `findStorageItem`: `Promise<string | null>`
- `createStorageItem`: `Promise<void>`
- `removeStorageItem`: `Promise<void>`

이 변화는 이후 feature 구현 시 `await` 사용을 강제하므로, 기존 웹 로직 이식 시 가장 먼저 고려해야 할 차이점이다.

### 3. 타입 정의 원칙 (shared/types)

`shared/types`는 특정 화면이 아니라 **도메인 공통 계약(contract)** 으로 정의했다.
현재 생성된 파일:

- `weather.ts`
  - `WeatherCurrent`, `WeatherForecast`, `WeatherForecastItem`, `WeatherCondition`, `WeatherMain`
- `location.ts`
  - `GeoCoord`, `District`, `GeoInfo`
- `poi.ts`
  - `PoiCategory`, `PoiBase`, `ParkPoi`, `CulturalSpacePoi`, `DodreamgilPoi`, `MapPoint`
- `restaurant.ts`
  - `Restaurant`, `RestaurantPhotoRef`
- `chart.ts`
  - `ChartRecord`, `ChartGenderGroup`, `ChartData`

이 타입들은 다음 단계(`entities/*`)에서 API 응답 정규화, store 상태 타입, UI props 타입의 단일 기준점으로 재사용된다.

### 4. 의존성 관점에서의 의미

이번 단계에서 `date-fns`, `proj4`를 RN 프로젝트에 추가함으로써,
웹 원본의 날짜/좌표 로직을 **로직 변경 없이** 그대로 재사용할 수 있는 기반을 만들었다.

즉, Phase 1의 목적은 "기능 구현"이 아니라, **기능을 안전하게 이식할 수 있는 공통 기반(타입 + 유틸 계약) 확립**이다.

---

## Phase 1-2/1-4 (shared/api + shared/ui) 핵심 결정

### 1. API 통신 구조: axios 도입 대신 fetch 래퍼를 표준으로 선택

원본 웹은 Next Route Handler(`/api/*`)를 통해 외부 API(OpenWeather/Google)를 우회 호출했다.
RN 앱에서는 서버 런타임이 없으므로, 같은 패턴을 유지하려면 별도 백엔드가 필요하다.

그래서 `shared/api/client.ts`는 아래 2가지 실행 모드를 모두 지원하도록 설계했다.

- **상대 경로 모드**: `EXPO_PUBLIC_API_BASE_URL`이 없으면 `/api/*` 같은 경로 사용 (향후 BFF 연결 대비)
- **절대 경로 모드**: 외부 URL 또는 API_BASE_URL을 직접 붙여 호출 (초기 앱 단독 실행용)

추가로 다음을 공통 표준으로 고정했다.

- 타임아웃(`AbortController`)을 기본 내장해 무한 대기 방지
- 상태코드/응답 payload를 담는 `ApiError`로 도메인 레이어에서 에러 분기 가능
- JSON 응답 우선 파싱 + text fallback으로 비정형 응답도 안전 처리

결론적으로 이 구조는 **지금은 앱 단독 호출**, **나중에는 프록시 백엔드 도입**을 둘 다 허용한다.

### 2. 엔드포인트 상수 분리: 경로 문자열 하드코딩 제거

`shared/api/endpoints.ts`에서 `weather/location/restaurants` 경로와
OpenWeather/Google 외부 베이스 URL을 분리했다.

의도:

- feature/entities 레이어에서 URL 문자열 중복 방지
- 경로 변경 시 단일 파일 수정
- 환경 전환(개발/운영/BFF 도입) 비용 최소화

### 3. 공통 UI 전환 원칙: \"DOM 의존 제거 + RN 기본 컴포넌트 우선\"

웹 공통 UI는 `react-spinners`, Portal, `IntersectionObserver`, `<select>` 등 DOM 전제가 강했다.
RN에서는 아래처럼 대응했다.

- `Loading`: `react-spinners` -> `ActivityIndicator`
- `Modal`: Portal 패턴 -> RN `Modal` + 백드롭 dismiss
- `InfiniteScroll`: `IntersectionObserver` -> `FlatList` `onEndReached`
- `Select`: `<select>` -> Pressable 세그먼트 셀렉터
- `StarRating`: `react-stars` 의존 없이 유니코드 별 + Pressable 입력
- `Toast`: 절대 위치 오버레이 컴포넌트로 통일

이 선택의 장점:

- 추가 라이브러리 의존을 최소화해 초기 마이그레이션 리스크 감소
- Expo 기본 런타임에서 바로 동작
- 향후 디자인 시스템 도입 시 프리미티브 교체가 쉬움

### 4. 주석 정책: \"무엇\"보다 \"왜\"에 집중

요청사항에 맞춰 신규 함수/컴포넌트 상단에 JSDoc을 추가했다.
핵심은 API 시그니처 설명보다, 이 컴포넌트가 웹 원본의 어떤 역할을 RN에서 어떻게 대체하는지 명시하는 것이다.

이 주석은 다음 단계(entities/features 구현)에서 의사결정 근거를 빠르게 복기하는 문서 역할을 한다.

---

## Phase 2 (entities/weather + entities/location) 핵심 결정

### 1. 웹의 프록시 의존 API를 앱 실행 환경으로 확장

기존 웹은 `fetch('/api/weather')`, `fetch('/api/location')`처럼 Next 서버 프록시에 강하게 묶여 있었다.
RN 앱에서는 Next 런타임이 없을 수 있으므로, 엔티티 API 레이어에서 호출 전략을 두 갈래로 분기했다.

- `EXPO_PUBLIC_API_BASE_URL` **설정됨**: 기존과 동일하게 `/api/*` 프록시 호출
- `EXPO_PUBLIC_API_BASE_URL` **미설정**: OpenWeather/Google Geocode를 직접 호출

이 방식으로 개발/배포 단계에서 백엔드 구성 유무와 무관하게 동일한 엔티티 API 시그니처를 유지할 수 있다.
즉, Feature 레이어는 \"어디로 호출하는지\"를 몰라도 된다.

### 2. shared/api client와 결합해 에러/타임아웃 정책을 엔티티에 전파

`entities/*/api.ts`는 네트워크 디테일을 직접 처리하지 않고 `shared/api/client.ts`의 `get/post`를 사용한다.
결과적으로 아래가 자동으로 일관화됐다.

- 타임아웃 처리 (`AbortController`)
- 상태 코드 기반 에러 표준화 (`ApiError`)
- query/body 직렬화 규칙 통일

웹 원본의 서비스 코드에는 API별로 `.then().catch()` 체인이 반복되었는데,
앱에서는 공통 정책을 shared로 끌어올려 엔티티 API는 도메인 정규화(예: forecast 가공)에만 집중하게 개선됐다.

### 3. 엔티티 모델의 역할: \"원본 응답\" + \"도메인 가공 결과\"를 타입으로 고정

`entities/weather/model/types.ts`에서 `EnrichedForecastItem`을 별도로 두어,
웹의 `day_value`, `time`, `date` 후처리 규칙을 타입 계약으로 승격했다.

의미:

- Feature/UI가 암묵적 필드를 가정하지 않아도 됨
- 변환 책임이 API 계층에 모여 테스트/검증 포인트가 명확해짐

`entities/location/model/types.ts`도 Geocoding 최소 응답 모델과 `UserGeoContext`를 분리해,
외부 API 스키마와 앱 내부 소비 모델 사이 경계를 명확히 했다.

### 4. Entity UI는 \"읽기 전용\"만 담당하도록 강제

`WeatherCard`, `ForecastList`, `DistrictBadge`는 모두 props를 받아 렌더링만 수행한다.
상태 변경, 이벤트 오케스트레이션, 저장소 접근은 포함하지 않았다.

이 결정으로 이후 Feature 레이어의 책임이 명확해진다.

- Feature: 데이터 요청/선택/탭 전환/지역 변경 같은 동작
- Entity UI: 전달된 데이터 표시

결과적으로 FSD 관점에서 Phase 3 이후 확장 시, UI 재사용성과 테스트 격리가 높아진다.

---

## Phase 1 — `src/core` (단일 LocationStore 분리 + persist + env)

### 1. 거대 단일 스토어를 5개 도메인 스토어로 나눈 이유

변경 이유를 추적하기 어렵고 리렌더 범위도 불명확했다.

분리 기준은 **변경 축(domain)** 이다.

- `useWeatherStore`: 화면에 보여줄/내 위치 기준 날씨 스냅샷만
- `useLocationStore`: 구 선택, POI 번들, 역지오 결과, 서울 한정 토스트 표시 여부
- `useMapStore`: 마커/필터/추천 마커 클릭 등 지도 상호작용
- `useRestaurantStore`: 맛집 패널 데이터·펼침 상태

이점:

- 도메인별로 selector 단위 구독이 쉬워져 **불필요한 리렌더**를 줄일 수 있다.
- feature 구현 시 import 대상이 명확해져 **의존 방향**이 정리된다.

### 2. 웹 `localStorage` → RN `AsyncStorage` + Hydration 처리

웹은 `localStorage`가 동기라 첫 렌더 직전에 값이 이미 메모리에 있다고 가정하기 쉽다.
RN에서는 스토리지 읽기가 **비동기**이므로, persist를 쓰면 다음 문제가 생긴다.

- 첫 프레임에 기본값이 잠깐 보였다가 저장값으로 바뀌는 **플래시**
- 또는 저장값이 늦게 합쳐져 **일시적 UI 불일치**

이번 구현에서는:

1. `persist`에 `createJSONStorage(() => AsyncStorage)` 적용
2. `skipHydration: true`로 **자동 병합 전**에는 스토어가 기본값만 갖도록 고정
   `Promise.all`로 끝낸 뒤에만 자식 트리를 렌더

즉, **Hydration 게이트**를 루트에 두어 웹과 유사한 \"저장된 상태가 곧 첫 화면\" 경험에 가깝게 맞췄다.

POI 대용량 배열·토스트 플래그 등은 제외해 AsyncStorage 쓰기 비용과 직렬화 위험을 줄였다.

### 3. `core/config/env.ts`의 역할

`EXPO_PUBLIC_*` 키를 문자열 리터럴 유니온으로 묶어,
오타나 미설정 접근을 컴파일 타임에 잡기 쉽게 했다.
런타임 값은 `process.env`를 그대로 읽되, 앱 코드에서는 `env` 객체로 의미를 통일한다.

---

## Phase 3: features/location + features/weather — 버그 수정 + 관심사 분리 실전

### 0. 버그 수정: `import.meta` SyntaxError 해결

**증상:** 콘솔에서 `Uncaught SyntaxError: Cannot use 'import.meta' outside a module` 발생.

**원인:** `date-fns@4.x`가 ESM 전용 패키지로 전환되면서 내부에서 `import.meta.url`을 사용한다.
Expo의 Metro 번들러는 CJS 기반이라 `import.meta` 구문을 파싱하지 못한다.

**해결:** `date-fns`를 v4 → v3으로 다운그레이드했다. v3는 ESM/CJS 듀얼 패키지를 유지하므로
Metro에서 정상 번들링된다. 프로젝트 소스 코드 자체에는 `import.meta`가 없었기 때문에
코드 수정은 필요 없었고, 패키지 버전 변경만으로 해결됐다.

**교훈:** Expo/Metro 환경에서는 ESM-only 패키지 도입 시 번들러 호환성을 반드시 확인해야 한다.
`package.json`에 `"type": "module"` 설정이 없어도 Metro가 자동으로 CJS를 선호하기 때문에,
ESM-only 종속성이 섞이면 런타임에서야 에러가 표면화된다.

### 1. Entity 레이어와 Feature 레이어의 실제 코드 수준 역할 분리

Phase 2에서 만든 `entities/`와 Phase 3의 `features/`가 어떻게 다른지를 코드 레벨로 비교하면:

| 관심사    | Entity (Phase 2)                                                                          | Feature (Phase 3)                                                                     |
| --------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 상태 접근 | 없음 (props만 받음)                                                                       | Zustand 스토어를 구독하고 갱신 (`useLocationStore`, `useWeatherStore`)                |
| API 호출  | `fetchRealTimeWeather`, `fetchReverseGeocode` — 순수 async 함수, 호출자에게 데이터 반환만 | `useWeather.ts` — Entity API를 호출한 뒤 스토어를 갱신하는 **오케스트레이션**         |
| 퍼미션/OS | 없음                                                                                      | `useGeolocation.ts` — `expo-location`으로 GPS 권한 요청                               |
| UI        | `WeatherCard`, `ForecastList` — props → render, 이벤트 핸들러 없음                        | `WeatherPanel`, `DistrictPicker` — 훅 결과를 Entity UI에 주입하고 탭/선택 이벤트 처리 |
| 스토리지  | 없음                                                                                      | `seoulPolicy.ts` — AsyncStorage 플래그(outside, locationAgree) 읽기/쓰기              |

핵심 원칙: **Entity는 \"데이터를 가져오고 보여주는 것\"**, **Feature는 \"사용자 행동에 반응해 상태를 바꾸는 것\"**.
이 경계를 유지하면 Entity UI를 다른 Feature에서 재조합할 때 Side Effect 걱정 없이 가져다 쓸 수 있다.

### 2. `useGeolocation` — GPS 퍼미션 흐름의 플랫폼 전환

웹 원본은 `navigator.geolocation.getCurrentPosition`을 직접 호출하고,
콜백 체인으로 역지오코딩 → 서울 판별 → 날씨 조회를 이어갔다.

RN 버전에서는:

- `expo-location`의 `requestForegroundPermissionsAsync` + `getCurrentPositionAsync`로 대체
- 콜백 → `async/await` 선형 흐름으로 정리
- 실패 시 기본 구("중구")로 폴백하는 방어 로직을 `try/catch`로 통합

### 3. `seoulPolicy.ts` — 스토리지 부작용을 Feature 안에 격리

웹에서는 서울 외 지역 감지 시 `localStorage` 조작이 `getUserGeoInfo` 콜백 안에 인라인으로 분산되어 있었다.
앱에서는 `features/location/lib/seoulPolicy.ts`에 `markOutsideSeoul`, `markLocationAgreed`,
`isMarkedOutside`, `hasLocationConsent`, `hasAskedConsent`, `markConsentAsked`로 캡슐화해,
스토리지 키 문자열을 한 파일에서만 관리하도록 했다.

이점: 향후 스토리지 키 이름을 바꾸거나, 서울 외 정책이 변경되더라도 수정 지점이 단일 파일로 좁혀진다.

### 4. `WeatherPanel` — Entity UI를 Feature가 \"조립\"하는 패턴

`WeatherPanel.tsx`는 자체적으로 `<WeatherCard>`와 `<ForecastList>`를 렌더링하지만,
이들 Entity 컴포넌트에 전달하는 데이터는 `useWeather` 훅에서 가져온다.
`useWeather`는 내부에서 스토어를 읽고, API를 호출하고, 스토어를 갱신하는 모든 부작용을 담당한다.

이 "Feature 훅 + Entity UI 조합" 패턴은 FSD의 핵심 설계 의도를 실현한 것이다.
`WeatherCard`를 나중에 다른 위젯(예: 통계 화면)에서도 사용할 때,
해당 위젯이 자체 데이터 소스를 주입하기만 하면 된다.

---

## 추가 분석: `Cannot use 'import.meta' outside a module` (web 번들)

### 1) 왜 `zustand@4.5.5`에서도 같은 에러가 날 수 있었는가

겉으로 보면 `zustand`를 v5 -> v4로 내리면 해결될 것 같지만,
실제 원인은 "버전"보다 **웹 번들 시 어떤 엔트리를 Metro가 선택하느냐**였다.

- `zustand@4.5.5`는 CJS(`index.js`)와 ESM(`esm/index.mjs`)를 함께 제공한다.
- ESM 빌드(`esm/*.mjs`)에는 개발 경고 분기에서 `import.meta.env`가 들어 있다.
- 웹 타겟(`platform=web`) 번들링 중 Metro가 ESM 경로를 잡으면, 번들 결과물에 `import.meta`가 남는다.
- 현재 번들은 ESM 문맥이 아니기 때문에 브라우저에서 `Uncaught SyntaxError`가 발생한다.

즉, **"zustand 버전 자체 문제"라기보다 "resolver가 ESM을 선택한 문제"**가 본질이다.

### 2) 진단 과정에서 확인한 사실

- `src/` 전체 검색: `import.meta` 사용 없음 (앱 소스 문제 아님)
- `node_modules/zustand` 검색:
  - `*.js`(CJS)에는 `import.meta` 없음
  - `esm/*.mjs`에는 `import.meta` 존재
- 에러 URL이 `entry.bundle?platform=web...` 형태였고, 이는 네이티브(iOS/Android)가 아니라 **웹 번들 경로 문제**라는 강한 신호였다.

### 3) 적용한 수정과 이유

`metro.config.js`에 `resolveRequest`를 추가해,
**web 플랫폼에서 `zustand` import를 CJS 파일로 강제 매핑**했다.

- `zustand` -> `node_modules/zustand/index.js`
- `zustand/middleware` -> `node_modules/zustand/middleware.js`
- 기타 `zustand/*`도 가능한 경우 대응 CJS `*.js`로 연결

효과:

- 웹 번들에서 ESM(`.mjs`) 대신 CJS(`.js`)를 사용
- `import.meta`가 번들 결과물에 유입되지 않음
- 동일 코드베이스에서 네이티브 플랫폼에는 영향 최소화

### 4) 재발 방지 체크리스트

- 패키지 버전 변경 시 "ESM-only인지"와 "exports 조건(import/default)"를 같이 확인
- 오류가 웹에서만 발생하면 `platform=web` 번들 URL을 먼저 보고 resolver 문제를 의심
- `npx expo start -c`로 캐시를 반드시 비우고 재검증
- 필요하면 특정 패키지에 한해 resolver override를 적용해 전역 부작용을 줄인다

### 추가 분석: IDE에서만 뜨는 `zustand` `create` named export 오류

#### 증상

- 특정 store 파일에서 `'"zustand"' 모듈에 내보낸 멤버 'create'이(가) 없습니다. (ts)` 같은
  IDE/린터 진단이 발생한다.

#### 원인 (추정)

- 현재 설치된 `zustand@4.x`는 런타임/타입 정의 모두에서 `create`를 export 한다.
- 그럼에도 불구하고 Expo의 TS 설정(`moduleResolution: bundler`, `customConditions: ["react-native"]`)과
  IDE 진단 경로(언어 서비스/린터)가 달라 **conditional exports를 잘못 해석**하거나 **진단 캐시가 갱신되지 않는 경우**에
  false positive로 보일 수 있다.

#### 해결 및 재발 방지 가이드

- store 파일에서는 `import { create } from "zustand"` 형태로 **통일**한다.
- `create` initializer 콜백의 파라미터(`set`, `value`)는 암시적 `any`가 생기지 않도록 타입 추론을 신뢰하되,
  IDE가 타입을 잘못 해석해 오류를 계속 띄우면 아래 2개를 먼저 확인한다.
  - `npx tsc --noEmit`이 통과하는지 확인
  - 그래도 IDE가 멈춰있다면 TypeScript 언어서비스(리로드/TS Server 재시작)로 진단 캐시를 갱신
- 최종 검증은 IDE 진단이 아니라 `npx tsc --noEmit` + `npm run lint(expo lint)` 결과를 기준으로 삼는다.

---

## FSD Feature UI 분리 원칙 — 리팩토링 회고 & 앞으로의 가이드

### 1. 발견된 문제: Feature UI에 비즈니스 로직이 혼입

Phase 3에서 만든 `DistrictPicker.tsx`와 `LocationConsentModal.tsx`를 돌아보니,
UI 컴포넌트 안에 아래 3가지가 동시에 들어 있었다.

- **스토어 구독/갱신**: `useLocationStore`에서 직접 `setLocation`, `showSeoulOnlyToast` 호출
- **비동기 정책 판단**: `isMarkedOutside()`, `hasLocationConsent()` — AsyncStorage 읽기
- **조건 분기 + 사이드이펙트**: `Alert.alert`, `markConsentAsked` 등

반면 같은 Phase 3의 `WeatherPanel.tsx`는 `useWeather()` 훅 하나만 호출하고,
반환된 데이터를 Entity UI에 주입하는 구조라 깨끗했다.

**차이의 핵심**: `WeatherPanel`에는 전용 Feature 훅(`useWeather`)이 있었지만,
`DistrictPicker`와 `LocationConsentModal`에는 그런 훅이 없어서 로직이 UI에 남았다.

### 2. 수정 내용: "훅 추출 → UI를 props-only로 전환"

| 수정 전 (로직 혼입 UI)                                                      | 수정 후                                                                                             |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `DistrictPicker.tsx` — 스토어 구독 + `handleSelect` + 정책 가드             | **`useDistrictSelect.ts`** (훅): 스토어 + 정책 → `{ allDistrictInfo, location, handleSelect }` 반환 |
|                                                                             | **`DistrictPicker.tsx`** (순수 UI): `props`로 `districts`, `selected`, `onSelect`만 받음            |
| `LocationConsentModal.tsx` — 스토어 + useEffect + handleAgree/handleDecline | **`useLocationConsent.ts`** (훅): 모달 표시 판단 + 동의/거부 핸들러                                 |
|                                                                             | **`LocationConsentModal.tsx`** (순수 UI): `props`로 `visible`, `onAgree`, `onDecline`만 받음        |

### 3. 이렇게 분리한 이유

**재사용성**: `DistrictPicker`가 props만 받으므로, 다른 화면(예: 통계 필터)에서도
`districts`와 `onSelect`만 다르게 넘기면 바로 재활용할 수 있다.
로직이 묶여 있었다면 `useLocationStore` 의존 때문에 복사/수정이 불가피했다.

**테스트 용이성**: UI는 "이 props를 넣으면 이 렌더 결과" 단위 테스트만 하면 된다.
`handleSelect` 안의 비동기 정책 분기는 훅만 따로 테스트한다.
한 컴포넌트에서 둘 다 테스트하려면 AsyncStorage 모킹 + UI 렌더를 동시에 셋업해야 했다.

**의존 방향 명확화**: FSD에서 UI 파일이 `@core/stores`를 직접 import하면,
`ui/ → core/`라는 레이어 횡단이 발생한다.
훅이 중간에 끼면 `ui/ → features/훅 → core/`로 의존 체인이 한 방향으로 정리된다.

### 4. 앞으로의 가이드: Feature UI 작성 시 체크리스트

새로운 Feature UI 컴포넌트를 만들 때 아래 질문으로 분리 여부를 판단한다.

| 질문                                                       | YES면                    |
| ---------------------------------------------------------- | ------------------------ |
| 컴포넌트 안에서 `@core/stores`를 직접 구독하는가?          | 전용 Feature 훅으로 추출 |
| 컴포넌트 안에서 AsyncStorage/네트워크/OS API를 호출하는가? | 반드시 훅으로 분리       |
| `handleXxx` 함수 안에 조건 분기가 3줄 이상인가?            | 훅으로 옮기는 것을 권장  |
| 동일 UI를 다른 데이터 소스로 재사용할 가능성이 있는가?     | props-only로 설계        |

**올바른 패턴 요약:**

```
features/도메인/
├── use도메인훅.ts          ← 스토어 구독, API 호출, 정책 판단, 상태 갱신
├── lib/비즈니스로직.ts      ← 순수 함수 / 스토리지 유틸
└── ui/
    └── 컴포넌트.tsx        ← props(또는 훅 반환값)만 받아 렌더링
```

**위젯(widgets) 레이어에서 조립하는 법:**

```tsx
const { districts, selected, handleSelect } = useDistrictSelect();
const { visible, handleAgree, handleDecline } = useLocationConsent();

return (
  <>
    <DistrictPicker
      districts={districts}
      selected={selected}
      onSelect={handleSelect}
    />
    <LocationConsentModal
      visible={visible}
      onAgree={handleAgree}
      onDecline={handleDecline}
    />
  </>
);
```

이 패턴을 따르면 Entity UI(읽기 전용)와 Feature UI(사용자 인터랙션) 모두
**"데이터가 어디서 왔는지 모른 채 렌더만 한다"**는 동일한 원칙 위에 놓이게 된다.

---

## Phase 4: `entities/poi` + `features/recommend` — 정적 JSON Entity + 순수 UI 조립

### 1) 정적 JSON을 Entity 모델로 편입

웹 원본의 `park.json`, `culturalSpace.json`, `dodreamgil.json`은 RN에서는 `entities/poi/model/data/`에 번들로 포함했다.
이를 통해 추천 로직이 외부 네트워크/API 의존 없이 동작하도록 만들고,
FSD 관점에서 “데이터 소스/정규화”는 Entity가 담당하도록 경계를 고정했다.

### 2) `entities/poi/lib/filter.ts` — 구(District) 필터는 순수 함수

`filterPoisByDistrict(district, category)`는 store나 훅을 전혀 사용하지 않는 순수 함수로 구현했다.
또한 원본 JSON의 필드명을 UI 친화 모델(`PoiSuggestion`)로 정규화해서,
Feature 레이어에서 “필드 변환/매핑”을 반복하지 않게 했다.

### 3) `features/recommend/lib/recommend.ts` — 랜덤 선택도 순수 비즈니스 로직

랜덤 추천 세트는 `pickRandomPoiSet(district)`에서 `getRandomIndexItem`을 사용해
카테고리별 1개씩 뽑아오는 방식으로 처리했다.
이 역시 React 훅/스토어 구독이 없는 순수 함수이므로,
UI와의 결합이 최소화된다.

### 4) `features/recommend/useRecommend.ts` — Orchestrator 훅

`useRecommend`는 `entities/location/model/store`에서 현재 `location`과 `myGeoInfo`를 읽어
추천에 필요한 최종 구(district)를 계산한 뒤,
Entity 필터 + Feature 추천 로직을 조합해 최종 POI 목록을 반환한다.

즉, “현재 위치 → 추천 데이터 생성”의 결합 책임을 훅(Feature)에만 두고,
교차 import 금지 규칙을 유지하기 위해 `features/location` 및 `core/stores`는 참조하지 않는다.

### 5) `PoiCard`는 props-only 순수 UI

`entities/poi/ui/PoiCard.tsx`는 `poi` props만 받아 렌더링하며,
store/hook/비동기 로직을 절대 포함하지 않도록 작성했다.
Feature인 `RecommendPlace`는 훅 결과를 받아서 `PoiCard`에 주입하는 “조립 역할”만 수행한다.

---

## [엄격 가이드] FSD 프로젝트 규칙 — 이 프로젝트에서 반드시 지킬 것

> FSD 공식 문서(https://feature-sliced.design/docs/reference/layers)를 기반으로,
> 이 프로젝트에 맞게 구체화한 엄격 규칙. 모든 코드 작성 시 예외 없이 적용한다.

### 규칙 1: 레이어 계층과 import 방향

이 프로젝트의 레이어 계층 (위 → 아래, 책임 큼 → 작음):

```
app/          ← Expo Router 라우팅 진입점
core/         ← 앱 인프라 (providers, 아직 entity 없는 임시 stores)
widgets/      ← 페이지 조합 단위 (features + entities 조립)
features/     ← 사용자 액션, 비즈니스 로직
entities/     ← 도메인 데이터 모델 + API + 순수 UI + 상태 저장소(model)
shared/       ← 공통 유틸, 타입, UI 프리미티브, API 클라이언트
```

**핵심 규칙: 아래 레이어는 위 레이어를 절대 import하지 않는다.**

| import 하는 쪽 | import 가능한 대상                        |
| -------------- | ----------------------------------------- |
| `shared/`      | `shared/` 내부만 (세그먼트끼리 자유)      |
| `entities/`    | `shared/` + 같은 slice 내부               |
| `features/`    | `entities/` + `shared/` + 같은 slice 내부 |
| `widgets/`     | `features/` + `entities/` + `shared/`     |
| `core/`        | 모든 하위 레이어                          |
| `app/`         | 모든 하위 레이어 + `core/`                |

**금지 패턴:**

- `features/` → `core/stores/` (위반: 아래가 위를 참조)
- `entities/` → `features/` (위반)
- `shared/` → `entities/` (위반)

### 규칙 2: 같은 레이어의 다른 slice 교차 import 금지

FSD에서 같은 레이어의 slice끼리는 서로 import할 수 없다.

- `features/weather/` → `features/location/` ← **금지**
- `entities/weather/` → `entities/location/` ← **금지** (필요 시 `@x` 패턴 사용)

같은 slice 안의 세그먼트끼리는 자유다:

- `features/location/useGeolocation.ts` → `features/location/lib/seoulPolicy.ts` ← **허용**

**교차 기능이 필요하면?** → widget 또는 page 레이어에서 두 feature를 조합한다.

### 규칙 3: 도메인 상태 저장소는 entity model에 위치

Zustand store 등 도메인 데이터 저장소는 해당 entity의 `model/store.ts`에 둔다.

```
entities/
├── weather/model/store.ts    ← useWeatherStore
├── location/model/store.ts   ← useLocationStore
```

`core/stores/`에는 아직 entity가 생성되지 않은 임시 스토어만 허용한다.
해당 entity가 만들어지면 즉시 `entities/*/model/store.ts`로 이동한다.

### 규칙 4: UI 세그먼트 순수성

`*/ui/*.tsx` 파일은 다음만 할 수 있다:

- props를 받아 렌더링
- 같은 slice의 Feature 훅을 호출해 반환값으로 렌더링 (WeatherPanel 패턴)

**금지:**

- `*/ui/*.tsx`에서 `@core/stores/`, `@entities/*/model/store` 직접 import
- `*/ui/*.tsx` 안에 AsyncStorage/네트워크/OS API 호출
- `*/ui/*.tsx` 안에 3줄 이상의 비즈니스 분기 로직

비즈니스 로직은 반드시 같은 slice의 훅(`use*.ts`) 또는 `lib/*.ts`로 추출한다.

### 규칙 5: Feature 훅 패턴

모든 Feature slice는 동일한 구조를 따른다:

```
features/도메인/
├── use도메인훅.ts           ← entity 스토어 구독 + API 호출 + 상태 갱신
├── lib/비즈니스로직.ts       ← 순수 함수 / 스토리지 유틸
└── ui/
    └── 컴포넌트.tsx         ← props 또는 훅 반환값만으로 렌더링
```

widget에서 조립할 때:

```tsx
const { districts, selected, handleSelect } = useDistrictSelect();
<DistrictPicker
  districts={districts}
  selected={selected}
  onSelect={handleSelect}
/>;
```

---

## FSD 위반 감사 및 수정 기록

### 발견된 위반 3건과 수정 내역

#### 위반 A: features → core 상향 import (6건)

**문제:** `features/weather/useWeather.ts`, `features/location/useGeolocation.ts`,
`features/location/useDistrictSelect.ts`, `features/location/useLocationConsent.ts`가
`@core/stores/useLocationStore`, `@core/stores/useWeatherStore`를 import했다.

FSD에서 `core`는 app 레이어(최상위)인데, features(하위)가 위를 참조하는 것은 의존 방향 위반이다.

**수정:**

- `useWeatherStore` → `entities/weather/model/store.ts`로 이동
- `useLocationStore` → `entities/location/model/store.ts`로 이동
- 모든 features의 import를 `@entities/*/model/store`로 변경
- `core/stores/index.ts`에서 이동한 스토어 제거

**이유:** FSD 공식 원칙에서 entity의 `model` 세그먼트가 "데이터 저장소"를 담당한다고 명시한다.
도메인 스토어는 entity에 있어야 features에서 합법적으로 import할 수 있다.

#### 위반 B: features/weather → features/location 동일 레이어 교차 import (1건)

**문제:** `features/weather/useWeather.ts`가 `@features/location/useGeolocation`을 import.
같은 레이어의 다른 slice를 참조하는 것은 FSD에서 금지된다.

**수정:**

- `useWeather.ts`에서 `useGeolocation` import 제거
- "현재 위치"인데 GPS 데이터가 없으면 `needsGps: true` 플래그만 반환
- GPS 트리거는 Phase 7(widgets)에서 `useGeolocation`과 `useWeather`를 조합해 처리

**이유:** 교차 기능 오케스트레이션은 상위 레이어(widgets/pages)의 책임이다.
feature는 자기 도메인의 액션만 처리하고, 다른 도메인과의 연결은 조립 레이어에 위임한다.

#### 위반 C: 도메인 스토어가 core(app 레이어)에 위치

**문제:** `useWeatherStore`, `useLocationStore`가 `core/stores/`에 있었다.
features에서 접근하려면 상향 import가 불가피했다.

**수정:** 위반 A와 동시에 해결. entity model로 이동.

### 잔여 허용 사항 (현재 Phase에서 용인)

- `core/stores/useMapStore.ts` — entities/map/model/store.ts로 이동 완료 (호환 리다이렉트)
- `core/stores/useRestaurantStore.ts` — entities/restaurant가 아직 없음 (Phase 6에서 이동 예정)
- `entities/location/model/store.ts`의 POI 배열 — entities/poi 생성 시 분리 예정 (Phase 4)
- `entities/location/model/store.ts`의 `seoulOnlyToastVisible` — feature-level 관심사이나 location 도메인과 강결합되어 임시 유지

---

## Phase 5: entities/map + features/map 마이그레이션 요약

### 1) 웹 구글맵(React) → RN react-native-maps 전환 시 좌표/렌더링 차이

- 웹(`@react-google-maps/api`):
  - `MarkerF`는 `position={{ lat, lng }}` 형태로 “lat/lng”를 그대로 전달한다.
  - `InfoWindow`/hover(`onMouseOver/onMouseOut`)를 자연스럽게 지원한다.
  - `GoogleMap`은 `center`/`zoom`/`tilt`를 API로 제어한다.
- RN(`react-native-maps`):
  - `Marker`는 `coordinate={{ latitude, longitude }}`로 값을 요구한다.
  - 카메라 상태(region)는 `latitude/longitude` + delta 2쌍(`latitudeDelta/longitudeDelta`)으로 표현된다.
  - iOS/Android에서는 마우스 hover 이벤트가 없어서, hover에 해당하는 `overMarkerId` 상태는 “구조만 유지”하고 실제 UI 상호작용에서는 `onPress` 중심으로 동작하도록 설계했다.

이 차이 때문에:

- `entities/map/model/types.ts`에서 내부 좌표 표준을 `lat/lon`으로 통일하고,
- `features/map/ui/MapView.tsx`에서 `react-native-maps`가 요구하는 `latitude/longitude`로 변환하는 계층을 UI 경계로 분리했다.

### 2) Map 도메인의 FSD 스토어 이동/분리 과정

1. 기존 임시 스토어가 있던 `core/stores/useMapStore.ts`의 역할(웹 LocationStore의 `showPoint`, hover/selected, `selectedType`, region 상태)을 `entities/map/model/store.ts`로 이관했다.
2. `entities/map/model/types.ts`를 추가해서
   - `MapType`(전체/문화공간/공원/두드림길)
   - `MapMarkerData`(currentLocation/poi)
   - `MapRegion`(react-native-maps region 표현)
     를 명시적으로 모델링했다.
3. 마커 후보 생성/필터링은 `features/map/lib/markers.ts`의 순수 함수로 이동했고,
   `features/map/useMapController.ts`가 store 구독/이벤트를 담당하도록 분리했다.

결과:

- 하위 레이어(core/widgets)로의 역방향 import가 없고,
- store 위치 규칙이 `entities/map/model/*`로 강제되며,
- POI JSON 필터 로직(`entities/poi/lib/filter.ts`)과 지도 렌더링(`react-native-maps`) 사이도 명확히 분리됐다.

---

## progress.md ↔ FSD 엄격 가이드 정합성 수정 기록

> 2026-03-25. FSD 엄격 가이드 정립 이후, progress.md에 남아있던 구 버전 서술과
> 새 가이드 사이의 **5가지 충돌**을 식별하고 문서와 코드를 일괄 수정했다.

### 충돌 1: 섹션 2 (core/stores) — 삭제된 스토어가 여전히 core 목록에 기재

**문제:** `useWeatherStore`, `useLocationStore`가 이미 `entities/*/model/store.ts`로
이동되었으나, progress.md 섹션 2-1에는 여전히 `core/stores/` 하위로 기록되어 있었다.
FSD 규칙 3("도메인 상태 저장소는 entity model에 위치")과 직접 충돌.

**수정:**

- 섹션 2 설명문을 "`core/stores`는 entity 미생성 임시 스토어만 보관"으로 변경
- weather/location 스토어 항목에 취소선 + "entities로 이동 완료" 표기

### 충돌 2: 섹션 3 (entities) — "읽기 전용만 담당" 서술이 store 포함 사실과 모순

**문제:** "entities는 데이터를 읽고 표시하는 역할만 담당"이라는 문구는
entity `model/store.ts`에 Zustand 상태(쓰기 가능)가 존재하는 현실과 맞지 않았다.
entity의 `ui/` 세그먼트만 "순수 읽기"이며, `model/` 세그먼트는 도메인 상태 저장소를 포함한다.

**수정:**

- 설명문을 "데이터 모델(상태 저장소 포함) + API + 순수 표시 UI"로 재정의
- "entity의 model/은 Zustand store를 포함할 수 있다" 규칙 명시
- "entity의 ui/는 props만 받는 순수 컴포넌트" 규칙 분리 명시
- weather, location 테이블에 `model/store.ts` 행 추가
- 미래 entity(poi, restaurant, statistics) 테이블에도 `model/store.ts` 예정 행 추가

### 충돌 3: 섹션 4 (features) — 리팩토링으로 추가된 훅이 미기재, UI 순수성 규칙 미언급

**문제:** FSD 리팩토링에서 `DistrictPicker`와 `LocationConsentModal`의 비즈니스 로직을
각각 `useDistrictSelect.ts`, `useLocationConsent.ts`로 분리했으나,
progress.md에는 이 훅들이 기재되지 않았고, UI 순수성 규칙도 명시되지 않았다.

**수정:**

- features 섹션 헤더에 "Feature UI 규칙"과 "교차 import 금지" 원칙 추가
- `useDistrictSelect.ts`, `useLocationConsent.ts` 행 추가
- `DistrictPicker.tsx`, `LocationConsentModal.tsx` 설명에 "(순수 UI — props only)" 명시

### 충돌 4: 미래 Phase 계획에 스토어 이동 전략 미반영

**문제:** Phase 5~9 설명이 "features/map", "features/statistics" 등만 기재하고,
해당 Phase 진입 시 `core/stores/`의 나머지 스토어를 entity model로 이동해야 하는
FSD 규칙을 반영하지 않았다. 문서만 보고 작업하면 스토어를 core에 방치할 위험.

**수정:**

- Phase 5: `useMapStore` → `entities/map/model/store.ts` 이동 명시
- Phase 6: `useRestaurantStore` → `entities/restaurant/model/store.ts` 이동 명시
- Phase 7: feature 간 교차 의존성을 widget에서 해소한다는 설명 추가
- Phase 8도 `entities/statistics`를 명시하여 entity 누락 방지

### 충돌 5: 코드 정합성 검증

**결과:** `src/` 전체에서 `@core/stores/useWeatherStore`, `@core/stores/useLocationStore`
import가 **0건**임을 확인. 문서 수정만으로 정합성이 완전히 달성되었다.
추가 코드 재구성은 불필요했다.

### 핵심 인사이트

progress.md는 단순한 체크리스트가 아니라 **FSD 아키텍처 의사결정의 원천 문서** 역할을 한다.
코드를 리팩토링할 때 이 문서를 함께 업데이트하지 않으면:

1. 다음 Phase 작업 시 이미 해결된 문제를 재발시킬 수 있다
2. 스토어 위치 같은 구조적 규칙이 문서와 코드 사이에서 파편화된다
3. "어디에 뭘 둬야 하는지" 혼란이 생겨 FSD 위반이 재발한다

따라서 **코드 변경 → 문서 동기화**를 하나의 원자적 작업 단위로 취급해야 한다.

---

## AI_CONVENTION.md 제정 및 프로젝트 전수 감사

### AI_CONVENTION.md 핵심 규칙 요약

`docs/AI_CONVENTION.md`가 프로젝트 코딩 컨벤션의 최상위 기준 문서로 제정되었다.
기존 `research.md`의 FSD 엄격 가이드와 겹치는 부분(단방향 의존성, 교차 참조 금지, 스토어 위치)에 더해,
**코딩 스타일 규칙**과 **AI 작업 지침**이 새로 명문화되었다.

| 규칙              | 핵심 내용                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------- |
| 절대 규칙 1       | 단방향 의존성 — 하위 → 상위 import 금지                                                      |
| 절대 규칙 2       | 같은 레이어 교차 slice import 금지                                                           |
| 절대 규칙 3       | 도메인 Store는 `entities/*/model/store.ts`에만 위치. `features/` 내 store 생성 금지          |
| Feature UI 순수성 | `ui/` 컴포넌트는 props-only 순수 UI. 비즈니스 로직은 훅(`use*.ts`)으로 분리                  |
| 함수 선언         | **모든** 컴포넌트·함수를 화살표 함수로 작성. `function` 키워드 사용 엄격히 금지              |
| 스타일링          | NativeWind(Tailwind) 기반. 인라인 `style={{}}` / CSS 혼용 금지 (동적 props 의존은 예외 허용) |
| AI 임의 수정 금지 | 사용자가 요청하지 않은 파일·패키지·빌드 설정 변경 불가                                       |

### 전수 감사 결과

프로젝트 전체(`src/` + `app/`)를 대상으로 위 규칙 위반 여부를 검사했다.

| 검사 항목                             | 결과                              | 조치                                                                          |
| ------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `function` 키워드 사용                | `app/index.tsx` 1건               | 화살표 함수로 전환 완료                                                       |
| `features/` 내 zustand store 생성     | 0건                               | 준수                                                                          |
| `features/` → `core/stores` 참조      | 0건                               | 준수                                                                          |
| 같은 레이어 교차 slice import         | 0건 (같은 slice 내부 참조만 존재) | 준수                                                                          |
| inline `style={{}}` 사용              | `shared/ui/StarRating.tsx` 1건    | 동적 props(`size`, `color`) 의존이라 Tailwind로 대체 불가. 합리적 예외로 유지 |
| `entities/` → `features/` 역방향 참조 | 0건                               | 준수                                                                          |

### 수정 내역

**`app/index.tsx`**: `export default function Index()` → `const Index = () => { ... }; export default Index;`

이 1건이 유일한 위반이었으며, 나머지 `src/` 전체의 모든 함수·컴포넌트는
이미 화살표 함수(`const Xxx = () => { ... }`)로 작성되어 있었다.

---

## Phase 6: Google Places 맛집 연동 — FSD·절대 규칙 4·5 준수 요약

### 배경

웹은 `POST /api/restaurants`로 Next Route Handler가 Google Places Text Search + Place Photo(바이너리→base64 data URL)를 수행했다. RN에는 서버가 없으므로 **클라이언트에서 동일 쿼리 파라미터로 Google API를 직접 호출**하되, API 키는 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`로만 노출한다.

### 절대 규칙 4 (NativeWind `className` 동적 조립 금지) 적용

- **`entities/restaurant/ui/RestaurantCard.tsx`**: 카드 행 레이아웃·테두리는 **고정 리터럴** `className` 문자열로만 둔다. 영업 여부 문구는 `openNow`에 따라 **삼항으로 “문자열만”** 고른다 (`"영업중"` / `"영업 종료"` / `"정보 없음"`). `${bg}-${color}` 같은 패턴은 사용하지 않는다.
- **`features/recommend/ui/RecommendFood.tsx`**: 펼침 패널과 접힘 FAB은 **서로 다른 리터럴 상수**(`expandedOuterClassName`, `collapsedFabClassName`)로 분리했다. 웹의 ``className={`... ${expansion ? '...' : '...'}`}`` 패턴을 RN에서도 **전체 문자열을 삼항/상수로만** 선택하도록 맞췄다.

### 절대 규칙 5 (UI는 표현만, 가공은 훅·API) 적용

- **`entities/restaurant/api/api.ts`**: `shared/api/client`의 `get`으로 Text Search·Photo URL을 호출하고, 응답을 **`Restaurant[]`로 정규화**한다. 웹의 `results` 필터·정렬·상위 5개·사진 URL 조립을 이 레이어에서 끝낸다.
- **`features/recommend/useRecommendFood.ts`**: `entities/location/model/store`에서만 위치·구·`myGeoInfo`를 읽고, 좌표를 계산한 뒤 API를 호출해 **`useRestaurantStore`에만 쓴다**. `features/location` slice는 **import하지 않는다** (교차 참조 방지). 동의 여부는 웹과 동일한 키 `"locationAgree"`를 **`@shared/lib/storage`**로만 읽어 FSD 위반을 피한다.
- **`features/recommend/ui/RecommendFood.tsx`**: `useRecommendFood`가 넘긴 `restaurants`, `loading`, `fetchError`, 핸들러만 사용하고 **스토어/API를 직접 부르지 않는다**.

### 스토어 위치 (절대 규칙 3)

- `useRestaurantStore`를 **`entities/restaurant/model/store.ts`**로 이동하고, `core/stores/useRestaurantStore.ts`는 **`@entities/restaurant/model/store` 재export**만 하는 리다이렉트로 남겨 기존 import 경로를 보존한다. `core/stores/index.ts`는 엔티티 스토어를 직접 re-export하도록 수정했다.

### 웹 대비 구현 차이

- **이미지**: 웹은 Place Photo 응답을 base64로 붙였고, RN은 **`expo-image`가 로드할 수 있는 Place Photo HTTPS URL**을 `Restaurant.imageUri`에 넣었다 (동일 API, 표현만 단순화).
- **맵 연동**: 썸네일 탭 시 `entities/map`의 `onClickRecommendMaker(\`place:${placeId}\`)`로 선택 상태만 맞춘다(POI 마커 id 체계와 다를 수 있음).

### 검증

- `npx tsc -p tsconfig.json --noEmit`, `npm run lint(expo lint)`로 타입·린트 통과를 기준으로 한다.

---

## Phase 7: Widgets 계층으로 Features 조립 및 `app/` 라우팅 연결

### 왜 Widgets인가 (FSD)

- **Feature 슬라이스끼리는 서로 import하지 않는다** (절대 규칙 2). 그러나 한 화면에는 날씨·위치·지도·맛집 등 **여러 Feature UI가 동시에** 필요하다.
- **`widgets/`**는 그 사이의 **합법적인 조립 계층**이다. 여기서만 `features/location`의 `DistrictPicker` + `useDistrictSelect`와 `features/weather`의 `WeatherPanel`, `features/recommend`의 `RecommendPlace`를 **같은 스크롤 영역**에 묶을 수 있다.
- **`app/` (expo-router)**는 **라우트 진입점**만 담당한다. `app/index.tsx`는 **`@widgets/*`만 import**하고, 비즈니스 로직·훅 호출 없이 레이아웃 비율(`flex-[4]` / `flex-[6]`)만 잡는다.

### 이번에 만든 위젯과 역할

| 파일                                 | 조립 내용                                                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `widgets/home/ui/HomeSidebar.tsx`    | `DistrictPicker` + `WeatherPanel` + `RecommendPlace` — 구 선택 훅은 `useDistrictSelect`만 노출, 나머지 패널은 각자 내부 훅 보유                                                                  |
| `widgets/home/ui/HomeMap.tsx`        | `useMapController` + `MapView` + `RecommendFood` — **MapRegion(lat/lon) ↔ RN `region`(latitude/longitude)** 변환을 **위젯에서만** 수행해 `MapView`(순수 UI)와 스토어(MapRegion) 사이 경계를 명시 |
| `widgets/layout/ui/AppHeader.tsx`    | 상단 타이틀·짧은 부제, `expo-router`로 `/` 이동                                                                                                                                                  |
| `widgets/layout/ui/RootOverlays.tsx` | 웹 `layout.jsx`의 `LocationConsentModal` + `SeoulOnlyToast` 대응 — `useLocationConsent` + `Toast` + 스토어의 `seoulOnlyToastVisible`                                                             |

### Features 간 “의존성 해소” 예

- **지도 ↔ 맛집**: `RecommendFood`는 `useRecommendFood`가 `entities/map`의 `onClickRecommendMaker`를 호출한다. `features/recommend`가 `features/map`을 import하지 않고 **entities 스토어**만 쓰므로 FSD 위반이 아니다. 위젯은 두 컴포넌트를 **같은 `HomeMap` 뷰 트리**에만 올려 시각적으로 겹친다.
- **사이드바 ↔ 지도**: 둘 다 **`entities/location/model/store`**를 구독하므로 별도 props 드릴링 없이 동기화된다. 조립은 widgets가 담당하고, 데이터 단일 출처는 entities다.

### `app/_layout.tsx` 구조

- `AppProvider` → `SafeAreaView` → `AppHeader` → `Stack`(header 숨김) → `RootOverlays` 순으로, 웹의 Header + main + 전역 모달/토스트 구조를 RN에 맞게 옮겼다.

### 검증

- `tsc` / `expo lint` 통과를 기준으로 한다.

---

## Phase 8: 통계 차트 마이그레이션 (chart.js -> react-native-chart-kit)

### 1) 웹의 `service/chart.js` 로딩 책임을 Entity API로 이관

- 웹 원본은 `service/chart.js`에서 `data/chartData.json`을 읽어 반환했다.
- RN에서는 `entities/statistics/api/api.ts`의 `fetchStatisticsData()`를 표준 진입점으로 만들고,
  현재는 `entities/statistics/model/data.ts`의 정적 번들 데이터를 Promise로 반환한다.
- 이 구조로 Feature 레이어는 “서버/정적 번들”의 차이를 몰라도 동일한 async 시그니처를 유지한다.

### 2) Adapter 책임을 `features/statistics/useStatistics.ts`로 집중 (절대 규칙 5)

`react-native-chart-kit`은 `labels + datasets[].data` 형식을 요구하므로, 아래 가공을 훅에서만 수행했다.

- 필터 스토어(`location`, `gender`, `age`) 구독
- 성별 라벨(`남성/여성`) -> 원본 키(`male/female`) 매핑
- 레이더 대체 데이터(LineChart용): 연령 라벨(10~60) 축 + 점수 배열 생성
- 바 차트 데이터: 카테고리(문화/공원/두드림길) 집계 배열 생성
- 화면 폭 기반 차트 width 계산

핵심은 **UI 컴포넌트가 데이터 형태를 절대 가공하지 않도록** 어댑터를 훅에 격리한 점이다.

### 3) `react-native-chart-kit`에서 Radar 미지원 이슈 대응

- 웹은 Chart.js Radar를 사용했지만, `react-native-chart-kit`은 Radar를 직접 지원하지 않는다.
- 대체 전략으로 `features/statistics/ui/RadarChart.tsx`에서 LineChart를 사용해
  연령대 패턴을 시각화했다.
- 컴포넌트 명(`RadarChart`)은 웹 대응 의미를 유지하고, 구현체만 RN 라이브러리 제약에 맞췄다.

### 4) 절대 규칙 4/5 준수 포인트

- **규칙 4(동적 className 금지):** 차트/필터 UI에서 `${}` 기반 토큰 조립 없이 리터럴 className만 사용.
- **규칙 5(UI 내 가공 금지):** `ChartFilter`, `RadarChart`, `BarChart`는 props-only 렌더링.
  필터 옵션 생성/집계/포맷 변환은 전부 `useStatistics`에만 위치.

### 5) 계층 분리 최종 구조

- `entities/statistics/`
  - `model/types.ts`, `model/store.ts`, `model/data.ts`, `api/api.ts`, `ui/ChartCard.tsx`
- `features/statistics/`
  - `useStatistics.ts`(오케스트레이션+Adapter), `ui/ChartFilter.tsx`, `ui/RadarChart.tsx`, `ui/BarChart.tsx`
- `widgets/statistics/ui/StatisticsView.tsx`
  - 필터 + 차트 패널 조립
- `app/statistics.tsx`
  - 라우트 진입점만 유지

---

## Phase 9: 헤더 스크롤 동작 정렬 (홈 사이드바 포함, 지도 하단 고정)

### 요구사항 해석

- 홈(`/`)에서 헤더를 웹의 `position: fixed`처럼 뷰포트에 붙이지 않고, **사이드바 스크롤 컨텐츠에 포함**시켜
  지역/날씨/추천과 함께 움직이게 한다.
- 지도는 스크롤에 섞지 않고, **아래 영역에 고정된 별도 패널**로 유지한다.

### 구조 변경 핵심

- `app/_layout.tsx`
  - `AppHeader` 렌더를 제거했다.
  - 루트는 `AppProvider -> SafeAreaView -> Stack -> RootOverlays`만 담당한다.
  - 이유: 레이아웃 레벨에서 헤더를 두면 라우트 `ScrollView`와 형제 관계가 되어 스크롤에 따라 움직이지 않기 때문.

- `widgets/home/ui/HomeSidebar.tsx`
  - `ScrollView` 최상단에 `AppHeader`를 배치했다.
  - 이후 `DistrictPicker`, `WeatherPanel`, `RecommendPlace`가 같은 스크롤 흐름을 공유한다.

- `app/index.tsx`
  - 기존 상/하 분할(`flex-[4]` / `flex-[6]`)은 유지한다.
  - 상단은 `HomeSidebar`(헤더 포함 스크롤), 하단은 `HomeMap`(비스크롤 영역)으로 분리되어
    지도 제스처와 사이드바 스크롤이 충돌하지 않는다.

- `widgets/statistics/ui/StatisticsView.tsx`
  - 레이아웃에서 헤더를 내린 구조에 맞춰, 통계 화면도 `ScrollView` 상단에 `AppHeader`를 포함했다.
  - 동일한 내비게이션 헤더 경험을 유지하되, 화면 컨텐츠와 함께 스크롤되도록 정렬했다.

### 검증

- `npm run lint`(= `expo lint`) 통과.
- 기존 경고 1건(`entities/location/api.ts`의 `no-empty-object-type`)만 유지, 이번 변경으로 새 에러는 없음.

---

## Phase 11: 지도 마커 깜빡임 RCA (Expo Go / Android)

### 증상

- 홈 지도에서 특히 `두드림길` 표시 시 마커가 **아주 짧게 주기적으로 깜빡임**.
- 사용자 제보 기준:
  - 마커 개수와 무관하게 발생
  - 지도 터치/이동이 없어도 앱 첫 로드 직후부터 지속
  - 텍스트 제거 실험에도 재현

### 초기 가설과 검증 순서

1. **가설 A: region write-back 루프**
   - 의심 지점:
     - `MapView`가 controlled `region` 사용
     - `onRegionChangeComplete -> setRegion`로 store write-back
   - 검증:
     - `setRegion` 임시 차단 (No-op) -> 증상 지속
     - epsilon 비교로 미세 변경 무시 -> 증상 지속
   - 결론:
     - 이번 케이스의 주원인은 아님.

2. **가설 B: provider 차이(플랫폼 렌더러)**
   - 검증:
     - `RNMapView`에 `provider="google"` 적용
   - 결론:
     - 증상 개선 없음.

3. **가설 C: 변환 객체 참조 안정성**
   - 검증:
     - `HomeMap`의 `mapRegionToRn(region)` 결과를 `useMemo`로 안정화
   - 결론:
     - 증상 개선 없음.

4. **가설 D: Marker 뷰 추적 렌더링(`tracksViewChanges`)**
   - 검증 1:
     - `tracksViewChanges={false}` 고정 -> 깜빡임은 줄지만 일부 기기에서 마커 미표시 발생(채택 불가)
   - 검증 2 (최종):
     - `tracksViewChanges`를 state로 제어해 **초기/상태 변경 직후만 true, 250ms 후 false**
   - 결론:
     - 깜빡임 해소 + 마커 표시 정상 확인.

### 최종 적용안

- 대상 파일: `features/map/ui/MapMarker.tsx`
- 적용 내용:
  - `tracksViewChanges`를 `useState`로 관리
  - `isSelected`, `isOver`, `marker.id` 변경 시:
    - `setTracksViewChanges(true)`
    - `setTimeout(..., 250)`으로 `false` 복귀
- 의도:
  - 마커 내용이 실제로 바뀌는 짧은 구간만 네이티브 추적 렌더링을 허용하고,
    평상시에는 추적을 끄는 방식으로 지속 깜빡임을 차단.

### 왜 이 방식이 유효한가

- `react-native-maps`의 커스텀 마커(View/Text)는 플랫폼별로 추적 렌더링 비용/깜빡임 이슈가 있다.
- `tracksViewChanges`를 무작정 false로 고정하면 초기 렌더 타이밍에 따라 마커가 안 보일 수 있다.
- 따라서 **일시적 true -> 안정화 후 false** 패턴이 재현성과 안정성을 모두 확보한다.

### 운영 가이드

- 기본 타이머는 `250ms` 유지.
- 저사양 기기에서 선택 상태 반영이 늦으면 `300ms`까지 상향,
  반대로 반응성 우선이면 `180~220ms`로 하향해 튜닝한다.
- 향후 클러스터링/커스텀 이미지 마커로 전환 시 동일 증상 재발 가능성이 있으므로
  `tracksViewChanges` 정책을 공통 규칙으로 문서화해 재사용한다.

---

## RN 이슈(Expo Go): `RestaurantCard` 스타일 변경 직후 `NavigationStateContext` Render Error

### 1) 현상

- **Expo Go**에서 LogBox **Render Error**가 발생했다.
- 메시지(요지):  
  `Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'? See https://reactnavigation.org/docs/getting-started for setup instructions.`
- 스택에 **`RestaurantCard.tsx`**(컴포넌트 선언부 근처)와 **`react-native-css-interop`**의 `api.js`(대략 27행, `interop` 호출부)가 함께 보이는 경우가 있었다.

### 2) 에러가 “의미하는 것” (라이브러리 코드 기준)

`@react-navigation/core`의 `NavigationStateContext`는 **Provider 밖**에서 쓰이면, 기본 context 값의 **getter**가 접근될 때 위 메시지를 `throw`하도록 구현되어 있다.

`@react-navigation/core`의 `NavigationStateContext.js`(번들 기준)에서 기본값 객체는 대략 다음과 같이, Provider 밖에서 getter가 읽히면 곧바로 `MISSING_CONTEXT_ERROR`를 던지도록 되어 있다.

```js
// (요지) node_modules/@react-navigation/core/.../NavigationStateContext.js
React.createContext({
  isDefault: true,
  get getKey() {
    throw new Error(MISSING_CONTEXT_ERROR);
  },
  // setKey, getState, setState, getIsInitial — 동일 패턴
});
```

즉, 이 메시지는 **반드시 “NavigationContainer 밖에 컴포넌트가 있다”는 뜻만은 아니고**, **`useNavigationBuilder` 등이 NavigationStateContext를 “유효한 Provider 없이” 읽는 코드 경로가 한 번이라도 실행**되면 동일하게 난다. (메시지 문구는 히스토리적으로 `NavigationContainer` 안내에 고정되어 있다.)

### 3) 코드베이스에서 확인한 사실 (직접 원인 후보 축소)

| 항목 | 결과 |
|------|------|
| `RestaurantCard` / `StarRating` / `RecommendFood`에 `useNavigation`·`NavigationContainer` | **없음** |
| `npm ls @react-navigation/native` | **단일 버전(deduped)** — 중복 패키지로 인한 “이중 navigation” 정황은 약함 |
| 루트 라우팅 | `expo-router`의 `ExpoRoot`가 `NavigationContainer`로 감싼 뒤 `_layout`·화면을 그린다는 구조(Expo Router 기본) |

따라서 **“맛집 카드가 직접 React Navigation API를 호출해서 터졌다”**고 단정하기는 어렵다. LogBox가 **에러가 전파된 지점 근처의 함수 컴포넌트**를 가리키는 경우가 많아, **스택의 `RestaurantCard`는 “진짜 범인”이 아니라 “같은 렌더 사이클에서 리프에 가까운 컴포넌트”**일 수 있다.

### 4) 이 프로젝트에서 유력한 “촉발 층” (가설 — 확정 단일 라인 버그는 아님)

스타일만 바꿨는데 navigation 오류가 뜬 패턴은 다음과 맞물릴 수 있다.

1. **NativeWind v4 + Babel `jsxImportSource: "nativewind"`**  
   JSX가 `react-native-css-interop` 런타임을 거치며 `View`/`Text`/`Pressable` 등이 **interop 래퍼**로 치환된다 (`wrap-jsx` → `interopComponents.get(type)`).

2. **className / 레이아웃 / 인터랙션 관련 유틸 조합**이 바뀌면 interop 쪽 **렌더·훅·리듀서 경로**가 달라진다. 이 과정에서 **에러 메시지와 무관한 스택 프레임**이 섞이거나, **특정 기기/Expo Go 조합에서만** 한 번 터지는 식으로 관찰될 수 있다.

3. 대화 중 시도했던 변경 중, **구조를 크게 바꾼 형태**(예: 활성/비활성에 **서로 다른 래퍼 depth**, JSX를 **변수(`inner`)로 빼서** 조건부 트리에 끼워 넣기, **`shadow-sm` / `shadow-*`**, **`border-*` opacity 슬래시** 등)는 **“안정적으로 동작하던 트리 형태”를 깨기 쉬워** 회귀/이상 스택을 유발할 여지가 있다.

4. **`accessibilityState={{ selected: isActive }}`**  
   React Navigation과 **직접 연결된다고 증명된 것은 아니다**. 다만 “스타일 외 메타데이터”를 건드리면 **접근성/네이티브 쪽 경로**가 달라져, 디버깅 시 혼선을 키울 수 있어 **“스타일만 바꿀 작업”에서는 넣지 않는 것**을 권장한다.

**정리:** 이 레포에서는 **한 줄로 “이 className이 navigation context를 읽는다”고 역추적하지 못했고**, 재현이 **UI 변경 직후**에 국한되어 **안전한 변경 절차**로 정리하는 것이 실무적으로 맞다.

### 5) 채택한 완화 전략 (재발 방지)

- **상태·스토어·`RecommendFood` → `RestaurantCard` props 계약**은 유지한다. (`isActive`는 부모가 계산해 전달.)
- **에러가 없던 시점의 View 트리 형태**(상·하 divider + 단일 row)를 **유지**하고, 바꾸는 것은 **`className` 리터럴(삼항으로 전체 문자열 선택)** 에 한정했다.
- **그림자·복잡한 카드 래핑·JSX 변수로 분기 트리 구성**은 “스타일 개선” 단계에서 **나중에** 넣고, 문제 시 **구조부터 되돌린 뒤** class만 조정한다.
- 동일 증상 재현 시 **Metro 캐시**(`npx expo start -c`)도 후보에 둔다. (interop/바벨 산출물 꼬임은 드물지만 배제하기 어렵다.)

### 6) 현재(문서화 시점) 스타일 방향 (참고)

- 활성 행: 상·하 `h-0.5 bg-sky-500`, 본문 `bg-sky-50`·`pl-2`, 제목 `font-semibold text-sky-900`, 영업 문구 `text-sky-600` 등 **색·타이포만** 조정.
- 비활성 행: 기존과 같이 `border-b border-neutral-200` 유지.

이 섹션은 **실제 디버깅 세션에서 관찰된 증상·배제한 가설·채택한 안전 패턴**을 기록한 것이며, React Navigation / NativeWind 쪽 upstream 이슈를 단정하지 않는다.

---

## RN 이슈(Expo Go): 추천식당 첫 탭에서 리젠/마커가 늦게 반영되는 문제

### 증상

- 앱 켠 직후 추천식당 리스트를 열고 `1~3번째`를 연속 탭하면,
  - 마커가 화면에 **아예 보이지 않는 구간**이 생기거나
  - 리젠이 체감상 늦게 반영되는 것처럼 보였다.
- 이후 `4번째`부터는 정상적으로 리젠/마커가 보이는 패턴이 관찰되었다.

### 원인 가설(최종 결론)

이 문제는 “지도 sdk가 다시 현위치를 보는” 케이스라기보다, 앱 레벨에서 **필요한 값 준비 타이밍이 어긋나는 두 지점**이 겹친 것으로 정리했다.

1. **`useMapController`의 `mergedMarkers`가 `showPoint` 준비 전엔 `undefined`가 되는 구조**
   - 기존 로직: `showPoint === undefined`이면 `mergedMarkers`도 `undefined` → `MapView`에서 마커 렌더가 통째로 스킵.
   - 결과: 추천식당(`recommendMarkers`)이 있어도 POI/기타 마커 준비가 끝나기 전까지 지도에는 마커가 나오지 않던 타이밍이 생길 수 있었다.

2. **추천식당 리전 보정용 패널 우측 끝 `panelRightEdgePx` 측정 타이밍**
   - 추천식당 탭 시 `panelRightEdgePx`가 없으면(측정 전이면) `useRecommendFood`가 fallback(272dp)으로 lon offset을 계산한다.
   - 앱 켠 직후/리스트 오픈 직후의 첫 탭에서 이 값이 아직 준비되지 않은 경우, 오프셋이 부정확해 보여 “리젠이 안 되는 것처럼” 체감될 수 있다.

### 최종 적용(안전한 해결책)

1. `src/features/map/useMapController.ts`
   - `showPoint`가 `undefined`여도 `recommendMarkers`는 먼저 보여주도록 `mergedMarkers` 조합을 변경했다.
   - 핵심: `showPoint` 준비 전에도 “추천식당 마커는 렌더되게” 해서 ‘마커 미표시 구간’을 제거.

2. `src/features/recommend/ui/RecommendFood.tsx`
   - `panelRightEdgePx`가 측정되지 않은 상태(`null`)에서는 `RestaurantCard`의 `onPressPhoto`를 `undefined`로 만들어 탭 이벤트를 막았다.
   - 핵심: 첫 탭에서 잘못된 lon offset 계산이 실행되지 않게 방어.

3. `src/features/recommend/useRecommendFood.ts`
   - 보정 로직은 기존대로 유지하되, 패널 우측 끝이 측정된 뒤에만 탭이 들어오도록 UI 레벨에서 안전장치를 두어 타이밍 문제를 제거했다.

### 관련 코드 위치

- `src/features/map/useMapController.ts` — `mergedMarkers` 조합 로직
- `src/features/recommend/ui/RecommendFood.tsx` — `panelRightEdgePx` 없을 때 탭 비활성화
- `src/features/recommend/useRecommendFood.ts` — lon offset 보정 및 `setRegion`

---

## RN 이슈: 위치·날씨 플로우 (2026 세션 정리)

아래는 **실제 구현·디버깅 과정에서 발생한 이슈**와 원인·대응을 한곳에 묶은 기록이다.

### 1) `hasLocationConsent`와 GPS의 닭·달걀, 그리고 `requestLocation` 단일 경로

**증상**

- 구 선택에서 「현재 위치」를 눌렀을 때 `AsyncStorage`의 `locationAgree`가 없으면 막히거나, 동의 모달에서만 `setLocation("현재 위치")`만 해서 **`myGeoInfo`·날씨·지도가 서로 안 맞는** 상태가 될 수 있었다.
- `markLocationAgreed()`는 역지오 성공 후에만 호출되는데, 구 선택 쪽에서는 **`hasLocationConsent()`를 먼저** 요구해 논리가 꼬일 수 있었다.

**원인**

- 「현재 위치」는 **GPS → 역지오 → 서울 판별 → `setMyGeoInfo` + 날씨 fetch** 한 경로로만 반영하는 것이 맞다.
- 구 선택과 동의 모달이 그 경로(`useGeolocation`의 `requestLocation`)와 분리되어 있으면 상태가 불일치한다.

**대응**

- `useDistrictSelect`: 「현재 위치」 선택 시 `hasLocationConsent` / `Alert` 제거 후 **`await requestLocation()`** 만 호출.
- `useLocationConsent`: 동의 시 **`markConsentAsked` → 모달 닫기 → `await requestLocation()`** (GPS와 동일 파이프라인).
- 개발용 매 실행 “첫 방문” 테스트: `src/core/dev/locationTestReset.ts`에서 `RESET_LOCATION_STATE_ON_EACH_LAUNCH`, `AppProvider`에서 `rehydrate` 전에 `location-store` + `seoulPolicy` 키(`outside`, `locationAgree`, `locationConsentAsked`) 정리. `seoulPolicy.ts`에 `clearLocationPolicyStorage()` 추가.

**관련 파일**

- `src/features/location/useDistrictSelect.ts`, `useLocationConsent.ts`, `useGeolocation.ts`
- `src/core/dev/locationTestReset.ts`, `src/core/providers/AppProvider.tsx`
- `src/features/location/lib/seoulPolicy.ts`

---

### 2) Expo Go + 실기기(서울 외 거주)에서 서울 플로우 테스트

**증상**

- 실기기 GPS가 경기·성남 등 **서울 밖**이면 서울 한정 정책·지도·날씨를 그대로 검증하기 어렵다.

**대응**

- `__DEV__`에서만 켜는 플래그로 **실제 `getCurrentPositionAsync` 대신 고정 좌표**를 쓴다.
- 좌표는 **서울특별시 강동구청 인근**으로 두어 역지오·날씨 API가 강동구로 응답하도록 했다.

**관련 파일**

- `src/core/dev/devLocationMock.ts` — `USE_DEV_FIXED_GPS_FOR_EXPO_GO`, `DEV_MOCK_COORDINATES_GANGDONG`
- `src/features/location/useGeolocation.ts` — 권한 허용 후 mock 분기

---

### 3) 지도 마커: `TypeError: Cannot read property 'toFixed' of undefined` (`makeMarkerId`)

**증상**

- 「현재 위치」 후 지도 마커 생성 시 `makeMarkerId` → `lat.toFixed(6)`에서 터짐.

**원인**

- Google Geocoding JSON의 `geometry.location`은 **`lng`** 필드를 쓰는데, `buildUserGeoContext`가 **`lon`만** 읽어 `myGeoInfo.lon`이 `undefined`였다.
- `useMapController`의 `currentLocationCoord`가 `{ lat, lon: undefined }`를 넘기면 `markers.ts`의 `makeMarkerId`가 실패한다.

**대응**

- `buildUserGeoContext`에서 `lon = typeof loc.lon === "number" ? loc.lon : loc.lng` 로 정규화하고, 좌표가 유효하지 않으면 `null` 반환.
- `GeocodeResult.geometry.location` 타입에 `lng` 반영.
- `useMapController`에서 `myGeoInfo`의 `lat`/`lon`이 **유한한 숫자일 때만** 현재 위치 마커·센터에 사용.

**관련 파일**

- `src/entities/location/api.ts`, `src/entities/location/model/types.ts`
- `src/features/map/useMapController.ts`, `src/features/map/lib/markers.ts`

---

### 4) 서울데이트 ↔ 통계 이동 후 **다른 지역 날씨**가 보이는 문제

**증상**

- 지역을 「현재 위치」로 둔 뒤 통계 페이지로 갔다가 다시 서울데이트로 돌아오면, **이전에 요청한 구 단위 날씨**와 섞이거나 전혀 다른 기온·날씨가 보였다.

**원인**

- `getSelectLocation(구이름)`이 **비동기**로 완료될 때까지 시간이 걸리는 동안 사용자가 「현재 위치」로 바꾸면, `requestLocation`이 `showWeather`를 맞춰도 **늦게 도착한 구 단위 응답**이 `setShowWeather`를 다시 호출해 **덮어쓴다** (스테일 응답 레이스).
- 기존 `useWeather`는 마운트 시 **두 개의 `useEffect`**가 겹치며 같은 구에 대해 fetch가 중복될 수 있었고, 화면 전환으로 홈이 다시 마운트되면 타이밍이 겹치기 쉽다.

**대응**

- `getSelectLocation` 완료 직전에 **`useLocationStore.getState().location === districtName`** 일 때만 `setShowWeather` 적용 (요청한 구가 아직 선택일 때만 반영).
- 이펙트 분리: **구 선택**은 `location`(및 `allDistrictInfo` 준비) 변화에만 fetch, **「현재 위치」**는 `myLocalWeather`로만 동기화하고 `myLocalWeather` 변경으로 구 fetch가 재실행되지 않게 함.
- 「현재 위치」로 동기화할 때 **`setLoading(false)`** 로 이전 구 fetch의 로딩 상태가 남지 않도록 처리.

**관련 파일**

- `src/features/weather/useWeather.ts`

---

### 요약 표

| 이슈 | 핵심 원인 | 핵심 대응 |
|------|-----------|-----------|
| 현재 위치 / 동의 / GPS 불일치 | 구·모달이 `requestLocation`과 분리 | 구 선택·동의 모두 `requestLocation` 단일 경로 |
| 서울 외 실기기 테스트 | 실 GPS가 비서울 | `__DEV__` 강동구 고정 좌표 mock |
| 마커 `toFixed` 크래시 | Google `lng` vs 코드 `lon` | 역지오 결과에서 `lng` → `lon` 정규화 |
| 날씨가 다른 지역처럼 보임 | 구 fetch 스테일 응답이 나중에 덮어씀 | 완료 시점에 선택 구와 일치할 때만 `setShowWeather` + 이펙트 분리 |

이 섹션은 **해당 시점 코드 기준**으로 작성했으며, 이후 리팩터 시 파일 경로·플래그명은 실제 코드와 함께 갱신하는 것이 좋다.
