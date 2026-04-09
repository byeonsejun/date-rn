import { StatisticsView } from '@widgets/statistics/ui/StatisticsView';

/**
 * 1. 원본 출처
 * - 웹: `portfolio-next/src/app/statistics/page.jsx`
 *
 * 2. 담당 역할
 * - `/statistics` 라우트 진입점에서 통계 위젯을 렌더링한다.
 *
 * 3. 작동 원리 요약
 * - app 레이어는 라우팅만 담당하고, 화면 조립/로직은 widgets 이하 레이어에 위임한다.
 */
const StatisticsPage = () => {
  return <StatisticsView />;
};

export default StatisticsPage;
