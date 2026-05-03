import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { USER_STATUS } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const roleLabels = {
  candidate: "Ứng viên",
  employer: "Nhà tuyển dụng",
};

export default function UserDetailScreen({ route }) {
  const { userId } = route.params;
  const [account, setAccount] = useState(null);

  async function loadUser() {
    try {
      const user = await adminService.getUserById(userId);
      setAccount(user);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [userId])
  );

  async function handleToggleStatus() {
    try {
      const nextStatus = account.status === USER_STATUS.LOCKED ? USER_STATUS.ACTIVE : USER_STATUS.LOCKED;
      await adminService.updateUserStatus(account.id, nextStatus);
      Alert.alert("Thành công", "Đã cập nhật trạng thái tài khoản.");
      loadUser();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  }

  if (!account) {
    return (
      <Screen>
        <Text style={styles.emptyText}>Đang tải tài khoản...</Text>
      </Screen>
    );
  }

  const locked = account.status === USER_STATUS.LOCKED;

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.name}>{account.full_name}</Text>
        <StatusBadge status={account.status} />
        <Info label="Email" value={account.email} />
        <Info label="Số điện thoại" value={account.phone} />
        <Info label="Vai trò" value={roleLabels[account.role] || account.role} />
      </View>

      <Pressable
        onPress={handleToggleStatus}
        style={({ pressed }) => [
          styles.actionButton,
          locked ? styles.unlockButton : styles.lockButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.actionText, locked ? styles.unlockText : styles.lockText]}>
          {locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
        </Text>
      </Pressable>
    </Screen>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "Chưa cập nhật"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 15,
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 50,
  },
  lockButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.danger,
  },
  unlockButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.success,
  },
  buttonPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "800",
  },
  lockText: {
    color: COLORS.danger,
  },
  unlockText: {
    color: COLORS.success,
  },
});
