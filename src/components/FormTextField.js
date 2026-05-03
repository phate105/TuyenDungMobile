import { StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "../constants/appConstants";
import { RADII } from "../constants/theme";

export default function FormTextField({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  multiline = false,
  keyboardType = "default",
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.requiredStar}> *</Text> : null}
      </Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor={COLORS.mutedLight}
        style={[styles.input, multiline && styles.multiline]}
        textAlignVertical={multiline ? "top" : "center"}
        value={value}
      />
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
    fontWeight: "800",
  },
  requiredStar: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    borderWidth: 1,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  multiline: {
    minHeight: 110,
    paddingTop: 10,
  },
});
