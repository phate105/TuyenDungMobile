import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import EmptyState from "../../components/EmptyState";
import JobCard from "../../components/JobCard";
import Screen from "../../components/Screen";
import { COLORS, RADII } from "../../constants/theme";
import { WORK_TYPE_LABELS, getWorkTypeLabel } from "../../constants/labels";
import { jobService } from "../../services/jobService";

const SALARY_OPTIONS = [
  { key: "all", label: "Mức lương" },
  { key: "under8", label: "Dưới 8 triệu" },
  { key: "8-10", label: "8 - 10 triệu" },
  { key: "10-15", label: "10 - 15 triệu" },
  { key: "15+", label: "Trên 15 triệu" },
];

const FILTER_KEYS = {
  category: "category",
  location: "location",
  salary: "salary",
  workType: "workType",
};
const PAGE_SIZE = 20;

export default function SearchResultScreen({ navigation, route, user }) {
  const initialKeyword = route.params?.keyword || "";
  const initialCategoryId = route.params?.categoryId || null;
  const initialLocationId = route.params?.locationId || null;

  const [submittedKeyword, setSubmittedKeyword] = useState(initialKeyword);
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [selectedLocationId, setSelectedLocationId] = useState(initialLocationId);
  const [selectedWorkType, setSelectedWorkType] = useState("");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState("all");
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSheet, setFilterSheet] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    setSubmittedKeyword(initialKeyword);
    setSelectedCategoryId(initialCategoryId);
    setSelectedLocationId(initialLocationId);
    setPage(1);
  }, [initialCategoryId, initialKeyword, initialLocationId]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, selectedLocationId, selectedSalaryRange, selectedWorkType, submittedKeyword]);

  useEffect(() => {
    let mounted = true;

    async function loadFilterData() {
      const [categoryResults, locationResults] = await Promise.all([
        jobService.getCategories(),
        jobService.getLocations(),
      ]);

      if (!mounted) {
        return;
      }

      setCategories(categoryResults);
      setLocations(locationResults);
    }

    loadFilterData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const offset = (page - 1) * PAGE_SIZE;
        const query = {
          keyword: submittedKeyword,
          categoryId: selectedCategoryId,
          locationId: selectedLocationId,
          workType: selectedWorkType,
          salaryRange: selectedSalaryRange,
        };

        const [jobResults, total, savedJobs] = await Promise.all([
          jobService.searchJobs({ ...query, limit: PAGE_SIZE, offset }),
          jobService.getSearchJobCount(query),
          jobService.getSavedJobs(user.id),
        ]);

        if (!mounted) {
          return;
        }

        setJobs(jobResults);
        setTotalJobs(total);
        setSavedJobIds(savedJobs.map((job) => job.id));
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      mounted = false;
    };
  }, [page, selectedCategoryId, selectedLocationId, selectedSalaryRange, selectedWorkType, submittedKeyword, user.id]);

  const categoryLabel = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId)?.name || "Ngành nghề",
    [categories, selectedCategoryId]
  );
  const locationLabel = useMemo(
    () => locations.find((item) => item.id === selectedLocationId)?.name || "Địa điểm",
    [locations, selectedLocationId]
  );
  const workTypeLabel = selectedWorkType ? getWorkTypeLabel(selectedWorkType) : "Hình thức làm việc";
  const salaryLabel = SALARY_OPTIONS.find((item) => item.key === selectedSalaryRange)?.label || "Mức lương";
  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

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

  function renderJob({ item }) {
    return (
      <JobCard
        job={item}
        saved={savedJobIds.includes(item.id)}
        onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
        onToggleSave={() => handleToggleSave(item.id)}
      />
    );
  }

  return (
    <Screen contentStyle={styles.screenContent} style={styles.screen}>
      <View style={styles.topPanel}>
        <View style={styles.searchHeader}>
          <TouchableOpacity activeOpacity={0.75} onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons color={COLORS.text} name="chevron-back" size={24} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Search", { keyword: submittedKeyword })}
            style={styles.searchBox}
          >
            <Ionicons color={COLORS.muted} name="search-outline" size={18} />
            <Text numberOfLines={1} style={[styles.searchText, !submittedKeyword && styles.searchPlaceholder]}>
              {submittedKeyword || "Tìm kiếm công việc, công ty..."}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          <FilterChip label={categoryLabel} onPress={() => setFilterSheet(FILTER_KEYS.category)} />
          <FilterChip label={locationLabel} onPress={() => setFilterSheet(FILTER_KEYS.location)} />
          <FilterChip label={workTypeLabel} onPress={() => setFilterSheet(FILTER_KEYS.workType)} />
          <FilterChip label={salaryLabel} onPress={() => setFilterSheet(FILTER_KEYS.salary)} />
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tìm việc phù hợp...</Text>
        </View>
      ) : error ? (
        <EmptyState icon="alert-circle-outline" title="Không tải được kết quả" message={error} />
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={jobs}
          initialNumToRender={8}
          keyExtractor={(item) => String(item.id)}
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
            <Text style={styles.countText}>
              <Text style={styles.countNumber}>{totalJobs}</Text> kết quả · Trang {page}/{totalPages}
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="Chưa có kết quả phù hợp"
              message="Thử đổi từ khóa hoặc chọn bộ lọc khác để xem thêm việc phù hợp."
            />
          }
          maxToRenderPerBatch={8}
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
          style={styles.resultList}
          windowSize={7}
        />
      )}

      <FilterSheet
        items={categories}
        selectedValue={selectedCategoryId}
        title="Chọn ngành nghề"
        visible={filterSheet === FILTER_KEYS.category}
        onClose={() => setFilterSheet("")}
        onSelect={(value) => {
          setSelectedCategoryId(value);
        }}
        renderLabel={(item) => item.name}
        withAllOption
      />

      <FilterSheet
        items={locations}
        selectedValue={selectedLocationId}
        title="Chọn địa điểm"
        visible={filterSheet === FILTER_KEYS.location}
        onClose={() => setFilterSheet("")}
        onSelect={(value) => {
          setSelectedLocationId(value);
        }}
        renderLabel={(item) => item.name}
        withAllOption
      />

      <FilterSheet
        items={Object.keys(WORK_TYPE_LABELS).map((key) => ({ id: key, name: getWorkTypeLabel(key) }))}
        selectedValue={selectedWorkType}
        title="Chọn hình thức làm việc"
        visible={filterSheet === FILTER_KEYS.workType}
        onClose={() => setFilterSheet("")}
        onSelect={(value) => {
          setSelectedWorkType(value);
        }}
        renderLabel={(item) => item.name}
        withAllOption
      />

      <FilterSheet
        items={SALARY_OPTIONS.filter((item) => item.key !== "all").map((item) => ({ id: item.key, name: item.label }))}
        selectedValue={selectedSalaryRange === "all" ? "" : selectedSalaryRange}
        title="Chọn mức lương"
        visible={filterSheet === FILTER_KEYS.salary}
        onClose={() => setFilterSheet("")}
        onSelect={(value) => {
          setSelectedSalaryRange(value || "all");
        }}
        renderLabel={(item) => item.name}
        withAllOption
      />
    </Screen>
  );
}

