import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { APPLICATION_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 10;

const filters = [
  { label: "Tất cả", value: "all" },
  { label: "Đã nộp", value: APPLICATION_STATUS.SUBMITTED },
  { label: "Đã xem", value: APPLICATION_STATUS.UNDER_REVIEW },
  { label: "Phù hợp", value: APPLICATION_STATUS.SUITABLE },
  { label: "Từ chối", value: APPLICATION_STATUS.REJECTED },
];

export default function AdminApplicationsScreen({ navigation }) {
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
          const rows = await adminService.getApplications({
            status: activeFilter,
            limit: 1000,
            offset: 0,
          });
          if (active) {
            setItems(rows);
          }
        } catch (error) {
          Alert.alert("Lỗi", error.message || "Không thể tải danh sách đơn ứng tuyển.");
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
        <Text style={styles.title}>Đơn ứng tuyển</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
        </ScrollView>
      </View>
    );
  }

  function renderItem({ item }) {
    const initial = item.full_name?.charAt(0)?.toUpperCase() || "A";

    return (
      <Pressable
        onPress={() => navigation.navigate("AdminApplicationDetail", { applicationId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.full_name || "Ứng viên"}
            </Text>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {item.title || "Chưa rõ vị trí"}
            </Text>

            <View style={styles.metaRow}>
              <StatusBadge status={item.status} />
              <MetaRow icon="business-outline" value={item.company_name || "Công ty"} />
            </View>
          </View>

          <Ionicons color={COLORS.border} name="chevron-forward" size={18} style={styles.chevron} />
        </View>
      </Pressable>
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
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có đơn ứng tuyển nào.</Text>}
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

function MetaRow({ icon, value }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={COLORS.muted} name={icon} size={14} />
      <Text numberOfLines={1} style={styles.metaValue}>
        {value}
      </Text>
    </View>
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
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    overflow: "hidden",
    width: 44,
  },
  avatarText: {
    color: COLORS.brand,
    fontSize: 18,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  cardCompany: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "400",
    marginTop: 3,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  metaValue: {
    color: COLORS.muted,
    fontSize: 13,
  },
  chevron: {
    marginTop: 4,
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
