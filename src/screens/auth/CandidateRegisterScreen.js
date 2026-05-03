import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/appConstants";
import { LABELS } from "../../constants/labels";
import { authService } from "../../services/authService";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  interestedCategory: "",
  desiredLocation: "",
};

export default function CandidateRegisterScreen({ onAuthenticated }) {
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

      const user = await authService.registerCandidate(form);
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
        <Text style={styles.title}>Thông tin ứng viên</Text>
        <TextInput
          onChangeText={(value) => updateField("fullName", value)}
          placeholder="Họ tên"
          style={styles.input}
          value={form.fullName}
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
          onChangeText={(value) => updateField("interestedCategory", value)}
          placeholder="Ngành nghề quan tâm"
          style={styles.input}
          value={form.interestedCategory}
        />
        <TextInput
          onChangeText={(value) => updateField("desiredLocation", value)}
          placeholder="Địa điểm mong muốn"
          style={styles.input}
          value={form.desiredLocation}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          loading={loading}
          onPress={handleRegister}
          title={LABELS.buttons.createCandidateAccount}
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
