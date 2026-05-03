import { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import EmptyState from "../../components/EmptyState";
import JobCard from "../../components/JobCard";
import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { LABELS } from "../../constants/labels";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { applicationService } from "../../services/applicationService";
import { jobService } from "../../services/jobService";

const TABS = {
  APPLIED: "applied",
  SAVED: "saved",
};

const BELL_ICON = require("../../../assets/icons/bell.png");
const BELL_ICON_ACTIVE = require("../../../assets/icons/bell1.png");

export default function MyJobsScreen({ navigation, route, user }) {
  const hasNotification = false;
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || TABS.SAVED);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [savedResults, applicationResults] = await Promise.all([
        jobService.getSavedJobs(user.id),
        applicationService.getApplicationsByCandidate(user.id),
      ]);

      setSavedJobs(savedResults);
      setApplications(applicationResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.initialTab) {
        setActiveTab(route.params.initialTab);
      }

      loadData();
    }, [loadData, route.params?.initialTab])
  );

  async function handleUnsave(jobId) {
    await jobService.unsaveJob(user.id, jobId);
    setSavedJobs((current) => current.filter((job) => job.id !== jobId));
  }

  function handlePressNotification() {
    Alert.alert("Thông báo", "Chức năng thông báo sẽ được phát triển sau.");
  }

  return (
    <Screen contentStyle={styles.screenContent} style={styles.screen}>
      <View style={styles.headerPanel}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide} />
          <Text style={styles.title}>Việc của tôi</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePressNotification}
            style={styles.notificationButton}
          >
            <Image
              source={hasNotification ? BELL_ICON_ACTIVE : BELL_ICON}
              style={styles.notificationImage}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TabButton
            active={activeTab === TABS.SAVED}
            onPress={() => setActiveTab(TABS.SAVED)}
            title="Việc đã lưu"
          />
          <TabButton
            active={activeTab === TABS.APPLIED}
            onPress={() => setActiveTab(TABS.APPLIED)}
            title="Đã ứng tuyển"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.bodyScroll}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color={COLORS.action} />
            <Text style={styles.mutedText}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <EmptyState icon="alert-circle-outline" message={error} title="Không tải được dữ liệu" />
        ) : activeTab === TABS.SAVED ? (
          <View style={styles.list}>
            {savedJobs.length === 0 ? (
              <EmptyState
                icon="heart-outline"
                message="Nhấn biểu tượng trái tim ở việc bạn quan tâm để lưu lại."
                title="Chưa lưu việc nào"
              />
            ) : (
              savedJobs.map((job) => (
                <JobCard
                  compact
                  job={job}
                  key={job.id}
                  saved
                  onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                  onToggleSave={() => handleUnsave(job.id)}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.list}>
            {applications.length === 0 ? (
              <EmptyState
                icon="send-outline"
                message="Khi bạn nộp hồ sơ, trạng thái ứng tuyển sẽ hiển thị tại đây."
                title="Chưa ứng tuyển việc nào"
              />
            ) : (
              applications.map((application) => (
                <ApplicationCard
                  application={application}
                  key={application.id}
                  onPress={() => navigation.navigate("JobDetail", { jobId: application.job_id })}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function TabButton({ active, onPress, title }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
}

function ApplicationCard({ application, onPress }) {
  const job = {
    id: application.job_id,
    title: application.job_title,
    company_name: application.company_name,
    location_name: application.location_name,
    salary: application.salary,
    work_type: application.work_type,
    category_name: application.category_name,
  };

  return (
    <JobCard
      compact
      job={job}
      onPress={onPress}
      rightAccessory={<StatusBadge status={application.status} />}
    />
  );
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
  headerPanel: {
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingTop: 16,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  headerSide: {
    width: 44,
  },
  title: {
    color: COLORS.text,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  notificationButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  notificationImage: {
    height: 22,
    resizeMode: "contain",
    width: 22,
  },
  tabs: {
    backgroundColor: "#F7F8FA",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    marginBottom: 0,
    marginHorizontal: -18,
  },
  tabButton: {
    alignItems: "center",
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    flex: 1,
    justifyContent: "center",
    marginBottom: -1,
    minHeight: 46,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomColor: COLORS.text,
  },
  tabText: {
    color: "#7C838D",
    fontSize: 15,
    fontWeight: "400",
  },
  activeTabText: {
    color: COLORS.text,
    fontWeight: "500",
  },
  bodyScroll: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    paddingBottom: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  list: {
    gap: 12,
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
