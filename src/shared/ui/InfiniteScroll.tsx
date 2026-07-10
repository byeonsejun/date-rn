import { FlatList, Text, type ListRenderItem, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Loading } from "@shared/ui/Loading";

interface InfiniteScrollProps<TItem> {
  data: TItem[];
  renderItem: ListRenderItem<TItem>;
  keyExtractor: (item: TItem, index: number) => string;
  onEndReached?: () => void;
  isLoading?: boolean;
  emptyText?: string;
}

/**
 * RN FlatList 기반 공통 무한스크롤 컴포넌트.
 * 웹 IntersectionObserver 기반 목록을 앱 스크롤 이벤트 기반으로 대체한다.
 */
export const InfiniteScroll = <TItem,>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  isLoading = false,
  emptyText,
}: InfiniteScrollProps<TItem>) => {
  const { t } = useTranslation();
  const resolvedEmptyText = emptyText ?? t("common.noData");

  /**
   * 리스트 하단 로딩 표시를 렌더링한다.
   */
  const renderFooter = () => {
    if (!isLoading) return null;
    return <Loading size="small" message={t("common.loadingMore")} />;
  };

  /**
   * 데이터가 비어있을 때 기본 안내 문구를 렌더링한다.
   */
  const renderEmpty = () => {
    return (
      <View className="items-center justify-center py-6">
        <Text className="text-sm text-neutral-500">{resolvedEmptyText}</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  );
};
