import { useCallback, useState, useMemo } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ActivityIndicator, FlatList } from "react-native";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const PAGE_SIZE = 10;

const applicationStatusLabels = {
  submitted: "Đã nộp",
  under_review: "Xem xét",
  suitable: "Phù hợp",
  rejected: "Bị từ chối",
};

export default function JobApplicationsScreen({ user }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId, jobTitle } = route.params;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadApplications() {
        try {
          setLoading(true);
          const rows = await employerService.getApplicationsByJob(user.id, jobId);
          if (active) setApplications(rows);
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        } finally {
          if (active) setLoading(false);
        }
      }
      loadApplications();
      return () => { active = false; };
    }, [jobId, user.id])
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
    <View style={styles.header}>
      <Text style={styles.jobTitle} numberOfLines={1}>{jobTitle}</Text>
      <View style={styles.subtitleRow}>
        <Ionicons name="people-outline" size={16} color={COLORS.muted} />
        <Text style={styles.subtitle}>
          {applications.length} ứng viên đã ứng tuyển
        </Text>
      </View>
    </View>
  );

  const renderApplication = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("ApplicantCV", { applicationId: item.id })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.candidate_name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.infoMain}>
          <Text style={styles.candidateName}>{item.candidate_name}</Text>
          <StatusBadge 
            status={item.status} 
            label={applicationStatusLabels[item.status]} 
          />
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.border} />
      </View>

      <View style={styles.divider} />

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={14} color={COLORS.muted} />
          <Text style={styles.contactText} numberOfLines={1}>{item.candidate_email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={14} color={COLORS.muted} />
          <Text style={styles.contactText}>{item.candidate_phone}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.mutedText}>Đang tải danh sách...</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderApplication}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có ứng viên nào ứng tuyển</Text>
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
  listContent: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  jobTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.action + "15",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.action,
    fontSize: 18,
    fontWeight: "800",
  },
  infoMain: {
    flex: 1,
    gap: 4,
  },
  candidateName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
    opacity: 0.5,
  },
  contactInfo: {
    flexDirection: 'column',
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    opacity: 0.4,
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