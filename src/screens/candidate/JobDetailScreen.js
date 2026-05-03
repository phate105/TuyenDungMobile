import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";
import { getCompanyLogoSource } from "../../constants/companyLogos";
import { LABELS, getWorkTypeLabel } from "../../constants/labels";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { applicationService } from "../../services/applicationService";
import { jobService } from "../../services/jobService";

const HEADER_ROW_HEIGHT = 52;

export default function JobDetailScreen({ route, navigation, user }) {
  const { jobId } = route.params;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");
  const logoSource = getCompanyLogoSource(job?.logo_path);

  useFocusEffect(
    useCallback(() => {
    let mounted = true;

    async function loadJob() {
      try {
        setLoading(true);
        setError("");

        const [result, savedResult, appliedResult] = await Promise.all([
          jobService.getJobById(jobId),
          user?.id ? jobService.isJobSaved(user.id, jobId) : Promise.resolve(false),
          user?.id ? applicationService.hasApplied(user.id, jobId) : Promise.resolve(false),
        ]);

        if (!mounted) {
          return;
        }

        if (!result) {
          setError("Không tìm thấy việc hoặc việc chưa được duyệt.");
          return;
        }

        setJob(result);
        setSaved(savedResult);
        setApplied(appliedResult);
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      mounted = false;
    };
    }, [jobId, user?.id])
  );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 58, 59],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 58, 59],
    outputRange: [6, 6, 0],
    extrapolate: "clamp",
  });

  function handleApply() {
    if (applied) {
      return;
    }

    navigation.navigate("Apply", { jobId });
  }

  function handleOpenCompany() {
    if (job?.company_id) {
      navigation.navigate("CompanyDetail", { companyId: job.company_id });
    }
  }

  async function handleToggleSave() {
    if (!user?.id || saving) {
      return;
    }

    try {
      setSaving(true);

      if (saved) {
        await jobService.unsaveJob(user.id, jobId);
        setSaved(false);
      } else {
        await jobService.saveJob(user.id, jobId);
        setSaved(true);
      }
    } catch (err) {
      Alert.alert("Thông báo", err.message || "Không thể cập nhật việc đã lưu.");
    } finally {
      setSaving(false);
    }
  }

  function renderContent() {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải thông tin công việc...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerBox}>
          <EmptyState
            icon="alert-circle-outline"
            title="Không tải được công việc"
            message={error}
          />
        </View>
      );
    }

    return (
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 10) },
        ]}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { paddingTop: insets.top + HEADER_ROW_HEIGHT - 35 }]}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleOpenCompany} style={styles.logoShell}>
            <View style={styles.logoBadge}>
              {logoSource ? (
                <Image resizeMode="contain" source={logoSource} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoBadgeText}>{job.company_name?.charAt(0) || "V"}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.summaryContent}>
            <Text style={styles.heroTitle}>{job.title}</Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handleOpenCompany} style={styles.companyLink}>
              <Text numberOfLines={1} style={styles.heroCompany}>
                {job.company_name}
              </Text>
              <Ionicons color={COLORS.muted} name="chevron-forward" size={15} />
            </TouchableOpacity>

            <View style={styles.metaGrid}>
              <MetaItem
                icon="cash-outline"
                label="Mức lương"
                value={job.salary || LABELS.common.negotiableSalary}
                withRightBorder
              />
              <MetaItem
                icon="location-outline"
                label="Địa điểm"
                value={job.location_name || LABELS.common.noUpdate}
              />
              <MetaItem
                icon="time-outline"
                label="Hình thức"
                value={getWorkTypeLabel(job.work_type)}
                withRightBorder
              />
              <MetaItem
                icon="briefcase-outline"
                label="Ngành nghề"
                value={job.category_name || LABELS.common.noUpdate}
              />
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.contentInner}>
            <SectionBlock title="Mô tả công việc" content={job.description} />
            <View style={styles.sectionSpacing} />
            <SectionBlock title="Yêu cầu ứng viên" content={job.requirements} />
            <View style={styles.divider} />
            <TouchableOpacity activeOpacity={0.85} onPress={handleOpenCompany}>
              <View style={styles.companySectionHeader}>
                <Text style={styles.sectionTitle}>Giới thiệu công ty</Text>
                <View style={styles.companySectionAction}>
                  <Text style={styles.companySectionActionText}>Xem công ty</Text>
                  <Ionicons color={COLORS.action} name="chevron-forward" size={15} />
                </View>
              </View>
              <Text style={styles.sectionText}>
                {[job.company_field, job.company_address].filter(Boolean).join("\n") ||
                  LABELS.common.noUpdate}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <Animated.View style={[styles.headerDivider, { opacity: headerOpacity }]} />

        <View style={[styles.headerRow, { paddingTop: insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons color={COLORS.text} name="arrow-back" size={24} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerTitleWrap,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Text numberOfLines={1} style={styles.headerTitle}>
              {job?.title || "Chi tiết việc làm"}
            </Text>
            {job?.company_name ? (
              <Text numberOfLines={1} style={styles.headerSubtitle}>
                {job.company_name}
              </Text>
            ) : null}
          </Animated.View>

          <View style={styles.headerButtonSpacer} />
        </View>
      </View>

      {renderContent()}

      {!loading && !error ? (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={saving}
            onPress={handleToggleSave}
            style={[styles.saveButton, saved && styles.saveButtonActive]}
          >
            {saving ? (
              <ActivityIndicator color={saved ? COLORS.favorite : COLORS.text} />
            ) : (
              <Ionicons
                color={saved ? COLORS.favorite : COLORS.text}
                name={saved ? "heart" : "heart-outline"}
                size={22}
              />
            )}
          </TouchableOpacity>

          <PrimaryButton
            disabled={applied}
            style={[styles.applyButton, applied && styles.applyButtonDisabled]}
            title={applied ? "Đã ứng tuyển" : LABELS.buttons.apply}
            onPress={handleApply}
          />
        </View>
      ) : null}
    </View>
  );
}

function MetaItem({ icon, label, value, withRightBorder = false }) {
  return (
    <View style={[styles.metaItem, withRightBorder && styles.metaItemWithRightBorder]}>
      <Ionicons color={COLORS.action} name={icon} size={18} style={styles.metaItemIcon} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

function SectionBlock({ title, content }) {
  const lines = formatDetailLines(content || LABELS.common.noUpdate, title);

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailTextBlock}>
        {lines.map((line, index) => {
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
  screen: {
    backgroundColor: COLORS.surface,
    flex: 1,
  },
  headerWrap: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
  },
  headerDivider: {
    backgroundColor: COLORS.border,
    bottom: 0,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: HEADER_ROW_HEIGHT,
    paddingHorizontal: 12,
  },
  headerButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerButtonSpacer: {
    width: 40,
  },
  headerTitleWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  scrollContent: {
    backgroundColor: COLORS.surface,
  },
  heroSection: {
    backgroundColor: "#F2F6F6",
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  logoShell: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoBadge: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    height: 78,
    justifyContent: "center",
    width: 78,
    ...SHADOWS.card,
  },
  logoBadgeText: {
    color: COLORS.surface,
    fontSize: 34,
    fontWeight: "900",
  },
  logoImage: {
    height: "82%",
    width: "82%",
  },
  summaryContent: {
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 31,
    textAlign: "center",
  },
  heroCompany: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
  },
  companyLink: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 2,
    marginTop: 8,
    maxWidth: "100%",
  },
  metaGrid: {
    borderTopColor: "rgba(17, 17, 17, 0.08)",
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },
  metaItem: {
    alignItems: "center",
    borderBottomColor: "rgba(17, 17, 17, 0.06)",
    borderBottomWidth: 1,
    justifyContent: "flex-start",
    minHeight: 94,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: "50%",
  },
  metaItemWithRightBorder: {
    borderRightColor: "rgba(17, 17, 17, 0.06)",
    borderRightWidth: 1,
  },
  metaItemIcon: {
    marginBottom: 8,
  },
  metaLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
  },
  contentSection: {
    backgroundColor: COLORS.surface,
    paddingBottom: 8,
    paddingTop: 12,
  },
  contentInner: {
    paddingHorizontal: 18,
  },
  sectionSpacing: {
    height: 22,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginVertical: 18,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  companySectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companySectionAction: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  companySectionActionText: {
    color: COLORS.action,
    fontSize: 13,
    fontWeight: "700",
  },
  sectionText: {
    color: "#2B2B2B",
    fontSize: 15,
    lineHeight: 24,
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
    paddingRight: 4,
  },
  bulletDot: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 23,
    width: 10,
  },
  bulletText: {
    color: "#2B2B2B",
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingTop: 120,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
  },
  bottomBar: {
    ...SHADOWS.card,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    left: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    position: "absolute",
    right: 0,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
    width: 54,
  },
  saveButtonActive: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.favorite,
  },
  applyButton: {
    backgroundColor: COLORS.action,
    flex: 1,
  },
  applyButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
});
