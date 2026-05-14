import { Ionicons } from "@expo/vector-icons";
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
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import { APPLICATION_STATUS } from "../../constants/appConstants";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const HEADER_ROW_HEIGHT = 52;

export default function ApplicationsDetailScreen({ route, navigation }) {
  const { applicationId } = route.params;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getApplicationById(applicationId);
      if (!data) {
        Alert.alert("Lỗi", "Không tìm thấy đơn ứng tuyển.");
        return;
      }
      setApplication(data);
      if (data.status === APPLICATION_STATUS.SUBMITTED) {
        await adminService.updateApplicationStatus(applicationId, APPLICATION_STATUS.UNDER_REVIEW);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tải chi tiết đơn.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useFocusEffect(
    useCallback(() => {
      loadApplication();
    }, [loadApplication])
  );

  async function handleUpdateStatus(status) {
    try {
      await adminService.updateApplicationStatus(applicationId, status);
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn.");
      loadApplication();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật.");
    }
  }

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

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerBox]}>
        <ActivityIndicator color={COLORS.action} size="large" />
      </View>
    );
  }

  if (!application) {
    return (
      <View style={[styles.screen, styles.centerBox]}>
        <Text style={styles.emptyText}>Không có dữ liệu.</Text>
      </View>
    );
  }

  const initial = application.full_name ? application.full_name.charAt(0).toUpperCase() : "U";

  let statusText = "Chờ duyệt";
  if (application.status === APPLICATION_STATUS.SUITABLE) statusText = "Phù hợp";
  if (application.status === APPLICATION_STATUS.REJECTED) statusText = "Từ chối";
  if (application.status === APPLICATION_STATUS.UNDER_REVIEW) statusText = "Đã xem";

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <Animated.View style={[styles.headerDivider, { opacity: headerOpacity }]} />

        <View style={[styles.headerRow, { paddingTop: insets.top }]}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons color={COLORS.text} name="arrow-back" size={24} />
          </TouchableOpacity>

          <Animated.View style={[styles.headerTitleWrap, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
            <Text numberOfLines={1} style={styles.headerTitle}>{application.full_name}</Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>{application.title}</Text>
          </Animated.View>
          <View style={styles.headerButtonSpacer} />
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + Math.max(insets.bottom, 10) }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { paddingTop: insets.top + HEADER_ROW_HEIGHT - 35 }]}>
          <View style={styles.logoShell}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>{initial}</Text>
            </View>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.heroTitle}>{application.full_name}</Text>
            <View style={styles.companyLink}>
              <Text numberOfLines={1} style={styles.heroCompany}>{application.title}</Text>
            </View>

            <View style={styles.metaGrid}>
              <MetaItem icon="information-circle-outline" label="Trạng thái" value={statusText} withRightBorder />
              <MetaItem icon="business-outline" label="Công ty" value={application.company_name} />
              <MetaItem icon="cash-outline" label="Mức lương" value={application.salary} withRightBorder />
              <MetaItem icon="location-outline" label="Địa điểm" value={application.location_name} />
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.contentInner}>
            <SectionBlock title="Thông tin liên hệ" content={`Email: ${application.email}\nSố điện thoại: ${application.phone}`} />
            <View style={styles.divider} />
            <SectionBlock title="Lời giới thiệu" content={application.cover_letter || "Không có lời giới thiệu."} />
          </View>
        </View>
      </Animated.ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
        <PrimaryButton
          style={[styles.applyButton, { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.danger }]}
          textStyle={{ color: COLORS.danger }}
          title="Từ chối"
          onPress={() => handleUpdateStatus(APPLICATION_STATUS.REJECTED)}
        />
        <PrimaryButton
          style={[styles.applyButton, { backgroundColor: COLORS.success }]}
          title="Phù hợp"
          onPress={() => handleUpdateStatus(APPLICATION_STATUS.SUITABLE)}
        />
      </View>
    </View>
  );
}

