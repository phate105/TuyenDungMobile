import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, RADII } from "../constants/theme";

export default function SelectField({
  label,
  options,
  selectedValue,
  onChange,
  placeholder = "Chọn",
  variant = "default",
}) {
  const [visible, setVisible] = useState(false);
  const isUnderline = variant === "underline";

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue),
    [options, selectedValue]
  );

  function handleSelect(value) {
    onChange(value);
    setVisible(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          isUnderline && styles.triggerUnderline,
          pressed && (isUnderline ? styles.triggerUnderlinePressed : styles.triggerPressed),
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            isUnderline && styles.triggerTextUnderline,
            !selectedOption && styles.placeholderText,
          ]}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons color={COLORS.muted} name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="slide" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Pressable onPress={() => setVisible(false)} style={styles.backdrop} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setVisible(false)} style={({ pressed }) => pressed && styles.closePressed}>
              <Text style={styles.closeText}>Đóng</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {options.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <Pressable
                  key={String(option.value)}
                  onPress={() => handleSelect(option.value)}
                  style={({ pressed }) => [
                    styles.option,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                  {selected ? <Ionicons color={COLORS.action} name="checkmark" size={18} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  trigger: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  triggerUnderline: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    minHeight: 48,
    paddingHorizontal: 0,
  },
  triggerPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  triggerUnderlinePressed: {
    opacity: 0.76,
  },
  triggerText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    paddingRight: 12,
  },
  triggerTextUnderline: {
    fontSize: 16,
    paddingVertical: 10,
  },
  placeholderText: {
    color: COLORS.mutedLight,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    left: 0,
    maxHeight: "72%",
    padding: 16,
    position: "absolute",
    right: 0,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
  },
  closeText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  closePressed: {
    opacity: 0.72,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    alignItems: "center",
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 4,
  },
  optionPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  optionText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: COLORS.action,
    fontWeight: "700",
  },
});
