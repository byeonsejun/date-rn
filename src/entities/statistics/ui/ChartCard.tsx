import { type ReactNode } from "react";
import { Text, View } from "react-native";

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

/**
 * 통계 화면 카드 — 시안 A: 여백·둥근 모서리·얕은 그림자, 테두리 최소화.
 */
export const ChartCard = ({ title, children }: ChartCardProps) => {
  return (
    <View className="rounded-3xl bg-white p-4 shadow-sm shadow-black/5">
      <Text className="mb-3 text-base font-bold tracking-tight text-neutral-900">{title}</Text>
      {children}
    </View>
  );
};
