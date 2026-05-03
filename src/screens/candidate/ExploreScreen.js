import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import EmptyState from "../../components/EmptyState";
import JobCard from "../../components/JobCard";
import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { jobService } from "../../services/jobService";

const BELL_ICON = require("../../../assets/icons/bell.png");
const BELL_ICON_ACTIVE = require("../../../assets/icons/bell1.png");
const PAGE_SIZE = 20;

export default function ExploreScreen({ navigation, user }) {
  const hasNotification = false;
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const offset = (page - 1) * PAGE_SIZE;
      const [jobResults, total, savedJobs] = await Promise.all([
        jobService.getApprovedJobs({ limit: PAGE_SIZE, offset }),
        jobService.getApprovedJobCount(),
        jobService.getSavedJobs(user.id),
      ]);

      setJobs(jobResults);
      setTotalJobs(total);
      setSavedJobIds(savedJobs.map((job) => job.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, user.id]);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  async function handleToggleSave(jobId) {
    const isSaved = savedJobIds.includes(jobId);

    if (isSaved) {
      await jobService.unsaveJob(user.id, jobId);
      setSavedJobIds((current) => current.filter((id) => id !== jobId));
      return;
    }

    await jobService.saveJob(user.id, jobId);
    setSavedJobIds((current) => [...current, jobId]);
  }

  function handlePressNotification() {
    Alert.alert("Thông báo", "Chức năng thông báo sẽ được phát triển sau.");
  }

  function renderJob({ item }) {
    return (
      <JobCard
        compact
        job={item}
        saved={savedJobIds.includes(item.id)}
        onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
        onToggleSave={() => handleToggleSave(item.id)}
      />
    );
  }

  return (
    <Screen contentStyle={styles.screenContent} style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Search")}
            style={styles.searchBox}
          >
            <Ionicons color={COLORS.muted} name="search-outline" size={19} />
            <Text style={styles.searchText}>Tìm kiếm công việc tại đây</Text>
          </TouchableOpacity>

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
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.brand} />
          <Text style={styles.mutedText}>Đang tải việc làm...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <EmptyState icon="alert-circle-outline" message={error} title="Không tải được dữ liệu" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={jobs}
          initialNumToRender={8}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              message="Hiện chưa có tin tuyển dụng đã duyệt để hiển thị."
              title="Chưa có công việc"
            />
          }
          ListFooterComponent={
            totalJobs > 0 ? (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
                onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              />
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tất cả ngành nghề</Text>
              <Text style={styles.pageInfo}>
                Trang {page}/{totalPages} · {totalJobs} việc làm
              </Text>
            </View>
          }
          maxToRenderPerBatch={8}
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          windowSize={7}
        />
      )}
    </Screen>
  );
}

function PaginationControls({ page, totalPages, onNext, onPrevious }) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <View style={styles.pagination}>
      <TouchableOpacity
        activeOpacity={0.82}
        disabled={!canGoPrevious}
        onPress={onPrevious}
        style={[styles.pageButton, !canGoPrevious && styles.pageButtonDisabled]}
      >
        <Ionicons color={canGoPrevious ? COLORS.text : COLORS.mutedLight} name="chevron-back" size={18} />
        <Text style={[styles.pageButtonText, !canGoPrevious && styles.pageButtonTextDisabled]}>Trước</Text>
      </TouchableOpacity>

      <Text style={styles.pageNumber}>{page}/{totalPages}</Text>

      <TouchableOpacity
        activeOpacity={0.82}
        disabled={!canGoNext}
        onPress={onNext}
        style={[styles.pageButton, !canGoNext && styles.pageButtonDisabled]}
      >
        <Text style={[styles.pageButtonText, !canGoNext && styles.pageButtonTextDisabled]}>Sau</Text>
        <Ionicons color={canGoNext ? COLORS.text : COLORS.mutedLight} name="chevron-forward" size={18} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.surface,
  },
  screenContent: {
    paddingBottom: 0,
  },
  hero: {
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    marginHorizontal: -18,
    marginTop: -16,
    paddingBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 13,
  },
  searchText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
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
  list: {
    backgroundColor: COLORS.background,
    flex: 1,
    marginHorizontal: -18,
  },
  listContent: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  sectionHeader: {
    gap: 3,
    marginBottom: -4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  pageInfo: {
    color: COLORS.muted,
    fontSize: 13,
  },
  centerBox: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    gap: 8,
    justifyContent: "center",
    marginHorizontal: -18,
  },
  errorBox: {
    backgroundColor: COLORS.background,
    flex: 1,
    marginHorizontal: -18,
    paddingHorizontal: 18,
    paddingTop: 32,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  pageButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  pageButtonDisabled: {
    backgroundColor: COLORS.surfaceMuted,
  },
  pageButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  pageButtonTextDisabled: {
    color: COLORS.mutedLight,
  },
  pageNumber: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
});
