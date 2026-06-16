import { Redirect } from 'expo-router';

/**
 * `/statistics` 라우트 — 홈으로 redirect.
 *
 * 통계 화면은 데모성 데이터라 입구(AppHeader 탭)를 제거했고, 웹과 동일하게
 * `/statistics`로 직접/딥링크 진입해도 홈(`/`)으로 보낸다.
 *
 * NOTE: 통계 구현 코드(`widgets/statistics/StatisticsView`, `entities/statistics`,
 * `features/statistics`)는 삭제하지 않고 보존한다. 데이터 정리 후 재노출이 가능하도록
 * 여기서는 라우트만 redirect로 막는다(현재는 dead code).
 */
const StatisticsPage = () => {
  return <Redirect href="/" />;
};

export default StatisticsPage;
