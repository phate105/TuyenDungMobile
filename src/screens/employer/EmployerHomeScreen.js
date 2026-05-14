import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { authService } from "../../services/authService";
import { employerService } from "../../services/employerService";

const BELL_ICON = require("../../../assets/icons/bell.png");
const ICONS = {
  create: require("../../../assets/icons/donUngTuyen.png"),
  company: require("../../../assets/icons/nhaTuyenDung.png"),
  pending: require("../../../assets/icons/choDuyet.png"),
  approved: require("../../../assets/icons/daDuyet.png"),
  rejected: require("../../../assets/icons/tuChoi.png"),
  application: require("../../../assets/icons/ungVien.png"),
};

export default function EmployerHomeScreen({ onLogout, user }) {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
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
          setLoading(true);
          const data = await employerService.getEmployerDashboard(user.id);
          if (active) {
            setStats(data);
          }
        } catch (error) {
          Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu thống kê.");
        } finally {
          if (active) {
            setLoading(false);
          }
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

  function handlePressNotification() {
    Alert.alert("Thông báo", "Chức năng thông báo sẽ được phát triển sau.");
  }

  const cards = useMemo(
    () => [
      {
        title: "Đăng tin mới",
        value: "Tạo",
        icon: ICONS.create,
        onPress: () => navigation.navigate("EmployerJobForm"),
      },
      {
        title: "Hồ sơ công ty",
        value: "Sửa",
        icon: ICONS.company,
        onPress: () => navigation.navigate("CompanyProfileTab"),
      },
      {
        title: "Tin chờ duyệt",
        value: stats.pendingCount,
        icon: ICONS.pending,
        onPress: () => navigation.navigate("EmployerJobsTab", { status: "pending" }),
      },
      {
        title: "Tin đã duyệt",
        value: stats.approvedCount,
        icon: ICONS.approved,
        onPress: () => navigation.navigate("EmployerJobsTab", { status: "approved" }),
      },
      {
        title: "Tin bị từ chối",
        value: stats.rejectedCount,
        icon: ICONS.rejected,
        onPress: () => navigation.navigate("EmployerJobsTab", { status: "rejected" }),
      },
      {
        title: "Đơn ứng tuyển",
        value: stats.applicationCount,
        icon: ICONS.application,
        onPress: () => navigation.navigate("EmployerApplicationsTab"),
      },
    ],
    [navigation, stats]
  );

  return (
    <Screen edges={["top", "left", "right"]} contentStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Tổng quan</Text>
            <Pressable
              onPress={handlePressNotification}
              style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
            >
              <Image source={BELL_ICON} style={styles.bellImage} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.bodyScroll}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.action} size="large" />
            </View>
          ) : (
            <View style={styles.cardGrid}>
              {cards.map((item) => (
                <Pressable
                  key={item.title}
                  onPress={item.onPress}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <View style={styles.cardIcon}>
                    <Image source={item.icon} style={styles.cardIconImage} />
                  </View>
                  <Text style={styles.cardValue}>{item.value}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
          >
            <Ionicons color={COLORS.danger} name="log-out-outline" size={18} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  page: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  hero: {
    backgroundColor: COLORS.background,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    color: COLORS.text,
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  bellButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  bellImage: {
    height: 22,
    resizeMode: "contain",
    width: 22,
  },
  bodyScroll: {
    backgroundColor: COLORS.surface,
    flex: 1,
  },
  body: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: "#D1D5DB",
    borderRadius: RADII.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 150,
    paddingHorizontal: 10,
    paddingVertical: 14,
    width: "48%",
  },
  cardPressed: {
    backgroundColor: COLORS.actionSoft,
    borderColor: COLORS.action,
    opacity: 0.95,
    transform: [{ scale: 0.96 }],
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 20,
    height: 64,
    justifyContent: "center",
    overflow: "hidden",
    width: 64,
  },
  cardIconImage: {
    height: 38,
    resizeMode: "contain",
    width: 38,
  },
  cardValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
  cardTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "400",
    marginTop: 6,
    textAlign: "center",
  },
  logoutButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
  },
  logoutPressed: {
    backgroundColor: COLORS.dangerSoft,
    opacity: 0.95,
    transform: [{ scale: 0.96 }],
  },
});
