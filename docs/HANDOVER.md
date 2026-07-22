# 인수인계 (2026-07-22 세션 종료 기준)

> 다음 세션이 이 문서만 읽고 이어서 작업할 수 있도록 정리한 스냅샷.
> 상세 배경·설계는 `docs/research.md`, 아키텍처 규칙은 `docs/AI_CONVENTION.md` 참조.
>
> **현재 메인 작업은 웹(portfolio-next) i18n 이식.** 아래 "웹 i18n 이식" 섹션이 최신 상태이며,
> RN 관련 섹션(맛집 언어 파라미터 / 지도 카메라 / 두드림길 등)은 2026-07-14 기준 그대로 유지한다.

---

## 0. 웹(portfolio-next) i18n 이식 — 현재 진행 중 (2026-07-22)

RN(portfolio-rn)에서 완성한 한/영 i18n을 웹(`../portfolio-next`, 원격 `github.com/byeonsejun/date`)에
이식하는 다중 세션 작업. **작업 브랜치 `feat/web-i18n` (아직 main 미머지).**

### 진행 방식 (중요)

- **브랜치 + PR**: 웹은 `.vercel`/`vercel.json` 없이 **Vercel Git 연동 자동배포 = main push가 곧 프로덕션**.
  그래서 RN처럼 main 직행하지 않고 `feat/web-i18n` 브랜치에 쌓고, Vercel 프리뷰 검증 후 main 머지 예정.
- **검증은 사용자가 로컬 `npm run dev`** 로 수행. **지도는 Vercel 프리뷰에서 안 뜸** — Google Maps JS
  API 키 리퍼러가 프로덕션 도메인만 등록돼 있어 프리뷰 URL에서 지도가 로드되지 않는다. 지도 관련
  검증은 localhost 로컬에서만 가능.
- 커밋은 이슈/그룹당 단독, 커밋 전 lint+test+build 통과.

### 완료된 단계 (커밋은 모두 `feat/web-i18n`)

| 단계 | 내용 | 핵심 커밋 |
| --- | --- | --- |
| Task A | 두드림길 필터 first-match 버그 픽스(콤마 다중 구 그룹 전량 수집 + dedupe) — RN cb541ad 이식 | `e9819c2` |
| 0단계 | POI JSON에 영어 번역 필드(`_en`) 이식(RN 번역 데이터 복사) | `fbaf35e` |
| 1단계 | i18n 인프라: i18next + react-i18next, `useLanguageStore`(zustand persist), `I18nProvider`, `AppTitle`, `LanguageToggle`, KO 기본 | `7600a3d`, `9fa0a50`(브라우저 감지 제거) |
| 2단계 | 정적 UI 카피 t() 교체 — 4그룹 + 레이아웃 픽스 3건 | 아래 |

**2단계 상세** (그룹별):
- 그룹1 모달/토스트: `2392ee9`
- 그룹2 추천/맛집: `4537ad1` (+ 레이아웃 픽스 `5538f81` 맛집 헤더 제목-닫기 겹침)
- 그룹3 날씨: `b13288e` (+ 요일 탭 EN 레이아웃: `ff2cefb` 가로 스크롤 시도 → `fb5f7ca` 라벨 축소+text-sm로 확정. RN 라벨 파리티는 이 레포 `fa9df76`)
- 그룹4 지도 UI: `51b479d` (+ 레이아웃 픽스 `285bd0c` 맛집 리스트 EN 마지막 항목 잘림 — flex-col)

→ **2단계까지 로컬 KO/EN 검증 완료(2026-07-22)**: 맛집 리스트 잘림 해결, 모든 그룹 KO/EN 정상.

### 확정 결정들

- **metadata 한국어 유지**(ADR 0005): 서버 컴포넌트 metadata/Header h1은 react-i18next 훅을 못 써서
  한국어 고정으로 확정.
- **최초 방문 KO 기본**: 브라우저 언어 감지 제거(`9fa0a50`). 이후 토글 선택은 localStorage 유지.
- **요일 탭 EN**: "Day after tomorrow"→"In 2 days", "In 3 days" 유지 + 탭 폰트 `text-base`→`text-sm`.
  전역 폰트가 **Jua(넓은 폰트)** 라 288px 사이드바에 4개가 안 들어가 라벨 축소+폰트 축소로 확정(가로
  스크롤 방식은 폐기). 실측 근거로 결정.
