import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";

const actions = [
  {
    route: "PendingJobs",
    title: "Duyệt tin tuyển dụng",
    description: "Xem, duyệt hoặc từ chối các tin đang chờ duyệt.",
  },
  {
    route: "UserManagement",
    title: "Quản lý tài khoản",
    description: "Xem ứng viên, nhà tuyển dụng và khóa hoặc mở khóa tài khoản.",
  },
];

export default function AdminHomeScreen({ navigation, user, onLogout }) {
  const [stats, setStats] = useState({
    candidateCount: 0,
    employerCount: 0,
    pendingJobCount: 0,
    approvedJobCount: 0,
    rejectedJobCount: 0,
    applicationCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStats() {
        try {
          const data = await adminService.getDashboardStats();

          if (active) {
            setStats(data);
          }
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      }

      loadStats();

      return () => {
        active = false;
      };
    }, [])
  );

  async function handleLogout() {
    await authService.logout();
    onLogout();
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Quản trị viên</Text>
      <Text style={styles.subtitle}>{user.full_name}</Text>

      <View style={styles.statsGrid}>
        <StatBox label="Ứng viên" value={stats.candidateCount} />
        <StatBox label="Nhà tuyển dụng" value={stats.employerCount} />
        <StatBox label="Tin chờ duyệt" value={stats.pendingJobCount} />
        <StatBox label="Đơn ứng tuyển" value={stats.applicationCount} />
        <StatBox label="Tin đã duyệt" value={stats.approvedJobCount} />
        <StatBox label="Tin bị từ chối" value={stats.rejectedJobCount} />
      </View>

      <View style={styles.actionList}>
        {actions.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => [styles.actionCard, pressed && styles.cardPressed]}
          >
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionDescription}>{item.description}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutButton, pressed && styles.cardPressed]}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </Screen>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginBottom: 16,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  statBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    padding: 14,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  actionList: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  actionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  actionDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
