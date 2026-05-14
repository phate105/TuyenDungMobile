import { useCallback, useState, useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 20;

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Đã nộp", value: "submitted" },
  { label: "Xem xét", value: "viewed" },
  { label: "Phù hợp", value: "suitable" },
  { label: "Bị từ chối", value: "rejected" },
];

export default function AdminApplicationsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [role, setRole] = useState(route.params?.role || "all");
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalApplications / PAGE_SIZE));

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    if (route.params?.role) {
      setRole(route.params.role);
      setPage(1);
    }
  }, [route.params?.role, navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadApplications() {
        try {
          setLoading(true);
          setError("");
          const offset = (page - 1) * PAGE_SIZE;
          const [rows, total] = await Promise.all([
            adminService.getApplications({ status: role, limit: PAGE_SIZE, offset }),
            adminService.getApplicationCount(role === "all" ? undefined : role),
          ]);
          if (active) {
            setApplications(rows);
            setTotalApplications(total);
          }
        } catch (err) {
          if (active) setError(err.message);
        } finally {
          if (active) setLoading(false);
        }
      }
      loadApplications();
      return () => { active = false; };
    }, [page, role])
  );

  function handleChangeRole(nextRole) {
    setRole(nextRole);
    setPage(1);
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Đơn ứng tuyển</Text>
        <Text style={styles.screenSubtitle}>Quản lý hồ sơ ứng viên toàn hệ thống</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
        style={styles.filterWrapper}
      >
        {statusOptions.map((option) => {
          const isActive = option.value === role;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleChangeRole(option.value)}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.countText}>
        Tìm thấy {totalApplications} đơn • Trang {page}/{totalPages}
      </Text>
    </View>
  );

  function renderApplication({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("AdminApplicationDetail", { applicationId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardContent}>
            {/* Hiển thị Tên Ứng Viên nổi bật cho Admin */}
            <View style={styles.candidateRow}>
               <View style={styles.avatarMini}>
                  <Text style={styles.avatarTextMini}>{item.candidate_name?.charAt(0) || "U"}</Text>
               </View>
               <Text numberOfLines={1} style={styles.candidateName}>{item.candidate_name}</Text>
            </View>
            
            <Text numberOfLines={1} style={styles.jobTitle}>{item.title}</Text>
            
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Ionicons name="business-outline" size={12} color={COLORS.muted} />
                <Text numberOfLines={1} style={styles.tagText}>{item.company_name}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="time-outline" size={12} color={COLORS.muted} />
                <Text style={styles.tagText}>{item.applied_at || "Vừa xong"}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardRight}>
            <StatusBadge status={item.status} />
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} style={{marginTop: 8}} />
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderApplication}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-unread-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>Không có đơn ứng tuyển nào</Text>
            </View>
          }
          ListFooterComponent={
            totalApplications > 0 && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                onPrevious={() => setPage(p => Math.max(1, p - 1))}
              />
            )
          }
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
        <Ionicons name="chevron-back" size={20} color={page === 1 ? COLORS.muted : COLORS.text} />
      </Pressable>
      <View style={styles.pageInfo}>
        <Text style={styles.pageNumberText}>Trang {page}</Text>
        <Text style={styles.pageTotalText}>trên {totalPages}</Text>
      </View>
      <Pressable disabled={page === totalPages} onPress={onNext} style={[styles.pageButton, page === totalPages && styles.disabled]}>
        <Ionicons name="chevron-forward" size={20} color={page === totalPages ? COLORS.muted : COLORS.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { paddingTop: 10 },
  titleSection: { paddingHorizontal: 16, marginBottom: 16 },
  screenTitle: { fontSize: 26, fontWeight: "800", color: COLORS.text },
  screenSubtitle: { fontSize: 15, color: COLORS.muted, marginTop: 4 },
  filterWrapper: { marginBottom: 16 },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  filterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  filterButtonActive: { borderColor: COLORS.action, backgroundColor: COLORS.action + "15" },
  filterText: { color: COLORS.muted, fontSize: 14, fontWeight: "600" },
  filterTextActive: { color: COLORS.action },
  countText: { paddingHorizontal: 16, color: COLORS.muted, fontSize: 13, marginBottom: 12, fontWeight: "600", textTransform: 'uppercase' },
  listContent: { paddingBottom: 40 },
  card: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardPressed: { transform: [{ scale: 0.98 }], backgroundColor: COLORS.surfaceMuted },
  cardMain: { flexDirection: 'row', justifyContent: 'space-between' },
  cardContent: { flex: 1, marginRight: 8 },
  candidateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  avatarMini: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.action + "20", justifyContent: 'center', alignItems: 'center' },
  avatarTextMini: { fontSize: 10, fontWeight: "800", color: COLORS.action },
  candidateName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  jobTitle: { fontSize: 14, fontWeight: "600", color: COLORS.muted, marginBottom: 6 },
  tagRow: { flexDirection: 'row', gap: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  tagText: { fontSize: 12, color: COLORS.muted },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 25, paddingVertical: 20 },
  pageButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  pageInfo: { alignItems: 'center' },
  pageNumberText: { fontSize: 15, fontWeight: "800", color: COLORS.text },
  pageTotalText: { fontSize: 11, color: COLORS.muted, textTransform: 'uppercase' },
  disabled: { opacity: 0.3, elevation: 0 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: COLORS.muted },
  emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.4 },
  emptyText: { marginTop: 12, fontSize: 16, color: COLORS.muted, fontWeight: "600" },
  errorText: { color: COLORS.danger, marginTop: 10, textAlign: 'center', fontWeight: '500' }
});