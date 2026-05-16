import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
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

import EmptyState from "../../components/EmptyState";
import PrimaryButton from "../../components/PrimaryButton";
import { getCompanyLogoSource } from "../../constants/companyLogos";
import { LABELS, getWorkTypeLabel } from "../../constants/labels";
import { COLORS, RADII } from "../../constants/theme";
import { applicationService } from "../../services/applicationService";
import { jobService } from "../../services/jobService";

const HEADER_ROW_HEIGHT = 52;
const BULLET_CHAR = "\u2022";

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

          const [jobResult, savedResult, appliedResult] = await Promise.all([
            jobService.getJobById(jobId),
            user?.id ? jobService.isJobSaved(user.id, jobId) : Promise.resolve(false),
            user?.id ? applicationService.hasApplied(user.id, jobId) : Promise.resolve(false),
          ]);

          if (!mounted) {
            return;
          }

          if (!jobResult) {
            setError("Không tìm thấy việc hoặc việc chưa được duyệt.");
            return;
          }

          setJob(jobResult);
          setSaved(savedResult);
          setApplied(appliedResult);
        } catch (loadError) {
          if (mounted) {
            setError(loadError.message);
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
    } catch (toggleError) {
      Alert.alert("Thông báo", toggleError.message || "Không thể cập nhật việc đã lưu.");
    } finally {
      setSaving(false);
    }
  }

  function renderJobContent() {
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
          <EmptyState icon="alert-circle-outline" message={error} title="Không tải được công việc" />
        </View>
      );
    }

    const detailSections = buildJobDetailSections(job);

    return (
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 10) },
        ]}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
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
            {detailSections.map((section, index) => (
              <View key={`${section.title}-${index}`}>
                <SectionBlock lines={section.lines} title={section.title} />
                {index < detailSections.length - 1 ? <View style={styles.sectionSpacing} /> : null}
              </View>
            ))}

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
                {[job.company_field, job.company_address].filter(Boolean).join("\n") || LABELS.common.noUpdate}
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
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.goBack()} style={styles.headerButton}>
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

      {renderJobContent()}

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
            onPress={handleApply}
            style={[styles.applyButton, applied && styles.applyButtonDisabled]}
            title={applied ? "Đã ứng tuyển" : LABELS.buttons.apply}
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

function SectionBlock({ title, lines }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailTextBlock}>
        {lines.map((line, index) =>
          line.type === "bullet" ? (
            <View key={`${line.text}-${index}`} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>{BULLET_CHAR}</Text>
              <Text style={styles.bulletText}>{line.text}</Text>
            </View>
          ) : (
            <Text key={`${line.text}-${index}`} style={styles.sectionText}>
              {line.text}
            </Text>
          )
        )}
      </View>
    </View>
  );
}

function buildJobDetailSections(job) {
  return [
    ...extractDetailSections(job?.description, "M\u00F4 t\u1EA3 c\u00F4ng vi\u1EC7c"),
    ...extractDetailSections(job?.requirements, "Y\u00EAu c\u1EA7u \u1EE9ng vi\u00EAn"),
  ];
}

function extractDetailSections(content, fallbackTitle) {
  const rawContent = String(content || "").trim();

  if (!rawContent) {
    return [
      {
        title: fallbackTitle,
        lines: [{ text: LABELS.common.noUpdate, type: "text" }],
      },
    ];
  }

  const lineBasedSections = parseSectionLines(rawContent, fallbackTitle);
  if (lineBasedSections.length > 1) {
    return lineBasedSections;
  }

  const flatSections = parseSectionFlatText(rawContent);
  if (flatSections.length > 0) {
    return flatSections;
  }

  return [
    {
      title: fallbackTitle,
      lines: splitIntoDetailLines(rawContent),
    },
  ];
}

function parseSectionLines(content, fallbackTitle) {
  const rawLines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!rawLines.length) {
    return [];
  }

  const sections = [];
  let currentSection = { title: fallbackTitle, lines: [] };
  sections.push(currentSection);

  rawLines.forEach((line) => {
    if (line.endsWith(":")) {
      const heading = line.replace(/:$/, "").trim();

      if (normalizeSectionTitle(heading) === normalizeSectionTitle(fallbackTitle) && currentSection.lines.length === 0) {
        return;
      }

      currentSection = { title: heading, lines: [] };
      sections.push(currentSection);
      return;
    }

    if (/^[-\u2022]\s*/.test(line)) {
      currentSection.lines.push({
        text: line.replace(/^[-\u2022]\s*/, "").trim(),
        type: "bullet",
      });
      return;
    }

    currentSection.lines.push({
      text: line,
      type: "text",
    });
  });

  return sections.filter((section) => section.lines.length > 0);
}

function parseSectionFlatText(content) {
  const headings = [
    "M\u00F4 t\u1EA3 c\u00F4ng vi\u1EC7c",
    "Quy\u1EC1n l\u1EE3i",
    "\u0110\u1ECBa \u0111i\u1EC3m l\u00E0m vi\u1EC7c",
    "Th\u1EDDi gian l\u00E0m vi\u1EC7c",
    "H\u1EA1n n\u1ED9p h\u1ED3 s\u01A1",
    "Th\u00F4ng tin th\u00EAm",
    "Y\u00EAu c\u1EA7u \u1EE9ng vi\u00EAn",
  ];

  const normalized = String(content || "")
    .replace(/\r\n/g, " ")
    .replace(/\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return [];
  }

  const markerPattern = "(" + headings.map((heading) => escapeRegex(heading)).join("|") + ")\\s*:";
  const markerRegex = new RegExp(markerPattern, "gi");
  const matches = [...normalized.matchAll(markerRegex)];

  if (!matches.length) {
    return [];
  }

  const sections = [];

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const heading = match[1];
    const startIndex = match.index + match[0].length;
    const endIndex = index < matches.length - 1 ? matches[index + 1].index : normalized.length;
    const chunk = normalized.slice(startIndex, endIndex).trim();

    if (!chunk) {
      continue;
    }

    const parts = chunk.split(/\s-\s+/).map((line) => line.trim()).filter(Boolean);
    const hasBullets = parts.length > 1;
    const lines = (hasBullets ? parts : [chunk]).map((line) => ({
      text: line.replace(/\s+/g, " ").trim(),
      type: hasBullets ? "bullet" : "text",
    }));

    sections.push({
      title: heading,
      lines,
    });
  }

  return sections;
}

function splitIntoDetailLines(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/^[-\u2022]\s*/.test(line)) {
        return {
          text: line.replace(/^[-\u2022]\s*/, "").trim(),
          type: "bullet",
        };
      }

      return {
        text: line,
        type: "text",
      };
    });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSectionTitle(value) {
  return String(value || "").trim().replace(/:$/, "").toLowerCase();
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
    fontWeight: "600",
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
    borderRadius: 18,
    borderWidth: 1,
    height: 78,
    justifyContent: "center",
    overflow: "hidden",
    width: 78,
  },
  logoBadgeText: {
    color: COLORS.surface,
    fontSize: 34,
    fontWeight: "700",
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
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
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
    fontWeight: "600",
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
