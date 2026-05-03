import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import DateTextField from "../../components/DateTextField";
import FormTextField from "../../components/FormTextField";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/appConstants";
import { RADII, SHADOWS } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function ExperienceFormScreen({ navigation, user }) {
  const [form, setForm] = useState({
    organization: "",
    title: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExperience() {
      const fullCV = await cvService.getFullCV(user.id);
      const experience = fullCV.experiences[0];

      if (experience) {
        setForm({
          organization: experience.organization || "",
          title: experience.title || "",
          startDate: experience.start_date || "",
          endDate: experience.end_date || "",
          description: experience.description || "",
        });
      }
    }

    loadExperience();
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await cvService.saveExperience(user.id, form);
      Alert.alert("CV", "Đã lưu kinh nghiệm / dự án.");
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
          label="Tên công ty/dự án"
          value={form.organization}
          onChangeText={(value) => updateField("organization", value)}
        />
        <FormTextField
          required
          label="Vị trí/vai trò"
          value={form.title}
          onChangeText={(value) => updateField("title", value)}
        />
        <DateTextField
          required
          label="Ngày bắt đầu"
          minYear={1990}
          placeholder="DD/MM/YYYY"
          value={form.startDate}
          onChangeText={(value) => updateField("startDate", value)}
        />
        <DateTextField
          required
          label="Ngày kết thúc"
          minYear={1990}
          placeholder="DD/MM/YYYY"
          value={form.endDate}
          onChangeText={(value) => updateField("endDate", value)}
        />
        <FormTextField
          multiline
          required
          label="Mô tả kinh nghiệm"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
        />
        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu kinh nghiệm" />
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
