import { useCallback, useState, useMemo, useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, Alert, ScrollView } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import StatusBadge from "../../components/StatusBadge";
import { JOB_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const PAGE_SIZE = 10;

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: JOB_STATUS.PENDING },
  { label: "Đã duyệt", value: JOB_STATUS.APPROVED },
  { label: "Bị từ chối", value: JOB_STATUS.REJECTED },
];

export default function EmployerJobsScreen({ navigation, user }) {
  const route = useRoute();
  const [activeFilter, setActiveFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ headerShown: false }); // Ẩn header mặc định
    if (route.params?.status) {
      setActiveFilter(route.params.status);
      setPage(1);
      navigation.setParams({ status: undefined });
    }
  }, [route.params?.status, navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadJobs() {
        try {
          setLoading(true);
          const rows = await employerService.getJobsByEmployer(user.id);
          if (active) setJobs(rows);
        } catch (err) {
          Alert.alert("Lỗi", "Không thể tải danh sách tin");
        } finally {
          if (active) setLoading(false);
        }
      }
      loadJobs();
      return () => { active = false; };
    }, [user.id])
  );

  const filteredJobs = useMemo(() => {
    if (activeFilter === "all") return jobs;
    return jobs.filter((j) => j.status === activeFilter);
  }, [jobs, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, page]);

  const handleChangeFilter = (val) => {
    setActiveFilter(val);
    setPage(1);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Tin tuyển dụng</Text>
        <Text style={styles.screenSubtitle}>Quản lý các vị trí đang đăng tuyển</Text>
      </View>

      <PrimaryButton 
        title="Đăng tin mới" 
        icon="add-circle-outline" // Nếu PrimaryButton của bạn hỗ trợ icon
        onPress={() => navigation.navigate("EmployerJobForm")}
        style={styles.postButton}
      />

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
        style={styles.filterWrapper}
      >
        {statusOptions.map((option) => {
          const isActive = option.value === activeFilter;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleChangeFilter(option.value)}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.countText}>
        {filteredJobs.length} tin đăng • Trang {page}/{totalPages}
      </Text>
    </View>
  );

  function renderJob({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("EmployerJobDetail", { jobId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={2} style={styles.jobTitle}>{item.title}</Text>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.muted} />
          <Text style={styles.metaText}>{item.location_name || "Chưa cập nhật"}</Text>
          <Text style={styles.dot}>•</Text>
          <Ionicons name="cash-outline" size={14} color={COLORS.muted} />
          <Text style={styles.metaText}>{item.salary || "Thỏa thuận"}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.applicantBadge}>
            <Ionicons name="people" size={14} color={COLORS.action} />
            <Text style={styles.applicantText}>{item.application_count || 0} ứng viên</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
        </View>
      </Pressable>
    );
  }

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.mutedText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={paginatedJobs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listPadding}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy tin tuyển dụng.</Text>
          }
          ListFooterComponent={
            filteredJobs.length > 0 && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                onPrevious={() => setPage(p => Math.max(1, p - 1))}
              />
            )
          }
          renderItem={renderJob}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

function PaginationControls({ page, totalPages, onNext, onPrevious }) {
  return (
      <View style={styles.pagination}>
        <Pressable 
          disabled={page === 1} 
          onPress={onPrevious} 
          style={[styles.pageButton, page === 1 && styles.disabled]}
        >
          <Ionicons name="chevron-back" size={20} color={page === 1 ? COLORS.muted : COLORS.text} />
        </Pressable>
        
        <View style={styles.pageInfo}>
          <Text style={styles.pageNumberText}>Trang {page}</Text>
          <Text style={styles.pageTotalText}>trên {totalPages}</Text>
        </View>
  
        <Pressable 
          disabled={page === totalPages} 
          onPress={onNext} 
          style={[styles.pageButton, page === totalPages && styles.disabled]}
        >
          <Ionicons name="chevron-forward" size={20} color={page === totalPages ? COLORS.muted : COLORS.text} />
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 20,
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  screenSubtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 4,
  },
  postButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    height: 52,
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: COLORS.action,
    backgroundColor: COLORS.action + "15",
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.action,
  },
  countText: {
    paddingHorizontal: 16,
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
    textTransform: 'uppercase',
  },
  listPadding: {
    paddingBottom: 40,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  jobTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 13,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 8,
    color: COLORS.border,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "30",
  },
  applicantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.action + "10",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  applicantText: {
    color: COLORS.action,
    fontWeight: '700',
    fontSize: 13,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 60,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 25,
    paddingVertical: 20,
  },
  pageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageNumberText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  pageTotalText: {
    fontSize: 11,
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  disabled: {
    opacity: 0.3,
  },
});