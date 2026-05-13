import { useCallback, useState, useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { JOB_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const PAGE_SIZE = 20;

const statusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ duyệt", value: JOB_STATUS.PENDING },
  { label: "Đã duyệt", value: JOB_STATUS.APPROVED },
  { label: "Bị từ chối", value: JOB_STATUS.REJECTED },
];

export default function PendingJobsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [role, setRole] = useState(route.params?.role || "all");
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  useEffect(() => {
    navigation.setOptions({headerShown:false});
    if (route.params?.role) {
      setRole(route.params.role);
      setPage(1);
    }
  }, [route.params?.role, navigation]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadJobs() {
        try {
          setLoading(true);
          setError("");
          const offset = (page - 1) * PAGE_SIZE;
          const [rows, total] = await Promise.all([
            adminService.getJobs({ status: role, limit: PAGE_SIZE, offset }),
            adminService.getJobCount(role),
          ]);
          if (active) {
            setJobs(rows);
            setTotalJobs(total);
          }
        } catch (err) {
          if (active) setError(err.message);
        } finally {
          if (active) setLoading(false);
        }
      }
      loadJobs();
      return () => { active = false; };
    }, [page, role])
  );

  function handleChangeRole(nextRole) {
    setRole(nextRole);
    setPage(1);
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Tin tuyển dụng</Text>
        <Text style={styles.screenSubtitle}>Quản lý các vị trí đang đăng tuyển</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
        style={styles.filterWrapper}
      >
        {statusOptions.map((option) => {
          const isActive = option.value === role;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleChangeRole(option.value)}
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
        Tìm thấy {totalJobs} kết quả • Trang {page}/{totalPages}
      </Text>
    </View>
  );

  function renderJob({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("AdminJobDetail", { jobId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardContent}>
            <Text numberOfLines={1} style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.companyName}>{item.company_name}</Text>
            
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Ionicons name="location-outline" size={12} color={COLORS.muted} />
                <Text style={styles.tagText}>{item.location_name || "N/A"}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="briefcase-outline" size={12} color={COLORS.muted} />
                <Text style={styles.tagText}>{item.work_type || "N/A"}</Text>
              </View>
            </View>

            <Text style={styles.salaryText}>
              <Ionicons name="cash-outline" size={14} color="#10B981" /> {item.salary || "Thương lượng"}
            </Text>
          </View>
          
          <View style={styles.cardRight}>
            <StatusBadge status={item.status} />
            <Ionicons name="chevron-forward" size={18} color={COLORS.border} style={{marginTop: 8}} />
          </View>
        </View>
      </Pressable>
    );
  }
  
  return (
    <Screen>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.loadingText}>Đang tải danh sách...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderJob}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>Không có tin tuyển dụng nào</Text>
            </View>
          }
          ListFooterComponent={
            totalJobs > 0 && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                onPrevious={() => setPage(p => Math.max(1, p - 1))}
              />
            )
          }
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
    paddingTop: 10,
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
  listContent: {
    paddingBottom: 40,
    backgroundColor: COLORS.background,
    paddingHorizontal: 0,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: COLORS.surfaceMuted,
  },
  cardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.action,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    elevation: 0,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.muted,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    opacity: 0.4,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.muted,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  }
});