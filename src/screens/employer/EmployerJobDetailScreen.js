import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

// Giả định các hằng số và service của bạn
import { COLORS, RADII } from "../../constants/theme";
import { LABELS, getWorkTypeLabel } from "../../constants/labels";
import { getCompanyLogoSource } from "../../constants/companyLogos";
import { jobService } from "../../services/jobService";
import PrimaryButton from "../../components/PrimaryButton";
import EmptyState from "../../components/EmptyState";

const HEADER_ROW_HEIGHT = 56;

export default function EmployerJobDetailScreen({ route, navigation }) {
  // 1. Kiểm tra an toàn jobId từ route
  const { jobId } = route.params || {};
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // 2. Tự động ẩn Header mặc định của Navigation để tránh lỗi 2 tiêu đề như trong ảnh
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadJobDetails = async () => {
        try {
            setLoading(true);
            // Thay đổi từ getJobById sang getJobByIdForEmployer
            const response = await jobService.getJobByIdForEmployer(jobId); 
            
            const data = response?.data || response;
            if (data) {
              setJob(data);
            } else {
              setError("Không tìm thấy thông tin công việc.");
            }
          } catch (err) {
            setError("Lỗi kết nối.");
          } finally {
            setLoading(false);
          }
      };

      loadJobDetails();
      return () => { isMounted = false; };
    }, [jobId])
  );

  // 3. Hiệu ứng Header động khi cuộn
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const handleEdit = () => {
    navigation.navigate("EmployerJobForm", { jobId });
  };

  const handleDelete = () => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa tin tuyển dụng này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await jobService.deleteJob(jobId);
            navigation.goBack();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa tin lúc này.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // Render trạng thái Lỗi/Trống (Dựa trên ảnh image_ea62de.png)
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.action} />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.screen}>
        <View style={[styles.headerRow, { marginTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <EmptyState 
            icon="alert-circle-outline" 
            title="Lỗi" 
            message={error || "Dữ liệu trống"} 
          />
          <PrimaryButton 
            title="Quay lại" 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: 20, width: '60%' }} 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      
      {/* Floating Header */}
      <View style={[styles.customHeader, { height: insets.top + HEADER_ROW_HEIGHT }]}>
        <Animated.View style={[styles.headerBg, { opacity: headerOpacity }]} />
        <View style={[styles.headerContent, { marginTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Animated.Text style={[styles.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
            {job.title}
          </Animated.Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View style={[styles.banner, { paddingTop: insets.top + HEADER_ROW_HEIGHT + 10 }]}>
          <View style={styles.logoContainer}>
            <Image
              source={getCompanyLogoSource(job.logo_path)}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.jobTitleText}>{job.title}</Text>
          <Text style={styles.companyNameText}>{job.company_name}</Text>

          <View style={styles.gridInfo}>
            <InfoBox label="Mức lương" value={job.salary} icon="cash-outline" isLeft />
            <InfoBox label="Địa điểm" value={job.location_name} icon="location-outline" />
            <InfoBox label="Hình thức" value={getWorkTypeLabel(job.work_type)} icon="time-outline" isLeft />
            <InfoBox label="Số lượng" value={`${job.quantity} người`} icon="people-outline" />
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsBody}>
          <DetailSection title="Mô tả công việc" content={job.description} />
          <DetailSection title="Yêu cầu" content={job.requirements} />
          <DetailSection title="Quyền lợi" content={job.benefits} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} disabled={deleting}>
          {deleting ? <ActivityIndicator color={COLORS.danger} /> : <Ionicons name="trash-outline" size={22} color={COLORS.danger} />}
        </TouchableOpacity>
        <PrimaryButton 
          title="Chỉnh sửa tin" 
          onPress={handleEdit} 
          style={styles.btnEdit} 
        />
      </View>
    </View>
  );
}

// Sub-components
const InfoBox = ({ label, value, icon, isLeft }) => (
  <View style={[styles.infoBox, isLeft && styles.borderRight]}>
    <Ionicons name={icon} size={20} color={COLORS.action} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || "Thỏa thuận"}</Text>
  </View>
);

const DetailSection = ({ title, content }) => (
  <View style={styles.sectionMargin}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionText}>{content || "Chưa có thông tin cập nhật."}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.surface },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  
  customHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  headerBg: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerContent: { height: HEADER_ROW_HEIGHT, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, flex: 1, textAlign: "center" },

  banner: { backgroundColor: "#F8FAFA", alignItems: "center", paddingHorizontal: 20, paddingBottom: 20 },
  logoContainer: { width: 80, height: 80, backgroundColor: "#FFF", borderRadius: 16, elevation: 2, justifyContent: "center", alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  logo: { width: "70%", height: "70%" },
  jobTitleText: { fontSize: 22, fontWeight: "700", color: COLORS.text, textAlign: "center" },
  companyNameText: { fontSize: 16, color: COLORS.muted, marginTop: 5 },

  gridInfo: { flexDirection: "row", flexWrap: "wrap", marginTop: 25, borderTopWidth: 1, borderTopColor: "#EEE" },
  infoBox: { width: "50%", paddingVertical: 15, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#EEE" },
  borderRight: { borderRightWidth: 1, borderRightColor: "#EEE" },
  infoLabel: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  infoValue: { fontSize: 14, fontWeight: "600", color: COLORS.text, marginTop: 2 },

  detailsBody: { padding: 20 },
  sectionMargin: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 10 },
  sectionText: { fontSize: 15, color: "#444", lineHeight: 24 },

  bottomActions: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", flexDirection: "row", padding: 15, gap: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  btnDelete: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.danger, justifyContent: "center", alignItems: "center" },
  btnEdit: { flex: 1, height: 50 },
});