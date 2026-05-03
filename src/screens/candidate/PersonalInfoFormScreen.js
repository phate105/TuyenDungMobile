import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import DateTextField from "../../components/DateTextField";
import FormTextField from "../../components/FormTextField";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { cvService } from "../../services/cvService";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";

export default function PersonalInfoFormScreen({ navigation, user }) {
  const [form, setForm] = useState({
    fullName: user.full_name || "",
    email: user.email || "",
    phone: user.phone || "",
    desiredTitle: "",
    address: "",
    birthDate: "",
    careerObjective: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPersonalInfo() {
      const cv = await cvService.getCVByCandidate(user.id);

      if (cv?.personalInfo) {
        setForm((current) => ({ ...current, ...cv.personalInfo }));
      }
    }

    loadPersonalInfo();
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await cvService.savePersonalInfo(user.id, form);
      Alert.alert("CV", "Đã lưu thông tin cá nhân.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
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
          required
          keyboardType="email-address"
          label="Email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
        />
        <FormTextField
          required
          keyboardType="phone-pad"
          label="Số điện thoại"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
        />
        <FormTextField
          label="Chức danh mong muốn"
          value={form.desiredTitle}
          onChangeText={(value) => updateField("desiredTitle", value)}
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
          label="Mục tiêu nghề nghiệp"
          value={form.careerObjective}
          onChangeText={(value) => updateField("careerObjective", value)}
        />
        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu thông tin cá nhân" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  form: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
});
