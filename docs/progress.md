# 마이그레이션 진행 체크리스트 (Progress Tracker)

> **원본:** portfolio-next (Next.js 13, App Router, JavaScript)
> **대상:** portfolio-rn (Expo SDK 54, expo-router, TypeScript, NativeWind v4, FSD)

---

## 0. 프로젝트 초기 세팅

- [x] Expo 프로젝트 생성 및 기본 구조 정리
- [x] NativeWind v4 + Tailwind CSS 설치 및 설정
- [x] FSD 폴더 구조 생성 (`src/shared`, `entities`, `features`, `widgets`, `core`)
- [x] TypeScript path alias 설정 (`@shared/`, `@entities/`, `@features/`, `@widgets/`, `@core/`)
- [x] Zustand 설치 및 스토어 초기 구성
- [x] 공통 환경변수 설정 (`.env` — API 키 등)

---

## 원본 프로젝트 도메인 분석 요약

| 도메인                | 웹 원본 위치                                                                       | 핵심 기능                                         |
| --------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Weather**           | `hooks/useWeather`, `service/weather.js`, `api/weather/route.js`                   | OpenWeatherMap 현재/예보 날씨 조회                |
| **Location**          | `service/location.js`, `api/location/route.js`, `stores/LocationStore`             | 서울 25개 구 정보, GPS 역지오코딩, 서울 한정 정책 |
| **Map**               | `components/GoogleMapContainer.jsx`, `@react-google-maps/api`                      | Google Maps 지도, 마커, POI 표시                  |
| **POI (데이트 장소)** | `components/SelectShowMapType.jsx`, `components/RecommendPlace.jsx`, `data/*.json` | 공원/문화시설/두드림길 필터 및 추천               |
| **Restaurant**        | `components/RecommendFood.jsx`, `api/restaurants/route.js`                         | Google Places 기반 맛집 검색 + 사진               |
| **Statistics**        | `app/statistics/page.jsx`, `components/ChartComponent.jsx`, `service/chart.js`     | 레이더/바 차트 통계 시각화                        |
| **Survey**            | `stores/LocationStore` (surveyStep, userInfo)                                      | 성별/연령 설문 (미완성 — 모달 미연결)             |

---

## 1. `src/shared/` — 공통 인프라 & UI

> 앱 전역에서 재사용되는 유틸리티, 타입, UI 프리미티브, API 클라이언트.

### 1-1. 공통 타입 정의 (`shared/types/`)

- [x] `weather.ts` — WeatherCurrent, WeatherForecast, WeatherResponse 등
- [x] `location.ts` — District, GeoCoord, GeoInfo 등
- [x] `poi.ts` — Park, CulturalSpace, Dodreamgil, MapPoint 등
- [x] `restaurant.ts` — Restaurant, PlacePhoto 등
- [x] `chart.ts` — ChartData, ChartEntry 등

### 1-2. API 클라이언트 (`shared/api/`)

- [x] `client.ts` — fetch 래퍼 (base URL, 에러 핸들링, 타임아웃)
- [x] `endpoints.ts` — API 경로 상수 정의

### 1-3. 유틸리티 (`shared/lib/`)

- [x] `date.ts` — `getCurrentTime`, `get3Days`, `get24H`, `fromUnixTimeToG` (원본: `util/util.js`의 date-fns 헬퍼)
- [x] `geo.ts` — `transLocation` (proj4 GRS80→WGS84 좌표 변환)
- [x] `random.ts` — `getRandomIndexItem`, `makeRandomNumberIn`, `getRandomNumber`
- [x] `storage.ts` — AsyncStorage 래퍼 (`findStorageItem`, `createStorageItem`, `removeStorageItem`)

### 1-4. 공통 UI 컴포넌트 (`shared/ui/`)

