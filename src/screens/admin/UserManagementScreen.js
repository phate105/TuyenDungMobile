import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { ROLES } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";
import { getCompanyLogoSource } from "../../constants/companyLogos";

const PAGE_SIZE = 20;

const roleOptions = [
  { label: "Ứng viên", value: ROLES.CANDIDATE },
  { label: "Nhà tuyển dụng", value: ROLES.EMPLOYER },
];

export default function UserManagementScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [role, setRole] = useState(route.params?.role || ROLES.CANDIDATE);
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.role) {
      setRole(route.params.role);
      setPage(1);
      navigation.setParams({ role: undefined });
    }
  }, [navigation, route.params?.role]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadData() {
        try {
          setLoading(true);
          const [rows, count] = await Promise.all([
            adminService.getUsersByRole(role, { limit: 1000, offset: 0 }),
            adminService.getUserCountByRole(role),
          ]);
          if (active) {
            setItems(rows);
            setTotalCount(count);
          }
        } catch (error) {
          Alert.alert("Lỗi", error.message || "Không thể tải danh sách tài khoản.");
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
    }, [role])
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  function renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>Tài khoản</Text>

        <View style={styles.segment}>
          {roleOptions.map((item) => {
            const active = item.value === role;
            return (
              <Pressable
                key={item.value}
                onPress={() => {
                  setRole(item.value);
                  setPage(1);
                }}
                style={({ pressed }) => [
                  styles.segmentButton,
                  active && styles.segmentButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderItem({ item }) {
    const logoSource = getCompanyLogoSource(item.logo_path);
    const initial = item.full_name?.charAt(0)?.toUpperCase() || "A";

    return (
      <Pressable
        onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            {logoSource ? (
              <Image source={logoSource} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.full_name}
            </Text>
            <Text style={styles.cardCompany} numberOfLines={1}>
              {item.email}
            </Text>

            <View style={styles.metaRow}>
              <StatusBadge status={item.status} />
              <MetaRow icon="call-outline" value={item.phone || "Chưa cập nhật ĐT"} />
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
          ListEmptyComponent={<Text style={styles.emptyText}>Danh sách tài khoản trống.</Text>}
          ListFooterComponent={
            items.length > 0 ? (
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
  segment: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    marginTop: 14,
    padding: 4,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  segmentText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
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
  avatarImage: {
    height: "82%",
    width: "82%",
    resizeMode: "contain",
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
