import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/appConstants";
import { LABELS } from "../../constants/labels";
import { authService } from "../../services/authService";

const initialForm = {
  representativeName: "",
  email: "",
  password: "",
  phone: "",
  companyName: "",
  companyField: "",
  companyAddress: "",
};

export default function EmployerRegisterScreen({ onAuthenticated }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleRegister() {
    try {
      setLoading(true);
      setError("");

      const user = await authService.registerEmployer(form);
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <View style={styles.form}>
        <Text style={styles.title}>Thông tin nhà tuyển dụng</Text>
        <TextInput
          onChangeText={(value) => updateField("representativeName", value)}
          placeholder="Họ tên người đại diện"
          style={styles.input}
          value={form.representativeName}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => updateField("email", value)}
          placeholder="Email"
          style={styles.input}
          value={form.email}
        />
        <TextInput
          onChangeText={(value) => updateField("password", value)}
          placeholder="Mật khẩu"
          secureTextEntry
          style={styles.input}
          value={form.password}
        />
        <TextInput
          keyboardType="phone-pad"
          onChangeText={(value) => updateField("phone", value)}
          placeholder="Số điện thoại"
          style={styles.input}
          value={form.phone}
        />
        <TextInput
          onChangeText={(value) => updateField("companyName", value)}
          placeholder="Tên công ty"
          style={styles.input}
          value={form.companyName}
        />
        <TextInput
          onChangeText={(value) => updateField("companyField", value)}
          placeholder="Lĩnh vực công ty"
          style={styles.input}
          value={form.companyField}
        />
        <TextInput
          onChangeText={(value) => updateField("companyAddress", value)}
          placeholder="Địa chỉ công ty"
          style={styles.input}
          value={form.companyAddress}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          loading={loading}
          onPress={handleRegister}
          title={LABELS.buttons.createEmployerAccount}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
  },
});
