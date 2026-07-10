import { ActivityIndicator, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface LoadingProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  fullscreen?: boolean;
}

/**
 * 화면 단위/섹션 단위 로딩 상태를 공통 스타일로 표시하는 컴포넌트.
 */
export const Loading = ({
  message,
  size = "large",
  color = "#f986bd",
  fullscreen = false,
}: LoadingProps) => {
  const { t } = useTranslation();
  const resolvedMessage = message ?? t("common.loading");

  return (
    <View
      className={`items-center justify-center gap-3 ${fullscreen ? "flex-1" : "py-6"}`}
    >
      <ActivityIndicator size={size} color={color} />
      <Text className="text-sm text-neutral-500">{resolvedMessage}</Text>
    </View>
  );
};
