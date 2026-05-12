import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ScrollView, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/theme";
import { JOB_STATUS } from "../../constants/appConstants";
import { adminService } from "../../services/adminService";

export default function JobDetailScreen({ route, navigation }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  async function loadJob() {
    try {
      const data = await adminService.getJobById(jobId);
      if (data) {
        setJob(data);
      } else {
        Alert.alert("Lỗi", "Không tìm thấy tin tuyển dụng.");
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadJob();
    }, [jobId])
  );

  async function handleApprove() {
    try {
      await adminService.approveJob(jobId);
      Alert.alert("Thành công", "Đã duyệt tin tuyển dụng này.");
      loadJob();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await adminService.rejectJob(jobId, rejectReason);
      Alert.alert("Thành công", "Đã từ chối tin tuyển dụng.");
      setShowRejectInput(false);
      loadJob();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (!job) {
    return (
      <Screen>
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Đang tải chi tiết công việc...</Text>
        </View>
      </Screen>
    );
  }

  const isPending = job.status === JOB_STATUS.PENDING;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Tiêu đề và Trạng thái */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{job.title}</Text>
            <StatusBadge status={job.status} />
          </View>
          <Text style={styles.companyName}>{job.company_name}</Text>
          <Text style={styles.metaText}>{job.location_name} • {job.work_type}</Text>
          <Text style={styles.salaryText}>{job.salary || "Thương lượng"}</Text>
        </View>

        {/* Chi tiết công việc */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mô tả công việc</Text>
          <Text style={styles.contentText}>{job.description}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Yêu cầu ứng viên</Text>
          <Text style={styles.contentText}>{job.requirements}</Text>
        </View>

        {/* Lý do từ chối (nếu có) */}
        {job.status === JOB_STATUS.REJECTED && job.reject_reason && (
          <View style={[styles.card, styles.rejectReasonCard]}>
            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Lý do từ chối trước đó</Text>
            <Text style={styles.contentText}>{job.reject_reason}</Text>
          </View>
        )}

        {/* Nhóm nút điều khiển cho Admin */}
        {isPending && (
          <View style={styles.adminActions}>
            {!showRejectInput ? (
              <>
                <Pressable onPress={handleApprove} style={[styles.btn, styles.btnApprove]}>
                  <Text style={styles.btnTextWhite}>Duyệt tin</Text>
                </Pressable>
                <Pressable onPress={() => setShowRejectInput(true)} style={[styles.btn, styles.btnRejectOutline]}>
                  <Text style={styles.btnTextReject}>Từ chối</Text>
                </Pressable>
              </>
            ) : (
              <View style={styles.rejectContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lý do từ chối..."
                  multiline
                  value={rejectReason}
                  onChangeText={setRejectReason}
                />
                <View style={styles.row}>
                  <Pressable onPress={handleReject} style={[styles.btnSmall, styles.btnApprove]}>
                    <Text style={styles.btnTextWhite}>Xác nhận từ chối</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowRejectInput(false)} style={[styles.btnSmall, styles.btnCancel]}>
                    <Text style={styles.btnText}>Hủy</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, paddingBottom: 32 },
  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: COLORS.text },
  companyName: { fontSize: 16, color: COLORS.action, fontWeight: "700", marginTop: 4 },
  metaText: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  salaryText: { fontSize: 15, fontWeight: "700", color: COLORS.success, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: COLORS.muted, textTransform: "uppercase", marginBottom: 8 },
  contentText: { fontSize: 15, color: COLORS.text, lineHeight: 22 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  rejectReasonCard: { borderColor: COLORS.danger, backgroundColor: "#FFF5F5" },
  adminActions: { gap: 12, marginTop: 8 },
  btn: { height: 50, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  btnApprove: { backgroundColor: COLORS.action },
  btnRejectOutline: { borderWidth: 1, borderColor: COLORS.danger },
  btnTextWhite: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  btnTextReject: { color: COLORS.danger, fontWeight: "800", fontSize: 16 },
  rejectContainer: { gap: 10 },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: { flexDirection: "row", gap: 10 },
  btnSmall: { flex: 1, height: 44, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  btnCancel: { backgroundColor: COLORS.border },
  btnText: { fontWeight: "700" },
  emptyText: { color: COLORS.muted },
});