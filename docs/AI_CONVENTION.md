# AI Coding Convention & Project Guide

## 1. 프로젝트 개요 (Project Overview)

- **목표:** 기존 Next.js 웹 애플리케이션을 React Native (Expo) 기반의 앱으로 마이그레이션.
- **주요 스택:** React Native, Expo Go, NativeWind
- **아키텍처 지향점:** **엄격한 Feature-Sliced Design (FSD) 아키텍처 적용. (타협 불가)**

## 2. 폴더 구조 및 아키텍처 절대 원칙 (Architecture Absolute Rules)

- **[절대 규칙 1] 단방향 의존성 (역방향 참조 금지):** 하위 레이어는 상위 레이어를 절대 참조(import)할 수 없다.
  - 허용 방향: `shared` ➡️ `entities` ➡️ `features` ➡️ `widgets` ➡️ `app`
  - 예: `features`에서 `core`나 `app`을 import하면 즉시 오류로 간주.
- **[절대 규칙 2] 교차 참조 금지:** 같은 레이어 내의 다른 도메인 슬라이스는 서로 절대 import 할 수 없다.
  - 예: `features/weather`에서 `features/location` 참조 엄격히 금지. 슬라이스 간의 조합은 상위 레이어(`widgets`)에서 수행한다.
- **[절대 규칙 3] 스토어 위치 강제:** 도메인의 전역 상태(Zustand Store)는 반드시 해당 도메인의 `entities/[도메인명]/model/store.ts`에 위치시킨다. `features/` 폴더 내부에 상태 저장소를 만들지 않는다.
- **Feature UI 순수성 강제:** `ui/` 폴더 하위의 컴포넌트는 오직 props(또는 훅의 반환값)만 받아서 렌더링하는 '순수 UI'로 작성한다. API 통신, OS 권한 요청, 스토어 직접 구독 및 갱신 등의 비즈니스 로직은 반드시 같은 slice 내의 Custom Hook(`use*.ts`)으로 분리하여 주입한다.
- **[절대 규칙 4] NativeWind `className` 정적 추출 보장:** `className`에서 `${변수}`/객체/배열 값 보간으로 유틸 토큰을 동적으로 조립하는 패턴을 금지한다. 조건부 스타일은 JSX 내부에서 리터럴 문자열(예: `"bg-red-500 px-2"`)을 직접 노출하는 ternary/조건문 형태로만 작성한다.
- **[절대 규칙 5] UI 책임 범위 명확화(어댑터 금지):** `features/*/ui/*`는 표현(render)만 담당한다. RN 콜백 payload를 도메인 타입/좌표/형태로 변환(어댑터)하거나 정규화/가공 결과를 만드는 로직이 들어가기 시작하면, 그 순간부터는 `use*.ts` 또는 `lib`로 책임을 넘긴 것으로 간주한다.

## 3. 코딩 컨벤션 (Coding Conventions)

- **함수 선언:** 모든 컴포넌트와 일반 함수는 반드시 **화살표 함수 (Arrow Function)** 로 작성한다. (`function` 키워드 사용 엄격히 금지)
  - 🟢 Good: `const MyComponent = () => { ... }`
  - 🔴 Bad: `function MyComponent() { ... }`
- **스타일링:** NativeWind를 활용하여 Tailwind 클래스 네임 기반으로 스타일을 작성한다. (웹의 CSS 방식과 혼용 금지)
- **가독성:** 코드는 최대한 간결하게 작성하고, 복잡한 로직이 들어갈 경우 해당 로직 위쪽에 주석으로 설명을 추가한다.

## 4. AI 작업 지침 (AI Assistant Guidelines)

- **유닛 단위 작업:** 전체 코드를 한 번에 갈아엎지 말고, 하나의 컴포넌트나 단일 기능(Unit) 단위로 쪼개서 작업 및 제안할 것.
- **사전 설명 의무:** 코드를 출력하기 전, 설계(FSD) 관점에서 **'왜 이 폴더/위치에 코드를 작성해야 하며, FSD 절대 규칙을 어떻게 준수했는지'** 먼저 설명할 것.
- **임의 수정 금지:** 사용자가 명시적으로 요청하지 않은 파일, 패키지 버전, 빌드 설정 등은 절대 임의로 건드리지 말 것.