- [x] `Loading.tsx` — 로딩 스피너 (원본: react-spinners)
- [x] `Toast.tsx` — 토스트 메시지 (원본: SeoulOnlyToast)
- [x] `Modal.tsx` — 바텀시트/모달 (원본: ModalPortal — RN에선 react-native-modal 또는 바텀시트)
- [x] `StarRating.tsx` — 별점 표시 (원본: react-stars)
- [x] `Select.tsx` — 드롭다운 선택기 (원본: SelectUi)
- [x] `InfiniteScroll.tsx` — 무한 스크롤 (원본: InfinityScrollUi → FlatList 기반)

---

## 2. `src/core/` — 앱 인프라 & 글로벌 설정

> 프로바이더, 환경변수, **아직 entity가 없는 임시 스토어**만 보관.
> FSD 규칙: 도메인 스토어는 해당 entity의 `model/store.ts`에 위치한다.
> entity가 생성되면 `core/stores/`에서 즉시 `entities/*/model/store.ts`로 이동한다.

### 2-1. 상태 관리 — 도메인 스토어 위치 현황

원본 `LocationStore.jsx`를 도메인별로 분리 후, FSD 규칙에 따라 entity model로 이동:

- [x] ~~`core/stores/useWeatherStore.ts`~~ → **`entities/weather/model/store.ts`로 이동 완료**
- [x] ~~`core/stores/useLocationStore.ts`~~ → **`entities/location/model/store.ts`로 이동 완료**
- [x] `core/stores/useMapStore.ts` — `showPoint`, `overMarker`, `selectedMarker`, `selectedType` (Phase 5에서 `entities/map/model/store.ts`로 이동 예정)
- [x] ~~`core/stores/useRestaurantStore.ts`~~ → **`entities/restaurant/model/store.ts`로 이동 완료** (호환 리다이렉트는 `core/stores/useRestaurantStore.ts`)
- [x] `core/stores/useSurveyStore.ts` — `surveyStep`, `userInfo` (Phase 9에서 `entities/survey/model/store.ts`로 이동 예정)

### 2-2. 프로바이더 (`core/providers/`)

- [x] `AppProvider.tsx` — 글로벌 프로바이더 조합 (SWR은 제거, 필요 시 TanStack Query 검토)

### 2-3. 환경변수 (`core/config/`)

- [x] `env.ts` — `WEATHER_API_KEY`, `GOOGLE_MAPS_API_KEY` 등 타입 안전 접근

---

## 3. `src/entities/` — 도메인 데이터 모델

> 각 도메인의 **데이터 모델(상태 저장소 포함) + API + 순수 표시 UI**.
> FSD 원칙: entity의 `model/` 세그먼트는 데이터 저장소(Zustand store)를 포함할 수 있다.
> entity의 `ui/` 세그먼트는 props만 받아 렌더링하는 순수 컴포넌트여야 한다.

### 3-1. Weather (`entities/weather/`)

| 레이어 | 파일               | 원본 대응                                                         | 상태 |
| ------ | ------------------ | ----------------------------------------------------------------- | ---- |
| api    | `api.ts`           | `service/weather.js` → `getRealTimeWeather`, `getForecastWeather` | [x]  |
| model  | `types.ts`         | OpenWeatherMap 응답 타입 정의                                     | [x]  |
| model  | `store.ts`         | `useWeatherStore` — myLocalWeather, showWeather (core에서 이동)   | [x]  |
| ui     | `WeatherCard.tsx`  | `Weather.jsx`의 날씨 아이콘 + 기온 표시 부분                      | [x]  |
| ui     | `ForecastList.tsx` | `Weather.jsx`의 3일 예보 리스트                                   | [x]  |

### 3-2. Location / District (`entities/location/`)

| 레이어 | 파일                | 원본 대응                                                                          | 상태 |
| ------ | ------------------- | ---------------------------------------------------------------------------------- | ---- |
| api    | `api.ts`            | `service/location.js` → `getAllLocationInfo`, `api/location/route.js` 역지오코딩   | [x]  |
| model  | `types.ts`          | District 타입 (`location`, `lat`, `lon`)                                           | [x]  |
| model  | `data.ts`           | 서울 25개 구 + "현재 위치" 정적 데이터 (`localInfoData`)                           | [x]  |
| model  | `store.ts`          | `useLocationStore` — location, allDistrictInfo, myGeoInfo, persist (core에서 이동) | [x]  |
| ui     | `DistrictBadge.tsx` | 구 이름 뱃지 표시                                                                  | [x]  |

