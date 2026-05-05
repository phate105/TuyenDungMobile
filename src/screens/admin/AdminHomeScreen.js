import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";

export default function AdminHomeScreen({ user, onLogout }) {
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
      <View style={styles.header}>
        <Text style={styles.title}>Tổng quan quản trị</Text>
        <Text style={styles.subtitle}>{user.full_name}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatBox label="Ứng viên" value={stats.candidateCount} />
        <StatBox label="Nhà tuyển dụng" value={stats.employerCount} />
        <StatBox label="Tin chờ duyệt" value={stats.pendingJobCount} />
        <StatBox label="Đơn ứng tuyển" value={stats.applicationCount} />
        <StatBox label="Tin đã duyệt" value={stats.approvedJobCount} />
        <StatBox label="Tin bị từ chối" value={stats.rejectedJobCount} />
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Khu vực quản trị</Text>
        <Text style={styles.noteText}>Dùng thanh menu bên dưới để chuyển giữa Tổng quan, Tin tuyển dụng và Tài khoản.</Text>
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
  header: {
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
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
  noteBox: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  noteTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  noteText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
