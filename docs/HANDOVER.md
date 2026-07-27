# 인수인계 (2026-07-28 세션 종료 기준)

> 다음 세션이 이 문서만 읽고 이어서 작업할 수 있도록 정리한 스냅샷.
> 상세 배경·설계는 `docs/research.md`, 아키텍처 규칙은 `docs/AI_CONVENTION.md` 참조.
>
> **최신 작업은 일본어(ja) 확장 — 골격 완료(아래 섹션 0).** 한/영 웹 i18n(구 섹션, 이제 "0-B")은
> 완료·배포된 상태 그대로 참고용 보존. RN 관련 섹션(맛집 언어 파라미터 / 지도 카메라 / 두드림길
> 등)은 2026-07-14 기준 그대로 유지한다.

---

## 0. 일본어(ja) 확장 — 🦴 골격 완료·작동 상태 (2026-07-27~28)

한/영 인프라 위에 **일본어를 추가**한 작업. RN·웹 양쪽 + BFF까지 **"골격"이 전부 완료·검증**됐고,
**대량 데이터(POI 이름 `_ja` 2,608건)만 남았다**(현재 en 폴백으로 동작). 지금 상태로도 **일본어
사용자가 앱/웹을 쓰면 UI·날씨·맛집·카테고리·구 이름이 전부 일본어**로 나오고, **POI 이름만 영어
폴백**이다(깨지지 않음). = **일본어는 POI 이름 제외 전부 완성.**

> **2026-07-28 추가분**: ① 구 이름 `location_ja` 26개(한자 표기) RN·웹 양쪽 완료 → 구 이름도 일본어화
> 완료(아래 표). ② 웹 시간별 예보 자정 라벨 JA `午前0時`(4자) 오버플로우 수정 — `正午`와 짝인 2자
> 네이티브 표기 `深夜`로 축소(`cdbc222`). `weather.midnight`은 12AM/0:00 **예보 슬롯**(자정)이며
> 별도 하드코딩 "NOW" 셀과 다름 — '현재 시각(今)'이 아니라 KO `자정`/EN `Midnight`과 동일 의미.

### 완료 항목 + 커밋

**RN (`portfolio-rn`, main)**
| 항목 | 커밋 |
| --- | --- |
| CJK 표기 기준 문서(`docs/i18n-cjk-naming.md`) 신규 | `ed40e3f` |
| ja 인프라 등록(`SUPPORTED_LANGUAGES`+resources) + `locales/ja.json`(52키) + 토글 JA | `8ea99fa` |
| 라벨 헬퍼·타입 ja 골격 배선(`titleJa`/`location_ja`, `getDistrictLabel`/`getPoiDisplayTitle` ja 분기, filter/markers 배선, PoiCard 두드림길 상세 숨김 일반화) | `870301f` |
| **버그픽스+리팩터**: 지원 언어를 `LANGUAGES` 단일 소스로 통합(코드+라벨+a11y) | `27d6dd3` |
| 구 이름 `location_ja` 26개 추가(한자 표기, `entities/location` 데이터) | `3778b1b` |

**웹 (`portfolio-next`)**
| 항목 | 커밋 | 위치 |
| --- | --- | --- |
| ja 인프라 등록 + `locales/ja.json`(75키) + 토글 JA + label ja 분기 | `90d1ba7` | `feat/web-i18n-ja` |
| **Noto Sans JP 폰트** 전환(`html[lang='ja']`, I18nProvider가 `<html lang>` 반영) | `2846166` | `feat/web-i18n-ja` |
| BFF ja 통과(스키마+매핑) *(→ 아래 main에 별도 반영됨)* | `28d444b` | `feat/web-i18n-ja` |
| 지원 언어 `LANGUAGES` 단일 소스 통합(이번 JA 미표시 버그의 근본 수정) | `3a64a11` | `feat/web-i18n-ja` |
| 구 이름 `location_ja` 26개 추가(한자 표기, `service/location.ts`) | `5cf8b15` | `feat/web-i18n-ja` |
| **자정 라벨 오버플로우 픽스** JA `午前0時`(4자)→`深夜`(2자, `正午`와 폭·등록 일치) | `cdbc222` | `feat/web-i18n-ja` |
| **BFF `lang=ja` 허용 — 프로덕션 배포됨** (스키마 ja + `OPENWEATHER_LANG_BY_APP_LANG` ja:'ja') | `5833063` | **main (배포 완료)** |

