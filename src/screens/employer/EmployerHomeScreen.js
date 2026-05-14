import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";
import { authService } from "../../services/authService";

export default function EmployerHomeScreen({ user, onLogout }) {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
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
          const data = await employerService.getEmployerDashboard(user.id);
          if (active) setStats(data);
        } catch (err) {
          Alert.alert("Lỗi", "Không thể tải dữ liệu thống kê");
        } finally {
          if (active) setLoading(false);
        }
      }

      loadStats();
      return () => { active = false; };
    }, [user.id, navigation])
  );

  async function handleLogout() {
    await authService.logout();
    onLogout();
  }

return (
    <Screen>
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.mainContent}>
            {/* Header Section */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Tổng quan</Text>
                <Text style={styles.subtitle}>Chào buổi tối, {user.full_name.split(' ').pop()}</Text>
              </View>
            </View>

            {/* Stats Section */}
            <Text style={styles.sectionTitle}>Hiệu quả tuyển dụng</Text>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator color={COLORS.action} size="large" />
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <StatBox 
                  icon="document-text" 
                  label="Đơn ứng tuyển" 
                  value={stats.applicationCount} 
                  color="#6366F1" 
                  onPress={() => navigation.navigate("EmployerApplicationsTab")} 
                />
                <StatBox 
                  icon="time" 
                  label="Tin chờ duyệt" 
                  value={stats.pendingCount} 
                  color={COLORS.warning} 
                  onPress={() => navigation.navigate("EmployerJobsTab", { status: "pending" })}
                />
                <StatBox 
                  icon="checkmark-circle" 
                  label="Tin đã duyệt" 
                  value={stats.approvedCount} 
                  color="#10B981" 
                  onPress={() => navigation.navigate("EmployerJobsTab", { status: "approved" })}
                />
                <StatBox 
                  icon="close-circle" 
                  label="Tin bị từ chối" 
                  value={stats.rejectedCount} 
                  color={COLORS.danger} 
                  onPress={() => navigation.navigate("EmployerJobsTab", { status: "rejected" })}
                />
              </View>
            )}

            {/* Info Box */}
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Ionicons color={COLORS.action} name="rocket-outline" size={20} />
                <Text style={styles.noticeTitle}>Mẹo tuyển dụng</Text>
              </View>
              <Text style={styles.noticeText}>
                Hãy cập nhật đầy đủ mô tả công ty để tăng tỷ lệ ứng tuyển lên 40%.
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable 
              onPress={handleLogout} 
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
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
      <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Ionicons name="arrow-forward-outline" size={14} color={COLORS.muted} style={styles.arrowIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1, // Ép content chiếm toàn bộ chiều cao màn hình
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1, // Đẩy footer xuống đáy nếu nội dung ngắn
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 16,
    marginTop: 4,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.6,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    width: "48%", 
    gap: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  arrowIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  noticeBox: {
    backgroundColor: COLORS.action + "08", 
    borderColor: COLORS.action + "15",
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
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
    color: COLORS.text + "99",
    fontSize: 14,
    lineHeight: 22,
  },
  cardPressed: {
    backgroundColor: COLORS.background,
    transform: [{ scale: 0.96 }],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 10,
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger + "15",
    borderRadius: RADII.lg,
    borderWidth: 1,
  },
  logoutButtonPressed: {
    opacity: 0.5,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
  centerBox: {
    paddingVertical: 60,
    alignItems: "center",
  },
});