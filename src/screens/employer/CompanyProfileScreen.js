import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { employerService } from "../../services/employerService";

const initialForm = {
  companyName: "",
  companyField: "",
  companyAddress: "",
  description: "",
};

export default function CompanyProfileScreen({ user }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const profile = await employerService.getCompanyProfile(user.id);

        if (profile && active) {
          setForm({
            companyName: profile.company_name || "",
            companyField: profile.company_field || "",
            companyAddress: profile.company_address || "",
            description: profile.description || "",
          });
        }
      } catch (err) {
        Alert.alert("Lỗi", err.message);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await employerService.saveCompanyProfile(user.id, form);
      Alert.alert("Thành công", "Đã lưu hồ sơ công ty.");
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.form}>
        <Field label="Tên công ty">
          <TextInput
            onChangeText={(value) => updateField("companyName", value)}
            placeholder="Nhập tên công ty"
            style={styles.input}
            value={form.companyName}
          />
        </Field>

        <Field label="Lĩnh vực công ty">
          <TextInput
            onChangeText={(value) => updateField("companyField", value)}
            placeholder="Nhập lĩnh vực công ty"
            style={styles.input}
            value={form.companyField}
          />
        </Field>

        <Field label="Địa chỉ công ty">
          <TextInput
            onChangeText={(value) => updateField("companyAddress", value)}
            placeholder="Nhập địa chỉ công ty"
            style={styles.input}
            value={form.companyAddress}
          />
        </Field>

        <Field label="Giới thiệu công ty">
          <TextInput
            multiline
            onChangeText={(value) => updateField("description", value)}
            placeholder="Nhập mô tả công ty"
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={form.description}
          />
        </Field>

        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu hồ sơ công ty" />
      </View>
    </Screen>
  );
}

function Field({ children, label }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 120,
  },
});
