import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { APPLICATION_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const PAGE_SIZE = 10;

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Đã nộp", value: APPLICATION_STATUS.SUBMITTED },
  { label: "Đã xem", value: APPLICATION_STATUS.UNDER_REVIEW },
  { label: "Phù hợp", value: APPLICATION_STATUS.SUITABLE },
  { label: "Từ chối", value: APPLICATION_STATUS.REJECTED },
];

export default function JobApplicationsScreen({ user }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId, jobTitle } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          setLoading(true);
          const rows = await employerService.getApplicationsByJob(user.id, jobId, { status: "all", limit: 1000, offset: 0 });
          if (active) {
            setItems(rows);
          }
        } catch (error) {
          Alert.alert("Lỗi", error.message || "Không thể tải danh sách ứng tuyển.");
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
    }, [jobId, user.id])
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
        <Text style={styles.jobTitle} numberOfLines={2}>
          {jobTitle}
        </Text>
        <Text style={styles.subtitle}>{filteredItems.length} ứng viên đã ứng tuyển</Text>

        <View style={styles.filterRow}>
          {filters.map((item) => {
            const active = item.value === activeFilter;
            return (
              <Pressable
                key={item.value}
                onPress={() => handleChangeFilter(item.value)}
                style={({ pressed }) => [
                  styles.filterButton,
                  active && styles.filterButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("ApplicantCV", { applicationId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.candidate_name?.charAt(0)?.toUpperCase() || "A"}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.candidateName}>{item.candidate_name || "Ứng viên"}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Ionicons color={COLORS.border} name="chevron-forward" size={18} />
        </View>

        <View style={styles.divider} />

        <Text style={styles.jobText} numberOfLines={1}>
          Ứng tuyển: <Text style={styles.jobTextStrong}>{item.job_title || "Chưa có tiêu đề"}</Text>
        </Text>
        <Text style={styles.metaText}>Ngày nộp: {item.created_at}</Text>
      </Pressable>
    );
  }

  return (
    <Screen>
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
        </View>
      ) : (
        <FlatList
          data={paginatedItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
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
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có ứng viên nào ứng tuyển.</Text>}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function PaginationControls({ page, totalPages, onNext, onPrevious }) {
  return (
    <View style={styles.pagination}>
      <Pressable disabled={page === 1} onPress={onPrevious} style={[styles.pageButton, page === 1 && styles.disabled]}>
        <Ionicons color={page === 1 ? COLORS.muted : COLORS.text} name="chevron-back" size={20} />
      </Pressable>
      <View style={styles.pageInfo}>
        <Text style={styles.pageNumberText}>Trang {page}</Text>
        <Text style={styles.pageTotalText}>trên {totalPages}</Text>
      </View>
      <Pressable
        disabled={page === totalPages}
        onPress={onNext}
        style={[styles.pageButton, page === totalPages && styles.disabled]}
      >
        <Ionicons color={page === totalPages ? COLORS.muted : COLORS.text} name="chevron-forward" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  jobTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 6,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  filterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
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
  },
  filterTextActive: {
    color: COLORS.action,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: COLORS.action + "12",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: COLORS.action,
    fontSize: 18,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  candidateName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 12,
    opacity: 0.5,
  },
  jobText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  jobTextStrong: {
    color: COLORS.text,
    fontWeight: "700",
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6,
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
    gap: 24,
    justifyContent: "center",
    paddingVertical: 18,
  },
  pageButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pageInfo: {
    alignItems: "center",
  },
  pageNumberText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  pageTotalText: {
    color: COLORS.muted,
    fontSize: 11,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.8,
  },
});
