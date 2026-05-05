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
}) {
  const [visible, setVisible] = useState(false);

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
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholderText]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons color={COLORS.muted} name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="slide" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Pressable onPress={() => setVisible(false)} style={styles.backdrop} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setVisible(false)}>
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
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
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
  triggerPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  triggerText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    paddingRight: 12,
  },
  placeholderText: {
    color: COLORS.mutedLight,
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.32)",
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
    fontWeight: "600",
  },
  closeText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
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
  optionSelected: {
    backgroundColor: "#F7FBFC",
  },
  optionText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: COLORS.action,
  },
});