### ⚠️ "SUPPORTED_LANGUAGES 하드코딩" 버그 — 발견·수정

웹에서 JA 토글이 안 뜬 원인: `LanguageToggle`은 이미 `SUPPORTED_LANGUAGES.map()`이었지만
**config의 `SUPPORTED_LANGUAGES` 배열 자체가 `['ko','en']`** 이었고, 웹은 별도 `LABELS` 맵,
RN은 별도 `LANGUAGE_ACCESSIBILITY_LABEL` 맵에 언어가 하드코딩돼 **추가 시 누락되기 쉬웠다**.
→ 양쪽 모두 `LANGUAGES = [{code,label,(a11yLabel)}]` **단일 소스**로 통합, `SUPPORTED_LANGUAGES`·
`SupportedLanguage` 타입·토글을 전부 여기서 파생(RN `27d6dd3` / 웹 `3a64a11`). 이후 언어 추가 시
이 배열 한 곳 + `locales/xx.json` + resources만 손대면 된다.

### 폰트 (실측 결론)

- **RN**: 시스템 폰트라 일본어 정상(커스텀 폰트 로드 0건). 조치 불필요.
- **웹**: 전역 Jua는 한국어 디스플레이 폰트로 **区/園/々 등 일본어 글리프 상당수 미포함**
  (`.next` unicode-range 실측: `ja.json` 158자 중 48자, 구/시설 한자 71자 중 43자 미커버).
  → `html[lang='ja']`일 때 본문을 **Noto Sans JP**로 통째 전환(`next/font`, `preload:false`).
  로컬 확인 결과 **폰트 완벽**(사용자 확인).

### API (배포+검증 완료)

- RN은 `EXPO_PUBLIC_API_BASE_URL=https://date-eight-navy.vercel.app`(프로덕션 BFF) 호출.
  BFF가 `z.enum(['ko','en'])`라 `lang=ja`를 **400 거부** → RN JA에서 날씨/맛집 에러였음.
- **원인 구조**: 웹 로컬은 상대경로 `/api/*`로 자기 로컬 dev(ja 스키마 있는 브랜치)를 쳐서 안 터졌고,
  RN은 절대경로 프로덕션(main, ja 없음)이라 터졌다. = 배포본 차이.
- **수정·배포**: BFF 스키마 2파일에 ja 추가(`external-api.ts` Weather/RestaurantLangSchema,
  `weather/route.ts` `OPENWEATHER_LANG_BY_APP_LANG` ja:'ja')를 **main에 커밋·push(`5833063`) → Vercel
  프로덕션 자동배포**. OpenWeather ja는 특수매핑 아님(ko만 `kr` 예외), Places는 `language=ja` 그대로.
- **프로덕션 curl 검증 통과**: weather ja `曇りがち`, ko `튼구름`(kr매핑), en `broken clouds`,
  restaurants ja 200(5건), **weather lang=fr → 여전히 400**(잘못된 값 거부 유지).

### 표기 기준 문서 — `docs/i18n-cjk-naming.md` (RN 레포)

대량 번역(2,608건)+향후 중국어(`_zh`)의 일관성 기준. 요지:
- **구(자치구)**: 정식 한자 표기 — `중구→中区`, `강남구→江南区`, `종로구→鍾路区`(25구 표 수록).
- **시설명**: 「고유명사부 + 한자어 접미사」 → 접미사는 한자 고정(공원→公園, 도서관→図書館,
  미술관→美術館, 박물관→博物館 …대응표), 고유명사부는 한자 환원 우선 → 순우리말은 가타카나 음차.
- **두드림길**(브랜드) → `トゥドゥリムキル`. **폴백 정책**: `ja → en → ko`(일본 사용자에겐 한국어보다
  영어가 유용). 애매 케이스는 문서 §5 결정 로그에 누적.

### 남은 일 (별도 세션 예정)

