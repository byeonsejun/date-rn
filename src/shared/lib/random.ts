// 추천 리스트 등에서 배열 원소를 무작위로 1개 선택할 때 사용.
export const getRandomIndexItem = <T>(array: T[]): T | undefined => {
  if (!array.length) return undefined;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// 0 이상 max 미만의 난수가 필요할 때 사용하는 기본 유틸.
export const makeRandomNumberIn = (maxExclusive: number): number => {
  return Math.floor(Math.random() * maxExclusive);
};

// 최소/최대 범위 내 난수를 생성해 셔플/추천 로직에 사용.
export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(min + (max - min) * Math.random());
};