- **값 겸용 문자열은 2단계 SKIP → 3단계行**: 카테고리(전체/문화공간/공원/두드림길), 구 이름,
  "현재 위치", 추천·인기 등은 로직 비교·필터 키·데이터 타입으로도 쓰여 한국어 정본을 유지하고
  표시만 매핑해야 한다. 2단계에서 건드리지 않았고 3단계에서 값→라벨 매핑으로 처리.

### 다음 할 일 (웹 i18n, 우선순위 순)

1. **3단계 — 값→라벨 매핑**: RN의 `getCategoryLabel`/`getDistrictLabel`/`getPoiDisplayTitle` 이식.
   값(한국어 정본)은 그대로 두고 표시 시점에만 언어별 라벨로 변환. 대상: 카테고리 버튼, 구 선택,
   POI 제목(`_en` 활용), "현재 위치".
2. **4단계 — 프론트 API lang 전달**: weather/restaurants fetch에 `&lang=` 붙이기(BFF는 이미 lang
   수용, 프론트가 미전달). weather.ts 2곳·RecommendFood 1곳. 날씨 description(온흐림 등) API 원문
   변환도 여기서 처리.
3. **main 머지**: 3·4단계 완료·프리뷰 검증 후 `feat/web-i18n` → main PR 머지.

### 환경 메모

- git 2.36→2.55 업그레이드로 lint-staged 한글 경로(`날씨데이트`) 훅이 정상화됨 — 더는 prettier
  discard 우회가 필요 없다.

---

## 1. 완료된 작업 (RN, 2026-07-14 기준)

### 맛집(Places) 언어 파라미터

- **BFF(portfolio-next 레포)**: `7489827` feat: 맛집 API에 lang 파라미터 추가 (+ `b3bdbe0` prettier)
- **RN(이 레포)**: `3ac279c` feat: 맛집 API에 언어 파라미터 전달
- 재요청 캐시 키에 `language` 포함(`useRecommendFood`의 `${language}:${location}:${좌표}` 키) —
  구는 그대로 두고 언어만 토글해도 재요청된다.

### UI 오버플로우 픽스 3건 (EN 장문 라벨로 드러난 것들)

| 커밋 | 내용 |
| --- | --- |
| `043c5d8` | 요일 탭(Today/Tomorrow/…) 가로 스크롤 적용 — WeatherPanel, ChartFilter식 `contentContainerStyle` + `flexGrow:1` 관례 |
| `16a419d` | 맛집 패널 헤더 제목 `flex-1` + Close 버튼 `shrink-0` — **같은 패턴 예방 수정 2곳 포함**: MapPoiDetailCard 현재위치 분기, RecommendPlace 헤더 |
| `a4d4c41` | 카테고리 탭(MapTypeSelector) 라벨 중앙 정렬 (`items-center justify-center` + `text-center`) |

### 지도 카메라 간헐 버그 — 3중 원인 순차 해결 (실기기 검증 통과, 2026-07-14)

증상: 사이드바 "오늘의 추천 데이트 장소" 카드 탭 시 지도가 간헐적으로 엉뚱한 곳을 비춤.
로그 기반 진단으로 서로 다른 원인 3개를 확정·수정:

1. `4e678ae` — **늦은 onRegionChangeComplete 에코 덮어쓰기**: programmatic region 잠금
   타임스탬프를 useMapController의 ref → map store(`regionProgrammaticAt`)로 이동,
   포커스 경로(사이드바/맛집 사진 탭)도 잠금에 참여.
2. `b78fee0` — **동적 mapPadding 카메라 경합**: 카드 오픈 시 mapPadding.bottom 0→220
   변경이 region prop과 같은 프레임에 겹치면 SDK가 카메라를 남쪽 경계 클램프값
   (lat 37.480636 고정)으로 밀어냄. 동적 패딩 제거, 미사용이던
   `computePoiMarkerRegionFocus`로 이동 시점 위도 사전 보정 복원.
   지도 마커 직접 탭에도 동일 적용(이 경로는 카메라 이동이 새로 추가됨).
3. `f09a2d8` — **RN deepDiffer 값비교로 카메라 명령 스킵**: store와 동일 값의
   programmatic 재설정은 네이티브 명령이 발행되지 않아(같은 카드 재탭 실패 모드),
   `setRegionProgrammatic`에서 동일값 감지 시 위도 +1e-7 오프셋으로 우회.
   **임시방편** — 근본 해결은 아래 (d) 제안.