### 3-3. POI — 데이트 장소 (`entities/poi/`)

| 레이어 | 파일          | 원본 대응                                                      | 상태 |
| ------ | ------------- | -------------------------------------------------------------- | ---- |
| model  | `types.ts`    | Park, CulturalSpace, Dodreamgil 타입                           | [x]  |
| model  | `data/`       | `data/park.json`, `culturalSpace.json`, `dodreamgil.json` 번들 | [x]  |
| model  | `store.ts`    | POI 관련 상태 (선택된 POI 타입 등) — 필요 시 생성              | [x]  |
| lib    | `filter.ts`   | `getFilterInfoData()` — 구별 POI 필터링 로직                   | [x]  |
| ui     | `PoiCard.tsx` | 장소 카드 (이름, 이미지, 주소)                                 | [x]  |

### 3-4. Restaurant (`entities/restaurant/`)

| 레이어 | 파일                 | 원본 대응                                                          | 상태 |
| ------ | -------------------- | ------------------------------------------------------------------ | ---- |
| api    | `api/api.ts`         | `api/restaurants/route.js` → Google Places Text Search + Photo URL | [x]  |
| model  | `types.ts`           | Google Places / `Restaurant`, `PlacePhoto`                         | [x]  |
| model  | `store.ts`           | `useRestaurantStore` — recommendData, expansion (core에서 이동)    | [x]  |
| ui     | `RestaurantCard.tsx` | `RecommendFood.jsx`의 맛집 카드                                    | [x]  |

### 3-5. Statistics (`entities/statistics/`)

| 레이어 | 파일               | 원본 대응                                | 상태 |
| ------ | ------------------ | ---------------------------------------- | ---- |
| api    | `api/api.ts`       | `service/chart.js` → `getChartData`      | [x]  |
| model  | `types.ts`         | ChartData, ChartEntry 타입               | [x]  |
| model  | `data.ts`          | `data/chartData.json` 번들 또는 API 호출 | [x]  |
| model  | `store.ts`         | 통계 필터 상태 (성별/연령 선택 등)       | [x]  |
| ui     | `ui/ChartCard.tsx` | 차트 패널 카드 래퍼                      | [x]  |

### 3-6. Survey (`entities/survey/`)

| 레이어 | 파일                    | 원본 대응                                                 | 상태 |
| ------ | ----------------------- | --------------------------------------------------------- | ---- |
| model  | `model/types.ts`        | `LocationStore.jsx`의 `userInfo` 타입                     | [x]  |
| model  | `model/store.ts`        | `surveyStep`, `userInfo` persist 스토어 (`core`에서 이동) | [x]  |
| ui     | `ui/GenderSelector.tsx` | `SurveyModal.jsx` 성별 선택 카드                          | [x]  |
| ui     | `ui/AgeSelector.tsx`    | `SurveyModal.jsx` 연령 선택 UI                            | [x]  |

---

## 4. `src/features/` — 도메인 액션 & 비즈니스 로직

> 사용자 인터랙션에 의해 **상태를 변경**하는 로직 단위.
> FSD 원칙: features는 entities를 조합하여 액션(쓰기/변경)을 수행.
> **Feature UI 규칙:** `ui/` 세그먼트는 props만 받는 순수 컴포넌트. 비즈니스 로직은 같은 feature의 훅(hook)으로 분리.
> **교차 import 금지:** 같은 레이어의 다른 slice를 직접 import하지 않는다. 조합은 상위 레이어(widgets)에서 수행.

### 4-1. 날씨 조회 (`features/weather/`)

| 파일                  | 원본 대응              | 설명                                              | 상태 |
| --------------------- | ---------------------- | ------------------------------------------------- | ---- |
| `useWeather.ts`       | `hooks/useWeather.jsx` | 구 선택 → 날씨 fetch → 스토어 갱신 오케스트레이션 | [x]  |
| `ui/WeatherPanel.tsx` | `Weather.jsx` 전체     | 현재 날씨 + 예보 조합 패널                        | [x]  |

