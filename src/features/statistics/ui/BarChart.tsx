import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

/** 시안 A: 가로 진행 막대 — 탭 시 모달로 상세 */
const MALE_FILL = "rgba(53, 162, 235, 0.88)";
const FEMALE_FILL = "rgba(255, 99, 132, 0.88)";

export type StatisticsBarPair = {
  male: {
    labels: string[];
    data: number[];
    names: string[];
  };
  female: {
    labels: string[];
    data: number[];
    names: string[];
  };
};

interface BarChartProps {
  pair: StatisticsBarPair;
}

type DetailState = {
  label: string;
  placeName: string;
  visits: number;
  tone: "male" | "female";
};

const VisitDetailModal = (props: { detail: DetailState | null; onClose: () => void }) => {
  const { detail, onClose } = props;
  if (!detail) return null;

  const borderClass = detail.tone === "male" ? "border-sky-200" : "border-rose-200";
  const visitsColor = detail.tone === "male" ? "text-sky-600" : "text-rose-600";

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center">
        <Pressable className="absolute inset-0 bg-black/45" onPress={onClose} accessibilityLabel="닫기" />
        <View className={`z-10 mx-6 rounded-3xl border-2 bg-white p-6 shadow-lg ${borderClass}`}>
          <Text className="text-center text-base font-bold text-neutral-900">방문 상세</Text>
          <View className="mt-4 gap-1">
            <Text className="text-xs text-neutral-500">연령대</Text>
            <Text className="text-base font-semibold text-neutral-900">{detail.label}</Text>
            <Text className="mt-3 text-xs text-neutral-500">장소 이름</Text>
            <Text className="text-base font-medium text-neutral-800">{detail.placeName}</Text>
            <Text className="mt-3 text-xs text-neutral-500">방문 횟수</Text>
            <Text className={`text-2xl font-bold tabular-nums ${visitsColor}`}>{detail.visits}</Text>
          </View>
          <Pressable
            onPress={onClose}
            className="mt-6 rounded-full bg-[#f986bd] py-3 active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel="확인하고 닫기"
          >
            <Text className="text-center text-base font-semibold text-white">확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const ProgressSection = (props: {
  title: string;
  labels: string[];
  data: number[];
  names: string[];
  fillColor: string;
  tone: "male" | "female";
  onOpenDetail: (payload: DetailState) => void;
}) => {
  const { title, labels, data, names, fillColor, tone, onOpenDetail } = props;
  const max = Math.max(...data, 1);

  return (
    <View className="gap-1">
      <Text className="mb-2 text-center text-xs font-semibold text-neutral-600">{title}</Text>
      {labels.map((label, i) => {
        const v = data[i] ?? 0;
        const pct = Math.min(100, Math.round((v / max) * 100));
        const name = names[i] ?? "";
        return (
          <Pressable
            key={`${label}-${i}`}
            onPress={() => onOpenDetail({ label, placeName: name, visits: v, tone })}
            className="flex-row items-center gap-2 border-b border-neutral-100 py-2.5 active:bg-neutral-50"
          >
            <Text className="w-[52px] text-xs font-bold text-neutral-800">{label}</Text>
            <View className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
              <View
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 9999,
                  backgroundColor: fillColor,
                }}
              />
            </View>
            <Text className="w-7 text-right text-xs font-bold tabular-nums text-neutral-900">{v}</Text>
            <MaterialIcons name="chevron-right" size={20} color="#c4c4c4" />
          </Pressable>
        );
      })}
    </View>
  );
};

export const BarChart = ({ pair }: BarChartProps) => {
  const [detail, setDetail] = useState<DetailState | null>(null);

  const maleLen = pair.male.data.length;
  const femaleLen = pair.female.data.length;

  if (maleLen === 0 || femaleLen === 0) {
    return (
      <View className="h-40 items-center justify-center">
        <Text className="text-xs text-neutral-500">표시할 통계 데이터가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View className="gap-8">
      <VisitDetailModal detail={detail} onClose={() => setDetail(null)} />
      <ProgressSection
        title="남성 · 연령대별 방문"
        labels={pair.male.labels}
        data={pair.male.data}
        names={pair.male.names}
        fillColor={MALE_FILL}
        tone="male"
        onOpenDetail={setDetail}
      />
      <ProgressSection
        title="여성 · 연령대별 방문"
        labels={pair.female.labels}
        data={pair.female.data}
        names={pair.female.names}
        fillColor={FEMALE_FILL}
        tone="female"
        onOpenDetail={setDetail}
      />
    </View>
  );
};
