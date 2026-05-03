import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { LABELS } from "../../constants/labels";
import { COLORS, RADII } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function CVManagementScreen({ navigation, user }) {
  const [fullCV, setFullCV] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCV = useCallback(async () => {
    setLoading(true);
    const result = await cvService.getFullCV(user.id);
    setFullCV(result);
    setLoading(false);
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      loadCV();
    }, [loadCV])
  );

  function handleUploadPlaceholder() {
    Alert.alert("Tải CV lên", "Chức năng tải CV sẽ được phát triển sau.");
  }

  if (loading) {
    return (
      <Screen edges={["left", "right"]} style={styles.screen}>
        <View style={styles.centerBox}>
          <ActivityIndicator color={COLORS.action} />
          <Text style={styles.mutedText}>Đang tải CV...</Text>
        </View>
      </Screen>
    );
  }

  const hasCV = Boolean(fullCV?.cv);

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll style={styles.screen}>
      {hasCV ? (
        <View style={styles.card}>
          <View style={styles.actionList}>
            <ActionRow title={LABELS.buttons.viewCV} onPress={() => navigation.navigate("CVPreview")} />
            <ActionRow title={LABELS.buttons.editCV} onPress={() => navigation.navigate("CreateCV")} />
            <ActionRow title="Tải CV lên" onPress={handleUploadPlaceholder} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.emptyTitle}>Bạn chưa có CV</Text>
          <View style={styles.emptyActions}>
            <PrimaryButton onPress={() => navigation.navigate("CreateCV")} title={LABELS.buttons.createCV} />
            <PrimaryButton onPress={handleUploadPlaceholder} title="Tải CV lên" variant="secondary" />
          </View>
        </View>
      )}
    </Screen>
  );
}

function ActionRow({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
    >
      <Text style={styles.actionText}>{title}</Text>
      <Text style={styles.actionArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 36,
    paddingTop: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  actionList: {
    backgroundColor: COLORS.surface,
  },
  actionRow: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 54,
    paddingHorizontal: 15,
  },
  actionRowPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  actionArrow: {
    color: COLORS.muted,
    fontSize: 24,
    lineHeight: 24,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyActions: {
    gap: 10,
    padding: 16,
  },
  centerBox: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});
