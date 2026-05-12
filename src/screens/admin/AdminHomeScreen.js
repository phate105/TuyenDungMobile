import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";

export default function AdminHomeScreen({ user, onLogout }) {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    candidateCount: 0,
    employerCount: 0,
    pendingJobCount: 0,
    approvedJobCount: 0,
    rejectedJobCount: 0,
    applicationCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ headerShown: false });
      let active = true;

      async function loadStats() {
        try {
          setLoading(true);
          const data = await adminService.getDashboardStats();
          if (active) setStats(data);
        } catch (err) {
          Alert.alert("Lỗi", "Không thể tải dữ liệu hệ thống");
        } finally {
          if (active) setLoading(false);
        }
      }

      loadStats();
      return () => { active = false; };
    }, [navigation])
  );

  async function handleLogout() {
    await authService.logout();
    onLogout();
  }

  const renderHeader = () => (
    <View style={styles.mainContent}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quản trị hệ thống</Text>
          <Text style={styles.subtitle}>Chào trở lại, {user.full_name}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.action} />
        </View>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Thống kê tổng thể</Text>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <StatBox 
            icon="people" 
            label="Ứng viên" 
            value={stats.candidateCount} 
            color={COLORS.action} 
            onPress={() => navigation.navigate("AdminUsersTab", { role: "candidate" })}
          />
          <StatBox 
            icon="business" 
            label="Nhà tuyển dụng" 
            value={stats.employerCount} 
            color="#6366F1" 
            onPress={() => navigation.navigate("AdminUsersTab", { role: "employer" })}
          />
          <StatBox 
            icon="time" 
            label="Tin chờ duyệt" 
            value={stats.pendingJobCount} 
            color={COLORS.warning} 
            onPress={() => navigation.navigate("AdminJobsTab", { role: "pending" })}
          />
          <StatBox 
            icon="copy" 
            label="Đơn ứng tuyển" 
            value={stats.applicationCount} 
            color="#8B5CF6" 
            onPress={() => navigation.navigate("AdminApplicationsTab")}
          />
          <StatBox 
            icon="checkmark-circle" 
            label="Tin đã duyệt" 
            value={stats.approvedJobCount} 
            color="#10B981" 
            onPress={() => navigation.navigate("AdminJobsTab", { role: "approved" })}
          />
          <StatBox 
            icon="close-circle" 
            label="Tin bị từ chối" 
            value={stats.rejectedJobCount} 
            color={COLORS.danger} 
            onPress={() => navigation.navigate("AdminJobsTab", { role: "rejected" })}
          />
        </View>
      )}

      {/* Control Panel Hint */}
      <View style={styles.noticeBox}>
        <View style={styles.noticeHeader}>
          <Ionicons color={COLORS.action} name="settings-outline" size={20} />
          <Text style={styles.noticeTitle}>Bảng điều khiển</Text>
        </View>
        <Text style={styles.noticeText}>
          Sử dụng các thẻ thống kê để truy cập nhanh vào danh sách quản lý tương ứng.
        </Text>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable 
              onPress={handleLogout} 
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={styles.logoutText}>Đăng xuất quản trị</Text>
            </Pressable>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

function StatBox({ label, value, icon, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.statBox, pressed && styles.cardPressed]} 
    >
      <View style={[styles.iconCircle, { backgroundColor: color + "10" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 4,
  },
  adminBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.action + "15",
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14,
    width: "48%", 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  noticeBox: {
    backgroundColor: COLORS.action + "08", 
    borderColor: COLORS.action + "15",
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    marginVertical: 10,
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  noticeTitle: {
    color: COLORS.action,
    fontSize: 15,
    fontWeight: "700",
  },
  noticeText: {
    color: COLORS.text + "90",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dangerSoft,
    padding: 16,
    borderRadius: RADII.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.danger + "15",
    width: "100%",
  },
  logoutButtonPressed: {
    opacity: 0.5,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  cardPressed: {
    backgroundColor: COLORS.background,
    transform: [{ scale: 0.97 }],
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: "center",
  },
});