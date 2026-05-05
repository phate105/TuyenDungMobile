import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import DateTextField from "../../components/DateTextField";
import FormTextField from "../../components/FormTextField";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { LABELS } from "../../constants/labels";
import { candidateService } from "../../services/candidateService";

export default function EditCandidateProfileScreen({ navigation, user }) {
  const [form, setForm] = useState({
    fullName: user.full_name || "",
    phone: user.phone || "",
    address: "",
    birthDate: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const profile = await candidateService.getCandidateProfile(user.id);

      if (mounted && profile) {
        setForm({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          birthDate: profile.birth_date || "",
          bio: profile.bio || "",
        });
        setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      await candidateService.updateCandidateProfile(user.id, form);
      Alert.alert("Hồ sơ cá nhân", "Đã cập nhật hồ sơ cá nhân.");
      navigation.goBack();
    } catch (err) {
      Alert.alert(LABELS.common.error, err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen edges={["left", "right"]}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.brand} />
          <Text style={styles.mutedText}>Đang tải hồ sơ...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll>
      <View style={styles.form}>
        <FormTextField
          required
          label="Họ tên"
          value={form.fullName}
          onChangeText={(value) => updateField("fullName", value)}
        />
        <FormTextField
          keyboardType="phone-pad"
          label="Số điện thoại"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
        />
        <FormTextField
          label="Địa chỉ"
          value={form.address}
          onChangeText={(value) => updateField("address", value)}
        />
        <DateTextField
          label="Ngày sinh"
          maxYear={new Date().getFullYear()}
          placeholder="DD/MM/YYYY"
          value={form.birthDate}
          onChangeText={(value) => updateField("birthDate", value)}
        />
        <FormTextField
          multiline
          label="Mục tiêu nghề nghiệp / giới thiệu bản thân"
          value={form.bio}
          onChangeText={(value) => updateField("bio", value)}
        />
        <PrimaryButton loading={saving} onPress={handleSave} title={LABELS.buttons.saveChanges} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  form: {
    backgroundColor: "#ffffff",
    borderColor: "#cccccc",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  centerBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
