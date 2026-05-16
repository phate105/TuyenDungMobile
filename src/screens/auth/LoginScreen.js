import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import BrandLogo from "../../components/BrandLogo";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/theme";
import { authService } from "../../services/authService";

const DEMO_ACCOUNTS = [
  {
    email: "candidate@vietjob.local",
    label: "Ứng viên",
    password: "candidate123",
  },
  {
    email: "employer@vietjob.local",
    label: "Nhà tuyển dụng",
    password: "employer123",
  },
  {
    email: "admin@vietjob.local",
    label: "Quản trị",
    password: "admin123",
  },
];

const COPY = {
  demoAccount: "Vào nhanh",
  demoLoading: "Đang vào",
  email: "Email",
  emailPlaceholder: "Nhập email",
  login: "Đăng nhập",
  password: "Mật khẩu",
  passwordPlaceholder: "Nhập mật khẩu",
  register: "Đăng ký",
};

export default function LoginScreen({ navigation, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoadingEmail, setDemoLoadingEmail] = useState("");

  async function handleLogin() {
    try {
      setLoading(true);
      setError("");

      const user = await authService.login(email, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(account) {
    try {
      setError("");
      setDemoLoadingEmail(account.email);
      setEmail(account.email);
      setPassword(account.password);

      const user = await authService.login(account.email, account.password);
      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setDemoLoadingEmail("");
    }
  }

  return (
    <Screen
      edges={["top", "left", "right"]}
      contentStyle={styles.screenContent}
      style={styles.screen}
      withKeyboard={false}
    >
      <View style={styles.container}>
        <View style={styles.topSection}>
          <BrandLogo centered large />
        </View>

        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{COPY.email}</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onBlur={() => setFocusedField("")}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              placeholder={COPY.emailPlaceholder}
              placeholderTextColor={COLORS.mutedLight}
              style={[styles.input, focusedField === "email" && styles.inputFocused]}
              textContentType="emailAddress"
              value={email}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{COPY.password}</Text>
            <TextInput
              autoComplete="password"
              onBlur={() => setFocusedField("")}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onSubmitEditing={handleLogin}
              placeholder={COPY.passwordPlaceholder}
              placeholderTextColor={COLORS.mutedLight}
              secureTextEntry
              style={[styles.input, focusedField === "password" && styles.inputFocused]}
              textContentType="password"
              value={password}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            loading={loading}
            onPress={handleLogin}
            style={styles.loginButton}
            title={COPY.login}
          />

          <Pressable
            onPress={() => navigation.navigate("Register")}
            style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
          >
            <Text style={styles.registerText}>{COPY.register}</Text>
          </Pressable>
        </View>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>{COPY.demoAccount}</Text>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map((account) => (
              <Pressable
                disabled={Boolean(demoLoadingEmail)}
                key={account.email}
                onPress={() => handleDemoLogin(account)}
                style={({ pressed }) => [
                  styles.demoButton,
                  pressed && styles.demoButtonPressed,
                  demoLoadingEmail === account.email && styles.demoButtonActive,
                  Boolean(demoLoadingEmail) && demoLoadingEmail !== account.email && styles.demoButtonDisabled,
                ]}
                >
                  <Text style={styles.demoLabel}>{account.label}</Text>
                  <Text style={styles.demoCaption}>
                    {demoLoadingEmail === account.email ? COPY.demoLoading : "Bấm để vào"}
                  </Text>
                </Pressable>
              ))}
            </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    backgroundColor: COLORS.surface,
    paddingBottom: 18,
    paddingTop: 16,
  },
  screen: {
    backgroundColor: COLORS.surface,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    alignItems: "center",
    gap: 8,
    paddingTop: 22,
  },
  formSection: {
    gap: 18,
    paddingTop: 10,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    color: COLORS.text,
    fontSize: 22,
    minHeight: 54,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  inputFocused: {
    borderBottomColor: COLORS.action,
  },
  error: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 20,
    marginTop: -6,
  },
  loginButton: {
    borderRadius: 999,
    marginTop: 2,
    minHeight: 54,
  },
  registerButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 34,
  },
  registerButtonPressed: {
    opacity: 0.72,
  },
  registerText: {
    color: COLORS.action,
    fontSize: 16,
    fontWeight: "600",
  },
  demoSection: {
    gap: 10,
    paddingBottom: 4,
  },
  demoTitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  demoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  demoButton: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 14,
    minHeight: 76,
    width: "31.5%",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  demoButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.97 }],
  },
  demoButtonActive: {
    backgroundColor: COLORS.actionSoft,
  },
  demoButtonDisabled: {
    opacity: 0.5,
  },
  demoLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  demoCaption: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
    maxWidth: "100%",
    textAlign: "center",
  },
});