진단용 임시 로그 커밋(`093d598`, `aecfe84`)은 검증 통과 후 revert 완료
(`fc02997`, `bfe67a1`). revert 후 tsc + `expo export`(Android 번들) 정상 확인.
이전 세션 잔재 빈 파일 2개(`src/service/location.ts`, `src/stores/useLocationStore.ts`,
둘 다 0바이트 untracked)는 삭제로 정리(추적 이력이 없어 커밋 없음).

---

## 2. 기록됨 (미착수, docs/research.md 참조)

- **(d) 지도 카메라 아키텍처 개선**: controlled `region` prop → `animateToRegion` 명령형
  전환. 오늘 버그 3개가 전부 controlled region 관리에서 나온 것이 배경.
  설계 요지({region, seq} 카메라 요청 + effect에서 ref 실행, 이벤트 전부 PASS로 store는
  카메라 거울, 잠금·+1e-7 우회 삭제), 변경 반경 ~4파일, 검증 항목까지 research.md에 기록.
  **"설계안 검토 → 단계 적용" 프로세스로 진행하기로 결정됨.**
- **두드림길 필터 first-match 버그**: `filterDodreamgilByDistrict`의
  `groups.find(includes)`가 첫 그룹만 반환 → 12개 그룹 388건 미노출(종로구 111건 등).
  사이드바·지도가 같은 필터를 쓰므로 상호 불일치는 없음(카메라 버그와 무관 판정 완료).
- **데이터 정합성 이슈**: park.json 비자치구 그룹 3건(과천시/기타/강북구 등),
  culturalSpace.json 한국미술관 좌표 오타(`37.5718…~2` → NaN 탈락).

---

## 3. 다음 할 일 (우선순위 순)

> **현재 메인 작업은 웹 i18n 이식(위 "0. 웹 i18n 이식" 섹션 참조).** 아래 목록은 RN 쪽 잔여 과제.

1. **실기기 전체 훑기** — EN 모드로 남은 화면들(통계, 설문, 설정 등) 레이아웃/번역 확인.
2. **웹(portfolio-next 레포) UI 다국어** — ✅ 진행 중. 2단계까지 완료, 3·4단계 남음. → 섹션 0.
3. **카메라 아키텍처 개선 (d)** — research.md 설계안 검토부터.
4. **두드림길 필터 수정** — research.md의 설계(그룹 분리 인덱싱 or `.filter()` 수집,
   중복 노출 정책 결정) 기준으로.
5. **일/중 언어 확장** — i18n 키 구조는 준비됨. POI titleEn처럼 데이터 필드 확장 필요.

---

## 4. 알려진 트레이드오프 (버그 아님, 재보고 방지용)

- **카드 열린 채 줌하면 마커-카드 배치 유지 안 됨** — 사전 보정 방식(b78fee0)의 본질적
  한계. 동적 mapPadding으로 되돌리면 카메라 경합이 재발하므로 되돌리지 말 것.
- **GPS("현재 위치") 모드에서 언어 토글 시 날씨가 즉시 갱신되지 않음** — 의도된 동작.
- **Places 소규모 업체는 영어 상호가 없을 수 있음** — Google Places 데이터 한계.

---

## 5. 작업 원칙 (기존 유지)

- `docs/AI_CONVENTION.md`의 FSD 절대 규칙 5개 + 코딩 컨벤션 준수.
- **expo 패키지 임의 업데이트 금지** — 패치 업데이트가 babel-preset-expo 호이스팅을
  깨서 롤백한 이력 있음. 패키지 추가 설치도 요청 없이는 금지.
- **버그는 진단 → 방향 승인 → 수정** 순서. 추측 수정 금지, 필요하면 임시 로그로
  실제 이벤트 순서를 관찰(로그는 반드시 별도 debug 커밋 + 종료 후 revert).
- **커밋은 이슈당 단독**, 커밋 전 `npx tsc --noEmit` 통과 필수. 별건 이슈(두드림길 등)를
  같은 커밋에 섞지 않는다.
- **실기기(Expo Go) 검증은 사용자 담당** — 수정 후 재현 조건과 확인 포인트를 함께 전달할 것.
- 지도 카메라 코어는 회귀 위험이 크므로 하루에 다중 구조 변경을 피하고, 구조 변경은
  설계안 검토 후 단계 적용.
