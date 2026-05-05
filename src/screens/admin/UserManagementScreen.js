import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { ROLES } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 20;
const roleOptions = [
  { label: "Ứng viên", value: ROLES.CANDIDATE },
  { label: "Nhà tuyển dụng", value: ROLES.EMPLOYER },
];

export default function UserManagementScreen({ navigation }) {
  const [role, setRole] = useState(ROLES.CANDIDATE);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadUsers() {
        try {
          setLoading(true);
          setError("");

          const offset = (page - 1) * PAGE_SIZE;
          const [rows, total] = await Promise.all([
            adminService.getUsersByRole(role, { limit: PAGE_SIZE, offset }),
            adminService.getUserCountByRole(role),
          ]);

          if (active) {
            setUsers(rows);
            setTotalUsers(total);
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

      loadUsers();

      return () => {
        active = false;
      };
    }, [page, role])
  );

  function handleChangeRole(nextRole) {
    setRole(nextRole);
    setPage(1);
  }

  function renderUser({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={2} style={styles.name}>{item.full_name}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.meta}>{item.email}</Text>
        <Text style={styles.meta}>{item.phone || "Chưa cập nhật"}</Text>
      </Pressable>
    );
  }

  return (
    <Screen>
      <View style={styles.segment}>
        {roleOptions.map((option) => {
          const active = option.value === role;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleChangeRole(option.value)}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải tài khoản...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={users}
          initialNumToRender={8}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có tài khoản.</Text>}
          ListFooterComponent={
            totalUsers > 0 ? (
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
              {totalUsers} tài khoản • Trang {page}/{totalPages}
            </Text>
          }
          maxToRenderPerBatch={8}
          renderItem={renderUser}
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
  segment: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 12,
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
    marginBottom: 8,
  },
  name: {
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
