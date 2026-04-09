import { Text, View } from "react-native";

interface DistrictBadgeProps {
  district: string;
}

/**
 * 기존 웹에서 구 이름을 텍스트로 표시하던 역할을 대체하는
 * 읽기 전용 엔티티 UI 배지 컴포넌트.
 */
export const DistrictBadge = ({ district }: DistrictBadgeProps) => {
  return (
    <View className="self-start rounded-full bg-emerald-100 px-3 py-1">
      <Text className="text-xs font-semibold text-emerald-800">{district}</Text>
    </View>
  );
};
