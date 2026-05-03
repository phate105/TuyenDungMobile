import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { LABELS } from "../../constants/labels";
import { COLORS, RADII } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function CreateCVScreen({ navigation, route, user }) {
  const returnJobId = route.params?.returnJobId;
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

  const completedSections = fullCV?.completedSections || {};
  const canSave = Boolean(fullCV?.isCompleted);
  const hasCV = Boolean(fullCV?.cv);

  function handleSaveCV() {
    if (returnJobId) {
      Alert.alert("CV", "CV đã sẵn sàng. Bạn có thể nộp đơn ứng tuyển.", [
        {
          text: LABELS.common.continue,
          onPress: () => navigation.replace("Apply", { jobId: returnJobId }),
        },
      ]);
      return;
    }

    Alert.alert("CV", "CV đã đủ 3 phần bắt buộc và đã được lưu trong hồ sơ.");
  }

  return (
    <Screen contentStyle={styles.content} edges={["left", "right"]} style={styles.screen}>
      <View style={styles.sectionList}>
        <SectionItem
          required
          done={completedSections.personalInfo}
          title="Thông tin cá nhân"
          onPress={() => navigation.navigate("PersonalInfoForm")}
        />
        <SectionItem
          required
          done={completedSections.experience}
          title="Kinh nghiệm / Dự án"
          onPress={() => navigation.navigate("ExperienceForm")}
        />
        <SectionItem
          required
          done={completedSections.education}
          title="Trình độ học vấn"
          onPress={() => navigation.navigate("EducationForm")}
        />
        <SectionItem
          done={completedSections.skills}
          title="Kỹ năng"
          onPress={() => navigation.navigate("SkillForm")}
        />
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          disabled={!canSave}
          onPress={handleSaveCV}
          style={styles.actionButton}
          title={LABELS.buttons.saveCV}
        />
        <PrimaryButton
          disabled={!fullCV?.cv}
          onPress={() => navigation.navigate("CVPreview")}
          style={styles.actionButton}
          title={LABELS.buttons.viewCV}
          variant="secondary"
        />
      </View>
    </Screen>
  );
}

function SectionItem({ title, required = false, done = false, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.sectionItem, pressed && styles.sectionItemPressed]}
    >
      <View style={styles.sectionBody}>
        <Text style={styles.sectionTitle}>
          {title}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
      </View>
      <Text style={styles.arrowText}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: COLORS.background,
  },
  content: {
    justifyContent: "space-between",
    paddingTop: 8,
  },
  sectionList: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionItem: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionItemPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  sectionBody: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  requiredStar: {
    color: COLORS.danger,
  },
  arrowText: {
    color: COLORS.muted,
    fontSize: 25,
    lineHeight: 25,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 10,
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
