import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { COLORS, RADII } from "../constants/theme";

export default function EmptyState({
  icon = "briefcase-outline",
  title = "Chưa có dữ liệu",
  message = "Hãy thử lại với tiêu chí khác.",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons color={COLORS.brand} name={icon} size={28} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 22,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: COLORS.brandSoft,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 12,
    width: 48,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  message: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center",
  },
});
