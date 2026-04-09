import { Pressable, Text, View } from "react-native";
import { Modal } from "@shared/ui/Modal";

interface LocationConsentModalProps {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
}

/**
 * 앱 최초 실행 시 위치 동의를 묻는 모달 UI.
 * 표시 여부·동의/거부 후처리는 외부 훅(useLocationConsent)이 담당하고,
 * 이 컴포넌트는 전달받은 props만으로 렌더링한다.
 */
export const LocationConsentModal = ({
  visible,
  onAgree,
  onDecline,
}: LocationConsentModalProps) => {
  return (
    <Modal
      visible={visible}
      onClose={onDecline}
      closeOnBackdrop={false}
      closeText=""
    >
      <Text className="mb-4 text-center text-base leading-6 text-neutral-900">
        서울, 너와 함께는 현재 계신 곳을 중심으로 맞춤형 날씨와 데이트 장소를
        추천해 드려요!{"\n"}
        (본 서비스는 서울 지역 한정으로 제공됩니다.)
      </Text>
      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 items-center rounded-lg border border-neutral-300 py-2.5"
          onPress={onDecline}
        >
          <Text className="text-sm text-neutral-700">거부</Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center rounded-lg bg-pink-400 py-2.5"
          onPress={onAgree}
        >
          <Text className="text-sm font-semibold text-white">동의</Text>
        </Pressable>
      </View>
    </Modal>
  );
};
