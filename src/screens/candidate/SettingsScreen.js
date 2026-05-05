import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import Screen from "../../components/Screen";
import { COLORS, RADII, SHADOWS } from "../../constants/theme";
import { LABELS } from "../../constants/labels";
import { authService } from "../../services/authService";

export default function SettingsScreen({ navigation, onLogout }) {
  async function handleLogout() {
    await authService.logout();
    onLogout();
  }

  function showPlaceholder(title) {
    Alert.alert(title, "Chức năng này sẽ được phát triển sau.");
  }

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll>
      <View style={styles.list}>
        <SettingItem
          title="Hồ sơ cá nhân"
          icon="person-outline"
          onPress={() => navigation.navigate("EditCandidateProfile")}
        />
        <SettingItem
          disabled
          title="Tài khoản"
          icon="shield-outline"
          onPress={() => showPlaceholder("Tài khoản")}
        />
        <SettingItem
          disabled
          title="Thông báo"
          icon="notifications-outline"
          onPress={() => showPlaceholder("Thông báo")}
        />
        <SettingItem
          disabled
          title="Hướng dẫn sử dụng"
          icon="help-circle-outline"
          onPress={() => showPlaceholder("Hướng dẫn sử dụng")}
        />
        <SettingItem
          disabled
          title="Điều khoản sử dụng"
          icon="document-text-outline"
          onPress={() => showPlaceholder("Điều khoản sử dụng")}
        />
        <SettingItem
          disabled
          title="Chính sách bảo mật"
          icon="shield-checkmark-outline"
          onPress={() => showPlaceholder("Chính sách bảo mật")}
        />
      </View>

      <View style={styles.logoutWrap}>
        <SettingItem danger title={LABELS.common.logout} icon="log-out-outline" onPress={handleLogout} />
      </View>
    </Screen>
  );
}

function SettingItem({ title, icon, onPress, danger = false, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
        disabled && styles.itemDisabled,
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.itemIcon, danger && styles.dangerIcon, disabled && styles.disabledIcon]}>
          <Ionicons
            color={danger ? COLORS.danger : disabled ? COLORS.mutedLight : COLORS.text}
            name={icon}
            size={20}
          />
        </View>
        <View style={styles.itemTextWrap}>
          <Text style={[styles.itemText, danger && styles.dangerText, disabled && styles.disabledText]}>
            {title}
          </Text>
        </View>
      </View>
      {disabled ? (
        <Ionicons color={COLORS.mutedLight} name="time-outline" size={19} />
      ) : (
        <Ionicons color={danger ? COLORS.danger : COLORS.text} name="chevron-forward" size={20} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  logoutWrap: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    marginTop: 18,
    overflow: "hidden",
  },
  item: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 14,
  },
  itemPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  itemDisabled: {
    opacity: 0.88,
  },
  itemLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  itemIcon: {
    alignItems: "center",
    backgroundColor: COLORS.brandSoft,
    borderRadius: RADII.md,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  disabledIcon: {
    backgroundColor: COLORS.surfaceMuted,
  },
  dangerIcon: {
    backgroundColor: COLORS.dangerSoft,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  disabledText: {
    color: COLORS.muted,
  },
  dangerText: {
    color: COLORS.danger,
  },
});