### 4-2. 위치 & 구 선택 (`features/location/`)

| 파일                          | 원본 대응                              | 설명                                        | 상태 |
| ----------------------------- | -------------------------------------- | ------------------------------------------- | ---- |
| `useGeolocation.ts`           | `getUserGeoInfo`                       | GPS 퍼미션 + 역지오코딩 + 서울 판별         | [x]  |
| `useDistrictSelect.ts`        | `DistrictPicker` 내부 로직 분리        | 구 선택 비즈니스 로직 (서울 정책 가드 포함) | [x]  |
| `useLocationConsent.ts`       | `LocationConsentModal` 내부 로직 분리  | 위치 동의 모달 상태 관리 (agree/decline)    | [x]  |
| `ui/DistrictPicker.tsx`       | `SelectFilter.jsx`                     | 구 선택 드롭다운 (**순수 UI — props only**) | [x]  |
| `ui/LocationConsentModal.tsx` | `LocationConsentModal.jsx`             | 위치 동의 모달 (**순수 UI — props only**)   | [x]  |
| `lib/seoulPolicy.ts`          | 서울 한정 로직 (`outside` 스토리지 등) | 서울 외 지역 감지 & 폴백                    | [x]  |

### 4-3. 지도 (`features/map/`)

| 파일                     | 원본 대응                            | 설명                         | 상태 |
| ------------------------ | ------------------------------------ | ---------------------------- | ---- |
| `ui/MapView.tsx`         | `GoogleMapContainer.jsx`             | react-native-maps 기반 지도  | [x]  |
| `ui/MapMarker.tsx`       | 마커 렌더링                          | 커스텀 마커 컴포넌트         | [x]  |
| `ui/MapTypeSelector.tsx` | `SelectShowMapType.jsx`              | 공원/문화/두드림길 필터 토글 | [x]  |
| `lib/markers.ts`         | `getFilterInfoData` 결과 → 마커 변환 | showPoint 가공 로직          | [x]  |

### 4-4. 장소 추천 (`features/recommend/`)

| 파일                    | 원본 대응                   | 설명                                   | 상태 |
| ----------------------- | --------------------------- | -------------------------------------- | ---- |
| `useRecommend.ts`       | `RecommendPlace.jsx` 계산부 | 현재 위치(구) 기반 추천 데이터 생성 훅 | [x]  |
| `useRecommendFood.ts`   | `RecommendFood.jsx`         | Google Places 맛집 API 오케스트레이션  | [x]  |
| `ui/RecommendPlace.tsx` | `RecommendPlace.jsx`        | 추천 장소 카드 리스트                  | [x]  |
| `ui/RecommendFood.tsx`  | `RecommendFood.jsx`         | 맛집 추천 패널 (펼침/접힘)             | [x]  |
| `lib/recommend.ts`      | 랜덤 추천 알고리즘          | `getRandomIndexItem` 기반 추천 로직    | [x]  |

### 4-5. 통계 (`features/statistics/`)

| 파일                 | 원본 대응                           | 설명                                     | 상태 |
| -------------------- | ----------------------------------- | ---------------------------------------- | ---- |
| `useStatistics.ts`   | `ChartComponent.jsx` 상태/가공 로직 | 필터 스토어 구독 + chart-kit 어댑터 변환 | [x]  |
| `ui/ChartFilter.tsx` | `ChartComponent.jsx` Select 필터    | 지역/성별/연령 필터 순수 UI              | [x]  |
| `ui/RadarChart.tsx`  | `ui/RadarChart.jsx`                 | 레이더 대체(LineChart) 렌더              | [x]  |
| `ui/BarChart.tsx`    | `ui/BarChart.jsx`                   | 바 차트 렌더                             | [x]  |

### 4-6. 설문 (`features/survey/`) — 원본 미완성, 앱에서 완성 예정

