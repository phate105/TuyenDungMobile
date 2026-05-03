import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { authService } from "../../services/authService";
import { employerService } from "../../services/employerService";

const actions = [
  { route: "EmployerJobs", title: "Tin tuyển dụng", description: "Tạo, sửa và xem trạng thái tin đã đăng." },
  { route: "CompanyProfile", title: "Hồ sơ công ty", description: "Cập nhật tên, lĩnh vực và địa chỉ công ty." },
];

export default function EmployerHomeScreen({ navigation, user, onLogout }) {
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    applicationCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStats() {
        try {
          const data = await employerService.getEmployerDashboard(user.id);

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
    }, [user.id])
  );

  async function handleLogout() {
    await authService.logout();
    onLogout();
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Nhà tuyển dụng</Text>
      <Text style={styles.subtitle}>{user.full_name}</Text>

      <View style={styles.statsGrid}>
        <StatBox label="Chờ duyệt" value={stats.pendingCount} />
        <StatBox label="Đã duyệt" value={stats.approvedCount} />
        <StatBox label="Bị từ chối" value={stats.rejectedCount} />
        <StatBox label="Đơn ứng tuyển" value={stats.applicationCount} />
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
    marginTop: 4,
    marginBottom: 16,
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