1. **POI 이름 `_ja` 대량 번역 2,608건** *(유일한 대형 잔여 작업 — 별도 세션에서 CC 직접)* —
   `park.json` `p_park_ja` 132, `culturalSpace.json` `FAC_NAME_ja` 1,033, `dodreamgil.json`
   `CPI_NAME_ja` 1,443. **골격 배선은 끝나 있어 데이터만 채우면 자동 노출**(현재 en 폴백).
   `docs/i18n-cjk-naming.md` 표기 기준대로, 파일·구 단위 배치로 나눠 진행.
2. ~~구 이름 `location_ja` 26개~~ ✅ **완료**(RN `3778b1b` / 웹 `5cf8b15`, 2026-07-28).
3. **웹 JA UI 배포**: `feat/web-i18n-ja` 브랜치(토글·ja.json·폰트·구이름·자정라벨)를 1차 웹 때처럼
   PR→프리뷰→main 머지. ⚠️ 브랜치의 `28d444b`(BFF ja)는 이미 main `5833063`으로 반영됨 →
   **머지 전 리베이스**로 중복 커밋 정리.
4. **`translatorToKor`(웹) ja 처리 확인**: en처럼 매칭 실패 시 원문 통과(=일본어 그대로) 예상. 웹 재테스트 시 검증.
5. **중국어(`_zh`) 확장**은 POI `_ja` 이후. `LANGUAGES` 단일 소스 구조라 토글·타입은 배열 한 줄
   추가로 확장되고, 나머지는 `locales/zh.json` + 데이터 `_zh` + 폰트만. 표기 기준 문서 동형 적용.

### 확정 결정

- **두드림길 `detailCourse`(경유지 상세, 한국어 원문)는 ja에서도 숨김** — en과 동일(`PoiCard` 조건을
  `language==='en'` → `!== 'ko'`로 일반화). 번역 없는 한국어 노출 방지.
- **ja 폴백은 en 우선**(`ja → en → ko`). 데이터 `_ja` 미완 구간은 영어로 표시.

---

## 0-B. 웹(portfolio-next) 한/영 i18n 이식 — ✅✅ 완료·main 머지·프로덕션 배포 확인 (2026-07-23, 참고용 보존)

RN(portfolio-rn)에서 완성한 한/영 i18n을 웹(`../portfolio-next`, 원격 `github.com/byeonsejun/date`)에
이식한 다중 세션 작업. **완료 종료됨.**

- **main 머지 완료**: PR **#1** (`feat/web-i18n` → `main`) merge 커밋 `5307e1b` (2026-07-23). CI(verify:
  lint+test+build) + Vercel 프리뷰 통과 후 머지.
- **프로덕션 배포 확인**: main push로 Vercel 프로덕션 자동배포 성공. `date-eight-navy.vercel.app`에서
  검증 — **지도 정상 렌더(프리뷰에선 안 뜨던 것; 프로덕션 URL이 Maps 키 리퍼러에 등록됨)**,
  KO/EN 토글, 구 선택, 날씨 API(중구 EN "light rain") 모두 정상, 콘솔 앱에러 0.
- (아래 진행 이력은 참고용 보존)

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
| 3단계 | 값 겸용 문자열 값→라벨 매핑 (표시만 변환, 값은 KO 유지) | `97a0b3a` |
| 4단계 | 프론트 API `&lang=` 전달 — 날씨/맛집 | `fbb14bd` |
| 잔여 | 하드코딩 한국어 alert i18n (`location.dataRequestError`) | `da12c6b` |
| 레이아웃 | EN 텍스트 길이로 드러난 원작 하드코딩 치수 파열 6건 픽스 | 아래 |
| QA 갭 | 추천 패널 EN 미번역 3건(POI 제목·타입·추천/인기 탭) — 3단계 RN 패리티 누락분 | `71e9a24` |