| 파일                 | 원본 대응                  | 설명                                              | 상태 |
| -------------------- | -------------------------- | ------------------------------------------------- | ---- |
| `useSurvey.ts`       | survey 로직                | 설문 비즈니스 로직 훅 (store 갱신 오케스트레이션) | [x]  |
| `ui/SurveyModal.tsx` | `SurveyModal.jsx` (미연결) | 성별/연령 입력 모달 (**순수 UI — props only**)    | [x]  |

> `useSurveyStore`는 `entities/survey/model/store.ts`로 이동 완료. `core/stores/useSurveyStore.ts`는 호환 리다이렉트만 유지.

---

## 5. `src/widgets/` — 페이지 조합 단위

> features와 entities를 조합하여 하나의 "화면 블록"을 구성.

### 5-1. 홈 화면 위젯

- [x] `HomeSidebar.tsx` — DistrictPicker + WeatherPanel + RecommendPlace 조합 (원본: `Aside.jsx`)
- [x] `HomeMap.tsx` — MapView + MapTypeSelector + RecommendFood + 마커 조합 (원본: `MainSection.jsx` 우측)

### 5-2. 통계 화면 위젯

- [x] `StatisticsView.tsx` — ChartFilter + RadarChart + BarChart 조합 (원본: `statistics/page.jsx`)

### 5-3. 공통 레이아웃 위젯

- [x] `AppHeader.tsx` — 네비게이션 헤더 (원본: `Header.jsx` + `NavComponent.jsx`)
- [x] `RootOverlays.tsx` — 위치 동의 모달 + 설문 모달 + 서울 한정 토스트 (원본: `layout.jsx` 전역 오버레이)
- [ ] `AppFooter.tsx` — 푸터 정보 (원본: `Footer.jsx`, 모바일에선 간소화)

---

## 6. `app/` — 라우팅 (expo-router)

> app 폴더는 **라우팅 진입점**만 담당. 실제 UI/로직은 src에서 import.

| 라우트        | 파일                 | 렌더링 위젯                           | 원본 대응                 | 상태 |
| ------------- | -------------------- | ------------------------------------- | ------------------------- | ---- |
| `/`           | `app/index.tsx`      | `HomeSidebar` + `HomeMap`             | `app/page.jsx`            | [x]  |
| `/statistics` | `app/statistics.tsx` | `StatisticsView`                      | `app/statistics/page.jsx` | [x]  |
| `_layout`     | `app/_layout.tsx`    | `RootOverlays` + `Stack` + 글로벌 CSS | `app/layout.jsx`          | [x]  |

---

## 7. API 프록시 마이그레이션

> 웹에서 Next.js Route Handler로 처리하던 서버 프록시를 앱에서 어떻게 대체할지.

| 원본 API Route          | 역할                         | 앱 전략                                                 | 상태 |
| ----------------------- | ---------------------------- | ------------------------------------------------------- | ---- |
| `POST /api/weather`     | OpenWeatherMap 프록시        | 앱에서 직접 호출 (API 키는 env로 관리) 또는 별도 백엔드 | [ ]  |
| `POST /api/location`    | Google Geocoding 프록시      | expo-location 역지오코딩 활용 또는 직접 호출            | [ ]  |
| `POST /api/restaurants` | Google Places + Photo 프록시 | 앱에서 직접 Google Places API 호출                      | [ ]  |

---

## 8. 패키지 교체 매핑

| 웹 (Next.js)                   | 앱 (React Native)                                 | 비고                  |
| ------------------------------ | ------------------------------------------------- | --------------------- |
| `@react-google-maps/api`       | `react-native-maps`                               | Google Maps → MapView |
| `react-chartjs-2` + `chart.js` | `victory-native` 또는 `react-native-chart-kit`    | 차트 라이브러리 교체  |
| `react-spinners`               | `react-native` ActivityIndicator 또는 Lottie      | 로딩 UI               |
| `react-stars`                  | `react-native` 커스텀 또는 `react-native-ratings` | 별점                  |
| `qrcode.react`                 | `react-native-qrcode-svg`                         | QR 코드               |
| `react-icons`                  | `@expo/vector-icons`                              | 아이콘                |
| `proj4`                        | `proj4` (그대로 사용 가능)                        | 좌표 변환             |
| `date-fns`                     | `date-fns` (그대로 사용 가능)                     | 날짜 유틸             |
| `zustand`                      | `zustand` (그대로 사용 가능)                      | 상태 관리             |
| `localStorage`                 | `@react-native-async-storage/async-storage`       | 로컬 저장소           |
| `next/dynamic` (SSR 회피)      | 불필요 (RN은 SSR 없음)                            | 제거                  |
| `SWRConfig`                    | 제거 (미사용)                                     | 원본에서도 미활용     |
| Browser Geolocation API        | `expo-location`                                   | GPS 퍼미션 포함       |

