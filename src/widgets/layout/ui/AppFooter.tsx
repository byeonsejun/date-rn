import { Text, View } from 'react-native';

/**
 * 하단 저작권 표기.
 *
 * 1. 원본 출처
 *    - 웹: `portfolio-next/src/components/Footer.tsx`
 *
 * 2. 역할
 *    - 웹과 같은 문구. 웹은 검은 띠지만, 앱은 아래 안전 영역이 흰색이라 흰 바탕 + 위 경계선으로 둔다.
 */
export const AppFooter = () => {
  const year = new Date().getFullYear();
  return (
    <View className="border-t border-pink-100 bg-white px-2 py-1.5">
      <Text className="text-center text-[11px] text-gray-500">{`Copyright © ${year} BYUN SEJUN. All Rights Reserved.`}</Text>
    </View>
  );
};
