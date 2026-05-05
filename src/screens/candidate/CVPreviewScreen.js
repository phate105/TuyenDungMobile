import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import EmptyState from "../../components/EmptyState";
import Screen from "../../components/Screen";
import { LABELS } from "../../constants/labels";
import { COLORS, RADII } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function CVPreviewScreen({ user }) {
  const [fullCV, setFullCV] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCV() {
      const result = await cvService.getFullCV(user.id);
      setFullCV(result);
      setLoading(false);
    }

    loadCV();
  }, [user.id]);

  if (loading) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải CV...</Text>
        </View>
      </Screen>
    );
  }

  if (!fullCV.cv) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <EmptyState
          icon="document-text-outline"
          title="Bạn chưa tạo CV"
          message="Tạo CV theo form để có thể ứng tuyển việc làm."
        />
      </Screen>
    );
  }

  const { personalInfo, experiences, educations, skills } = fullCV;
  const experience = experiences[0];
  const education = educations[0];

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll style={styles.screen}>
      <View style={styles.resume}>
        <View style={styles.resumeHeader}>
          <Text style={styles.name}>{personalInfo?.fullName}</Text>
          {personalInfo?.desiredTitle ? (
            <Text style={styles.desiredTitle}>{personalInfo.desiredTitle}</Text>
          ) : null}
          <Text style={styles.contactLine}>
            {[personalInfo?.email, personalInfo?.phone, personalInfo?.address].filter(Boolean).join(" | ")}
          </Text>
        </View>

        <PreviewSection
          title="Mục tiêu nghề nghiệp"
          text={personalInfo?.careerObjective || LABELS.common.noUpdate}
        />

        <PreviewSection
          title="Kinh nghiệm / Dự án"
          text={
            experience
              ? `${experience.organization} - ${experience.title}\n${experience.start_date} - ${
                  experience.is_current ? "Hiện tại" : experience.end_date
                }\n${experience.description}`
              : LABELS.common.noUpdate
          }
        />

        <PreviewSection
          title="Học vấn"
          text={
            education
              ? `${education.school} - ${education.major}\n${education.start_year} - ${education.end_year}${
                  education.description ? `\n${education.description}` : ""
                }`
              : LABELS.common.noUpdate
          }
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kỹ năng</Text>
          {skills.length ? (
            <View style={styles.skillWrap}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillChip}>
                  {skill.name}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.sectionText}>{LABELS.common.noUpdate}</Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

function PreviewSection({ title, text }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 36,
    paddingTop: 8,
  },
  resume: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  resumeHeader: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    backgroundColor: "#FBFAF7",
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "600",
  },
  desiredTitle: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "500",
    marginTop: 6,
  },
  contactLine: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  section: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 9,
  },
  sectionText: {
    color: "#2B2B2B",
    fontSize: 15,
    lineHeight: 23,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  centerBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
