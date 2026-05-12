import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";

export default function EmployerJobDetailScreen({ user }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadJob() {
        try {
          setLoading(true);
          const row = await employerService.getJobById(user.id, jobId);
          if (active) setJob(row);
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        } finally {
          if (active) setLoading(false);
        }
      }
      loadJob();
      return () => { active = false; };
    }, [jobId, user.id])
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
        </View>
      </Screen>
    );
  }

  if (!job) return null;

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.statusRow}>
          <StatusBadge status={job.status} />
          <Pressable 
            onPress={() => navigation.navigate("EmployerJobForm", { jobId: job.id })}
            style={styles.editIconButton}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.action} />
            <Text style={styles.editText}>Sửa tin</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.companyName}>{job.company_name}</Text>

        <View style={styles.infoGrid}>
          <InfoItem icon="location-outline" label={job.location_name || "N/A"} />
          <InfoItem icon="briefcase-outline" label={job.work_type} />
          <InfoItem icon="cash-outline" label={job.salary || "Thỏa thuận"} color="#10B981" />
          <InfoItem icon="layers-outline" label={job.category_name || "N/A"} />
        </View>

        <View style={styles.divider} />

        <Pressable 
          onPress={() => navigation.navigate("JobApplications", { jobId: job.id, jobTitle: job.title })}
          style={styles.applicantBar}
        >
          <View style={styles.applicantInfo}>
            <Ionicons name="people" size={20} color={COLORS.action} />
            <Text style={styles.applicantText}>
              <Text style={styles.boldText}>{job.application_count || 0}</Text> ứng viên đã nộp
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
      </View>

      {/* Rejection Reason if any */}
      {job.reject_reason && (
        <View style={[styles.section, styles.rejectSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Lý do từ chối</Text>
          </View>
          <Text style={styles.sectionText}>{job.reject_reason}</Text>
        </View>
      )}

      {/* Content Sections */}
      <Section icon="document-text-outline" title="Mô tả công việc" content={job.description} />
      <Section icon="list-outline" title="Yêu cầu công việc" content={job.requirements} />

      <View style={styles.actions}>
        <PrimaryButton
          title="Xem danh sách ứng viên"
          icon="people-outline"
          onPress={() => navigation.navigate("JobApplications", { jobId: job.id, jobTitle: job.title })}
          style={styles.primaryAction}
        />
      </View>
    </Screen>
  );
}

function InfoItem({ icon, label, color = COLORS.muted }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.infoLabel, { color }]}>{label}</Text>
    </View>
  );
}

function Section({ icon, title, content }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={COLORS.text} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionText}>{content || "Chưa cập nhật nội dung."}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.muted,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.action + "10",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editText: {
    color: COLORS.action,
    fontWeight: "700",
    fontSize: 13,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 16,
    color: COLORS.action,
    fontWeight: "600",
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.5,
    marginBottom: 16,
  },
  applicantBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.action + "08",
    padding: 12,
    borderRadius: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applicantText: {
    fontSize: 15,
    color: COLORS.text,
  },
  boldText: {
    fontWeight: "800",
    color: COLORS.action,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rejectSection: {
    borderColor: COLORS.danger + "40",
    backgroundColor: COLORS.danger + "05",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },
  actions: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  primaryAction: {
    borderRadius: 14,
    height: 56,
  },
});