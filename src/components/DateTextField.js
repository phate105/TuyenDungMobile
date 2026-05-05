import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS, RADII } from "../constants/theme";

function pad(value) {
  return String(value).padStart(2, "0");
}

function parseDateValue(value) {
  const match = String(value || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) {
    const now = new Date();
    return {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };
  }

  return {
    day: Number(match[1]),
    month: Number(match[2]),
    year: Number(match[3]),
  };
}

export default function DateTextField({
  label,
  value,
  onChangeText,
  placeholder = "DD/MM/YYYY",
  required = false,
  minYear = 1960,
  maxYear = new Date().getFullYear() + 1,
}) {
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(() => parseDateValue(value));

  const years = useMemo(() => {
    const list = [];
    for (let year = maxYear; year >= minYear; year -= 1) {
      list.push(year);
    }
    return list;
  }, [maxYear, minYear]);

  function openPicker() {
    setDraft(parseDateValue(value));
    setVisible(true);
  }

  function applyDate() {
    onChangeText(`${pad(draft.day)}/${pad(draft.month)}/${draft.year}`);
    setVisible(false);
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requiredStar}> *</Text> : null}
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mutedLight}
          style={styles.input}
          value={value}
        />
        <Pressable onPress={openPicker} style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]}>
          <Text style={styles.pickText}>Chọn</Text>
        </Pressable>
      </View>

      <Modal animationType="slide" transparent visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Đóng</Text>
            </Pressable>
          </View>
          <View style={styles.columns}>
            <DateColumn
              items={Array.from({ length: 31 }, (_, index) => index + 1)}
              selected={draft.day}
              onSelect={(day) => setDraft((current) => ({ ...current, day }))}
            />
            <DateColumn
              items={Array.from({ length: 12 }, (_, index) => index + 1)}
              selected={draft.month}
              onSelect={(month) => setDraft((current) => ({ ...current, month }))}
            />
            <DateColumn
              items={years}
              selected={draft.year}
              onSelect={(year) => setDraft((current) => ({ ...current, year }))}
            />
          </View>
          <Pressable onPress={applyDate} style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}>
            <Text style={styles.doneText}>Xong</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function DateColumn({ items, selected, onSelect }) {
  return (
    <ScrollView contentContainerStyle={styles.columnContent} showsVerticalScrollIndicator={false} style={styles.column}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onSelect(item)}
          style={({ pressed }) => [
            styles.option,
            selected === item && styles.optionSelected,
            pressed && styles.optionPressed,
          ]}
        >
          <Text style={[styles.optionText, selected === item && styles.optionTextSelected]}>
            {item < 100 ? pad(item) : item}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
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
  requiredStar: {
    color: COLORS.danger,
  },
  inputWrap: {
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 50,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 14,
  },
  pickButton: {
    alignItems: "center",
    borderLeftColor: COLORS.border,
    borderLeftWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  pickButtonPressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  pickText: {
    color: COLORS.action,
    fontSize: 14,
    fontWeight: "600",
  },
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    bottom: 0,
    left: 0,
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
  cancelText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  columns: {
    flexDirection: "row",
    gap: 10,
    height: 220,
  },
  column: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.md,
    flex: 1,
  },
  columnContent: {
    paddingVertical: 6,
  },
  option: {
    alignItems: "center",
    borderRadius: RADII.sm,
    marginHorizontal: 6,
    paddingVertical: 9,
  },
  optionPressed: {
    backgroundColor: COLORS.border,
  },
  optionSelected: {
    backgroundColor: COLORS.action,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: COLORS.surface,
  },
  doneButton: {
    alignItems: "center",
    backgroundColor: COLORS.action,
    borderRadius: RADII.md,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
  },
  doneButtonPressed: {
    opacity: 0.9,
  },
  doneText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
