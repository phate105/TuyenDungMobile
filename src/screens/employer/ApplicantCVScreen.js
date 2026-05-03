import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { APPLICATION_STATUS } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { cvService } from "../../services/cvService";
import { employerService } from "../../services/employerService";

const applicationStatusLabels = {
  submitted: "Đã nộp",
  viewed: "Đã xem",
  suitable: "Phù hợp",
  rejected: "Bị từ chối",
};

const statusActions = [
  { label: "Đã xem", value: APPLICATION_STATUS.VIEWED },
  { label: "Phù hợp", value: APPLICATION_STATUS.SUITABLE },
  { label: "Từ chối", value: APPLICATION_STATUS.REJECTED },
];

export default function ApplicantCVScreen({ route, user }) {
  const { applicationId } = route.params;
  const [application, setApplication] = useState(null);
  const [fullCV, setFullCV] = useState(null);

  async function loadData() {
    try {
      const app = await employerService.getApplicationById(user.id, applicationId);

      if (!app) {
        Alert.alert("Lỗi", "Không tìm thấy đơn ứng tuyển.");
        return;
      }

      const cv = await cvService.getFullCV(app.candidate_id);
      setApplication(app);
      setFullCV(cv);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [applicationId, user.id]);

  async function handleUpdateStatus(status) {
    try {
      await employerService.updateApplicationStatus(user.id, applicationId, status);
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn.");
      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (!application || !fullCV) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Đang tải hồ sơ ứng viên...</Text>
      </Screen>
    );
  }

  const personalInfo = fullCV.personalInfo;

  return (
    <Screen scroll>
      <View style={styles.card}>
        <Text style={styles.title}>{application.candidate_name}</Text>
        <StatusBadge status={application.status} label={applicationStatusLabels[application.status]} />
        <Text style={styles.meta}>{application.candidate_email}</Text>
        <Text style={styles.meta}>{application.candidate_phone}</Text>
        <Text style={styles.meta}>Ứng tuyển: {application.job_title}</Text>
      </View>

      {application.cover_letter ? <Section title="Lời giới thiệu" text={application.cover_letter} /> : null}

      <Section
        title="Thông tin cá nhân"
        text={[
          personalInfo?.fullName,
          personalInfo?.email,
          personalInfo?.phone,
          personalInfo?.desiredTitle,
          personalInfo?.address,
          personalInfo?.careerObjective,
        ]
          .filter(Boolean)
          .join("\n")}
      />

      <Section
        title="Kinh nghiệm / dự án"
        text={fullCV.experiences
          .map((item) => `${item.title} - ${item.organization}\n${item.start_date || ""} - ${item.end_date || ""}\n${item.description}`)
          .join("\n\n")}
      />

      <Section
        title="Học vấn"
        text={fullCV.educations
          .map((item) => `${item.school}\n${item.major} - ${item.degree || ""}\n${item.start_year || ""} - ${item.end_year || ""}\n${item.description || ""}`)
          .join("\n\n")}
      />

      <Section title="Kỹ năng" text={fullCV.skills.map((item) => item.name).join(", ")} />

      <View style={styles.actions}>
        {statusActions.map((action) => (
          <Pressable
            key={action.value}
            onPress={() => handleUpdateStatus(action.value)}
            style={({ pressed }) => [styles.statusButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.statusButtonText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function Section({ text, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{text || "Chưa cập nhật"}</Text>
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
    marginBottom: 12,
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
  statusButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  statusButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
});