**2단계 상세** (그룹별):
- 그룹1 모달/토스트: `2392ee9`
- 그룹2 추천/맛집: `4537ad1` (+ 레이아웃 픽스 `5538f81` 맛집 헤더 제목-닫기 겹침)
- 그룹3 날씨: `b13288e` (+ 요일 탭 EN 레이아웃: `ff2cefb` 가로 스크롤 시도 → `fb5f7ca` 라벨 축소+text-sm로 확정. RN 라벨 파리티는 이 레포 `fa9df76`)
- 그룹4 지도 UI: `51b479d` (+ 레이아웃 픽스 `285bd0c` 맛집 리스트 EN 마지막 항목 잘림 — flex-col)

**3단계 상세** (`97a0b3a`): RN `entities/*/lib/label.ts` 3헬퍼를 웹 `src/utils/label.ts`로 이식 —
`getCategoryLabel`(카테고리 switch→`map.category.*`), `getDistrictLabel`(`location_en` 폴백),
`getPoiDisplayTitle`(`titleEn` 폴백). `i18n.getFixedT`로 훅 밖(마커 title prop)에서도 호출.
데이터 배선: `service/location.ts` `localInfoData` 26개 구에 `location_en` 추가(RN `data.ts` 값),
`getFilterInfoData` 표시객체에 `titleEn` 실어나름(`FAC_NAME_en`/`p_park_en`/`CPI_NAME_en`),
`useWeather` 반환에 `allDistrictInfo` 추가(Weather 구 lookup용). 적용 지점(값은 KO 유지):
카테고리 버튼·구 드롭다운(`value`는 KO)·날씨 패널 구명·지도 마커 title/호버 툴팁·상세카드 POI 제목·
현재위치(`map.currentLocationTitle`).

→ **3단계까지 로컬 KO/EN 검증 완료(2026-07-22)**: 2단계(맛집 리스트 잘림 해결) + 3단계(카테고리/구/
POI 제목/현재위치 EN 전환, 필터·구 선택·마커 클릭 값 무손상) 모두 정상. 화면에서 한국어 사라짐 확인.

**4단계 상세** (`fbb14bd`): 프론트가 BFF에 `&lang=` 미전달하던 것 배선 —
- `service/weather.ts` fetch **2곳**에 `&lang=${language}` 추가.
- `useWeather` 재요청 트리거: deps에 `language` 추가(언어 토글 시 날씨 재요청).
- `RecommendFood`: 캐시 키를 `${language}:${location}`으로(언어만 토글해도 재요청).
- `translatorToKor`(온흐림→흐림 등)는 **KO 응답 전용 보정**이라 그대로 유지 — EN 응답엔 해당
  한국어 원문이 없어 no-op(무해). API description 자체는 `&lang=`로 언어별 원문이 옴.

**잔여 alert i18n** (`da12c6b`): `service/weather.ts` 위치 조회 실패 alert의 하드코딩 한국어를
`i18n.getFixedT` 패턴(`utils/label.ts`와 동일, 훅 밖 서비스 모듈용)으로 `location.dataRequestError`
키 처리. 전체 스캔 결과 다른 노출용 하드코딩 한국어 없음(값 겸용 정본·서버 metadata·dead code 제외).

### 레이아웃 픽스 6건 — 공통 원인: "한국어 기준 하드코딩 치수 → 영어 길이에서 파열"

원작 웹은 한국어 텍스트 길이에 맞춘 **고정 높이/폭·flex 미제약**이 곳곳에 있어, EN(더 긴 로마자
구명·장문 라벨)이 들어오자 겹침·잘림·오버플로우로 드러났다. **일/중 확장 시에도 같은 계열 문제가
재발할 수 있으니** 새 언어 붙이기 전 이 목록을 참고할 것. (RN은 대응이 끝나 있어 대조 기준으로 사용)

