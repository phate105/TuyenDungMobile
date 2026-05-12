import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import PrimaryButton from "../../components/PrimaryButton";
import { COLORS, RADII } from "../../constants/theme";
import { employerService } from "../../services/employerService";
import { getDatabase } from "../../database/database";

const initialForm = {
  companyName: "",
  companyField: "",
  companyAddress: "",
  description: "",
};

export default function CompanyProfileScreen({ user, navigation }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Ẩn thanh header mặc định để dùng header tự định nghĩa bên trong Screen
    navigation.setOptions({ headerShown: false });
    
    let active = true;
    async function loadProfile() {
      try {
        setFetching(true);
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
      } finally {
        setFetching(false);
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [user.id, navigation]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      await employerService.saveCompanyProfile(user.id, form);
      Alert.alert("Thành công", "Hồ sơ doanh nghiệp đã được cập nhật.");
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    Alert.alert(
      "Xác nhận làm mới",
      "Hành động này sẽ xóa toàn bộ hồ sơ và dữ liệu liên quan. Bạn có chắc chắn không?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xác nhận xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await employerService.resetCompanyProfile(user.id); 
              setForm(initialForm);
              Alert.alert("Thành công", "Dữ liệu đã được làm mới.");
            } catch (err) {
              Alert.alert("Lỗi", err.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  if (fetching) {
    return (
      <Screen style={styles.centerBox}>
        <ActivityIndicator color={COLORS.action} size="large" />
        <Text style={styles.mutedText}>Đang tải dữ liệu...</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ công ty</Text>
        <Text style={styles.subtitle}>Cập nhật thông tin để thu hút ứng viên</Text>
      </View>

      {/* Form Card được tinh chỉnh padding và border */}
      <View style={styles.card}>
        <Field label="Tên công ty" icon="business">
          <TextInput
            onChangeText={(value) => updateField("companyName", value)}
            placeholder="Ví dụ: Công ty Công nghệ X-Soft"
            placeholderTextColor={COLORS.muted + "80"}
            style={styles.input}
            value={form.companyName}
          />
        </Field>

        <Field label="Lĩnh vực kinh doanh" icon="layers">
          <TextInput
            onChangeText={(value) => updateField("companyField", value)}
            placeholder="Ví dụ: Phát triển phần mềm"
            placeholderTextColor={COLORS.muted + "80"}
            style={styles.input}
            value={form.companyField}
          />
        </Field>

        <Field label="Địa chỉ trụ sở" icon="location">
          <TextInput
            onChangeText={(value) => updateField("companyAddress", value)}
            placeholder="Số nhà, tên đường, quận/huyện..."
            placeholderTextColor={COLORS.muted + "80"}
            style={styles.input}
            value={form.companyAddress}
          />
        </Field>

        <Field label="Giới thiệu về công ty" icon="document-text">
          <TextInput
            multiline
            onChangeText={(value) => updateField("description", value)}
            placeholder="Chia sẻ về môi trường và văn hóa làm việc của bạn..."
            placeholderTextColor={COLORS.muted + "80"}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={form.description}
          />
        </Field>
      </View>

      {/* Nút hành động */}
      <View style={styles.buttonGroup}>
        <PrimaryButton 
          loading={loading} 
          onPress={handleSave} 
          title="Lưu thay đổi" 
        />
        
        <TouchableOpacity 
          style={[styles.resetButton, loading && { opacity: 0.5 }]} 
          onPress={handleReset}
          disabled={loading}
        >
          <Ionicons name="refresh-circle-outline" size={20} color={COLORS.danger} />
          <Text style={styles.resetButtonText}>Xóa & Làm mới toàn bộ</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

function Field({ children, label, icon }) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={18} color={COLORS.action} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingTop: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 4,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Hiệu ứng đổ bóng đồng bộ
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    gap: 24,
  },
  field: {
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.background + "50", // Màu nền nhẹ hơn cho input
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 140,
  },
  buttonGroup: {
    marginTop: 28,
    gap: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: COLORS.danger + "10", // Màu đỏ rất nhạt
    borderWidth: 1,
    borderColor: COLORS.danger + "20",
    gap: 8,
  },
  resetButtonText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 15,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});