---

## 9. 마이그레이션 우선순위 (권장 순서)

> 의존성이 적은 하위 레이어부터 올라가는 Bottom-Up 전략.

| 순서        | 대상                                                 | 설명                                                                                                                        |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1** | `shared/` + `core/`                                  | 타입, 유틸, API 클라이언트, 스토어 분리 — 모든 것의 기반                                                                    |
| **Phase 2** | `entities/location` + `entities/weather`             | 핵심 데이터 모델 + 읽기 API — 가장 많이 의존되는 도메인                                                                     |
| **Phase 3** | `features/location` + `features/weather`             | GPS + 구 선택 + 날씨 조회 — 홈 화면의 좌측 패널 완성                                                                        |
| **Phase 4** | `entities/poi` + `features/recommend`                | 정적 JSON 데이터 + 장소 추천 로직                                                                                           |
| **Phase 5** | `entities/map` + `features/map`                      | react-native-maps 지도 + 마커 표시. `useMapStore`를 `entities/map/model/store.ts`로 이동                                    |
| **Phase 6** | `entities/restaurant` + `features/recommend` (맛집)  | ✅ Google Places 연동·`useRecommendFood`·`RestaurantCard` 완료. `useRestaurantStore` → `entities/restaurant/model/store.ts` |
| **Phase 7** | `widgets/` + `app/` 라우팅                           | ✅ 위젯 조합·`expo-router` 연결. feature 간 교차 의존성은 widgets에서 조립으로 해소                                         |
| **Phase 8** | `entities/statistics` + `features/statistics` + 차트 | 통계 화면 (별도 라이브러리 교체 필요)                                                                                       |
| **Phase 9** | `entities/survey` + `features/survey`                | ✅ 설문 기능 완성. `useSurveyStore`를 `entities/survey/model/store.ts`로 이동하고 `RootOverlays`에 자동 트리거 연결         |

---

## 10. 현재 진행 상태 요약

| 단계                                  | 상태                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Phase 0: 프로젝트 세팅                | ✅ 완료                                                                          |
| Phase 1: shared + core                | ✅ 완료                                                                          |
| Phase 2: entities (location, weather) | ✅ 완료                                                                          |
| Phase 3: features (location, weather) | ✅ 완료                                                                          |
| Phase 4: entities/poi + recommend     | ✅ 완료                                                                          |
| Phase 5: features/map                 | ✅ 완료 (useMapStore entities/map/model/store.ts 이동 포함)                      |
| Phase 6: restaurant                   | ✅ 완료 (useRestaurantStore → entities/restaurant, Places API, useRecommendFood) |
| Phase 7: widgets + routing            | ✅ 완료 (HomeSidebar/HomeMap/AppHeader/RootOverlays, app 연결)                   |
| Phase 8: statistics + charts          | ✅ 완료                                                                          |
| Phase 9: survey 완성                  | ✅ 완료 (entities/survey + features/survey + RootOverlays 자동 노출)             |

### 최근 안정화 메모

- 지도 마커 깜빡임(Expo Go/Android) RCA 완료:
  - `region` write-back 차단/epsilon, `provider="google"`, `region useMemo`는 유의미한 개선 없음.
  - 최종 해법은 `features/map/ui/MapMarker.tsx`에서 `tracksViewChanges`를
    **초기/상태 변경 시만 잠깐 true -> 250ms 후 false**로 제어하는 방식.
