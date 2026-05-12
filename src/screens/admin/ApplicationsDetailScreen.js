import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

export default function AdminJobDetailScreen({ route, navigation }) {
  // Lấy applicationId từ params điều hướng
  const { applicationId } = route.params;
  const [application, setApplication] = useState(null);

  async function loadApplication() {
    try {
      const data = await adminService.getApplications({ limit: 100, offset: 0});
      const foundApplication = data.find(item => item.id === applicationId);

      if(foundApplication) {
        setApplication(foundApplication);

        if (foundApplication.status === "submitted") {
          await adminService.updateApplicationStatus(applicationId, "viewed");

          setApplication(prev => ({ ...prev, status: "viewed" }));
        }
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
        loadApplication();
    }, [applicationId])
  );

  async function handleUpdateStatus(nextStatus) {
    try {
      await adminService.updateApplicationStatus(applicationId, nextStatus);
      Alert.alert("Thành công", `Đơn ứng tuyển đã được chuyển sang trạng thái: ${nextStatus}`);
      loadApplication();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (!application) {
    return (
      <Screen>
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Đang tải chi tiết đơn ứng tuyển...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Thông tin công việc */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Công việc ứng tuyển</Text>
          <Text style={styles.jobTitle}>{application.title}</Text>
          <Text style={styles.companyName}>{application.company_name}</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={application.status} />
          </View>
        </View>

        {/* Thông tin ứng viên */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin ứng viên</Text>
          <Info label="Họ và tên" value={application.full_name} />
          <Info label="Email liên hệ" value={application.email} />
          <Info label="Thời gian nộp" value={new Date(application.created_at).toLocaleDateString('vi-VN')} />
        </View>

        {/* Nội dung giới thiệu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thư giới thiệu / Ghi chú</Text>
          <Text style={styles.content}>
            {application.cover_letter || "Ứng viên không để lại thư giới thiệu."}
          </Text>
        </View>

        {/* Các nút hành động */}
        <View style={styles.actionGroup}>
          <Pressable
            onPress={() => handleUpdateStatus("suitable")}
            style={({ pressed }) => [
              styles.actionButton,
              styles.suitableButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.suitableText}>Đánh dấu Phù hợp</Text>
          </Pressable>

          <Pressable
            onPress={() => handleUpdateStatus("rejected")}
            style={({ pressed }) => [
              styles.actionButton,
              styles.rejectButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.rejectText}>Từ chối đơn này</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Chưa cập nhật"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 32,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  jobTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "800",
  },
  companyName: {
    color: COLORS.action,
    fontSize: 16,
    fontWeight: "600",
  },
  statusRow: {
    marginTop: 4,
    flexDirection: "row",
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 15,
    marginTop: 2,
  },
  content: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actionGroup: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  suitableButton: {
    backgroundColor: COLORS.action,
    borderColor: COLORS.action,
  },
  rejectButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  suitableText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "800",
  },
  rejectText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "800",
  },
});