function SectionBlock({ title, content }) {
  const lines = String(content || "")
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.detailTextBlock}>
        {lines.map((line, idx) => (
          <Text key={idx} style={styles.sectionText}>{line}</Text>
        ))}
      </View>
    </View>
  );
}

function MetaItem({ icon, label, value, withRightBorder = false }) {
  return (
    <View style={[styles.metaItem, withRightBorder && styles.metaItemWithRightBorder]}>
      <Ionicons color={COLORS.action} name={icon} size={18} style={styles.metaItemIcon} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: COLORS.surface, flex: 1 },
  headerWrap: { left: 0, position: "absolute", right: 0, top: 0, zIndex: 20 },
  headerBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.surface },
  headerDivider: { backgroundColor: COLORS.border, bottom: 0, height: 1, left: 0, position: "absolute", right: 0 },
  headerRow: { alignItems: "center", flexDirection: "row", minHeight: HEADER_ROW_HEIGHT, paddingHorizontal: 12 },
  headerButton: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  headerButtonSpacer: { width: 40 },
  headerTitleWrap: { alignItems: "center", flex: 1, justifyContent: "center", paddingHorizontal: 8 },
  headerTitle: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  headerSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  scrollContent: { backgroundColor: COLORS.surface },
  heroSection: { backgroundColor: "#F2F6F6", paddingBottom: 14, paddingHorizontal: 18 },
  logoShell: { alignItems: "center", marginBottom: 12 },
  logoBadge: { alignItems: "center", backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1, borderRadius: 18, height: 78, justifyContent: "center", width: 78, overflow: "hidden" },
  logoBadgeText: { color: COLORS.muted, fontSize: 34, fontWeight: "700" },
  summaryContent: { paddingBottom: 4, paddingHorizontal: 6 },
  heroTitle: { color: COLORS.text, fontSize: 21, fontWeight: "700", lineHeight: 28, textAlign: "center" },
  heroCompany: { color: COLORS.muted, fontSize: 15, textAlign: "center" },
  companyLink: { alignItems: "center", alignSelf: "center", flexDirection: "row", gap: 2, marginTop: 8, maxWidth: "100%" },
  metaGrid: { borderTopColor: "rgba(17, 17, 17, 0.08)", borderTopWidth: 1, flexDirection: "row", flexWrap: "wrap", marginTop: 18 },
  metaItem: { alignItems: "center", borderBottomColor: "rgba(17, 17, 17, 0.06)", borderBottomWidth: 1, justifyContent: "flex-start", minHeight: 94, paddingHorizontal: 10, paddingVertical: 12, width: "50%" },
  metaItemWithRightBorder: { borderRightColor: "rgba(17, 17, 17, 0.06)", borderRightWidth: 1 },
  metaItemIcon: { marginBottom: 8 },
  metaLabel: { color: COLORS.muted, fontSize: 13, marginBottom: 4, textAlign: "center" },
  metaValue: { color: COLORS.text, fontSize: 15, fontWeight: "700", lineHeight: 20, textAlign: "center" },
  contentSection: { backgroundColor: COLORS.surface, paddingTop: 12, paddingBottom: 8 },
  contentInner: { paddingHorizontal: 18 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "600", marginBottom: 10 },
  detailTextBlock: { gap: 6 },
  sectionText: { color: "#2B2B2B", fontSize: 15, lineHeight: 24 },
  divider: { backgroundColor: COLORS.border, height: 1, marginVertical: 18 },
  centerBox: { alignItems: "center", flex: 1, justifyContent: "center" },
  emptyText: { color: COLORS.muted, fontSize: 14 },
  bottomBar: { alignItems: "center", backgroundColor: COLORS.surface, borderTopColor: COLORS.border, borderTopWidth: 1, bottom: 0, flexDirection: "row", gap: 10, left: 0, paddingHorizontal: 18, paddingTop: 10, position: "absolute", right: 0 },
  applyButton: { flex: 1 },
});
