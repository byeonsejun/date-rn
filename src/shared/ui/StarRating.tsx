import { Pressable, Text, View } from "react-native";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  onChange?: (nextValue: number) => void;
}

/**
 * 별점 표시/입력을 공통으로 처리하는 컴포넌트.
 * onChange가 있으면 입력형, 없으면 읽기 전용으로 동작한다.
 */
export const StarRating = ({
  value,
  max = 5,
  size = 18,
  color = "#f59e0b",
  emptyColor = "#d4d4d8",
  onChange,
}: StarRatingProps) => {
  /**
   * index 값을 1-based 별점으로 변환한다.
   */
  const getStarValue = (index: number): number => index + 1;

  return (
    <View className="flex-row items-center">
      {Array.from({ length: max }, (_, index) => {
        const starValue = getStarValue(index);
        const active = starValue <= value;

        return (
          <Pressable
            key={starValue}
            onPress={onChange ? () => onChange(starValue) : undefined}
            disabled={!onChange}
            className="px-0.5"
          >
            <Text
              style={{
                fontSize: size,
                color: active ? color : emptyColor,
              }}
            >
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
