import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 1. Import này

import Screen from "../../components/Screen";
import { LABELS, getWorkTypeLabel } from "../../constants/labels";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { candidateService } from "../../services/candidateService";
import { cvService } from "../../services/cvService";

export default function CandidateProfileScreen({ navigation, user }) {
  const [profile, setProfile] = useState(null);
  const [fullCV, setFullCV] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const insets = useSafeAreaInsets(); // 2. Lấy các giá trị vùng an toàn

  const loadProfile = useCallback(async () => {
    setLoading(true);

    const [profileResult, cvResult] = await Promise.all([
      candidateService.getCandidateProfile(user.id),
      cvService.getFullCV(user.id),
    ]);

    setProfile(profileResult);
    setFullCV(cvResult);
    setLoading(false);
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  async function handlePickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập ảnh",
          "Vui lòng cho phép ứng dụng truy cập thư viện ảnh để đổi ảnh đại diện."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setUpdatingAvatar(true);
      const updatedProfile = await candidateService.updateCandidateAvatar(user.id, result.assets[0].uri);
      setProfile(updatedProfile);
    } catch (err) {
      Alert.alert(LABELS.common.error, err.message);
    } finally {
      setUpdatingAvatar(false);
    }
  }

  if (loading) {
    return (
      <Screen scroll style={{ backgroundColor: COLORS.surface }}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải hồ sơ...</Text>
        </View>
      </Screen>
    );
  }

  const displayProfile = profile || user;
  const initials = getInitials(displayProfile.full_name);
  const cvStatus = fullCV?.isCompleted ? "Đã hoàn thành" : "Chưa hoàn thành";
  const category = displayProfile.category_name || displayProfile.interested_category;
  const location = displayProfile.location_name || displayProfile.desired_location;

  return (
    <Screen scroll style={{ paddingTop: insets.top }}>
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={updatingAvatar}
            onPress={handlePickAvatar}
            style={styles.avatarButton}
          >
            {displayProfile.avatar_uri ? (
              <Image source={{ uri: displayProfile.avatar_uri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {updatingAvatar ? (
                <ActivityIndicator color={COLORS.surface} size="small" />
              ) : (
                <Ionicons color={COLORS.surface} name="camera-outline" size={14} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text numberOfLines={2} style={styles.name}>
              {displayProfile.full_name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons color={COLORS.action} name="location-outline" size={15} />
              <Text numberOfLines={2} style={styles.locationText}>
                {location || "Chưa cập nhật địa điểm"}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Settings")}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.settingsButtonPressed]}
          >
            <Ionicons color={COLORS.text} name="settings-outline" size={19} />
          </Pressable>
        </View>
      </View>

      <ProfileCard
        icon="options-outline"
        title="Tiêu chí việc làm"
        onPress={() => navigation.navigate("JobPreference")}
      >
        <InfoRow label="Ngành nghề" value={category || LABELS.common.noUpdate} />
        <InfoRow label="Địa điểm" value={location || LABELS.common.noUpdate} />
        <InfoRow label="Vị trí mong muốn" value={displayProfile.desired_title || LABELS.common.noUpdate} />
        <InfoRow label="Hình thức" value={getWorkTypeLabel(displayProfile.work_type)} />
        <InfoRow label="Mức lương" value={displayProfile.expected_salary || LABELS.common.noUpdate} />
      </ProfileCard>

      <ProfileCard
        icon="document-text-outline"
        title="Quản lý CV"
        onPress={() => navigation.navigate("CVManagement")}
      >
        <InfoRow label="Trạng thái CV" value={cvStatus} />
        <InfoRow
          label="Hồ sơ ứng tuyển"
          value={fullCV?.cv ? "Đã có CV trong hồ sơ" : "Chưa có CV"}
        />
      </ProfileCard>
    </Screen>
  );
}

function ProfileCard({ title, icon, children, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <View style={styles.cardIcon}>
            <Ionicons color={COLORS.brand} name={icon} size={21} />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Ionicons color={COLORS.muted} name="chevron-forward" size={20} />
      </View>
      {children}
    </Pressable>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "UV";
  }

  return parts
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  centerBox: {
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 40,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    
  },
  headerTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  avatarButton: {
    height: 74,
    width: 74,
  },
  avatarImage: {
    borderColor: COLORS.border,
    borderRadius: 37,
    borderWidth: 2,
    height: 74,
    width: 74,
  },
  avatarPlaceholder: {
    alignItems: "center",
    backgroundColor: COLORS.action,
    borderColor: COLORS.border,
    borderRadius: 37,
    borderWidth: 2,
    height: 74,
    justifyContent: "center",
    width: 74,
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: 22,
    fontWeight: "700",
  },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: COLORS.action,
    borderColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 2,
    bottom: -2,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 28,
  },
  headerInfo: {
    flex: 1,
    flexShrink: 1,
    gap: 6,
    minWidth: 0,
    paddingTop: 4,
  },
  name: {
    color: COLORS.text,
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  locationText: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    marginLeft: 4,
    marginTop: 2,
    width: 40,
  },
  settingsButtonPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 14,
    padding: 16,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitleWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: COLORS.brandSoft,
    borderRadius: RADII.md,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "600",
  },
  infoRow: {
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 10,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
