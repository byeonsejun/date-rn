import { Pressable, Text, View } from 'react-native';

export interface SelectOption<TValue extends string = string> {
  label: string;
  value: TValue;
}

interface SelectProps<TValue extends string = string> {
  options: SelectOption<TValue>[];
  value: TValue;
  onChange: (nextValue: TValue) => void;
  disabled?: boolean;
}

/**
 * 웹의 select를 RN 환경에 맞춰 대체한 세그먼트형 선택 컴포넌트.
 * 작은 옵션 집합(구/성별/타입 필터) 선택에 사용한다.
 */
export const Select = <TValue extends string = string>({
  options,
  value,
  onChange,
  disabled = false,
}: SelectProps<TValue>) => {
  /**
   * 현재 선택 여부에 따라 버튼 스타일 클래스를 반환한다.
   */
  const getItemClassName = (active: boolean): string => {
    if (active) {
      return 'rounded-lg bg-[#f986bd] px-3 py-2';
    }
    return 'rounded-lg bg-neutral-100 px-3 py-2';
  };

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            className={getItemClassName(active)}
          >
            <Text className={active ? 'text-sm text-white' : 'text-sm text-neutral-800'}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
