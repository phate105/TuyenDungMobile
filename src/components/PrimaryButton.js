import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { COLORS } from "../constants/appConstants";
import { RADII } from "../constants/theme";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  variant = "primary",
  disabled = false,
  style,
}) {
  const isSecondary = variant === "secondary";
  const isDanger = variant === "danger";
  const isDisabled = loading || disabled;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondaryButton,
        isDanger && styles.dangerButton,
        isDisabled && styles.disabledButton,
        pressed && !isDisabled && styles.buttonPressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? COLORS.brand : COLORS.surface} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: COLORS.action,
    borderRadius: RADII.md,
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.action,
    borderWidth: 1,
  },
  dangerButton: {
    backgroundColor: COLORS.danger,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 1,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  text: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    color: COLORS.action,
  },
});
