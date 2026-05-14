import { StyleSheet, Text, View } from "react-native";

import { COLORS, RADII } from "../constants/theme";

export default function BrandLogo({ compact = false, centered = false, large = false }) {
  return (
    <View
      style={[
        styles.logo,
        compact && styles.compactLogo,
        large && styles.largeLogo,
        centered && styles.centeredLogo,
      ]}
    >
      <Text style={[styles.logoText, compact && styles.compactText, large && styles.largeText]}>VietJob</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.logoRed,
    borderRadius: RADII.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  compactLogo: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  largeLogo: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  centeredLogo: {
    alignSelf: "center",
  },
  logoText: {
    color: COLORS.surface,
    fontSize: 19,
    fontStyle: "italic",
    fontWeight: "700",
    textAlign: "center",
  },
  compactText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 22,
  },
});
