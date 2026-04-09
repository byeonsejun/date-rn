// 소수점 이하를 버려 정수 인덱스/표시값으로 맞출 때 사용.
export const getInteger = (value: number): number => {
  return Math.trunc(value);
};
