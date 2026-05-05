import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { JOB_STATUS } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 20;
const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: JOB_STATUS.PENDING },
  { label: "Đã duyệt", value: JOB_STATUS.APPROVED },
  { label: "Bị từ chối", value: JOB_STATUS.REJECTED },
];

export default function PendingJobsScreen({ navigation }) {
  const [status, setStatus] = useState(JOB_STATUS.PENDING);
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadJobs() {
        try {
          setLoading(true);
          setError("");

          const offset = (page - 1) * PAGE_SIZE;
          const [rows, total] = await Promise.all([
            adminService.getJobs({ status, limit: PAGE_SIZE, offset }),
            adminService.getJobCount(status),
          ]);

          if (active) {
            setJobs(rows);
            setTotalJobs(total);
          }
        } catch (err) {
          if (active) {
            setError(err.message);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadJobs();

      return () => {
        active = false;
      };
    }, [page, status])
  );

  function handleChangeStatus(nextStatus) {
    setStatus(nextStatus);
    setPage(1);
  }

  function renderJob({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("AdminJobDetail", { jobId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.meta}>{item.company_name}</Text>
        <Text style={styles.meta}>
          {(item.category_name || "Chưa cập nhật") + " • " + (item.location_name || "Chưa cập nhật")}
        </Text>
        <Text style={styles.meta}>
          {(item.salary || "Thương lượng") + " • " + (item.work_type || "Chưa cập nhật")}
        </Text>
      </Pressable>
    );
  }

  return (
    <Screen>
      <View style={styles.filters}>
        {statusOptions.map((option) => {
          const active = option.value === status;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleChangeStatus(option.value)}
              style={[styles.filterButton, active && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải tin tuyển dụng...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={jobs}
          initialNumToRender={8}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có tin tuyển dụng.</Text>}
          ListFooterComponent={
            totalJobs > 0 ? (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              />
            ) : null
          }
          ListHeaderComponent={
            <Text style={styles.countText}>
              {totalJobs} tin • Trang {page}/{totalPages}
            </Text>
          }
          maxToRenderPerBatch={8}
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
          windowSize={7}
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
      <Pressable disabled={!canGoPrevious} onPress={onPrevious} style={[styles.pageButton, !canGoPrevious && styles.disabled]}>
        <Text style={styles.pageButtonText}>Trước</Text>
      </Pressable>
      <Text style={styles.pageNumber}>{page}/{totalPages}</Text>
      <Pressable disabled={!canGoNext} onPress={onNext} style={[styles.pageButton, !canGoNext && styles.disabled]}>
        <Text style={styles.pageButtonText}>Sau</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterButtonActive: {
    borderColor: COLORS.action,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.text,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  countText: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 2,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  cardHeader: {
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 15,
    textAlign: "center",
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  pageButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 82,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pageButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  pageNumber: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
});