| 커밋 | 증상(EN에서) | 수정 |
| --- | --- | --- |
| `5538f81` | 맛집 패널 헤더 제목-닫기 버튼 겹침 | 제목 `flex-1` + 닫기 `shrink-0` |
| `fb5f7ca` | 요일 탭 4개가 288px 사이드바 오버플로우 | 라벨 축소("In 2 days")+`text-sm` (Jua 폰트 폭 실측 근거; 가로 스크롤안 `ff2cefb` 폐기) |
| `285bd0c` | 맛집 리스트 EN 마지막 항목 잘림 | 스크롤 영역 `flex-col`(+`flex-1 min-h-0`)로 정확화 |
| `28dbcc4` | 날씨 카드 고정높이(`h-[280px]`)로 2줄 구명 시 탭·예보 잘림 | 카드 `min-h`+`shrink-0`+오버레이 stretch, **aside를 스크롤 컨테이너화**(`lg:overflow-y-auto`+`lg:[&>*]:shrink-0`) = **RN `HomeSidebar` ScrollView 패리티** |
| `a5b82d0`→`d4cfe0d` | 추천 패널 고정높이 잘림 → (min-h 과다로) 불필요 스크롤 | `h-[410px]`→`min-h-[200px]`(내용 구동, 실제 넘칠 때만 스크롤, 빈 상태 floor) |
| `a9573f5`→`d039aa1` | 긴 구명 2줄 시 온도 잘림 → (shrink 방지 후) 구명 글리프↔온도 겹침 | 구명 `flex-1 min-w-0`+온도 `shrink-0`, 구명 영역 `overflow-hidden`+`break-words`(글리프 침범 원천 차단, Range 박스 교차 실측 overlap=0) |

> 검증 방식: 레이아웃 픽스는 dev 서버 + Playwright(headless)로 **박스 좌표/교차·scrollHeight 실측**으로
> 증명(구 이름 오버라이드, 뷰포트 높이 스윕 등). "폭 불변"류 반쪽 측정으로 겹침을 놓친 이력이 있어,
> 이후 "구조적으로 문제 불가"한 방식 + 실측 증명을 기준으로 잡음.

### 머지 전 최종 QA (2026-07-23, Playwright headless + 로컬)

전수 점검 통과: 콘솔 앱에러/하이드레이션 0(Google Maps/WebGL 헤드리스 노이즈만), 언어 persist,
요일 탭·카테고리 4종·구 26개·날씨 desc(구 선택 시, `overcast clouds`·`lang=en` 확인)·동의 모달 EN,
기능 동작(카테고리 필터·구 선택·추천/인기·요일 탭 값 무손상). **QA 중 발견한 추천 패널 미번역 3건은
`71e9a24`로 수정 후 재검증 통과.** EN 잔존 한국어는 주소·두드림길 코스명(데이터 한계)뿐 —
`현재 위치` 모드 날씨 미갱신은 문서화된 의도.
자동 미검증(헤드리스 지도 마커 클릭 불가): 맛집 패널 상호명 EN(Places `&lang` 배선됨) — 로컬 수동 확인 권장.

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

### 다음 할 일 (웹 i18n)

- **없음 — 종료.** PR #1 머지 + 프로덕션 배포 확인 완료.
- 브랜치 정리: `feat/web-i18n`은 머지 완료라 삭제 가능(로컬/원격). 미결정이면 유지해도 무방.
- (이후) 일/중 언어 확장 시 위 "레이아웃 픽스 6건" 공통 원인 참고. 확장 계획은 아래 "3. 다음 할 일" 참조.

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

> **최신 작업은 일본어(ja) 확장 — 골격 완료(위 섹션 0).** 한/영 웹 i18n은 완료·배포(섹션 0-B).

1. **일본어 데이터 `_ja` 대량 번역** — POI 이름 2,608건 + 구 이름 26건. **섹션 0 "남은 일" 참조**(최우선).
2. **웹 JA UI 배포** — `feat/web-i18n-ja` 브랜치 리베이스 후 PR→main 머지(섹션 0 "남은 일" 3번).
3. **중국어(`_zh`) 확장** — 골격은 일본어와 동형(`LANGUAGES`에 zh 추가 + locales + `_zh` 데이터).
   표기 기준 문서 §7에 지침 있음.
4. **실기기 전체 훑기** — EN/JA 모드로 남은 화면들(통계, 설문, 설정 등) 레이아웃/번역 확인.
5. **카메라 아키텍처 개선 (d)** — research.md 설계안 검토부터.
6. **두드림길 필터 수정** — research.md의 설계(그룹 분리 인덱싱 or `.filter()` 수집,
   중복 노출 정책 결정) 기준으로.

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
