import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import StatusBadge from "../../components/StatusBadge";
import { ROLES } from "../../constants/appConstants";
import { COLORS } from "../../constants/theme";
import { adminService } from "../../services/adminService";

const roleOptions = [
  { label: "Ứng viên", value: ROLES.CANDIDATE },
  { label: "Nhà tuyển dụng", value: ROLES.EMPLOYER },
];

export default function UserManagementScreen({ navigation }) {
  const [role, setRole] = useState(ROLES.CANDIDATE);
  const [users, setUsers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadUsers() {
        try {
          const rows = await adminService.getUsersByRole(role);

          if (active) {
            setUsers(rows);
          }
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      }

      loadUsers();

      return () => {
        active = false;
      };
    }, [role])
  );

  return (
    <Screen scroll>
      <View style={styles.segment}>
        {roleOptions.map((option) => {
          const active = option.value === role;

          return (
            <Pressable
              key={option.value}
              onPress={() => setRole(option.value)}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.list}>
        {users.length === 0 ? <Text style={styles.emptyText}>Chưa có tài khoản.</Text> : null}

        {users.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => navigation.navigate("UserDetail", { userId: user.id })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{user.full_name}</Text>
              <StatusBadge status={user.status} />
            </View>
            <Text style={styles.meta}>{user.email}</Text>
            <Text style={styles.meta}>{user.phone}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    backgroundColor: COLORS.brandSoft,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 16,
    padding: 4,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  segmentText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  list: {
    gap: 12,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  cardPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  cardHeader: {
    gap: 8,
    marginBottom: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