function FilterChip({ label, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.filterChip}>
      <Text numberOfLines={1} style={styles.filterChipText}>
        {label}
      </Text>
      <Ionicons color={COLORS.muted} name="chevron-down" size={16} />
    </TouchableOpacity>
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

function FilterSheet({
  items,
  selectedValue,
  title,
  visible,
  onClose,
  onSelect,
  renderLabel,
  withAllOption = false,
}) {
  const [shouldRender, setShouldRender] = useState(visible);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(360);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          duration: 170,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (shouldRender) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          duration: 140,
          easing: Easing.in(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          duration: 170,
          easing: Easing.in(Easing.cubic),
          toValue: 360,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }
  }, [overlayOpacity, sheetTranslateY, visible]);

  function requestClose(afterClose) {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        duration: 140,
        easing: Easing.in(Easing.quad),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        duration: 170,
        easing: Easing.in(Easing.cubic),
        toValue: 360,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
        afterClose?.();
        onClose();
      }
    });
  }

  function handleSelect(value) {
    requestClose(() => onSelect(value));
  }

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal
      animationType="none"
      statusBarTranslucent
      transparent
      visible={shouldRender}
      onRequestClose={() => requestClose()}
    >
      <View style={styles.sheetRoot}>
        <Animated.View pointerEvents="none" style={[styles.sheetBackdrop, { opacity: overlayOpacity }]} />
        <Pressable style={styles.sheetOverlay} onPress={() => requestClose()} />

        <Animated.View style={[styles.sheetCard, { transform: [{ translateY: sheetTranslateY }] }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>

          <ScrollView contentContainerStyle={styles.sheetList} showsVerticalScrollIndicator={false}>
            {withAllOption ? (
              <SheetOption label="Tất cả" active={!selectedValue} onPress={() => handleSelect("")} />
            ) : null}

            {items.map((item) => {
              const value = item.id ?? item.key;

              return (
                <SheetOption
                  key={String(value)}
                  label={renderLabel(item)}
                  active={selectedValue === value}
                  onPress={() => handleSelect(value)}
                />
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SheetOption({ label, active, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.sheetOption, active && styles.sheetOptionActive]}>
      <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>{label}</Text>
      {active ? <Ionicons color={COLORS.action} name="checkmark" size={18} /> : null}
    </TouchableOpacity>
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
  topPanel: {
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  searchHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 28,
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
    minHeight: 42,
    paddingHorizontal: 13,
  },
  searchText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  searchPlaceholder: {
    color: COLORS.mutedLight,
    fontWeight: "400",
  },
  filterRow: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterContent: {
    gap: 10,
    paddingBottom: 10,
    paddingRight: 18,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  filterChipText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 136,
  },
  countText: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  countNumber: {
    color: COLORS.action,
    fontWeight: "800",
  },
  resultList: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  listContent: {
    backgroundColor: COLORS.background,
    flexGrow: 1,
    gap: 12,
    paddingBottom: 22,
    paddingHorizontal: 18,
  },
  centerBox: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    flex: 1,
    gap: 8,
    justifyContent: "center",
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: "center",
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
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
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17, 17, 17, 0.38)",
  },
  sheetOverlay: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    minHeight: "56%",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: COLORS.border,
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 52,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  sheetList: {
    paddingBottom: 28,
  },
  sheetOption: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sheetOptionActive: {
    backgroundColor: COLORS.surface,
  },
  sheetOptionText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  sheetOptionTextActive: {
    color: COLORS.action,
    fontWeight: "700",
  },
});
