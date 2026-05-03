import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { LABELS } from "../../constants/labels";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { applicationService } from "../../services/applicationService";
import { cvService } from "../../services/cvService";
import { jobService } from "../../services/jobService";

export default function ApplyScreen({ route, navigation, user }) {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [fullCV, setFullCV] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [jobResult, cvResult, appliedResult] = await Promise.all([
        jobService.getJobById(jobId),
        cvService.getFullCV(user.id),
        applicationService.hasApplied(user.id, jobId),
      ]);

      if (!jobResult) {
        setError("Không tìm thấy việc hoặc việc chưa được duyệt.");
        return;
      }

      setJob(jobResult);
      setFullCV(cvResult);
      setAlreadyApplied(appliedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, user.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleCreateOrEditCV() {
    navigation.navigate("CreateCV", { returnJobId: jobId });
  }

  function handleUploadPlaceholder() {
    Alert.alert("Tải CV", "Chức năng tải CV sẽ được phát triển sau.");
  }

  async function handleSubmit() {
    try {
      setSubmitting(true);
      await applicationService.applyJob(user.id, jobId, fullCV.cv.id, coverLetter);
      Alert.alert("Ứng tuyển", "Nộp hồ sơ ứng tuyển thành công.", [
        {
          text: "Xem việc của tôi",
          onPress: () =>
            navigation.navigate("CandidateTabs", {
              screen: "MyJobsTab",
              params: { initialTab: "applied" },
            }),
        },
      ]);
    } catch (err) {
      Alert.alert(LABELS.common.error, err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải hồ sơ ứng tuyển...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <EmptyState icon="alert-circle-outline" title="Không tải được hồ sơ" message={error} />
      </Screen>
    );
  }

  const hasCompletedCV = Boolean(fullCV?.isCompleted);
  const canSubmit = hasCompletedCV && !alreadyApplied;

  return (
    <Screen
      contentContainerStyle={styles.scrollContent}
      edges={["left", "right"]}
      scroll
      style={styles.screen}
    >
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <Text style={styles.companyName}>{job.company_name}</Text>
        <View style={styles.metaRow}>
          <MetaText icon="location-outline" text={job.location_name || LABELS.common.noUpdate} />
          <MetaText icon="cash-outline" text={job.salary || LABELS.common.negotiableSalary} />
        </View>
      </View>

      {alreadyApplied ? (
        <NoticeBox
          icon="checkmark-circle-outline"
          title="Bạn đã ứng tuyển việc này"
          text="Mỗi công việc chỉ được nộp một hồ sơ ứng tuyển."
        />
      ) : null}

      {!hasCompletedCV ? (
        <NoticeBox
          action={<PrimaryButton onPress={handleCreateOrEditCV} title={LABELS.buttons.createCV} />}
          icon="document-text-outline"
          title="Bạn cần tạo CV để ứng tuyển"
          text="Hoàn thành thông tin cá nhân, kinh nghiệm và học vấn trước khi nộp hồ sơ."
        />
      ) : (
        <View style={styles.cvCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Hồ sơ ứng tuyển của bạn</Text>
          </View>

          <View style={styles.cvActions}>
            <ActionButton
              icon="eye-outline"
              title={LABELS.buttons.viewCV}
              onPress={() => navigation.navigate("CVPreview")}
            />
            <ActionButton
              icon="create-outline"
              title={LABELS.buttons.editCV}
              onPress={handleCreateOrEditCV}
            />
            <ActionButton
              icon="cloud-upload-outline"
              title={LABELS.buttons.uploadCV}
              onPress={handleUploadPlaceholder}
            />
          </View>
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.label}>Lời giới thiệu</Text>
        <TextInput
          editable={canSubmit}
          multiline
          onChangeText={setCoverLetter}
          placeholder="Lời giới thiệu ngắn, không bắt buộc"
          placeholderTextColor={COLORS.mutedLight}
          style={[styles.textArea, !canSubmit && styles.disabledInput]}
          textAlignVertical="top"
          value={coverLetter}
        />
      </View>

      <PrimaryButton
        disabled={!canSubmit}
        loading={submitting}
        onPress={handleSubmit}
        style={canSubmit ? styles.submitButton : null}
        title={LABELS.buttons.submitApplication}
      />
    </Screen>
  );
}

function MetaText({ icon, text }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={COLORS.muted} name={icon} size={15} />
      <Text numberOfLines={1} style={styles.metaText}>{text}</Text>
    </View>
  );
}

function NoticeBox({ icon, title, text, action }) {
  return (
    <View style={styles.noticeBox}>
      <View style={styles.noticeHeader}>
        <Ionicons color={COLORS.warning} name={icon} size={22} />
        <Text style={styles.noticeTitle}>{title}</Text>
      </View>
      <Text style={styles.noticeText}>{text}</Text>
      {action ? <View style={styles.noticeAction}>{action}</View> : null}
    </View>
  );
}

function ActionButton({ icon, title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
    >
      <Ionicons color={COLORS.text} name={icon} size={19} />
      <Text style={styles.actionText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 28,
    paddingTop: 12,
  },
  jobCard: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  jobTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  companyName: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 5,
  },
  metaRow: {
    gap: 6,
    marginTop: 12,
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  metaText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
  },
  cvCard: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  cvActions: {
    gap: 10,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  actionButtonPressed: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.action,
    transform: [{ scale: 0.99 }],
  },
  actionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  noticeBox: {
    backgroundColor: COLORS.warningSoft,
    borderColor: "#FCD34D",
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
    padding: 15,
  },
  noticeHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  noticeTitle: {
    color: COLORS.warning,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  noticeText: {
    color: COLORS.warning,
    fontSize: 14,
    lineHeight: 20,
  },
  noticeAction: {
    marginTop: 4,
  },
  field: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 116,
    padding: 12,
  },
  disabledInput: {
    backgroundColor: COLORS.surfaceMuted,
    opacity: 0.7,
  },
  submitButton: {
    backgroundColor: COLORS.action,
  },
  centerBox: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 32,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
