import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { JOB_STATUS } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

export default function AdminJobDetailScreen({ navigation, route }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  async function loadJob() {
    try {
      const row = await adminService.getJobById(jobId);
      setJob(row);
      setRejectReason(row?.reject_reason || "");
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
      Alert.alert("Thành công", "Đã duyệt tin tuyển dụng.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  async function handleReject() {
    try {
      await adminService.rejectJob(jobId, rejectReason);
      Alert.alert("Thành công", "Đã từ chối tin tuyển dụng.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (!job) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Đang tải tin tuyển dụng...</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.card}>
        <Text style={styles.title}>{job.title}</Text>
        <StatusBadge status={job.status} />
        <Info label="Công ty" value={job.company_name} />
        <Info label="Ngành nghề" value={job.category_name || "Chưa cập nhật"} />
        <Info label="Địa điểm" value={job.location_name || "Chưa cập nhật"} />
        <Info label="Mức lương" value={job.salary || "Thương lượng"} />
        <Info label="Hình thức" value={job.work_type || "Chưa cập nhật"} />
      </View>

      <Section title="Mô tả công việc" text={job.description} />
      <Section title="Yêu cầu công việc" text={job.requirements} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lý do từ chối</Text>
        <TextInput
          multiline
          onChangeText={setRejectReason}
          placeholder="Nhập lý do nếu từ chối"
          style={styles.textArea}
          textAlignVertical="top"
          value={rejectReason}
        />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          disabled={job.status === JOB_STATUS.APPROVED}
          onPress={handleApprove}
          title={job.status === JOB_STATUS.APPROVED ? "Đã duyệt" : "Duyệt tin"}
        />
        <Pressable
          disabled={job.status === JOB_STATUS.REJECTED}
          onPress={handleReject}
          style={({ pressed }) => [
            styles.rejectButton,
            pressed && styles.buttonPressed,
            job.status === JOB_STATUS.REJECTED && styles.disabledButton,
          ]}
        >
          <Text style={styles.rejectText}>
            {job.status === JOB_STATUS.REJECTED ? "Đã từ chối" : "Từ chối tin"}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({ text, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailTextBlock}>
        {formatDetailLines(text || "Chưa cập nhật", title).map((line, index) => {
          if (line.type === "heading") {
            return (
              <Text key={`${line.text}-${index}`} style={styles.detailHeading}>
                {line.text}
              </Text>
            );
          }

          if (line.type === "bullet") {
            return (
              <View key={`${line.text}-${index}`} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line.text}</Text>
              </View>
            );
          }

          return (
            <Text key={`${line.text}-${index}`} style={styles.sectionText}>
              {line.text}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function formatDetailLines(content, title) {
  const skipHeading = title.toLowerCase();

  return String(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const normalizedLine = line.replace(/^[-•]\s*/, "").trim();
      const lowerLine = normalizedLine.replace(/:$/, "").toLowerCase();

      if (lowerLine === skipHeading) {
        return null;
      }

      if (line.startsWith("-") || line.startsWith("•")) {
        return { text: normalizedLine, type: "bullet" };
      }

      if (line.endsWith(":")) {
        return { text: line.replace(/:$/, ""), type: "heading" };
      }

      return { text: line, type: "text" };
    })
    .filter(Boolean);
}

const styles = StyleSheet.create({
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
    padding: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 28,
  },
  infoRow: {
    gap: 3,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 15,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  sectionText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  detailTextBlock: {
    gap: 6,
  },
  detailHeading: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 22,
    marginTop: 8,
  },
  bulletRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  bulletDot: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
    width: 10,
  },
  bulletText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  textArea: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    minHeight: 90,
    padding: 12,
  },
  actions: {
    gap: 10,
  },
  rejectButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  buttonPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  disabledButton: {
    opacity: 0.6,
  },
  rejectText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "700",
  },
});
