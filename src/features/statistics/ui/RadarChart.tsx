import { Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface RadarChartProps {
  width: number;
  lineColor: string;
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

/**
 * 웹 `RadarChart.jsx`(Chart.js Radar) 대체 — 동일 `labels`/`datasets` 데이터를
 * `LineChart`(bezier)로 표현한다.
 */
export const RadarChart = ({ width, lineColor, data }: RadarChartProps) => {
  if (!data.datasets[0]?.data.length) {
    return (
      <View className="h-52 items-center justify-center">
        <Text className="text-xs text-neutral-500">표시할 통계 데이터가 없습니다.</Text>
      </View>
    );
  }

  const rgbaParts = lineColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  const strokeRgb =
    rgbaParts && rgbaParts[1] && rgbaParts[2] && rgbaParts[3]
      ? `rgb(${rgbaParts[1]}, ${rgbaParts[2]}, ${rgbaParts[3]})`
      : "rgb(53, 162, 235)";

  return (
    <LineChart
      data={data}
      width={width}
      height={220}
      withInnerLines
      withOuterLines
      withVerticalLabels
      withHorizontalLabels
      yAxisInterval={1}
      bezier
      chartConfig={{
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => {
          if (rgbaParts && rgbaParts[1] && rgbaParts[2] && rgbaParts[3]) {
            return `rgba(${rgbaParts[1]}, ${rgbaParts[2]}, ${rgbaParts[3]}, ${opacity})`;
          }
          return `rgba(53, 162, 235, ${opacity})`;
        },
        labelColor: (opacity = 1) => `rgba(38, 38, 38, ${opacity})`,
        propsForDots: {
          r: "4",
          strokeWidth: "1",
          stroke: strokeRgb,
        },
      }}
      style={{ borderRadius: 16, marginVertical: 4 }}
    />
  );
};
