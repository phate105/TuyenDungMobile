import { useCallback, useState, useMemo, useEffect } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, Alert, ScrollView } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";
import { APPLICATION_STATUS } from "../../constants/appConstants";

const PAGE_SIZE = 10;

const applicationStatusOptions = [
  { label: "Tất cả", value: "all" },
  { label: "Đơn mới", value: APPLICATION_STATUS.SUBMITTED },
  { label: "Đang xem xét", value: APPLICATION_STATUS.UNDER_REVIEW },
  { label: "Phù hợp", value: APPLICATION_STATUS.SUITABLE },
  { label: "Từ chối", value: APPLICATION_STATUS.REJECTED },
];

export default function EmployerApplicationsScreen({ navigation, user }) {
  const route = useRoute();
  const [activeFilter, setActiveFilter] = useState("all");
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.status) {
      setActiveFilter(route.params.status);
      setPage(1);
      navigation.setParams({ status: undefined });
    }
  }, [route.params?.status]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ headerShown: false });
      let active = true;
      async function loadApplications() {
        try {
          setLoading(true);
          const rows = await employerService.getApplicationsByEmployer(user.id);
          if (active) setApplications(rows);
        } catch (err) {
          Alert.alert("Lỗi", "Không thể tải danh sách ứng viên");
        } finally {
          if (active) setLoading(false);
        }
      }
      loadApplications();
      return () => { active = false; };
    }, [user.id, navigation])
  );

  const filteredApplications = useMemo(() => {
    if (activeFilter === "all") return applications;
    return applications.filter((app) => app.status === activeFilter);
  }, [applications, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, page]);

  const handleChangeFilter = (val) => {
    setActiveFilter(val);
    setPage(1);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTextSection}>
        <Text style={styles.title}>Hồ sơ ứng tuyển</Text>
        <Text style={styles.subtitle}>Quản lý và xem xét các ứng viên đã nộp hồ sơ</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterScroll}
        style={styles.filterWrapper}
      >
        {applicationStatusOptions.map((option) => {
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
        {filteredApplications.length} kết quả • Trang {page}/{totalPages}
      </Text>
    </View>
  );

  function renderApplication({ item }) {
    return (
      <Pressable
        onPress={() => navigation.navigate("ApplicantCV", { applicationId: item.id })}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.candidateName}>
            {item.candidate_name || "Ứng viên ẩn danh"}
          </Text>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.jobInfo}>
          <Ionicons name="briefcase-outline" size={15} color={COLORS.muted} />
          <Text numberOfLines={1} style={styles.jobTitle}>
            Ứng tuyển: <Text style={styles.jobTitleBold}>{item.job_title}</Text>
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.muted} />
            <Text style={styles.metaText}>Ngày nộp: {item.created_at}</Text>
          </View>
          <View style={styles.actionLink}>
            <Text style={styles.viewDetail}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.action} />
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
          <Text style={styles.mutedText}>Đang tải hồ sơ...</Text>
        </View>
      ) : (
        <FlatList
          data={paginatedData}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listPadding}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không tìm thấy hồ sơ nào.</Text>
          }
          ListFooterComponent={
            filteredApplications.length > 0 && (
              <PaginationControls
                page={page}
                totalPages={totalPages}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              />
            )
          }
          renderItem={renderApplication}
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
    paddingBottom: 8,
  },
  headerTextSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 4,
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
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  listPadding: {
    paddingBottom: 40,
  },
  countText: {
    paddingHorizontal: 16,
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  candidateName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginRight: 8,
  },
  jobInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    backgroundColor: COLORS.background + "90",
    padding: 10,
    borderRadius: 10,
  },
  jobTitle: {
    color: COLORS.muted,
    fontSize: 14,
    flex: 1,
  },
  jobTitleBold: {
    fontWeight: "700",
    color: COLORS.text,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "30",
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "500",
  },
  actionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewDetail: {
    color: COLORS.action,
    fontSize: 14,
    fontWeight: "700",
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
    marginTop: 80,
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