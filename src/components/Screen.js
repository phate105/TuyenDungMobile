import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "../constants/theme";

export default function Screen({
  children,
  style,
  contentStyle,
  scroll = false,
  contentContainerStyle,
  stickyHeaderIndices,
  edges = ["top", "left", "right"],
}) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  if (scroll) {
    return (
      <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 40 + bottomPadding },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={stickyHeaderIndices}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, style]}>
      <View style={[styles.content, { paddingBottom: 12 + bottomPadding }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
});
