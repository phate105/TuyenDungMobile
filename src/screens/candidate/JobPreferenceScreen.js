import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import FormTextField from "../../components/FormTextField";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import SelectField from "../../components/SelectField";
import { LABELS, WORK_TYPE_LABELS } from "../../constants/labels";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { candidateService } from "../../services/candidateService";
import { jobService } from "../../services/jobService";

const workTypeOptions = [
  { value: "", label: "Không chọn" },
  ...Object.entries(WORK_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export default function JobPreferenceScreen({ navigation, user }) {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState({
    categoryId: null,
    locationId: null,
    desiredTitle: "",
    workType: "",
    expectedSalary: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [categoryResults, locationResults, profile] = await Promise.all([
        jobService.getCategories(),
        jobService.getLocations(),
        candidateService.getCandidateProfile(user.id),
      ]);

      if (!mounted) {
        return;
      }

      setCategories(categoryResults);
      setLocations(locationResults);
      setForm({
        categoryId: profile?.category_id || null,
        locationId: profile?.location_id || null,
        desiredTitle: profile?.desired_title || "",
        workType: profile?.work_type || "",
        expectedSalary: profile?.expected_salary || "",
      });
      setLoading(false);
    }

    loadData();

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
      await candidateService.updateJobPreference(user.id, form);
      Alert.alert("Tiêu chí việc làm", "Đã cập nhật tiêu chí việc làm.");
      navigation.goBack();
    } catch (err) {
      Alert.alert(LABELS.common.error, err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải tiêu chí...</Text>
        </View>
      </Screen>
    );
  }

  const categoryOptions = [
    { value: null, label: "Không chọn" },
    ...categories.map((item) => ({ value: item.id, label: item.name })),
  ];
  const locationOptions = [
    { value: null, label: "Không chọn" },
    ...locations.map((item) => ({ value: item.id, label: item.name })),
  ];

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tùy chỉnh gợi ý việc làm</Text>

        <SelectField
          label="Ngành nghề quan tâm"
          onChange={(value) => updateField("categoryId", value)}
          options={categoryOptions}
          selectedValue={form.categoryId}
        />

        <SelectField
          label="Địa điểm mong muốn"
          onChange={(value) => updateField("locationId", value)}
          options={locationOptions}
          selectedValue={form.locationId}
        />

        <FormTextField
          label="Vị trí mong muốn"
          onChangeText={(value) => updateField("desiredTitle", value)}
          placeholder="VD: React Native Developer"
          value={form.desiredTitle}
        />

        <SelectField
          label="Hình thức làm việc"
          onChange={(value) => updateField("workType", value)}
          options={workTypeOptions}
          selectedValue={form.workType}
        />

        <FormTextField
          label="Mức lương mong muốn"
          onChangeText={(value) => updateField("expectedSalary", value)}
          placeholder="VD: 12 - 15 triệu hoặc Thỏa thuận"
          value={form.expectedSalary}
        />

        <PrimaryButton loading={saving} onPress={handleSave} title={LABELS.buttons.saveChanges} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingTop: 8,
  },
  card: {
    ...SHADOWS.card,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    gap: 14,
    padding: 15,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
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
