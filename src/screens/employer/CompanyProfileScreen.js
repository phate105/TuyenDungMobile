import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { getCompanyLogoSource } from "../../constants/companyLogos";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const emptyForm = {
  companyName: "",
  companyField: "",
  companyAddress: "",
  website: "",
  companySize: "",
  contactPerson: "",
  description: "",
};

export default function CompanyProfileScreen({ user }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function run() {
        try {
          setLoading(true);
          const current = await employerService.getCompanyProfile(user.id);

          if (!active) {
            return;
          }

          setProfile(current);
          setForm(mapProfileToForm(current));
        } catch (error) {
          if (active) {
            Alert.alert("Lỗi", error.message || "Không thể tải hồ sơ công ty.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      run();

      return () => {
        active = false;
      };
    }, [user.id])
  );

  async function handlePickAvatar() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Quyền truy cập ảnh",
          "Vui lòng cho phép ứng dụng truy cập thư viện ảnh để đổi avatar."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setUpdatingAvatar(true);
      const updated = await employerService.updateCompanyAvatar(user.id, result.assets[0].uri);
      setProfile(updated);
      setForm(mapProfileToForm(updated));
      Alert.alert("Thành công", "Đã cập nhật ảnh đại diện công ty.");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật avatar.");
    } finally {
      setUpdatingAvatar(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên công ty.");
      return;
    }

    if (!form.companyField.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lĩnh vực công ty.");
      return;
    }

    if (!form.companyAddress.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ công ty.");
      return;
    }

    try {
      setSaving(true);
      const updated = await employerService.saveCompanyProfile(user.id, form);
      setProfile(updated);
      setForm(mapProfileToForm(updated));
      setIsEditing(false);
      Alert.alert("Thành công", "Đã lưu hồ sơ công ty.");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể lưu hồ sơ công ty.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setForm(mapProfileToForm(profile));
  }

  if (loading) {
    return (
      <Screen style={styles.screen} edges={["top", "left", "right"]}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} size="large" />
          <Text style={styles.loadingText}>Đang tải hồ sơ công ty...</Text>
        </View>
      </Screen>
    );
  }

  const companyName = profile?.company_name || form.companyName || "Hồ sơ công ty";
  const companyField = profile?.company_field || form.companyField || "Chưa cập nhật lĩnh vực";
  const companyAddress = profile?.company_address || form.companyAddress || "Chưa cập nhật địa chỉ";
  const avatarSource = profile?.avatar_uri
    ? { uri: profile.avatar_uri }
    : getCompanyLogoSource(profile?.logo_path);
  const initials = getCompanyInitials(companyName);

  return (
    <Screen
      scroll
      edges={["top", "left", "right"]}
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Pressable
            onPress={handlePickAvatar}
            disabled={updatingAvatar}
            style={({ pressed }) => [styles.avatarWrap, pressed && styles.pressed]}
          >
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
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
          </Pressable>

          <View style={styles.heroInfo}>
            <Text style={styles.companyName} numberOfLines={2}>
              {companyName}
            </Text>
            <Text style={styles.companyField} numberOfLines={2}>
              {companyField}
            </Text>
            <View style={styles.addressRow}>
              <Ionicons color={COLORS.action} name="location-outline" size={15} />
              <Text style={styles.addressText} numberOfLines={2}>
                {companyAddress}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIsEditing(true)}
            style={({ pressed }) => [styles.editIconButton, pressed && styles.pressed]}
          >
            <Ionicons color={COLORS.text} name="create-outline" size={18} />
          </Pressable>
        </View>

        <Text style={styles.avatarHint}>Bấm vào ảnh để đổi avatar local.</Text>
      </View>

      {!isEditing ? (
        <>
          <SectionCard title="Thông tin công ty" icon="business-outline">
            <InfoRow label="Lĩnh vực" value={companyField} />
            <Divider />
            <InfoRow label="Địa chỉ" value={companyAddress} />
            <Divider />
            <InfoRow label="Website" value={profile?.website || "Chưa cập nhật"} />
            <Divider />
            <InfoRow label="Quy mô" value={profile?.company_size || "Chưa cập nhật"} />
            <Divider />
            <InfoRow label="Người liên hệ" value={profile?.contact_person || "Chưa cập nhật"} />
          </SectionCard>

          <SectionCard title="Giới thiệu" icon="document-text-outline">
            <Text style={styles.description}>
              {profile?.description ||
                "Công ty chưa cập nhật phần giới thiệu. Bấm chỉnh sửa để bổ sung thông tin thương hiệu."}
            </Text>
          </SectionCard>

          <PrimaryButton onPress={() => setIsEditing(true)} title="Chỉnh sửa hồ sơ" />
        </>
      ) : (
        <>
          <SectionCard title="Chỉnh sửa thông tin" icon="create-outline">
            <EditField label="Tên công ty *">
              <TextInput
                placeholder="Ví dụ: Công ty TNHH ABC"
                placeholderTextColor={COLORS.mutedLight}
                value={form.companyName}
                onChangeText={(value) => updateField("companyName", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Lĩnh vực *">
              <TextInput
                placeholder="Ví dụ: Công nghệ thông tin"
                placeholderTextColor={COLORS.mutedLight}
                value={form.companyField}
                onChangeText={(value) => updateField("companyField", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Địa chỉ *">
              <TextInput
                placeholder="Số nhà, đường, quận/huyện, thành phố"
                placeholderTextColor={COLORS.mutedLight}
                value={form.companyAddress}
                onChangeText={(value) => updateField("companyAddress", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Website">
              <TextInput
                placeholder="Ví dụ: https://company.vn"
                placeholderTextColor={COLORS.mutedLight}
                value={form.website}
                onChangeText={(value) => updateField("website", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Quy mô">
              <TextInput
                placeholder="Ví dụ: 50 - 200 nhân sự"
                placeholderTextColor={COLORS.mutedLight}
                value={form.companySize}
                onChangeText={(value) => updateField("companySize", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Người liên hệ">
              <TextInput
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={COLORS.mutedLight}
                value={form.contactPerson}
                onChangeText={(value) => updateField("contactPerson", value)}
                style={styles.input}
              />
            </EditField>

            <EditField label="Giới thiệu công ty">
              <TextInput
                multiline
                placeholder="Mô tả ngắn về công ty, môi trường và định hướng phát triển"
                placeholderTextColor={COLORS.mutedLight}
                value={form.description}
                onChangeText={(value) => updateField("description", value)}
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
              />
            </EditField>
          </SectionCard>

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>

            <View style={styles.saveButtonWrap}>
              <PrimaryButton loading={saving} onPress={handleSave} title="Lưu thay đổi" />
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconWrap}>
            <Ionicons color={COLORS.brand} name={icon} size={18} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      </View>
      {children}
    </View>
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

function EditField({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function mapProfileToForm(profile) {
  return {
    companyName: profile?.company_name || "",
    companyField: profile?.company_field || "",
    companyAddress: profile?.company_address || "",
    website: profile?.website || "",
    companySize: profile?.company_size || "",
    contactPerson: profile?.contact_person || "",
    description: profile?.description || "",
  };
}

function getCompanyInitials(name = "") {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CT";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 36,
    paddingTop: 12,
  },
  centerBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 14,
  },

  heroCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...SHADOWS.card,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  avatarWrap: {
    height: 78,
    width: 78,
  },
  avatarImage: {
    borderColor: COLORS.border,
    borderRadius: 39,
    borderWidth: 1,
    height: "100%",
    width: "100%",
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: COLORS.brand,
    borderColor: COLORS.border,
    borderRadius: 39,
    borderWidth: 1,
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  avatarText: {
    color: COLORS.surface,
    fontSize: 24,
    fontWeight: "800",
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
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  companyField: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  addressRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  addressText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  editIconButton: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarHint: {
    color: COLORS.mutedLight,
    fontSize: 12,
    marginTop: 10,
  },

  sectionCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    ...SHADOWS.card,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  sectionIconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.actionSoft,
    borderRadius: 10,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: {
    gap: 4,
    paddingVertical: 10,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 24,
  },

  field: {
    gap: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 112,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 96,
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
  },
  saveButtonWrap: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
