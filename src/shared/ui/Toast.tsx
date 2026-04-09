import { Pressable, Text, View } from "react-native";

interface ToastProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
}

/**
 * 전역 정책 알림(예: 서울 외 지역 안내)을 간단히 보여주는 토스트 컴포넌트.
 */
export const Toast = ({ visible, message, onClose }: ToastProps) => {
  if (!visible) return null;

  return (
    <View className="absolute bottom-8 left-4 right-4 z-50 rounded-xl bg-black/85 px-4 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm text-white">{message}</Text>
        {onClose ? (
          <Pressable onPress={onClose} className="rounded-md bg-white/15 px-2 py-1">
            <Text className="text-xs font-medium text-white">닫기</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
