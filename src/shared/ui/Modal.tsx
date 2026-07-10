import type { ReactNode } from "react";
import { Modal as RNModal, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

interface ModalProps {
  visible: boolean;
  title?: string;
  children: ReactNode;
  closeText?: string;
  onClose: () => void;
  closeOnBackdrop?: boolean;
}

/**
 * RN 기본 Modal을 감싼 공통 모달 컴포넌트.
 * 백드롭/닫기 버튼/타이틀 레이아웃을 통일한다.
 */
export const Modal = ({
  visible,
  title,
  children,
  closeText,
  onClose,
  closeOnBackdrop = true,
}: ModalProps) => {
  const { t } = useTranslation();
  const resolvedCloseText = closeText ?? t("common.close");

  return (
    <RNModal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-5"
        onPress={closeOnBackdrop ? onClose : undefined}
      >
        <Pressable
          className="w-full max-w-md rounded-2xl bg-white p-4"
          onPress={(event) => event.stopPropagation()}
        >
          {title ? (
            <Text className="mb-3 text-base font-semibold text-neutral-900">
              {title}
            </Text>
          ) : null}
          {children}
          {resolvedCloseText ? (
            <View className="mt-4 items-end">
              <Pressable
                className="rounded-lg bg-neutral-900 px-3 py-2"
                onPress={onClose}
              >
                <Text className="text-sm font-medium text-white">
                  {resolvedCloseText}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};
