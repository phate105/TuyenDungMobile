import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import BrandLogo from "../../components/BrandLogo";
import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS, SHADOWS } from "../../constants/theme";
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
    label: "Admin",
    password: "admin123",
  },
];

const COPY = {
  demoAccount: "Tài khoản demo",
  email: "Email",
  login: "Đăng nhập",
  newAccount: "Tạo tài khoản mới",
  password: "Mật khẩu",
  passwordPlaceholder: "Nhập mật khẩu",
  register: "Đăng ký",
  registerDescription: "Chọn ứng viên hoặc nhà tuyển dụng ở bước tiếp theo.",
  emailPlaceholder: "Nhập email",
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
    <Screen contentStyle={styles.screenContent} scroll contentContainerStyle={styles.scrollContent}>
      <View style={styles.hero}>
        <BrandLogo centered />
      </View>

      <View style={styles.formCard}>
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

        <PrimaryButton loading={loading} onPress={handleLogin} style={styles.loginButton} title={COPY.login} />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{COPY.register}</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Register")}
          style={({ pressed }) => [styles.registerCard, pressed && styles.registerCardPressed]}
        >
          <Text style={styles.registerTitle}>{COPY.newAccount}</Text>
          <Text style={styles.registerDescription}>{COPY.registerDescription}</Text>
        </Pressable>
      </View>

      <View style={styles.demoList}>
        <Text style={styles.demoTitle}>{COPY.demoAccount}</Text>
        {DEMO_ACCOUNTS.map((account) => (
          <Pressable
            disabled={Boolean(demoLoadingEmail)}
            key={account.email}
            onPress={() => handleDemoLogin(account)}
            style={({ pressed }) => [
              styles.demoCard,
              pressed && styles.demoCardPressed,
              Boolean(demoLoadingEmail) && styles.demoCardDisabled,
            ]}
          >
            <View style={styles.demoContent}>
              <Text style={styles.demoLabel}>{account.label}</Text>
              <Text style={styles.demoValue}>{account.email}</Text>
              <Text style={styles.demoValue}>{account.password}</Text>
            </View>
            <Text style={styles.demoAction}>
              {demoLoadingEmail === account.email ? "Đang vào..." : "Đăng nhập"}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 0,
    paddingTop: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: 28,
  },
  hero: {
    alignItems: "center",
    marginBottom: 22,
    paddingTop: 20,
  },
  formCard: {
    ...SHADOWS.card,
    alignSelf: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    width: "100%",
  },
  fieldGroup: {
    gap: 8,
    marginBottom: 14,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  inputFocused: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.action,
  },
  error: {
    color: COLORS.danger,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
    marginTop: -2,
  },
  loginButton: {
    marginTop: 4,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    backgroundColor: COLORS.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "500",
  },
  registerCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  registerCardPressed: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.action,
  },
  registerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  registerDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  demoList: {
    gap: 10,
    marginTop: 16,
  },
  demoTitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  demoCard: {
    alignItems: "center",
    backgroundColor: COLORS.brandSoft,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  demoCardPressed: {
    backgroundColor: "#EAE7E1",
  },
  demoCardDisabled: {
    opacity: 0.7,
  },
  demoContent: {
    flex: 1,
    paddingRight: 12,
  },
  demoLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  demoValue: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  demoAction: {
    color: COLORS.action,
    fontSize: 14,
    fontWeight: "700",
  },
});
