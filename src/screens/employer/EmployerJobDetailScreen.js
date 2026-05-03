import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const jobStatusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

export default function EmployerJobDetailScreen({ navigation, route, user }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadJob() {
        try {
          const row = await employerService.getJobById(user.id, jobId);

          if (active) {
            setJob(row);
          }
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      }

      loadJob();

      return () => {
        active = false;
      };
    }, [jobId, user.id])
  );

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
        <StatusBadge status={job.status} label={jobStatusLabels[job.status]} />
        <Text style={styles.meta}>{job.company_name}</Text>
        <Text style={styles.meta}>{job.category_name || "Chưa cập nhật"} • {job.location_name || "Chưa cập nhật"}</Text>
        <Text style={styles.meta}>{job.salary || "Thỏa thuận"} • {job.work_type}</Text>
        <Text style={styles.meta}>Ứng viên: {job.application_count || 0}</Text>
      </View>

      <Section title="Mô tả công việc" content={job.description} />
      <Section title="Yêu cầu công việc" content={job.requirements} />

      {job.reject_reason ? <Section title="Lý do từ chối" content={job.reject_reason} /> : null}

      <View style={styles.actions}>
        <PrimaryButton
          title="Xem ứng viên"
          onPress={() => navigation.navigate("JobApplications", { jobId: job.id, jobTitle: job.title })}
        />
        <Pressable
          onPress={() => navigation.navigate("EmployerJobForm", { jobId: job.id })}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>Sửa tin</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Section({ content, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{content || "Chưa cập nhật"}</Text>
    </View>
  );
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
    gap: 8,
    marginBottom: 14,
    padding: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
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
  actions: {
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: "center",
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  secondaryText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
});
