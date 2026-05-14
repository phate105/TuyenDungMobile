import { useEffect, useState, useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { APPLICATION_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { cvService } from "../../services/cvService";
import { employerService } from "../../services/employerService";

const applicationStatusLabels = {
  submitted: "Đã nộp",
  under_review: "Đang xem xét",
  suitable: "Phù hợp",
  rejected: "Bị từ chối",
};

export default function ApplicantCVScreen({ route, user }) {
  const { applicationId } = route.params;
  const [application, setApplication] = useState(null);
  const [fullCV, setFullCV] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [applicationId, user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleUpdateStatus(status) {
    try {
      await employerService.updateApplicationStatus(user.id, applicationId, status);
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn.");
      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
        </View>
      </Screen>
    );
  }

  const { personalInfo } = fullCV;

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>{application.candidate_name?.charAt(0)}</Text>
        </View>
        <Text style={styles.candidateName}>{application.candidate_name}</Text>
        <Text style={styles.desiredTitle}>{personalInfo?.desiredTitle || "Ứng viên"}</Text>
        <View style={styles.badgeWrapper}>
          <StatusBadge status={application.status} label={applicationStatusLabels[application.status]} />
        </View>

        <View style={styles.contactRow}>
          <ContactChip icon="mail-outline" label={application.candidate_email} />
          <ContactChip icon="call-outline" label={application.candidate_phone} />
        </View>
      </View>

      {/* Main Content */}
      <Section title="Lời giới thiệu" icon="chatbubble-ellipses-outline">
        {application.cover_letter ? (
          <Text style={styles.sectionText}>{application.cover_letter}</Text>
        ) : (
          <Text style={styles.emptyText}>Chưa có lời nhắn đi kèm.</Text>
        )}      
      </Section>

      <Section title="Kinh nghiệm & Dự án" icon="briefcase-outline">
        {fullCV.experiences.length > 0 ? (
          fullCV.experiences.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSub}>{item.organization}</Text>
              <Text style={styles.itemDate}>{item.start_date} - {item.end_date || "Hiện tại"}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Chưa cập nhật kinh nghiệm.</Text>
        )}
      </Section>

      <Section title="Học vấn" icon="school-outline">
        {fullCV.educations.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <Text style={styles.itemTitle}>{item.school}</Text>
            <Text style={styles.itemSub}>{item.major} • {item.degree}</Text>
            <Text style={styles.itemDate}>{item.start_year} - {item.end_year}</Text>
          </View>
        ))}
      </Section>

      <Section title="Kỹ năng" icon="ribbon-outline">
        <View style={styles.skillContainer}>
          {fullCV.skills && fullCV.skills.length > 0 ? (
            fullCV.skills.map((item, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{item.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có thông tin kỹ năng.</Text>
          )}
        </View>
      </Section>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Text style={styles.actionLabel}>Cập nhật trạng thái hồ sơ:</Text>
        <View style={styles.buttonGrid}>
          <ActionButton 
            label="Phù hợp" 
            icon="checkmark-circle" 
            color="#10B981" 
            onPress={() => handleUpdateStatus(APPLICATION_STATUS.SUITABLE)} 
          />
          <ActionButton 
            label="Xem xét" 
            icon="eye" 
            color={COLORS.action} 
            onPress={() => handleUpdateStatus(APPLICATION_STATUS.UNDER_REVIEW)} 
          />
          <ActionButton 
            label="Từ chối" 
            icon="close-circle" 
            color={COLORS.danger} 
            onPress={() => handleUpdateStatus(APPLICATION_STATUS.REJECTED)} 
          />
        </View>
      </View>
    </Screen>
  );
}

// Sub-components
function Section({ title, icon, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={COLORS.action} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ContactChip({ icon, label }) {
  return (
    <View style={styles.contactChip}>
      <Ionicons name={icon} size={14} color={COLORS.muted} />
      <Text style={styles.contactLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, icon, color, onPress }) {
  return (
    <Pressable 
      onPress={onPress} 
      style={({ pressed }) => [
        styles.actionButton, 
        { borderColor: color + "40", backgroundColor: color + "08" },
        pressed && { opacity: 0.7, backgroundColor: color + "15" }
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.action + "15",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: { fontSize: 32, fontWeight: "800", color: COLORS.action },
  candidateName: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 4 },
  desiredTitle: { fontSize: 16, color: COLORS.muted, marginBottom: 12 },
  badgeWrapper: { marginBottom: 20 },
  contactRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contactLabel: { fontSize: 13, color: COLORS.muted },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: COLORS.text },
  sectionText: { fontSize: 15, color: COLORS.text, lineHeight: 24, opacity: 0.8 },
  timelineItem: { marginBottom: 20, borderLeftWidth: 2, borderLeftColor: COLORS.border, paddingLeft: 16 },
  itemTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  itemSub: { fontSize: 14, color: COLORS.action, fontWeight: "600", marginVertical: 2 },
  itemDate: { fontSize: 12, color: COLORS.muted, marginBottom: 6 },
  itemDesc: { fontSize: 14, color: COLORS.text, opacity: 0.7, lineHeight: 20 },
  skillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skillText: { fontSize: 14, color: COLORS.text, fontWeight: "500" },
  actionContainer: { paddingHorizontal: 16, marginTop: 10 },
  actionLabel: { fontSize: 15, fontWeight: "700", color: COLORS.muted, marginBottom: 12, marginLeft: 4 },
  buttonGrid: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    height: 70,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: { fontSize: 13, fontWeight: "800" },
  emptyText: { color: COLORS.muted, fontStyle: 'italic' }
});