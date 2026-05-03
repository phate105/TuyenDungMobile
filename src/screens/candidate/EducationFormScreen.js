import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import FormTextField from "../../components/FormTextField";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function EducationFormScreen({ navigation, user }) {
  const [form, setForm] = useState({
    school: "",
    degree: "",
    major: "",
    startYear: "",
    endYear: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEducation() {
      const fullCV = await cvService.getFullCV(user.id);
      const education = fullCV.educations[0];

      if (education) {
        setForm({
          school: education.school || "",
          degree: education.degree || "",
          major: education.major || "",
          startYear: education.start_year || "",
          endYear: education.end_year || "",
          description: education.description || "",
        });
      }
    }

    loadEducation();
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await cvService.saveEducation(user.id, form);
      Alert.alert("CV", "Đã lưu trình độ học vấn.");
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
          label="Tên trường"
          value={form.school}
          onChangeText={(value) => updateField("school", value)}
        />
        <FormTextField
          label="Bằng cấp"
          value={form.degree}
          onChangeText={(value) => updateField("degree", value)}
        />
        <FormTextField
          required
          label="Ngành học"
          value={form.major}
          onChangeText={(value) => updateField("major", value)}
        />
        <FormTextField
          required
          keyboardType="number-pad"
          label="Năm bắt đầu"
          value={form.startYear}
          onChangeText={(value) => updateField("startYear", value)}
        />
        <FormTextField
          required
          keyboardType="number-pad"
          label="Năm kết thúc"
          value={form.endYear}
          onChangeText={(value) => updateField("endYear", value)}
        />
        <FormTextField
          multiline
          label="Mô tả"
          value={form.description}
          onChangeText={(value) => updateField("description", value)}
        />
        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu học vấn" />
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
