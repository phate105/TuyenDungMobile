import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import JobCard from "../../components/JobCard";
import Screen from "../../components/Screen";
import { LABELS } from "../../constants/labels";
import { getCompanyLogoSource } from "../../constants/companyLogos";
import { COLORS, RADII } from "../../constants/theme";
import { companyService } from "../../services/companyService";
import { jobService } from "../../services/jobService";

const TABS = {
  ABOUT: "about",
  JOBS: "jobs",
};

export default function CompanyDetailScreen({ navigation, route, user }) {
  const { companyId } = route.params;
  const [activeTab, setActiveTab] = useState(TABS.ABOUT);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [companyResult, jobResults, savedJobs] = await Promise.all([
          companyService.getCompanyById(companyId),
          companyService.getApprovedJobsByCompany(companyId),
          user?.id ? jobService.getSavedJobs(user.id) : Promise.resolve([]),
        ]);

        if (!mounted) {
          return;
        }

        if (!companyResult) {
          setError("Không tìm thấy thông tin công ty.");
          return;
        }

        setCompany(companyResult);
        setJobs(jobResults);
        setSavedJobIds(savedJobs.map((job) => job.id));
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

    loadData();

    return () => {
      mounted = false;
    };
  }, [companyId, user?.id]);

  async function handleToggleSave(jobId) {
    if (!user?.id) {
      return;
    }

    const isSaved = savedJobIds.includes(jobId);

    try {
      if (isSaved) {
        await jobService.unsaveJob(user.id, jobId);
        setSavedJobIds((current) => current.filter((id) => id !== jobId));
        return;
      }

      await jobService.saveJob(user.id, jobId);
      setSavedJobIds((current) => [...current, jobId]);
    } catch (err) {
      Alert.alert("Thông báo", err.message || "Không thể cập nhật việc đã lưu.");
    }
  }

  if (loading) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải thông tin công ty...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <EmptyState icon="business-outline" title="Không tải được công ty" message={error} />
      </Screen>
    );
  }

  const logoSource = getCompanyLogoSource(company.logo_path);

  return (
    <Screen contentStyle={styles.screenContent} edges={["left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverBlock}>
          <View style={styles.companyLogo}>
            {logoSource ? (
              <Image resizeMode="contain" source={logoSource} style={styles.companyLogoImage} />
            ) : (
              <Text style={styles.companyLogoText}>{getCompanyInitial(company.company_name)}</Text>
            )}
          </View>
        </View>

        <View style={styles.profileBlock}>
          <Text style={styles.companyName}>{company.company_name}</Text>

          <View style={styles.infoBox}>
            <InfoRow
              icon="location-outline"
              value={company.company_address || LABELS.common.noUpdate}
            />
          </View>
        </View>

        <View style={styles.tabs}>
          <TabButton
            active={activeTab === TABS.ABOUT}
            onPress={() => setActiveTab(TABS.ABOUT)}
            title="Giới thiệu công ty"
          />
          <TabButton
            active={activeTab === TABS.JOBS}
            onPress={() => setActiveTab(TABS.JOBS)}
            title={`Việc đang tuyển (${jobs.length})`}
          />
        </View>

        {activeTab === TABS.ABOUT ? (
          <View style={styles.contentBlock}>
            <Text style={styles.sectionTitle}>Giới thiệu {company.company_name}</Text>
            <Text style={styles.descriptionText}>
              {company.description || "Công ty chưa cập nhật phần giới thiệu."}
            </Text>
          </View>
        ) : (
          <View style={styles.contentBlock}>
            {jobs.length === 0 ? (
              <EmptyState
                icon="briefcase-outline"
                title="Chưa có việc đang tuyển"
                message="Công ty hiện chưa có tin tuyển dụng đã được duyệt."
              />
            ) : (
              <View style={styles.jobList}>
                {jobs.map((job) => (
                  <JobCard
                    job={job}
                    key={job.id}
                    saved={savedJobIds.includes(job.id)}
                    onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                    onToggleSave={() => handleToggleSave(job.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function TabButton({ active, onPress, title }) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.tabButton}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
      <View style={[styles.tabLine, active && styles.activeTabLine]} />
    </TouchableOpacity>
  );
}

function InfoRow({ icon, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons color={COLORS.muted} name={icon} size={22} />
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getCompanyInitial(name = "") {
  return name.trim().charAt(0).toUpperCase() || "V";
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.surface,
  },
  screenContent: {
    paddingBottom: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  scrollContent: {
    backgroundColor: COLORS.surface,
    paddingBottom: 28,
  },
  coverBlock: {
    alignItems: "center",
    backgroundColor: "#F2F6F6",
    height: 104,
    justifyContent: "flex-end",
  },
  companyLogo: {
    alignItems: "center",
    backgroundColor: COLORS.logoRed,
    borderColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 4,
    height: 84,
    justifyContent: "center",
    marginBottom: -32,
    width: 84,
  },
  companyLogoText: {
    color: COLORS.surface,
    fontSize: 36,
    fontWeight: "900",
  },
  companyLogoImage: {
    height: "82%",
    width: "82%",
  },
  profileBlock: {
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 42,
  },
  companyName: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#F6F7F9",
    borderRadius: RADII.lg,
    marginTop: 16,
    padding: 16,
    width: "100%",
  },
  infoRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  infoValue: {
    color: "#2B2B2B",
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
  },
  tabs: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    marginTop: 22,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "600",
    paddingBottom: 13,
  },
  activeTabText: {
    color: COLORS.action,
    fontWeight: "800",
  },
  tabLine: {
    backgroundColor: "transparent",
    height: 2,
    width: "100%",
  },
  activeTabLine: {
    backgroundColor: COLORS.action,
  },
  contentBlock: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  descriptionText: {
    color: "#333333",
    fontSize: 16,
    lineHeight: 27,
    marginTop: 16,
  },
  jobList: {
    gap: 12,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
