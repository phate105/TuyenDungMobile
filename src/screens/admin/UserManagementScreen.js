import { useCallback, useState, useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, ScrollView, Image } from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
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
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

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
          if (active) setError(err.message);
        } finally {
          if (active) setLoading(false);
        }
      }
      loadUsers();
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
        <Text style={styles.screenTitle}>Người dùng</Text>
        <Text style={styles.screenSubtitle}>Quản lý tài khoản và phân quyền hệ thống</Text>
      </View>
      <View style={styles.filterWrapper}>
        <View style={styles.segment}>
          {roleOptions.map((option) => {
            const active = option.value === role;
            return (
              <Pressable
                key={option.value}
                onPress={() => handleChangeRole(option.value)}
                style={[styles.segmentButton, active && styles.segmentButtonActive]}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.countText}>
        Tổng cộng {totalUsers} người dùng • Trang {page}/{totalPages}
      </Text>
    </View>
  );

  function renderUser({ item }) {
    //console.log("Avatar path from DB:", item.avatar);
    const logoSource = getCompanyLogoSource(item.avatar);
    return (
    <Pressable
      onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardMain}>
        <View style={styles.cardContent}>
          <View style={styles.userRow}>
            {/* 1. Hiển thị Ảnh đại diện nếu có, nếu không hiện Icon */}
            <View style={[styles.avatarMini, { backgroundColor: role === ROLES.CANDIDATE ? COLORS.action + "15" : "#6366F115" }]}>
              {logoSource ? (
                <Image 
                  source={logoSource} 
                  style={styles.avatarImage} 
                  resizeMode="contain"
                />
              ) : (
                <Ionicons 
                  name={role === ROLES.CANDIDATE ? "person" : "business"} 
                  size={14} 
                  color={role === ROLES.CANDIDATE ? COLORS.action : "#6366F1"} 
                />
              )}
            </View>

            {/* 2. Container cho Tên để xử lý tràn chữ */}
            <View style={styles.nameContainer}>
              <Text numberOfLines={1} style={styles.userName}>
                {item.full_name}
              </Text>
            </View>
            
            {/* 3. Badge trạng thái được đẩy về phía cuối dòng */}
            <StatusBadge status={item.status} />
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaRow}>
              <Ionicons name="mail-outline" size={14} color={COLORS.muted} />
              <Text numberOfLines={1} style={styles.metaText}>{item.email}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.muted} />
              <Text style={styles.metaText}>{item.phone || "Chưa cập nhật số điện thoại"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
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
          <Text style={styles.loadingText}>Đang truy xuất dữ liệu...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>Danh sách người dùng trống</Text>
            </View>
          }
          ListFooterComponent={
            totalUsers > 0 && (
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
  filterWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  segment: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  segmentText: { color: COLORS.muted, fontSize: 14, fontWeight: "700" },
  segmentTextActive: { color: COLORS.text },
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
  userRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    gap: 10,
    width: '100%',
    flex: 1,
  },
  avatarMini: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden', 
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain', // Giữ nguyên tỷ lệ logo
  },
  nameContainer: { flex: 1, minWidth: 0, marginRight: 8 },
  userName: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  metaInfo: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { fontSize: 13, color: COLORS.muted },
  cardRight: { 
    alignItems: 'flex-end', 
    justifyContent: 'space-between',
    paddingLeft: 10,
  },
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