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
import { ROLE_LABELS } from "../../constants/labels";
import { COLORS, RADII } from "../../constants/theme";
import { adminService } from "../../services/adminService";
import { USER_STATUS } from "../../constants/appConstants";
import { getCompanyLogoSource } from "../../constants/companyLogos";

const HEADER_ROW_HEIGHT = 52;

export default function UserDetailScreen({ route, navigation }) {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const user = await adminService.getUserById(userId);
      setAccount(user);
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tải tài khoản.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  async function handleToggleStatus() {
    try {
      if (!account) {
        return;
      }

      const nextStatus = account.status === USER_STATUS.LOCKED ? USER_STATUS.ACTIVE : USER_STATUS.LOCKED;
      await adminService.updateUserStatus(account.id, nextStatus);
      Alert.alert("Thành công", "Đã cập nhật trạng thái tài khoản.");
      loadUser();
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật trạng thái.");
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

  if (!account) {
    return (
      <View style={[styles.screen, styles.centerBox]}>
        <Text style={styles.emptyText}>Không có dữ liệu.</Text>
      </View>
    );
  }

  const locked = account.status === USER_STATUS.LOCKED;
  const logoSource = account.logo_path ? getCompanyLogoSource(account.logo_path) : null;
  const initial = account.full_name ? account.full_name.charAt(0).toUpperCase() : "U";

  return (
    <View style={styles.screen}>
      <View style={styles.headerWrap}>
        <Animated.View style={[styles.headerBackground, { opacity: headerOpacity }]} />
        <Animated.View style={[styles.headerDivider, { opacity: headerOpacity }]} />

        <View style={[styles.headerRow, { paddingTop: insets.top }]}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Ionicons color={COLORS.text} name="arrow-back" size={24} />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.headerTitleWrap,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Text numberOfLines={1} style={styles.headerTitle}>
              {account.full_name}
            </Text>
            <Text numberOfLines={1} style={styles.headerSubtitle}>
              {ROLE_LABELS[account.role] || account.role}
            </Text>
          </Animated.View>

          <View style={styles.headerButtonSpacer} />
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 10) },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { paddingTop: insets.top + HEADER_ROW_HEIGHT - 35 }]}>
          <View style={styles.logoShell}>
            <View style={styles.logoBadge}>
              {logoSource ? (
                <Image resizeMode="contain" source={logoSource} style={styles.logoImage} />
              ) : (
                <Text style={styles.logoBadgeText}>{initial}</Text>
              )}
            </View>
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.heroTitle}>{account.full_name}</Text>
            <View style={styles.companyLink}>
              <Text numberOfLines={1} style={styles.heroCompany}>
                {account.email}
              </Text>
            </View>

            <View style={styles.metaGrid}>
              <MetaItem
                icon="shield-checkmark-outline"
                label="Vai trò"
                value={ROLE_LABELS[account.role] || account.role}
                withRightBorder
              />
              <MetaItem
                icon="call-outline"
                label="Điện thoại"
                value={account.phone || "Chưa cập nhật"}
              />
              <MetaItem
                icon="business-outline"
                label="Công ty"
                value={account.company_name || "Không có"}
                withRightBorder
              />
              <MetaItem
                icon="information-circle-outline"
                label="Trạng thái"
                value={locked ? "Bị khóa" : "Đang hoạt động"}
              />
            </View>
          </View>
        </View>
        <View style={styles.contentInner}>
          <View style={styles.companySectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin thêm</Text>
          </View>
          <Text style={styles.sectionText}>Tài khoản được tạo ngày: {account.created_at}</Text>
        </View>
      </Animated.ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) + 6 }]}>
        <PrimaryButton
          style={[styles.applyButton, { backgroundColor: locked ? COLORS.success : COLORS.danger }]}
          title={locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          onPress={handleToggleStatus}
        />
      </View>
    </View>
  );
}

function MetaItem({ icon, label, value, withRightBorder = false }) {
  return (
    <View style={[styles.metaItem, withRightBorder && styles.metaItemWithRightBorder]}>
      <Ionicons color={COLORS.action} name={icon} size={18} style={styles.metaItemIcon} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.surface,
    flex: 1,
  },
  headerWrap: {
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 20,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surface,
  },
  headerDivider: {
    backgroundColor: COLORS.border,
    bottom: 0,
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: HEADER_ROW_HEIGHT,
    paddingHorizontal: 12,
  },
  headerButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerButtonSpacer: {
    width: 40,
  },
  headerTitleWrap: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  scrollContent: {
    backgroundColor: COLORS.surface,
  },
  heroSection: {
    backgroundColor: "#F2F6F6",
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  logoShell: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoBadge: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    height: 78,
    justifyContent: "center",
    width: 78,
    overflow: "hidden",
  },
  logoBadgeText: {
    color: COLORS.muted,
    fontSize: 34,
    fontWeight: "700",
  },
  logoImage: {
    height: "82%",
    width: "82%",
  },
  summaryContent: {
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "700",
    lineHeight: 28,
    textAlign: "center",
  },
  heroCompany: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
  },
  companyLink: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 2,
    marginTop: 8,
    maxWidth: "100%",
  },
  metaGrid: {
    borderTopColor: "rgba(17, 17, 17, 0.08)",
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },
  metaItem: {
    alignItems: "center",
    borderBottomColor: "rgba(17, 17, 17, 0.06)",
    borderBottomWidth: 1,
    justifyContent: "flex-start",
    minHeight: 94,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: "50%",
  },
  metaItemWithRightBorder: {
    borderRightColor: "rgba(17, 17, 17, 0.06)",
    borderRightWidth: 1,
  },
  metaItemIcon: {
    marginBottom: 8,
  },
  metaLabel: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    textAlign: "center",
  },
  contentInner: {
    padding: 18,
  },
  companySectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  sectionText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  bottomBar: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 10,
    left: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    position: "absolute",
    right: 0,
  },
  applyButton: {
    flex: 1,
  },
});
