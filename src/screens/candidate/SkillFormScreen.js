import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import { COLORS } from "../../constants/appConstants";
import { RADII } from "../../constants/theme";
import { cvService } from "../../services/cvService";

export default function SkillFormScreen({ navigation, user }) {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSkills() {
      const fullCV = await cvService.getFullCV(user.id);
      setSkills(fullCV.skills.map((skill) => skill.name));
    }

    loadSkills();
  }, [user.id]);

  function handleAddSkill() {
    const newSkill = skillInput.trim();

    if (!newSkill || skills.includes(newSkill)) {
      setSkillInput("");
      return;
    }

    setSkills((current) => [...current, newSkill]);
    setSkillInput("");
  }

  function handleRemoveSkill(index) {
    setSkills((current) => current.filter((_, skillIndex) => skillIndex !== index));
  }

  async function handleSave() {
    const pendingSkill = skillInput.trim();
    const nextSkills = pendingSkill && !skills.includes(pendingSkill) ? [...skills, pendingSkill] : skills;

    if (nextSkills.length === 0) {
      Alert.alert("CV", "Vui lòng nhập ít nhất một kỹ năng trước khi lưu.");
      return;
    }

    try {
      setLoading(true);
      await cvService.saveSkills(user.id, nextSkills);
      Alert.alert("CV", "Đã lưu kỹ năng.");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentContainerStyle={styles.scrollContent} edges={["left", "right"]} scroll>
      <View style={styles.card}>
        <TextInput
          onChangeText={setSkillInput}
          onSubmitEditing={handleAddSkill}
          placeholder="Nhập kỹ năng"
          placeholderTextColor={COLORS.mutedLight}
          returnKeyType="done"
          style={styles.input}
          value={skillInput}
        />

        {skills.length > 0 ? (
          <View style={styles.skillList}>
            {skills.map((skill, index) => (
              <View key={`${skill}-${index}`} style={styles.skillItem}>
                <Text style={styles.skillText}>{skill}</Text>
                <Pressable onPress={() => handleRemoveSkill(index)} hitSlop={8}>
                  <Text style={styles.removeText}>Xóa</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <PrimaryButton loading={loading} onPress={handleSave} title="Lưu kỹ năng" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    gap: 16,
    padding: 15,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  skillList: {
    marginTop: -4,
  },
  skillItem: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  skillText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  removeText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: "600",
  },
});
