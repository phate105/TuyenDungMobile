import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import JobCard from "../../components/JobCard";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { JOB_STATUS } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 10;

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: JOB_STATUS.PENDING },
  { label: "Đã duyệt", value: JOB_STATUS.APPROVED },
  { label: "Bị từ chối", value: JOB_STATUS.REJECTED },
];

export default function PendingJobsScreen({ navigation }) {
  const route = useRoute();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (route.params?.status) {
      setActiveFilter(route.params.status);
      setPage(1);
      navigation.setParams({ status: undefined });
    }
  }, [navigation, route.params?.status]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          setLoading(true);
          const rows = await adminService.getJobs({
            status: activeFilter,
            limit: 1000,
            offset: 0,
          });

          if (active) {
            setItems(rows);
          }
        } catch (error) {
          Alert.alert("Lỗi", error.message || "Không thể tải danh sách tin tuyển dụng.");
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadData();
      return () => {
        active = false;
      };
    }, [activeFilter])
  );

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return items;
    }
    return items.filter((item) => item.status === activeFilter);
  }, [items, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  function handleChangeFilter(value) {
    setActiveFilter(value);
    setPage(1);
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>Tin tuyển dụng</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => {
            const active = item.value === activeFilter;
            return (
              <Pressable
                key={item.value}
                onPress={() => handleChangeFilter(item.value)}
                style={({ pressed }) => [styles.filterButton, active && styles.filterButtonActive, pressed && styles.pressed]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <JobCard
        compact
        job={item}
        onPress={() => navigation.navigate("AdminJobDetail", { jobId: item.id })}
        rightAccessory={
          <View style={styles.cardAccessory}>
            <StatusBadge status={item.status} style={{ alignSelf: "flex-end" }} />
            <Text style={styles.accessoryCount}>{item.application_count || 0} ứng viên</Text>
          </View>
        }
      />
    );
  }

  return (
    <Screen edges={["top", "left", "right"]} contentStyle={styles.screenContent} style={styles.screenStyle}>
      {renderHeader()}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
        </View>
      ) : (
        <FlatList
          data={paginatedItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tin tuyển dụng nào.</Text>}
          ListFooterComponent={
            filteredItems.length > 0 ? (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.listStyle}
        />
      )}
    </Screen>
  );
}

function PaginationControls({ page, totalPages, onNext, onPrevious }) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <View style={styles.pagination}>
      <Pressable
        disabled={!canGoPrevious}
        onPress={onPrevious}
        style={({ pressed }) => [styles.pageButton, !canGoPrevious && styles.pageButtonDisabled, pressed && canGoPrevious && { opacity: 0.82 }]}
      >
        <Ionicons color={COLORS.primary} name="arrow-back" size={24} />
      </Pressable>

      <Text style={styles.pageNumber}>{page}/{totalPages}</Text>

      <Pressable
        disabled={!canGoNext}
        onPress={onNext}
        style={({ pressed }) => [styles.pageButton, !canGoNext && styles.pageButtonDisabled, pressed && canGoNext && { opacity: 0.82 }]}
      >
        <Ionicons color={COLORS.primary} name="arrow-forward" size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screenStyle: {
    backgroundColor: COLORS.background,
  },
  screenContent: {
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  listStyle: {
    backgroundColor: COLORS.surface,
  },
  listContent: {
    backgroundColor: COLORS.surface,
    gap: 12,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    backgroundColor: COLORS.background,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  filterRow: {
    gap: 10,
    marginTop: 14,
  },
  filterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterButtonActive: {
    borderColor: COLORS.action,
    backgroundColor: COLORS.action + "14",
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  filterTextActive: {
    color: COLORS.action,
  },
  cardAccessory: {
    alignItems: "flex-end",
    gap: 6,
    minWidth: 82,
  },
  accessoryCount: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
  },
  loadingBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 24,
    textAlign: "center",
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    paddingTop: 8,
  },
  pageButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 76,
  },
  pageButtonDisabled: {
    opacity: 0.35,
  },
  pageNumber: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 62,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
